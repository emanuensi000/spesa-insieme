# OrganAIzer — 1.000 requisiti di prodotto e accettazione

Data: 20 novembre 2026. Base esaminata: versione 0.3.0, commit `ac2a76f`.

Questa checklist raccoglie **requisiti della base attuale e sviluppi futuri**, non attesta che 1.000 funzioni siano già implementate. Anche funzioni già presenti restano da accettare nel contesto della release esaminata. Non sostituisce [lo stato di implementazione](IMPLEMENTAZIONE.md), [le verifiche documentate](../VERIFICA.md) o [la visione di prodotto](../REQUISITI.md).

Tutte le caselle iniziali sono intenzionalmente vuote. Le accettazioni successive sono documentate in [ACCETTAZIONE_0.3.1.md](ACCETTAZIONE_0.3.1.md) e [ACCETTAZIONE_0.3.2.md](ACCETTAZIONE_0.3.2.md). Il nuovo requisito slider è in [REQUISITI_SUCCESSIVI.md](REQUISITI_SUCCESSIVI.md). Una casella vuota significa **non ancora accettato con evidenza associata**, non necessariamente assente dal codice. Una casella spuntata deve indicare nei verbali o nel ticket collegato: commit, ambiente, caso di test ed esito. Un test locale con dati simulati non prova il funzionamento dei provider reali o dei permessi del database remoto.

Ogni riga è un requisito distinto con identificativo stabile. Gli ID non vanno rinumerati quando cambia lo stato. Per aggiungere requisiti oltre questo catalogo usare un documento successivo, così questo file mantiene esattamente 1.000 caselle. Requisiti relativi a servizi esterni, costi, notifiche, nuovi provider, migrazioni o trasferimenti dati non ne autorizzano automaticamente l'attivazione.

| Categoria | Identificativi | Requisiti |
| --- | --- | ---: |
| Funzionalità | FUN-001–FUN-400 | 400 |
| UX/UI | UX-001–UX-300 | 300 |
| Robustezza | ROB-001–ROB-300 | 300 |
| Totale | Identificativi univoci | **1.000** |

I valori numerici proposti nei requisiti UX e prestazionali sono obiettivi di accettazione del prodotto; non costituiscono una dichiarazione di conformità a uno standard. I limiti già applicati dal codice restano quelli documentati nell'implementazione fino a una modifica esplicita.

Piano di verifica e inventario dei test esistenti: [PIANO_TEST_APP.md](PIANO_TEST_APP.md).

## Indice dei blocchi

| Categoria | Blocco | Intervallo |
| --- | --- | --- |
| Funzionalità | Accesso e provider | FUN-001–FUN-020 |
| Funzionalità | Sessioni e gestione account | FUN-021–FUN-040 |
| Funzionalità | Modalità locale e accesso ospite | FUN-041–FUN-060 |
| Funzionalità | Gruppi e ciclo di vita | FUN-061–FUN-080 |
| Funzionalità | Membri e ruoli | FUN-081–FUN-100 |
| Funzionalità | Inviti e condivisione delle risorse | FUN-101–FUN-120 |
| Funzionalità | Home e filtri temporali | FUN-121–FUN-140 |
| Funzionalità | Profilo e preferenze | FUN-141–FUN-160 |
| Funzionalità | Attività e turni | FUN-161–FUN-180 |
| Funzionalità | Ricorrenze e turnazioni | FUN-181–FUN-200 |
| Funzionalità | Agenda e appuntamenti | FUN-201–FUN-220 |
| Funzionalità | Spese domestiche e pagamenti | FUN-221–FUN-240 |
| Funzionalità | Rimborsi e saldi | FUN-241–FUN-260 |
| Funzionalità | Più liste della spesa e gruppi | FUN-261–FUN-280 |
| Funzionalità | Prodotti e carrello | FUN-281–FUN-300 |
| Funzionalità | Catalogo offerte e importazione | FUN-301–FUN-320 |
| Funzionalità | Volantino interattivo e immagini | FUN-321–FUN-340 |
| Funzionalità | Chiusura spesa, scontrini e statistiche | FUN-341–FUN-360 |
| Funzionalità | Backup, esportazione e ripristino | FUN-361–FUN-380 |
| Funzionalità | Promemoria, spazi tematici e integrazioni | FUN-381–FUN-400 |
| UX/UI | Primo accesso e comprensione del prodotto | UX-001–UX-020 |
| UX/UI | Navigazione e orientamento | UX-021–UX-040 |
| UX/UI | Layout responsive e dimensioni | UX-041–UX-060 |
| UX/UI | Tipografia, colori e gerarchia | UX-061–UX-080 |
| UX/UI | Form e inserimento dati | UX-081–UX-100 |
| UX/UI | Feedback, caricamento ed errori | UX-101–UX-120 |
| UX/UI | Liste e prodotti | UX-121–UX-140 |
| UX/UI | Catalogo, offerte e ricerca | UX-141–UX-160 |
| UX/UI | Visualizzatore del volantino | UX-161–UX-180 |
| UX/UI | Agenda, attività e ricorrenze | UX-181–UX-200 |
| UX/UI | Pagamenti, quote e rimborsi | UX-201–UX-220 |
| UX/UI | Profilo, storico e backup | UX-221–UX-240 |
| UX/UI | Accessibilità da tastiera e focus | UX-241–UX-260 |
| UX/UI | Lettori di schermo e semantica | UX-261–UX-280 |
| UX/UI | Tocco, movimento e interazione mobile | UX-281–UX-300 |
| Robustezza | Autorizzazioni e isolamento dei gruppi | ROB-001–ROB-020 |
| Robustezza | Sicurezza dell'autenticazione | ROB-021–ROB-040 |
| Robustezza | Token, link e inviti | ROB-041–ROB-060 |
| Robustezza | Idempotenza e integrità delle scritture | ROB-061–ROB-080 |
| Robustezza | Concorrenza e conflitti | ROB-081–ROB-100 |
| Robustezza | Sincronizzazione e recupero offline | ROB-101–ROB-120 |
| Robustezza | Memoria locale e separazione account | ROB-121–ROB-140 |
| Robustezza | Service worker e cache PWA | ROB-141–ROB-160 |
| Robustezza | Validazione e sicurezza dei backup | ROB-161–ROB-180 |
| Robustezza | Validazione degli input e risorse esterne | ROB-181–ROB-200 |
| Robustezza | Schema SQL e migrazioni | ROB-201–ROB-220 |
| Robustezza | Rete, timeout e dipendenze esterne | ROB-221–ROB-240 |
| Robustezza | Prestazioni e limiti operativi | ROB-241–ROB-260 |
| Robustezza | Test, regressioni e integrazione continua | ROB-261–ROB-280 |
| Robustezza | Rilasci, osservabilità e gestione dei dati | ROB-281–ROB-300 |

## Funzionalità — 400 requisiti

### Accesso e provider (FUN-001–FUN-020)

- [ ] **FUN-001** — Mostrare il login al visitatore privo di sessione valida.
- [ ] **FUN-002** — Avviare l'accesso Google solo quando il provider risulta disponibile.
- [ ] **FUN-003** — Avviare l'accesso Facebook solo quando il provider risulta disponibile.
- [ ] **FUN-004** — Mostrare l'accesso telefonico solo con servizio SMS configurato.
- [ ] **FUN-005** — Ricontrollare la disponibilità dei provider senza reinstallare la PWA.
- [ ] **FUN-006** — Conservare la destinazione richiesta durante il login Google.
- [ ] **FUN-007** — Conservare la destinazione richiesta durante il login Facebook.
- [ ] **FUN-008** — Ritornare al login dopo un annullamento OAuth.
- [ ] **FUN-009** — Permettere di correggere il numero prima di inviare un OTP.
- [ ] **FUN-010** — Normalizzare gli spazi nel numero telefonico prima dell'invio.
- [ ] **FUN-011** — Richiedere il prefisso internazionale per l'accesso telefonico.
- [ ] **FUN-012** — Consentire l'inserimento del codice OTP ricevuto.
- [ ] **FUN-013** — Mostrare il tempo residuo prima del reinvio OTP.
- [ ] **FUN-014** — Permettere il reinvio OTP dopo il periodo consentito.
- [ ] **FUN-015** — Permettere di cambiare numero durante la verifica OTP.
- [ ] **FUN-016** — Distinguere codice errato e codice scaduto nel flusso telefonico.
- [ ] **FUN-017** — Riproporre l'accesso quando la sessione non è più rinnovabile.
- [ ] **FUN-018** — Consentire il collegamento volontario di un secondo provider verificato.
- [ ] **FUN-019** — Consentire la consultazione dei metodi di accesso collegati.
- [ ] **FUN-020** — Impedire la rimozione dell'ultimo metodo di accesso utilizzabile.

### Sessioni e gestione account (FUN-021–FUN-040)

- [ ] **FUN-021** — Ripristinare la sessione valida alla riapertura dell'app.
- [ ] **FUN-022** — Rinnovare la sessione prima di una richiesta autenticata in scadenza.
- [ ] **FUN-023** — Consentire il logout dal dispositivo corrente.
- [ ] **FUN-024** — Consentire il logout anche senza connessione.
- [ ] **FUN-025** — Mostrare l'identità attualmente collegata nel Profilo.
- [ ] **FUN-026** — Consentire il passaggio esplicito dalla modalità locale all'accesso.
- [ ] **FUN-027** — Conservare le modifiche pendenti dell'account dopo il logout confermato.
- [ ] **FUN-028** — Riprendere le modifiche pendenti tornando allo stesso account.
- [ ] **FUN-029** — Avvisare prima del logout con modifiche ancora da inviare.
- [ ] **FUN-030** — Consentire il recupero dell'accesso tramite i provider supportati.
- [ ] **FUN-031** — Elencare le sessioni attive dell'account quando il backend lo supporta.
- [ ] **FUN-032** — Consentire la revoca di una sessione selezionata.
- [ ] **FUN-033** — Consentire l'uscita da tutte le altre sessioni.
- [ ] **FUN-034** — Consentire la richiesta di eliminazione dell'account.
- [ ] **FUN-035** — Mostrare le conseguenze dell'eliminazione prima della conferma.
- [ ] **FUN-036** — Gestire il trasferimento dei gruppi prima di eliminare un proprietario.
- [ ] **FUN-037** — Confermare l'eliminazione completata con una schermata dedicata.
- [ ] **FUN-038** — Consentire l'esportazione dei dati personali prima dell'eliminazione.
- [ ] **FUN-039** — Mostrare i metodi disponibili quando un provider viene disattivato.
- [ ] **FUN-040** — Consentire di interrompere un tentativo di accesso senza perdere l'invito.

### Modalità locale e accesso ospite (FUN-041–FUN-060)

- [ ] **FUN-041** — Consentire l'ingresso locale senza creare un account remoto.
- [ ] **FUN-042** — Creare uno spazio locale iniziale quando non esistono gruppi.
- [ ] **FUN-043** — Consentire la creazione di più spazi locali.
- [ ] **FUN-044** — Riaprire i dati locali dopo il riavvio del browser.
- [ ] **FUN-045** — Identificare esplicitamente uno spazio come locale.
- [ ] **FUN-046** — Consentire l'accesso ospite da un invito valido.
- [ ] **FUN-047** — Aprire soltanto la risorsa indicata dall'invito ospite.
- [ ] **FUN-048** — Consentire la lettura ospite con permesso di sola lettura.
- [ ] **FUN-049** — Consentire il completamento ospite quando il permesso lo prevede.
- [ ] **FUN-050** — Mostrare il nome del gruppo associato alla risorsa invitata.
- [ ] **FUN-051** — Permettere al visitatore invitato di scegliere l'accesso registrato.
- [ ] **FUN-052** — Aprire la stessa risorsa dopo la registrazione dell'invitato.
- [ ] **FUN-053** — Permettere all'ospite di uscire dalla risorsa condivisa.
- [ ] **FUN-054** — Mostrare una destinazione alternativa quando l'invito non è utilizzabile.
- [ ] **FUN-055** — Consentire la scelta di un nome ospite distinto dall'identità verificata.
- [ ] **FUN-056** — Proporre il trasferimento dei dati locali solo su richiesta esplicita.
- [ ] **FUN-057** — Mostrare un'anteprima dei dati locali da trasferire a un account.
- [ ] **FUN-058** — Consentire di annullare il trasferimento locale senza cambiare dati.
- [ ] **FUN-059** — Mostrare l'esito del trasferimento locale con gli elementi importati.
- [ ] **FUN-060** — Consentire l'esportazione locale anche senza autenticazione.

### Gruppi e ciclo di vita (FUN-061–FUN-080)

