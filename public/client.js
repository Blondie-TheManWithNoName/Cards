import {Deck} from './deck.js';
import {Player} from './player.js';

// Creation of a player and deck      
const player = new Player();
var deck;
var code = ""


const urlParams = new URLSearchParams(window.location.search);
console.log("URL",urlParams);
const roomCode = urlParams.get('roomCode');
const socket = io("https://cards.up.railway.app/", { query: "roomCode="+roomCode });
const url = new URL(location);
history.pushState({}, "sadasdas", url);


var checkedColor = ""
const handLine = window.innerHeight - (window.innerHeight*0.4);
const cardSize = {x: 80, y: 112}

document.getElementById('game').classList.add("disabled");

const toHand = document.getElementById("toHand")

const eqSize = getEquation(toHand.getBoundingClientRect().top, 1, toHand.getBoundingClientRect().bottom, 2);


console.log(toHand.getBoundingClientRect().top)
console.log(toHand.getBoundingClientRect().bottom)

// Get equation to move the cover-section
function getEquation(x1, y1, x2, y2)
{
  let m = (y2 - y1) / (x2 - x1);
  let b = y1 - (m * x1);
  return [m, b];
}

// CONNECTION
socket.on('connect', () =>
{
  // Send info about player
  // socket.emit('initialInfo', player.id);
});



  /////////////////////
 /// S E N D E R S ///
/////////////////////

// Function to notify the server about a card position change
export function notifyCardMove(card, newPosition)
{
  let cardId = card.id;

  if (card.isPartOfHand && card.wasPartOfHand) player.check(card, newPosition);
  if (!card.isPartOfHand && card.wasPartOfHand) card.setzIndex();
  if (newPosition.y >= toHand.getBoundingClientRect().top && newPosition.y <= toHand.getBoundingClientRect().bottom && !card.isPartOfHand)
    card.cardElem.style.transform += 'scale(' + (newPosition.y*eqSize[0] + eqSize[1]) + ')';
  socket.emit('moveCard', { code, cardId, newPosition, player});
}

// Function to notify the server about card flip
export function notifyCardFlip(cardId)
{
  socket.emit('flipCard', { code, cardId, player});
}

// Function to notify the server when cursor is down
export function notifyCursorDown(cardId, zIndex)
{
  socket.emit('cursorDown', { code, cardId, player, zIndex});
}

// Function to notify the server when cur
export function notifyCursorUp(card, pos)
{




  if (card.isPartOfHand)
  {
    if (card.wasPartOfHand)
    {
      // drag and drop
      player.showHand(window.innerWidth/2);
    }
    else
    {
      player.addCardToHand(card);
      deck.deleteCardFromId(card.id);
      player.showHand(window.innerWidth/2); 
      socket.emit('updatePlayerHand', code, player.id, card, true);
    }
    card.wasPartOfHand = true;
  }
  else
  {

    if (card.wasPartOfHand)
    {
      socket.emit('updatePlayerHand', code, player.id, card, false);
      player.deleteCardFromHand(card);
      console.log("cardIndex", card.index)
      deck.addCardServer(card);
      player.showHand(window.innerWidth/2);
    }
    else
    {
      const cardId = card.id
      socket.emit('cursorUp', { code, cardId, player});
    }
    card.wasPartOfHand = false;
    
    // if (card.pos.y < handLine)
    // {
    //   card.changePosition({x: card.pos.x, y: handLine + 10}, card.zIndex, 0.2);
    //   notifyCardMove(card, {x:card.pos.x, y:handLine + 10});
    // }
    // if (card.pos.y < handLine && card.pos.y + cardSize.y >= handLine)
    // {
    //   card.changePosition({x: card.pos.x, y: handLine - cardSize.y - 10}, card.zIndex, 0.2);  
    //   notifyCardMove(card, {x:card.pos.x, y:handLine - cardSize.y - 10});
    // }

  }
}

export function notifyShuffle(change)
{
    socket.emit('shuffle', code, change);
}


document.getElementById("back-button").addEventListener('click', () =>
{
  window.location.href ="/";
});


  /////////////////////////
 /// R E C E I V E R S ///
/////////////////////////

// Handle connection

socket.on("chooseColor", (colors, msg) =>
{
  // document.getElementById("game").disabled = true;

  console.log(colors)
  // let message = document.createElement('p');
  // message.innerHTML = msg;
  // document.getElementById("colorChoose").appendChild(message);
  
  for (const color of colors)
  {
    let elem = document.createElement('input');
    elem.classList.add('color');
    elem.style.backgroundColor = color;
    elem.setAttribute("type", "radio");
    elem.setAttribute("name", "color");
    elem.setAttribute("id", color);
    
    let label = document.createElement('label');
    label.setAttribute("for", color);
  
    label.addEventListener('click', () =>
    {
      checkedColor = color;
    });
    let span = document.createElement('span');
    span.style.backgroundColor = color;
    span.classList.add(color);



    label.appendChild(span);
    document.getElementById("color-container").appendChild(elem);
    document.getElementById("color-container").appendChild(label);
  }
});

document.getElementById("code").addEventListener('click', () =>
{

  navigator.clipboard.writeText(code);
});

