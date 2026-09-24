import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { siteShell } from "./src/site-shell.js";
import { toolsDirectory } from "./src/tools-directory.js";

const peopleData = JSON.parse(readFileSync(new URL("./data/people.json", import.meta.url), "utf8"));

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function peopleDirectory() {
  const rows = peopleData.people.map((person) => {
    const profileLinks = person.links.map((link) => `<a class="profile-link" href="${escapeHtml(link.url)}" rel="noreferrer">${escapeHtml(link.short_label)}</a>`).join("");
    return `<article id="person-${escapeHtml(person.id)}" class="person-row">
      <a class="person-portrait" href="/datai-website/people/${escapeHtml(person.id)}/" aria-label="View the profile of ${escapeHtml(person.name)}"><img src="${escapeHtml(person.portrait)}" alt="" width="480" height="600" loading="lazy" decoding="async" /></a>
      <div><h3><a class="person-name-link" href="/datai-website/people/${escapeHtml(person.id)}/">${escapeHtml(person.name)}</a></h3><p class="person-role">${escapeHtml(person.role)}</p><div class="person-row-actions"><a href="/datai-website/people/${escapeHtml(person.id)}/">View profile</a><a href="/datai-website/publications/?member=${escapeHtml(person.id)}#archive">Publications</a></div></div>
      <p class="person-membership">${escapeHtml(person.membership)}</p>
      <div class="person-record-links">${profileLinks}</div>
    </article>`;
  }).join("\n");

  return {
    name: "datai-people-directory",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return html.replace(/<!-- PEOPLE_ROSTER_START -->[\s\S]*?<!-- PEOPLE_ROSTER_END -->/, `<!-- PEOPLE_ROSTER_START -->\n${rows}\n<!-- PEOPLE_ROSTER_END -->`);
      },
    },
  };
}

