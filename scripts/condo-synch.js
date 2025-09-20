
getData();

async function getData() {
  try {
    // Wait for response from Node.js server
    let response = await fetch('/get-data');
    let data = await response.json();

    console.log("Got data:", data);
    // Next line runs only AFTER data is ready
    document.body.innerHTML = "Result: " + data.result;
  } catch (err) {
    console.error("Error:", err);
  }
}
