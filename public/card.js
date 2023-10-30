

import { createElement, addChildElement, addListener, removeListener, getEquation } from './util.js';
import { notifyCardMove, notifyCardFlip, notifyCursorUp, notifyCursorDown } from './client.js'; 


const eqSize1 = getEquation(100 , 1, 110 , 2);
const eqSize2 = getEquation(0 , 1, -10 , 2);
const WIDTH = (((0.063 * window.innerHeight)/document.getElementById("mat").getBoundingClientRect().width)*100)/2; //px
const HEIGHT = (((0.088 * window.innerHeight)/document.getElementById("mat").getBoundingClientRect().height)*100)/2; //px



// Creation of class Card


const hand = document.getElementById("hand")

export class Card {

    // Image source and extension
    static imgSrc = 'img/';
    static imgExt = '.svg';
    static imgBackCard = '1B';
    static mouseDown = false;
    static maxZ = 1;
    static matRect = document.getElementById("mat").getBoundingClientRect();


    onMouseDown = this.onMouseDown.bind(this)
    onMousemove = this.onMousemove.bind(this)
    onMouseUp = this.onMouseUp.bind(this)


    constructor(suit, value, pos = { x: 0, y: 0 }, zIndex = 1, front = true, index=undefined, rot=0, owner = 0) {

        // Card Properties
        this.xSend = pos.x;
        this.ySend = pos.y;

        this.suit = suit;
        this.value = value;
        this.pos = { x: pos.x, y: pos.y}
        this.id = this.value.name + this.suit;
        this.front = front;
        this.zIndex = zIndex;
        this.index = index;
        this.rot = rot;
        this.disabled = false;
        this.owner = owner;


        this.startTime;
        if (Card.maxZ < zIndex) Card.maxZ = zIndex;
        this.isPartOfHand = false;
        this.wasPartOfHand = false;
        this.offset = { x: pos.x, y: pos.y }
        this.isDragging = false;

        this.createElements();
    }

    // Method to create DOM elements
    createElements() {

        // Creating div elements
        this.cardElem = createElement('div', 'card');
        this.cardElem.id = this.id;
        this.cardElem.style.zIndex = this.zIndex;
        this.cardElem.style.left = (this.pos.x - WIDTH) + '%';
        this.cardElem.style.top = (this.pos.y - HEIGHT) + '%';
        this.cardInnerElem = createElement('div', 'card-inner');
        if (!this.front) this.cardInnerElem.style.transform = 'rotateY(-180deg)';

        this.cardFrontElem = createElement('div', 'card-front');
        this.cardBackElem = createElement('div', 'card-back');

        // Creating img elements
        this.cardFrontImg = createElement('img', 'card-img', Card.imgSrc + this.value.name + this.suit + Card.imgExt);
        const cardBackImg = createElement('img', 'card-img', Card.imgSrc + Card.imgBackCard + Card.imgExt);

        // Creating structure of card
        addChildElement(this.cardFrontElem, this.cardFrontImg);
        addChildElement(this.cardBackElem, cardBackImg);
        addChildElement(this.cardInnerElem, this.cardFrontElem);
        addChildElement(this.cardInnerElem, this.cardBackElem);
        addChildElement(this.cardElem, this.cardInnerElem);
        addChildElement(document.getElementById("mat"), this.cardElem);

        // Listeners     
        addListener(this.cardElem, 'mouseover', this.onMouseHover.bind(this))
        addListener(this.cardElem, 'mouseout', this.onMouseOut.bind(this))

    }

    onMouseHover(e) {
        if (!this.isDragging && !this.disabled) {
            addListener(window, 'mousedown', this.onMouseDown)
            // if (this.isPartOfHand && !Card.mouseDown)
                // this.changePosition({ x: this.pos.x, y: 100 }, this.zIndex, true, true, 0.15);
        }
    }
    
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      
      async onMouseOut(e) {
        // console.log("onMouseOut")
        //   if (!this.isDragging) {
            //   if (this.isPartOfHand && !Card.mouseDown)
                // this.changePosition({ x: this.pos.x, y: 100 + 6.5 }, this.zIndex, true, true, 0.15);

            // removeListener(window, 'mouseup', this.onMouseUp);
            removeListener(window, 'mousedown', this.onMouseDown);
        // }

    }