- [ ] **FUN-061** — Creare un gruppo condiviso con un nome valido.
- [ ] **FUN-062** — Selezionare un gruppo tra tutte le appartenenze dell'account.
- [ ] **FUN-063** — Ripristinare il gruppo selezionato alla precedente visita.
- [ ] **FUN-064** — Mostrare il nome del gruppo corrente in ogni modulo.
- [ ] **FUN-065** — Rinominare un gruppo secondo i permessi del proprietario.
- [ ] **FUN-066** — Associare un'icona al gruppo.
- [ ] **FUN-067** — Modificare la descrizione del gruppo.
- [ ] **FUN-068** — Mostrare la data di creazione del gruppo.
- [ ] **FUN-069** — Consultare i moduli disponibili nel gruppo.
- [ ] **FUN-070** — Archiviare un gruppo senza cancellarne lo storico.
- [ ] **FUN-071** — Riaprire un gruppo archiviato con un'azione esplicita.
- [ ] **FUN-072** — Consultare i gruppi archiviati separatamente da quelli attivi.
- [ ] **FUN-073** — Esportare i dati di un gruppo selezionato.
- [ ] **FUN-074** — Mostrare un riepilogo prima di eliminare un gruppo.
- [ ] **FUN-075** — Eliminare un gruppo solo dopo una conferma esplicita.
- [ ] **FUN-076** — Consentire l'uscita volontaria da un gruppo.
- [ ] **FUN-077** — Mostrare il gruppo alternativo dopo un'uscita completata.
- [ ] **FUN-078** — Gestire l'assenza di gruppi con un percorso per crearne uno.
- [ ] **FUN-079** — Consentire di duplicare la struttura di uno spazio senza copiarne i membri.
- [ ] **FUN-080** — Mostrare il numero di membri del gruppo selezionato.

### Membri e ruoli (FUN-081–FUN-100)

- [ ] **FUN-081** — Elencare i membri del gruppo corrente.
- [ ] **FUN-082** — Mostrare il ruolo di ogni membro del gruppo.
- [ ] **FUN-083** — Distinguere proprietario, amministratore e membro.
- [ ] **FUN-084** — Consentire al proprietario di promuovere un membro ad amministratore.
- [ ] **FUN-085** — Consentire al proprietario di revocare il ruolo amministratore.
- [ ] **FUN-086** — Consentire il trasferimento della proprietà del gruppo.
- [ ] **FUN-087** — Mostrare una conferma prima del trasferimento della proprietà.
- [ ] **FUN-088** — Consentire la rimozione di un membro autorizzata dal proprietario.
- [ ] **FUN-089** — Aggiornare l'elenco dopo la rimozione di un membro.
- [ ] **FUN-090** — Associare un nome visualizzato all'appartenenza nel gruppo.
- [ ] **FUN-091** — Modificare il proprio nome visualizzato nel gruppo.
- [ ] **FUN-092** — Distinguere membri con nomi visualizzati uguali.
- [ ] **FUN-093** — Mostrare chi ha creato una risorsa condivisa.
- [ ] **FUN-094** — Mostrare il responsabile assegnato a una risorsa.
- [ ] **FUN-095** — Consentire l'assegnazione soltanto a persone disponibili nel gruppo.
- [ ] **FUN-096** — Gestire le risorse assegnate a un membro successivamente rimosso.
- [ ] **FUN-097** — Consentire una nuova assegnazione dopo la rimozione del responsabile.
- [ ] **FUN-098** — Mostrare le operazioni consentite dal ruolo corrente.
- [ ] **FUN-099** — Consultare una spiegazione sintetica dei permessi dei ruoli.
- [ ] **FUN-100** — Aggiornare le funzioni disponibili dopo una variazione del proprio ruolo.

### Inviti e condivisione delle risorse (FUN-101–FUN-120)

- [ ] **FUN-101** — Creare un invito per entrare nel gruppo.
- [ ] **FUN-102** — Creare un invito per consultare una singola risorsa.
- [ ] **FUN-103** — Creare un invito per collaborare a una singola risorsa.
- [ ] **FUN-104** — Mostrare il tipo di accesso prima di generare un invito.
- [ ] **FUN-105** — Impostare la scadenza di un invito entro i limiti supportati.
- [ ] **FUN-106** — Copiare il collegamento dell'invito negli appunti.
- [ ] **FUN-107** — Inviare l'invito tramite condivisione nativa quando disponibile.
- [ ] **FUN-108** — Elencare gli inviti generati nel gruppo.
- [ ] **FUN-109** — Mostrare la scadenza di ogni invito.
- [ ] **FUN-110** — Mostrare lo stato revocato di un invito.
- [ ] **FUN-111** — Revocare un invito ancora attivo.
- [ ] **FUN-112** — Consentire la rigenerazione di un invito scaduto.
- [ ] **FUN-113** — Mostrare una conferma prima di aderire a un gruppo invitato.
- [ ] **FUN-114** — Richiedere un nome di appartenenza durante l'adesione.
- [ ] **FUN-115** — Aprire il gruppo dopo un'adesione completata.
- [ ] **FUN-116** — Riconoscere un'adesione già effettuata senza creare un secondo membro.
- [ ] **FUN-117** — Distinguere un invito scaduto da un collegamento incompleto.
- [ ] **FUN-118** — Consentire l'apertura ospite senza mostrare i membri del gruppo.
- [ ] **FUN-119** — Mostrare i dettagli della risorsa prima del completamento ospite.
- [ ] **FUN-120** — Permettere al destinatario di rifiutare l'invito senza modificare dati.

### Home e filtri temporali (FUN-121–FUN-140)

- [ ] **FUN-121** — Mostrare la card Spesa nella Home.
- [ ] **FUN-122** — Mostrare la card Casa e pagamenti nella Home.
- [ ] **FUN-123** — Mostrare la card Attività e turni nella Home.
- [ ] **FUN-124** — Mostrare la card Agenda e salute nella Home.
- [ ] **FUN-125** — Aprire il modulo selezionato dalla relativa card.
- [x] **FUN-126** — Filtrare i riepiloghi della Home sul giorno corrente.
- [x] **FUN-127** — Filtrare i riepiloghi sulla settimana selezionata.
- [x] **FUN-128** — Filtrare i riepiloghi sul mese selezionato.
- [ ] **FUN-129** — Passare al periodo precedente mantenendo il tipo di filtro.
- [ ] **FUN-130** — Passare al periodo successivo mantenendo il tipo di filtro.
- [ ] **FUN-131** — Ritornare al periodo corrente con un'azione dedicata.
- [x] **FUN-132** — Includere gli elementi non programmati nei riepiloghi appropriati.
- [x] **FUN-133** — Mantenere visibili gli elementi arretrati non completati.
- [ ] **FUN-134** — Consentire di includere i completati nei riepiloghi.
- [ ] **FUN-135** — Applicare il filtro temporale in modo coerente alle quattro card.
- [ ] **FUN-136** — Mostrare il totale dei pagamenti aperti nel periodo.
- [ ] **FUN-137** — Mostrare il numero delle attività ancora da completare.
- [ ] **FUN-138** — Mostrare il prossimo appuntamento compatibile con i permessi.
- [ ] **FUN-139** — Aprire l'aggiunta rapida dalla Home.
- [ ] **FUN-140** — Aggiornare i riepiloghi dopo una modifica nel modulo.

### Profilo e preferenze (FUN-141–FUN-160)

- [ ] **FUN-141** — Visualizzare il nome del profilo corrente.
- [ ] **FUN-142** — Modificare il nome del profilo locale.
- [ ] **FUN-143** — Salvare il nome del profilo tra due riaperture.
- [ ] **FUN-144** — Mostrare le iniziali del profilo quando manca una foto.
- [ ] **FUN-145** — Consentire l'impostazione di una foto profilo.
- [ ] **FUN-146** — Consentire la rimozione della foto profilo.
- [ ] **FUN-147** — Impostare il periodo iniziale preferito della Home.
- [ ] **FUN-148** — Salvare la preferenza di visibilità degli elementi completati.
- [ ] **FUN-149** — Salvare la preferenza sui riepiloghi essenziali.
- [ ] **FUN-150** — Mostrare la modalità dati nelle Impostazioni.
- [ ] **FUN-151** — Aprire la documentazione delle funzioni dalle Impostazioni.
- [ ] **FUN-152** — Aprire le note di versione dalle Impostazioni.
- [ ] **FUN-153** — Mostrare versione e identificativo build nell'app.
- [ ] **FUN-154** — Avviare un aggiornamento manuale dei dati condivisi.
- [ ] **FUN-155** — Mostrare i membri del gruppo dalla sezione Profilo.
- [ ] **FUN-156** — Avviare l'invito al gruppo dalla sezione Profilo.
- [ ] **FUN-157** — Consentire di scegliere una lingua tra quelle effettivamente tradotte.
- [ ] **FUN-158** — Consentire di scegliere il formato di visualizzazione delle date.
- [x] **FUN-159** — Consentire il ripristino delle preferenze predefinite.
- [ ] **FUN-160** — Mantenere le preferenze di account separate da quelle locali.

### Attività e turni (FUN-161–FUN-180)

- [ ] **FUN-161** — Creare un'attività con un titolo.
- [ ] **FUN-162** — Modificare il titolo di un'attività esistente.
- [ ] **FUN-163** — Associare note testuali a un'attività.
- [ ] **FUN-164** — Impostare una data di scadenza per l'attività.
- [ ] **FUN-165** — Consentire attività senza data di scadenza.
- [ ] **FUN-166** — Assegnare l'attività a un membro del gruppo.
- [ ] **FUN-167** — Rimuovere il responsabile senza eliminare l'attività.
- [ ] **FUN-168** — Impostare il livello di priorità dell'attività.
- [ ] **FUN-169** — Segnare un'attività come completata.
- [ ] **FUN-170** — Riaprire un'attività completata.
- [ ] **FUN-171** — Annullare un'attività mantenendola consultabile.
- [ ] **FUN-172** — Eliminare un'attività con conferma.
- [ ] **FUN-173** — Ricercare attività per testo del titolo.
- [ ] **FUN-174** — Ricercare attività per testo delle note.
- [ ] **FUN-175** — Filtrare le attività assegnate alla persona corrente.
- [ ] **FUN-176** — Filtrare le attività secondo lo stato.
- [ ] **FUN-177** — Ordinare le attività per scadenza.
- [ ] **FUN-178** — Gestire una checklist interna all'attività.
- [ ] **FUN-179** — Mostrare l'avanzamento della checklist interna.
- [ ] **FUN-180** — Duplicare un'attività scegliendo una nuova scadenza.

### Ricorrenze e turnazioni (FUN-181–FUN-200)

- [x] **FUN-181** — Impostare una ricorrenza giornaliera per un'attività.
- [x] **FUN-182** — Impostare una ricorrenza settimanale per un'attività.
- [x] **FUN-183** — Impostare una ricorrenza mensile per un'attività.
- [x] **FUN-184** — Impostare una ricorrenza bimestrale per un'attività.
- [x] **FUN-185** — Impostare una ricorrenza trimestrale per un'attività.
- [x] **FUN-186** — Impostare una ricorrenza annuale per un'attività.
- [x] **FUN-187** — Rimuovere la ricorrenza da un'attività.
- [ ] **FUN-188** — Generare la successiva occorrenza al completamento di quella corrente.
- [ ] **FUN-189** — Conservare il titolo nella successiva occorrenza.
- [ ] **FUN-190** — Conservare le note nella successiva occorrenza.
- [ ] **FUN-191** — Conservare l'assegnatario quando non è prevista una rotazione.
- [ ] **FUN-192** — Consentire una data finale per una serie ricorrente.
- [ ] **FUN-193** — Consentire un numero massimo di occorrenze per una serie.
- [ ] **FUN-194** — Saltare una singola occorrenza senza eliminare la serie.
- [ ] **FUN-195** — Sospendere una serie ricorrente.
- [ ] **FUN-196** — Riattivare una serie sospesa con una data esplicita.
- [ ] **FUN-197** — Modificare soltanto l'occorrenza corrente di una serie.
- [ ] **FUN-198** — Modificare le occorrenze future senza alterare quelle storiche.
- [ ] **FUN-199** — Configurare una rotazione ordinata degli assegnatari del turno.
- [ ] **FUN-200** — Mostrare l'assegnatario previsto per il prossimo turno.

### Agenda e appuntamenti (FUN-201–FUN-220)

