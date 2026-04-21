// Search for amount movements

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondominium = new Condominium('condominium');
const objBudget = new Budget('budget');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objBankAccountTransaction = new BankAccountTransaction('bankAccountTransaction');
const objCondo = new Condo('condo');
const objCommonCost = new CommonCost('commoncost');
const objAnnualAccount = new AnnualAccount('annualaccount');

const enableChanges = (objAnnualAccount.securityLevel > 5);

const tableWidth = 'width:1100px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objAnnualAccount.condominiumId === 0) || (objAnnualAccount.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'Y';
      await objUser.loadUsersTable(objAnnualAccount.condominiumId, resident, objAnnualAccount.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objCondo.loadCondoTable(objAnnualAccount.condominiumId, objAnnualAccount.nineNine);
      await objCommonCost.loadCommonCostsTable(objAnnualAccount.condominiumId);
      await objBudget.loadBudgetsTable(objAnnualAccount.condominiumId, objAnnualAccount.nineNine, objAnnualAccount.nineNine);
      await objBankAccount.loadBankAccountsTable(objAnnualAccount.condominiumId, objAnnualAccount.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objAnnualAccount.condominiumId, fixedCost);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      const budgetYear = today.getFullYear();
      let fromDate = '01.01.' + budgetYear;
      let toDate = getCurrentDate();
      menuNumber = showFilter(menuNumber, budgetYear, fromDate, toDate);

      const deleted = "N";

      fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(convertDateToISOFormat(fromDate));

      toDate = document.querySelector('.filterToDate').value;
      toDate = Number(convertDateToISOFormat(toDate));

      // Show remote Heating
      // Get row number for payment Remote Heating Account Id
      const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objAnnualAccount.condominiumId);
      if (rowNumberCondominium !== -1) {

        // Show annual accounts
        const orderBy = 'condoId ASC, date DESC, income ASC';
        await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, objAnnualAccount.condominiumId, deleted, objAnnualAccount.nineNine, objAnnualAccount.nineNine, 0, fromDate, toDate);
        menuNumber = showAnnualAccounts(menuNumber);

        // Show income for next year
        menuNumber = showIncomeNextYear(menuNumber);

        // Show bank deposit for next year
        const nextBudgetYear = Number(document.querySelector('.filterBudgetYear').value) + 1;
        await objBudget.loadBudgetsTable(objAnnualAccount.condominiumId, nextBudgetYear, objAnnualAccount.nineNine);
        menuNumber = showBankDeposit(menuNumber);

        // Events
        events();
      }
    }
  } else {

    objBudget.showMessage(objBudget, '', 'Server er ikke startet.');
  }
}

// Make events
async function events() {

  // Show after change of filter
  document.addEventListener('change', async (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('filterFromDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterToDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterBudgetYear'))
      || [...event.target.classList].some(cls => cls.startsWith('filterPriceSquareMeter'))) {

      let menuNumber = 0;

      const deleted = "N";

      fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(convertDateToISOFormat(fromDate));

      toDate = document.querySelector('.filterToDate').value;
      toDate = Number(convertDateToISOFormat(toDate));

      // Show remote Heating
      // Get row number for payment Remote Heating Account Id
      const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objAnnualAccount.condominiumId);
      if (rowNumberCondominium !== -1) {

        // Show annual accounts
        // Show bank deposit for next year
        const year = Number(document.querySelector('.filterBudgetYear').value);
        await objBudget.loadBudgetsTable(objAnnualAccount.condominiumId, year, objAnnualAccount.nineNine);

        const orderBy = 'condoId ASC, date DESC, income ASC';
        await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, objAnnualAccount.condominiumId, deleted, objAnnualAccount.nineNine, objAnnualAccount.nineNine, 0, fromDate, toDate);
        menuNumber = showAnnualAccounts(3);

        // Show income for next year
        menuNumber = showIncomeNextYear(menuNumber);

        // Show bank deposit for next year
        const nextBudgetYear = Number(document.querySelector('.filterBudgetYear').value) + 1;
        await objBudget.loadBudgetsTable(objAnnualAccount.condominiumId, nextBudgetYear, objAnnualAccount.nineNine);
        menuNumber = showBankDeposit(menuNumber);
      }
    };
  });
  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objAnnualAccount.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
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

  objBankAccountTransaction.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

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

