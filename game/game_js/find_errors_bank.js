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
            { x: 32, y: 27, label: "Mancanza di protezione per il viso" },
            { x: 28, y: 60, label: "Protezione della mola non adeguata" },
            { x: 50, y: 23, label: "Operatore senza guanti protettivi" }
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
    4: [
      {
        title: "Pericoli carrello",
        image: "carrello1.png",
        description: "Trova i 3 errori legati alla guida del carrello.",
        errors: [
          { x: 20, y: 40, label: "Carico non fissato" },
          { x: 55, y: 60, label: "Operatore senza cintura" },
          { x: 75, y: 35, label: "Percorso non segnalato" }
        ]
      },
      {
          title: "Pericoli",
          image: "trova2.png",
          description: "Individua altri 3 errori di sicurezza.",
          errors: [
            { x: 25, y: 30, label: "Errore 1 schermata 2" },
            { x: 60, y: 55, label: "Errore 2 schermata 2" },
            { x: 75, y: 70, label: "Errore 3 schermata 2" }
          ]
        },
        {
          title: "Pericoli",
          image: "trova3.png",
          description: "Ultima schermata: trova gli ultimi 3 errori.",
          errors: [
            { x: 30, y: 35, label: "Errore 1 schermata 3" },
            { x: 55, y: 50, label: "Errore 2 schermata 3" },
            { x: 70, y: 65, label: "Errore 3 schermata 3" }
          ]
        }// eventuali altre schermate...
    ]
  }
}

  // Puoi aggiungere DPI, RISCHIO INCENDIO, ecc. allo stesso modo
};
