# OrganAIzer — test, regressioni e collaudo UI/UX

Data: 20 novembre 2026. Base esaminata: 0.3.0, commit `ac2a76f`. Catalogo associato: [1.000 requisiti](REQUISITI_1000.md).

## Aggiornamento 0.3.2

La suite include 150 casi JavaScript totali, di cui 85 casi dedicati in `tests/requirements.test.mjs` e 21 nuovi scenari browser in `tests/browser/requirements.spec.mjs` (42 esecuzioni). Con i precedenti 6 scenari browser il totale è 54 esecuzioni. La matrice [ACCETTAZIONE_0.3.2.md](ACCETTAZIONE_0.3.2.md) e il manifest [accettazione-0.3.2.json](accettazione-0.3.2.json) associano gli ID ai sorgenti di prova. ROB-280 verifica automaticamente conteggio, unicità, esistenza dei casi e corrispondenza della checklist: 102 ulteriori requisiti originari più il nuovo slider FUN-401.

Nuove prove: selezione liste e tastiera, overflow responsive, stato attivo dopo reload, anteprima e annullamento backup, cambio sessione durante lettura, ripristino completo, reset preferenze, sette ricorrenze, filtri Home, statistiche, carrello e filtri catalogo. Le fixture sono sintetiche e i provider remoti non vengono contattati. Le caselle spuntate non attestano certificazioni o collaudi su telefoni fisici.

## Aggiornamento 0.3.1

La versione 0.3.1 aggiunge Playwright come dipendenza di sviluppo e `npm run test:e2e`.
Installazione browser: `npx playwright install --with-deps chromium`. Su ambienti con home non scrivibile usare `PLAYWRIGHT_BROWSERS_PATH` in una directory scrivibile, sia per l'installazione sia per i test.
Il workflow Pages esegue anche questa suite prima della build finale e conserva `test-results/` per 7 giorni in caso di errore. Sono 6 scenari eseguiti su Chromium desktop e Pixel 7 emulato (12 esecuzioni), non prove su telefoni fisici. Provider e database sono esclusi tramite configurazione simulata; service worker bloccato in questa suite browser, verificato dalla suite dedicata.

Evidenze e limiti: [ACCETTAZIONE_0.3.1.md](ACCETTAZIONE_0.3.1.md).

## Inventario storico della base 0.3.0

Le sezioni seguenti descrivono la base prima della 0.3.1; le indicazioni di assenza di Playwright e test browser in CI sono superate dall'aggiornamento sopra.

## Cosa viene eseguito davvero

Il workflow [pages.yml](../.github/workflows/pages.yml) parte con un push su `main` oppure con avvio manuale. Esegue `npm ci`, `npm test`, la suite Python e la build. Pubblica su GitHub Pages soltanto dopo il successo del job di build. In CI usa Node.js 22 e Python 3.12. Le dipendenze di test sono in [package.json](../package.json) e nel lockfile.

La base corrente contiene **65 casi/esecuzioni riportati dalla suite JavaScript** e **7 test Python**. Il conteggio JavaScript comprende due casi OAuth, uno per Google e uno per Facebook, e due file SQL con verifiche eseguite al caricamento del modulo. Non significa 65 scenari browser o 65 screenshot. Il conteggio va aggiornato se cambiano i test.

Verifica locale del 20 novembre 2026: `npm test` **65/65 superati**; suite Python **7/7 superati**. In questa modifica documentale non sono stati rieseguiti collaudi grafici, provider reali o dispositivi fisici: le evidenze browser già registrate restano quelle storiche citate sotto.

