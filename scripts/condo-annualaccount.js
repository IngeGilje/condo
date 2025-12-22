// Search for amount movements

// Activate objects
const today = new Date();
const objUsers = new User('user');
const objCondominiums = new Condominium('condominium');
const objBudget = new Budget('budget');
const objAccounts = new Account('account');
const objBankAccounts = new BankAccount('bankaccount');
const objBankAccountTransactions = new BankAccountTransaction('bankAccountTransaction');
const objCondo = new Condo('condo');
const objAnnualAccount = new AnnualAccount('annualaccount');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    const resident = 'Y';
    await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
    await objCondominiums.loadCondominiumsTable();
    await objCondo.loadCondoTable(objUserPassword.condominiumId);
    await objBudget.loadBudgetsTable(objUserPassword.condominiumId, 999999999, 999999999);
    await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId, 999999999);
    const fixedCost = 'A';
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);

    // Show header
    let menuNumber = 0;
    showHeader();

    // Show filter
    showFilter();

    const condominiumId = Number(objUserPassword.condominiumId);
    const deleted = "N";

    let fromDate = document.querySelector('.filterFromDate').value;
    fromDate = Number(convertDateToISOFormat(fromDate));

    let toDate = document.querySelector('.filterToDate').value;
    toDate = Number(convertDateToISOFormat(toDate));

    const orderBy = 'condoId ASC, date DESC, income ASC';
    await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, 999999999, 999999999, 0, fromDate, toDate);

    // Show annual accounts
    menuNumber = showAnnualAccounts(menuNumber);

    // Show income for next year
    menuNumber = showIncomeNextYear(menuNumber);

    // Show remote Heating
    // Get row number for payment Remote Heating Account Id
    const condominiumRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
    if (condominiumRowNumber !== -1) {

      const paymentRemoteHeatingAccountId = Number(objCondominiums.arrayCondominiums[condominiumRowNumber].paymentRemoteHeatingAccountId);
      await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, 999999999, paymentRemoteHeatingAccountId, 0, fromDate, toDate);
      menuNumber = showRemoteHeating(menuNumber);

      // Show bank deposit for next year
      const nextBudgetYear = Number(document.querySelector('.filterYear').value) + 1;
      await objBudget.loadBudgetsTable(objUserPassword.condominiumId, nextBudgetYear, 999999999);
      menuNumber = showBankDeposit(menuNumber);

      // Events
      events();
    }
  }
}

// Make events
function events() {

  // Show after change of filter
  document.addEventListener('change', (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('filterFromDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterToDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterYear'))
      || [...event.target.classList].some(cls => cls.startsWith('filterPriceSquareMeter'))) {

      showAnnualAccountSync();

      // Show annual account after change of filter
      async function showAnnualAccountSync() {

        let priceSquareMeter = document.querySelector('.filterPriceSquareMeter').value;
        priceSquareMeter = formatKronerToOre(priceSquareMeter);
        document.querySelector('.filterPriceSquareMeter').value = formatOreToKroner(priceSquareMeter);

        const condominiumId = Number(objUserPassword.condominiumId);
        const deleted = 'N';
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.filterFromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.filterToDate').value));
        const orderBy = 'condoId ASC, date DESC, income ASC';
        await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, 999999999, 999999999, 0, fromDate, toDate);

        // Show annual accounts
        let menuNumber = 0;
        menuNumber = showAnnualAccounts(menuNumber);

        // Show income for next year
        menuNumber = showIncomeNextYear(menuNumber);

        // Show remote Heating
        // Get row number for payment Remote Heating Account Id
        const condominiumRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
        if (condominiumRowNumber !== -1) {

          const paymentRemoteHeatingAccountId = Number(objCondominiums.arrayCondominiums[condominiumRowNumber].paymentRemoteHeatingAccountId);
          await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, 999999999, paymentRemoteHeatingAccountId, 0, fromDate, toDate);

          menuNumber = showRemoteHeating(menuNumber);

          // Show bank deposit for next year
          const nextBudgetYear = Number(document.querySelector('.filterYear').value) + 1;
          await objBudget.loadBudgetsTable(objUserPassword.condominiumId, nextBudgetYear, 999999999);
          menuNumber = showBankDeposit(menuNumber);
        };
      };
    };
  });
}

