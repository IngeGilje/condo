// Income maintenance

const socket = new WebSocket('ws://localhost:8080');

// Activate objects
const objCondo = new Condo('condo');
const objAccount = new Account('account');
const objUser = new User('user');
const objIncome = new Income('income');

const objUserPassword = JSON.parse(localStorage.getItem('savedUser'));

let isEventsCreated = false;

menu();
objIncome.markSelectedMenu('Innbetaling');

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
    (objUser.validateUser(objUserPassword.user, objUserPassword.password)) ? '' : window.location.href('condo-login.html');

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

    console.log('condoTable');

    // array including objects with condo information
    condoArray = JSON.parse(message);

    //objAccount.getAccounts(socket);
    const SQLquery = `
      SELECT * FROM account
      ORDER BY accountId;
    `;
    socket.send(SQLquery);
  }

  // Create account array including objets
  if (message.includes('"tableName":"account"')) {

    // account table
    console.log('accountTable');

    // array including objects with account information
    accountArray = JSON.parse(message);

    // Get all income rows
    const SQLquery = `
      SELECT * FROM income
      ORDER BY text;
    `;
    socket.send(SQLquery);
  }

  // Create income array including objets
  if (message.includes('"tableName":"income"')) {

    // income table
    console.log('incomeTable');

    // array including objects with income information
    incomeArray = JSON.parse(message);

    const incomeId = objIncome.getSelectedIncomeId('incomeId');

    // Show all leading text
    showLeadingText(incomeId);

    // Show all values for income
    showValues(incomeId);

    // Make events
    if (!isEventsCreated) {

      createEvents();
      isEventsCreated = true;
    }
  }

  // Check for update, delete ...
  if (message.includes('"affectedRows":1')) {

    console.log('affectedRows');

    // Get all income rows
    const SQLquery = `
        SELECT * FROM income
        ORDER BY text;
      `;
    socket.send(SQLquery);
  }
}

// Handle errors
socket.onerror = (error) => {

  // Close socket on error and let onclose handle reconnection
  socket.close();
}

// Handle disconnection
socket.onclose = () => {
}

// Make income events
function createEvents() {

  // Select income
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-income-incomeId')) {
      const incomeId = Number(event.target.value);
      showValues(incomeId);
    }
  });

  // Select condo
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-condo-condoId')) {
    }
  });

  // Select income id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-income-incomeId')) {

      dueId = Number(event.target.value);
      showValues(dueId);
    };
  });

  // Update income
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-income-update')) {

      updateIncomeRow();
    };
  });

  // New income
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-income-new')) {

      resetValues();
    };
  });

  // Delete income
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-income-delete')) {

      deleteIncomeRow();

      // Sends a request to the server to get all condos
      // Get all income rows
      const SQLquery = `
        SELECT * FROM income
        ORDER BY text;
      `;
      socket.send(SQLquery);

    };
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-income-cancel')) {

      // Sends a request to the server to get all condos
      // Get all income rows
      const SQLquery = `
        SELECT * FROM income
        ORDER BY text;
      `;
      socket.send(SQLquery);
    };
  });
}

function updateIncomeRow() {

  let SQLquery = '';
  let isUpdated = false;

  // Check for valid income values
  let incomeId = Number(document.querySelector('.select-income-incomeId').value);
  if (validateValues(incomeId)) {

    incomeId = Number(incomeId);
    const now = new Date();
    const lastUpdate = now.toISOString();

    const condoId =
      Number(document.querySelector('.select-income-condoId').value);

    const accountId =
      Number(document.querySelector('.select-income-accountId').value);

    // Check for valid income
    let amount =
      document.querySelector('.input-income-amount').value;
    amount =
      formatAmountToOre(amount);

    const date =
      convertDateToISOFormat(document.querySelector('.input-income-date').value);

    const text =
      document.querySelector('.input-income-text').value;

    // Check if income exist
    const objectNumberIncome = incomeArray.findIndex(income => income.incomeId === incomeId);
    if (objectNumberIncome > 0) {

      // Update income table
      SQLquery = `
        UPDATE income
        SET 
          user = '${objUserPassword.user}',
          lastUpdate = '${lastUpdate}',
          condoId = ${condoId},
          accountId = ${accountId},
          amount = '${amount}',
          date = '${date}',
          text = '${text}'
        WHERE incomeId = ${incomeId};
      `;

      // Client sends a request to the server
      socket.send(SQLquery);
    } else {

      SQLquery = `
        INSERT INTO income (
          tableName,
          user,
          lastUpdate,
          condoId,
          accountId,
          amount,
          date,
          text)
        VALUES (
          'income',
          '${objUserPassword.user}',
          '${lastUpdate}',
          ${condoId},
          ${accountId},
          '${amount}',
          '${date}', 
          '${text}'
        );
      `;

      // Client sends a request to the server
      socket.send(SQLquery);
      
       SQLquery = `
        INSERT INTO accountmovement (
          tableName,
          user,
          lastUpdate,
          condoId,
          accountId,
          amount,
          date,
          text)
        VALUES (
          'accountmovement',
          '${objUserPassword.user}',
          '${lastUpdate}',
          ${condoId},
          ${accountId},
          '${amount}',
          '${date}', 
          '${text}'
        );
      `;

      // Client sends a request to the server
      socket.send(SQLquery);
    }

    document.querySelector('.select-income-incomeId').disabled =
      false;
    document.querySelector('.button-income-delete').disabled =
      false;
    document.querySelector('.button-income-new').disabled =
      false;

    isUpdated = true;
  }
  return isUpdated;
}