| Livello | Stato nel repository | Cosa prova | Cosa non prova |
| --- | --- | --- | --- |
| JavaScript puro | Automatico in CI | Regole, validazione, importi, date e proiezione operazioni | Geometria reale del browser |
| Eventi UI con adattatore DOM | Automatico in CI | Handler, stato, quantità, gesti sintetici e persistenza | Rendering CSS, tastiera mobile o touch fisico |
| Auth con risposte simulate | Automatico in CI | Flusso PKCE, OTP, sessioni, errori e retry | Login Google/Facebook reale o consegna SMS |
| SQL PostgreSQL PGlite | Automatico in CI | Migrazioni reali, ruoli, token e concorrenza nei casi coperti | Configurazione effettiva del progetto Supabase remoto |
| Cache con ambiente simulato | Automatico in CI | Decisioni del worker e fallback offline | Installazione PWA su Android/iOS |
| Python catalogo | Automatico in CI | Scoperta della sede e importazione con fixture | Disponibilità futura del sito del supermercato |
| Build produzione | Automatico in CI | Generazione artefatto, configurazione pubblica e risorse richieste | Percorribilità di tutti i flussi nell'app pubblicata |
| Browser mobile di sviluppo | Prove storiche in [VERIFICA.md](../VERIFICA.md) | Flussi condivisi, backup, offline e layout nei contesti descritti | Esecuzione automatica a ogni push |
| Screenshot con baseline | **Non presente in CI** | Da implementare prima di usarlo come controllo obbligatorio | Nessuna garanzia pixel per pixel attuale |
| Audit automatico accessibilità | **Non presente in CI** | Da integrare con verifiche manuali | Nessuna certificazione di accessibilità attuale |
| Telefoni fisici e provider remoti | Collaudo manuale da registrare | Compatibilità effettiva e servizi esterni | Non sostituito dai test locali |

Gli script browser usati in sessioni di sviluppo fuori dal repository non costituiscono una suite portabile del progetto. Playwright non è una dipendenza di questa versione e non esiste un comando `test:e2e` o `test:visual` già attivo. Le procedure browser sotto sono **piano di collaudo**; non vengono eseguite da `npm test`.

Il workflow separato [flyers.yml](../.github/workflows/flyers.yml) scopre il volantino e salva un artefatto da revisionare. Non è una suite di regressione dell'app e non trascrive né pubblica automaticamente le offerte.

## Comandi ripetibili

Eseguire dalla radice del repository, con Node.js 22 o superiore e Python 3 disponibile:

```bash
npm ci
npm test
python -m unittest discover -s tests -p 'test_*.py'
npm run build
```

Su PowerShell con blocco degli script usare `npm.cmd` al posto di `npm`. Per una singola suite:

```bash
node --test tests/app.test.mjs
node --test tests/auth.test.mjs
node --test tests/group-shopping.test.mjs
node --test tests/backup.test.mjs tests/auth-cache.test.mjs
```

Anteprima reale: `npm run dev`, quindi aprire `http://127.0.0.1:4173`. Il server genera prima `dist/`. Non eseguire test distruttivi sui dati di produzione; usare utenti, gruppi e liste tecniche separati. Non registrare token, refresh token, segreti o backup personali negli artefatti di test.

## Inventario dei test automatici esistenti

Le righe seguenti riportano i casi presenti nei sorgenti, non test futuri. Gli identificativi AUT servono al piano test; gli ID FUN/UX/ROB servono al catalogo requisiti. Le prove SQL a livello di file contengono più asserzioni del singolo caso riportato.

### app.test.mjs

Sorgente: [app.test.mjs](../tests/app.test.mjs). Esecuzione: `node --test tests/app.test.mjs`.

- **AUT-001** — tap sul volantino, quantità, acquisto, rimozione e riaggiunta mantengono prezzi e stato.
- **AUT-002** — solo un tap breve seleziona il prodotto: trascinamenti, pressione lunga, pinch e annullamento non modificano la lista.
- **AUT-003** — lo swipe cambia pagina solo senza zoom e non genera una selezione.
- **AUT-004** — la modifica di quantità viene annullata interamente se il salvataggio fallisce.
- **AUT-005** — la rinomina recupera lista, token e coda offline e conserva la copia precedente.
- **AUT-006** — i dati OrganAIzer esistenti prevalgono sulla copia precedente.
- **AUT-007** — memoria piena durante la migrazione conserva intatta la coda precedente.
- **AUT-008** — chiusura salva totale scontrino e foto, blocca le modifiche e permette una nuova lista.
- **AUT-009** — più liste mantengono prodotti e coda separati e il form non sparisce durante un aggiornamento.
- **AUT-010** — i prodotti della precedente edizione conservano la propria foto, anche nello storico.
- **AUT-011** — chiusura con memoria piena lascia la lista aperta e tutti i prodotti intatti.
- **AUT-012** — i prodotti spuntati vanno in fondo e tornano tra quelli da acquistare togliendo la spunta.
- **AUT-013** — la spunta è immediatamente salvata senza dissolvenze o attese prima del riordino.

