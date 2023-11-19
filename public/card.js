

import { createElement, addChildElement, addListener, removeListener, getEquation, cardHeight, cardWidth } from './util.js';
import { notifyCardMove, notifyCardFlip, notifyCursorUp, notifyCursorDown } from './client.js'; 

var MAT = document.getElementById("mat").getBoundingClientRect();
const HAND = document.getElementById("hand").getBoundingClientRect();

const eqSize1 = getEquation(-50 , 1, -25 , 2);
const eqSize2 = getEquation(0 , 1, -10 , 2);

const HEIGHT = (((0.088 * window.innerHeight)/MAT.height)*100)/2; //px


const eqPosDownX = getEquation((MAT.left/window.innerWidth)*100 - 50, -50, (MAT.right/window.innerWidth)*100 - 50, 50);
const eqPosDownX2 = getEquation((MAT.left/window.innerWidth)*100 - 50, 50, (MAT.right/window.innerWidth)*100 - 50, -50);
const eqPosDownY = getEquation(-50, 50, 50, 75);

// const eqPosDownX = getEquation((MAT.left/window.innerWidth)*100, 0, (MAT.right/window.innerWidth)*100, 100);
// const eqPosDownX2 = getEquation((MAT.left/window.innerWidth)*100, 100, (MAT.right/window.innerWidth)*100, 0);
// const eqPosDownY = getEquation(0, 100, 100, 125);



const eqPosUpX = getEquation(-50, (MAT.left/window.innerWidth)*100 -50, 50, (MAT.right/window.innerWidth)*100 - 50);
const eqPosUpX2 = getEquation(50, (MAT.left/window.innerWidth)*100 - 50, -50, (MAT.right/window.innerWidth)*100 - 50);
const eqPosUpY = getEquation(50, -50, 75, 50);



// const eqPosUpX = getEquation(0, (MAT.left/window.innerWidth)*100, 100, (MAT.right/window.innerWidth)*100);
// const eqPosUpX2 = getEquation(100, (MAT.left/window.innerWidth)*100, 0, (MAT.right/window.innerWidth)*100);
// const eqPosUpY = getEquation(100, 0, 125, 100);

// Creation of class Card
export class Card {

    // Image source and extension
    static imgSrc = 'img/';
    static imgExt = '.svg';
    static imgBackCard = '1B';
    static mouseDown = false;
    static maxZ = 1;

    onMouseDown = this.onMouseDown.bind(this)
    onMousemove = this.onMousemove.bind(this)
    onMouseUp = this.onMouseUp.bind(this)


    constructor(suit, value, pos = { x: 0, y: 0 }, zIndex = 1, front = true, index=undefined, rot=0, owner = 0, elem) {

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
        this.saveRot = rot;
        this.owner = owner;
        this.rect = document.getElementById(elem).getBoundingClientRect();

        this.cos = Math.round(Math.cos((this.rot * Math.PI) / 180));
        this.sin = Math.round(Math.sin((this.rot * Math.PI) / 180));   

        this.disabled = false;

        this.dim = this.getDimensions();
        this.offset = { x: pos.x, y: pos.y };

        this.startTime;
        if (Card.maxZ < zIndex) Card.maxZ = zIndex;
        this.isPartOfHand = false;
        this.isDragging = false;

        this.createElements(elem);
    }

    // Method to create DOM elements
    createElements(elem) {

        // Creating div elements
        this.cardElem = createElement('div', 'card');
        // this.cardElem.id = this.id;
        this.cardElem.style.zIndex = this.zIndex;
        this.cardElem.style.left = (this.pos.x - this.dim.w + 50) + '%';
        this.cardElem.style.top = (this.pos.y - this.dim.h + 50) + '%';
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
        addChildElement(document.getElementById(elem), this.cardElem);

        // Listeners     
        addListener(this.cardElem, 'mouseover', this.onMouseHover.bind(this));
        addListener(this.cardElem, 'mouseout', this.onMouseOut.bind(this));

    }

    getDimensions()
    {
        return {w:this.pctWidth(cardWidth())/2 , h: this.pctHeight(cardHeight())/2}
    }

    pctWidth(elem)
    {
        return (elem/this.rect.width)*100
    }