function publicationArchive() {
  return {
    name: "datai-publication-archive",
    async transformIndexHtml(html) {
      const raw = await readFile(new URL("./data/publications.json", import.meta.url), "utf8");
      const data = JSON.parse(raw);
      const affiliatesById = new Map(data.affiliates.map((affiliate) => [affiliate.id, affiliate]));
      const publications = data.publications.filter((publication) => publication.record_status === "included").sort((a, b) => {
        if ((b.year || 0) !== (a.year || 0)) return (b.year || 0) - (a.year || 0);
        if ((b.citations || 0) !== (a.citations || 0)) return (b.citations || 0) - (a.citations || 0);
        return a.title.localeCompare(b.title);
      });

      const items = publications.map((publication, index) => {
        const affiliateIds = publication.affiliate_ids || [];
        const dataiAuthors = affiliateIds.map((id) => affiliatesById.get(id)).filter(Boolean);
        const scholarSource = publication.scholar_sources?.[0]?.citation_url || "";
        const source = publication.doi_url || scholarSource;
        const year = publication.year || "Undated";
        const typeLabels = {
          "journal-article": "Journal article",
          "conference-paper": "Conference paper",
          "book-chapter": "Book chapter",
          preprint: "Preprint",
          thesis: "Thesis",
          report: "Report",
          dataset: "Dataset",
          software: "Software",
          book: "Book",
          other: "Research output",
        };
        const typeLabel = typeLabels[publication.type] || "Research output";
        const publicationDetails = [
          publication.venue,
          publication.volume ? `vol. ${publication.volume}` : "",
          publication.issue ? `no. ${publication.issue}` : "",
          publication.pages ? `pp. ${publication.pages}` : publication.article_number ? `article ${publication.article_number}` : "",
        ].filter(Boolean).join(" · ");
        const search = `${publication.title} ${publication.authors} ${publicationDetails} ${publication.doi || ""} ${typeLabel} ${year}`.toLowerCase();
        const title = source
          ? `<a class="publication-title" href="${escapeHtml(source)}" rel="noreferrer">${escapeHtml(publication.title)} <span aria-hidden="true">↗</span></a>`
          : `<span class="publication-title">${escapeHtml(publication.title)}</span>`;
        const doi = publication.doi
          ? `<a class="publication-doi" href="${escapeHtml(publication.doi_url)}" rel="noreferrer">DOI ${escapeHtml(publication.doi)}</a>`
          : `<span class="publication-doi publication-doi-missing">DOI not found in checked registries</span>`;
        const verification = publication.verification?.status === "verified_multiple_sources"
          ? "Verified across multiple sources"
          : publication.verification?.status === "verified_primary_registry"
            ? "Verified in a primary registry"
            : "Scholar profile record";
        const dataiAuthorLinks = dataiAuthors.length
          ? `<span class="publication-datai-authors">DatAI: ${dataiAuthors.map((affiliate) => `<a href="/datai-website/people/${escapeHtml(affiliate.id)}/">${escapeHtml(affiliate.name)}</a>`).join(", ")}</span>`
          : "";
        return `<li class="publication-item" data-publication-item data-year="${escapeHtml(year)}" data-affiliates="${escapeHtml(affiliateIds.join(" "))}" data-search="${escapeHtml(search)}" data-index="${index}">
          <div class="publication-year">${escapeHtml(year)}</div>
          <div class="min-w-0">
            <h3>${title}</h3>
            <p class="publication-authors">${escapeHtml(publication.authors)}</p>
            ${publicationDetails ? `<p class="publication-venue">${escapeHtml(publicationDetails)}</p>` : ""}
            <p class="publication-meta"><span>${escapeHtml(typeLabel)}</span><span>${escapeHtml(verification)}</span>${doi}${dataiAuthorLinks}</p>
            ${scholarSource ? `<a class="publication-scholar" href="${escapeHtml(scholarSource)}" rel="noreferrer">Google Scholar source</a>` : ""}
          </div>
          <div class="publication-citations"><span>${publication.citations || 0}</span><small>citations</small></div>
        </li>`;
      }).join("\n");

      const years = [...new Set(publications.map((publication) => publication.year).filter(Boolean))]
        .sort((a, b) => b - a)
        .map((year) => `<option value="${year}">${year}</option>`)
        .join("");
      const members = data.affiliates
        .map((affiliate) => `<option value="${escapeHtml(affiliate.id)}">${escapeHtml(affiliate.name)}</option>`)
        .join("");

      const datedPublicationYears = publications
        .map((publication) => Number(publication.year))
        .filter((year) => Number.isInteger(year) && year > 0);
      const firstPublicationYear = Math.min(...datedPublicationYears);
      const lastPublicationYear = Math.max(...datedPublicationYears);
      const publicationCountsByYear = new Map();
      datedPublicationYears.forEach((year) => {
        publicationCountsByYear.set(year, (publicationCountsByYear.get(year) || 0) + 1);
      });
      const publicationYearHistogram = Array.from(
        { length: lastPublicationYear - firstPublicationYear + 1 },
        (_, index) => {
          const year = firstPublicationYear + index;
          return { year, count: publicationCountsByYear.get(year) || 0 };
        },
      );
      const publicationChartMax = Math.ceil(Math.max(...publicationYearHistogram.map(({ count }) => count)) / 10) * 10;
      const publicationChartMid = publicationChartMax / 2;
      const publicationYearBars = publicationYearHistogram.map(({ year, count }, index) => {
        const labelInterval = year === lastPublicationYear ? "end" : year % 10 === 0 ? "decade" : year % 5 === 0 ? "five" : "none";
        const label = `${year}: ${count} publication${count === 1 ? "" : "s"}`;
        const height = ((count / publicationChartMax) * 100).toFixed(2);
        return `<li data-year-label="${labelInterval}">
          <span class="publication-histogram-plot" aria-hidden="true"><span class="publication-histogram-bar${count ? " has-publications" : ""}" style="--bar-height: ${height}%; --bar-delay: ${Math.min(index * 12, 360)}ms" title="${label}"></span></span>
          <span class="publication-histogram-year" aria-hidden="true">${year}</span>
          <span class="sr-only">${label}</span>
        </li>`;
      }).join("");

      return html
        .replaceAll("<!-- PUBLICATION_COUNT -->", String(publications.length))
        .replace("<!-- PUBLICATION_YEAR_RANGE -->", `${firstPublicationYear}–${lastPublicationYear}`)
        .replace("<!-- PUBLICATION_CHART_MAX -->", String(publicationChartMax))
        .replace("<!-- PUBLICATION_CHART_MID -->", String(publicationChartMid))
        .replace("<!-- PUBLICATION_YEAR_COLUMN_COUNT -->", String(publicationYearHistogram.length))
        .replace("<!-- PUBLICATION_YEAR_HISTOGRAM -->", publicationYearBars)
        .replace("<!-- PUBLICATION_YEARS -->", years)
        .replace("<!-- PUBLICATION_MEMBERS -->", members)
        .replace("<!-- PUBLICATION_ARCHIVE -->", items)
        .replaceAll("<!-- DATA_UPDATED -->", escapeHtml(data.generated_at));
    },
  };
}

export default defineConfig({
  appType: "mpa",
  base: "/datai-website/",
  plugins: [siteShell(), peopleDirectory(), publicationArchive(), toolsDirectory(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL("./index.html", import.meta.url)),
        research: fileURLToPath(new URL("./research/index.html", import.meta.url)),
        tools: fileURLToPath(new URL("./tools/index.html", import.meta.url)),
        people: fileURLToPath(new URL("./people/index.html", import.meta.url)),
        publications: fileURLToPath(new URL("./publications/index.html", import.meta.url)),
        contact: fileURLToPath(new URL("./contact/index.html", import.meta.url)),
        ...Object.fromEntries(peopleData.people.map((person) => [
          `person-${person.id}`,
          fileURLToPath(new URL(`./people/${person.id}/index.html`, import.meta.url)),
        ])),
      },
    },
  },
  server: {
    port: 64123,
    strictPort: true,
  },
  preview: {
    port: 64123,
    strictPort: true,
  },
});
