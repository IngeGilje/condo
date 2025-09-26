// Due maintenance

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objCondo = new Condo('condo');
const objAccounts = new Accounts('accounts');
const objDues = new Dues('dues');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

objDues.menu();
objDues.markSelectedMenu('Forfall');

//let socket;
//socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    // Call main when script loads
    main();

    // Main entry point
    async function main() {

      await objUsers.loadUsersTable(objUserPassword.condominiumId);

      await objCondo.loadCondoTable(objUserPassword.condominiumId);

      await objAccounts.loadAccountsTable(objUserPassword.condominiumId);

      const year = String(today.getFullYear());
      const accountId = 999999999;
      const condoId = 999999999;
      await objDues.loadDuesTable(objUserPassword.condominiumId,year,accountId,condoId);

      // Show leading text filter
      showLeadingTextFilter();

      // Show leading text maintenance
      showLeadingText();

      // Show dues 
      showDues();

      // Get selected due Id
      const dueId =
        objDues.getSelectedDueId('select-dues-dueId');

      // Show due Id
      objDues.showAllSelectedDues('dues-dueId', dueId);

      showValues(dueId);

      // Make events
      createEvents();

    }
  }
  /*
  // Send a requests to the server
  socket.onopen = () => {
 
    // Sends a request to the server to get users
    let SQLquery =
      `
        SELECT * FROM users
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
        SELECT * FROM accounts
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
    objDues.duesArrayCreated =
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
 
          userArray = objInfo.tableArray;
          userArrayCreated =
            true;
          break;
 
        case 'account':
 
          // account table
          console.log('accountTable');
 
          accountsArray = objInfo.tableArray;
          accountArrayCreated =
            true;
          break;
 
        case 'condo':
 
          // condo table
          console.log('condoTable');
 
          condoArray = objInfo.tableArray;
          condoArrayCreated =
            true;
          break;
 
        case 'due':
 
          // due table
          console.log('dueTable');
 
          // array including objects with due information
          objDues.duesArray = objInfo.tableArray;
          objDues.duesArrayCreated =
            true;
 
          if (userArrayCreated
            && condoArrayCreated
            && accountArrayCreated
            && objDues.duesArrayCreated) {
 
            // Show leading text filter
            showLeadingTextFilter();
 
            // Show leading text maintenance
            showLeadingText();
 
            // Show dues 
            showDues();
 
            // Get selected due Id
            const dueId =
              objDues.getSelectedDueId('select-dues-dueId');
 
            // Show due Id
            objDues.showAllSelectedDues('dues-dueId', dueId);
 
            showValues(dueId);
 
            // Make events
            isEventsCreated = (isEventsCreated) ? true : createEvents();
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
  */
}

// Make due events
function createEvents() {

  // Selected condo id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-dues-filterCondoId')) {

      getSelectedDues();
    }
  });

  // Selected account id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-dues-filterAccountId')) {

      getSelectedDues();
    }
  });

  // Selected from date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-dues-filterFromDate')) {

      getSelectedDues();
    }
  });

  // Selected to date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-dues-filterToDate')) {

      getSelectedDues();
    }
  });

  // Selected due Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-dues-dueId')) {

      // Show due
      const dueId =
        Number(document.querySelector('.select-dues-dueId').value);
      showValues(dueId);
    }
  });

  // Update due
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-dues-update')) {

      const dueId =
        Number(document.querySelector('.select-dues-dueId').value);
      updateDue(dueId);

      document.querySelector('.select-dues-filterCondoId').value =
        document.querySelector('.select-dues-condoId').value;
      document.querySelector('.select-dues-filterAccountId').value =
        document.querySelector('.select-dues-accountId').value;
    }
  });

  // insert due
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-dues-insert')) {

      resetValues();
    }
  });

  // Delete due
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-dues-delete')) {

      const dueId =
        Number(document.querySelector('.select-dues-dueId').value);
      deleteDue(dueId);
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-dues-cancel')) {

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
      Number(document.querySelector('.select-dues-condoId').value);

    const accountId =
      Number(document.querySelector('.select-dues-accountId').value);

    const date =
      Number(formatNorDateToNumber(document.querySelector('.input-dues-date').value));

    const amount =
      Number(formatAmountToOre(document.querySelector('.input-dues-amount').value));

    const text =
      document.querySelector('.input-dues-text').value;

    const lastUpdate =
      today.toISOString();

    // Check if due Id exist
    const objDueRowNumber =
      objDues.duesArray.findIndex(due => due.dueId === dueId);
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

    document.querySelector('.select-dues-dueId').disabled =
      false;
    document.querySelector('.button-dues-delete').disabled =
      false;
    document.querySelector('.button-dues-insert').disabled =
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
function showLeadingTextFilter() {

  // Show all condos
  const condoId = (isClassDefined('select-dues-filterCondoId')) ? Number(document.querySelector('.select-dues-filterCondoId').value) : 0;
  objCondo.showAllCondos('dues-filterCondoId', condoId, 'Alle');

  // Show all accounts
  const accountId = (isClassDefined('select-dues-filterAccountId')) ? Number(document.querySelector('.select-dues-filterAccountId').value) : 0;
   objAccounts.showAllAccounts('dues-filterAccountId', accountId, 'Alle');

  // Show from date
  if (!isClassDefined('input-dues-filterFromDate')) {
    objDues.showInput('dues-filterFromDate', 'Fra dato', 10, 'dd.mm.åååå');
  }

  // Show to date
  if (!isClassDefined('input-dues-filterToDate')) {
    objDues.showInput('dues-filterToDate', 'Til dato', 10, 'dd.mm.åååå');
  }

  // Check for filter from date
  let date = document.querySelector('.input-dues-filterFromDate').value;

  if (!validateEuroDateFormat(date)) {

    // From date is not ok
    const year =
      String(today.getFullYear());
    document.querySelector('.input-dues-filterFromDate').value =
      "01.01." + year;
  }

  // Check for filter to date
  date = document.querySelector('.input-dues-filterToDate').value;
  if (!validateEuroDateFormat(date)) {

    // To date is not ok
    document.querySelector('.input-dues-filterToDate').value = getCurrentDate();
  }
}

