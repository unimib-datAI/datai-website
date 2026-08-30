# DatAI — selezione fotografica degli afferenti

Aggiornamento: 31 agosto 2026

Ho selezionato una fonte primaria per ciascuno degli 11 afferenti, privilegiando profili ufficiali UniMiB, siti DISCo o di progetti di ricerca, pagine speaker professionali e solo in ultima istanza Google Scholar.

## Selezione consigliata

| Persona | Fonte scelta | Dimensioni | Valutazione | Indicazione di crop |
|---|---|---:|---|---|
| Flavio Maria De Paoli | [InterTwino](https://intertwino.gate-ai.eu/flavio-de-paoli/) · [immagine](https://intertwino.gate-ai.eu/wp-content/uploads/2021/12/flavio2.jpeg) | 1200×1600 | Buona | 4:5 o quadrato, testa e spalle |
| Andrea Maurino | [Profilo UniMiB](https://www.unimib.it/andrea-maurino) · [immagine](https://www.unimib.it/sites/default/files/foto/21-05-2018/maurino2.jpg) | 1609×1378 | Buona, da ritagliare | Quadrato stretto per eliminare la persona parziale in basso a destra |
| Michele Ciavotta | [Team InterTwino](https://intertwino.gate-ai.eu/our-team/) · [immagine](https://intertwino.gate-ai.eu/wp-content/uploads/2021/12/ciavotta-scaled-e1640015167470.jpg) | 799×799 | Buona | Già quadrata |
| Matteo Luigi Palmonari | [The Innovation Group](https://www.theinnovationgroup.it/speakers/matteo-palmonari/) · [immagine](https://www.theinnovationgroup.it/wp-content/uploads/2019/03/Matteo-Palmonari.jpg) | 448×449 | Adeguata per card piccole | Già quadrata; chiedere l'originale per il sito definitivo |
| Blerina Spahiu | [ProLingKNOWER / DISCo](https://prolingknower.disco.unimib.it/) · [immagine](https://lh3.googleusercontent.com/sitesv/AG8ngQXy1AOomfPBHpjdQze7WDqWgrzM4fSuxzX7Ls53boIbSqWBJ06dVBaD0lLz54tliajBxVJHSkv3Tnd83rNgK4CaCqqD-Ud-ofBllWll3bzKu7PLDoJRqpY0p-9JWBTL8Uo7Q00hAGeAtFw0sTWvlqMJAPilZbMa3K1-6lANaUwDbXDIwtZo9m6mg0UR8ITY6cZFW8qc_b_clVRqziQxnEauNtM1b8x7f_v1-xLmRWE=w1280) | 1280×1115 | Buona, da ritagliare | Quadrato stretto per eliminare la persona parziale a destra |
| Abubakari Alidu | [Google Scholar](https://scholar.google.co.uk/citations?hl=en&user=thpWhEkAAAAJ) · [immagine](https://scholar.googleusercontent.com/citations?view_op=medium_photo&user=thpWhEkAAAAJ&citpid=1) | 256×256 | Solo provvisoria | Già quadrata; chiedere obbligatoriamente l'originale |
| Emanuele Petriglia | [Profilo UniMiB](https://www.unimib.it/emanuele-petriglia) · [immagine](https://www.unimib.it/sites/default/files/2024-11/emanuele_petriglia.jpg) | 742×742 | Buona | Già quadrata; mantenere parte del contesto ambientale |
| Federica Filippini | [Profilo UniMiB](https://www.unimib.it/federica-filippini) · [immagine](https://www.unimib.it/sites/default/files/2025-10/IMG_8272.jpg) | 2155×2535 | Eccellente | Quadrato o 4:5 da metà busto |
| Marco Cremaschi | [Profilo UniMiB](https://www.unimib.it/marco-cremaschi) · [immagine](https://www.unimib.it/sites/default/files/2023-02/IMG_20210928_112029.jpeg) | 1689×2348 | Buona, contestuale | 4:5 sul busto; mantenere parte del poster e tagliare telefono/scrivania |
| Riccardo Pozzi | [Profilo UniMiB](https://www.unimib.it/riccardo-pozzi) · [immagine](https://www.unimib.it/sites/default/files/2025-02/foto_profilo_2023.jpg) | 961×1280 | Buona | Quadrato o 4:5, testa e spalle |
| Renzo Arturo Alva Principe | [Google Scholar](https://scholar.google.co.uk/citations?hl=en&user=c_C-5OsAAAAJ) · [immagine](https://scholar.googleusercontent.com/citations?view_op=medium_photo&user=c_C-5OsAAAAJ&citpid=5) | 236×256 | Solo provvisoria | Chiedere obbligatoriamente una nuova foto o l'originale |

## Valutazione d'insieme

- 9 immagini sono utilizzabili per prototipazione e card web; quelle di Federica Filippini, Flavio De Paoli, Michele Ciavotta e Riccardo Pozzi sono le più semplici da uniformare.
- Le foto di Andrea Maurino e Blerina Spahiu richiedono un crop attento per rimuovere altre persone ai margini.
- Le immagini di Abubakari Alidu e Renzo Alva Principe sono troppo piccole per un sito definitivo ad alta densità: vanno sostituite con originali forniti dagli interessati.
- La foto di Matteo Palmonari è pulita ma solo 448 px: adeguata a una card di circa 200–220 px, non a un hero o a una pagina profilo ampia.
- La foto di Marco Cremaschi ha un valore narrativo perché lo mostra nel contesto del laboratorio; per una griglia molto uniforme si può richiedere anche un headshot neutro alternativo.

## Regola di pubblicazione

Non fare hotlink delle immagini. Prima del go-live conviene raccogliere da ogni persona: file originale, consenso alla pubblicazione, eventuale credito fotografico e preferenza di crop. La disponibilità pubblica di una foto non equivale a una licenza di riutilizzo.

Il manifest strutturato per l'integrazione nel sito è in `data/people-photos.json`.
