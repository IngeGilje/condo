// Maintenance of user bank account

// Activate objects
const objUser = new User('user');
const objAccount = new Account('account');
const objUserBankAccount = new UserBankAccount('userbankaccount');

testMode();

// Exit application if no activity for 10 minutes
resetInactivityTimer();


let isEventsCreated =
  false;

objUserBankAccount.menu();
objUserBankAccount.markSelectedMenu('Bankkonto for bruker');

let socket;
socket =
  connectingToServer();

// Validate user/password
const objUserPassword =
  JSON.parse(localStorage.getItem('user'));
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

    // Sends a request to the server to get user bank accounts
    SQLquery =
      `
        SELECT * FROM userbankaccount
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY userBankAccountId;
      `;
    updateMySql(SQLquery, 'userbankaccount', 'SELECT');
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

          // user table
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

        case 'userbankaccount':

          // user bank account table
          console.log('userBankAccountTable');

          // array including objects with user bank account information
          userBankAccountArray =
            objInfo.tableArray;

          // Find selected user Bank account id
          const userBankAccountId =
            objUserBankAccount.getSelectedUserBankAccountId('select-userbankaccount-userBankAccountId');

          // Show leading text
          showLeadingText(userBankAccountId);

          // Show all values for user Bank Account
          showValues(userBankAccountId);

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
        case 'userbankaccount':

          // Sends a request to the server to get user bank accounts one more time
          SQLquery =
            `
              SELECT * FROM userbankaccount
              WHERE condominiumId = ${objUserPassword.condominiumId}
              ORDER BY userbankaccountId;
            `;
          updateMySql(SQLquery, 'userbankaccount', 'SELECT');
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

    // Send a request to the server to get all user bank accounts
    const SQLquery =
      `
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

      // user table
      console.log('userTable');

      // array including objects with user information
      userArray = JSON.parse(message);

      // Send a request to the server to get all user bank accounts
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

      // account table
      console.log('accountTable');

      // array including objects with account information
      accountArray = JSON.parse(message);

      // Send a request to the server to get all user bank accounts
      const SQLquery =
        `
          SELECT * FROM userbankaccount
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY userBankAccountId;
        `;
      socket.send(SQLquery);
    }

    // Create user array including objets
    if (message.includes('"tableName":"userbankaccount"')) {

      // user bank account table
      console.log('userBankAccountTable');

      // array including objects with user information
      userBankAccountArray = JSON.parse(message);

      // Show leading texts
      let userBankAccountId =
        objUserBankAccount.getSelectedUserBankAccountId('select-userbankaccount-userBankAccountId');
      showLeadingText(userBankAccountId);

      // Show all values for all user bank accountId
      showValues(userBankAccountId);

      // Make events
      if (!isEventsCreated) {
        createEvents();
        isEventsCreated = true;
      }
    }

    // Check for update, delete ...
    if (message.includes('"affectedRows"')) {

      console.log('affectedRows');

      // Sends a request to the server to get all user bank accounts
      const SQLquery = 
        `
          SELECT * FROM userbankaccount
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY userBankAccountId;
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
    */
}

// Make events for user bank accountId
function createEvents() {

  // Select user bank accountId
  document.addEventListener('change', (event) => {

    if (event.target.classList.contains('select-userbankaccount-userBankAccountId')) {

      let userBankAccountId = Number(document.querySelector('.select-userbankaccount-userBankAccountId').value);
      userBankAccountId =
        (userBankAccountId !== 0) ? userBankAccountId : userBankAccountArray.at(-1).userBankAccountId;
      if (userBankAccountId) {
        showValues(userBankAccountId);
      }
    }
  });

  // Update bank account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-userbankaccount-update')) {

      // update user bank account
      updateUserBankAccount();
    }
  });

  // New user bank account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-userbankaccount-insert')) {

      resetValues();
    }
  });

  // Delete user bank account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-userbankaccount-delete')) {

      const userBankAccountId =
        Number(document.querySelector('.select-userbankaccount-userBankAccountId').value);
      deleteUserBankAccountRow(userBankAccountId);

      // Sends a request to the server to get all user bank account
      const SQLquery =
        `
          SELECT * FROM userbankaccount
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY userBankAccountId;
        `;
      updateMySql(SQLquery, 'userbankaccount', 'SELECT');
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-userbankaccount-cancel')) {

      // Sends a request to the server to get all user
      const SQLquery =
        `
          SELECT * FROM userbankaccount
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY userBankAccountId;
        `;
      updateMySql(SQLquery, 'userbankaccount', 'SELECT');
    }
  });
}

