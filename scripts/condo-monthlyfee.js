// Monthly fee maintenance

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccount = new Account('account');
const objDue = new Due('due');
const objMonthlyFee = new MonthlyFee('monthlyfee');

testMode();

let isEventsCreated = false;

objMonthlyFee.menu();
objMonthlyFee.markSelectedMenu('Månedsavgift');

let socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  showLoginError('monthlyfee-login');
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

        case 'condo':

          // condo table
          console.log('condoTable');

          condoArray =
            objInfo.tableArray;
          break;

        case 'account':

          // account table
          console.log('accountTable');

          accountArray =
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

          // show all monthly amounts for selected condo id and account id
          let condoId = 0;
          if (isClassDefined('select-monthlyfee-condoId')) {
            condoId =
              Number(document.querySelector('.select-monthlyfee-condoId').value);
          }
          if (condoId === 0) {
            condoId =
              condoArray.at(-1).condoId;
            showLeadingText();
          }

          // Account Id
          let accountId = 0;
          if (isClassDefined('select-monthlyfee-accountId')) {
            accountId =
              Number(document.querySelector('.select-monthlyfee-accountId').value);
          }
          if (accountId === 0) {
            accountId =
              accountArray.at(-1).accountId;
          }
          showMonthlyFee(condoId, accountId);

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
              SELECT * FROM due
              WHERE condominiumId = ${objUserPassword.condominiumId}
              ORDER BY dueId;
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

    // Create condo array including objets
    if (message.includes('"tableName":"condo"')) {

      console.log('CondoTable');
      // condo table

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

    // Create account array including objets
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
          ORDER BY date;
        `;
      socket.send(SQLquery);
    }

    // Create monthly amountArray array including objets
    if (message.includes('"tableName":"due"')) {

      // monthly amount table
      console.log('dueTable');

      // array including objects with monthly fee information
      dueArray = JSON.parse(message);

      // Show leading text
      let condoId = 0;
      if (isClassDefined('select-monthlyfee-condoId')) {
        condoId =
          Number(document.querySelector('.select-monthlyfee-condoId').value);
      }
      if (condoId === 0) {
        condoId =
          condoArray.at(-1).condoId;
        showLeadingText();
      }

      // Account Id
      let accountId = 0;
      if (isClassDefined('select-monthlyfee-accountId')) {
        accountId =
          Number(document.querySelector('.select-monthlyfee-accountId').value);
      }
      if (accountId === 0) {
        accountId =
          accountArray.at(-1).accountId;
      }

      // show all monthly amounts for selected condo id
      showMonthlyFee(condoId, accountId);

      // Make events
      if (!isEventsCreated) {

        createEvents();
        isEventsCreated = true;
      }
    }

    // Check for update, delete ...
    if (message.includes('"affectedRows"')) {

      console.log('affectedRows');

      // Sends a request to the server to get all due
      const SQLquery = 
        `
          SELECT * FROM due
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY date;
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

// Make monthly amount events
function createEvents() {

  // Selected condo Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-monthlyfee-condoId')) {

      const condoId =
        Number(event.target.value);
      //showValues(dueId);

      const accountId =
        Number(document.querySelector('.select-monthlyfee-accountId').value);

      // Show all dues for condo id, account id
      showMonthlyFee(condoId, accountId);
    }
  });

  // Selected account Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-monthlyfee-accountId')) {

      const accountId =
        Number(event.target.value);

      const condoId =
        Number(document.querySelector('.select-monthlyfee-condoId').value);

      // Show all dues for condo id, account id
      showMonthlyFee(condoId, accountId);
    }
  });

  // Selected year
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-monthlyfee-year')) {
    }
  });

  // Selected day
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-monthlyfee-day')) {
    }
  });

  // Update monthly fee
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-monthlyfee-update')) {

      updateMonthlyFee();
      const condoId =
        Number(document.querySelector('.select-monthlyfee-condoId').value);

      const accountId =
        Number(document.querySelector('.select-monthlyfee-accountId').value);

      showMonthlyFee(condoId, accountId);
    }
  });

  // Delete monthly fee
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-monthlyfee-delete')) {

      if (deleteMonthlyFee()) {

        condoId =
          document.querySelector('.select-monthlyfee-condoId').value;

        // Sends a request to the server to get all due
        const SQLquery =
          `
            SELECT * FROM due
            WHERE condominiumId = ${objUserPassword.condominiumId}
            ORDER BY date;
          `;
        updateMySql(SQLquery, 'due', 'SELECT');

        document.querySelector('.select-monthlyfee-condoId').value =
          condoId;
      }
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-monthlyfee-cancel')) {

      // Sends a request to the server to get all dues
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

