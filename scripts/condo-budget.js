// Budget maintenance

// Activate objects
const objUser = new User('user');
const objBudget = new Budget('budget');
const objAccount = new Account('account');

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

objBudget.menu();
objBudget.markSelectedMenu('Budsjett');

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

    // Sends a request to the server to get all accounts
    const SQLquery = `
      SELECT * FROM account
      ORDER BY accountId;
    `;
    socket.send(SQLquery);
  }

  // Create account array including objets
  if (message.includes('"tableName":"account"')) {

    console.log('accountTable');
    // account table

    // array including objects with account information
    accountArray = JSON.parse(message);

    // Sends a request to the server to get all budgets
    //objBudget.getBudgets(socket);
    const SQLquery = `
      SELECT * FROM budget
      ORDER BY text;
    `;
    socket.send(SQLquery);
  }

  // Create budget array including objets
  if (message.includes('"tableName":"budget"')) {

    // budget table

    // array including objects with budget information
    budgetArray = JSON.parse(message);

    const budgetId = objBudget.getSelectedBudgetId('budgetId');
    showLeadingText(budgetId);
    showValues(budgetId);

    // Make events
    if (!isEventsCreated) {

      createEvents();
      isEventsCreated = true;
    }
  }

  // Check for update, delete ...
  if (message.includes('"affectedRows":1')) {

    console.log('affectedRows');

    // Sends a request to the server to get all budgets
    //objBudget.getBudgets(socket);
    const SQLquery = `
      SELECT * FROM budget
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

// Make budget events
function createEvents() {

  // Select budget
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-budget-budgetId')) {

      showValues(Number(event.target.value));
    };
  });

  // Select account number
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-budget-accountId')) {

      accountId = Number(event.target.value);
    };
  });

  // Update budget
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-budget-update')) {

      /*
      let budgetId = Number(document.querySelector('.select-budget-budgetId').value);
      budgetId = (budgetId !== 0) ? budgetId : budgetArray.at(-1).budgetId;
      updateBudget(budgetId);
      showValues(budgetId);
      */

      //const budgetId = Number(document.querySelector('.select-budget-budgetId').value);
      //if (updateBudgetRow(budgetId)) {
      //  showValues(budgetId);
      //}
    };
  });

  // New budget
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-budget-new')) {

      resetValues();
    };
  });

  // Delete budget
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-budget-delete')) {

      deleteBudgetRow();
      const SQLquery = `
        SELECT * FROM budget
        ORDER BY text;
      `;
      socket.send(SQLquery);
    };
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-budget-cancel')) {

      const SQLquery = `
        SELECT * FROM budget
        ORDER BY text;
      `;
      socket.send(SQLquery);
    };
  });
}

function updateBudgetRow(budgetId) {

  let SQLquery = "";
  let isUpdated = false;

  // Check for valid values
  if (validateValues()) {

    // Valid values

    //const budgetId =
    //  Number(document.querySelector('.select-budget-budgetId').value);
    const accountId =
      Number(document.querySelector('.select-budget-accountId').value);
    const year =
      Number(document.querySelector('.select-budget-year').value);
    let amount =
      formatAmountToOre(document.querySelector('.input-budget-amount').value);

    const now = new Date();
    const lastUpdate = now.toISOString();

    const text = document.querySelector('.input-budget-text').value;

    // Check if budget exist
    const objectNumberBudget = budgetArray.findIndex(budget => budget.budgetId === budgetId);
    if (objectNumberBudget > 0) {

      // Update budget table
      SQLquery = `
        UPDATE budget
        SET
          user = '${objUserPassword.email}', 
          lastUpdate = '${lastUpdate}',
          accountId = ${accountId},
          amount = '${amount}',
          year = '${year}',
          text = '${text}'
        WHERE budgetId = ${budgetId};
      `;

      // Client sends a request to the server for update
      socket.send(SQLquery);

    } else {

      SQLquery = `
        INSERT INTO budget (
          tableName,
          condominiumId,
          user,
          lastUpdate,
          accountId,
          amount,
          year,
          text)
        VALUES (
          'budget',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          ${accountId},
          '${amount}',
          '${year}', 
          '${text}'
        );
      `;

      // Client sends a request to the server
      socket.send(SQLquery);

      document.querySelector('.select-budget-budgetId').disabled =
        false;
      document.querySelector('.button-budget-delete').disabled =
        false;
      document.querySelector('.button-budget-new').disabled =
        false;
      //document.querySelector('.button-budget-cancel').disabled =
      //  false;
      isUpdated = true;
    }
  }
  return isUpdated;
}

// Show leading text for budget
function showLeadingText(budgetId) {

  // Show all budgets
  objBudget.showAllBudgets('budgetId', budgetId);

  // Show all accounts
  const accountId = accountArray.at(-1).accountId;
  objAccount.showAllAccounts('budget-accountId', accountId);

  // Show years
  objBudget.selectNumber('budget-year', 2020, 2030, 'År');

  // amount
  objBudget.showInput('budget-amount', '* Budsjett', 10, '');

  // budget text
  objBudget.showInput('budget-text', '* Tekst', 255, '');

  // show update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objBudget.showButton('budget-update', 'Oppdater');

    // show new button
    objBudget.showButton('budget-new', 'Ny');

    // show delete button
    objBudget.showButton('budget-delete', 'Slett');

    // cancel button
    objBudget.showButton('budget-cancel', 'Avbryt');
  }
}

// Show values for budget
function showValues(budgetId) {

  // Check for valid budget Id
  if (budgetId > 1) {

    // Find object number in budget array
    const objectNumberBudget = budgetArray.findIndex(budget => budget.budgetId === budgetId);
    if (objectNumberBudget >= 0) {

      // Show selected budget Id
      document.querySelector('.select-budget-budgetId').value =
        budgetArray[objectNumberBudget].budgetId;

      // Show account
      // Check if account id exist
      const accountId = budgetArray[objectNumberBudget].accountId;
      objBudget.selectAccountId(accountId, 'budget-accountId')

      // Show select year
      document.querySelector('.select-budget-year').value =
        budgetArray[objectNumberBudget].year;

      // Show amount
      document.querySelector('.input-budget-amount').value =
        formatFromOreToKroner(budgetArray[objectNumberBudget].amount);

      // budget text
      document.querySelector('.input-budget-text').value =
        budgetArray[objectNumberBudget].text;
    }
  }
}

// Reset values for budget
function resetValues() {

  // selected budget Id
  document.querySelector('.select-budget-budgetId').value =
    0;

  // selected account Id
  document.querySelector('.select-budget-accountId').value =
    0;

  // selected year
  document.querySelector('.select-budget-year').value =
    0;

  // text
  document.querySelector('.input-budget-text').value =
    '';

  // amount
  document.querySelector('.input-budget-amount').value =
    '';

  document.querySelector('.select-budget-budgetId').disabled =
    true;
  document.querySelector('.button-budget-delete').disabled =
    true;
  document.querySelector('.button-budget-new').disabled =
    true;
  //document.querySelector('.button-budget-cancel').disabled =
  //  true;
}

function deleteBudgetRow() {

  let SQLquery = "";

  // Check for valid budget Id
  const budgetId = Number(document.querySelector('.select-budget-budgetId').value);
  if (budgetId > 1) {

    // Check if budget id exist
    const objectNumberBudget = budgetArray.findIndex(budget => budget.budgetId === budgetId);
    if (objectNumberBudget >= 0) {

      // Delete table
      SQLquery = `
        DELETE FROM budget
        WHERE budgetId = ${budgetId};
      `;
    }
    // Client sends a request to the server
    socket.send(SQLquery);
  }
}

// Check for valid budget values
function validateValues() {

  // Check account id
  const accountId =
    document.querySelector('.select-budget-accountId').value;
  const validAccountId =
    validateNumber(accountId, 1, 99999, "budget-accountId", "Konto");

  // Check year
  const year =
    document.querySelector('.select-budget-year').value;
  const validYear =
    validateNumber(year, 2020, 2099, "budget-year", "År");

  // Check amount
  const amount =
    document.querySelector('.input-budget-amount').value;
  document.querySelector('.input-budget-amount').value =
    formatAmountToOre(amount);
  const validAmount =
    objBudget.validateAmount(amount, "budget-amount", "Budsjett");

  // Check budget text
  const text =
    document.querySelector('.input-budget-text').value;
  const validText =
    objBudget.validateText(text, "label-budget-text", "Tekst");

  return (validAmount && validText && validAccountId && validYear) ? true : false;
}

/*
DROP TABLE budget;
CREATE TABLE budget (
  budgetId INT AUTO_INCREMENT PRIMARY KEY,
  tableName VARCHAR(50) NOT NULL,
  condominiumId INT,
  user VARCHAR (50),
  lastUpdate VarChar (40),
  accountId INT,
  budget VARCHAR(10) NOT NULL,
  year VARCHAR(4) NOT NULL,
  text VARCHAR (255) NOT NULL
);
INSERT INTO budget (
  tableName,
  condominiumId,
  user,
  lastUpdate,
  accountId,
  budget,
  year,
  text)
VALUES (
  'budget',
  1,
  'Initiation',
  '2099-12-31T23:59:59.596Z',
  0,
  'budget', 
  '9999',
  'text'
);
*/