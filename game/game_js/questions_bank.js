// ====== DOMANDE (catalogo) ======
const QUESTIONS_BANK = {
    'TORNIO MANUALE': {
      1: [
        { q: 'A cosa serve il tornio?', a:['Lavorare pezzi in rotazione','Saldare lastre','Misurare tolleranze'], correct:0 },
        { q: 'Prima dell’uso, verifica…', a:['Schermi e protezioni','Colore della leva','Rumore della sala'], correct:0 },
        { q: 'Il pezzo deve essere…', a:['Ben serrato nel mandrino','Appoggiato libero','Tenuto a mano'], correct:0 },
        { q: 'Trucioli lunghi vanno…', a:['Gestiti con ganci','Toccati a mani nude','Soffiati col fiato'], correct:0 },
        { q: 'DPI corretti?', a:['Occhiali, guanti idonei','Scarpe da mare','Cappello di lana'], correct:0 },
        { q: 'Interventi sul pezzo…', a:['A macchina ferma','A giri bassi','Durante la passata'], correct:0 },
        { q: 'Chiave mandrino…', a:['Mai lasciata inserita','Sempre inserita','Appesa al collo'], correct:0 },
        { q: 'Trucioli caldi…', a:['Non toccarli','Metterli in tasca','Bagnarli con acqua'], correct:0 },
        { q: 'Fine lavoro…', a:['Pulisci e isola macchina','Lascia trucioli','Aumenti i giri'], correct:0 },
        { q: 'Se senti vibrazioni…', a:['Fermati e controlla','Ignora','Aumenti avanzamento'], correct:0 },
      ],
      2: [
        { q:'Velocità di taglio dipende da…', a:['Materiale/utensile','Colore macchina','Ora del giorno'], correct:0 },
        { q:'La lunetta serve a…', a:['Sostenere pezzo lungo','Raffreddare','Misurare tensione'], correct:0 },
        { q:'Emulsione…', a:['Riduce calore/usura','Aumenta attrito','Colora trucioli'], correct:0 },
      ],
      3: [
        { q:'Filettatura al tornio…', a:['Sincronizza avanzamento e giri','Si fa a caso','Richiede trapano'], correct:0 },
      ],
    },
    'MOLATRICE': {
      1: [
        { q:'Prima di molare verifica…', a:['Integrità mola e flangie','Colore banco','Data sul cartello'], correct:0 },
        { q:'Schermi e occhiali…', a:['Obbligatori','Facoltativi','Sconsigliati'], correct:0 },
        { q:'La forza sul pezzo dev’essere…', a:['Moderata e costante','Massima','A colpi'], correct:0 },
      ],
    },
    'TRAPANO A COLONNA': {
      1: [
        { q:'Il pezzo va…', a:['Bloccato in morsa','Tenuto a mano','Appoggiato libero'], correct:0 },
        { q:'Trucioli si rimuovono…', a:['Con pennello/aria','Con le dita','Soffiando'], correct:0 },
        { q:'Prima di forare…', a:['Seleziona giri/avanzamento','Spegni luce','Alza tavola al massimo'], correct:0 },
      ],
    },
    'TRAPANO RADIALE': { 1: [ { q:'Braccio e colonna…', a:['Vanno serrati prima di forare','Si muovono durante il taglio','Non si serrano mai'], correct:0 } ] },
    'TRONCATRICE': { 1: [ { q:'Mai togliere protezioni…', a:['Corretto','Sbagliato','Indifferente'], correct:0 } ] },
    'CENTRO DI LAVORO': { 1: [ { q:'Cambio utensile automatico…', a:['Richiede zona libera','Si fa con pezzo in mano','Non ha rischi'], correct:0 } ] },
    'FRESATRICE': { 1: [ { q:'Frena/registra tavola…', a:['Per evitare vibrazioni','Per aumentare gioco','Per estetica'], correct:0 } ] },
    'CESOIA A GHIGLIOTTINA': { 1: [ { q:'Mani e scarti…', a:['Lontani dalla lama','Vicini per guida','Spingere con dita'], correct:0 } ] },
    'PRESSA PIEGATRICE': { 1: [ { q:'Barriere fotoelettriche…', a:['Non si bypassano','Si coprono','Si staccano'], correct:0 } ] },
    'SEGA A NASTRO': { 1: [ { q:'Guidalama…', a:['Regolato vicino al pezzo','Sempre alto','Inutile'], correct:0 } ] },

    'CARRELLO ELEVATORE': {
      1: [
        { q:'Cintura e uomo a terra…', a:['Cintura allacciata, no passeggeri','Due a bordo','Si guida in piedi'], correct:0 },
        { q:'Portata nominale…', a:['Da rispettare','Indicativa','Si raddoppia con contrappesi'], correct:0 },
        { q:'Carico in quota…', a:['Basso e inclinazione minima','Alto per visibilità','Inclinato in avanti'], correct:0 },
      ],
      2: [
        { q:'Stabilità dipende da…', a:['Triangolo di stabilità','Colore forche','Marca'], correct:0 },
      ],
      3: [
        { q:'Soste su pendenze…', a:['Evitarle / mettere freno','Indifferenti','Motore spento e folle'], correct:0 },
      ],
    },
    'TRABATTELLO O PONTE A TORRE': {
      1: [
        { q:'Ruote…', a:['Con freno e stabilizzatori','Sempre senza freno','Con freno solo in salita'], correct:0 },
        { q:'Parapetti…', a:['Completi ai piani','Solo lato esterno','Inutili sotto i 2 m'], correct:0 },
      ],
    },
    'SCALE PORTATILI': {
      1: [
        { q:'Inclinazione corretta…', a:['Circa 75° (1:4)','90° verticale','45°'], correct:0 },
        { q:'Piano di appoggio…', a:['Solido e antisdrucciolo','Qualsiasi','Gradino instabile'], correct:0 },
      ],
    },
    'PARANCHI': {
      1: [
        { q: 'A cosa serve il paranco?', a:['Sollevare e movimentare carichi','Fissare strutture','Misurare lunghezze'], correct:0 },
        { q: 'Qual è il controllo principale prima dell\'uso?', a:['Verificare portata e ganci','Controllare il colore','Lubrificare a caso'], correct:0 },
        { q: 'Durante il sollevamento, il carico deve essere…', a:['Ben imbragato e bilanciato','Inclinato di 30°','Appoggiato al suolo'], correct:0 },
        { q: 'Il comando deve essere…', a:['In vista del carico','Sempre dietro il carico','Lontano 50 m'], correct:0 },
        { q: 'Cosa NON si deve fare?', a:['Sostare sotto carichi sospesi','Usare segnali convenzionali','Verificare interferenze'], correct:0 },
        { q: 'Il gancio con linguetta serve a…', a:['Evitare lo sgancio accidentale','Ridurre il rumore','Aumentare la portata'], correct:0 },
        { q: 'Portata nominale significa…', a:['Massa massima sollevabile','Altezza massima','Velocità catena'], correct:0 },
        { q: 'Imbracature danneggiate…', a:['Vanno scartate','Si riparano con nastro','Si usano solo di giorno'], correct:0 },
        { q: 'In caso di anomalia durante il sollevamento…', a:['Fermare e mettere in sicurezza','Accelerare','Ignorare e proseguire'], correct:0 },
        { q: 'Per comunicare con l\'operatore gru…', a:['Usare segnali e/o radio','Urla e fischi','Luci intermittenti'], correct:0 },
      ],
    },
    'IMBRAGO DEI CARICHI': {
      1: [
        { q:'Angolo di imbracatura…', a:['Ridurlo per aumentare portata','Non conta','Sempre >120°'], correct:0 },
        { q:'Nodi su brache…', a:['Vietati','Consigliati','Indifferenti'], correct:0 },
      ],
    },
    'PLE': { 1: [ { q:'Imbracatura in cesta…', a:['Obbligatoria','Facoltativa','Sconsigliata'], correct:0 } ] },
    'PONTEGGI': { 1: [ { q:'Accessi e parapetti…', a:['Devono essere completi','Solo lato esterno','Opzionali'], correct:0 } ] },

    'DISPOSITIVI DI PROTEZIONE': {
      1: [
        { q:'DPI testa…', a:['Elmetto conforme e integro','Cappellino da baseball','Cuffia in lana'], correct:0 },
        { q:'Guanti…', a:['Adeguati al rischio','Sempre uguali','Mai necessari'], correct:0 },
      ],
      2: [
        { q:'Occhiali/visiere…', a:['Contro proiezioni','Solo per estetica','Non servono'], correct:0 },
      ],
      3: [
        { q:'Udito…', a:['Inserto o cuffie idonee','Cotone','Tappi improvvisati'], correct:0 },
      ],
      4: [
        { q:'Vie respiratorie…', a:['Filtro idoneo al contaminante','Mascherina generica','Panno'], correct:0 },
      ],
      5: [
        { q:'Calzature…', a:['Puntale/lamina se richiesto','Sandali','Scarpe eleganti'], correct:0 },
      ],
    },
    'IMBRAGATURA': {
      1: [
        { q:'Controlli pre-uso…', a:['Cuciture, fibbie, etichette','Colore bretelle','Logo'], correct:0 },
        { q:'Punto di ancoraggio…', a:['Idoneo e certificato','Maniglia porta','Tubo di rame'], correct:0 },
      ],
    },
    'ESTINTORI': {
      1: [
        { q:'Classe di fuoco A/B/C…', a:['Materiale solido/liquido/gas','Temperatura fiamma','Colore fumo'], correct:0 },
        { q:'Manometro…', a:['In zona verde','Sempre rosso','Non serve'], correct:0 },
      ],
      2: [
        { q:'Prima di usare…', a:['Togli sicura e prova','Agitare forte','Spruzzare a caso'], correct:0 },
      ],
      3: [
        { q:'Su quadri elettrici…', a:['CO₂ o polvere idonea','Acqua','Schiuma non isolata'], correct:0 },
      ],
    },
    'PROCEDURE DI SICUREZZA': {
      1: [
        { q:'Lockout/tagout…', a:['Isola energia prima intervento','Si fa a macchina accesa','Solo per elettricisti'], correct:0 },
        { q:'Segnalare quasi incidenti…', a:['Utile a prevenire','Inutile','Sanzionabile'], correct:0 },
      ],
      2: [
        { q:'Ordine e pulizia…', a:['Riduce rischi','Solo estetica','Rallenta lavoro'], correct:0 },
      ],
      3: [
        { q:'Procedure di emergenza…', a:['Vanno conosciute e provate','Non servono','Solo su carta'], correct:0 },
      ],
    },
    'DPI E SEGNALETICA': {
      1: [
        { q:'Cartelli obbligo…', a:['Indicano DPI da indossare','Decorazioni','Pubblicità'], correct:0 },
        { q:'Divieto “vietato fumare”…', a:['Rischio incendio/ambiente','Solo cortesia','Opzionale'], correct:0 },
      ],
      2: [
        { q:'Segnaletica di emergenza…', a:['Uscite e presidi antincendio','Area relax','Zona fumatori'], correct:0 },
      ],
      3: [
        { q:'Colore giallo/nero…', a:['Attenzione/pericolo','Vietato','Obbligo'], correct:0 },
      ],
    },

    'RISCHIO INCENDIO': {
      1: [
        { q:'Triangolo del fuoco…', a:['Combustibile, comburente, innesco','Acqua, aria, terra','Fumo, calore, luce'], correct:0 },
        { q:'Vie di esodo…', a:['Libere e segnalate','Parzialmente ostruite','Chiuse a chiave'], correct:0 },
      ],
      2: [
        { q:'Allarme/incendio…', a:['Avvisa, chiama aiuto, evacua','Cerca l’origine da solo','Chiudi in magazzino'], correct:0 },
      ],
    },
  };
