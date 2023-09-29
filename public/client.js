import {Deck} from './deck.js';
import {Player} from './player.js';

// Creation of a player and deck      
const player = new Player();
var deck = new Deck();

const socket = io();


// CONNECTION
socket.on('connect', () =>
{
  // Send info about player
  socket.emit('initialInfo');
});




  /////////////////////
 /// S E N D E R S ///
/////////////////////

// Function to notify the server about a card position change
export function notifyCardMove(cardId, newPosition)
{
  socket.emit('moveCard', { cardId, newPosition, player});
}

// Function to notify the server about card flip
export function notifyCardFlip(cardId, front)
{
  socket.emit('flipCard', { cardId, front, player});
}

// Function to notify the server when cursor is down
export function notifyCursorDown(cardId, zIndex)
{
  socket.emit('cursorDown', { cardId, player, zIndex});
}

// Function to notify the server when cur
export function notifyCursorUp(cardId)
{
  socket.emit('cursorUp', { cardId, player});
}  




  /////////////////////////
 /// R E C E I V E R S ///
/////////////////////////

// Handle connection

// Receive message from the Server
socket.on('message', (text) =>
{
  console.log('Message received:', text);
});

// Receive current deck hold by the Server
socket.on('deck', (deck_, maxZ) =>
{
  deck.assign(deck_, maxZ);
});

// Receive player with ID and Color given by the Server
socket.on('player', (player_) =>
{
  player.color = player_.color;
  player.id = player_.id;
  player.name = player_.name;
  document.getElementById("name").textContent = player_.name;
  document.getElementById("color").style.backgroundColor = player_.color;
});

// Receive moved card and change its position
socket.on('cardMoved', ( cardId, newPosition) =>
{
  deck.getCardFromId(cardId).changePositionServer(newPosition)
});

// Receive flipped card and flip it
socket.on('cardFlipped', ( cardId, front, player_) =>
{
  deck.getCardFromId(cardId).flipCardServer(front)
});

// Receive when a cursor went DOWN on a card
socket.on('cursorDowned', (cardId, player_) =>
{
  const card = deck.getCardFromId(cardId);
  card.toggleDragging();
  card.setzIndex();
  card.setBorder(player_.color);
});

// Receive when a cursor went UP on a card
socket.on('cursorUpped', (cardId) =>
{
  const card = deck.getCardFromId(cardId);
  card.toggleDragging()
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

  byDefaultBtn.addEventListener('click', () =>
  {
    // Call the shuffle function inside the Deck class
    deck.byDefault([player.getHand()]);
    socket.emit('byDefault', { deck, player});

  });

bySuiteBtn.addEventListener('click', () =>
{
    // Call the shuffle function inside the Deck class
    socket.emit('bySuit');
    deck.bySuit();
  });

  byRankBtn.addEventListener('click', () =>
  {
    // Call the shuffle function inside the Deck class
    socket.emit('byRank');
    deck.byRank();
  });

  flipBtn.addEventListener('click', () =>
  {
    // Call the shuffle function inside the Deck class
    deck.flipDeck();
  });


  shuffleBtn.addEventListener('click', () =>
  {
    // Call the shuffle function inside the Deck class
    deck.shuffle();
  });

 dealBtn.addEventListener('click', () =>
 {
    // Call the shuffle function inside the Deck class

    deck.deal(player, numCards.value);
  });

  myCardsBtn.addEventListener('click', () =>
  {
    // Call the shuffle function inside the Deck class
    player.myCards();
  });

  orderMyHandBtn.addEventListener('click', () =>
  {
    // Call the shuffle function inside the Deck class
    deck.bySuit(player.getHand());
  });

  window.onload = (event) => {

    console.log("Page is fully loaded");

  };

  

