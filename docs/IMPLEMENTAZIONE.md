# OrganAIzer — implementazione e attivazione

## Funzionalità sviluppate

- Prima schermata di accesso con disponibilità effettiva dei provider Supabase, OAuth Google/Facebook con PKCE e telefono con codice SMS. Non si possono usare provider disabilitati.
- Modalità locale dichiarata, senza account, con salvataggio nel browser e più spazi/gruppi locali.
- Home responsiva a quattro card, filtri giorno/settimana/mese e navigazione del periodo.
- **Barra inferiore flottante Home / Profilo / Impostazioni**, con rispetto della safe area del telefono.
- Attività con responsabile, priorità, note/checklist, ricerca, stato e ricorrenze. Il completamento crea la prossima occorrenza.
- Agenda con date, orari, luoghi, appuntamenti riservati al loro autore e file calendario ICS per eventi di giornata intera. L’orario salvato resta visibile nell’app; l’esportazione attuale è di giornata intera.
- Spese con categorie, quote uguali in centesimi, pagatore, saldo dei rimborsi e registrazione di rimborsi completi per quota.
- Liste della spesa collegate al modulo preesistente, mantenendo volantino e offerte. I link precedenti restano validi e il primo accesso da un vecchio link propone l’ingresso ospite.
- Chiusura della lista dopo l’acquisto, totale dello scontrino modificabile, data e archivio immutabile con quantità, prezzi e foto. Nel Profilo: storico per mese, totale, numero di spese, media e andamento degli ultimi sei mesi. Le immagini delle edizioni precedenti restano disponibili come riferimenti fotografici, senza riproporre offerte scadute nel catalogo corrente.
- Spazi per pasti, scuola, animali, viaggi, manutenzione e progetti tramite attività dedicate.
- Promemoria interni, esportazione JSON, preferenze e installazione PWA.
- Backend SQL additivo: gruppi, appartenenze, ruoli, risorse versionate, audit, inviti a scadenza, accesso ospite limitato e revoca.
- Sincronizzazione con polling, coda per modifiche non riservate e controlli server sui conflitti. Dati locali separati per account; appuntamenti riservati esclusi dalla cache offline.
- Requisiti e migrazione SQL inclusi nell’artefatto pubblicato, accessibili dalle Impostazioni.

## Stato dei servizi verificato il 12 novembre 2026

I flussi di login sono stati aggiornati: sessioni persistenti, refresh serializzato, gestione callback/annullamento, ritorno all'invito, OTP con reinvio e cambio numero, separazione dei dati fra account. La guida passo passo con gli URL del progetto è in [LOGIN.md](LOGIN.md).

Nel progetto Supabase configurato, Google, Facebook e telefono sono **disabilitati**. Il frontend non può abilitarli con una chiave pubblica. La nuova migrazione deve essere applicata da chi amministra il progetto. La modalità locale e la spesa preesistente restano utilizzabili anche prima dell’attivazione.

### Attivazione del database

1. Fare un backup del progetto e verificare la migrazione su un ambiente separato.
2. Nel SQL Editor del progetto eseguire [001_organaizer.sql](../supabase/migrations/001_organaizer.sql). La copia distribuita si trova accanto a questo documento come `001_organaizer.sql`.
3. La migrazione non elimina o rinomina tabelle e funzioni del modulo Spesa. Crea lo schema privato `organizer_private`, abilita RLS e concede solo le RPC necessarie.
4. Verificare con due account distinti: creazione gruppo, invito, completamento attività e rifiuto di letture in un altro gruppo. Provare anche una revoca e un conflitto di versione.

### Attivazione dello storico Spesa

La chiusura locale e la dashboard funzionano sul dispositivo, anche offline. La chiusura condivisa richiede [002_shopping_history.sql](../supabase/migrations/002_shopping_history.sql), da applicare nel SQL Editor del progetto che contiene già `spesa_private` e le funzioni di `supabase/schema.sql`. La migrazione è additiva e ripetibile; non elimina liste esistenti. La pubblicazione del frontend non esegue SQL sul database.