- [ ] **FUN-201** — Creare un appuntamento con titolo e data.
- [ ] **FUN-202** — Modificare la data di un appuntamento.
- [ ] **FUN-203** — Associare un orario di inizio all'appuntamento.
- [ ] **FUN-204** — Associare un luogo all'appuntamento.
- [ ] **FUN-205** — Associare note all'appuntamento.
- [ ] **FUN-206** — Segnare un appuntamento come completato.
- [ ] **FUN-207** — Annullare un appuntamento senza cancellarne la registrazione.
- [ ] **FUN-208** — Eliminare un appuntamento con conferma.
- [ ] **FUN-209** — Mostrare gli appuntamenti in ordine cronologico.
- [ ] **FUN-210** — Mostrare gli appuntamenti del giorno selezionato.
- [ ] **FUN-211** — Mostrare gli appuntamenti della settimana selezionata.
- [ ] **FUN-212** — Mostrare gli appuntamenti del mese selezionato.
- [ ] **FUN-213** — Consentire un appuntamento riservato al proprio autore.
- [ ] **FUN-214** — Distinguere gli appuntamenti riservati da quelli condivisi.
- [ ] **FUN-215** — Esportare un appuntamento in formato ICS.
- [ ] **FUN-216** — Esplicitare se l'esportazione ICS produce un evento di giornata intera.
- [ ] **FUN-217** — Consentire appuntamenti con durata e orario finale.
- [ ] **FUN-218** — Segnalare sovrapposizioni temporali nel proprio calendario.
- [ ] **FUN-219** — Consentire l'indicazione della persona da accompagnare.
- [ ] **FUN-220** — Consentire una categoria per visite, scuola ed eventi personali.

### Spese domestiche e pagamenti (FUN-221–FUN-240)

- [ ] **FUN-221** — Creare una spesa domestica con titolo e importo.
- [ ] **FUN-222** — Modificare l'importo di una spesa ancora modificabile.
- [ ] **FUN-223** — Associare una categoria alla spesa.
- [ ] **FUN-224** — Associare una scadenza alla spesa.
- [ ] **FUN-225** — Associare note alla spesa.
- [ ] **FUN-226** — Indicare la persona che ha effettuato il pagamento.
- [ ] **FUN-227** — Segnare una spesa come pagata.
- [ ] **FUN-228** — Riaprire una spesa segnata come pagata secondo i vincoli previsti.
- [ ] **FUN-229** — Distinguere le spese pagate dalle spese da pagare.
- [ ] **FUN-230** — Mostrare il totale ancora da pagare nel gruppo.
- [ ] **FUN-231** — Mostrare il totale già pagato nel gruppo.
- [ ] **FUN-232** — Dividere una spesa in quote uguali tra i partecipanti.
- [ ] **FUN-233** — Consentire la scelta esplicita dei partecipanti alla ripartizione.
- [ ] **FUN-234** — Mostrare le quote individuali prima del salvataggio.
- [ ] **FUN-235** — Gestire importi inseriti con virgola decimale.
- [ ] **FUN-236** — Gestire importi inseriti con punto decimale.
- [ ] **FUN-237** — Impostare la ricorrenza di una bolletta.
- [ ] **FUN-238** — Ricercare una spesa per titolo e note.
- [ ] **FUN-239** — Filtrare le spese assegnate alla persona corrente.
- [ ] **FUN-240** — Consentire categorie personalizzate per le spese domestiche.

### Rimborsi e saldi (FUN-241–FUN-260)

- [ ] **FUN-241** — Calcolare il saldo di ogni partecipante a una spesa pagata.
- [ ] **FUN-242** — Distinguere chi deve ricevere da chi deve restituire.
- [ ] **FUN-243** — Registrare il rimborso completo di una quota residua.
- [ ] **FUN-244** — Mostrare l'importo residuo dopo un rimborso.
- [ ] **FUN-245** — Mostrare i rimborsi già registrati nella spesa.
- [ ] **FUN-246** — Associare una data al rimborso registrato.
- [ ] **FUN-247** — Consentire la consultazione dei rimborsi per persona.
- [ ] **FUN-248** — Impedire la proposta di rimborso a una persona senza debito.
- [ ] **FUN-249** — Escludere il pagatore dal rimborso verso sé stesso.
- [ ] **FUN-250** — Mostrare una conferma con pagatore, debitore e importo.
- [ ] **FUN-251** — Consentire l'annullamento esplicito di un rimborso errato.
- [ ] **FUN-252** — Mantenere una traccia dell'annullamento del rimborso.
- [ ] **FUN-253** — Consentire rimborsi parziali con importo scelto.
- [ ] **FUN-254** — Consentire quote personalizzate per importo.
- [ ] **FUN-255** — Consentire quote personalizzate per percentuale.
- [ ] **FUN-256** — Mostrare il riepilogo delle ripartizioni non ancora pareggiate.
- [ ] **FUN-257** — Esportare il prospetto dei saldi del gruppo.
- [ ] **FUN-258** — Separare i rimborsi domestici dagli scontrini del supermercato.
- [ ] **FUN-259** — Mostrare la valuta usata nel prospetto dei saldi.
- [ ] **FUN-260** — Consentire l'archiviazione di un periodo contabile già verificato.

### Più liste della spesa e gruppi (FUN-261–FUN-280)

- [ ] **FUN-261** — Creare più liste della spesa nello stesso gruppo.
- [ ] **FUN-262** — Mostrare tutte le liste condivise del gruppo corrente.
- [ ] **FUN-263** — Selezionare una lista senza perdere le altre.
- [ ] **FUN-264** — Creare una lista dal modulo Spesa della Home.
- [ ] **FUN-265** — Creare una lista dal selettore delle liste.
- [ ] **FUN-266** — Rinominare una lista condivisa.
- [ ] **FUN-267** — Mostrare il nome aggiornato agli altri membri del gruppo.
- [ ] **FUN-268** — Collegare esplicitamente una lista precedente al gruppo scelto.
- [ ] **FUN-269** — Aprire una lista direttamente dal suo collegamento privato.
- [ ] **FUN-270** — Copiare il collegamento privato della lista aperta.
- [ ] **FUN-271** — Condividere la lista con la funzione nativa del telefono.
- [ ] **FUN-272** — Passare da un gruppo all'altro nel modulo Spesa.
- [ ] **FUN-273** — Conservare separatamente i prodotti di ogni lista.
- [ ] **FUN-274** — Mantenere aperto il modulo di creazione durante gli aggiornamenti.
- [ ] **FUN-275** — Annullare la creazione di una lista tornando a quella precedente.
- [ ] **FUN-276** — Mostrare una lista chiusa in sola lettura.
- [ ] **FUN-277** — Creare una nuova lista dopo la chiusura della precedente.
- [ ] **FUN-278** — Consentire l'archiviazione di una lista ancora aperta.
- [ ] **FUN-279** — Consentire il riordino volontario delle liste nel selettore.
- [ ] **FUN-280** — Consentire la duplicazione dei prodotti non acquistati in una nuova lista.

### Prodotti e carrello (FUN-281–FUN-300)

- [ ] **FUN-281** — Aggiungere un prodotto scrivendone il nome.
- [ ] **FUN-282** — Associare una quantità descrittiva al prodotto manuale.
- [ ] **FUN-283** — Associare note a un prodotto della lista.
- [ ] **FUN-284** — Associare un prezzo unitario quando conosciuto.
- [ ] **FUN-285** — Aggiungere un'offerta del catalogo alla lista attiva.
- [x] **FUN-286** — Raggruppare le unità equivalenti dello stesso prodotto.
- [ ] **FUN-287** — Aumentare le unità con il controllo più.
- [ ] **FUN-288** — Diminuire le unità con il controllo meno.
- [ ] **FUN-289** — Impostare direttamente un numero intero di unità.
- [ ] **FUN-290** — Segnare un gruppo di unità come acquistato.
- [ ] **FUN-291** — Riportare un prodotto acquistato tra quelli da acquistare.
- [ ] **FUN-292** — Rimuovere tutte le unità di un prodotto raggruppato.
- [ ] **FUN-293** — Rimuovere collettivamente i prodotti già acquistati dopo conferma.
- [ ] **FUN-294** — Mostrare il prezzo totale delle unità raggruppate.
- [x] **FUN-295** — Mostrare la stima totale del carrello.
- [x] **FUN-296** — Distinguere nella stima acquistati e prodotti ancora da acquistare.
- [x] **FUN-297** — Segnalare i prodotti senza prezzo esclusi dalla stima.
- [ ] **FUN-298** — Consentire l'espansione dei dettagli di un prodotto acquistato.
- [ ] **FUN-299** — Mostrare la foto del prodotto quando esiste una sorgente valida.
- [ ] **FUN-300** — Consentire la modifica del nome di un prodotto manuale esistente.

### Catalogo offerte e importazione (FUN-301–FUN-320)

- [ ] **FUN-301** — Mostrare le offerte dell'edizione pubblicata nel progetto.
- [ ] **FUN-302** — Cercare un'offerta per nome prodotto.
- [ ] **FUN-303** — Cercare un'offerta per marca.
- [ ] **FUN-304** — Filtrare le offerte per reparto.
- [ ] **FUN-305** — Filtrare le offerte per pagina del volantino.
- [x] **FUN-306** — Mostrare soltanto le offerte valide oggi su richiesta.
- [x] **FUN-307** — Mostrare insieme le offerte in corso e quelle future su richiesta.
- [x] **FUN-308** — Includere le offerte scadute soltanto con un filtro esplicito.
- [ ] **FUN-309** — Mostrare la data iniziale di un'offerta futura.
- [ ] **FUN-310** — Mostrare la scadenza dell'offerta.
- [x] **FUN-311** — Mostrare il prezzo per unità di misura quando presente.
- [ ] **FUN-312** — Mostrare le condizioni Fidelity associate al prezzo.
- [x] **FUN-313** — Mostrare uno sconto percentuale senza inventare il prezzo finale.
- [ ] **FUN-314** — Caricare ulteriori risultati con il comando dedicato.
- [ ] **FUN-315** — Aprire la pagina originale associata all'offerta.
- [ ] **FUN-316** — Segnalare le offerte già selezionate nella lista corrente.
- [ ] **FUN-317** — Importare il catalogo da un CSV revisionato manualmente.
- [ ] **FUN-318** — Scoprire il nuovo volantino senza pubblicarne automaticamente i prodotti.
- [ ] **FUN-319** — Selezionare soltanto la card delle sedi configurate per l'edizione.
- [ ] **FUN-320** — Conservare le promozioni generali separatamente dai prodotti acquistabili.

### Volantino interattivo e immagini (FUN-321–FUN-340)

- [ ] **FUN-321** — Mostrare tutte le pagine locali del volantino corrente.
- [ ] **FUN-322** — Aprire una pagina nel visualizzatore ingrandito.
- [ ] **FUN-323** — Passare alla pagina successiva con un pulsante.
- [ ] **FUN-324** — Passare alla pagina precedente con un pulsante.
- [ ] **FUN-325** — Selezionare direttamente il numero di pagina.
- [ ] **FUN-326** — Cambiare pagina mediante swipe quando il visualizzatore non è ingrandito.
- [ ] **FUN-327** — Ingrandire la pagina mediante gesto supportato dal dispositivo.
- [ ] **FUN-328** — Spostare la pagina ingrandita orizzontalmente.
- [ ] **FUN-329** — Spostare la pagina ingrandita verticalmente.
- [ ] **FUN-330** — Selezionare un prodotto tramite l'area della pagina.
- [ ] **FUN-331** — Deselezionare un prodotto già scelto tramite la stessa area.
- [ ] **FUN-332** — Mostrare l'elenco testuale dei prodotti della pagina aperta.
- [ ] **FUN-333** — Mostrare il numero della pagina corrente e il totale.
- [ ] **FUN-334** — Aprire il PDF locale del volantino.
- [ ] **FUN-335** — Aprire il sito ufficiale della fonte.
- [x] **FUN-336** — Conservare il ritaglio fotografico del prodotto già salvato.
- [ ] **FUN-337** — Consultare una pagina già scaricata senza connessione.
- [ ] **FUN-338** — Consentire la selezione di prodotti in più pagine consecutive.
- [ ] **FUN-339** — Mostrare le promozioni con rinvio alla pagina delle condizioni.
- [ ] **FUN-340** — Ritornare alla stessa pagina dopo la consultazione di un prodotto.

### Chiusura spesa, scontrini e statistiche (FUN-341–FUN-360)

