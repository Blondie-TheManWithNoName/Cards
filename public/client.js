import { Deck } from './deck.js';
import { Player } from './player.js';
import { updateRect } from './util.js';

// Creation of a player and deck      
const player = new Player();
var deck;
var code = ""
var rot = 0
var show = 1
var hideMenu = false;

const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('roomCode');
//https://cards.up.railway.app/
const socket = io("https://www.cardmat.online/", { query: "roomCode=" + roomCode });
const url = new URL(location);
history.pushState({}, "sadasdas", url);


var checkedColor = ""


// CONNECTION
socket.on('connect', () => {

});

const zoomElement = document.getElementById("mat");
let zoom = 1;
const ZOOM_SPEED = 0.3;

document.addEventListener("wheel", function (e) {
    if (e.deltaY > 0) {
        if (zoom > 1)
            zoomElement.style.scale = `${(zoom -= ZOOM_SPEED)}`;
    } else {
        if (zoom < 3)
            zoomElement.style.scale = `${(zoom += ZOOM_SPEED)}`;
    }


    if (zoomElement.offsetTop >= Math.round((zoom - 1) * 98 / 0.3)) {
        zoomElement.style.transition = "top 250ms, scale 250ms";
        setTimeout(() => {
            zoomElement.style.transition = "top 0s, scale 250ms";
        }, 250);
        zoomElement.style.top = Math.round((zoom - 1) * 98 / 0.3) + 'px';
    }
    else if (zoomElement.offsetTop <= -(Math.round((zoom - 1) * 98 / 0.3))) {
        zoomElement.style.transition = "top 250ms, scale 250ms";
        setTimeout(() => {
            zoomElement.style.transition = "top 0s, scale 250ms";
        }, 250);
        zoomElement.style.top = -Math.round((zoom - 1) * 98 / 0.3) + 'px';
    }

});


/////////////////////
/// S E N D E R S ///
/////////////////////

// Function to notify the server about a card position change
export function notifyCardMove(t, card, newPosition) {
    let time = 0.25;
    let cardId = card.id;
    if (t) {
        time = 0;
        if (card.isPartOfHand) {
            if (card.owner === -1) {
                card.rotate();
                player.addCard(card);
                deck.deleteCard(card, rot);
                socket.emit('updatePlayerHand', code, player.color, card, card.isPartOfHand);
                if (!show) socket.emit('flipCard', { code, cardId, player, front: show });

            }
        }
        else {
            if (card.owner !== -1) {
                card.rotate(rot);
                player.deleteCard(card);
                deck.addCard(card);
                socket.emit('updatePlayerHand', code, player.color, card, card.isPartOfHand);
                const front = card.front
                if (!show) socket.emit('flipCard', { code, cardId, player, front });
            }
        }
    }
    socket.emit('moveCard', { code, cardId, newPosition, time });
}

// Function to notify the server about card flip
export function notifyCardFlip(card) {
    const cardId = card.id;
    if (card.isPartOfHand)
    {
        if (show)
            socket.emit('flipCard', { code, cardId, player });
    }
    else
        socket.emit('flipCard', { code, cardId, player });
}

// Function to notify the server when cursor is down
export function notifyCursorDown(card, cardId, zIndex) {
    if (!card.isPartOfHand)
        card.rotate(rot);
    card.saveRot = rot;
    socket.emit('cursorDown', { code, cardId, player, zIndex, rot });
}

// Function to notify the server when cur
export function notifyCursorUp(card) {
    const cardId = card.id
    socket.emit('cursorUp', { code, cardId, player });
    player.showHand();
}

export function notifyShuffle(change) {
    socket.emit('shuffle', code, change);
}

document.getElementById("back-button").addEventListener('click', () => {
    window.location.href = "/";
});


/////////////////////////
/// R E C E I V E R S ///
/////////////////////////

// Handle connection

socket.on("chooseColor", (colors) => {
    for (const color of colors) {
        let elem = document.createElement('input');
        elem.classList.add('color');
        elem.style.backgroundColor = color;
        elem.setAttribute("type", "radio");
        elem.setAttribute("name", "color");
        elem.setAttribute("id", color);

        let label = document.createElement('label');
        label.setAttribute("for", color);

        label.addEventListener('click', () => {
            checkedColor = color;
        });
        let span = document.createElement('span');
        span.style.backgroundColor = color;
        span.classList.add(color);

        label.appendChild(span);
        document.getElementById("color-container").appendChild(elem);
        document.getElementById("color-container").appendChild(label);
    }
});

