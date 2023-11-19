
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
//AD441F
const colors = ["#CD5C08", "#D08A9B", "#3366CC", "#60453C"];
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

    joinPlayer(color, name, id, rot)
    {
        if (this.players[color] !== undefined && this.players[color].id === 0)
        {
            this.players[color].id = id;
            this.players[color].name = name;
            this.players[color].rot = rot;
        }
        else
        {
            this.players[color] = new Player(id, color, name, rot);
        }

        return this.players[color];
    }

    colorLeft() {
        let colorLeft = [...colors];
        for (const color in this.players) {
            if (this.players[color] === undefined || this.players[color].id !== 0)
            {
                let index = colorLeft.indexOf(color);
                colorLeft.splice(index, 1);
            }
        }
        return colorLeft;
    }
    removePlayer(id)
    {
        for (const color in this.players) {
            if (this.players[color].id === id)
            {
                if (this.players[color].hand.length === 0)
                    delete this.players[color];
                else
                {
                    this.players[color].id = 0;
                    // for (const card of this.players[color].hand) deactivate disable
                    //     console.log("card", card.id)
                }
                break;
            }
        }
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

        if (roomCode === 'null' || roomCode === null || roomCode === undefined)
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
        socket.emit('code', code);
        socket.emit('chooseColor', rooms[code].colorLeft(), "CHOOSE A COLOR");
        
        socket.on('initialInfo', ({code, color, name, rot}) => {
            // Set player ID and Color and send it
            socket.emit('deck', rooms[code].deck, rooms[code].deck.getMaxz(), rot);
            socket.to(code).emit('newPlayer', name, rot, color);
            socket.emit('player', rooms[code].players, rooms[code].joinPlayer(color, name, socket.id, rot));

            // Server Logs
            log('NEW USER ID: ' + rooms[code].players[color].id + " NAME: " + rooms[code].players[color].name + " and COLOR: " + rooms[code].players[color].color);
            log("TOTAL USERS: " + numPlayers);
        });


        // Handle card movement from a client
        socket.on('moveCard', ({ code, cardId, newPosition, time }) => {
            log("moveCard " + cardId + " to " + newPosition.x + " " + newPosition.y);
                rooms[code].deck.deck[cardId].changePosition(newPosition);
                socket.broadcast.to(code).emit('cardMoved', cardId, newPosition, time);
        });


        // Handle card flip from a client
        socket.on('flipCard', ({ code, cardId, player, front }) => {
            log("flipCard " + cardId + " by " + player.name + " to " + front);

            rooms[code].deck.deck[cardId].flipCard(front)
            socket.to(code).emit('cardFlipped', cardId, front);
        });


        // Handle cursor up from a client
        socket.on('cursorUp', ({ code, cardId }) => {
            log("cursorUp " + cardId);

            socket.to(code).emit('cursorUpped', cardId);
        });


        // Handle cursor down from a client
        socket.on('cursorDown', ({ code, cardId, player, zIndex, rot }) => {
            log("cursorDown " + cardId + " by " + player.name);

            const card = rooms[code].deck.deck[cardId];
            if (card) {
                card.setzIndex(zIndex);
                card.rotate(rot);
                socket.to(code).emit('cursorDowned', cardId, player, rot);
            }
        });


        // Handle by Default from a client
        socket.on('byDefault', (code, rot) => {
            log("byDefault");
            rooms[code].deck.byDefault();
            socket.to(code).emit('setDefault', (rot));
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
            log("deal");
            console.log("numCards", rooms[code].players)
            for (let i = 0; i < numCards; ++i) {
                for (const player in rooms[code].players) {
                    console.log("card", rooms[code].deck.getCard(rooms[code].deck.cards.length - 1))
                    if (rooms[code].players[player].id !== 0) {
                        rooms[code].deck.deal(rooms[code].players[player]);
                        rooms[code].deck.getCard(rooms[code].deck.cards.length - 1).isPartOfHand = true;
                        io.to(rooms[code].players[player].id).emit('dealing', rooms[code].deck.getCard(rooms[code].deck.cards.length - 1));

                        for (const player2 in rooms[code].players) {
                            if (player !== player2 && rooms[code].players[player2].id !== 0)
                                io.to(rooms[code].players[player2].id).emit('cardAddedToHand', rooms[code].deck.getCard(rooms[code].deck.cards.length - 1));
                        }
                        rooms[code].deck.deleteCard(rooms[code].deck.getCard(rooms[code].deck.cards.length - 1), rooms[code].players[player].rot);
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


        socket.on('updatePlayerHand', (code, playerColor, card, add) => {

            if (add) {
                log("added card " + card.id + " to Hand of " + playerColor);
                rooms[code].players[playerColor].addCard(card);
                rooms[code].deck.deleteCard(card, rooms[code].players[playerColor].rot);
                socket.to(code).emit('cardAddedToHand', card, rooms[code].players[playerColor].rot);
            }
            else {
                log("added card " + card.id + " from Hand of " + playerColor);
                rooms[code].players[playerColor].deleteCard(card);
                rooms[code].deck.addCard(card);
                socket.to(code).emit('cardDeletedFromHand', card);
            }
        });


        // Handle User Disconnection
        socket.on('disconnect', () => {
            
        for (const code in rooms)
        {
            rooms[code].removePlayer(socket.id)
            // socket.to(code).emit('cardDeletedFromHand', card);

        }


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


