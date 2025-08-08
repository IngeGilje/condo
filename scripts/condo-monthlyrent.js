// Monthly rent maintenance

// Activate objects
const today =
  new Date();
const objUser =
  new User('user');
const objCondo =
  new Condo('condo');
const objAccount =
  new Account('account');
const objDue =
  new Due('due');
const objMonthlyRent =
  new MonthlyRent('monthlyrent');

let userArrayCreated =
  false
let condoArrayCreated =
  false
let accountArrayCreated =
  false
let dueArrayCreated =
  false

//testMode();

// Exit application if no activity for 10 minutes
resetInactivityTimer();

let isEventsCreated

objMonthlyRent.menu();
objMonthlyRent.markSelectedMenu('Månedsavgift');

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
        ORDER BY userId;
      `;
    updateMySql(SQLquery, 'user', 'SELECT');
    userArrayCreated =
      false;

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
    condoArrayCreated =
      false;

    // Sends a request to the server to get dues
    SQLquery =
      `
        SELECT * FROM due
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY dueId;
      `;

    updateMySql(SQLquery, 'due', 'SELECT');
    dueArrayCreated =
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

          // user table
          console.log('userTable');

          userArray =
            objInfo.tableArray;
          userArrayCreated =
            true;
          break;

        case 'condo':

          // condo table
          console.log('condoTable');

          condoArray =
            objInfo.tableArray;
          condoArrayCreated =
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

        case 'due':

          // due table
          console.log('dueTable');

          // array including objects with due information
          dueArray =
            objInfo.tableArray;
          dueArrayCreated =
            true;

          if (userArrayCreated
            && condoArrayCreated
            && objAccountArrayCreated
            && objDueArrayCreated) {

            // Find selected due id
            const dueId =
              objDue.getSelectedDueId('select-due-dueId');

            // Show leading text
            showLeadingText(dueId);

            // Show all values for due
            showValues(dueId);

            // show all monthly amounts for selected condo id and account id
            let condoId = 0;
            if (isClassDefined('select-monthlyrent-condoId')) {
              condoId =
                Number(document.querySelector('.select-monthlyrent-condoId').value);
            }
            if (condoId === 0) {
              condoId =
                condoArray.at(-1).condoId;
              showLeadingText();
            }

            // Account Id
            let accountId = 0;
            if (isClassDefined('select-monthlyrent-accountId')) {
              accountId =
                Number(document.querySelector('.select-monthlyrent-accountId').value);
            }
            if (accountId === 0) {
              accountId =
                accountArray.at(-1).accountId;
            }
            showMonthlyRent(condoId, accountId);

            // Make events
            isEventsCreated = (isEventsCreated) ? true : createEvents();
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
          dueArrayCreated =
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

// Make monthly amount events
function createEvents() {

  // Selected condo Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-monthlyrent-condoId')) {

      const condoId =
        Number(event.target.value);
      //showValues(dueId);

      const accountId =
        Number(document.querySelector('.select-monthlyrent-accountId').value);

      // Show all dues for condo id, account id
      showMonthlyRent(condoId, accountId);
    }
  });

  // Selected account Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-monthlyrent-accountId')) {

      const accountId =
        Number(event.target.value);

      const condoId =
        Number(document.querySelector('.select-monthlyrent-condoId').value);

      // Show all dues for condo id, account id
      showMonthlyRent(condoId, accountId);
    }
  });

  // Selected year
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-monthlyrent-year')) {
    }
  });

  // Selected day
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-monthlyrent-day')) {
    }
  });

  // Update monthly rent
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-monthlyrent-save')) {

      updateMonthlyRent();
      const condoId =
        Number(document.querySelector('.select-monthlyrent-condoId').value);

      const accountId =
        Number(document.querySelector('.select-monthlyrent-accountId').value);

      showMonthlyRent(condoId, accountId);
    }
  });

  // Delete monthly rent
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-monthlyrent-delete')) {

      if (deleteMonthlyRent()) {

        condoId =
          document.querySelector('.select-monthlyrent-condoId').value;

        // Sends a request to the server to get all due
        const SQLquery =
          `
            SELECT * FROM due
            WHERE condominiumId = ${objUserPassword.condominiumId}
            ORDER BY date;
          `;
        updateMySql(SQLquery, 'due', 'SELECT');
        dueArrayCreated =
          false;

        document.querySelector('.select-monthlyrent-condoId').value =
          condoId;
      }
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-monthlyrent-cancel')) {

      // Sends a request to the server to get all dues
      const SQLquery =
        `
          SELECT * FROM due
          WHERE condominiumId = ${objUserPassword.condominiumId}
          ORDER BY dueId;
        `;
      updateMySql(SQLquery, 'due', 'SELECT');
      dueArrayCreated =
        false;
    }
  });
}

function updateMonthlyRent() {

  let SQLquery;
  let isUpdated = false;

  // Check for valid values
  if (validateValues()) {

    // Valid values

    const now = new Date();
    const lastUpdate = now.toISOString();

    const year =
      Number(document.querySelector('.select-monthlyrent-year').value);

    const condoId =
      Number(document.querySelector('.select-monthlyrent-condoId').value);

    const accountId =
      Number(document.querySelector('.select-monthlyrent-accountId').value);

    // get condo name 
    const array =
      condoArray.find(condo => condo.condoId === condoId);

    condoName =
      array.name;

    const day =
      Number(document.querySelector('.select-monthlyrent-day').value);

    const amount =
      Number(formatAmountToOre(document.querySelector('.input-monthlyrent-amount').value));

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
          ${amount},
          ${date},
          '${text}'
        );
      `;

      updateMySql(SQLquery, 'due', 'INSERT');
    }
    document.querySelector('.button-monthlyrent-delete').disabled =
      false;
    document.querySelector('.select-monthlyrent-condoId').value =
      condoId;
    document.querySelector('.select-monthlyrent-accountId').value =
      accountId;

    isUpdated = true;
  }
  return isUpdated;
}

