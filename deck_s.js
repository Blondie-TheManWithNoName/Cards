import {cardValueEnum, cardSuitEnum, quickSort} from './util.js';
import {Card} from './card_s.js';
import {Player} from './player_s.js';


export class Deck {

    
    constructor(notifyPositionChange, order)
    {
        this.suit = Object.values(cardSuitEnum);
        this.value = Object.values(cardValueEnum);
        this.front = true;
        this.x = 0;
        this.y = 0;
        this.z = 1;
        this.cards = []
        this.sorted = true;
        this.notifyPositionChange = notifyPositionChange
        this.initializeDeck();
        this.byDefault();

    }

    flipDeck()
    {
        this.front = !this.front;
        for (const card of this.cards)
                card.setFront(this.front);
        // this.cards[this.value.length-1][0].flipCard(this.front);
        // this.cards[this.value.length-1][1].flipCard(this.front);

    }

    shuffle()
    {
        let currentIndex = this.cards.length;
        let temporaryValue, randomIndex;
        this.sorted = false;
        while (currentIndex !== 0) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
      
            // And swap it with the current element.
            temporaryValue = this.cards[currentIndex]
            this.cards[currentIndex]= this.cards[randomIndex];
            this.cards[randomIndex] = temporaryValue;
          }

          this.byDefault();
    }

    initializeDeck() {


        if (this.cards == 0)
        {
            
            for (let i = 0; i < this.suit.length - 1; ++i) {
                // cards[i] = []
                for (let j = 0; j < this.value.length - 1; ++j) {
                    this.cards.push(new Card(this.suit[i], this.value[j], {x:this.x, y:this.y}, this.z, this.front, this.cards.length));
                }
            }
        }
        else
        {
            let i = 0;
            let j = 0;
            for (const card of this.cards)
            {

                card.changeCard(this.suit[j], this.value[i]);
                if (i < 12)
                {
                    ++this.z;
                    this.x += 50;
                    ++i;
                }
                else
                {
                    this.x = 100;
                    i = 0;
                    ++j;
                }  
            }
        }
        // this.cards[this.value.length - 1] = []
        // this.cards[this.value.length - 1][0] = (new Card(cardSuitEnum.Joker, cardValueEnum.Joker, {x:this.x, y:this.y}, this.z));
        // this.cards[this.value.length - 1][1] = (new Card(cardSuitEnum.Joker, cardValueEnum.Joker, {x:this.x, y:this.y}, this.z));

    }

    byDefault(hands)
    {

        let x = 50 - (0.025 * 51)//50 - 6.5;
        let y = 50 - (0.025 * 51)//50 - 8.8;
        for (const card of this.cards) {
            card.changePosition({ x: x, y: y }, this.z, false, true)
            ++this.z;
            x += 0.025;
            if (x === 25.5) x = 100;
            y += 0.025;

        }
        // }        
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

    byRank()
    {
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

    }
        // this.cards[this.value.length-1][0].changePosition({x: 100*5, y: 100}, this.z)
        // this.cards[this.value.length-1][1].changePosition({x: 100*6, y: 100}, this.z)

    

    deal(player) {
        let x = 50;
        let y = 100 + 12;
        this.cards[this.cards.length - 1].changePosition({x: x, y: y}, this.cards[this.cards.length - 1].zIndex);
        player.addCardToHand(this.cards[this.cards.length - 1]);
        
    }
    
    getCard(index)
    {
        return this.cards[index]
    }

    getCardFromId(id)
    {
        for (const card of this.cards)
            if (card.id == id) return card;
        return false
    }

    getDeck()
    {
        return this.cards;
    }

    assign(deck, maxZ)
    {
        // Card.maxZ = maxZ;
        for (let i =0; i < deck.cards.length; ++i)
        {
            this.cards[i].assign(deck.cards[i]);
        }
    }

    getMaxz()
    {
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

    addCard(card)
    {
        // for (let i=0; i < this.cards.length; ++i)
        //     if (this.cards[i].id === cardId) {
        //         return
        //     }
        this.cards.push(new Card(card.suit, card.value, {x:card.pos.x, y:card.pos.y}, card.zIndex, card.front, card.index));
        if (card.index !== this.cards.length - 1)
            this.sorted = false;
    }

    assignFromShuffle(change)
    {
        let temporaryValue;
        this.sorted = false;
        for (let i = 0; i < change.length; ++i)
        {
            temporaryValue = this.cards[change[i][0]]
            this.cards[change[i][0]]= this.cards[change[i][1]];
            this.cards[change[i][1]] = temporaryValue;
        }
    }

}