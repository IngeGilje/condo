// Due maintenance

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

let userArrayCreated =
  false
let condoArrayCreated =
  false
let accountArrayCreated =
  false
let dueArrayCreated =
  false

testMode();

// Exit application if no activity for 1 hour
exitIfNoActivity();

let isEventsCreated

objDue.menu();
objDue.markSelectedMenu('Forfall');

let socket;
socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost:8080/condo-login.html';
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
    condoArrayCreated =
      false;

    // Sends a request to the server to get accounts
    SQLquery =
      `
        SELECT * FROM account
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY accountId;
      `;

    updateMySql(SQLquery, 'account', 'SELECT');
    accountArrayCreated =
      false;

    // Sends a request to the server to get dues
    // From date
    let fromDate =
      "01.01." + String(today.getFullYear());
    fromDate =
      Number(convertDateToISOFormat(fromDate));

    // To date
    let toDate =
      getCurrentDate();
    toDate =
      Number(convertDateToISOFormat(toDate));
    SQLquery =
      `
        SELECT * FROM due
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
          AND date BETWEEN ${fromDate} AND ${toDate}
        ORDER BY date DESC, condoId ASC;
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

        case 'account':

          // account table
          console.log('accountTable');

          accountArray =
            objInfo.tableArray;
          accountArrayCreated =
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
            && dueArrayCreated) {

            // Show leading text search
            showLeadingTextSearch();

            // Show leading text maintenance
            showLeadingText();

            // Show dues 
            showDues();

            // Get selected due Id
            const dueId =
              objDue.getSelectedDueId('select-due-dueId');

            // Show due Id
            objDue.showAllSelectedDues('due-dueId', dueId);

            showValues(dueId);

            // Make events
            isEventsCreated = 
            (isEventsCreated) ? true : createEvents();
          }
          break;
      }
    }

    if (objInfo.CRUD === 'UPDATE' || objInfo.CRUD === 'INSERT' || objInfo.CRUD === 'DELETE') {

      switch (objInfo.tableName) {
        case 'due':

          getSelectedDues();
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

// Make due events
function createEvents() {

  // Selected condo id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-due-filterCondoId')) {

      getSelectedDues();
    }
  });

  // Selected account id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-due-filterAccountId')) {

      getSelectedDues();
    }
  });

  // Selected from date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-due-filterFromDate')) {

      getSelectedDues();
    }
  });

  // Selected to date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-due-filterToDate')) {

      getSelectedDues();
    }
  });

  // Selected due Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-due-dueId')) {

      // Show due
      const dueId =
        Number(document.querySelector('.select-due-dueId').value);
      showValues(dueId);
    }
  });

  // Update due
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-due-update')) {

      const dueId =
        Number(document.querySelector('.select-due-dueId').value);
      updateDue(dueId);

      document.querySelector('.select-due-filterCondoId').value =
        document.querySelector('.select-due-condoId').value;
      document.querySelector('.select-due-filterAccountId').value =
        document.querySelector('.select-due-accountId').value;
    }
  });

  // insert due
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-due-insert')) {

      resetValues();
    }
  });

  // Delete due
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-due-delete')) {

      const dueId =
        Number(document.querySelector('.select-due-dueId').value);
      deleteDue(dueId);
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-due-cancel')) {

      getSelectedDues();
    }
  });
  return true;
}

function updateDue(dueId) {

  let SQLquery = '';

  // Check for valid values
  if (validateValues(dueId)) {

    // Valid values
    const condoId =
      Number(document.querySelector('.select-due-condoId').value);

    const accountId =
      Number(document.querySelector('.select-due-accountId').value);

    const date =
      Number(formatNorDateToNumber(document.querySelector('.input-due-date').value));

    const amount =
      Number(formatAmountToOre(document.querySelector('.input-due-amount').value));

    const text =
      document.querySelector('.input-due-text').value;

    const lastUpdate =
      today.toISOString();

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
            amount = ${amount},
            date = ${date},
            text = '${text}'
          WHERE dueId = ${dueId};
        `;
      updateMySql(SQLquery, 'due', 'UPDATE');
    } else {

      SQLquery =
        `
          INSERT INTO due (
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

    document.querySelector('.select-due-dueId').disabled =
      false;
    document.querySelector('.button-due-delete').disabled =
      false;
    document.querySelector('.button-due-insert').disabled =
      false;
  }
  return;
}

function deleteDue(dueId) {

  let SQLquery =
    '';

  // Check for valid due Id
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

// Show filter for search
function showLeadingTextSearch() {

  // Show all condos
  const condoId =
    (isClassDefined('select-due-filterCondoId')) ? Number(document.querySelector('.select-due-filterCondoId').value) : 0;
  objCondo.showAllCondos('due-filterCondoId', condoId, 'Alle');

  // Show all accounts
  const accountId =
    (isClassDefined('select-due-filterAccountId')) ? Number(document.querySelector('.select-due-filterAccountId').value) : 0;
  objAccount.showAllAccounts('due-filterAccountId', accountId, 'Alle');

  // Show from date
  if (!isClassDefined('input-due-filterFromDate')) {
    objDue.showInput('due-filterFromDate', 'Fra dato', 10, 'dd.mm.åååå');
  }

  // Show to date
  if (!isClassDefined('input-due-filterToDate')) {
    objDue.showInput('due-filterToDate', 'Til dato', 10, 'dd.mm.åååå');
  }

  // Check for filter from date
  let date =
    document.querySelector('.input-due-filterFromDate').value;

  if (!validateEuroDateFormat(date)) {

    // From date is not ok
    const year =
      String(today.getFullYear());
    document.querySelector('.input-due-filterFromDate').value =
      "01.01." + year;
  }

  // Check for filter to date
  date =
    document.querySelector('.input-due-filterToDate').value;
  if (!validateEuroDateFormat(date)) {

    // To date is not ok
    document.querySelector('.input-due-filterToDate').value =
      getCurrentDate();
  }
}

// Show leading text for due
function showLeadingText(dueId) {

  // Show all dues
  objDue.showAllDues('due-dueId', dueId);

  // Show all condos
  const condoId =
    condoArray.at(-1).condoId;
  objCondo.showAllCondos('due-condoId', condoId, 'Ingen er valgt');

  // Show all accounts
  const accountId =
    accountArray.at(-1).accountId;
  objAccount.showAllAccounts('due-accountId', accountId, 'Ingen er valgt');

  // Show amount
  objDue.showInput('due-date', '* Dato', 10, '');

  // Show amount
  objDue.showInput('due-amount', '* Beløp', 10, '');

  // Show text
  objDue.showInput('due-text', 'Tekst', 50, '');

  // show buttons
  if (Number(objUserPassword.securityLevel) >= 9) {
    objDue.showButton('due-update', 'Oppdater');

    // show new button
    objDue.showButton('due-insert', 'Ny');

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
  if (dueId >= 0) {

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
  document.querySelector('.button-due-insert').disabled =
    true;
}

// Show selected dues
function showDues() {

  // Validate search filter
  if (validateFilter()) {

    // Header
    let htmlColumnLine =
      '<div class="columnHeaderCenter">Linje</div><br>';
    let htmlColumnCondoName =
      '<div class="columnHeaderLeft">Leilighet</div><br>';
    let htmlColumnAccountName =
      '<div class="columnHeaderLeft">Konto</div><br>';
    let htmlColumnDate =
      '<div class="columnHeaderRight">Dato</div><br>';
    let htmlcolumnAmount =
      '<div class="columnHeaderRight">Beløp</div><br>';
    let htmlColumnText =
      '<div class="columnHeaderLeft">Tekst</div><br>';

    let sumAmount =
      0;
    let lineNumber =
      0;

    dueArray.forEach((due) => {

      lineNumber++;

      // check if the number is odd
      const colorClass =
        (lineNumber % 2 !== 0) ? "green" : "";

      // line number
      htmlColumnLine +=
        `
          <div 
            class="centerCell ${colorClass}"
          >
            ${lineNumber}
          </div >
        `;

      // condo name
      let condoName = "-";
      if (due.condoId) {
        const condoId =
          Number(due.condoId);
        condoName =
          objCondo.getCondoName(condoId);
      }
      htmlColumnCondoName +=
        `
          <div 
            class="leftCell ${colorClass} one-line"
          >
            ${condoName}
          </div >
        `;

      // account name
      const accountName =
        objAccount.getAccountName(due.accountId);
      const colorClassAccountName =
        (accountName === '-') ? 'red' : colorClass;
      htmlColumnAccountName +=
        `
          <div
            class="leftCell ${colorClassAccountName} one-line"
          >
            ${accountName}    
          </div >
        `;

      // date
      const date =
        formatToNorDate(due.date);
      htmlColumnDate +=
        `
          <div
            class="rightCell ${colorClass}"
          >
            ${date}
          </div >
        `;

      // amount
      const amount =
        formatOreToKroner(due.amount);
      htmlcolumnAmount +=
        `
          <div
            class="rightCell ${colorClass}"
          >
            ${amount}
          </div>
        `;

      // text
      htmlColumnText +=
        `
          <div
            class="leftCell ${colorClass} one-line"
          >
            ${due.text}
          </div>
        `;

      // accumulate
      sumAmount +=
        Number(due.amount);
    });

    // Sum line

    // amount
    amount =
      formatOreToKroner(sumAmount);
    htmlcolumnAmount +=
      `
        <div
          class="sumCellRight"
        >
          ${amount}
        </div >
      `;

    // Show line number
    document.querySelector('.div-due-columnLine').innerHTML =
      htmlColumnLine;

    // Show condo name
    document.querySelector('.div-due-columnCondoName').innerHTML =
      htmlColumnCondoName;

    // Show account name
    document.querySelector('.div-due-columnAccountName').innerHTML =
      htmlColumnAccountName;

    // Show date
    document.querySelector('.div-due-columnDate').innerHTML =
      htmlColumnDate;

    // Show amount
    document.querySelector('.div-due-columnAmount').innerHTML =
      htmlcolumnAmount;

    // Show text
    document.querySelector('.div-due-columnText').innerHTML =
      htmlColumnText;
  }
}

// Check for valid filter
function validateFilter() {

  // Check account
  const accountId =
    document.querySelector('.select-due-filterAccountId').value;
  const validAccountId =
    validateNumber(accountId, 1, 999999999, 'due-filterAccountId', 'Konto');

  const condoId =
    document.querySelector('.select-due-filterCondoId').value;
  const validCondoId =
    validateNumber(accountId, 1, 999999999, 'due-filterCondoId', 'Leilighet');

  const fromDate =
    document.querySelector('.input-due-filterFromDate').value;
  const validFromDate =
    validateNorDate(fromDate, 'due-filterFromDate', 'Fra dato');

  const toDate =
    document.querySelector('.input-due-filterToDate').value;
  const validToDate =
    validateNorDate(toDate, 'due-filterToDate', 'Til dato');

  return (validAccountId && validCondoId && validFromDate && validToDate) ? true : false;
}

// Get selected dues
function getSelectedDues() {

  const condoId =
    Number(document.querySelector('.select-due-filterCondoId').value);
  const accountId =
    Number(document.querySelector('.select-due-filterAccountId').value);

  const fromDate =
    Number(convertDateToISOFormat(document.querySelector('.input-due-filterFromDate').value));
  const toDate =
    Number(convertDateToISOFormat(document.querySelector('.input-due-filterToDate').value));

  let SQLquery =
    `
      SELECT * FROM due
      WHERE condominiumId = ${objUserPassword.condominiumId}
        AND deleted <> 'Y'
      AND date BETWEEN ${fromDate} AND ${toDate} 
    `;

  // Check if condo Id is selected
  if (condoId !== 999999999) {

    SQLquery +=
      `
        AND condoId = ${condoId}
      `;
  }

  // Check if account Id is selected
  if (accountId !== 999999999) {

    SQLquery +=
      `
        AND accountId = ${accountId}
      `;
  }

  SQLquery +=
    `
      ORDER BY date DESC, condoId ASC;
    `;

  // Sends a request to the server to get selected dues
  updateMySql(SQLquery, 'due', 'SELECT');
  dueArrayCreated =
    false;
}