// Accumulate all Bank account transactions for specified account id
function getTotalMovementsBankAccount(accountId) {

  let accountAmount = 0;

  let fromDate = document.querySelector('.filterFromDate').value;

  fromDate = Number(convertDateToISOFormat(fromDate));

  let toDate = document.querySelector('.filterToDate').value;
  toDate = Number(convertDateToISOFormat(toDate));

  objBankAccountTransactions.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

    if (Number(bankAccountTransaction.date) >= fromDate
      && (Number(bankAccountTransaction.date) <= toDate
        && bankAccountTransaction.accountId === accountId)) {

      accountAmount += Number(bankAccountTransaction.income);
      accountAmount += Number(bankAccountTransaction.payment);
    }
  })

  return accountAmount;
}

// get budget amount
function getBudgetAmount(accountId, year) {

  let amount = 0;

  // Budget Amount
  objBudget.arrayBudgets.forEach(budget => {
    if (budget.accountId === accountId
      && Number(budget.year) === year) {

      amount = budget.amount;
    }
  })

  return formatOreToKroner(amount);
}

// Get fixed costs
function getFixedCost(fromDate, toDate) {

  let fixedCost = 0;

  objBankAccountTransactions.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

    if (Number(bankAccountTransaction.date) >= fromDate
      && (Number(bankAccountTransaction.date) <= toDate)) {

      // Check for fixed cost
      const accountRowNumber = objAccounts.arrayAccounts.findIndex(account => account.accountId === bankAccountTransaction.accountId);
      if (accountRowNumber !== -1) {

        if (objAccounts.arrayAccounts[accountRowNumber].fixedCost === 'Y') {

          fixedCost +=
            Number(bankAccountTransaction.income);
          fixedCost +=
            Number(bankAccountTransaction.payment);
        }
      }
    }
  })
  return fixedCost;
}

/*
// Show header
function showHeader() {

  // Start table
  let html = objAnnualAccount.startTableNew('width:1100px;');

  // show main header
  html += objAnnualAccount.showTableHeaderNew("width:200px;", 'Årsregnskap');

  // The end of the table header
  html += objAnnualAccount.endTableHeaderNew();

  // The end of the table
  html += objAnnualAccount.endTableNew();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  let html = objAnnualAccount.startTableNew('width:1100px;');

  // show main header
  html += objAnnualAccount.showTableHeaderNew("width:200px;", 'Årsregnskap');

  // The end of the table
  html += objAnnualAccount.endTableNew();
  document.querySelector('.header').innerHTML = html;
}

/*
// Show filter
function showFilter() {

  // Start table
  html = objAnnualAccount.startTableNew('width:1100px;');

  // Header filter for search
  html += "<tr><td></td><tr>";

  // Filter for search
  html += "<tr>";

  // Header filter
  html += objAnnualAccount.showTableHeaderNew("width:1100px;", '', '', 'Fra dato', 'Til dato', 'Busjettår', 'Pris per m2');

  html += "</tr>";

  html += "<tr><td></td><td></td>";

  // show from date
  const fromDate = '01.01.' + String(today.getFullYear());
  html += objAnnualAccount.inputTableColumnNew('filterFromDate', fromDate, 10);

  // show to date
  let toDate = getCurrentDate();
  html += objAnnualAccount.inputTableColumnNew('filterToDate', toDate, 10);

  // Budget year
  let year = today.getFullYear();
  html += objBudget.selectIntervalHTMLNew('filterYear', 'width:100px;', 2020, 2030, year, 'Budsjettår');

  // price per square meter
  html += objAnnualAccount.inputTableColumnNew('filterPriceSquareMeter', '45,00', 10);

  html += "</tr>";
  html += "<td></td>";
  html += "<tr></tr>";

  // The end of the table
  html += objAnnualAccount.endTableNew();
  document.querySelector('.filter').innerHTML = html;
}
*/