### auth-cache.test.mjs

Sorgente: [auth-cache.test.mjs](../tests/auth-cache.test.mjs). Esecuzione: `node --test tests/auth-cache.test.mjs`.

- **AUT-014** — le navigazioni, inclusi OAuth e inviti, non vengono mai salvate in cache.
- **AUT-015** — offline ogni navigazione usa la propria shell senza perdere il modulo Spesa.
- **AUT-016** — risposte dinamiche, query e richieste autenticate non sono intercettate.
- **AUT-017** — la cache statica conserva una build coerente e salva i volantini consultati.
- **AUT-018** — no-store, private e redirect non vengono memorizzati neppure per risorse statiche.

### auth.test.mjs

Sorgente: [auth.test.mjs](../tests/auth.test.mjs). Esecuzione: `node --test tests/auth.test.mjs`.

- **AUT-019** — normalizzazione telefono conserva il prefisso e non indovina il paese.
- **AUT-020** — OAuth google: PKCE, percorso Pages e destinazione invito.
- **AUT-021** — OAuth facebook: PKCE, percorso Pages e destinazione invito.
- **AUT-022** — OAuth annullato ripulisce il callback, conserva l’invito e non espone errori del provider.
- **AUT-023** — callback senza verifier o scaduto non scambia il codice e non redirige all’esterno.
- **AUT-024** — provider disabilitato non avvia OAuth e non salva un verifier.
- **AUT-025** — OTP: invio, cooldown persistente, numero verificato e sessione dopo riapertura.
- **AUT-026** — OTP errato/scaduto non apre una sessione e mantiene disponibile il reinvio.
- **AUT-027** — rate limit SMS impedisce reinvii anche dopo reload e non inventa un invio riuscito.
- **AUT-028** — sessione migrata dalla scheda e rinnovo concorrente usano un solo refresh token.
- **AUT-029** — refresh scaduto pulisce l’identità, ma un errore di rete conserva la sessione per riprovare.
- **AUT-030** — logout offline pulisce la sessione e un refresh tardivo non la ricrea.
- **AUT-031** — memoria bloccata non produce un accesso che verrà perso silenziosamente.
- **AUT-032** — offline si riapre solo l’identità già salvata senza creare una nuova autenticazione.
- **AUT-033** — una RPC che rifiuta il JWT chiude la sessione; un link ospite rifiutato non crea identità.

### backup.test.mjs

Sorgente: [backup.test.mjs](../tests/backup.test.mjs). Esecuzione: `node --test tests/backup.test.mjs`.

- **AUT-034** — backup roundtrip locale e normalizzazione autorizzazioni.
- **AUT-035** — backup rigetta strutture non valide e gruppo fasullo.
- **AUT-036** — backup rigetta elementi non sicuri.
- **AUT-037** — backup rifiuta formati e versioni sconosciuti ma accetta gli export precedenti.
- **AUT-038** — backup rifiuta proprietà pericolose anche annidate e profondità eccessive.
- **AUT-039** — backup rifiuta campi e rimborsi che renderebbero inutilizzabili i moduli.
- **AUT-040** — backup conserva pagamenti validi e rifiuta gruppi duplicati o incompleti.

### catalog.test.mjs

Sorgente: [catalog.test.mjs](../tests/catalog.test.mjs). Esecuzione: `node --test tests/catalog.test.mjs`.

- **AUT-041** — il catalogo Al costo copre le 20 pagine e le offerte Iper Day del solo 23 novembre.
- **AUT-042** — PDF e tutte le pagine archiviate corrispondono ai checksum dichiarati.
- **AUT-043** — ogni prodotto ha un ritaglio locale e una zona selezionabile dentro la pagina.
- **AUT-044** — le foto delle offerte scadute restano consultabili senza rientrare nel catalogo attivo.

### core.test.mjs

