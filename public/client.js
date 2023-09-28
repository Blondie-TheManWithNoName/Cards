import {Deck} from './deck.js';
import {Player} from './player.js';




    
      
const player = new Player();
var deck = new Deck();


const socket = io();

socket.on('connect', () => {
  const initialData = 'Hello, server!'; // Replace with your data
  socket.emit('initialInfo', player);
});


// Function to notify the server about position changes
export function notifyCardMove(cardId, newPosition) {
  socket.emit('moveCard', { cardId, newPosition, player});
}

export function notifyCardFlip(cardId, front) {
  socket.emit('flipCard', { cardId, front, player});
}

export function notifyCursorUp(cardId) {
  socket.emit('cursorUp', { cardId, player});
}

export function notifyCursorDown(cardId, zIndex) {
  socket.emit('cursorDown', { cardId, player, zIndex});
}



socket.on('message', (text) => {
  console.log('Message received:', text);
});

socket.on('deck', (deck_, maxZ) => {
  console.log("DECK_")
  deck.assign(deck_, maxZ);
});

socket.on('playerColor', (color, id) => {
  player.color = color;
  player.id = id;
});

socket.on('cardMoved', ( cardId, newPosition) => {
  // Update the card position on the client to match the server's position
  const card = deck.getCardFromId(cardId);
  card.changePositionServer(newPosition )
});

socket.on('cardFlipped', ( cardId, front, player_) => {
  // Update the card position on the client to match the server's position
  const card = deck.getCardFromId(cardId);
  card.flipCardServer(front)
});

socket.on('cursorUpped', (cardId) => {
  // Update the card position on the client to match the server's position
  const card = deck.getCardFromId(cardId);
  card.toggleDragging()
  card.resetBorder()
});

socket.on('cursorDowned', (cardId, player_, zIndex) => {
  // Update the card position on the clie,nt to match the server's position
  console.log("cursorDowned")
  const card = deck.getCardFromId(cardId);
  card.toggleDragging()
  card.setzIndex(zIndex);
  card.setBorder(player_.color)
});

socket.on('setDefault', () => {
  // Update the card position on the client to match the server's position
  deck.byDefault();
  console.log("deck updated by " + player.id)
});

socket.on('setSuit', () => {
  // Update the card position on the client to match the server's position
  deck.bySuit();
  console.log("deck suited by " + player.id)
});


const bySuiteBtn = document.getElementById('bySuite');
const byRankBtn = document.getElementById('byRank');
const byDefaultBtn = document.getElementById('byDefault');
const flipBtn = document.getElementById('flip');
const shuffleBtn = document.getElementById('shuffle');
const dealBtn = document.getElementById('deal');
const myCardsBtn = document.getElementById('myCards');
const orderMyHandBtn = document.getElementById('orderMyHand');

const numCards = document.getElementById('numCards');

  byDefaultBtn.addEventListener('click', () => {
    // Call the shuffle function inside the Deck class
    deck.byDefault([player.getHand()]);
    socket.emit('byDefault', { deck, player});

  });

bySuiteBtn.addEventListener('click', () => {
    // Call the shuffle function inside the Deck class
    socket.emit('bySuit');
    deck.bySuit();
  });

  byRankBtn.addEventListener('click', () => {
    // Call the shuffle function inside the Deck class
    deck.byRank();
  });

  flipBtn.addEventListener('click', () => {
    // Call the shuffle function inside the Deck class
    deck.flipDeck();
  });


  shuffleBtn.addEventListener('click', () => {
    // Call the shuffle function inside the Deck class
    deck.shuffle();
  });

 dealBtn.addEventListener('click', () => {
    // Call the shuffle function inside the Deck class

    deck.deal(player, numCards.value);
  });

  myCardsBtn.addEventListener('click', () => {
    // Call the shuffle function inside the Deck class
    player.myCards();
  });

  orderMyHandBtn.addEventListener('click', () => {
    // Call the shuffle function inside the Deck class
    deck.bySuit(player.getHand());
  });

  window.onload = (event) => {

    console.log("page is fully loaded");

  };

  

