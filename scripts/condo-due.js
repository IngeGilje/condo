// Due maintenance

let isEventsCreated = false;

// Activate objects
const objUser = new User('user');
const objCondo = new Condo('condo');
const objDue = new Due('due');

const objUserPassword = JSON.parse(localStorage.getItem('user'));

// Connection to a server
let socket;
switch (objUser.serverStatus) {

  // Web server
  case 1: {
    socket = new WebSocket('ws://ingegilje.no:7000');
    break;
  }
  // Test web server/ local web server
  case 2: {
    socket = new WebSocket('ws://localhost:7000');
    break;
  }
  // Test server/ local test server
  case 3: {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const hostname = window.location.hostname || 'localhost';
    socket = new WebSocket(`${protocol}://${hostname}:6050`); break;
    break;
  }
  default:
    break;
}

objDue.menu();
objDue.markSelectedMenu('Forfall');

/*
// Send a message to the server
socket.onopen = () => {

  // Sends a request to the server to get all condos
  //objCondo.getCondos(socket);
  const SQLquery = `
    SELECT * FROM condo
    ORDER BY condoName;
  `;
  socket.send(SQLquery);
};
*/
// Send a message to the server
socket.onopen = () => {

  // Sends a request to the server to get all users
  const SQLquery = `
    SELECT * FROM user
    ORDER BY userId;
  `;
  socket.send(SQLquery);
};

// Handle incoming messages from server
socket.onmessage = (event) => {

  let message = event.data;

  // Create user array including objets
  if (message.includes('"tableName":"user"')) {

    console.log('userTable');

    // user array including objects with user information
    userArray = JSON.parse(message);

    // Check user/password
    (objUser.validateUser(objUserPassword.email, objUserPassword.password)) ? '' : window.location.href('http://localhost/condo-login.html');

    // username and password is ok
    // Sends a request to the server to get all condos
    const SQLquery = `
      SELECT * FROM condo
      ORDER BY condoName;
    `;
    socket.send(SQLquery);
  }

  // Create condo array including objets
  if (message.includes('"tableName":"condo"')) {

    console.log('CondoTable');
    // condo table

    // array including objects with condo information
    condoArray = JSON.parse(message);

    // Sends a request to the server to get all due
    //objDue.getDues(socket);
    const SQLquery = `
      SELECT * FROM due
      ORDER BY date;
    `;
    socket.send(SQLquery);
  }

  // Create  due array including objets
  if (message.includes('"tableName":"due"')) {

    // due table
    console.log('dueTable');

    // array including objects with due information
    dueArray = JSON.parse(message);

    const dueId = objDue.getSelectedDueId('dueId');

    // Show all leading text
    showLeadingText(dueId);

    // Show all values
    showValues(dueId);

    // Show due
    const condoId = Number(document.querySelector('.select-due-condoId').value);

    // Make events
    if (!isEventsCreated) {

      createEvents();
      isEventsCreated = true;
    }
  }

  // Check for update, delete ...
  if (message.includes('"affectedRows":1')) {

    console.log('affectedRows');
  }
};

// Handle errors
socket.onerror = (error) => {

  // Close socket on error and let onclose handle reconnection
  socket.close();
}

// Handle disconnection
socket.onclose = () => {
}

// Make due events
function createEvents() {

  // Selected due Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-due-dueId')) {

      dueId = Number(event.target.value);
      showLeadingText(dueId);
      showValues(dueId);
    }
  });

  // Selected condo id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-due-condoId')) {
    }
  });

  // Update due
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-due-update')) {

      const dueId = Number(document.querySelector('.select-due-dueId').value);
      if (updateDueRow(dueId)) {

        // Sends a request to the server to get all due
        //objDue.getDues(socket);
        const SQLquery = `
          SELECT * FROM due
          ORDER BY date;
        `;
        socket.send(SQLquery);
      }
    }
  });

  // new umontly amount
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-due-new')) {

      resetValues();
    }
  });

  // Delete due
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-due-delete')) {

      const dueId = document.querySelector('.select-due-dueId');
      deleteDueRow(dueId);

      // Sends a request to the server to get all due
      //objDue.getDues(socket);
      const SQLquery = `
        SELECT * FROM due
        ORDER BY date;
      `;
      socket.send(SQLquery);
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-due-cancel')) {

      // Sends a request to the server to get all due
      //objDue.getDues(socket);
      const SQLquery = `
        SELECT * FROM due
        ORDER BY date;
      `;
      socket.send(SQLquery);
    }
  });
}

function updateDueRow(dueId) {

  let SQLquery = '';
  let isUpdated = false;

  // Check for valid values
  if (validateValues(dueId)) {

    // Valid values

    const now = new Date();
    const lastUpdate = now.toISOString();

    const condoId =
      Number(document.querySelector('.select-due-condoId').value);

    const date =
      formatNorDateToNumber(document.querySelector('.input-due-date').value);

    const amount =
      formatAmountToOre(document.querySelector('.input-due-amount').value);

    const text =
      document.querySelector('.input-due-text').value;

    let SQLquery = "";

    // Check if due Id exist
    const objectNumberDue = dueArray.findIndex(due => due.dueId === dueId);
    if (objectNumberDue >= 0) {

      SQLquery = `
        UPDATE due
        SET 
          user = '${objUserPassword.email}',
          lastUpdate = '${lastUpdate}',
          condoId = ${condoId},
          amount = '${amount}',
          date = '${date}',
          text = '${text}'
        WHERE dueId = ${dueId};
      `;

    } else {

      SQLquery = `
        INSERT INTO due (
          tableName,
          condominiumId,
          user,
          lastUpdate,
          condoId,
          amount,
          date,
          text)
        VALUES(
          'due',
          '${objUserPassword.email}',
          '${lastUpdate}',
          ${condoId},
          '${amount}',
          '${date}',
          '${text}'
        );
      `;

    }
    socket.send(SQLquery);

    // Sends a request to the server to get all dues
    //objDue.getDues(socket);
    SQLquery = `
      SELECT * FROM due
      ORDER BY date;
    `;
    socket.send(SQLquery);

    document.querySelector('.select-due-dueId').disabled =
      false;
    document.querySelector('.button-due-delete').disabled =
      false;
    document.querySelector('.button-due-new').disabled =
      false;
    //document.querySelector('.button-due-cancel').disabled =
    //  false;
    isUpdated = true;
  }
  return isUpdated;
}