- [ ] **FUN-341** — Avviare la chiusura di una lista con prodotti acquistati.
- [ ] **FUN-342** — Precompilare il totale con la stima dei prodotti acquistati.
- [ ] **FUN-343** — Consentire la correzione del totale secondo lo scontrino reale.
- [ ] **FUN-344** — Consentire la scelta della data di acquisto.
- [ ] **FUN-345** — Mostrare quanti prodotti acquistati entreranno nello scontrino.
- [x] **FUN-346** — Conservare nel dettaglio anche i prodotti non acquistati.
- [ ] **FUN-347** — Confermare la chiusura prima di archiviare la lista.
- [x] **FUN-348** — Conservare quantità e prezzi nello scontrino storico.
- [x] **FUN-349** — Conservare le foto dei prodotti nello scontrino storico.
- [ ] **FUN-350** — Mostrare lo storico delle spese nel Profilo.
- [ ] **FUN-351** — Filtrare gli scontrini per mese.
- [ ] **FUN-352** — Mostrare tutti gli scontrini con un filtro dedicato.
- [x] **FUN-353** — Mostrare il totale pagato nel periodo selezionato.
- [x] **FUN-354** — Mostrare il numero di spese concluse nel periodo.
- [x] **FUN-355** — Mostrare la media per spesa nel periodo selezionato.
- [x] **FUN-356** — Mostrare l'andamento dei sei mesi previsti dal riepilogo.
- [ ] **FUN-357** — Aprire il dettaglio completo di uno scontrino.
- [x] **FUN-358** — Distinguere il totale pagato dalla stima dei prezzi annotati.
- [ ] **FUN-359** — Segnalare una chiusura locale ancora da sincronizzare.
- [ ] **FUN-360** — Consentire l'esportazione dello storico scontrini come dato consultabile.

### Backup, esportazione e ripristino (FUN-361–FUN-380)

- [ ] **FUN-361** — Esportare i dati locali in un file JSON scaricabile.
- [x] **FUN-362** — Includere formato e versione dello schema nel backup esportato.
- [x] **FUN-363** — Includere la data di esportazione nel backup.
- [x] **FUN-364** — Includere i gruppi locali nel backup.
- [x] **FUN-365** — Includere le attività locali nel backup.
- [x] **FUN-366** — Includere il profilo locale nel backup.
- [x] **FUN-367** — Includere le preferenze locali nel backup.
- [ ] **FUN-368** — Includere una vista consultabile dello storico della spesa nell'export.
- [ ] **FUN-369** — Selezionare un file di backup dalle Impostazioni locali.
- [ ] **FUN-370** — Mostrare una conferma prima della sostituzione dei dati locali.
- [ ] **FUN-371** — Consentire l'annullamento del ripristino dopo la selezione del file.
- [x] **FUN-372** — Ripristinare i gruppi di un backup valido.
- [x] **FUN-373** — Ripristinare le risorse locali di un backup valido.
- [x] **FUN-374** — Ripristinare il nome del profilo da un backup valido.
- [x] **FUN-375** — Ripristinare le preferenze supportate del backup.
- [x] **FUN-376** — Selezionare un gruppo valido dopo il ripristino.
- [x] **FUN-377** — Esplicitare che lo storico scontrini non è ripristinato nella versione attuale.
- [ ] **FUN-378** — Mostrare l'esito positivo del ripristino completato.
- [ ] **FUN-379** — Consentire l'esportazione dei dati condivisi autorizzati dell'account.
- [x] **FUN-380** — Consentire un'anteprima dei gruppi che verranno sostituiti dal backup.

### Promemoria, spazi tematici e integrazioni (FUN-381–FUN-400)

- [ ] **FUN-381** — Consultare i promemoria interni dall'intestazione dell'app.
- [ ] **FUN-382** — Mostrare le scadenze imminenti nel riepilogo dei promemoria.
- [ ] **FUN-383** — Aprire il modulo corretto da un promemoria.
- [ ] **FUN-384** — Escludere i completati dai promemoria ancora da gestire.
- [ ] **FUN-385** — Gestire lo spazio Pasti e dispensa mediante risorse dedicate.
- [ ] **FUN-386** — Gestire lo spazio Scuola e figli mediante risorse dedicate.
- [ ] **FUN-387** — Gestire lo spazio Animali mediante risorse dedicate.
- [ ] **FUN-388** — Gestire lo spazio Viaggi ed eventi mediante risorse dedicate.
- [ ] **FUN-389** — Gestire lo spazio Documenti e manutenzione mediante risorse dedicate.
- [ ] **FUN-390** — Gestire lo spazio Interessi e progetti mediante risorse dedicate.
- [ ] **FUN-391** — Filtrare le risorse secondo lo spazio tematico scelto.
- [ ] **FUN-392** — Impostare un promemoria individuale per una scadenza.
- [ ] **FUN-393** — Consentire l'attivazione volontaria delle notifiche push.
- [ ] **FUN-394** — Consentire la disattivazione delle notifiche push.
- [ ] **FUN-395** — Consentire una fascia oraria silenziosa per le notifiche.
- [ ] **FUN-396** — Distinguere promemoria interni e notifiche a pagina chiusa.
- [ ] **FUN-397** — Consentire un'esportazione calendario del periodo selezionato.
- [ ] **FUN-398** — Consentire la scelta dei moduli inclusi nell'esportazione calendario.
- [ ] **FUN-399** — Mostrare lo stato di collegamento di un'integrazione esterna.
- [ ] **FUN-400** — Consentire la disconnessione esplicita di un'integrazione esterna.

## UX/UI — 300 requisiti

### Primo accesso e comprensione del prodotto (UX-001–UX-020)

- [ ] **UX-001** — Rendere leggibile il nome OrganAIzer nella prima schermata.
- [ ] **UX-002** — Spiegare lo scopo dell'app prima di richiedere un accesso.
- [ ] **UX-003** — Distinguere visivamente accesso registrato e modalità locale.
- [ ] **UX-004** — Spiegare che la modalità locale non condivide dati tra dispositivi.
- [ ] **UX-005** — Usare etichette dei provider coerenti con il servizio selezionato.
- [ ] **UX-006** — Spiegare perché un provider non è disponibile quando disabilitato.
- [ ] **UX-007** — Mostrare un'azione per ricontrollare i provider indisponibili.
- [ ] **UX-008** — Descrivere il ruolo dell'ospite prima dell'apertura della risorsa.
- [ ] **UX-009** — Presentare il nome del gruppo nell'anteprima di un invito.
- [ ] **UX-010** — Rendere comprensibile il consenso prima dell'adesione a un gruppo.
- [ ] **UX-011** — Distinguere un invito al gruppo da un link alla singola attività.
- [ ] **UX-012** — Spiegare le conseguenze della condivisione di un link privato.
- [ ] **UX-013** — Mostrare un percorso per iniziare quando mancano gruppi.
- [ ] **UX-014** — Rendere individuabile il pulsante di creazione del primo gruppo.
- [ ] **UX-015** — Consentire di iniziare senza una foto profilo.
- [ ] **UX-016** — Evitare richieste di telefono nel percorso di accesso Google.
- [ ] **UX-017** — Mostrare esempi concreti di nomi per il primo spazio.
- [ ] **UX-018** — Usare un linguaggio coerente tra login e schermate successive.
- [ ] **UX-019** — Conservare il contesto dell'invito nelle schermate di errore.
- [ ] **UX-020** — Rendere distinguibili identità verificata e nome ospite dichiarato.

### Navigazione e orientamento (UX-021–UX-040)

- [ ] **UX-021** — Rendere Home, Profilo e Impostazioni raggiungibili dalla barra principale.
- [ ] **UX-022** — Evidenziare la destinazione attualmente selezionata nella barra.
- [ ] **UX-023** — Mantenere le etichette della barra leggibili insieme alle icone.
- [ ] **UX-024** — Mostrare il titolo del modulo aperto.
- [ ] **UX-025** — Rendere raggiungibile il ritorno alla Home dal modulo Spesa.
- [ ] **UX-026** — Mostrare il gruppo corrente prima dei contenuti del modulo.
- [ ] **UX-027** — Non nascondere il selettore del gruppo dietro azioni distruttive.
- [ ] **UX-028** — Mantenere una posizione coerente per le azioni di creazione.
- [ ] **UX-029** — Distinguere navigazione e azioni di modifica mediante il loro aspetto.
- [ ] **UX-030** — Consentire il ritorno dal dettaglio senza perdere il filtro precedente.
- [ ] **UX-031** — Conservare la ricerca tornando da una risorsa aperta.
- [ ] **UX-032** — Non riposizionare lo scorrimento durante un aggiornamento silenzioso.
- [ ] **UX-033** — Rendere evidente quando il filtro mostra risultati completati.
- [ ] **UX-034** — Mostrare il periodo corrente vicino ai comandi di navigazione temporale.
- [ ] **UX-035** — Distinguere il cambio periodo dal cambio gruppo.
- [ ] **UX-036** — Rendere visibile l'azione di chiusura dei dialoghi.
- [ ] **UX-037** — Non aprire più dialoghi principali sovrapposti nello stesso flusso.
- [ ] **UX-038** — Mantenere funzionante il pulsante Indietro nei percorsi supportati.
- [ ] **UX-039** — Mostrare una destinazione utile dopo l'eliminazione della risorsa aperta.
- [ ] **UX-040** — Non lasciare una schermata priva di azioni dopo l'uscita dal gruppo.

### Layout responsive e dimensioni (UX-041–UX-060)

- [ ] **UX-041** — Evitare scorrimento orizzontale della pagina a larghezza 320 pixel CSS.
- [ ] **UX-042** — Evitare scorrimento orizzontale della pagina a larghezza 360 pixel CSS.
- [ ] **UX-043** — Evitare scorrimento orizzontale della pagina a larghezza 390 pixel CSS.
- [ ] **UX-044** — Mantenere leggibile il layout a larghezza 430 pixel CSS.
- [ ] **UX-045** — Adattare la Home a un tablet di larghezza 768 pixel CSS.
- [ ] **UX-046** — Adattare la Home a un desktop di larghezza 1440 pixel CSS.
- [ ] **UX-047** — Mantenere accessibili i comandi in orientamento orizzontale del telefono.
- [ ] **UX-048** — Rispettare l'area sicura inferiore sui dispositivi con indicatore Home.
- [ ] **UX-049** — Rispettare l'area sicura superiore sui dispositivi con ritaglio schermo.
- [ ] **UX-050** — Non coprire l'ultimo contenuto con la barra flottante inferiore.
- [ ] **UX-051** — Permettere lo scorrimento verticale dei dialoghi più alti dello schermo.
- [ ] **UX-052** — Mantenere visibile la chiusura di un dialogo con tastiera aperta.
- [ ] **UX-053** — Adattare le griglie quando il testo è ingrandito al 200%.
- [ ] **UX-054** — Non sovrapporre testo e pulsanti con nomi gruppo lunghi.
- [ ] **UX-055** — Non sovrapporre quantità e prezzo con nomi prodotto lunghi.
- [ ] **UX-056** — Consentire l'andata a capo delle azioni nella riga delle liste.
- [ ] **UX-057** — Evitare il taglio del selettore dei gruppi su schermi stretti.
- [ ] **UX-058** — Limitare la larghezza delle righe testuali sui monitor ampi.
- [ ] **UX-059** — Mantenere spazi di separazione tra card anche su telefono piccolo.
- [ ] **UX-060** — Conservare i dati inseriti dopo una rotazione del dispositivo.

### Tipografia, colori e gerarchia (UX-061–UX-080)

- [ ] **UX-061** — Usare una gerarchia visiva distinta per titolo pagina e titolo sezione.
- [ ] **UX-062** — Mantenere coerenti i livelli tipografici tra i quattro moduli.
- [ ] **UX-063** — Usare un corpo di testo leggibile senza zoom su telefono.
- [ ] **UX-064** — Non troncare gli importi monetari per esigenze decorative.
- [ ] **UX-065** — Allineare in modo coerente importi confrontabili nello stesso riepilogo.
- [ ] **UX-066** — Distinguere un testo secondario da un comando disponibile.
- [ ] **UX-067** — Rendere i collegamenti riconoscibili anche senza differenze cromatiche.
- [ ] **UX-068** — Usare colore e testo per distinguere successo ed errore.
- [ ] **UX-069** — Usare un simbolo o testo oltre al colore per gli stati delle attività.
- [ ] **UX-070** — Garantire un contrasto obiettivo di almeno 4,5:1 per il testo ordinario.
- [ ] **UX-071** — Garantire un contrasto obiettivo di almeno 3:1 per i controlli essenziali.
- [ ] **UX-072** — Rendere leggibili le etichette dei pulsanti disabilitati.
- [ ] **UX-073** — Non usare testo molto piccolo per prezzi o scadenze importanti.
- [ ] **UX-074** — Mantenere coerente la formattazione della valuta in euro.
- [ ] **UX-075** — Usare formati di data non ambigui nel contesto italiano.
- [ ] **UX-076** — Distinguere chiaramente prezzo unitario e subtotale del prodotto.
- [ ] **UX-077** — Distinguere graficamente titolo prodotto e condizioni promozionali.
- [ ] **UX-078** — Non usare maiuscole estese per messaggi di errore lunghi.
- [ ] **UX-079** — Conservare significato e leggibilità quando i colori vengono rimossi.
- [ ] **UX-080** — Non sostituire testo informativo con un'icona priva di etichetta.

### Form e inserimento dati (UX-081–UX-100)

