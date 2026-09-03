import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(await readFile(resolve(root, "data/people.json"), "utf8"));
const template = await readFile(resolve(root, "people/profile.html"), "utf8");
const siteOrigin = "https://cremarco.github.io/datai";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function externalLinkAttributes(url) {
  return url.startsWith("http") ? ' rel="noreferrer"' : "";
}

function evidenceRows(items, kind) {
  return items.map((item) => `<li class="profile-evidence-row">
    <p class="profile-evidence-meta">${escapeHtml(item.type || item.period)}</p>
    <div>
      <h4><a href="${escapeHtml(item.url)}"${externalLinkAttributes(item.url)}>${escapeHtml(item.name)}</a></h4>
      <p>${escapeHtml(item.relation || item.year)}</p>
    </div>
    <a class="profile-evidence-action" href="${escapeHtml(item.url)}"${externalLinkAttributes(item.url)}>Open ${kind}</a>
  </li>`).join("\n");
}

function profileContent(person, index) {
  const previous = data.people[(index - 1 + data.people.length) % data.people.length];
  const next = data.people[(index + 1) % data.people.length];
  const projects = person.projects.length
    ? `<section aria-labelledby="profile-projects-${escapeHtml(person.id)}">
        <h3 id="profile-projects-${escapeHtml(person.id)}">Projects and programmes</h3>
        <ul>${evidenceRows(person.projects, "project record")}</ul>
      </section>`
    : "";
  const primaryProfile = person.links[0];
  const profileLinks = person.links.map((link) => `<a href="${escapeHtml(link.url)}" rel="noreferrer">${escapeHtml(link.label)}</a>`).join("");
  const areas = person.areas.map((area) => `<li>${escapeHtml(area)}</li>`).join("");

  return `<main id="main" class="profile-page">
      <section id="top" class="profile-hero">
        <div class="mx-auto max-w-[90rem] px-5 pb-20 pt-[calc(var(--header-height)+2rem)] md:px-8 md:pb-28 md:pt-[calc(var(--header-height)+3rem)] xl:px-12">
          <nav class="profile-breadcrumb" aria-label="Breadcrumb"><a href="/datai/people/">People</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(person.name)}</span></nav>
          <div class="profile-hero-grid">
            <figure class="profile-hero-portrait"><img src="${escapeHtml(person.portrait)}" alt="Portrait of ${escapeHtml(person.name)}" width="480" height="600" decoding="async" /></figure>
            <div class="profile-hero-copy">
              <h1>${escapeHtml(person.name)}</h1>
              <p class="profile-role">${escapeHtml(person.role)}</p>
              <p class="profile-affiliation">${escapeHtml(person.membership)} · DatAI Lab<br />Department of Informatics, Systems and Communication<br />University of Milano-Bicocca</p>
              <p class="profile-statement">${escapeHtml(person.statement)}</p>
              <div class="profile-hero-actions"><a class="profile-action-primary" href="/datai/publications/?member=${escapeHtml(person.id)}#archive">Browse publications</a><a class="profile-action-secondary" href="${escapeHtml(primaryProfile.url)}" rel="noreferrer">${escapeHtml(primaryProfile.label)}</a></div>
            </div>
          </div>
        </div>
      </section>

      <section class="profile-reading" aria-labelledby="research-profile-${escapeHtml(person.id)}">
        <div class="mx-auto max-w-[90rem] px-5 py-20 md:px-8 md:py-28 xl:px-12">
          <div class="profile-reading-grid">
            <h2 id="research-profile-${escapeHtml(person.id)}">Research profile.</h2>
            <div><p class="profile-bio">${escapeHtml(person.bio)}</p><div class="profile-authority-links" aria-label="Authoritative profile records">${profileLinks}</div></div>
          </div>
          <div class="profile-focus">
            <h3>Research focus</h3>
            <ul>${areas}</ul>
          </div>
        </div>
      </section>

      <section class="profile-evidence" aria-labelledby="selected-evidence-${escapeHtml(person.id)}">
        <div class="mx-auto max-w-[90rem] px-5 py-20 md:px-8 md:py-28 xl:px-12">
          <div class="profile-section-heading"><h2 id="selected-evidence-${escapeHtml(person.id)}">Selected evidence.</h2><div><p>A concise selection of public project records and research outputs connected to this profile.</p><p class="profile-reviewed">Content reviewed ${escapeHtml(data.reviewed_at)}</p></div></div>
          <div class="profile-evidence-groups${person.projects.length ? "" : " profile-evidence-groups--single"}">
            ${projects}
            <section aria-labelledby="profile-outputs-${escapeHtml(person.id)}">
              <h3 id="profile-outputs-${escapeHtml(person.id)}">Research outputs</h3>
              <ul>${evidenceRows(person.outputs, "source")}</ul>
            </section>
          </div>
          <p class="profile-evidence-note">This page is a selected public research profile. The complete dated record remains available in the publication archive and linked institutional profiles.</p>
        </div>
      </section>

      <section class="profile-continuation" aria-labelledby="continue-${escapeHtml(person.id)}">
        <div class="mx-auto max-w-[90rem] px-5 py-16 md:px-8 md:py-20 xl:px-12">
          <div class="profile-continuation-heading"><h2 id="continue-${escapeHtml(person.id)}">Continue through the group.</h2><a href="/datai/people/">All people</a></div>
          <nav class="profile-neighbours" aria-label="Adjacent member profiles"><a href="/datai/people/${escapeHtml(previous.id)}/"><span>Previous member</span><strong>${escapeHtml(previous.name)}</strong></a><a href="/datai/people/${escapeHtml(next.id)}/"><span>Next member</span><strong>${escapeHtml(next.name)}</strong></a></nav>
        </div>
      </section>
    </main>`;
}

