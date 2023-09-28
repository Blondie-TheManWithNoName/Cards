import { addListener, removeListener} from './util.js';
import {Card} from './card.js';

export class Player {


    constructor()
    {
        this.Pos = {x:0, y:0};
        this.score = 0;
        this.hand = []
        this.color;
        this.id;

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

      generateUniqueId() {
        // Implement your unique ID generation logic here
        // For simplicity, we're using a simple counter here
        return Math.random().toString(36).substr(2, 9);
      }
}
