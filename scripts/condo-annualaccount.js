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
const objCommonCosts = new CommonCost('commoncost');
const objAnnualAccount = new AnnualAccount('annualaccount');

testMode();

// Exit application if no activity for 1 hour
exitIfNoActivity();

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
    await objCommonCosts.loadCommonCostsTable(objUserPassword.condominiumId);
    await objBudget.loadBudgetsTable(objUserPassword.condominiumId, objAnnualAccount.nineNine, objAnnualAccount.nineNine);
    await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId, objAnnualAccount.nineNine);
    const fixedCost = 'A';
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);

    // Show header
    let menuNumber = 0;
    showHeader();

    // Show filter
    const year = today.getFullYear();
    let fromDate = '01.01.' + year;
    let toDate = getCurrentDate();
    showFilter(year, fromDate, toDate);

    const condominiumId = Number(objUserPassword.condominiumId);
    const deleted = "N";

    fromDate = document.querySelector('.filterFromDate').value;
    fromDate = Number(convertDateToISOFormat(fromDate));

    toDate = document.querySelector('.filterToDate').value;
    toDate = Number(convertDateToISOFormat(toDate));

    const orderBy = 'condoId ASC, date DESC, income ASC';
    await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, objAnnualAccount.nineNine, objAnnualAccount.nineNine, 0, fromDate, toDate);

    // Show annual accounts
    menuNumber = showAnnualAccounts(menuNumber);

    // Show income for next year
    menuNumber = showIncomeNextYear(menuNumber);

    // Show remote Heating
    // Get row number for payment Remote Heating Account Id
    const rowNumberCondominium = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
    if (rowNumberCondominium !== -1) {

      const paymentRemoteHeatingAccountId = Number(objCondominiums.arrayCondominiums[rowNumberCondominium].paymentRemoteHeatingAccountId);
      await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, objAnnualAccount.nineNine, paymentRemoteHeatingAccountId, 0, fromDate, toDate);
      menuNumber = showRemoteHeating(menuNumber);

      // Show bank deposit for next year
      const nextBudgetYear = Number(document.querySelector('.filterYear').value) + 1;
      await objBudget.loadBudgetsTable(objUserPassword.condominiumId, nextBudgetYear, objAnnualAccount.nineNine);
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
        let fromDate = Number(convertDateToISOFormat(document.querySelector('.filterFromDate').value));
        let toDate = Number(convertDateToISOFormat(document.querySelector('.filterToDate').value));
        const orderBy = 'condoId ASC, date DESC, income ASC';
        await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, objAnnualAccount.nineNine, objAnnualAccount.nineNine, 0, fromDate, toDate);

        const budgetYear = Number(document.querySelector('.filterYear').value);
        await objBudget.loadBudgetsTable(objUserPassword.condominiumId, budgetYear, objAnnualAccount.nineNine);

        // Show filter
        const year = Number(document.querySelector(".filterYear").value);
        fromDate = document.querySelector(".filterFromDate").value;
        toDate = document.querySelector(".filterToDate").value;
        showFilter(year, fromDate, toDate);

        // Show annual accounts
        let menuNumber = 0;
        menuNumber = showAnnualAccounts(menuNumber);

        // Show income for next year
        menuNumber = showIncomeNextYear(menuNumber);

        // Show remote Heating
        // Get row number for payment Remote Heating Account Id
        const rowNumberCondominium = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
        if (rowNumberCondominium !== -1) {

          const paymentRemoteHeatingAccountId = Number(objCondominiums.arrayCondominiums[rowNumberCondominium].paymentRemoteHeatingAccountId);
          fromDate = Number(convertDateToISOFormat(fromDate));
          toDate = Number(convertDateToISOFormat(toDate));
          await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, objAnnualAccount.nineNine, paymentRemoteHeatingAccountId, 0, fromDate, toDate);

          menuNumber = showRemoteHeating(menuNumber);

          // Show bank deposit for next year
          const nextBudgetYear = Number(document.querySelector('.filterYear').value) + 1;
          await objBudget.loadBudgetsTable(objUserPassword.condominiumId, nextBudgetYear, objAnnualAccount.nineNine);
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
      const rowNumberAccount = objAccounts.arrayAccounts.findIndex(account => account.accountId === bankAccountTransaction.accountId);
      if (rowNumberAccount !== -1) {

        if (objAccounts.arrayAccounts[rowNumberAccount].fixedCost === 'Y') {

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

// Show header
function showHeader() {

  // Start table
  let html = objAnnualAccount.startTable('width:1100px;');

  // show main header
  html += objAnnualAccount.showTableHeader("width:200px;", 'Årsregnskap');

  // The end of the table
  html += objAnnualAccount.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(year, fromDate, toDate) {

  // Start table
  html = objAnnualAccount.startTable('width:1100px;');

  // Header filter
  html += objAnnualAccount.showTableHeader("width:1100px;", '', '', 'Fra dato', 'Til dato', 'Busjettår', 'Pris per m2');

  // start table body
  html += objAnnualAccount.startTableBody();

  // insert table columns in start of a row
  html += objAnnualAccount.insertTableColumns('', 0, '', '');

  // show from date
  //const fromDate = '01.01.' + String(today.getFullYear());
  html += objAnnualAccount.inputTableColumn('filterFromDate', fromDate, 10);

  // show to date
  //const toDate = getCurrentDate();
  html += objAnnualAccount.inputTableColumn('filterToDate', toDate, 10);

  // Budget year
  //const year = today.getFullYear();
  html += objAnnualAccount.selectInterval('filterYear', 'width:100px;', 2020, 2030, year, 'Budsjettår');

  // price per square meter per month
  const amount = getCommonCost(year);
  html += objAnnualAccount.inputTableColumn('filterPriceSquareMeter', amount, 10);

  html += "</tr>";

  html += objAnnualAccount.insertTableColumns('', 0, '', '', '', '', '', '');

  // end table body
  html += objAnnualAccount.endTableBody();

  // The end of the table
  html += objAnnualAccount.endTable();
  document.querySelector('.filter').innerHTML = html;
}

// Show annual accounts
function showAnnualAccounts(rowNumber) {

  // start table
  let html = objAnnualAccount.startTable('width:1100px;');

  // table header
  html += objAnnualAccount.showTableHeader("width:200px;", '', '', 'Konto', 'Beløp', 'Budsjett', 'Avvik');

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
      html += objAnnualAccount.insertTableColumns('', rowNumber, '');

      // name
      html += objAnnualAccount.inputTableColumn('name', account.name, 45);

      // accountAmount
      accountAmount = formatOreToKroner(accountAmount);
      className = `accountAmount${account.accountId}`;
      html += objAnnualAccount.inputTableColumn('accountAmount', accountAmount, 10);

      // budgetAmount
      budgetAmount = formatOreToKroner(budgetAmount);
      className = `budgetAmount${account.accountId}`;
      html += objAnnualAccount.inputTableColumn('budgetAmount', budgetAmount, 10);

      // Deviation
      accountAmount = Number(formatKronerToOre(accountAmount));
      budgetAmount = Number(formatKronerToOre(budgetAmount));
      let deviation = accountAmount - budgetAmount;
      deviation = formatOreToKroner(deviation);
      className = `deviation${account.accountId}`;
      html += objAnnualAccount.inputTableColumn('deviation', deviation, 10);

      html += "</tr>";

      // Accomulate
      totalAccountAmount += Number(accountAmount);
      totalBudgetAmount += Number(budgetAmount);
    }
  });

  // Sum row
  //html += "<tr>";

  //html += "<td class='center bold'>Sum</td>";

  // Total amount annual accounts
  totalAccountAmount = formatOreToKroner(totalAccountAmount);
  //html += objBankAccountTransactions.inputTableColumn('totalAccountAmount', totalAccountAmount, 10);

  // Budget fiscal year
  totalBudgetAmount = formatOreToKroner(String(totalBudgetAmount));
  //html += objBankAccountTransactions.inputTableColumn('totalBudgetAmount', totalBudgetAmount, 10);

  // Total deviation
  totalAccountAmount = formatKronerToOre(totalAccountAmount);
  totalBudgetAmount = formatKronerToOre(totalBudgetAmount);
  let totalDeviation = Number(totalAccountAmount) - Number(totalBudgetAmount);
  totalDeviation = formatOreToKroner(String(totalDeviation));
  //html += objBankAccountTransactions.inputTableColumn('totalDeviation', totalDeviation, 10);

  totalAccountAmount = formatOreToKroner(String(totalAccountAmount));
  totalBudgetAmount = formatOreToKroner(String(totalBudgetAmount));

  rowNumber++;
  html += objBankAccountTransactions.insertTableColumns('', rowNumber, '', '', totalAccountAmount, totalBudgetAmount, totalDeviation);

  html += "</tr>";

  // empty table row
  html += objBankAccountTransactions.insertTableColumns('', 0, '');

  // The end of the table
  html += objAnnualAccount.endTable();
  document.querySelector('.annualaccount').innerHTML = html;

  return rowNumber;
}

