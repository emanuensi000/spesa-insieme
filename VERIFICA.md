# Verifica della prima versione

## Versione nel footer — 14 novembre 2026

- Versione `0.2.1` e identificativo della build visibili nel footer della home e del modulo Spesa, senza richieste di rete aggiuntive.
- La build legge la versione da `package.json`, la include nel calcolo dell’identificativo e sostituisce i segnaposto negli HTML generati. Footer e cache del service worker usano lo stesso identificativo.
- Build riuscita; controllati entrambi gli HTML generati, assenza dei segnaposto, corrispondenza con la cache offline e allineamento delle versioni nel lockfile.

## Gesti del volantino su mobile — 14 novembre 2026

- A immagine ingrandita il trascinamento permette di muoversi in entrambe le direzioni; lo swipe per cambiare pagina resta attivo soltanto senza zoom.
- Solo un tap breve seleziona o deseleziona il prodotto. Movimenti oltre 10 pixel, pressioni oltre 350 ms, gesti con più dita e tocchi annullati bloccano il click successivo. Tastiera e click del mouse restano utilizzabili.
- Test degli handler reali: tap anche con zoom, spostamento verticale/orizzontale/diagonale con ritorno al punto iniziale, pressione prolungata, pinch, annullamento, ripresa dei tap, tastiera e navigazione senza zoom.
- Chromium con touchscreen simulato a 390×844: aggiunta/rimozione con tap, swipe tra pagine senza zoom e trascinamenti dopo una pressione di 600 ms a zoom 2×. Verificati spostamento orizzontale del viewport e scorrimento verticale dell’immagine nel dialogo, senza selezioni accidentali, cambi pagina durante il trascinamento o errori JavaScript.
- `npm test`, `npm run build` e `git diff --check`: riusciti. Collaudo con lista locale isolata; resta da provare su dispositivi Android/iOS fisici.

## Chiusura della spesa e dashboard Profilo — 13 novembre 2026

- Implementati conferma di data e totale scontrino, archivio immutabile per lista, nuova lista e dashboard del Profilo con riepiloghi, andamento di sei mesi, filtro mensile e dettaglio con foto.
- Ripristinate le 20 immagini della precedente edizione 946, senza ripristinare il vecchio PDF né le offerte scadute nel catalogo. Hash originali conservati nell'indice fotografico; ritagli storici usati anche per gli articoli nelle liste esistenti.
- Test JavaScript/SQL: importi in centesimi, stima dei soli acquistati, prodotti senza prezzo, isolamento locale/account, filtro del mese a cavallo d'anno, memoria piena, nuova lista dopo chiusura, foto storiche e checksum.
- Migrazione `002_shopping_history.sql` applicata due volte a PostgreSQL PGlite di test: autenticazione con token, accesso negato alle tabelle, chiusura senza prodotti acquistati rifiutata, conflitto con modifica concorrente, validazione foto/importi, chiusura idempotente e modifiche tardive negate anche ai vecchi client.
- Chromium a 390×844 e 1440×1000: chiusura di due liste, modifica del totale, quantità, non acquistati, foto, filtro mensile, riepiloghi e media, nuova lista, ricaricamento offline e assenza di errori JavaScript o scorrimento orizzontale.
- Due browser con RPC instradate al database SQL di test: chiusura propagata e sola lettura sul secondo dispositivo; chiusura locale conservata se la funzione manca e sincronizzata dopo attivazione. Nessun dato reale delle liste dell'utente modificato dal collaudo.
- Sul database online `close_shared_list` restituisce `PGRST202` (funzione non presente). Nessuna migrazione remota applicata: il frontend conserva le chiusure sul dispositivo e segnala l'attivazione necessaria per sincronizzarle. Le prove condivise attestano il database di test, non l'attivazione del servizio remoto.


## Aggiornamento login — 12 novembre 2026

- OAuth Google/Facebook con PKCE e ripristino dell'invito, anche dopo annullamento del provider.
- Sessioni persistenti separate per progetto, migrazione della vecchia sessione di scheda, refresh serializzato, logout offline e protezione contro refresh tardivi.
- OTP con numero normalizzato, reinvio persistente dopo almeno 60 secondi, errori per codice errato/scaduto e cambio numero.
- Cambio account e logout fra schede nascondono i dati precedenti; il caricamento del nuovo account parte da uno stato vuoto.
- Codici ed errori OAuth non finiscono nella cache del service worker.
- Verifica Chromium mobile con risposte Auth simulate: provider disabilitati, Google/Facebook, ritorno all'invito, annullamento e successivo ingresso ospite, persistenza dopo reload, OTP, logout fra schede, modalità locale e ospite in sola lettura.
- Nessun SMS reale inviato. I provider Google, Facebook e Phone risultano disabilitati nel progetto Supabase: il collaudo end-to-end sui servizi reali richiede la configurazione indicata in [docs/LOGIN.md](docs/LOGIN.md).

## Aggiornamento volantino — 13 novembre 2026

