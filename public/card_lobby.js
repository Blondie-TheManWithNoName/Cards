

import { createElement, addChildElement, addListener, removeListener } from './util.js';



// Creation of class Card

export class Card {

    // Image source and extension
    static imgSrc = 'img/';
    static imgExt = '.svg';
    static imgBackCard = '1B';
    static mouseDown = false;
    static mouseClicked = false;
    static maxZ = 1;
    static handLine = window.innerHeight - (window.innerHeight * 0.3);

    onMouseDown = this.onMouseDown.bind(this)
    onMousemove = this.onMousemove.bind(this)
    onMouseUp = this.onMouseUp.bind(this)


    constructor(suit, value, pos = { x: 0, y: 0 }, zIndex = 1, front = true, rot=0, code=false) {

        // Card Properties
        this.suit = suit;
        this.value = value;
        this.pos = { x: pos.x, y: pos.y }
        this.posOG = { x: pos.x, y: pos.y }
        this.id = this.value.name + this.suit;
        this.front = front;
        this.zIndex = zIndex;
        this.index = undefined;
        this.rot = rot;
        this.code = code;

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
        this.cardElem.style.transform = 'translate(' + this.pos.x + 'px,' + this.pos.y + 'px) rotateZ(' + this.rot + 'deg)';
        if (!this.code)  this.cardElem.style.transform += 'scale(1.5)'

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
        if (!this.code)
        {
            addListener(this.cardElem, 'mouseover', this.onMouseHover.bind(this))
            addListener(this.cardElem, 'mouseout', this.onMouseOut.bind(this))

        }

    }

    changeCard(suit, value) {
        this.suit = suit;
        this.value = value;
        this.cardFrontImg.src = Card.imgSrc + this.value.name + this.suit + Card.imgExt;
    }

    onMouseHover(e) {
        if (!this.isDragging && !Card.mouseClicked) {

            addListener(window, 'mousedown', this.onMouseDown)
            this.changePosition({x: this.pos.x + 35 * Math.sin(this.degreesToRadians(this.rot)), y: this.pos.y - 35 * Math.cos(this.degreesToRadians(this.rot))}, this.zIndex, false, true, 0.250, this.rot)

        }
    }

    degreesToRadians(degrees) {
        return (degrees * Math.PI) / 180;
      }
      async  delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
    async onMouseOut(e) {
        if (!this.isDragging) {
            // else
            //     this.changePosition({x: this.pos.x, y: this.pos.y + 20}, this.zIndex, false, true, 0.1);
            
            removeListener(window, 'mouseup', this.onMouseUp);
            removeListener(window, 'mousedown', this.onMouseDown);
            this.isOut = false;
            Card.mouseClicked = false;
            await this.delay(75);
            // if (Card.mouseClicked) 
            this.changePosition(this.posOG, this.zIndex, false, true, 0.5, this.rot)
            // else this.changePosition({x: this.pos.x - 35 * Math.sin(this.degreesToRadians(this.rot)), y: this.pos.y + 35 * Math.cos(this.degreesToRadians(this.rot))}, this.zIndex, false, true, 0.25, this.rot)

        }
        else this.isOut = true;

    }

    onMouseDown(e) {
        Card.mouseDown = true;
        Card.mouseClicked = true;
        this.isDragging = true;
        addListener(window, 'mouseup', this.onMouseUp);
        addListener(window, 'mousemove', this.onMousemove);
        e.preventDefault();
        this.startTime = Date.now();
        this.offset.x = e.clientX - this.pos.x;
        this.offset.y = e.clientY - this.pos.y;

    
}

    isOnHand(pos) {
        
        if (pos < Card.handLine)
        this.isPartOfHand = false;
    else  //- (pos.y >= handLine cardSize.y/2.5))
            this.isPartOfHand = true;

        }
        
        onMousemove(e) {
            
       this.cardElem.style.transform = 'translate3d(' + Math.round(e.clientX - this.offset.x) + 'px, ' + Math.round(e.clientY - this.offset.y) + 'px, 0) scale(1.5) rotateZ(' + this.rot + 'deg)';


        // Notify Server


    }

    onMouseUp(e) {
        Card.mouseDown = false;
        this.isDragging = false;
        removeListener(window, 'mousemove', this.onMousemove)

        // flip sides
        if (Date.now() - this.startTime < 300 && (this.pos.x == e.clientX - this.offset.x || this.pos.y == e.clientY - this.offset.y)) {

            this.flipCard(true);

        }
        // this.changePosition(this.pos, this.zIndex, false, true, 0.5, this.rot)
        // // Update position of the card
        // this.pos.x = e.clientX - this.offset.x
        // this.pos.y = e.clientY - this.offset.y

        // Notify Server

        if (this.isOut) this.onMouseOut();

    }

    flipCard(notify = false, front, animation=true) {
        
        (front === undefined) ? this.front = !this.front : this.front = front;

        if (animation)
        {
            this.cardInnerElem.style.transition = "transform 0.3s ease"
            if (!this.front) {
                // console.log("BYE");
                this.cardInnerElem.style.transform = 'rotateY(-60deg) translate3d(' + (100) + 'px, 0, 0) rotateZ(-10deg)'
                setTimeout(() => {
                    this.cardInnerElem.style.transform = 'rotateY(-180deg) translate3d(' + (0) + 'px, 0, 0) rotateZ(0)'
                    this.changeTransitionTime();
                    
                }, 75);
            }
            else {
                this.cardInnerElem.style.transform = 'rotateY(-60deg) translate3d(' + (100) + 'px, 0, 0)  rotateZ(10deg)'
                setTimeout(() => {
                    this.cardInnerElem.style.transform = 'rotateY(0) translate3d(' + (0) + 'px, 0, 0)  rotateZ(0)'
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

    }

    changeTransitionTime() {
        setTimeout(() => {
            this.cardInnerElem.style.transition = "transform 0s linear"
        }, 75);

    }

    changePosition(pos, zIndex, onHand = false, animation = false, sec = 0.5, rot = 0, change=false) {

        if (animation) {
            this.isDragging = false;
            this.cardElem.style.transition = "all " + sec + "s cubic-bezier(0.4, 0, 0.2, 1)";
            setTimeout(() => {
                this.cardElem.style.transition = "all 0s";
            }, sec * 100);
        }

        this.cardElem.style.transform = 'translate3d(' + Math.round(pos.x) + 'px, ' + Math.round(pos.y) + 'px, 0) rotateZ(' + rot + 'deg)';
        if (!this.code)  this.cardElem.style.transform += 'scale(1.5)'


        this.pos = pos;
        if (change) this.posOG = pos;
        this.zIndex = zIndex;
        this.rot = rot;
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
        this.cardFrontElem.style.border = this.cardBackElem.style.border = "solid 6px" + color;
        this.cardFrontElem.style.margin = this.cardBackElem.style.margin = "-6px";
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
        this.cardElem.style.transform = 'translate3d(' + Math.round(card.pos.x) + 'px, ' + Math.round(card.pos.y) + 'px, 0)'
    }

}


