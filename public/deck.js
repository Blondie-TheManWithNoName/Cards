import {cardValueEnum, cardSuitEnum, addListener} from './util.js';
import {Card} from './card.js';
import {Player} from './player.js';


export class Deck {

    
    constructor(order)
    {
        this.suit = Object.values(cardSuitEnum);
        this.value = Object.values(cardValueEnum);
        this.front = true;
        this.x = 100;
        this.y = 100;
        this.z = 1;
        this.cards = []
        this.initializeDeck();
        // setTimeout(() => {
        //     this.byDefault();
        //   }, 100);
    }

    flipDeck()
    {
        this.front = !this.front;
        console.log("this.front", this.front)
        for (const card of this.cards)
                card.setFront(this.front);
        
                // this.cards[this.value.length-1][0].flipCard(this.front);
        // this.cards[this.value.length-1][1].flipCard(this.front);

    }

    shuffle()
    {
        let currentIndex = this.cards.length;
        let temporaryValue, randomIndex;

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
                console.log(this.suit[i])
                for (let j = 0; j < this.value.length - 1; ++j) {
                    // console.log(this)
                    this.cards.push(new Card(this.suit[i], this.value[j], {x:this.x, y:this.y}, this.z));
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

            // for (let i = 0; i < this.value.length +  this.suit.length - 1 - 1; ++i) {
            //         console.log(this.suit[j] + " " + this.value[i].name)
                 
            // }
        }
        // this.cards[this.value.length - 1] = []
        // this.cards[this.value.length - 1][0] = (new Card(cardSuitEnum.Joker, cardValueEnum.Joker, {x:this.x, y:this.y}, this.z));
        // this.cards[this.value.length - 1][1] = (new Card(cardSuitEnum.Joker, cardValueEnum.Joker, {x:this.x, y:this.y}, this.z));

    }

    byDefault(hands)
    {

        this.x = 100;
        this.y = 100;
        console.log(this.cards.length)
        // if (hands !== undefined)
        // {
        //     console.log(hands)
        //     for (const hand of hands)
        //     {
        //         this.cards = this.cards.concat(hand)
        //         // for (let i = hand.length; i >= 0; --i)
        //         //     this.cards.push(hand[i])

        //         hand.length = 0
        //     }
        // }
        console.log(this.cards.length)
        for (const card of this.cards)
        {
                card.changePosition({x: this.x, y: this.y}, this.z)
                ++this.z;
                this.x += 0.5;
                this.y += 0.5;

        }        
        // this.cards[this.value.length-1][0].changePosition({x: ++this.x, y: ++this.y}, this.z)
        // this.cards[this.value.length-1][1].changePosition({x: ++this.x, y: ++this.y}, this.z)

    }

    bySuit()
    {
        this.x = 100;
        this.y = 100;
        let i=0
        this.initializeDeck();
        for (const card of this.cards)
        {
            // console.log(card.getKey())
            this.z = 1;
            card.changePosition({x: this.x, y: this.y}, this.z)
            
            if (i < 12)
            {
                ++this.z;
                this.x += 50;
                ++i;
            }
            else{
                this.x = 100;
                this.y += 160;
                i = 0;
            }   
        }

        // for (let i = 0; i < this.suit.length - 1; ++i)
        // {
        //     this.z = 1;
        //     for (let j = 0; j < this.value.length - 1; ++j)
        //     {
        //         hand[j][i].changePosition({x: this.x, y: this.y}, this.z)
        //         ++this.z;
        //         this.x += 50;
        //     }
        //     this.x = 100;
        //     this.y += 160;
        // }
        // this.cards[this.value.length-1][0].changePosition({x: 100, y: 160*4 + 100}, this.z)
        // this.cards[this.value.length-1][1].changePosition({x: 150, y: 160*4 + 100}, this.z)

        // this.x = 100;
        // this.y = 100;

        // for (let i = 0; i < this.suit.length - 1; ++i)
        // {
        //     this.z = 1;
        //     for (let j = 0; j < this.value.length - 1; ++j)
        //     {
        //         hand[j][i].changePosition({x: this.x, y: this.y}, this.z)
        //         ++this.z;
        //         this.x += 50;
        //     }
        //     this.x = 100;
        //     this.y += 160;
        // }

    }

    byRank()
    {
        this.initializeDeck();
        this.x = 100;
        this.y = 100;
        let i=0;
        let j=0;
        for (const card of this.cards)
        {
            this.z = 1;
            card.changePosition({x: this.x, y: this.y}, this.z)
            ++this.z;
            if (i < 12)
            {
                this.y += 160;
                ++i;
            }
            else
            {
                this.y = 100;
                this.x = 100 + (j)*15;
                i = 0;
            }
            if (i%4 == 0 && i != 0)
            {
                this.y = 100;
                this.x += 350;
                ++j;

            }
        }

        // this.cards[this.value.length-1][0].changePosition({x: 100*5, y: 100}, this.z)
        // this.cards[this.value.length-1][1].changePosition({x: 100*6, y: 100}, this.z)

    }

    deal(player, hand)
    {
        // if (this.front) this.flipDeck()
        // this.shuffle();
        this.x = 400;
        this.y = 600;
        for (const card of hand)
        {
            this.getCardFromId(card.id).changePosition({x: this.x, y: this.y}, this.z, {z: 0, y: 0})
            this.x += 75;
        }   
        // setTimeout(() => {
            

        // }, 100);
        
    }
    
    getCard(index)
    {
        return this.cards[index]
    }

    getCardFromId(id)
    {
        for (const card of this.cards)
            if (card.id == id) return card;
    }

    getDeck()
    {
        return this.cards;
    }

    assign(deck, maxZ)
    {
        Card.maxZ = maxZ;
        this.front = deck.front;
        for (let i =0; i < this.cards.length; ++i)
        {
            this.cards[i].assign(deck.cards[i]);
        }
    }

    deleteCard(cardId)
    {
        for (let i=0; i < this.cards.length; ++i)
            if (this.cards[i].id === cardId) {
                this.cards[i].deleteCard();
                this.cards.splice(i, 1);
            }
    }

    addCard(card)
    {
        // for (let i=0; i < this.cards.length; ++i)
        //     if (this.cards[i].id === cardId) {
        //         return
        //     }
        this.cards.push(new Card(card.suit, card.value, {x:card.pos.x, y:card.pos.y}, card.zIndex));
    }

    deleteCardServer(cardId)
    {
        for (let i=0; i < this.cards.length; ++i)
        if (this.cards[i].id === cardId) {
                console.log("DELETE", cardId)
                this.cards.splice(i, 1);
                break;
            }
    }

    addCardServer(card)
    {
 
        this.cards.push(card);
    }
}


// if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
//     module.exports = Deck; // Export for Node.js
//   } else {
//     window.Deck = Deck; // Export for the browser
//   }