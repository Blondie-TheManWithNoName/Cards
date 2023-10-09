import { cardValueEnum, cardSuitEnum, addListener } from './util.js';
import { Card } from './card.js';
import { Player } from './player.js';
import { notifyShuffle } from './client.js';

export class Deck {


    constructor(deck, maxZ) {
        this.suit = Object.values(cardSuitEnum);
        this.value = Object.values(cardValueEnum);
        this.front = true;
        this.z = 1;
        this.cards = []
        if (deck === undefined)
            this.initializeDeck();
        else {
            this.front = deck.front;
            Card.maxZ = maxZ;
            this.initializeDeck(deck);
        }
    }

    flipDeck() {
        
        this.front = !this.front;
        for (const card of this.cards)
        {
            // console.log("HEY HEY")
            card.flipCard(false, this.front, false);
        }
    
        // this.cards[this.value.length-1][0].flipCard(this.front);
        // this.cards[this.value.length-1][1].flipCard(this.front);
    }

    shuffle() {
        let currentIndex = this.cards.length;
        let temporaryValue, randomIndex;
        let change = []
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            change.push([currentIndex, randomIndex])
            temporaryValue = this.cards[currentIndex]
            this.cards[currentIndex] = this.cards[randomIndex];
            this.cards[randomIndex] = temporaryValue;
        }

        notifyShuffle(change)
        this.byDefault();
    }

    initializeDeck(deck) {

        if (this.cards == 0) {
            if (deck === undefined) {
                for (let i = 0; i < this.suit.length - 1; ++i) {
                    for (let j = 0; j < this.value.length - 1; ++j)
                        this.cards.push(new Card(this.suit[i], this.value[j], { x: 0, y: 0 }, this.z, true, this.cards.length));
                }
            }
            else {
                for (const card of deck.cards)
                    this.cards.push(new Card(card.suit, card.value, { x: card.pos.x, y: card.pos.y }, card.zIndex, card.front, card.index));
            }
        }
        else {
            let i, j = 0;
            let x, y = 100;
            for (const card of this.cards) {

                card.changeCard(this.suit[j], this.value[i]);
                if (i < 12) {
                    ++this.z;
                    x += 50;
                    ++i;
                }
                else {
                    x = 100;
                    i = 0;
                    ++j;
                }
            }
            // this.cards[this.value.length - 1] = []
            // this.cards[this.value.length - 1][0] = (new Card(cardSuitEnum.Joker, cardValueEnum.Joker, {x:this.x, y:this.y}, this.z));
            // this.cards[this.value.length - 1][1] = (new Card(cardSuitEnum.Joker, cardValueEnum.Joker, {x:this.x, y:this.y}, this.z));
        }
    }

    byDefault() {

        let x = 100;
        let y = 100;
        for (const card of this.cards) {
            card.changePosition({ x: x, y: y }, this.z, false, true)
            ++this.z;
            x += 0.5;
            y += 0.5;

        }
        // this.cards[this.value.length-1][0].changePosition({x: ++this.x, y: ++this.y}, this.z)
        // this.cards[this.value.length-1][1].changePosition({x: ++this.x, y: ++this.y}, this.z)
    }

    bySuit() {
        let x, y = 100;
        let i = 0
        this.initializeDeck();
        for (const card of this.cards) {
            this.z = 1;
            card.changePosition({ x: x, y: y }, this.z, false, true);

            if (i < 12) {
                ++this.z;
                x += 50;
                ++i;
            }
            else {
                x = 100;
                y += 160;
                i = 0;
            }
        }
    }

    byRank() {
        
        // for (const card of this.cards)
        //     console.log(card.index)

        // this.initializeDeck();
        // let x, y = 100;
        // let i, j = 0;
        // for (const card of this.cards) {
        //     this.z = 1;
        //     card.changePosition({ x: x, y: y }, this.z, false, true)
        //     ++this.z;
        //     if (i < 12) {
        //         y += 160;
        //         ++i;
        //     }
        //     else {
        //         y = 100;
        //         x = 100 + (j) * 15;
        //         i = 0;
        //     }
        //     if (i % 4 == 0 && i != 0) {
        //         y = 100;
        //         x += 350;
        //         ++j;
        //     }
        // }

        // this.cards[this.value.length-1][0].changePosition({x: 100*5, y: 100}, this.z)
        // this.cards[this.value.length-1][1].changePosition({x: 100*6, y: 100}, this.z)
    }

    deal(player) {
        let x = window.innerWidth/2;
        let y = 600;
        this.cards[this.cards.length - 1].changePosition({x: x, y: y}, this.cards[this.cards.length - 1].zIndex, true, true, 2);
        player.addCardToHand(this.cards[this.cards.length - 1])
        this.deleteCard(this.cards.length - 1);
    
    
        // for (let i=0; i < numCards; ++i) {
        //     index = this.cards.length - 1;
        //     player.addCardToHand(this.cards[index]);
        //     this.cards.splice(index, 1);
        // }
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

    assign(deck, maxZ)
    {
        let i;
        Card.maxZ = maxZ;
        this.front = deck.front;
        console.log("this.cards.length", this.cards.length)
        for (i =0; i < deck.cards.length; ++i)
        {
            this.cards[i].assign(deck.cards[i]);
        }
        while (i < this.cards.length)
        {
            this.deleteCard(this.cards.length - 1, true);
        }

    }

    deleteCardFromId(cardId, dom = false) {
        for (let i = 0; i < this.cards.length; ++i)
            if (this.cards[i].id === cardId) {
                if (dom) this.cards[i].deleteCard();
                this.cards.splice(i, 1);
                break;
            }
    }

    deleteCard(index, dom = false) {
        console.log("deleting", this.cards[index])
        if (dom) this.cards[index].deleteCard();
        this.cards.splice(index, 1);
    }

    addCard(card) {
        this.cards.push(new Card(card.suit, card.value, { x: card.pos.x, y: card.pos.y }, card.zIndex, card.front, card.index));
    }

    addCardServer(card) {
        this.cards.push(card);
    }

    assignFromShuffle(change) {
        let temporaryValue;
        for (let i = 0; i < change.length; ++i) {
            temporaryValue = this.cards[change[i][0]]
            this.cards[change[i][0]] = this.cards[change[i][1]];
            this.cards[change[i][1]] = temporaryValue;
        }
    }
}