// Budget maintenance

// Activate objects
const today =
  new Date();
const objUser =
  new User('user');
const objAccount =
  new Account('account');
const objBudget =
  new Budget('budget');

let userArrayCreated =
  false;
let accountArrayCreated =
  false;
let budgetArrayCreated =
  false;

let isEventsCreated

//testMode();

// Exit application if no activity for 10 minutes
resetInactivityTimer();

objBudget.menu();
objBudget.markSelectedMenu('Budsjett');

let socket;
socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo-login.html';
} else {

  // Send a requests to the server
  socket.onopen = () => {

    // Sends a request to the server to get users
    let SQLquery =
      `
        SELECT * FROM user
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND delete <> 'Y'
        ORDER BY userId;
      `;
    updateMySql(SQLquery, 'user', 'SELECT');
    userArrayCreated =
      false;

    // Sends a request to the server to get accounts
    SQLquery =
      `
        SELECT * FROM account
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND delete <> 'Y'
        ORDER BY accountId;
      `;

    updateMySql(SQLquery, 'account', 'SELECT');
    accountArrayCreated =
      false;

    // Sends a request to the server to get budgets
    SQLquery =
      `
        SELECT * FROM budget
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND delete <> 'Y'
        ORDER BY budgetId;
      `;

    updateMySql(SQLquery, 'budget', 'SELECT');
    budgetArrayCreated =
      false;
  };

  // Handle incoming messages from server
  socket.onmessage = (event) => {

    let messageFromServer =
      event.data;

    //Converts a JavaScript Object Notation (JSON) string into an object
    objInfo =
      JSON.parse(messageFromServer);

    if (objInfo.CRUD === 'SELECT') {
      switch (objInfo.tableName) {
        case 'user':

          // condo table
          console.log('userTable');

          userArray =
            objInfo.tableArray;
          userArrayCreated =
            true;
          break;

        case 'account':

          // account table
          console.log('accountTable');

          accountArray =
            objInfo.tableArray;
          accountArrayCreated =
            true;
          break;

        case 'budget':

          // budget table
          console.log('budgetTable');

          // array including objects with budget information
          budgetArray =
            objInfo.tableArray;
          budgetArrayCreated =
            true;

          if (userArrayCreated
            && accountArrayCreated
            && budgetArrayCreated) {

            // Find selected budget id
            const budgetId =
              objBudget.getSelectedBudgetId('select-budget-budgetId');

            showLeadingText(budgetId);

            showValues(budgetId);

            // Make events
            isEventsCreated = (isEventsCreated) ? true : createEvents();
          }
          break;
      }
    }

    if (objInfo.CRUD === 'UPDATE' || objInfo.CRUD === 'INSERT' || objInfo.CRUD === 'DELETE') {

      switch (objInfo.tableName) {
        case 'budget':

          // Sends a request to the server to get budgets one more time
          SQLquery =
            `
              SELECT * FROM budget
              WHERE condominiumId = ${objUserPassword.condominiumId}
                AND delete <> 'Y'
              ORDER BY budgetId;
            `;
          updateMySql(SQLquery, 'budget', 'SELECT');
          budgetArrayCreated =
            false;
          break;
      };
    }

    // Handle errors
    socket.onerror = (error) => {

      // Close socket on error and let onclose handle reconnection
      socket.close();
    }

    // Handle disconnection
    socket.onclose = () => {
    }
  }
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

      accountId =
        Number(event.target.value);
    };
  });

  // Update budget
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-budget-save')) {

      const budgetId =
        Number(document.querySelector('.select-budget-budgetId').value);
      updateBudgetRow(budgetId);
    };
  });

  // Insert budget
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-budget-insert')) {

      resetValues();
    };
  });

  // Delete budget
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-budget-delete')) {

      deleteBudgetRow();
      const SQLquery = `
        SELECT * FROM budget
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND delete <> 'Y'
        ORDER BY budgetId;
      `;
      updateMySql(SQLquery, 'budget', 'SELECT');
      budgetArrayCreated =
        false;
    };
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-budget-cancel')) {

      const SQLquery = `
        SELECT * FROM budget
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND delete <> 'Y'
        ORDER BY budgetId;
      `;
      updateMySql(SQLquery, 'budget', 'SELECT');
      budgetArrayCreated =
        false;
    };
  });
}