function deleteMonthlyRent() {

  // Check for valid values
  let isDeleted = false;
  if (validateValues()) {

    let SQLquery = '';

    const year =
      Number(document.querySelector('.select-monthlyrent-year').value);
    const day =
      Number(document.querySelector('.select-monthlyrent-day').value);
    const condoId =
      Number(document.querySelector('.select-monthlyrent-condoId').value);
    const accountId =
      Number(document.querySelector('.select-monthlyrent-accountId').value);
    let amount =
      Number(formatAmountToOre(document.querySelector('.input-monthlyrent-amount').value));

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

      if (dueId >= 0) {
        SQLquery =
          `
            DELETE FROM due 
            WHERE dueId = ${dueId};
          `;

        updateMySql(SQLquery, 'due', 'DELETE');

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
  objCondo.showAllCondos('monthlyrent-condoId', condoId);

  // Show all accounts
  const accountId =
    accountArray.at(-1).accountId;
  objAccount.showAllAccounts('monthlyrent-accountId', accountId, "Alle");

  // Show years
  const year =
    today.getFullYear();
  objDue.selectNumber('monthlyrent-year', 2020, 2030, year, 'År');

  // Show days
  objDue.selectNumber('monthlyrent-day', 1, 28, 15, 'Dag')

  // Show amount
  objDue.showInput('monthlyrent-amount', '* Månedsavgift', 10, '');

  if (Number(objUserPassword.securityLevel) >= 9) {

    // show update button
    objDue.showButton('monthlyrent-save', 'Lagre');

    // show delete button
    objDue.showButton('monthlyrent-delete', 'Slett');

    // show cancel button
    objDue.showButton('monthlyrent-cancel', 'Avbryt');
  }
}

// Check for valid values
function validateValues() {

  // Check for valid condo
  const year =
    document.querySelector('.select-monthlyrent-year').value;
  const validYear =
    validateNumber(year, 2020, 2099, 'monthlyrent-year', '* År');

  // Check for valid condo Id
  const condoId =
    document.querySelector('.select-monthlyrent-condoId').value;
  const validCondoId =
    validateNumber(condoId, 1, 99999, 'monthlyrent-condoId', 'Leilighet');

  // Check for valid account Id
  const accountId =
    document.querySelector('.select-monthlyrent-accountId').value;
  const validAccountId =
    validateNumber(accountId, 1, 99999, 'monthlyrent-accountId', 'Konto');

  // Check for valid day
  const day =
    document.querySelector('.select-monthlyrent-day').value;
  const validDay =
    validateNumber(day, 1, 28, 'monthlyrent-day', 'Dag');

  // Check amount
  const amount =
    document.querySelector('.input-monthlyrent-amount').value;
  document.querySelector('.input-monthlyrent-amount').value =
    formatAmountToEuroFormat(amount);
  const validAmount =
    objDue.validateAmount(amount, "monthlyrent-amount", "Månedsavgift");

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

// Reset all monthly rent amounts
function resetMonthlyRent() {

  document.querySelector('.input-monthlyrent-amount').value =
    '';

  document.querySelector('.div-monthlyrent-columnDate').innerHTML =
    '';
  document.querySelector('.div-monthlyrent-columnAmount').innerHTML =
    '';

  document.querySelector('.button-monthlyrent-delete').disabled =
    true;
}

// Reset all values for due
function resetValues() {

  document.querySelector('.select-monthlyrent-condoId').value =
    '';

  // Year
  document.querySelector('.select-monthlyrent-year').value =
    '';

  // Day
  document.querySelector('.input-monthlyrent-day').value =
    '';

  // Amount
  document.querySelector('.input-monthlyrent-amount').value =
    '';

  document.querySelector('.button-monthlyrent-delete').disabled =
    true;
}

// show all monthly rents for selected condo id
function showMonthlyRent(condoId, accountId) {

  let sumAmount = 0;
  let lineNumber = 0;

  document.querySelector(".input-monthlyrent-amount").value =
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
    `
      <div 
        class = "columnHeaderRight"
      >
        Beløp
      </div>
      <br>
    `;

  dueArray.forEach((due) => {

    if (due.condoId === condoId) {
      if (due.accountId === accountId || accountId === 999999999) {

        lineNumber++;

        // check if the number is odd
        const colorClass =
          (lineNumber % 2 !== 0) ? "green" : "";

        // 20250115 -> 15.01.2025
        date = formatToNorDate(String(due.date));
        htmlColumnDate +=
          `
            <div 
              class="rightCell ${colorClass}"
            >
              ${date}
            </div>
          `;

        // 1234567 -> 12345,67
        const amount = formatOreToKroner(due.amount);
        document.querySelector(".input-monthlyrent-amount").value =
          amount;
        htmlColumnAmount +=
          `
            <div 
              class="rightCell ${colorClass}"
            >
              ${amount}
            </div>
          `;
        sumAmount += Number(due.amount);
      }
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

  document.querySelector('.div-monthlyrent-columnDate').innerHTML =
    htmlColumnDate;
  document.querySelector('.div-monthlyrent-columnAmount').innerHTML =
    htmlColumnAmount;
}

// Show all values for due
function showValues(dueId) {

  // Check for valid due Id
  if (dueId >= 0) {

    // find object number for selected due id
    const objDueRowNumber =
      dueArray.findIndex(due => due.dueId === dueId);
    if (objDueRowNumber !== -1) {

      // Condo id
      document.querySelector('.select-monthlyrent-condoId').value =
        dueArray[objDueRowNumber].condoId;

      // Account id
      document.querySelector('.select-monthlyrent-accountId').value =
        dueArray[objDueRowNumber].accountId;

      // Amount
      const amount =
        formatOreToKroner(dueArray[objDueRowNumber].amount);
      document.querySelector('.input-monthlyrent-amount').value =
        amount;
    } else {

      resetValues();
    }
  }
}