- [ ] **UX-081** — Associare a ogni campo un'etichetta persistente.
- [ ] **UX-082** — Non usare il solo placeholder come nome del campo.
- [ ] **UX-083** — Indicare i campi obbligatori prima dell'invio.
- [ ] **UX-084** — Mostrare l'errore vicino al campo che richiede correzione.
- [ ] **UX-085** — Conservare i valori validi dopo un errore di validazione.
- [ ] **UX-086** — Portare il focus sul primo errore dopo un invio non valido.
- [ ] **UX-087** — Consentire l'invio da tastiera nei form semplici.
- [ ] **UX-088** — Usare una tastiera numerica per la quantità dei prodotti.
- [ ] **UX-089** — Usare una tastiera adatta ai decimali per gli importi.
- [ ] **UX-090** — Usare una tastiera telefonica per il numero di accesso.
- [ ] **UX-091** — Consentire il completamento OTP previsto dal browser quando supportato.
- [ ] **UX-092** — Non cancellare il nome prodotto prima di un salvataggio accettato.
- [ ] **UX-093** — Rendere distinta l'azione Annulla dall'azione Salva.
- [ ] **UX-094** — Disabilitare il doppio invio durante il salvataggio del form.
- [ ] **UX-095** — Mostrare un esempio per i campi con formato poco evidente.
- [ ] **UX-096** — Distinguere quantità numerica e descrizione della confezione.
- [ ] **UX-097** — Mostrare l'unità di misura vicino al relativo valore.
- [ ] **UX-098** — Avvisare prima di abbandonare un form con modifiche non salvate.
- [ ] **UX-099** — Non spostare il pulsante di invio quando compare un errore breve.
- [ ] **UX-100** — Consentire la selezione e copia dei valori già inseriti.

### Feedback, caricamento ed errori (UX-101–UX-120)

- [ ] **UX-101** — Non mostrare messaggi periodici di sincronizzazione nella normale consultazione.
- [ ] **UX-102** — Non mostrare il conto alla rovescia del polling nella lista.
- [ ] **UX-103** — Mantenere stabile il layout durante la lettura periodica dei dati.
- [ ] **UX-104** — Mostrare un feedback per un'azione esplicita completata.
- [ ] **UX-105** — Distinguere un salvataggio locale da una condivisione non ancora riuscita.
- [ ] **UX-106** — Rendere persistenti gli errori che richiedono un'azione dell'utente.
- [ ] **UX-107** — Non usare soltanto un toast breve per un errore bloccante.
- [ ] **UX-108** — Offrire un'azione di riprova quando l'operazione può essere ritentata.
- [ ] **UX-109** — Spiegare se i dati inseriti sono stati conservati dopo un errore.
- [ ] **UX-110** — Evitare messaggi tecnici non interpretati nelle schermate principali.
- [ ] **UX-111** — Mostrare uno stato di caricamento quando non esiste ancora alcun dato.
- [ ] **UX-112** — Non far apparire una lista vuota mentre sta caricando una lista nota.
- [ ] **UX-113** — Distinguere nessun risultato da errore nel caricamento dei risultati.
- [ ] **UX-114** — Mostrare un messaggio dedicato alla memoria locale non disponibile.
- [ ] **UX-115** — Mostrare un messaggio dedicato all'invito non più utilizzabile.
- [ ] **UX-116** — Consentire di chiudere un avviso non bloccante.
- [ ] **UX-117** — Non rubare il focus per mostrare un aggiornamento non richiesto.
- [ ] **UX-118** — Evitare ripetizioni identiche di errori a ogni intervallo di polling.
- [ ] **UX-119** — Spiegare una modifica rifiutata perché la spesa è già stata chiusa.
- [ ] **UX-120** — Rendere riconoscibile l'azione distruttiva nella conferma richiesta.

### Liste e prodotti (UX-121–UX-140)

- [ ] **UX-121** — Mostrare il nome della lista aperta vicino al suo contenuto.
- [ ] **UX-122** — Rendere distinguibili selettore della lista e selettore del gruppo.
- [ ] **UX-123** — Rendere individuabile il comando Nuova lista senza scorrere tutti i prodotti.
- [ ] **UX-124** — Mostrare un esempio utile nello stato di lista vuota.
- [ ] **UX-125** — Rendere la spunta di acquisto identificabile per ciascun prodotto.
- [ ] **UX-126** — Mantenere visibile il nome durante l'animazione di spostamento del prodotto.
- [ ] **UX-127** — Spostare gli acquistati senza dissolvenze che facciano perdere il riferimento.
- [ ] **UX-128** — Rendere percepibile la differenza tra prodotto acquistato e da acquistare.
- [ ] **UX-129** — Mantenere disponibili i dettagli dei prodotti acquistati in forma espandibile.
- [ ] **UX-130** — Non nascondere il comando di riapertura di un prodotto ridotto.
- [ ] **UX-131** — Rendere meno e più distinguibili anche con etichette accessibili.
- [ ] **UX-132** — Mostrare la quantità corrente tra i relativi controlli.
- [ ] **UX-133** — Distinguere la rimozione del prodotto dalla diminuzione di quantità.
- [ ] **UX-134** — Non spostare il prodotto toccato prima che l'azione venga registrata.
- [ ] **UX-135** — Mantenere il focus su un controllo equivalente dopo il riordino.
- [ ] **UX-136** — Mostrare la stima del carrello senza coprire i primi prodotti.
- [ ] **UX-137** — Rendere comprensibile quali prodotti sono esclusi dalla stima.
- [ ] **UX-138** — Distinguere il collegamento di una vecchia lista dalla condivisione del link.
- [ ] **UX-139** — Mostrare che una lista chiusa non accetta altre modifiche.
- [ ] **UX-140** — Non riutilizzare come nuova lista un titolo precedente senza poterlo cambiare.

### Catalogo, offerte e ricerca (UX-141–UX-160)

- [ ] **UX-141** — Mostrare il campo di ricerca vicino ai filtri delle offerte.
- [ ] **UX-142** — Rendere visibile quale reparto è attualmente selezionato.
- [ ] **UX-143** — Rendere visibile quale filtro di validità è attivo.
- [ ] **UX-144** — Mostrare il numero di offerte trovate dopo la ricerca.
- [ ] **UX-145** — Distinguere numero di risultati e numero di card già visualizzate.
- [ ] **UX-146** — Mostrare il comando per caricare altri risultati quando necessario.
- [ ] **UX-147** — Distinguere le offerte future con un'etichetta testuale.
- [ ] **UX-148** — Distinguere le offerte scadute con un'etichetta testuale.
- [ ] **UX-149** — Mostrare la data limite vicino al prezzo dell'offerta.
- [ ] **UX-150** — Non mettere in secondo piano una condizione Fidelity indispensabile.
- [ ] **UX-151** — Rendere riconoscibile un'offerta già aggiunta alla lista.
- [ ] **UX-152** — Aggiornare l'etichetta Aggiungi dopo la selezione del prodotto.
- [ ] **UX-153** — Distinguere il comando Vedi sul volantino dal comando Aggiungi.
- [ ] **UX-154** — Mostrare un'immagine sostitutiva quando manca il ritaglio prodotto.
- [ ] **UX-155** — Mantenere proporzioni corrette del ritaglio fotografico.
- [ ] **UX-156** — Non tagliare il prezzo per allineare artificialmente le card.
- [ ] **UX-157** — Mostrare una spiegazione utile quando la ricerca non trova risultati.
- [ ] **UX-158** — Consentire l'azzeramento dei filtri senza ricaricare l'intera app.
- [ ] **UX-159** — Conservare la ricerca passando dalla lista al catalogo.
- [ ] **UX-160** — Evitare che il caricamento delle immagini sposti il pulsante toccato.

### Visualizzatore del volantino (UX-161–UX-180)

- [ ] **UX-161** — Mostrare il numero pagina prima delle aree selezionabili.
- [ ] **UX-162** — Rendere disponibili frecce e selettore pagina oltre allo swipe.
- [ ] **UX-163** — Esplicitare che un tap breve seleziona il prodotto.
- [ ] **UX-164** — Esplicitare che un secondo tap rimuove il prodotto già selezionato.
- [ ] **UX-165** — Consentire lo zoom senza attivare un prodotto involontariamente.
- [ ] **UX-166** — Consentire il trascinamento ingrandito senza cambiare pagina.
- [ ] **UX-167** — Non trasformare una pressione lunga in una selezione tardiva.
- [ ] **UX-168** — Mantenere leggibile il prezzo della pagina durante l'ingrandimento.
- [ ] **UX-169** — Rendere raggiungibile la chiusura del visualizzatore con una mano.
- [ ] **UX-170** — Mostrare un'alternativa testuale alle aree visive del volantino.
- [ ] **UX-171** — Rendere distinguibili le aree dei prodotti già selezionati.
- [ ] **UX-172** — Non coprire il prodotto con un indicatore di selezione opaco.
- [ ] **UX-173** — Non bloccare lo scorrimento verticale quando lo zoom non è necessario.
- [ ] **UX-174** — Mantenere la pagina corrente dopo l'aggiunta di un prodotto.
- [ ] **UX-175** — Rendere visibile l'errore di caricamento di una pagina immagine.
- [ ] **UX-176** — Consentire di passare oltre una pagina immagine non disponibile.
- [ ] **UX-177** — Disabilitare la freccia precedente sulla prima pagina.
- [ ] **UX-178** — Disabilitare la freccia successiva sull'ultima pagina.
- [ ] **UX-179** — Mostrare le condizioni promozionali senza confonderle con un prodotto.
- [ ] **UX-180** — Non chiudere il visualizzatore al solo cambio di orientamento del telefono.

### Agenda, attività e ricorrenze (UX-181–UX-200)

- [ ] **UX-181** — Distinguere in agenda data e orario dell'appuntamento.
- [ ] **UX-182** — Mostrare il luogo senza sovrapporlo ai comandi della risorsa.
- [ ] **UX-183** — Rendere visibile il responsabile dell'attività.
- [ ] **UX-184** — Distinguere una scadenza superata da una futura.
- [ ] **UX-185** — Mostrare un'etichetta per gli elementi senza data.
- [ ] **UX-186** — Rendere evidente la priorità senza affidarsi soltanto al colore.
- [ ] **UX-187** — Mostrare la ricorrenza con una descrizione comprensibile.
- [ ] **UX-188** — Spiegare quando verrà creata la successiva occorrenza.
- [ ] **UX-189** — Mostrare un segnale di riservatezza sugli appuntamenti privati.
- [ ] **UX-190** — Non esporre il titolo riservato nei riepiloghi condivisi.
- [ ] **UX-191** — Distinguere Completata da Annullata nelle attività.
- [ ] **UX-192** — Mostrare lo stato dell'attività durante una modifica.
- [ ] **UX-193** — Separare le note lunghe dalle azioni principali.
- [ ] **UX-194** — Consentire di leggere note lunghe senza perdere il titolo.
- [ ] **UX-195** — Mostrare la checklist interna con quantità completata e totale.
- [ ] **UX-196** — Evitare che il cambio del filtro temporale cancelli una ricerca attiva.
- [ ] **UX-197** — Rendere riconoscibile il comando di esportazione calendario.
- [ ] **UX-198** — Spiegare che l'ICS attuale usa eventi di giornata intera.
- [ ] **UX-199** — Non promettere una notifica push per un semplice promemoria interno.
- [ ] **UX-200** — Mostrare un'indicazione utile quando il periodo non contiene appuntamenti.

### Pagamenti, quote e rimborsi (UX-201–UX-220)

- [ ] **UX-201** — Mostrare importo e valuta insieme nel riepilogo della spesa domestica.
- [ ] **UX-202** — Distinguere il totale pagato dal totale ancora da pagare.
- [ ] **UX-203** — Rendere visibile il nome del pagatore della spesa.
- [ ] **UX-204** — Mostrare le quote prima di confermare una ripartizione.
- [ ] **UX-205** — Esplicitare l'eventuale differenza di un centesimo tra quote uguali.
- [ ] **UX-206** — Rendere comprensibili saldo a credito e saldo a debito.
- [ ] **UX-207** — Non usare il solo segno meno per descrivere un debito.
- [ ] **UX-208** — Mostrare la data di scadenza vicino allo stato del pagamento.
- [ ] **UX-209** — Distinguere Registrare pagamento da Registrare rimborso.
- [ ] **UX-210** — Mostrare debitore e destinatario nella conferma di rimborso.
- [ ] **UX-211** — Non proporre un rimborso quando il debito residuo è zero.
- [ ] **UX-212** — Spiegare perché una spesa con rimborsi non può essere modificata liberamente.
- [ ] **UX-213** — Mantenere leggibili importi di almeno otto cifre nel dettaglio.
- [ ] **UX-214** — Allineare le colonne numeriche nei prospetti delle quote.
- [ ] **UX-215** — Non mostrare importi vuoti come pagamenti di zero euro.
- [ ] **UX-216** — Rendere riconoscibile il filtro delle spese già pagate.
- [ ] **UX-217** — Mostrare un messaggio distinto quando non esistono spese nel gruppo.
- [ ] **UX-218** — Mostrare un messaggio distinto quando nessuna spesa corrisponde ai filtri.
- [ ] **UX-219** — Consentire la verifica delle note prima di confermare il pagamento.
- [ ] **UX-220** — Distinguere graficamente i rimborsi dagli acquisti del supermercato.

