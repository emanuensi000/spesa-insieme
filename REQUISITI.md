# OrganAIzer — visione, requisiti e roadmap

Documento di prodotto del 12 novembre 2026. Raccoglie la visione completa; lo stato effettivo delle funzioni sviluppate, le dipendenze dai servizi e i limiti sono in [stato di implementazione](docs/IMPLEMENTAZIONE.md). Le proposte di prodotto sono una base modificabile.

## 1. Visione e destinatari

**OrganAIzer: un unico posto per organizzare la vita quotidiana insieme.**

Famiglie, coppie, coinquilini, caregiver e piccoli gruppi di amici o persone con interessi comuni devono poter condividere impegni, attività, necessità e spese, sapendo sempre cosa serve, quando e chi se ne occupa.

L’unità principale è il **gruppo**: ogni persona può appartenere a più gruppi, senza mescolarne dati e notifiche. Un’attività può essere personale, condivisa con il gruppo o accessibile solo a persone selezionate. La spesa al supermercato diventa il primo modulo dell’organizzatore.

### Stato attuale e perimetro di questa modifica

- Disponibile: modulo Spesa, link condivisi, catalogo e volantino, stima dei costi, sincronizzazione e coda offline.
- Sviluppati nella nuova base: login con verifica dei provider, home, barra flottante Home / Profilo / Impostazioni, modalità locale, attività, agenda, pagamenti e migrazione SQL con gruppi e autorizzazioni.
- Attivazione remota necessaria: migrazione del database e configurazione Google/Facebook/SMS. Funzionalità avanzate e differenze dal perimetro completo sono elencate nel documento di implementazione.
- I requisiti della base funzionante sono conservati in [docs/REQUISITI_SPESA.md](docs/REQUISITI_SPESA.md).

## 2. Accesso e primo utilizzo

| ID | Requisito | Verifica di accettazione |
| --- | --- | --- |
| ACC-01 | La prima schermata per chi non ha una sessione è il login con marchio OrganAIzer. | Un nuovo visitatore non vede dati privati. |
| ACC-02 | Accesso con Google e Facebook. | Successo, annullamento e errore ritornano a una schermata comprensibile; nessun accesso parziale. |
| ACC-03 | Accesso con numero di telefono e codice OTP. | Numero normalizzato, codice con scadenza, limiti ai tentativi e al reinvio; messaggi per codice errato o scaduto. |
| ACC-04 | Opzione “Continua come ospite” quando si apre un invito valido. | Il guest raggiunge soltanto l’attività concessa dal link, senza accedere al resto del gruppo. |
| ACC-05 | Chi ha già una sessione valida entra direttamente nel gruppo o nella destinazione del link. | Il ritorno al sito non impone il login a ogni visita. |
| ACC-06 | Conservare la destinazione dell’invito durante il login. | Dopo l’accesso si apre l’attività originale, non una home vuota. |
| ACC-07 | Conversione da ospite a membro registrato. | Le attività attribuite al guest vengono trasferite solo dopo verifica della sua sessione, senza duplicazioni. |
| ACC-08 | Collegare più metodi di accesso allo stesso account. | Collegamento dopo nuova autenticazione; non unire account soltanto perché hanno lo stesso nome o un’email dichiarata. |
| ACC-09 | Logout, recupero dell’accesso e gestione delle sessioni. | Uscendo non restano dati privati visibili nel dispositivo condiviso; le modifiche in attesa sono gestite prima dell’uscita. |

Primo accesso registrato: nome visualizzato → crea un gruppo oppure accetta un invito → home. Un nome e un’icona bastano per creare un gruppo; il telefono non è obbligatorio per chi usa un altro metodo. Il guest sceglie un nome visualizzato, chiaramente distinto da un’identità verificata.

L’accesso iniziale richiede connessione. Offline si possono riaprire solo contenuti già autorizzati e salvati sul dispositivo; nessuna nuova autenticazione o verifica di inviti. Non mostrare pulsanti di provider apparentemente funzionanti se il servizio non è configurato.

## 3. Gruppi, persone e permessi

