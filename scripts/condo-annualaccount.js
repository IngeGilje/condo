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
    const budgetYear = today.getFullYear();
    let fromDate = '01.01.' + budgetYear;
    let toDate = getCurrentDate();
    showFilter(budgetYear, fromDate, toDate);

    const condominiumId = Number(objUserPassword.condominiumId);
    const deleted = "N";

    fromDate = document.querySelector('.filterFromDate').value;
    fromDate = Number(convertDateToISOFormat(fromDate));

    toDate = document.querySelector('.filterToDate').value;
    toDate = Number(convertDateToISOFormat(toDate));

    // Show remote Heating
    // Get row number for payment Remote Heating Account Id
    const rowNumberCondominium = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
    if (rowNumberCondominium !== -1) {

      // Show annual accounts
      const orderBy = 'condoId ASC, date DESC, income ASC';
      await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, objAnnualAccount.nineNine, objAnnualAccount.nineNine, 0, fromDate, toDate);
      menuNumber = showAnnualAccounts(menuNumber);

      const paymentRemoteHeatingAccountId = Number(objCondominiums.arrayCondominiums[rowNumberCondominium].paymentRemoteHeatingAccountId);
      await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, objAnnualAccount.nineNine, paymentRemoteHeatingAccountId, 0, fromDate, toDate);
      menuNumber = showRemoteHeating(menuNumber);

      // Show income for next year
      menuNumber = showIncomeNextYear(menuNumber);

      // Show bank deposit for next year
      const nextBudgetYear = Number(document.querySelector('.filterBudgetYear').value) + 1;
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
      || [...event.target.classList].some(cls => cls.startsWith('filterBudgetYear'))
      || [...event.target.classList].some(cls => cls.startsWith('filterPriceSquareMeter'))) {

      showAnnualAccountSync();

      // Show annual account after change of filter
      async function showAnnualAccountSync() {

        let menuNumber = 0;

        const condominiumId = Number(objUserPassword.condominiumId);
        const deleted = "N";

        fromDate = document.querySelector('.filterFromDate').value;
        fromDate = Number(convertDateToISOFormat(fromDate));

        toDate = document.querySelector('.filterToDate').value;
        toDate = Number(convertDateToISOFormat(toDate));

        //const orderBy = 'condoId ASC, date DESC, income ASC';
        //await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, objAnnualAccount.nineNine, objAnnualAccount.nineNine, 0, fromDate, toDate);

        // Show remote Heating
        // Get row number for payment Remote Heating Account Id
        const rowNumberCondominium = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
        if (rowNumberCondominium !== -1) {

          // Show annual accounts
          // Show bank deposit for next year
          const year = Number(document.querySelector('.filterBudgetYear').value);
          await objBudget.loadBudgetsTable(objUserPassword.condominiumId, year, objAnnualAccount.nineNine);

          const orderBy = 'condoId ASC, date DESC, income ASC';
          await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, objAnnualAccount.nineNine, objAnnualAccount.nineNine, 0, fromDate, toDate);
          menuNumber = showAnnualAccounts(menuNumber);

          const paymentRemoteHeatingAccountId = Number(objCondominiums.arrayCondominiums[rowNumberCondominium].paymentRemoteHeatingAccountId);
          await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, objAnnualAccount.nineNine, paymentRemoteHeatingAccountId, 0, fromDate, toDate);
          menuNumber = showRemoteHeating(menuNumber);

          // Show income for next year
          menuNumber = showIncomeNextYear(menuNumber);

          // Show bank deposit for next year
          const nextBudgetYear = Number(document.querySelector('.filterBudgetYear').value) + 1;
          await objBudget.loadBudgetsTable(objUserPassword.condominiumId, nextBudgetYear, objAnnualAccount.nineNine);
          menuNumber = showBankDeposit(menuNumber);
        }
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
function showFilter(budgetYear, fromDate, toDate) {

  // Start table
  html = objAnnualAccount.startTable('width:1100px;');

  // Header filter
  html += objAnnualAccount.showTableHeader("width:1100px;", '', '', 'Fra dato', 'Til dato', 'Busjettår', 'Pris per m2');

  // start table body
  html += objAnnualAccount.startTableBody();

  // insert table columns in start of a row
  html += objAnnualAccount.insertTableColumns('', 0, '', '');

  // show from date
  html += objAnnualAccount.inputTableColumn('filterFromDate', fromDate, 10);

  // show to date
  html += objAnnualAccount.inputTableColumn('filterToDate', toDate, 10);

  // Budget year
  html += objAnnualAccount.selectInterval('filterBudgetYear', 'width:100px;', 2020, 2030, budgetYear, 'Budsjettår');

  // price per square meter per month
  const commonCostSquareMeter = getpriceSquaremeter(budgetYear);
  html += objAnnualAccount.inputTableColumn('filterCommonCostSquareMeter', commonCostSquareMeter, 10);

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
  const budgetYear = document.querySelector('.filterBudgetYear').value;
  html += objAnnualAccount.showTableHeader("width:200px;", '', '', 'Konto', 'Beløp', `Budsjett ${budgetYear}`, 'Avvik');

  let totalAccountAmount = 0;
  let totalBudgetAmount = 0;

  objAccounts.arrayAccounts.forEach((account) => {

    // Budget Amount for fiscal
    const budgetYear = Number(document.querySelector('.filterBudgetYear').value);
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
      html += objAnnualAccount.inputTableColumn('name', account.name, 45, true);

      // accountAmount
      accountAmount = formatOreToKroner(accountAmount);
      className = `accountAmount${account.accountId}`;
      html += objAnnualAccount.inputTableColumn('accountAmount', accountAmount, 10, true);

      // budgetAmount
      budgetAmount = formatOreToKroner(budgetAmount);
      className = `budgetAmount${account.accountId}`;
      html += objAnnualAccount.inputTableColumn('budgetAmount', budgetAmount, 10, true);

      // Deviation
      accountAmount = Number(formatKronerToOre(accountAmount));
      budgetAmount = Number(formatKronerToOre(budgetAmount));
      let deviation = accountAmount - budgetAmount;
      deviation = formatOreToKroner(deviation);
      className = `deviation${account.accountId}`;
      html += objAnnualAccount.inputTableColumn('deviation', deviation, 10, true);

      html += "</tr>";

      // Accomulate
      totalAccountAmount += Number(accountAmount);
      totalBudgetAmount += Number(budgetAmount);
    }
  });

  // Sum row

  // Total amount annual accounts
  totalAccountAmount = formatOreToKroner(totalAccountAmount);

  // Budget fiscal year
  totalBudgetAmount = formatOreToKroner(String(totalBudgetAmount));

  // Total deviation
  totalAccountAmount = formatKronerToOre(totalAccountAmount);
  totalBudgetAmount = formatKronerToOre(totalBudgetAmount);
  let totalDeviation = Number(totalAccountAmount) - Number(totalBudgetAmount);
  totalDeviation = formatOreToKroner(String(totalDeviation));

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
  const budgetYear = Number(document.querySelector('.filterBudgetYear').value) + 1;
  html += objAnnualAccount.showTableHeader("width:200px;", '', '', '', '', '', `Budsjettert leieinntekter ${budgetYear}`, '', '');
  html += objAnnualAccount.showTableHeader("width:200px;", '', '', '', 'Leilighet', 'Kvadratmeter', 'Faste kostnader', 'Felleskostnad/måned', 'Felleskostnad/år');

  let totalCommonCostsCondoMonth = 0;
  let totalCommonCostsCondoYear = 0;
  let totalSquareMeters = 0;
  let totalFixedCostsCondoYear = 0;

  // Get fixed costs per month
  const year = Number(document.querySelector(".filterBudgetYear").value);
  let fixedCostCondoMonth = 0;
  const rowNumberCommonCost = objCommonCosts.arrayCommonCosts.findIndex(commonCost => commonCost.year === year);
  if (rowNumberCommonCost !== -1) {

    // Fixed cost per month per condo
    fixedCostCondoMonth = Number(objCommonCosts.arrayCommonCosts[rowNumberCommonCost].fixedCostCondo);

    // Get fixed costs per year
    // 12 month and 7 condos
    //let fixedCost = String(Math.round(numFixedCost / 12 / 7) * (-1));
  }
  html += "</tr>"

  objCondo.arrayCondo.forEach((condo) => {

    // insert table columns in start of a row
    rowNumber++;
    html += objAnnualAccount.insertTableColumns('', rowNumber, '', '');

    // condo name
    className = `name${condo.condoId}`;
    html += objAnnualAccount.inputTableColumn(className, condo.name, 45, true);

    // Square meters
    let squareMeters = formatOreToKroner(condo.squareMeters);
    className = `squareMeters${condo.condoId}`;
    html += objAnnualAccount.inputTableColumn(className, squareMeters, 10, true);

    // fixed cost per month per condo
    fixedCostCondoMonth = formatOreToKroner(fixedCostCondoMonth);
    className = `fixedCostCondoMonth${condo.accountId}`;
    html += objAnnualAccount.inputTableColumn(className, fixedCostCondoMonth, 10, true);

    // Common cost per month per condo
    let commonCostSquareMeter = document.querySelector('.filterCommonCostSquareMeter').value;
    commonCostSquareMeter = formatKronerToOre(commonCostSquareMeter);
    squareMeters = formatKronerToOre(squareMeters);
    let commonCostsMonth = (squareMeters * commonCostSquareMeter) / 100;
    commonCostsMonth = formatOreToKroner(commonCostsMonth);
    className = `commonCostsMonth${condo.accountId}`;
    html += objAnnualAccount.inputTableColumn(className, commonCostsMonth, 10, true);

    // Common cost per year per condo
    commonCostsMonth = formatKronerToOre(commonCostsMonth);
    fixedCostCondoMonth = formatKronerToOre(fixedCostCondoMonth);
    let commonCostsCondoYear = (commonCostsMonth + fixedCostCondoMonth) * 12;
    commonCostsCondoYear = formatOreToKroner(commonCostsCondoYear);
    className = `commonCostsCondoYear${condo.accountId}`;
    html += objAnnualAccount.inputTableColumn(className, commonCostsCondoYear, 10, true);

    // Accomulate
    totalSquareMeters += Number(squareMeters);
    totalFixedCostsCondoYear += Number(fixedCostCondoMonth);
    totalCommonCostsCondoMonth += Number(commonCostsMonth);
    commonCostsCondoYear = formatKronerToOre(commonCostsCondoYear)
    totalCommonCostsCondoYear += commonCostsCondoYear;
  });

  totalSquareMeters = formatOreToKroner(totalSquareMeters, 10);
  totalFixedCostsCondoYear = formatOreToKroner(totalFixedCostsCondoYear, 10);
  totalCommonCostsCondoMonth = formatOreToKroner(totalCommonCostsCondoMonth, 10);
  totalCommonCostsCondoYear = formatOreToKroner(totalCommonCostsCondoYear, 10);

  rowNumber++;
  html += objAnnualAccount.insertTableColumns('', rowNumber, '', '', '', totalSquareMeters, totalFixedCostsCondoYear, totalCommonCostsCondoMonth, totalCommonCostsCondoYear);

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
  html += objAnnualAccount.showTableHeader("width:200px;", '', '', '', 'Fjernvarme', '', '');
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
      html += objAnnualAccount.inputTableColumn(className, date, 10, true);

      let payment = Number(bankAccountTransaction.payment);
      let income = Number(bankAccountTransaction.income);
      payment = (payment + income);

      payment = formatOreToKroner(payment);
      className = `payment${bankAccountTransaction.bankAccountTransactionId}`;
      html += objAnnualAccount.inputTableColumn(className, payment, 10, true);

      // kilowattHour
      let kilowattHour = formatOreToKroner(bankAccountTransaction.kilowattHour);
      className = `kilowattHour${bankAccountTransaction.bankAccountTransactionId}`;
      html += objAnnualAccount.inputTableColumn(className, kilowattHour, 10, true);

      // Price per KWHour
      payment = Number(bankAccountTransaction.payment);
      kilowattHour = Number(bankAccountTransaction.kilowattHour);

      let priceKWHour = '';
      if (kilowattHour !== 0 && payment !== 0) priceKWHour = (-1 * payment) / kilowattHour;

      if (priceKWHour > 0) priceKWHour = priceKWHour.toFixed(2);
      priceKWHour = priceKWHour.replace(".", ",");
      priceKWHour = formatOreToKroner(priceKWHour);
      className = ` priceKWHour${bankAccountTransaction.bankAccountTransactionId}`;
      html += objAnnualAccount.inputTableColumn(className, priceKWHour, 10, true);

      html += "</tr>";

      // Accomulate
      // payment
      payment = Number(bankAccountTransaction.payment);
      income = Number(bankAccountTransaction.income);
      payment = (payment + income);

      sumPayment += Number(payment);

      // KWHour
      sumNumberKWHour += Number(bankAccountTransaction.kilowattHour);
    });

    // Sum row
    // insert table columns in start of a row
    rowNumber++;
    html += objAnnualAccount.insertTableColumns('', rowNumber, '');

    html += "<td class='center bold'>Sum</td>";

    html += objBankAccountTransactions.inputTableColumn('sumPayment', formatOreToKroner(String(sumPayment, 10, true)));
    html += objBankAccountTransactions.inputTableColumn('sumNumberKWHour', formatOreToKroner(String(sumNumberKWHour, 10, true)));

    // Price per KWHour
    let priceKWHour = 0;
    if (sumNumberKWHour !== 0 && sumPayment !== 0) priceKWHour = (-1 * sumPayment) / sumNumberKWHour;
    priceKWHour = priceKWHour.toFixed(2);
    priceKWHour = priceKWHour.replace(".", ",");
    priceKWHour = formatOreToKroner(priceKWHour);
    className = `priceKWHour`;
    html += objBankAccountTransactions.inputTableColumn(className, formatOreToKroner(String(priceKWHour, 10, true)));

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
  let nextBudgetYear = Number(document.querySelector('.filterBudgetYear').value) + 1;
  html += objAnnualAccount.showTableHeader("width:200px;", '', '', '', '', '', `Budsjett ${nextBudgetYear}`, '');
  html += objAnnualAccount.showTableHeader("width:200px;", '', '', '', '', 'Tekst', 'Dato', 'Budsjett');

  let accAmount = 0;

  // insert table columns in start of a row
  rowNumber++;
  html += objBankAccountTransactions.insertTableColumns('', rowNumber, '', '', '');

  // Text
  className = `text`;
  html += objAnnualAccount.inputTableColumn(className, 'Bankinnskudd', 10, true);

  // closingBalanceDate
  let closingBalanceDate = "";
  let rowNumberBankAccount = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.condominiumId === objUserPassword.condominiumId);
  if (rowNumberBankAccount !== -1) {

    closingBalanceDate = (objBankAccounts.arrayBankAccounts[rowNumberBankAccount].closingBalanceDate);
    closingBalanceDate = formatToNorDate(closingBalanceDate);
  }
  className = `closingBalanceDate`;
  html += objAnnualAccount.inputTableColumn(className, closingBalanceDate, 10, true);

  // Bank deposit
  let bankDepositAmount = "";
  bankDepositAmount = (objBankAccounts.arrayBankAccounts[rowNumberBankAccount].closingBalance);
  bankDepositAmount = formatOreToKroner(bankDepositAmount);

  className = `bankDepositAmount`
  html += objAnnualAccount.inputTableColumn(className, bankDepositAmount, 10, true);

  html += "</tr>";

  accAmount += Number(formatKronerToOre(bankDepositAmount));

  // budget
  objBudget.arrayBudgets.forEach((budget) => {
    if (Number(budget.amount) !== 0) {

      // insert table columns in start of a row
      rowNumber++;
      html += objAnnualAccount.insertTableColumns('', rowNumber, '', '', '');

      // Account Name
      let name = '';
      const rowNumberAccount = objAccounts.arrayAccounts.findIndex(account => account.accountId === budget.accountId);
      if (rowNumberAccount !== -1) {

        name = objAccounts.arrayAccounts[rowNumberAccount].name;
      }
      className = `name${budget.budgetId}`
      html += objAnnualAccount.inputTableColumn(className, name, 10, true);

      //empty column
      className = `emptyColumn${budget.budgetId}`
      html += objAnnualAccount.inputTableColumn(className, '', 10, true);

      // budget amount
      let amount = formatOreToKroner(budget.amount);
      className = `amount${budget.budgetId}`
      html += objAnnualAccount.inputTableColumn(className, amount, 10, true);

      html += "</tr>";

      // accumulate
      accAmount += Number(formatKronerToOre(amount));
    }
  });

  // Sum

  // insert table columns in start of a row
  rowNumber++;
  html += objAnnualAccount.insertTableColumns('', rowNumber, '', '', '');

  className = `estimatedBankDeposit`;
  html += objAnnualAccount.inputTableColumn(className, 'Estimert bankinnskudd', 10, true);

  // Next year
  closingBalanceDate = Number(convertDateToISOFormat(closingBalanceDate));
  let closingBalanceDateNextYear = closingBalanceDate + 10000;
  closingBalanceDateNextYear = formatToNorDate(closingBalanceDateNextYear);
  className = `closingBalanceDateNextYear`;
  html += objBankAccountTransactions.inputTableColumn(className, closingBalanceDateNextYear, 10, true);

  // Bank deposit next year
  const bankDepositNextYear = formatOreToKroner(String(accAmount));
  className = `bankDepositNextYear`;
  html += objBankAccountTransactions.inputTableColumn(className, bankDepositNextYear, 10, true);

  // insert table columns in start of a 
  rowNumber++;
  html += objAnnualAccount.insertTableColumns('', rowNumber, '', '', '', '', '', '');

  // Show the rest of the menu
  rowNumber++;
  html += objBankAccountTransactions.showRestMenu(rowNumber);

  // The end of the table
  html += objAnnualAccount.endTable();
  document.querySelector('.bankDeposit').innerHTML = html;

  return rowNumber;
}

// get price per squaremeter
function getpriceSquaremeter(budgetYear) {

  budgetYear = Number(budgetYear);
  let commonCostSquareMeter = 0;
  objCommonCosts.arrayCommonCosts.forEach((commonCost) => {

    if (commonCost.year === budgetYear) commonCostSquareMeter = Number(commonCost.commonCostSquareMeter);
  });

  commonCostSquareMeter = formatOreToKroner(commonCostSquareMeter);
  return commonCostSquareMeter;
}