Il 13 novembre 2026 il controllo dell’endpoint remoto `close_shared_list` ha restituito `PGRST202`: la migrazione non risulta ancora applicata. In questa situazione la chiusura resta salvata sul dispositivo e indicata come da sincronizzare; sugli altri dispositivi la lista resta aperta fino all’attivazione e alla sincronizzazione. Quando il server segnala modifiche concorrenti, la chiusura viene annullata e va riconfermata sui prodotti aggiornati. La prima chiusura condivisa confermata è definitiva, anche per i client precedenti.

Lo storico nel Profilo include le liste del browser associate al contesto locale/account e le liste collegate agli spazi accessibili. Su un nuovo dispositivo una lista storica condivisa è disponibile attraverso il suo link o il collegamento già presente nello spazio; non esiste un elenco pubblico delle liste basate su token. Profili locali e account differenti hanno filtri separati. L’esportazione JSON include lo storico visibile.

Il totale è quello confermato dall’utente sullo scontrino; la stima conserva solo i prodotti spuntati con prezzo noto. I prodotti non acquistati restano nel dettaglio ed esclusi dalla stima. Non vengono create automaticamente bollette o spese nel modulo Casa e pagamenti.

### Attivazione del login

1. In Supabase, Authentication → URL Configuration: impostare l’URL pubblico effettivo della PWA e autorizzare gli URL di ritorno, anche per l’ambiente di sviluppo.
2. In Google e Meta creare/configurare le applicazioni OAuth con il callback Supabase indicato dal pannello; inserire ID e segreti **solo nel pannello Supabase**, mai nel repository.
3. Abilitare Google e Facebook in Authentication → Providers. Verificare pubblico autorizzato e stato delle app presso i rispettivi provider.
4. Per telefono configurare un provider SMS, paesi consentiti, limiti di invio e misure antiabuso prima di abilitare Phone. Gli SMS possono avere costi; nessun servizio a pagamento è attivato dal codice.
5. Ricaricare OrganAIzer: i pulsanti diventano disponibili quando il servizio dichiara attivo il provider.

Riferimenti ufficiali: [PKCE Supabase](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [telefono](https://supabase.com/docs/guides/auth/phone-login), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Limiti rispetto alla visione completa

Il documento REQUISITI.md resta la visione complessiva. Questa versione fornisce la base operativa, ma non completa le fasi avanzate:

- Nessun pagamento bancario automatico, scansione ricevute o importazione di documenti; nessun caricamento di allegati sanitari.
- Nessun push, email di promemoria o processo pianificato sul server: i promemoria sono consultabili nell’app.
- Nessuna AI o invio di dati a servizi AI. Nessun collegamento bidirezionale a calendari esterni.
- Nessuna turnazione automatica, commenti, menzioni, ricorrenze con eccezioni complesse o ripartizioni personalizzate per importo/percentuale.
- Profili e preferenze sono salvati sul dispositivo; il nome di appartenenza al gruppo viene impostato all’ingresso.
- Le ricorrenze mensili usano il giorno dell’occorrenza precedente e limitano ai giorni del mese disponibile (31 gennaio → 28 febbraio → 28 marzo).
- I conflitti remoti restano in coda e vengono segnalati: la risoluzione manuale avanzata è da implementare. Usare una scheda per account.
- La modalità locale non include appuntamenti riservati e non viene caricata automaticamente in un account.
- I link della Spesa mantengono il comportamento storico: danno modifica a chi li possiede e non ereditano ancora la revoca e i ruoli dei nuovi spazi. I nuovi inviti dei moduli OrganAIzer sono invece revocabili e limitati.
- Non sono ancora previsti eliminazione completa dell’account, archiviazione del gruppo e ripristino da interfaccia. L’esportazione JSON è disponibile.

## Pubblicazione

Il workflow GitHub Pages esegue test JavaScript, test Python e build. La build include codice, requisiti, questo documento e SQL di migrazione. Il deployment statico non applica migrazioni né configura provider di autenticazione: questi due passaggi vanno verificati separatamente.

Comandi: `npm test`, `python3 -m unittest discover -s tests -p 'test_*.py'`, `npm run build`.