    onMouseDown(e) {
        Card.mouseDown = true;
        this.isDragging = true;
        const containerRect = document.getElementById("game").getBoundingClientRect();

        addListener(window, 'mouseup', this.onMouseUp);
        addListener(window, 'mousemove', this.onMousemove);
        
        e.preventDefault();
        this.startTime = Date.now();
        Card.matRect = document.getElementById("mat").getBoundingClientRect();
        Card.handRect = hand.getBoundingClientRect();

        if (!this.isPartOfHand)
            this.setzIndex();
    
        if (!this.wasPartOfHand)
            notifyCursorDown(this, this.id, this.zIndex)

     

        if (this.rot === 0)
        {
            this.offset.x = (((e.clientX/Card.matRect.width)*100) - this.pos.x);
            this.offset.y = (((e.clientY/Card.matRect.height)*100) - this.pos.y);
        }
        else if (this.rot === 90)
        {
            this.offset.x = (((e.clientX/Card.matRect.width)*100) + this.pos.y);
            this.offset.y = (((e.clientY/Card.matRect.height)*100) - this.pos.x);
        }
        else if (this.rot === 180)
        {
            this.offset.x = (((e.clientX/Card.matRect.width)*100) + this.pos.x);
            this.offset.y = (((e.clientY/Card.matRect.height)* 100) + this.pos.y);
        }
        else if (this.rot === 270)
        {
            this.offset.x = (((e.clientX/Card.matRect.height)*100) - this.pos.y);
            this.offset.y = (((e.clientY/Card.matRect.width)*100) + this.pos.x);
        }
}   

    isOnHand(pos) {

            if (pos < 100) this.isPartOfHand = false;
            else this.isPartOfHand = true;
        // console.log("isPartOfHand", this.isPartOfHand)


    }

    scale(pos)
    {
        if ((pos >= 100  && pos <= 110))
            this.cardElem.style.transform = 'scale(' + (pos*eqSize1[0] + eqSize1[1]) + ')';
        else if (pos < 100)
            this.cardElem.style.transform = 'scale(1)'
        else if (pos > 110)
            this.cardElem.style.transform = 'scale(2)'
    }
    
    scale2(pos)
    {
        console.log("pos", pos)

        if (pos <= 0  && pos >= -10)
            this.cardElem.style.transform = 'scale(' + (pos*eqSize2[0] + eqSize2[1]) + ')';
        else if (pos >= 0)
            this.cardElem.style.transform = 'scale(1)'
        else if (pos <= -10)
            this.cardElem.style.transform = 'scale(2)'
    }

    move(xMove, yMove)
    {
        if ((xMove <= 100 && xMove >= 0) || (xMove > 100 && this.rot == 90) || (xMove < 0 && this.rot == 270))
        {
            this.xSend = xMove;
            this.cardElem.style.left = (xMove - WIDTH) + '%';
        }
        if ((yMove <= 100 && yMove >= 0) || (yMove > 100 && this.rot == 0) || (yMove < 0 && this.rot == 180))
        {
            this.ySend = yMove;
            this.cardElem.style.top = (yMove - HEIGHT) + '%';
        }
        notifyCardMove(this, { x: this.xSend, y: this.ySend });
    }
    
    onMousemove(e) {
        
        let xPercent = 0;
        let yPercent = 0;
        let xMove = 0;
        let yMove = 0;
        xPercent = (e.clientX/Card.matRect.width)*100;
        yPercent = (e.clientY/Card.matRect.height)*100;
        xMove = xPercent - this.offset.x;
        yMove = yPercent - this.offset.y;

        if (this.rot === 0)
        {
            this.move(xMove, yMove);
            this.scale(this.ySend);
        }

        else if (this.rot === 90)
        {
            this.move(yMove, -xMove);
            this.scale(this.xSend);
            
        }
        else if (this.rot === 180)
        {
            this.move(-xMove, -yMove);
            this.scale2(this.ySend);
        }
        else if (this.rot === 270)
        {
            this.move(-yMove, xMove);
            this.scale2(this.xSend);

        }

  


            // if (!this.isPartOfHand)
        
        
        // Notify Server
        
        // Check if its on Hand
        
    }
    
