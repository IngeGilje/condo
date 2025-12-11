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
//exitIfNoActivity()

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
    await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId, 999999999);
    await objUserBankAccounts.loadUserBankAccountsTable(objUserPassword.condominiumId, 999999999, 999999999);
    await objCondo.loadCondoTable(objUserPassword.condominiumId);
    await objSuppliers.loadSuppliersTable(objUserPassword.condominiumId);
    await objCondominiums.loadCondominiumsTable();

    const condominiumId = Number(objUserPassword.condominiumId);

    const deleted = 'A';
    const accountId = 999999999;
    const condoId = 999999999;
    let fromDate = 20200101;
    let toDate = 20291231;
    await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

    amount = 0;
    const orderBy = 'condoId ASC, date DESC, income ASC';
    await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

    // Sends a request to the server to get bank csv transaction file
    // get name of transactions file
    const condominiumRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
    if (condominiumRowNumber !== -1) {

      // file import text name
      const csvFileName = objCondominiums.arrayCondominiums[condominiumRowNumber].importFileName;
      await objImportFile.loadCsvFile(csvFileName);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      showFilter()

      // create array from imported csv-file (data string)
      createtransactionsArray(objImportFile.strCSVTransaction);

      // Show result of filter
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

/*
// Show imported file
function showImportedTextFile() {

  // Show button for update of Bank account transactions
  objImportFile.showButton('importfile-saveBankAccountTransaction', 'Oppdater banktransaksjoner');
}
*/

/*
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
*/

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
        const accountRowNumber =
          objAccounts.arrayAccounts.findIndex(account => account.name.includes('FAKT.TJ'));
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
      bankAccountRowNumber = (objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccount === bankAccountNumber));
      if (bankAccountRowNumber !== -1) {

        bankAccountId = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].bankAccountId;

        // Get current opening and closing balance
        currentOpeningBalance = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].openingBalance;
        currentOpeningBalanceDate = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].openingBalanceDate;
        currentClosingBalance = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalance;
        currentClosingBalanceDate = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalanceDate;
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

        const bankAccountRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
        if (bankAccountRowNumber !== -1) {

          const user = objUserPassword.email
          const bankAccount = Number(objBankAccounts.arrayBankAccounts[bankAccountRowNumber].bankAccount);
          const name = Number(objBankAccounts.arrayBankAccounts[bankAccountRowNumber].name);
          const closingBalance = Number(objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalance);
          const closingBalanceDate = Number(objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalanceDate);
          await objBankAccounts.updateBankAccountsTable(bankAccountId, user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
          await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId, 999999999);
        }
      }

      // Update closing balance
      // Check for closing balance date
      if (Number(currentClosingBalanceDate) <= Number(closingBalanceDate) || Number(currentClosingBalanceDate) === 0 || currentClosingBalanceDate === '') {

        const bankAccountRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
        if (bankAccountRowNumber !== -1) {

          const user = objUserPassword.email
          const bankAccount = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].bankAccount;
          const name = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].name;
          const openingBalance = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].openingBalance;
          const openingBalanceDate = objBankAccounts.arrayBankAccounts[bankAccountRowNumber].openingBalanceDate;
          await objBankAccounts.updateBankAccountsTable(bankAccountId, user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
          await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId, 999999999);
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

    if (bankAccountTransaction.income === income && bankAccountTransaction.payment === payment && bankAccountTransaction.date === date) {

      bankAccountTransactionExist = true;
    }
  });
  return bankAccountTransactionExist;
}

// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable('width:1450px;');

  // Main header
  html += objImportFile.showTableHeaderNew('widht:250px;', 'Import av bankkontotransaksjoner');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start table
  html = startHTMLTable('width:1450px;');

  // Header filter for search
  //html += objImportFile.showHTMLFilterHeader("width:200px;", 0, '');
  //html += objImportFile.showTableHeaderNew("width:200px;", '', '', '', '', '', '', '');
  html += "<tr><td></td></tr>";

  /*
  // Filter for search
  html += "<tr>";

  // Header filter
  //html += objImportFile.showHTMLFilterHeader("width:750px;", 0, '');
  html += objImportFile.showTableHeaderNew("width:750px;", '', '', '', '', '', '', '');

  html += "</tr>";
  */

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.filter').innerHTML = html;
}

// // Show csv file for bank account transactions
function showResult(rowNumber) {

  let sumIncomes = 0;
  let sumPayments = 0;

  // Start HTML table
  html = startHTMLTable('width:1450px;');

  // Header
  rowNumber++;
  html += objImportFile.showTableHeaderNew('widht:250px;', '', 'Dato', 'Bruker', 'Fra bankkonto', 'Til bankkonto', 'Inntekt', 'Utgift', 'Tekst');

  arrayTransactions.forEach((transaction) => {

    html += "<tr>";

    // Show menu
    rowNumber++;
    html += objImportFile.menuNew(rowNumber);

    // Date
    let className = `accountingDate${rowNumber}`;
    html += objImportFile.showInputHTMLNew(className, transaction.accountingDate, 10);

    // Condo name
    className = `accountName${rowNumber}`;
    html += objImportFile.showInputHTMLNew(className, transaction.accountName, 45);

    // fromBankAccountName
    className = `fromBankAccountName${rowNumber}`;
    html += objImportFile.showInputHTMLNew(className, transaction.fromBankAccountName, 45);

    // toBankAccountName
    className = `toBankAccountName${rowNumber}`;
    html += objImportFile.showInputHTMLNew(className, transaction.toBankAccountName, 45);

    // Income
    const income = formatOreToKroner(transaction.income);
    className = `income${rowNumber}`;
    html += objImportFile.showInputHTMLNew(className, income, 10);

    // Payment
    const payment = formatOreToKroner(transaction.payment);
    className = `payment${rowNumber}`;
    html += objImportFile.showInputHTMLNew(className, payment, 10);

    // Text
    className = `payment${rowNumber}`;
    html += objImportFile.showInputHTMLNew(className, transaction.text, 10);

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
  html += showSumRow(rowNumber, sumIncomes, sumPayments);

  // Show update button
  html += "<tr>";

  // Show menu
  rowNumber++;
  html += objCondominiums.menuNew(rowNumber);

  html += objCondominiums.showButtonNew('width:170px;', 'update', 'Oppdater');
  html += "</tr>";

  // Show the rest of the menu
  rowNumber++;
  html += objCondominiums.showRestMenuNew(rowNumber);

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.result').innerHTML = html;
}

// Show table sum row
function showSumRow(rowNumber, sumIncomes, sumPayments) {

  let html = '<tr class="menu">';

  // Show menu
  html += objImportFile.menuNew(rowNumber);
  html += "<td></td><td></td><td></td>";
  html += "<td class='bold center'>Sum</td>";
  html += `<td class="center bold">${sumIncomes}</td>`;
  html += `<td class="center bold">${sumPayments}</td>`;
  html += "</tr>";

  return html;
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
    const numberKWHour = 0;
    const date = convertDateToISOFormat(transaction.accountingDate);
    const text = transaction.text;

    // insert bank account transactions row
    await objBankAccountTransactions.insertBankAccountTransactionsTable(bankAccountTransactionId, condominiumId, user, condoId, accountId, income, payment, numberKWHour, date, text)
  });
}