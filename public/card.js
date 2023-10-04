

import { createElement, addChildElement, addListener, removeListener, biggerCard } from './util.js';
import { notifyCardMove, notifyCardFlip, notifyCursorUp, notifyCursorDown } from './client.js';


// Creation of class Card

export class Card {

    // Image source and extension
    static imgSrc = 'img/';
    static imgExt = '.svg';
    static imgBackCard = '1B';
    
    static maxZ = 1;
    static handLine = window.innerHeight - (window.innerHeight * 0.4);

    onMouseDown = this.onMouseDown.bind(this)
    onMousemove = this.onMousemove.bind(this)
    onMouseUp = this.onMouseUp.bind(this)


    constructor(suit, value, pos={ x: 0, y: 0 }, zIndex=1, front=true) {
        
        // Card Properties
        this.suit = suit;
        this.value = value;
        this.pos = { x: pos.x, y: pos.y }
        this.id = this.value.name + this.suit;
        this.front = front;
        this.zIndex = zIndex;
        
        
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
        this.cardElem.style.transform = 'translate(' + this.pos.x + 'px,' + this.pos.y + 'px)';
        
        this.cardInnerElem = createElement('div', 'card-inner');
        if (!this.front) this.cardInnerElem.style.transform = 'rotateY(180deg)';
        
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

    changeCard(suit, value) {
        this.suit = suit;
        this.value = value;
        this.cardFrontImg.src = Card.imgSrc + this.value.name + this.suit + Card.imgExt;
    }

    onMouseHover(e) {
        if (!this.isDragging)
            addListener(window, 'mousedown', this.onMouseDown)
    }

    onMouseOut(e) {
        if (!this.isDragging) {

            removeListener(window, 'mouseup', this.onMouseUp);
            removeListener(window, 'mousedown', this.onMouseDown);
            this.isOut = false;
        }
        else this.isOut = true;

    }

    onMouseDown(e) {

        this.isDragging = true;

        addListener(window, 'mouseup', this.onMouseUp);
        addListener(window, 'mousemove', this.onMousemove);
        e.preventDefault();
        this.startTime = Date.now();

        this.offset.x = e.clientX - this.pos.x;
        this.offset.y = e.clientY - this.pos.y;
        
        this.setzIndex();
        
        if (!this.wasPartOfHand)
            notifyCursorDown(this.id, this.zIndex)
    }

    isOnHand(pos) {

        if (pos < Card.handLine)
            this.isPartOfHand = false;
        else  //- (pos.y >= handLine cardSize.y/2.5))
            this.isPartOfHand = true;

    }

    onMousemove(e) {
        
        this.cardElem.style.transform = 'translate3d(' + Math.round(e.clientX - this.offset.x) + 'px, ' + Math.round(e.clientY - this.offset.y) + 'px, 0)'
        if (this.isPartOfHand) this.cardElem.style.transform += 'scale(2)';
        
        
        // Notify Server
        notifyCardMove(this, { x: e.clientX - this.offset.x, y: e.clientY - this.offset.y });

        // Check if its on Hand
        this.isOnHand(Math.round(e.clientY - this.offset.y));

    }

    onMouseUp(e) {

        this.isDragging = false;
        removeListener(window, 'mousemove', this.onMousemove)

        // flip sides
        if (Date.now() - this.startTime < 300 && (this.pos.x == e.clientX - this.offset.x || this.pos.y == e.clientY - this.offset.y))
            this.flipCard(true);
        
        // Update position of the card
        this.pos.x = e.clientX - this.offset.x
        this.pos.y = e.clientY - this.offset.y

        // Notify Server
        notifyCursorUp(this, this.pos)

        if (this.isOut) this.onMouseOut();

    }

    flipCard(notify=false, front) {
        (front === undefined) ? this.front = !this.front : this.front = front;
        (this.front) ? this.cardInnerElem.style.transform = 'rotateY(0deg)' : this.cardInnerElem.style.transform = 'rotateY(180deg)';
        
        // Notify server if it isnt part of a Hand and its not coming from the server
        if (!this.isPartOfHand && notify)
            notifyCardFlip(this.id)
    }

    changePosition(pos, zIndex, onHand=false, animation=false, sec=0.5, rot={ z: 0, y: 0 }) {
        
        if (animation) {
            console.log("SEC", sec)
            this.isDragging = false;
            this.cardElem.style.transition = "all " + sec + "s ease-in-out";
            setTimeout(() => {
                this.cardElem.style.transition = "all 0s";
            }, 500);
        } 

        this.cardElem.style.transform = 'translate3d(' + Math.round(pos.x) + 'px, ' + Math.round(pos.y) + 'px, 0) rotateZ(' + rot.z + 'deg) rotateY(' + rot.y + 'deg)'
        if (onHand) this.cardElem.style.transform += 'scale(2)';

        this.pos = pos;   
        this.zIndex = zIndex;
        this.setzIndex();
    }

    setzIndex() {
        if (this.zIndex < Card.maxZ)
            this.zIndex = ++Card.maxZ;
        this.cardElem.style.zIndex = this.zIndex;
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

    assign(card)
    {
      this.suit = card.suit;
      this.value =  card.value;
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


