

import { createElement, addChildElement, addListener, removeListener, getEquation } from './util.js';
import { notifyCardMove, notifyCardFlip, notifyCursorUp, notifyCursorDown } from './client.js';


const eqSize1 = getEquation(90 , 1, 100 , 2);
const eqSize2 = getEquation(10 , 1, 0 , 2);

// Creation of class Card



export class Card {

    // Image source and extension
    static imgSrc = 'img/';
    static imgExt = '.svg';
    static imgBackCard = '1B';
    static mouseDown = false;
    static mouseClicked = false;
    static maxZ = 1;
    static handLine = (document.getElementById("hand").getBoundingClientRect().top / window.innerHeight) * 100;
    static remSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    static matElem = document.getElementById("mat")
    static matRect = Card.matElem.getBoundingClientRect();

    static hand = document.getElementById("hand")
    static handRect = Card.hand.getBoundingClientRect();

    onMouseDown = this.onMouseDown.bind(this)
    onMousemove = this.onMousemove.bind(this)
    onMouseUp = this.onMouseUp.bind(this)


    constructor(suit, value, pos = { x: 0, y: 0 }, zIndex = 1, front = true, index=undefined, rot=0) {

        // Card Properties
        this.suit = suit;
        this.value = value;
        this.pos = { x: pos.x, y: pos.y }
        this.id = this.value.name + this.suit;
        this.front = front;
        this.zIndex = zIndex;
        this.index = index;
        this.rot = rot;


        this.startTime;
        if (Card.maxZ < zIndex) Card.maxZ = zIndex;
        this.isPartOfHand = false;
        this.wasPartOfHand = false;
        this.offset = { x: pos.x, y: pos.y }
        this.isDragging = false;
        this.isOut = false;

        this.createElements();
    }

    // Method to create DOM elements
    createElements() {

        // Creating div elements
        this.cardElem = createElement('div', 'card');
        this.cardElem.id = this.id;
        this.cardElem.style.zIndex = this.zIndex;
        this.cardElem.style.left = this.pos.x + '%';
        this.cardElem.style.top = this.pos.y + '%';

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
        addChildElement(Card.matElem, this.cardElem);

        // Listeners     
        addListener(this.cardElem, 'mouseover', this.onMouseHover.bind(this))
        addListener(this.cardElem, 'mouseout', this.onMouseOut.bind(this))

    }

    changeCard(suit, value) {
        this.suit = suit;
        this.value = value;
        this.cardFrontImg.src = Card.imgSrc + this.value.name + this.suit + Card.imgExt;
    }

    onMouseHover(e) {
        if (!this.isDragging) {
            // else
            //     this.changePosition({x: this.pos.x, y: this.pos.y - 20}, this.zIndex, false, true, 0.1);
            
            addListener(window, 'mousedown', this.onMouseDown)
            if (this.isPartOfHand && !Card.mouseDown)
            {
                // this.changePosition({ x: this.pos.x, y: 650 }, this.zIndex, true, true, 0.15);
            }

        }
    }
    
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      
      async onMouseOut(e) {
          if (!this.isDragging) {
              if (this.isPartOfHand && !Card.mouseDown)
              {
                //   await this.delay(75);
                var rectHand = document.getElementById("hand").getBoundingClientRect();
                // this.changePosition({ x: this.pos.x, y: rectHand.top }, this.zIndex, true, true, 0.15);

              }
            // else
            //     this.changePosition({x: this.pos.x, y: this.pos.y + 20}, this.zIndex, false, true, 0.1);

            removeListener(window, 'mouseup', this.onMouseUp);
            removeListener(window, 'mousedown', this.onMouseDown);
            this.isOut = false;
            Card.mouseClicked = false;

        }
        else this.isOut = true;

    }

