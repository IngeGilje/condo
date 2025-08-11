// Account movement search

// Activate objects
const today =
  new Date();
const objUser =
  new User('user');
const objCondo =
  new Condo('condo');
const objAccount =
  new Account('account');
const objBankAccount =
  new BankAccount('bankaccount');
const objSupplier =
  new Supplier('supplier');
const objUserBankAccount =
  new UserBankAccount('userbankaccount');
const objBankAccountMovement =
  new BankAccountMovement('bankaccountmovement');


let userArrayCreated =
  false
let condoArrayCreated =
  false
let accountArrayCreated =
  false
let bankAccountArrayCreated =
  false
let supplierArrayCreated =
  false
let userBankAccountArrayCreated =
  false
let bankAccountMovementArrayCreated =
  false

testMode();

// Redirect application after 2 hours
setTimeout(() => {
  window.location.href = 'http://localhost/condo-login.html'
}, 2 * 60 * 60 * 1000);

let isEventsCreated

objBankAccountMovement.menu();
objBankAccountMovement.markSelectedMenu('Banktransaksjoner');

let socket;
socket =
  connectingToServer();

// Validate user/password
const objUserPassword =
  JSON.parse(sessionStorage.getItem('user'));
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
    condoArrayCreated =
      false;

    // Sends a request to the server to get accounts
    SQLquery =
      `
        SELECT * FROM account
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY accountId;
      `;

    updateMySql(SQLquery, 'account', 'SELECT');
    accountArrayCreated =
      false;

    // Sends a request to the server to get bank accounts
    SQLquery =
      `
        SELECT * FROM bankaccount
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY bankAccountId;
      `;

    updateMySql(SQLquery, 'bankaccount', 'SELECT');
    bankAccountArrayCreated =
      false;

    // Sends a request to the server to get suppliers
    SQLquery =
      `
        SELECT * FROM supplier
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY supplierId;
      `;

    updateMySql(SQLquery, 'supplier', 'SELECT');
    supplierArrayCreated =
      false;

    // Sends a request to the server to get user bank accounts
    SQLquery =
      `
        SELECT * FROM userbankaccount
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY userBankAccountId;
      `;

    updateMySql(SQLquery, 'userbankaccount', 'SELECT');
    userBankAccountArrayCreated =
      false;

    // Sends a request to the server to get bank account movements
    let fromDate =
      "01.01." + String(today.getFullYear());
    fromDate =
      Number(convertDateToISOFormat(fromDate));
    let toDate =
      getCurrentDate();
    toDate =
      Number(convertDateToISOFormat(toDate));
    SQLquery =
      `
        SELECT * FROM bankaccountmovement
        WHERE condominiumId = ${objUserPassword.condominiumId}
        AND deleted <> 'Y'
        AND date BETWEEN ${fromDate} AND ${toDate} 
        ORDER BY date DESC;
      `;
    updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
    bankAccountMovementArrayCreated =
      false;
  };

  // Handle incoming messages from server
  socket.onmessage = (event) => {

    let messageFromServer =
      event.data;

    // Converts a JavaScript Object Notation (JSON) string into an object
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

        case 'bankaccount':

          // bank account table
          console.log('bankaccountTable');

          bankAccountArray =
            objInfo.tableArray;
          bankAccountArrayCreated =
            true;
          break;

        case 'supplier':

          // supplier table
          console.log('supplierTable');

          supplierArray =
            objInfo.tableArray;
          supplierArrayCreated =
            true;
          break;

        case 'userbankaccount':

          // user bank account table
          console.log('userbankaccountTable');

          userbankAccountArray =
            objInfo.tableArray;
          userBankAccountArrayCreated =
            true;
          break;

        case 'bankaccountmovement':

          // user bank account table
          console.log('bankaccountmovementTable');

          // array including objects with bank account movement information
          bankAccountMovementArray =
            objInfo.tableArray;
          bankAccountMovementArrayCreated =
            true;

          if (userArrayCreated
            && condoArrayCreated
            && accountArrayCreated
            && bankAccountArrayCreated
            && supplierArrayCreated
            && userBankAccountArrayCreated
            && bankAccountMovementArrayCreated) {

            // Show leading text search
            showLeadingTextSearch();

            // Show leading text maintenance
            showLeadingText();

            // Show bank account movements 
            showBankAccountMovements();

            // Get selected Bank Account Movement Id
            bankAccountMovementId =
              objBankAccountMovement.getSelectedBankAccountMovementId('select-bankaccountmovement-bankAccountMovementId');

            const fromDate =
              convertDateToISOFormat(document.querySelector('.input-bankaccountmovement-filterFromDate').value);
            const toDate =
              convertDateToISOFormat(document.querySelector('.input-bankaccountmovement-filterToDate').value);
            const amount =
              convertDateToISOFormat(document.querySelector('.input-bankaccountmovement-filterAmount').value);
            const condoId =
              Number(document.querySelector('.select-bankaccountmovement-filterCondoId').value);
            const accountId =
              Number(document.querySelector('.select-bankaccountmovement-filterAccountId').value);

            // Show bank account movements Id
            objBankAccountMovement.showAllSelectedAccountMovements('bankaccountmovement-bankAccountMovementId', bankAccountMovementId, fromDate, toDate, condoId, accountId);

            showValues(bankAccountMovementId);

            // Make events
            isEventsCreated = (isEventsCreated) ? true : createEvents();
          }
          break;
      }
    }

    if (objInfo.CRUD === 'UPDATE' || objInfo.CRUD === 'INSERT' || objInfo.CRUD === 'DELETE') {

      switch (objInfo.tableName) {
        case 'bankaccountmovement':

          getSelectedBankAccountMovements();
          break;
      };
    }

    // Handle errors
    socket.onerror = (error) => {

      // Close socket on error and let onclose handle reconnection
      socket.close();

      // Handle disconnection
      socket.onclose = () => {
      }
    }
  }
}

