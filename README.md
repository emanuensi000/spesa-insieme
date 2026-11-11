# Spesa insieme

PWA in italiano per una lista della spesa condivisa tramite link privato, con catalogo delle offerte Ipertriscount esclusivamente del gruppo **Casal Bertone - Fonte Nuova - Guidonia - Viterbo**.

Frontend statico senza dipendenze runtime, pubblicabile su GitHub Pages. Database Supabase con funzioni PostgreSQL. Importazione offerte manuale da CSV, senza API a pagamento.

## Stato della prima versione

- Lista: creazione, quantità, spunta, rimozione e condivisione del link.
- Sincronizzazione: ogni 4 secondi quando la pagina è visibile, con operazioni idempotenti e coda offline.
- PWA: manifest, icone PNG, service worker e installazione Android/iOS.
- Volantino: scoperta del gruppo esatto e collegamenti a tutte le pagine originali. Acquisita un'edizione da 20 pagine l'11 novembre 2026; la validità va verificata sulla copertina.
- Catalogo: filtro per prodotto e reparto, date di validità, riferimento alla pagina originale e aggiunta alla lista.
- **Il catalogo prodotti non è ancora trascritto.** Le immagini del volantino non equivalgono a prodotti importati. Non vengono mostrati prezzi inventati o prodotti dimostrativi.
- Senza configurazione Supabase è disponibile soltanto la modalità locale; il pulsante di condivisione resta disabilitato.

## Avvio locale

Richiede Node.js 22 o successivo. Python 3.11+ serve solo per i volantini e non richiede pacchetti aggiuntivi.

```powershell
npm.cmd run dev
```

Aprire `http://127.0.0.1:4173`. Per produrre i file statici:

```powershell
npm.cmd run build
```

L'output è in `dist/`. Il sito funziona anche sotto il percorso di un repository, ad esempio `https://utente.github.io/spesa-insieme/`.

## Collegare Supabase

Accedere a Supabase con ChatGPT autentica l'utente sul servizio: non concede automaticamente a questa app o a Codex accesso al database.

1. Creare un progetto Supabase e aspettare che sia pronto.
2. Nel **SQL Editor** eseguire interamente [supabase/schema.sql](supabase/schema.sql).
3. Dalle impostazioni API del progetto recuperare l'URL HTTPS e la **publishable key** (oppure la vecchia chiave `anon`).
4. Copiare `config.example.json` in `config.local.json` e inserire i due valori:

```json
{
  "supabaseUrl": "https://IDENTIFICATIVO.supabase.co",
  "supabasePublishableKey": "sb_publishable_..."
}
```

5. Riavviare `npm.cmd run dev`, creare una nuova lista e condividerne il link. Le liste create in modalità locale restano locali; non vengono caricate automaticamente.

La chiave pubblica viene inclusa nella build. **Non inserire mai service_role, sb_secret, password database o token personali.** La build rifiuta chiavi amministrative riconoscibili. Non servono utenti registrati: il possesso del link è l'autorizzazione.

## GitHub e pubblicazione

Il repository locale è pronto per essere collegato a un repository GitHub vuoto.

```powershell
git remote add origin https://github.com/TUO-UTENTE/spesa-insieme.git
git push -u origin main
```

Nel repository GitHub:

1. In **Settings → Pages → Build and deployment**, scegliere **GitHub Actions**.
2. In **Settings → Secrets and variables → Actions → Variables**, aggiungere `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` con i valori pubblici del progetto.
3. Eseguire **Actions → Verifica e pubblica PWA → Run workflow**, oppure fare push su `main`.

Il workflow esegue i test, genera le icone, costruisce il sito e lo pubblica su Pages. Nessun segreto amministrativo viene usato dal workflow. Se mancano le due variabili, la build rimane una versione locale senza condivisione.

GitHub Pages ospita la PWA; Supabase conserva la lista. Il repository e i file del catalogo sono distinti dai dati privati delle liste. Consultare i piani dei servizi per limiti e disponibilità: il progetto non attiva acquisti o servizi a pagamento.

## Importare le offerte senza API a pagamento

### 1. Individuare il volantino corretto

```powershell
python scripts/offers.py discover
```

Il comando legge `https://www.ipertriscount.it/volantini`, seleziona la card con l'etichetta esatta del gruppo, verifica il dettaglio e recupera le pagine. Non seleziona singole parole come “Viterbo” e non ripiega su altri negozi. Se la struttura cambia o il risultato è ambiguo interrompe l'operazione e conserva il catalogo precedente.

Se cambia l'edizione (URL o immagini), il catalogo trascritto e il conteggio delle pagine revisionate vengono azzerati per evitare associazioni sbagliate. I soli parametri di cache delle immagini non fanno cambiare l'edizione.

### 2. Trascrivere i prodotti

Copiare [data/offers.template.csv](data/offers.template.csv) in un nuovo CSV UTF-8 con separatore virgola. Una riga per ciascuna offerta; i campi contenenti virgole vanno tra doppi apici. Con LibreOffice/Excel impostare esplicitamente il separatore virgola in esportazione.

| Colonna | Contenuto |
| --- | --- |
| `flyer_url` | URL esatto presente in `public/data/offers.json`, campo `flyers[0].url` |
| `store_group` | `Casal Bertone - Fonte Nuova - Guidonia - Viterbo` |
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
- Il service worker memorizza la shell e il catalogo, non le risposte Supabase. Le immagini esterne del volantino richiedono la connessione.
- Chi ha il link può modificare la lista. La prima versione non include revoca/rotazione del link, account, recupero accesso o protezioni contro abusi massivi della creazione di liste. È pensata per un piccolo gruppo fidato.
- Limite: 500 operazioni offline in attesa e 5.000 identificativi di prodotto per lista, compresi i rimossi; raggiunto il limite creare una nuova lista.

## Verifica

```powershell
npm.cmd test
python -m unittest discover -s tests -p 'test_*.py'
npm.cmd run build
```

I test coprono parsing del link, ricostruzione della coda offline, idempotenza degli inserimenti, eliminazioni, fuso orario, selezione esatta della sede, pagine mancanti, validazione CSV e conservazione del catalogo in caso d'errore. Il funzionamento sul progetto Supabase reale richiede la configurazione descritta sopra.

Documentazione: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages/), [funzioni Supabase](https://supabase.com/docs/guides/database/functions), [volantini ufficiali](https://www.ipertriscount.it/volantini).