document.getElementById("play").addEventListener('click', () =>
{


  const name = document.getElementById("input-name").value;
  
  document.getElementById("colorChoose").remove();
  document.getElementById("background").remove()
  

  const color = checkedColor;
  socket.emit('initialInfo', {code, color, name});
  document.getElementById('game').classList.remove("disabled");
});



// Receive message from the Server
socket.on('message', (text) =>
{
  console.log('Message received:', text);
});

// Receive current deck hold by the Server
socket.on('deck', (deck_, maxZ, code_) =>
{
  deck = new Deck(deck_, maxZ);
  for(const card of deck.cards)
  {

    console.log(card)
  }
  
  
  code = code_;
  console.log(code)
  // socket.join(code);
});

// Receive player with ID and Color given by the Server
socket.on('player', (player_) =>
{
  player.assign(player_);
  console.log(player_.color);
  document.getElementById("name").textContent = player_.name;
  document.getElementById("color").style.backgroundColor = player_.color;
  console.log("code", code)
  document.getElementById("code").textContent = code;
  for(const card of player_.hand)
  {
    player.createCard(card)
    // deck.deleteCardServer(card.id)
  }
  player.showHand(window.innerWidth/2);

});

// Receive moved card and change its position
socket.on('cardMoved', ( cardId, newPosition) =>
{
  deck.getCardFromId(cardId).changePosition(newPosition)
});

// Receive flipped card and flip it
socket.on('cardFlipped', ( cardId) =>
{
  deck.getCardFromId(cardId).flipCard(false)
});

// Receive when a cursor went DOWN on a card
socket.on('cursorDowned', (cardId, player_) =>
{
  console.log("cursordowned")
  const card = deck.getCardFromId(cardId);
  card.setDraggingTrue();
  card.setzIndex();
  card.setBorder(player_.color);
});

// Receive when a cursor went UP on a card
socket.on('cursorUpped', (cardId) =>
{
  console.log("cursorupped")
  const card = deck.getCardFromId(cardId);
  card.setDraggingFalse()
  card.resetBorder()
});


// Receive byDefault from the Server
socket.on('setDefault', () =>
{
  deck.byDefault();
});

// Receive bySuit from the Server
socket.on('setSuit', () =>
{
  deck.bySuit();
});

// Receive byRank from the Server
socket.on('setRank', () =>
{
  deck.byRank();
});

// Receive flippedDeck from the Server
socket.on('flippedDeck', () =>
{
  deck.flipDeck();
});

socket.on('shuffled', (change) =>
{
  deck.assignFromShuffle(change)
  deck.byDefault();
});

socket.on('dealing', (card) =>
{
  deck.deal(player);
  player.showHand(window.innerWidth/2);
});


socket.on('cardAddedToHand', (cardId) =>
{
  deck.deleteCardFromId(cardId, true);
});

socket.on('cardDeletedFromHand', (card) =>
{
  deck.addCard(card);
});


socket.on('assignDeck', (deck_, zMax) =>
{
  deck.assign(deck_, zMax);
});




  ////////////////////
 /// WEB HANDLERS ///
////////////////////

const bySuiteBtn = document.getElementById('bySuite');
const byRankBtn = document.getElementById('byRank');
const byDefaultBtn = document.getElementById('byDefault');
const flipBtn = document.getElementById('flip');
const shuffleBtn = document.getElementById('shuffle');
const dealBtn = document.getElementById('deal');
const myCardsBtn = document.getElementById('myCards');
const orderMyHandBtn = document.getElementById('orderMyHand');
const numCards = document.getElementById('numCards');
const leaveBtn = document.getElementById('leave');
// const connect = document.getElementById('connect');

  byDefaultBtn.addEventListener('click', () =>
  {
    // Call the shuffle function inside the Deck class
    deck.byDefault([player.getHand()]);
    socket.emit('byDefault', code);

  });

bySuiteBtn.addEventListener('click', () =>
{
    // Call the shuffle function inside the Deck class
    socket.emit('bySuit', code);
    deck.bySuit();
  });

  byRankBtn.addEventListener('click', () =>
  {
    // Call the shuffle function inside the Deck class
    socket.emit('byRank', code);
    deck.byRank();
  });
  
  flipBtn.addEventListener('click', () =>
  {
    // Call the shuffle function inside the Deck class
    deck.flipDeck();
    socket.emit('flipDeck', code);
  });


  shuffleBtn.addEventListener('click', () =>
  {
    // Call the shuffle function inside the Deck class
    deck.shuffle();
  });
  
  dealBtn.addEventListener('click', () =>
  {    
    deck.byDefault();
    if (numCards.value == undefined || numCards.value == 0) numCards.value = 5;
    socket.emit('deal', code, numCards.value);
  });

  // Call the order method for the players Hand
  orderMyHandBtn.addEventListener('click', () =>
  {
    player.order();
    player.showHand(window.innerWidth/2);
  });

   // Call the order method for the players Hand
   leaveBtn.addEventListener('click', () =>
   {
     window.location="/";
   });


  // connect.addEventListener('click', () =>
  // {
    
  // });

  window.onload = (event) => {

    console.log("Page is fully loaded");

  };

  

