import { Card } from './card_lobby.js';
import { cardValueEnum, cardSuitEnum } from './util.js';


var cards = []

var value = Object.keys(cardValueEnum);
var suit = Object.keys(cardSuitEnum);
var cards = []
var cards2 = []
const allowedCharacters = /^[123456789JQKA]+$/;



document.getElementById("create-button").addEventListener("click", () => 
{
    window.location="http://127.0.0.1:8080/game.html";
    // app.get('/', function (req, res) {
    // res.redirect('public/game.html');
// });
});

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

document.getElementById("join-button").addEventListener("click", () => 
{
    document.getElementsByClassName("lobby-container-btn")[0].style.transform = "translateY(-100vh)";
});

document.getElementById("back-button").addEventListener("click", () => 
{
    document.getElementsByClassName("lobby-container-btn")[0].style.transform = "translateY(0vh)";
});

// document.getElementById("roomNumber").addEventListener("keydown", (e) =>
// {
    

// });


function manageInput(data, index)
{       
    let inputElement = document.getElementById("roomNumber");

    let b = false;

    for (const key of value)
    {
        if (cardValueEnum[key].name == data || cardValueEnum[key].name.toLowerCase() == data)
        {
            cards[index].changeCard(cardSuitEnum.Spades, cardValueEnum[key]);
            cards[index].flipCard(false, true);
            b = true
        }
    }
    if (!b)
    {
        inputElement.value = inputElement.value.slice(0, -1);
    }
}


document.getElementById("roomNumber").addEventListener("input", (e) => 
{
    let inputElement = document.getElementById("roomNumber");
    if (e.data === null)
    {
        if (e.inputType == "deleteContentBackward" || e.inputType == "deleteContentForward")
        {
            // if (inputElement.value.length)
            // for (let i= inputElement.value.length; i >= inputElement.value.length ; --i)
                cards[inputElement.value.length].flipCard(false, false);
        
        }

        else if (e.inputType == "insertFromPaste")
        {
            for (let i=0; i < inputElement.value.length; ++i)
            {
                manageInput(inputElement.value[i], i);
            }
        }
        else if (e.inputType == "deleteWordBackward" || e.inputType == "deleteWordForward")
        {
            for (const card of cards)
            card.flipCard(false, false);
        }

        // else
    }
    else
    {
        manageInput(e.data, inputElement.value.length - 1);
    }

});


window.onload = async (event) => {

    cards.push(new Card(cardSuitEnum.Spades, cardValueEnum.Ace, { x: -180, y: -220 }, 1, false, 0, true));
    cards.push(new Card(cardSuitEnum.Spades, cardValueEnum.Ace, { x: -90, y: -220 }, 1, false, 0, true));
    cards.push(new Card(cardSuitEnum.Spades, cardValueEnum.Ace, { x: 0, y: -220 }, 1, false, 0, true));
    cards.push(new Card(cardSuitEnum.Spades, cardValueEnum.Ace, { x: 90, y: -220 }, 1, false, 0, true));


    let i = 0;
    const angle = (i / (52 - 3)) *(Math.PI / 3) + Math.PI/3 + Math.PI; // Angle range between 0 to π
    const radius = 800; // Radius of the fan
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    for (const keySuit of suit) {
        for (const key of value)
        {   
       
            
            // Calculate x and y coordinates
            cards2.push(new Card(cardSuitEnum[keySuit], cardValueEnum[key], { x:  x + i*0.25 -35, y: y - i*0.25 -760}, i, true, -(52 / 2) ));
            new Card(cardSuitEnum[keySuit], cardValueEnum[key], { x:  x + i*0.5 - 300, y: y + i*0.5 + 290}, i, true, -(52/6) )
            new Card(cardSuitEnum[keySuit], cardValueEnum[key], { x:  x - i*0.5 + 950, y: y + i*0.5 + 290}, i, true, (52/6) )
            ++i;
        }
    }
    await delay(250);
    
    for (let i=0; i < cards2.length; ++i)
    {
        const angle = (i / (52 - 3)) *(Math.PI / 3) + Math.PI/3 + Math.PI; // Angle range between 0 to π
        const radius = 800; // Radius of the fan
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        let sec = 0.04 + Math.pow(40.99914*Math.e, (-53.12935*x))
        for (let j=i; j < cards2.length; ++j)
            cards2[j].changePosition({ x:  x + j*0.25 -35, y: y -j*0.25 -760}, cards2[i].zIndex , false, true,sec, (i - (52 / 2)), true)
        await delay(sec*1000);
    }


    
  }
