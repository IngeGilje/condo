// Budget maintenance

// Activate objects
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objBudget = new Budget('budget');

let isEventsCreated = false;

testMode();

objBudget.menu();
objBudget.markSelectedMenu('Budsjett');

let socket;
socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  showLoginError('bankaccount-login');
} else {

  // Send a requests to the server
  socket.onopen = () => {

    // Sends a request to the server to get users
    let SQLquery =
      `
        SELECT * FROM user
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY userId;
      `;
    updateMySql(SQLquery, 'user', 'SELECT');

    // Sends a request to the server to get accounts
    SQLquery =
      `
        SELECT * FROM account
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY accountId;
      `;

    updateMySql(SQLquery, 'account', 'SELECT');

    // Sends a request to the server to get budgets
    SQLquery =
      `
        SELECT * FROM budget
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY budgetId;
      `;

    updateMySql(SQLquery, 'budget', 'SELECT');
  };

  // Handle incoming messages from server
  socket.onmessage = (event) => {

    let messageFromServer =
      event.data;
    console.log('Incoming message from server:', messageFromServer);

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
          break;

        case 'account':

          // account table
          console.log('accountTable');

          accountArray =
            objInfo.tableArray;
          break;

        case 'budget':

          // budget table
          console.log('budgetTable');

          // array including objects with budget information
          budgetArray =
            objInfo.tableArray;

          // Find selected budget id
          const budgetId =
            objBudget.getSelectedBudgetId('select-budget-budgetId');

          showLeadingText(budgetId);

          showValues(budgetId);

          // Make events
          if (!isEventsCreated) {

            createEvents();
            isEventsCreated = true;
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
              ORDER BY budgetId;
            `;
          updateMySql(SQLquery, 'budget', 'SELECT');
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
  /*
  // Send a message to the server
  socket.onopen = () => {

    // Sends a request to the server to get all users
    const SQLquery = `
    SELECT * FROM user
    WHERE condominiumId = ${objUserPassword.condominiumId}
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
      const SQLquery =
        `
          SELECT * FROM account
          WHERE condominiumId = ${objUserPassword.condominiumId}
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
      const SQLquery =
        `
          SELECT * FROM budget
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY budgetId;
        `;
      socket.send(SQLquery);
    }

    // Create budget array including objets
    if (message.includes('"tableName":"budget"')) {

      // budget table

      // array including objects with budget information
      budgetArray = JSON.parse(message);

      const budgetId =
        objBudget.getSelectedBudgetId('select-budget-budgetId');

      showLeadingText(budgetId);
      showValues(budgetId);

      // Make events
      if (!isEventsCreated) {

        createEvents();
        isEventsCreated = true;
      }
    }

    // Check for update, delete ...
    if (message.includes('"affectedRows"')) {

      console.log('affectedRows');

      // Sends a request to the server to get all budgets
      const SQLquery =
        `
          SELECT * FROM budget
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY budgetId;
        `;
      socket.send(SQLquery);
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
  */
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
    if (event.target.classList.contains('button-budget-update')) {

      const budgetId =
        Number(document.querySelector('.select-budget-budgetId').value);
      updateBudgetRow(budgetId);
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
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY budgetId;
      `;
      updateMySql(SQLquery, 'budget', 'SELECT');
    };
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-budget-cancel')) {

      const SQLquery = `
        SELECT * FROM budget
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY budgetId;
      `;
      updateMySql(SQLquery, 'budget', 'SELECT');
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
    const now =
      new Date();
    const lastUpdate =
      now.toISOString();

    const text =
      document.querySelector('.input-budget-text').value;

    // Check if budget exist
    const objBudgetRowNumber =
      budgetArray.findIndex(budget => budget.budgetId === budgetId);
    if (objBudgetRowNumber !== -1) {

      // Update budget table
      SQLquery =
        `
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
      updateMySql(SQLquery, 'budget', 'UPDATE');

    } else {

      SQLquery =
        `
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
      updateMySql(SQLquery, 'budget', 'INSERT');

      document.querySelector('.select-budget-budgetId').disabled =
        false;
      document.querySelector('.button-budget-delete').disabled =
        false;
      document.querySelector('.button-budget-new').disabled =
        false;
    }
  }
}

// Show leading text for budget
function showLeadingText(budgetId) {

  // Show all budgets
  objBudget.showAllBudgets('budgetId', budgetId);

  // Show all accounts
  const accountId =
    accountArray.at(-1).accountId;
  objAccount.showAllAccounts('budget-accountId', accountId);

  // Show years
  const year =
    today.getFullYear();
  objBudget.selectNumber('budget-year', 2020, 2030, year, 'År');

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

  // find object number for selected budget 
  const objBudgetRowNumber =
    budgetArray.findIndex(budget => budget.budgetId === budgetId);
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

    // budget text
    document.querySelector('.input-budget-text').value =
      budgetArray[objBudgetRowNumber].text;
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
    const objBudgetRowNumber =
      budgetArray.findIndex(budget => budget.budgetId === budgetId);
    if (objBudgetRowNumber !== -1) {

      // Delete table
      SQLquery =
        `
          DELETE FROM budget
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

  // Check budget text
  const text =
    document.querySelector('.input-budget-text').value;
  const validText =
    objBudget.validateText(text, "label-budget-text", "Tekst");

  return (validAmount && validText && validAccountId && validYear) ? true : false;
}