// Show filter
function showFilter() {

  // Start table
  html = objAnnualAccount.startTableNew('width:1100px;');

  // Header filter
  html += objAnnualAccount.showTableHeaderNew("width:1100px;", '', '', 'Fra dato', 'Til dato', 'Busjettår', 'Pris per m2');

  // start table body
  html += objAnnualAccount.startTableBodyNew();

  // insert table columns in start of a row
  html += objAnnualAccount.insertTableColumnsNew('', 0, '', '');

  // show from date
  const fromDate = '01.01.' + String(today.getFullYear());
  html += objAnnualAccount.inputTableColumnNew('filterFromDate', fromDate, 10);

  // show to date
  const toDate = getCurrentDate();
  html += objAnnualAccount.inputTableColumnNew('filterToDate', toDate, 10);

  // Budget year
  const year = today.getFullYear();
  html += objBudget.selectIntervalHTMLNew('filterYear', 'width:100px;', 2020, 2030, year, 'Budsjettår');

  // price per square meter
  html += objAnnualAccount.inputTableColumnNew('filterPriceSquareMeter', '45,00', 10);

  html += "</tr>";

  html += objAnnualAccount.insertEmptyTableRowNew(0, '');

  // end table body
  html += objAnnualAccount.endTableBodyNew();

  // The end of the table
  html += objAnnualAccount.endTableNew();
  document.querySelector('.filter').innerHTML = html;
}

// Show annual accounts
function showAnnualAccounts(rowNumber) {

  // start table
  let html = objAnnualAccount.startTableNew('width:1100px;');

  // table header
  html += objAnnualAccount.showTableHeaderNew("width:200px;", '', 'Konto', 'Beløp', 'Budsjett', 'Avvik');

  let totalAccountAmount = 0;
  let totalBudgetAmount = 0;

  objAccounts.arrayAccounts.forEach((account) => {

    // Budget Amount for fiscal
    const budgetYear = Number(document.querySelector('.filterYear').value);
    let budgetAmount = getBudgetAmount(account.accountId, budgetYear);
    const numBudgetAmount = Number(formatKronerToOre(budgetAmount));

    // Bank account transactions for selected account
    let accountAmount = getTotalMovementsBankAccount(account.accountId);
    accountAmount = formatOreToKroner(accountAmount);
    const numAccountAmount = Number(formatKronerToOre(accountAmount));

    if (numBudgetAmount !== 0 || numAccountAmount !== 0) {

      html += '<tr>';

      // Show menu
      rowNumber++;
      html += objBankAccountTransactions.menuNew(rowNumber);

      // name
      html += objBankAccountTransactions.inputTableColumnNew('name', account.name, 45);

      // accountAmount
      accountAmount = formatOreToKroner(accountAmount);
      className = `accountAmount${account.accountId}`;
      html += objBankAccountTransactions.inputTableColumnNew('accountAmount', accountAmount, 10);

      // budgetAmount
      budgetAmount = formatOreToKroner(budgetAmount);
      className = `budgetAmount${account.accountId}`;
      html += objBankAccountTransactions.inputTableColumnNew('budgetAmount', budgetAmount, 10);

      // Deviation
      accountAmount = Number(formatKronerToOre(accountAmount));
      budgetAmount = Number(formatKronerToOre(budgetAmount));
      let deviation = accountAmount - budgetAmount;
      deviation = formatOreToKroner(deviation);
      className = `deviation${account.accountId}`;
      html += objBankAccountTransactions.inputTableColumnNew('deviation', deviation, 10);

      html += "</tr>";

      // Accomulate
      totalAccountAmount += Number(accountAmount);
      totalBudgetAmount += Number(budgetAmount);
    }
  });

  // Sum row
  html += "<tr>";

  // Show menu
  rowNumber++;
  html += objBankAccountTransactions.menuNew(rowNumber);

  html += "<td class='center bold'>Sum</td>";

  // Total amount annual accounts
  totalAccountAmount = formatOreToKroner(totalAccountAmount);
  html += objBankAccountTransactions.inputTableColumnNew('totalAccountAmount', totalAccountAmount, 10);

  // Budget fiscal year
  totalBudgetAmount = formatOreToKroner(String(totalBudgetAmount));
  html += objBankAccountTransactions.inputTableColumnNew('totalBudgetAmount', totalBudgetAmount, 10);

  // Total deviation
  totalAccountAmount = formatKronerToOre(totalAccountAmount);
  totalBudgetAmount = formatKronerToOre(totalBudgetAmount);
  let totalDeviation = Number(totalAccountAmount) - Number(totalBudgetAmount);
  totalDeviation = formatOreToKroner(String(totalDeviation));
  html += objBankAccountTransactions.inputTableColumnNew('totalDeviation', totalDeviation, 10);

  totalAccountAmount = formatOreToKroner(String(totalAccountAmount));
  totalBudgetAmount = formatOreToKroner(String(totalBudgetAmount));

  html += "</tr>";

  // empty table row
  html += objAnnualAccount.insertEmptyTableRowNew(0, '');

  // The end of the table
  html += objAnnualAccount.endTableNew();
  document.querySelector('.annualaccount').innerHTML = html;

  return rowNumber;
}