// Show all leading text for income
function showLeadingText(incomeId) {

  // Show all incomes
  objIncome.showAllIncomes('incomeId', incomeId);

  // Show all condos
  objCondo.showAllCondos('income-condoId', 0);

  // Show all accounts
  const accountId = accountArray.at(-1).accountId;
  objAccount.showAllAccounts('income-accountId', accountId);

  // Show income date
  objIncome.showInput('income-date', '* Dato', 10, 'dd.mm.åååå');

  // Show income
  objIncome.showInput('income-amount', '* Beløp', 10, '');

  // income text
  objIncome.showInput('income-text', '* Tekst', 255, '');

  // show update button
  objIncome.showButton('income-update', 'Oppdater');

  // show new button
  objIncome.showButton('income-new', 'Ny');

  // show delete button
  objIncome.showButton('income-delete', 'Slett');

  // show cancel button
  objIncome.showButton('income-cancel', 'Avbryt');
}

// Show values for income
function showValues(incomeId) {

  // Check for valid income Id
  if (incomeId > 1) {

    // Find object number in income array
    const objectNumberIncome = incomeArray.findIndex(income => income.incomeId === incomeId);
    if (objectNumberIncome >= 0) {

      // Show income Id
      document.querySelector('.select-income-incomeId').value =
        incomeArray[objectNumberIncome].incomeId;

      // Show condo Id
      const condoId = incomeArray[objectNumberIncome].condoId;
      objIncome.selectCondoId(condoId, 'income-condoId');

      // Select account
      const accountId = incomeArray[objectNumberIncome].accountId;
      objIncome.selectAccountId(accountId, 'income-accountId');

      // show income
      document.querySelector('.input-income-amount').value =
        formatFromOreToKroner(incomeArray[objectNumberIncome].amount);

      // show income date
      let date = incomeArray[objectNumberIncome].date;
      const formatedIncomeDate = convertToEurDateFormat(date);
      document.querySelector('.input-income-date').value =
        formatedIncomeDate;

      // show income text
      document.querySelector('.input-income-text').value =
        incomeArray[objectNumberIncome].text;
    }
  }
}

function deleteIncomeRow() {

  let SQLquery = "";

  // Check for valid income Id
  const incomeId = Number(document.querySelector('.select-income-incomeId').value);

  // Check for valid income Id
  if (incomeId > 0) {

    // Check if income exist
    const objectNumberIncome = incomeArray.findIndex(income => income.incomeId === incomeId);
    if (objectNumberIncome >= 0) {

      // Delete table
      SQLquery = `
        DELETE FROM income
        WHERE incomeId = ${incomeId};
      `;
    }
    // Client sends a request to the server
    socket.send(SQLquery);
    console.log(SQLquery);

    // Show updated incomes
    // Get all income rows
    const SQLquery = `
      SELECT * FROM income
      ORDER BY text;
    `;
    socket.send(SQLquery);
  }
}

// Check for valid income values
function validateValues(incomeId) {

  // Check income

  // Account id
  const accountId =
    document.querySelector('.select-income-accountId').value;
  const validAccount =
    checkNumber(accountId, 1, 99999, 'income-accountId', 'Velg konto');

  const condoId =
    document.querySelector('.select-income-condoId').value;
  const validCondo =
    checkNumber(condoId, 1, 99999, 'income-condoId', 'Velg konto');

  // Check income
  const income =
    document.querySelector('.input-income-amount').value;
  const validIncome =
    checkAmount(income, 'income-amount', 'Beløp');

  const date =
    document.querySelector('.input-income-date').value;
  const validIncomeDate =
    checkNorDate(date, 'income-date', 'Dato');

  const text =
    document.querySelector('.input-income-text').value;
  const validIncomeText =
    objIncome.validateText(text, 'label-income-text', 'Tekst');

  return (validCondo && validAccount && validIncome && validIncomeDate && validIncomeText) ? true : false;
}

function resetValues() {

  document.querySelector('.input-income-amount').value =
    '';
  document.querySelector('.input-income-date').value =
    '';
  document.querySelector('.input-income-text').value =
    '';
  document.querySelector('.select-income-incomeId').value = '';

  document.querySelector('.select-income-incomeId').disabled =
    true;
  document.querySelector('.button-income-delete').disabled =
    true;
  document.querySelector('.button-income-new').disabled =
    true;
  //document.querySelector('.button-income-cancel').disabled =
  //  true;
}

/*
DROP TABLE income;
CREATE TABLE income (
  incomeId INT AUTO_INCREMENT PRIMARY KEY,
  tableName VARCHAR(50) NOT NULL,
  user VARCHAR (50),
  lastUpdate VarChar (40),
  condoId INT,
  accountId INT,
  income VARCHAR(10) NOT NULL,
  date VARCHAR(10) NOT NULL,
  text VARCHAR (255) NOT NULL
);
INSERT INTO income (
  tableName,
  user,
  lastUpdate,
  condoId,
  accountId,
  amount,
  date,
  text)
VALUES (
  'income',
  'Initiation',
  '2099-12-31T23:59:59.596Z',
  0,
  0, 
  '',
  '',
  ''
);
*/