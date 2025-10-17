// Import of bank transaction file 

// transactions
let arrayTransactions = [];

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
  
    const deleted = 'A';
    const accountId = 999999999;
    const condoId = 999999999;
    let fromDate = 0;
    let toDate = 999999999;
    await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

    amount = 0;
    //fromDate = "01.01." + String(today.getFullYear());
    //fromDate = Number(convertDateToISOFormat(fromDate));
    fromDate = 0;
    toDate = getCurrentDate();
    toDate = Number(convertDateToISOFormat(toDate));
    await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

    showLeadingText();
    showValues();

    // Make events
    createEvents();
  }
}

// Make transactions events
function createEvents() {

  // Start import of text file
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-importfile-startImport')) {

      // start import of bank account transactions
      startImportSync();

      // start import of bank account transactions
      async function startImportSync() {

        // Sends a request to the server to get bank csv transaction file
        const csvFileName = document.querySelector('.input-importfile-csvFileName').value;
        await objImportFile.loadCsvFile(csvFileName);

        // Show button for update of Bank account transactions
        objImportFile.showButton('importfile-saveBankAccountTransaction', 'Oppdater banktransaksjoner');

        // create array from imported csv-file (data string)
        console.log(typeof objImportFile.strCSVTransaction);
        createtransactionsArray(objImportFile.strCSVTransaction);

        // Show csv file for bank account
        showBankAccountTransactions();

        // Remove button for import of csv file
        document.querySelector(".div-importfile-startImport").remove();
        document.querySelector(".div-importfile-csvFileName").remove();
      }
    };
  });

  // Update bank account transactions
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-importfile-saveBankAccountTransaction')) {

      // start import of bank account transactions
      updateImportSync();

      // Update bank account transactions
      async function updateImportSync() {

        // Update bank account transactions table
        console.log('arrayTransactions :', typeof arrayTransactions);
        arrayTransactions.forEach(async (transactions) => {

          const bankAccountTransactionId = 0;  // not in use
          const condominiumId = Number(objUserPassword.condominiumId);
          const user = objUserPassword.email;
          const lastUpdate = today.toISOString();
          const condoId = Number(transactions.condoId);
          const accountId = Number(transactions.accountId);
          const income = Number(transactions.income);
          const payment = Number(transactions.payment);
          const numberKWHour = 0;
          const date = convertDateToISOFormat(transactions.accountingDate);
          const text = transactions.text;

          // insert bank account transactions row
          await objBankAccountTransactions.insertBankAccountTransactionsTable(bankAccountTransactionId, condominiumId, user, lastUpdate, condoId, accountId, income, payment, numberKWHour, date, text)
        });

        // Update opening balance and closing balance
        await updateOpeningClosingBalance();

        // Start bank account transactions
        window.location.href = 'http://localhost/condo-bankaccounttransactions.html';
      };
    };
  });
};

/*
// Show imported file
function showImportedTextFile() {

  // Show button for update of Bank account transactions
  objImportFile.showButton('importfile-saveBankAccountTransaction', 'Oppdater banktransaksjoner');
}
*/