// Show income for next year
function showIncomeNextYear(rowNumber) {

  // start table
  let html = objAnnualAccount.startTable('width:1100px;');

  // table header
  html += objAnnualAccount.showTableHeader("width:200px;", '', '', '', 'Leilighet', 'Kvadratmeter', 'Faste kostnader', 'Felleskostnad/måned', 'Felleskostnad/år');

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

  html += "</tr>"

  objCondo.arrayCondo.forEach((condo) => {

    //html += '<tr>';

    // insert table columns in start of a row
    rowNumber++;
    html += objAnnualAccount.insertTableColumns('', rowNumber, '', '');

    // name
    className = `name${condo.condoId}`;
    html += objAnnualAccount.inputTableColumn(className, condo.name, 45);

    // Square meters
    let squareMeters = formatOreToKroner(condo.squareMeters);
    className = `squareMeters${condo.condoId}`;
    html += objAnnualAccount.inputTableColumn(className, squareMeters, 10);

    // price/ squareMeter
    let priceSquareMeter = document.querySelector('.filterPriceSquareMeter').value;
    className = `priceSquareMeter${condo.condoId}`;
    //html += objBankAccountTransactions.inputTableColumn(className, priceSquareMeter, 10);

    // Fixed cost
    fixedCost = formatOreToKroner(fixedCost);
    className = `fixedCost${condo.condoId}`;
    html += objAnnualAccount.inputTableColumn(className, fixedCost, 10);

    // Common cost per month
    priceSquareMeter = Number(formatKronerToOre(priceSquareMeter));
    squareMeters = Number(formatKronerToOre(squareMeters));
    let commonCostsMonth = (priceSquareMeter * squareMeters) / 100;
    fixedCost = Number(formatKronerToOre(fixedCost));
    commonCostsMonth = formatOreToKroner(String(commonCostsMonth + fixedCost));
    className = `commonCostsMonth${condo.accountId}`;
    html += objAnnualAccount.inputTableColumn(className, commonCostsMonth, 10);

    // Common cost per Year
    commonCostsMonth = Number(formatKronerToOre(commonCostsMonth));
    let commonCostsYear = (commonCostsMonth + fixedCost) * 12;
    commonCostsYear = formatOreToKroner(String(commonCostsYear));
    className = `commonCostsYear${condo.accountId}`;
    html += objAnnualAccount.inputTableColumn(className, commonCostsYear, 10);

    commonCostsMonth = (priceSquareMeter * squareMeters) / 100;
    commonCostsMonth = String(commonCostsMonth + fixedCost);
    commonCostsMonth = formatOreToKroner(commonCostsMonth);

    // Common cost per Year
    commonCostsMonth = formatKronerToOre(commonCostsMonth);
    //commonCostsYear = ((commonCostsMonth + fixedCost) * 12) / 100;
    commonCostsYear = (commonCostsMonth + fixedCost) * 12;

    // Accomulate
    totalSquareMeters += Number(squareMeters);
    totalFixedCosts += Number(fixedCost);
    totalCommonCostsMonth += Number(commonCostsMonth);
    totalCommonCostsYear += Number(commonCostsYear);
  });

  totalSquareMeters = formatOreToKroner(String(totalSquareMeters, 10));
  totalFixedCosts = formatOreToKroner(String(totalFixedCosts, 10));
  totalCommonCostsMonth = formatOreToKroner(String(totalCommonCostsMonth, 10));
  totalCommonCostsYear = formatOreToKroner(String(totalCommonCostsYear, 10));

  rowNumber++;
  html += objAnnualAccount.insertTableColumns('', rowNumber, '', '', '', totalSquareMeters, totalFixedCosts, totalCommonCostsMonth, totalCommonCostsYear);

  html += "</tr>";

  // empty table row
  html += objAnnualAccount.insertTableColumns('', 0, '', '', '', '', '', '');
  html += "</tr>";

  // The end of the table
  html += objAnnualAccount.endTable();
  document.querySelector('.incomeNextYear').innerHTML = html;

  return rowNumber;
}