document.getElementById("code").addEventListener('click', () => {

    navigator.clipboard.writeText(code);
});

document.getElementById("play").addEventListener('click', () => {

    let name = document.getElementById("input-name").value;
    if (name === "") name = "Blondie"

    document.getElementById("colorChoose").remove();
    document.getElementById("background").remove()

    const color = checkedColor;

    if (checkedColor === "#CD5C08") rot = 0;
    else if (checkedColor === "#D08A9B") rot = 90;
    else if (checkedColor === "#3366CC") rot = 180;
    else if (checkedColor === "#60453C") rot = 270;

    document.getElementById("mat").style.rotate = rot + 'deg';
    socket.emit('initialInfo', { code, color, name, rot});
    document.getElementById('game').classList.remove("disabled");
});



// Receive message from the Server
socket.on('message', (text) => {
    console.log('Message received:', text);
});

// Receive current deck hold by the Server
socket.on('deck', (deck_, maxZ, rot_) => {
    deck = new Deck(deck_, maxZ, rot_);
});

// Receive current deck hold by the Server
socket.on('code', (code_) => {
    code = code_;
});


socket.on('newPlayer', (name_, rot_, color_) => {
console.log(name_, rot_, color_);
    playerName(name_, rot_, color_);

});


// Receive player with ID and Color given by the Server
socket.on('player', (players, player_) => {

    for (const col in players)
    {
        if (players[col].id !== socket.id && players[col].id !== 0)
        playerName(players[col].name, players[col].rot, players[col].color);
    }


    player.assign(player_);
    document.getElementById("name").textContent = player_.name;
    document.getElementById("name").style.border = "0.1em solid " + player_.color;
    // document.getElementById("color").style.backgroundColor = player_.color;
    document.getElementById("code").textContent = code;
    for (const card of player_.hand) {
        // document.getElementById("hand").appendChild(deck.deck[card.id].cardElem);
        player.addCard(deck.deck[card.id])
        deck.deleteCard(deck.deck[card.id], rot)
        deck.deck[card.id].isPartOfHand = true;
        deck.deck[card.id].rotate();
    }

    player.showHand(window.innerWidth / 2);

});

// Receive moved card and change its position
function playerName(name, rot_, color_) {
    // const card = deck.deck[cardId];
    const elem = document.createElement('div');
    elem.textContent = name;
    if (rot_ === 0)
    {
        elem.style.top = "100%";
    }
    else if (rot_ === 90)
    {
        elem.style.top = "90%";
        elem.style.left = "96%";
        elem.style.rotate = (-rot_) + "deg";
    }
    elem.classList.add("name");
    elem.style.border = "0.1em solid " + color_;
    document.getElementById("mat").appendChild(elem);
    

}

// Receive moved card and change its position
socket.on('cardMoved', (cardId, newPosition, time) => {
    const card = deck.deck[cardId];
    // console.log("cardMoved", newPosition)
    card.changePosition(newPosition, card.zIndex, card.rot, true, time);
});

// Receive flipped card and flip it
socket.on('cardFlipped', (cardId, front) => {
    console.log("card flipped");
    console.log("GET FRONT", front)
    deck.deck[cardId].flipCard(false, front)
});

// Receive when a cursor went DOWN on a card
socket.on('cursorDowned', (cardId, player_, rot) => {
    console.log("cursordowned")
    // const card = deck.getCardFromId(cardId);
    deck.deck[cardId].setDraggingTrue();
    deck.deck[cardId].setzIndex();
    if (!deck.deck[cardId].isPartOfHand)
    {
        deck.deck[cardId].rotate(rot);
        player.rotation(rot);
    }
    deck.deck[cardId].setBorder(player_.color);
});

// Receive when a cursor went UP on a card
socket.on('cursorUpped', (cardId) => {
    console.log("cursorupped")
    deck.deck[cardId].setDraggingFalse()
    deck.deck[cardId].resetBorder()
});


// Receive byDefault from the Server
socket.on('setDefault', (rot) => {
    deck.byDefault(rot);
});

// Receive bySuit from the Server
socket.on('setSuit', () => {
    deck.bySuit();
});

// Receive byRank from the Server
socket.on('setRank', () => {
    deck.byRank();
});

// Receive flippedDeck from the Server
socket.on('flippedDeck', () => {
    deck.flipDeck();
});

