// Import of bank transaction file 

// Activate objects
const objCondo = new Condo('condo');
const objAccountMovement = new AccountMovement('accountmovement');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objUser = new User('user');
const objDue = new Due('due');
const objIncome = new Income('income');
const objSupplier = new Supplier('supplier');
const objImportFile = new ImportFile('importfile');

let importFileArray = [];
let textFile;

console.log('importFileArray:', importFileArray);

const objUserPassword = JSON.parse(localStorage.getItem('user'));

// Connection to a server
let socket;
switch (objUser.serverStatus) {

  // Web server
  case 1: {
    socket = new WebSocket('ws://ingegilje.no:7000');
    break;
  }
  // Test web server/ local web server
  case 2: {
    socket = new WebSocket('ws://localhost:7000');
    break;
  }
  // Test server/ local test server
  case 3: {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const hostname = window.location.hostname || 'localhost';
    socket = new WebSocket(`${protocol}://${hostname}:6050`); break;
    break;
  }
  default:
    break;
}

let isEventsCreated = false;

objImportFile.menu();
objImportFile.markSelectedMenu('Importer kontobevegelser');

// Send a message to the server
socket.onopen = () => {

  // Sends a request to the server to get all users
  const SQLquery = `
    SELECT * FROM user
    ORDER BY userId;
  `;
  socket.send(SQLquery);
};

