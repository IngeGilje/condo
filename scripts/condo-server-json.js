const WebSocket = require('ws');

// Disk file handling
const fs = require('fs');

// File handling
let data = "";
const path = require('path');
const directoryName = "C:/inetpub/wwwroot/condo/data";
const fileName = "data.json";
// Specify the file path
const filePath = path.join(directoryName, fileName);

// Connect server (Node.js program)
const server = new WebSocket.Server({ port: 7000 });

server.on('connection', (ws) => {

  ws.on('message', async (message) => {

    let jsonString = undefined;

    // Received message from server
    const receivedMessage = message.toString();
    const taskOption = receivedMessage.substring(0, 14);
    switch (taskOption) {
      case "getJSONString":

        jsonString = getJSONString();

        // Send JSON string to client
        ws.send(jsonString);
        break;

      case "saveJSONString":

        // Save JSON string to disk
        jsonString = receivedMessage.substring(14,);
        jsonString = saveJSONString(jsonString);

        // Send JSON string to client
        ws.send(jsonString);
        break;

      case "insrJSONString":

        // Insert object to JSON string and save to disk
        jsonString = receivedMessage.substring(14,);
        jsonString = saveJSONString(jsonString);

        // Send JSON string to client
        ws.send(jsonString);
        break;

      default:

        ws.send("Error: Message from client is not correct: ", receivedMessage);
        break;

    }
  });

  ws.on('close', () => {

  });
});

console.log('WebSocket server is running on ws://localhost:7000');

// Get JSON String
function getJSONString() {

  let jsonString = getJSONFile();

  // Create condos object
  jsonString = saveJSONString(jsonString);

  return jsonString;

}

// Read of JSON file from disk
function getJSONFile() {
  try {
    const JSONString = fs.readFileSync(filePath, 'utf8');
    return JSONString;
  } catch (err) {
    console.error('Error reading file:', err);
    return err;
  }
}

// Write the JSON string to disk
function saveJSONString(jsonString) {

  fs.writeFile(filePath, jsonString, (err) => {
    if (err) {
      console.error("An error occurred while writing the JSON file:", err);
      return;
    } else {
      return;
    }
  });
  return jsonString;
}