Sorgente: [core.test.mjs](../tests/core.test.mjs). Esecuzione: `node --test tests/core.test.mjs`.

- **AUT-045** — il link richiede id e token completo.
- **AUT-046** — la coda offline mantiene le modifiche degli altri e non resuscita i rimossi.
- **AUT-047** — ripetere un add non duplica il prodotto.
- **AUT-048** — la validità delle offerte include entrambi gli estremi e segue Roma.
- **AUT-049** — fonti esterne o protocolli eseguibili sono rifiutati.
- **AUT-050** — si possono scegliere anche le offerte future senza confonderle con quelle valide oggi.
- **AUT-051** — uno sconto senza prezzo non diventa un prodotto a zero euro.
- **AUT-054** — la stima conta tutte le unità, distingue acquistati e prezzi mancanti senza errori sui centesimi.
- **AUT-053** — la selezione distingue pagina 1 e 10, edizioni e prezzi diversi.

### database.test.mjs

Sorgente: [database.test.mjs](../tests/database.test.mjs). Esecuzione: `node --test tests/database.test.mjs`.

- **AUT-054** — Script SQL: migrazioni, permessi, isolamento, inviti e versioni.

### group-shopping.test.mjs

Sorgente: [group-shopping.test.mjs](../tests/group-shopping.test.mjs). Esecuzione: `node --test tests/group-shopping.test.mjs`.

- **AUT-055** — i riferimenti accettano solo liste valide della stessa applicazione.
- **AUT-056** — due membri scoprono più liste e condividono modifiche; una risposta persa non duplica la lista.

### organizer.test.mjs

Sorgente: [organizer.test.mjs](../tests/organizer.test.mjs). Esecuzione: `node --test tests/organizer.test.mjs`.

- **AUT-057** — periodi e arretrati rispettano settimane e mesi, mantenendo visibili i non programmati.
- **AUT-058** — ricorrenze attraversano fine anno, mesi corti e anno bisestile.
- **AUT-059** — denaro e quote vengono calcolati in centesimi senza perdere arrotondamenti.
- **AUT-060** — rimborsi estinguono i saldi senza duplicare le spese.
- **AUT-061** — validazione e calendario non accettano titoli vuoti o quote incoerenti.

### shopping-database.test.mjs

Sorgente: [shopping-database.test.mjs](../tests/shopping-database.test.mjs). Esecuzione: `node --test tests/shopping-database.test.mjs`.

- **AUT-062** — Script SQL: chiusura, scontrini, foto, conflitti e blocco modifiche.

### shopping-history.test.mjs

Sorgente: [shopping-history.test.mjs](../tests/shopping-history.test.mjs). Esecuzione: `node --test tests/shopping-history.test.mjs`.

- **AUT-063** — lo scontrino usa i centesimi, distingue totale reale e stima e conserva i non acquistati.
- **AUT-064** — statistiche per mese e andamento passano fra anni e non includono liste aperte.
- **AUT-065** — foto storiche conservate e contenuti remoti non sicuri rifiutati.

### Catalogo Python

Sorgente: [test_offers.py](../tests/test_offers.py). Esecuzione: `python -m unittest discover -s tests -p 'test_*.py'`.

- **PY-01** — `test_exact_store_card`.
- **PY-02** — `test_pages_are_deduplicated_and_contiguous`.
- **PY-03** — `test_detail_without_stores_requires_exact_listing_confirmation`.
- **PY-04** — `test_csv_validation_and_atomic_failure`.
- **PY-05** — `test_review_does_not_allow_missing_or_invalid_pages`.
- **PY-06** — `test_discount_without_invented_price`.
- **PY-07** — `test_same_edition_preserves_transcription_and_local_snapshot`.

## Copertura rispetto ai 1.000 requisiti

Questa mappa indica le aree interessate, **non** certifica tutti gli ID nell'intervallo. Molti requisiti sono proposte future: richiedono implementazione e nuovi test prima di poter essere accettati.