    pctHeight(elem)
    {
        return (elem/this.rect.height)*100
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
        if (e.button === 0)
        {
            Card.mouseDown = true;
            this.isDragging = true;
    
            addListener(window, 'mouseup', this.onMouseUp);
            addListener(window, 'mousemove', this.onMousemove);
            
            e.preventDefault();
            this.startTime = Date.now();
    
            if (!this.isPartOfHand)
                this.setzIndex();
    
            notifyCursorDown(this, this.id, this.zIndex)    
         
            this.offset.x = this.pctWidth(e.clientX) - (this.pos.x * this.cos) + (this.pos.y * this.sin);
            this.offset.y = this.pctHeight(e.clientY) - (this.pos.x * this.sin) - (this.pos.y * this.cos);
        }
}   

    isOnHand(pos) {

        
        if (!this.isPartOfHand)
        {
            // pos = Math.abs(pos);
            if (!(pos < ((50 - HEIGHT)))) this.isPartOfHand = true;
        }
        else
        {
            console.log("va")
            if (pos < ((-this.dim.h - 50))) this.isPartOfHand = false;
        }
    }

    scale(pos)
    {
        if ((pos >= -50  && pos <= -25))
            this.cardElem.style.transform = 'scale(' + (pos*eqSize1[0] + eqSize1[1]) + ')';
        else if (pos < -50)
            this.cardElem.style.transform = 'scale(1)'
        else if (pos > -25)
            this.cardElem.style.transform = 'scale(2)'
    }
    
    scale2(pos)
    {
        if (pos <= 0  && pos >= -10)
            this.cardElem.style.transform = 'scale(' + (pos*eqSize2[0] + eqSize2[1]) + ')';
        else if (pos >= 0)
            this.cardElem.style.transform = 'scale(1)'
        else if (pos <= -10)
            this.cardElem.style.transform = 'scale(2)'
    }

    move(xMove, yMove)
    {

        if (!this.isPartOfHand)
        {
            if (Math.abs(xMove) <= 50)
            {
                this.xSend = xMove;
                this.cardElem.style.left = (xMove - this.dim.w + 50) + '%';
            }
            if (Math.abs(yMove) <= 50)
            {
                this.ySend = yMove;
                this.cardElem.style.top = (yMove - this.dim.h + 50) + '%';
            }

            notifyCardMove(true, this, { x: this.xSend, y: this.ySend });
        }
        else
        {
            if (Math.abs(xMove) <= 50)
            {
                this.xSend = xMove;
                this.cardElem.style.left = (xMove - this.dim.w + 50) + '%';
            }
            // if (Math.abs(yMove) <= 50)
            // {
                // console.log("xMove", xMove, ((MAT.right/window.innerWidth)*100 - 50));
                // if ((xMove >= ((MAT.left/window.innerWidth)*100 - 50) && yMove >= -50) || (xMove <= ((MAT.right/window.innerWidth)*100 - 50) && yMove >= -50) || (xMove >= (MAT.left/window.innerWidth)*100 - 50) && xMove <= (MAT.right/window.innerWidth)*100 - 50)
                // {
                    this.ySend = yMove;
                    this.cardElem.style.top = (yMove - this.dim.h + 50) + '%';
                // }
            // }
            const cos = Math.round(Math.cos((this.saveRot * Math.PI) / 180));
            const sin = Math.round(Math.sin((this.saveRot * Math.PI) / 180)); 

            // console.log("cos", cos, sin)
            notifyCardMove(true, this, { x: ((((this.xSend)*eqPosDownX[0] + eqPosDownX[1]))*cos + (((this.ySend)*eqPosDownY[0] + eqPosDownY[1]))*sin),
                                         y: ((((this.xSend)*eqPosDownX2[0] + eqPosDownX2[1]))*sin + (((this.ySend)*eqPosDownY[0] + eqPosDownY[1]))*cos)});
        }
    }

