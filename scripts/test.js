// AI test with Javascript
const request = new XMLHttpRequest();

request.addEventListener('readystatechange', () => {
  if (request.readyState === 4) {
    console.log(request,request.responseText);
  }
});

// Get a request from server
request.open('GET','https://jsonplaceholder.typicode.com/todos/');
request.send();