// Create condos info array
// data structure
function createCondoInfo() {
  return `[{
      "lastUpdate": "",
      "condoId": "95A",
      "firstName": "Fabiana",
      "lastName": "Franco",
      "boardMembership": [],
      "street": "Laberget 95A",
      "postalCode": "4020",
      "city": "Stavanger",
      "rent2024": [2591, 2591, 2591, 2591, 2591, 2591, 2591, 2591,
                  2591, 2591, 2591, 2591],
      "rentDate2024": ["15.01.2024","15.02.2024","15.03.2024","15.04.2024","15.05.2024", 
                          "15.06.2024","15.07.2024","15.08.2024","15.09.2024","15.10.2024",
                          "15.11.2024","15.12.2024"],
      "rent2025": [2329, 2329, 2329, 2329, 2329, 2329, 2329, 2329,
                  2329, 2329, 2329, 2329],
      "rentDate2025": ["15.01.2025","15.02.2025","15.03.2025","15.04.2025","15.05.2025", 
                          "15.06.2025","15.07.2025","15.08.2025","15.09.2025","15.10.2025",
                          "15.11.2025","15.12.2025"],
      "payment": [],
      "paymentDate": []
    },
    {
      "lastUpdate": "",
      "condoId": "95B",
      "firstName": "Inge",
      "lastName": "Gilje",
      "boardMembership": [],
      "street": "Laberget 95B",
      "postalCode": "4020",
      "city": "Stavanger",
      "rent2024": [3401, 3401, 3401, 3401, 3401, 3401, 3401, 3401,
                   3401, 3401, 3401, 3401],
      "rentDate2024": ["15.01.2024","15.02.2024","15.03.2024","15.04.2024","15.05.2024", 
                          "15.06.2024","15.07.2024","15.08.2024","15.09.2024","15.10.2024",
                          "15.11.2024","15.12.2024"],
      "rent2025": [3139, 3139, 3139, 3139, 3139, 3139, 3139, 3139,
                   3139, 3139, 3139, 3139],
      "rentDate2025": ["15.01.2025","15.02.2025","15.03.2025","15.04.2025","15.05.2025", 
                          "15.06.2025","15.07.2025","15.08.2025","15.09.2025","15.10.2025",
                          "15.11.2025","15.12.2025"],
      "payment": [],
      "paymentDate": []
    },
    {
      "lastUpdate": "",
      "condoId": "97A",
      "firstName": "Kristine",
      "lastName": "Sømme",
      "boardMembership": [],
      "street": "Laberget 97A",
      "postalCode": "4020",
      "city": "Stavanger",
      "rent2024": [2537, 2537, 2537, 2537, 2537, 2537, 2537,
                   2537, 2537, 2537, 2537, 2537],
      "rentDate2024": ["15.01.2024","15.02.2024","15.03.2024","15.04.2024","15.05.2024", 
                          "15.06.2024","15.07.2024","15.08.2024","15.09.2024","15.10.2024",
                          "15.11.2024","15.12.2024"],
      "rent2025": [2275, 2275, 2275, 2275, 2275, 2275, 2275,
                   2275, 2275, 2275, 2275, 2275],
      "rentDate2025": ["15.01.2025","15.02.2025","15.03.2025","15.04.2025","15.05.2025", 
                          "15.06.2025","15.07.2025","15.08.2025","15.09.2025","15.10.2025",
                          "15.11.2025","15.12.2025"],
      "payment": [],
      "paymentDate": []
    },
    {
      "lastUpdate": "",
      "condoId": "97B",
      "firstName": "Ladan",
      "lastName": "Pazoki",
      "boardMembership": [],
      "street": "Laberget 97B",
      "postalCode": "4020",
      "city": "Stavanger",
      "rent2024": [2245, 2245, 2245, 2245, 2245, 2245, 2245,
                   2245, 2245, 2245, 2245, 2245],
      "rentDate2024": ["15.01.2024","15.02.2024","15.03.2024","15.04.2024","15.05.2024", 
                          "15.06.2024","15.07.2024","15.08.2024","15.09.2024","15.10.2024",
                          "15.11.2024","15.12.2024"],
      "rent2025": [1984, 1984, 1984, 1984, 1984, 1984, 1984,
                   1984, 1984, 1984, 1984, 1984],
      "rentDate2025": ["15.01.2025","15.02.2025","15.03.2025","15.04.2025","15.05.2025", 
                          "15.06.2025","15.07.2025","15.08.2025","15.09.2025","15.10.2025",
                          "15.11.2025","15.12.2025"],
      "payment": [],
      "paymentDate": []
    },
    {
      "lastUpdate": "",
      "condoId": "97C",
      "firstName": "Oskar",
      "lastName": "Fausk",
      "boardMembership": [],
      "street": "Laberget 97C",
      "postalCode": "4020",
      "city": "Stavanger",
      "rent2024": [1811, 1811, 1811, 1811, 1811, 1811, 1811,
                   1811, 1811, 1811, 1811, 1811],
      "rentDate2024": ["15.01.2024","15.02.2024","15.03.2024","15.04.2024","15.05.2024", 
                          "15.06.2024","15.07.2024","15.08.2024","15.09.2024","15.10.2024",
                          "15.11.2024","15.12.2024"],
      "rent2025": [1549, 1549, 1549, 1549, 1549, 1549, 1549,
                   1549, 1549, 1549, 1549, 1549],
      "rentDate2025": ["15.01.2025","15.02.2025","15.03.2025","15.04.2025","15.05.2025", 
                          "15.06.2025","15.07.2025","15.08.2025","15.09.2025","15.10.2025",
                          "15.11.2025","15.12.2025"],
      "payment": [],
      "paymentDate": []
    },
    {
      "lastUpdate": "",
      "condoId": "99A",
      "firstName": "Åse",
      "lastName": "Stapnes",
      "boardMembership": [],
      "street": "Laberget 99A",
      "postalCode": "4020",
      "city": "Stavanger",
      "rent2024": [2543, 2543, 2543, 2543, 2543, 2543, 2543,
                   2543, 2543, 2543, 2543, 2543],
      "rentDate2024": ["15.01.2024","15.02.2024","15.03.2024","15.04.2024","15.05.2024", 
                          "15.06.2024","15.07.2024","15.08.2024","15.09.2024","15.10.2024",
                          "15.11.2024","15.12.2024"],
      "rent2025": [2281, 2281, 2281, 2281, 2281, 2281, 2281,
                   2281, 2281, 2281, 2281, 2281],
      "rentDate2025": ["15.01.2025","15.02.2025","15.03.2025","15.04.2025","15.05.2025", 
                          "15.06.2025","15.07.2025","15.08.2025","15.09.2025","15.10.2025",
                          "15.11.2025","15.12.2025"],
      "payment": [],
      "paymentDate": []
    },
    {
      "lastUpdate": "",
      "condoId": "99B",
      "firstName": "Birgit",
      "lastName": "Schober",
      "boardMembership": [],
      "street": "Laberget 99B",
      "postalCode": "4020",
      "city": "Stavanger",
      "rent2024": [3431, 3431, 3431, 3431, 3431, 3431, 3431,
                   3431, 3431, 3431, 3431, 3431],
      "rentDate2024": ["15.01.2024","15.02.2024","15.03.2024","15.04.2024","15.05.2024", 
                          "15.06.2024","15.07.2024","15.08.2024","15.09.2024","15.10.2024",
                          "15.11.2024","15.12.2024"],
      "rent2025": [3169, 3169, 3169, 3169, 3169, 3169, 3169,
                   3169, 3169, 3169, 3169, 3169],
      "rentDate2025": ["15.01.2025","15.02.2025","15.03.2025","15.04.2025","15.05.2025", 
                          "15.06.2025","15.07.2025","15.08.2025","15.09.2025","15.10.2025",
                          "15.11.2025","15.12.2025"],
      "payment": [],
      "paymentDate": []
    }
  ]`;
}