    changeParent(xMove, yMove, e)
    {
        
        if (!this.isPartOfHand && !document.getElementById("mat").contains(this.cardElem))
        {
            addChildElement(document.getElementById("mat"), this.cardElem);
            this.rect = MAT;
            
            this.rotate(this.saveRot);
            
            console.log("MOVE", xMove, yMove);
            this.offset.x = (this.pctWidth(e.clientX) - ((((xMove)*eqPosDownX[0] + eqPosDownX[1]))*Math.abs(this.cos) - (((xMove)*eqPosDownX2[0] + eqPosDownX2[1]))*Math.abs(this.sin)));
            this.offset.y = (this.pctHeight(e.clientY) - ((((yMove)*eqPosDownY[0] + eqPosDownY[1]))*Math.abs(this.sin) + (((yMove)*eqPosDownY[0] + eqPosDownY[1]))*Math.abs(this.cos)));

            this.dim = this.getDimensions();
            
            this.cardElem.style.left = ((this.pctWidth(e.clientX) - this.offset.x)*this.cos + (this.pctHeight(e.clientY) - this.offset.y)*this.sin - this.dim.w + 50) + '%';
            this.cardElem.style.top = ((this.pctHeight(e.clientY) - this.offset.y)*this.cos -( this.pctWidth(e.clientX) - this.offset.x)*this.sin - this.dim.h + 50) + '%';
            console.log("New", ((this.pctWidth(e.clientX) - this.offset.x) - this.dim.w), ((this.pctHeight(e.clientY) - this.offset.y) - this.dim.h));
        }

        else if (this.isPartOfHand && !document.getElementById("hand").contains(this.cardElem))
        {
            
            addChildElement(document.getElementById("hand"), this.cardElem);
            this.rect = HAND;
            
            this.offset.x = (this.pctWidth(e.clientX) - ((((xMove)*eqPosUpX[0] + eqPosUpX[1]))*this.cos + (((yMove)*eqPosUpX2[0] + eqPosUpX2[1]))*this.sin) + 0);
            this.offset.y = (this.pctHeight(e.clientY) - (((Math.abs(xMove)*eqPosUpY[0] + eqPosUpY[1]))*Math.abs(this.sin) + (((Math.abs(yMove))*eqPosUpY[0] + eqPosUpY[1]))*Math.abs(this.cos)) +  0);
            
            this.dim = this.getDimensions();
            
            this.cardElem.style.left = ((this.pctWidth(e.clientX) - this.offset.x) - this.dim.w + 50) + '%';
            this.cardElem.style.top = ((this.pctHeight(e.clientY) - this.offset.y) - this.dim.h + 50) + '%';
            console.log("MOVE", ((this.pctWidth(e.clientX) - this.offset.x) - this.dim.w ), ((this.pctHeight(e.clientY) - this.offset.y) - this.dim.h ))
            
            this.rotate();
        }
    }
    
    onMousemove(e) {

        let xMove = this.pctWidth(e.clientX) - this.offset.x;
        let yMove = this.pctHeight(e.clientY) - this.offset.y;
   

        this.move((xMove * this.cos) + (yMove * this.sin), (yMove * this.cos) - (xMove * this.sin));
        if (this.isPartOfHand) this.scale(this.ySend);
        this.isOnHand(this.ySend*this.cos + this.xSend*this.sin);
        this.changeParent(this.xSend, this.ySend, e);
        // this.changeParent((this.xSend*cos) + (this.ySend*sin), (this.xSend*sin) + (this.ySend*cos), e);
       
    }
    
    onMouseUp(e) {
        if (e.button === 0)
        {
            Card.mouseDown = false;
            this.isDragging = false;
            removeListener(window, 'mousemove', this.onMousemove)
            // flip sides
            if (Date.now() - this.startTime < 300 && (this.pos.x === this.xSend && this.pos.y === this.ySend))  
                this.flipCard(true);
    
            // Update position of the card
            this.pos.x = this.xSend;
            this.pos.y = this.ySend;
    
            removeListener(window, 'mouseup', this.onMouseUp);
            
            // Notify Server
            notifyCursorUp(this, this.pos)
            
        }


    }