// Show remote heating
function showRemoteHeating(rowNumber) {

  // start table
  let html = objAnnualAccount.startTable('width:1100px;');

  // table header
  html += objAnnualAccount.showTableHeader("width:200px;", '', '', 'Betalingsdato', 'Beløp', 'Kilowattimer', 'Pris/Kilowatt timer');

  // Accomulators
  // payment
  let sumPayment = 0;

  // KWHour
  let sumNumberKWHour = 0;

  // Filter
  const fromDate = convertDateToISOFormat(document.querySelector('.filterFromDate').value);
  const toDate = convertDateToISOFormat(document.querySelector('.filterToDate').value);

  // Get row number for payment Remote Heating Account Id
  const rowNumberCondominium = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
  if (rowNumberCondominium !== -1) {

    const paymentRemoteHeatingAccountId = Number(objCondominiums.arrayCondominiums[rowNumberCondominium].paymentRemoteHeatingAccountId);
    objBankAccountTransactions.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

      // insert table columns in start of a row
      rowNumber++;
      html += objAnnualAccount.insertTableColumns('', rowNumber, '');

      const date = formatToNorDate(bankAccountTransaction.date);
      className = `date${bankAccountTransaction.bankAccountTransactionId}`;
      html += objAnnualAccount.inputTableColumn(className, date, 10);

      let payment = formatOreToKroner(bankAccountTransaction.payment);
      className = `payment${bankAccountTransaction.bankAccountTransactionId}`;
      html += objAnnualAccount.inputTableColumn(className, payment, 10);

      // kilowattHour
      let kilowattHour = formatOreToKroner(bankAccountTransaction.kilowattHour);
      className = `kilowattHour${bankAccountTransaction.bankAccountTransactionId}`;
      html += objAnnualAccount.inputTableColumn(className, kilowattHour, 10);

      // Price per KWHour
      payment = Number(bankAccountTransaction.payment);
      kilowattHour = Number(bankAccountTransaction.kilowattHour);

      let priceKWHour = '';
      if (kilowattHour !== 0 && payment !== 0) priceKWHour = (-1 * payment) / kilowattHour;

      if (priceKWHour > 0) priceKWHour = priceKWHour.toFixed(2);
      priceKWHour = priceKWHour.replace(".", ",");
      priceKWHour = formatOreToKroner(priceKWHour);
      className = ` priceKWHour${bankAccountTransaction.bankAccountTransactionId}`;
      html += objAnnualAccount.inputTableColumn(className, priceKWHour, 10);

      html += "</tr>";

      // Accomulate
      // payment
      sumPayment += Number(bankAccountTransaction.payment);

      // KWHour
      sumNumberKWHour += Number(bankAccountTransaction.kilowattHour);
    });

    // Sum row
    // insert table columns in start of a row
    rowNumber++;
    html += objAnnualAccount.insertTableColumns('', rowNumber, '');

    html += "<td class='center bold'>Sum</td>";

    html += objBankAccountTransactions.inputTableColumn('sumPayment', formatOreToKroner(String(sumPayment, 10)));
    html += objBankAccountTransactions.inputTableColumn('sumNumberKWHour', formatOreToKroner(String(sumNumberKWHour, 10)));

    // Price per KWHour
    let priceKWHour = 0;
    if (sumNumberKWHour !== 0 && sumPayment !== 0) priceKWHour = (-1 * sumPayment) / sumNumberKWHour;
    priceKWHour = priceKWHour.toFixed(2);
    priceKWHour = priceKWHour.replace(".", ",");
    priceKWHour = formatOreToKroner(priceKWHour);
    className = `priceKWHour`;
    html += objBankAccountTransactions.inputTableColumn(className, formatOreToKroner(String(priceKWHour, 10)));

    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objAnnualAccount.insertTableColumns('', 0, '');

    // The end of the table
    html += objAnnualAccount.endTable();
    document.querySelector('.remoteHeating').innerHTML = html;

    return rowNumber;
  }
}

