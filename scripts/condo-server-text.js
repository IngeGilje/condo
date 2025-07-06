// Test server

let WebSocket;
let server;


// Test server/ local test server

WebSocket = require('ws');
server = new WebSocket.Server({ port: 1234 }, () => {
  console.log('WebSocket server is listening on port 6050');
});

server.on('connection', (socket) => {

  console.log('Client connected');
  socket.on('message', (message) => {
    console.log('Received:', message.toString());
    //socket.send(`Echo: ${message}`);
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

// Constants for database handling
let connected2MySQL = false; // Not connected to mysql database

// Connecting to mySQL
const mysql = require('mysql2');
let connection;
switch (serverStatus) {

  // Web server
  case 1: {
    connection = mysql.createConnection(
      {
        host: '127.0.0.1',
        user: 'Inge',
        password: 'Sommer--2025',
        database: "condos"
      }
    );
    console.log('Connected to webserver 127.0.0.1');
    break;
  }
  // Test web server/ local web server
  case 2: {
    connection = mysql.createConnection(
      {
        host: '127.0.0.1',
        user: 'Inge',
        password: 'Sommer--2025',
        database: "condos"
      }
    );
    console.log('Connected to webserver 127.0.0.1');
    break;
  }
  // Test server/ local test server
  case 3: {
    connection = mysql.createConnection(
      {
        host: 'localhost',
        user: 'Inge',
        password: 'Vinter-2025',
        database: "condos"
      }
    );
    console.log('Connected to webserver localhost');
    break;
  }
  default:
    break;
}

server.on('connection', (socket) => {

  // Connect to MySQL
  if (!connected2MySQL) {
    connectToMySql();
  }

  // Listen for messages from the client
  socket.on('message', (message) => {

    // Received message from client
    const messageFromClient = message.toString();
    console.log('message from client', messageFromClient);

    if (!messageFromClient.includes('Name of importfile:')) {

      // SQL querying
      queryingSQL(messageFromClient);

      // Send a message to the client
      setTimeout(() => {
        if (messageToClient) {
          socket.send(messageToClient);
        }
      }, 100);
    }

    if (messageFromClient.includes('Name of importfile:')) {

      let messageToClient;

      // Get text file from server
      const fs = require('fs');

      // 012345678901234567890
      // Name of importfile: C://inetpub//wwwroot//condo//scripts//transaksjonsliste.csv';
      let importFileName = messageFromClient.slice(20);
      fs.readFile(importFileName, 'utf8', (err, messageToClient) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('Generated this text file:', messageToClient);
        socket.send(messageToClient);
      });
    }
  });
});

// Connect to MySQL
function connectToMySql() {
  connection.connect((err) => {
    if (err) {
      console.error('Error when connecting to MySQL: ', err.message);
      connected2MySQL = false;
    } else {
      connected2MySQL = true;
    }
  });
}

// Close a database
function closeDatabase() {
  if (connected2MySQL) {
    connection.end();
    connected2MySQL = false;
  }
  return connected2MySQL;
}

// Querying the database
function queryingSQL(query) {

  let numberOfRecords = 0;
  (connected2MySQL) ? '' : connectToMySql();

  if (connected2MySQL) {
    connection.query(query, (error, results) => {
      if (error) {
        console.error(error);
      } else {
        messageToClient = JSON.stringify(results);
      }
    });
  }
}