# Accettazione requisiti — 0.3.1

Data: 20 novembre 2026. Commit: quello che introduce questo verbale, identificabile con `git log -- docs/ACCETTAZIONE_0.3.1.md`. Ambiente locale: Node 24.22.2, Python 3.14.2, Chromium Playwright 1.65.1; desktop e Pixel 7 emulato. La CI ripete le prove su Node 22 e Python 3.12 prima di pubblicare.

## Requisiti accettati

| ID | Evidenza ed esito |
| --- | --- |
| UX-245, UX-246 | Regola condivisa `:focus-visible` su pulsanti, link, input, select, textarea e tabindex. Test browser «focus visibile»: indicatore presente con modalità tastiera. Superato desktop/mobile. |
| UX-261, UX-262 | Test «salto al contenuto, lingua, titolo e nomi dialoghi» sulle due pagine: lingua italiana e titoli riconoscibili, Spesa distinta dalla home. Superato. |
| UX-266, UX-267 | Test «lista locale, quantità, stato acquistato e persistenza»: spunta con nome prodotto e `aria-pressed=true`, anche dopo ricarica. Funzione già presente, ora collaudata nel browser. Superato. |
| UX-276 | Le due pagine espongono un main nominato; il link iniziale raggiungibile con Tab porta il focus al contenuto. Superato. |
| UX-289 | Regola CSS reduce su elementi e pseudo-elementi; test con preferenza reduce attiva e durata transizione ridotta. Il riordino JavaScript già controlla matchMedia prima di animare. Superato. |
| UX-297 | Entrambe le meta viewport non limitano lo zoom (verifica sorgenti). Superato; nessuna attestazione di compatibilità su telefono fisico. |
| ROB-275, ROB-276 | Sei scenari Playwright versionati, dodici esecuzioni riuscite. Workflow Pages esegue test:e2e prima della build finale e del deploy. |
| ROB-278 | Playwright configurato con trace retain-on-failure e screenshot only-on-failure; artefatti prodotti durante la prima esecuzione fallita e upload CI configurato per sette giorni. Gli artefatti locali sono esclusi da Git. |

## Altre verifiche e limiti

- Editor: focus iniziale nel dialogo, nessun controllo sullo sfondo raggiunto con Tab, Escape chiude e restituisce il focus; apertura sia con Invio sia con Spazio. Prova riuscita, ma UX-247 e UX-250–253 restano non accettati globalmente: non tutti i dialoghi e pulsanti sono stati percorsi.
- Tutti i dialoghi statici collegati alla rispettiva intestazione con aria-labelledby. Il visualizzatore dinamico richiede collaudo specifico prima di accettare UX-275.
- Nome accessibile esplicito per il pulsante Aggiungi, la cui scritta è nascosta su mobile. Controllo Chiudi almeno 44×44 nel test mobile; UX-265 e UX-281 restano aperti per gli altri controlli.
- Creazione attività locale e persistenza dopo reload; creazione lista, aggiunta Latte, quantità 2 e spunta acquistato dopo reload: superati.
- Suite JavaScript: tutti gli 11 file di test superati nel runner locale. Suite Python: 7/7. Build produzione: superata.
- Non collaudati provider reali, database remoto, notifiche push, dispositivi fisici, Safari/Firefox o conformità completa di accessibilità. Nessuna migrazione o modifica dei dati di produzione.

## Ripetizione

`npm test`, `python -m unittest discover -s tests -p 'test_*.py'`, `npm run test:e2e`, `npm run build`.

Il test browser avvia il server di sviluppo e genera la build; la build finale della pipeline rigenera la configurazione pubblica con le variabili di produzione. Le richieste a config.js sono simulate solo nei contesti browser di test.