Fonte corrente: [Al costo!, edizione 20001](https://www.ipertriscount.it/volantini/20001-al-costo-2), selezionata dalla card esatta nell'elenco ufficiale. Il nuovo gruppo comprende Casal Bertone, Fonte Nuova e Guidonia; Viterbo non è incluso. Le sezioni successive documentano le verifiche storiche della precedente edizione.

- Lette visivamente tutte le 20 pagine; trascritte 577 offerte con varianti raggruppate e ripetizioni mantenute nella pagina di origine. Dal 13 al 22 novembre sono attive 569 voci; le quattro offerte Iper Day del solo 23 novembre sono ripetute a pagina 1 e 20, per otto voci con Fidelity Card e condizioni specifiche.
- Tutte le offerte hanno ID nuovi, prezzi, date, pagine locali e aree selezionabili della nuova edizione. I dati delle liste esistenti non vengono modificati.
- Le 20 immagini ufficiali e il PDF offline sono in `public/flyers/20001-20261112/`, con checksum SHA-256. Il PDF è assemblato localmente dalle immagini JPEG originali senza ricompressione: l'endpoint PDF ufficiale ha restituito una pagina HTML di verifica.
- `npm test`: sette file JavaScript/SQL passati, comprese interazioni reali con adattatore DOM, prezzi aggiornati, confini delle date, ritagli, checksum e presenza di tutte le immagini originali nel PDF.
- Suite Python: sette test passati, inclusa scoperta tramite card esatta quando il dettaglio non ripete le sedi e rifiuto di gruppi diversi.
- `npm run build`: riuscito; cache PWA rigenerata dal contenuto del nuovo catalogo e dalle nuove pagine offline.
- Vecchie immagini e PDF dell'edizione 946 rimossi dalla cartella pubblica; la build ripulisce `dist/` per evitare di ripubblicare file di edizioni eliminate. Catalogo e cache offline includono solo il nuovo volantino.
- Nessuna nuova prova su browser o dispositivi fisici in questo aggiornamento; le prove Chromium sotto riportate restano storiche.

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


## Aggiornamento quantità e volantino interattivo

Verificati con `npm test`, suite Python e build statica:

- I tap aggiungono, rimuovono tutte le unità e permettono di riaggiungere il prodotto con un nuovo ID.
- Le quantità si modificano con i pulsanti oppure inserendo un intero da 1 a 99. Le modifiche di gruppo sono salvate insieme; un errore di memoria annulla l'intero gruppo.
- Spuntare un prodotto conserva la stima totale e sposta il relativo valore fra da acquistare e già nel carrello. La somma avviene in centesimi; gli importi mancanti restano esclusi e segnalati.
- Tutte le 577 offerte hanno una regione all'interno della pagina e una sorgente locale. La mappa dei ritagli resta disponibile per ricompilare il catalogo.
- La selezione distingue pagina 1 e pagina 10, date e prezzi diversi.

I nuovi test delle interazioni eseguono gli handler reali con un adattatore DOM in Node, senza chiamare Supabase. Verificato anche Chromium con viewport mobile 390 × 844: tap sulle aree con aggiunta e rimozione, navigazione e swipe simulato, incremento quantità, stima e foto visibile, nessun errore JavaScript o scorrimento orizzontale. Zoom e aggiornamento della PWA vanno provati anche su telefono fisico. Per le offerte al kg o per etto sono supportate quantità intere.

## Rinomina OrganAIzer — 12 novembre 2026

Il percorso citato nelle prove precedenti è quello storico, non una pubblicazione del nuovo nome. La rinomina corrente mantiene indirizzo pubblico, schema Spesa e formato dei link. I riferimenti tecnici al vecchio nome rimangono soltanto per recuperare memoria locale e cache, nei test di migrazione e nel resoconto storico. La nuova identità non implementa ancora login, gruppi o nuovi moduli.

Controlli eseguiti per questa modifica:

- `npm test`: suite JavaScript completata, inclusi recupero della lista/token/coda dalla vecchia chiave, precedenza ai dati nuovi e conservazione dei dati in caso di memoria piena.
- `python3 -m unittest discover -s tests -p 'test_*.py'`: 6 test riusciti.
- `npm run build`: riuscita con la configurazione pubblica esistente; output aggiornato in `dist/`.
- `git diff --check`: nessun errore di spaziatura.

Nessuna pubblicazione remota, modifica al database o nuova prova su browser/telefono eseguita in questo passaggio. Le prove browser delle sezioni precedenti restano storiche.

## OrganAIzer 0.2 — nuova applicazione

Implementati accesso con rilevamento provider, home a quattro card, navigazione flottante Home/Profilo/Impostazioni anche nel modulo Spesa, modalità locale, attività ricorrenti, agenda, spese/rimborsi, impostazioni e migrazione SQL additiva. Il documento `docs/IMPLEMENTAZIONE.md` specifica funzioni, limiti e attivazione remota.

Verifiche del 12 novembre 2026:

- Cinque file di test JavaScript/SQL completati con `npm test`, compreso PostgreSQL in PGlite. Il test SQL applica due volte la migrazione e usa i ruoli effettivi `anon` e `authenticated`.
- Verificati isolamento fra gruppi, invito e iscrizione, idempotenza dei salvataggi, conflitti di versione, accesso negato alle tabelle private, visibilità sanitaria, guest limitato alla risorsa, revoca e trasferimento della proprietà.
- Sei test Python del catalogo riusciti; build statica riuscita.
- Chromium a 390×844 e 1440×1000: login con provider non disponibili, griglia, barra flottante, profilo, preferenze, creazione e completamento di attività ricorrenti, bolletta con quote e rimborso, appuntamento, lista Spesa e prodotto. Nessun errore JavaScript o scorrimento orizzontale indesiderato. Riapertura e utilizzo offline riusciti.
- Prova dell’interfaccia condivisa con due account e un ospite, richieste RPC instradate a un PostgreSQL di test che esegue la migrazione reale: completamento guest, revoca, ingresso nel gruppo e appuntamento privato escluso da memoria offline e dal secondo account.
- Il login OAuth/SMS con veri provider non è stato provato: le impostazioni pubbliche Supabase indicano Google, Facebook e telefono disabilitati. Non sono state applicate migrazioni al database remoto né modificate configurazioni di provider.

Le prove Chromium usano un database di test separato, non attestano l’attivazione delle nuove RPC nel progetto remoto. Installazione e safe area vanno provate anche su dispositivi Android/iOS fisici.
