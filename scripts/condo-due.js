// Due maintenance

// Activate objects
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccount = new Account('account');
const objDue = new Due('due');

testMode();

let isEventsCreated = false;

objDue.menu();
objDue.markSelectedMenu('Forfall');

let socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  showLoginError('due-login');
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

    // Sends a request to the server to get condos
    SQLquery =
      `
        SELECT * FROM condo
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY condoId;
      `;

    updateMySql(SQLquery, 'condo', 'SELECT');

    // Sends a request to the server to get accounts
    SQLquery =
      `
        SELECT * FROM account
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY accountId;
      `;

    updateMySql(SQLquery, 'account', 'SELECT');

    // Sends a request to the server to get dues
    SQLquery =
      `
        SELECT * FROM due
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY dueId;
      `;

    updateMySql(SQLquery, 'due', 'SELECT');
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

        case 'condo':

          // condo table
          console.log('condoTable');

          condoArray =
            objInfo.tableArray;
          break;

        case 'due':

          // due table
          console.log('dueTable');

          // array including objects with due information
          dueArray =
            objInfo.tableArray;

          // Find selected due id
          const dueId =
            objDue.getSelectedDueId('select-due-dueId');

          // Show leading text
          showLeadingText(dueId);

          // Show all values for due
          showValues(dueId);

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
        case 'due':

          // Sends a request to the server to get dues one more time
          SQLquery =
            `
              SELECT * FROM dues
              WHERE condominiumId = ${objUserPassword.condominiumId}
              ORDER BY duesId;
            `;
          updateMySql(SQLquery, 'due', 'SELECT');
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

      console.log('userTable');

      // user array including objects with user information
      userArray = JSON.parse(message);

      // Sends a request to the server to get all condos
      const SQLquery =
        `
          SELECT * FROM condo
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY name;
        `;
      socket.send(SQLquery);
    }

    // Create user array including objets
    if (message.includes('"tableName":"user"')) {

      console.log('userTable');

      // user array including objects with user information
      userArray = JSON.parse(message);

      // Sends a request to the server to get all condos
      const SQLquery =
        `
          SELECT * FROM condo
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY name;
        `;
      socket.send(SQLquery);
    }

    // Create condo array including objets
    if (message.includes('"tableName":"condo"')) {

      // condo table
      console.log('CondoTable');

      // array including objects with condo information
      condoArray = JSON.parse(message);

      // Sends a request to the server to get all accounts
      const SQLquery =
        `
          SELECT * FROM account
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY accountId;
        `;
      socket.send(SQLquery);
    }

    // Create condo array including objets
    if (message.includes('"tableName":"account"')) {

      // account table
      console.log('AccountTable');

      // array including objects with account information
      accountArray = JSON.parse(message);

      // Sends a request to the server to get all dues
      const SQLquery =
        `
          SELECT * FROM due
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY dueId;
        `;
      socket.send(SQLquery);
    }

    // Create  due array including objets
    if (message.includes('"tableName":"due"')) {

      // due table
      console.log('dueTable');

      // array including objects with due information
      dueArray = JSON.parse(message);

      const dueId =
        objDue.getSelectedDueId('dueId');

      // Show leading text
      showLeadingText(dueId);

      // Show all values
      showValues(dueId);

      // Make events
      if (!isEventsCreated) {

        createEvents();
        isEventsCreated = true;
      }
    }

    // Check for update, delete ...
    if (message.includes('"affectedRows"')) {

      console.log('affectedRows');

      const SQLquery =
        `
          SELECT * FROM due
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY dueId;
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

// Make due events
function createEvents() {

  // Selected due Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-due-dueId')) {

      dueId = Number(event.target.value);
      showLeadingText(dueId);
      showValues(dueId);
    }
  });

  // Selected condo id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-due-condoId')) {
    }
  });

  // Update due
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-due-update')) {

      const dueId = Number(document.querySelector('.select-due-dueId').value);
      updateDueRow(dueId);
    }
  });

  // new mountly amount
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-due-new')) {

      resetValues();
    }
  });

  // Delete due
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-due-delete')) {

      const dueId = document.querySelector('.select-due-dueId');
      deleteDueRow(dueId);

      // Sends a request to the server to get all due
      //objDue.getDues(socket);
      const SQLquery =
        `
          SELECT * FROM due
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY dueId;
        `;
      updateMySql(SQLquery, 'due', 'SELECT');
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-due-cancel')) {

      // Sends a request to the server to get all due
      //objDue.getDues(socket);
      const SQLquery =
        `
          SELECT * FROM due
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY dueId;
        `;
      updateMySql(SQLquery, 'due', 'SELECT');
    }
  });
}

function updateDueRow(dueId) {

  let SQLquery = '';
  let isUpdated = false;

  // Check for valid values
  if (validateValues(dueId)) {

    // Valid values

    const now = new Date();
    const lastUpdate = now.toISOString();

    const condoId =
      Number(document.querySelector('.select-due-condoId').value);

    const accountId =
      Number(document.querySelector('.select-due-accountId').value);

    const date =
      formatNorDateToNumber(document.querySelector('.input-due-date').value);

    const amount =
      formatAmountToOre(document.querySelector('.input-due-amount').value);

    const text =
      document.querySelector('.input-due-text').value;

    let SQLquery = "";

    // Check if due Id exist
    const objDueRowNumber =
      dueArray.findIndex(due => due.dueId === dueId);
    if (objDueRowNumber !== -1) {

      SQLquery =
        `
          UPDATE due
          SET 
            user = '${objUserPassword.email}',
            lastUpdate = '${lastUpdate}',
            condoId = ${condoId},
            accountId = ${accountId},
            amount = '${amount}',
            date = '${date}',
            text = '${text}'
          WHERE dueId = ${dueId};
        `;
updateMySql(SQLquery, 'due', 'UPDATE');
    } else {

      SQLquery =
        `
          INSERT INTO due (
            tableName,
            condominiumId,
            user,
            lastUpdate,
            condoId,
            accountId,
            amount,
            date,
            text)
          VALUES(
            'due',
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
        updateMySql(SQLquery, 'due', 'INSERT');
    }

    document.querySelector('.select-due-dueId').disabled =
      false;
    document.querySelector('.button-due-delete').disabled =
      false;
    document.querySelector('.button-due-new').disabled =
      false;
    isUpdated = true;
  }
  return isUpdated;
}

