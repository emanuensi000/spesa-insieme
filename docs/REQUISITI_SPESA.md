# OrganAIzer — requisiti del modulo Spesa esistente

Requisiti ricavati dalla documentazione e dalle funzionalità presenti nel progetto. Definiscono il perimetro della prima versione.

## 1. Obiettivo

- App in italiano per gestire una lista della spesa condivisa.
- Offerte Ipertriscount esclusivamente del gruppo Casal Bertone – Fonte Nuova – Guidonia. Dall'edizione 20001 del 13–23 novembre 2026 la fonte ufficiale non include Viterbo, presente nell'edizione precedente.
- Aggiunta di prodotti manualmente, dal catalogo e dalle pagine del volantino.
- Stima della spesa, uso offline e installazione su smartphone come PWA.

## 2. Creazione e condivisione

- Creare una lista con nome di massimo 80 caratteri.
- Generare un link privato che consenta lettura e modifica a chi lo possiede.
- Copiare il link e condividerlo tramite le funzionalità del dispositivo, quando disponibili.
- Non richiedere registrazione, email o password.
- Conservare sul dispositivo i dati per riaprire la lista.
- In assenza di configurazione Supabase, dichiarare la modalità locale e disabilitare la condivisione.
- Non trasferire automaticamente online le liste create in modalità locale.

## 3. Prodotti nella lista

- Aggiunta manuale con nome e quantità; nome di massimo 160 caratteri.
- Spunta di acquisto reversibile, separazione tra prodotti da acquistare e già nel carrello, conteggio dei rimanenti.
- Rimozione di un prodotto e rimozione collettiva degli acquistati.
- Raggruppamento delle unità equivalenti dello stesso prodotto.
- Quantità modificabili con +/− o numero intero da 1 a 99.
- Visualizzazione di immagine, prezzo unitario, subtotale e informazioni dell’offerta, quando disponibili.
- Salvataggio congiunto nella coda locale delle modifiche di un gruppo; nessun salvataggio parziale in caso di errore.

## 4. Catalogo

- Usare solo il volantino del gruppo previsto.
- Per ogni offerta conservare nome, marca e formato se presenti, immagine, prezzo se indicato, prezzo per unità di misura, reparto, pagina, date, condizioni, carta fedeltà, limiti e percentuale di sconto quando presente.
- Ricerca testuale e filtri per reparto, pagina e validità.
- Distinguere offerte in corso, future e scadute usando la data Europe/Rome.
- Vista iniziale con offerte in corso e in arrivo; opzione per vedere anche le scadute.
- Caricamento progressivo tramite “Mostra altri prodotti”.
- Aggiunta e rimozione delle offerte dalla lista.
- Selezione coerente tra catalogo, volantino e lista.
- Conservare nella lista prezzo annotato e scadenza anche dopo la fine dell’offerta.
- Mostrare separatamente le iniziative promozionali generali.
- Contenuto iniziale: edizione 4–12 novembre 2026, 20 pagine e 577 voci di offerta. Le edizioni successive possono avere dimensioni diverse.
- Edizione corrente: Al costo!, 13–23 novembre 2026, 20 pagine e 577 voci; otto voci riguardano le quattro offerte Iper Day del solo 23 novembre ripetute in copertina e sul retro. Sorgenti, prezzi e ritagli sono specifici dell'edizione; gli articoli già salvati nelle liste conservano il prezzo annotato.

## 5. Volantino interattivo

- Apertura e visualizzazione leggibile delle pagine originali.
- Navigazione tramite scorrimento laterale, frecce e selezione diretta della pagina.
- Indicazione di pagina corrente e totale.
- Ingrandimento con due dita sui dispositivi compatibili.
- Collegamento di ogni offerta a un’area della pagina originale.
- Tap per aggiungere; secondo tap per rimuovere tutte le quantità del prodotto.
- Evidenziazione dei prodotti selezionati.
- Elenco dei prodotti sotto la pagina per facilitare la selezione delle aree ravvicinate o condivise.
- Accesso al PDF scaricato e alla fonte ufficiale.
- Mappa persistente dei ritagli e delle aree interattive associata agli ID delle offerte.

## 6. Stima della spesa

- Sommare i prodotti con prezzo noto, considerando le quantità e calcolando in centesimi.
- Mostrare totale complessivo, importo da acquistare e importo già nel carrello.
- La spunta sposta l’importo tra le sezioni senza cambiare il totale complessivo.
- Escludere e segnalare i prodotti senza prezzo.
- Non rappresentare come 0 € uno sconto percentuale senza prezzo.
- Non applicare automaticamente sconti condizionati, buoni o promozioni generali.
- Dichiarare che il totale è una stima e che il prezzo promozionale potrebbe essere scaduto.
- Nella prima versione, quantità intere anche per offerte al kg o per 100 g: rispettivamente kg ed etti interi.

## 7. Sincronizzazione e offline

- Conservare localmente lista, token e operazioni in attesa.
- Applicare subito le modifiche nell’interfaccia.
- Sincronizzare ogni 30 secondi quando la pagina è visibile e inviare le modifiche al ritorno della connessione.
- Recuperare la coda dopo chiusura o ricaricamento.
- Operazioni idempotenti per evitare duplicazioni nei tentativi ripetuti.
- Serializzare le modifiche sul server per lista.
- Conservare le eliminazioni affinché aggiornamenti ritardati non ripristinino i prodotti rimossi.
- Per spunte concorrenti prevale l’ultima operazione ricevuta dal server.
- Limiti: 500 operazioni offline in attesa e 5.000 identificativi di prodotto per lista, compresi i rimossi.
- Interfaccia, catalogo, immagini e PDF disponibili offline dopo il primo caricamento completo.
- Informare che cancellare i dati del browser elimina anche le modifiche non sincronizzate.

