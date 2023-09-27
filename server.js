
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();


app.use(express.static(`${__dirname}/`));

const server = http.createServer(app);
const io = socketio(server);



// const player = new Player();
// const deck = new Deck();



function moveCardOnServer(cardId, newPosition) {
    // Update the card's position in the server's game state
    const card = cards[cardId];
    if (card) {
      card.changePosition(newPosition);
    }
  
    // Broadcast the updated card position to all connected clients
    io.emit('updateCardPosition', { cardId, newPosition });
  }


io.on('connection', (sock) => {
    // console.log("CONNECTION")
  sock.emit('message', 'You are connected')
  console.log('A user connected');
    
  // Handle card movement from the client
  sock.on('moveCard', ({ cardId, newPosition }) => {
    // Handle card movement from the client
    // console.log(`Card ${cardId} moved to position ${newPosition.x}, ${newPosition.y}`);
    io.emit('cardMoved', cardId, newPosition);
    // moveCardOnServer(cardId, newPosition);
  });

});


server.on('error', (err) => {
    console.error(err)
});

server.listen(8080, () =>   {
    console.log("SERVER READY")
});


