// Account movement search

// Activate objects
const now = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objSupplier = new Supplier('supplier');
const objUserBankAccount = new UserBankAccount('userbankaccount');
const objBankAccountMovement = new BankAccountMovement('bankaccountmovement');

testMode();

let isEventsCreated = false;

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
    SQLquery =
      `
        SELECT * FROM bankaccountmovement
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY bankaccountmovementId;
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
              ORDER BY bankAccountMovementId;
            `;
          updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
          break;
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
  }
}

// Make bank account movement events
function createEvents() {

  // Search for condo id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccountmovement-filterCondoId')) {

      // Show bank account movements
      showBankAccountMovements();
    }
  });

  // Search for account Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccountmovement-filterAccountId')) {

      // Show bank account movements
      showBankAccountMovements();
    }
  });

  // Search for from date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccountmovement-filterFromDate')) {

      // Show bank account movements
      showBankAccountMovements();
    }
  });

  // Search for to date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccountmovement-filterToDate')) {

      // Show bank account movements
      showBankAccountMovements();
    }
  });

  // Select line number
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccountmovement-lineNumber')) {

      // Show bank account movements
      const bankAccountMovementId =
        document.querySelector('.select-bankaccountmovement-lineNumber').value;

      showValues(bankAccountMovementId);
    }
  });

  // update bank account movement
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccountmovement-update')) {

      // update bank account movement
      updateBankAccountMovement();
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
      socket.send(SQLquery);
    }
  });
}

// Show filter for search
function showLeadingTextSearch() {

  // Show all condos
  let condoId = 0;
  if (condoArray.length > 0) {
    condoId =
      condoArray.at(-1).condoId;
  }
  objCondo.showAllCondos('bankaccountmovement-filterCondoId', condoId, 'Alle');

  // Show all accounts
  const accountId = accountArray.at(-1).accountId;
  objAccount.showAllAccounts('bankaccountmovement-filterAccountId', accountId, 'Alle');

  // Show from date
  objBankAccountMovement.showInput('bankaccountmovement-filterFromDate', 'Fra dato', 10, 'dd.mm.åååå');

  // Find bank account
  let date;
  const bankAccountRowNumber =
    bankAccountArray.findIndex(bankAccount => bankAccount.condominiumId === objUserPassword.condominiumId);
  if (bankAccountRowNumber !== -1) {
    openingDate =
      bankAccountArray[bankAccountRowNumber].openingBalanceDate;
    closingDate =
      bankAccountArray[bankAccountRowNumber].closingBalanceDate;
  }

  document.querySelector('.input-bankaccountmovement-filterFromDate').value =
    formatToNorDate(openingDate);

  // Show to date
  objBankAccountMovement.showInput('bankaccountmovement-filterToDate', 'Til dato', 10, 'dd.mm.åååå');
  document.querySelector('.input-bankaccountmovement-filterToDate').value =
    formatToNorDate(closingDate);
}

