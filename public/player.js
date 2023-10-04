import { addListener, removeListener } from './util.js';
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
            this.hand.push(card);
        card.isPartOfHand = true;
        card.wasPartOfHand = true;
    }

    deleteCardFromHand(card) {
        for (let i = 0; i < this.hand.length; ++i)
            if (this.hand[i].id === card.id) this.hand.splice(i, 1);

        card.isPartOfHand = false;
    }

    showHand(center) {
        let x = center - (this.hand.length / 2) * 52 * 2;
        let y = 600;
        let z = 1;
        for (const card of this.hand) {
            console.log(card);
            card.changePosition({ x: x, y: y }, z, true, true, 0.25);
            // card.setFront(true);
            ++z;
            x += 40 * 2;
        }
    }
}
