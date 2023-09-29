export class Player {


    constructor(id, color, name)
    {
        this.Pos = {x:0, y:0};
        this.score = 0;
        this.hand = []
        this.color = color;
        this.name = name;
        this.id = id;
        // (turn === undefined) ? this.turn = true : this.turn = turn;
        this.movingCard = undefined;
        //Hand  
      
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

}