    onMouseDown(e) {
        Card.mouseDown = true;
        Card.mouseClicked = true;
        this.isDragging = true;
        const containerRect = document.getElementById("game").getBoundingClientRect();

        addListener(window, 'mouseup', this.onMouseUp);
        addListener(window, 'mousemove', this.onMousemove);
        e.preventDefault();
        this.startTime = Date.now();
        Card.matRect = Card.matElem.getBoundingClientRect();
        Card.handRect = Card.hand.getBoundingClientRect();


        
        

        // this.offset.x = (document.getElementById("mat").offsetWidth * this.pos.x) / 100 + 20;
        // console.log("this.offset.x", this.offset.x)
        // console.log("this.offset.y", this.offset.y)
        if (!this.isPartOfHand)
        this.setzIndex();
    
    // console.log("this.isPartOfHand", this.isPartOfHand)
    // console.log("Card.zMax", Card.maxZ)
    // console.log("card.zIndex", this.zIndex)
    if (!this.wasPartOfHand)
    notifyCursorDown(this, this.id, this.zIndex)

        console.log("eclientX", (e.clientX))
        console.log("((e.clientX/Card.matRect.width)*100)", ((e.clientX/Card.matRect.width)*100))
    if (this.rot === 0)
    {
        this.offset.x = (((e.clientX/Card.matRect.width)*100) - this.pos.x);
        this.offset.y = (((e.clientY/Card.matRect.height)* 100) - this.pos.y);
    }
    else if (this.rot === 90)
    {
        this.offset.x = (((e.clientX/Card.matRect.width)* 100) + this.pos.y);
        this.offset.y = (((e.clientY/Card.matRect.height)*100) - this.pos.x);
    }
    else if (this.rot === 180)
    {
        this.offset.x = (((e.clientX/Card.matRect.width)*100) + this.pos.x);
        this.offset.y = (((e.clientY/Card.matRect.height)* 100) + this.pos.y);
    }
    else if (this.rot === 270)
    {
        this.offset.x = (((e.clientX/Card.matRect.width)* 100) - this.pos.y);
        this.offset.y = (((e.clientY/Card.matRect.height)*100) + this.pos.x);
    }


    console.log("this.offset.x", this.offset.x)
}   

    isOnHand(pos) {

        if (pos < 100)
        {

            this.isPartOfHand = false;
        }
        else  //- (pos.y >= handLine cardSize.y/2.5))
        {
            this.isPartOfHand = true;
        }

    }

    scale(pos)
    {
        if (pos >= 90  && pos <= 100)
            this.cardElem.style.transform = 'scale(' + (yMove*eqSize[0] + eqSize[1]) + ')';
        else if (pos < 90)
            this.cardElem.style.transform = 'scale(1)'
        else if (pos > 100)
            this.cardElem.style.transform = 'scale(2)'
    }
    
    onMousemove(e) {

        
        // console.log("WHAT!!!!!")
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
            // console.log("ROT 0", xMove, yMove)
            this.cardElem.style.left = xMove + '%';
            this.cardElem.style.top = yMove + '%';
            notifyCardMove(this, { x: xMove, y: yMove });

            if (yMove >= 90  && yMove <= 100)
                this.cardElem.style.transform = 'scale(' + (yMove*eqSize1[0] + eqSize1[1]) + ')';
            else if (yMove < 90)
                this.cardElem.style.transform = 'scale(1)'
            else if (yMove > 100)
                this.cardElem.style.transform = 'scale(2)'
        }
        else if (this.rot === 90)
        {
            // console.log("ROT 90", yMove, -xMove)
            this.cardElem.style.left = yMove + '%';
            this.cardElem.style.top = -xMove + '%';
            notifyCardMove(this, { x: yMove, y: -xMove });

            
            if (yMove >= 90  && yMove <= 100)
                this.cardElem.style.transform = 'scale(' + (yMove*eqSize1[0] + eqSize1[1]) + ')';
            else if (yMove < 90)
                this.cardElem.style.transform = 'scale(1)'
            else if (yMove > 100)
            this.cardElem.style.transform = 'scale(2)'
        }
        else if (this.rot === 180)
        {
            // console.log("ROT 90", yMove, -xMove)
            this.cardElem.style.left = -xMove + '%';
            this.cardElem.style.top = -yMove + '%';
            notifyCardMove(this, { x: -xMove, y: -yMove });
            console.log("yMove", yMove)
            if (yMove <= 0  && yMove >= 10)
                this.cardElem.style.transform = 'scale(' + (yMove*eqSize2[0] + eqSize2[1]) + ')';
            else if (yMove < 10)
                this.cardElem.style.transform = 'scale(1)'
            else if (yMove > 0)
            this.cardElem.style.transform = 'scale(2)'
        }
        else if (this.rot === 270)
        {
            this.cardElem.style.left = -yMove + '%';
            this.cardElem.style.top = xMove + '%';
            notifyCardMove(this, { x: -yMove, y: xMove });

            if (yMove >= 0  && yMove <= 10)
                this.cardElem.style.transform = 'scale(' + (yMove*eqSize2[0] + eqSize2[1]) + ')';
            else if (yMove < 10)
                this.cardElem.style.transform = 'scale(1)'
            else if (yMove > 0)
            this.cardElem.style.transform = 'scale(2)'
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
        if (Date.now() - this.startTime < 300 && (this.pos.x === ((e.clientX/Card.matRect.width)*100) - this.offset.x || this.pos.y === ((e.clientY/Card.matRect.height)*100) - this.offset.y)) {
            
            this.flipCard(true);
            
        }
        // if (((e.clientX/Card.matRect.width)*100) - this.offset.x < 0 || ((e.clientX/Card.matRect.width)*100) - this.offset.x  > 100
        // || ((e.clientY/Card.matRect.width)*100) - this.offset.y  < 0 || ((e.clientY/Card.matRect.width)*100) - this.offset.y > 100)
        // {
        //     console.log("OUT")
        //     this.changePosition(this.pos, this.zIndex, false, true)
        // }
        // else
        // {

        // Update position of the card
        if (this.rot === 0)
        {
            this.pos.x = ((e.clientX/Card.matRect.width)*100) - this.offset.x;
            this.pos.y = ((e.clientY/Card.matRect.height)*100) - this.offset.y;
            this.isOnHand(this.pos.y);
        }        
        else if (this.rot === 90)
        {
            this.pos.x = ((e.clientY/Card.matRect.width)*100) - this.offset.y;
            this.pos.y = -(((e.clientX/Card.matRect.height)*100) - this.offset.x);
            this.isOnHand(this.pos.x);
        }
        else if (this.rot === 180)
        {
            this.pos.x = -(((e.clientX/Card.matRect.width)*100) - this.offset.x);
            this.pos.y = -(((e.clientY/Card.matRect.height)*100) - this.offset.y);
            this.isOnHand(-this.pos.y);
        }
        else if (this.rot === 270)
        {
            this.pos.x = -(((e.clientY/Card.matRect.width)*100) - this.offset.y);
            this.pos.y = (((e.clientX/Card.matRect.height)*100) - this.offset.x);
            this.isOnHand(-this.pos.x);
        }
            
            // }
            
        // Notify Server
        notifyCursorUp(this, this.pos)

        if (this.isOut) this.onMouseOut();

    }

