// Maintenance of user bank account

// Activate objects
const objUser = new User('user');
const objUserBankAccount = new UserBankAccount('userbankaccount');

let isEventsCreated = false;

objUserBankAccount.menu();
objUserBankAccount.markSelectedMenu('Bankkonto for bruker');

let socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  showLoginError('userbankaccount-login');
} else {

  let isEventsCreated = false;

  objUserBankAccount.menu();
  objUserBankAccount.markSelectedMenu('Bankkonto for bruker');

  // Send a message to the server
  socket.onopen = () => {

    // Send a request to the server to get all user bank accounts
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

      // user table
      console.log('userTable');

      // array including objects with user information
      userArray = JSON.parse(message);

      // Send a request to the server to get all user bank accounts
      const SQLquery =
        `
          SELECT * FROM userbankaccount
          ORDER BY userbankaccountId;
        `;
      socket.send(SQLquery);
    }

    // Create user array including objets
    if (message.includes('"tableName":"userbankaccount"')) {

      // user table
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
    if (message.includes('"affectedRows":1')) {

      console.log('affectedRows');

      // Sends a request to the server to get all users
      const SQLquery = `
        SELECT * FROM userbankaccount
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
}

// Make events for user bank accountId
function createEvents() {

  // Select user bank accountId
  document.addEventListener('change', (event) => {

    if (event.target.classList.contains('select-userbankaccount-userBankAccountId')) {

      let userBankAccountId = Number(document.querySelector('.select-userbankaccount-userId').value);
      userBankAccountId = (userBankAccountId !== 0) ? userBankAccountId : userBankAccountArray.at(-1).userBankAccountId;
      if (userBankAccountId) {
        showValues(userBankAccountId);
      }
    }
  });

  // Update
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-userbankaccount-update')) {

      // user id
      let userBankAccountId =
        Number(document.querySelector('.select-userbankaccount-userBankAccountId').value);
      updateUser(userBankAccountId);
    }
  });

  // New user
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-userbankaccount-new')) {

      resetValues();
    }
  });

  // Delete user
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-userbankaccount-delete')) {

      const userBankAccountId =
        Number(document.querySelector('.select-userbankaccount-userBankAccountId').value);
      deleteUserBankAccountRow(userBankAccountId);

      // Sends a request to the server to get all user bank account
      const SQLquery = `
        SELECT * FROM userbankaccount
        ORDER BY userBankAccountId;
      `;
      socket.send(SQLquery);
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-userbankaccount-cancel')) {

      // Sends a request to the server to get all user
      const SQLquery = `
        SELECT * FROM userbankaccount
        ORDER BY userBankAccountId;
      `;
      socket.send(SQLquery);
    }
  });
}

function updateUser(userId) {

  let isUpdated = false;

  if (validateValues(userId)) {

    // user Bank Account Id
    const userBankAccountId =
      document.querySelector('.input-userbankaccount-userBankAccountId').value;

    // user id
    const userId =
      Number(document.querySelector('.select-userbankaccount-userId').value);

    // bank account
    const bankAccount =
      document.querySelector('.input-userbankaccount-bankAccount').value;

    let SQLquery = '';
    const now = new Date();
    const lastUpdate = now.toISOString();

    const objectNumberUser = userArray.findIndex(user => user.userId === userId);

    // Check if first name exist
    if (objectNumberUser >= 0) {

      // Update table
      SQLquery =
        `
          UPDATE userBankAccount
          SET 
            user = '${objUserPassword.email}',
            lastUpdate = '${lastUpdate}',
            email = '${email}',
            userId = ${userId},
            bankAccount = '${bankAccount}',
          WHERE userBankAccountId = ${userBankAccountId}
          ;
        `;
    } else {

      // Insert new record
      SQLquery = `
        INSERT INTO userBankAccount (
          tableName,
          condominiumId,
          user,
          lastUpdate,
          userId,
          bankAccount
        ) 
        VALUES (
          'user',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          ${userId},
          '${bankAccount}'
        );
      `;
    }

    // Client sends a request to the server
    socket.send(SQLquery);

    document.querySelector('.select-userbankaccount-userId').disabled =
      false;
    document.querySelector('.button-userbankaccount-delete').disabled =
      false;
    document.querySelector('.button-userbankaccount-new').disabled =
      false;
    isUpdated = true;
  }
}

function deleteUserRow(userBankAccountId) {

  let SQLquery;

  if (userBankAccountId > 1) {

    // Check if user bank account exist
    const objectNumberUserBankAccount = userArray.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
    if (objectNumberUserBankAccount >= 0) {

      // Delete table
      SQLquery = `
        DELETE FROM userbankaccount
        WHERE userBankAccountId = ${userBankAccountId};
      `;

      // Client sends a request to the server
      socket.send(SQLquery);
    }

    // Get user bank account
    SQLquery = `
      SELECT * FROM userbankaccount
      ORDER BY userBankAccountId;
    `;
    socket.send(SQLquery);

    resetValues();
  }
}

// Show leading text for user bank account
function showLeadingText(userBankAccountId) {

  // Show all user bank accounts
  objUserBankAccount.showAllUserBankAccounts('userbankaccount-userBankAccountId', userBankAccountId);

  // Show all users
  const userId = userArray.at(-1).userId;
  objUser.showAllUsers('userbankaccount-userId', userBankAccountId);

  // bank account
  objUserBankAccount.showInput('userbankaccount-bankAccount', 'Bankkonto', 11, '');

  // update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objUserBankAccount.showButton('userbankaccount-update', 'Oppdater');

    // new button
    objUserBankAccount.showButton('userbankaccount-new', 'Ny');

    // delete button
    objUserBankAccount.showButton('userbankaccount-delete', 'Slett');

    // cancel button
    objUserBankAccount.showButton('userbankaccount-cancel', 'Avbryt');
  }
}

// Show all values for user bank account
function showValues(userBankAccountId) {

  // Check for valid user user bank account
  if (userBankAccountId > 1) {

    // find object number for selected user bank accountId
    const objectNumberUserBankAccount = userBankAccountArray.findIndex(user => userBankAccount.userBankAccountId === userBankAccountId);
    if (objectNumberUserBankAccount >= 0) {

      // Select userId
      document.querySelector('.select-userbankaccount-userId').value =
        userBankAccountArray[objectNumberUserBankAccount].userId;

      // Show bank account
      document.querySelector('.input-userbankaccount-bankAccount').value =
        userArray[objectNumberUserBankAccount].bankAccount;
    }
  }
}

// Check for valid values
function validateValues(userBankAccountId) {

  // Check user Id
  const userId =
    Number(document.querySelector('.select-userbankaccount-userId').value);
  const validUserId =
    validateNumber(userId, 1, 99999, "userbankaccount-userId", "Vis bankkonto");

  // Check bank account
  const bankAccount = 
  document.querySelector('.input-userbankaccount-bankAccount').value;
   const validBankAccount =
    objUserBankAccount.validateBankAccount(bankAccount, "input-supplier-bankAccount", "Bankkonto");

  return (validUserId && validBankAccount) ? true : false;
}

function resetValues() {

  // user bank account
  document.querySelector('.select-userbankaccount-userBankAccountId').value =
    0;

  // reset user Id
  document.querySelector('.select-userbankaccount-userId').value =
    0;

  // reset account number
  document.querySelector('.input-userbankaccount-bankAccount').value =
    '';

  document.querySelector('.select-userbankaccount-userId').disabled =
    true;
  document.querySelector('.button-userbankaccount-delete').disabled =
    true;
  document.querySelector('.button-userbankaccount-new').disabled =
    true;
}
