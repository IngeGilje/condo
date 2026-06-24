// Import of bank transaction file 

// transactions
let arrayTransactions = [];

// Activate objects
const today = new Date();
const objUser = new User('user');
const objUserBankAccount = new UserBankAccount('userbankaccount');
const objCondominium = new Condominium('condominium');
const objCondo = new Condo('condo');
const objTransaction = new Transaction('transaction');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objDue = new Due('due');
const objSupplier = new Supplier('supplier');
const objImportFile = new ImportFile('importfile');

const enableChanges = (objImportFile.securityLevel > 5);

const columnWidths = [175, 175, 175, 175, 175, 175, 175, 200];



// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objImportFile.condominiumId === 0) || (objImportFile.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      html = objImportFile.showHorizontalMenu(objImportFile.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show account menu
      html = objImportFile.showHorizontalMenu(objImportFile.arrayMenuTransaction);
      document.querySelector('.menuTransaction').innerHTML = html;

      let transactionFile = true;

      const resident = 'A';
      await objUser.loadUsersTable(objTransaction.condominiumId, resident, objImportFile.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objTransaction.condominiumId, fixedCost);
      await objBankAccount.loadBankAccountsTable(objTransaction.condominiumId, objImportFile.nineNine);
      await objUserBankAccount.loadUserBankAccountsTable(objTransaction.condominiumId, objImportFile.nineNine, objImportFile.nineNine);
      await objCondo.loadCondoTable(objTransaction.condominiumId, objTransaction.nineNine);
      await objSupplier.loadSuppliersTable(objTransaction.condominiumId);

      const deleted = 'A';
      const accountId = objImportFile.nineNine;
      const condoId = objImportFile.nineNine;
      let fromDate = 0;
      let toDate = objImportFile.nineNine;
      await objDue.loadDuesTable(objTransaction.condominiumId, accountId, condoId, fromDate, toDate);

      amount = 0;
      const orderBy = 'condoId ASC, date DESC, income ASC';
      await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, accountId, objTransaction.nineNine, amount, fromDate, toDate);
      await objCondominium.loadCondominiumsTable();

      // Show header
      showHeader();

      // Name of importfile
      importFileName();

      // Events
      events();
    }
  } else {

    objImportFile.showMessageNew(columnWidths, '', 'Server er ikke startet.');
  }
}

