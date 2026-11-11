# Verifica della prima versione

Eseguita l'11 novembre 2026, prima del collegamento a un account Supabase o GitHub.

## Controlli ripetibili nel progetto

- `npm.cmd test`: 5 test passati.
- `python -m unittest discover -s tests -p 'test_*.py'`: 4 test passati.
- `npm.cmd run build`: riuscito senza configurazione, in modalità locale.
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

Questo controllo non sostituisce la verifica di rete e permessi sul progetto Supabase reale.

## Browser

Chromium con Playwright, due contesti indipendenti da 390 × 844 pixel, frontend reale e endpoint di test che esegue le funzioni SQL reali su PGlite. Il database remoto Supabase non è stato simulato con risposte fisse: le operazioni hanno eseguito lo schema del progetto.

Scenari completati:

1. Creazione di una lista e apertura del link nel secondo contesto.
2. Aggiunta dal primo e ricezione nel secondo.
3. Spunta dal secondo e ricezione nel primo.
4. Aggiunta offline, ricaricamento offline grazie al service worker, recupero della coda e successiva ricezione nel secondo contesto al ritorno online.
5. Hosting sotto il percorso `/spesa-insieme/`, come su GitHub Pages.
6. Nessuno scorrimento orizzontale a 390 pixel.
7. Visualizzazione dei 20 collegamenti alle pagine e avviso di catalogo prodotti non ancora trascritto.
8. Configurazione assente: modalità locale dichiarata, condivisione disabilitata.
9. Nome prodotto contenente HTML: mostrato come testo, senza esecuzione.
10. Nessun errore JavaScript durante gli scenari.

## Da verificare dopo il collegamento

- Applicazione dello schema sul progetto Supabase dell'utente.
- Una lista reale condivisa tra due telefoni.
- Pubblicazione effettiva e URL GitHub Pages.
- Installazione su iPhone e Android fisici.
- Trascrizione e controllo di tutti i prodotti: il catalogo è attualmente vuoto.
- Validità, prezzi e condizioni di ciascuna offerta sul volantino originale.