// Make bank account movement events
function createEvents() {

  // Search for condo id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccountmovement-filterCondoId')) {

      getSelectedBankAccountMovements();

      // Show bank account movements
      showBankAccountMovements();
    }
  });

  // Search for account Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccountmovement-filterAccountId')) {

      getSelectedBankAccountMovements();
    }
  });

  // Search for from date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-bankaccountmovement-filterFromDate')) {

      getSelectedBankAccountMovements();
    }
  });

  // Search for to date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-bankaccountmovement-filterToDate')) {

      getSelectedBankAccountMovements();
    }
  });

  // Search for amount
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-bankaccountmovement-filterAmount')) {

      document.querySelector('.input-bankaccountmovement-filterAmount').value =
        formatAmountToEuroFormat(document.querySelector('.input-bankaccountmovement-filterAmount').value);
      getSelectedBankAccountMovements();
    }
  });

  // Select bank account movement Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccountmovement-bankAccountMovementId')) {

      // Show bank account movements
      const bankAccountMovementId =
        Number(document.querySelector('.select-bankaccountmovement-bankAccountMovementId').value);
      showValues(bankAccountMovementId);
    }
  });

  // update bank account movement
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccountmovement-save')) {

      const bankAccountMovementId =
        Number(document.querySelector('.select-bankaccountmovement-bankAccountMovementId').value);
      updateBankAccountMovement(bankAccountMovementId);
      document.querySelector('.select-bankaccountmovement-filterCondoId').value =
        Number(document.querySelector('.select-bankaccountmovement-condoId').value);
      document.querySelector('.select-bankaccountmovement-filterAccountId').value =
        Number(document.querySelector('.select-bankaccountmovement-accountId').value);
    }
  });

  // Reset bank account movement values
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccountmovement-insert')) {

      resetValues();
    }
  });

  // Delete bank account movement
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccountmovement-delete')) {

      deleteBankAccountMovement();
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccountmovement-cancel')) {

      // Sends a request to the server to get all bank account movements
      const SQLquery =
        `
          SELECT * FROM bankaccountmovement
          WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
          ORDER BY date DESC;
        `;
      updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
      bankAccountMovementArrayCreated =
        false;
    }
  });
}

