# Accettazione requisiti — 0.3.2

Data: 20 novembre 2026. Commit: quello che introduce il verbale (`git log -- docs/ACCETTAZIONE_0.3.2.md`). Base: 0.3.1, commit 8c69c7c.

**102 ulteriori requisiti del catalogo originario accettati, più FUN-401 aggiunto su richiesta: 103 in questo blocco.** In totale il catalogo originario ha 114/1000 accettazioni; FUN-401 resta separato per conservarne esattamente mille righe. Non sono 103 funzioni nuove: la maggioranza era già presente e ora ha evidenza ripetibile. Le righe «Nuovo / rafforzato» identificano le implementazioni o le correzioni di questo rilascio.

## Modifiche nuove

- FUN-401: barra orizzontale di pulsanti a pillola al posto del select liste. Selezione `aria-pressed`, controlli da almeno 46 px, overflow contenuto nella barra, navigazione frecce/Home/End e Invio/Spazio nativi. La firma dei nomi evita ricostruzioni inutili e conserva il focus durante aggiornamenti invariati. Scelta attiva mantenuta dopo ricarica; ogni lista conserva i propri prodotti. I nomi HTML sono trattati come testo.
- FUN-380: anteprima backup con gruppi e quantità attuali/in arrivo, avviso dello storico non importato e conferma esplicita; annullamento senza scritture. Controllo sessione sia dopo la lettura sia alla conferma; rollback su errore di persistenza mantenuto.
- FUN-159: ripristino delle preferenze predefinite con salvataggio e rollback se la memoria rifiuta la scrittura.
- Validazione risorse: titoli non testuali, date di calendario inesistenti, quote/rimborsi negativi o frazionari vengono rifiutati anche dal validatore comune ai moduli, oltre che dal backup.
- FUN-297: avviso delle unità senza prezzo di nuovo visibile; il CSS precedente lo nascondeva.
- Corretto il gruppo attivo dello spazio locale iniziale: ora il suo ID viene persistito insieme allo snapshot. Coperto dalle prove su filtri Home e ricorrenze dopo ricarica, senza accettare requisiti aggiuntivi fuori dalla matrice.

## Ambiente, prove e limiti

Node 24.22.2, Python 3.14.2, Playwright 1.65.1 con Chromium desktop e Pixel 7 emulato. La CI ripete le prove su Node 22 e Python 3.12. 150 casi JavaScript totali, di cui 85 casi dedicati nella suite `requirements.test.mjs`, più 21 nuovi scenari browser eseguiti su due configurazioni; con i sei scenari precedenti il totale è 54 esecuzioni browser. Per vedere i singoli casi locali anche quando il runner aggrega per file: `node --test --test-isolation=none --test-reporter=spec tests/requirements.test.mjs`.

Esito locale: suite JavaScript, 7 test Python, 54 prove browser e build superati. Il workflow Pages ripete tutti i controlli prima del deploy. Tracce e screenshot di errore restano locali/artefatti CI, mai inseriti in Git; schermate slider controllate anche visivamente, senza baseline pixel.

Le prove con richieste/configurazioni simulate dimostrano il comportamento locale. Non attestano provider reali, permessi effettivi del progetto Supabase remoto, telefoni fisici, Safari o Firefox. I requisiti CI sono accettati sulla configurazione del workflow e sul suo passaggio; ROB-268 include l'esecuzione della suite PostgreSQL PGlite con ruoli anon/authenticated. Non vengono eseguite migrazioni o scritture sui dati di produzione.

## Matrice requisito → prova

I test sono identificati con gli ID nelle descrizioni. Per i cicli parametrizzati, ogni tupla genera un caso distinto. I controlli browser complementano quelli puri per i requisiti di visualizzazione. Tutte le righe sotto hanno esito **superato** nel contesto e con i limiti sopra.