function updateBudgetRow(budgetId) {

  let SQLquery = "";

  // Check for valid values
  if (validateValues()) {

    // Valid values

    const accountId =
      Number(document.querySelector('.select-budget-accountId').value);
    const year =
      Number(document.querySelector('.select-budget-year').value);
    let amount =
      formatKronerToOre(document.querySelector('.input-budget-amount').value);
  
    const lastUpdate =
      today.toISOString();

    // Check if budget exist
    let objBudgetRowNumber = -1;
    if (budgetArray.length > 0) {

      objBudgetRowNumber =
        budgetArray.findIndex(budget => budget.budgetId === budgetId);
    }

    if (objBudgetRowNumber !== -1) {

      // Update budget table
      SQLquery =
        `
          UPDATE budget
          SET
            user = '${objUserPassword.email}', 
            lastUpdate = '${lastUpdate}',
            accountId = ${accountId},
            amount = ${amount},
            year = '${year}'
          WHERE budgetId = ${budgetId};
        `;
      updateMySql(SQLquery, 'budget', 'UPDATE');

    } else {

      SQLquery =
        `
          INSERT INTO budget (
            deleted,
            condominiumId,
            user,
            lastUpdate,
            accountId,
            amount,
            year)
          VALUES (
            'N',
            ${objUserPassword.condominiumId},
            '${objUserPassword.email}',
            '${lastUpdate}',
            ${accountId},
            ${amount},
            '${year}'
          );
        `;
      updateMySql(SQLquery, 'budget', 'INSERT');

      document.querySelector('.select-budget-budgetId').disabled =
        false;
      document.querySelector('.button-budget-delete').disabled =
        false;
      document.querySelector('.button-budget-insert').disabled =
        false;
    }
  }
}

// Show leading text for budget
function showLeadingText(budgetId) {

  // Show all budgets
  objBudget.showAllBudgets('budget-budgetId', budgetId);

  // Show all accounts
  const accountId =
    accountArray.at(-1).accountId;
  objAccount.showAllAccounts('budget-accountId', accountId, '', 'Ingen konti er valgt');

  // Show years
  const year =
    today.getFullYear();
  objBudget.selectNumber('budget-year', 2020, 2030, year, 'År');

  // amount
  objBudget.showInput('budget-amount', '* Budsjett', 10, '');

  // show update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objBudget.showButton('budget-save', 'Lagre');

    // show new button
    objBudget.showButton('budget-insert', 'Ny');

    // show delete button
    objBudget.showButton('budget-delete', 'Slett');

    // cancel button
    objBudget.showButton('budget-cancel', 'Avbryt');
  }
}

// Show values for budget
function showValues(budgetId) {

  // find object number for selected budget 
  // Check if budget exist
  let objBudgetRowNumber = -1;
  if (budgetArray.length > 0) {

    objBudgetRowNumber =
      budgetArray.findIndex(budget => budget.budgetId === budgetId);
  }

  if (objBudgetRowNumber !== -1) {

    // Select budget
    const budgetId =
      budgetArray[objBudgetRowNumber].budgetId;
    objBudget.selectBudgetId(budgetId, 'budget-budgetId');

    // Select account
    const accountId =
      budgetArray[objBudgetRowNumber].accountId;
    objAccount.selectAccountId(accountId, 'budget-accountId');

    // Show select year
    document.querySelector('.select-budget-year').value =
      budgetArray[objBudgetRowNumber].year;

    // Show amount
    document.querySelector('.input-budget-amount').value =
      formatOreToKroner(budgetArray[objBudgetRowNumber].amount);
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

  // amount
  document.querySelector('.input-budget-amount').value =
    '';

  document.querySelector('.select-budget-budgetId').disabled =
    true;
  document.querySelector('.button-budget-delete').disabled =
    true;
  document.querySelector('.button-budget-insert').disabled =
    true;
  //document.querySelector('.button-budget-cancel').disabled =
  //  true;
}

function deleteBudgetRow() {

  let SQLquery = "";

  // Check for valid budget Id
  const budgetId = Number(document.querySelector('.select-budget-budgetId').value);
  if (budgetId >= 0) {

    // Check if budget id exist
    let objBudgetRowNumber = -1;
    if (budgetArray.length > 0) {

      objBudgetRowNumber =
        budgetArray.findIndex(budget => budget.budgetId === budgetId);
    }
    if (objBudgetRowNumber !== -1) {

      // current date
      const lastUpdate =
        today.toISOString();

      // Delete table
      SQLquery =
        `
          UPDATE budget
            SET 
              deleted = 'Y',
              user = '${objUserPassword.email}',
              lastUpdate = '${lastUpdate}',
            WHERE budgetId = ${budgetId};
        `;
    }
    // Client sends a request to the server
    updateMySql(SQLquery, 'budget', 'DELETE');
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
  //document.querySelector('.input-budget-amount').value =
  //  formatKronerToOre(amount);
  const validAmount =
    objBudget.validateAmount(amount, "budget-amount", "Budsjett");

  return (validAmount && validAccountId && validYear) ? true : false;
}