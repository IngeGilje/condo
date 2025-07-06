// Start the inactivity timer
// backup: >mysqldump -u Inge -p condos > e:\backup.sql

// Import the backup:
//mysql -u [username] -p [database_name] < backup.sql
let inactivityTimer;

// Constants for database handling
let connected2MySQL =
  false;

// Test- or web server
// const serverStatus = 1; // Web server
// const serverStatus = 2; // Test web server/ local web server
// const serverStatus = 3; // Test server/ local test server
const serverStatus = 3; // Test server/ local test server

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
    server = new WebSocket.Server({ port: 5000 }, () => {
      console.log('WebSocket server is listening on port 5000');
    });
    break;
  }

  default:
    break;
}

/*
server.on('connection', (socket) => {

  console.log('Client connected');
  socket.on('message', (message) => {
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});
*/

// Connecting to mySQL
const mysql =
  require('mysql2');
let connection;
switch (serverStatus) {

  // connection to mysql
  case 1: {
    connection =
      mysql.createConnection(
        {
          host: '127.0.0.1',
          user: 'Inge',
          password: 'Sommer--2025',
          database: "condos"
        }
      );
    console.log('Connected to mySql');
    break;
  }
  // Test web server/ local web server
  case 2: {
    connection =
      mysql.createConnection(
        {
          host: '127.0.0.1',
          user: 'Inge',
          password: 'Sommer--2025',
          database: "condos"
        }
      );
    console.log('Connected to mySql');
    break;
  }
  // Test server/ local test server
  case 3: {
    connection =
      mysql.createConnection(
        {
          host: 'localhost',
          user: 'Inge',
          password: 'Vinter-2025',
          database: "condos"
        }
      );
    console.log('Connected to mySql');
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

    // JSON string into an object
    const messageFromClient =
      JSON.parse(message);

    console.log('CRUD:', messageFromClient.CRUD);
    switch (messageFromClient.CRUD) {

      case 'textFile':

        /*
        tableName: 'fileName',
      CRUD: 'textFile',
      requestId: "requestId",
      SQLquery: 
      */

        // Get text file from server
        const fs =
          require('fs');

        // 012345678901234567890
        // Name of importfile: C://inetpub//wwwroot//condo//scripts//transaksjonsliste.csv';
        let importFileName =
          messageFromClient.tableName;
        console.log('importFileName:', importFileName);
        fs.readFile(importFileName, 'utf8', (err, textFile) => {
          if (err) {
            console.error(err);
            return;
          }

          // Send a message to the client
          let messageToClient =
          {
            tableName: messageFromClient.tableName,
            CRUD: messageFromClient.CRUD,
            requestId: "requestId",
            tableArray: textFile
          };

          // Converts a JavaScript value to a JavaScript Object Notation (JSON) string
          messageToClient =
            JSON.stringify(messageToClient);
          console.log('Message to the client:', messageToClient);

          // Send message to client
          socket.send(messageToClient);

        });
        break;
      case 'SELECT':
      case 'UPDATE':
      case 'INSERT':

        // Send a request to mysql
        (connected2MySQL) ? '' : connectToMySql();

        if (connected2MySQL) {
          connection.query(messageFromClient.SQLquery, (error, messageFromMySql) => {
            if (error) {

              console.error(error);
              console.log('error:', error);
            } else {

              // Send a message to the client
              let messageToClient =
              {
                tableName: messageFromClient.tableName,
                CRUD: messageFromClient.CRUD,
                requestId: "requestId",
                tableArray: messageFromMySql
              };

              // Converts a JavaScript value to a JavaScript Object Notation (JSON) string
              messageToClient =
                JSON.stringify(messageToClient);

              // Send message to client
              socket.send(messageToClient);
            }
          });
        }
        break;
    }
  });

  socket.on('close', () => {
    console.log('Client disconnected');
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