/*
// Show header
function showHeader() {

  // Start table
  let html = objAnnualAccount.startTable(tableWidth);

  // show main header
  html += objAnnualAccount.showTableHeader("width:175px;", 'Årsregnskap');

  // The end of the table
  html += objAnnualAccount.endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  let html = objAnnualAccount.startTable(tableWidth);

  // start table body
  html += objAnnualAccount.startTableBody();

  // show main header
  html += objAnnualAccount.showTableHeaderLogOut('width:175px;', '', '', '', 'Årsregnskap', '',);
  html += "</tr>";

  // end table body
  html += objAnnualAccount.endTableBody();

  // The end of the table
  html += objAnnualAccount.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(menuNumber, budgetYear, fromDate, toDate) {

  // Start table
  let html = objAnnualAccount.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objAnnualAccount.showTableHeaderMenu('width:175px;', menuNumber, '', 'Fra dato', 'Til dato', 'Busjettår', 'Pris per m2');

  // start table body
  html += objAnnualAccount.startTableBody();

  // insert table columns in start of a row
  menuNumber++;
  html += objAnnualAccount.insertTableColumns('', menuNumber, '');

  // show from date
  html += objAnnualAccount.inputTableColumn('filterFromDate', 'width:175px;', fromDate, 10, true);

  // show to date
  html += objAnnualAccount.inputTableColumn('filterToDate', 'width:175px;', toDate, 10, true);

  // Budget year
  html += objAnnualAccount.selectInterval('filterBudgetYear', 'width:175px;', 2020, 2030, budgetYear, 'Budsjettår', true);

  // price per square meter per month
  const commonCostSquareMeter = getpriceSquaremeter(budgetYear);
  html += objAnnualAccount.inputTableColumn('filterCommonCostSquareMeter', 'width:175px;', commonCostSquareMeter, 11, true);

  html += "</tr>";

  menuNumber++;
  html += objAnnualAccount.insertTableColumns('', menuNumber, '', '', '', '', '');

  // end table body
  html += objAnnualAccount.endTableBody();

  // The end of the table
  html += objAnnualAccount.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show annual accounts
function showAnnualAccounts(menuNumber) {

  // start table
  let html = objAnnualAccount.startTable(tableWidth);

  // table header
  const budgetYear = document.querySelector('.filterBudgetYear').value;
  menuNumber++;
  html += objAnnualAccount.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, '', '', 'Årsresultat', '', '');

  menuNumber++;
  html += objAnnualAccount.showTableHeaderMenu('width:175px;', menuNumber, '', 'Konto', 'Beløp', `Budsjett ${budgetYear}`, 'Avvik');

  let totalAccountAmount = 0;
  let totalBudgetAmount = 0;

  objAccount.arrayAccounts.forEach((account) => {

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
      menuNumber++;
      html += objAnnualAccount.insertTableColumns('', menuNumber, '');

      // account name
      html += objAnnualAccount.inputTableColumn('name', 'width:175px;', account.name, 45, false);

      // accountAmount
      accountAmount = formatOreToKroner(accountAmount);
      className = `accountAmount${account.accountId}`;
      html += objAnnualAccount.inputTableColumn('accountAmount', 'width:175px;', accountAmount, 11, false);

      // budgetAmount
      budgetAmount = formatOreToKroner(budgetAmount);
      className = `budgetAmount${account.accountId}`;
      html += objAnnualAccount.inputTableColumn('budgetAmount', 'width:175px;', budgetAmount, 11, false);

      // Deviation
      accountAmount = Number(formatKronerToOre(accountAmount));
      budgetAmount = Number(formatKronerToOre(budgetAmount));
      let deviation = accountAmount - budgetAmount;
      deviation = formatOreToKroner(deviation);
      className = `deviation${account.accountId}`;
      html += objAnnualAccount.inputTableColumn('deviation', 'width:175px;', deviation, 11, false);

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

  menuNumber++;
  html += objBankAccountTransaction.insertTableColumns('font-weight: 600;', menuNumber, '', 'Sum', totalAccountAmount, totalBudgetAmount, totalDeviation);

  html += "</tr>";

  // empty table row
  menuNumber++;
  html += objBankAccountTransaction.insertTableColumns('', menuNumber, '', '', '', '', '');

  // The end of the table
  html += objAnnualAccount.endTable();
  document.querySelector('.annualaccount').innerHTML = html;

  return menuNumber;
}

// Show income for next year
function showIncomeNextYear(menuNumber) {

  // start table
  let html = objAnnualAccount.startTable(tableWidth);

  // table header
  const budgetYear = Number(document.querySelector('.filterBudgetYear').value) + 1;
  menuNumber++;
  html += objAnnualAccount.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, '', '', `Budsjetterte leieinntekter ${budgetYear}`, '', '');

  menuNumber++;
  html += objAnnualAccount.showTableHeaderMenu('width:175px;', menuNumber, 'Leilighet', 'Kvadratmeter', 'Faste kostnader', 'Felleskostnad/måned', 'Felleskostnad/år');

  let totalCommonCostsCondoMonth = 0;
  let totalCommonCostsCondoYear = 0;
  let totalSquareMeters = 0;
  let totalFixedCostsCondoYear = 0;

  // Get fixed costs per month
  const year = Number(document.querySelector(".filterBudgetYear").value);
  let fixedCostCondoMonth = 0;
  const rowNumberCommonCost = objCommonCost.arrayCommonCosts.findIndex(commonCost => commonCost.year === year);
  if (rowNumberCommonCost !== -1) {

    // Fixed cost per month per condo
    fixedCostCondoMonth = Number(objCommonCost.arrayCommonCosts[rowNumberCommonCost].fixedCostCondo);

    // Get fixed costs per year
    // 12 month and 7 condos
    //let fixedCost = String(Math.round(numFixedCost / 12 / 7) * (-1));
  }
  html += "</tr>"

  objCondo.arrayCondo.forEach((condo) => {

    // insert table columns in start of a row
    menuNumber++;
    html += objAnnualAccount.insertTableColumns('', menuNumber);

    // condo name
    className = `name${condo.condoId}`;
    html += objAnnualAccount.inputTableColumn(className, 'width:175px;', condo.name, 45, false);

    // Square meters
    let squareMeters = formatOreToKroner(condo.squareMeters);
    className = `squareMeters${condo.condoId}`;
    html += objAnnualAccount.inputTableColumn(className, 'width:175px;', squareMeters, 11, false);

    // fixed cost per month per condo
    fixedCostCondoMonth = formatOreToKroner(fixedCostCondoMonth);
    className = `fixedCostCondoMonth${condo.accountId}`;
    html += objAnnualAccount.inputTableColumn(className, 'width:175px;', fixedCostCondoMonth, 10, false);

    // Common cost per month per condo
    let commonCostSquareMeter = document.querySelector('.filterCommonCostSquareMeter').value;
    commonCostSquareMeter = formatKronerToOre(commonCostSquareMeter);
    squareMeters = formatKronerToOre(squareMeters);
    let commonCostsMonth = (squareMeters * commonCostSquareMeter) / 100;
    commonCostsMonth = formatOreToKroner(commonCostsMonth);
    className = `commonCostsMonth${condo.accountId}`;
    html += objAnnualAccount.inputTableColumn(className, 'width:175px;', commonCostsMonth, 11, false);

    // Common cost per year per condo
    commonCostsMonth = formatKronerToOre(commonCostsMonth);
    fixedCostCondoMonth = formatKronerToOre(fixedCostCondoMonth);
    let commonCostsCondoYear = (commonCostsMonth + fixedCostCondoMonth) * 12;
    commonCostsCondoYear = formatOreToKroner(commonCostsCondoYear);
    className = `commonCostsCondoYear${condo.accountId}`;
    html += objAnnualAccount.inputTableColumn(className, 'width:175px;', commonCostsCondoYear, 10, false);

    // Accomulate
    totalSquareMeters += Number(squareMeters);
    totalFixedCostsCondoYear += Number(fixedCostCondoMonth);
    totalCommonCostsCondoMonth += Number(commonCostsMonth);
    commonCostsCondoYear = formatKronerToOre(commonCostsCondoYear)
    totalCommonCostsCondoYear += commonCostsCondoYear;
  });

  totalSquareMeters = formatOreToKroner(totalSquareMeters);
  totalFixedCostsCondoYear = formatOreToKroner(totalFixedCostsCondoYear);
  totalCommonCostsCondoMonth = formatOreToKroner(totalCommonCostsCondoMonth);
  totalCommonCostsCondoYear = formatOreToKroner(totalCommonCostsCondoYear);

  menuNumber++;
  html += objAnnualAccount.insertTableColumns('', menuNumber, 'Sum', totalSquareMeters, totalFixedCostsCondoYear, totalCommonCostsCondoMonth, totalCommonCostsCondoYear);

  html += "</tr>";

  // empty table row
  menuNumber++;
  html += objAnnualAccount.insertTableColumns('', menuNumber, '', '', '', '', '');
  html += "</tr>";

  // The end of the table
  html += objAnnualAccount.endTable();
  document.querySelector('.incomeNextYear').innerHTML = html;

  return menuNumber;
}

// Show showBank Deposit for next year
function showBankDeposit(menuNumber) {

  // start table
  let html = objAnnualAccount.startTable(tableWidth);

  // table header
  let nextBudgetYear = Number(document.querySelector('.filterBudgetYear').value) + 1;

  menuNumber++;
  html += objAnnualAccount.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, '', '', `Budsjett ${nextBudgetYear}`, '', '');
  
  menuNumber++;
  html += objAnnualAccount.showTableHeaderMenu('width:175px;', menuNumber, '', '', 'Tekst', 'Dato', 'Budsjett');
  let accAmount = 0;

  // insert table columns in start of a row
  menuNumber++;
  html += objBankAccountTransaction.insertTableColumns('', menuNumber, '', '');

  // Text
  className = `text`;
  html += objAnnualAccount.inputTableColumn(className, 'width:175px;', 'Bankinnskudd', 10, false);

  // closingBalanceDate
  let closingBalanceDate = "";
  let rowNumberBankAccount = objBankAccount.arrayBankAccounts.findIndex(bankAccount => bankAccount.condominiumId === objAnnualAccount.condominiumId);
  if (rowNumberBankAccount !== -1) {

    closingBalanceDate = (objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalanceDate);
    closingBalanceDate = formatNumberToNorDate(closingBalanceDate);
  }
  className = `closingBalanceDate`;
  html += objAnnualAccount.inputTableColumn(className, 'width:175px;', closingBalanceDate, 10, false);

  // Bank deposit
  //let bankDepositAmount = "";
  const bankDepositAmount = (rowNumberBankAccount === -1)
    ? 0
    : formatOreToKroner(objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalance);
  //bankDepositAmount = (objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalance);
  //bankDepositAmount = formatOreToKroner(bankDepositAmount);

  className = `bankDepositAmount`;
  html += objAnnualAccount.inputTableColumn(className, 'width:175px;', bankDepositAmount, 11, false);

  html += "</tr>";

  accAmount += Number(formatKronerToOre(bankDepositAmount));

  // budget
  objBudget.arrayBudgets.forEach((budget) => {
    if (Number(budget.amount) !== 0) {

      // insert table columns in start of a row
      menuNumber++;
      html += objAnnualAccount.insertTableColumns('', menuNumber, '', '');

      // Account Name
      let name = '';
      const rowNumberAccount = objAccount.arrayAccounts.findIndex(account => account.accountId === budget.accountId);
      if (rowNumberAccount !== -1) {

        name = objAccount.arrayAccounts[rowNumberAccount].name;
      }
      className = `name${budget.budgetId}`
      html += objAnnualAccount.inputTableColumn(className, 'width:175px;', name, 10, false);

      //empty column
      className = `emptyColumn${budget.budgetId}`
      html += objAnnualAccount.inputTableColumn(className, 'width:175px;', '', 10, false);

      // budget amount
      let amount = formatOreToKroner(budget.amount);
      className = `amount${budget.budgetId}`
      html += objAnnualAccount.inputTableColumn(className, 'width:175px;', amount, 11, false);

      html += "</tr>";

      // accumulate
      accAmount += Number(formatKronerToOre(amount));
    }
  });

  // Sum

  // insert table columns in start of a row
  menuNumber++;
  html += objAnnualAccount.insertTableColumns('', menuNumber, '', '');

  className = `estimatedBankDeposit`;
  html += objAnnualAccount.inputTableColumn(className, 'width:175px;', 'Estimert bankinnskudd', 10, false);

  // Next year
  closingBalanceDate = Number(convertDateToISOFormat(closingBalanceDate));
  let closingBalanceDateNextYear = closingBalanceDate + 10000;
  closingBalanceDateNextYear = formatNumberToNorDate(closingBalanceDateNextYear);
  className = `closingBalanceDateNextYear`;
  html += objBankAccountTransaction.inputTableColumn(className, 'width:175px;', closingBalanceDateNextYear, 10, false);

  // Bank deposit next year
  const bankDepositNextYear = formatOreToKroner(String(accAmount));
  className = `bankDepositNextYear`;
  html += objBankAccountTransaction.inputTableColumn(className, 'width:175px;', bankDepositNextYear, 10, false);

  // insert table columns in start of a 
  menuNumber++;
  html += objAnnualAccount.insertTableColumns('', menuNumber, '', '', '', '', '');

  // Show the rest of the menu
  menuNumber++;
  html += objBankAccountTransaction.showRestMenu(menuNumber);

  // The end of the table
  html += objAnnualAccount.endTable();
  document.querySelector('.bankDeposit').innerHTML = html;

  return menuNumber;
}

// get price per squaremeter
function getpriceSquaremeter(budgetYear) {

  budgetYear = Number(budgetYear);
  let commonCostSquareMeter = 0;
  objCommonCost.arrayCommonCosts.forEach((commonCost) => {

    if (commonCost.year === budgetYear) commonCostSquareMeter = Number(commonCost.commonCostSquareMeter);
  });

  commonCostSquareMeter = formatOreToKroner(commonCostSquareMeter);
  return commonCostSquareMeter;
}