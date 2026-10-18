// Import of bank transaction file 

// csv file for bank transactions
let arrayBankTransactions = [];

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objUserBankAccounts = new UserBankAccounts('userbankaccounts');
const objCondominiums = new Condominiums('condominiums');
const objAppartments = new Appartments('appartments');
const objTransactions = new Transactions('transactions');
const objAccounts = new Accounts('accounts');
const objBankAccounts = new BankAccounts('bankaccounts');
const objDues = new Dues('dues');
const objSuppliers = new Suppliers('suppliers');
const objImportFile = new ImportFile('importfile');

const enableChanges = (objImportFile.securityLevel > 5);
const applicationName = "importfile";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    if ((objImportFile.condominiumId === 0) || (objImportFile.user === null)) {

      // LogIn is not valid
      const URL = (objUsers.serverStatus === 1)
        ? 'http://ingegilje.no/login.html'
        : 'http://localhost/login.html';
      window.location.href = URL;
    } else {

      // Show vertical menu
      const html = objImportFile.showMenu(objImportFile.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      let transactionFile = true;

      const resident = 'A';
      await objUsers.loadUsersTable(objImportFile.condominiumId, resident, objImportFile.nineNine);
      //const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objImportFile.condominiumId);
      await objBankAccounts.loadBankAccountsTable(objImportFile.condominiumId);
      await objUserBankAccounts.loadUserBankAccountsTable(objImportFile.condominiumId, objImportFile.nineNine, objImportFile.nineNine);
      await objAppartments.loadAppartmentsTable(objImportFile.condominiumId);
      await objSuppliers.loadSuppliersTable(objImportFile.condominiumId);

      //const deleted = 'A';
      //const accountId = objImportFile.nineNine;
      //const appartmentId = objImportFile.nineNine;
      //let fromDate = 0;
      //let toDate = objImportFile.nineNine;
      await objDues.loadDuesTable(objImportFile.condominiumId);

      //amount = 0;
      //const orderBy = 'appartmentId ASC';
      //await objTransactions.loadTransactionsTable(orderBy, objImportFile.condominiumId, deleted, appartmentId, accountId, objImportFile.nineNine, amount, fromDate, toDate);
      await objTransactions.loadTransactionsTable(objImportFile.condominiumId);
      objTransactions.arrayTransactions.sort((a, b) => a.appartmentId -  b.appartmentId);
      await objCondominiums.loadCondominiumsTable();

      // Name of importfile
      importFileName();

      // Events
      events();
    }
  } else {

    showMessage('Server er ikke startet.');
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
      const URL = (objUsers.serverStatus === 1)
        ? 'http://ingegilje.no/showtransactions.html'
        : 'http://localhost/showtransactions.html';
      window.location.href = URL;
    };
  });

  // Start import of transaction file from bank
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('importTransacionFile')) {

      // check if file exist
      let importFileName = document.querySelector('.importFileName').value;
      const bankAccountTransacionFileExist = await objImportFile.loadTextFile(importFileName);
      if (bankAccountTransacionFileExist) {

        // Sends a request to the server to get bank transaction file
        if (await objImportFile.loadTextFile(importFileName)) {

          document.querySelector('.showFilter').style.display = "none";
          document.querySelector('.showMessage').style.display = "none";

          // create array from imported csv-file
          createTransactionsArray(objImportFile.strCSVTransaction);

          // Show transactions
          showTransactions();
        }
      } else {

        showMessage('Ugyldig navn på transaksjonsfil');
      }
    }
  });
};