// Show values for bank Account Movement
function showLeadingText() {

  // Show bank Account Movement Id
  let bankAccountMovementId = 0;
  if (bankAccountMovementArray.length > 0) {
    bankAccountMovementId =
      bankAccountMovementArray.at(-1).bankAccountMovementId;
  }
  objBankAccountMovement.showAllBankAccountMovements('bankaccountmovement-lineNumber', bankAccountMovementId, '', 'Ingen er valgt');

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
  objBankAccountMovement.showInput('bankaccountmovement-date', 'Dato', 10, 'dd.mm.åååå');

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
  if (bankAccountMovementId > 1) {

    // Find object number in bank account movementId array
    const objBankAccountMovementRowNumber =
      bankAccountMovementArray.findIndex(bankAccountMovement => bankAccountMovement.bankAccountMovementId === Number(bankAccountMovementId));
    if (objBankAccountMovementRowNumber !== -1) {

      // Show line number
      //document.querySelector('.select-bankaccountmovement-lineNumber').value =
      //  bankAccountMovementArray[objBankAccountMovementRowNumber].bankAccountMovementId;

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

// Check for valid filter
function validateFilter() {

  // Check account movement
  const accountId =
    document.querySelector('.select-bankaccountmovement-filterAccountId').value;
  const validAccountId =
    validateNumber(accountId, 1, 999999999, 'Konto');

  const condoId =
    document.querySelector('.select-bankaccountmovement-filterCondoId').value;
  const validCondoId =
    validateNumber(condoId, 1, 999999999, 'Leilighet');

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

// Show bank account movements
function showBankAccountMovements() {

  // Validate search filter
  if (validateFilter()) {
    // Show account movement

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
    let htmlColumnText =
      '<div class="columnHeaderLeft">Tekst</div><br>';

    let sumIncome =
      0;
    let sumPayment =
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
      if (bankAccountMovement.bankAccountMovementId > 1) {
        if (Number(bankAccountMovement.date) >= Number(fromDate) && Number(bankAccountMovement.date) <= Number(toDate)) {
          if (bankAccountMovement.condoId === condoId || condoId === 999999999) {
            if (bankAccountMovement.accountId === accountId || accountId === 999999999) {

              lineNumber++;

              // check if the number is odd
              const colorClass =
                (lineNumber % 2 !== 0) ? "green" : "";

              // Line number
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
            }
          }
        }
      }
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

    // Show text
    document.querySelector('.div-bankaccountmovement-columnText').innerHTML =
      htmlColumnText;
  }
}

// Show all searched bank account movements
function showAllSearchedBankAccountMovements(className, bankAccountMovementId, alternativeSelect, alternativeSelect2) {

  let html =
    `
      <form
        id="bankAccountMovementId"
        action="/submit" 
        method="POST"
      >
        <label 
          class="label-${className}"
          for="bankAccountMovementId"
          id="bankAccountMovementId"
        >
          Velg kontobevegelse
        </label>
        <select 
          class="select-${className}" 
          id="bankAccountMovementId"
          name="bankAccountMovementId"
        >
    `;

  let lineNumber =
    0;

  let fromDate =
    document.querySelector('.input-bankaccountmovement-fromDate').value;
  fromDate =
    convertDateToISOFormat(fromDate);
  let toDate =
    document.querySelector('.input-bankaccountmovement-toDate').value;
  toDate =
    convertDateToISOFormat(toDate);

  const condoId =
    Number(document.querySelector('.select-bankaccountmovement-condoId').value);
  const accountId =
    Number(document.querySelector('.select-bankaccountmovement-accountId').value);

  // Check if bank account movement array is empty
  const numberOfRows =
    bankAccountMovementArray.length;
  if (numberOfRows > 0) {
    bankAccountMovementArray.forEach((bankAccountMovement) => {
      if (bankAccountMovement.bankAccountMovementId > 1) {
        if (Number(bankAccountMovement.date) >= Number(fromDate) && Number(bankAccountMovement.date) <= Number(toDate)) {
          if (bankAccountMovement.condoId === condoId || condoId === 999999999) {
            if (bankAccountMovement.accountId === accountId || accountId === 999999999) {

              lineNumber++;

              html +=
                `
                  <option 
                    value=${bankAccountMovement.bankAccountMovementId}
                    selected
                  >
                    ${lineNumber} - ${bankAccountMovement.text} 
                  </option>
              `;
            } else {

              html +=
                `
                  <option 
                    value="${bankAccountMovement.bankAccountMovementId}">
                    ${lineNumber} - ${bankAccountMovement.text} 
                  </option>
              `;
            }
          }
        }
      }
    });
  } else {

    html +=
      `
        <option 
          value="0" 
          selected
        >
          Ingen bankkonto transaksjoner
        </option>
      `;
  }

  // Alternative select
  if (alternativeSelect && (numberOfRows > 1)) {
    html +=
      `
        <option 
          value=0
          selected
        >
          ${alternativeSelect}
        </option>
      `;
  }

  // Alternative select
  if (alternativeSelect2 && (numberOfRows > 1)) {
    html +=
      `
        <option 
          value=0
          selected
        >
          ${alternativeSelect2}
        </option>
      `;
  }

  html +=
    `
        </select >
      </form>
    `;

  document.querySelector(`.div-${className}`).innerHTML =
    html;
}


function updateBankAccountMovement(bankAccountMovementId) {

  let SQLquery = "";
  let isUpdated = false;

  // Check values
  if (validateValues()) {

    const lineNumber =
      document.querySelector('.select-bankaccountmovement-lineNumber').value;
    const condoId =
      document.querySelector('.select-bankaccountmovement-condoId').value;
    const accountId =
      document.querySelector('.select-bankaccountmovement-accountId').value;
    const date =
      document.querySelector('.input-bankaccountmovement-date').value;
    const icncome =
      document.querySelector('.input-bankaccountmovement-income').value;
    const payment =
      document.querySelector('.input-bankaccountmovement-payment').value;
    const numberKWHour =
      document.querySelector('.input-bankaccountmovement-numberKWHour').value;
    const text =
      document.querySelector('.input-bankaccountmovement-text').value;

    // current date
    const lastUpdate =
      now.toISOString();

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
            numberKWHour  = '${payment}',
            date  = '${date}',
            text = '${text}'
          WHERE bankAccountMovementId = ${bankAccountMovementId};
        `;

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
    }

    // Client sends a request to the server
    socket.send(SQLquery);

    document.querySelector('.select-bankaccountmovement-lineNumber').disabled =
      false;
    document.querySelector('.select-bankaccountmovement-condoId').disabled =
      false;
    document.querySelector('.select-bankaccountmovement-accountId').disabled =
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
  const accountId =
    document.querySelector('.select-bankaccountmovement-accountId').value;
  const validAccountId =
    validateNumber(accountId, 1, 999999999, 'Konto');

  // Check condo Id
  const condoId =
    document.querySelector('.select-bankaccountmovement-condoId').value;
  const validCondoId =
    validateNumber(condoId, 0, 999999999, 'Leilighet');

  const date =
    document.querySelector('.input-bankaccountmovement-date').value;
  const validDate =
    validateNorDate(date, 'bankaccountmovement-date', 'Dato');

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

  return (validCondoId && validAccountId && validDate && validIncome && validPayment && validNumberKWHour && validText) ? true : false;
}

function deleteBankAccountMovement() {

  let SQLquery = "";

  // Check for valid Bank Account Movement Id
  const bankAccountMovementId =
    Number(document.querySelector('.select-bankaccountmovement-lineNumber').value);
  if (bankAccountMovementId > 1) {

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
      socket.send(SQLquery);
    }
  }
}

function resetValues() {

  document.querySelector('.select-bankaccountmovement-lineNumber').value =
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

  document.querySelector('.select-bankaccountmovement-lineNumber').disabled =
    true;
  document.querySelector('.select-bankaccountmovement-condoId').disabled =
    true;
  document.querySelector('.select-bankaccountmovement-accountId').disabled =
    true;
  document.querySelector('.button-bankaccountmovement-insert').disabled =
    true;
  document.querySelector('.button-bankaccountmovement-delete').disabled =
    true;
}