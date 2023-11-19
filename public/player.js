import { addListener, createElement, addChildElement, quickSort, getPercentX, getPercentY, getEquation } from './util.js';
import { Card } from './card.js';



// const eqPos = getEquation(0, (MAT.left/window.innerWidth)*100, 100, (MAT.right/window.innerWidth)*100);
const eqPosY = getEquation(100, 0, 125, 100);

export class Player {

    

    constructor() {
        this.Pos = { x: 0, y: 0 };
        this.score = 0;
        this.hand = []
        this.color;
        this.rot = 0;
        this.id = undefined;

        // (turn === undefined) ? this.turn = true : this.turn = turn;
        this.movingCard = undefined;

        addListener(document.body, 'mouseenter', this.onMouseEnter.bind(this))
    }

    rotation(rot)
    {
        this.rot = rot;
    }
    
    getMovingCard(card) {
        this.movingCard = card;
    }

    onMouseEnter(e) {
        if (e.target === document.body && this.movingCard)
            this.movingCard.isOut = false;
    }

    getCards(card) {
        this.hand.push(card);
    }

    myCards() {
        for (const card of this.hand)
            card.displayCardInfo();
    }

    getHand() {
        return this.hand;
    }

    assign(player) {
        this.color = player.color;
        this.id = player.id;
        this.name = player.name;
    }

    assignHand(hand) {
        for (const card of hand)
            this.hand.push(card);
    }

    checkCard(id) {
        for (const card of this.hand)
            if (id === card.id) return true;
        return false;
    }

    createCard(card) {
        // this.addCardToHand(new Card(card.suit, card.value, { x: card.pos.x, y: card.pos.y }, card.zIndex, card.front, card.index));
    }

    addCard(card) {
            let elem = createElement('div', 'cardBox');
            elem.id = this.hand.length;
            document.getElementById("hand").appendChild(elem); 
            this.hand.push(card);
    }

    deleteCard(card) {
            let i=0
            for (; i < this.hand.length; ++i)
            {
                if (this.hand[i].id === card.id) break;
            }
            document.getElementsByClassName("cardBox")[i].remove();
            this.hand.splice(i, 1);
    }

    showHand() {
        let z = 1;
        // console.log("showhand", this.hand.length)
        for (let i=0; i < this.hand.length; ++i) {
            
            var myDiv = document.getElementsByClassName("cardBox")[i];

            var rect = myDiv.getBoundingClientRect();
            var centerX = ((rect.left + rect.width/2)/window.innerWidth)*100 - 50
            // console.log("this.hand[i]", this.hand[i].id)

                this.hand[i].changePositionHand({ x: centerX, y: 0 }, z);
                this.hand[i].cardElem.style.transform = 'scale(2)'; 
            ++z;
            // x += 40 * 2;
        }
    }

    getIndex(cardId)
    {
        for (let i=0; i < this.hand.length; ++i)
            if (cardId === this.hand[i].id) return i;
        
        return false;
    }

    check(card, newPosition)
    {
        let index = this.getIndex(card.id);
        var myDiv = document.getElementsByClassName("cardBox")[index];
        var rect = myDiv.getBoundingClientRect();
        var rectHand = document.getElementById("hand").getBoundingClientRect();
        var rectMenu = document.getElementById("menu").getBoundingClientRect();
        var centerX = ((rect.left + rect.width/2)/window.innerWidth)*100
        
        var rectMat = document.getElementById("mat").getBoundingClientRect()


            if ((newPosition.x) < (rect.left/window.innerWidth)*100 && index !== 0)
            {
                this.hand[index - 1].changePositionHand({ x: centerX, y: 50 }, this.hand[index].zIndex);
                // this.hand[index - 1].changePosition({ x:getPercentX(rect.left + rect.width / 2), y: 100+12 }, this.hand[index].zIndex, true, true, 0.25);
                let temp = this.hand[index]
                this.hand[index] = this.hand[index - 1];
                this.hand[index - 1] = temp;
                this.hand[index - 1].setzIndex2(temp.zIndex - 1);
                this.hand[index - 1].index = index - 1;
                this.hand[index].index = index;
            }
            else if ((newPosition.x) > (rect.right/window.innerWidth)*100 && index !== this.hand.length - 1)
            {
                this.hand[index + 1].changePositionHand({ x: centerX, y: 50 }, this.hand[index].zIndex);
                // this.hand[index + 1].changePosition({ x: getPercentX(rect.left + rect.width / 2), y: 100+12 }, this.hand[index].zIndex, true, true, 0.25);
                let temp = this.hand[index]
                this.hand[index] = this.hand[index + 1];
                this.hand[index + 1] = temp;
                this.hand[index + 1].setzIndex2(temp.zIndex + 1);
                this.hand[index + 1].index = index + 1;
                this.hand[index].index = index;
            }
    }

    order()
    {
        this.hand = quickSort(this.hand);
    }

}



