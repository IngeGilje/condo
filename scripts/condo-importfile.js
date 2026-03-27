// Import of bank transaction file 

// transactions
let arrayTransactions = [];

// Activate objects
const today = new Date();
const objUser = new User('user');
const objUserBankAccount = new UserBankAccount('userbankaccount');
const objCondominium = new Condominium('condominium');
const objCondo = new Condo('condo');
const objBankAccountTransaction = new BankAccountTransaction('bankaccounttransaction');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objDue = new Due('due');
const objSupplier = new Supplier('supplier');
const objImportFile = new ImportFile('importfile');

const enableChanges = (objImportFile.securityLevel > 5);

const tableWidth = 'width:1600px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((condominiumId === 0 || user === null)) {

      // LogIn is not valid
      //window.location.href = 'http://localhost/condo-login.html';
      const URL = (objUser.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // get name of transaction file from bank
      await objCondominium.loadCondominiumsTable();
      const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
      if (rowNumberCondominium !== -1) {

        // file import text name
        const csvFileName = objCondominium.arrayCondominiums[rowNumberCondominium].importFileName;
        if (await objImportFile.checkIfFileExists(csvFileName)) {

          const resident = 'A';
          await objUser.loadUsersTable(condominiumId, resident, objImportFile.nineNine);
          const fixedCost = 'A';
          await objAccount.loadAccountsTable(condominiumId, fixedCost);
          await objBankAccount.loadBankAccountsTable(condominiumId, objImportFile.nineNine);
          await objUserBankAccount.loadUserBankAccountsTable(condominiumId, objImportFile.nineNine, objImportFile.nineNine);
          await objCondo.loadCondoTable(condominiumId);
          await objSupplier.loadSuppliersTable(condominiumId);

          const deleted = 'A';
          const accountId = objImportFile.nineNine;
          const condoId = objImportFile.nineNine;
          let fromDate = 0;
          let toDate = objImportFile.nineNine;
          await objDue.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

          amount = 0;
          const orderBy = 'condoId ASC, date DESC, income ASC';
          await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

          // Sends a request to the server to get bank csv transaction file
          if (await objImportFile.loadCsvFile(csvFileName)) {

            let menuNumber = 0;
            // Show header
            showHeader();

            // Show filter
            menuNumber = showFilter(menuNumber);

            // create array from imported csv-file (data string)
            createtransactionsArray(objImportFile.strCSVTransaction);

            // Show result of filter
            menuNumber = showResult(menuNumber);

            // Events
            events();
          } else {

            objImportFile.showMessage(objImportFile, tableWidth, 'Finner ikke transaksjonsfilen fra banken :', fileName);
          }

        } else {

          objImportFile.showMessage(objImportFile, tableWidth, 'Finner ikke transaksjonsfilen fra banken :', fileName);
        }
      } else {

        objImportFile.showMessage(objImportFile, tableWidth, 'Finner ikke transaksjonsfilen fra banken :', fileName);
      }
    }
  } else {

    objImportFile.showMessage(objImportFile, tableWidth, 'condo-server.js er ikke startet.');
  }
}

// Make transactions events
async function events() {

  // Update bank account transactions
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // update Bank Account Transactions based on csv file
      await updateBankAccountTransactions();

      // Update opening balance and closing balance
      await updateOpeningClosingBalance();

      // Start bank account transactions
      window.location.href = 'http://localhost/condo-bankaccounttransaction.html';
    };
  });
  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objImportFile.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
};

