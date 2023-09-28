import {Deck} from './deck.js';
import {Player} from './player.js';




    
      
const player = new Player("#6499E9");
const deck = new Deck();


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


socket.on('message', (text) => {
  console.log('Message received:', text);
});

socket.on('deck', (deck_) => {
  console.log("DECKKK");
  console.log(deck_)
  console.log("cards",deck_.cards[51].pos)
  for (let i =0; i < 52; ++i)
  {
    const card =  deck.getCard(i)
    
    card.changePositionServer(deck_.cards[i].pos);
    // card.flipCard(deck_.cards[i].front)
    // card.changePositionServer(card.getPosition())
  }
});

socket.on('playerColor', (color) => {
  player.color = color;
});

socket.on('cardMoved', ( cardId, newPosition, player_) => {
  // Update the card position on the client to match the server's position
  const card = deck.getCardFromId(cardId);
  card.changePositionServer(newPosition)
  card.setBorder(player_.color)
});

socket.on('cardFlipped', ( cardId, front, player_) => {
  // Update the card position on the client to match the server's position
  const card = deck.getCardFromId(cardId);
  card.flipCardServer(front)
});

socket.on('cursorUpped', (cardId) => {
  // Update the card position on the client to match the server's position
  const card = deck.getCardFromId(cardId);
  card.resetBorder()
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

bySuiteBtn.addEventListener('click', () => {
    // Call the shuffle function inside the Deck class
    deck.bySuit();
  });

  byRankBtn.addEventListener('click', () => {
    // Call the shuffle function inside the Deck class
    deck.byRank();
  });

  byDefaultBtn.addEventListener('click', () => {
    // Call the shuffle function inside the Deck class
    deck.byDefault([player.getHand()]);
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

  

