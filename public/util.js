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
    Ace: {rank: 14, name: 'A'}
    // Joker:{rank: 0, name: 'J'}
    
})

export const cardSuitEnum = Object.freeze({
    
    Clubs: 'C',
    Diamonds: 'D',
    Hearts: 'H',
    Spades: 'S'
    // Joker: 'J'
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



export function quickSort(arr, by = 'value.rank') {
    if (arr.length <= 1) {
      return arr;
    }
  
    const pivot = arr[0];
    const left = [];
    const right = [];
  
    for (let i = 1; i < arr.length; i++) {
      const pivotValue = getNestedProperty(pivot, by);
      const arrValue = getNestedProperty(arr[i], by);
      if (arrValue < pivotValue) {
        left.push(arr[i]);
      } else {
        right.push(arr[i]);
      }
    }
  
    return [...quickSort(left, by), pivot, ...quickSort(right, by)];
  }
  
  function getNestedProperty(obj, propPath) {
    const props = propPath.split('.');
    let value = obj;
  
    for (const prop of props) {
      if (value.hasOwnProperty(prop)) {
        value = value[prop];
      } else {
        return undefined; // Property doesn't exist
      }
    }
  
    return value;
  }

export function biggerCard(card, inside)
{
    // console.log("BIGGERCARD")
    if (inside)
    {
        // card.cardElem.style.transition = "all 0.25s ease-in-out";
        // // card.cardElem.style.transform = "scale(3)"
        // setTimeout(() => {
        //   card.cardElem.style.transition = "all 0s";
        // }, 250);
    }
    else
    {
        // card.cardElem.style.width = "80px";
        // card.cardElem.style.height = "112px";
    }
}

      // for (const card of deck.cards)
      //   console.log(card.id)]


    //   function cubicBezierScale(t) {
    //     const p0 = 0;
    //     const p1 = 0.51;
    //     const p2 = 0.42;
    //     const p3 = 0.98;
      
    //     const tSquared = t * t;
    //     const tCubed = tSquared * t;
      
    //     const scale = p0 * (1 - tCubed) + p1 * (3 * tSquared - 2 * tCubed) + p2 * (3 * tCubed - 2 * tSquared) + p3 * tCubed;
      
    //     // Scale between 1 and 2
    //     return 1 + scale;
    //   }
    //   if (newPosition.y >= toHand.getBoundingClientRect().top && newPosition.y <= toHand.getBoundingClientRect().bottom && !card.isPartOfHand)
    //   {
    //     card.cardElem.style.transform += 'scale(' + (Math.min(Math.max(cubicBezierScale((newPosition.y - minY) / (maxY - minY)), 1), 2)) + ')';
    //       console.log('scale(' + (cubicBezierScale((newPosition.y - minY) / (maxY - minY))) + ')')
    //     //   console.log((eqSize[0]*newPosition.y) + eqSize[1]);
    //   }      


export function getPercentX(coord)
{
 let matRect = document.getElementById("mat").getBoundingClientRect();
  return ((coord - (window.innerWidth - matRect.width)/2)/matRect.width)*100;
}

export function getPercentY(coord)
{
  let matRect = document.getElementById("mat").getBoundingClientRect();
  return ((coord - (window.innerHeight - matRect.height)/2)/matRect.height)*100;

}

// Get equation to move the cover-section
export function getEquation(x1, y1, x2, y2)
{
  let m = (y2 - y1) / (x2 - x1);
  let b = y1 - (m * x1);
  return [m, b];
}