### Profilo, storico e backup (UX-221–UX-240)

- [ ] **UX-221** — Mostrare la modalità locale nel Profilo senza ambiguità.
- [ ] **UX-222** — Mostrare il nome dell'account senza usare un identificativo tecnico come titolo.
- [ ] **UX-223** — Distinguere i dati personali dai dati del gruppo nelle Impostazioni.
- [ ] **UX-224** — Rendere riconoscibile la funzione Esporta dati.
- [ ] **UX-225** — Mostrare il ripristino soltanto dove è effettivamente consentito.
- [ ] **UX-226** — Rendere il ripristino raggiungibile aprendo direttamente le Impostazioni locali.
- [ ] **UX-227** — Spiegare quali dati vengono sostituiti dal ripristino.
- [ ] **UX-228** — Spiegare quali dati non vengono ripristinati dal backup attuale.
- [ ] **UX-229** — Mostrare il limite di dimensione del file prima di importarlo.
- [ ] **UX-230** — Non mostrare un successo se la scrittura del backup ripristinato fallisce.
- [ ] **UX-231** — Rendere annullabile la conferma di sostituzione del backup.
- [ ] **UX-232** — Indicare che il backup può contenere collegamenti riservati.
- [ ] **UX-233** — Mostrare il mese selezionato sopra le statistiche della spesa.
- [ ] **UX-234** — Associare etichette leggibili ai mesi del grafico storico.
- [ ] **UX-235** — Fornire valori testuali oltre alle barre del grafico.
- [ ] **UX-236** — Distinguere stima dello scontrino e totale effettivamente pagato.
- [ ] **UX-237** — Mostrare lo stato di chiusura pendente nello storico.
- [ ] **UX-238** — Mostrare le foto storiche senza deformarne le proporzioni.
- [ ] **UX-239** — Rendere leggibile il dettaglio dello scontrino con molti prodotti.
- [ ] **UX-240** — Mantenere il filtro dello storico dopo la chiusura del dettaglio.

### Accessibilità da tastiera e focus (UX-241–UX-260)

- [ ] **UX-241** — Rendere tutti i pulsanti raggiungibili tramite tastiera.
- [ ] **UX-242** — Rendere tutti i collegamenti raggiungibili tramite tastiera.
- [ ] **UX-243** — Rendere tutti i campi di input raggiungibili tramite tastiera.
- [ ] **UX-244** — Mantenere un ordine di tabulazione coerente con l'ordine visivo.
- [x] **UX-245** — Mostrare un indicatore di focus visibile sui controlli.
- [x] **UX-246** — Non rimuovere il focus visibile per esigenze decorative.
- [ ] **UX-247** — Consentire l'attivazione dei pulsanti con Invio o Spazio.
- [ ] **UX-248** — Consentire l'apertura delle offerte senza usare il mouse.
- [ ] **UX-249** — Consentire la selezione di un prodotto dal riepilogo testuale della pagina.
- [ ] **UX-250** — Portare il focus nel dialogo quando viene aperto.
- [ ] **UX-251** — Impedire al focus di uscire dietro un dialogo modale aperto.
- [ ] **UX-252** — Ripristinare il focus sul comando iniziale alla chiusura del dialogo.
- [ ] **UX-253** — Consentire la chiusura di un dialogo non bloccante con Escape.
- [ ] **UX-254** — Evitare trappole di tastiera nei controlli di quantità.
- [ ] **UX-255** — Non perdere il focus quando il polling aggiorna il contenuto.
- [ ] **UX-256** — Mantenere un focus utile dopo la rimozione di un prodotto.
- [ ] **UX-257** — Consentire la modifica del selettore liste con i tasti standard.
- [ ] **UX-258** — Consentire la modifica del selettore gruppi con i tasti standard.
- [ ] **UX-259** — Garantire che la barra fissa non nasconda l'elemento a fuoco.
- [ ] **UX-260** — Non rendere focalizzabili decorazioni prive di funzione.

### Lettori di schermo e semantica (UX-261–UX-280)

- [x] **UX-261** — Impostare la lingua italiana nel documento HTML corrente.
- [x] **UX-262** — Assegnare un titolo documento riconoscibile a ogni pagina principale.
- [ ] **UX-263** — Usare un'intestazione principale che descriva la schermata.
- [ ] **UX-264** — Mantenere coerente la gerarchia semantica delle intestazioni.
- [ ] **UX-265** — Associare etichette accessibili ai pulsanti costituiti da sole icone.
- [x] **UX-266** — Associare un nome accessibile alla spunta di ogni prodotto.
- [x] **UX-267** — Comunicare lo stato acquistato mediante attributi semantici.
- [ ] **UX-268** — Comunicare lo stato espanso dei dettagli del prodotto.
- [ ] **UX-269** — Comunicare la destinazione corrente della navigazione principale.
- [ ] **UX-270** — Associare i messaggi di errore ai relativi campi.
- [ ] **UX-271** — Annunciare gli errori bloccanti quando vengono mostrati.
- [ ] **UX-272** — Non annunciare ogni aggiornamento del polling come un nuovo messaggio.
- [ ] **UX-273** — Fornire testo alternativo alle foto prodotto informative.
- [ ] **UX-274** — Escludere dall'albero accessibile le icone puramente decorative.
- [ ] **UX-275** — Fornire un nome accessibile al visualizzatore del volantino.
- [x] **UX-276** — Rendere individuabili le regioni principali della pagina.
- [ ] **UX-277** — Descrivere i valori del grafico storico anche in forma testuale.
- [ ] **UX-278** — Mantenere le informazioni importanti disponibili quando le immagini non caricano.
- [ ] **UX-279** — Non inserire azioni indispensabili soltanto nei suggerimenti al passaggio del mouse.
- [ ] **UX-280** — Distinguere semanticamente una tabella dati da una griglia decorativa.

### Tocco, movimento e interazione mobile (UX-281–UX-300)

- [ ] **UX-281** — Prevedere un'area obiettivo di almeno 44 per 44 pixel CSS per le azioni primarie.
- [ ] **UX-282** — Separare i bersagli di tocco di aggiunta e rimozione.
- [ ] **UX-283** — Non attivare un prodotto al termine di un trascinamento.
- [ ] **UX-284** — Non attivare un prodotto al termine di un gesto annullato.
- [ ] **UX-285** — Non attivare un prodotto al termine di un pinch con due dita.
- [ ] **UX-286** — Non attivare un prodotto dopo una pressione lunga usata per scorrere.
- [ ] **UX-287** — Consentire un'alternativa ai gesti per ogni comando essenziale.
- [ ] **UX-288** — Non usare il solo swipe per rendere raggiungibile una pagina.
- [x] **UX-289** — Rispettare la preferenza di movimento ridotto nelle animazioni.
- [ ] **UX-290** — Non usare lampeggiamenti per segnalare il salvataggio.
- [ ] **UX-291** — Limitare l'animazione di riordino al movimento dell'elemento interessato.
- [ ] **UX-292** — Non animare la scala del testo durante lo spostamento dei prodotti.
- [ ] **UX-293** — Non bloccare il tocco mentre un'immagine secondaria sta caricando.
- [ ] **UX-294** — Mantenere raggiungibile il comando di invio con tastiera virtuale aperta.
- [ ] **UX-295** — Non inviare il form per un tocco sul comando Annulla.
- [ ] **UX-296** — Consentire la selezione del testo nelle note lunghe.
- [x] **UX-297** — Non disabilitare lo zoom dell'intera pagina nel viewport.
- [ ] **UX-298** — Evitare azioni distruttive al solo trascinamento accidentale.
- [ ] **UX-299** — Verificare la chiusura dei dialoghi con pulsante Indietro Android dove supportato.
- [ ] **UX-300** — Mantenere l'interfaccia utilizzabile con scorrimento inerziale del telefono.

## Robustezza — 300 requisiti

### Autorizzazioni e isolamento dei gruppi (ROB-001–ROB-020)

- [ ] **ROB-001** — Verificare sul server l'appartenenza per ogni lettura di un gruppo.
- [ ] **ROB-002** — Verificare sul server l'appartenenza per ogni modifica di un gruppo.
- [ ] **ROB-003** — Rifiutare la lettura di un gruppo alterando soltanto il suo identificativo.
- [ ] **ROB-004** — Rifiutare la creazione di risorse in un gruppo estraneo.
- [ ] **ROB-005** — Rifiutare la modifica di risorse appartenenti a un altro gruppo.
- [ ] **ROB-006** — Rifiutare il trasferimento implicito di una risorsa cambiandone il gruppo.
- [ ] **ROB-007** — Verificare sul server il ruolo richiesto per una promozione.
- [ ] **ROB-008** — Verificare sul server il ruolo richiesto per una rimozione membro.
- [ ] **ROB-009** — Impedire la rimozione dell'ultimo proprietario senza un successore.
- [ ] **ROB-010** — Applicare i cambi di ruolo alle richieste successive.
- [ ] **ROB-011** — Escludere gli appuntamenti riservati dalle risposte ai membri non autorizzati.
- [ ] **ROB-012** — Escludere gli appuntamenti riservati dagli inviti condivisi non consentiti.
- [ ] **ROB-013** — Impedire l'accesso diretto anonimo alle tabelle private.
- [ ] **ROB-014** — Impedire l'accesso diretto autenticato alle tabelle private non concesse.
- [ ] **ROB-015** — Limitare i privilegi delle funzioni pubbliche a quelli necessari.
- [ ] **ROB-016** — Impostare esplicitamente il percorso degli schemi nelle funzioni privilegiate.
- [ ] **ROB-017** — Non considerare il solo nascondimento dei pulsanti come autorizzazione.
- [ ] **ROB-018** — Distinguere i permessi dei nuovi inviti dai token storici della Spesa.
- [ ] **ROB-019** — Documentare la mancata revoca automatica dei token storici della Spesa.
- [ ] **ROB-020** — Verificare che l'uscita dal gruppo ne impedisca l'accesso alle RPC protette.

### Sicurezza dell'autenticazione (ROB-021–ROB-040)

- [ ] **ROB-021** — Usare un verifier casuale per ogni tentativo OAuth.
- [ ] **ROB-022** — Usare una challenge S256 per il flusso OAuth supportato.
- [ ] **ROB-023** — Non avviare uno scambio OAuth senza verifier disponibile.
- [ ] **ROB-024** — Rifiutare un tentativo OAuth scaduto.
- [ ] **ROB-025** — Rimuovere il codice OAuth dall'URL dopo la gestione del callback.
- [ ] **ROB-026** — Non inserire codici OAuth nella cache del service worker.
- [ ] **ROB-027** — Non inserire refresh token nei log applicativi.
- [ ] **ROB-028** — Non inserire chiavi amministrative nel frontend distribuito.
- [ ] **ROB-029** — Non pubblicare segreti OAuth nel repository.
- [ ] **ROB-030** — Serializzare il rinnovo della sessione nella stessa istanza.
- [ ] **ROB-031** — Usare un coordinamento tra schede per il refresh quando disponibile.
- [ ] **ROB-032** — Non ripristinare una sessione dopo un logout e un refresh tardivo.
- [ ] **ROB-033** — Conservare la sessione per un nuovo tentativo dopo un errore di rete temporaneo.
- [ ] **ROB-034** — Eliminare l'identità quando il servizio conferma un refresh non valido.
- [ ] **ROB-035** — Rifiutare callback che tentano di deviare verso un dominio esterno.
- [ ] **ROB-036** — Persistire il limite di reinvio OTP tra ricaricamenti.
- [ ] **ROB-037** — Rispettare il tempo di attesa comunicato dal servizio SMS.
- [ ] **ROB-038** — Non mostrare accesso riuscito se la sessione non può essere salvata.
- [ ] **ROB-039** — Non autenticare un utente nuovo attraverso dati offline non verificati.
- [ ] **ROB-040** — Non unire identità soltanto perché dichiarano la stessa email.

### Token, link e inviti (ROB-041–ROB-060)

