

import {cardValueEnum, cardSuitEnum, createElement, addChildElement, addListener, removeListener} from './util.js';
import {notifyCardMove, notifyCardFlip, notifyCursorUp, notifyCursorDown}  from './client.js'; 


// Creation of class Card

export class Card {


        imgSrc = 'img/';
        imgExt = '.svg';
        imgBackCard = '1B';
        static maxZ = 1;

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
            
            this.createElements();
            
            if (!(zIndex === undefined)) this.cardElem.style.zIndex = zIndex;
            this.cardElem.style.transform = 'translate(' + this.pos.x + 'px,' +  this.pos.y + 'px)'; 
            if (!this.front) this.cardInnerElem.style.transform = 'rotateY(180deg)';
            this.cardElem.id = this.id;
            

        }

        createElements()
        {
          // Creating div elements
          this.cardElem = createElement('div', 'card');
          this.cardInnerElem = createElement('div', 'card-inner');
          this.cardFrontElem = createElement('div', 'card-front');
          this.cardBackElem = createElement('div', 'card-back');

          this.cardFrontImg = createElement('img', 'card-img', this.imgSrc + this.value.name + this.suit + this.imgExt);
          const cardBackImg = createElement('img', 'card-img', this.imgSrc + this.imgBackCard + this.imgExt);


          // Creating structure of card
          addChildElement(this.cardFrontElem, this.cardFrontImg);
          addChildElement(this.cardBackElem, cardBackImg);
          addChildElement(this.cardInnerElem, this.cardFrontElem);
          addChildElement(this.cardInnerElem, this.cardBackElem);
          addChildElement(this.cardElem, this.cardInnerElem);
          addChildElement(document.body, this.cardElem);


          // Listeners     
          addListener(this.cardElem, 'mouseover', this.onMouseHover.bind(this))
          addListener(this.cardElem, 'mouseout', this.onMouseOut.bind(this))
          
        }
        
        changeCard(suit, value)
        {
          this.suit = suit;
          this.value =  value;
          // console.log(this.imgSrc + this.value.name + this.suit + this.imgExt)
          this.cardFrontImg.src =  this.imgSrc + this.value.name + this.suit + this.imgExt;
        }

        onMouseHover(e) {
          if (!this.isDragging)
          {
            // console.log("onMouseHover")
            addListener(window, 'mousedown', this.onMouseDown)
          }
        }
        
        
        onMouseOut(e) {
          if (!this.isDragging)
          {
            // console.log("onMouseOut") 
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
          
          // console.log("mouseDown")

          // getMovingCard(this)
          this.isDragging = true;
          addListener(window, 'mouseup', this.onMouseUp);
          addListener(window, 'mousemove', this.onMousemove);
          e.preventDefault();
          this.startTime = Date.now()


          this.offset.x = e.clientX - this.pos.x;
          this.offset.y = e.clientY - this.pos.y;
          if (this.zIndex <= Card.maxZ)
          {
            // this.cardUp = true;
            this.cardElem.style.zIndex = ++Card.maxZ    
          }
          notifyCursorDown(this.id)
        }
        
        onMousemove (e)
        {         
            // console.log("mouseMove", e.clientX, this.offset.x)
            this.cardElem.style.transform = 'translate3d(' + Math.round(e.clientX - this.offset.x) + 
            'px, ' + Math.round(e.clientY - this.offset.y) + 'px, 0)'
            notifyCardMove(this.id, {x:e.clientX - this.offset.x, y:e.clientY - this.offset.y});
          
          }    
          
        onMouseUp (e) {

          this.isDragging = false;
          // console.log("mouseUp")
          // this.cardFrontElem.style.border =  this.cardBackElem.style.border =   "0";
          // this.cardFrontElem.style.margin = this.cardBackElem.style.margin =    "0";

          removeListener(window, 'mousemove', this.onMousemove)
          
          // flip sides
          if (Date.now() - this.startTime < 300  && (this.pos.x == e.clientX - this.offset.x || this.pos.y == e.clientY - this.offset.y))
          {
            this.flipCard(this.front);
          }
            // Update position of the card
            this.pos.x = e.clientX - this.offset.x
            this.pos.y = e.clientY - this.offset.y 
            
            // Notify client
            notifyCursorUp(this.id)
            
          if (this.isOut) this.onMouseOut();

        }

        flipCard(front)
        {
          (this.front) ? this.cardInnerElem.style.transform = 'rotateY(180deg)' : this.cardInnerElem.style.transform = 'rotateY(0deg)';
          notifyCardFlip(this.id, this.front)
          this.front = !front;
        }

        flipCardServer(front)
        {
          (this.front) ? this.cardInnerElem.style.transform = 'rotateY(180deg)' : this.cardInnerElem.style.transform = 'rotateY(0deg)';
          this.front = !front;
        }

        changePosition(pos, zIndex, rot)
        {
          if (rot === undefined) rot = {z: 0, y: 0}
          this.cardElem.style.transition = "all 0.5s ease-in-out";
          this.cardElem.style.transform = 'translate3d(' + Math.round(pos.x) + 
            'px, ' + Math.round(pos.y) + 'px, 0) rotateZ(' + rot.z + 'deg) rotateY(' + rot.y + 'deg)'
          this.pos = pos;
          this.cardElem.style.zIndex = zIndex;
          if (this.zIndex <= Card.maxZ) this.cardElem.style.zIndex = ++Card.maxZ    
          setTimeout(() => {
            this.cardElem.style.transition = "all 0s";
          }, 500);
          
        }
        
        changePositionServer(pos, zIndex, rot)
        {
          if (rot === undefined) rot = {z: 0, y: 0}
          this.cardElem.style.transform = 'translate3d(' + Math.round(pos.x) + 
            'px, ' + Math.round(pos.y) + 'px, 0) rotateZ(' + rot.z + 'deg) rotateY(' + rot.y + 'deg)'
          this.pos = pos;
          this.cardElem.style.zIndex = zIndex;
          if (this.zIndex <= Card.maxZ) this.cardElem.style.zIndex = ++Card.maxZ    

          
        }

        displayCardInfo() {
            console.log(`Card: ${this.value.rank} of ${this.suit}`);
            // console.log(`X: ${this.pos.x} Y: ${this.pos.y}`);
          }

          getPosition()
          {
            return this.pos;
          }

          
          setBorder(color)
          {
            this.cardFrontElem.style.border = this.cardBackElem.style.border = "solid 6px" + color;
            this.cardFrontElem.style.margin = this.cardBackElem.style.margin = "-6px";
          }

          resetBorder()
          {
            this.cardFrontElem.style.border = this.cardBackElem.style.border = "0";
            this.cardFrontElem.style.margin = this.cardBackElem.style.margin = "0";
          }

          toggleDragging()
          {
            this.isDragging = !this.isDragging
          }

    }


