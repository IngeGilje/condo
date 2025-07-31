const recorVideoOne = new Promise ((resolve,reject) => {

  resolve('Video 1 Recorded')
})

const recorVideoTwo = new Promise ((resolve,reject) => {

  resolve('Video 2 Recorded')
})

const recorVideoTree = new Promise ((resolve,reject) => {

  resolve('Video 3 Recorded')
})

Promise.race([

recorVideoOne,
recorVideoTwo,
recorVideoTree
]).then((message) => {

  console.log(message)
})