// Show csv file for bank account
function showBankAccountTransactions() {

  let sumColumnIncome = 0;
  let sumColumnPayment = 0;
  let rowNumber = 0;

  //let htmlColumnLineNumber = '<div class = "columnHeaderCenter">Linje</div><br>';
  let htmlColumnAccountingDate = '<div class = "columnHeaderRight">Dato</div><br>';
  let htmlColumnCondoName = '<div class = "columnHeaderRight">Leilighet</div><br>';
  let htmlColumnAccountName = '<div class = "columnHeaderRight">Konto</div><br>';
  let htmlColumnFromBankAccount = '<div class = "columnHeaderRight">Fra b.konto</div><br>';
  let htmlColumnToBankAccount = '<div class = "columnHeaderRight">Til b.konto</div><br>';
  let htmlColumnIncome = '<div class = "columnHeaderRight">Inntekt</div><br>';
  let htmlColumnPayment = '<div class = "columnHeaderRight">Utgift</div><br>';
  let htmlColumnText = '<div class = "columnHeaderLeft">Tekst</div><br>';

  console.log('arrayTransactions :', typeof arrayTransactions);
  arrayTransactions.forEach((transactions) => {

    rowNumber++;

    // check if the number is odd
    const colorClass = (rowNumber % 2 !== 0) ? "green" : "";
    /*
    htmlColumnLineNumber +=
      `
        <div
          class = "centerCell ${colorClass}"
        >
          ${rowNumber}
        </div>
      `;
    */

    htmlColumnAccountingDate +=
      `
        <div 
          class = "rightCell ${colorClass}"
        >
          ${transactions.accountingDate}
        </div>
      `;

    // Condo name
    htmlColumnCondoName +=
      `
        <div
          class = "rightCell ${colorClass} "
        >
          ${transactions.condoName}
        </div>
      `;

    if (transactions.accountId) {

      htmlColumnAccountName +=
        `
          <div
            class = "rightCell ${colorClass} one-line"
          >
            ${transactions.accountName}
          </div>
        `;
    } else {

      htmlColumnAccountName +=
        `
        <div
          class = "rightCell red one-line"
        >
          ${transactions.accountName}
        </div>
      `;
    }

    htmlColumnFromBankAccount +=
      `
        <div 
          class = "rightCell ${colorClass} one-line"
        />
          ${transactions.fromBankAccountName}
        </div>
      `;

    htmlColumnToBankAccount +=
      `
        <div 
          class = "rightCell ${colorClass} one-line"
        />
          ${transactions.toBankAccountName}
        </div>
      `;

    // Income
    const income =
      formatOreToKroner(transactions.income);

    htmlColumnIncome +=
      `
        <div 
          class = "rightCell ${colorClass}"
        />
          ${income}
        </div>
      `;

    // Payment
    const payment = formatOreToKroner(transactions.payment);

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
          ${transactions.text}
        </div>
      `;

    // Accomulate

    // income
    sumColumnIncome += Number(transactions.income);

    // payment
    sumColumnPayment += Number(transactions.payment);
  });

  //Show sum row
  /*
  htmlColumnLineNumber +=
    `
      <div 
        class = "sumCellLeft"
      >
       -
      </div>
    `;
  */

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
  //document.querySelector(".div-importfile-columnLineNumber").innerHTML = htmlColumnLineNumber;
  document.querySelector(".div-importfile-columnAccountingDate").innerHTML = htmlColumnAccountingDate;
  document.querySelector(".div-importfile-columnName").innerHTML = htmlColumnCondoName;
  document.querySelector(".div-importfile-columnAccountName").innerHTML = htmlColumnAccountName;
  document.querySelector(".div-importfile-columnFromBankAccount").innerHTML = htmlColumnFromBankAccount;
  document.querySelector(".div-importfile-columnToBankAccount").innerHTML = htmlColumnToBankAccount;
  document.querySelector(".div-importfile-columnIncome").innerHTML = htmlColumnIncome;
  document.querySelector(".div-importfile-columnPayment").innerHTML = htmlColumnPayment;
  document.querySelector(".div-importfile-columnText").innerHTML = htmlColumnText;
}

// Create array for Bank account transactions from imported csv file
function createtransactionsArray() {

  let transactionsId = 0;

  console.log(typeof objImportFile.strCSVTransaction)
  //let textFile = fileContent.split(/\r?\n/);
  let textFile = objImportFile.strCSVTransaction.split(/\r?\n/);
  textFile.forEach((row) => {

    let fromBankAccount = row["Fra konto"];
    let toBankAccount = row["Til konto"];

    [accountingDate, Rentedato, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] = row.split(';');

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

        const accountRowNumber = objAccounts.arrayAccounts.findIndex(account => account.name.includes('FAKT.TJ'));
        if (accountRowNumber !== -1) {

          accountId = objAccounts.arrayAccounts[accountRowNumber].accountId;
          accountName = objAccounts.arrayAccounts[accountRowNumber].name;
        }
      }

      // Account Name
      if (text.includes('transaksjoner')) {

        const accountRowNumber = objAccounts.arrayAccounts.findIndex(account => account.name.includes('transaksjoner'));
        if (accountRowNumber !== -1) {

          accountId = objAccounts.arrayAccounts[accountRowNumber].accountId;
          accountName = objAccounts.arrayAccounts[accountRowNumber].name;
        }
      }

      accountName = (accountId) ? objAccounts.getAccountName(accountId) : text;

      // To bank account
      toBankAccountName = objImportFile.getBankAccountName(toBankAccount);

      fromBankAccountName = objImportFile.getBankAccountName(fromBankAccount);

      date = convertDateToISOFormat(accountingDate);
      // Do not import Bank account transactions twice
      if (accountingDate === '31.12.2024') {
        console.log('date :', accountingDate);
      }

      if (!checkBankAccountTransaction(Number(income), Number(payment), Number(date))) {

        // From bank account
        transactionsId++;

        const objBankAccountTransaction = {
          transactionsId: transactionsId,
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

        arrayTransactions.push(objBankAccountTransaction);
      }
    }
  });
}

// Update opening balance and closing balance
async function updateOpeningClosingBalance() {

  let bankAccountId = 0;
  let bankAccountRowNumber = 0;

  let openingBalanceDate;

  let totalIncome = 0;
  let totalPayment = 0;

  let currentOpeningBalance = '';
  let currentOpeningBalanceDate = '';
  let currentClosingBalance = '';
  let currentClosingBalanceDate = '';

  //textFile.forEach((row) => {
  //objImportFile.strCSVTransaction.forEach((row) => {
  //let textFile = fileContent.split(/\r?\n/);
  let textFile = objImportFile.strCSVTransaction.split(/\r?\n/);
  textFile.forEach(async (row) => {

    [accountingDate, balance, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      row.split(';');

    if (validateEuroDateFormat(accountingDate)) {

      totalIncome += Number(formatKronerToOre(income));
      totalPayment += Number(formatKronerToOre(payment));
    } else {

      // Not transacting row
      // Remove "
      accountingDate = accountingDate.replace(/\"/g, "");
    }

    // Get current opening balance and current opening balance
    if (accountingDate.includes("DRIFT.")) {

      // Remove first and last " in text
      accountingDate = accountingDate.replace(/\./g, "");
      accountingDate = accountingDate.replace(/\"/g, "");
      accountingDate = accountingDate.replace(/ /g, "");

      [text, bankAccountNumber] = accountingDate.split(',');

      // Get row number for bank account number in bank account array
      bankAccountRowNumber = (objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccount === bankAccountNumber));

      // Get row number for bank account number in bank account table
      //bankAccountRowNumber = (arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccount === bankAccountNumber) + 1);

      bankAccountId = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].bankAccountId;

      // Get current opening and closing balance
      currentOpeningBalance = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].openingBalance;
      currentOpeningBalanceDate = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].openingBalanceDate;
      currentClosingBalance = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalance;
      currentClosingBalanceDate = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalanceDate;
    }

    if (accountingDate.includes("Inngående saldo pr.") || accountingDate.includes("Inngåande saldo pr.")) {

      // Get date for opening balance date
      openingBalanceDate = accountingDate.match(/\d{2}\.\d{2}\.\d{4}/);
      openingBalanceDate = openingBalanceDate[0];

      // dd.mm.yyyy -> yyyymmdd
      openingBalanceDate = convertDateToISOFormat(openingBalanceDate);
    }

    // Update closing balance date and closing balance
    // and opening balance
    if (accountingDate.includes("Utgående saldo pr.") || accountingDate.includes("Utgåande saldo pr.")) {

      // Get date for closing balance date
      let closingBalanceDate = accountingDate.match(/\d{2}\.\d{2}\.\d{4}/);
      closingBalanceDate = closingBalanceDate[0];

      // dd.mm.yyyy -> yyyymmdd
      closingBalanceDate = convertDateToISOFormat(closingBalanceDate);

      // Closing balanse
      balance = (balance.includes('Ingen data tilgjengelig')) ? '"0"' : balance;

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

        //await objBankAccounts.loadBankAccounts(condominiumId);
        const bankAccountRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
        if (bankAccountRowNumber !== -1) {

          const user = objUserPassword.email
          const bankAccount = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].bankAccount;
          const name = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].name;
          const closingBalance = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalance;
          const closingBalanceDate = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalanceDate;
          await objBankAccounts.updateBankAccountsTable(bankAccountId, user, lastUpdate, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
        }
      }

      // Update closing balance
      // Check for closing balance date
      if (Number(currentClosingBalanceDate) <= Number(closingBalanceDate) || Number(currentClosingBalanceDate) === 0 || currentClosingBalanceDate === '') {

        //await objBankAccounts.loadBankAccounts(condominiumId);

        const bankAccountRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
        if (bankAccountRowNumber !== -1) {

          const user = objUserPassword.email
          const bankAccount = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].bankAccount;
          const name = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].name;
          let openingBalance = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].openingBalance;
          openingBalance = formatKronerToOre(openingBalance);
          const openingBalanceDate = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].openingBalanceDate;
          await objBankAccounts.updateBankAccountsTable(bankAccountId, user, lastUpdate, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
        };
      };
    };
  });
};

// Get opening balance
function getOpeningBalance() {

  let openingBalace;

  textFile.forEach((row) => {

    [accountingDate, description, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      row.split(';');

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

  textFile.forEach((row) => {

    [accountingDate, description, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      row.split(';');

    if (accountingDate.includes("Inngående saldo pr")) {

      openingBalanceDate = accountingDate.match(/\d{2}\.\d{2}\.\d{4}/);
    }
  });

  return openingBalanceDate ? openingBalanceDate[0] : null;
}

// Get closing balance date
function getClosingBalanceDate() {

  let closingBalanceDate;

  textFile.forEach((row) => {

    [accountingDate, description, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      row.split(';');

    if (accountingDate.includes("Utgående saldo pr")) {

      closingBalanceDate =
        accountingDate.match(/\d{2}\.\d{2}\.\d{4}/);
    }
  });

  return (closingBalanceDate) ? closingBalanceDate[0] : null;
}

// reset Bank account transactions
function resetBankAccountTransactions() {

  // Show columns
  //document.querySelector(".div-importfile-columnLineNumber").innerHTML = '';
  document.querySelector(".div-importfile-columnAccountingDate").innerHTML = '';
  document.querySelector(".div-importfile-columnName").innerHTML = '';
  document.querySelector(".div-importfile-columnAccountName").innerHTML = '';
  document.querySelector(".div-importfile-columnFromBankAccount").innerHTML = '';
  document.querySelector(".div-importfile-columnToBankAccount").innerHTML = '';
  document.querySelector(".div-importfile-columnIncome").innerHTML = '';
  document.querySelector(".div-importfile-columnPayment").innerHTML = '';
  document.querySelector(".div-importfile-columnText").innerHTML = '';
}

// Check if Bank account transactions exists
function checkBankAccountTransaction(income, payment, date) {

  let bankAccountTransactionExist = false;

  objBankAccountTransactions.arrayBankAccountTranactions.forEach((bankAccountTransaction) => {

    if (bankAccountTransaction.income === income && bankAccountTransaction.payment === payment && bankAccountTransaction.date === date) {

      bankAccountTransactionExist = true;
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

// Show values for Bank account transactions
function showValues() {

  // get name of transactions
  const condominiumRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
  if (condominiumRowNumber !== -1) {

    // file import text name
    document.querySelector('.input-importfile-csvFileName').value = objCondominiums.arrayCondominiums[condominiumRowNumber].importPath;
  }
}