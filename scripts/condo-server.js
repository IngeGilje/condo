// backup condo mysql DB:
// backup: >mysqldump -u Inge -p condos > e:\backup.sql
// Import the backup:
// mysql -u [username] -p [database_name] < backup.sql
let inactivityTimer;

const WebSocket =
 require('ws');
const fs =
  require('fs');

// Constants for database handling
let connected2MySQL =
  false;

// Test- or web server
// const serverStatus = 1; // Web server
// const serverStatus = 2; // Test web server/ local web server
// const serverStatus = 3; // Test server/ local test server
const serverStatus = 3
//let server;
//let wss;

// Connection to a web server
//let socket;
switch (serverStatus) {

  // Web server
  case 1: {

    //  wss =
    //  new WebSocket.Server({ port: 3000 })

    socket =
      new WebSocket.Server({ port: 3000 })
    //wss = new WebSocket.Server({ port: 3000, path: "/ws" });

    socket.on('connection', (ws) => {
      console.log('Client connected');
    });

    break;
  }
  // Test web server/ local web server
  case 2:
  // Test server/ local test server
  case 3: {

    socket =
      new WebSocket.Server({ port: 3000 })
    //wss = new WebSocket.Server({ port: 3000, path: "/ws" });

    socket.on('connection', (ws) => {
      console.log('Client connected');
    });
    break;
  }
  default:

    break;
}

// Connecting to mySQL
const mysql = require('mysql2');
let connection;
switch (serverStatus) {

  // connection to mysql
  case 1:
  // Test web server/ local web server
  case 2: {
    connection =
      mysql.createConnection(
        {
          host: '127.0.0.1',
          user: 'Inge',
          password: 'Vinter-2025',
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
          password: 'Sommer--2025',
          database: "condos"
        }
      );
    console.log('Connected to mySql');
    break;
  }
  default:
    break;
}

//server.on('connection', (socket) => {
socket.on('connection', (ws) => {

  // Connect to MySQL
  if (!connected2MySQL) {
    connectToMySql();
  }

  // Listen for messages from the client
  ws.on('message', (message) => {

    // JSON string into an object
    const messageFromClient =
      JSON.parse(message);

    console.log('messageFromClient:',messageFromClient.SQLquery);
    switch (messageFromClient.CRUD) {

      case 'textFile':

        // Get text file from server
        //const fs =
        //  require('fs');

        let importFileName =
          messageFromClient.tableName;
        console.log('messageFromClient.tableName: ', messageFromClient.tableName)
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

          // Send message to client
          console.log("Send message to client:",messageToClient)
          ws.send(messageToClient);
        });
        break;
        
      case 'SELECT':
      case 'UPDATE':
      case 'INSERT':
      case 'DROP':
      case 'CREATE':
      case 'DELETE':

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
              ws.send(messageToClient);
            }
          });
        }
        break;
    }
  });

  ws.on('close', () => {
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