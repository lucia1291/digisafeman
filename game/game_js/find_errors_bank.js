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
          description: "Individua altri 3 errori di sicurezza.",
          errors: [
            { x: 28, y: 16, label: "Non sostate e non parcheggiate in prossimità di uscite di sicurezza" },
            { x: 65, y: 70, label: "è vietato usare il carrello per effettuare lavori di manutenzione o qualsiasi altro lavoro in quota" },
            { x: 80, y: 70, label: "Usare i corretti DPI: scarpe, guanti ed elmetto" }
          ]
        },
        {
          title: "Pericoli carrello",
          image: "../resources/games/game2/trova_carr_3.png",
          description: "Ultima schermata: trova gli ultimi 3 errori.",
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
          { x: 70, y: 50, label: "Usare i corretti DPI: scarpe, guanti ed elmetto" },
          { x: 40, y: 60, label: "è vietato utilizzare il carrello per sollevare carichi sospesi" },
          { x: 80, y: 40, label: "è assolutamente vietato trasportare altri passeggeri" }
        ]
      },
      {
          title: "Pericoli",
          image: "../resources/games/game2/trova_carr_5.png",
          description: "Individua altri 3 errori di sicurezza.",
          errors: [
            { x: 28, y: 16, label: "Non sostate e non parcheggiate in prossimità di uscite di sicurezza" },
            { x: 65, y: 70, label: "è vietato usare il carrello per effettuare lavori di manutenzione o qualsiasi altro lavoro in quota" },
            { x: 80, y: 70, label: "Usare i corretti DPI: scarpe, guanti ed elmetto" }
          ]
        },
        {
          title: "Pericoli",
          image: "../resources/games/game2/trova_carr_6.png",
          description: "Ultima schermata: trova gli ultimi 3 errori.",
          errors: [
            { x: 50, y: 15, label: "é fatto assoluto divieto di accatastamento su rampe e comunque in situazioni di pavimento e terreno in pendenza" },
            { x: 55, y: 45, label: "In prossimità di incroci, passaggi pedonali, portoni e comunque se ci sono pedoni, rallentate e segnalate la vostra presenza" },
            { x: 60, y: 77, label: "Usare i corretti DPI: scarpe, guanti ed elmetto" }
          ]
        },
    ]
  }
}

  // Puoi aggiungere DPI, RISCHIO INCENDIO, ecc. allo stesso modo
};
