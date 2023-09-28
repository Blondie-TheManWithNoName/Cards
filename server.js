
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

const colors = ["#20639B", "#3CAEA3", "F6D55C", "#ED553B"];




io.on('connection', (sock) => {
    // console.log("CONNECTION")

    sock.on('initialInfo', (player) => {
     console.log(`Received ID: ${player.id}`);
     console.log(`Received color: ${player.color}`);
     const randomColorIndex = (Math.floor(Math.random() * colors.length))
     player.color = colors[randomColorIndex]
     sock.emit('playerColor', player.color)
     colors.splice(randomColorIndex, 1);
    players.push(player)

      // Handle the received data here
    });

  sock.emit('message', 'You are connected')
  sock.emit('deck', deck)
  console.log('A user connected');

  
  // Handle card movement from the client
  sock.on('moveCard', ({ cardId, newPosition, player}) => {
    // Handle card movement from the client
    deck.getCardFromId(cardId).changePosition(newPosition); 
    sock.broadcast.emit('cardMoved', cardId, newPosition, player);
  });

  sock.on('flipCard', ({ cardId, front, player}) => {
    // Handle card flip from the client
    deck.getCardFromId(cardId).flipCard(front)
    sock.broadcast.emit('cardFlipped', cardId, front, player);
    // moveCardOnServer(cardId, newPosition);
  });

  sock.on('cursorUp', ({ cardId, player}) => {
    // Handle card flip from the client
    console.log("CURSOR UP ", cardId)
    sock.broadcast.emit('cursorUpped', cardId);
    // moveCardOnServer(cardId, newPosition);
  });
  


});


server.on('error', (err) => {
    console.error(err)
});

server.listen(PORT, () =>   {
    console.log("SERVER READY")
});


