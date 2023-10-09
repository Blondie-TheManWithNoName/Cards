
import http from 'http';
import express from 'express';
import { Server } from 'socket.io'; 

import {Deck} from './deck_s.js';
import {Player} from './player_s.js';
import { cardValueEnum, cardSuitEnum } from './util.js';


const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 8080;
const LOG = false

const colors = ["#ED553B", "#F6D55C", "#65451F", "#20639B"];
const names = ["Fox", "Lion", "Eagle", "Dolphin"];
const deck = new Deck();
const players = []
const rooms = []

var numPlayers = 0;

for (let i=0; i < colors.length; ++i  )
  players.push(new Player(0, colors[i], names[i]))

function colorLeft()
{
  let colorLeft = [];
  for (const player of players)
  {
    if (player.id === 0) colorLeft.push(player.color);
  }
  return colorLeft;
}

function onConnection(id, color)
{
  let i=0;
  for (; i < players.length; ++i)
    if (players[i].color === color) break;

  players[i].id = id;
  return i;
}


function createCode()
{
  let code = "";
  let list = Object.values(cardValueEnum).map(card => card.name);
  for (let i=0; i < 4; ++i)
    code += list[Math.floor(Math.random()*list.length)];

  return code;
}

io.on('connection', (socket) =>
{
  
  
    ++numPlayers;
    if (numPlayers > 4)
    {
      socket.emit('chooseColor', [], "Server full! ");
      
      socket.on('disconnect', () =>
      {
        log("TOTAL USERS: " + players.length)
        --numPlayers
      });
    }
    else
    {
      let code = createCode();
      socket.emit('deck', deck, deck.getMaxz(), code);
      socket.emit('chooseColor', colorLeft(), "CHOOSE A COLOR");
      socket.on('initialInfo', (color) =>
      {
        // Set player ID and Color and send it
        let index = onConnection(socket.id, color);
        socket.emit('player', players[index]);
        
        // Server Logs
        log('NEW USER ID: ' + players[index].id + " NAME: " + players[index].name + " and COLOR: " + players[index].color);
        log("TOTAL USERS: " + numPlayers);
      });
    
    
    
      // Handle card movement from a client
      socket.on('moveCard', ({ cardId, newPosition, time}) =>
      {
        log("moveCard " + cardId + " to " + newPosition.x + " " + newPosition.y);

        const card = deck.getCardFromId(cardId); // PATCH
        if (card)
        {
          card.changePosition(newPosition); 
          socket.broadcast.emit('cardMoved', cardId, newPosition, time);
        }
      });
    
    
      // Handle card flip from a client
      socket.on('flipCard', ({ cardId, player}) =>
      {
        log("flipCard " + cardId + " by " + player.name);

        deck.getCardFromId(cardId).flipCard()
        socket.broadcast.emit('cardFlipped', cardId, player);
      });
    
    
      // Handle cursor up from a client
      socket.on('cursorUp', ({ cardId}) =>
      {
        log("cursorUp " + cardId);

        socket.broadcast.emit('cursorUpped', cardId);
      });
    
    
      // Handle cursor down from a client
      socket.on('cursorDown', ({ cardId, player, zIndex}) =>
      {
        log("cursorDown " + cardId + " by " + player.name);

        const card = deck.getCardFromId(cardId);
        if (card)
        {
          card.setzIndex(zIndex)
          socket.broadcast.emit('cursorDowned', cardId, player, zIndex);
        }
      });
    
    
      // Handle by Default from a client
      socket.on('byDefault', () =>
      {
        log("byDefault");

        deck.byDefault();
        socket.broadcast.emit('setDefault');
      });
    
    
      // Handle by Suit from the client
      socket.on('bySuit', () =>
      {
        log("bySuit");

        deck.bySuit();
        socket.broadcast.emit('setSuit');
      });

      // Handle by Rank from the client
      socket.on('byRank', () =>
      {
        log("byRank");

        deck.byRank();
        socket.broadcast.emit('setRank');
      });

      socket.on('flipDeck', () =>
      {
        log("flipDeck");
        
        deck.flipDeck();
        socket.broadcast.emit('flippedDeck');
      });
      
      socket.on('shuffle', (change) =>
      {
        log("shuffle");

        socket.broadcast.emit('shuffled', change);
        deck.assignFromShuffle(change);
        deck.byDefault();
      

      });

      // Handle card flip from a client
      socket.on('deal', async (numCards) =>
      {
        for (let i = 0; i < numCards; ++i) {
          for (const player of players)
          {
            if (player.id !== 0)
            {
              const id = player.id;
              deck.deal(player);
              io.to(id).emit('dealing', deck.getCard(deck.cards.length - 1));
              
              for (const player2 of players)
              {
                if (id !== player2.id && player2.id !== 0)
                  io.to(player2.id).emit('cardAddedToHand', deck.getCard(deck.cards.length - 1).id);
              }
              deck.deleteCard(deck.cards.length - 1);
              await delay(250);

            }
          }
        }
      });

      async function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }


      socket.on('updatePlayerHand', (playerId, card, add) =>
      {
        
        var i = players.findIndex(player => player.id === playerId);
        if (add)
        {
          log("added card " + card.id + " to Hand of " + playerId);
          players[i].addCardToHand(card);
          deck.deleteCardFromId(card.id);
          socket.broadcast.emit('cardAddedToHand', card.id);
        }
        else
        {
          log("added card " + card.id + " from Hand of " + playerId);
          players[i].deleteCardFromHand(card);
          deck.addCard(card);
          socket.broadcast.emit('cardDeletedFromHand', card);
        }
      });

    
      // Handle User Disconnection
      socket.on('disconnect', () =>
      {
        var i = players.findIndex(player => player.id === socket.id);
        if (i != -1)
        {
          colors.push(players[i].color)
          names.push(players[i].name)
          players[i].id = 0;
          log("TOTAL USERS: " + numPlayers)
        }
        --numPlayers;
      });

  }
  });



server.on('error', (err) =>
{
    console.error(err)
});

server.listen(PORT, () =>
{
    log("SERVER READY")
});

function log(msg)
{
  if (LOG)
    console.log(msg);


}


