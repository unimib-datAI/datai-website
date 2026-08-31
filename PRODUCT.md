# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Sito statico in HTML semantico, Tailwind CSS, JavaScript vanilla e CSS. Il workflow confermato è code-first. La pipeline usa Vite e Tailwind v4; il dominio istituzionale definitivo resta da confermare.

## Users

Il sito rappresenta pubblicamente il laboratorio Data for Artificial Intelligence (DatAI) del Dipartimento di Informatica, Sistemistica e Comunicazione (DISCo) dell'Università degli Studi di Milano-Bicocca.

Pubblici di riferimento, dedotti dalla natura del sito e dalle fonti istituzionali e da confermare prima della definizione delle pagine:

- comunità scientifica e potenziali collaboratori che devono comprendere rapidamente identità, temi, progetti e risultati del laboratorio;
- studenti, laureandi, tirocinanti, dottorandi e ricercatori interessati a opportunità e supervisione;
- membri del laboratorio e del Dipartimento che necessitano di una fonte pubblica autorevole e aggiornabile.

## Product Purpose

Creare il nuovo sito istituzionale del laboratorio DatAI, precedentemente noto come INSID&S Lab, rendendo comprensibili e rintracciabili la sua identità, le linee di ricerca, le persone, i progetti e gli output verificabili. Il sito deve sostituire come riferimento pubblico il precedente indirizzo `inside.disco.unimib.it`, attualmente non raggiungibile, e deve essere progettato per una forte indicizzazione organica.

Il successo consiste nel permettere a un visitatore di capire rapidamente che cosa studia DatAI, perché il suo approccio è rilevante, chi ne fa parte, quali risultati produce e come entrare in contatto o collaborare, senza affermazioni non supportate.

## Positioning

La descrizione istituzionale pubblicata da DISCo presenta DatAI come il laboratorio che sviluppa modelli basati su tecniche semantiche e interazione uomo-macchina per supportare la gestione di dati di grandi dimensioni e servizi a valore aggiunto.

Le fonti interne più recenti precisano il territorio come intersezione tra intelligenza artificiale e data management: principi e strumenti di gestione dei dati — query language, schemi, indicizzazione, retrieval ibrido, provenienza, verifica, caching ed esecuzione attenta a costo e qualità — vengono applicati a sistemi LLM e agentici affidabili. Tra i prototipi citati nelle fonti interne compaiono DAVE, DQL/VCL, SemT-X e RefactX/KG; la loro presenza e denominazione nel sito pubblico devono essere convalidate durante la selezione dei contenuti.

## Operating Context

- Il laboratorio appartiene a DISCo, Università degli Studi di Milano-Bicocca.
- La pagina dipartimentale corrente indica Flavio De Paoli come responsabile e la stanza 1033 nell'edificio U14, Viale Sarca 336, Milano.
- Il sito dovrà collegare in modo chiaro le fonti istituzionali, l'organizzazione GitHub `unimib-datAI` e gli output pubblici dei progetti.
- Le informazioni su persone, incarichi, progetti, pubblicazioni, software, eventi e opportunità devono provenire da fonti correnti e avere una responsabilità editoriale identificabile.

## Capabilities and Constraints

- Architettura statica, responsive e progressivamente migliorata: il contenuto essenziale deve restare fruibile senza JavaScript.
- SEO tecnica e contenutistica: titoli e descrizioni unici, URL leggibili, HTML semantico, canonical, Open Graph, dati strutturati appropriati, sitemap XML, robots.txt, immagini ottimizzate e buone prestazioni Core Web Vitals.
- Nessun dato, numero, membro, partner, progetto, pubblicazione, premio o testimonianza può essere pubblicato senza una fonte verificabile.
- Il precedente nome INSID&S va usato come informazione storica e come ponte SEO, non come identità principale.
- Il sito è solo in inglese e usa cinque pagine con URL leggibili: Home, Research, People, Publications e Contact. Il dominio istituzionale definitivo e il processo editoriale di aggiornamento restano da confermare. La versione corrente non usa analytics, form o altre funzioni che richiedano cookie.
- Il roster editoriale corrente comprende undici membri confermati e deve essere corredato da data di aggiornamento. Eventuali variazioni future di dottorandi, assegnisti, contrattisti, collaboratori ed ex membri devono essere ricontrollate prima della pubblicazione.

## Information Architecture Direction

- Navigazione primaria multipagina: Research; People; Publications; Contact. Il logo riporta sempre alla Home.
- **Home** presenta identità, tesi del laboratorio, domande guida, gruppo e una selezione di output verificabili.
- **Research** unisce le quattro linee di ricerca a Evidence e Projects & Resources, perché i progetti sono la prova delle domande scientifiche e non un catalogo separato.
- **People** mantiene il roster completo di undici membri con ritratti, ruoli, affiliazioni e profili autorevoli.
- **Publications** ospita esclusivamente l'archivio completo e ricercabile, così le altre pagine restano leggere e focalizzate.
- **Contact** raccoglie collaborazione, opportunità per studenti, sede, affiliazione UniMiB/DISCo, nome storico INSID&S e fonti istituzionali.
- Privacy, accessibilità, responsabilità editoriale e note sulle fonti restano nel footer condiviso di tutte le pagine.
- Aree, persone, progetti, risorse e pubblicazioni devono restare collegate tramite URL e identificativi stabili, evitando liste divergenti.
- Il sito resta interamente in inglese, senza selettore di lingua.

## Brand Commitments

