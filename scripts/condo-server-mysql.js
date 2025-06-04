// Start the inactivity timer
// backup: >mysqldump -u Inge -p condos > e:\backup.sql

// Import the backup:
//mysql -u [username] -p [database_name] < backup.sql
let inactivityTimer;
//resetTimer();

/*
// Reset timer on any user interaction
process.stdin.on("data", resetTimer);

// Reset timer on any user interaction
process.stdin.on("data", resetTimer);
*/
// Test- or web server
// const serverStatus = 1; // Web server
// const serverStatus = 2; // Test web server/ local web server
// const serverStatus = 3; // Test server/ local test server
const serverStatus = 3; // Test server/ local test server

/*
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 7000 }, () => {
  console.log('WebSocket server is listening on port 7000');
});
*/

let WebSocket;
let server;

switch (serverStatus) {

  // Web server
  case 1: {
    WebSocket = require('ws');
    server = new WebSocket.Server({ port: 7000 }, () => {
      console.log('WebSocket server is listening on port 7000');
    }); break;
  }

  // Test web server/ local web server
  case 2: {
    WebSocket = require('ws');
    server = new WebSocket.Server({ port: 7000 }, () => {
      console.log('WebSocket server is listening on port 7000');
    }); socket = new WebSocket('ws://localhost:7000');
    break;
  }

  // Test server/ local test server
  case 3: {
    WebSocket = require('ws');
    server = new WebSocket.Server({ port: 6050 }, () => {
      console.log('WebSocket server is listening on port 6050');
    });
    break;
  }

  default:
    break;
}

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

    //console.log(sqlQuery);
    if (!messageFromClient.includes('Message: Test request')) {

      // SQL querying
      queryingSQL(messageFromClient);

      // Send a message to the client
      setTimeout(() => {
        if (messageToClient) {
          socket.send(messageToClient);
        }
      }, 100);
    }

    if (messageFromClient.includes('Message: Test request')) {

      let messageToClient;

      // Get text file from server
      const fs = require('fs');

      fs.readFile('transaksjonsliste.csv', 'utf8', (err, messageToClient) => {
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

/*
// Close the application after 1 hour with no user activity
function resetTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {

      // Close the application
      process.exit(); 
  }, 10 * 60 * 60 * 1000); // 10 hours
}
*/