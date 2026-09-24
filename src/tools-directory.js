import { readFile } from "node:fs/promises";

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

export function toolsDirectory() {
  return {
    name: "datai-tools-directory",
    async transformIndexHtml(html) {
      if (!html.includes("<!-- TOOLS_")) return html;
      const data = JSON.parse(await readFile(new URL("../data/tools.json", import.meta.url), "utf8"));
      const navigation = data.categories.map((category) =>
        `<a class="link evidence-link text-paper-50 hover:text-acid-300" href="#${escapeHtml(category.id)}">${escapeHtml(category.name)}</a>`
      ).join("\n");
      const directory = data.categories.map((category) => {
        const rows = data.tools.filter((tool) => tool.category === category.id).map((tool) => {
          const links = [
            ...(tool.website ? [{ label: "Website", url: tool.website }] : []),
            ...tool.repositories,
          ].map((link) => `<a class="link evidence-link text-ink-700 hover:text-petrol-950" href="${escapeHtml(link.url)}" aria-label="${escapeHtml(tool.name)} — ${escapeHtml(link.label)}">${escapeHtml(link.label)}</a>`).join("\n");
          return `<li id="${escapeHtml(tool.id)}" class="tool-row">
            <div><h3 class="font-serif text-3xl leading-tight text-petrol-950">${escapeHtml(tool.name)}</h3><p class="mt-2 text-xs font-bold text-ink-700">${escapeHtml(tool.type)}</p></div>
            <p class="max-w-[65ch] text-sm leading-relaxed text-ink-700">${escapeHtml(tool.description)}</p>
            <div class="artifact-links">${links}</div>
          </li>`;
        }).join("\n");
        return `<section id="${escapeHtml(category.id)}" class="tools-group" aria-labelledby="${escapeHtml(category.id)}-title">
          <div class="mb-8 grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-end"><h2 id="${escapeHtml(category.id)}-title" class="max-w-[24ch] font-serif text-4xl leading-tight tracking-[-0.025em] text-petrol-950 md:text-5xl">${escapeHtml(category.name)}</h2><p class="max-w-[60ch] text-base leading-relaxed text-ink-700">${escapeHtml(category.description)}</p></div>
          <ul>${rows}</ul>
        </section>`;
      }).join("\n");
      return html.replaceAll("<!-- TOOLS_COUNT -->", String(data.tools.length)).replace("<!-- TOOLS_NAV -->", navigation).replace("<!-- TOOLS_DIRECTORY -->", directory);
    },
  };
}