- [x] **ROB-041** — Generare token di condivisione con una sorgente crittografica casuale.
- [x] **ROB-042** — Usare token lista con almeno 256 bit di entropia.
- [ ] **ROB-043** — Conservare nel database soltanto l'hash del token lista.
- [ ] **ROB-044** — Verificare l'hash del token prima di leggere i prodotti.
- [ ] **ROB-045** — Verificare l'hash del token prima di applicare un'operazione.
- [x] **ROB-046** — Rifiutare identificativi lista non conformi al formato previsto.
- [x] **ROB-047** — Rifiutare token incompleti o con caratteri non ammessi.
- [ ] **ROB-048** — Conservare i token privati nel frammento dei collegamenti condivisi.
- [ ] **ROB-049** — Non trasmettere il frammento all'hosting statico tramite richieste HTTP.
- [ ] **ROB-050** — Impostare una politica di referrer che non esponga collegamenti riservati.
- [ ] **ROB-051** — Verificare la scadenza dell'invito sul server.
- [ ] **ROB-052** — Verificare la revoca dell'invito sul server.
- [ ] **ROB-053** — Verificare il permesso ospite a ogni modifica della risorsa.
- [ ] **ROB-054** — Non permettere a un ospite di enumerare altri inviti.
- [ ] **ROB-055** — Non permettere a un ospite di enumerare i membri del gruppo.
- [ ] **ROB-056** — Rifiutare i riferimenti Spesa diretti verso domini estranei.
- [ ] **ROB-057** — Rifiutare i riferimenti Spesa diretti a percorsi diversi dal modulo previsto.
- [ ] **ROB-058** — Non riutilizzare un token per autorizzare un diverso identificativo lista.
- [ ] **ROB-059** — Documentare che una copia già letta non viene cancellata dalla revoca.
- [ ] **ROB-060** — Consentire la rotazione futura di un token lista senza riutilizzare quello vecchio.

### Idempotenza e integrità delle scritture (ROB-061–ROB-080)

- [ ] **ROB-061** — Assegnare un identificativo stabile a ogni operazione della lista.
- [ ] **ROB-062** — Non duplicare un prodotto ripetendo la stessa operazione di aggiunta.
- [ ] **ROB-063** — Non duplicare una risorsa ripetendo il medesimo salvataggio iniziale.
- [ ] **ROB-064** — Non modificare una lista esistente ritentandone la creazione autorizzata.
- [ ] **ROB-065** — Rifiutare la creazione con identificativo esistente e token diverso.
- [ ] **ROB-066** — Conservare i tombstone dei prodotti eliminati.
- [ ] **ROB-067** — Non resuscitare un prodotto eliminato tramite una spunta ritardata.
- [ ] **ROB-068** — Applicare in ordine le operazioni della coda di una lista.
- [ ] **ROB-069** — Rimuovere dalla coda soltanto le operazioni confermate dal server.
- [ ] **ROB-070** — Conservare l'operazione se il salvataggio locale della conferma fallisce.
- [ ] **ROB-071** — Conservare un identificativo stabile per l'associazione lista-gruppo.
- [ ] **ROB-072** — Ritentare l'associazione al gruppo dopo un'interruzione della risposta.
- [ ] **ROB-073** — Non duplicare l'associazione lista-gruppo dopo una risposta persa.
- [ ] **ROB-074** — Non contrassegnare come condivisa una lista non ancora pubblicata.
- [ ] **ROB-075** — Gestire la chiusura ripetuta di una lista come la stessa chiusura.
- [ ] **ROB-076** — Conservare il primo totale confermato dopo una chiusura idempotente.
- [ ] **ROB-077** — Non duplicare uno scontrino durante i tentativi di sincronizzazione.
- [ ] **ROB-078** — Eseguire atomicamente le modifiche multiple che richiedono un'unica conferma.
- [ ] **ROB-079** — Annullare l'intera variazione locale di quantità se il salvataggio fallisce.
- [ ] **ROB-080** — Registrare l'esito del salvataggio prima di presentarlo come definitivo.

### Concorrenza e conflitti (ROB-081–ROB-100)

- [ ] **ROB-081** — Serializzare sul server le operazioni sulla stessa lista.
- [ ] **ROB-082** — Verificare la versione attesa prima di modificare una risorsa condivisa.
- [ ] **ROB-083** — Rifiutare una modifica basata su una versione superata.
- [ ] **ROB-084** — Non sovrascrivere silenziosamente le modifiche remote in conflitto.
- [ ] **ROB-085** — Conservare le modifiche locali rifiutate per poterle recuperare.
- [ ] **ROB-086** — Usare uno snapshot aggiornato per ricostruire lo stato della lista.
- [ ] **ROB-087** — Mantenere le modifiche di un altro membro durante il replay della coda.
- [ ] **ROB-088** — Bloccare il cambio lista durante una richiesta che usa lo stato corrente.
- [ ] **ROB-089** — Associare ogni risposta alla lista effettivamente richiesta.
- [ ] **ROB-090** — Non applicare una risposta del gruppo precedente al gruppo appena selezionato.
- [ ] **ROB-091** — Non applicare una risposta del vecchio account dopo il cambio identità.
- [ ] **ROB-092** — Confrontare lo stato atteso prima di chiudere una spesa condivisa.
- [ ] **ROB-093** — Rifiutare la chiusura se un altro membro ha cambiato i prodotti.
- [ ] **ROB-094** — Impedire nuove modifiche server dopo la chiusura della spesa.
- [ ] **ROB-095** — Conservare i retry già accettati anche dopo la chiusura della spesa.
- [ ] **ROB-096** — Gestire due creazioni contemporanee della stessa risorsa senza duplicati.
- [ ] **ROB-097** — Gestire due tentativi contemporanei di adesione senza duplicare il membro.
- [ ] **ROB-098** — Segnalare scritture concorrenti della memoria locale tra schede.
- [ ] **ROB-099** — Impedire scritture locali ulteriori dopo il rilevamento di una scheda concorrente.
- [ ] **ROB-100** — Documentare la regola di prevalenza per spunte arrivate in ordine diverso.

### Sincronizzazione e recupero offline (ROB-101–ROB-120)

- [ ] **ROB-101** — Eseguire il polling delle liste ogni 30 secondi quando la pagina è visibile.
- [ ] **ROB-102** — Non mantenere un secondo timer che impedisca la scoperta delle liste.
- [ ] **ROB-103** — Scoprire le liste create da altri membri durante la sessione aperta.
- [ ] **ROB-104** — Inviare subito le modifiche locali quando la rete è disponibile.
- [ ] **ROB-105** — Conservare la coda quando il dispositivo passa offline.
- [ ] **ROB-106** — Ritentare le modifiche al ritorno della connessione.
- [ ] **ROB-107** — Rileggere lo stato remoto quando la pagina ritorna visibile.
- [ ] **ROB-108** — Non avviare più cicli completi di aggiornamento in parallelo.
- [ ] **ROB-109** — Non lasciare un flag di richiesta attiva dopo un errore.
- [ ] **ROB-110** — Non bloccare l'invio prodotti per un errore nella scoperta dei gruppi.
- [ ] **ROB-111** — Sincronizzare le code pendenti delle altre liste dello stesso account.
- [ ] **ROB-112** — Conservare la selezione corrente durante il recupero delle altre code.
- [ ] **ROB-113** — Conservare una pubblicazione lista-gruppo pendente dopo il reload.
- [ ] **ROB-114** — Non scartare la chiusura locale quando manca la RPC di chiusura.
- [ ] **ROB-115** — Ritentare la chiusura pendente dopo l'attivazione del backend necessario.
- [ ] **ROB-116** — Riaprire offline soltanto i dati già autorizzati e salvati.
- [ ] **ROB-117** — Non dichiarare online un salvataggio rimasto soltanto nella memoria locale.
- [ ] **ROB-118** — Limitare la quantità di operazioni inviate in un singolo ciclo.
- [ ] **ROB-119** — Non ritentare indefinitamente un errore di autorizzazione senza segnalarlo.
- [ ] **ROB-120** — Permettere il recupero dopo un periodo offline superiore a una sessione.

### Memoria locale e separazione account (ROB-121–ROB-140)

- [ ] **ROB-121** — Separare le chiavi delle sessioni per progetto Supabase.
- [ ] **ROB-122** — Separare le risorse locali dalle risorse del singolo account.
- [ ] **ROB-123** — Separare le code pendenti di account diversi.
- [ ] **ROB-124** — Conservare il proprietario logico delle liste nella cache.
- [ ] **ROB-125** — Non caricare dati locali nel primo account che accede automaticamente.
- [ ] **ROB-126** — Svuotare lo stato visualizzato prima di caricare un diverso account.
- [ ] **ROB-127** — Reagire al cambio sessione notificato da un'altra scheda.
- [ ] **ROB-128** — Non copiare appuntamenti riservati nella memoria offline condivisa.
- [ ] **ROB-129** — Non perdere il vecchio archivio locale durante la migrazione del nome app.
- [ ] **ROB-130** — Preferire il nuovo archivio se esistono entrambe le chiavi storiche.
- [ ] **ROB-131** — Validare il JSON locale prima di usarlo come database dell'app.
- [ ] **ROB-132** — Gestire esplicitamente il rifiuto di accesso a localStorage.
- [ ] **ROB-133** — Gestire esplicitamente la quota locale esaurita.
- [ ] **ROB-134** — Non sostituire i dati persistiti dopo una scrittura locale fallita.
- [ ] **ROB-135** — Conservare lo stato precedente se un ripristino non può essere scritto.
- [ ] **ROB-136** — Non eliminare code pendenti al semplice aggiornamento della PWA.
- [ ] **ROB-137** — Documentare la perdita dei dati locali quando si cancella la memoria del sito.
- [ ] **ROB-138** — Non presumere che la memoria venga trasferita cambiando dominio.
- [ ] **ROB-139** — Non presumere che la memoria venga trasferita cambiando percorso dell'app.
- [ ] **ROB-140** — Consentire un recupero controllato da un archivio locale corrotto.

### Service worker e cache PWA (ROB-141–ROB-160)

- [ ] **ROB-141** — Versionare la cache secondo il contenuto della build.
- [ ] **ROB-142** — Includere il codice del service worker nel calcolo della versione.
- [ ] **ROB-143** — Precaricare soltanto le risorse essenziali per l'avvio offline.
- [ ] **ROB-144** — Scaricare le pagine pesanti dei volantini quando vengono consultate.
- [ ] **ROB-145** — Non bloccare l'installazione della shell per un volantino non disponibile.
- [x] **ROB-146** — Limitare la cache ai percorsi statici esplicitamente ammessi.
- [x] **ROB-147** — Non memorizzare navigazioni personalizzate nella cache.
- [x] **ROB-148** — Non memorizzare URL con query potenzialmente riservate.
- [x] **ROB-149** — Non intercettare richieste verso l'origine Supabase come risorse statiche.
- [x] **ROB-150** — Non memorizzare richieste che includono autorizzazione.
- [x] **ROB-151** — Non memorizzare risposte dichiarate private.
- [x] **ROB-152** — Non memorizzare risposte dichiarate no-store.
- [x] **ROB-153** — Non memorizzare redirect come contenuto statico atteso.
- [x] **ROB-154** — Non mescolare script di build diverse nella stessa cache attiva.
- [x] **ROB-155** — Usare la shell Home come ripiego per la navigazione Home offline.
- [x] **ROB-156** — Usare la shell Spesa come ripiego per la navigazione Spesa offline.
- [ ] **ROB-157** — Eliminare le vecchie cache dell'app dopo l'attivazione della nuova versione.
- [ ] **ROB-158** — Non eliminare cache appartenenti ad altre applicazioni della stessa origine.
- [ ] **ROB-159** — Evitare un ciclo infinito di reload durante il cambio di worker.
- [ ] **ROB-160** — Conservare i dati applicativi durante l'attivazione del nuovo worker.

### Validazione e sicurezza dei backup (ROB-161–ROB-180)

- [x] **ROB-161** — Rifiutare un file di importazione superiore a 2 MB.
- [x] **ROB-162** — Rifiutare un file che non contiene JSON leggibile.
- [x] **ROB-163** — Rifiutare un backup con formato dichiarato non supportato.
- [x] **ROB-164** — Rifiutare un backup con versione dello schema non supportata.
- [x] **ROB-165** — Accettare gli export storici previsti dalla compatibilità dichiarata.
- [x] **ROB-166** — Rifiutare proprietà pericolose anche dentro oggetti annidati.
- [x] **ROB-167** — Rifiutare strutture con profondità superiore al limite stabilito.
- [x] **ROB-168** — Rifiutare gruppi con identificativi duplicati nel backup.
- [x] **ROB-169** — Rifiutare risorse associate a gruppi non dichiarati nel backup.
- [x] **ROB-170** — Rifiutare un gruppo privo del relativo snapshot.
- [x] **ROB-171** — Rifiutare identificativi risorsa duplicati nello stesso snapshot.
- [x] **ROB-172** — Rifiutare campi testuali con valori di tipo non testuale.
- [x] **ROB-173** — Rifiutare date formalmente scritte ma inesistenti nel calendario.
- [x] **ROB-174** — Rifiutare quote con importi negativi o non interi.
- [x] **ROB-175** — Rifiutare rimborsi con strutture non supportate.
- [x] **ROB-176** — Rifiutare appuntamenti riservati in un backup da ripristinare localmente.
- [x] **ROB-177** — Normalizzare i membri ripristinati secondo il modello locale.
- [x] **ROB-178** — Non ripristinare autorizzazioni remote dichiarate dal file importato.
- [x] **ROB-179** — Interrompere il ripristino se cambia la sessione durante la lettura del file.
- [x] **ROB-180** — Non alterare i dati correnti se l'utente annulla la conferma finale.

