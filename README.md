# OrganAIzer

OrganAIzer è una PWA in italiano pensata per organizzare impegni, attività e spese di famiglie e gruppi. La nuova visione e la roadmap sono in [REQUISITI.md](REQUISITI.md).

**Stato implementato:** nuova schermata di accesso, home a quattro card, barra flottante Home / Profilo / Impostazioni, modalità locale, attività ricorrenti, agenda, spese con quote/rimborsi e collegamento alla Spesa. Il backend additivo e i flussi di login sono nel repository; la disponibilità condivisa richiede l’applicazione della migrazione e l’abilitazione dei provider nel progetto Supabase. Vedere [funzioni e attivazione](docs/IMPLEMENTAZIONE.md) per stato e limiti.

Il modulo Spesa conserva catalogo delle offerte Ipertriscount del gruppo **Casal Bertone - Fonte Nuova - Guidonia**, volantino e condivisione storica tramite link privato. L'edizione corrente non comprende Viterbo, come indicato nella fonte ufficiale. I requisiti della base esistente sono in [docs/REQUISITI_SPESA.md](docs/REQUISITI_SPESA.md).

Frontend statico senza dipendenze runtime, pubblicabile su GitHub Pages. Database Supabase con funzioni PostgreSQL. Volantino scaricato e trascritto visivamente, senza API a pagamento.

## Stato della prima versione

- Lista: creazione, quantità modificabili con +/− o numero da 1 a 99, spunta, rimozione e condivisione del link. Le unità uguali sono raggruppate; prezzo unitario e subtotale restano visibili. Le modifiche di un gruppo si salvano insieme nella coda offline, usando le operazioni già supportate dal database.
- Sincronizzazione: ogni 30 secondi quando la pagina è visibile, con operazioni idempotenti e coda offline. Gli aggiornamenti avvengono senza messaggi di stato nell'intestazione.
- PWA: manifest, icone PNG, service worker e installazione Android/iOS.
- Volantino: **Al costo!**, edizione 20001, 20 immagini ufficiali in `public/flyers/20001-20261112/`, con provenienza e checksum. Validità verificata sulla copertina: **13–23 novembre 2026**. Il PDF offline è assemblato localmente dalle immagini originali senza ricompressione: il download PDF ufficiale ha restituito una pagina HTML di verifica.
- Catalogo: **577 offerte trascritte** dalle 20 pagine. Le varianti della stessa offerta sono raggruppate; le ripetizioni in copertina e sul retro conservano la propria origine. Sono **569 offerte valide dal 13 novembre**, più quattro offerte del solo 23 novembre ripetute in copertina e a pagina 20 (otto voci).
- Filtri per testo, reparto, pagina e validità. Il pulsante «Sfoglia il volantino» apre il visualizzatore: scorrimento laterale, frecce e scelta della pagina. Un tap sul prodotto lo aggiunge alla lista; un secondo tap lo rimuove, comprese tutte le quantità. La selezione è condivisa tra pagina, catalogo e lista.
- Immagini delle 577 offerte ritagliate dalle pagine originali mediante la mappa `data/flyer-regions-20001.json`, collegata agli ID delle offerte e rigenerata da `compile_catalog.py`. Alcune offerte condividono uno spazio nel volantino: le relative aree sono suddivise; i nomi precisi restano disponibili nell’elenco sotto la pagina.
- Stima della spesa: somma in centesimi di tutte le unità con prezzo, con separazione fra da acquistare e già nel carrello. Gli articoli senza prezzo sono segnalati ed esclusi. Per le offerte al kg o per 100 g la quantità rappresenta rispettivamente kg o etti interi; la stima non applica sconti condizionati e non garantisce la validità attuale del prezzo.
- Distinzione fra offerte in corso, future e scadute. Le offerte Iper Day del **solo lunedì 23 novembre** indicano Fidelity Card, limiti di pezzi ove presenti e condizioni di cumulabilità. I prodotti già nelle liste conservano prezzo, scadenza e foto dell'edizione precedente.
- Supabase configurato nel file pubblico `config.public.json` e verificato con chiamate reali. Il file contiene solo URL e chiave pubblica, mai credenziali amministrative.
- Shell, catalogo, immagini e PDF sono disponibili offline dopo il primo caricamento completo del service worker, incluse le foto storiche.

## Chiudere una spesa e consultare lo storico

