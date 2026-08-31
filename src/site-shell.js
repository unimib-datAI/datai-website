const SITE_BASE = "/datai/";

const links = [
  { id: "research", label: "Research", href: `${SITE_BASE}research/` },
  { id: "people", label: "People", href: `${SITE_BASE}people/` },
  { id: "publications", label: "Publications", href: `${SITE_BASE}publications/` },
];

function desktopLink(link, activePage) {
  const active = link.id === activePage;
  return `<li><a class="block px-2 py-3 font-extrabold ${active ? "text-acid-300" : "text-paper-50/78 hover:text-acid-300"}" href="${link.href}"${active ? ' aria-current="page"' : ""}>${link.label}</a></li>`;
}

function mobileLink(link, activePage) {
  const active = link.id === activePage;
  return `<li><a class="block border-b border-paper-50/15 px-3 py-3 ${active ? "font-extrabold text-acid-300" : "hover:text-acid-300"}" href="${link.href}"${active ? ' aria-current="page"' : ""}>${link.label}</a></li>`;
}

export function siteHeader(activePage) {
  const contactActive = activePage === "contact";
  return `<a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header fixed inset-x-0 top-0 z-50 text-paper-50">
      <div class="mx-auto flex h-[var(--header-height)] max-w-[96rem] items-center justify-between px-5 md:px-8 xl:px-12">
        <a class="flex items-center gap-3" href="${SITE_BASE}" aria-label="DatAI home"${activePage === "home" ? ' aria-current="page"' : ""}>
          <span class="wordmark wordmark--animated" aria-hidden="true"><span class="wordmark-crt">dat.ai</span><img class="wordmark-official" src="${SITE_BASE}assets/datai-logo.svg" alt="" width="512" height="132" /></span>
          <span class="hidden text-[0.62rem] font-bold uppercase leading-tight tracking-[0.11em] text-paper-50/65 lg:block">Research laboratory<br />University of Milano-Bicocca</span>
        </a>
        <nav class="hidden md:block" aria-label="Primary navigation">
          <ul class="flex items-center gap-4 text-xs uppercase tracking-[0.08em]">
            ${links.map((link) => desktopLink(link, activePage)).join("")}
            <li><a class="ml-1 block border border-acid-500 px-3 py-2.5 font-extrabold ${contactActive ? "bg-acid-500 text-petrol-950" : "text-acid-300 hover:bg-acid-500 hover:text-petrol-950"}" href="${SITE_BASE}contact/"${contactActive ? ' aria-current="page"' : ""}>Contact</a></li>
          </ul>
        </nav>
        <details class="mobile-nav relative md:hidden" data-mobile-nav>
          <summary class="cursor-pointer border border-paper-50/30 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.09em]">Menu</summary>
          <nav class="absolute right-0 top-[calc(100%+0.65rem)] w-64 border border-paper-50/22 bg-petrol-950 p-2" aria-label="Mobile navigation">
            <ul class="text-sm">
              <li><a class="block border-b border-paper-50/15 px-3 py-3 ${activePage === "home" ? "font-extrabold text-acid-300" : "hover:text-acid-300"}" href="${SITE_BASE}"${activePage === "home" ? ' aria-current="page"' : ""}>Home</a></li>
              ${links.map((link) => mobileLink(link, activePage)).join("")}
              <li><a class="block px-3 py-3 ${contactActive ? "font-extrabold text-acid-300" : "text-acid-300"}" href="${SITE_BASE}contact/"${contactActive ? ' aria-current="page"' : ""}>Contact</a></li>
            </ul>
          </nav>
        </details>
      </div>
    </header>`;
}

export function siteFooter() {
  return `<footer class="bg-petrol-950 py-12 text-paper-50">
      <div class="mx-auto max-w-[90rem] px-5 md:px-8 xl:px-12">
        <div class="grid gap-10 border-b border-paper-50/18 pb-10 md:grid-cols-[1fr_auto] md:items-start">
          <div class="flex items-start"><span class="wordmark mt-1" aria-hidden="true"><img src="${SITE_BASE}assets/datai-logo.svg" alt="" width="512" height="132" /></span></div>
          <nav aria-label="Footer navigation"><ul class="grid grid-cols-2 gap-x-7 gap-y-3 text-sm font-extrabold md:grid-cols-1 md:text-right"><li><a class="text-acid-300 underline underline-offset-4" href="${SITE_BASE}research/">Research</a></li><li><a class="text-acid-300 underline underline-offset-4" href="${SITE_BASE}people/">People</a></li><li><a class="text-acid-300 underline underline-offset-4" href="${SITE_BASE}publications/">Publications</a></li><li><a class="text-acid-300 underline underline-offset-4" href="${SITE_BASE}contact/">Contact</a></li></ul></nav>
        </div>
        <div class="grid gap-6 border-b border-paper-50/18 py-8 md:grid-cols-[auto_1fr] md:items-center md:gap-8">
          <a class="unimib-mark-field" href="https://www.unimib.it/" aria-label="University of Milano-Bicocca official website"><img src="${SITE_BASE}assets/unimib-institutional-logo.png" alt="University of Milano-Bicocca institutional logo" width="160" height="172" /></a>
          <div><strong class="block text-sm font-extrabold text-paper-50">Institutional affiliation</strong><p class="mt-2 max-w-[44rem] text-sm leading-relaxed text-paper-50/65">DatAI is a research laboratory of the Department of Informatics, Systems and Communication (DISCo), University of Milano-Bicocca.</p></div>
        </div>
        <div class="grid gap-8 pt-8 text-xs leading-relaxed text-paper-50/60 md:grid-cols-3">
          <p><strong class="block text-paper-50">Editorial responsibility</strong>DatAI Lab. Last content review: <!-- DATA_UPDATED -->.</p>
          <details><summary class="cursor-pointer font-extrabold text-paper-50">Privacy &amp; accessibility</summary><p class="mt-2">This static site sets no analytics or advertising cookies. It is designed for keyboard use, reduced motion and WCAG 2.2 AA contrast. Accessibility feedback can be sent through the DISCo web editorial contact.</p></details>
          <details><summary class="cursor-pointer font-extrabold text-paper-50">Sources &amp; data notes</summary><p class="mt-2">Institutional facts: DISCo and UniMiB. Projects: public DatAI GitHub repositories. Publications: a deduplicated Google Scholar snapshot; profile attribution and limitations are preserved in the project data.</p></details>
        </div>
      </div>
    </footer>`;
}

export function siteShell() {
  return {
    name: "datai-site-shell",
    transformIndexHtml(html) {
      const match = html.match(/<!-- SITE_HEADER:([a-z-]+) -->/);
      const activePage = match?.[1] || "home";
      return html
        .replace(/<!-- SITE_HEADER:[a-z-]+ -->/, siteHeader(activePage))
        .replace("<!-- SITE_FOOTER -->", siteFooter());
    },
  };
}