// Show income for next year
function showIncomeNextYear(rowNumber) {

  // start table
  let html = objAnnualAccount.startTableNew('width:1100px;');

  // table header
  html += objAnnualAccount.showTableHeaderNew("width:200px;", '', 'Leilighet', 'Kvadratmeter', 'Faste kostnader', 'Felleskostnad/måned', 'Felleskostnad/år');

  let totalCommonCostsMonth = 0;
  let totalCommonCostsYear = 0;
  let totalSquareMeters = 0;
  let totalFixedCosts = 0;

  // Get fixed costs per month
  let fromDate = document.querySelector('.filterFromDate').value;
  fromDate = Number(convertDateToISOFormat(fromDate));
  let toDate = document.querySelector('.filterToDate').value;
  toDate = Number(convertDateToISOFormat(toDate));
  let numFixedCost = Number(getFixedCost(fromDate, toDate));

  // Get fixed costs per year
  // 12 month and 7 condos
  let fixedCost = String(Math.round(numFixedCost / 12 / 7) * (-1));

  // Start HTML table
  //let html = objAnnualAccount.startTableNew('width:1100px;');

  // Header filter for search
  //html += objAnnualAccount.showHTMLFilterHeader("width:200px;", rowNumber, '');
  //html += objAnnualAccount.showTableHeaderNew("width:200px;", '', '', '', '', '', '');
  //html += "<tr><td></td><td></td>";

  // Header
  //rowNumber++;
  //html += objAnnualAccount.showTableHeaderNew("width:200px;", '', 'Leilighet', 'Kvadratmeter', 'Faste kostnader', 'Felleskostnad/måned', 'Felleskostnad/år');

  html += "</tr>"

  objCondo.arrayCondo.forEach((condo) => {

    html += '<tr>';

    // Show menu
    rowNumber++;
    html += objBankAccountTransactions.menuNew(rowNumber);

    // name
    className = `name${condo.condoId}`;
    html += objBankAccountTransactions.inputTableColumnNew(className, condo.name, 45);

    // Square meters
    let squareMeters = formatOreToKroner(condo.squareMeters);
    className = `squareMeters${condo.condoId}`;
    html += objBankAccountTransactions.inputTableColumnNew(className, squareMeters, 10);

    // price/ squareMeter
    let priceSquareMeter = document.querySelector('.filterPriceSquareMeter').value;
    className = `priceSquareMeter${condo.condoId}`;
    //html += objBankAccountTransactions.inputTableColumnNew(className, priceSquareMeter, 10);

    // Fixed cost
    fixedCost = formatOreToKroner(fixedCost);
    className = `fixedCost${condo.condoId}`;
    html += objBankAccountTransactions.inputTableColumnNew(className, fixedCost, 10);

    // Common cost per month
    priceSquareMeter = Number(formatKronerToOre(priceSquareMeter));
    squareMeters = Number(formatKronerToOre(squareMeters));
    let commonCostsMonth = (priceSquareMeter * squareMeters) / 100;
    fixedCost = Number(formatKronerToOre(fixedCost));
    commonCostsMonth = formatOreToKroner(String(commonCostsMonth + fixedCost));
    className = `commonCostsMonth${condo.accountId}`;
    html += objBankAccountTransactions.inputTableColumnNew(className, commonCostsMonth, 10);

    // Common cost per Year
    commonCostsMonth = Number(formatKronerToOre(commonCostsMonth));
    let commonCostsYear = (commonCostsMonth + fixedCost) * 12;
    commonCostsYear = formatOreToKroner(String(commonCostsYear));
    className = `commonCostsYear${condo.accountId}`;
    html += objBankAccountTransactions.inputTableColumnNew(className, commonCostsYear, 10);

    commonCostsMonth = (priceSquareMeter * squareMeters) / 100;
    commonCostsMonth = String(commonCostsMonth + fixedCost);
    commonCostsMonth = formatOreToKroner(commonCostsMonth);

    // Common cost per Year
    commonCostsMonth = formatKronerToOre(commonCostsMonth);
    commonCostsYear = ((commonCostsMonth + fixedCost) * 12) / 100;

    // Accomulate
    totalSquareMeters += Number(squareMeters);
    totalFixedCosts += Number(fixedCost);
    totalCommonCostsMonth += Number(commonCostsMonth);
    totalCommonCostsYear += Number(commonCostsYear);

  });

  // Sum row
  html += "<tr>";

  // Show menu
  rowNumber++;
  html += objBankAccountTransactions.menuNew(rowNumber);

  html += "<td class='center bold'>Sum</td>";

  html += objBankAccountTransactions.inputTableColumnNew('totalSquareMeters', formatOreToKroner(String(totalSquareMeters, 10)));
  html += objBankAccountTransactions.inputTableColumnNew('totalFixedCosts', formatOreToKroner(String(totalFixedCosts, 10)));
  html += objBankAccountTransactions.inputTableColumnNew('totalCommonCostsMonth', formatOreToKroner(String(totalCommonCostsMonth, 10)));
  html += objBankAccountTransactions.inputTableColumnNew('totalCommonCostsYear', formatOreToKroner(String(totalCommonCostsYear, 10)));

  html += "</tr>";

  // empty table row
  html += objAnnualAccount.insertEmptyTableRowNew(0, '');

  // The end of the table
  html += objAnnualAccount.endTableNew();
  document.querySelector('.incomeNextYear').innerHTML = html;

  return rowNumber;
}

