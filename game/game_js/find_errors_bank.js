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
  }
}

  // Puoi aggiungere DPI, RISCHIO INCENDIO, ecc. allo stesso modo
};