// Show showBank Deposit for next year
function showBankDeposit(rowNumber) {

  // start table
  let html = objAnnualAccount.startTable('width:1100px;');

  // table header
  let nextBudgetYear = Number(document.querySelector('.filterYear').value) + 1;
  html += objAnnualAccount.showTableHeader("width:200px;", '', '', '', 'Tekst', 'Dato', `Budsjett ${nextBudgetYear}`);

  let accAmount = 0;

  // insert table columns in start of a row
  rowNumber++;
  html += objBankAccountTransactions.insertTableColumns('', 0, '', '', '');

  // Text
  className = `text`;
  html += objAnnualAccount.inputTableColumn(className, 'Bankinnskudd', 10);

  // closingBalanceDate
  let closingBalanceDate = "";
  let rowNumberBankAccount = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.condominiumId === objUserPassword.condominiumId);
  if (rowNumberBankAccount !== -1) {

    closingBalanceDate = (objBankAccounts.arrayBankAccounts[rowNumberBankAccount].closingBalanceDate);
    closingBalanceDate = formatToNorDate(closingBalanceDate);
  }
  className = `closingBalanceDate`;
  html += objAnnualAccount.inputTableColumn(className, closingBalanceDate, 10);

  // Bank deposit
  let bankDepositAmount = "";
  bankDepositAmount = (objBankAccounts.arrayBankAccounts[rowNumberBankAccount].closingBalance);
  bankDepositAmount = formatOreToKroner(bankDepositAmount);

  className = `bankDepositAmount`
  html += objAnnualAccount.inputTableColumn(className, bankDepositAmount, 10);

  html += "</tr>";

  accAmount += Number(formatKronerToOre(bankDepositAmount));

  // budget
  objBudget.arrayBudgets.forEach((budget) => {
    if (Number(budget.amount) !== 0) {

      // insert table columns in start of a row
      html += objAnnualAccount.insertTableColumns('', 0, '', '', '');

      // Account Name
      let name = '';
      const rowNumberAccount = objAccounts.arrayAccounts.findIndex(account => account.accountId === budget.accountId);
      if (rowNumberAccount !== -1) {

        name = objAccounts.arrayAccounts[rowNumberAccount].name;
      }
      className = `name${budget.budgetId}`
      html += objAnnualAccount.inputTableColumn(className, name, 10);

      //empty column
      let emptyColumn = '';
      className = `emptyColumn${budget.budgetId}`
      html += objAnnualAccount.inputTableColumn(className, '', 10);

      // budget amount
      let amount = formatOreToKroner(budget.amount);
      className = `amount${budget.budgetId}`
      html += objAnnualAccount.inputTableColumn(className, amount, 10);

      html += "</tr>";

      // accumulate
      accAmount += Number(formatKronerToOre(amount));
    }
  });

  // Sum

  // insert table columns in start of a row
  rowNumber++;
  html += objAnnualAccount.insertTableColumns('', rowNumber, '', '');

  className = `estimatedBankDeposit`;
  html += objAnnualAccount.inputTableColumn(className, 'Estimert bankinnskudd', 10);

  // Next year
  closingBalanceDate = Number(convertDateToISOFormat(closingBalanceDate));
  let closingBalanceDateNextYear = closingBalanceDate + 10000;
  closingBalanceDateNextYear = formatToNorDate(closingBalanceDateNextYear);
  className = `closingBalanceDateNextYear`;
  html += objBankAccountTransactions.inputTableColumn(className, closingBalanceDateNextYear, 10);

  // Bank deposit next year
  const bankDepositNextYear = formatOreToKroner(String(accAmount));
  className = `bankDepositNextYear`;
  html += objBankAccountTransactions.inputTableColumn(className, bankDepositNextYear, 10);

  // insert table columns in start of a row
  html += objAnnualAccount.insertTableColumns('', 0, '');

  // Show the rest of the menu
  rowNumber++;
  html += objBankAccountTransactions.showRestMenu(rowNumber);

  // The end of the table
  html += objAnnualAccount.endTable();
  document.querySelector('.bankDeposit').innerHTML = html;

  return rowNumber;
}

function getCommonCost(year) {

  year = Number(year);
  let amount = 0;
  objCommonCosts.arrayCommonCosts.forEach((commonCost) => {

    if (commonCost.year === year) amount = Number(commonCost.amount);
  });

  amount = formatOreToKroner(amount);
  return amount;
}