| Area e intervallo | Evidenza esistente | Verifica aggiuntiva necessaria |
| --- | --- | --- |
| Accesso e sessioni FUN-001–040 | auth.test.mjs | Provider reali, sessioni remote, gestione avanzata account |
| Locale e ospiti FUN-041–060 | auth.test.mjs; database.test.mjs | Flusso browser e trasferimenti futuri |
| Gruppi, ruoli e inviti FUN-061–120 | database.test.mjs | UI completa e funzioni gruppo non ancora sviluppate |
| Home e profilo FUN-121–160 | organizer.test.mjs per i periodi | Navigazione, responsive, preferenze e parti future |
| Attività, ricorrenze e agenda FUN-161–220 | organizer.test.mjs; database.test.mjs | Editor browser, privacy UI, ricorrenze avanzate |
| Pagamenti e rimborsi FUN-221–260 | organizer.test.mjs | Inserimento browser, ripartizioni future e leggibilità |
| Liste, prodotti e offerte FUN-261–320 | app, core, group-shopping e catalog test | Due browser e account remoti; modifica prodotto futura |
| Visualizzatore FUN-321–340 | app.test.mjs; catalog.test.mjs | Zoom reale, immagini, PDF e dispositivi touch |
| Storico FUN-341–360 | shopping-history e shopping-database test | RPC remota attiva e riepiloghi browser |
| Backup FUN-361–380 | backup.test.mjs | Conferme UI, download, annullamento e memoria piena |
| Promemoria e integrazioni FUN-381–400 | Copertura automatica dedicata incompleta | Collaudo dei promemoria; nuove integrazioni da realizzare |
| UX-001–300 | Alcuni comportamenti in app.test.mjs | Rendering, screenshot, tastiera, screen reader e prove d'uso |
| ROB-001–060 | database, auth, core e group-shopping test | Politiche remote e gestione avanzata identità |
| ROB-061–120 | app, core, database e group-shopping test | Nuovi casi concorrenti e riconnessioni prolungate |
| ROB-121–160 | app, auth e auth-cache test | Multi-scheda, aggiornamento PWA e dispositivi reali |
| ROB-161–200 | backup, core, catalog, organizer e Python | Fuzzing e limiti aggiuntivi secondo i moduli sviluppati |
| ROB-201–240 | Test SQL e auth; controlli build | Recupero database, rete reale e dipendenze esterne |
| ROB-241–300 | Limiti puntuali nei test e pipeline Pages | Misure prestazionali, visual CI, operatività e privacy |

## Matrice browser e dati di prova

| Configurazione | Scopo | Stato di esecuzione richiesto |
| --- | --- | --- |
| Chromium desktop 1440×1000 | Layout ampio, mouse e tastiera | Ogni release candidata |
| Chromium mobile emulato 390×844 | Layout stretto e touch simulato | Ogni release candidata |
| Larghezze 320, 360 e 430 pixel CSS | Overflow e nomi lunghi | Ogni modifica CSS o markup |
| Tablet 768×1024 e orientamento inverso | Griglie e dialoghi | Ogni modifica responsive |
| Firefox desktop | Compatibilità fuori Chromium | Prima del rilascio pubblico |
| Safari/WebKit su iPhone | PWA, safe area, tastiera e zoom | Prima del rilascio pubblico; emulazione non sufficiente |
| Chrome su Android fisico | Installazione, Indietro, pinch e offline | Prima del rilascio pubblico |
| Zoom pagina 200% e testo ingrandito | Accessibilità e reflow | Ogni modifica di layout |
| Movimento ridotto attivo | Animazioni senza dipendenza dal movimento | Ogni modifica di animazioni |

Preparare due account membri A e B, un account C estraneo, un proprietario, un amministratore, due gruppi distinti, un invito di sola lettura, uno di collaborazione e uno revocato. Preparare almeno tre liste per gruppo, una lista chiusa, una coda offline e uno scontrino con foto storica. Per i confini usare dati con nomi lunghi, HTML come testo, prezzi mancanti, date a fine mese e anno bisestile.

Le date del catalogo vanno congelate nelle fixture per distinguere offerte in corso, future e scadute. Le prove manuali sul sito devono dichiarare la data usata; non considerare la naturale scadenza di un'offerta una regressione. Specificare se il backend è PGlite, Supabase di test o Supabase operativo. Usare dati tecnici eliminabili senza toccare le liste personali.

