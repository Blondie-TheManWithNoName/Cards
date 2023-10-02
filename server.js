
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


const colors = ["#20639B", "#3CAEA3", "#F6D55C", "#ED553B"];
const names = ["Alligator", "Lion", "Eagle", "Dolphin"];
const deck = new Deck();
const players = []


function onConnection(id)
{
  let randomColorIndex = (Math.floor(Math.random() * colors.length));
  let randomNameIndex = (Math.floor(Math.random() * names.length));
  let color = colors[randomColorIndex];
  let name = names[randomNameIndex];
  colors.splice(randomColorIndex, 1);
  names.splice(randomNameIndex, 1);

  return new Player(id, color, name);
}



io.on('connection', (socket) =>
{


    if (!colors.length > 0)
    {
      socket.emit('message', 'We are full!')
      console.log('NEW USER WITHOUT ID');
      console.log("TOTAL USERS: " + players.length);

      socket.on('disconnect', () =>
      {
        console.log('USER WITHOUT ID DISCONNECTED');
        console.log("TOTAL USERS: " + players.length)
      });
    }
    else
    {
      socket.on('initialInfo', () =>
      {
        if (!colors.length > 0)
        {
          socket.emit('message', 'Server Full');
        }
        else
        {
          // Set player ID and Color and send it
          const player = onConnection(socket.id);
          socket.emit('player', player);
          
          // Manage Server Colors and Players
          players.push(player);
          
          // Server Logs
          console.log('NEW USER ID: ' + player.id + " NAME: " + player.name + " and COLOR: " + player.color);
          console.log("TOTAL USERS: " + players.length);
        }
      });
    
      socket.emit('deck', deck, deck.getMaxz());
    
    
      // Handle card movement from a client
      socket.on('moveCard', ({ cardId, newPosition, time}) =>
      {
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
        deck.getCardFromId(cardId).flipCard()
        socket.broadcast.emit('cardFlipped', cardId, player);
      });
    
    
      // Handle cursor up from a client
      socket.on('cursorUp', ({ cardId}) =>
      {
        socket.broadcast.emit('cursorUpped', cardId);
      });
    
    
      // Handle cursor down from a client
      socket.on('cursorDown', ({ cardId, player, zIndex}) =>
      {
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
        deck.byDefault();
        socket.broadcast.emit('setDefault');
      });
    
    
      // Handle by Suit from the client
      socket.on('bySuit', () =>
      {
        deck.bySuit();
        socket.broadcast.emit('setSuit');
      });

      // Handle by Rank from the client
      socket.on('byRank', () =>
      {
        deck.byRank();
        socket.broadcast.emit('setRank');
      });

      socket.on('flipDeck', () =>
      {
        deck.flipDeck();
        socket.broadcast.emit('flippedDeck');
      });

      // Handle card flip from a client
      socket.on('deal', (numCards) =>
      {
        // deck.splice(numCards);
        for (const player of players)
        {
            console.log("DEALING PLAYER: ", player.id);
            io.to(player.id).emit('dealing', deck.deal(numCards));
        }
        // socket.io.emit('', )
        // io.sockets.emit('deck', deck, deck.getMaxz());

      });


      socket.on('updatePlayerHand', (playerId, card, add) =>
      {
        var i = players.findIndex(player => player.id === playerId);
        if (add)
        {
          players[i].addCardToHand(card);
          deck.deleteCard(card.id);
          socket.broadcast.emit('cardAddedToHand', card.id);
        }
        else
        {
          players[i].deleteCardFromHand(card);
          deck.addCard(card);
          socket.broadcast.emit('cardDeletedFromHand', card);
        }
      });

    
      // Handle User Disconnection
      socket.on('disconnect', () =>
      {
        var i = players.findIndex(player => player.id === socket.id);
        console.log('USER ' + players[i].id + ' DISCONNECTED');
        colors.push(players[i].color)
        names.push(players[i].name)
        players.splice(i, 1);
        console.log("TOTAL USERS: " + players.length)
      });
      
      socket.on('reconnect', () => {
        console.log('Successfully reconnected to the server after a disconnection.');
        // You can perform actions or synchronize data with the server upon reconnection.
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