| ID | Requisito | Intervento | Prova ripetibile |
| --- | --- | --- | --- |
| FUN-126 | Filtrare i riepiloghi della Home sul giorno corrente. | Esistente, collaudato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-127 | Filtrare i riepiloghi sulla settimana selezionata. | Esistente, collaudato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-128 | Filtrare i riepiloghi sul mese selezionato. | Esistente, collaudato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-132 | Includere gli elementi non programmati nei riepiloghi appropriati. | Esistente, collaudato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-133 | Mantenere visibili gli elementi arretrati non completati. | Esistente, collaudato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-159 | Consentire il ripristino delle preferenze predefinite. | Nuovo / rafforzato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-181 | Impostare una ricorrenza giornaliera per un'attività. | Esistente, collaudato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-182 | Impostare una ricorrenza settimanale per un'attività. | Esistente, collaudato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-183 | Impostare una ricorrenza mensile per un'attività. | Esistente, collaudato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-184 | Impostare una ricorrenza bimestrale per un'attività. | Esistente, collaudato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-185 | Impostare una ricorrenza trimestrale per un'attività. | Esistente, collaudato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-186 | Impostare una ricorrenza annuale per un'attività. | Esistente, collaudato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-187 | Rimuovere la ricorrenza da un'attività. | Esistente, collaudato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-286 | Raggruppare le unità equivalenti dello stesso prodotto. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-295 | Mostrare la stima totale del carrello. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-296 | Distinguere nella stima acquistati e prodotti ancora da acquistare. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-297 | Segnalare i prodotti senza prezzo esclusi dalla stima. | Nuovo / rafforzato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-306 | Mostrare soltanto le offerte valide oggi su richiesta. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-307 | Mostrare insieme le offerte in corso e quelle future su richiesta. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-308 | Includere le offerte scadute soltanto con un filtro esplicito. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-311 | Mostrare il prezzo per unità di misura quando presente. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-313 | Mostrare uno sconto percentuale senza inventare il prezzo finale. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-336 | Conservare il ritaglio fotografico del prodotto già salvato. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| FUN-346 | Conservare nel dettaglio anche i prodotti non acquistati. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| FUN-348 | Conservare quantità e prezzi nello scontrino storico. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| FUN-349 | Conservare le foto dei prodotti nello scontrino storico. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| FUN-353 | Mostrare il totale pagato nel periodo selezionato. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-354 | Mostrare il numero di spese concluse nel periodo. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-355 | Mostrare la media per spesa nel periodo selezionato. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-356 | Mostrare l'andamento dei sei mesi previsti dal riepilogo. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-358 | Distinguere il totale pagato dalla stima dei prezzi annotati. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-362 | Includere formato e versione dello schema nel backup esportato. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| FUN-363 | Includere la data di esportazione nel backup. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| FUN-364 | Includere i gruppi locali nel backup. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| FUN-365 | Includere le attività locali nel backup. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| FUN-366 | Includere il profilo locale nel backup. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| FUN-367 | Includere le preferenze locali nel backup. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| FUN-372 | Ripristinare i gruppi di un backup valido. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-373 | Ripristinare le risorse locali di un backup valido. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-374 | Ripristinare il nome del profilo da un backup valido. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-375 | Ripristinare le preferenze supportate del backup. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-376 | Selezionare un gruppo valido dopo il ripristino. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-377 | Esplicitare che lo storico scontrini non è ripristinato nella versione attuale. | Esistente, collaudato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-380 | Consentire un'anteprima dei gruppi che verranno sostituiti dal backup. | Nuovo / rafforzato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| FUN-401 | Sostituire il menu a tendina delle liste con pulsanti a pillola in uno slider orizzontale accessibile, con stato attivo e selezione persistente. | Nuovo / rafforzato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| ROB-041 | Generare token di condivisione con una sorgente crittografica casuale. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-042 | Usare token lista con almeno 256 bit di entropia. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-046 | Rifiutare identificativi lista non conformi al formato previsto. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-047 | Rifiutare token incompleti o con caratteri non ammessi. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-146 | Limitare la cache ai percorsi statici esplicitamente ammessi. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-147 | Non memorizzare navigazioni personalizzate nella cache. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-148 | Non memorizzare URL con query potenzialmente riservate. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-149 | Non intercettare richieste verso l'origine Supabase come risorse statiche. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-150 | Non memorizzare richieste che includono autorizzazione. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-151 | Non memorizzare risposte dichiarate private. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-152 | Non memorizzare risposte dichiarate no-store. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-153 | Non memorizzare redirect come contenuto statico atteso. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-154 | Non mescolare script di build diverse nella stessa cache attiva. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-155 | Usare la shell Home come ripiego per la navigazione Home offline. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-156 | Usare la shell Spesa come ripiego per la navigazione Spesa offline. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-161 | Rifiutare un file di importazione superiore a 2 MB. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-162 | Rifiutare un file che non contiene JSON leggibile. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-163 | Rifiutare un backup con formato dichiarato non supportato. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-164 | Rifiutare un backup con versione dello schema non supportata. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-165 | Accettare gli export storici previsti dalla compatibilità dichiarata. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-166 | Rifiutare proprietà pericolose anche dentro oggetti annidati. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-167 | Rifiutare strutture con profondità superiore al limite stabilito. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-168 | Rifiutare gruppi con identificativi duplicati nel backup. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-169 | Rifiutare risorse associate a gruppi non dichiarati nel backup. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-170 | Rifiutare un gruppo privo del relativo snapshot. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-171 | Rifiutare identificativi risorsa duplicati nello stesso snapshot. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-172 | Rifiutare campi testuali con valori di tipo non testuale. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-173 | Rifiutare date formalmente scritte ma inesistenti nel calendario. | Nuovo / rafforzato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-174 | Rifiutare quote con importi negativi o non interi. | Nuovo / rafforzato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-175 | Rifiutare rimborsi con strutture non supportate. | Nuovo / rafforzato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-176 | Rifiutare appuntamenti riservati in un backup da ripristinare localmente. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-177 | Normalizzare i membri ripristinati secondo il modello locale. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-178 | Non ripristinare autorizzazioni remote dichiarate dal file importato. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-179 | Interrompere il ripristino se cambia la sessione durante la lettura del file. | Esistente, collaudato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| ROB-180 | Non alterare i dati correnti se l'utente annulla la conferma finale. | Esistente, collaudato | [requirements.spec.mjs](../tests/browser/requirements.spec.mjs) |
| ROB-181 | Rifiutare titoli vuoti dopo la rimozione degli spazi marginali. | Nuovo / rafforzato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-182 | Rifiutare titoli oltre la lunghezza ammessa per la risorsa. | Nuovo / rafforzato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-187 | Rifiutare importi monetari negativi nei form che non prevedono storni. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-188 | Rifiutare importi con più di due cifre decimali. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-189 | Calcolare gli importi monetari in centesimi interi. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-190 | Verificare che la somma delle quote corrisponda al totale. | Nuovo / rafforzato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-191 | Rifiutare schemi URL eseguibili nei riferimenti esterni. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-192 | Accettare soltanto origini consentite per le fonti del catalogo. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-193 | Accettare soltanto percorsi locali previsti per le immagini del volantino. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-194 | Rifiutare ritagli immagine che superano i bordi della pagina. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-195 | Rifiutare dimensioni di ritaglio nulle o negative. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-200 | Non inventare un prezzo zero quando la fonte riporta solo uno sconto. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-252 | Limitare il numero di gruppi accettati nel ripristino backup. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-253 | Limitare il numero di risorse accettate nel ripristino backup. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-261 | Eseguire la suite JavaScript prima della pubblicazione automatica. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-262 | Eseguire la suite Python prima della pubblicazione automatica. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-263 | Eseguire una build di produzione prima del deploy. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-264 | Bloccare il job di deploy se il job di build fallisce. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-265 | Installare le dipendenze CI dal lockfile versionato. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-266 | Verificare l'allineamento della versione tra manifest di pacchetto e lockfile. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-267 | Testare le funzioni pure senza richiedere credenziali remote. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
| ROB-268 | Testare le RPC SQL su PostgreSQL locale con ruoli realistici. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) + [database.test.mjs](../tests/database.test.mjs) |
| ROB-280 | Collegare i test di accettazione agli identificativi dei requisiti verificati. | Esistente, collaudato | [requirements.test.mjs](../tests/requirements.test.mjs) |