function updateMonthlyFee() {

  let SQLquery;
  let isUpdated = false;

  // Check for valid values
  if (validateValues()) {

    // Valid values

    const now = new Date();
    const lastUpdate = now.toISOString();

    const year =
      Number(document.querySelector('.select-monthlyfee-year').value);

    const condoId =
      Number(document.querySelector('.select-monthlyfee-condoId').value);

    const accountId =
      Number(document.querySelector('.select-monthlyfee-accountId').value);

    // get condo name 
    const array =
      condoArray.find(condo => condo.condoId === condoId);

    condoName =
      array.name;

    const day =
      Number(document.querySelector('.select-monthlyfee-day').value);

    const amount =
      formatAmountToOre(document.querySelector('.input-monthlyfee-amount').value);

    // Insert new monthly amount for every month this year
    for (month = 1; month < 13; month++) {

      const stringDay = (day < 10) ? String(`0${day}`) : String(`${day}`);
      const stringMonth = (month < 10) ? String(`0${month}`) : String(`${month}`);
      const date =
        String(year) + stringMonth + stringDay;

      const text =
        String(condoName) + '-' + findNameOfMonth(month);

      SQLquery = `
        INSERT INTO due(
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
    document.querySelector('.button-monthlyfee-delete').disabled =
      false;
    document.querySelector('.select-monthlyfee-condoId').value =
      condoId;
    document.querySelector('.select-monthlyfee-accountId').value =
      accountId;

    isUpdated = true;
  }
  return isUpdated;
}

function deleteMonthlyFee() {

  // Check for valid values
  let isDeleted = false;
  if (validateValues()) {

    let SQLquery = '';

    const year =
      Number(document.querySelector('.select-monthlyfee-year').value);
    const day =
      Number(document.querySelector('.select-monthlyfee-day').value);
    const condoId =
      Number(document.querySelector('.select-monthlyfee-condoId').value);
    const accountId =
      Number(document.querySelector('.select-monthlyfee-accountId').value);
    let amount =
      formatAmountToOre(document.querySelector('.input-monthlyfee-amount').value);

    for (month = 1; month < 13; month++) {

      const stringDay =
        (day < 10) ? String(`0${day}`) : String(`${day}`);
      const stringMonth =
        (month < 10) ? String(`0${month}`) : String(`${month}`);
      let date =
        String(year) + stringMonth + stringDay;

      // due id for deleting row
      const dueId =
        findDueId(condoId, accountId, amount, date);

      if (dueId > 1) {
        SQLquery =
          `
            DELETE FROM due 
            WHERE dueId = ${dueId};
          `;

        socket.send(SQLquery);
        console.log(SQLquery);

        isDeleted = true;
      }
    }
  }
  return isDeleted;
}

// Show leading text for due
function showLeadingText() {

  // Show all condos
  const condoId =
    condoArray.at(-1).condoId;
  objCondo.showAllCondos('monthlyfee-condoId', condoId);

  // Show all accounts
  const accountId =
    accountArray.at(-1).accountId;
  objAccount.showAllAccounts('monthlyfee-accountId', accountId);

  // Show years
  const year =
    today.getFullYear();
  objDue.selectNumber('monthlyfee-year', 2020, 2030, year, 'År');

  // Show days
  objDue.selectNumber('monthlyfee-day', 1, 28, 15, 'Dag')

  // Show amount
  objDue.showInput('monthlyfee-amount', '* Månedsavgift', 10, '');

  if (Number(objUserPassword.securityLevel) >= 9) {

    // show update button
    objDue.showButton('monthlyfee-update', 'Oppdater');

    // show delete button
    objDue.showButton('monthlyfee-delete', 'Slett');

    // show cancel button
    objDue.showButton('monthlyfee-cancel', 'Avbryt');
  }
}

// Check for valid values
function validateValues() {

  // Check for valid condo
  const year =
    document.querySelector('.select-monthlyfee-year').value;
  const validYear =
    validateNumber(year, 2020, 2099, 'monthlyfee-year', '* År');

  // Check for valid condo Id
  const condoId =
    document.querySelector('.select-monthlyfee-condoId').value;
  const validCondoId =
    validateNumber(condoId, 1, 99999, 'monthlyfee-condoId', 'Leilighet');

  // Check for valid account Id
  const accountId =
    document.querySelector('.select-monthlyfee-accountId').value;
  const validAccountId =
    validateNumber(accountId, 1, 99999, 'monthlyfee-accountId', 'Konto');

  // Check for valid day
  const day =
    document.querySelector('.select-monthlyfee-day').value;
  const validDay =
    validateNumber(day, 1, 28, 'monthlyfee-day', '* Dag');

  // Check amount
  const amount =
    document.querySelector('.input-monthlyfee-amount').value;
  document.querySelector('.input-monthlyfee-amount').value =
    formatAmountToEuroFormat(amount);
  const validAmount =
    objDue.validateAmount(amount, "monthlyfee-amount", "Månedsavgift");

  return (validAccountId && validYear && validCondoId && validDay && validAmount) ? true : false;
}

function findDueId(condoId, accountId, amount, date) {

  let dueId = 0
  dueArray.forEach((due) => {
    if (due.dueId > 1
      && due.amount === amount
      && due.date === date
      && due.condoId === condoId
      && due.accountId === accountId
    ) {

      dueId = due.dueId;
    }
  });

  return dueId;
}

// Reset all monthly fee amounts
function resetMonthlyFee() {

  document.querySelector('.input-monthlyfee-amount').value =
    '';

  document.querySelector('.div-monthlyfee-columnDate').innerHTML =
    '';
  document.querySelector('.div-monthlyfee-columnAmount').innerHTML =
    '';

  document.querySelector('.button-monthlyfee-delete').disabled =
    true;
}

// Reset all values for due
function resetValues() {

  document.querySelector('.select-monthlyfee-condoId').value =
    '';

  // Year
  document.querySelector('.select-monthlyfee-year').value =
    '';

  // Day
  document.querySelector('.input-monthlyfee-day').value =
    '';

  // Amount
  document.querySelector('.input-monthlyfee-amount').value =
    '';

  document.querySelector('.button-monthlyfee-delete').disabled =
    true;
}

// show all monthly fees for selected condo id
function showMonthlyFee(condoId, accountId) {

  let sumAmount = 0;

  document.querySelector(".input-monthlyfee-amount").value =
    '';

  let htmlColumnDate =
    `
      <div 
        class = "columnHeaderRight"
      >
        Forfallsdato
    </div>
    <br>
  `;

  let htmlColumnAmount =
    `<div 
      class = "columnHeaderRight"
    >
      Beløp
  </div>
  <br>
  `;

  dueArray.forEach((due) => {

    if (due.condoId === condoId && due.accountId === accountId) {

      // 20250115 -> 15.01.2025
      date = formatToNorDate(String(due.date));
      htmlColumnDate +=
        `
          <div 
            class="rightCell"
          >
            ${date}
          </div>
        `;

      // 1234567 -> 12345,67
      const amount = formatOreToKroner(due.amount);
      document.querySelector(".input-monthlyfee-amount").value =
        amount;
      htmlColumnAmount +=
        `
          <div 
            class="rightCell"
          >
            ${amount}
          </div>
      `;
      sumAmount += Number(due.amount);
    }
  });

  // Sum line

  // 1234567 -> 12345,67
  sumAmount = formatOreToKroner(String(sumAmount));
  htmlColumnAmount +=
    `
      <div 
        class="sumCellRight"
      >
        ${sumAmount}
      </div>
      <br>
    `;

  document.querySelector('.div-monthlyfee-columnDate').innerHTML =
    htmlColumnDate;
  document.querySelector('.div-monthlyfee-columnAmount').innerHTML =
    htmlColumnAmount;
}

// Show all values for due
function showValues(dueId) {

  // Check for valid due Id
  if (dueId > 1) {

    // find object number for selected due id
    const objDueRowNumber =
      dueArray.findIndex(due => due.dueId === dueId);
    if (objDueRowNumber !== -1) {

      // Condo id
      document.querySelector('.select-monthlyfee-condoId').value =
        dueArray[objDueRowNumber].condoId;

      // Account id
      document.querySelector('.select-monthlyfee-accountId').value =
        dueArray[objDueRowNumber].accountId;

      /*
      // year
      document.querySelector('.select-monthlyfee-year').value =
        dueArray[objDueRowNumber].year;
      */

      /*
      // Day
      document.querySelector('.select-monthlyfee-day').value =
        dueArray[objDueRowNumber].day;
      */

      // Amount
      const amount =
        formatOreToKroner(dueArray[objDueRowNumber].amount);
      document.querySelector('.input-monthlyfee-amount').value =
        amount;
    } else {

      resetValues();
    }
  }
}
