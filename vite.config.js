import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { siteShell } from "./src/site-shell.js";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function publicationArchive() {
  return {
    name: "datai-publication-archive",
    async transformIndexHtml(html) {
      const raw = await readFile(new URL("./data/publications.json", import.meta.url), "utf8");
      const data = JSON.parse(raw);
      const publications = data.publications.filter((publication) => publication.record_status === "included").sort((a, b) => {
        if ((b.year || 0) !== (a.year || 0)) return (b.year || 0) - (a.year || 0);
        if ((b.citations || 0) !== (a.citations || 0)) return (b.citations || 0) - (a.citations || 0);
        return a.title.localeCompare(b.title);
      });

      const items = publications.map((publication, index) => {
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
        return `<li class="publication-item" data-publication-item data-year="${escapeHtml(year)}" data-search="${escapeHtml(search)}" data-index="${index}">
          <div class="publication-year">${escapeHtml(year)}</div>
          <div class="min-w-0">
            <h3>${title}</h3>
            <p class="publication-authors">${escapeHtml(publication.authors)}</p>
            ${publicationDetails ? `<p class="publication-venue">${escapeHtml(publicationDetails)}</p>` : ""}
            <p class="publication-meta"><span>${escapeHtml(typeLabel)}</span><span>${escapeHtml(verification)}</span>${doi}</p>
            ${scholarSource ? `<a class="publication-scholar" href="${escapeHtml(scholarSource)}" rel="noreferrer">Google Scholar source</a>` : ""}
          </div>
          <div class="publication-citations"><span>${publication.citations || 0}</span><small>citations</small></div>
        </li>`;
      }).join("\n");

      const years = [...new Set(publications.map((publication) => publication.year).filter(Boolean))]
        .sort((a, b) => b - a)
        .map((year) => `<option value="${year}">${year}</option>`)
        .join("");

      return html
        .replace("<!-- PUBLICATION_COUNT -->", String(publications.length))
        .replaceAll("<!-- SOURCE_ROW_COUNT -->", String(data.verification_summary?.source_row_count || data.scope?.source_row_count || ""))
        .replaceAll("<!-- UNIQUE_RECORD_COUNT -->", String(data.verification_summary?.unique_publication_count || data.scope?.unique_publication_count || ""))
        .replaceAll("<!-- DOI_COUNT -->", String(data.verification_summary?.included_doi_count || publications.filter((publication) => publication.doi).length))
        .replaceAll("<!-- EXCLUDED_COUNT -->", String((data.verification_summary?.excluded_artifact_count || 0) + (data.verification_summary?.excluded_non_affiliate_authorship_count || 0)))
        .replace("<!-- PUBLICATION_YEARS -->", years)
        .replace("<!-- PUBLICATION_ARCHIVE -->", items)
        .replaceAll("<!-- DATA_UPDATED -->", escapeHtml(data.generated_at));
    },
  };
}

export default defineConfig({
  appType: "mpa",
  base: "/datai/",
  plugins: [siteShell(), publicationArchive(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL("./index.html", import.meta.url)),
        research: fileURLToPath(new URL("./research/index.html", import.meta.url)),
        people: fileURLToPath(new URL("./people/index.html", import.meta.url)),
        publications: fileURLToPath(new URL("./publications/index.html", import.meta.url)),
        contact: fileURLToPath(new URL("./contact/index.html", import.meta.url)),
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
