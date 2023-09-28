
// const http = require('http');
// const express = require('express');
// const socketio = require('socket.io');

import http from 'http'; // Use import for http
import express from 'express'; // Use import for express
import { Server } from 'socket.io';

const app = express();

import {Deck} from './deck.js';


const deck = new Deck();
const players = []
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 8080;

const colors = ["#20639B", "#3CAEA3", "#F6D55C", "#ED553B"];
//, "#B2533E", "#186F65"


io.on('connection', (socket) => {
    // console.log("CONNECTION")

    if (!colors.length > 0) socket.emit('message', 'We are full!')


    console.log("socket", socket.id)

    socket.on('initialInfo', (player) => {
      player.id = socket.id;
      const randomColorIndex = (Math.floor(Math.random() * colors.length))
      console.log("randomColorIndex", randomColorIndex)
      player.color = colors[randomColorIndex]
      socket.emit('playerColor', player.color, player.id)
      console.log(`Color: ${player.color}`);
      console.log(`ID: ${player.id}`);
     colors.splice(randomColorIndex, 1);
    players.push(player)

      // Handle the received data here
    });

  socket.emit('message', 'You are connected')
  socket.emit('deck', deck)
  console.log('A user connected');

  
  // Handle card movement from the client
  socket.on('moveCard', ({ cardId, newPosition, player}) => {
    // Handle card movement from the client
    deck.getCardFromId(cardId).changePosition(newPosition); 
    socket.broadcast.emit('cardMoved', cardId, newPosition);
  });

  socket.on('flipCard', ({ cardId, front, player}) => {
    // Handle card flip from the client
    deck.getCardFromId(cardId).flipCard(front)
    socket.broadcast.emit('cardFlipped', cardId, front, player);
    // moveCardOnServer(cardId, newPosition);
  });

  socket.on('cursorUp', ({ cardId, player}) => {
    // Handle card flip from the client
    socket.broadcast.emit('cursorUpped', cardId);
    // moveCardOnServer(cardId, newPosition);
  });

  socket.on('cursorDown', ({ cardId, player}) => {
    // Handle card flip from the client
    socket.broadcast.emit('cursorDowned', cardId, player);
    // moveCardOnServer(cardId, newPosition);
  });

  socket.on('disconnect', function() {
    console.log('Got disconnect!');

    var i = players.findIndex(player => player.id === socket.id);
    console.log(i)
    colors.push(players[i].color)
    players.splice(i, 1);
 });
  


});


server.on('error', (err) => {
    console.error(err)
});

server.listen(PORT, () =>   {
    console.log("SERVER READY")
});