// Show filter for search
function showLeadingTextSearch() {

  // Show all condos
  const condoId =
    (isClassDefined('select-bankaccountmovement-filterCondoId')) ? Number(document.querySelector('.select-bankaccountmovement-filterCondoId').value) : 0;
  objCondo.showAllCondos('bankaccountmovement-filterCondoId', condoId, 'Alle');

  // Show all accounts
  const accountId =
    (isClassDefined('select-bankaccountmovement-filterAccountId')) ? Number(document.querySelector('.select-bankaccountmovement-filterAccountId').value) : 0;
  objAccount.showAllAccounts('bankaccountmovement-filterAccountId', accountId, 'Alle');

  // Show from date
  if (!isClassDefined('input-bankaccountmovement-filterFromDate')) {
    objBankAccountMovement.showInput('bankaccountmovement-filterFromDate', 'Fra dato', 10, 'dd.mm.åååå');
  }

  // Show to date
  if (!isClassDefined('input-bankaccountmovement-filterToDate')) {
    objBankAccountMovement.showInput('bankaccountmovement-filterToDate', 'Til dato', 10, 'dd.mm.åååå');
  }

  // Show amount
  if (!isClassDefined('input-bankaccountmovement-filterAmount')) {
    objBankAccountMovement.showInput('bankaccountmovement-filterAmount', 'Beløp', 10, 'Alle');
  }

  // Check for filter from date
  let date =
    document.querySelector('.input-bankaccountmovement-filterFromDate').value;
  if (!validateEuroDateFormat(date)) {

    // From date is not ok
    const year =
      String(today.getFullYear());
    document.querySelector('.input-bankaccountmovement-filterFromDate').value =
      "01.01." + year;
  }

  // Check for filter to date
  date =
    document.querySelector('.input-bankaccountmovement-filterToDate').value;
  if (!validateEuroDateFormat(date)) {

    // To date is not ok
    document.querySelector('.input-bankaccountmovement-filterToDate').value =
      getCurrentDate();
  }

  // Check for filter amount
  amount =
    document.querySelector('.input-bankaccountmovement-filterAmount').value;
  if (!objBankAccountMovement.validateAmount(amount)) {

    // Amount is not ok
    document.querySelector('.input-bankaccountmovement-filterAmount').value =
      '';
  }
}

// Show values for bank Account Movement
function showLeadingText() {

  // Show bank Account Movement Id
  bankAccountMovementId =
    objBankAccountMovement.getSelectedBankAccountMovementId('select-bankaccountmovement-bankAccountMovementId');
  objBankAccountMovement.showAllBankAccountMovements('bankaccountmovement-bankAccountMovementId', bankAccountMovementId, '', 'Ingen er valgt');

  // Show all condos
  let condoId = 0;
  if (condoArray.length > 0) {
    condoId =
      condoArray.at(-1).condoId;
  }
  objCondo.showAllCondos('bankaccountmovement-condoId', condoId, '', 'Ingen er valgt');

  // Show all accounts
  let accountId = 0;
  if (accountArray.length > 0) {
    accountId =
      accountArray.at(-1).accountId;
  }
  objAccount.showAllAccounts('bankaccountmovement-accountId', accountId, '', 'Ingen er valgt');

  // Show date
  objBankAccountMovement.showInput('bankaccountmovement-date', '* Dato', 10, 'dd.mm.åååå');

  // Show income
  objBankAccountMovement.showInput('bankaccountmovement-income', 'Inntekt', 10, '');

  // Show kilo watt per hour
  objBankAccountMovement.showInput('bankaccountmovement-numberKWHour', 'Kilowatt/time', 10, '');

  // Show text
  objBankAccountMovement.showInput('bankaccountmovement-text', 'Tekst', 50, '');

  // Show payment
  objBankAccountMovement.showInput('bankaccountmovement-payment', 'Utgift', 10, '');

  // show update button
  objBankAccountMovement.showButton('bankaccountmovement-save', 'Lagre');

  // show insert button
  objBankAccountMovement.showButton('bankaccountmovement-insert', 'Ny');

  // show delete button
  objBankAccountMovement.showButton('bankaccountmovement-delete', 'Slett');

  // show cancel button
  objBankAccountMovement.showButton('bankaccountmovement-cancel', 'Avbryt');
}