// Show leading text for due
function showLeadingText(dueId) {

  // Show all dues
  console.log('duesArray: ', objDues.duesArray);
  objDues.showAllDues('dues-dueId', dueId);

  // Show all condos
  const condoId = condoArray.at(-1).condoId;
  objCondo.showAllCondos('dues-condoId', condoId, 'Ingen er valgt');

  // Show all accounts
  const accountId = accountsArray.at(-1).accountId;
   objAccounts.showAllAccounts('dues-accountId', accountId, 'Ingen er valgt');

  // Show amount
  objDues.showInput('dues-date', '* Dato', 10, '');

  // Show amount
  objDues.showInput('dues-amount', '* Beløp', 10, '');

  // Show text
  objDues.showInput('dues-text', 'Tekst', 50, '');

  // show buttons
  if (Number(objUserPassword.securityLevel) >= 9) {
    objDues.showButton('dues-update', 'Oppdater');

    // show new button
    objDues.showButton('dues-insert', 'Ny');

    // show delete button
    objDues.showButton('dues-delete', 'Slett');

    // show cancel button
    objDues.showButton('dues-cancel', 'Avbryt');
  }
}

// Check for valid values
function validateValues(dueId) {

  // Check for valid condo Id
  const condoId =
    document.querySelector('.select-dues-condoId').value;
  const validCondoId =
    validateNumber(condoId, 1, 99999, 'dues-condoId', 'Leilighet');

  // Check for valid account Id
  const accountId =
    document.querySelector('.select-dues-accountId').value;
  const validAccountId =
    validateNumber(condoId, 1, 99999, 'dues-accountId', 'Konto');

  // Check for valid date
  const date =
    document.querySelector('.input-dues-date').value;
  const validDate =
    validateNorDate(date, 'dues-date', 'Dato');

  // Check amount
  const amount =
    formatToNorAmount(document.querySelector('.input-dues-amount').value);
  const validAmount =
    objDues.validateAmount(amount, "dues-amount", "Månedsbetaling");

  // Check text
  const text =
    document.querySelector('.input-dues-text').value;
  const validText =
    objDues.validateText(text, "label-dues-text", "Tekst");

  return (validAccountId && validCondoId && validDate && validAmount && validText) ? true : false;
}

