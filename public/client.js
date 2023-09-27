import {Deck} from './deck.js';
import {Player} from './player.js';
import {Card} from './card.js';




const socket = io.connect();

// Function to notify the server about position changes
function notifyPositionChange(cardId, newPosition) {
    console.log("SEND I WANNA MOVE", cardId, "to", newPosition.x, " ", newPosition.y)

  socket.emit('moveCard', { cardId, newPosition });
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


socket.on('cardMoved', ( cardId, newPosition) => {
  // Update the card position on the client to match the server's position
    // const cardElement = document.getElementById(`${cardId}`);
  // cardId.changePosition(newPosition);
  deck.getCardFromId(cardId).changePositionServer(newPosition)
  // console.log(card)
    // console.log("I WANNA MOVE", card, "to", newPosition.x, " ", newPosition.y)

//   sock.emit('moveCard', { newPosition });
});


const player = new Player();
const deck = new Deck(notifyPositionChange);

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