### Validazione degli input e risorse esterne (ROB-181–ROB-200)

- [x] **ROB-181** — Rifiutare titoli vuoti dopo la rimozione degli spazi marginali.
- [x] **ROB-182** — Rifiutare titoli oltre la lunghezza ammessa per la risorsa.
- [ ] **ROB-183** — Rifiutare nomi prodotto oltre la lunghezza ammessa.
- [ ] **ROB-184** — Rifiutare quantità numeriche inferiori al minimo consentito.
- [ ] **ROB-185** — Rifiutare quantità numeriche superiori al massimo consentito.
- [ ] **ROB-186** — Rifiutare quantità frazionarie quando il controllo ammette solo unità intere.
- [x] **ROB-187** — Rifiutare importi monetari negativi nei form che non prevedono storni.
- [x] **ROB-188** — Rifiutare importi con più di due cifre decimali.
- [x] **ROB-189** — Calcolare gli importi monetari in centesimi interi.
- [x] **ROB-190** — Verificare che la somma delle quote corrisponda al totale.
- [x] **ROB-191** — Rifiutare schemi URL eseguibili nei riferimenti esterni.
- [x] **ROB-192** — Accettare soltanto origini consentite per le fonti del catalogo.
- [x] **ROB-193** — Accettare soltanto percorsi locali previsti per le immagini del volantino.
- [x] **ROB-194** — Rifiutare ritagli immagine che superano i bordi della pagina.
- [x] **ROB-195** — Rifiutare dimensioni di ritaglio nulle o negative.
- [ ] **ROB-196** — Mostrare i nomi contenenti HTML come testo senza eseguirli.
- [ ] **ROB-197** — Evitare inserimenti HTML non sanitizzati nelle note degli utenti.
- [ ] **ROB-198** — Rifiutare CSV con riferimenti a pagine inesistenti.
- [ ] **ROB-199** — Rifiutare CSV incompleti senza pubblicare un catalogo parziale.
- [x] **ROB-200** — Non inventare un prezzo zero quando la fonte riporta solo uno sconto.

### Schema SQL e migrazioni (ROB-201–ROB-220)

- [ ] **ROB-201** — Conservare migrazioni incrementali versionate nel repository.
- [ ] **ROB-202** — Applicare le migrazioni di test a un database vuoto con ruoli previsti.
- [ ] **ROB-203** — Verificare la ripetibilità delle migrazioni dichiarate idempotenti.
- [ ] **ROB-204** — Conservare i dati esistenti durante una migrazione additiva.
- [ ] **ROB-205** — Gestire le migrazioni SQL in transazione quando tecnicamente applicabile.
- [ ] **ROB-206** — Verificare i permessi delle funzioni dopo ogni migrazione.
- [ ] **ROB-207** — Verificare le restrizioni delle tabelle dopo ogni migrazione.
- [ ] **ROB-208** — Aggiornare la cache dello schema API dopo la pubblicazione delle funzioni.
- [ ] **ROB-209** — Distinguere schema di base e migrazioni incrementali nelle istruzioni.
- [ ] **ROB-210** — Non rieseguire alla cieca uno schema iniziale sul database operativo.
- [ ] **ROB-211** — Documentare le dipendenze tra migrazioni.
- [ ] **ROB-212** — Verificare la presenza delle RPC richieste prima di dichiarare attivo un modulo.
- [ ] **ROB-213** — Gestire una RPC mancante senza perdere le modifiche locali.
- [ ] **ROB-214** — Conservare i vincoli di unicità delle appartenenze ai gruppi.
- [ ] **ROB-215** — Conservare i vincoli delle versioni delle risorse.
- [ ] **ROB-216** — Conservare i vincoli di formato degli identificativi.
- [ ] **ROB-217** — Conservare i vincoli di validità degli scontrini chiusi.
- [ ] **ROB-218** — Documentare un piano di recupero per ogni migrazione non reversibile.
- [ ] **ROB-219** — Provare il ripristino del database in un ambiente separato.
- [ ] **ROB-220** — Non presentare il deploy statico come applicazione automatica delle migrazioni.

### Rete, timeout e dipendenze esterne (ROB-221–ROB-240)

- [ ] **ROB-221** — Impostare un timeout finito sulle richieste RPC del browser.
- [ ] **ROB-222** — Impostare un timeout finito sulle richieste di autenticazione.
- [ ] **ROB-223** — Liberare lo stato di caricamento quando scade un timeout.
- [ ] **ROB-224** — Distinguere errori di rete e rifiuti di autorizzazione.
- [ ] **ROB-225** — Distinguere una funzione API assente da una sessione scaduta.
- [ ] **ROB-226** — Gestire risposte JSON non leggibili senza arrestare l'app.
- [ ] **ROB-227** — Gestire una risposta HTTP senza corpo quando il contratto lo prevede.
- [ ] **ROB-228** — Gestire un errore temporaneo del servizio senza cancellare la sessione valida.
- [ ] **ROB-229** — Rispettare i limiti di frequenza comunicati dal servizio.
- [ ] **ROB-230** — Non ritentare automaticamente operazioni esterne non idempotenti senza protezione.
- [ ] **ROB-231** — Rilevare un provider disabilitato anche dopo una precedente configurazione valida.
- [ ] **ROB-232** — Mantenere utilizzabili le liste quando il catalogo non si carica.
- [ ] **ROB-233** — Mantenere consultabili i dati testuali quando manca una foto prodotto.
- [ ] **ROB-234** — Gestire un PDF esterno sostituito da una pagina di verifica HTML.
- [ ] **ROB-235** — Non sostituire un catalogo revisionato con un risultato di scoperta incompleto.
- [ ] **ROB-236** — Documentare il costo esterno prima di attivare un servizio SMS.
- [ ] **ROB-237** — Non abilitare API di analisi a pagamento senza configurazione esplicita.
- [ ] **ROB-238** — Non bloccare l'uso locale per un errore del servizio di autenticazione.
- [ ] **ROB-239** — Verificare il funzionamento dell'app sotto il percorso GitHub Pages effettivo.
- [ ] **ROB-240** — Non dipendere dall'orologio del dispositivo per concedere permessi remoti.

### Prestazioni e limiti operativi (ROB-241–ROB-260)

- [ ] **ROB-241** — Limitare i risultati iniziali del catalogo per evitare un DOM eccessivo.
- [ ] **ROB-242** — Caricare in modo differito le immagini prodotto non ancora visibili.
- [ ] **ROB-243** — Non ridisegnare integralmente una lista invariata a ogni lettura remota.
- [ ] **ROB-244** — Conservare una firma del contenuto per riconoscere aggiornamenti superflui.
- [ ] **ROB-245** — Non aumentare il numero dei timer a ogni cambio schermata.
- [ ] **ROB-246** — Non duplicare gli event listener a ogni apertura del visualizzatore.
- [ ] **ROB-247** — Liberare gli oggetti temporanei creati per i download.
- [ ] **ROB-248** — Limitare il numero delle operazioni offline pendenti secondo il contratto corrente.
- [ ] **ROB-249** — Segnalare il raggiungimento del limite di operazioni offline.
- [ ] **ROB-250** — Limitare il numero dei prodotti per lista secondo il vincolo server.
- [ ] **ROB-251** — Segnalare quando occorre creare una nuova lista per raggiunto limite.
- [x] **ROB-252** — Limitare il numero di gruppi accettati nel ripristino backup.
- [x] **ROB-253** — Limitare il numero di risorse accettate nel ripristino backup.
- [ ] **ROB-254** — Non bloccare l'interazione durante il solo caricamento di immagini secondarie.
- [ ] **ROB-255** — Definire un dispositivo e un catalogo di riferimento per le misure prestazionali.
- [ ] **ROB-256** — Misurare il tempo di apertura della Home sulla configurazione di riferimento.
- [ ] **ROB-257** — Misurare il tempo di ricerca nel catalogo sulla configurazione di riferimento.
- [ ] **ROB-258** — Misurare il consumo della cache dopo la consultazione di tutte le pagine.
- [ ] **ROB-259** — Verificare l'assenza di crescita continua della memoria dopo navigazioni ripetute.
- [ ] **ROB-260** — Prevedere un caricamento progressivo per storici con molti scontrini.

### Test, regressioni e integrazione continua (ROB-261–ROB-280)

- [x] **ROB-261** — Eseguire la suite JavaScript prima della pubblicazione automatica.
- [x] **ROB-262** — Eseguire la suite Python prima della pubblicazione automatica.
- [x] **ROB-263** — Eseguire una build di produzione prima del deploy.
- [x] **ROB-264** — Bloccare il job di deploy se il job di build fallisce.
- [x] **ROB-265** — Installare le dipendenze CI dal lockfile versionato.
- [x] **ROB-266** — Verificare l'allineamento della versione tra manifest di pacchetto e lockfile.
- [x] **ROB-267** — Testare le funzioni pure senza richiedere credenziali remote.
- [x] **ROB-268** — Testare le RPC SQL su PostgreSQL locale con ruoli realistici.
- [ ] **ROB-269** — Testare l'isolamento tra due membri e un utente estraneo.
- [ ] **ROB-270** — Testare le operazioni idempotenti con una risposta persa.
- [ ] **ROB-271** — Testare il recupero delle code dopo un periodo offline.
- [ ] **ROB-272** — Testare la conservazione delle foto dopo il cambio edizione del catalogo.
- [ ] **ROB-273** — Testare il rifiuto dei backup malevoli prima del ripristino.
- [ ] **ROB-274** — Testare l'esclusione di callback e dati dinamici dalla cache.
- [x] **ROB-275** — Conservare scenari browser ripetibili per i principali flussi utente.
- [x] **ROB-276** — Integrare in CI i test browser prima di considerarli controlli automatici obbligatori.
- [ ] **ROB-277** — Conservare baseline grafiche revisionate prima di usare confronti screenshot.
- [x] **ROB-278** — Conservare evidenze di errore dei test browser falliti.
- [ ] **ROB-279** — Aggiungere una prova di regressione ripetibile per ogni bug critico corretto.
- [x] **ROB-280** — Collegare i test di accettazione agli identificativi dei requisiti verificati.

### Rilasci, osservabilità e gestione dei dati (ROB-281–ROB-300)

- [ ] **ROB-281** — Mostrare la versione applicativa effettiva nel footer distribuito.
- [ ] **ROB-282** — Mostrare un identificativo build corrispondente alla cache generata.
- [ ] **ROB-283** — Rimuovere i segnaposto di versione dagli HTML di produzione.
- [ ] **ROB-284** — Ripulire la cartella di build prima di generare un nuovo artefatto.
- [ ] **ROB-285** — Non includere archivi personali nel commit di rilascio.
- [ ] **ROB-286** — Non includere file di configurazione segreti nell'artefatto pubblico.
- [ ] **ROB-287** — Verificare l'esito del workflow dopo un push di pubblicazione.
- [ ] **ROB-288** — Verificare la versione servita dal sito dopo il deploy.
- [ ] **ROB-289** — Conservare note di rilascio con modifiche e limiti noti.
- [ ] **ROB-290** — Documentare i passaggi esterni non eseguiti dal workflow.
- [ ] **ROB-291** — Conservare una procedura di ritorno a una release precedente.
- [ ] **ROB-292** — Verificare che il ritorno di versione non renda illeggibili i dati locali.
- [ ] **ROB-293** — Registrare gli errori senza includere token o contenuti privati.
- [ ] **ROB-294** — Permettere la segnalazione di un problema con versione e passaggi riproducibili.
- [ ] **ROB-295** — Definire il periodo di conservazione dei dati personali prima dell'uso commerciale.
- [ ] **ROB-296** — Documentare quali dati sono locali e quali sono nel servizio condiviso.
- [ ] **ROB-297** — Consentire una richiesta tracciabile di esportazione o cancellazione dei dati personali.
- [ ] **ROB-298** — Documentare che un backup esportato deve essere conservato come dato riservato.
- [ ] **ROB-299** — Verificare periodicamente il recupero da backup senza usare dati reali nei test.
- [ ] **ROB-300** — Non dichiarare certificazioni, conformità o collaudi remoti non effettivamente eseguiti.