## Flussi browser contro le regressioni

Questi casi sono da eseguire manualmente o da portare in una futura suite E2E versionata. Non sono già job CI. Per ogni caso annotare commit, ambiente e prova dell'esito.

| ID | Passaggi essenziali | Risultato atteso |
| --- | --- | --- |
| E2E-01 | Aprire senza sessione e scegliere modalità locale | Home locale utilizzabile; nessun utente remoto creato |
| E2E-02 | Entrare direttamente con `?screen=settings` e scegliere locale | Pulsante ripristino visibile nelle Impostazioni |
| E2E-03 | Creare gruppo e attività, ricaricare | Nome e attività conservati nello spazio corretto |
| E2E-04 | Completare un'attività ricorrente | Occorrenza successiva corretta e non duplicata |
| E2E-05 | Aggiungere un appuntamento privato con account A; aprire con B | B non riceve né mostra l'appuntamento privato |
| E2E-06 | Registrare spesa, quote e rimborso | Centesimi, pagatore e residui coerenti |
| E2E-07 | A crea lista nel gruppo; B attende un ciclo visibile | B scopre la nuova lista entro il ciclo e il tempo della richiesta |
| E2E-08 | A aggiunge prodotto; B rilegge la lista | B vede prodotto e quantità corretti |
| E2E-09 | B spunta prodotto; A rilegge | A vede la spunta senza cambiare lista |
| E2E-10 | Creare tre liste e passare tra loro | Prodotti indipendenti e selezione coerente |
| E2E-11 | Aprire Nuova lista durante un polling | Form e nome digitato restano disponibili |
| E2E-12 | Rinominare lista con A e aggiornare B | Nome condiviso aggiornato nel selettore e nel titolo |
| E2E-13 | Interrompere la risposta dopo pubblicazione del riferimento lista | Retry senza una seconda lista o riferimento |
| E2E-14 | Modificare offline una lista, aprirne un'altra e tornare online | Coda della prima inviata senza alterare la selezione |
| E2E-15 | A e B modificano prodotti distinti prima della lettura successiva | Nessuna delle modifiche accettate viene persa |
| E2E-16 | Chiudere la spesa mentre B modifica lo stato atteso | Conflitto segnalato; niente chiusura silenziosa incoerente |
| E2E-17 | Confermare chiusura valida e ritentare la richiesta | Un solo scontrino e primo importo confermato conservato |
| E2E-18 | Scrivere su una lista già chiusa | Server rifiuta; UI in sola lettura e dati locali recuperabili |
| E2E-19 | Aprire vecchia lista tramite link e condividerla col gruppo | Compare ai membri senza duplicare i prodotti |
| E2E-20 | Ricaricare Home e Spesa offline dopo installazione worker | Shell corretta e dati autorizzati già presenti consultabili |
| E2E-21 | Passare a una nuova build con coda pendente | Worker aggiornato senza perdita della coda o ciclo di reload |
| E2E-22 | Esportare backup, annullare import, poi confermarlo | Annullamento non modifica dati; conferma ripristina quelli previsti |
| E2E-23 | Importare JSON malformato o backup troppo grande | Errore comprensibile; archivio precedente intatto |
| E2E-24 | Cambiare account mentre viene letto il file di backup | Ripristino interrotto e nessun dato scritto nel nuovo account |
| E2E-25 | Simulare memoria piena durante il ripristino | Dati precedenti conservati; nessun falso successo |
| E2E-26 | Logout con modifiche pendenti e nuovo accesso allo stesso account | Avviso e recupero della sola coda di quell'account |
| E2E-27 | Passare tra account A e C, anche in due schede | Nessun dato del vecchio account applicato al nuovo |
| E2E-28 | Aprire invito valido, scaduto e revocato | Permessi rispettati, errori distinti, nessuna enumerazione |
| E2E-29 | Fare login Google reale con destinazione invito | Ritorno al percorso Pages e risorsa originale |
| E2E-30 | Annullare OAuth e tornare all'accesso ospite | Codice rimosso e invito ancora disponibile |

