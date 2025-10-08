// Import of bank transaction file 

// Importfile
let localArrayImportFile = [];

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objUserBankAccounts = new UserBankAccounts('userbankaccounts');
const objCondominiums = new Condominiums('condominiums');
const objCondo = new Condo('condo');
const objBankAccountTransactions = new BankAccountTransactions('bankaccounttransactions');
const objAccounts = new Accounts('accounts');
const objBankAccounts = new BankAccounts('bankaccounts');
const objDues = new Dues('dues');
const objSuppliers = new Suppliers('suppliers');
const objImportFile = new ImportFile('importfile');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity()

// Mark selected menu
objImportFile.menu();
objImportFile.markSelectedMenu('Importer banktransaksjoner');

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    await objUsers.loadUsersTable(objUserPassword.condominiumId);
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId);
    await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId);
    await objUserBankAccounts.loadUserBankAccountsTable(objUserPassword.condominiumId);
    await objCondo.loadCondoTable(objUserPassword.condominiumId);
    await objSuppliers.loadSuppliersTable(objUserPassword.condominiumId);
    await objCondominiums.loadCondominiumsTable(objUserPassword.condominiumId);

    const condominiumId = Number(objUserPassword.condominiumId);
    const accountId = 999999999;
    const condoId = 999999999;
    let fromDate = 999999999;
    let toDate = 999999999;
    await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

    amount = 0;
    fromDate = "01.01." + String(today.getFullYear());
    fromDate = Number(convertDateToISOFormat(fromDate));
    toDate = getCurrentDate();
    toDate = Number(convertDateToISOFormat(toDate));
    await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, condoId, accountId, amount, fromDate, toDate);

    showLeadingText();
    showValues();

    // Make events
    createEvents();
  }
}

// Make importfile events
function createEvents() {

  // Start import of text file
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-importfile-startImport')) {

      // start import of bank account movements
      startImportSync();

      // start import of bank account movements
      async function startImportSync() {

        // Sends a request to the server to get bank csv transaction file
        const csvFileName = document.querySelector('.input-importfile-csvFileName').value;
        await objImportFile.loadCsvFile(csvFileName);

        // Show button for update of bank account movement
        objImportFile.showButton('importfile-saveBankAccountTransaction', 'Oppdater banktransaksjoner');

        // create array from imported csv-file (data string)
        createImportFileArray(objImportFile.arrayImportFile);

        // Show csv file for bank account
        showBankAccountTransactions();

        // Remove button for import of csv file
        document.querySelector(".div-importfile-startImport").remove();
        document.querySelector(".div-importfile-csvFileName").remove();
      }
    };
  });

  // Update bank account movements
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-importfile-saveBankAccountTransaction')) {

      // start import of bank account movements
      updateImportSync();

      // Update bank account movements
      async function updateImportSync() {

        // Update bank account movements table
        await updateBankAccountTransactions();

        // Update opening date and balance
        //await updateOpeningClosingBalance();

        window.location.href = 'http://localhost/condo-bankaccounttransactions.html';
      }
    }
  });
}

// Show imported file
function showImportedTextFile() {

  // Show button for update of bank account movement
  objImportFile.showButton('importfile-saveBankAccountTransaction', 'Oppdater banktransaksjoner');
}

