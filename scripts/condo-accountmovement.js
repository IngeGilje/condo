// Account movement maintenance

// Activate objects
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objAccountMovement = new AccountMovement('accountmovement');

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
    socket = new WebSocket('ws://localhost:7000');

    break;
  }
  default:
    break;
}

let isEventsCreated = false;

objAccountMovement.menu();
objAccountMovement.markSelectedMenu('Kontobevegelser');

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
    (objUser.validateUser(objUserPassword.email, objUserPassword.password))
      ? ''
      : window.location.href('file:///C:/inetpub/wwwroot/condo-login.html');

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

    // array including objects with bank Account information
    condoArray = JSON.parse(message);

    //objBankAccount.getBankAccounts(socket);
    const SQLquery = `
      SELECT * FROM bankaccount
      ORDER BY name;
    `;
    socket.send(SQLquery);
  }

  // Create bank account array including objets
  if (message.includes('"tableName":"bankaccount"')) {

    console.log('bankAccountTable');

    // array including objects with bank account information
    bankAccountArray = JSON.parse(message);

    //objAccount.getAccounts(socket);
    const SQLquery = `
      SELECT * FROM account
      ORDER BY accountId;
    `;
    socket.send(SQLquery);
  }

  // Create account array including objets
  if (message.includes('"tableName":"account"')) {

    console.log('accountTable');
    // accountmovement table

    // array including objects with accountmovement information
    accountArray = JSON.parse(message);

    //objAccountMovement.getAccountMovements(socket);
    const SQLquery = `
      SELECT * FROM accountmovement
      ORDER BY text;
    `;
    socket.send(SQLquery);
  }

  // Create accountmovement array including objets
  if (message.includes('"tableName":"accountmovement"')) {

    // accountmovement table
    console.log('accountmovementTable');

    // array including objects with accountmovement information
    accountMovementArray = JSON.parse(message);

    // Show all leading text
    showLeadingText();

    // Make events
    if (!isEventsCreated) {

      createEvents();
      isEventsCreated = true;
    }
  }

  // Check for update, delete ...
  if (message.includes('"affectedRows":1')) {

    console.log('affectedRows');
    //objAccountMovement.getAccountMovements(socket);
    const SQLquery = `
      SELECT * FROM accountmovement
      ORDER BY text;
    `;
    socket.send(SQLquery);
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

// Make accountmovement events
function createEvents() {

  // Select condo
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-accountmovement-condoId')) {
    }
  });

  // Search for account movement
  document.addEventListener('click', (event) => {
    // Show all bank account movements
    showAccountMovements();
  });
}

// Show filter for search
function showLeadingText() {

  // Show all condos
  const condoId = condoArray.at(-1).condoId;
  objCondo.showAllCondos('accountmovement-condoId', condoId, 'Alle');

  // Show all accounts
  const accountId = accountArray.at(-1).accountId;
  objAccount.showAllAccounts('accountmovement-accountId', accountId, 'Alle');

  // Show from date
  objAccountMovement.showInput('accountmovement-fromDate', 'Fra dato', 10, 'dd.mm.åååå');
  document.querySelector('.input-accountmovement-fromDate').value =
    '01.01.2025';

  // Show to date
  objAccountMovement.showInput('accountmovement-toDate', 'Til dato', 10, 'dd.mm.åååå');
  document.querySelector('.input-accountmovement-toDate').value =
    getCurrentDate();

  // show search button
  objAccountMovement.showButton('accountmovement-search', 'Søk');
}

// Check for valid search values
function validateValues() {

  // Check account movement
  const accountId =
    document.querySelector('.select-accountmovement-accountId').value;
  const validAccountId =
    checkNumber(accountId, 1, 99999, 'Konto');

  const condoId =
    document.querySelector('.select-accountmovement-condoId').value;
  const validCondoId =
    checkNumber(condoId, 1, 99999, 'Leilighet');

  const fromDate =
    document.querySelector('.input-accountmovement-fromDate').value;
  const validFromDate =
    checkNorDate(fromDate, 'accountmovement-fromDate', 'Fra dato');

  const toDate =
    document.querySelector('.input-accountmovement-toDate').value;
  const validToDate =
    checkNorDate(toDate, 'accountmovement-toDate', 'Til dato');

  return (validAccountId && validCondoId && validFromDate && validToDate) ? true : false;
}

