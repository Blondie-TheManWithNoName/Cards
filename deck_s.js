import { cardValueEnum, cardSuitEnum, quickSort } from './util.js';
import { Card } from './card_s.js';
import { Player } from './player_s.js';

const suitEnum = Object.values(cardSuitEnum);
const valueEnum = Object.values(cardValueEnum);

export class Deck {


    constructor() {
        this.deck = {}
        this.cards = []
        this.front = true;
        
        this.initializeDeck();
        this.byDefault();
    }

    // Create cards
    initializeDeck() {
        let index = 0;
        for (const suit of suitEnum) {
            for (const value of valueEnum) {
                this.deck[suit + value.name] = new Card(suit, value, index);
                this.cards.push(this.deck[suit + value.name]);
                ++index;
            }
        }

        // for (const suit of suitEnum) {
        //     for (const value of valueEnum) {
        //         console.log(this.deck[suit + value].id);
        //         // this.cards.push(this.deck[suit + value]);
        //     }
        // }
    }

    flipDeck() {
        this.front = !this.front;
        for (const card of this.cards)
            card.flipCard(false, this.front, false);
    }

    shuffle() {
        let currentIndex = this.cards.length;
        let temporaryValue, randomIndex;
        this.sorted = false;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            temporaryValue = this.cards[currentIndex];
            this.cards[currentIndex] = this.cards[randomIndex];
            this.cards[randomIndex] = temporaryValue;
        }

        this.byDefault();
    }

    byDefault() {

        // Coordinates of the center of Mat
        let x = 50 - (0.025 * 51);
        let y = 50 - (0.025 * 51);
        let z = 1;
        for (const card of this.cards) {
            card.changePosition({x: x, y: y}, z, false, true)
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

        for (const card of this.cards) {
            z = 1;

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
        let x = 50;
        let y = 100 + 12;
        if (this.cards.length > 0) {
            this.cards[this.cards.length - 1].changePosition({x: x, y: y}, this.cards[this.cards.length - 1].zIndex);
            player.addCardToHand(this.cards[this.cards.length - 1]);
        }

    }

    getCard(index) {
        return this.cards[index]
    }

    getCardFromId(id) {
        for (const card of this.cards)
            if (card.id == id) return card;
        return false
    }

    getDeck() {
        return this.cards;
    }

    getMaxz() {
        return Card.maxZ;
    }

    deleteCardFromId(cardId) {
        for (let i = 0; i < this.cards.length; ++i)
            if (this.cards[i].id === cardId) {
                this.cards.splice(i, 1);
                break;
            }
    }

    deleteCard(index) {
        this.cards.splice(index, 1);
    }

    addCard(card) {
        this.cards.push(new Card(card.suit, card.value, { x: card.pos.x, y: card.pos.y }, card.zIndex, card.front, card.index));
        if (card.index !== this.cards.length - 1)
            this.sorted = false;
    }

    assignFromShuffle(change) {
        let temporaryValue;
        this.sorted = false;
        for (let i = 0; i < change.length; ++i) {
            temporaryValue = this.cards[change[i][0]]
            this.cards[change[i][0]] = this.cards[change[i][1]];
            this.cards[change[i][1]] = temporaryValue;
        }
    }

}