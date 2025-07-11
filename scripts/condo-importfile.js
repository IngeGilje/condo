// Import of bank transaction file 

// Activate objects
const now = new Date();
const objUser = new User('user');
const objUserBankAccount = new UserBankAccount('userbankaccount');
const objCondominium = new Condominium('condominium');
const objCondo = new Condo('condo');
const objBankAccountMovement = new BankAccountMovement('bankaccountmovement');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objDue = new Due('due');
const objSupplier = new Supplier('supplier');
const objImportFile = new ImportFile('importfile');

testMode();

let importFileArray = [];
let textFile;

let isEventsCreated = false;

// Mark selected menu
objImportFile.menu();
objImportFile.markSelectedMenu('Importer bankkonto transaksjoner');

let socket;
socket =
  connectingToServer();

// Validate user/password
const objUserPassword =
  JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  showLoginError('importfile-login');
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

    // Sends a request to the server to get condominiums
    SQLquery =
      `
        SELECT * FROM condominium
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY condominiumId;
      `;
    updateMySql(SQLquery, 'condominium', 'SELECT');

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
        ORDER BY bankaccountId;
      `;
    updateMySql(SQLquery, 'bankaccount', 'SELECT');

    // Sends a request to the server to get dues
    SQLquery =
      `
        SELECT * FROM due
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY dueId;
      `;
    updateMySql(SQLquery, 'due', 'SELECT');

    // Sends a request to the server to get suppliers
    SQLquery =
      `
        SELECT * FROM supplier
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY supplierId;
      `;
    updateMySql(SQLquery, 'supplier', 'SELECT');

    // Sends a request to the server to get bank account movement
    SQLquery =
      `
        SELECT * FROM bankaccountmovement
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY bankAccountMovementId;
      `;
    updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');

    // Sends a request to the server to get user bank account
    SQLquery =
      `
        SELECT * FROM userbankaccount
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY userBankAccountId;
      `;
    updateMySql(SQLquery, 'userbankaccount', 'SELECT');

    // Sends a request to the server to get bank account movement text file from bank
    SQLquery =
      `
      `;
    updateMySql(SQLquery, 'C://inetpub//wwwroot//condo//scripts//transaksjonsliste.csv', 'textFile');
  };

  // Handle incoming messages from server
  socket.onmessage = (event) => {

    let messageFromServer =
      event.data;
    console.log('Incoming message from server:', messageFromServer);

    // Converts a JavaScript Object Notation (JSON) string into an object
    const objInfo =
      JSON.parse(messageFromServer);

    if (objInfo.CRUD === 'SELECT') {
      switch (objInfo.tableName) {

        case 'user':

          // user table
          console.log('userTable');

          userArray =
            objInfo.tableArray;
          break;

        case 'condonium':

          // condonium table
          console.log('condoniumTable');

          condoniumArray =
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

          // account table
          console.log('bankAccountTable');

          bankAccountArray =
            objInfo.tableArray;
          break;

        case 'due':

          // due table
          console.log('dueTable');

          dueArray =
            objInfo.tableArray;
          break;

        case 'supplier':

          // supplier table
          console.log('supplierTable');

          supplierArray =
            objInfo.tableArray;
          break;

        case 'bankaccountmovement':

          // bank account movement table
          console.log('bankaccountmovementTable');

          // array including objects with bank account movement information
          bankAccountMovementArray =
            objInfo.tableArray;

        case 'bankaccountmovement':

          // user bank account table
          console.log('userbankaccountTable');

          // array including objects with user bank account information
          userBankAccountArray =
            objInfo.tableArray;
      }
    }
    console.log('objInfo.CRUD:', objInfo.CRUD);
    if (objInfo.CRUD === 'textFile') {

      // text file
      console.log('textFile');

      setTimeout(() => {

        createImportFileArray(objInfo.tableArray);
        showBankAccountMovements();
        showLeadingText();

        // Make events
        if (!isEventsCreated) {

          createEvents();
          isEventsCreated = true;
        }
      }, 100);
    }

    if (objInfo.CRUD === 'UPDATE' || objInfo.CRUD === 'INSERT' || objInfo.CRUD === 'DELETE') {

      switch (objInfo.tableName) {
        case 'bankaccountmovement':

          // Sends a request to the server to get condos one more time
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

// Make importfile events
function createEvents() {

  // Show selected import file row
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-importfile-importFileId')) {

      // Get row number import file array
      const rowNumber =
        Number(document.querySelector(".select-importfile-importFileId").value);

    };
  });

  // Update bank account movements
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-importfile-updateBankAccountMovement')) {

      // Update bank account movements table
      updateBankAccountMovements();

      // Update opening date and balance
      // Update closing date and balance
      updateOpeningClosingBalance();

      // Reset screen
      resetBankAccountMovements();
      removeBankAccountColumn();
    }
  });
}

// Show leading text for income
function showLeadingText() {

  /*
  // Show all all account movements to update
  objImportFile.showImportFile('importfile-importFileId', 0);
 
  // Show date
  objImportFile.showInput('importfile-date', '* Dato', 10, 'dd.mm.åååå');
 
  // Show all condos
  objCondo.showAllCondos('importfile-condoId', 0);
 
  // Show all accounts
  objAccount.showAllAccounts('importfile-accountId', 0);
 
  // Show income
  objImportFile.showInput('importfile-income', 'Inntekt', 10, '');
 
  // Show payment
  objImportFile.showInput('importfile-payment', 'Utgift', 10, '');
 
  // Show text
  objImportFile.showInput('importfile-text', '* Tekst', 50, '');
 
  // Show button
  objImportFile.showButton('importfile-updateImportArray', 'Oppdater');
  */

  // Show button for update of bank account movement
  objImportFile.showButton('importfile-updateBankAccountMovement', 'Oppdater bankkonto transaksjoner');
}

function showBankAccountMovements() {

  let sumColumnIncome = 0;
  let sumColumnPayment = 0;
  let sumColumnNumberKWHour = 0;
  let rowNumber = 0;

  let htmlColumnLineNumber =
    '<div class = "columnHeaderCenter">Linje</div><br>';
  let htmlColumnAccountingDate =
    '<div class = "columnHeaderRight">Dato</div><br>';
  let htmlColumnCondoName =
    '<div class = "columnHeaderRight">Leilighet</div><br>';
  let htmlColumnAccountName =
    '<div class = "columnHeaderRight">Konto</div><br>';
  let htmlColumnFromBankAccount =
    '<div class = "columnHeaderRight">Fra b.konto</div><br>';
  let htmlColumnToBankAccount =
    '<div class = "columnHeaderRight">Til b.konto</div><br>';
  let htmlColumnIncome =
    '<div class = "columnHeaderRight">Inntekt</div><br>';
  let htmlColumnPayment =
    '<div class = "columnHeaderRight">Utgift</div><br>';
  let htmlColumnText =
    '<div class = "columnHeaderLeft">Tekst</div><br>';

  importFileArray.forEach((importFile) => {

    rowNumber++;

    // check if the number is odd
    const colorClass =
      (rowNumber % 2 !== 0) ? "green" : "";
    htmlColumnLineNumber +=
      `
        <div
          class = "centerCell ${colorClass}"
        >
          ${rowNumber}
        </div>
      `;

    htmlColumnAccountingDate +=
      `
        <div 
          class = "rightCell ${colorClass}"
        >
          ${importFile.accountingDate}
        </div>
      `;

    // Condo name
    htmlColumnCondoName +=
      `
        <div
          class = "rightCell ${colorClass} "
        >
          ${importFile.condoName}
        </div>
      `;

    //accountName =
    //  truncateText(importFile.accountName, 'div-importfile-columnAccountName');
    if (importFile.accountId) {

      htmlColumnAccountName +=
        `
          <div
            class = "rightCell ${colorClass} one-line"
          >
            ${importFile.accountName}
          </div>
        `;
    } else {

      htmlColumnAccountName +=
        `
        <div
          class = "rightCell red one-line"
        >
          ${importFile.accountName}
        </div>
      `;
    }

    //const fromBankAccountName =
    //  truncateText(importFile.fromBankAccountName, 'div-importfile-columnFromBankAccount');
    htmlColumnFromBankAccount +=
      `
        <div 
          class = "rightCell ${colorClass} one-line"
        />
          ${importFile.fromBankAccountName}
        </div>
      `;

    // get to bank account name
    //const toBankAccountName =
    //  truncateText(importFile.toBankAccountName, 'div-importfile-columnToBankAccount');
    htmlColumnToBankAccount +=
      `
        <div 
          class = "rightCell ${colorClass} one-line"
        />
          ${importFile.toBankAccountName}
        </div>
      `;

    // Income
    const income =
      formatOreToKroner(importFile.income);

    htmlColumnIncome +=
      `
        <div 
          class = "rightCell ${colorClass}"
        />
          ${income}
        </div>
      `;

    // Payment
    const payment =
      formatOreToKroner(importFile.payment);

    htmlColumnPayment +=
      `
        <div 
          class = "rightCell ${colorClass}"
        />
          ${payment}
        </div>
      `;

    // Text has to fit into the column
    //let text =
    //  truncateText(importFile.text, 'div-importfile-columnText');
    text = (text === "") ? "-" : text;
    htmlColumnText +=
      `
        <div
          class = "leftCell ${colorClass} one-line"
        />
          ${importFile.text}
        </div>
      `;

    // Accomulate

    // income
    sumColumnIncome +=
      Number(importFile.income);

    // payment
    sumColumnPayment +=
      Number(importFile.payment);
  });

  //Show sum row
  htmlColumnLineNumber +=
    `
      <div 
        class = "sumCellLeft"
      >
       -
      </div>
    `;

  htmlColumnAccountingDate +=
    `
      <div 
        class = "sumCellRight"
      >
        -
      </div>
    `;

  htmlColumnCondoName +=
    `
      <div 
        class = "sumCellRight"
      >
        -
      </div>
    `;

  htmlColumnAccountName +=
    `
      <div 
        class = "sumCellRight"
      >
        -
      </div>
    `;

  // opening balance date
  /*
  const closingBalanceDate =
    getClosingBalanceDate();
  */
  htmlColumnFromBankAccount +=
    `
      <div
        class = "sumCellRight"
      >
        -
      </div>
    `;

  // opening balance
  /*
  let openingBalance =
    getOpeningBalance();
  openingBalance =
    formatOreToKroner(openingBalance);
  */
  htmlColumnToBankAccount +=
    `
      <div
        class = "sumCellRight"
      >
        -
      </div>
    `;

  const income =
    formatOreToKroner(sumColumnIncome);
  htmlColumnIncome +=
    `
      <div 
        class = "sumCellRight"
      >
        ${income}
      </div>
    `;

  const payment =
    formatOreToKroner(sumColumnPayment);
  htmlColumnPayment +=
    `
      <div 
        class = "sumCellRight"
      >
        ${payment}
      </div>
    `;

  // Utgående balanse
  /*
  openingBalance = openingBalance.replace(" ", "");
  openingBalance = openingBalance.replace(",", "");
  let closingBalanse =
    Number(openingBalance) + sumColumnPayment + sumColumnIncome;
  closingBalanse =
    formatOreToKroner(closingBalanse);
  htmlColumnText +=
    `
      <div 
        class = "sumCellLeft"
      >
        ${closingBalanse}
      </div>
    `;
  */

  // Show columns
  document.querySelector(".div-importfile-columnLineNumber").innerHTML =
    htmlColumnLineNumber;
  document.querySelector(".div-importfile-columnAccountingDate").innerHTML =
    htmlColumnAccountingDate;
  document.querySelector(".div-importfile-columnName").innerHTML =
    htmlColumnCondoName;
  document.querySelector(".div-importfile-columnAccountName").innerHTML =
    htmlColumnAccountName;
  document.querySelector(".div-importfile-columnFromBankAccount").innerHTML =
    htmlColumnFromBankAccount;
  document.querySelector(".div-importfile-columnToBankAccount").innerHTML =
    htmlColumnToBankAccount;
  document.querySelector(".div-importfile-columnIncome").innerHTML =
    htmlColumnIncome;
  document.querySelector(".div-importfile-columnPayment").innerHTML =
    htmlColumnPayment;
  document.querySelector(".div-importfile-columnText").innerHTML =
    htmlColumnText;
}

// Create array for bank account movement
function createImportFileArray(fileContent) {

  let importFileId = 0;

  textFile =
    fileContent.split(/\r?\n/);
  textFile.forEach((record) => {

    [accountingDate, Rentedato, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      record.split(';');

    // Check for valid date
    // validate the dd.mm.yyyy (European date format) format
    if (validateEuroDateFormat(accountingDate)) {

      // text
      // remove first and last "
      text =
        text.replace(/^"|"$/g, '');

      // Condo id
      const condoId =
        objImportFile.getCondoId(fromBankAccount);

      const condoName =
        objCondo.getCondoName(condoId);

      income =
        formatKronerToOre(income);

      payment =
        formatKronerToOre(payment);

      let accountName;
      let accountId =
        objImportFile.getAccountIdFromBankAccount(fromBankAccount, toBankAccount);

      // Account Name
      if (text.includes('FAKT.TJ')) {

        const accountRowNumber =
          accountArray.findIndex(account => account.name.includes('FAKT.TJ'));
        if (accountRowNumber !== -1) {

          accountId =
            accountArray[accountRowNumber].accountId;
          accountName =
            accountArray[accountRowNumber].name;
        }
      }

      // Account Name
      if (text.includes('transaksjoner')) {

        const accountRowNumber =
          accountArray.findIndex(account => account.name.includes('transaksjoner'));
        if (accountRowNumber !== -1) {

          accountId =
            accountArray[accountRowNumber].accountId;
          accountName =
            accountArray[accountRowNumber].name;
        }
      }

      if (accountId) {
        accountName =
          objImportFile.getAccountName(accountId);

      } else {

        accountName =
          text;
      }

      // To bank account
      if (accountingDate === '31.05.2025') {
        console.log('toBankAccount:', toBankAccount);
      }
      toBankAccountName =
        objImportFile.getBankAccountName(toBankAccount);

      fromBankAccountName =
        objImportFile.getBankAccountName(fromBankAccount);

      // From bank account
      importFileId++;

      const objBankAccountMovement = {
        importFileId: importFileId,
        accountingDate: accountingDate,
        condoId: condoId,
        condoName: condoName,
        accountId: accountId,
        accountName: accountName,
        fromBankAccount: fromBankAccount,
        fromBankAccountName: fromBankAccountName,
        toBankAccount: toBankAccount,
        toBankAccountName: toBankAccountName,
        income: income,
        payment: payment,
        text: text
      };

      importFileArray.push(objBankAccountMovement);
    }
  });
}

// Update bank account movement table
function updateBankAccountMovements() {

  importFileArray.forEach((importFile) => {

    let SQLquery =
      '';

    const lastUpdate =
      now.toISOString();

    const condoId =
      Number(importFile.condoId);

    const accountId =
      Number(importFile.accountId);

    const income =
      Number(importFile.income);

    const payment =
      Number(importFile.payment);

    const date =
      convertDateToISOFormat(importFile.accountingDate);

    const text =
      importFile.text;

    // Do not import bank account movement twice
    if (!checkBankAccountMovement(income, payment, date, text)) {

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
            text)
          VALUES (
            'bankaccountmovement',
            ${objUserPassword.condominiumId},
            '${objUserPassword.email}',
            '${lastUpdate}',
            ${condoId},
            ${accountId},
            '${income}',
            '${payment}',
            '',
            '${date}', 
            '${text}'
          );
        `;

      // Client sends a request to the server
      updateMySql(SQLquery, 'bankaccountmovement', 'INSERT');
    }
  })
}

