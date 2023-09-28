

import {cardValueEnum, cardSuitEnum, addListener, removeListener} from './util.js';



// Creation of class Card

export class Card {


        imgSrc = 'img/';
        imgExt = '.svg';
        imgBackCard = '1B';
        static maxZ = 2;

        mouseDown = false;


        onMouseDown = this.onMouseDown.bind(this)
        onMousemove = this.onMousemove.bind(this)
        onMouseUp = this.onMouseUp.bind(this)
        
        
        constructor(suit, value, pos, zIndex, front)
        {
            this.cardUp = false;
            this.flippingcardElem
            this.cardInnerElem
            this.cardFrontImg
            this.suit = suit;
            this.value =  value;
            this.id = this.value.name + this.suit;
            this.startTime;
            this.player = undefined;
            (front === undefined) ? this.front = true : this.front = front;
            (zIndex === undefined) ? this.zIndex = 1 : this.zIndex = zIndex;
            if (Card.maxZ < zIndex) Card.maxZ = zIndex;
            this.offset = {x:pos.x, y:pos.y}
            this.mouseDown = false;
            this.mouseHover = false;
            this.isFlipping = false;
            this.isDragging = false;
            this.isDraggable = false;
            this.isOut = false;
            this.isFlippable = false;

            (pos === undefined) ? this.pos = {x: 0, y: 0} : this.pos = {x: pos.x, y: pos.y};
       
            
            // if (!(zIndex === undefined)) this.cardElem.style.zIndex = zIndex;
            // this.cardElem.style.transform = 'translate(' + this.pos.x + 'px,' +  this.pos.y + 'px)'; 
            // if (!this.front) this.cardInnerElem.style.transform = 'rotateY(180deg)';
            // this.cardElem.id = this.id;
            

        }
        
        changeCard(suit, value)
        {
          this.suit = suit;
          this.value =  value;
        }

        onMouseHover(e) {
          if (!this.isDragging)
          {
            console.log("onMouseHover")
            addListener(window, 'mousedown', this.onMouseDown)
          }
        }
        
        
        onMouseOut(e) {
          if (!this.isDragging)
          {
            console.log("onMouseOut") 
            removeListener(window, 'mouseup', this.onMouseUp)
            removeListener(window, 'mousedown', this.onMouseDown)
            this.isOut = false

          }
          else this.isOut = true;
          
        }
        
        getKey()
        {
          return this.value;
        }


        onMouseDown (e)
        {
          
          console.log("mouseDown")

          // getMovingCard(this)
          this.isDragging = true;
          addListener(window, 'mouseup', this.onMouseUp);
          addListener(window, 'mousemove', this.onMousemove);
          e.preventDefault();
          this.startTime = Date.now()
          
          this.offset.x = e.clientX - this.pos.x;
          this.offset.y = e.clientY - this.pos.y;
          if (this.zIndex < Card.maxZ)
          {
            this.cardElem.style.zIndex = ++Card.maxZ    
          }
        }
        
        onMousemove (e)
        {         
            // console.log("mouseMove", e.clientX, this.offset.x)
            this.cardElem.style.transform = 'translate3d(' + Math.round(e.clientX - this.offset.x) + 
            'px, ' + Math.round(e.clientY - this.offset.y) + 'px, 0)'

          }    
          
        onMouseUp (e) {

          this.isDragging = false;
          console.log("mouseUp")
          removeListener(window, 'mousemove', this.onMousemove)
          
          // flip sides
          if (Date.now() - this.startTime < 300  && (this.pos.x == e.clientX - this.offset.x || this.pos.y == e.clientY - this.offset.y))
          {
            (this.front) ? this.cardInnerElem.style.transform = 'rotateY(180deg)' : this.cardInnerElem.style.transform = 'rotateY(0deg)';
            this.front = !this.front;
          }
            // Update position of the card
            this.pos.x = e.clientX - this.offset.x
            this.pos.y = e.clientY - this.offset.y 
            
            // Notify client

            
          if (this.isOut) this.onMouseOut();

        }

        flipCard(front)
        {
          this.front = !  front;
        }

        changePosition(pos)
        {
          this.pos = pos;         
        }
        
        changePositionServer(pos, zIndex, rot)
        {
          if (rot === undefined) rot = {z: 0, y: 0}
          this.cardElem.style.transform = 'translate3d(' + Math.round(pos.x) + 
            'px, ' + Math.round(pos.y) + 'px, 0) rotateZ(' + rot.z + 'deg) rotateY(' + rot.y + 'deg)'
          this.pos = pos;
          this.cardElem.style.zIndex = zIndex;

          
        }

        displayCardInfo() {
            console.log(`Card: ${this.value.rank} of ${this.suit}`);
            // console.log(`X: ${this.pos.x} Y: ${this.pos.y}`);
          }

          getPosition()
          {
            return this.pos;
          }

          assign(card)
          {
            this.suit = card.suit;
            this.value =  card.value;
            this.id = card.id;
            this.front = card.front;
            this.zIndex = card.zIndex;
            this.pos = card.pos;
          }

          setzIndex()
          {
            if (this.zIndex < Card.maxZ)
                this.zIndex = ++Card.maxZ; 
            console.log("this.zIndex", this.zIndex)
            console.log("card.zIndex", Card.maxZ)
          }

          
        getMaxZ()
        {
            return Card.maxZ;
        }
    }


