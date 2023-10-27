import { cardValueEnum, cardSuitEnum, addListener, quickSort, getPercentX, getPercentY } from './util.js';
import { Card } from './card.js';
import { Player } from './player.js';
import { notifyShuffle } from './client.js';

export class Deck {


    static matElem = document.getElementById("mat")

    constructor(deck, maxZ) {
        this.suit = Object.values(cardSuitEnum);
        this.value = Object.values(cardValueEnum);
        this.front = true;
        this.z = 1;
        this.cards = []
        this.sorted = deck.sorted;
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
            card.flipCard(false, this.front, false);
        }
    
        // this.cards[this.value.length-1][0].flipCard(this.front);
        // this.cards[this.value.length-1][1].flipCard(this.front);
    }

    shuffle() {
        let currentIndex = this.cards.length;
        let temporaryValue, randomIndex;
        let change = []
        this.sorted = false;
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
        let matRect = Deck.matElem.getBoundingClientRect();
        let x = 50 - (0.025 * 51)//50 - 6.5;
        let y = 50 - (0.025 * 51)//50 - 8.8;
        for (const card of this.cards) {
            card.changePosition({ x: x, y: y }, this.z, false, true)
            ++this.z;
            x += 0.025;
            if (x === 25.5) x = 100;
            y += 0.025;

        }
        // this.cards[this.value.length-1][0].changePosition({x: ++this.x, y: ++this.y}, this.z)
        // this.cards[this.value.length-1][1].changePosition({x: ++this.x, y: ++this.y}, this.z)
    }

    bySuit() {
        let x = 15; 
        let y = 20;
        let i = 0;
        let previous = 0;

        if (!this.sorted) this.cards = quickSort(this.cards, 'index');

        for (const card of this.cards) {
            this.z = 1;
            
            while (card.index - previous >= 1)
            {

                if (i < 12) {
                    ++this.z;
                    x += 5;
                    ++i;
                }
                else {
                    x = 15;
                    y += 15;
                    i = 0;
                }
                ++previous;

            }
            card.changePosition({ x: x, y: y }, this.z, false, true);
            previous = card.index;

        }
    }

    byRank() {
        
        if (!this.sorted) this.cards = quickSort(this.cards, 'index');
        
        let x = 30;
        let y = 20;
        let i=0;
        let j=0;
        let previous = 0;
        for (const card of this.cards)
        {
            this.z = 1;
            while (card.index - previous >= 1)
            {
                
                if (i < 12)
                {
                    y += 15;
                    ++i;
                }
                else
                {
                    y = 20;
                    x = 30 + (j)*0.5;
                    i = 0;
                }
                if (i%4 == 0 && i != 0)
                {
                    y = 20;
                    x += 15;
                    ++j;
                    
                }
                ++previous;
            }
            
            card.changePosition({ x: x, y: y }, this.z, false, true)
            ++this.z;
            previous = card.index;
        }

        // this.cards[this.value.length-1][0].changePosition({x: 100*5, y: 100}, this.z)
        // this.cards[this.value.length-1][1].changePosition({x: 100*6, y: 100}, this.z)
    }

    deal(player) {
        if (this.cards.length > 0)
        {
            player.addCardToHand(this.cards[this.cards.length - 1])
            this.deleteCard(this.cards.length - 1);
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

    assign(deck, maxZ)
    {
        let i;
        Card.maxZ = maxZ;
        this.front = deck.front;
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
        if (dom) this.cards[index].deleteCard();
        this.cards.splice(index, 1);
    }

    addCard(card) {
        this.cards.push(new Card(card.suit, card.value, { x: card.pos.x, y: card.pos.y }, card.zIndex, card.front, card.index));
        // this.cards.push(card);
        if (card.index !== this.cards.length - 1)
            this.sorted = false;

    }

    addCardServer(card) {
        
        // We put the card on top
        this.cards.push(card);
        if (card.index !== this.cards.length - 1)
            this.sorted = false;

        // let previous = 0;
        // if (this.sorted)
        // {
        //     for (let i = 0; i < this.cards.length; ++i)
        //     {
        //         if (this.cards[i + 1] === undefined) this.cards.push(card);
        //         else
        //         {
        //             if (this.cards[i] >this.cards[i + 1])
        //         }
        //         this.cards.splice(i, 0, card);
        //         previous = this.cards[i].index;
        //     }
        // }
        // else
        //     this.cards.push(card);

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