// Make transactions events
async function events() {

  // Update transactions
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // update transactions based on csv file
      await updateTransactions();

      // Update opening balance and closing balance
      await updateOpeningClosingBalance();

      // Start transactions
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-showtransaction.html'
        : 'http://localhost/condo-showtransaction.html';
      window.location.href = URL;
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let URL = (objImportFile.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-login.html`;
      window.location.href = URL;
    };
  });

  // Start import of transaction file from bank
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('importTransacionFile')) {

      // check if file exist
      let importFileName = document.querySelector('.nameImportFile').value;
      const bankAccountTransacionFileExist = await objImportFile.loadTextFile(importFileName);
      if (bankAccountTransacionFileExist) {

        // Sends a request to the server to get bank transaction file
        if (await objImportFile.loadTextFile(importFileName)) {

          document.querySelector('.importFileName').style.display = "none";
          document.querySelector('.message').style.display = "none";

          // create array from imported csv-file
          createTransactionsArray(objImportFile.strCSVTransaction);

          // Show transactions
          showTransactions(0);
        }
      } else {

        objImportFile.showMessageNew(columnWidths, '', 'Ugyldig navn på transaksjonsfil');
      }
    }
  });
};

// Create array for Transactions from imported csv file
function createTransactionsArray() {

  let transactionsId = 0;

  let textFile = objImportFile.strCSVTransaction.split(/\r?\n/);
  textFile.forEach((row) => {

    //  [accountingDate, Rentedato, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
    //    row.split(';');
    [accountingDate, Type, Antall, Konto, income, payment, Valuta, text, fromBankAccount, toBankAccount, toAccount] =
      row.split(';');

    // Check for valid date
    // validate the dd.mm.yyyy (Norwegian date format)
    if (objImportFile.validateNorDate('message', accountingDate, objImportFile, '', '')) {

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
      payment = (-1) * (formatKronerToOre(payment));

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

      date = objImportFile.formatDateToNumber(accountingDate);

      // Do not import Transactions twice
      if (!checkTransaction(Number(income), Number(payment), Number(date))) {

        // From bank account
        transactionsId++;

        const objTransaction = {
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

        arrayTransactions.push(objTransaction);
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

  let closingBalance;

  let totalIncome = 0;
  let totalPayment = 0;

  let currentOpeningBalanceDate = '';
  let currentClosingBalanceDate = '';

  let textFile = objImportFile.strCSVTransaction.split(/\r?\n/);
  textFile.forEach(async (row) => {

    [accountingDate, balance, text, income, payment, NumRef, arkivref, Type, Valuta, fromBankAccount, Fra, toBankAccount, toAccount] =
      row.split(';');
    if (objImportFile.validateNorDate('message', accountingDate, objImportFile, '', 'Ugyldig dato')) {

      totalIncome += Number(formatKronerToOre(income));
      totalPayment += Number(formatKronerToOre(payment));
    } else {

      // Not transactiong row
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
      openingBalanceDate = objImportFile.formatDateToNumber(openingBalanceDate);

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
      closingBalanceDate = objImportFile.formatDateToNumber(closingBalanceDate);

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
            await objBankAccount.loadBankAccountsTable(objTransaction.condominiumId, objImportFile.nineNine);
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
            await objBankAccount.loadBankAccountsTable(objTransaction.condominiumId, objImportFile.nineNine);
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

/*
// reset Transactions
function resetTransactions() {

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
*/

// Check if Transactions exists
function checkTransaction(income, payment, date) {

  let bankTransactionExist = false;

  objTransaction.arrayTransactions.forEach((bankTransaction) => {

    if (bankTransaction.transactionId === 1300) {
      console.log('transactionId: ', bankTransaction.transactionId);
    }
    if (bankTransaction.income === income && bankTransaction.payment === payment && bankTransaction.date === date) {

      bankTransactionExist = true;
    }
  });
  return bankTransactionExist;
}

// Show header
function showHeader() {

  // Start table
  let html = objImportFile.initializeTable(columnWidths);

  // start table body
  html += objImportFile.startTableBody();

  // show main header
  html += objImportFile.showTableHeaderLogOut('', '', '', 'Import av bankkontotransaksjoner', '', '', '');
  html += "</tr>";

  // end table body
  html += objImportFile.endTableBody();

  // The end of the table
  html += objImportFile.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter() {

    // Start frame
  let html = startFrame();

  // Start table
  html += objImportFile.initializeTable(columnWidths);

  // start table body
  html += objImportFile.startTableBody();
  html += "</tr>";

  html += objImportFile.insertTableRow('', objImportFile.accountMenu, '', '', '', '', '', '', '', '');

  // end table body
  html += objImportFile.endTableBody();

  // The end of the table
  html += objImportFile.endTable();
  document.querySelector('.showFilter').innerHTML = html;
}

// Show csv file for transactions
function showTransactions() {

  // start table
  let html = objImportFile.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  html += objImportFile.showTableHeaderMenu('#e0f0e0', 'center', 'Dato', 'Leilighet', 'Konto', 'Fra bankkonto', 'Til bankkonto', 'Inntekt', 'Utgift', 'Tekst');

  let sumIncomes = 0;
  let sumPayments = 0;

  rowNumber = 0;

  arrayTransactions.forEach((transaction) => {

    rowNumber++;
    
    // insert a table row (<tr></td>)
    html += objImportFile.insertTableRow('');

    // Date
    let className = `accountingDate${rowNumber}`;
    html += objImportFile.editTableCell(className, transaction.accountingDate, 10);

    // Condo name
    className = `condoName${rowNumber}`;
    html += objImportFile.editTableCell(className, transaction.condoName, 45);

    // Account name
    className = `accountName${rowNumber}`;
    html += objImportFile.editTableCell(className, transaction.accountName, 45);

    // fromBankAccountName
    className = `fromBankAccountName${rowNumber}`;
    html += objImportFile.editTableCell(className, transaction.fromBankAccountName, 45);

    // toBankAccountName
    className = `toBankAccountName${rowNumber}`;
    html += objImportFile.editTableCell(className, transaction.toBankAccountName, 45);

    // Income
    const income = formatOreToKroner(transaction.income);
    className = `income${rowNumber}`;
    html += objImportFile.editTableCell(className, income, 10);

    // Payment
    const payment = formatOreToKroner(transaction.payment);
    className = `payment${rowNumber}`;
    html += objImportFile.editTableCell(className, payment, 10);

    // Text
    className = `payment${rowNumber}`;
    html += objImportFile.editTableCell(className, transaction.text, 10);

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
  html += objImportFile.insertTableRow('font-weight: 600;', '', '', '', '', 'Sum', sumIncomes, sumPayments, '');

  // Show update button
  html += objImportFile.insertTableRow('', '');

  html += objImportFile.showButton('update', 'Oppdater');
  html += "<td></td><td></td><td></td><td></td><td></td><td></td></tr>";

  // The end of the table
  html += objImportFile.endTable();
  document.querySelector('.result').innerHTML = html;
}

// Update transactions table
async function updateTransactions() {

  arrayTransactions.forEach(async (transaction) => {

    const transactionId = 0;  // not in use

    const condoId = Number(transaction.condoId);
    const accountId = Number(transaction.accountId);
    const projectId = 0;
    const income = Number(transaction.income);
    const payment = Number(transaction.payment);
    const kilowattHour = 0;
    const date = objImportFile.formatDateToNumber(transaction.accountingDate);
    const text = transaction.text;

    // insert transactions row
    await objTransaction.insertTransactionsTable(objTransaction.condominiumId, objTransaction.user, condoId, accountId, projectId, income, payment, kilowattHour, date, text, 'Y')
  });
}

// Import fileName
function importFileName() {

  // Start table
  let html = objImportFile.initializeTable(columnWidths);

  // Header filter (<tr></tr>)
  html += objImportFile.showTableHeaderMenu('', 'center', '', 'Navn på transaksjonsfil fra bank', '', '', '', '', '', '');

  // start table body
  html += objImportFile.startTableBody();

  let importFileName = "Ugyldig filnavn";
  const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objCondominium.condominiumId);
  if (rowNumberCondominium !== -1) {

    importFileName = objCondominium.arrayCondominiums[rowNumberCondominium].importPath;
  }
  html += `
    <td class="center no-border"></td>
    <td class="center" colspan="3">
      <input class="nameImportFile center one-line" type="text" maxlength="255" value="${importFileName}" style="width:500px;">
    </td>
    <td></td><td></td><td></td><td></td></tr>`;

  // insert a table row (<tr></td>)
  html += objBankAccount.insertTableRow('');
  html += "<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";

  // insert a table row (<tr></td>)
  html += objImportFile.insertTableRow('', '', '');

  // Show buttons (<tr></td>)
  html += objBankAccount.showButton('importTransacionFile', 'Start import', 'Importer transaksjonsfil');
  html += "<td></td><td></td><td></td><td></td><td></td></tr>";

  // insert a table row (<tr></td>)
  html += objBankAccount.insertTableRow('');
  html += "<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";

  // end table body
  html += objImportFile.endTableBody();

  // The end of the table
  html += objImportFile.endTable();
  document.querySelector('.importFileName').innerHTML = html;


}