function deleteDueRow(dueId) {

  let SQLquery = '';
  let isUpdated = false;

  // Check for valid due Id
  if (dueId > 0) {

    SQLquery = `
      DELETE FROM due 
      WHERE dueId = ${dueId};
    `;
    socket.send(SQLquery);

    // Show updated dues
    //objDue.getDues(socket);
    const SQLquery =
      `
        SELECT * FROM due
        ORDER BY dueId;
      `;
    socket.send(SQLquery);
  }
}

// Show leading text for due
function showLeadingText(dueId) {

  // Show all dues
  objDue.showAllDues('due-dueId', dueId);

  // Show all condos
  const condoId =
    condoArray.at(-1).condoId;
  objCondo.showAllCondos('due-condoId', condoId);

  // Show all accounts
  const accountId =
    accountArray.at(-1).accountId;
  objAccount.showAllAccounts('due-accountId', accountId);

  // Show amount
  objDue.showInput('due-date', '* Dato', 10, '');

  // Show amount
  objDue.showInput('due-amount', '* Beløp', 10, '');

  // Show text
  objDue.showInput('due-text', '* Tekst', 255, '');

  // show update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objDue.showButton('due-update', 'Oppdater');

    // show new button
    objDue.showButton('due-new', 'Ny');

    // show delete button
    objDue.showButton('due-delete', 'Slett');

    // show cancel button
    objDue.showButton('due-cancel', 'Avbryt');
  }
}

// Check for valid values
function validateValues(dueId) {

  // Check for valid condo Id
  const condoId =
    document.querySelector('.select-due-condoId').value;
  const validCondoId =
    validateNumber(condoId, 1, 99999, 'due-condoId', 'Leilighet');

  // Check for valid account Id
  const accountId =
    document.querySelector('.select-due-accountId').value;
  const validAccountId =
    validateNumber(condoId, 1, 99999, 'due-accountId', 'Konto');

  // Check for valid date
  const date =
    document.querySelector('.input-due-date').value;
  const validDate =
    validateNorDate(date, 'due-date', 'Dato');

  // Check amount
  const amount =
    formatToNorAmount(document.querySelector('.input-due-amount').value);
  const validAmount =
    objDue.validateAmount(amount, "due-amount", "Månedsbetaling");

  // Check text
  const text =
    document.querySelector('.input-due-text').value;
  const validText =
    objDue.validateText(text, "label-due-text", "Tekst");

  return (validAccountId && validCondoId && validDate && validAmount && validText) ? true : false;
}

// Show values for due
function showValues(dueId) {

  // Check for valid due Id
  if (dueId > 1) {

    // Check if due Id exist
    const objDueRowNumber =
      dueArray.findIndex(due => due.dueId === dueId);
    if (objDueRowNumber !== -1) {

      // Show due id
      document.querySelector('.select-due-dueId').value =
        dueArray[objDueRowNumber].dueId;

      // Show condo id
      const condoId =
        dueArray[objDueRowNumber].condoId;
      objDue.selectCondoId(condoId, 'due-condoId');

      // Show account id
      const accountId =
        dueArray[objDueRowNumber].accountId;
      objDue.selectAccountId(accountId, 'due-accountId');

      // Show due date
      const dueDate =
        formatToNorDate(dueArray[objDueRowNumber].date);
      document.querySelector('.input-due-date').value =
        dueDate;

      // Show amount
      document.querySelector('.input-due-amount').value =
        formatOreToKroner(dueArray[objDueRowNumber].amount);

      // Show text
      document.querySelector('.input-due-text').value =
        dueArray[objDueRowNumber].text;
    }
  }
}

function resetValues() {

  // Show dueid
  document.querySelector('.select-due-dueId').value =
    0;

  // Show condo
  document.querySelector('.select-due-condoId').value =
    0;

  // Show date
  document.querySelector('.input-due-date').value =
    '';

  // Show amount
  document.querySelector('.input-due-amount').value =
    '';

  // Show text
  document.querySelector('.input-due-text').value =
    '';

  document.querySelector('.select-due-dueId').disabled =
    true;
  document.querySelector('.button-due-delete').disabled =
    true;
  document.querySelector('.button-due-new').disabled =
    true;
  //document.querySelector('.button-due-cancel').disabled =
  //  true;
}