import { addListener, createElement, addChildElement, quickSort, getPercentX, getPercentY } from './util.js';
import { Card } from './card.js';

export class Player {


    constructor() {
        this.Pos = { x: 0, y: 0 };
        this.score = 0;
        this.hand = []
        this.color;
        this.id = undefined;

        // (turn === undefined) ? this.turn = true : this.turn = turn;
        this.movingCard = undefined;

        addListener(document.body, 'mouseenter', this.onMouseEnter.bind(this))
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
        this.addCardToHand(new Card(card.suit, card.value, { x: card.pos.x, y: card.pos.y }, card.zIndex, card.front, card.index));
    }

    addCardToHand(card) {
        if (!this.checkCard(card.id))
        {
            let elem = createElement('div', 'cardBox');
            elem.id = this.hand.length;
        // elem.appendChild(card.cardElem);

        // document.getElementById("hand").appendChild(document.getElementById(card.id)); 

        // card.cardElem.style.top = (card.pos.y - 100)  + '%';

        // let x = (document.getElementById("hand").getBoundingClientRect().width - document.getElementById("mat").getBoundingClientRect().width)/2;
        // console.log("card.pos.x/100", (card.pos.x/100)*document.getElementById("mat").getBoundingClientRect().width)
        // card.cardElem.style.left = (x + (card.pos.x/100)*document.getElementById("mat").getBoundingClientRect().width)  + '%';
        // card.cardElem.style.left =  ((card.pos.x-50)/100)*document.getElementById("mat").getBoundingClientRect().width + '%';
        // card.cardElem.style.top =  (card.pos.y - 100) + '%';

            addChildElement(document.getElementById("hand"), elem);
            this.hand.push(card);

        
        }       
        card.isPartOfHand = true;
        card.wasPartOfHand = true;
    }

    deleteCardFromHand(card) {
        document.getElementsByClassName("cardBox")[this.hand.length - 1].remove();
        for (let i = 0; i < this.hand.length; ++i)
            if (this.hand[i].id === card.id) this.hand.splice(i, 1);
        
        card.isPartOfHand = false;
    }

    showHand() {
        let z = 1;
        for (let i=0; i < this.hand.length; ++i) {
            // let x = center - (this.hand.length / 2) * 52 * 2;
            // let x = center - 40;

            var myDiv = document.getElementsByClassName("cardBox")[i];

            // Step 2: Get the coordinates of the center
            var rect = myDiv.getBoundingClientRect();
            var rectHand = document.getElementById("hand").getBoundingClientRect();

            var centerX = ((rect.left + rect.right) / 2)
            var centerY = (rect.height / 2)
            // var centerY = rect.top + rect.height / 2;
            // console.log("ID", this.hand[i].id)
            // console.log("centerX", getPercentY(centerY))
            // console.log("percent", getPercentX(centerX)-5.5)

            if (this.hand[i].rot === 0)
                this.hand[i].changePosition({ x: getPercentX(centerX), y: 100 + 12 }, z, true, true, 0.25, this.hand[i].rot);
            // else if (this.hand[i].rot === 90)
            //     this.hand[i].changePosition({ x: 100+12, y: getPercentX(centerX)-5.5}, z, true, true, 0.25, this.hand[i].rot);
            // card.setFront(true);
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
        
        var rectMat = document.getElementById("mat").getBoundingClientRect()

        // if (card.rot === 0)
        // {
            if (newPosition.x + 5 < getPercentX(rect.left) && index !== 0)
            {
                this.hand[index - 1].changePosition({ x:getPercentX(rect.left + rect.width / 2), y: 100+12 }, this.hand[index].zIndex, true, true, 0.25);
                let temp = this.hand[index]
                this.hand[index] = this.hand[index - 1];
                this.hand[index - 1] = temp;
                this.hand[index - 1].setzIndex2(temp.zIndex - 1);
            }
            else if (newPosition.x + 5 > getPercentX(rect.right) && index !== this.hand.length - 1)
            {
                this.hand[index + 1].changePosition({ x: getPercentX(rect.left + rect.width / 2), y: 100+12 }, this.hand[index].zIndex, true, true, 0.25);
                let temp = this.hand[index]
                this.hand[index] = this.hand[index + 1];
                this.hand[index + 1] = temp;
                this.hand[index + 1].setzIndex2(temp.zIndex + 1);
            }
        // }
        // else if (card.rot === 90)
        // {
        //     if (newPosition.x + 5 < getPercentX(rect.left) && index !== 0)
        //     {
        //         this.hand[index - 1].changePosition({ x:100+6.5, y: getPercentX(rect.left + rect.width / 2) - 5.5 }, this.hand[index].zIndex, true, true, 0.25);
        //         let temp = this.hand[index]
        //         this.hand[index] = this.hand[index - 1];
        //         this.hand[index - 1] = temp;
        //         this.hand[index - 1].setzIndex2(temp.zIndex - 1);
        //     }
        //     else if (newPosition.x + 5 > getPercentX(rect.right) && index !== this.hand.length - 1)
        //     {
        //         this.hand[index + 1].changePosition({ x: 100+6.5 , y: getPercentX(rect.left + rect.width / 2) - 5.5 }, this.hand[index].zIndex, true, true, 0.25);
        //         let temp = this.hand[index]
        //         this.hand[index] = this.hand[index + 1];
        //         this.hand[index + 1] = temp;
        //         this.hand[index + 1].setzIndex2(temp.zIndex + 1);
        //     }
        // }
    }

    order()
    {
        this.hand = quickSort(this.hand);
    }

}



