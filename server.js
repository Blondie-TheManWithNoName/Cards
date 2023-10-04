
import http from 'http';
import express from 'express';
import { Server } from 'socket.io'; 

import {Deck} from './deck_s.js';
import {Player} from './player_s.js';


const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 8080;
const LOG = true

const colors = ["#ED553B", "#F6D55C", "#65451F", "#20639B"];
const names = ["Fox", "Lion", "Eagle", "Dolphin"];
const deck = new Deck();
const players = []

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


io.on('connection', (socket) =>
{

    ++numPlayers;
    if (numPlayers > 4)
    {
      socket.emit('chooseColor', [], "Server full! ");

      socket.on('disconnect', () =>
      {
        console.log("TOTAL USERS: " + players.length)
        --numPlayers
      });
    }
    else
    {
      socket.emit('deck', deck, deck.getMaxz());
      socket.emit('chooseColor', colorLeft(), "Choose a color: ");

      socket.on('initialInfo', (color) =>
      {
        // Set player ID and Color and send it
        let index = onConnection(socket.id, color);
        socket.emit('player', players[index]);
        
        // Server Logs
        console.log('NEW USER ID: ' + players[index].id + " NAME: " + players[index].name + " and COLOR: " + players[index].color);
        console.log("TOTAL USERS: " + numPlayers);
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
      socket.on('deal', (numCards) =>
      {

        for (const player of players)
        {
          if (player.id !== 0)
          {
            deck.deal(player, numCards);
            io.to(player.id).emit('dealing', player.hand);
          }
        }
        io.emit('assignDeck', deck, deck.getMaxz());

      });


      socket.on('updatePlayerHand', (playerId, card, add) =>
      {
        
        var i = players.findIndex(player => player.id === playerId);
        if (add)
        {
          log("added card " + card.id + " to Hand of " + playerId);
          players[i].addCardToHand(card);
          deck.deleteCard(card.id);
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
          console.log("TOTAL USERS: " + numPlayers)
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
    console.log("SERVER READY")
});

function log(msg)
{
  if (LOG)
    console.log(msg);


}