Gli scenari SMS richiedono provider di test e limiti di costo espliciti. Non inviare SMS reali per eseguire la normale suite. L'attivazione di provider, notifiche o migrazioni non è parte automatica di questo piano.

## Collaudo grafico e UX

Le seguenti verifiche sono checklist manuali o candidati per una futura automazione visiva. Nessuna casella è già accettata per tutte le configurazioni della matrice.

- [ ] **VIS-01 — Login:** Marchio, spiegazione, provider attivo e provider disabilitato leggibili a 320 e 390 pixel.
- [ ] **VIS-02 — Home:** Quattro card leggibili, ordine coerente, contatori e titoli senza sovrapposizioni.
- [ ] **VIS-03 — Navigazione:** Stato attivo riconoscibile e ultimo contenuto non coperto dalla barra flottante.
- [ ] **VIS-04 — Gruppi:** Nome molto lungo e selettore non producono overflow orizzontale.
- [ ] **VIS-05 — Liste:** Tre liste con nomi lunghi restano selezionabili accanto al gruppo e a Nuova lista.
- [ ] **VIS-06 — Lista vuota:** Stato vuoto utile e nessuna falsa lista vuota durante caricamento.
- [ ] **VIS-07 — Prodotti:** Nomi lunghi, foto mancanti, prezzi elevati e quantità 99 non si sovrappongono.
- [ ] **VIS-08 — Riordino:** Spunta immediata; card intera si sposta senza dissolvenza, scala o salto del testo.
- [ ] **VIS-09 — Carrello:** Totale, acquistati e prezzi mancanti distinguibili e leggibili.
- [ ] **VIS-10 — Offerte:** Card con prezzo normale, percentuale, Fidelity, data futura e scaduta riconoscibili.
- [ ] **VIS-11 — Ricerca:** Nessun risultato distinto da errore di rete e da filtro ancora in caricamento.
- [ ] **VIS-12 — Volantino:** Pagina intera non tagliata in modo irreversibile; numero pagina e chiusura raggiungibili.
- [ ] **VIS-13 — Ritagli:** Foto nelle card e nello storico mantengono proporzioni e prodotto corretto.
- [ ] **VIS-14 — Dialoghi:** Dialogo lungo scorre entro lo schermo; conferma e annullamento accessibili.
- [ ] **VIS-15 — Tastiera mobile:** Campi quantità e importo usano tastiera adeguata e non nascondono Invio.
- [ ] **VIS-16 — Errori:** Errore vicino al campo, dati conservati, pulsanti non spostati in modo imprevedibile.
- [ ] **VIS-17 — Sincronizzazione:** Confronto prima/durante/dopo polling: nessuna riga di stato o salto del contenuto.
- [ ] **VIS-18 — Agenda:** Data, ora, responsabile e riservatezza leggibili senza sovrapposizioni.
- [ ] **VIS-19 — Spese:** Quote e importi grandi leggibili; crediti e debiti distinti oltre al colore.
- [ ] **VIS-20 — Storico:** Mese, totale, media e sei mesi del grafico coerenti con i dati tecnici preparati.
- [ ] **VIS-21 — Backup:** Descrizione sostituzione e mancato ripristino dello storico comprensibili prima della conferma.
- [ ] **VIS-22 — Orientamento:** Rotazione durante form, dialogo e volantino conserva input e azioni raggiungibili.
- [ ] **VIS-23 — Zoom:** Zoom pagina 200% e testo ingrandito senza comandi essenziali tagliati.
- [ ] **VIS-24 — Movimento ridotto:** Acquisto e riordino restano comprensibili senza dipendere dall’animazione.
- [ ] **VIS-25 — Contrasto:** Misurare testo e controlli sui reali colori di sfondo; registrare valori e strumenti.
- [ ] **VIS-26 — Tastiera:** Percorrere login, Home, editor e Spesa usando solo Tab, Invio, Spazio ed Escape.
- [ ] **VIS-27 — Focus:** Apertura, chiusura dialogo e rimozione prodotto mantengono un focus utile e visibile.
- [ ] **VIS-28 — Screen reader:** Nomi, stati spunta, campi, errori e valori grafico annunciati correttamente.
- [ ] **VIS-29 — Touch:** Tap, trascinamento, pressione lunga, pinch e annullamento non producono selezioni accidentali.
- [ ] **VIS-30 — PWA fisica:** Installazione, safe area, tastiera e ritorno da background provati su Android e iPhone.

