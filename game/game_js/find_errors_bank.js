// game_js/find_errors_bank.js

// Oggetto globale con tutte le scene del "Trova l'errore"
window.FIND_ERRORS_BANK = {
  MACCHINARI: {
    MOLATRICE: {
      1: [
        {
          title: "Pericoli",
          image: "../resources/games/game2/trova1.png", // relativo a find.html
          description: "Trova i 3 errori nascosti nella scena.",
          errors: [
            { x: 52, y: 25, label: "Mancanza di protezione per il viso" },
            { x: 28, y: 60, label: "Protezione della mola non adeguata" },
            { x: 50, y: 70, label: "Operatore senza guanti protettivi" }
          ]
        },
      ]
    },

    // Esempio futuro:
    // "TRAPANO A COLONNA": {
    //   2: [ ...scene... ]
    // }
  },

  ATTREZZATURE: {
  "CARRELLO ELEVATORE": {
    2: [
      {
        title: "Pericoli carrello",
        image: "../resources/games/game2/trova_carr_1.png",
        description: "Trova i 3 errori legati alla guida del carrello.",
        errors: [
          { x: 70, y: 50, label: "Usare i corretti DPI: scarpe, guanti ed elmetto" },
          { x: 40, y: 60, label: "è vietato utilizzare il carrello per sollevare carichi sospesi" },
          { x: 80, y: 40, label: "è assolutamente vietato trasportare altri passeggeri" }
        ]
      },
      {
          title: "Pericoli carrello",
          image: "../resources/games/game2/trova_carr_2.png",
          description: "Trova i 3 errori legati alla guida del carrello.",
          errors: [
            { x: 28, y: 16, label: "Non sostate e non parcheggiate in prossimità di uscite di sicurezza" },
            { x: 65, y: 70, label: "è vietato usare il carrello per effettuare lavori di manutenzione o qualsiasi altro lavoro in quota" },
            { x: 80, y: 70, label: "Usare i corretti DPI: scarpe, guanti ed elmetto" }
          ]
        },
        {
          title: "Pericoli carrello",
          image: "../resources/games/game2/trova_carr_3.png",
          description: "Ultima schermata: Trova i 3 errori legati alla guida del carrello.",
          errors: [
            { x: 50, y: 15, label: "é fatto assoluto divieto di accatastamento su rampe e comunque in situazioni di pavimento e terreno in pendenza" },
            { x: 55, y: 45, label: "In prossimità di incroci, passaggi pedonali, portoni e comunque se ci sono pedoni, rallentate e segnalate la vostra presenza" },
            { x: 60, y: 77, label: "Usare i corretti DPI: scarpe, guanti ed elmetto" }
          ]
        }// eventuali altre schermate...
    ],
	4: [
      {
        title: "Pericoli carrello",
        image: "../resources/games/game2/trova_carr_4.png",
        description: "Trova i 3 errori legati alla guida del carrello.",
        errors: [
          { x: 80, y: 50, label: "I pedoni possono sbucare da porte, veicoli parcheggiati o da dietro pallets ed altro" },
          { x: 50, y: 70, label: "La pedana devono essere integra in tutte le sue parti. Le pedane che presentano rotture o danneggiamenti, devono essere scartate." },
          { x: 30, y: 40, label: "è pericolosissimo infilare mani, gambe, testa fra le parti mobili del carrello." }
        ]
      },
      {
          title: "Pericoli carrello",
          image: "../resources/games/game2/trova_carr_5.png",
          description: "Trova i 3 errori legati alla guida del carrello.",
          errors: [
            { x: 28, y: 16, label: "Se il pavimento, nel tratto del vostro percorso, risultasse ingombrato da cavi elettrici, spostateli o avvisate un responsabile per una immediata rimozione degli stessi." },
            { x: 50, y: 60, label: "Impedite a chiunque di passare sotto le forche sollevate anche se sprovviste di carico" },
            { x: 10, y: 30, label: "Un pavimento scivoloso, bagnato o sconnesso richiede un rallentamento del mezzo" }
          ]
        },
        {
          title: "Pericoli",
          image: "../resources/games/game2/trova_carr_6.png",
          description: "Ultima schermata: Trova i 3 errori legati alla guida del carrello.",
          errors: [
            { x: 50, y: 15, label: "marciare con il carico verso l’inizio di una rampa significa compromettere seriamente la stabilità del carico e del carrello;" },
            { x: 80, y: 60, label: "non cercate mai di aumentare la portata del carrello aggiungendo dei contrappesi" },
            { x: 50, y: 40, label: "il carrello elevatore non deve in nessun caso essere usato per trainare;" }
          ]
        },
    ]
  },
  "TRABATTELLO O PONTE A TORRE": {
    1: [
      {
        title: "Pericoli trabattello o ponte a torre",
        image: "../resources/games/game2/trova_trab_1.png",
        description: "Trova i 3 errori legati all'uso del trabattello.",
        errors: [
          { x: 70, y: 50, label: "Usare i corretti DPI: scarpe, guanti ed elmetto" },
          { x: 40, y: 60, label: "è vietato utilizzare il carrello per sollevare carichi sospesi" },
          { x: 80, y: 40, label: "è assolutamente vietato trasportare altri passeggeri" }
        ]
      },
      {
          title: "Pericoli trabattello o ponte a torre",
          image: "../resources/games/game2/trova_trab_2.png",
          description: "Trova i 3 errori legati all'uso del trabattello.",
          errors: [
            { x: 28, y: 16, label: "Non sostate e non parcheggiate in prossimità di uscite di sicurezza" },
            { x: 65, y: 70, label: "è vietato usare il carrello per effettuare lavori di manutenzione o qualsiasi altro lavoro in quota" },
            { x: 80, y: 70, label: "Usare i corretti DPI: scarpe, guanti ed elmetto" }
          ]
        },
        {
          title: "Pericoli trabattello o ponte a torre",
          image: "../resources/games/game2/trova_trab_3.png",
          description: "Ultima schermata: Trova i 3 errori legati all'uso del trabattello.",
          errors: [
            { x: 50, y: 15, label: "é fatto assoluto divieto di accatastamento su rampe e comunque in situazioni di pavimento e terreno in pendenza" },
            { x: 55, y: 45, label: "In prossimità di incroci, passaggi pedonali, portoni e comunque se ci sono pedoni, rallentate e segnalate la vostra presenza" },
            { x: 60, y: 77, label: "Usare i corretti DPI: scarpe, guanti ed elmetto" }
          ]
        }// eventuali altre schermate...
    ]
  },
  "SCALE PORTATILI": {
    2: [
      {
        title: "Pericoli scale portatili",
        image: "../resources/games/game2/trova_scale_1.png",
        description: "Trova i 3 errori legati all'uso del trabattello.",
        errors: [
          { x: 30, y: 50, label: "Nel salire e scendere dalle scale si deve sempre rivolgere il viso e non la schiena alla scala e non si devono afferrare i montanti ma aggrapparsi alternativamente ai pioli." },
          { x: 60, y: 45, label: "Nel trasporto della scala a spalla non inserire il braccio all'interno della scala fra i gradini/pioli" },
          { x: 80, y: 40, label: "In generale, si consiglia di non superare il terz’ultimo gradino se la scala non è provvista di montanti prolungati di almeno 60 – 70cm" }
        ]
      },
      {
          title: "Pericoli scale portatili",
          image: "../resources/games/game2/trova_scale_2.png",
          description: "Ultima schermata: Trova i 3 errori legati all'uso del trabattello.",
          errors: [
            { x: 60, y: 16, label: "Rischio di sbilanciamento laterale" },
            { x: 56, y: 48, label: "è vietato mettere il piede sul guardacorpo" },
            { x: 42, y: 65, label: "Calzature non professionali" },
			{ x: 20, y: 90, label: "Superificie non regolare, con rischio di scivolamento" }
          ]
        }// eventuali altre schermate...
    ]
  },
  "PARANCHI": {
    2: [
      {
        title: "Pericoli paranchi",
        image: "../resources/games/game2/trova_paranco_1.png",
        description: "Trova i 3 errori legati all'uso dei paranchi.",
        errors: [
          { x: 50, y: 30, label: "Carico instabile. Bisogna sempre assicurarsi che non ci sia la possibilità di spostamento durante il sollevamento e lo spostamento" },
          { x: 50, y: 60, label: "è vietato sostare al di sotto di carichi sospesi" },
        ]
      },
      {
          title: "Pericoli paranchi",
          image: "../resources/games/game2/trova_paranco_2.png",
          description: "Trova i 3 errori legati all'uso dei paranchi.",
          errors: [
            { x: 60, y: 20, label: "è vietato sollevare persone e/o animali, i quali potrebbero cadere" },
            { x: 65, y: 74, label: "Carico instabile. Bisogna sempre assicurarsi che non ci sia la possibilità di spostamento durante il sollevamento e lo spostamento" },
            { x: 25, y: 65, label: " vietato sostare al di sotto di carichi sospesi" }
          ]
        },
        {
          title: "Pericoli paranchi",
          image: "../resources/games/game2/trova_paranco_3.png",
          description: "Ultima schermata: Trova i 3 errori legati all'uso dei paranchi.",
          errors: [
            { x: 20, y: 5, label: "Verificare sempre le condizioni, lo stato di usura delle funi (o catene)" },
            { x: 55, y: 60, label: "Attenzione a sollevare carichi di peso superiore alla PORTATA NOMINALE MASSIMA del paranco" },
            { x: 90, y: 15, label: "Usare SEMPRE i corretti DPI" }
          ]
        }// eventuali altre schermate...
    ],
  },
  "PLE": {
    3: [
      {
        title: "Pericoli PLE",
        image: "../resources/games/game2/trova_ple_1.png",
        description: "Trova i 3 errori legati all'uso della PLE.",
        errors: [
          { x: 60, y: 30, label: "Assenza del cavo di sicurezza dell'imbrago." },
          { x: 55, y: 60, label: "Uso scorretta della PLE" }
        ]
      },
      {
          title: "Pericoli PLE",
          image: "../resources/games/game2/trova_ple_2.png",
          description: "Ultima schermata: Trova i 3 errori legati all'uso la PLE.",
          errors: [
            { x: 60, y: 16, label: "Rischio di sbilanciamento laterale" },
            { x: 56, y: 48, label: "è vietato mettere il piede sul guardacorpo" },
            { x: 42, y: 65, label: "Calzature non professionali" }
          ]
        }// eventuali altre schermate...
    ]
  },
}

  // Puoi aggiungere DPI, RISCHIO INCENDIO, ecc. allo stesso modo
};