// Show csv file for bank account
function showBankAccountTransactions() {

  let sumColumnIncome = 0;
  let sumColumnPayment = 0;
  let sumColumnNumberKWHour = 0;
  let rowNumber = 0;

  let htmlColumnLineNumber = '<div class = "columnHeaderCenter">Linje</div><br>';
  let htmlColumnAccountingDate = '<div class = "columnHeaderRight">Dato</div><br>';
  let htmlColumnCondoName = '<div class = "columnHeaderRight">Leilighet</div><br>';
  let htmlColumnAccountName = '<div class = "columnHeaderRight">Konto</div><br>';
  let htmlColumnFromBankAccount = '<div class = "columnHeaderRight">Fra b.konto</div><br>';
  let htmlColumnToBankAccount = '<div class = "columnHeaderRight">Til b.konto</div><br>';
  let htmlColumnIncome = '<div class = "columnHeaderRight">Inntekt</div><br>';
  let htmlColumnPayment = '<div class = "columnHeaderRight">Utgift</div><br>';
  let htmlColumnText = '<div class = "columnHeaderLeft">Tekst</div><br>';

  localArrayImportFile.forEach((importFile) => {

    console.log('importFile', importFile);
    rowNumber++;

    // check if the number is odd
    const colorClass = (rowNumber % 2 !== 0) ? "green" : "";
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
          ${importFile.Dato}
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

    htmlColumnFromBankAccount +=
      `
        <div 
          class = "rightCell ${colorClass} one-line"
        />
          ${importFile.fromBankAccountName}
        </div>
      `;

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
    const payment = formatOreToKroner(importFile.payment);

    htmlColumnPayment +=
      `
        <div 
          class = "rightCell ${colorClass}"
        />
          ${payment}
        </div>
      `;

    // Text has to fit into the column
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
    sumColumnIncome += Number(importFile.income);

    // payment
    sumColumnPayment += Number(importFile.payment);
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
  htmlColumnFromBankAccount +=
    `
      <div
        class = "sumCellRight"
      >
        -
      </div>
    `;

  // opening balance
  htmlColumnToBankAccount +=
    `
      <div
        class = "sumCellRight"
      >
        -
      </div>
    `;

  const income = formatOreToKroner(sumColumnIncome);
  htmlColumnIncome +=
    `
      <div 
        class = "sumCellRight"
      >
        ${income}
      </div>
    `;

  const payment = formatOreToKroner(sumColumnPayment);
  htmlColumnPayment +=
    `
      <div 
        class = "sumCellRight"
      >
        ${payment}
      </div>
    `;

  // Show columns
  document.querySelector(".div-importfile-columnLineNumber").innerHTML = htmlColumnLineNumber;
  document.querySelector(".div-importfile-columnAccountingDate").innerHTML = htmlColumnAccountingDate;
  document.querySelector(".div-importfile-columnName").innerHTML = htmlColumnCondoName;
  document.querySelector(".div-importfile-columnAccountName").innerHTML = htmlColumnAccountName;
  document.querySelector(".div-importfile-columnFromBankAccount").innerHTML = htmlColumnFromBankAccount;
  document.querySelector(".div-importfile-columnToBankAccount").innerHTML = htmlColumnToBankAccount;
  document.querySelector(".div-importfile-columnIncome").innerHTML = htmlColumnIncome;
  document.querySelector(".div-importfile-columnPayment").innerHTML = htmlColumnPayment;
  document.querySelector(".div-importfile-columnText").innerHTML = htmlColumnText;
}

// Create array for bank account movement from imported csv file
function createImportFileArray(fileContent) {

  let importFileId = 0;

  let textFile = fileContent.split(/\r?\n/);
  textFile.forEach((record) => {

    let fromBankAccount = record["Fra konto"];
    let toBankAccount = record["Til konto"];

    [accountingDate, Rentedato, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      record.split(';');

    // Check for valid date
    // validate the dd.mm.yyyy (European date format) format
    if (validateEuroDateFormat(accountingDate)) {

      // text
      // remove first and last "
      text = text.replace(/^"|"$/g, '');

      // Condo id
      const condoId = objImportFile.getCondoId(fromBankAccount);

      // Condo name
      const condoName = objCondo.getCondoName(condoId);

      // Income
      income = formatKronerToOre(income);

      // Payment
      payment = formatKronerToOre(payment);

      // Account Id
      let accountId = objAccounts.getAccountIdFromBankAccount(fromBankAccount, payment);
      accountId = (accountId) ? accountId : objAccounts.getAccountIdFromBankAccount(toBankAccount, payment);

      // Account Name
      let accountName;
      if (text.includes('FAKT.TJ')) {

        const accountRowNumber = objAccounts.accountsArray.findIndex(account => account.name.includes('FAKT.TJ'));
        if (accountRowNumber !== -1) {

          accountId = objAccounts.accountsArray[accountRowNumber].accountId;
          accountName = objAccounts.accountsArray[accountRowNumber].name;
        }
      }

      // Account Name
      if (text.includes('transaksjoner')) {

        const accountRowNumber = accountsArray.findIndex(account => account.name.includes('transaksjoner'));
        if (accountRowNumber !== -1) {

          accountId = accountsArray[accountRowNumber].accountId;
          accountName = accountsArray[accountRowNumber].name;
        }
      }

      if (accountId) {
        accountName = objImportFile.getAccountName(accountId);

      } else {

        accountName = text;
      }

      // To bank account
      toBankAccountName = objImportFile.getBankAccountName(toBankAccount);

      fromBankAccountName = objImportFile.getBankAccountName(fromBankAccount);

      // Do not import bank account movement twice
      date = convertDateToISOFormat(accountingDate);
      if (!checkBankAccountTransaction(Number(income), Number(payment), Number(date), text)) {

        // From bank account
        importFileId++;

        const objBankAccountTransaction = {
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

        localArrayImportFile.push(objBankAccountTransaction);
      }
    }
  });
}

// Update bank account movement table
async function updateBankAccountTransactions() {

  localArrayImportFile.forEach((importFile) => {

    const bankAccountTransactionId = 0;  // not in use
    const condominiumId = Number(objUserPassword.condominiumId);
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    const condoId = Number(importFile.condoId);
    const accountId = Number(importFile.accountId);
    const income = Number(importFile.income);
    const payment = Number(importFile.payment);
    const numberKWHour = 0;
    const date = convertDateToISOFormat(importFile.accountingDate);
    const text = importFile.text;

    // insert bank account movements row
    objBankAccountTransactions.insertBankAccountTransactionsTable(bankAccountTransactionId, condominiumId, user, lastUpdate, condoId, accountId, income, payment, numberKWHour, date, text)
    /*
 
      const SQLquery =
        `
        INSERT INTO bankaccounttransaction (
          deleted,
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
          'N',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          ${condoId},
          ${accountId},
          ${income},
          ${payment},
          '',
          ${date}, 
          '${text}'
        );
      `;
 
      // Client sends a request to the server
      updateMySql(SQLquery, 'bankaccounttransaction', 'INSERT');
    })
    */
  });
}


// Update opening balance and closing balance
async function updateOpeningClosingBalance() {

  let bankAccountId = 0;
  let bankAccountRowNumberObj = 0;

  let openingBalanceDate;

  let totalIncome = 0;
  let totalPayment = 0;

  let currentOpeningBalance = '';
  let currentOpeningBalanceDate = '';
  let currentClosingBalance = '';
  let currentClosingBalanceDate = '';

  //textFile.forEach((record) => {
  objImportFile.arrayImportFile.forEach((record) => {

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
      accountingDate = accountingDate.replace(/\./g, "");
      accountingDate = accountingDate.replace(/\"/g, "");
      accountingDate = accountingDate.replace(/ /g, "");

      [text, bankAccountNumber] = accountingDate.split(',');

      // Get row number for bank account number in bank account array
      bankAccountRowNumberObj = (bankAccountsArray.findIndex(bankAccount => bankAccount.bankAccount === bankAccountNumber));

      // Get row number for bank account number in bank account table
      bankAccountRowNumber = (bankAccountsArray.findIndex(bankAccount => bankAccount.bankAccount === bankAccountNumber) + 1);

      bankAccountId = bankAccountsArray[bankAccountRowNumberObj].bankAccountId;

      // Get current opening and closing balance
      currentOpeningBalance = bankAccountsArray[bankAccountRowNumberObj].openingBalance;

      currentOpeningBalanceDate = bankAccountsArray[bankAccountRowNumberObj].openingBalanceDate;

      currentClosingBalance = bankAccountsArray[bankAccountRowNumberObj].closingBalance;

      currentClosingBalanceDate = bankAccountsArray[bankAccountRowNumberObj].closingBalanceDate;
    }

    // Update opening balance date
    if (accountingDate.includes("Inngående saldo pr.")) {

      // Get date for opening balance date
      openingBalanceDate = accountingDate.match(/\d{2}\.\d{2}\.\d{4}/);
      openingBalanceDate = openingBalanceDate[0];

      // dd.mm.yyyy -> yyyymmdd
      openingBalanceDate = convertDateToISOFormat(openingBalanceDate);
    }

    // Update closing balance date and closing balance
    // and opening balance
    if (accountingDate.includes("Utgående saldo pr.")) {

      // Get date for closing balance date
      let closingBalanceDate = accountingDate.match(/\d{2}\.\d{2}\.\d{4}/);
      closingBalanceDate = closingBalanceDate[0];

      // dd.mm.yyyy -> yyyymmdd
      closingBalanceDate = convertDateToISOFormat(closingBalanceDate);

      // Closing balanse
      balance =
        (balance.includes('Ingen data tilgjengelig')) ? '"0"' : balance;

      // remove first and last " in closing balance
      let closingBalance = balance.replace(/\./g, "");
      closingBalance = closingBalance.replace(/\"/g, "");
      closingBalance = closingBalance.replace(/ /g, "");

      // Calculate opening balance
      const openingBalance = Number(closingBalance) - (totalIncome + totalPayment);

      const lastUpdate = today.toISOString();

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
function resetBankAccountTransactions() {

  // Show columns
  document.querySelector(".div-importfile-columnLineNumber").innerHTML = '';
  document.querySelector(".div-importfile-columnAccountingDate").innerHTML = '';
  document.querySelector(".div-importfile-columnName").innerHTML = '';
  document.querySelector(".div-importfile-columnAccountName").innerHTML = '';
  document.querySelector(".div-importfile-columnFromBankAccount").innerHTML = '';
  document.querySelector(".div-importfile-columnToBankAccount").innerHTML = '';
  document.querySelector(".div-importfile-columnIncome").innerHTML = '';
  document.querySelector(".div-importfile-columnPayment").innerHTML = '';
  document.querySelector(".div-importfile-columnText").innerHTML = '';
}

//Check if bank account movement exists
function checkBankAccountTransaction(income, payment, date, text) {

  let bankAccountTransactionExist = false;

  objBankAccountTransactions.bankAccountTranactionsArray.forEach((bankAccountTransaction) => {

    if (bankAccountTransaction.income === income
      && bankAccountTransaction.payment === payment
      && bankAccountTransaction.date === date
      && bankAccountTransaction.text === text) {

      bankAccountTransactionExist =
        true;
    }
  });
  return bankAccountTransactionExist;
}

// Show leading text for import text file name
function showLeadingText() {

  // name of import text file
  objImportFile.showInput('importfile-csvFileName', '* Navn på transaksjonsfil', 50, 'eks.: c://users//user//data//transaksjonsfile.csv');

  // import button
  if (Number(objUserPassword.securityLevel) >= 9) {

    objImportFile.showButton('importfile-startImport', 'Importer transaksjonsfil');
  }
}

// Show values for bank Account movements
function showValues() {

  // get name of importfile
  const condominiumRowNumberObj = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
  if (condominiumRowNumberObj !== -1) {

    // file import text name
    document.querySelector('.input-importfile-csvFileName').value = objCondominiums.arrayCondominiums[condominiumRowNumberObj].importPath;
  }
}