// Show values for due
function showValues(dueId) {

  // Check for valid due Id
  if (dueId >= 0) {

    // Check if due Id exist
    const objDueRowNumber = objDues.duesArray.findIndex(due => due.dueId === dueId);
    if (objDueRowNumber !== -1) {

      // Show due id
      document.querySelector('.select-dues-dueId').value = objDues.duesArray[objDueRowNumber].dueId;

      // Show condo id
      const condoId = objDues.duesArray[objDueRowNumber].condoId;
      objDues.selectCondoId(condoId, 'dues-condoId');

      // Show account id
      const accountId =
        objDues.duesArray[objDueRowNumber].accountId;
      objDues.selectAccountId(accountId, 'dues-accountId');

      // Show due date
      const dueDate = formatToNorDate(objDues.duesArray[objDueRowNumber].date);
      document.querySelector('.input-dues-date').value = dueDate;

      // Show amount
      document.querySelector('.input-dues-amount').value = formatOreToKroner(objDues.duesArray[objDueRowNumber].amount);

      // Show text
      document.querySelector('.input-dues-text').value = objDues.duesArray[objDueRowNumber].text;
    }
  }
}

function resetValues() {

  // Show dueid
  document.querySelector('.select-dues-dueId').value = 0;

  // Show condo
  document.querySelector('.select-dues-condoId').value = 0;

  // Show date
  document.querySelector('.input-dues-date').value = '';

  // Show amount
  document.querySelector('.input-dues-amount').value = '';

  // Show text
  document.querySelector('.input-dues-text').value = '';

  document.querySelector('.select-dues-dueId').disabled = true;
  document.querySelector('.button-dues-delete').disabled = true;
  document.querySelector('.button-dues-insert').disabled = true;
}

// Show selected dues
function showDues() {

  // Validate search filter
  if (validateFilter()) {

    // Header
    let htmlColumnLine =
      '<div class="columnHeaderCenter">Linje</div><br>';
    let htmlColumnDate =
      '<div class="columnHeaderRight">Dato</div><br>';
    let htmlColumnCondoName =
      '<div class="columnHeaderRight">Leilighet</div><br>';
    let htmlColumnAccountName =
      '<div class="columnHeaderLeft">Konto</div><br>';
    let htmlcolumnAmount =
      '<div class="columnHeaderRight">Beløp</div><br>';
    let htmlColumnText =
      '<div class="columnHeaderLeft">Tekst</div><br>';

    let sumAmount = 0;
    let lineNumber = 0;

    objDues.duesArray.forEach((due) => {

      lineNumber++;

      // check if the number is odd
      const colorClass = (lineNumber % 2 !== 0) ? "green" : "";

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
            class="${colorClass} leftCell one-line"
          >
            ${condoName}    
          </div >
        `;

      // account name
      const accountName =
         objAccounts.getAccountName(due.accountId);
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
    document.querySelector('.div-dues-columnLine').innerHTML =
      htmlColumnLine;

    // Show date
    document.querySelector('.div-dues-columnDate').innerHTML =
      htmlColumnDate;

    // Show condo name
    document.querySelector('.div-dues-columnCondoName').innerHTML =
      htmlColumnCondoName;

    // Show account name
    document.querySelector('.div-dues-columnAccountName').innerHTML =
      htmlColumnAccountName;


    // Show amount
    document.querySelector('.div-dues-columnAmount').innerHTML =
      htmlcolumnAmount;

    // Show text
    document.querySelector('.div-dues-columnText').innerHTML =
      htmlColumnText;
  }
}

// Check for valid filter
function validateFilter() {

  // Check account
  const accountId =
    document.querySelector('.select-dues-filterAccountId').value;
  const validAccountId =
    validateNumber(accountId, 1, 999999999, 'dues-filterAccountId', 'Konto');

  const condoId =
    document.querySelector('.select-dues-filterCondoId').value;
  const validCondoId =
    validateNumber(accountId, 1, 999999999, 'dues-filterCondoId', 'Leilighet');

  const fromDate =
    document.querySelector('.input-dues-filterFromDate').value;
  const validFromDate =
    validateNorDate(fromDate, 'dues-filterFromDate', 'Fra dato');

  const toDate =
    document.querySelector('.input-dues-filterToDate').value;
  const validToDate =
    validateNorDate(toDate, 'dues-filterToDate', 'Til dato');

  return (validAccountId && validCondoId && validFromDate && validToDate) ? true : false;
}

// Get selected dues
function getSelectedDues() {

  const condoId =
    Number(document.querySelector('.select-dues-filterCondoId').value);
  const accountId =
    Number(document.querySelector('.select-dues-filterAccountId').value);

  const fromDate =
    Number(convertDateToISOFormat(document.querySelector('.input-dues-filterFromDate').value));
  const toDate =
    Number(convertDateToISOFormat(document.querySelector('.input-dues-filterToDate').value));

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
  objDues.duesArrayCreated =
    false;
}