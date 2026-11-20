# OrganAIzer — cronologia delle versioni

## 0.3.2 — 20 novembre 2026

- Liste della spesa: menu a tendina sostituito da pulsanti a pillola scorrevoli orizzontalmente, con lista attiva evidenziata, frecce da tastiera e selezione persistente.
- Ripristino backup: anteprima dei gruppi attuali e in arrivo, conteggi e conferma esplicita; annullamento senza sostituire dati, protezione dai cambi sessione e rollback su errore mantenuti.
- Preferenze: nuovo comando per tornare ai valori predefiniti.
- Corretto il salvataggio del gruppo attivo alla prima apertura locale e reso visibile l'avviso dei prodotti senza prezzo nella stima.
- Rafforzati i controlli comuni per titoli, date reali di calendario, quote e rimborsi.
- 102 ulteriori requisiti originari accettati con prove, più FUN-401 aggiunto su richiesta. La maggioranza era già implementata: il verbale distingue le nuove modifiche dal collaudo dell'esistente.
- 150 casi JavaScript totali, di cui 85 casi dedicati ai requisiti e 54 esecuzioni browser desktop/mobile. Nessun nuovo servizio esterno o migrazione del database.

## 0.3.1 — 20 novembre 2026

- Collegamento «Vai al contenuto principale» su entrambe le pagine e regioni principali nominate.
- Titolo specifico per la Spesa, intestazione principale e nomi accessibili per tutti i dialoghi.
- Focus visibile condiviso, margine di scorrimento per la barra fissa e controlli touch secondari da almeno 44 px.
- Preferenza di movimento ridotto applicata anche alle animazioni CSS e agli pseudo-elementi.
- Suite Playwright portabile: 12 esecuzioni desktop/mobile, con controlli prima del deploy e tracce/screenshot conservati in caso di errore.
- Accettazione di 12 requisiti documentata in `docs/ACCETTAZIONE_0.3.1.md`; copertura parziale degli altri flussi esplicitata.

## 0.3.0 — 16 novembre 2026

- Ripristino di backup JSON **solo per la modalità locale**, con controllo di formato, dimensioni, gruppi, identificativi, elementi e limiti; conferma obbligatoria prima di sostituire i dati.
- Esportazione locale ora identificata da formato, versione dello schema e data di esportazione; continua a includere la vista dello storico delle spese, ma **il ripristino NON reimporta lo storico degli scontrini**.
- Service worker: cache limitata alle risorse statiche allowlist; URL di invito, parametri OAuth, navigazioni personalizzate e risposte dinamiche non vengono salvati nella cache. Navigazione offline sulla shell locale.
- Test automatici per backup, rifiuto dati malevoli e normalizzazione dei dati locali.
- Aggiornamento versionamento coerente con la build e istruzioni di pubblicazione e limiti operativi.
- Integrazione revisionata: controlli di versione, proprietà pericolose, date e quote nei backup; ripristino interrotto in caso di cambio account; cache statica coerente per build, esclusione di risposte autenticate, private, no-store e redirect.
- Conservate integralmente sincronizzazione silenziosa a 30 secondi, più liste per gruppo e recupero delle code offline della 0.2.2.

## 0.2.2 — base ricevuta

- Gestione gruppi, accesso, attività, turni, appuntamenti, pagamenti condivisi, modulo Spesa, riepiloghi, offline e sincronizzazione Supabase predisposte.
- Il funzionamento remoto dipende dalle migrazioni e dai provider Supabase attivati; vedere README e documenti di attivazione.