    flipCard(notify = false, front, animation=true) {
        
        (front === undefined) ? this.front = !this.front : this.front = front;

        if (animation)
        {
            this.cardInnerElem.style.transition = "transform 0.3s ease"
            if (!this.front) {
                // console.log("BYE");
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
            // console.log("HELLO");
            (this.front) ? this.cardInnerElem.style.transform = 'rotateY(0deg)' : this.cardInnerElem.style.transform = 'rotateY(-180deg)';
        }

        // Notify server if it isnt part of a Hand and its not coming from the server
        if (!this.isPartOfHand && notify)
            notifyCardFlip(this.id)
    }

    changeTransitionTime() {
        setTimeout(() => {
            this.cardInnerElem.style.transition = "all 0s linear"
        }, 75);

    }

    rotate(rot=0)
    {
        this.cardElem.style.rotate = (-rot) + 'deg';
        this.rot = rot;
    }

    changePosition(pos, zIndex, onHand = false, animation = false, sec = 0.5, rot = 0) {

        if (animation) {
            this.isDragging = false;
            this.cardElem.style.transition = "all " + sec + "s ease-in-out";
            setTimeout(() => {
                this.cardElem.style.transition = "all 0s";
            }, sec * 100);
        }
        // pos.x = (document.getElementById("mat").offsetWidth * 50) / 100 + 20;
        // console.log("pos.x", pos.x)
        
        // this.cardElem.style.transform = 'translate3d(' + (pos.x) + '%, ' + (pos.y) + '%, 0) rotateZ(' + rot.z + 'deg) rotateY(' + rot.y + 'deg)'
            this.cardElem.style.left = pos.x + '%';
            this.cardElem.style.top = pos.y + '%';
            this.rotate(rot);

        if (onHand) this.cardElem.style.transform = 'scale(2)';

        this.pos = pos;
        if (zIndex !== undefined) this.setzIndex2(zIndex);
        // if (!this.isOnHand)
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
        this.cardFrontElem.style.border = this.cardBackElem.style.border = "solid 0.5rem" + color;
        this.cardFrontElem.style.margin = this.cardBackElem.style.margin = "-0.5rem";
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

    deleteCard() {
        this.cardElem.remove();
    }

    setMaxZ(maxZ) {
        Card.maxZ = maxZ;
    }

    assign(card) {
        this.suit = card.suit;
        this.value = card.value;
        this.id = card.id;
        this.flipCard(false, card.front);
        this.zIndex = card.zIndex;
        this.cardElem.style.zIndex = card.zIndex;
        this.pos = card.pos;
        this.isPartOfHand = card.isPartOfHand;
        this.wasPartOfHand = card.wasPartOfHand;
        this.cardElem.style.transform = 'translate3d(' + Math.round(card.pos.x) + 'em, ' + Math.round(card.pos.y) + 'em, 0)'
    }

}