// Show remote heating
function showRemoteHeating(rowNumber) {

  // start table
  let html = objAnnualAccount.startTableNew('width:1100px;');

  // table header
  html += objAnnualAccount.showTableHeaderNew("width:200px;", '', '', 'Betalingsdato', 'Beløp', 'Kilowattimer', 'Pris/Kilowatt timer');

  // Accomulators
  // payment
  let sumPayment = 0;

  // KWHour
  let sumNumberKWHour = 0;

  // Filter
  const fromDate = convertDateToISOFormat(document.querySelector('.filterFromDate').value);
  const toDate = convertDateToISOFormat(document.querySelector('.filterToDate').value);

  // Start HTML table
  //let html = objAnnualAccount.startTableNew('width:1100px;');

  // Header filter for search
  //html += objAnnualAccount.showHTMLFilterHeader("width:200px;", rowNumber, '');
  //html += objAnnualAccount.showTableHeaderNew("width:200px;", '', '', '', '', '', '');
  //html += "<tr><td></td><tr>";

  // Header
  //rowNumber++;
  //html += objAnnualAccount.showTableHeaderNew("width:200px;", '', '', 'Betalingsdato', 'Beløp', 'Kilowattimer', 'Pris/Kilowatt timer');

  // Get row number for payment Remote Heating Account Id
  const condominiumRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
  if (condominiumRowNumber !== -1) {

    const paymentRemoteHeatingAccountId = Number(objCondominiums.arrayCondominiums[condominiumRowNumber].paymentRemoteHeatingAccountId);
    objBankAccountTransactions.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {
      //if (bankAccountTransaction.accountId === paymentRemoteHeatingAccountId) {
      //if (Number(bankAccountTransaction.date) >= Number(fromDate) && Number(bankAccountTransaction.date) <= Number(toDate)) {

      html += '<tr>';

      // Show menu
      rowNumber++;
      html += objAnnualAccount.insertEmptyTableRowNew(rowNumber, '');

      // Show menu
      //rowNumber++;
      //html += objAnnualAccount.menuNew(rowNumber);

      const date = formatToNorDate(bankAccountTransaction.date);
      className = `date${bankAccountTransaction.bankAccountTransactionId}`;
      html += objAnnualAccount.inputTableColumnNew(className, date, 10);

      let payment = formatOreToKroner(bankAccountTransaction.payment);
      className = `payment${bankAccountTransaction.bankAccountTransactionId}`;
      html += objAnnualAccount.inputTableColumnNew(className, payment, 10);

      // numberKWHour
      let numberKWHour = formatOreToKroner(bankAccountTransaction.numberKWHour);
      className = `numberKWHour${bankAccountTransaction.bankAccountTransactionId}`;
      html += objAnnualAccount.inputTableColumnNew(className, numberKWHour, 10);

      // Price per KWHour
      payment = Number(bankAccountTransaction.payment);
      numberKWHour = Number(bankAccountTransaction.numberKWHour);

      let priceKWHour = '';
      if (numberKWHour !== 0 && payment !== 0) priceKWHour = (-1 * payment) / numberKWHour;

      if (priceKWHour > 0) priceKWHour = priceKWHour.toFixed(2);
      priceKWHour = priceKWHour.replace(".", ",");
      priceKWHour = formatOreToKroner(priceKWHour);
      className = ` priceKWHour${bankAccountTransaction.bankAccountTransactionId}`;
      html += objAnnualAccount.inputTableColumnNew(className, priceKWHour, 10);

      html += "</tr>";

      // Accomulate
      // payment
      sumPayment += Number(bankAccountTransaction.payment);

      // KWHour
      sumNumberKWHour += Number(bankAccountTransaction.numberKWHour);
      //}
      //}
    });

    // Sum row
    html += "<tr>";

      // Show menu
    //rowNumber++;
  
    html += objAnnualAccount.insertEmptyTableRowNew(rowNumber, '');
    //html += objBankAccountTransactions.menuNew(rowNumber);

    html += "<td class='center bold'>Sum</td>";

    html += objBankAccountTransactions.inputTableColumnNew('sumPayment', formatOreToKroner(String(sumPayment, 10)));
    html += objBankAccountTransactions.inputTableColumnNew('sumNumberKWHour', formatOreToKroner(String(sumNumberKWHour, 10)));

    // Price per KWHour
    let priceKWHour = 0;
    if (sumNumberKWHour !== 0 && sumPayment !== 0) priceKWHour = (-1 * sumPayment) / sumNumberKWHour;
    priceKWHour = priceKWHour.toFixed(2);
    priceKWHour = priceKWHour.replace(".", ",");
    priceKWHour = formatOreToKroner(priceKWHour);
    className = `priceKWHour`;
    html += objBankAccountTransactions.inputTableColumnNew(className, formatOreToKroner(String(priceKWHour, 10)));

    html += "</tr>";

    // empty table row
    html += objAnnualAccount.insertEmptyTableRowNew(0, '');

    // The end of the table
    html += objAnnualAccount.endTableNew();
    document.querySelector('.remoteHeating').innerHTML = html;

    return rowNumber;
  }
}

