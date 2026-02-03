// Import of bank transaction file 

// transactions
let arrayTransactions = [];

// Activate objects
const today = new Date();
const objUsers = new User('user');
const objUserBankAccounts = new UserBankAccount('userbankaccount');
const objCondominiums = new Condominium('condominium');
const objCondo = new Condo('condo');
const objBankAccountTransactions = new BankAccountTransaction('bankaccounttransaction');
const objAccounts = new Account('account');
const objBankAccounts = new BankAccount('bankaccount');
const objDues = new Due('due');
const objSuppliers = new Supplier('supplier');
const objImportFile = new ImportFile('importfile');

testMode();

// Exit application if no activity for 1 hour
exitIfNoActivity()

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    const resident = 'A';
    await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
    const fixedCost = 'A';
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);
    await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId, objImportFile.nineNine);
    await objUserBankAccounts.loadUserBankAccountsTable(objUserPassword.condominiumId, objImportFile.nineNine, objImportFile.nineNine);
    await objCondo.loadCondoTable(objUserPassword.condominiumId);
    await objSuppliers.loadSuppliersTable(objUserPassword.condominiumId);
    await objCondominiums.loadCondominiumsTable();

    const condominiumId = Number(objUserPassword.condominiumId);

    const deleted = 'A';
    const accountId = objImportFile.nineNine;
    const condoId = objImportFile.nineNine;
    let fromDate = 0;
    let toDate = objImportFile.nineNine;
    await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

    amount = 0;
    const orderBy = 'condoId ASC, date DESC, income ASC';
    await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

    // Sends a request to the server to get bank csv transaction file
    // get name of transactions file
    const rowNumberCondominium = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
    if (rowNumberCondominium !== -1) {

      // file import text name
      const csvFileName = objCondominiums.arrayCondominiums[rowNumberCondominium].importFileName;
      await objImportFile.loadCsvFile(csvFileName);

      // Show header
      showHeader();

      // Show filter
      showFilter()

      // create array from imported csv-file (data string)
      createtransactionsArray(objImportFile.strCSVTransaction);

      // Show result of filter
      let menuNumber = 0;
      menuNumber = showResult(menuNumber);

      // Events
      events();
    }
  }
}

// Make transactions events
function events() {

  // Update bank account transactions
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('update')) {

      // start import of bank account transactions
      updateImportSync();

      // Update bank account transactions
      async function updateImportSync() {

        // update Bank Account Transactions based on csv file
        await updateBankAccountTransactions();

        // Update opening balance and closing balance
        await updateOpeningClosingBalance();

        // Start bank account transactions
        window.location.href = 'http://localhost/condo-bankaccounttransaction.html';
      };
    };
  });
};

