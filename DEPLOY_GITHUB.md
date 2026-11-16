# Pubblicare OrganAIzer da un repository GitHub

## Stato del progetto collegato — verifica del 16 novembre 2026

Il progetto Supabase pubblico già configurato risponde e dichiara Google attivo. Le funzioni `organizer_groups` e `organizer_snapshot` esistono e negano correttamente l'accesso senza una sessione; `read_shared_list` rifiuta un token non valido. Non sono state lette o modificate liste reali.

La funzione `close_shared_list` risulta invece assente dalla cache API (`PGRST202`). Per sincronizzare chiusure e storico, aprire **SQL Editor** nel progetto Supabase, incollare l'intero file `supabase/migrations/002_shopping_history.sql` e premere **Run**. La migrazione è additiva e verificata dai test anche quando applicata due volte. Non occorre ricreare il progetto, sostituire le chiavi o rieseguire lo schema base. Dopo l'applicazione, riaprire l'app per ritentare le chiusure pendenti.

Il deploy GitHub Pages non applica automaticamente SQL. Questa sessione non dispone di accesso amministrativo a Supabase; l'esecuzione della migrazione remota resta un passaggio manuale. I test SQL su database locale non attestano la configurazione dei ruoli con un account reale remoto.

## Prerequisiti

- GitHub repository, Node.js 22+ per lo sviluppo, Python 3.11+ per gli script del catalogo.
- Non includere `.env`, chiavi `service_role`, chiavi segrete, dati locali o token privati in Git.
- Per i gruppi realmente condivisi serve un progetto Supabase configurato. GitHub Pages ospita solo i file statici, **non** il database.

## Pubblicazione automatica

1. Carica i file di questa cartella **nella radice del repository**, inclusa `.github/workflows/pages.yml`. Non caricare l'archivio ZIP come singolo file.
2. Su GitHub, `Settings → Pages → Build and deployment → Source` scegli **GitHub Actions**.
3. Su GitHub, `Settings → Secrets and variables → Actions → Variables` imposta `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` se vuoi collegare un tuo progetto Supabase. **Solo chiave pubblica**. Se vuoi una demo esclusivamente locale, rimuovi i valori da `config.public.json` e non impostare variabili.
4. Su Supabase applica `supabase/schema.sql` e poi, se non già presenti, le migrazioni incrementali `supabase/migrations/001_organaizer.sql` e `002_shopping_history.sql` **secondo la storia delle migrazioni del tuo database**; non rieseguire alla cieca uno schema già esistente. Verifica RLS e policy nel progetto remoto.
5. Per login Google/Facebook/SMS: abilita i provider in Supabase e configura gli URL consentiti con l'indirizzo GitHub Pages definitivo (vedi `docs/LOGIN.md`). La chiave pubblica non abilita automaticamente i provider.
6. Fai push sul branch `main`. Il workflow esegue `npm ci`, test JavaScript, test Python, build e deploy.
7. Controlla `Actions` e apri l'URL Pages mostrato nel job `deploy`; prova anche da smartphone, con installazione PWA e modalità aereo.

## In locale

```bash
npm ci
npm test
python -m unittest discover -s tests -p 'test_*.py'
npm run build
npm run dev
```

L'app sarà su `http://127.0.0.1:4173`. La build pubblicabile è `dist/` (generata: non va committata).

## Limiti prima del lancio commerciale

- Senza Supabase configurato la modalità locale non sincronizza i dati tra dispositivi.
- Le integrazioni OAuth/SMS richiedono configurazione esterna e test end-to-end reali.
- Non sono stati eseguiti in questa consegna test end-to-end multi-dispositivo o un penetration test sul database remoto.
- Occorrono privacy policy, informativa cookie adeguata al deployment, procedure GDPR (cancellazione/esportazione e conservazione), monitoraggio errori e test accessibilità, prima di vendere il servizio.
- Il backup/ripristino della versione 0.3.0 copre gruppi e attività locali; lo storico della Spesa NON viene ripristinato, e i backup contenenti link condivisi vanno trattati come riservati.