function deleteDueRow(dueId) {

  let SQLquery = '';
  let isUpdated = false;

  // Check for valid due Id
  if (dueId > 0) {

    SQLquery = `
      DELETE FROM due 
      WHERE dueId = ${dueId};
    `;
    socket.send(SQLquery);

    // Show updated dues
    //objDue.getDues(socket);
    const SQLquery = `
      SELECT * FROM due
      ORDER BY date;
    `;
    socket.send(SQLquery);
  }
}

// Show all leading text for due
function showLeadingText(dueId) {

  // Show all dues
  objDue.showAllDues('due-dueId', dueId);

  // Show all condos
  const condoId = condoArray.at(-1).condoId;
  objCondo.showAllCondos('due-condoId', condoId);

  // Show amount
  objDue.showInput('due-date', '* Dato', 10, '');

  // Show amount
  objDue.showInput('due-amount', '* Beløp', 10, '');

  // Show text
  objDue.showInput('due-text', '* Tekst', 255, '');

  // show update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objDue.showButton('due-update', 'Oppdater');

    // show new button
    objDue.showButton('due-new', 'Ny');

    // show delete button
    objDue.showButton('due-delete', 'Slett');

    // show cancel button
    objDue.showButton('due-cancel', 'Avbryt');
  }
}

// Check for valid values
function validateValues(dueId) {

  // Check for valid condo Id
  const condoId =
    document.querySelector('.select-due-condoId').value;
  const validCondoId =
    checkNumber(condoId, 1, 99999, 'due-condoId', 'Leilighet');

  // Check for valid date
  const date =
    document.querySelector('.input-due-date').value;
  const validDate =
    checkNorDate(date, 'due-date', 'Dato');

  // Check amount
  const amount =
    formatToNorAmount(document.querySelector('.input-due-amount').value);
  const validAmount =
    checkAmount(amount, "due-amount", "Månedsbetaling");

  // Check text
  const text =
    document.querySelector('.input-due-text').value;
  const validText =
    objDue.validateText(text, "label-due-text", "Tekst");

  return (validCondoId && validDate && validAmount && validText) ? true : false;
}

function findDueId(condoId, amount, date) {

  let dueId = 0
  dueArray.forEach((due) => {
    due.due = formatFromOreToKroner(due.due);
    if (due.dueId > 1
      && due.due === amount
      && due.date === date
      && due.condoId === condoId) {

      dueId = due.dueId;
    }
  });

  return dueId;
}

// Show values for due
function showValues(dueId) {

  // Check for valid due Id
  if (dueId > 1) {

    // Check if due Id exist
    const objectNumberDue = dueArray.findIndex(due => due.dueId === dueId);
    if (objectNumberDue >= 0) {

      // Show due id
      document.querySelector('.select-due-dueId').value =
        dueArray[objectNumberDue].dueId;

      // Show condo
      const condoId =
        dueArray[objectNumberDue].condoId;
      objDue.selectCondoId(condoId, 'due-condoId');

      // Show due date
      const dueDate = convertToEurDateFormat(dueArray[objectNumberDue].date);
      document.querySelector('.input-due-date').value =
        dueDate;

      // Show amount
      document.querySelector('.input-due-amount').value =
        formatFromOreToKroner(dueArray[objectNumberDue].amount);

      // Show text
      document.querySelector('.input-due-text').value =
        dueArray[objectNumberDue].text;
    }
  }
}

function resetValues() {

  // Show dueid
  document.querySelector('.select-due-dueId').value =
    0;

  // Show condo
  document.querySelector('.select-due-condoId').value =
    0;

  // Show date
  document.querySelector('.input-due-date').value =
    '';

  // Show amount
  document.querySelector('.input-due-amount').value =
    '';

  // Show text
  document.querySelector('.input-due-text').value =
    '';

  document.querySelector('.select-due-dueId').disabled =
    true;
  document.querySelector('.button-due-delete').disabled =
    true;
  document.querySelector('.button-due-new').disabled =
    true;
  //document.querySelector('.button-due-cancel').disabled =
  //  true;
}

/*
DROP TABLE due; 
CREATE TABLE due (
  dueId INT AUTO_INCREMENT PRIMARY KEY,
  tableName VARCHAR(50) NOT NULL,
  condominiumId INT,
  user VARCHAR (50),
  lastUpdate VarChar (40),
  condoId INT,
  amount VARCHAR(10) NOT NULL,
  date VARCHAR(10) NOT NULL,
  text VARCHAR (255) NOT NULL,
  FOREIGN KEY (condominiumId) REFERENCES bankaccount(bankAccountId)
);
INSERT INTO due (
  tableName,
  condominiumId,
  user,
  lastUpdate,
  condoId,
  amount,
  date,
  text)
VALUES (
  'due',
  1,
  'Initiation',
  '2099-12-31T23:59:59.596Z',
  0,
  '',
  '',
  ''
);
*/