- Nome principale: **DatAI**.
- Espansione: **Data for Artificial Intelligence**.
- Affiliazione da rendere sempre riconoscibile: Dipartimento di Informatica, Sistemistica e Comunicazione, Università degli Studi di Milano-Bicocca.
- Nome storico: **INSID&S Lab** / **INSIDes Lab**, solo dove utile a continuità e reperibilità.
- Fonte autorevole del logo DatAI: file Figma `DATAI - Logo`, nodo `7:187` (`https://www.figma.com/design/9HoGz1UEnENGmhSNXnPnRY/DATAI---Logo?node-id=7-187&m=dev`). Il marchio usa il wordmark `dat·AI` verde brillante su fondo verde petrolio scuro. Le eventuali regole di co-branding UniMiB/DISCo restano da confermare.

## Evidence on Hand

- Pagina ufficiale DISCo dei laboratori di ricerca: `https://www.disco.unimib.it/it/ricerca/laboratori-ricerca` — nome, descrizione istituzionale, responsabile, stanza e collegamento al vecchio sito.
- Organizzazione GitHub pubblica: `https://github.com/unimib-datAI` — repository e prototipi software del gruppo; i singoli repository devono essere selezionati e descritti solo dopo verifica.
- Gmail, 4 giugno 2026, “A report for DatAI from SIGMOD 2026” — descrive il gruppo come attivo all'intersezione tra AI e data management e rimanda al report interno.
- Google Drive, “SIGMOD/PODS 2026 - DatAI Relevance Report” — articola il posizionamento su data management per sistemi LLM/agentici affidabili e cita DAVE, DQL/VCL, SemT-X e RefactX/KG.
- Gmail, 11 maggio 2026, allegato “PresentsazioneNode.pptx” — materiale del nodo Bicocca del Laboratorio CINI Data Science; utile come contesto dipartimentale, ma non è prova che tutti i temi, membri e progetti elencati appartengano a DatAI.
- File Figma `DATAI - Logo`, nodo `7:187`: fonte confermata dall'utente per il logo ufficiale e disponibile come vettoriale esportabile; sostituisce come autorità l'immagine derivata presente sulla pagina DISCo.
- Google Drive, foglio `Afferenze Personale DISCO 2025` (modificato il 25 marzo 2026): registra come afferenti strutturati primari a Data for Artificial Intelligence (DatAI) Andrea Maurino, Michele Ciavotta, Flavio Maria De Paoli, Matteo Luigi Palmonari e Blerina Spahiu. I rispettivi ruoli DISCo correnti sono confermati dalle pagine istituzionali UniMiB; Flavio De Paoli è indicato come responsabile del laboratorio dalla pagina ufficiale DISCo.
- Lo stesso foglio registra Abubakari Alidu come dottorando con afferenza primaria DatAI ed Emanuele Petriglia con afferenza secondaria DatAI. I loro profili UniMiB risultano ancora attivi, ma categoria e permanenza nel roster pubblico devono essere confermate prima del rilascio.
- Il 30 agosto 2026 l'utente ha confermato come membri correnti anche Federica Filippini, Marco Cremaschi, Riccardo Pozzi e Renzo Arturo Alva Principe. I loro ruoli DISCo correnti e i collegamenti scientifici con DatAI/INSID&S risultano coerenti con la conferma.
- Il 31 agosto 2026 l'utente ha richiesto l'uso nel team dei ritratti pubblici già selezionati. La preview privata usa derivati locali WebP e conserva fonte e stato dei diritti nella provenance; la conferma delle autorizzazioni resta un passaggio editoriale prima del lancio istituzionale pubblico.
- Sara Nocco è stata esclusa esplicitamente dal roster dall'utente il 30 agosto 2026 e non deve comparire tra gli afferenti. Il registro 2025 contiene inoltre incarichi DatAI con date già concluse per Giulia Rosemary Avis, Federico Belotti, Manuel Elia e An Qi Zhao, oltre a dottorandi di cicli conclusi; non vanno presentati automaticamente come membri attuali.
- Benchmark `research/site-benchmark.md`, 30 agosto 2026: analisi completa degli altri 24 laboratori elencati da DISCo e confronto con MIT CSAIL, Stanford HAI, BAIR, Mila, Ai2, Google DeepMind, ETH AI Center e Alan Turing Institute. La sintesi raccomanda completezza strutturale, contenuti collegati a output, governance editoriale e percorsi espliciti per studenti e collaboratori.
- Il vecchio sito `https://inside.disco.unimib.it/` risulta non raggiungibile al momento della ricognizione.
- Non sono ancora disponibili contenuti pubblici completi e convalidati per l'intero roster, progetti, pubblicazioni, news, opportunità e contatti editoriali; il sito non deve colmare queste assenze con contenuti inventati.

## Product Principles

1. **Evidence before claims.** Ogni affermazione pubblica deve essere tracciabile a una fonte istituzionale o approvata dal laboratorio.
2. **Make the intersection legible.** Spiegare con chiarezza come DatAI unisce AI e data management, evitando gergo privo di esempi o output concreti.
3. **Research connected to artifacts.** Collegare temi e progetti a pubblicazioni, software, dataset, demo o persone responsabili quando verificati.
4. **Useful to the next collaborator.** Rendere semplici la scoperta di competenze, opportunità, contatti e modalità di collaborazione.
5. **Fast, findable, maintainable.** Prestazioni, accessibilità, SEO e aggiornabilità sono requisiti del prodotto, non rifiniture successive.

## Accessibility & Inclusion

Il target normativo o di conformità specifico è ancora da confermare. Come base, il sito dovrà offrire struttura semantica, navigazione completa da tastiera, focus visibile, contrasto sufficiente, testi alternativi appropriati, preferenza reduced-motion, layout adattivo e contenuti comprensibili anche fuori dal contesto accademico specialistico.