| ID | Requisito |
| --- | --- |
| GRP-01 | Creazione, modifica, archiviazione di un gruppo e appartenenza a più gruppi con selettore sempre raggiungibile. |
| GRP-02 | Ruoli proprietario, amministratore, membro e ospite; modalità sola lettura per inviti e condivisioni. |
| GRP-03 | Il proprietario gestisce proprietà ed eliminazione; gli amministratori gestiscono membri e moduli; i membri collaborano secondo i permessi; il guest opera solo nel perimetro assegnato. |
| GRP-04 | Inviti revocabili e con scadenza, distinguendo “entra nel gruppo” da “collabora a questa attività”. |
| GRP-05 | Link con token casuale, permesso esplicito di lettura/modifica, scadenza facoltativa e revoca immediata sul server. |
| GRP-06 | Uscita e rimozione di un membro, trasferimento della proprietà e impedimento all’uscita dell’ultimo proprietario senza una scelta esplicita. |
| GRP-07 | Registro delle azioni essenziali: chi ha creato, modificato, completato o registrato un pagamento. |
| GRP-08 | Applicare i permessi sul server per ogni lettura e scrittura; nascondere un pulsante non è una protezione. |

Prova obbligatoria: un membro del gruppo A non legge il gruppo B alterando un ID; un guest di una lista non enumera altre liste, membri, spese o visite. Un invito scaduto o revocato non concede accesso e non accetta modifiche offline ritardate. La revoca non può cancellare copie già lette fuori dal controllo dell’app.

## 4. Home: quattro card principali

Interpretazione proposta della “griglia da 4 card”: **quattro aree principali in una griglia 2×2**, estesa allo spazio disponibile sotto intestazione e selettore del periodo. Non quattro colonne strette su telefono. Su schermi piccoli, con testo ingrandito o in orizzontale, sono ammessi scorrimento e disposizione a una colonna per mantenere leggibilità.

| Card | Informazione immediata | Apertura |
| --- | --- | --- |
| **Spesa** | Prodotti mancanti, lista attiva e stima disponibile. | Liste del supermercato, catalogo e volantino. |
| **Casa e pagamenti** | Prossima scadenza, importo da pagare nel periodo e rimborsi in sospeso. | Bollette, affitto, mutuo, abbonamenti, spese comuni. |
| **Attività e turni** | Da fare oggi, attività scadute e persona assegnata. | To do, pulizie, manutenzione, commissioni e turnazioni. |
| **Agenda e salute** | Prossimo appuntamento e impegni della giornata. | Calendario, visite, scuola, eventi e accompagnamenti. |

- HOME-01: selettore **Oggi / Settimana / Mese** e navigazione del periodo; il filtro si applica coerentemente a tutte le card.
- HOME-02: mostrare “Da programmare” per elementi senza data, senza perderli nei filtri temporali.
- HOME-03: ogni card è interamente attivabile, ha titolo, icona, riepilogo breve e un’azione esplicita; nessun dato sanitario riservato nel riepilogo.
- HOME-04: azione “Aggiungi” per creare rapidamente un’attività nel modulo corretto, con gruppo e visibilità chiari prima del salvataggio.
- HOME-05: stati vuoti utili (“Crea la prima lista”, “Nessuna scadenza”), caricamento, errori e stato offline comprensibili.
- HOME-06: mostrare elementi assegnati a me o a tutto il gruppo; distinguere scaduti, prossimi e completati anche senza affidarsi al colore.
- HOME-07: il guest arriva alla risorsa invitata, con indicazione dell’accesso limitato e possibilità di registrarsi; non alla home privata completa.
- HOME-09: barra di navigazione inferiore flottante con **Home, Profilo e Impostazioni**, selezione attiva accessibile e margine per la safe area del dispositivo.
- HOME-08: ordine e riepiloghi personalizzabili in seguito, mantenendo quattro card principali e un accesso agli altri spazi.

## 5. Modulo Spesa

- SPE-01: conservare lista condivisa, quantità, spunte, prezzi, catalogo, ritagli e volantino interattivo attuali.
- SPE-02: più liste per gruppo, negozio, occasione o data; modello riutilizzabile per la spesa abituale.
- SPE-03: prodotti manuali con note e quantità; responsabile della spesa e data prevista facoltativi.
- SPE-04: sincronizzazione tra dispositivi e uso offline senza duplicare gli acquisti.
- SPE-05: distinguere stima della lista e importo effettivamente pagato; il primo non genera automaticamente una spesa contabile.
- SPE-06: a fine spesa, azione esplicita “Registra spesa di casa” con totale reale, pagatore, data ed eventuale ricevuta. Ripetere il comando non deve duplicare la registrazione.
- SPE-07: cataloghi di altri negozi come estensione; nessuna promessa di copertura automatica universale. Validità e condizioni dei prezzi restano visibili.
- SPE-08: mantenere accessibili le liste e i link preesistenti durante la migrazione; acquisire una lista nel gruppo solo tramite verifica del token e scelta esplicita.

## 6. Modulo Casa e pagamenti

