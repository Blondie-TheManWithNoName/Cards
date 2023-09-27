
// const http = require('http');
// const express = require('express');
// const socketio = require('socket.io');

import http from 'http'; // Use import for http
import express from 'express'; // Use import for express
import { Server } from 'socket.io';

const app = express();

import {Deck} from './deck.js';


const deck = new Deck();

app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 8080;





io.on('connection', (sock) => {
    // console.log("CONNECTION")
  sock.emit('message', 'You are connected')
  sock.emit('deck', deck)
  console.log('A user connected');

  
  // Handle card movement from the client
  sock.on('moveCard', ({ cardId, newPosition }) => {
    // Handle card movement from the client
    // console.log(`Card ${cardId} moved to position ${newPosition.x}, ${newPosition.y}`);
    deck.getCardFromId(cardId).changePosition(newPosition); 
    console.log("card", deck.getCardFromId(cardId), "moved to", newPosition)
    sock.broadcast.emit('cardMoved', cardId, newPosition);
    // moveCardOnServer(cardId, newPosition);
  });
  
});


server.on('error', (err) => {
    console.error(err)
});

server.listen(PORT, () =>   {
    console.log("SERVER READY")
});


