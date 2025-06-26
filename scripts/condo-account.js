// maintenance of accounts

// Activate Account class
const objUser = new User('user');
const objAccount = new Account('account');

testMode();

let isEventsCreated = false;

objAccount.menu();
objAccount.markSelectedMenu('Kontonavn');

let socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  showLoginError('account-login');
} else {

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
      const SQLquery =
        `
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

      // Account id
      const accountId =
        objAccount.getSelectedAccountId('select-account-accountId');
      showLeadingText(accountId);

      // Show all values for account
      showValues(accountId);

      // Make events
      if (!isEventsCreated) {
        createEvents();
        isEventsCreated = true;
      }
    }

    // No rows were effected
    if (message.includes('"fieldCount":0')) {

      // Query didn't return any fields
      console.log('fieldCount');
    }

    // Check for update, delete ....
    if (message.includes('"affectedRows"')) {

      // One row was affected by the query
      console.log('affectedRows');

      // Sends a request to the server to get all accounts
      const SQLquery =
        `
          SELECT * FROM account
          ORDER BY accountId;
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
}

// Make events for accounts
function createEvents() {

  // Select Account
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-account-accountId')) {
      const accountId =
        Number(document.querySelector('.select-account-accountId').value);
      if (accountId) {
        showValues(accountId);
      }
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-account-update')) {

      updateAccount();
    }
  });

  // New account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-account-new')) {

      resetValues();
    }
  });

  // Delete account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-account-delete')) {
      deleteAccountRow();

      // Sends a request to the server to get all accounts
      //objAccount.getAccounts(socket);
      const SQLquery = `
        SELECT * FROM account
        ORDER BY accountId;
      `;
      socket.send(SQLquery);
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-account-cancel')) {

      // Sends a request to the server to get all accounts
      //objAccount.getAccounts(socket);
      const SQLquery = `
        SELECT * FROM account
        ORDER BY accountId;
      `;
      socket.send(SQLquery);
    }
  });
}

function updateAccount() {

  let SQLquery = "";

  if (validateValues()) {

    // Account number
    const accountId =
      Number(document.querySelector('.select-account-accountId').value);

    // Account Name
    const accountName = document.querySelector('.input-account-accountName').value;

    if (accountId >= 0) {

      const now =
        new Date();
      const lastUpdate =
        now.toISOString();

      const objAccountRowNumber =
        accountArray.findIndex(account => account.accountId === accountId);

      // Check if account number exist
      if (objAccountRowNumber !== -1) {

        // Update table
        SQLquery = `
          UPDATE account
          SET 
            user = '${objUserPassword.email}',
            lastUpdate = '${lastUpdate}',
            name = '${accountName}'
          WHERE accountId = ${accountId};
        `;
      } else {

        // Insert new record
        SQLquery = `
        INSERT INTO account (
          tableName,
          condominiumId,
          user,
          lastUpdate,
          name
        ) 
        VALUES (
          'account',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          '${accountName}'
        );
      `;
      }

      // Client sends a request to the server
      socket.send(SQLquery);

      document.querySelector('.select-account-accountId').disabled =
        false;
      document.querySelector('.button-account-delete').disabled =
        false;
      document.querySelector('.button-account-new').disabled =
        false;
    }
  }
}

function deleteAccountRow() {

  let SQLquery = "";

  // Check for valid account number
  const accountId =
    Number(document.querySelector('.select-account-accountId').value);
  const accountName =
    document.querySelector('.input-account-accountName').value;

  if (accountId !== 1) {

    // Check if account number exist
    const objAccountRowNumber =
      accountArray.findIndex(account => account.accountId === accountId);
    if (objAccountRowNumber !== -1) {

      // Delete table
      SQLquery = `
        DELETE FROM account
        WHERE accountId = ${accountId};
      `;
      // Client sends a request to the server
      socket.send(SQLquery);
    }
    // Get accounts
    //objAccount.getAccounts(socket);
    SQLquery = `
      SELECT * FROM account
      ORDER BY accountId;
    `;
    socket.send(SQLquery);
  }
}

// Show leading text for account
function showLeadingText(accountId) {

  // Show all accounts
  objAccount.showAllAccounts('account-accountId', accountId);

  // account name
  objAccount.showInput('account-accountName', '* Kontonavn', 50, '');

  // update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objAccount.showButton('account-update', 'Oppdater');

    // new button
    objAccount.showButton('account-new', 'Ny');

    // delete button
    objAccount.showButton('account-delete', 'Slett');

    // cancel button
    objAccount.showButton('account-cancel', 'Avbryt');
  }
}

// Show all values for account
function showValues(accountId) {

  // Check for valid income Id
  if (accountId > 1) {

    // find object number for selected account 
    const objAccountRowNumber =
      accountArray.findIndex(account => account.accountId === accountId);
    if (objAccountRowNumber !== -1) {

      // account name
      document.querySelector('.input-account-accountName').value =
        accountArray[objAccountRowNumber].name;
    }
  }
}

// Check for valid values
function validateValues() {

  // Check account Name
  const accountName =
    document.querySelector('.input-account-accountName').value;
  const validName =
    objAccount.validateText(accountName, "label-account-accountName", "Kontonavn");

  return (validName) ? true : false;
}

function resetValues() {

  // account Id
  document.querySelector('.select-account-accountId').value =
    '';

  // account Name
  document.querySelector('.input-account-accountName').value =
    '';

  document.querySelector('.select-account-accountId').disabled =
    true;
  document.querySelector('.button-account-delete').disabled =
    true;
  document.querySelector('.button-account-new').disabled =
    true;
}