for (const [index, person] of data.people.entries()) {
  const pageUrl = `${siteOrigin}/people/${person.id}/`;
  const imageUrl = `${siteOrigin}${person.portrait}`;
  const description = `${person.name} — ${person.role} at DatAI Lab, University of Milano-Bicocca. ${person.statement}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    jobTitle: person.role,
    url: pageUrl,
    image: imageUrl,
    description: person.statement,
    affiliation: {
      "@type": "Organization",
      name: "DatAI Lab — University of Milano-Bicocca",
      url: `${siteOrigin}/`,
    },
    sameAs: person.links.map((link) => link.url),
  };
  const html = template
    .replace("<!-- PROFILE_TITLE -->", escapeHtml(`${person.name} | DatAI Lab`))
    .replace("<!-- PROFILE_DESCRIPTION -->", escapeHtml(description))
    .replaceAll("<!-- PROFILE_CANONICAL -->", escapeHtml(pageUrl))
    .replaceAll("<!-- PROFILE_OG_TITLE -->", escapeHtml(`${person.name} | DatAI Lab`))
    .replaceAll("<!-- PROFILE_OG_DESCRIPTION -->", escapeHtml(description))
    .replaceAll("<!-- PROFILE_OG_IMAGE -->", escapeHtml(imageUrl))
    .replace("<!-- PROFILE_JSON_LD -->", JSON.stringify(jsonLd).replaceAll("<", "\\u003c"))
    .replace("<!-- PROFILE_CONTENT -->", profileContent(person, index))
    .replace(/[ \t]+$/gm, "");
  const output = resolve(root, "people", person.id, "index.html");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html);
}

const coreRoutes = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/research/", changefreq: "monthly", priority: "0.9" },
  { path: "/people/", changefreq: "monthly", priority: "0.9" },
  { path: "/publications/", changefreq: "weekly", priority: "0.9" },
  { path: "/contact/", changefreq: "yearly", priority: "0.7" },
];
const profileRoutes = data.people.map((person) => ({ path: `/people/${person.id}/`, changefreq: "monthly", priority: "0.7" }));
const sitemapItems = [...coreRoutes, ...profileRoutes].map((route) => `  <url>
    <loc>${siteOrigin}${route.path}</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join("\n");
await writeFile(resolve(root, "public/sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapItems}
</urlset>
`);

console.log(`Generated ${data.people.length} people profile pages.`);
