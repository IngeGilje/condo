// Account movement search

// Activate objects
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
objBankAccountMovement.markSelectedMenu('Bankkontobevegelser');

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
        ORDER BY date;
      `;
      socket.send(SQLquery);
    }

    // Create bank account movement array including objets
    if (message.includes('"tableName":"bankaccountmovement"')) {

      // bank account movement table
      console.log('bankaccountmovementTable');

      // array including objects with bank account movement information
      bankAccountMovementArray = JSON.parse(message);

      // Show leading text
      showLeadingText();

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
}

// Make bank account movement events
function createEvents() {

  // Select condo
  document.addEventListener('change', (event) => {

    if (event.target.classList.contains('select-bankaccountmovement-condoId')) {
    }
  });

  // Search for account movement
  document.addEventListener('click', (event) => {

    // Show bank account movements
    showAccountMovements();
  });
}

// Show filter for search
function showLeadingText() {

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
  objBankAccountMovement.showButton('bankaccountmovement-search', 'Søk');
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
    checkNorDate(fromDate, 'bankaccountmovement-fromDate', 'Fra dato');

  const toDate =
    document.querySelector('.input-bankaccountmovement-toDate').value;
  const validToDate =
    checkNorDate(toDate, 'bankaccountmovement-toDate', 'Til dato');

  return (validAccountId && validCondoId && validFromDate && validToDate) ? true : false;
}

// Show all account movvement
function showAccountMovements() {

  // Validate search filter
  if (validateValues()) {
    // Show account movement

    // Header
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

    let sumIncome = 0;
    let sumPayment = 0;

    let fromDate = document.querySelector('.input-bankaccountmovement-fromDate').value;
    fromDate = convertDateToISOFormat(fromDate);
    let toDate = document.querySelector('.input-bankaccountmovement-toDate').value;
    toDate = convertDateToISOFormat(toDate);

    const condoId = Number(document.querySelector('.select-bankaccountmovement-condoId').value);
    const accountId = Number(document.querySelector('.select-bankaccountmovement-accountId').value);

    bankAccountMovementArray.forEach((bankAccountMovement) => {
      if (bankAccountMovement.bankAccountMovementId > 1) {
        if (Number(bankAccountMovement.date) >= Number(fromDate) && Number(bankAccountMovement.date) <= Number(toDate)) {
          if (bankAccountMovement.condoId === condoId || condoId === 999999999) {
            if (bankAccountMovement.accountId === accountId || accountId === 999999999) {

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
                    class="leftCell"
                  >
                    ${condoName}
                  </div >
                `;

              // account name
              const accountName =
                objBankAccount.getAccountName(bankAccountMovement.accountId);
              htmlColumnAccountName +=
                `
                  <div
                    class="leftCell"
                  >
                    ${accountName}    
                  </div >
                `;

              // date
              const date =
                convertToEurDateFormat(bankAccountMovement.date);
              htmlColumnDate +=
                `
                  <div
                    class="rightCell"
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
                    class="rightCell"
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
                    class="rightCell"
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