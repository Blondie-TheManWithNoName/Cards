import { cardValueEnum, cardSuitEnum, addListener, quickSort, getPercentX, getPercentY } from './util.js';
import { Card } from './card.js';
import { notifyShuffle } from './client.js';


const suitEnum = Object.values(cardSuitEnum);
const valueEnum = Object.values(cardValueEnum);

export class Deck {


    constructor(deck, maxZ, rot) {
        this.deck = {}
        this.cards = []
        this.front = deck.front;
        Card.maxZ = maxZ;

        this.initializeDeck(deck, rot);
    }

    // Create cards from given deck
    initializeDeck(deck, rot) {

        for (const id in deck.deck) {
            const card = deck.deck[id];
            if (card.owner !== rot)
            {
                this.deck[card.value.name + card.suit] = new Card(card.suit, card.value, {x: card.pos.x, y: card.pos.y}, card.zIndex, card.front, card.index, card.rot, card.owner, "mat");
                if (card.owner === -1)
                    this.cards.push(this.deck[card.value.name + card.suit]);
                else
                {
                    this.deck[card.value.name + card.suit].disabled = true;
                    this.deck[card.value.name + card.suit].rotate(card.owner);
                }
            }
            else{
                this.deck[card.value.name + card.suit] = new Card(card.suit, card.value, {x: card.pos.x, y: card.pos.y}, card.zIndex, card.front, card.index, card.rot, card.owner, "hand");
            }
        }
    }

    initializeCards()
    {
        this.cards = [];
        let index = 0;
        for (const suit of suitEnum) {
            for (const value of valueEnum) {
                if (this.deck[value.name + suit].owner === -1)
                {
                    this.deck[value.name + suit].index = index;
                    this.cards.push(this.deck[value.name + suit]);
                }
                ++index;
            }
        }
    }

    flipDeck() {

        this.front = !this.front;
        for (const card of this.cards)
            card.flipCard(false, this.front, false);
    }

    shuffle() {
        let currentIndex = this.cards.length;
        let temporaryValue, randomIndex;
        let change = [];
        this.sorted = false;
        
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            --currentIndex;
            
            change.push([currentIndex, randomIndex])
            temporaryValue = this.cards[currentIndex]
            this.cards[currentIndex] = this.cards[randomIndex];
            this.cards[currentIndex].index = currentIndex;
            this.cards[randomIndex] = temporaryValue;
            this.cards[randomIndex].index = randomIndex;
        }
        
        this.byDefault();
        notifyShuffle(change);
    }

    byDefault(rot) {

        // Coordinates of the center of Mat
        let x = 0 - (0.025 * this.cards.length);
        let y = 0 - (0.025 * this.cards.length);
        let z = 1;
        console.log("this.cards.length", this.cards.length)
        for (const card of this.cards) {
            card.changePosition({x: x, y: y}, z, rot, true);
            ++z;
            x += 0.025;
            y += 0.025;
        }
    }

    bySuit(rot) {
        let x = -30;
        let y = -22.5;
        let z = 1;
        let i = 0, previous = 0;

        this.initializeCards();

        for (const card of this.cards) {

            while (card.index - previous >= 1) {
                if (i < 12) {
                    ++z, ++i;
                    x += 5;
                }
                else {
                    x = -30;
                    y += 15;
                    i = 0;
                }
                ++previous;
            }
            card.changePosition({x: x, y: y}, z, rot, true);
            previous = card.index;
        }
    }

    byRank(rot) {
        if (!this.sorted) this.cards = quickSort(this.cards, 'index');

        let x = -30;
        let y = -30;
        let z;
        let i = 0, j =0, previous = 0;

        this.initializeCards();

        for (const card of this.cards) {
            z = 1;
            while (card.index - previous >= 1) {

                if (i < 12) {
                    y += 15;
                    ++i;
                }
                else {
                    y = -30;
                    x = -30 + (j * 0.5);
                    i = 0;
                }

                if (i % 4 == 0 && i != 0) {
                    y = -30;
                    x += 15;
                    ++j;
                }
                ++previous;
            }

            card.changePosition({x: x, y: y}, z, rot, true)
            ++z;
            previous = card.index;
        }

    }

    deal(player) {
        if (this.cards.length > 0) {
            console.log("DEALING", this.cards[this.cards.length - 1].id)
            document.getElementById("hand").appendChild(this.cards[this.cards.length - 1].cardElem);
            player.addCard(this.cards[this.cards.length - 1]);
            this.deleteCard(this.cards[this.cards.length - 1], player.rot);

        }
    }

    getCard(index) {
        return this.cards[index];
    }

    getCardFromId(id) {
        for (const card of this.cards)
            if (card.id == id) return card;
    }

    getDeck() {
        return this.cards;
    }

    addCard(_card) {
        const card = this.deck[_card.id];
        if (card.owner !== -1)
        {
            card.owner = -1;
            card.setzIndex2(this.cards.length);
            this.cards.push(card);
        }
    }
    
    deleteCard(card, owner) {
        this.cards.splice(card.index, 1);
        card.owner = owner;
    }

    // Ordering cards according to how they've been shuffled in another clients side
    assignFromShuffle(change) {
        let temporaryValue;
        this.sorted = false;
        for (let i = 0; i < change.length; ++i) {
            temporaryValue = this.cards[change[i][0]]
            this.cards[change[i][0]] = this.cards[change[i][1]];
            this.cards[change[i][0]].index = change[i][0];

            this.cards[change[i][1]] = temporaryValue;
            this.cards[change[i][1]].index = change[i][1];
        }
    }
}