// Show all account movvement
function showAccountMovements() {

  // Validate search filter
  if (validateValues()) {
    // Show account movement

    // Header
    let htmlColumnAccountMovementCondo =
      '<div class="columnHeaderLeft">Leilighet</div><br>';
    let htmlColumnAccountMovementBankAccount =
      '<div class="columnHeaderLeft">Bankkonto</div><br>';
    let htmlColumnAccountMovementDate =
      '<div class="columnHeaderRight">Dato</div><br>';
    let htmlColumnAccountMovementAmount =
      '<div class="columnHeaderRight">Beløp</div><br>';

    let sumAmount = 0;

    let fromDate = document.querySelector('.input-accountmovement-fromDate').value;
    fromDate = convertDateToISOFormat(fromDate);
    let toDate = document.querySelector('.input-accountmovement-toDate').value;
    toDate = convertDateToISOFormat(toDate);

    const condoId = Number(document.querySelector('.select-accountmovement-condoId').value);
    const accountId = Number(document.querySelector('.select-accountmovement-accountId').value);

    accountMovementArray.forEach((accountMovement) => {
      if (accountMovement.accountMovementId > 1) {
        if (Number(accountMovement.date) >= Number(fromDate) && Number(accountMovement.date) <= Number(toDate)) {
          if (accountMovement.condoId === condoId || condoId === 999999999) {
            if (accountMovement.accountId === accountId || accountId === 999999999) {

              // condo name
              htmlColumnAccountMovementCondo +=
                `
                  <div class="leftCell">
                `;
              const condoId = Number(accountMovement.condoId);
              const condoName = objCondo.getCondoName(condoId);

              htmlColumnAccountMovementCondo +=
                `
                    ${condoName}
                  </div>
                `;

              // bank account name
              htmlColumnAccountMovementBankAccount +=
                `
                  <div class="leftCell">
                `;
              const accountId = Number(accountMovement.accountId);
              const bankAccountName = objAccountMovement.getBankAccountName(accountId);
              htmlColumnAccountMovementBankAccount +=
                bankAccountName;
              htmlColumnAccountMovementBankAccount +=
                `
                </div>
              `;

              // date
              htmlColumnAccountMovementDate +=
                `
                <div
                  class="rightCell"
                >
              `;
              htmlColumnAccountMovementDate +=
                convertToEurDateFormat(accountMovement.date);
              htmlColumnAccountMovementDate +=
                `   
                </div>
              `;

              // amount
              htmlColumnAccountMovementAmount +=
                `
              <div
                class="rightCell"
              >
            `;
              htmlColumnAccountMovementAmount +=
                formatFromOreToKroner(accountMovement.amount);
              htmlColumnAccountMovementAmount +=
                `   
              </div>
            `;
              // accumulate amount
              sumAmount += Number(accountMovement.amount);

            }
          }
        }
      }
    });

    // Sum line

    // amount
    htmlColumnAccountMovementAmount +=
      `
    <div
      class="sumCellRight"
    >
  `;
    htmlColumnAccountMovementAmount +=
      formatFromOreToKroner(sumAmount);
    htmlColumnAccountMovementAmount +=
      `   
        </div>
      `;

    // Show condo name
    document.querySelector('.div-accountmovement-columnCondoName').innerHTML =
      htmlColumnAccountMovementCondo;

    // Show bank account name
    document.querySelector('.div-accountmovement-columnBankAccountName').innerHTML =
      htmlColumnAccountMovementBankAccount;

    // Show date
    document.querySelector('.div-accountmovement-columnDate').innerHTML =
      htmlColumnAccountMovementDate;

    // Show amounts
    document.querySelector('.div-accountmovement-columnAmount').innerHTML =
      htmlColumnAccountMovementAmount;
  }
}

/*
DROP TABLE accountmovement;
CREATE TABLE accountmovement (
  accountMovementId INT AUTO_INCREMENT PRIMARY KEY,
  tableName VARCHAR(50) NOT NULL,
  user VARCHAR (50),
  lastUpdate VarChar (40),
  condoId INT,
  accountId INT,
  amount VARCHAR(10) NOT NULL,
  date VARCHAR(10) NOT NULL,
  text VARCHAR (255) NOT NULL
);
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
  'Initiation',
  '2099-12-31T23:59:59.596Z',
  0,
  0, 
  '',
  '',
  ''
);
*/