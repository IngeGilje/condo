// Common cost maintenance

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccount = new Account('account');
const objDue = new Due('due');
const objCondominium = new Condominium('condominium');
const objCommonCost = new CommonCost('commoncost');

let userArrayCreated = false;
let condoArrayCreated = false;
let accountArrayCreated = false;
let condominiumArrayCreated = false;
let dueArrayCreated = false;

testMode();

/*
// Exit application if no activity for 1 hour
//exitIfNoActivity();
*/

let isEventsCreated

objCommonCost.menu();
objCommonCost.markSelectedMenu('Felleskostnader');

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
          AND deleted <> 'Y'
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
          AND deleted <> 'Y'
        ORDER BY condoId;
      `;
    updateMySql(SQLquery, 'condo', 'SELECT');

    // Inner join
    SQLquery =
      `
        SELECT account.*
        FROM condominium
        JOIN account ON condominium.commonCostAccountId = account.accountId 
        WHERE condominium.condominiumId = ${objUserPassword.condominiumId};
      `
    updateMySql(SQLquery, 'account', 'SELECT');

    accountArrayCreated =
      false;

    SQLquery =
      `
        SELECT * FROM condominium
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY condominiumId;
      `;
    updateMySql(SQLquery, 'condominium', 'SELECT');
    condoArrayCreated =
      false;

    // Sends a request to the server to get dues
    SQLquery =
      `
        SELECT * FROM due
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY date DESC;
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

        case 'condominium':

          // condominium table
          console.log('condominiumTable');

          condominiumArray =
            objInfo.tableArray;
          condominiumArrayCreated =
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
            && accountArrayCreated
            && condominiumArrayCreated
            && dueArrayCreated) {

            // Find selected due id
            const dueId =
              objDue.getSelectedDueId('select-due-dueId');

            // Show leading text
            showLeadingText(dueId);

            // Show all values for due
            showValues(dueId);

            // show all monthly amounts for selected condo id and account id
            let condoId = 0;
            if (isClassDefined('select-commoncost-condoId')) {
              condoId = Number(document.querySelector('.select-commoncost-condoId').value);
            }
            if (condoId === 0) {
              condoId = condoArray.at(-1).condoId;
              showLeadingText();
            }

            const accountId = accountArray[0].accountId;
            showCommonCost(condoId);

            // Make events
            isEventsCreated = (isEventsCreated) ? true : createEvents();
          } else {

            console.log("userArrayCreated: ", userArrayCreated);
            console.log("condoArrayCreated: ", condoArrayCreated);
            console.log("accountArrayCreated: ", accountArrayCreated);
            console.log("condominiumArrayCreated: ", condominiumArrayCreated);
            console.log("dueArrayCreated): ", dueArrayCreated);
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
                AND deleted <> 'Y'
              ORDER BY date DESC;
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
    if (event.target.classList.contains('select-commoncost-condoId')) {

      const condoId =
        Number(event.target.value);

      const accountId =
        accountArray[0].accountId;

      // Show all dues for condo id, account id
      showCommonCost(condoId);
    }
  });

  // Selected year
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-commoncost-year')) {
    }
  });

  // Selected day
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-commoncost-day')) {
    }
  });

  // Update common cost
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-commoncost-update')) {

      updateCommonCost();
      const condoId =
        Number(document.querySelector('.select-commoncost-condoId').value);

      const accountId =
        accountArray[0].accountId;

      showCommonCost(condoId);
    }
  });

  // Delete common cost
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-commoncost-delete')) {

      if (deleteCommonCost()) {

        condoId =
          document.querySelector('.select-commoncost-condoId').value;

        // Sends a request to the server to get all dues
        const SQLquery =
          `
            SELECT * FROM due
            WHERE condominiumId = ${objUserPassword.condominiumId}
              AND deleted <> 'Y'
            ORDER BY date DESC;
          `;
        updateMySql(SQLquery, 'due', 'SELECT');
        dueArrayCreated =
          false;

        document.querySelector('.select-commoncost-condoId').value =
          condoId;
      }
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-commoncost-cancel')) {

      // Sends a request to the server to get all dues
      const SQLquery =
        `
          SELECT * FROM due
          WHERE condominiumId = ${objUserPassword.condominiumId}
            AND deleted <> 'Y'
          ORDER BY date DESC;
        `;
      updateMySql(SQLquery, 'due', 'SELECT');
      dueArrayCreated =
        false;
    }
  });
  return true;
}