// Handle incoming messages from server
socket.onmessage = (event) => {

  let message = event.data;

  // Create user array including objets
  if (message.includes('"NOK"')) {

    createImportFileArray(message);
    showAccountMovement();
    showLeadingText();
    showValues(1);
  }

  // Create user array including objets
  if (message.includes('"tableName":"user"')) {

    console.log('userTable');

    // user array including objects with user information
    userArray = JSON.parse(message);

    // Validate user/password
    (objUser.validateUser(objUserPassword.email, objUserPassword.password)) ? '' : window.location.href('http://localhost/condo-login.html');

    // username and password is ok
    // Sends a request to the server to get all condos
    const SQLquery = `
      SELECT * FROM condo
      ORDER BY condoName;
    `;
    socket.send(SQLquery);
  }

  // Create condo array including objets
  if (message.includes('"tableName":"condo"')) {

    console.log('condoTable');

    // array including objects with condo information
    condoArray = JSON.parse(message);

    const SQLquery = `
      SELECT * FROM bankaccount
      ORDER BY bankAccountId;
    `;
    socket.send(SQLquery);
  }

  // Create bank account array including objets
  if (message.includes('"tableName":"bankaccount"')) {

    console.log('bankaccountTable');

    // array including objects with bank account information
    bankAccountArray = JSON.parse(message);

    const SQLquery = `
      SELECT * FROM due
      ORDER BY dueId;
    `;
    socket.send(SQLquery);
  }

  // Create due array including objets
  if (message.includes('"tableName":"due"')) {

    console.log('dueTable');

    // array including objects with due information
    dueArray = JSON.parse(message);

    const SQLquery = `
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

    const SQLquery = `
      SELECT * FROM account
      ORDER BY accountId;
    `;
    socket.send(SQLquery);
  }

  // Create account array including objets
  if (message.includes('"tableName":"account"')) {

    // account table
    console.log('accountTable');

    // array including objects with account information
    accountArray = JSON.parse(message);

    // Get all income rows
    const SQLquery = `
      SELECT * FROM accountmovement
      ORDER BY accountmovementId;
    `;
    socket.send(SQLquery);
  }

  // Create accountmovement array including objets
  if (message.includes('"tableName":"accountmovement"')) {

    // accountmovement table
    console.log('accountmovementTable');

    // array including objects with accountmovement information
    accountMovementArray = JSON.parse(message);

    // Get all income rows
    const SQLquery = `
      SELECT * FROM income
      ORDER BY date;
    `;
    socket.send(SQLquery);
  }

  // Create income array including objets
  if (message.includes('"tableName":"income"')) {

    // income table
    console.log('incomeTable');

    // array including objects with income information
    incomeArray = JSON.parse(message);

    // Show leading text
    //showButtons();

    // Sends a request to the server to get all bank account
    // transactions
    socket.send('Message: Test request');

    // Make events
    if (!isEventsCreated) {

      createEvents();
      isEventsCreated = true;
    }
  }

  // Check for update, delete ...
  if (message.includes('"affectedRows":1')) {

    console.log('affectedRows');
  }
}

// Handle errors
socket.onerror = (error) => {

  // Close socket on error and let onclose handle reconnection
  socket.close();
}

// Handle disconnection
socket.onclose = () => {
}

// Make importfile events
function createEvents() {

  // Select import file id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-importfile-importFileId')) {
      const importFileId = Number(document.querySelector('.select-importfile-importFileId').value);
      if (importFileId > 0) {
        showValues(importFileId);
      }
    }
  });

  // Update import file array
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-importfile-updateImportArray')) {

      // Get row number import file array
      const rowNumber =
        Number(document.querySelector(".select-importfile-importFileId").value);

      showAccountMovement();
      showValues(rowNumber);
    };
  });

  // Update bank account movements
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-importfile-updateBankAccountMovements')) {

      updateBankAccountMovement();
    };
  });
}

// Show leading text for income
function showLeadingText() {

  // Show all all account movements to update
  objImportFile.showImportFile('importfile-importFileId', 0);

  // Show date
  objImportFile.showInput('importfile-date', '* Dato', 10, 'dd.mm.åååå');

  // Show all condos
  objCondo.showAllCondos('importfile-condoId', 0);

  // Show all accounts
  objAccount.showAllAccounts('importfile-accountId', 0);

  // Show income
  objImportFile.showInput('importfile-income', '* Inntekst', 10, '');

  // Show payment
  objImportFile.showInput('importfile-payment', '* Utgift', 10, '');

  // Show text
  objImportFile.showInput('importfile-text', '* Tekst', 50, '');

  // Show button
  objImportFile.showButton('importfile-updateImportArray', 'Oppdater');

  // Show button for update of bank account movement
  objImportFile.showButton('importfile-updateBankAccountMovements', 'Oppdater bank konto bevegelser');
}

// Show values for import file
function showValues(rowNumber) {

  // validate row number
  if (rowNumber > 0) {
    rowNumber--
  } else {
    rowNumber = 0;
  }

  // Show selected condo
  document.querySelector('.select-importfile-condoId').value =
    importFileArray[rowNumber].condoId;

  // Show selected account
  document.querySelector('.select-importfile-accountId').value =
    importFileArray[rowNumber].accountId;

  // Show date
  document.querySelector('.input-importfile-date').value =
    importFileArray[rowNumber].accountingDate;

  // Show income
  document.querySelector('.input-importfile-income').value =
    importFileArray[rowNumber].income;

  // Show payment
  document.querySelector('.input-importfile-payment').value =
    importFileArray[rowNumber].payment;

  // Show text
  document.querySelector('.input-importfile-text').value =
    importFileArray[rowNumber].text;
}

function deleteIncomeRow() {

  let SQLquery = "";

  // Check for valid income Id
  const incomeId = Number(document.querySelector('.select-importfile-income').value);

  // Check for valid income Id
  if (incomeId > 0) {

    // Check if income exist
    const objectNumberIncome = importFileArray.findIndex(income => income.incomeId === incomeId);
    if (objectNumberIncome >= 0) {

      // Delete table
      SQLquery = `
        DELETE FROM income
        WHERE incomeId = ${incomeId};
      `;
    }
    // Client sends a request to the server
    socket.send(SQLquery);

    // Get all income rows
    const SQLquery = `
      SELECT * FROM income
      ORDER BY date;
    `;
    socket.send(SQLquery);
  }
}

function resetValues() {

  document.querySelector('.select-importfile-income').value =
    '';
  document.querySelector('.input-importfile-payment').value =
    '';
  document.querySelector('.input-importfile-date').value =
    '';
  document.querySelector('.input-importfile-text').value =
    '';

  document.querySelector('.select-importfile-importFileId').disabled =
    true;
  document.querySelector('.button-importfile-delete').disabled =
    true;
  document.querySelector('.button-importfile-new').disabled =
    true;
}

function showAccountMovement() {

  let sumColumnIncome = 0;
  let sumColumnPayment = 0;
  let rowNumber = 0;

  let htmlColumnChange =
    '<div class="columnHeaderCenter">Linje</div><br>';
  let htmlColumnAccountingDate =
    '<div class="columnHeaderRight">Dato</div><br>';
  let htmlColumnCondoName =
    '<div class="columnHeaderRight">Condo</div><br>';
  let htmlColumnAccountName =
    '<div class="columnHeaderRight">Konto</div><br>';
  let htmlColumnIncome =
    '<div class="columnHeaderRight">Inntekt</div><br>';
  let htmlColumnPayment =
    '<div class="columnHeaderRight">Utgift</div><br>';
  let htmlColumnText =
    '<div class="columnHeaderLeft">Tekst</div><br>';

  importFileArray.forEach((importFile) => {

    rowNumber++;

    //check if the number is odd
    const colorClass = (rowNumber % 2 !== 0) ? "green" : "";
    htmlColumnChange +=
      `
        <div
          class="centerCell 
          ${colorClass}
          "
        >
          ${rowNumber}
        </div>
      `;

    htmlColumnAccountingDate +=
      `
        <div 
          class="rightCell
          ${colorClass}
          "
        >
          ${importFile.accountingDate}
        </div>
      `;

    // Condo name
    let condoName = "-";
    const objectNumberCondo = condoArray.findIndex(condo => condo.condoId === importFile.condoId);
    if (objectNumberCondo > 0) {

      condoName = condoArray[objectNumberCondo].condoName;
    }

    htmlColumnCondoName +=
      `
        <div
          class="rightCell
          ${colorClass}
          "
        >
          ${condoName}
        </div>
      `;

    // Account name
    let accountName = "-";
    const objectNumberAccount = accountArray.findIndex(account => account.accountId === importFile.accountId);
    if (objectNumberAccount > 0) {

      accountName = accountArray[objectNumberAccount].name;

      htmlColumnAccountName +=
        `
        <div
          class="rightCell
          ${colorClass}
          "
        >
          ${importFile.accountId} - ${accountName}
        </div>
      `;
    } else {
      htmlColumnAccountName +=
        `
        <div class="rightCell
          ${colorClass}
          "
        >
          ${accountName}
        </div>
      `;
    }

    const income =
      formatFromOreToKroner(importFile.income);
    htmlColumnIncome +=
      `
        <div class="rightCell
          ${colorClass}
          "
        >
          ${income}
        </div>
      `;

    const payment =
      formatFromOreToKroner(importFile.payment);
    htmlColumnPayment +=
      `
        <div class=
          "
            rightCell
            ${colorClass}
          "
        >
          ${payment}
        </div>
      `;

    // Text has to fit into the column
    let text = truncateText(importFile.text, 'div-importfile-columnText');
    text = (text === "") ? "-" : text;
    htmlColumnText +=
      `
        <div
          class=
          "
            leftCell
            ${colorClass}
          "
        >
          ${text}
        </div>
      `;

    // Accomulate

    // income
    const numericIncome = Number(importFile.income.replace(",", ".")) * 100;
    sumColumnIncome += Number(numericIncome);

    // payment
    const numericPayment = Number(importFile.payment.replace(",", ".")) * 100;
    sumColumnPayment += Number(numericPayment);
  });

  // Sum row
  htmlColumnChange +=
    `
      <div>
      </div>
    `;
  htmlColumnAccountingDate +=
    `
      <div>
      </div>
    `;

  const income =
    formatFromOreToKroner(sumColumnIncome);
  htmlColumnIncome +=
    `
      <div
        class=
          "
            sumCellRight
          "
      >
          ${income}
      </div>
    `;

  const payment =
    formatFromOreToKroner(sumColumnPayment);
  htmlColumnPayment +=
    `
      <div class=
        "
          sumCellRight
        "
      >
        ${payment}
      </div>
    `;

  htmlColumnText +=
    `
      <div>
      </div>
    `;

  // Show columns
  document.querySelector(".div-importfile-columnChange").innerHTML =
    htmlColumnChange;
  document.querySelector(".div-importfile-columnAccountingDate").innerHTML =
    htmlColumnAccountingDate;
  document.querySelector(".div-importfile-columnCondoName").innerHTML =
    htmlColumnCondoName;
  document.querySelector(".div-importfile-columnAccountName").innerHTML =
    htmlColumnAccountName;
  document.querySelector(".div-importfile-columnIncome").innerHTML =
    htmlColumnIncome;
  document.querySelector(".div-importfile-columnPayment").innerHTML =
    htmlColumnPayment;
  document.querySelector(".div-importfile-columnText").innerHTML =
    htmlColumnText;
}

// Find account movement Id
function getAccountMovementId(condoId, accountId, amount, accountDate, text) {

  let accountmovementId = -1;
  accountMovementArray.forEach((accountMovement) => {
    if ((accountMovement.condoId === condoId)
      && (accountMovement.accountId === accountId)
      && (accountMovement.amount === amount)
      && (accountMovement.accountDate === accountDate)
      && (accountMovement.text === text)) {

      accountmovementId = accountMovement.accountMovementId;
    }
  });
  return accountmovementId;
}

// Create array for bank account movement
function createImportFileArray(fileContent) {

  let importFileId = 0;

  textFile = fileContent.split(/\r?\n/);
  textFile.forEach((record) => {

    [accountingDate, Rentedato, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      record.split(';');

    // Check for valid date
    // validate the dd.mm.yyyy (European date format) format
    if (validateEuroDateFormat(accountingDate)) {

      // condo id
      let condoId = 0;
      const objectNumberUser = userArray.findIndex(user => user.bankAccount === fromBankAccount);
      if (objectNumberUser > 0) {

        condoId = userArray[objectNumberUser].condoId;
      }
      if (condoId === 0) {

        // Check the due table for amount (monthly fee)
        let formatedIncome = formatKronerToOre(income);
        const objectNumberDue = dueArray.findIndex(due => due.amount === formatedIncome);
        if (objectNumberDue > 0) {
          condoId = dueArray[objectNumberDue].condoId;
        }
      }

      // remove first and last " in text
      text = text.replace(/^"|"$/g, '');
      if (text === '') {

        text = toAccount;
      }

      // Account id
      accountId = 0;
      const objectNumberSupplier = supplierArray.findIndex(supplier => supplier.bankAccount === fromBankAccount);
      if (objectNumberSupplier > 0) {

        accountId = supplierArray[objectNumberSupplier].accountId;
      }

      importFileId++;

      const objbBankAccountMovement = {
        importFileId: importFileId,
        accountingDate: accountingDate,
        condoId: condoId,
        accountId: accountId,
        income: income,
        payment: payment,
        text: text
      };

      importFileArray.push(objbBankAccountMovement);
    }
  });
}

// Update Bank Account Movement table
function updateBankAccountMovement() {

  importFileArray.forEach((record) => {

    // Update income and bank Account Movement table
    updateIncomeRow(record.importFileId);

    // Update payment and bank Account Movement table
    updatePaymentRow(record.importFileId);
  });

  // Update opening balance
  updateOpeningBalance();
}

function updateIncomeRow(rowNumber) {

  // validate row number
  if (rowNumber > 0) {
    rowNumber--;
  } else {
    rowNumber = 0;
  }

  if ((importFileArray[rowNumber].income) !== '') {

    let SQLquery = '';

    const now = new Date();
    const lastUpdate = now.toISOString();

    const condoId =
      ((Number(importFileArray[rowNumber].condoId)) === 0)
        ? 1
        : Number(importFileArray[rowNumber].condoId);

    const accountId =
      ((Number(importFileArray[rowNumber].accountId)) === 0)
        ? 1
        : Number(importFileArray[rowNumber].accountId);

    const amount =
      formatKronerToOre(importFileArray[rowNumber].income);

    const date =
      convertDateToISOFormat(importFileArray[rowNumber].accountingDate);

    const text =
      importFileArray[rowNumber].text;

    /*
    // Check if income exist
    const objectNumberIncome = incomeArray.findIndex(income => income.incomeId === incomeId);
    if (objectNumberIncome > 0) {

      // Find current values for income to update
      const accountmovementCondoId = incomeArray[objectNumberIncome].condoId;
      const accountmovementAccountId = incomeArray[objectNumberIncome].accountId;
      const accountmovementAmount = incomeArray[objectNumberIncome].amount;
      const accountmovementDate = incomeArray[objectNumberIncome].accountingDate;
      const accountmovementText = incomeArray[objectNumberIncome].text;

      // Update income table
      SQLquery = `
        UPDATE income
        SET 
          user = '${objUserPassword.email}',
          lastUpdate = '${lastUpdate}',
          condoId = ${condoId},
          accountId = ${accountId},
          amount = '${amount}',
          date = '${date}',
          text = '${text}'
        WHERE incomeId = ${incomeId};
      `;

      // Client sends a request to the server
      socket.send(SQLquery);

      // Find accountmovement Id
      const accountMovementId = getAccountMovementId(
        accountmovementCondoId,
        accountmovementAccountId,
        accountmovementAmount,
        accountmovementDate,
        accountmovementText
      );

      if (accountMovementId >= 0) {
        // Update accountmovement
        SQLquery = `
        UPDATE accountmovement
        SET 
          condominiumId = ${objUserPassword.condominiumId},
          user = '${objUserPassword.email}',
          lastUpdate = '${lastUpdate}',
          condoId = ${condoId},
          accountId = ${accountId},
          amount = '${amount}',
          date = '${date}',
          text = '${text}'
        WHERE accountMovementId = ${accountMovementId};
      `;

        // Client sends a request to the server
        socket.send(SQLquery);
      }

    } else {
    */

    SQLquery =
      `
        INSERT INTO income (
          tableName,
          condominiumId,
          user,
          lastUpdate,
          condoId,
          accountId,
          amount,
          date,
          text)
        VALUES (
          'income',
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

    // Client sends a request to the server
    socket.send(SQLquery);

    SQLquery =
      `
        INSERT INTO accountmovement (
          tableName,
          condominiumId,
          user,
          lastUpdate,
          condoId,
          accountId,
          amount,
          date,
          text)
        VALUES (
          'accountmovement',
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

    // Client sends a request to the server
    socket.send(SQLquery);
  }
}

function updatePaymentRow(rowNumber) {

  let SQLquery = "";

  // validate row number
  if (rowNumber > 0) {
    rowNumber--;
  } else {
    rowNumber = 0;
  }

  if ((importFileArray[rowNumber].payment) !== '') {

    const now = new Date();
    const lastUpdate = now.toISOString();

    const condoId =
      ((Number(importFileArray[rowNumber].condoId)) === 0)
        ? 1
        : Number(importFileArray[rowNumber].condoId);

    const accountId =
      ((Number(importFileArray[rowNumber].accountId)) === 0)
        ? 1
        : Number(importFileArray[rowNumber].accountId);

    const amount =
      formatKronerToOre(importFileArray[rowNumber].payment);

    let numberKWHour = 0;

    const date =
      convertDateToISOFormat(importFileArray[rowNumber].accountingDate);

    const text =
      importFileArray[rowNumber].text;

    /*
    // Check if payment exist
    const objectNumberPayment = paymentArray.findIndex(payment => payment.paymentId === paymentId);
    if (objectNumberPayment > 0) {

      // Update payment table
      SQLquery = `
        UPDATE payment
        SET 
          user = '${objUserPassword.email}',
          lastUpdate = '${lastUpdate}',
          accountId = ${accountId},
          amount = '${amount}',
          numberKWHour = '${numberKWHour}',
          date = '${date}',
          text = '${text}'
        WHERE paymentId = ${paymentId};
      `;

      // Client sends a request to the server
      socket.send(SQLquery);

    } else {
    */

    SQLquery = `
        INSERT INTO payment (
        tableName,
        condominiumId,
        user,
        lastUpdate,
        accountId,
        amount,
        numberKWHour,
        date,
        text)
        VALUES (
          'payment',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          ${accountId},
          '${amount}',
          '${numberKWHour}',
          '${date}', 
          '${text}'
        );
        `;

    // Client sends a request to the server
    socket.send(SQLquery);

    SQLquery = `
        INSERT INTO accountmovement (
          tableName,
          condominiumId,
          user,
          lastUpdate,
          accountId,
          amount,
          date,
          text)
        VALUES (
          'accountmovement',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          ${accountId},
          '${amount}',
          '${date}', 
          '${text}'
        );
      `;

    // Client sends a request to the server
    socket.send(SQLquery);
  }
}

// Opdate opening balance
function updateOpeningBalance() {

  let bankAccountId = 0;

  textFile.forEach((record) => {

    [accountingDate, openingBalance, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      record.split(';');

    if (accountingDate.includes("DRIFT.")) {

      // remove first and last " in text
      accountingDate = accountingDate.replace(/\./g, "");
      accountingDate = accountingDate.replace(/\"/g, "");
      accountingDate = accountingDate.replace(/ /g, "");

      [text, bankAccountNumber] =
        accountingDate.split(',');

      bankAccountId =
        (bankAccountArray.findIndex(bankAccount => bankAccount.bankAccount === bankAccountNumber) + 1);
    }

    if (accountingDate.includes("Inngående saldo pr.")) {

      // Remove first and last "
      openingBalance = openingBalance.replace(/^"|"$/g, '');
      openingBalance = openingBalance.replace(".", "");

      const norDate = accountingDate.match(/\d{2}\.\d{2}\.\d{4}/);
      openingBalanceDate = norDate[0];

      // dd.mm.yyyy -> yyyymmdd
      openingBalanceDate = convertDateToISOFormat(openingBalanceDate);

      const now = new Date();
      const lastUpdate = now.toISOString();

      // Update opening balance
      SQLquery =
        `
          UPDATE bankaccount
          SET 
            user = '${objUserPassword.email}',
            lastUpdate = '${lastUpdate}',
            openingBalance = '${openingBalance}',
            openingBalanceDate = '${openingBalanceDate}'
          WHERE bankAccountId = ${bankAccountId};
        `;

      // Client sends a request to the server
      socket.send(SQLquery);
    }
  });
}