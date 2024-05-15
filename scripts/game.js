var rotatingAnimCard = {};
const backPng = `media/seahorse.png`;

var options = {
    clicks: 2,
    cardNum: 10,
    themeNum: 1
}

var clickedCardId = -1;
let cardsInPlay = [];

document.addEventListener('keydown', function(event) { inputKey(event); })

function Card(imageId, num) {
    this.imageId = imageId;
    this.num = num;
    this.flipped = false;
    this.collected = false;

    this.getCardElement = function() {
        return elementClassNum("card", this.num);
    };

    this.isFlipped = function(checkCollected = false) {
        return this.flipped && (checkCollected ? !this.collected : true);
    }
}

function gameLoad() {
    randomizeCards();
}

function randomizeCards() {
    let cardDiv = document.getElementById("cards");
    cardDiv.innerHTML = "";

    var arr = Array.from({ length: options.cardNum * options.clicks }, (_, n) => {
        while (n >= options.cardNum)
            n -= options.cardNum

        return n;
    }); //create an int array that goes from 0 to the cardNum (10), then duplicate that.
    arr = arr.sort(function(a, b) { return 0.5 - Math.random() }); //randomize this array

    for (let i = 0; i < options.cardNum * options.clicks; i++) {
        let id = arr[i];

        cardDiv.innerHTML += `<div class="card${ i }" id=${ i } onclick="clickedCard(event)"><p class="cardNum cardP${ i }" id="${ i }">${ addZero(i + 1, 2) }</p><img class="cardImage${ i }" id=${ i } src="${ backPng }"></div>`;
        cardsInPlay.push(new Card(id, i));
    }
}

function clickedCard(event) {
    let index = event.target.id;
    flipCard(index);
}

var getLastKey = -1;
function inputKey(event) {
    const startKeycode = 48; //0 -> 48, 1 -> 49, 2 -> 50...

    if (getLastKey == -1) {
        getLastKey = event.keyCode;
    }
    else {
        let num0 = getLastKey - startKeycode;
        let num1 = event.keyCode - startKeycode;

        let numFull = parseInt(String(num0) + String(num1)) - 1;
        if (!Number.isNaN(numFull)) {
            if (cardsInPlay.length > numFull) {
                flipCard(numFull);
            }
        }   

        getLastKey = -1;
    }
}

function flipCard(i) {
    let card = getCard(i);
    let element = card.getCardElement();
    let id = card.imageId;

    if (!isRotatingCards() && !card.isFlipped()) {
        clickedCardId = id;
        rotateAnim(element, i, id, false);
    }
}

function checkForFlips() {
    let checkFlippedCards = cardsInPlay.filter(x => x.isFlipped(true));

    if (checkFlippedCards.length > 0) {
        let mainImageId = checkFlippedCards[0].imageId;
        let rotate = false;

        for (let i = 0; i < checkFlippedCards.length; i++) {
            let card = checkFlippedCards[i];

            if (mainImageId != card.imageId || rotate) {
                if (!rotate) {
                    rotate = true;
                    i = -1;

                    continue;
                }

                card.collected = false;
                rotateAnim(card.getCardElement(), card.num, card.imageId, true, 1.25);
            }
            else {
                card.collected = (checkFlippedCards.length == options.clicks);
                checkForCompletion();
            }
        }
    }
}

function checkForCompletion() {
    let checkCompleted = cardsInPlay.filter(x => x.collected);

    if (checkCompleted.length == cardsInPlay.length) {
        alert("Bem jogado! Conseguiu memorizar todas as cartas! O jogo terminou.");
    }
}

//flip card anim
function rotateAnim(elem, i, imageId, flipToBack, delayToFlip = 0) {
    const timeToFlip = 0.1;
    var scaleShift = flipToBack ? 1 : -1;
    var scaleX = -scaleShift;

    let img = elementClassNum("cardImage", i);

    if (delayToFlip == 0) {
        rotateSetAnim(i, frame);
    }
    else {
        rotatingAnimCard[i] = setTimeout(() => rotateSetAnim(i, frame), delayToFlip * 1000);
    }

    function frame() {
        scaleX += flipToBack ? timeToFlip : -timeToFlip;

        if (flipToBack ? scaleX > 1 : scaleX < -1) {
            scaleX = scaleShift;

            clearInterval(rotatingAnimCard[i]);
            delete rotatingAnimCard[i];

            cardsInPlay[i].flipped = !flipToBack;

            if (!flipToBack) {
                checkForFlips();
            }
        }

        if (flipToBack ? scaleX >= 0 : scaleX <= 0) {
            let numP = elementClassNum("cardP", i);

            if (flipToBack) {
                img.src = backPng;
                img.style.transform = "scale(1)";

                numP.style.display = "block";
            }
            else {
                img.src = `media/cartas/tema${ options.themeNum }/${ imageId }.jpg`;
                img.style.transform = "scale(2)";

                numP.style.display = "none";
            }
        }

        elem.style.transform = `scale(${ scaleX }, 1)`;
    }
}

function rotateSetAnim(i, frame) {
    rotatingAnimCard[i] = setInterval(frame, 1000 / 60);
}

function getCard(i) { return cardsInPlay[i]; }
function isRotatingCards() { return Object.keys(rotatingAnimCard).length != 0; }

function elementClassNum(name, i) {
    return document.getElementsByClassName(name + String(i))[0];
}


function randomNumber(i, j) {
    return Math.floor(Math.random() * (j - i + 1) + i);
}
function randomBoolean() {
    return randomNumber(0, 1) == 0;
}

function addZero(i, zeroAmount) {
    let s = String(i);

    if (s.length >= zeroAmount) {
        return s;
    }

    var zeros = "0".repeat(zeroAmount - s.length);
    return zeros + s;
}