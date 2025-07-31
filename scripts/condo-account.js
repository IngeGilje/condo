// maintenance of accounts

// Activate classes
const objUser = new User('user');
const objAccount = new Account('account');

//testMode();

// Exit application if no activity for 10 minutes
resetInactivityTimer();

let isEventsCreated

objAccount.menu();
objAccount.markSelectedMenu('Kontonavn');

let socket;
socket = connectingToServer();

// Validate user/password
const objUserPassword =
  JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo/condo-login.html';
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
  };

  // Handle incoming messages from server
  socket.onmessage = (event) => {

    let messageFromServer =
      event.data;

    // Converts a JavaScript Object Notation (JSON) string into an object
    objInfo =
      JSON.parse(messageFromServer);
    console.log(typeof objInfo);

    if (objInfo.CRUD === 'SELECT') {

      switch (objInfo.tableName) {
        case 'user':

          // account table
          console.log('accountTable');

          userArray =
            objInfo.tableArray;
          break;

        case 'account':

          // account table
          console.log('accountTable');

          // array including objects with account information
          accountArray =
            objInfo.tableArray;

          // Find selected account id
          const accountId =
            objAccount.getSelectedAccountId('accountId');

          // Show leading text
          showLeadingText(accountId);

          // Show all values for account
          showValues(accountId);

          // Make events
          isEventsCreated = (isEventsCreated) ? true : createEvents();
          break;
      }
    }

    if (objInfo.CRUD === 'UPDATE' || objInfo.CRUD === 'INSERT' || objInfo.CRUD === 'DELETE') {

      switch (objInfo.tableName) {
        case 'account':

          // Sends a request to the server to get accounts one more time
          SQLquery =
            `
              SELECT * FROM account
              WHERE condominiumId = ${objUserPassword.condominiumId}
              ORDER BY accountId;
            `;
          updateMySql(SQLquery, 'account', 'SELECT');
          break;
      };
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
    if (event.target.classList.contains('button-account-save')) {

      updateAccount();
    }
  });

  // Insert account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button--account-insert')) {

      resetValues();
    }
  });

  // Delete account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-account-delete')) {
      deleteAccountRow();

      // Sends a request to the server to get all accounts
      const SQLquery = `
        SELECT * FROM account
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY accountId;
      `;
      updateMySql(SQLquery, 'account', 'SELECT');
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-account-cancel')) {

      // Sends a request to the server to get all accounts
      const SQLquery = `
        SELECT * FROM account
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY accountId;
      `;
      updateMySql(SQLquery, 'account', 'SELECT');
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

        // Client sends a request to the server
        updateMySql(SQLquery, 'account', 'UPDATE');
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
        // Client sends a request to the server
        updateMySql(SQLquery, 'account', 'INSERT');
      }


      document.querySelector('.select-account-accountId').disabled =
        false;
      document.querySelector('.button-account-delete').disabled =
        false;
      document.querySelector('.button--account-insert').disabled =
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
      updateMySql(SQLquery, 'account', 'SELECT');
    }
    // Get accounts
    SQLquery = `
      SELECT * FROM account
      WHERE condominiumId = ${objUserPassword.condominiumId}
      ORDER BY accountId;
    `;
    updateMySql(SQLquery, 'account', 'SELECT');
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
    objAccount.showButton('account-save', 'Lagre');

    // new button
    objAccount.showButton('-account-insert', 'Ny');

    // delete button
    objAccount.showButton('account-delete', 'Slett');

    // cancel button
    objAccount.showButton('account-cancel', 'Avbryt');
  }
}

// Show all values for account
function showValues(accountId) {

  // Check for valid income Id
  if (accountId >= 0) {

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
  document.querySelector('.button--account-insert').disabled =
    true;
}