- CAS-01: categorie iniziali luce, gas, acqua, internet, affitto, mutuo, condominio, canoni, assicurazioni, abbonamenti e altre spese.
- CAS-02: importo, valuta, descrizione, scadenza, frequenza, pagatore e partecipanti; ricevuta facoltativa.
- CAS-03: ricorrenze mensili, bimestrali, trimestrali, annuali e personalizzate, con previsione delle prossime scadenze.
- CAS-04: stati previsto, da pagare, parzialmente pagato, pagato e annullato; arretrato derivato dalla scadenza.
- CAS-05: divisione in parti uguali, importi o percentuali; somma delle quote uguale al totale, con arrotondamenti deterministici in centesimi.
- CAS-06: distinguere debito verso il fornitore, anticipo di un membro e rimborso tra persone. Registrare un rimborso non aumenta nuovamente le spese del gruppo.
- CAS-07: riepilogo per mese, categoria e persona: previsto, effettivo, da pagare e saldo dei rimborsi; non sommare valute diverse senza una conversione esplicita.
- CAS-08: promemoria prima della scadenza; cambio di importo di una ricorrenza applicabile alla singola occorrenza o alle future.
- CAS-09: conferma e cronologia per correzione o annullamento di pagamenti; allegati leggibili solo dagli autorizzati.
- CAS-10: prima versione come registro condiviso: nessun addebito, bonifico o collegamento bancario automatico.

Esempio di accettazione: bolletta da 120 €, pagata da Anna e divisa con Luca al 50%. La spesa del gruppo è 120 € e Luca deve rimborsare 60 € ad Anna. Dopo il rimborso il saldo si azzera, mentre la spesa resta 120 €.

## 7. Modulo Attività e turni

- ATT-01: titolo, descrizione, checklist, scadenza, priorità, responsabili, partecipanti e allegati facoltativi.
- ATT-02: stati da fare, in corso, completata e annullata; completamento reversibile e cronologia delle modifiche.
- ATT-03: ricorrenze giornaliere, settimanali, mensili e personalizzate; completare un’occorrenza non completa tutte le successive.
- ATT-04: sottoliste e modelli: pulizie, bucato, raccolta differenziata, manutenzione, documenti, commissioni.
- ATT-05: turni a rotazione, sostituzione occasionale e riassegnazione; responsabilità visibile a tutti gli interessati.
- ATT-06: commenti contestuali e menzioni, senza richiedere una chat separata per capire cosa fare.
- ATT-07: filtri per persona, data, stato e categoria; le attività scadute non scompaiono al cambio di settimana.
- ATT-08: collegamenti fra attività, evento e spesa, senza creare tre copie indipendenti dello stesso impegno.

## 8. Modulo Agenda e salute

- AGE-01: calendario condiviso con viste giorno, settimana, mese ed elenco cronologico.
- AGE-02: eventi con titolo, data, ora o intera giornata, durata, luogo, partecipanti, note e promemoria.
- AGE-03: appuntamenti ricorrenti, eccezioni, annullamenti e modifiche alla singola occorrenza o alle future.
- AGE-04: visite mediche, controlli, appuntamenti scolastici, sport, compleanni, riunioni e accompagnamenti.
- AGE-05: per una visita indicare persona interessata, struttura, preparazione e accompagnatore solo se necessario e con visibilità selezionata.
- AGE-06: contenuti sanitari riservati per impostazione iniziale; nessun accesso automatico per tutti i membri, gli amministratori o gli ospiti. Eventuali condivisioni sono esplicite per risorsa e possono essere revocate.
- AGE-07: notifiche riservate con testo generico; nessuna diagnosi o dettaglio sensibile sulla schermata bloccata per impostazione iniziale.
- AGE-08: avviso di sovrapposizione per una persona assegnata a impegni concomitanti, senza bloccare eccezioni intenzionali.
- AGE-09: fuso orario del gruppo configurabile, predefinito Europe/Rome; eventi a orario e giorni interi conservano significati distinti.
- AGE-10: esportazione e integrazione con calendari esterni in una fase successiva. Nessuna diagnosi o consulenza medica automatica.

## 9. Spazi aggiuntivi proposti

Accessibili da “Altri spazi”, attivabili per gruppo senza sovraccaricare la home iniziale.

| Spazio | Esempi | Collegamenti |
| --- | --- | --- |
| Pasti e dispensa | Menu settimanale, ingredienti mancanti, scadenze alimentari. | Generazione proposta della lista Spesa, da confermare. |
| Scuola e figli | Materiale, colloqui, gite, iscrizioni, chi accompagna. | Agenda, Attività, Casa e pagamenti. |
| Animali | Cibo, passeggiate, veterinario, turni di cura. | Spesa, Attività, Agenda. |
| Viaggi ed eventi | Preparativi, prenotazioni, bagagli, cassa comune. | Tutti e quattro i moduli. |
| Documenti e manutenzione | Revisioni auto, scadenze documenti, garanzie, filtri ed elettrodomestici. | Agenda e Attività; allegati riservati. |
| Interessi e progetti | Orto condiviso, squadra sportiva, gruppo di studio, volontariato. | Checklist, appuntamenti e budget del progetto. |

