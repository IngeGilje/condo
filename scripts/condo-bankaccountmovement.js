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

let socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  showLoginError('bankaccountmovement-login');
} else {

  // Send a message to the server
  socket.onopen = () => {
    // Sends a request to the server to get all users
    const SQLquery =
      `
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

      console.log('userTable');

      // user array including objects with user information
      userArray = JSON.parse(message);

      // Sends a request to the server to get all condos
      const SQLquery =
        `
          SELECT * FROM condo
          ORDER BY name;
        `;
      socket.send(SQLquery);
    }

    // Create condo array including objets
    if (message.includes('"tableName":"condo"')) {

      console.log('condoTable');

      // array including objects with bank Account information
      condoArray = JSON.parse(message);

      const SQLquery =
        `
          SELECT * FROM userbankaccount
          ORDER BY userBankAccountId;
        `;
      socket.send(SQLquery);
    }

    // Create user bank account array including objets
    if (message.includes('"tableName":"userbankaccount"')) {

      console.log('userbankaccountTable');

      // array including objects with user bank Account information
      userBankAccountArray = JSON.parse(message);

      const SQLquery =
        `
          SELECT * FROM supplier
          ORDER BY supplierId;
        `;
      socket.send(SQLquery);
    }

    // Create supplier array including objets
    if (message.includes('"tableName":"supplier"')) {

      console.log('supplierTable');

      // array including objects with supplier information
      supplierArray = JSON.parse(message);

      const SQLquery =
        `
          SELECT * FROM bankaccount
          ORDER BY name;
        `;
      socket.send(SQLquery);
    }

    // Create bank account array including objets
    if (message.includes('"tableName":"bankaccount"')) {

      console.log('bankAccountTable');

      // array including objects with bank account information
      bankAccountArray = JSON.parse(message);

      //objAccount.getAccounts(socket);
      const SQLquery =
        `
          SELECT * FROM account
          ORDER BY accountId;
        `;
      socket.send(SQLquery);
    }

    // Create account array including objets
    if (message.includes('"tableName":"account"')) {

      // bankaccountmovement table
      console.log('accountTable');

      // array including objects with bank account movement information
      accountArray = JSON.parse(message);
      const SQLquery =
        `
          SELECT * FROM bankaccountmovement
          ORDER BY date DESC;
        `;
      socket.send(SQLquery);
    }

    // Create bank account movement array including objets
    if (message.includes('"tableName":"bankaccountmovement"')) {

      // bank account movement table
      console.log('bankaccountmovementTable');

      // array including objects with bank account movement information
      bankAccountMovementArray =
        JSON.parse(message);

      const bankAccountMovementId =
        objBankAccountMovement.getSelectedBankAccountMovementId('select-bankaccountmovement-maintBankAccountMovementId');

      // Show leading text search
      showLeadingTextSearch(bankAccountMovementId);

      // Show bank account movements 
      showBankAccountMovements();

      // Show leading text maintenance
      showLeadingTextMaint(bankAccountMovementId);

      //showValuesMaint(bankAccountMovementId);

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
          SELECT * FROM bankaccountmovement
          ORDER BY date DESC;
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

// Make bank account movement events
function createEvents() {

  // Select condo
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccountmovement-condoId')) {

      // Show bank account movements
      showBankAccountMovements();
    }
  });

  // Select account Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccountmovement-accountId')) {

      // Show bank account movements
      showBankAccountMovements();
    }
  });

  // Search for account movement
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccountmovement-maintBankAccountMovementId')) {

      const bankAccountMovementId =
        Number(document.querySelector('.select-bankaccountmovement-maintBankAccountMovementId').value);

      // Show bank account movement
      showValuesMaint(bankAccountMovementId);
    }
  });

  // Search for bank account movements
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccountmovement-search')) {

      // Show bank account movements
      showBankAccountMovements();
    }
  });

  // update bank account movement
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccountmovement-maintUpdate')) {

      // update bank account movement
      updateBankAccountMovement();
    }
  });

  // Reset bank account movement values
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccountmovement-maintInsert')) {

      resetValues();
    }
  });

  // Delete bank account movement
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccountmovement-maintDelete')) {

      deleteBankAccountMovement();
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccountmovement-maintCancel')) {

      // Sends a request to the server to get all bank account movements
      const SQLquery =
        `
          SELECT * FROM bankaccountmovement
          ORDER BY date DESC;
        `;
      socket.send(SQLquery);
    }
  });
}

// Show filter for search
function showLeadingTextSearch() {

  // Show all condos
  const condoId = condoArray.at(-1).condoId;
  objCondo.showAllCondos('bankaccountmovement-condoId', condoId, 'Alle');

  // Show all accounts
  const accountId = accountArray.at(-1).accountId;
  objAccount.showAllAccounts('bankaccountmovement-accountId', accountId, 'Alle');

  // Show from date
  objBankAccountMovement.showInput('bankaccountmovement-fromDate', 'Fra dato', 10, 'dd.mm.åååå');
  document.querySelector('.input-bankaccountmovement-fromDate').value =
    '01.01.2025';

  // Show to date
  objBankAccountMovement.showInput('bankaccountmovement-toDate', 'Til dato', 10, 'dd.mm.åååå');
  document.querySelector('.input-bankaccountmovement-toDate').value =
    getCurrentDate();

  // show search button
  objBankAccountMovement.showLabelButton('bankaccountmovement-search', 'Søk');
}

// Show values for bank Account MovementId
function showLeadingTextMaint(bankAccountMovementId) {

  // Show all searched bank account movements
  showAllSearchedBankAccountMovements('bankaccountmovement-maintBankAccountMovementId', bankAccountMovementId, '', 'Ingen er valgt');

  // Show all condos
  const condoId =
    condoArray.at(-1).condoId;
  objCondo.showAllCondos('bankaccountmovement-maintCondoId', condoId, '', 'Ingen er valgt');

  // Show all accounts
  const accountId =
    accountArray.at(-1).accountId;
  objAccount.showAllAccounts('bankaccountmovement-maintAccountId', accountId, '', 'Ingen er valgt');

  // Show date
  objBankAccountMovement.showInput('bankaccountmovement-maintDate', 'Dato', 10, 'dd.mm.åååå');

  // Show income
  objBankAccountMovement.showInput('bankaccountmovement-maintIncome', 'Inntekt', 10, '');

  // Show kilo watt per hour
  objBankAccountMovement.showInput('bankaccountmovement-maintNumberKWHour', 'Kilowatt/time', 10, '');

  // Show text
  objBankAccountMovement.showInput('bankaccountmovement-maintText', 'Tekst', 50, '');

  // Show payment
  objBankAccountMovement.showInput('bankaccountmovement-maintPayment', 'Utgift', 10, '');

  // show update button
  objBankAccountMovement.showButton('bankaccountmovement-maintUpdate', 'Oppdater');

  // show insert button
  objBankAccountMovement.showButton('bankaccountmovement-maintInsert', 'Ny');

  // show delete button
  objBankAccountMovement.showButton('bankaccountmovement-maintDelete', 'Slett');

  // show cancel button
  objBankAccountMovement.showButton('bankaccountmovement-maintCancel', 'Avbryt');
}

// Show values for bank account movementId
function showValuesMaint(bankAccountMovementId) {

  // Check for valid bank Account Movement Id
  if (bankAccountMovementId > 1) {

    // Find object number in bank account movementId array
    const objBankAccountMovementRowNumber =
      bankAccountMovementArray.findIndex(bankAccountMovement => bankAccountMovement.bankAccountMovementId === bankAccountMovementId);
    if (objBankAccountMovementRowNumber !== -1) {

      // Show all bank account movements
      document.querySelector('.select-bankaccountmovement-maintBankAccountMovementId').value =
        bankAccountMovementArray[objBankAccountMovementRowNumber].bankAccountMovementId;

      // Show condo id
      document.querySelector('.select-bankaccountmovement-maintCondoId').value =
        bankAccountMovementArray[objBankAccountMovementRowNumber].condoId;

      // Show account
      document.querySelector('.select-bankaccountmovement-maintAccountId').value =
        bankAccountMovementArray[objBankAccountMovementRowNumber].accountId;

      // Show date
      const date =
        bankAccountMovementArray[objBankAccountMovementRowNumber].date;
      document.querySelector('.input-bankaccountmovement-maintDate').value =
        formatToNorDate(date);

      // Show income
      const income =
        bankAccountMovementArray[objBankAccountMovementRowNumber].income;
      document.querySelector('.input-bankaccountmovement-maintIncome').value =
        formatOreToKroner(income);

      // Show payment
      const payment =
        bankAccountMovementArray[objBankAccountMovementRowNumber].payment;
      document.querySelector('.input-bankaccountmovement-maintPayment').value =
        formatOreToKroner(payment);


      // Show kilo watt per hour
      const numberKWHour =
        bankAccountMovementArray[objBankAccountMovementRowNumber].numberKWHour;
      document.querySelector('.input-bankaccountmovement-maintNumberKWHour').value =
        formatOreToKroner(numberKWHour);

      // Show text
      const text =
        bankAccountMovementArray[objBankAccountMovementRowNumber].text;
      document.querySelector('.input-bankaccountmovement-maintText').value =
        text;

      objBankAccountMovement.showButton('bankaccountmovement-maintCancel', 'Avbryt');
    }
  }
}

// Check for valid search values
function validateValues() {

  // Check account movement
  const accountId =
    document.querySelector('.select-bankaccountmovement-accountId').value;
  const validAccountId =
    validateNumber(accountId, 1, 999999999, 'Konto');

  const condoId =
    document.querySelector('.select-bankaccountmovement-condoId').value;
  const validCondoId =
    validateNumber(condoId, 1, 999999999, 'Leilighet');

  const fromDate =
    document.querySelector('.input-bankaccountmovement-fromDate').value;
  const validFromDate =
    validateNorDate(fromDate, 'bankaccountmovement-fromDate', 'Fra dato');

  const toDate =
    document.querySelector('.input-bankaccountmovement-toDate').value;
  const validToDate =
    validateNorDate(toDate, 'bankaccountmovement-toDate', 'Til dato');

  return (validAccountId && validCondoId && validFromDate && validToDate) ? true : false;
}

// Show bank account movements
function showBankAccountMovements() {

  // Validate search filter
  if (validateValues()) {
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

    let sumIncome =
      0;
    let sumPayment =
      0;
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
                    class="leftCell ${colorClass}"
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
                    class="leftCell ${colorClassAccountName}"
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
  if (numberOfRows > 1) {
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
  if (validateMaintValues()) {

    const bankAccountMovementId =
      document.querySelector('.select-bankaccountmovement-maintBankAccountMovementId').value;
    const condoId =
      document.querySelector('.select-bankaccountmovement-maintCondoId').value;
    const accountId =
      document.querySelector('.select-bankaccountmovement-maintAccountId').value;
    const date =
      document.querySelector('.input-bankaccountmovement-maintDate').value;
    const icncome =
      document.querySelector('.input-bankaccountmovement-maintIncome').value;
    const payment =
      document.querySelector('.input-bankaccountmovement-maintPayment').value;
    const numberKWHour =
      document.querySelector('.input-bankaccountmovement-maintNumberKWHour').value;
    const text =
      document.querySelector('.input-bankaccountmovement-maintText').value;

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

    document.querySelector('.select-bankaccountmovement-maintBankAccountMovementId').disabled =
      false;
    document.querySelector('.button-bankaccountmovement-maintDelete').disabled =
      false;
    document.querySelector('.button-bankaccountmovement-maintInsert').disabled =
      false;

    isUpdated = true;
  }
  return isUpdated;
}

// Check for valid bank Account values
function validateMaintValues() {

  // Check bank account movement id
  const bankAccountMovementId =
    document.querySelector('.select-bankaccountmovement-maintBankAccountMovementId').value;
  const validBankAccountMovementId =
    validateNumber(bankAccountMovementId, 0, 999999999, 'Kontobevegelse');

  // Check account Id
  const accountId =
    document.querySelector('.select-bankaccountmovement-maintAccountId').value;
  const validAccountId =
    validateNumber(accountId, 1, 999999999, 'Konto');

  // Check condo Id
  const condoId =
    document.querySelector('.select-bankaccountmovement-maintCondoId').value;
  const validCondoId =
    validateNumber(condoId, 0, 999999999, 'Leilighet');

  const date =
    document.querySelector('.input-bankaccountmovement-maintDate').value;
  const validDate =
    validateNorDate(date, 'bankaccountmovement-maintDate', 'Dato');

  // Validate norwegian amounts
  const income =
    document.querySelector('.input-bankaccountmovement-maintIncome').value;
  const validIncome =
    objBankAccountMovement.validateAmount(income, 'bankaccountmovement-maintIncome', 'Inntekt');

  const payment =
    document.querySelector('.input-bankaccountmovement-maintPayment').value;
  const validPayment =
    objBankAccountMovement.validateAmount(payment, 'bankaccountmovement-maintPayment', 'Utgift');

  const numberKWHour =
    document.querySelector('.input-bankaccountmovement-maintNumberKWHour').value;
  const validNumberKWHour =
    objBankAccountMovement.validateAmount(numberKWHour, 'bankaccountmovement-maintNumberKWHour', 'Kilowatt/time');

  const text =
    document.querySelector('.input-bankaccountmovement-maintText').value;
  const validText =
    objBankAccountMovement.validateText(text, 'bankaccountmovement-maintText', 'Tekst');

  return (validCondoId && validAccountId && validDate && validIncome && validPayment && validNumberKWHour && validText) ? true : false;
}

function deleteBankAccountMovement() {

  let SQLquery = "";

  // Check for valid Bank Account Movement Id
  const bankAccountMovementId =
    Number(document.querySelector('.select-bankaccountmovement-maintBankAccountMovementId').value);
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

  document.querySelector('.select-bankaccountmovement-maintBankAccountMovementId').value =
    '';

  document.querySelector('.select-bankaccountmovement-maintCondoId').value =
    '';

  document.querySelector('.select-bankaccountmovement-maintAccountId').value =
    '';

  document.querySelector('.input-bankaccountmovement-maintIncome').value =
    '';

  document.querySelector('.input-bankaccountmovement-maintPayment').value =
    '';

  document.querySelector('.input-bankaccountmovement-maintNumberKWHour').value =
    '';

  document.querySelector('.input-bankaccountmovement-maintText').value =
    '';

  document.querySelector('.select-bankaccountmovement-maintBankAccountMovementId').disabled =
    true;
  document.querySelector('.button-bankaccountmovement-maintInsert').disabled =
    true;
  document.querySelector('.button-bankaccountmovement-maintDelete').disabled =
    true;
}