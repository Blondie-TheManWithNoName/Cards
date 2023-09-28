export const cardValueEnum = Object.freeze({

    Two: {rank: 2, name: '2'},
    Three: {rank: 3, name: '3'},
    Four: {rank: 4, name: '4'},
    Five: {rank: 5, name: '5'},
    Six: {rank: 6, name: '6'},
    Seven: {rank: 7, name: '7'},
    Eight: {rank: 8, name: '8'},
    Nine: {rank: 9, name: '9'},
    Ten: {rank: 10, name: 'T'},
    Jack: {rank: 11, name: 'J'},
    Queen: {rank: 12, name: 'Q'},
    King: {rank: 13, name: 'K'},
    Ace: {rank: 14, name: 'A'},
    Joker:{rank: 0, name: 'J'}
    
})

export const cardSuitEnum = Object.freeze({
    
    Diamonds: 'D',
    Clubs: 'C',
    Hearts: 'H',
    Spades: 'S',
    Joker: 'J'
})

const colors = ["#20639B", "#3CAEA3", "F6D55C", "#ED553B"];

export function createElement(elemType, elemClass, elemImg) {
    let elem = document.createElement(elemType);
    elem.classList.add(elemClass);
    if (!(elemImg === undefined)) elem.src = elemImg;

    return elem;
}


export function addChildElement(parentElem, childElem) {
    parentElem.appendChild(childElem);
}

export function addListener (target, name, listener) {
    target.addEventListener(name, listener, true);
  }

export function removeListener (target, name, listener, callback) {
    target.removeEventListener(name, listener, true)
    if (typeof callback === "function") {
        callback();
      }
  }


export function randomColor()
{
    return colors[(Math.floor(Math.random() * colors.length))];
}