function updateCommonCost() {

  let SQLquery;
  let isUpdated = false;

  // Check for valid values
  if (validateValues()) {

    // Valid values
    const year =
      Number(document.querySelector('.select-commoncost-year').value);

    const condoId =
      Number(document.querySelector('.select-commoncost-condoId').value);

    const accountId =
      accountArray[0].accountId;

    // get condo name 
    const array =
      condoArray.find(condo => condo.condoId === condoId);

    condoName =
      array.name;

    const day =
      Number(document.querySelector('.select-commoncost-day').value);

    const amount =
      Number(formatAmountToOre(document.querySelector('.input-commoncost-amount').value));

    const lastUpdate =
      today.toISOString();

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
          deleted,
          condominiumId,
          user,
          lastUpdate,
          condoId,
          accountId,
          amount,
          date,
          text)
        VALUES(
          'N',
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
    document.querySelector('.button-commoncost-delete').disabled =
      false;
    document.querySelector('.select-commoncost-condoId').value =
      condoId;
  }
}

function deleteCommonCost() {

  // Check for valid values
  if (validateValues()) {

    let SQLquery = '';

    const year =
      Number(document.querySelector('.select-commoncost-year').value);
    const day =
      Number(document.querySelector('.select-commoncost-day').value);
    const condoId =
      Number(document.querySelector('.select-commoncost-condoId').value);
    const accountId =
      accountArray[0].accountId;
    let amount =
      Number(formatAmountToOre(document.querySelector('.input-commoncost-amount').value));

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

        // current date
        const lastUpdate =
          today.toISOString();

        SQLquery =
          `
          UPDATE due
            SET 
              deleted = 'Y',
              user = '${objUserPassword.email}',
              lastUpdate = '${lastUpdate}'
            WHERE dueId = ${dueId};
          `;

        updateMySql(SQLquery, 'due', 'DELETE');
      }
    }
  }
}

// Show leading text for due
function showLeadingText() {

  // Show all condos
  const condoId =
    condoArray.at(-1).condoId;
  objCondo.showAllCondos('commoncost-condoId', condoId);

  // Show years
  const year =
    today.getFullYear();
  objDue.selectNumber('commoncost-year', 2020, 2030, year, 'År');

  // Show days
  objDue.selectNumber('commoncost-day', 1, 28, 15, 'Dag')

  // Show amount
  objDue.showInput('commoncost-amount', '* Månedsavgift', 10, '');

  if (Number(objUserPassword.securityLevel) >= 9) {

    // show update button
    objDue.showButton('commoncost-update', 'Oppdater');

    // show delete button
    objDue.showButton('commoncost-delete', 'Slett');

    // show cancel button
    objDue.showButton('commoncost-cancel', 'Avbryt');
  }
}

// Check for valid values
function validateValues() {

  // Check for valid condo
  const year =
    document.querySelector('.select-commoncost-year').value;
  const validYear =
    validateNumber(year, 2020, 2099, 'commoncost-year', '* År');

  // Check for valid condo Id
  const condoId =
    document.querySelector('.select-commoncost-condoId').value;
  const validCondoId =
    validateNumber(condoId, 1, 99999, 'commoncost-condoId', 'Leilighet');

  // Check for valid day
  const day =
    document.querySelector('.select-commoncost-day').value;
  const validDay =
    validateNumber(day, 1, 28, 'commoncost-day', 'Dag');

  // Check amount
  const amount =
    document.querySelector('.input-commoncost-amount').value;
  document.querySelector('.input-commoncost-amount').value =
    formatAmountToEuroFormat(amount);
  const validAmount =
    objDue.validateAmount(amount, "commoncost-amount", "Månedsavgift");

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

// Reset all common cost amounts
function resetCommonCost() {

  document.querySelector('.input-commoncost-amount').value =
    '';

  document.querySelector('.div-commoncost-columnDate').innerHTML =
    '';
  document.querySelector('.div-commoncost-columnAmount').innerHTML =
    '';

  document.querySelector('.button-commoncost-delete').disabled =
    true;
}

// Reset all values for due
function resetValues() {

  document.querySelector('.select-commoncost-condoId').value =
    '';

  // Year
  document.querySelector('.select-commoncost-year').value =
    '';

  // Day
  document.querySelector('.input-commoncost-day').value =
    '';

  // Amount
  document.querySelector('.input-commoncost-amount').value =
    '';

  document.querySelector('.button-commoncost-delete').disabled =
    true;
}

// show all common costs for selected condo id
function showCommonCost(condoId) {

  let sumAmount = 0;
  let lineNumber = 0;
  const accountId = accountArray[0].accountId;

  document.querySelector(".input-commoncost-amount").value =
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
        document.querySelector(".input-commoncost-amount").value =
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

  document.querySelector('.div-commoncost-columnDate').innerHTML =
    htmlColumnDate;
  document.querySelector('.div-commoncost-columnAmount').innerHTML =
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
      document.querySelector('.select-commoncost-condoId').value =
        dueArray[objDueRowNumber].condoId;

      // Amount
      const amount =
        formatOreToKroner(dueArray[objDueRowNumber].amount);
      document.querySelector('.input-commoncost-amount').value =
        amount;
    } else {

      resetValues();
    }
  }
}