// Show values for bank account movementId
function showValues(bankAccountMovementId) {

  // Check for valid bank Account Movement Id
  if (bankAccountMovementId >= 0) {

    // Find object number in bank account movementId array
    const objBankAccountMovementRowNumber =
      bankAccountMovementArray.findIndex(bankAccountMovement => bankAccountMovement.bankAccountMovementId === bankAccountMovementId);
    if (objBankAccountMovementRowNumber !== -1) {

      // Show bank account movement id
      document.querySelector('.select-bankaccountmovement-bankAccountMovementId').value =
        bankAccountMovementArray[objBankAccountMovementRowNumber].bankAccountMovementId;

      // Show condo id
      document.querySelector('.select-bankaccountmovement-condoId').value =
        bankAccountMovementArray[objBankAccountMovementRowNumber].condoId;

      // Show account
      document.querySelector('.select-bankaccountmovement-accountId').value =
        bankAccountMovementArray[objBankAccountMovementRowNumber].accountId;

      // Show date
      const date =
        bankAccountMovementArray[objBankAccountMovementRowNumber].date;
      document.querySelector('.input-bankaccountmovement-date').value =
        formatToNorDate(date);

      // Show income
      const income =
        bankAccountMovementArray[objBankAccountMovementRowNumber].income;
      document.querySelector('.input-bankaccountmovement-income').value =
        formatOreToKroner(income);

      // Show payment
      const payment =
        bankAccountMovementArray[objBankAccountMovementRowNumber].payment;
      document.querySelector('.input-bankaccountmovement-payment').value =
        formatOreToKroner(payment);

      // Show kilo watt per hour
      const numberKWHour =
        bankAccountMovementArray[objBankAccountMovementRowNumber].numberKWHour;
      document.querySelector('.input-bankaccountmovement-numberKWHour').value =
        formatOreToKroner(numberKWHour);

      // Show text
      const text =
        bankAccountMovementArray[objBankAccountMovementRowNumber].text;
      document.querySelector('.input-bankaccountmovement-text').value =
        text;

      objBankAccountMovement.showButton('bankaccountmovement-cancel', 'Avbryt');
    }
  }
}

