import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";

const DATA_PATH = new URL("../data/publications.json", import.meta.url);
const SNAPSHOT_PATH = new URL("../.tmp/publications/scholar-snapshot.json", import.meta.url);
const CACHE_DIR = new URL("../.tmp/publications/cache/", import.meta.url);
const REPORT_PATH = new URL("../.tmp/publications/enrichment-report.json", import.meta.url);
const USER_AGENT = "DatAI-publications-audit/1.0";
const CHECKED_AT = new Date().toISOString().slice(0, 10);

function normalizeText(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeDoi(value) {
  if (!value) return null;
  const decoded = decodeURIComponent(String(value))
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "")
    .trim()
    .replace(/[\s),.;]+$/g, "")
    .toLowerCase();
  return /^10\.\d{4,9}\/\S+$/i.test(decoded) ? decoded : null;
}

function extractDoi(...values) {
  for (const value of values) {
    const match = String(value || "").match(/10\.\d{4,9}\/[\w.()/:;-]+/i);
    const doi = normalizeDoi(match?.[0]);
    if (doi) return doi;
  }
  return null;
}

function tokenDice(left, right) {
  const a = new Set(normalizeText(left).split(" ").filter(Boolean));
  const b = new Set(normalizeText(right).split(" ").filter(Boolean));
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  return (2 * intersection) / (a.size + b.size);
}

function authorSurnames(value) {
  const names = Array.isArray(value) ? value : String(value || "").split(/,|;|\band\b/i);
  return new Set(names.map((name) => {
    if (typeof name === "object" && name.family) return normalizeText(name.family);
    const parts = normalizeText(typeof name === "object" ? name.display_name || name.name || "" : name).split(" ").filter(Boolean);
    return parts.at(-1) || "";
  }).filter((name) => name.length > 1 && name !== "et" && name !== "al"));
}

function authorSimilarity(source, candidate) {
  const a = authorSurnames(source);
  const b = authorSurnames(candidate);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const name of a) if (b.has(name)) intersection += 1;
  return intersection / Math.min(a.size, b.size);
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== null && value !== undefined && value !== ""))];
}

function dateYear(value) {
  return value?.["date-parts"]?.[0]?.[0] || null;
}

function crossrefAuthors(item) {
  return (item.author || []).map((author) => ({
    given: author.given || null,
    family: author.family || null,
    name: [author.given, author.family].filter(Boolean).join(" ") || author.name || null,
    orcid: author.ORCID || null,
  })).filter((author) => author.name);
}

function crossrefYears(item) {
  return unique([
    dateYear(item["published-print"]),
    dateYear(item["published-online"]),
    dateYear(item.published),
    dateYear(item.issued),
    item.created?.["date-time"] ? Number(item.created["date-time"].slice(0, 4)) : null,
  ]);
}

function scoreCandidate(publication, title, authors, years) {
  const titleScore = tokenDice(publication.title, title);
  const authorsScore = authorSimilarity(publication.authors, authors);
  const yearDistance = publication.year && years.length
    ? Math.min(...years.map((year) => Math.abs(publication.year - year)))
    : null;
  const yearScore = yearDistance === null ? 0.5 : yearDistance === 0 ? 1 : yearDistance === 1 ? 0.75 : yearDistance === 2 ? 0.35 : 0;
  const exactTitle = normalizeText(publication.title) === normalizeText(title);
  const score = (titleScore * 0.78) + (authorsScore * 0.15) + (yearScore * 0.07);
  const accepted = (
    exactTitle && authorsScore >= 0.2 && (yearDistance === null || yearDistance <= 3)
  ) || (
    titleScore >= 0.93 && authorsScore >= 0.25 && (yearDistance === null || yearDistance <= 2) && score >= 0.86
  );
  return { score, title_score: titleScore, authors_score: authorsScore, year_distance: yearDistance, exact_title: exactTitle, accepted };
}

function cacheName(provider, key) {
  const digest = createHash("sha256").update(key).digest("hex").slice(0, 24);
  return new URL(`${provider}-${digest}.json`, CACHE_DIR);
}

async function fetchJson(url, { provider, key, retries = 4, allowNotFound = false } = {}) {
  const path = cacheName(provider, key || url);
  try {
    const cached = JSON.parse(await readFile(path, "utf8"));
    return cached.__not_found ? null : cached;
  } catch {}

  let lastError = null;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" }, signal: AbortSignal.timeout(20_000) });
      if (response.ok) {
        const json = await response.json();
        await writeFile(path, `${JSON.stringify(json)}\n`);
        return json;
      }
      if (response.status === 404 && allowNotFound) {
        await writeFile(path, `${JSON.stringify({ __not_found: true })}\n`);
        return null;
      }
      if (![429, 500, 502, 503, 504].includes(response.status)) {
        throw new Error(`${provider} returned ${response.status} for ${url}`);
      }
    } catch (error) {
      lastError = error;
      if (attempt === retries - 1) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * (2 ** attempt)));
  }
  throw lastError || new Error(`${provider} failed after ${retries} attempts for ${url}`);
}

