
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { Deck } from './deck_s.js';
import { Player } from './player_s.js';
import { cardValueEnum, cardSuitEnum } from './util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 8080;
const LOG = false

const colors = ["#ED553B", "#F6D55C", "#65451F", "#20639B"];
const names = ["Fox", "Lion", "Eagle", "Dolphin"];
// const deck = new Deck();
// const players = []
const rooms = {};

class Room {
    constructor(code) {
        this.code = code;
        this.players = {};
        this.deck = new Deck();
        this.initializePlayers()
    }
    initializePlayers()
    {
        // for (let i = 0; i < colors.length; ++i)
        // {
        //     const player = new Player(0, colors[i], names[i]);
        //     this.players[colors[i]] = player;
        // }
    }

    joinPlayer(color, name, id)
    {
        this.players[id] = new Player(id, color, name);
        return this.players[id];
    }

    colorLeft() {
        let colorLeft = [...colors];
        for (const id in this.players) {
            let index = colorLeft.indexOf(this.players[id].color);
            colorLeft.splice(index, 1);
        }
        return colorLeft;
    }
    removePlayer(id)
    {
        delete this.players[id];
    }
    
}


var numPlayers = 0;


function createRoom(code) {
    const room = new Room(code);
    rooms[code] = room;

}

app.get('/game', (req, res) => {


    res.sendFile(__dirname + '/public/game.html');
});

// app.get('/contactus.html', (req,res) => {
//   data= fs.readFile('/home/swift-03/WebstormProjects/website/static/HTML/contactus.html',   function (err, data) {
//   res.setHeader('Content-Type', 'text/html');
//   res.send(data);
// });







function createCode() {
    let code = "";
    let list = Object.values(cardValueEnum).map(card => card.name);
    for (let i = 0; i < 4; ++i)
        code += list[Math.floor(Math.random() * list.length)];

    return code;
}

io.on('connection', (socket) => {

    const roomCode = socket.handshake.query.roomCode;
    // ++numPlayers;
    if (numPlayers > 4) {
        socket.emit('chooseColor', [], "Server full! ");

        socket.on('disconnect', () => {
            // log("TOTAL USERS: " + players.length)
            // --numPlayers
        });
    }
    else {
        let code;

        if (roomCode === 'null')
        {
            code = createCode();
            createRoom(code);
        }
        else
        {
            code = roomCode.toUpperCase();
            if (!rooms[code]) createRoom(code);
            
        }

        socket.join(code);
        socket.emit('deck', rooms[code].deck, rooms[code].deck.getMaxz(), code);
        socket.emit('chooseColor', rooms[code].colorLeft(), "CHOOSE A COLOR");
        
        socket.on('initialInfo', ({code, color, name}) => {
            // Set player ID and Color and send it
            socket.emit('player', rooms[code].joinPlayer(color, name, socket.id));

            // Server Logs
            log('NEW USER ID: ' + rooms[code].players[socket.id].id + " NAME: " + rooms[code].players[socket.id].name + " and COLOR: " + rooms[code].players[socket.id].color);
            log("TOTAL USERS: " + numPlayers);
        });


        // Handle card movement from a client
        socket.on('moveCard', ({ code, cardId, newPosition, time }) => {
            log("moveCard " + cardId + " to " + newPosition.x + " " + newPosition.y);

            const card = rooms[code].deck.getCardFromId(cardId); // PATCH
            if (card) {
                card.changePosition(newPosition);
                socket.to(code).emit('cardMoved', cardId, newPosition, time);
            }
        });


        // Handle card flip from a client
        socket.on('flipCard', ({ code, cardId, player }) => {
            log("flipCard " + cardId + " by " + player.name);

            rooms[code].deck.getCardFromId(cardId).flipCard()
            socket.to(code).emit('cardFlipped', cardId, player);
        });


        // Handle cursor up from a client
        socket.on('cursorUp', ({ code, cardId }) => {
            log("cursorUp " + cardId);

            socket.to(code).emit('cursorUpped', cardId);
        });


        // Handle cursor down from a client
        socket.on('cursorDown', ({ code, cardId, player, zIndex }) => {
            log("cursorDown " + cardId + " by " + player.name);

            const card = rooms[code].deck.getCardFromId(cardId);
            if (card) {
                card.setzIndex(zIndex)
                socket.to(code).emit('cursorDowned', cardId, player, zIndex);
            }
        });


        // Handle by Default from a client
        socket.on('byDefault', (code) => {
            log("byDefault");

            rooms[code].deck.byDefault();
            socket.to(code).emit('setDefault');
        });


        // Handle by Suit from the client
        socket.on('bySuit', (code) => {
            log("bySuit");

            rooms[code].deck.bySuit();
            socket.to(code).emit('setSuit');
        });

        // Handle by Rank from the client
        socket.on('byRank', (code) => {
            log("byRank");

            rooms[code].deck.byRank();
            socket.to(code).emit('setRank');
        });

        socket.on('flipDeck', (code) => {
            log("flipDeck");

            rooms[code].deck.flipDeck();
            socket.to(code).emit('flippedDeck');
        });

        socket.on('shuffle', (code, change) => {
            log("shuffle");

            socket.to(code).emit('shuffled', change);
            rooms[code].deck.assignFromShuffle(change);
            rooms[code].deck.byDefault();


        });

        // Handle card flip from a client
        socket.on('deal', async (code, numCards) => {
            for (let i = 0; i < numCards; ++i) {
                for (const player of players) {
                    if (player.id !== 0) {
                        const id = player.id;
                        rooms[code].deck.deal(player);
                        io.to(id).emit('dealing', rooms[code].deck.getCard(rooms[code].deck.cards.length - 1));

                        for (const player2 of players) {
                            if (id !== player2.id && player2.id !== 0)
                                io.to(player2.id).emit('cardAddedToHand', rooms[code].deck.getCard(rooms[code].deck.cards.length - 1).id);
                        }
                        rooms[code].deck.deleteCard(rooms[code].deck.cards.length - 1);
                        await delay(250);

                    }
                }
            }
        });

        socket.on('join', (code) => {
            log("join to" + code);

            socket.join(code);
            rooms[code].joinPlayer();
            // socket.to(code).emit('shuffled', change);

        });

        async function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }


        socket.on('updatePlayerHand', (code, playerId, card, add) => {

            if (add) {
                log("added card " + card.id + " to Hand of " + playerId);
                rooms[code].players[playerId].addCardToHand(card);
                rooms[code].deck.deleteCardFromId(card.id);
                socket.to(code).emit('cardAddedToHand', card.id);
            }
            else {
                log("added card " + card.id + " from Hand of " + playerId);
                rooms[code].players[playerId].deleteCardFromHand(card);
                rooms[code].deck.addCard(card);
                socket.to(code).emit('cardDeletedFromHand', card);
            }
        });


        // Handle User Disconnection
        socket.on('disconnect', () => {
            
        for (const code in rooms)
            rooms[code].removePlayer(socket.id)


            // if (i != -1) {
            //     colors.push(players[i].color)
            //     names.push(players[i].name)
            //     players[i].id = 0;
            //     log("TOTAL USERS: " + numPlayers)
            // }
            // --numPlayers;
        });

    }
});



server.on('error', (err) => {
    console.error(err)
});

server.listen(PORT, () => {
    log("SERVER READY")
});

function log(msg) {
    if (LOG)
        console.log(msg);


}


