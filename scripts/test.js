
const a=5;
const b=55;
let result;

result = add(5,55);
function add(a, b) {
  return a + b;
}
console.log('This works:',result);

addFunction = (a, b) => a + b;
result = addFunction(a,b);

console.log('This does work too:',result);