// Show selected bank account movements
function showBankAccountMovements() {

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
    let htmlColumnIncome =
      '<div class="columnHeaderRight">Inntekt</div><br>';
    let htmlColumnPayment =
      '<div class="columnHeaderRight">Utgift</div><br>';
    let htmlColumnKiloWattHour =
      '<div class="columnHeaderRight">Kilovatttimer</div><br>';
    let htmlColumnText =
      '<div class="columnHeaderLeft">Tekst</div><br>';

    let sumIncome =
      0;
    let sumPayment =
      0;
    let sumKiloWattHour =
      0;
    let lineNumber =
      0;

    let fromDate =
      document.querySelector('.input-bankaccountmovement-filterFromDate').value;
    fromDate =
      convertDateToISOFormat(fromDate);
    let toDate =
      document.querySelector('.input-bankaccountmovement-filterToDate').value;
    toDate =
      convertDateToISOFormat(toDate);

    let amount =
      document.querySelector('.input-bankaccountmovement-filterAmount').value;
    amount =
      Number(formatKronerToOre(amount));

    const condoId =
      Number(document.querySelector('.select-bankaccountmovement-filterCondoId').value);
    const accountId =
      Number(document.querySelector('.select-bankaccountmovement-filterAccountId').value);

    bankAccountMovementArray.forEach((bankAccountMovement) => {

      lineNumber++;

      // check if the number is odd
      const colorClass =
        (lineNumber % 2 !== 0) ? "green" : "";

      // bank Account Movement Id
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
      if (bankAccountMovement.condoId) {
        const condoId =
          Number(bankAccountMovement.condoId);
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
        objAccount.getAccountName(bankAccountMovement.accountId);
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
        formatToNorDate(bankAccountMovement.date);
      htmlColumnDate +=
        `
          <div
            class="rightCell ${colorClass}"
          >
            ${date}
          </div >
        `;

      // income
      const income =
        formatOreToKroner(bankAccountMovement.income);
      htmlColumnIncome +=
        `
          <div
            class="rightCell ${colorClass}"
          >
            ${income}
          </div>
        `;

      // payment
      const payment =
        formatOreToKroner(bankAccountMovement.payment);
      htmlColumnPayment +=
        `
          <div
            class="rightCell ${colorClass}"
          >
            ${payment}
          </div>
        `;

      // KiloWatt/Hour
      const kiloWattHour =
        formatOreToKroner(bankAccountMovement.numberKWHour);
      htmlColumnKiloWattHour +=
        `
          <div
            class="rightCell ${colorClass}"
          >
            ${kiloWattHour}
          </div>
        `;

      // text
      htmlColumnText +=
        `
          <div
            class="leftCell ${colorClass} one-line"
          >
            ${bankAccountMovement.text}
          </div>
        `;

      // accumulate
      sumIncome +=
        Number(bankAccountMovement.income);
      sumPayment +=
        Number(bankAccountMovement.payment);
      sumKiloWattHour +=
        Number(bankAccountMovement.numberKWHour);
    });

    // Sum line

    // income
    income =
      formatOreToKroner(sumIncome);
    htmlColumnIncome +=
      `
        <div
          class="sumCellRight"
        >
          ${income}
        </div >
      `;

    // payment
    payment =
      formatOreToKroner(sumPayment);
    htmlColumnPayment +=
      `
        <div
          class="sumCellRight"
        >
          ${payment}
        </div >
      `;

    // KiloWatt/Hour
    kiloWattHour =
      formatOreToKroner(sumKiloWattHour);
    htmlColumnKiloWattHour +=
      `
        <div
          class="sumCellRight"
        >
          ${kiloWattHour}
        </div >
      `;

    // Show line number
    document.querySelector('.div-bankaccountmovement-columnLine').innerHTML =
      htmlColumnLine;

    // Show condo name
    document.querySelector('.div-bankaccountmovement-columnCondoName').innerHTML =
      htmlColumnCondoName;

    // Show bank account name
    document.querySelector('.div-bankaccountmovement-columnAccountName').innerHTML =
      htmlColumnAccountName;

    // Show date
    document.querySelector('.div-bankaccountmovement-columnDate').innerHTML =
      htmlColumnDate;

    // Show income
    document.querySelector('.div-bankaccountmovement-columnIncome').innerHTML =
      htmlColumnIncome;

    // Show payment
    document.querySelector('.div-bankaccountmovement-columnPayment').innerHTML =
      htmlColumnPayment;

    // Show KiloWatt/hour
    document.querySelector('.div-bankaccountmovement-columnNumberKWHour').innerHTML =
      htmlColumnKiloWattHour;

    // Show text
    document.querySelector('.div-bankaccountmovement-columnText').innerHTML =
      htmlColumnText;
  }
}

