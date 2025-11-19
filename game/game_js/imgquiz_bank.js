// game_js/imgquiz_bank.js

// Banca domande SOLO per il gioco a immagini
// Struttura: IMG_QUESTIONS_BANK[TOPIC][LEVEL_NUMBER] = [ ...domande... ]

const IMG_QUESTIONS_BANK = {
  "MOLATRICE": {
    3: [
      {
        q: "Quale immagine mostra una mola correttamente protetta?",
        img: "../resources/games/molatrice_livello3/q1_domanda.png",  // opzionale
        a: [
          "../resources/games/molatrice_livello3/q1_risposta1.png",
          "../resources/games/molatrice_livello3/q1_risposta2.png",
          "../resources/games/molatrice_livello3/q1_risposta3.png"
        ],
        correct: 0
      },
      {
        q: "Individua la mola usurata in modo pericoloso.",
        img: "../resources/games/molatrice_livello3/q2_domanda.png",
        a: [
          "../resources/games/molatrice_livello3/q2_risposta1.png",
          "../resources/games/molatrice_livello3/q2_risposta2.png",
          "../resources/games/molatrice_livello3/q2_risposta3.png"
        ],
        correct: 2
      }
      // aggiungi altre domande livello 3 molatrice...
    ],

    // esempio: MOLATRICE livello 4, sempre imgquiz
    4: [
      // ...
    ]
  },

  "TRAPANO A COLONNA": {
    3: [
      {
        q: "Qual è la posizione corretta dei pezzi sul piano?",
        img: "../resources/games/trapano_colonna_liv3/q1_domanda.png",
        a: [
          "../resources/games/trapano_colonna_liv3/q1_risposta1.png",
          "../resources/games/trapano_colonna_liv3/q1_risposta2.png",
          "../resources/games/trapano_colonna_liv3/q1_risposta3.png"
        ],
        correct: 1
      }
      // altre domande...
    ]
  },
  
  "DPI E SEGNALETICA": {
    1: [
      {
        q: "Quale tra questi cartelli rappresenta l'allarme antincendio",
        a: [
          "../resources/games/game3/DPI1_risposta1.png",
          "../resources/games/game3/DPI1_risposta2.png",
          "../resources/games/game3/DPI1_risposta3.png"
        ],
        correct: 0
      }
      // altre domande...
    ]
  },


  // Qui puoi aggiungere altri topic (FRESATRICE, PRESSA, ecc.) e livelli
};
