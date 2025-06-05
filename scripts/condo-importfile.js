// Import of bank transaction file 

// Activate objects
const objCondo = new Condo('condo');
const objAccountMovement = new AccountMovement('accountmovement');
const objAccount = new Account('account');
const objUser = new User('user');
const objIncome = new Income('income');
const objImportFile = new ImportFile('importfile');

let importFileArray = [];
console.log('importFileArray:', importFileArray);

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

let isEventsCreated = false;

objImportFile.menu();
objImportFile.markSelectedMenu('Importer kontobevegelser');

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
  console.log('Incomming message:', message);

  // Create user array including objets
  if (message.includes('"NOK"')) {
    console.log('Dato;Rentedato;Beskrivelse;', message);
    createImportFileArray(message);
    showAccountMovement();
  }

  // Create user array including objets
  if (message.includes('"tableName":"user"')) {

    console.log('userTable');

    // user array including objects with user information
    userArray = JSON.parse(message);

    // Check user/password
    (objUser.validateUser('inge.gilje@gmail.com', '12345'))
      ? ''
      : window.location.href('http://localhost/condo/condo-login.html');

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
      SELECT * FROM accountmovement
      ORDER BY accountmovementId;
    `;
    socket.send(SQLquery);
  }

  // Create accountmovement array including objets
  if (message.includes('"tableName":"accountmovement"')) {

    // accountmovement table
    console.log('accountmovementTable');

    // array including objects with accountmovement information
    accountMovementArray = JSON.parse(message);

    // Get all income rows
    const SQLquery = `
      SELECT * FROM income
      ORDER BY date;
    `;
    socket.send(SQLquery);
  }

  // Create income array including objets
  if (message.includes('"tableName":"income"')) {

    // income table
    console.log('incomeTable');

    // array including objects with income information
    incomeArray = JSON.parse(message);

    const incomeId = objIncome.getSelectedIncomeId('income-importfileId');

    // Show all leading text
    showLeadingText(incomeId);

    // Show all values for income
    showValues(incomeId);

    // show all rows for income
    //showAccountMovement();

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
        ORDER BY date;
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

  /*
  // Select income id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-importfile-importfileId')) {

      dueId = Number(event.target.value);
      showValues(dueId);
      //showAccountMovement();
    };
  });
  */

  /*
  // Select account id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-importfile-accountId')) {
      //showAccountMovement();
    }
  });
  */

  /*
  // Select condo id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-importfile-condoId')) {
      //showAccountMovement();
    }
  });
  */

  /*
  // Update income
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-importfile-update')) {

      updateIncomeRow();
    };
  });
  */

  /*
  // New income
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-importfile-new')) {

      resetValues();
    };
  });
  */

  /*
  // Delete income
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-importfile-delete')) {

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
  */

  /*
  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-importfile-cancel')) {

      // Sends a request to the server to get all condos
      // Get all income rows
      const SQLquery = `
        SELECT * FROM income
        ORDER BY date;
      `;
      socket.send(SQLquery);
    };
  });
  */

  // Start import of bank account movement text file
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-importfile-start')) {

      // Sends a request to the server to get all bank account transaction
      socket.send('Message: Test request');
    };
  });
}

function updateIncomeRow() {

  let SQLquery = '';
  let isUpdated = false;

  // Check for valid income values
  let incomeId = Number(document.querySelector('.select-importfile-incomeId').value);
  if (validateValues(incomeId)) {

    incomeId = Number(incomeId);
    const now = new Date();
    const lastUpdate = now.toISOString();

    const condoId =
      Number(document.querySelector('.select-importfile-condoId').value);

    const accountId =
      Number(document.querySelector('.select-importfile-accountId').value);

    // Check for valid income
    let amount =
      document.querySelector('.input-importfile-amount').value;
    amount =
      formatAmountToOre(amount);

    const date =
      convertDateToISOFormat(document.querySelector('.input-importfile-date').value);

    const text =
      document.querySelector('.input-importfile-text').value;

    // Check if income exist
    const objectNumberIncome = incomeArray.findIndex(income => income.incomeId === incomeId);
    if (objectNumberIncome > 0) {

      // Find current values for income to update
      const accountmovementCondoId = incomeArray[objectNumberIncome].condoId;
      const accountmovementAccountId = incomeArray[objectNumberIncome].accountId;
      const accountmovementAmount = incomeArray[objectNumberIncome].amount;
      const accountmovementDate = incomeArray[objectNumberIncome].date;
      const accountmovementText = incomeArray[objectNumberIncome].text;

      // Update income table
      SQLquery = `
        UPDATE income
        SET 
          user = '${objUserPassword.email}',
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

      // Find accountmovement Id
      const accountMovementId = getAccountMovementId(
        accountmovementCondoId,
        accountmovementAccountId,
        accountmovementAmount,
        accountmovementDate,
        accountmovementText
      );

      if (accountMovementId >= 0) {
        // Update accountmovement
        SQLquery = `
        UPDATE accountmovement
        SET 
          condominiumId = ${objUserPassword.condominiumId},
          user = '${objUserPassword.email}',
          lastUpdate = '${lastUpdate}',
          condoId = ${condoId},
          accountId = ${accountId},
          amount = '${amount}',
          date = '${date}',
          text = '${text}'
        WHERE accountMovementId = ${accountMovementId};
      `;

        // Client sends a request to the server
        socket.send(SQLquery);
      }

    } else {

      SQLquery = `
        INSERT INTO income (
          tableName,
          condominiumId,
          user,
          lastUpdate,
          condoId,
          accountId,
          amount,
          date,
          text)
        VALUES (
          'income',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
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
          condominiumId,
          user,
          lastUpdate,
          condoId,
          accountId,
          amount,
          date,
          text)
        VALUES (
          'accountmovement',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
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

    document.querySelector('.select-importfile-incomeId').disabled =
      false;
    document.querySelector('.button-importfile-delete').disabled =
      false;
    document.querySelector('.button-importfile-new').disabled =
      false;

    isUpdated = true;
  }
  return isUpdated;
}

// Show all leading text for income
function showLeadingText(incomeId) {

  // Show all incomes
  //objIncome.showAllIncomes('income-incomeId', incomeId);

  // Show all condos
  //objCondo.showAllCondos('income-condoId', 0);

  // Show all accounts
  //const accountId = accountArray.at(-1).accountId;
  //objAccount.showAllAccounts('income-accountId', accountId);

  // Show income date
  //objIncome.showInput('income-date', '* Dato', 10, 'dd.mm.åååå');

  // Show income
  //objIncome.showInput('income-amount', '* Beløp', 10, '');

  // income text
  //objIncome.showInput('income-text', '* Tekst', 255, '');

  // show update button
  //if (Number(objUserPassword.securityLevel) >= 9) {

  //objIncome.showButton('income-update', 'Oppdater');

  // show new button
  //objIncome.showButton('income-new', 'Ny');

  // show delete button
  //objIncome.showButton('income-delete', 'Slett');

  // show cancel button
  //objIncome.showButton('income-cancel', 'Avbryt');

  // show start button
  objImportFile.showButton('importfile-start', 'Start import');
  //}
}

// Show values for income
function showValues(incomeId) {

  // Check for valid income Id
  if (incomeId > 1) {

    // Find object number in income array
    //const objectNumberIncome = incomeArray.findIndex(income => income.incomeId === incomeId);
    //if (objectNumberIncome >= 0) {

    // Show income Id
    //document.querySelector('.select-income-incomeId').value =
    //  incomeArray[objectNumberIncome].incomeId;

    // Show condo Id
    //const condoId = incomeArray[objectNumberIncome].condoId;
    //objIncome.selectCondoId(condoId, 'income-condoId');

    // Select account
    //const accountId = incomeArray[objectNumberIncome].accountId;
    //objIncome.selectAccountId(accountId, 'income-accountId');

    // show income
    //document.querySelector('.input-income-amount').value =
    //  formatFromOreToKroner(incomeArray[objectNumberIncome].amount);

    // show income date
    //let date = incomeArray[objectNumberIncome].date;
    //const formatedIncomeDate = convertToEurDateFormat(date);
    //document.querySelector('.input-income-date').value =
    //  formatedIncomeDate;

    // show income text
    //document.querySelector('.input-income-text').value =
    //  incomeArray[objectNumberIncome].text;
    //}
  }
}

function deleteIncomeRow() {

  let SQLquery = "";

  // Check for valid income Id
  const incomeId = Number(document.querySelector('.select-importfile-incomeId').value);

  // Check for valid income Id
  if (incomeId > 0) {

    // Check if income exist
    const objectNumberIncome = importFileArray.findIndex(income => income.incomeId === incomeId);
    if (objectNumberIncome >= 0) {

      // Delete table
      SQLquery = `
        DELETE FROM income
        WHERE incomeId = ${incomeId};
      `;
    }
    // Client sends a request to the server
    socket.send(SQLquery);

    // Show updated incomes
    // Get all income rows
    const SQLquery = `
      SELECT * FROM income
      ORDER BY date;
    `;
    socket.send(SQLquery);
  }
}

// Check for valid income values
function validateValues(incomeId) {

  // Check income

  // Account id
  const accountId =
    document.querySelector('.select-importfile-accountId').value;
  const validAccount =
    checkNumber(accountId, 1, 99999, 'income-accountId', 'Velg konto');

  const condoId =
    document.querySelector('.select-importfile-condoId').value;
  const validCondo =
    checkNumber(condoId, 1, 99999, 'income-condoId', 'Velg konto');

  // Check income
  const income =
    document.querySelector('.input-importfile-amount').value;
  const validIncome =
    validateAmount(income, 'income-amount', 'Beløp');

  const date =
    document.querySelector('.input-importfile-date').value;
  const validIncomeDate =
    checkNorDate(date, 'income-date', 'Dato');

  const text =
    document.querySelector('.input-importfile-text').value;
  const validIncomeText =
    objIncome.validateText(text, 'label-importfile-text', 'Tekst');

  return (validCondo && validAccount && validIncome && validIncomeDate && validIncomeText) ? true : false;
}

function resetValues() {

  document.querySelector('.input-importfile-amount').value =
    '';
  document.querySelector('.input-importfile-date').value =
    '';
  document.querySelector('.input-importfile-text').value =
    '';
  document.querySelector('.select-importfile-incomeId').value = '';

  document.querySelector('.select-importfile-incomeId').disabled =
    true;
  document.querySelector('.button-importfile-delete').disabled =
    true;
  document.querySelector('.button-importfile-new').disabled =
    true;
  //document.querySelector('.button-importfile-cancel').disabled =
  //  true;
}

function showAccountMovement() {

  let sumColumnIncome = 0;
  let sumColumnPayment = 0;

  let htmlColumnAccountingDate =
    '<div class="columnHeaderRight">Dato</div><br>';
  let htmlColumnCondoName =
    '<div class="columnHeaderRight">Condo</div><br>';
  let htmlColumnIncome =
    '<div class="columnHeaderRight">Inntekt</div><br>';
  let htmlColumnPayment =
    '<div class="columnHeaderRight">Utgift</div><br>';
  let htmlColumnText =
    '<div class="columnHeaderLeft">Tekst</div><br>';

  importFileArray.forEach((importFile) => {

    htmlColumnAccountingDate +=
      `
        <div class="rightCell">
          ${importFile.accountingDate}
        </div>
      `;

    // Condo name
    let condoName = "-";
    const objectNumberCondo = condoArray.findIndex(condo => condo.condoId === importFile.condoId);
    if (objectNumberCondo > 0) {

      condoName = condoArray[objectNumberCondo].condoName;
    }

    htmlColumnCondoName +=
      `
        <div class="rightCell">
          ${condoName}
        </div>
      `;

    const income =
      formatFromOreToKroner(importFile.income);
    htmlColumnIncome +=
      `
        <div class="rightCell">
          ${income}
        </div>
      `;

    const payment =
      formatFromOreToKroner(importFile.payment);
    htmlColumnPayment +=
      `
        <div class="rightCell">
          ${payment}
        </div>
      `;

    // Text has to fit into the column
    let text = truncateText(importFile.text, 'div-importfile-columnText');
    text = (text === "") ? "-" : text;
    htmlColumnText +=
      `
        <div
          class="leftCell"
        >
          ${text}
        </div>
      `;

    // Accomulate
    // income
    const numericIncome = Number(importFile.income.replace(",", ".")) * 100;
    sumColumnIncome += Number(numericIncome);

    // payment
    const numericPayment = Number(importFile.payment.replace(",", ".")) * 100;
    sumColumnPayment += Number(numericPayment);
  });

  // Sum row
  htmlColumnAccountingDate +=
    `
      <div>
      </div>
    `;

  const income =
    formatFromOreToKroner(sumColumnIncome);
  htmlColumnIncome +=
    `
      <div class="sumCellRight">
        ${income}
      </div>
    `;

  const payment =
    formatFromOreToKroner(sumColumnPayment);
  htmlColumnPayment +=
    `
      <div class="sumCellRight">
        ${payment}
      </div>
    `;


  htmlColumnText +=
    `
      <div>
      </div>
    `;

  // Show columns
  document.querySelector(".div-importfile-columnAccountingDate").innerHTML =
    htmlColumnAccountingDate;
  document.querySelector(".div-importfile-columnCondoName").innerHTML =
    htmlColumnCondoName;
  document.querySelector(".div-importfile-columnIncome").innerHTML =
    htmlColumnIncome;
  document.querySelector(".div-importfile-columnPayment").innerHTML =
    htmlColumnPayment;
  document.querySelector(".div-importfile-columnText").innerHTML =
    htmlColumnText;
}

// Find accountmovement Id
function getAccountMovementId(condoId, accountId, amount, date, text) {

  let accountmovementId = -1;
  accountMovementArray.forEach((accountMovement) => {
    if ((accountMovement.condoId === condoId)
      && (accountMovement.accountId === accountId)
      && (accountMovement.amount === amount)
      && (accountMovement.date === date)
      && (accountMovement.text === text)) {

      accountmovementId = accountMovement.accountMovementId;
    }
  });
  return accountmovementId;
}

// Create array for bank account movement
function createImportFileArray(fileContent) {

  console.log('importFileArray:', importFileArray)

  const textFile = fileContent.split(/\r?\n/);
  textFile.forEach((record) => {

    console.log('record:', record);
    [accountingDate, Rentedato, Beskrivelse, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, TilKonto, text] = record.split(';');

    // Check for valid date
    // validate the dd.mm.yyyy (European date format) format
    if (validateEuroDateFormat(accountingDate)) {

      // condo id
      let condoId = 0;

      // Condo name
      const objectNumberUser = userArray.findIndex(user => user.bankAccount === fromBankAccount);
      if (objectNumberUser > 0) {

        condoId = userArray[objectNumberUser].condoId;
      }

      const objbBankAccountMovement = {
        accountingDate: accountingDate,
        condoId: condoId,
        income: income,
        payment: payment,
        text: text
      };

      importFileArray.push(objbBankAccountMovement);
    }
  });
}