function updateUserBankAccount() {

  if (validateValues()) {

    // user Bank Account Id
    const userBankAccountId =
      Number(document.querySelector('.select-userbankaccount-userBankAccountId').value);

    // user id
    const userId =
      Number(document.querySelector('.select-userbankaccount-userId').value);

    // account id
    const accountId =
      Number(document.querySelector('.select-userbankaccount-accountId').value);

    // name
    const bankAccountName =
      document.querySelector('.input-userbankaccount-name').value;

    // bank account
    const bankAccount =
      document.querySelector('.input-userbankaccount-bankAccount').value;

    let SQLquery = '';
    const now = new Date();
    const lastUpdate = now.toISOString();

    const objBankAccountRowNumber =
      userBankAccountArray.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);

    // Check if user bank account exist
    if (objBankAccountRowNumber !== -1) {

      // Update table
      SQLquery =
        `
          UPDATE userBankAccount
          SET 
            user = '${objUserPassword.email}',
            lastUpdate = '${lastUpdate}',
            userId = ${userId},
            accountId = ${accountId},
            name = '${bankAccountName}',
            bankAccount = '${bankAccount}'
          WHERE userBankAccountId = ${userBankAccountId}
          ;
        `;
      updateMySql(SQLquery, 'userbankaccount', 'UPDATE');
    } else {

      // Insert new record
      SQLquery =
        `
          INSERT INTO userBankAccount (
            tableName,
            condominiumId,
            user,
            lastUpdate,
            userId,
            accountId,
            name,
            bankAccount
          ) 
          VALUES (
            'userbankaccount',
            ${objUserPassword.condominiumId},
            '${objUserPassword.email}',
            '${lastUpdate}',
            ${userId},
            ${accountId},
            '${bankAccountName}',
            '${bankAccount}'
          );
        `;
      updateMySql(SQLquery, 'userbankaccount', 'INSERT');
    }

    document.querySelector('.select-userbankaccount-userBankAccountId').disabled =
      false;
    document.querySelector('.button-userbankaccount-delete').disabled =
      false;
    document.querySelector('.button-userbankaccount-insert').disabled =
      false;
  }
}

// Show leading text for user bank account
function showLeadingText(userBankAccountId) {

  // Show all user bank accounts
  objUserBankAccount.showAllUserBankAccounts('userbankaccount-userBankAccountId', userBankAccountId);

  // Show all users
  const userId =
    userArray.at(-1).userId;
  objUser.showAllUsers('userbankaccount-userId', userBankAccountId);

  // Show all accounts
  const accountId =
    accountArray.at(-1).accountId;
  objAccount.showAllAccounts('userbankaccount-accountId', accountId);

  // name
  objUserBankAccount.showInput('userbankaccount-name', '* Navn', 50, '');

  // bank account
  objUserBankAccount.showInput('userbankaccount-bankAccount', '* Bankkonto', 11, '');

  // update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objUserBankAccount.showButton('userbankaccount-update', 'Oppdater');

    // new button
    objUserBankAccount.showButton('userbankaccount-insert', 'Ny');

    // delete button
    objUserBankAccount.showButton('userbankaccount-delete', 'Slett');

    // cancel button
    objUserBankAccount.showButton('userbankaccount-cancel', 'Avbryt');
  }
}

// Show all values for user bank account
function showValues(userBankAccountId) {

  // Check for valid user bank account
  if (userBankAccountId >= 0) {

    // find object number for selected user bank accountId
    const objBankAccountRowNumber =
      userBankAccountArray.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
    if (objBankAccountRowNumber !== -1) {

      // Select userId
      document.querySelector('.select-userbankaccount-userId').value =
        userBankAccountArray[objBankAccountRowNumber].userId;

      // Select accountId
      document.querySelector('.select-userbankaccount-accountId').value =
        userBankAccountArray[objBankAccountRowNumber].accountId;

      // Show bank account name
      document.querySelector('.input-userbankaccount-name').value =
        userBankAccountArray[objBankAccountRowNumber].name;

      // Show bank account
      document.querySelector('.input-userbankaccount-bankAccount').value =
        userBankAccountArray[objBankAccountRowNumber].bankAccount;
    }
  }
}

// Check for valid values
function validateValues() {

  // Check user Id
  const userId =
    Number(document.querySelector('.select-userbankaccount-userId').value);
  const validUserId =
    validateNumber(userId, 1, 99999, "userbankaccount-userId", "bruker");

  // Check account Id
  const accountId =
    Number(document.querySelector('.select-userbankaccount-accountId').value);
  const validAccountId =
    validateNumber(accountId, 1, 99999, "userbankaccount-accountId", "konto");

  // Check name
  const userBankAccountName =
    document.querySelector('.input-userbankaccount-name').value;
  const validUserBankAccountName =
    objUserBankAccount.validateText(userBankAccountName, "label-userbankaccount-name", "Navn");

  // Check bank account
  const bankAccount =
    document.querySelector('.input-userbankaccount-bankAccount').value;
  const validBankAccount =
    objUserBankAccount.validateBankAccount(bankAccount, "label-userbankaccount-bankAccount", "Bankkonto");

  return (validAccountId && validUserId && validBankAccount && validUserBankAccountName) ? true : false;
}

function resetValues() {

  // user bank account
  document.querySelector('.select-userbankaccount-userBankAccountId').value =
    0;

  // reset user Id
  document.querySelector('.select-userbankaccount-userId').value =
    0;

  // reset account Id
  document.querySelector('.select-userbankaccount-accountId').value =
    0;


  // reset bank account name
  document.querySelector('.input-userbankaccount-name').value =
    '';

  // reset bank account number
  document.querySelector('.input-userbankaccount-bankAccount').value =
    '';

  document.querySelector('.select-userbankaccount-userBankAccountId').disabled =
    true;
  document.querySelector('.button-userbankaccount-delete').disabled =
    true;
  document.querySelector('.button-userbankaccount-insert').disabled =
    true;
}