Spuntare i prodotti acquistati e scegliere **Ho finito · Chiudi la spesa**. Confermare data e totale dello scontrino, precompilato con la stima dei soli prodotti spuntati. La lista diventa consultabile senza modifiche; **Crea una nuova lista** avvia la spesa successiva. I prodotti non acquistati restano nel dettaglio, esclusi dalla stima. Le quantità, i prezzi annotati e le foto sono conservati nello scontrino archiviato.

In **Profilo** la dashboard mostra totale speso, numero di spese, media, andamento di sei mesi e storico filtrabile per mese. Ogni spesa ha un dettaglio consultabile; l'esportazione JSON nelle Impostazioni comprende lo storico visibile. Le liste chiuse sono contate una sola volta per ID.

La modalità locale funziona anche offline. La sincronizzazione della chiusura fra dispositivi richiede la migrazione [002_shopping_history.sql](supabase/migrations/002_shopping_history.sql), aggiuntiva rispetto al database Spesa esistente: blocca anche le modifiche dei vecchi client e verifica che la lista non sia cambiata prima di chiuderla. Il database remoto non è stato modificato da questo aggiornamento; finché la migrazione non viene applicata, le chiusure condivise restano salvate sul dispositivo con indicazione “da sincronizzare”. Vedere [attivazione dello storico](docs/IMPLEMENTAZIONE.md#attivazione-dello-storico-spesa).

## Avvio locale

Richiede Node.js 22 o successivo. Eseguire prima `npm ci` per installare la dipendenza di test PostgreSQL (nessuna dipendenza runtime nel frontend). Python 3.11+ serve solo per i volantini e non richiede pacchetti aggiuntivi.

```powershell
npm.cmd run dev
```

Aprire `http://127.0.0.1:4173`. Per produrre i file statici:

```powershell
npm.cmd run build
```

L'output è in `dist/`. Il sito funziona anche sotto il percorso di un repository, ad esempio `https://utente.github.io/organaizer/`.

Il footer della home e del modulo Spesa mostra la versione di `package.json` e l’identificativo della build, generati durante la compilazione e disponibili anche offline. Per incrementare la versione prima di una pubblicazione usare `npm version patch --no-git-tag-version` (oppure `minor`/`major` per gli aggiornamenti corrispondenti). L’identificativo della build cambia automaticamente quando cambiano i contenuti dell’app.

## Collegare Supabase

Per attivare Google, Facebook e telefono e capire la modalità ospite seguire [docs/LOGIN.md](docs/LOGIN.md): contiene gli URL esatti per Google/Meta e Supabase. Il codice è pronto; i provider richiedono le credenziali configurate nei rispettivi pannelli.

Il progetto Supabase dell'utente è già configurato in `config.public.json`; lo schema è presente e le operazioni sono state verificate. Le istruzioni seguenti servono per collegare un altro progetto.

1. Creare un progetto Supabase e aspettare che sia pronto.
2. Nel **SQL Editor** eseguire interamente [supabase/schema.sql](supabase/schema.sql), poi [002_shopping_history.sql](supabase/migrations/002_shopping_history.sql) per la chiusura condivisa delle liste.
3. Dalle impostazioni API del progetto recuperare l'URL HTTPS e la **publishable key** (oppure la vecchia chiave `anon`).
4. Copiare `config.example.json` in `config.local.json` e inserire i due valori:

```json
{
  "supabaseUrl": "https://IDENTIFICATIVO.supabase.co",
  "supabasePublishableKey": "sb_publishable_..."
}
```

5. Riavviare `npm.cmd run dev`, creare una nuova lista e condividerne il link. Le liste create in modalità locale restano locali; non vengono caricate automaticamente. Ordine delle configurazioni: variabili di ambiente → `config.local.json` ignorato da Git → `config.public.json` tracciato nel repository.

La chiave pubblica viene inclusa nella build. **Non inserire mai service_role, sb_secret, password database o token personali.** La build rifiuta chiavi amministrative riconoscibili. Per il modulo Spesa storico non servono utenti registrati: il possesso del link è l’autorizzazione. I nuovi gruppi OrganAIzer usano invece Supabase Auth e le RPC della migrazione `supabase/migrations/001_organaizer.sql`.

## GitHub e pubblicazione

Il nome del pacchetto è `organaizer`. Il repository remoto e il percorso GitHub Pages esistenti restano quelli configurati: gli URL seguenti sono esempi per un repository nuovo o rinominato. La rinomina remota richiede un passaggio separato e un piano per i link già condivisi.

```powershell
git remote add origin https://github.com/TUO-UTENTE/organaizer.git
git push -u origin main
```

Nel repository GitHub:

1. In **Settings → Pages → Build and deployment**, scegliere **GitHub Actions**.
2. Il progetto usa già la configurazione pubblica tracciata. Per sostituirla senza modificare file, in **Settings → Secrets and variables → Actions → Variables**, aggiungere `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` con i valori pubblici del nuovo progetto.
3. Eseguire **Actions → Verifica e pubblica PWA → Run workflow**, oppure fare push su `main`.

Il workflow esegue i test, genera le icone, costruisce il sito e lo pubblica su Pages. Nessun segreto amministrativo viene usato dal workflow. Se non è presente alcuna configurazione, la build rimane una versione locale senza condivisione.

GitHub Pages ospita la PWA; Supabase conserva la lista. Il repository e i file del catalogo sono distinti dai dati privati delle liste. Consultare i piani dei servizi per limiti e disponibilità: il progetto non attiva acquisti o servizi a pagamento.

## Importare le offerte senza API a pagamento

### Catalogo già pronto

La trascrizione verificata è in [data/catalogo-20001.txt](data/catalogo-20001.txt), con CSV corrispondente in [data/catalogo-20001.csv](data/catalogo-20001.csv). Per ricompilare l'edizione corrente, rigenerare i ritagli, il PDF e i checksum:

```powershell
python scripts/compile_catalog.py
```

Il comando seleziona il compilatore dell'edizione corrente e rifiuta edizioni sconosciute: non applica la trascrizione a nuovi volantini. L'edizione 20001 usa `compile_catalog_20001.py`, i metadati verificati in `data/flyer-20001.json` e le aree in `scripts/flyer_regions_20001.py`. Richiede soltanto Python standard. La precedente edizione 946 non compare nel catalogo e il vecchio PDF resta rimosso. Le immagini sono conservate per le foto dei prodotti nelle liste e nello storico, incluse nella cache offline e indicizzate separatamente in `public/data/archived-offers.json`, con checksum delle fonti.

Il modello CSV supporta anche una colonna finale facoltativa `discount_percent`: quando il volantino indica solo una percentuale si lascia il prezzo vuoto. Non si inventa un prezzo di 0 €.

### 1. Individuare il volantino corretto

```powershell
python scripts/offers.py discover
```

Il comando legge `https://www.ipertriscount.it/volantini`, seleziona la card con l'etichetta esatta del gruppo, verifica il dettaglio e recupera le pagine. La nuova pagina dettaglio non ripete le sedi: la conferma proviene dalla card esatta che collega quell'URL. Non seleziona singole parole e non ripiega su altri negozi. Se la struttura cambia o il risultato è ambiguo interrompe l'operazione e conserva il catalogo precedente.

Se cambia l'edizione (URL o immagini), il catalogo trascritto e il conteggio delle pagine revisionate vengono azzerati per evitare associazioni sbagliate. I soli parametri di cache delle immagini non fanno cambiare l'edizione.

### 2. Trascrivere i prodotti

Copiare [data/offers.template.csv](data/offers.template.csv) in un nuovo CSV UTF-8 con separatore virgola. Una riga per ciascuna offerta; i campi contenenti virgole vanno tra doppi apici. Con LibreOffice/Excel impostare esplicitamente il separatore virgola in esportazione.

| Colonna | Contenuto |
| --- | --- |
| `flyer_url` | URL esatto presente in `public/data/offers.json`, campo `flyers[0].url` |
| `store_group` | `Casal Bertone - Fonte Nuova - Guidonia` |
| `page` | Pagina originale, da 1 al totale |
| `name` | Nome del prodotto, obbligatorio |
| `brand`, `size` | Marca e formato, se indicati |
| `price` | Prezzo numerico, es. `1.99` oppure `"1,99"` |
| `unit_price` | Testo facoltativo, es. `3,98 €/kg` |
| `category` | Reparto, obbligatorio |
| `valid_from`, `valid_until` | Date ISO `YYYY-MM-DD` verificate sul volantino |
| `conditions` | Limiti di pezzi, carta fedeltà, giorni specifici e altre condizioni |

### 3. Validare e importare

```powershell
python scripts/offers.py import data/offers.csv
```

L'importazione **sostituisce** tutti i prodotti dell'edizione corrente. Date, prezzi, gruppo, URL, duplicati e pagine sono controllati prima della scrittura atomica. Per confermare di aver controllato tutte le 20 pagine:

```powershell
python scripts/offers.py import data/offers.csv --reviewed-pages 1-20
```

Il flag è una dichiarazione di revisione umana, non un riconoscimento automatico di completezza. Pagine prive di prodotti vanno comunque controllate. L'app mostra solo le offerte valide alla data corrente di **Europe/Rome**; i prodotti già aggiunti alla lista restano con il prezzo annotato e la scadenza, anche dopo la fine dell'offerta. Il prezzo nella lista è un riferimento alla promozione, non una garanzia del prezzo attuale.

### 4. Pubblicare il catalogo

Fare commit e push di `public/data/offers.json` per aggiornare il sito.

Il workflow **Controlla nuovo volantino** controlla la fonte ogni giorno alle 06:25 UTC e salva il risultato come artifact da scaricare. Non trascrive i prodotti e non modifica il sito automaticamente: il nuovo catalogo va revisionato, importato e pubblicato. GitHub può ritardare i job pianificati.

## Dati e accesso

- Il link contiene UUID della lista e token casuale da 256 bit nel frammento `#`: il token non viene inviato all'hosting o nei referrer. Viene trasmesso via HTTPS a Supabase nel corpo delle richieste.
- Sul database si conserva solo l'hash SHA-256 del token. Tabelle in schema privato, RLS abilitata e nessun accesso diretto ai ruoli del browser.
- Le sole tre funzioni esposte verificano il token. Non è disponibile un elenco pubblico delle liste.
- La creazione e le operazioni si possono ritentare senza duplicazioni. Le modifiche sono serializzate per lista; una rimozione conserva un tombstone e prevale sugli aggiornamenti ritardati.
- Sulla stessa spunta, l'ultima operazione ricevuta dal server prevale. Le modifiche offline vengono applicate quando la connessione torna: non c'è un ordinamento globale per orario del dispositivo.
- Il telefono conserva token, lista e coda in `localStorage`, necessari al funzionamento offline. Chi ha accesso al browser può accedere alla lista. Cancellare i dati del sito elimina anche le modifiche non sincronizzate.
- Ogni telefono può lavorare normalmente; sullo stesso browser usare una sola scheda per evitare scritture concorrenti della memoria locale.
- Il service worker memorizza shell, catalogo e copie locali di immagini/PDF, non le risposte Supabase. La prima installazione completa scarica il volantino corrente e le immagini storiche, circa 15 MB complessivi di risorse.
- Chi ha il link può modificare la lista. La prima versione non include revoca/rotazione del link, account, recupero accesso o protezioni contro abusi massivi della creazione di liste. È pensata per un piccolo gruppo fidato.
- Limite: 500 operazioni offline in attesa e 5.000 identificativi di prodotto per lista, compresi i rimossi; raggiunto il limite creare una nuova lista.

## Verifica

```powershell
npm.cmd test
python -m unittest discover -s tests -p 'test_*.py'
npm.cmd run build
```

I test coprono parsing del link, coda offline, idempotenza, eliminazioni, fuso orario, offerte future, sconti senza prezzo, selezione esatta della sede, pagine mancanti, validazione CSV, checksum delle copie scaricate e copertura delle pagine. Il collegamento al progetto Supabase reale è stato verificato; vedere [VERIFICA.md](VERIFICA.md).

Documentazione: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages/), [funzioni Supabase](https://supabase.com/docs/guides/database/functions), [volantini ufficiali](https://www.ipertriscount.it/volantini).

## Rinomina OrganAIzer

Nome visibile, manifest, pacchetto, condivisione e cache usano OrganAIzer. L’identità relativa `id`, `scope` e `start_url` della PWA resta stabile. Al primo avvio sullo stesso dominio e percorso, le liste precedenti vengono copiate nella nuova chiave locale senza eliminare la copia originaria; una chiave nuova già presente ha precedenza. La vecchia chiave resta solo per compatibilità. Cambiare dominio o percorso richiederà una migrazione dedicata: il browser non trasferisce automaticamente memoria locale, installazione e service worker. Lo schema privato del modulo Spesa resta invariato perché identifica il modulo e contiene dati già in uso.