## 10. Notifiche e collaborazione

- NOT-01: centro notifiche interno per assegnazioni, scadenze, inviti, commenti e pagamenti.
- NOT-02: notifiche push facoltative, richieste dopo un’azione esplicita e con una spiegazione della loro utilità.
- NOT-03: preferenze per gruppo, modulo e canale; orari silenziosi e riepilogo giornaliero/settimanale configurabili.
- NOT-04: evitare notifiche duplicate e non avvisare l’autore per ogni propria modifica; gestire invii ritentati con identificativi stabili.
- NOT-05: promemoria generati dal server anche ad app chiusa; se push non disponibile o rifiutato resta il centro notifiche interno.
- NOT-06: eliminazione o modifica dell’evento aggiorna i promemoria pendenti. La consegna push non è garantita dal solo fatto di aver pianificato un avviso.

## 11. AI: evoluzione proposta

Il nome OrganAIzer può ospitare un assistente utile, ma i primi moduli devono funzionare anche senza AI.

- AI-01: trasformare “Ogni lunedì porta fuori la carta, a turno con Marco” in una bozza strutturata con assegnazione e ricorrenza.
- AI-02: riepilogo “Cosa dobbiamo fare questa settimana?” basato solo sulle risorse che la persona può leggere.
- AI-03: proposta di attività, menu e liste; estrazione di importo e scadenza da una bolletta in una fase successiva.
- AI-04: mostrare fonte, dati interpretati e ambiguità; chiedere conferma prima di salvare, condividere o cambiare importi e date.
- AI-05: nessun accesso a un gruppo o documento negato all’utente; i permessi sono applicati prima di inviare il contesto al servizio AI.
- AI-06: costi, scelta del fornitore e trattamento dei dati da definire prima dell’attivazione. Documenti sanitari esclusi dall’invio automatico.

## 12. Architettura, dati e migrazione

Conservare il frontend PWA e il modulo Spesa; estendere il backend esistente dopo la definizione dei permessi. Il frontend statico da solo non può gestire in modo sicuro account, autorizzazioni e promemoria a tempo.

### Entità necessarie

| Entità | Contenuto essenziale |
| --- | --- |
| Profilo | Identità di autenticazione, nome, preferenze; nessuna password nel frontend. |
| Gruppo e appartenenza | Gruppo, utente, ruolo, stato dell’invito. |
| Invito e concessione guest | Risorsa, hash del token, permessi, scadenza e revoca. |
| Attività e checklist | Gruppo, visibilità, assegnatari, stato, scadenza, versione. |
| Evento e partecipazione | Ora, fuso, durata, partecipanti, eventuale ricorrenza. |
| Spesa, quota, pagamento e rimborso | Importi in centesimi, valuta, responsabili e collegamenti. |
| Lista e prodotto | Dati attuali con associazione facoltativa al gruppo durante la transizione. |
| Ricorrenza e occorrenza | Regola, eccezioni e identità stabile delle singole occorrenze. |
| Allegato, commento, notifica e audit | Riferimento alla risorsa, autore e permessi coerenti con essa. |

- TEC-01: tutte le risorse condivise hanno un gruppo e una regola di visibilità; permessi verificati anche per allegati e collegamenti diretti.
- TEC-02: operazioni idempotenti e aggiornamenti versionati; conflitti tra dispositivi segnalati quando non possono essere risolti senza perdere dati.
- TEC-03: denaro, permessi, revoche e pagamenti hanno verifiche server. Le modifiche offline non riattivano accessi revocati.
- TEC-04: ricorrenze con gestione esplicita di mesi corti, fine mese, ora legale e cambi di fuso; evitare generazione duplicata di occorrenze.
- TEC-05: coda offline separata per account/gruppo; nessuna operazione di un account sincronizzata nell’account successivo sullo stesso telefono.
- TEC-06: limiti a inviti, codici OTP, richieste e allegati; log senza token, numeri completi o contenuti sensibili.
- TEC-07: il service worker non memorizza indiscriminatamente risposte private. I dati sanitari non vengono salvati offline nella prima versione.
- TEC-08: esportazione dei dati, backup, ripristino verificato ed eliminazione di account/gruppo con gestione delle risorse condivise e della proprietà.

### Transizione dalla base attuale