// Create array for Bank account transactions from imported csv file
function createtransactionsArray() {

  let transactionsId = 0;

  let textFile = objImportFile.strCSVTransaction.split(/\r?\n/);
  textFile.forEach((row) => {

    let fromBankAccount = row["Fra konto"];
    let toBankAccount = row["Til konto"];

    [accountingDate, Rentedato, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      row.split(';');

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
      let accountId = objAccounts.getAccountIdFromBankAccount(fromBankAccount, payment, text);

      // Account Name
      let accountName;
      if (text.includes('FAKT.TJ')) {

        // Check if any of account includes text 'FAKT.TJ'
        const rowNumberAccount = objAccounts.arrayAccounts.findIndex(account => account.name.includes('FAKT.TJ'));
        if (rowNumberAccount !== -1) {

          accountId = objAccounts.arrayAccounts[rowNumberAccount].accountId;
          accountName = objAccounts.arrayAccounts[rowNumberAccount].name;
        }
      }

      // Account Name
      if (text.includes('transaksjoner')) {

        const rowNumberAccount = objAccounts.arrayAccounts.findIndex(account => account.name.includes('transaksjoner'));
        if (rowNumberAccount !== -1) {

          accountId = objAccounts.arrayAccounts[rowNumberAccount].accountId;
          accountName = objAccounts.arrayAccounts[rowNumberAccount].name;
        }
      }

      accountName = (accountId) ? objAccounts.getAccountName(accountId) : text;

      // From bank account
      fromBankAccountName = objImportFile.getBankAccountName(fromBankAccount);

            // To bank account
      toBankAccountName = objImportFile.getBankAccountName(toBankAccount);

      date = convertDateToISOFormat(accountingDate);

      // Do not import Bank account transactions twice
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
  let rowNumberBankAccount = 0;

  let openingBalanceDate;
  let openingBalance;

  let closingBalanceDate;
  let closingBalance;

  let totalIncome = 0;
  let totalPayment = 0;

  let currentOpeningBalanceDate = '';
  let currentClosingBalanceDate = '';

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
      rowNumberBankAccount = (objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccount === bankAccountNumber));
      if (rowNumberBankAccount !== -1) {

        bankAccountId = objBankAccounts.arrayBankAccounts[rowNumberBankAccount].bankAccountId;

        // Get current opening and closing balance
        currentOpeningBalance = objBankAccounts.arrayBankAccounts[rowNumberBankAccount].openingBalance;
        currentOpeningBalanceDate = objBankAccounts.arrayBankAccounts[rowNumberBankAccount].openingBalanceDate;
        currentClosingBalance = objBankAccounts.arrayBankAccounts[rowNumberBankAccount].closingBalance;
        currentClosingBalanceDate = objBankAccounts.arrayBankAccounts[rowNumberBankAccount].closingBalanceDate;
      }
    }

    if (accountingDate.includes("Inngående saldo pr.") || accountingDate.includes("Inngåande saldo pr.")) {

      // Get date for opening balance date
      openingBalanceDate = accountingDate.match(/\d{2}\.\d{2}\.\d{4}/);
      openingBalanceDate = openingBalanceDate[0];

      // dd.mm.yyyy -> yyyymmdd
      openingBalanceDate = convertDateToISOFormat(openingBalanceDate);

      // Opening balance
      // Remove first and last " in text
      // remove first and last " in closing balance
      openingBalance = balance.replace(/\"/g, "");
      openingBalance = openingBalance.replace(/ /g, "");
      openingBalance = Number(openingBalance) * 100;
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
      closingBalance = balance.replace(/\"/g, "");
      closingBalance = closingBalance.replace(/ /g, "");
      closingBalance = Number(closingBalance) * 100;

      // Updating openening balance
      // Check for openening balance date
      if (Number(currentOpeningBalanceDate) <= Number(openingBalanceDate) || Number(currentOpeningBalanceDate) === 0 || currentOpeningBalanceDate === '') {

        const rowNumberBankAccount = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
        if (rowNumberBankAccount !== -1) {

          const user = objUserPassword.email
          const bankAccount = Number(objBankAccounts.arrayBankAccounts[rowNumberBankAccount].bankAccount);
          const name = Number(objBankAccounts.arrayBankAccounts[rowNumberBankAccount].name);
          const closingBalance = Number(objBankAccounts.arrayBankAccounts[rowNumberBankAccount].closingBalance);
          const closingBalanceDate = Number(objBankAccounts.arrayBankAccounts[rowNumberBankAccount].closingBalanceDate);
          await objBankAccounts.updateBankAccountsTable(bankAccountId, user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
          await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId, objImportFile.nineNine);
        }
      }

      // Update closing balance
      // Check for closing balance date
      if (Number(currentClosingBalanceDate) <= Number(closingBalanceDate) || Number(currentClosingBalanceDate) === 0 || currentClosingBalanceDate === '') {

        const rowNumberBankAccount = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
        if (rowNumberBankAccount !== -1) {

          const user = objUserPassword.email
          const bankAccount = objBankAccounts.arrayBankAccounts[rowNumberBankAccount].bankAccount;
          const name = objBankAccounts.arrayBankAccounts[rowNumberBankAccount].name;
          const openingBalance = objBankAccounts.arrayBankAccounts[rowNumberBankAccount].openingBalance;
          const openingBalanceDate = objBankAccounts.arrayBankAccounts[rowNumberBankAccount].openingBalanceDate;
          await objBankAccounts.updateBankAccountsTable(bankAccountId, user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
          await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId, objImportFile.nineNine);
        };
      };
    };
  });
};

// Get opening balance
function getOpeningBalance() {

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

/*
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
*/

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

  objBankAccountTransactions.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

    if (bankAccountTransaction.bankAccountTransactionId === 1300) {
      console.log('bankAccountTransactionId: ', bankAccountTransaction.bankAccountTransactionId);
    }
    if (bankAccountTransaction.income === income && bankAccountTransaction.payment === payment && bankAccountTransaction.date === date) {

      bankAccountTransactionExist = true;
    }
  });
  return bankAccountTransactionExist;
}

