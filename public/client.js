import {Deck} from './deck.js';
import {Player} from './player.js';

// Creation of a player and deck      
const player = new Player();
var deck;

const socket = io();

const handLine = window.innerHeight - (window.innerHeight*0.4);
const cardSize = {x: 80, y: 112}

document.getElementById('game').classList.add("disabled");



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
  let cardId = card.id
  socket.emit('moveCard', { cardId, newPosition, player});
}

// Function to notify the server about card flip
export function notifyCardFlip(cardId)
{
  socket.emit('flipCard', { cardId, player});
}

// Function to notify the server when cursor is down
export function notifyCursorDown(cardId, zIndex)
{
  socket.emit('cursorDown', { cardId, player, zIndex});
}

// Function to notify the server when cur
export function notifyCursorUp(card, pos)
{


  if (card.isPartOfHand)
  {
    if (card.wasPartOfHand)
    {
      // drag and drop
    }
    else
    {
      player.addCardToHand(card);
      deck.deleteCardServer(card.id);
      player.showHand(window.innerWidth/2); 
      socket.emit('updatePlayerHand', player.id, card, true);
    }
    card.wasPartOfHand = true;
  }
  else
  {

    if (card.wasPartOfHand)
    {
      console.log("CARD:", card)
      socket.emit('updatePlayerHand', player.id, card, false);
      player.deleteCardFromHand(card);
      deck.addCardServer(card);
      player.showHand(window.innerWidth/2);
    }
    else
    {
      const cardId = card.id
      socket.emit('cursorUp', { cardId, player});
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
  // let cardId = card.id
  // socket.emit('moveCard', { cardId, newPosition, player});
    socket.emit('shuffle', change);

}






  /////////////////////////
 /// R E C E I V E R S ///
/////////////////////////

// Handle connection

socket.on("chooseColor", (colors, msg) =>
{
  // document.getElementById("game").disabled = true;

  console.log(colors)
  let message = document.createElement('p');
  message.innerHTML = msg;
  document.getElementById("colorChoose").appendChild(message);
  
  for (const color of colors)
  {
    let elem = document.createElement('div');
    elem.classList.add('color');
    elem.style.backgroundColor = color;
    elem.setAttribute("id", color);
    elem.addEventListener('click', () =>
    {
      document.getElementById("colorChoose").remove();
      socket.emit('initialInfo', color);
    document.getElementById('game').classList.remove("disabled");
    });
    document.getElementById("colorChoose").appendChild(elem);
  }
});



// Receive message from the Server
socket.on('message', (text) =>
{
  console.log('Message received:', text);
});

// Receive current deck hold by the Server
socket.on('deck', (deck_, maxZ) =>
{
  deck = new Deck(deck_, maxZ);
  // deck.assign(deck_, maxZ);
});

// Receive player with ID and Color given by the Server
socket.on('player', (player_) =>
{
  player.assign(player_);
  document.getElementById("name").textContent = player_.name;
  document.getElementById("color").style.backgroundColor = player_.color;
  console.log(player_.hand)
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
  deck.getCardFromId(cardId).changePositionServer(newPosition)
});

// Receive flipped card and flip it
socket.on('cardFlipped', ( cardId, front) =>
{
  deck.getCardFromId(cardId).flipCardServer()
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

  // deck.assign(deck_);
  deck.byDefault();
});

socket.on('dealing', (hand) =>
{
  player.hand = hand;
  deck.deal(player, hand);
});


socket.on('cardAddedToHand', (cardId) =>
{
  deck.deleteCard(cardId);
});

socket.on('cardDeletedFromHand', (card) =>
{
  deck.addCard(card);
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

  byRankBtn.addEventListener('cl  ick', () =>
  {
    // Call the shuffle function inside the Deck class
    socket.emit('byRank');
    deck.byRank();
  });
  
  flipBtn.addEventListener('click', () =>
  {
    // Call the shuffle function inside the Deck class
    socket.emit('flipDeck');
    deck.flipDeck();
  });


  shuffleBtn.addEventListener('click', () =>
  {
    // Call the shuffle function inside the Deck class
    deck.shuffle();
    // for (const change of deck.change)
      // console.log(change)
    // socket.emit('shuffle', deck);
  });

 dealBtn.addEventListener('click', () =>
 {
    // Call the shuffle function inside the Deck class

    // deck.byDefault();
    if (numCards.value == undefined || numCards.value == 0) numCards.value = 5;
    // setTimeout( () => {
    //   deck.deal(player, numCards.value);
    // }, 500)
    socket.emit('deal', numCards.value);
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

  