    flipCard(notify = false, front, animation = true) {
        if (front === 'null' || front === null || front === undefined) this.front = !this.front;
        else this.front = front;
        
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
                    this.cardFrontImg.src = Card.imgSrc + this.value.name + this.suit + Card.imgExt;
                }, 75);
                
            }
        }
        else
        {
            (this.front) ? this.cardInnerElem.style.transform = 'rotateY(0deg)' : this.cardInnerElem.style.transform = 'rotateY(-180deg)';
            (this.front) ? this.cardFrontImg.src = Card.imgSrc + this.value.name + this.suit + Card.imgExt : this.cardFrontImg.src = "/";
        }

        

        // Notify server if it isnt part of a Hand and its not coming from the server
        if (notify)
            notifyCardFlip(this)
    }

    changeTransitionTime() {
        setTimeout(() => {

            if (!this.front) this.cardFrontImg.src = "/";

            this.cardInnerElem.style.transition = "transform 0s linear, rotate 250ms"
        }, 75);

    }

    rotate(rot=0)
    {
        this.cardElem.style.rotate = (-rot) + 'deg';
        this.cardElem.style.transformOrigin = "50% 50%";
        this.rot = rot;
        this.cos = Math.round(Math.cos((this.rot * Math.PI) / 180));
        this.sin = Math.round(Math.sin((this.rot * Math.PI) / 180)); 

    }

    changePosition(pos, zIndex, rot = this.rot, animation = false, sec = 0.25) {
        if (sec === 0 ) animation = false;
        if (animation) {
            this.isDragging = false;
            this.cardElem.style.transition = "left " + sec + "s ease-in-out, top " + sec + "s ease-in-out, rotate 250ms";
            setTimeout(() => {
                this.cardElem.style.transition = "left 0s, top 0s, rotate 250ms";
            }, sec * 100);
        }
        // this.scale(pos.y)

        this.cardElem.style.left = (pos.x - this.dim.w + 50) + '%';
        this.cardElem.style.top = (pos.y - this.dim.h + 50) + '%';
        this.rotate(rot);

        // if (onHand) this.cardElem.style.transform = 'scale(2)';

        this.pos = {x: (pos.x), y: (pos.y)};
        if (zIndex !== undefined) this.setzIndex2(zIndex);

        // this.setzIndex();
    }

    changePositionHand(pos, zIndex) {
            this.isDragging = false;
            this.cardElem.style.transition = "left " + 0.25 + "s ease-in-out, top " + 0.25 + "s ease-in-out, rotate 250ms";
            setTimeout(() => {
                this.cardElem.style.transition = "left 0s, top 0s, rotate 250ms";
            }, 0.25 * 100);

        // this.scale(pos.y)


        this.cardElem.style.left = (pos.x - (((0.063 * window.innerHeight)/HAND.width)*100)/2 + 50) + '%';
        this.cardElem.style.top = (pos.y - (((0.088 * window.innerHeight)/HAND.height)*100)/2 + 50) + '%';
                
        this.pos = {x: (pos.x), y: (pos.y)};
        this.xSend = pos.x;
        this.ySend = pos.y;

        const cos = Math.round(Math.cos((this.saveRot * Math.PI) / 180));
        const sin = Math.round(Math.sin((this.saveRot * Math.PI) / 180)); 
        // notifyCardMove(false, this, { x: (((this.pos.x)*eqPosDownX[0] + eqPosDownX[1])), y: (((this.pos.y)*eqPosDownY[0] + eqPosDownY[1])) });
        
        notifyCardMove(false, this, { x: ((((this.xSend)*eqPosDownX[0] + eqPosDownX[1]))*cos + (((this.ySend)*eqPosDownY[0] + eqPosDownY[1]))*sin),
            y: ((((this.xSend)*eqPosDownX2[0] + eqPosDownX2[1]))*sin + (((this.ySend)*eqPosDownY[0] + eqPosDownY[1]))*cos)});
        if (zIndex !== undefined) this.setzIndex2(zIndex);

    }


    setzIndex() {

        if (this.zIndex < Card.maxZ && !this.isPartOfHand)
            this.zIndex = ++Card.maxZ;
        this.cardElem.style.zIndex = this.zIndex;

    }

    setzIndex2(zIndex) {
        this.zIndex = zIndex;
        this.cardElem.style.zIndex = zIndex;

        if (this.zIndex > Card.maxZ) ++Card.maxZ;
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


