import { addListener, createElement, addChildElement } from './util.js';
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
        this.addCardToHand(new Card(card.suit, card.value, { x: card.pos.x, y: card.pos.y }, card.zIndex, card.front));
    }

    addCardToHand(card) {
        if (!this.checkCard(card.id))
    {
        let elem = createElement('div', 'cardBox');
        elem.id = this.hand.length;
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

    showHand(center) {
        let z = 1;
        for (let i=0; i < this.hand.length; ++i) {
            // let x = center - (this.hand.length / 2) * 52 * 2;
        let x = center - 40;

        var myDiv = document.getElementsByClassName("cardBox")[i];

        // Step 2: Get the coordinates of the center
        var rect = myDiv.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2 - 40;
        // var centerY = rect.top + rect.height / 2;

        this.hand[i].changePosition({ x: centerX, y: 690 }, z, true, true, 0.25, {z: 0, y: 0});
            // card.setFront(true);
            ++z;
            x += 40 * 2;
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
        console.log("index", index);
        for (const card of this.hand)
            console.log(card.id)
        var myDiv = document.getElementsByClassName("cardBox")[index];
        var rect = myDiv.getBoundingClientRect();
        // console.log("newPosition", newPosition.x);
        // console.log("rect.left", rect.left);

        if (newPosition.x + 40 < rect.left && index !== 0)
        {
            this.hand[index - 1].changePosition({ x: rect.left + rect.width / 2 - 40, y: 690 }, this.hand[index].zIndex, true, true, 0.25);
            let temp = this.hand[index]
            this.hand[index] = this.hand[index - 1];
            this.hand[index - 1] = temp;
            this.hand[index - 1].setzIndex2(temp.zIndex - 1);
        }
        else if (newPosition.x + 40 > rect.right && index !== this.hand.length - 1)
        {
            this.hand[index + 1].changePosition({ x: rect.left + rect.width / 2 - 40, y: 690 }, this.hand[index].zIndex, true, true, 0.25);
            let temp = this.hand[index]
            this.hand[index] = this.hand[index + 1];
            this.hand[index + 1] = temp;
            this.hand[index + 1].setzIndex2(temp.zIndex + 1);
        }
    }
}