socket.on('shuffled', (change) => {
    deck.assignFromShuffle(change)
    deck.byDefault();
});

socket.on('dealing', (card) => {
    console.log("DEALING")
    deck.deal(player);
    player.showHand(window.innerWidth / 2);
});

socket.on('cardAddedToHand', (card, _rot) => {
    console.log("cardAddedToHand")
    deck.deleteCard(deck.deck[card.id], _rot);
    deck.deck[card.id].disabled = true;
    deck.deck[card.id].resetBorder();
});

socket.on('cardDeletedFromHand', (card) => {
    console.log("cardDeletedFromHand")
    deck.addCard(card);
    deck.deck[card.id].disabled = false;
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
const showMyHandBtn = document.getElementById('showMyHand');
const numCards = document.getElementById('numCards');
const leaveBtn = document.getElementById('leave');
const hideBtn = document.getElementById('hide');
// const connect = document.getElementById('connect');

byDefaultBtn.addEventListener('click', () => {
    // Call the shuffle function inside the Deck class
    deck.byDefault(rot);
    socket.emit('byDefault', code, rot);

});

bySuiteBtn.addEventListener('click', () => {
    // Call the shuffle function inside the Deck class
    socket.emit('bySuit', code);
    deck.bySuit();
});

byRankBtn.addEventListener('click', () => {
    // Call the shuffle function inside the Deck class
    socket.emit('byRank', code);
    deck.byRank();
});

flipBtn.addEventListener('click', () => {
    // Call the shuffle function inside the Deck class
    deck.flipDeck();
    socket.emit('flipDeck', code);
});


shuffleBtn.addEventListener('click', () => {
    // Call the shuffle function inside the Deck class
    deck.shuffle();
});

dealBtn.addEventListener('click', () => {
    deck.byDefault();
    if (numCards.value == undefined || numCards.value == 0) numCards.value = 5;
    
    socket.emit('deal', code, numCards.value);
});

// Call the order method for the players Hand
orderMyHandBtn.addEventListener('click', () => {
    player.order();
    player.showHand(window.innerWidth / 2);
});

// Call the order method for the players Hand
showMyHandBtn.addEventListener('click', () => {

    if (show)
    {
        for (const card of player.hand)
        {
            const cardId = card.id;
            const front = false;
            socket.emit('flipCard', { code, cardId, player, front });
        }
        show = 0;
        showMyHandBtn.textContent = "Show";
    }
    else
    {
        for (const card of player.hand)
        {
            const cardId = card.id;
            const front = card.front;
            socket.emit('flipCard', { code, cardId, player, front });
        }
        show = 1;
        showMyHandBtn.textContent = "Hide";
    }

});

// Call the order method for the players Hand
leaveBtn.addEventListener('click', () => {
    window.location = "/";
});

hideBtn.addEventListener('click', () => {
    let menu = document.getElementById("menu").style;
    if (hideMenu)
    {       
        document.getElementById("outerMenu").style.boxShadow = "0px 3px 0px 0px rgba(0,0,0,0.4)";
        document.getElementById("outerMenu").style.backgroundColor = "#116E41";
        menu.opacity = "1";
        menu.pointerEvents = "";
    }
    else
    {
        document.getElementById("outerMenu").style.boxShadow = 'none';
        document.getElementById("outerMenu").style.backgroundColor = "transparent";
        menu.opacity = "0";
        menu.pointerEvents = "none";
    }
    hideMenu = !hideMenu;
});


let isDown = false;
let startY;

zoomElement.addEventListener('mousedown', (e) => {
    if (e.button === 1 || e.button === 2) {
        isDown = true;
        startY = e.clientY - zoomElement.offsetTop;
        zoomElement.style.cursor = 'grabbing';
    }
});

zoomElement.addEventListener('mouseleave', () => {
    isDown = false;
});

zoomElement.addEventListener('mouseup', (e) => {
    if (e.button === 1 || e.button === 2) {
        isDown = false;
        zoomElement.style.cursor = 'default';
    }
});

document.addEventListener('mousemove', (e) => {
    if (!isDown) return;

    e.preventDefault();
    const walkY = (e.pageY - startY);
    if (walkY <= Math.round((zoom - 1) * 98 / 0.3) && walkY >= -(Math.round((zoom - 1) * 98 / 0.3)))
        zoomElement.style.top = (walkY) + 'px';
});
