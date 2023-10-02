import { addListener, removeListener} from './util.js';
import {Card} from './card.js';

export class Player {


    constructor()
    {
        this.Pos = {x:0, y:0};
        this.score = 0;
        this.hand = []
        this.color;
        this.id = undefined;

        // (turn === undefined) ? this.turn = true : this.turn = turn;
        this.movingCard = undefined;
        //Hand  
        
        addListener(document.body, 'mouseenter', this.onMouseEnter.bind(this))

    }

    getMovingCard(card)
    {
        this.movingCard = card;
    }


    onMouseEnter(e) {
        if (e.target === document.body && this.movingCard)
        {
          console.log("onMouseEnter")
          this.movingCard.isOut = false;
        }
      }

      getCards(card)
      {
        this.hand.push(card);
      }

      myCards()
      {
        for (const card of this.hand)
            card.displayCardInfo();
      }

      getHand()
      {
        return this.hand;
      }

      assign(player)
      {
        this.color = player.color;
        this.id = player.id;
        this.name = player.name;
      }

      checkCard(id)
      {
        for (const card of this.hand)
          if (id === card.id) return true;
        return false;
      }

      addCardToHand(card)
      {
        if (!this.checkCard(card.id))
          this.hand.push(card);
      }

      deleteCardFromHand(card)
      {
        for (let i=0; i < this.hand.length; ++i)
          if (this.hand[i].id === card.id) this.hand.splice(i, 1);
      }

      showHand(center)
      {

        let x = center - (this.hand.length/2)*52*2;
        let y = 600;
        let z = 1;
        for (const card of this.hand)
        {
          card.changePositionHand({x: x, y: y}, z, 0.25);
          card.setFront(true);
          ++z;
          x += 40*2;
        }
      }
}
