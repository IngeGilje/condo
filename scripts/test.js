
function sum(a,b) {

  return a + b;
}

let sum2 = (a,b) => a + b;

function isPositive (number) {

  return (number >= 0);
}

isPositive = number => number > 0;

function randomNumber() {

  return Math.randomNumber;
}

let randomNumber2 = () => Math.randomNumber;


document.addEventListener('click', function() {
  console.log('click');
})

document.addEventListener('click', () => console.log('click'));