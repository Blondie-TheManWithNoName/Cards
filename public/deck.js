import { cardValueEnum, cardSuitEnum, addListener, quickSort, getPercentX, getPercentY } from './util.js';
import { Card } from './card.js';
import { notifyShuffle } from './client.js';


const suitEnum = Object.values(cardSuitEnum);
const valueEnum = Object.values(cardValueEnum);

export class Deck {

    static matElem = document.getElementById("mat")

    constructor(deck, maxZ) {
        this.deck = {}
        this.cards = []
        this.front = deck.front;
        Card.maxZ = maxZ;

        this.initializeDeck(deck);
    }

    // Create cards from given deck
    initializeDeck(deck) {

        for (const card of deck.cards) {
            this.deck[card.suit + card.value.name] = new Card(card.suit, card.value, {x: card.pos.x, y: card.pos.y}, card.zIndex, card.front, card.index);
            this.cards.push(this.deck[card.suit + card.value.name]);
        }
    }

    initializeCards()
    {
        this.cards = [];
        let index = 0;
        for (const suit of suitEnum) {
            for (const value of valueEnum) {
                if (this.deck[suit + value.name].owner === 0)
                {
                    this.deck[suit + value.name].index = index;
                    this.cards.push(this.deck[suit + value.name]);
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

    byDefault() {

        // Coordinates of the center of Mat
        let x = 50 - (0.025 * this.cards.length);
        let y = 50 - (0.025 * this.cards.length);
        let z = 1;
        for (const card of this.cards) {
            card.changePosition({x: x, y: y}, z, true);
            ++z;
            x += 0.025;
            y += 0.025;
        }
    }

    bySuit() {
        let x = 20;
        let y = 20;
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
                    x = 20;
                    y += 15;
                    i = 0;
                }
                ++previous;
            }
            card.changePosition({x: x, y: y}, z, true);
            previous = card.index;
        }
    }

    byRank() {
        if (!this.sorted) this.cards = quickSort(this.cards, 'index');

        let x = 30;
        let y = 20;
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
                    y = 20;
                    x = 30 + (j * 0.5);
                    i = 0;
                }

                if (i % 4 == 0 && i != 0) {
                    y = 20;
                    x += 15;
                    ++j;
                }
                ++previous;
            }

            card.changePosition({x: x, y: y}, z, true)
            ++z;
            previous = card.index;
        }

    }

    deal(player) {
        if (this.cards.length > 0) {
            player.addCardToHand(this.cards[this.cards.length - 1])
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

    addCard(card) {
        card.index = this.cards.length;
        card.owner = 0;
        this.cards.push(card);
    }

    deleteCard(card) {
        this.cards.splice(card.index, 1);
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