// Create array for Transactions from imported csv file
function createTransactionsArray() {

  let transactionsId = 0;

  let textFile = objImportFile.strCSVTransaction.split(/\r?\n/);
  textFile.forEach((row) => {

    [accountingDate, Type, accountNumber, income, payment, Valuta, text, bankAccountFrom, bankAccountTo, fromName, toName, Referanse, Arkivreferanse, Melding, Interntnotat] =
      row.split(';');
    // Check for valid date
    // validate the dd.mm.yyyy (Norwegian date format)

    if (validateNorDate('message', accountingDate, objImportFile, '')) {

      // text
      // remove first and last "
      text = text.replace(/^"|"$/g, '');

      // appartment id
      bankAccountFrom = bankAccountFrom.slice(0, 11);
      const appartmentId = objAppartments.getAppartmentId(bankAccountFrom);
      const appartmentName = objAppartments.getAppartmentNameById(appartmentId);

      // Income
      income = formatNorAmountToNumber(income);

      // Payment
      payment = (payment === '')
        ? 0
        : (-1) * (formatNorAmountToNumber(payment));

      // Account Id from bank account
      let accountId = objAccounts.getAccountIdFromBankAccount(bankAccountFrom, payment, text);
      if (accountId === 0) {
        // Account Id from to bank account
        accountId = objAccounts.getAccountIdFromBankAccount(bankAccountTo, payment, text);
      }

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

      accountName = (accountId)
        ? objAccounts.getAccountNameById(accountId)
        : text;

      // From bank account
      fromBankAccountName = objImportFile.getBankAccountName(bankAccountFrom);

      // To bank account
      bankAccountTo = bankAccountTo.slice(0, 11);
      toBankAccountName = objImportFile.getBankAccountName(bankAccountTo);

      date = objImportFile.formatDateToNumber(accountingDate);

      // Do not import Transactions twice
      if (!checkTransaction(Number(income), Number(payment), Number(date))) {

        // From bank account
        transactionsId++;

        const objTransaction = {
          transactionsId: transactionsId,
          accountingDate: accountingDate,
          appartmentId: appartmentId,
          appartmentName: appartmentName,
          accountId: accountId,
          accountName: accountName,
          fromBankAccount: bankAccountFrom,
          fromBankAccountName: fromBankAccountName,
          toBankAccount: bankAccountTo,
          toBankAccountName: toBankAccountName,
          income: income,
          payment: payment,
          text: text
        };

        // csv file for bank transactions
        arrayBankTransactions.push(objTransaction);
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
    if (validateNorDate('message', accountingDate, objImportFile, 'Ugyldig Dato')) {

      totalIncome += Number(formatNorAmountToNumber(income));
      totalPayment += Number(formatNorAmountToNumber(payment));
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

          const rowNumberBankAccount = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
          if (rowNumberBankAccount !== -1) {

            //const user = objUserPassword.email
            const bankAccount = Number(objBankAccounts.arrayBankAccounts[rowNumberBankAccount].bankAccount);
            const name = objBankAccounts.arrayBankAccounts[rowNumberBankAccount].name;
            const closingBalance = Number(objBankAccounts.arrayBankAccounts[rowNumberBankAccount].closingBalance);
            const closingBalanceDate = Number(objBankAccounts.arrayBankAccounts[rowNumberBankAccount].closingBalanceDate);
            await objBankAccounts.updateBankAccountsTable(bankAccountId, user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
            await objBankAccounts.loadBankAccountsTable(objImportFile.condominiumId);
          }
        }
      }

      // Update closing balance
      // Check for valid closing balance date and closing balance
      if (isNumeric(String(closingBalance)) && isNumeric(closingBalanceDate)) {

        // Check for closing balance date
        if (Number(currentClosingBalanceDate) <= Number(closingBalanceDate) || Number(currentClosingBalanceDate) === 0 || currentClosingBalanceDate === '') {

          const rowNumberBankAccount = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
          if (rowNumberBankAccount !== -1) {

            //const user = objUserPassword.email
            const bankAccount = objBankAccounts.arrayBankAccounts[rowNumberBankAccount].bankAccount;
            const name = objBankAccounts.arrayBankAccounts[rowNumberBankAccount].name;
            const openingBalance = objBankAccounts.arrayBankAccounts[rowNumberBankAccount].openingBalance;
            const openingBalanceDate = objBankAccounts.arrayBankAccounts[rowNumberBankAccount].openingBalanceDate;
            await objBankAccounts.updateBankAccountsTable(bankAccountId, user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
            await objBankAccounts.loadBankAccountsTable(objImportFile.condominiumId);
          };
        };
      };
    };
  });
};

// Check if Transactions exists
function checkTransaction(income, payment, date) {

  let bankTransactionExist = false;

  objTransactions.arrayTransactions.forEach((transaction) => {

    if ((transaction.income === income)
      && (transaction.payment === payment)
      && (transaction.date === date)) {

      bankTransactionExist = true;
    }
  });
  return bankTransactionExist;
}

// Show csv file for transactions
function showTransactions() {

  // start table
  let html = startTable("Importer Banktransaksjoner", "");

  //html += objImportFile.showTableHeader('Dato', 'Leilighet', 'Konto', 'Fra bankkonto', 'Til bankkonto', 'Inntekt', 'Utgift', 'Tekst');
  html += tableHeader('Dato', 'Leilighet', 'Konto', 'Fra bankkonto', 'Til bankkonto', 'Inntekt', 'Utgift', 'Tekst');
  let sumIncomes = 0;
  let sumPayments = 0;

  rowNumber = 0;

  // csv file for bank transactions
  arrayBankTransactions.forEach((transaction) => {
    
    rowNumber++;

    // insert a table row
    html += objImportFile.insertTableRow('');

    // Date
    let className = `accountingDate${rowNumber}`;
    html += showTableText(className, transaction.accountingDate);

    // appartment name
    className = `appartmentName${rowNumber}`;
    html += showTableText(className, transaction.appartmentName);

    // Account name
    className = `accountName${rowNumber}`;
    html += showTableText(className, transaction.accountName);

    // fromBankAccountName
    className = `fromBankAccountName${rowNumber}`;
    html += showTableText(className, transaction.fromBankAccountName);

    // toBankAccountName
    className = `toBankAccountName${rowNumber}`;
    html += showTableText(className, transaction.toBankAccountName);

    // Income
    const income = formatNumberToNorAmount(transaction.income);
    className = `income${rowNumber}`;
    html += showTableText(className, income);

    // Payment
    const payment = formatNumberToNorAmount(transaction.payment);
    className = `payment${rowNumber}`;
    html += showTableText(className, payment);

    // Text
    className = `payment${rowNumber}`;
    html += showTableText(className, transaction.text);

    // Accomulate

    // income
    sumIncomes += Number(transaction.income);

    // payment
    sumPayments += Number(transaction.payment);
    html += "</tr>";
  });

  // Sum incomes
  sumIncomes = formatNumberToNorAmount(sumIncomes);

  // Sum payments
  sumPayments = formatNumberToNorAmount(sumPayments);

  // Show sum row
  html += objImportFile.insertTableRow('font-weight: 600;', '', '', '', '', 'Sum', sumIncomes, sumPayments, '');

  // Show update button
  html += objImportFile.insertTableRow('');

  html += showTableButton('update', 'Oppdater');
  html += "<td></td><td></td><td></td><td></td><td></td><td></td></tr>";

  // The end of the table
  html += endTable();
  document.querySelector('.showTransactions').innerHTML = html;
}

// Update transactions table
async function updateTransactions() {

  // csv file for bank transactions
  arrayBankTransactions.forEach(async (transaction) => {

    const transactionId = 0;  // not in use

    const appartmentId = Number(transaction.appartmentId);
    const accountId = Number(transaction.accountId);
    const projectId = 0;
    const income = Number(transaction.income);
    const payment = Number(transaction.payment);
    const kilowattHour = 0;
    const date = objImportFile.formatDateToNumber(transaction.accountingDate);
    const text = transaction.text;

    // insert transactions row
    await objTransactions.insertTransactionsTable(objImportFile.condominiumId, objTransactions.user, appartmentId, accountId, projectId, income, payment, kilowattHour, date, text, 'Y');
  });
}

// Import fileName
function importFileName() {

  let importFileName = "Ugyldig filnavn";
  const rowNumberCondominium = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objCondominiums.condominiumId);
  if (rowNumberCondominium !== -1) {

    importFileName = objCondominiums.arrayCondominiums[rowNumberCondominium].importPath;
  }

  let html = startGrid('Importer Banktransaksjoner');

  // name of importfile
  html += inputGridWideText('importFileName', "Navn på Banktransaksjonsfil", `${importFileName}transaksjonsliste.csv`, 45, 1);

  html += endGrid();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("importTransacionFile secondary", "Start Import", "submit");

    // End buttons
    html += endButtons();
  }

  document.querySelector('.showFilter').innerHTML = html;
}