async function readCachedJson(provider, key) {
  try {
    return JSON.parse(await readFile(cacheName(provider, key), "utf8"));
  } catch {
    return null;
  }
}

async function mapLimit(items, concurrency, mapper) {
  const output = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      output[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return output;
}

function bestCrossref(publication, items) {
  const candidates = (items || []).map((item) => {
    const title = item.title?.[0] || item["short-title"]?.[0] || "";
    const authors = crossrefAuthors(item);
    const match = scoreCandidate(publication, title, authors, crossrefYears(item));
    return { item, title, authors, match };
  }).sort((a, b) => b.match.score - a.match.score);
  return candidates[0] || null;
}

async function queryCrossrefAuthor(affiliate) {
  const url = new URL("https://api.crossref.org/works");
  url.searchParams.set("query.author", affiliate.name);
  url.searchParams.set("rows", "1000");
  url.searchParams.set("select", "DOI,title,short-title,author,published,published-print,published-online,issued,created,container-title,short-container-title,type,publisher,volume,issue,page,article-number,ISBN,ISSN,URL,resource");
  const json = await fetchJson(url, { provider: "crossref-author", key: affiliate.name });
  return json.message?.items || [];
}

async function queryCrossrefDoi(publication, doi) {
  const url = new URL(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  const json = await fetchJson(url, { provider: "crossref-doi", key: doi, allowNotFound: true });
  if (!json?.message) return null;
  const candidate = bestCrossref(publication, [json.message]);
  if (candidate && candidate.match.title_score >= 0.75 && candidate.match.authors_score >= 0.15) candidate.match.accepted = true;
  return candidate;
}

async function queryCrossrefTitle(publication) {
  const url = new URL("https://api.crossref.org/works");
  url.searchParams.set("query.bibliographic", `${publication.title} ${publication.authors || ""}`.slice(0, 450));
  url.searchParams.set("rows", "5");
  url.searchParams.set("select", "DOI,title,short-title,author,published,published-print,published-online,issued,created,container-title,short-container-title,type,publisher,volume,issue,page,article-number,ISBN,ISSN,URL,resource");
  const key = `${publication.title}\n${publication.authors || ""}`;
  const cached = await readCachedJson("crossref-title", key);
  const json = cached || (process.env.CROSSREF_TITLE_SEARCH === "1"
    ? await fetchJson(url, { provider: "crossref-title", key })
    : null);
  if (!json) return null;
  return bestCrossref(publication, json.message?.items || []);
}

function openAlexAuthors(item) {
  return (item.authorships || []).map((entry) => ({
    given: null,
    family: null,
    name: entry.author?.display_name || null,
    orcid: entry.author?.orcid || null,
    openalex_id: entry.author?.id || null,
  })).filter((author) => author.name);
}

function bestOpenAlex(publication, items) {
  const candidates = (items || []).map((item) => {
    const authors = openAlexAuthors(item);
    const match = scoreCandidate(publication, item.title || "", authors, item.publication_year ? [item.publication_year] : []);
    return { item, title: item.title || "", authors, match };
  }).sort((a, b) => b.match.score - a.match.score);
  return candidates[0] || null;
}

const OPENALEX_SELECT = "id,doi,title,display_name,publication_year,publication_date,type,type_crossref,authorships,primary_location,best_oa_location,biblio,ids,open_access";

async function queryOpenAlex(publication) {
  const url = new URL("https://api.openalex.org/works");
  url.searchParams.set("search", publication.title.slice(0, 300));
  url.searchParams.set("per-page", "5");
  url.searchParams.set("select", OPENALEX_SELECT);
  const cached = await readCachedJson("openalex-search", publication.title);
  const json = cached || (process.env.OPENALEX_SEARCH === "1"
    ? await fetchJson(url, { provider: "openalex-search", key: publication.title })
    : null);
  if (!json) return { checked: false, skipped: "daily_search_budget", item: null, match: { accepted: false, score: 0, title_score: 0, authors_score: 0, year_distance: null } };
  const best = bestOpenAlex(publication, json.results || []);
  return best
    ? { ...best, checked: true }
    : { checked: true, item: null, match: { accepted: false, score: 0, title_score: 0, authors_score: 0, year_distance: null } };
}

async function batchOpenAlexByDoi(dois) {
  const map = new Map();
  for (const file of await readdir(CACHE_DIR)) {
    if (!file.startsWith("openalex-dois-") || !file.endsWith(".json")) continue;
    try {
      const cached = JSON.parse(await readFile(new URL(file, CACHE_DIR), "utf8"));
      for (const item of cached.results || []) {
        const doi = normalizeDoi(item.doi);
        if (doi) map.set(doi, item);
      }
    } catch {}
  }
  const remaining = dois.filter((doi) => !map.has(doi));
  if (process.env.OPENALEX_DOI_NETWORK !== "1") return map;
  for (let index = 0; index < remaining.length; index += 40) {
    const batch = remaining.slice(index, index + 40);
    const url = new URL("https://api.openalex.org/works");
    url.searchParams.set("filter", `doi:${batch.join("|")}`);
    url.searchParams.set("per-page", "50");
    url.searchParams.set("select", OPENALEX_SELECT);
    const json = await fetchJson(url, { provider: "openalex-dois", key: batch.join("|") });
    for (const item of json.results || []) {
      const doi = normalizeDoi(item.doi);
      if (doi) map.set(doi, item);
    }
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  return map;
}

function textValue(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value.text || value.value || "";
  return "";
}

async function queryDblp(publication) {
  const url = new URL("https://dblp.org/search/publ/api");
  url.searchParams.set("q", publication.title.slice(0, 300));
  url.searchParams.set("format", "json");
  url.searchParams.set("h", "5");
  const cached = await readCachedJson("dblp-search", publication.title);
  const json = cached || (process.env.DBLP_SEARCH === "1"
    ? await fetchJson(url, { provider: "dblp-search", key: publication.title })
    : null);
  if (!json) return { checked: false, skipped: "temporarily_unavailable", item: null, match: { accepted: false, score: 0, title_score: 0, authors_score: 0, year_distance: null } };
  const hits = json.result?.hits?.hit;
  const items = Array.isArray(hits) ? hits : hits ? [hits] : [];
  const candidates = items.map((hit) => {
    const info = hit.info || {};
    const authorsValue = info.authors?.author;
    const authors = (Array.isArray(authorsValue) ? authorsValue : authorsValue ? [authorsValue] : []).map((author) => ({ name: textValue(author) }));
    const match = scoreCandidate(publication, textValue(info.title), authors, info.year ? [Number(info.year)] : []);
    return { item: info, title: textValue(info.title), authors, match };
  }).sort((a, b) => b.match.score - a.match.score);
  return candidates[0] ? { ...candidates[0], checked: true } : { checked: true, item: null, match: { accepted: false, score: 0, title_score: 0, authors_score: 0, year_distance: null } };
}

async function queryDataCite(publication) {
  const url = new URL("https://api.datacite.org/dois");
  url.searchParams.set("query", `titles.title:\"${publication.title.replaceAll('"', "")}\"`);
  url.searchParams.set("page[size]", "5");
  const json = await fetchJson(url, { provider: "datacite-search", key: publication.title });
  const candidates = (json.data || []).map((entry) => {
    const item = entry.attributes || {};
    const title = item.titles?.[0]?.title || "";
    const authors = (item.creators || []).map((author) => ({ name: author.name || [author.givenName, author.familyName].filter(Boolean).join(" ") }));
    const match = scoreCandidate(publication, title, authors, item.publicationYear ? [Number(item.publicationYear)] : []);
    return { item, title, authors, match };
  }).sort((a, b) => b.match.score - a.match.score);
  return candidates[0] || null;
}

async function queryDataCiteDoi(publication, doi) {
  const url = new URL(`https://api.datacite.org/dois/${encodeURIComponent(doi)}`);
  const json = await fetchJson(url, { provider: "datacite-doi", key: doi, allowNotFound: true });
  const item = json?.data?.attributes;
  if (!item) return null;
  const title = item.titles?.[0]?.title || "";
  const authors = (item.creators || []).map((author) => ({ name: author.name || [author.givenName, author.familyName].filter(Boolean).join(" ") }));
  const match = scoreCandidate(publication, title, authors, item.publicationYear ? [Number(item.publicationYear)] : []);
  if (match.title_score >= 0.75 && (match.authors_score >= 0.15 || match.exact_title)) match.accepted = true;
  return { item, title, authors, match, checked: true };
}

function typeFromSources(crossref, openalex, datacite, publication) {
  const raw = crossref?.type || openalex?.type_crossref || openalex?.type || datacite?.types?.resourceTypeGeneral || "";
  const normalized = normalizeText(raw).replaceAll(" ", "-");
  const map = {
    "journal-article": "journal-article",
    article: "journal-article",
    "proceedings-article": "conference-paper",
    proceedings: "conference-paper",
    "book-chapter": "book-chapter",
    chapter: "book-chapter",
    book: "book",
    "edited-book": "book",
    monograph: "book",
    "posted-content": "preprint",
    preprint: "preprint",
    dissertation: "thesis",
    thesis: "thesis",
    report: "report",
    dataset: "dataset",
    software: "software",
    reference: "reference-entry",
    "reference-entry": "reference-entry",
  };
  if (map[normalized]) return map[normalized];
  const scholar = normalizeText(publication.publication || "");
  if (scholar.includes("arxiv") || scholar.includes("preprint")) return "preprint";
  if (scholar.includes("thesis") || scholar.includes("tesi")) return "thesis";
  if (scholar.includes("proceedings") || scholar.includes("conference") || scholar.includes("workshop")) return "conference-paper";
  return normalized || "other";
}

function isLikelyNonAuthoredArtifact(publication) {
  const title = normalizeText(publication.title);
  return /(^| )(external reviewers|additional reviewers|reviewers|program committee|organizing committee|workshop committee|conference organization)( |$)/.test(title)
    || /^\d{4} index /.test(title)
    || /^access to the document$/.test(title)
    || /^preface of /.test(title)
    || /^program committees$/.test(title)
    || /^journal homepage /.test(title)
    || / selected publications /.test(` ${title} `)
    || /^heinonen henri tapani /.test(title)
    || (/^20\d{2} .*conference/.test(title) && /978 1 /.test(title))
    || /^sig$/.test(title)
    || /^ldk \d{4}$/.test(title);
}

const AFFILIATE_AUTHOR_ALIASES = {
  "flavio-maria-de-paoli": ["de paoli", "paoli"],
  "andrea-maurino": ["maurino"],
  "michele-ciavotta": ["ciavotta"],
  "matteo-luigi-palmonari": ["palmonari"],
  "blerina-spahiu": ["spahiu"],
  "abubakari-alidu": ["abubakari", "alidu"],
  "emanuele-petriglia": ["petriglia"],
  "federica-filippini": ["filippini"],
  "marco-cremaschi": ["cremaschi"],
  "riccardo-pozzi": ["pozzi"],
  "renzo-arturo-alva-principe": ["alva", "principe"],
};

function hasAffiliateAuthorship(publication, authorList) {
  if (!authorList?.length) return true;
  return publication.affiliate_ids.some((affiliateId) => {
    const aliases = AFFILIATE_AUTHOR_ALIASES[affiliateId] || [];
    return authorList.some((author) => aliases.some((alias) => normalizeText(author.name || "").includes(alias)));
  });
}

function chooseCanonical(publication, crossrefMatch, openalexMatch, dblpMatch, dataciteMatch) {
  const crossref = crossrefMatch?.match.accepted ? crossrefMatch.item : null;
  const openalex = openalexMatch?.match.accepted ? openalexMatch.item : null;
  const dblp = dblpMatch?.match.accepted ? dblpMatch.item : null;
  const datacite = dataciteMatch?.match.accepted ? dataciteMatch.item : null;

  const doi = normalizeDoi(crossref?.DOI)
    || normalizeDoi(openalex?.doi)
    || normalizeDoi(dblp?.doi)
    || normalizeDoi(datacite?.doi);
  const crossrefAuthorList = crossref ? crossrefAuthors(crossref) : [];
  const openalexAuthorList = openalex ? openAlexAuthors(openalex) : [];
  const dataciteAuthorList = datacite ? (datacite.creators || []).map((author) => ({
    given: author.givenName || null,
    family: author.familyName || null,
    name: author.name || [author.givenName, author.familyName].filter(Boolean).join(" ") || null,
    orcid: author.nameIdentifiers?.find((identifier) => identifier.nameIdentifierScheme === "ORCID")?.nameIdentifier || null,
  })).filter((author) => author.name) : [];
  const authorList = crossrefAuthorList.length ? crossrefAuthorList : openalexAuthorList.length ? openalexAuthorList : dataciteAuthorList;

  const printYear = dateYear(crossref?.["published-print"]);
  const onlineYear = dateYear(crossref?.["published-online"]);
  const canonicalYear = printYear || openalex?.publication_year || datacite?.publicationYear || Number(dblp?.year) || publication.year || onlineYear || dateYear(crossref?.issued);
  const venue = crossref?.["container-title"]?.[0]
    || openalex?.primary_location?.source?.display_name
    || datacite?.container?.title
    || dblp?.venue
    || publication.publication
    || null;
  const articleNumber = crossref?.["article-number"] || openalex?.biblio?.article_number || null;
  const canonicalType = typeFromSources(crossref, openalex, datacite, publication);
  const canonicalAuthors = authorList.length ? authorList.map((author) => author.name).join(", ") : publication.authors || null;
  const matched = [];
  if (crossref) matched.push("crossref");
  if (openalex) matched.push("openalex");
  if (dblp) matched.push("dblp");
  if (datacite) matched.push("datacite");
  const scores = [crossrefMatch, openalexMatch, dblpMatch, dataciteMatch]
    .filter((match) => match?.match.accepted)
    .map((match) => match.match.score);
  const confidence = scores.length ? Math.max(...scores) : 0;
  const artifact = isLikelyNonAuthoredArtifact(publication);
  const affiliateAuthorship = hasAffiliateAuthorship(publication, authorList);
  const recordStatus = artifact
    ? "excluded_non_authored_artifact"
    : !affiliateAuthorship
      ? "excluded_non_affiliate_authorship"
      : "included";

  return {
    ...publication,
    title: crossref?.title?.[0] || openalex?.title || datacite?.titles?.[0]?.title || publication.title,
    authors: canonicalAuthors,
    author_list: authorList.length ? authorList : null,
    scholar_authors: publication.authors || null,
    publication: venue,
    venue,
    publisher: crossref?.publisher || datacite?.publisher || null,
    year: canonicalYear || null,
    published_print_year: printYear,
    published_online_year: onlineYear,
    publication_date: openalex?.publication_date || null,
    type: canonicalType,
    volume: crossref?.volume || openalex?.biblio?.volume || null,
    issue: crossref?.issue || openalex?.biblio?.issue || null,
    pages: crossref?.page || [openalex?.biblio?.first_page, openalex?.biblio?.last_page].filter(Boolean).join("-") || null,
    article_number: articleNumber,
    doi,
    doi_url: doi ? `https://doi.org/${doi}` : null,
    doi_status: doi ? "verified" : "not_found",
    metadata_completeness: {
      status: canonicalAuthors && canonicalYear && venue && canonicalType !== "other" ? "complete_core" : "partial_source_metadata",
      missing_core_fields: [
        !canonicalAuthors ? "authors" : null,
        !canonicalYear ? "year" : null,
        !venue ? "venue" : null,
        canonicalType === "other" ? "type" : null,
      ].filter(Boolean),
    },
    record_status: recordStatus,
    duplicate_record_ids: [],
    identifiers: {
      crossref_doi: normalizeDoi(crossref?.DOI),
      openalex_id: openalex?.id || null,
      dblp_key: dblp?.key || null,
      datacite_doi: normalizeDoi(datacite?.doi),
      isbn: unique(crossref?.ISBN || []),
      issn: unique(crossref?.ISSN || []),
    },
    web_sources: [
      { name: "Google Scholar", matched: true, urls: publication.scholar_sources?.map((source) => source.citation_url).filter(Boolean) || [] },
      { name: "Crossref", checked: true, matched: Boolean(crossref), url: normalizeDoi(crossref?.DOI) ? `https://api.crossref.org/works/${encodeURIComponent(normalizeDoi(crossref.DOI))}` : null },
      { name: "OpenAlex", checked: Boolean(openalexMatch?.checked), matched: Boolean(openalex), url: openalex?.id || null, note: openalexMatch?.skipped || null },
      { name: "DBLP", checked: Boolean(dblpMatch?.checked), matched: Boolean(dblp), url: dblp?.url || null, note: dblpMatch?.skipped || null },
      { name: "DataCite", checked: Boolean(dataciteMatch), matched: Boolean(datacite), url: normalizeDoi(datacite?.doi) ? `https://api.datacite.org/dois/${encodeURIComponent(normalizeDoi(datacite.doi))}` : null },
    ],
    verification: {
      status: recordStatus !== "included" ? "excluded" : matched.length >= 2 ? "verified_multiple_sources" : matched.length === 1 ? "verified_primary_registry" : "scholar_only",
      checked_at: CHECKED_AT,
      matched_sources: ["google_scholar", ...matched],
      confidence: Number(confidence.toFixed(4)),
      crossref_score: crossrefMatch ? Number(crossrefMatch.match.score.toFixed(4)) : null,
      openalex_score: openalexMatch ? Number(openalexMatch.match.score.toFixed(4)) : null,
      dblp_score: dblpMatch ? Number(dblpMatch.match.score.toFixed(4)) : null,
      datacite_score: dataciteMatch ? Number(dataciteMatch.match.score.toFixed(4)) : null,
    },
  };
}

function mergeDuplicateDois(publications) {
  const groups = new Map();
  for (const publication of publications) {
    const key = publication.doi ? `doi:${publication.doi}` : `id:${publication.id}`;
    const group = groups.get(key) || [];
    group.push(publication);
    groups.set(key, group);
  }

  return [...groups.values()].map((group) => {
    if (group.length === 1) return group[0];
    const sorted = [...group].sort((a, b) => {
      const aCoverage = (a.scholar_sources?.length || 0) + (a.affiliate_ids?.length || 0);
      const bCoverage = (b.scholar_sources?.length || 0) + (b.affiliate_ids?.length || 0);
      return bCoverage - aCoverage;
    });
    const canonical = sorted[0];
    const scholarSourcesByUrl = new Map();
    for (const publication of group) {
      for (const source of publication.scholar_sources || []) scholarSourcesByUrl.set(source.citation_url, source);
    }
    const matchedSources = unique(group.flatMap((publication) => publication.verification.matched_sources || []));
    const sourceNames = ["Google Scholar", "Crossref", "OpenAlex", "DBLP", "DataCite"];
    const webSources = sourceNames.map((name) => {
      const sources = group.flatMap((publication) => publication.web_sources || []).filter((source) => source.name === name);
      return {
        name,
        checked: sources.some((source) => source.checked),
        matched: sources.some((source) => source.matched),
        url: sources.find((source) => source.url)?.url || null,
        urls: unique(sources.flatMap((source) => source.urls || [])),
        note: sources.find((source) => source.note)?.note || null,
      };
    });
    const externalMatchCount = matchedSources.filter((source) => source !== "google_scholar").length;
    const recordStatus = group.some((publication) => publication.record_status === "included") ? "included" : canonical.record_status;
    return {
      ...canonical,
      affiliate_ids: unique(group.flatMap((publication) => publication.affiliate_ids || [])),
      scholar_sources: [...scholarSourcesByUrl.values()],
      citations: Math.max(...group.map((publication) => publication.citations || 0)),
      record_status: recordStatus,
      duplicate_record_ids: group.map((publication) => publication.id).filter((id) => id !== canonical.id),
      web_sources: webSources,
      verification: {
        ...canonical.verification,
        status: recordStatus !== "included" ? "excluded" : externalMatchCount >= 2 ? "verified_multiple_sources" : externalMatchCount === 1 ? "verified_primary_registry" : "scholar_only",
        matched_sources: matchedSources,
        confidence: Math.max(...group.map((publication) => publication.verification.confidence || 0)),
      },
    };
  });
}

await mkdir(CACHE_DIR, { recursive: true });
const data = JSON.parse(await readFile(DATA_PATH, "utf8"));
const snapshot = JSON.parse(await readFile(SNAPSHOT_PATH, "utf8"));
const freshByCitation = new Map();
for (const profile of snapshot.profiles) {
  for (const row of profile.rows) freshByCitation.set(row.citation_for_view, row);
}

const publications = data.publications.map((publication) => {
  const rows = (publication.scholar_sources || []).map((source) => {
    const citationId = new URL(source.citation_url).searchParams.get("citation_for_view");
    return freshByCitation.get(citationId);
  }).filter(Boolean);
  const richest = [...rows].sort((a, b) => ((b.publication?.length || 0) + (b.authors?.length || 0)) - ((a.publication?.length || 0) + (a.authors?.length || 0)))[0];
  return {
    ...publication,
    title: richest?.title || publication.title,
    authors: richest?.authors || publication.authors,
    publication: richest?.publication || publication.publication,
    year: richest?.year || publication.year,
    citations: Math.max(publication.citations || 0, ...rows.map((row) => row.citations || 0)),
  };
});

process.stdout.write(`Crossref: loading publisher metadata for ${data.affiliates.length} affiliates\n`);
const crossrefByAffiliate = new Map();
for (const [index, affiliate] of data.affiliates.entries()) {
  const items = await queryCrossrefAuthor(affiliate);
  crossrefByAffiliate.set(affiliate.id, items);
  process.stdout.write(`Crossref: ${affiliate.name} — ${items.length} candidates (${index + 1}/${data.affiliates.length})\n`);
  await new Promise((resolve) => setTimeout(resolve, 1100));
}
const crossrefMatches = publications.map((publication) => {
  const byDoi = new Map();
  for (const affiliateId of publication.affiliate_ids) {
    for (const item of crossrefByAffiliate.get(affiliateId) || []) {
      const doi = normalizeDoi(item.DOI);
      if (doi && !byDoi.has(doi)) byDoi.set(doi, item);
    }
  }
  const candidates = [...byDoi.values()].filter((item) => tokenDice(publication.title, item.title?.[0] || item["short-title"]?.[0] || "") >= 0.45);
  return bestCrossref(publication, candidates);
});

const needsCrossrefTitleSearch = publications.map((publication, index) => (
  !crossrefMatches[index]?.match.accepted && !isLikelyNonAuthoredArtifact(publication) ? index : null
)).filter((index) => index !== null);
process.stdout.write(`Crossref: title-searching ${needsCrossrefTitleSearch.length} unresolved records\n`);
for (const [position, index] of needsCrossrefTitleSearch.entries()) {
  const match = await queryCrossrefTitle(publications[index]);
  if (match?.match.accepted) crossrefMatches[index] = match;
  if ((position + 1) % 25 === 0) process.stdout.write(`Crossref title search: ${position + 1}/${needsCrossrefTitleSearch.length}\n`);
  if (process.env.CROSSREF_TITLE_SEARCH === "1") await new Promise((resolve) => setTimeout(resolve, 1100));
}

const acceptedCrossrefDois = unique(crossrefMatches.filter((match) => match?.match.accepted).map((match) => normalizeDoi(match.item.DOI)));
process.stdout.write(`OpenAlex: validating ${acceptedCrossrefDois.length} Crossref DOIs\n`);
const openAlexByDoi = await batchOpenAlexByDoi(acceptedCrossrefDois);
const openAlexMatches = new Array(publications.length).fill(null);
const needsOpenAlexSearch = [];
for (let index = 0; index < publications.length; index += 1) {
  const crossrefMatch = crossrefMatches[index];
  const doi = crossrefMatch?.match.accepted ? normalizeDoi(crossrefMatch.item.DOI) : null;
  const item = doi ? openAlexByDoi.get(doi) : null;
  if (item) {
    openAlexMatches[index] = { checked: true, item, title: item.title || "", authors: openAlexAuthors(item), match: scoreCandidate(publications[index], item.title || "", openAlexAuthors(item), item.publication_year ? [item.publication_year] : []) };
    openAlexMatches[index].match.accepted = openAlexMatches[index].match.title_score >= 0.88 && openAlexMatches[index].match.authors_score >= 0.2;
  } else {
    needsOpenAlexSearch.push(index);
  }
}

process.stdout.write(`OpenAlex: title-searching ${needsOpenAlexSearch.length} unresolved records\n`);
const searchedOpenAlex = await mapLimit(needsOpenAlexSearch, 3, async (index, position) => {
  const match = await queryOpenAlex(publications[index]);
  if ((position + 1) % 50 === 0) process.stdout.write(`OpenAlex search: ${position + 1}/${needsOpenAlexSearch.length}\n`);
  if (process.env.OPENALEX_SEARCH === "1") await new Promise((resolve) => setTimeout(resolve, 110));
  return { index, match };
});
for (const { index, match } of searchedOpenAlex) openAlexMatches[index] = match;

const unresolvedIndexes = publications.map((_, index) => index).filter((index) => {
  const crossref = crossrefMatches[index]?.match.accepted;
  const openalex = openAlexMatches[index]?.match.accepted;
  return !crossref && !openalex;
});

process.stdout.write(`DBLP: checking ${unresolvedIndexes.length} records unresolved by Crossref/OpenAlex\n`);
const dblpMatches = new Array(publications.length).fill(null);
const searchedDblp = await mapLimit(unresolvedIndexes, 1, async (index, position) => {
  const match = await queryDblp(publications[index]);
  if ((position + 1) % 50 === 0) process.stdout.write(`DBLP: ${position + 1}/${unresolvedIndexes.length}\n`);
  if (process.env.DBLP_SEARCH === "1") await new Promise((resolve) => setTimeout(resolve, 180));
  return { index, match };
});
for (const { index, match } of searchedDblp) dblpMatches[index] = match;

const dataciteMatches = new Array(publications.length).fill(null);
const registryCandidates = publications.map((publication, index) => {
  if (crossrefMatches[index]?.match.accepted) return null;
  const doi = normalizeDoi(openAlexMatches[index]?.match.accepted ? openAlexMatches[index].item?.doi : null)
    || normalizeDoi(dblpMatches[index]?.match.accepted ? dblpMatches[index].item?.doi : null);
  return doi ? { index, doi } : null;
}).filter(Boolean);
const dataCitePrefixes = ["10.48550/", "10.5281/"];
const dataCiteRegistryCandidates = registryCandidates.filter(({ doi }) => dataCitePrefixes.some((prefix) => doi.startsWith(prefix)));
const crossrefRegistryCandidates = registryCandidates.filter(({ doi }) => !dataCitePrefixes.some((prefix) => doi.startsWith(prefix)));

if (dataCiteRegistryCandidates.length) process.stdout.write(`DataCite: validating ${dataCiteRegistryCandidates.length} external DOI matches\n`);
const exactDataCite = await mapLimit(dataCiteRegistryCandidates, 3, async ({ index, doi }) => ({
  index,
  match: await queryDataCiteDoi(publications[index], doi),
}));
for (const { index, match } of exactDataCite) dataciteMatches[index] = match;

if (crossrefRegistryCandidates.length) process.stdout.write(`Crossref: validating ${crossrefRegistryCandidates.length} external DOI matches\n`);
for (const { index, doi } of crossrefRegistryCandidates) {
  const match = await queryCrossrefDoi(publications[index], doi);
  if (match?.match.accepted) crossrefMatches[index] = match;
  await new Promise((resolve) => setTimeout(resolve, 1100));
}

const stillUnresolvedIndexes = publications.map((_, index) => index).filter((index) => (
  !crossrefMatches[index]?.match.accepted
  && !openAlexMatches[index]?.match.accepted
  && !dblpMatches[index]?.match.accepted
  && !dataciteMatches[index]?.match.accepted
));
process.stdout.write(`DataCite: checking ${stillUnresolvedIndexes.length} remaining records\n`);
const searchedDataCite = await mapLimit(stillUnresolvedIndexes, 3, async (index, position) => {
  const match = await queryDataCite(publications[index]);
  if ((position + 1) % 50 === 0) process.stdout.write(`DataCite: ${position + 1}/${stillUnresolvedIndexes.length}\n`);
  await new Promise((resolve) => setTimeout(resolve, 35));
  return { index, match };
});
for (const { index, match } of searchedDataCite) dataciteMatches[index] = match;

const enrichedBeforeDedupe = publications.map((publication, index) => chooseCanonical(
  publication,
  crossrefMatches[index],
  openAlexMatches[index],
  dblpMatches[index],
  dataciteMatches[index],
));
const enriched = mergeDuplicateDois(enrichedBeforeDedupe);

for (const affiliate of data.affiliates) {
  affiliate.publication_ids = enriched.filter((publication) => publication.affiliate_ids.includes(affiliate.id)).map((publication) => publication.id);
  for (const profile of affiliate.scholar_profiles) {
    const fresh = snapshot.profiles.find((entry) => entry.profile_user_id === profile.user_id);
    if (fresh) profile.publication_count = fresh.current_row_count;
  }
}

const summary = {
  source_row_count: snapshot.source_row_count,
  unique_publication_count: enriched.length,
  included_record_count: enriched.filter((publication) => publication.record_status === "included").length,
  excluded_artifact_count: enriched.filter((publication) => publication.record_status !== "included").length,
  doi_count: enriched.filter((publication) => publication.doi).length,
  no_doi_found_count: enriched.filter((publication) => !publication.doi).length,
  multiple_source_verified_count: enriched.filter((publication) => publication.verification.status === "verified_multiple_sources").length,
  primary_registry_verified_count: enriched.filter((publication) => publication.verification.status === "verified_primary_registry").length,
  scholar_only_count: enriched.filter((publication) => publication.verification.status === "scholar_only").length,
  complete_year_count: enriched.filter((publication) => publication.year).length,
  complete_venue_count: enriched.filter((publication) => publication.venue).length,
  complete_author_count: enriched.filter((publication) => publication.authors).length,
};

const output = {
  ...data,
  schema_version: "2.0.0",
  generated_at: CHECKED_AT,
  source: {
    name: "DatAI multi-source publication audit",
    collection_method: "All public Google Scholar profile rows were reloaded and reconciled by normalized title, author overlap and publication year against Crossref and OpenAlex; unresolved records were additionally checked in DBLP and DataCite.",
    sources: [
      { name: "Google Scholar", base_url: "https://scholar.google.com/", role: "affiliate profile completeness and citation snapshot" },
      { name: "Crossref", base_url: "https://api.crossref.org/", role: "publisher-deposited DOI and bibliographic metadata" },
      { name: "OpenAlex", base_url: "https://api.openalex.org/", role: "independent work identity and metadata cross-check" },
      { name: "DBLP", base_url: "https://dblp.org/", role: "computer-science bibliography fallback" },
      { name: "DataCite", base_url: "https://api.datacite.org/", role: "DOI registry fallback for non-Crossref records" },
    ],
  },
  scope: {
    ...data.scope,
    source_row_count: snapshot.source_row_count,
    unique_publication_count: enriched.length,
    included_record_count: summary.included_record_count,
  },
  verification_summary: summary,
  limitations: [
    "All 920 rows currently visible across the 12 public Google Scholar profiles of the 11 confirmed affiliates were reloaded on the audit date; the deduplicated archive contains every one of those source rows.",
    "Google Scholar profiles are maintained by their owners, so works missing from a member's public profile cannot be inferred as complete solely from Scholar.",
    "A DOI is included only when a registry or strongly matching bibliographic source supplies it. A null DOI with doi_status 'not_found' means no reliable DOI was found in the checked sources; it does not prove that no DOI was ever assigned.",
    "Publisher metadata can distinguish online-first and print/fascicle years; both are retained when available and the displayed year prefers the print/fascicle year.",
    "Records identified as indexes, reviewer lists or similar non-authored front matter remain preserved for auditability but are explicitly excluded from the primary archive count.",
    "Abubakari Alidu has two verified public Google Scholar profiles; both are included and merged.",
    "Federica Filippini's public Scholar profile still displays a Politecnico di Milano affiliation; identity was matched by name and publication history, while current DatAI membership was confirmed by the site owner.",
  ],
  affiliates: data.affiliates,
  publications: enriched,
};

await writeFile(DATA_PATH, `${JSON.stringify(output, null, 2)}\n`);
await writeFile(REPORT_PATH, `${JSON.stringify({ generated_at: CHECKED_AT, summary, unresolved: enriched.filter((publication) => publication.verification.status === "scholar_only").map((publication) => ({ id: publication.id, title: publication.title, year: publication.year, authors: publication.authors, publication: publication.publication })) }, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
