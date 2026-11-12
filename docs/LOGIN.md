# Attivare Google, Facebook, telefono e ospite

Il codice implementa OAuth PKCE per Google/Facebook, OTP via SMS e i due accessi senza account. I provider esterni non sono ancora configurati nel progetto: i pulsanti rimangono disabilitati finché Supabase non li dichiara attivi. Nessun segreto va inserito nel repository.

## URL da copiare

| Impostazione | Valore |
| --- | --- |
| Sito pubblico / Supabase Site URL | `https://emanuensi000.github.io/spesa-insieme/` |
| Supabase Redirect URLs | `https://emanuensi000.github.io/spesa-insieme/` |
| Callback Google e Facebook | `https://ydmwbftnaksqiwbljtlg.supabase.co/auth/v1/callback` |
| Origine JavaScript Google | `https://emanuensi000.github.io` |

Per lo sviluppo aggiungere negli URL di ritorno Supabase anche `http://127.0.0.1:4173/`, `http://localhost:4173/` oppure l'URL HTTPS esatto della porta inoltrata dal Codespace, con `/` finale. Il codice torna alla root dell'app rispettando il percorso `/spesa-insieme/`; non richiede una route server `/callback` su GitHub Pages.

## 1. Supabase

Aprire il [progetto](https://supabase.com/dashboard/project/ydmwbftnaksqiwbljtlg). In **Authentication → URL Configuration** salvare Site URL e Redirect URLs sopra indicati. La migrazione `001_organaizer.sql` deve essere già applicata: il login può funzionare anche quando le RPC dei gruppi non sono ancora disponibili, ma in quel caso l'app segnala che lo spazio condiviso va attivato e permette di riprovare senza rifare il login.

## 2. Google

1. Aprire [Google Auth Platform](https://console.cloud.google.com/auth/overview), selezionare/creare un progetto e configurare nome dell'app, pubblico autorizzato e schermata di consenso.
2. Creare un client OAuth di tipo **Web application**.
3. Inserire l'origine JavaScript e il callback Google della tabella.
4. Nel pannello Supabase, **Authentication → Sign In / Providers → Google**, attivare Google e inserire Client ID e Client Secret. Salvare i segreti solo nel pannello.
5. Durante il collaudo autorizzare gli account di test previsti dalla configurazione Google. Per l'accesso pubblico completare i requisiti di pubblicazione richiesti da Google.

## 3. Facebook

1. Aprire [Meta for Developers](https://developers.facebook.com/apps/) e configurare un'app che supporti Facebook Login per il web.
2. Nelle impostazioni OAuth di Facebook Login aggiungere come **Valid OAuth Redirect URI** il callback della tabella.
3. Nel pannello Supabase attivare Facebook e inserire App ID e App Secret. Non inserirli nel frontend o in chat.
4. Provare con un utente autorizzato come tester/developer dell'app Meta. Per gli altri utenti rendere l'app disponibile al pubblico completando gli adempimenti richiesti da Meta.

## 4. Telefono e SMS

1. In Supabase, **Authentication → Sign In / Providers → Phone**, scegliere e configurare un provider SMS supportato, per esempio Twilio, con le relative credenziali e mittente.
2. Prima dell'uso reale configurare paesi consentiti, limiti di invio e le misure antiabuso previste dal servizio. Gli SMS possono avere un costo.
3. Attivare Phone e salvare. Per i test usare i numeri/codici di test previsti da Supabase e dal provider; non inserirli nel codice pubblico.
4. L'utente inserisce il prefisso internazionale, per esempio `+39`. Spazi, parentesi e trattini vengono rimossi; `0039` diventa `+39`. Il paese non viene indovinato.
5. L'app conserva il numero dell'ultimo invio riuscito, attende almeno 60 secondi prima del reinvio anche dopo reload e rispetta i rate limit restituiti dal server. Codici errati/scaduti non producono sessioni.

## 5. Ospite

- **Continua senza account:** apre uno spazio locale. Nessuna registrazione Supabase e nessun dato locale viene caricato automaticamente in un account.
- **Continua come ospite:** compare su un invito riconoscibile. L'accesso viene verificato dal server; l'ospite vede solo la risorsa condivisa e può completarla solo se il link lo consente. Un link scaduto/revocato viene rifiutato.
- Un invito a entrare nel gruppo richiede un account Google, Facebook o telefono. Non assegna automaticamente l'intero gruppo a chi arriva come ospite.
- Non occorre attivare Anonymous Sign-Ins di Supabase: l'ospite su invito usa le RPC limitate e la modalità locale non crea utenti anonimi nel database.

## Sessioni, callback e logout

- Sessione e verifier PKCE sono salvati nel browser per resistere alla chiusura della scheda e al ritorno OAuth in una nuova scheda dello stesso browser. Usare un altro browser o un altro profilo interrompe il collegamento al verifier.
- Il codice OAuth viene scambiato una sola volta e rimosso subito dall'indirizzo. Le URL di callback non vengono conservate dal service worker.
- Il ritorno mantiene invito e destinazione Profilo/Impostazioni. Sono accettate solo destinazioni interne riconosciute, non URL esterni.
- Il refresh delle sessioni è serializzato, con Web Locks fra schede nei browser che li supportano. Un refresh tardivo dopo il logout non ricrea l'accesso.
- Cambiando account si caricano soltanto i dati associati a quell'identità. Un logout/cambio account in un'altra scheda nasconde subito lo spazio corrente e richiede di ricaricare.
- Il logout locale riesce anche senza rete. Quando è raggiungibile, Supabase riceve la richiesta di chiudere la sessione di questo dispositivo; le altre sessioni non vengono terminate intenzionalmente.

## Verifica dopo la configurazione

Premere **Ricontrolla i metodi di accesso** nell'app e provare: Google, Facebook, SMS corretto/errato/scaduto, chiusura e riapertura del browser, logout, link ospite valido/revocato e ritorno all'invito dopo ciascun login.

I test automatizzati verificano i flussi contro risposte Auth simulate, più le autorizzazioni guest reali nello schema PostgreSQL incorporato. Non sostituiscono il collaudo con le credenziali dei provider: finché queste non sono inserite, Google/Facebook/SMS non sono stati verificati end-to-end sui servizi esterni.

Fonti: [Google](https://supabase.com/docs/guides/auth/social-sign-in/auth-google), [Facebook](https://supabase.com/docs/guides/auth/social-sign-in/auth-facebook), [telefono](https://supabase.com/docs/guides/auth/phone-login), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [logout](https://supabase.com/docs/guides/auth/signout).
