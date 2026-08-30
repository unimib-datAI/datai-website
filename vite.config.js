import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { readFile } from "node:fs/promises";

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
      const publications = [...data.publications].sort((a, b) => {
        if ((b.year || 0) !== (a.year || 0)) return (b.year || 0) - (a.year || 0);
        if ((b.citations || 0) !== (a.citations || 0)) return (b.citations || 0) - (a.citations || 0);
        return a.title.localeCompare(b.title);
      });

      const items = publications.map((publication, index) => {
        const source = publication.scholar_sources?.[0]?.citation_url || "";
        const year = publication.year || "Undated";
        const search = `${publication.title} ${publication.authors} ${publication.publication} ${year}`.toLowerCase();
        const title = source
          ? `<a class="publication-title" href="${escapeHtml(source)}" rel="noreferrer">${escapeHtml(publication.title)} <span aria-hidden="true">↗</span></a>`
          : `<span class="publication-title">${escapeHtml(publication.title)}</span>`;
        return `<li class="publication-item" data-publication-item data-year="${escapeHtml(year)}" data-search="${escapeHtml(search)}" data-index="${index}">
          <div class="publication-year">${escapeHtml(year)}</div>
          <div class="min-w-0">
            <h3>${title}</h3>
            <p class="publication-authors">${escapeHtml(publication.authors)}</p>
            ${publication.publication ? `<p class="publication-venue">${escapeHtml(publication.publication)}</p>` : ""}
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
        .replace("<!-- PUBLICATION_YEARS -->", years)
        .replace("<!-- PUBLICATION_ARCHIVE -->", items)
        .replaceAll("<!-- DATA_UPDATED -->", escapeHtml(data.generated_at));
    },
  };
}

export default defineConfig({
  plugins: [publicationArchive(), tailwindcss()],
  server: {
    port: 64123,
    strictPort: true,
  },
  preview: {
    port: 64123,
    strictPort: true,
  },
});