// Create array for Bank account transactions from imported csv file
function createtransactionsArray() {

  let transactionsId = 0;

  let textFile = objImportFile.strCSVTransaction.split(/\r?\n/);
  textFile.forEach((row) => {

    [accountingDate, Rentedato, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      row.split(';');

    // Check for valid date
    // validate the dd.mm.yyyy (Norwegian date format) format
    if (objImportFile.validateNorDate('message', accountingDate)) {

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

      // Account Id from bank account
      let accountId = objAccount.getAccountIdFromBankAccount(fromBankAccount, payment, text);
      if (accountId === 0) {
        // Account Id from to bank account
        accountId = objAccount.getAccountIdFromBankAccount(toBankAccount, payment, text);
      }

      // Account Name
      let accountName;
      if (text.includes('FAKT.TJ')) {

        // Check if any of account includes text 'FAKT.TJ'
        const rowNumberAccount = objAccount.arrayAccounts.findIndex(account => account.name.includes('FAKT.TJ'));
        if (rowNumberAccount !== -1) {

          accountId = objAccount.arrayAccounts[rowNumberAccount].accountId;
          accountName = objAccount.arrayAccounts[rowNumberAccount].name;
        }
      }

      // Account Name
      if (text.includes('transaksjoner')) {

        const rowNumberAccount = objAccount.arrayAccounts.findIndex(account => account.name.includes('transaksjoner'));
        if (rowNumberAccount !== -1) {

          accountId = objAccount.arrayAccounts[rowNumberAccount].accountId;
          accountName = objAccount.arrayAccounts[rowNumberAccount].name;
        }
      }

      accountName = (accountId) ? objAccount.getAccountName(accountId) : text;

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

  let fromBankAccount;
  let toBankAccount;

  let totalIncome = 0;
  let totalPayment = 0;

  let currentOpeningBalanceDate = '';
  let currentClosingBalanceDate = '';

  let textFile = objImportFile.strCSVTransaction.split(/\r?\n/);
  textFile.forEach(async (row) => {

    [accountingDate, balance, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      row.split(';');
    if (objImportFile.validateNorDate('message', accountingDate)) {

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
      rowNumberBankAccount = (objBankAccount.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccount === bankAccountNumber));
      if (rowNumberBankAccount !== -1) {

        bankAccountId = objBankAccount.arrayBankAccounts[rowNumberBankAccount].bankAccountId;

        // Get current opening and closing balance
        currentOpeningBalance = objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalance;
        currentOpeningBalanceDate = objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalanceDate;
        currentClosingBalance = objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalance;
        currentClosingBalanceDate = objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalanceDate;
      }
    }

    // Opening balance and opening balance date
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

      // Check for valid opening balance
      if (isNumeric(openingBalance)) {

        openingBalance = openingBalance.replace(/ /g, "");
        openingBalance = Number(openingBalance) * 100;
        openingBalance = String(Math.round(openingBalance));
      }
    }

    // Closing balance and closing balance date
    if (accountingDate.includes("Utgående saldo pr.") || accountingDate.includes("Utgåande saldo pr.")) {

      // Get date for closing balance date
      let closingBalanceDate = accountingDate.match(/\d{2}\.\d{2}\.\d{4}/);
      closingBalanceDate = closingBalanceDate[0];

      // dd.mm.yyyy -> yyyymmdd
      closingBalanceDate = convertDateToISOFormat(closingBalanceDate);

      // Closing balanse
      //balance = (balance.includes('Ingen data tilgjengelig')) ? '"0"' : balance;

      // remove first and last " in closing balance
      closingBalance = balance.replace(/\"/g, "");

      // Check for valid closing balance
      if (isNumeric(closingBalance)) {

        closingBalance = closingBalance.replace(/ /g, "");
        closingBalance = Number(closingBalance) * 100;
        closingBalance = String(Math.round(closingBalance));
      }

      // Updating openening balance
      // Check for valid openening balance date and openening balance
      if (isNumeric(openingBalance) && isNumeric(openingBalanceDate)) {

        // Check for openening balance date
        if (Number(currentOpeningBalanceDate) >= Number(openingBalanceDate) || Number(currentOpeningBalanceDate) === 0 || currentOpeningBalanceDate === '') {

          const rowNumberBankAccount = objBankAccount.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
          if (rowNumberBankAccount !== -1) {

            //const user = objUserPassword.email
            const bankAccount = Number(objBankAccount.arrayBankAccounts[rowNumberBankAccount].bankAccount);
            const name = objBankAccount.arrayBankAccounts[rowNumberBankAccount].name;
            const closingBalance = Number(objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalance);
            const closingBalanceDate = Number(objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalanceDate);
            await objBankAccount.updateBankAccountsTable(bankAccountId, user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
            await objBankAccount.loadBankAccountsTable(condominiumId, objImportFile.nineNine);
          }
        }
      }

      // Update closing balance
      // Check for valid closing balance date and closing balance
      if (isNumeric(String(closingBalance)) && isNumeric(closingBalanceDate)) {

        // Check for closing balance date
        if (Number(currentClosingBalanceDate) <= Number(closingBalanceDate) || Number(currentClosingBalanceDate) === 0 || currentClosingBalanceDate === '') {

          const rowNumberBankAccount = objBankAccount.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
          if (rowNumberBankAccount !== -1) {

            //const user = objUserPassword.email
            const bankAccount = objBankAccount.arrayBankAccounts[rowNumberBankAccount].bankAccount;
            const name = objBankAccount.arrayBankAccounts[rowNumberBankAccount].name;
            const openingBalance = objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalance;
            const openingBalanceDate = objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalanceDate;
            await objBankAccount.updateBankAccountsTable(bankAccountId, user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
            await objBankAccount.loadBankAccountsTable(condominiumId, objImportFile.nineNine);
          };
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

  objBankAccountTransaction.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

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
  let html = objImportFile.startTable(tableWidth);

  // show main header
  html += objImportFile.showTableHeader('width:175px;', 'Import av bankkontotransaksjoner');

  // The end of the table
  html += objImportFile.endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  html = objImportFile.startTable(tableWidth);

  // start table body
  html += objImportFile.startTableBody();

  // show main header
  html += objImportFile.showTableHeaderLogOut('width:175px;', '', '', '', '', 'Import av bankkontotransaksjoner', '', '', '');
  html += "</tr>";

  // end table body
  html += objImportFile.endTableBody();

  // The end of the table
  html += objImportFile.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(menuNumber) {

  // Start table
  html = objImportFile.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objImportFile.showTableHeaderMenu('width:175px;', menuNumber, '', 'Fra dato', 'Til dato', 'Busjettår', 'Pris per m2', '', '', '');

  // start table body
  html += objImportFile.startTableBody();

  html += "</tr>";

  menuNumber++;
  html += objImportFile.insertTableColumns('', menuNumber, '', '', '', '', '', '', '', '');

  // end table body
  html += objImportFile.endTableBody();

  // The end of the table
  html += objImportFile.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show csv file for bank account transactions
function showResult(menuNumber) {

  // start table
  let html = objImportFile.startTable(tableWidth);

  // table header
  menuNumber++;
  html += objImportFile.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, 'Dato', 'Leilighet', 'Konto', 'Fra bankkonto', 'Til bankkonto', 'Inntekt', 'Utgift', 'Tekst');

  let sumIncomes = 0;
  let sumPayments = 0;

  arrayTransactions.forEach((transaction) => {

    // insert table columns in start of a row
    menuNumber++;
    html += objImportFile.insertTableColumns('', menuNumber);

    // Date
    let className = `accountingDate${menuNumber}`;
    html += objImportFile.inputTableColumn(className, '', transaction.accountingDate, 10);

    // Condo name
    className = `condoName${menuNumber}`;
    html += objImportFile.inputTableColumn(className, '', transaction.condoName, 45);

    // Account name
    className = `accountName${menuNumber}`;
    html += objImportFile.inputTableColumn(className, '', transaction.accountName, 45);

    // fromBankAccountName
    className = `fromBankAccountName${menuNumber}`;
    html += objImportFile.inputTableColumn(className, '', transaction.fromBankAccountName, 45);

    // toBankAccountName
    className = `toBankAccountName${menuNumber}`;
    html += objImportFile.inputTableColumn(className, '', transaction.toBankAccountName, 45);

    // Income
    const income = formatOreToKroner(transaction.income);
    className = `income${menuNumber}`;
    html += objImportFile.inputTableColumn(className, '', income, 10);

    // Payment
    const payment = formatOreToKroner(transaction.payment);
    className = `payment${menuNumber}`;
    html += objImportFile.inputTableColumn(className, '', payment, 10);

    // Text
    className = `payment${menuNumber}`;
    html += objImportFile.inputTableColumn(className, '', transaction.text, 10);

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
  menuNumber++;
  html += objImportFile.insertTableColumns('font-weight: 600;', menuNumber, '', '', '', '', 'Sum', sumIncomes, sumPayments, '');

  // Show update button

  // insert table columns in start of a row
  menuNumber++;
  html += objImportFile.insertTableColumns('', menuNumber, '');

  html += objImportFile.showButton('width:175px;', 'update', 'Oppdater');
  html += "<td></td><td></td><td></td><td></td><td></td><td></td></tr>";

  // Show the rest of the menu
  menuNumber++;
  html += objImportFile.showRestMenu(menuNumber);

  // The end of the table
  html += objImportFile.endTable();
  document.querySelector('.result').innerHTML = html;
}

// Update bank account transactions table
async function updateBankAccountTransactions() {

  arrayTransactions.forEach(async (transaction) => {

    const bankAccountTransactionId = 0;  // not in use
    //const condominiumId = Number(condominiumId);
    //const user = objUserPassword.email;

    const condoId = Number(transaction.condoId);
    const accountId = Number(transaction.accountId);
    const income = Number(transaction.income);
    const payment = Number(transaction.payment);
    const kilowattHour = 0;
    const date = convertDateToISOFormat(transaction.accountingDate);
    const text = transaction.text;

    // insert bank account transactions row
    await objBankAccountTransaction.insertBankAccountTransactionsTable(bankAccountTransactionId, condominiumId, user, condoId, accountId, income, payment, kilowattHour, date, text)
  });
}