// Check for valid filter
function validateFilter() {

  // Check account movement
  const accountId =
    document.querySelector('.select-bankaccountmovement-filterAccountId').value;
  const validAccountId =
    validateNumber(accountId, 1, 999999999, 'bankaccountmovement-filterAccountId', 'Konto');

  const condoId =
    document.querySelector('.select-bankaccountmovement-filterCondoId').value;
  const validCondoId =
    validateNumber(accountId, 1, 999999999, 'bankaccountmovement-filterCondoId', 'Leilighet');

  const fromDate =
    document.querySelector('.input-bankaccountmovement-filterFromDate').value;
  const validFromDate =
    validateNorDate(fromDate, 'bankaccountmovement-filterFromDate', 'Fra dato');

  const toDate =
    document.querySelector('.input-bankaccountmovement-filterToDate').value;
  const validToDate =
    validateNorDate(toDate, 'bankaccountmovement-filterToDate', 'Til dato');

  const amount =
    (document.querySelector('.input-bankaccountmovement-filterAmount').value) ? document.querySelector('.input-bankaccountmovement-filterAmount').value : '0';
  const validAmount =
    objBankAccountMovement.validateAmount(amount, 'bankaccountmovement-filterAmount', 'Beløp');

  return (validAccountId && validCondoId && validFromDate && validToDate && validAmount) ? true : false;
}

function updateBankAccountMovement(bankAccountMovementId) {

  let SQLquery = "";
  let isUpdated = false;

  // Check values
  if (validateValues()) {

    const condoId =
      Number(document.querySelector('.select-bankaccountmovement-condoId').value);
    const accountId =
      Number(document.querySelector('.select-bankaccountmovement-accountId').value);

    let date =
      document.querySelector('.input-bankaccountmovement-date').value;
    date =
      convertDateToISOFormat(date);

    let income =
      document.querySelector('.input-bankaccountmovement-income').value;
    income =
      Number(formatAmountToOre(income));

    let payment =
      document.querySelector('.input-bankaccountmovement-payment').value;
    payment =
      formatAmountToOre(payment);

    let numberKWHour =
      document.querySelector('.input-bankaccountmovement-numberKWHour').value;
    numberKWHour =
      Number(formatAmountToOre(numberKWHour));

    const text =
      document.querySelector('.input-bankaccountmovement-text').value;

    // current date
    const lastUpdate =
      today.toISOString();

    // Check if bank account movement id exist
    const objBankAccountMovementRowNumber =
      bankAccountMovementArray.findIndex(bankAccountMovement => bankAccountMovement.bankAccountMovementId === bankAccountMovementId);
    if (objBankAccountMovementRowNumber !== -1) {

      // Update bank Account Movement table
      SQLquery =
        `
          UPDATE bankaccountmovement
          SET 
            deleted = '${deleted}',
            user = '${objUserPassword.email}',
            lastUpdate = '${lastUpdate}',
            condoId = '${condoId}',
            accountId = '${accountId}',
            income = ${income},
            payment = ${payment},
            numberKWHour  = '${numberKWHour}',
            date  = ${date},
            text = '${text}'
          WHERE bankAccountMovementId = ${bankAccountMovementId};
        `;
      updateMySql(SQLquery, 'bankaccountmovement', 'UPDATE');
    } else {

      SQLquery =
        `
        INSERT INTO bankaccountmovement (
          deleted,
          tableName,
          condominiumId,
          user,
          lastUpdate,
          condoId,
          accountId,
          income,
          payment,
          numberKWHour,
          date,
          text
        )
        VALUES (
          'N',
          'bankaccountmovement',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          ${condoId},
          ${accountId},
          ${income},
          ${payment},
          '${numberKWHour}',
          ${date}, 
          '${text}'
        );
      `;
      updateMySql(SQLquery, 'bankaccountmovement', 'INSERT');
    }

    document.querySelector('.select-bankaccountmovement-bankAccountMovementId').disabled =
      false;
    document.querySelector('.button-bankaccountmovement-delete').disabled =
      false;
    document.querySelector('.button-bankaccountmovement-insert').disabled =
      false;
    isUpdated = true;
  }
  return isUpdated;
}