1. Rinomina visibile e recupero delle chiavi locali sullo stesso indirizzo, senza eliminare liste e operazioni in attesa.
2. Migrazioni additive e versionate per account, gruppi e concessioni; nessuna sostituzione distruttiva delle tabelle Spesa.
3. Nuove API autorizzate e passaggio delle liste ai gruppi mediante possesso verificato del vecchio token. Un nuovo login non attribuisce automaticamente la proprietà delle liste locali.
4. Vecchi link: accesso limitato alla singola lista finché valido; per consentire revoche effettive aggiornare anche le vecchie funzioni RPC, che oggi accettano direttamente il token.
5. Solo dopo verifica del recupero dati, eventuale rinomina del repository e cambio di URL pubblico. Il cambio di percorso richiede un piano esplicito per link esistenti, installazioni, memoria locale e worker: non è coperto dalla semplice rinomina del manifest.
6. Rollback applicativo e backup dei dati prima delle migrazioni server. Ripristinare un backup non deve reintrodurre inviti revocati senza verifica.

## 13. Esperienza, accessibilità e qualità

- UX-01: lingua iniziale italiana; date, euro e formati coerenti. Testi brevi, senza esporre dettagli tecnici nei normali flussi.
- UX-02: interfaccia mobile, installabile come PWA, adattabile a tablet e desktop; icona di marca da evolvere oltre il carrello del modulo Spesa.
- UX-03: navigazione con tastiera e lettore di schermo, focus visibile, contrasto adeguato e bersagli tattili comodi; verifica con zoom e testo ingrandito.
- UX-04: il caricamento del catalogo/volantino non blocca login e home; gli allegati si caricano solo quando necessari.
- UX-05: distinzione fra salvato sul telefono, sincronizzato, errore e modifica respinta; nessuna conferma ingannevole di pagamento o salvataggio remoto.
- UX-06: conferme per eliminazioni importanti e possibilità di annullare operazioni reversibili.
- UX-07: gestione esplicita di sessione scaduta, invito invalido, membro rimosso, rete assente e memoria piena.

## 14. Fasi di implementazione e prove di uscita

| Fase | Risultato | Prove necessarie prima del rilascio |
| --- | --- | --- |
| 0 — Identità | Rinomina locale e documento di prodotto. | Build e test del modulo esistente; recupero delle liste e della coda, precedenza ai dati nuovi. |
| 1 — Fondazioni | Login Google/Facebook/telefono, gruppi, ruoli, inviti e guest; home 2×2 collegata a moduli con stati vuoti reali. | Login e ritorno all’invito per ogni metodo; isolamento fra gruppi e guest; revoca, logout e cambio account. |
| 2 — Organizzazione | Spesa collegata ai gruppi, Attività e turni, Agenda di base. | Due dispositivi collaborano; ricorrenze corrette; offline e conflitti verificati; nessuna perdita delle liste precedenti. |
| 3 — Casa e salute | Spese ricorrenti, quote, pagamenti, notifiche e appuntamenti riservati. | Totali e rimborsi coerenti; riservatezza anche per amministratori; promemoria aggiornati senza duplicazioni. |
| 4 — Espansione | Spazi aggiuntivi, calendario esterno, modelli e assistente AI facoltativo. | Ogni integrazione rispetta i permessi; proposte AI confermate prima delle modifiche; costi e limiti definiti. |

Per ogni rilascio: test delle regole di dominio e delle autorizzazioni, migrazioni e ripristino in ambiente separato, prove su due sessioni indipendenti, build, verifica di installazione e aggiornamento PWA su Android/iPhone. Il cambio di nome va provato anche su un’installazione già esistente.

## 15. Decisioni operative prima delle rispettive fasi

Non bloccano la rinomina o il presente documento, ma vanno risolte prima di attivare le funzionalità interessate:

- Configurazione delle app Google e Facebook, redirect autorizzati e ambienti distinti di sviluppo/produzione.
- Servizio SMS per OTP, paesi supportati, budget e protezioni dagli abusi; nessun costo o piano a pagamento viene attivato da questo documento.
- Regole definitive per scadenza dei link, guest e accesso alle risorse personali; proposta iniziale: guest solo su invito alla singola attività.
- Politica degli allegati: formati, dimensioni, conservazione e permessi; documenti sanitari solo nella fase dedicata.
- Pianificazione server dei promemoria, canali da abilitare e limiti d’invio.
- Destinazione pubblica definitiva e piano di continuità dei vecchi link prima di rinominare il repository remoto.
- Nome, icona e identità visiva definitive; eventuale AI soltanto dopo scelta esplicita di servizi, dati e budget.