    onMouseUp(e) {
        Card.mouseDown = false;
        this.isDragging = false;
        removeListener(window, 'mousemove', this.onMousemove)

        // flip sides
        if (Date.now() - this.startTime < 300 && (this.pos.x === this.xSend && this.pos.y === this.ySend)) {  
            this.flipCard(true);
        }

        // Update position of the card
            this.pos.x = this.xSend;
            this.pos.y = this.ySend;
            if (this.rot === 0) this.isOnHand(this.pos.y);
            else if (this.rot === 90) this.isOnHand(this.pos.x);
            else if (this.rot === 180) this.isOnHand(this.pos.y);
            else if (this.rot === 270) this.isOnHand(this.pos.y);

        removeListener(window, 'mouseup', this.onMouseUp);
            
        // Notify Server
        notifyCursorUp(this, this.pos)


    }

    flipCard(notify = false, front, animation = true) {
        
        (front === undefined) ? this.front = !this.front : this.front = front;

        if (animation)
        {
            this.cardInnerElem.style.transition = "transform 0.3s ease"
            if (!this.front) {
                this.cardInnerElem.style.transform = 'rotateY(-60deg) translateX(100%) rotateZ(-10deg)'
                setTimeout(() => {
                    this.cardInnerElem.style.transform = 'rotateY(-180deg) translateX(0) rotateZ(0)'
                    this.changeTransitionTime();
                    
                }, 75);
            }
            else {
                this.cardInnerElem.style.transform = 'rotateY(-60deg) translateX(100%) rotateZ(10deg)'
                setTimeout(() => {
                    this.cardInnerElem.style.transform = 'rotateY(0) translateX(0) rotateZ(0)'
                    this.changeTransitionTime();
                }, 75);
                
            }
        }
        else
        {
            (this.front) ? this.cardInnerElem.style.transform = 'rotateY(0deg)' : this.cardInnerElem.style.transform = 'rotateY(-180deg)';
        }

        // Notify server if it isnt part of a Hand and its not coming from the server
        if (!this.isPartOfHand && notify)
            notifyCardFlip(this.id)
    }

    changeTransitionTime() {
        setTimeout(() => {
            this.cardInnerElem.style.transition = "transform 0s linear, rotate 250ms"
        }, 75);

    }

    rotate(rot=0)
    {
        this.cardElem.style.rotate = (-rot) + 'deg';
        this.cardElem.style.transformOrigin = "50% 50%";
        this.rot = rot;
    }

    changePosition(pos, zIndex, animation = false, sec = 0.5, rot = this.rot) {
        if (animation) {
            this.isDragging = false;
            this.cardElem.style.transition = "left " + sec + "s ease-in-out, top " + sec + "s ease-in-out";
            setTimeout(() => {
                this.cardElem.style.transition = "left 0s, top 0s, rotate 250ms";
            }, sec * 100);
        }
        // this.scale(pos.y)


            this.cardElem.style.left = (pos.x - WIDTH) + '%';
            this.cardElem.style.top = (pos.y - HEIGHT) + '%';

            // this.rotate(rot);

        // if (onHand) this.cardElem.style.transform = 'scale(2)';

        this.pos = {x: (pos.x), y: (pos.y)};
        if (zIndex !== undefined) this.setzIndex2(zIndex);

        // this.setzIndex();
    }

    setzIndex() {

        if (this.zIndex < Card.maxZ && !this.isPartOfHand)
            this.zIndex = ++Card.maxZ;
        this.cardElem.style.zIndex = this.zIndex;

    }

    setzIndex2(zIndex) {
        this.zIndex = zIndex;
        this.cardElem.style.zIndex = zIndex;
    }

    getPosition() {
        return this.pos;
    }

    setBorder(color) {
        this.cardFrontElem.style.border = this.cardBackElem.style.border = "solid 0.25rem" + color;
        this.cardFrontElem.style.margin = this.cardBackElem.style.margin = "-0.25rem";
    }

    resetBorder() {
        this.cardFrontElem.style.border = this.cardBackElem.style.border = "0";
        this.cardFrontElem.style.margin = this.cardBackElem.style.margin = "0";
    }

    setDraggingFalse() {
        this.isDragging = false;
    }

    setDraggingTrue() {
        this.isDragging = true;

    }

    getId() {
        return this.id;
    }

    setMaxZ(maxZ) {
        Card.maxZ = maxZ;
    }
}