// Check for valid bank account values
function validateValues() {


  // Check account Id
  let accountId =
    document.querySelector('.select-bankaccountmovement-accountId').value;
  accountId =
    (accountId) ? Number(accountId) : 0;
  const validAccountId =
    validateNumber(accountId, 1, 999999999, 'bankaccountmovement-accountId', 'Konto');

  const date =
    document.querySelector('.input-bankaccountmovement-date').value;
  const validDate =
    validateNorDate(date, 'bankaccountmovement-date', 'Dato');

  return (validAccountId && validDate) ? true : false;
}

function deleteBankAccountMovement() {

  let SQLquery = "";

  // Check for valid Bank Account Movement Id
  const bankAccountMovementId =
    Number(document.querySelector('.select-bankaccountmovement-bankAccountMovementId').value);
  if (bankAccountMovementId >= 0) {

    // Check if Bank Account Movement Id exist
    const objBankAccountMovementRowNumber =
      bankAccountMovementArray.findIndex(bankAccountMovement => bankAccountMovement.bankAccountMovementId === bankAccountMovementId);
    if (objBankAccountMovementRowNumber !== -1) {

      // Delete table row
      /*
      SQLquery =
        `
          DELETE FROM bankaccountmovement
          WHERE bankAccountMovementId = ${bankAccountMovementId};
        `;
      */
      // current date
      const lastUpdate =
        today.toISOString();
      SQLquery =
        `
        UPDATE bankaccountmovement
          SET 
            deleted = 'Y',
            user = '${objUserPassword.email}',
            lastUpdate = '${lastUpdate}',
          WHERE bankAccountMovementId = ${bankAccountMovementId};
        `;
      updateMySql(SQLquery, 'bankaccountmovement', 'UPDATE');
    }
  }
}

function resetValues() {

  document.querySelector('.select-bankaccountmovement-bankAccountMovementId').value =
    '';

  document.querySelector('.select-bankaccountmovement-condoId').value =
    '';

  document.querySelector('.select-bankaccountmovement-accountId').value =
    '';

  document.querySelector('.input-bankaccountmovement-income').value =
    '';

  document.querySelector('.input-bankaccountmovement-payment').value =
    '';

  document.querySelector('.input-bankaccountmovement-numberKWHour').value =
    '';

  document.querySelector('.input-bankaccountmovement-text').value =
    '';

  document.querySelector('.select-bankaccountmovement-bankAccountMovementId').disabled =
    true;
  document.querySelector('.button-bankaccountmovement-insert').disabled =
    true;
  document.querySelector('.button-bankaccountmovement-delete').disabled =
    true;
}

// Get selected bank account movements
function getSelectedBankAccountMovements() {

  const condoId =
    Number(document.querySelector('.select-bankaccountmovement-filterCondoId').value);
  const accountId =
    Number(document.querySelector('.select-bankaccountmovement-filterAccountId').value);

  const fromDate =
    Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovement-filterFromDate').value));
  const toDate =
    Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovement-filterToDate').value));

  const amount =
    Number(formatAmountToOre(document.querySelector('.input-bankaccountmovement-filterAmount').value));

  let SQLquery =
    `
      SELECT * FROM bankaccountmovement
      WHERE condominiumId = ${objUserPassword.condominiumId}
      AND deleted <> 'Y'
      AND date BETWEEN ${fromDate} AND ${toDate}
    `;

  if (condoId !== 999999999) {
    SQLquery +=
      `
        AND condoId = ${condoId}
      `;
  }

  if (accountId !== 999999999) {
    SQLquery +=
      `
        AND accountId = ${accountId}
      `;
  }

  if (amount !== 0) {
    SQLquery +=
      `
        AND income = ${amount} OR payment = ${amount}
      `;
  }

  SQLquery +=
    `
      ORDER BY date DESC, income DESC;
    `;

  updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
  bankAccountMovementArrayCreated =
    false;
}
