# Verifica della prima versione

Eseguita l'11 novembre 2026. Include il collegamento al progetto Supabase reale; GitHub non è ancora pubblicato.

## Controlli ripetibili nel progetto

- `npm.cmd test`: 9 test passati.
- `python -m unittest discover -s tests -p 'test_*.py'`: 6 test passati.
- `npm.cmd run build`: riuscito con configurazione pubblica Supabase.
- Selezione del volantino verificata sull'HTML scaricato dal sito ufficiale: un solo gruppo corrispondente, 20 pagine consecutive.

## Database

Lo schema SQL è stato applicato a un'istanza PostgreSQL incorporata con PGlite, creando i ruoli `anon` e `authenticated` come nell'ambiente Supabase. Verificati:

- Creazione e lettura attraverso il ruolo `anon` con token valido.
- Tentativo di creazione ripetuto: non modifica la lista esistente.
- Lettura e tentativo di riutilizzo dell'ID con token diverso: negati.
- Lettura diretta delle tabelle private da parte di `anon`: negata.
- Invio ripetuto della stessa operazione: non duplica il prodotto.
- Rimozione seguita da una spunta ritardata: prodotto ancora eliminato.
- Prodotto senza nome: rifiutato.

Sul progetto Supabase reale configurato sono riuscite chiamate HTTPS con la publishable key a `create_shared_list`, `read_shared_list` e `apply_list_operation`: creazione di una lista tecnica separata, lettura, aggiunta idempotente di un prodotto, rimozione e rifiuto di un token errato. Nessuna lista preesistente dell'utente è stata modificata.

È stato completato anche un test della PWA reale collegata al progetto Supabase reale: due contesti Chromium indipendenti hanno aperto la stessa lista tecnica; un'offerta Garofalo aggiunta dal primo browser è arrivata al secondo, e la successiva rimozione è arrivata al secondo browser. Nessun errore JavaScript e nessuno scorrimento orizzontale a 390 pixel.

## Browser

Chromium con Playwright, due contesti indipendenti da 390 × 844 pixel, frontend reale e endpoint di test che esegue le funzioni SQL reali su PGlite. Il database remoto Supabase non è stato simulato con risposte fisse: le operazioni hanno eseguito lo schema del progetto.

Scenari completati:

1. Creazione di una lista e apertura del link nel secondo contesto.
2. Aggiunta dal primo e ricezione nel secondo.
3. Spunta dal secondo e ricezione nel primo.
4. Aggiunta offline, ricaricamento offline grazie al service worker, recupero della coda e successiva ricezione nel secondo contesto al ritorno online.
5. Hosting sotto il percorso `/spesa-insieme/`, come su GitHub Pages.
6. Nessuno scorrimento orizzontale a 390 pixel.
7. Catalogo di 577 offerte, visualizzazione iniziale paginata, ricerca, selezione multipla, aggiunta alla lista e ricezione nel secondo contesto.
8. Configurazione assente: modalità locale dichiarata, condivisione disabilitata.
9. Nome prodotto contenente HTML: mostrato come testo, senza esecuzione.
10. Nessun errore JavaScript durante gli scenari.
11. Selezione dal visualizzatore della pagina originale e aggiunta alla lista.
12. Sconto 10% senza prezzo: non viene mostrato come 0 €.
13. In copertina: 12 offerte in totale, 8 valide l'11 novembre e 4 valide solo il 12; il filtro distingue oggi e offerte in arrivo.
14. Apertura e lettura di una pagina immagine dopo ricaricamento offline.

## Analisi del volantino

PDF e 20 immagini sono salvati nel progetto, con hash SHA-256 in `public/flyers/946-20261102/source.json`. Tutte le pagine sono state lette visivamente con supporto OCR Tesseract italiano locale. Le 577 voci includono le varianti raggruppate e le ripetizioni fra copertina e pagine interne; non sono 577 SKU distinti. I prezzi vanno confrontati con il riferimento originale in caso di dubbio.

La validità è 4–12 novembre 2026. La pagina 20 non contiene altri prodotti: contiene la promozione sui buoni spesa, lo sconto del mercoledì e le condizioni dei punti vendita. Queste iniziative sono mostrate separatamente nel catalogo e non vengono sommate automaticamente ai prezzi.

## Da verificare dopo il collegamento

- Una lista reale condivisa tra due telefoni.
- Pubblicazione effettiva e URL GitHub Pages.
- Installazione su iPhone e Android fisici.