// Show showBank Deposit for next year
function showBankDeposit(rowNumber) {

  // start table
  let html = objAnnualAccount.startTableNew('width:1100px;');

  // table header
  let nextBudgetYear = Number(document.querySelector('.filterYear').value) + 1;
  html += objAnnualAccount.showTableHeaderNew("width:200px;", '', '', '', 'Tekst', 'Dato', `Budsjett ${nextBudgetYear}`);

  let accAmount = 0;

  // Start HTML table
  //let html = objAnnualAccount.startTableNew('width:1100px;');

  // Header filter for search
  //html += objAnnualAccount.showHTMLFilterHeader("width:200px;", rowNumber, '');
  //html += objAnnualAccount.showTableHeaderNew("width:200px;", '', '', '', '', '', '');
  //html += "<tr><td></td><tr>";

  // Header
  //rowNumber++;
  //html += objAnnualAccount.showTableHeaderNew("width:200px;", '', '', '', 'Text', 'Dato', `Budsjett ${nextBudgetYear}`);
  //html += objAnnualAccount.showTableHeaderNew("width:200px;", '');

  //html += "<tr><td></td><td></td>";
  html += objAnnualAccount.insertEmptyTableRowNew(0, '', '');

  // Show menu
  rowNumber++;
  html += objAnnualAccount.menuNew(rowNumber);

  // Text
  className = `text`;
  html += objAnnualAccount.inputTableColumnNew(className, 'Bankinnskudd', 10);

  // closingBalanceDate
  let closingBalanceDate = "";
  let bankAccountRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.condominiumId === objUserPassword.condominiumId);
  if (bankAccountRowNumber !== -1) {

    closingBalanceDate = (objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalanceDate);
    closingBalanceDate = formatToNorDate(closingBalanceDate);
  }
  className = `closingBalanceDate`;
  html += objAnnualAccount.inputTableColumnNew(className, closingBalanceDate, 10);

  // Bank deposit
  let bankDepositAmount = "";
  bankDepositAmount = (objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalance);
  bankDepositAmount = formatOreToKroner(bankDepositAmount);

  className = `bankDepositAmount`
  html += objAnnualAccount.inputTableColumnNew(className, bankDepositAmount, 10);

  html += "</tr>";

  accAmount += Number(formatKronerToOre(bankDepositAmount));

  // budget
  objBudget.arrayBudgets.forEach((budget) => {
    if (Number(budget.amount) !== 0) {

      //html += "<tr><td></td><td></td>";
      html += "<tr>";

      html += objAnnualAccount.insertEmptyTableRowNew(0, '', '');

      // Show menu
      rowNumber++;
      html += objAnnualAccount.menuNew(rowNumber);

      // Account Name
      let name = '';
      const accountRowNumber = objAccounts.arrayAccounts.findIndex(account => account.accountId === budget.accountId);
      if (accountRowNumber !== -1) {

        name = objAccounts.arrayAccounts[accountRowNumber].name;
      }
      className = `name${budget.budgetId}`
      html += objAnnualAccount.inputTableColumnNew(className, name, 10);

      // Date
      html += "<td></td>";

      // budget amount
      let amount = formatOreToKroner(budget.amount);
      className = `amount${budget.budgetId}`
      html += objBankAccountTransactions.inputTableColumnNew(className, amount, 10);

      html += "</tr>";

      // accumulate
      accAmount += Number(formatKronerToOre(amount));
    }
  });

  // Sum

  //html += '<tr><td></td><td></td>';
  html += objAnnualAccount.insertEmptyTableRowNew(0, '', '');

  // Show menu
  rowNumber++;
  html += objBankAccountTransactions.menuNew(rowNumber);

  className = `estimatedBankDeposit`;
  html += objBankAccountTransactions.inputTableColumnNew(className, 'Estimert bankinnskudd', 10);

  // Next year
  closingBalanceDate = Number(convertDateToISOFormat(closingBalanceDate));
  let closingBalanceDateNextYear = closingBalanceDate + 10000;
  closingBalanceDateNextYear = formatToNorDate(closingBalanceDateNextYear);
  className = `closingBalanceDateNextYear`;
  html += objBankAccountTransactions.inputTableColumnNew(className, closingBalanceDateNextYear, 10);

  // Bank deposit next year
  const bankDepositNextYear = formatOreToKroner(String(accAmount));
  className = `bankDepositNextYear`;
  html += objBankAccountTransactions.inputTableColumnNew(className, bankDepositNextYear, 10);

  html += "<tr>";

  // empty table row
  html += objAnnualAccount.insertEmptyTableRowNew(0, '');

  // Show the rest of the menu
  html += objBankAccountTransactions.showRestMenuNew(rowNumber);

  // The end of the table
  html += objAnnualAccount.endTableNew();
  document.querySelector('.bankDeposit').innerHTML = html;

  return rowNumber;
}