// Update opening balance and closing balance
function updateOpeningClosingBalance() {

  let bankAccountId =
    0;
  let objBankAccountRowNumber =
    0;
  let bankAccountRowNumber =
    0;

  let openingBalanceDate;

  let totalIncome =
    0;
  let totalPayment =
    0;

  let currentOpeningBalance =
    '';
  let currentOpeningBalanceDate =
    '';
  let currentClosingBalance =
    '';
  let currentClosingBalanceDate =
    '';

  textFile.forEach((record) => {

    [accountingDate, balance, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      record.split(';');

    if (validateEuroDateFormat(accountingDate)) {

      totalIncome +=
        Number(formatKronerToOre(income));
      totalPayment +=
        Number(formatKronerToOre(payment));
    }

    // Get current opening balance and current opening balance
    if (accountingDate.includes("DRIFT.")) {

      // Remove first and last " in text
      accountingDate =
        accountingDate.replace(/\./g, "");
      accountingDate =
        accountingDate.replace(/\"/g, "");
      accountingDate =
        accountingDate.replace(/ /g, "");

      [text, bankAccountNumber] =
        accountingDate.split(',');

      // Get row number for bank account number in bank account array
      objBankAccountRowNumber =
        (bankAccountArray.findIndex(bankAccount => bankAccount.bankAccount === bankAccountNumber));

      // Get row number for bank account number in bank account table
      bankAccountRowNumber =
        (bankAccountArray.findIndex(bankAccount => bankAccount.bankAccount === bankAccountNumber) + 1);

      bankAccountId =
        bankAccountArray[objBankAccountRowNumber].bankAccountId;

      // Get current opening and closing balance
      currentOpeningBalance =
        bankAccountArray[objBankAccountRowNumber].openingBalance;

      currentOpeningBalanceDate =
        bankAccountArray[objBankAccountRowNumber].openingBalanceDate;

      currentClosingBalance =
        bankAccountArray[objBankAccountRowNumber].closingBalance;

      currentClosingBalanceDate =
        bankAccountArray[objBankAccountRowNumber].closingBalanceDate;
    }

    // Update opening balance date
    if (accountingDate.includes("Inngående saldo pr.")) {

      // Get date for opening balance date
      openingBalanceDate =
        accountingDate.match(/\d{2}\.\d{2}\.\d{4}/);
      openingBalanceDate =
        openingBalanceDate[0];

      // dd.mm.yyyy -> yyyymmdd
      openingBalanceDate =
        convertDateToISOFormat(openingBalanceDate);
    }

    // Update closing balance date and closing balance
    // and opening balance
    if (accountingDate.includes("Utgående saldo pr.")) {

      // Get date for closing balance date
      let closingBalanceDate =
        accountingDate.match(/\d{2}\.\d{2}\.\d{4}/);
      closingBalanceDate =
        closingBalanceDate[0];

      // dd.mm.yyyy -> yyyymmdd
      closingBalanceDate =
        convertDateToISOFormat(closingBalanceDate);

      // Closing balanse
      balance =
        (balance.includes('Ingen data tilgjengelig')) ? '"0"' : balance;

      // remove first and last " in closing balance
      let closingBalance =
        balance.replace(/\./g, "");
      closingBalance =
        closingBalance.replace(/\"/g, "");
      closingBalance =
        closingBalance.replace(/ /g, "");

      // Calculate opening balance
      const openingBalance =
        Number(closingBalance) - (totalIncome + totalPayment);

      const lastUpdate =
        now.toISOString();

      // Updating openening balance
      // Check for openening balance date
      if (Number(currentOpeningBalanceDate) >= Number(openingBalanceDate) || Number(currentOpeningBalanceDate === 0) || currentOpeningBalanceDate === '') {

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
        updateMySql(SQLquery, 'bankaccount', 'UPDATE');
      }

      // Update closing balance
      // Check for closing balance date
      if (Number(currentClosingBalanceDate) <= Number(closingBalanceDate) || Number(currentClosingBalanceDate) === 0 || currentClosingBalanceDate === '') {

        // Update balance
        SQLquery =
          `
            UPDATE bankaccount
            SET 
              user = '${objUserPassword.email}',
              lastUpdate = '${lastUpdate}',
              closingBalance = '${closingBalance}',
              closingBalanceDate = '${closingBalanceDate}'
            WHERE bankAccountId = ${bankAccountId};
          `;

        // Client sends a request to the server
        updateMySql(SQLquery, 'bankaccount', 'UPDATE');
      }
    }
  });
}

// Get opening balance
function getOpeningBalance() {

  let openingBalace;

  textFile.forEach((record) => {

    [accountingDate, description, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      record.split(';');

    if (accountingDate.includes("Inngående saldo")) {

      // remove first and last " in openingBalance
      openingBalance = description.replace(/\./g, "");
      openingBalance = openingBalance.replace(/\"/g, "");
      openingBalance = openingBalance.replace(/ /g, "");
    }
  });

  return openingBalance;
}

// Get opening balance date
function getOpeningBalanceDate() {

  let openingBalanceDate;

  textFile.forEach((record) => {

    [accountingDate, description, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      record.split(';');

    if (accountingDate.includes("Inngående saldo pr")) {

      openingBalanceDate = accountingDate.match(/\d{2}\.\d{2}\.\d{4}/);
    }
  });

  return openingBalanceDate ? openingBalanceDate[0] : null;
}

// Get closing balance date
function getClosingBalanceDate() {

  let closingBalanceDate;

  textFile.forEach((record) => {

    [accountingDate, description, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      record.split(';');

    if (accountingDate.includes("Utgående saldo pr")) {

      closingBalanceDate =
        accountingDate.match(/\d{2}\.\d{2}\.\d{4}/);
    }
  });

  return (closingBalanceDate) ? closingBalanceDate[0] : null;
}

// reset Bank Account Movements
function resetBankAccountMovements() {

  // Show columns
  document.querySelector(".div-importfile-columnLineNumber").innerHTML =
    '';
  document.querySelector(".div-importfile-columnAccountingDate").innerHTML =
    '';
  document.querySelector(".div-importfile-columnName").innerHTML =
    '';
  document.querySelector(".div-importfile-columnAccountName").innerHTML =
    '';
  document.querySelector(".div-importfile-columnFromBankAccount").innerHTML =
    '';
  document.querySelector(".div-importfile-columnToBankAccount").innerHTML =
    '';
  document.querySelector(".div-importfile-columnIncome").innerHTML =
    '';
  document.querySelector(".div-importfile-columnPayment").innerHTML =
    '';
  document.querySelector(".div-importfile-columnText").innerHTML =
    '';
}

function removeBankAccountColumn() {

  /*
  document.querySelector(".label-importfile-importFileId").remove();
  document.querySelector(".select-importfile-importFileId").remove();
  document.querySelector(".label-importfile-condoId").remove();
  document.querySelector(".select-importfile-condoId").remove();
  document.querySelector(".label-importfile-accountId").remove();
  document.querySelector(".select-importfile-accountId").remove();
  document.querySelector(".label-importfile-date").remove();
  document.querySelector(".input-importfile-date").remove();
  document.querySelector(".label-importfile-income").remove();
  document.querySelector(".input-importfile-income").remove();
  document.querySelector(".label-importfile-payment").remove();
  document.querySelector(".input-importfile-payment").remove();
  document.querySelector(".label-importfile-text").remove();
  document.querySelector(".input-importfile-text").remove();
  */

  document.querySelector(".button-importfile-updateBankAccountMovement").remove();
  //document.querySelector(".button-importfile-updateImportArray").remove();

}

// Send a request to the server to get all bank account transactions
function requestImportFile() {

  const objCondominiumRowNumber =
    condominiumArray.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
  if (objCondominiumRowNumber !== -1) {

    const importFileName = `${condominiumArray[objCondominiumRowNumber].importPath} //transaksjonsliste.csv`;
    socket.send(`Name of importfile: ${importFileName}`);
  }
}

//Check if bank account movement exists
function checkBankAccountMovement(income, payment, date, text) {

  let bankAccountMovementExist = false;

  bankAccountMovementArray.forEach((bankAccountMovement) => {

    if (Number(bankAccountMovement.income) === income
      && Number(bankAccountMovement.payment) === payment
      && bankAccountMovement.date === date
      && bankAccountMovement.text === text) {

      bankAccountMovementExist = true;
    }
  });
  return bankAccountMovementExist;
}
/*
// Update import file array row
function updateImportFileArray(rowNumber) {

  // validate row number
  if (rowNumber > 0) {
    rowNumber--;
  } else {
    rowNumber = 0;
  }

  // condo Id
  importFileArray[rowNumber].condoId =
    Number(document.querySelector('.select-importfile-condoId').value);
  console.log('condoId 5:', condoId);

  // Account Id
  importFileArray[rowNumber].accountId =
    Number(document.querySelector('.select-importfile-accountId').value);

  // Account Name
  const accountId =
    importFileArray[rowNumber].accountId;
  const objAccountRowNumber =
    accountArray.findIndex(account => account.accountId === accountId);
  if (objAccountRowNumber !== -1) {
    importFileArray[rowNumber].accountName =
      accountArray[objAccountRowNumber].name;
  }

  // Acounting Date
  importFileArray[rowNumber].accountingDate =
    document.querySelector('.input-importfile-date').value;

  // Income
  importFileArray[rowNumber].income =
    document.querySelector('.input-importfile-income').value;

  // Payment
  importFileArray[rowNumber].payment =
    document.querySelector('.input-importfile-payment').value;

  // Number Kilo Watt per Hour
  importFileArray[rowNumber].numberKWHour =
    document.querySelector('.input-importfile-numberKWHour').value;

  // Text
  importFileArray[rowNumber].text =
    document.querySelector('.input-importfile-text').value;
}
*/