## 8. Interfaccia e accessibilità

- Testi in italiano e interfaccia pensata per smartphone, adattabile a schermi più grandi.
- Nessuno scorrimento orizzontale indesiderato.
- Sezioni “La lista” e “Offerte Ipertriscount”.
- Stati vuoti, errori e conferme comprensibili.
- Intestazione senza messaggi ricorrenti di sincronizzazione.
- Etichette accessibili per campi, pulsanti e navigazione.
- Aggiornamenti importanti percepibili dalle tecnologie assistive.
- Aiuto su condivisione, offline, installazione e verifica delle offerte.

## 9. PWA e aggiornamenti

- Manifest, icone e service worker.
- Installazione Android e aggiunta alla schermata Home su iPhone.
- Pulsante di installazione quando supportato.
- Rilevamento e proposta di aggiornamento dell’app.
- Cache delle risorse per uso offline, escludendo le risposte private di Supabase.

## 10. Sicurezza

- HTTPS.
- UUID della lista e token casuale da 256 bit.
- Token nel frammento # del link per evitare l’invio all’hosting nelle normali richieste.
- Trasmissione del token a Supabase nel corpo delle richieste.
- Conservazione del solo hash SHA-256 del token nel database.
- Verifica del token per creazione, lettura e modifica.
- Tabelle in schema privato con RLS abilitata e nessun accesso diretto dai ruoli del browser.
- Nessun elenco pubblico delle liste.
- Solo URL Supabase e chiave pubblica nel frontend; rifiuto in build delle chiavi amministrative riconoscibili.
- Dati inseriti mostrati come testo, senza esecuzione HTML.
- Avviso chiaro: chi possiede il link può modificare la lista.

## 11. Acquisizione e aggiornamento volantini

- Recupero dalla fonte ufficiale senza API a pagamento.
- Selezione tramite corrispondenza esatta del gruppo.
- In caso di ambiguità o cambio della struttura, interrompere l’aggiornamento conservando il catalogo precedente.
- Rilevare il cambio di edizione senza confonderlo con parametri di cache delle immagini.
- Azzerare trascrizione e revisione al cambio di edizione.
- Scaricare PDF e immagini registrando provenienza e checksum SHA-256.
- Trascrizione manuale con eventuale supporto OCR locale.
- Importazione CSV UTF-8 e validazione di gruppo, URL, nome, reparto, prezzi, sconti, date, pagine e duplicati.
- Sostituzione atomica del catalogo dell’edizione.
- Registrazione delle pagine revisionate da una persona, comprese quelle senza prodotti.
- Controllo periodico dei nuovi volantini.
- Pubblicazione dei prodotti dopo trascrizione, verifica e importazione.

## 12. Architettura e pubblicazione

- Frontend statico HTML, CSS e JavaScript senza dipendenze runtime.
- Supabase/PostgreSQL per le liste condivise.
- Tre funzioni pubbliche del database: creazione lista, lettura lista e applicazione operazione.
- Hosting compatibile con GitHub Pages anche sotto il percorso del repository.
- Configurazione tramite variabili di ambiente o file dedicati.
- Node.js 22+ per sviluppo e build; Python 3.11+ per gli strumenti dei volantini.
- Comandi per avvio locale, test e build.
- Pipeline di pubblicazione con test, generazione icone e produzione del sito statico.

## 13. Criteri di verifica

- Stessa lista aperta da due dispositivi o contesti indipendenti.
- Propagazione di aggiunte, spunte e rimozioni.
- Modifiche e ricaricamento offline con sincronizzazione successiva.
- Nessuna duplicazione dopo tentativi ripetuti.
- Rifiuto del token errato.
- Correttezza di quantità, raggruppamento e totali.
- Selezione coerente tra lista, catalogo e volantino.
- Filtri temporali e gestione offerte future e scadute.
- Sconti senza prezzo gestiti correttamente.
- Corrispondenza di offerte, pagine e ritagli originali.
- Immagini e PDF consultabili offline.
- Funzionamento sotto il percorso GitHub Pages.
- Nessuna esecuzione HTML dai dati inseriti.
- Nessun errore JavaScript o problema di impaginazione mobile.
- Prova di installazione, zoom e aggiornamento su Android e iPhone fisici.

## 14. Limiti della prima versione

- Nessun account personale o recupero accesso.
- Nessun ruolo distinto di proprietario, lettore e collaboratore.
- Nessuna revoca o rotazione del link.
- Nessuna protezione specifica contro la creazione massiva di liste.
- Uso di una sola scheda per browser per evitare scritture concorrenti nella memoria locale.
- Nessuna quantità frazionaria per prodotti a peso.
- Nessuna applicazione automatica degli sconti condizionati.
- Nessuna trascrizione o pubblicazione automatica dei nuovi volantini.
- Destinazione: piccolo gruppo fidato con lista condivisa tramite link privato e revisione umana dei volantini.