/*
// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable('width:1450px;');

  // Main header
  html += objImportFile.showTableHeader('width:250px;', 'Import av bankkontotransaksjoner');

  // The end of the table
  html += endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  let html = objImportFile.startTable('width:1600px;');

  // show main header
  html += objImportFile.showTableHeader('width:250px;', 'Import av bankkontotransaksjoner');

  // The end of the table
  html += objImportFile.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start table
  html = objImportFile.startTable('width:1600px;');

  // Header filter
  //html += objImportFile.showTableHeader("width:1100px;", '', '', 'Fra dato', 'Til dato', 'Busjettår', 'Pris per m2');

  // start table body
  html += objImportFile.startTableBody();

  // insert table columns in start of a row
  //html += objImportFile.insertTableColumns('', 0, '', '');

  html += "</tr>";

  html += objImportFile.insertTableColumns('', 0, '');

  // end table body
  html += objImportFile.endTableBody();

  // The end of the table
  html += objImportFile.endTable();
  document.querySelector('.filter').innerHTML = html;
}

// Show csv file for bank account transactions
function showResult(rowNumber) {

  // start table
  let html = objImportFile.startTable('width:1600px;');

  // table header
  html += objImportFile.showTableHeader('width:250px;', '', 'Dato', 'Leilighet', 'Konto', 'Fra bankkonto', 'Til bankkonto', 'Inntekt', 'Utgift', 'Tekst');

  let sumIncomes = 0;
  let sumPayments = 0;

  arrayTransactions.forEach((transaction) => {

    // insert table columns in start of a row
    rowNumber++;
    html += objImportFile.insertTableColumns('', rowNumber);

    // Date
    let className = `accountingDate${rowNumber}`;
    html += objImportFile.inputTableColumn(className, transaction.accountingDate, 10);

    // Condo name
    className = `condoName${rowNumber}`;
    html += objImportFile.inputTableColumn(className, transaction.condoName, 45);

    // Account name
    className = `accountName${rowNumber}`;
    html += objImportFile.inputTableColumn(className, transaction.accountName, 45);

    // fromBankAccountName
    className = `fromBankAccountName${rowNumber}`;
    html += objImportFile.inputTableColumn(className, transaction.fromBankAccountName, 45);

    // toBankAccountName
    className = `toBankAccountName${rowNumber}`;
    html += objImportFile.inputTableColumn(className, transaction.toBankAccountName, 45);

    // Income
    const income = formatOreToKroner(transaction.income);
    className = `income${rowNumber}`;
    html += objImportFile.inputTableColumn(className, income, 10);

    // Payment
    const payment = formatOreToKroner(transaction.payment);
    className = `payment${rowNumber}`;
    html += objImportFile.inputTableColumn(className, payment, 10);

    // Text
    className = `payment${rowNumber}`;
    html += objImportFile.inputTableColumn(className, transaction.text, 10);

    // Accomulate

    // income
    sumIncomes += Number(transaction.income);

    // payment
    sumPayments += Number(transaction.payment);
    html += "</tr>";
  });

  // Sum incomes
  sumIncomes = formatOreToKroner(sumIncomes);

  // Sum payments
  sumPayments = formatOreToKroner(sumPayments);

  // Show sum row
  rowNumber++;
  html += objImportFile.insertTableColumns('font-weight: 600;', rowNumber, '','', '', '', 'Sum', sumIncomes, sumPayments);

  // Show update button
  //html += "<tr>";

  // Show menu
  //rowNumber++;
  //html += objImportFile.verticalMenu(rowNumber);

  // insert table columns in start of a row
  rowNumber++;
  html += objImportFile.insertTableColumns('', rowNumber);

  html += objImportFile.showButtonNew('width:170px;', 'update', 'Oppdater');
  html += "</tr>";

  // Show the rest of the menu
  rowNumber++;
  html += objImportFile.showRestMenu(rowNumber);

  // The end of the table
  html += objImportFile.endTable();
  document.querySelector('.result').innerHTML = html;
}

// Update bank account transactions table
async function updateBankAccountTransactions() {
  arrayTransactions.forEach(async (transaction) => {

    const bankAccountTransactionId = 0;  // not in use
    const condominiumId = Number(objUserPassword.condominiumId);
    const user = objUserPassword.email;

    const condoId = Number(transaction.condoId);
    const accountId = Number(transaction.accountId);
    const income = Number(transaction.income);
    const payment = Number(transaction.payment);
    const kilowattHour = 0;
    const date = convertDateToISOFormat(transaction.accountingDate);
    const text = transaction.text;

    // insert bank account transactions row
    await objBankAccountTransactions.insertBankAccountTransactionsTable(bankAccountTransactionId, condominiumId, user, condoId, accountId, income, payment, kilowattHour, date, text)
  });
}