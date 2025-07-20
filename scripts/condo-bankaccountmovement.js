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

testMode();

let isEventsCreated =
  false;

objBankAccountMovement.menu();
objBankAccountMovement.markSelectedMenu('Bankkonto transaksjoner');

let socket;
socket =
  connectingToServer();

// Validate user/password
const objUserPassword =
  JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  showLoginError('bankaccountmovement-login');
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

    // Sends a request to the server to get bank accounts
    SQLquery =
      `
        SELECT * FROM bankaccount
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY bankAccountId;
      `;

    updateMySql(SQLquery, 'bankaccount', 'SELECT');

    // Sends a request to the server to get suppliers
    SQLquery =
      `
        SELECT * FROM supplier
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY supplierId;
      `;

    updateMySql(SQLquery, 'supplier', 'SELECT');

    // Sends a request to the server to get user bank accounts
    SQLquery =
      `
        SELECT * FROM userbankaccount
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY userBankAccountId;
      `;

    updateMySql(SQLquery, 'userbankaccount', 'SELECT');

    // Sends a request to the server to get bank account movements
    let fromDate =
      "01.01." + String(today.getFullYear());
    fromDate =
      convertDateToISOFormat(fromDate);
    let toDate =
      getCurrentDate();
    toDate =
      convertDateToISOFormat(toDate);
    SQLquery =
      `
        SELECT * FROM bankaccountmovement
        WHERE condominiumId = ${objUserPassword.condominiumId}
        AND date BETWEEN '${fromDate}' AND '${toDate}' 
        ORDER BY date DESC;
      `;
    updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
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

        case 'bankaccount':

          // bank account table
          console.log('bankaccountTable');

          bankAccountArray =
            objInfo.tableArray;
          break;

        case 'supplier':

          // supplier table
          console.log('supplierTable');

          supplierArray =
            objInfo.tableArray;
          break;

        case 'userbankaccount':

          // user bank account table
          console.log('userbankaccountTable');

          userbankAccountArray =
            objInfo.tableArray;
          break;

        case 'bankaccountmovement':

          // user bank account table
          console.log('bankaccountmovementTable');

          // array including objects with bank account movement information
          bankAccountMovementArray =
            objInfo.tableArray;

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

          const condoId =
            Number(document.querySelector('.select-bankaccountmovement-filterCondoId').value);
          const accountId =
            Number(document.querySelector('.select-bankaccountmovement-filterAccountId').value);

          // Show bank account movements Id
          objBankAccountMovement.showAllSelectedAccountMovements('bankaccountmovement-bankAccountMovementId', bankAccountMovementId, fromDate, toDate, condoId, accountId);

          showValues(bankAccountMovementId);

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
        case 'bankaccountmovement':

          // Sends a request to the server to get bank Account Movements one more time
          SQLquery =
            `
              SELECT * FROM bankaccountmovement
              WHERE condominiumId = ${objUserPassword.condominiumId}
              ORDER BY date DESC;
            `;
          updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
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
    if (event.target.classList.contains('button-bankaccountmovement-update')) {

      const bankAccountMovementId =
        Number(document.querySelector('.select-bankaccountmovement-bankAccountMovementId').value);
      updateBankAccountMovement(bankAccountMovementId);
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
          ORDER BY date DESC;
        `;
      updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
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
  objBankAccountMovement.showButton('bankaccountmovement-update', 'Oppdater');

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

    const condoId =
      Number(document.querySelector('.select-bankaccountmovement-filterCondoId').value);
    const accountId =
      Number(document.querySelector('.select-bankaccountmovement-filterAccountId').value);

    bankAccountMovementArray.forEach((bankAccountMovement) => {

      /*
      if (bankAccountMovement.bankAccountMovementId >= 0) {
        if (Number(bankAccountMovement.date) >= Number(fromDate) && Number(bankAccountMovement.date) <= Number(toDate)) {
          if (bankAccountMovement.condoId === condoId || condoId === 999999999) {
            if (bankAccountMovement.accountId === accountId || accountId === 999999999) {
      */

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
        objBankAccount.getAccountName(bankAccountMovement.accountId);
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
    validateNumber(accountId, 1, 999999999, 'bankaccountmovement-filterAccountId', 'Konto');

  const fromDate =
    document.querySelector('.input-bankaccountmovement-filterFromDate').value;
  const validFromDate =
    validateNorDate(fromDate, 'bankaccountmovement-filterFromDate', 'Fra dato');

  const toDate =
    document.querySelector('.input-bankaccountmovement-filterToDate').value;
  const validToDate =
    validateNorDate(toDate, 'bankaccountmovement-filterToDate', 'Til dato');

  return (validAccountId && validCondoId && validFromDate && validToDate) ? true : false;
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
      formatAmountToOre(income);

    let payment =
      document.querySelector('.input-bankaccountmovement-payment').value;
    payment =
      formatAmountToOre(payment);

    let numberKWHour =
      document.querySelector('.input-bankaccountmovement-numberKWHour').value;
    numberKWHour =
      formatAmountToOre(numberKWHour);

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
            user = '${objUserPassword.email}',
            lastUpdate = '${lastUpdate}',
            condoId = '${condoId}',
            accountId = '${accountId}',
            income = '${income}',
            payment = '${payment}',
            numberKWHour  = '${numberKWHour}',
            date  = '${date}',
            text = '${text}'
          WHERE bankAccountMovementId = ${bankAccountMovementId};
        `;
      updateMySql(SQLquery, 'bankaccountmovement', 'UPDATE');
    } else {

      SQLquery =
        `
        INSERT INTO bankaccountmovement (
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
          'bankaccountmovement',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          ${condoId},
          ${accountId},
          '${income}',
          '${payment}',
          '${numberKWHour}',
          '${date}', 
          '${text}'
        );
      `;
      updateMySql(SQLquery, 'bankaccountmovement', 'INSERT');
    }

    document.querySelector('.select-bankaccountmovement-bankAccountMovementId').disabled =
      false;
    //document.querySelector('.select-bankaccountmovement-condoId').disabled =
    //  false;
    //document.querySelector('.select-bankaccountmovement-accountId').disabled =
    //  false;

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

  /*
  // Check condo Id
  const condoId =
    document.querySelector('.select-bankaccountmovement-condoId').value;
  const validCondoId =
    validateNumber(condoId, 0, 999999999, 'Leilighet');
  */

  const date =
    document.querySelector('.input-bankaccountmovement-date').value;
  const validDate =
    validateNorDate(date, 'bankaccountmovement-date', 'Dato');
  /*
  // Validate norwegian amounts
  const income =
    document.querySelector('.input-bankaccountmovement-income').value;
  const validIncome =
    objBankAccountMovement.validateAmount(income, 'bankaccountmovement-income', 'Inntekt');
 
  const payment =
    document.querySelector('.input-bankaccountmovement-payment').value;
  const validPayment =
    objBankAccountMovement.validateAmount(payment, 'bankaccountmovement-payment', 'Utgift');
 
  const numberKWHour =
    document.querySelector('.input-bankaccountmovement-numberKWHour').value;
  const validNumberKWHour =
    objBankAccountMovement.validateAmount(numberKWHour, 'bankaccountmovement-numberKWHour', 'Kilowatt/time');
 
  const text =
    document.querySelector('.input-bankaccountmovement-text').value;
  const validText =
    objBankAccountMovement.validateText(text, 'bankaccountmovement-text', 'Tekst');
  */
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
      SQLquery =
        `
          DELETE FROM bankaccountmovement
          WHERE bankAccountMovementId = ${bankAccountMovementId};
        `;

      // Client sends a request to the server
      updateMySql(SQLquery, 'bankaccountmovement', 'DELETE');
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
    convertDateToISOFormat(document.querySelector('.input-bankaccountmovement-filterFromDate').value);
  const toDate =
    convertDateToISOFormat(document.querySelector('.input-bankaccountmovement-filterToDate').value);

  let SQLquery;

  // Check if condo Id and account Id is selected
  if ((condoId === 999999999) && (accountId === 999999999)) {

    // Sends a request to the server to get selected bank account movements
    SQLquery =
      `
        SELECT * FROM bankaccountmovement
        WHERE condominiumId = ${objUserPassword.condominiumId}
        AND date BETWEEN '${fromDate}' AND '${toDate}' 
        ORDER BY date DESC;
      `;
  }

  // Check if condo Id and account Id is selected
  if ((condoId !== 999999999) && (accountId !== 999999999)) {

    // Sends a request to the server to get selected bank account movements
    SQLquery =
      `
        SELECT * FROM bankaccountmovement
        WHERE condominiumId = ${objUserPassword.condominiumId}
        AND date BETWEEN '${fromDate}' AND '${toDate}' 
        AND condoId = ${condoId}
        AND accountId = ${accountId}
        ORDER BY date DESC;
      `;
  }

  // Check if condo Id is selected but not account Id
  if ((condoId !== 999999999) && (accountId === 999999999)) {

    // Sends a request to the server to get selected bank account movements
    SQLquery =
      `
        SELECT * FROM bankaccountmovement
        WHERE condominiumId = ${objUserPassword.condominiumId}
        AND date BETWEEN '${fromDate}' AND '${toDate}' 
        AND condoId = ${condoId}
        ORDER BY date DESC;
      `;
  }

  // Check if account Id is selected but not condo Id
  if ((condoId === 999999999) && (accountId !== 999999999)) {

    // Sends a request to the server to get selected bank account movements
    SQLquery =
      `
        SELECT * FROM bankaccountmovement
        WHERE condominiumId = ${objUserPassword.condominiumId}
        AND date BETWEEN '${fromDate}' AND '${toDate}' 
        AND accountId = ${accountId}
        ORDER BY date DESC;
      `;
  }
  updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
}
