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
    
})

export const cardSuitEnum = Object.freeze({
    
    Clubs: 'C',
    Diamonds: 'D',
    Hearts: 'H',
    Spades: 'S'
})


export function quickSort(arr, by='index') {
    if (arr.length <= 1) {
      return arr;
    }
  
    const pivot = arr[0];
    const left = [];
    const right = [];
    for (let i = 1; i < arr.length; i++) {
      if (arr[i][by] < pivot[by]) {
        left.push(arr[i]);
      } else {
        right.push(arr[i]);
      }
    }
  
    return [...quickSort(left), pivot, ...quickSort(right)];
  }


export function getPercentX(coord)
{
  return (coord/window.innerWidth)*100;
}

export function getPercentY(coord)
{
  return (coord/window.innerHeight)*100;
}