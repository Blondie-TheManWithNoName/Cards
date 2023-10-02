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

      assignHand(newHand)
      {
        this.hand = []
        for (const card of newHand)
          this.hand.push(card);
      }

}