### Come introdurre confronti screenshot affidabili

1. Versionare una suite browser nel repository e dichiararne dipendenze e comando, separato dai test unitari.
2. Usare browser e font fissati, viewport dichiarato, dati tecnici deterministici, data/orologio controllati e backend di test.
3. Preparare baseline per login, Home, moduli, lista vuota/piena, carrello, catalogo, pagina volantino, chiusura, storico e Impostazioni.
4. Per ciascuna schermata coprire almeno 390 pixel e desktop; aggiungere 320 pixel per i layout più densi.
5. Attendere stabilizzazione dei dati e caricamento font/immagini. Per screenshot statici fermare animazioni; testare separatamente il movimento con asserzioni di comportamento e geometria.
6. Mascherare solo dati realmente variabili e non importanti per il requisito. Non mascherare errori, overflow, pulsanti o prezzi per far passare una baseline.
7. Confrontare anche geometria, elementi visibili e overflow: una somiglianza pixel non prova correttezza funzionale o accessibilità.
8. Salvare immagine attesa, immagine effettiva, differenza, trace e console quando il test fallisce. Concordare una soglia prima di accettare il test.
9. Approvare una baseline nuova con revisione umana; non aggiornarla automaticamente al fallimento.
10. Aggiungere il job browser a CI soltanto dopo che la suite è ripetibile su ambiente pulito. Documentare esplicitamente se il job è bloccante.

Questo documento non introduce tale automazione: la descrive come lavoro ancora da svolgere. Nessun confronto pixel o audit accessibilità è dichiarato superato soltanto perché passa `npm test`.

## Criteri per accettare una release

| Controllo | Evidenza da conservare |
| --- | --- |
| Suite automatica | Commit, comandi, conteggi, esito e collegamento workflow |
| Build | Artefatto generato, versione footer e build ID |
| Sincronizzazione critica | Due contesti indipendenti, dati tecnici, almeno due liste, aggiunta/spunta e recupero offline |
| Database remoto | Presenza RPC e migrazioni, account di test e autorizzazioni verificate; non dedurre tutto da risposte anonime |
| UI | Configurazioni matrice eseguite, screenshot e difetti osservati |
| UX e accessibilità | Percorsi da tastiera, focus, lettore di schermo e osservazioni d'uso |
| PWA | Reload offline e aggiornamento con dati pendenti senza perdita |
| Difetti | Elenco dei problemi aperti con impatto e decisione esplicita |

Una perdita dati, accesso a un gruppo estraneo, modifica non autorizzata, impossibilità di salvare o regressione dei flussi principali impedisce l'accettazione. Non considerare accettata un'area non eseguita: indicare **non verificata**, ambiente mancante e rischio concreto. La normale pipeline attuale blocca il deploy solo per i controlli automatici che contiene; i criteri manuali richiedono un verbale di rilascio separato.

Per ogni difetto conservare: ID test, requisito coinvolto, commit/build, browser/dispositivo, modalità locale/condivisa, backend, precondizioni, passi, atteso, osservato, frequenza, impatto ed evidenza senza dati privati. Dopo la correzione rieseguire il caso fallito e la suite pertinente; ampliare le verifiche soltanto se la modifica coinvolge altre aree.

## Modello di verbale

```text
Release / commit / build:
Data e verificatore:
Backend e provider usati:
Comandi automatici e risultati:
Browser, dispositivi e viewport effettivamente provati:
ID E2E e VIS eseguiti, con esito:
ID FUN / UX / ROB accettati, con evidenza:
Test non eseguiti e motivazione:
Difetti aperti e gravità:
Workflow e indirizzo effettivamente verificato:
Esito: accettata / da correggere / verifica incompleta.
```

Il documento va aggiornato insieme a test e workflow. Non cambiare una casella nel catalogo requisiti sulla sola base della descrizione di una funzione o di un vecchio collaudo riferito a un'altra build.
