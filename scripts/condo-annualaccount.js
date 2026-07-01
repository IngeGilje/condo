// Show annual account for condominium

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondominium = new Condominium('condominium');
const objBudgets = new Budgets('budgets');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objTransaction = new Transaction('bankTransaction');
const objCondo = new Condo('condo');
const objCommonCost = new CommonCost('commoncost');
const objAnnualAccount = new AnnualAccount('annualaccount');

const enableChanges = (objAnnualAccount.securityLevel > 5);

// column widths
const columnWidths = [175, 175, 175, 175, 175];

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

      // Show main menu
      let html = objAnnualAccount.showHorizontalMenu(objAnnualAccount.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show transaction menu
      html = objAnnualAccount.showHorizontalMenu(objAnnualAccount.arrayMenuTransaction);
      document.querySelector('.menuTransaction').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objAnnualAccount.condominiumId, resident, objAnnualAccount.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objCondo.loadCondoTable(objAnnualAccount.condominiumId, objAnnualAccount.nineNine);
      await objCommonCost.loadCommonCostsTable(objAnnualAccount.condominiumId);
      await objBudgets.loadBudgetsTable(objAnnualAccount.condominiumId, objAnnualAccount.nineNine, objAnnualAccount.nineNine);
      await objBankAccount.loadBankAccountsTable(objAnnualAccount.condominiumId, objAnnualAccount.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objAnnualAccount.condominiumId, fixedCost);

      // Show header
      //showHeader();

      // Show filter
      const budgetYear = today.getFullYear();
      let fromDate = `${budgetYear}-01-01`;
      let toDate = getCurrentISODate();
      showFilter(budgetYear, fromDate, toDate);

      const deleted = "N";
      fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(objAnnualAccount.formatDateToNumber(fromDate));

      toDate = document.querySelector('.filterToDate').value;
      toDate = Number(objAnnualAccount.formatDateToNumber(toDate));

      // Show remote Heating
      // Get row number for payment Remote Heating Account Id
      const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objAnnualAccount.condominiumId);
      if (rowNumberCondominium !== -1) {

        // Show annual accounts
        const orderBy = 'condoId ASC, date DESC, income ASC';
        await objTransaction.loadTransactionsTable(orderBy, objAnnualAccount.condominiumId, deleted, objAnnualAccount.nineNine, objAnnualAccount.nineNine, objAnnualAccount.nineNine, 0, fromDate, toDate);
        showAnnualAccounts();

        // Show income for next year
        showIncomeNextYear();

        // Show bank deposit for next year
        const nextBudgetYear = Number(document.querySelector('.filterBudgetYear').value) + 1;
        await objBudgets.loadBudgetsTable(objAnnualAccount.condominiumId, nextBudgetYear, objAnnualAccount.nineNine);
        showBankDeposit();

        // Events
        events();
      }
    }
  } else {

    showMessageNew('Server er ikke startet.');
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

      const deleted = "N";

      fromDate = document.querySelector('.filterFromDate').value;
      //fromDate = Number(objAnnualAccount.formatDateToNumber(fromDate));
      fromDate = formatISODateToNumber(fromDate);

      toDate = document.querySelector('.filterToDate').value;
      //toDate = Number(objAnnualAccount.formatDateToNumber(toDate));
      toDate = formatISODateToNumber(toDate);

      // Show remote Heating
      // Get row number for payment Remote Heating Account Id
      const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objAnnualAccount.condominiumId);
      if (rowNumberCondominium !== -1) {

        // Show annual accounts
        // Show bank deposit for next year
        const year = Number(document.querySelector('.filterBudgetYear').value);
        await objBudgets.loadBudgetsTable(objAnnualAccount.condominiumId, year, objAnnualAccount.nineNine);

        const orderBy = 'condoId ASC, date DESC, income ASC';
        await objTransaction.loadTransactionsTable(orderBy, objAnnualAccount.condominiumId, deleted, objAnnualAccount.nineNine, objAnnualAccount.nineNine, objAnnualAccount.nineNine, 0, fromDate, toDate);
        showAnnualAccounts(3);

        // Show income for next year
        showIncomeNextYear();

        // Show bank deposit for next year
        const nextBudgetYear = Number(document.querySelector('.filterBudgetYear').value) + 1;
        await objBudgets.loadBudgetsTable(objAnnualAccount.condominiumId, nextBudgetYear, objAnnualAccount.nineNine);
        showBankDeposit();
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

// Accumulate all Transactions for specified account id
function getTotalMovementsBankAccount(accountId) {

  let accountAmount = 0;

  let fromDate = document.querySelector('.filterFromDate').value;
  fromDate = Number(objAnnualAccount.formatDateToNumber(fromDate));

  let toDate = document.querySelector('.filterToDate').value;
  toDate = Number(objAnnualAccount.formatDateToNumber(toDate));

  objTransaction.arrayTransactions.forEach((bankTransaction) => {

    if (Number(bankTransaction.date) >= fromDate
      && (Number(bankTransaction.date) <= toDate
        && bankTransaction.accountId === accountId)) {

      accountAmount += Number(bankTransaction.income);
      accountAmount += Number(bankTransaction.payment);
    }
  })

  return accountAmount;
}

// get budget amount
function getBudgetAmount(accountId, year) {

  let amount = 0;

  // Budget Amount
  objBudgets.arrayBudgets.forEach(budget => {
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
  let html = objAnnualAccount.initializeTable(columnWidths);

  // start table body
  html += objAnnualAccount.startTableBody();

  // show main header
  html += objAnnualAccount.showTableHeaderLogOut('', '', 'Årsregnskap', '');
  html += "</tr>";

  // end table body
  html += objAnnualAccount.endTableBody();

  // The end of the table
  html += objAnnualAccount.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}
*/

// Show filter
function showFilter(budgetYear, fromDate, toDate) {

    // Start frame
  let html = startFrame();

  // show filter
  html += startRow();

  // Show year
  html += showSelectedNumbersNew('År', 'filterBudgetYear', '', 2020, 2030, budgetYear, true);

  // From date
  html += editDate('Fra Dato', 'filterFromDate', fromDate, true)

   // To date
  // Current date
  html += editDate('Til Dato', 'filterToDate', toDate, true)

 // price per square meter per month
  const commonCostSquareMeter = getpriceSquaremeter(budgetYear);
  html += objAnnualAccount.editAmount('Pris per m2', 'filterCommonCostSquareMeter', commonCostSquareMeter, true);

   html += "</div>";

   // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;
}

// Show annual accounts
function showAnnualAccounts() {

  // start table
  let html = objAnnualAccount.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  const budgetYear = document.querySelector('.filterBudgetYear').value;

  html += objAnnualAccount.showTableHeaderMenu('#e0f0e0', 'center', '', '', 'Årsresultat', '', '');


  html += objAnnualAccount.showTableHeaderMenu('', 'center', '', 'Konto', 'Beløp', `Budsjett ${budgetYear}`, 'Avvik');

  let totalAccountAmount = 0;
  let totalBudgetAmount = 0;

  objAccount.arrayAccounts.forEach((account) => {

    // Budget Amount for fiscal
    const budgetYear = Number(document.querySelector('.filterBudgetYear').value);
    let budgetAmount = getBudgetAmount(account.accountId, budgetYear);
    const numBudgetAmount = Number(formatKronerToOre(budgetAmount));

    // Transactions for selected account
    let accountAmount = getTotalMovementsBankAccount(account.accountId);
    accountAmount = formatOreToKroner(accountAmount);
    const numAccountAmount = Number(formatKronerToOre(accountAmount));

    if (numBudgetAmount !== 0 || numAccountAmount !== 0) {

      html += objAnnualAccount.insertTableRow('', '');

      // account name
      html += objAnnualAccount.editTableCell('name', account.name, 45, false);

      // accountAmount
      accountAmount = formatOreToKroner(accountAmount);
      className = `accountAmount${account.accountId}`;
      html += objAnnualAccount.editTableCell('accountAmount', accountAmount, 11, false);

      // budgetAmount
      budgetAmount = formatOreToKroner(budgetAmount);
      className = `budgetAmount${account.accountId}`;
      html += objAnnualAccount.editTableCell('budgetAmount', budgetAmount, 11, false);

      // Deviation
      accountAmount = Number(formatKronerToOre(accountAmount));
      budgetAmount = Number(formatKronerToOre(budgetAmount));
      let deviation = accountAmount - budgetAmount;
      deviation = formatOreToKroner(deviation);
      className = `deviation${account.accountId}`;
      html += objAnnualAccount.editTableCell('deviation', deviation, 11, false);
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


  html += objTransaction.insertTableRow('font-weight: 600;', '', 'Sum', totalAccountAmount, totalBudgetAmount, totalDeviation);

  // empty table row
  html += objTransaction.insertTableRow('', '', '', '', '', '');

  // The end of the table
  html += objAnnualAccount.endTable();
  document.querySelector('.annualaccount').innerHTML = html;


}

// Show income for next year
function showIncomeNextYear() {

  // start table
  let html = objAnnualAccount.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  const budgetYear = Number(document.querySelector('.filterBudgetYear').value) + 1;

  html += objAnnualAccount.showTableHeaderMenu('#e0f0e0', 'center', '', `Bud. Leieinntekter ${budgetYear}`, '', '', '');
  html += objAnnualAccount.showTableHeaderMenu('', 'center', 'Leilighet', 'Areal', 'Fast beløp', 'Per måned', 'Årlig');

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
  //html += "</tr>"

  objCondo.arrayCondo.forEach((condo) => {

    // insert a table row (<tr></td>)
    html += objAnnualAccount.insertTableRow('');

    // condo name
    className = `name${condo.condoId}`;
    html += objAnnualAccount.editTableCell(className, condo.name, 45, false);

    // Square meters
    let squareMeters = formatOreToKroner(condo.squareMeters);
    className = `squareMeters${condo.condoId}`;
    html += objAnnualAccount.editTableCell(className, squareMeters, 11, false);

    // fixed cost per month per condo
    fixedCostCondoMonth = formatOreToKroner(fixedCostCondoMonth);
    className = `fixedCostCondoMonth${condo.condoId}`;
    html += objAnnualAccount.editTableCell(className, fixedCostCondoMonth, 10, false);

    // Common cost per month per condo
    let commonCostSquareMeter = document.querySelector('.filterCommonCostSquareMeter').value;
    commonCostSquareMeter = formatKronerToOre(commonCostSquareMeter);
    squareMeters = formatKronerToOre(squareMeters);
    let commonCostsMonth = (squareMeters * commonCostSquareMeter) / 100;
    commonCostsMonth = formatOreToKroner(commonCostsMonth);
    className = `commonCostsMonth${condo.condoId}`;
    html += objAnnualAccount.editTableCell(className, commonCostsMonth, 11, false);

    // Common cost per year per condo
    commonCostsMonth = formatKronerToOre(commonCostsMonth);
    fixedCostCondoMonth = formatKronerToOre(fixedCostCondoMonth);
    let commonCostsCondoYear = (commonCostsMonth + fixedCostCondoMonth) * 12;
    commonCostsCondoYear = formatOreToKroner(commonCostsCondoYear);
    className = `commonCostsCondoYear${condo.condoId}`;
    html += objAnnualAccount.editTableCell(className, commonCostsCondoYear, 10, false);

    html += "</tr>";

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

  html += objAnnualAccount.insertTableRow('', 'Sum', totalSquareMeters, totalFixedCostsCondoYear, totalCommonCostsCondoMonth, totalCommonCostsCondoYear);
  html += "</tr>";

  // empty table row

  html += objAnnualAccount.insertTableRow('', '', '', '', '', '');
  html += "</tr>";

  // The end of the table
  html += objAnnualAccount.endTable();
  document.querySelector('.incomeNextYear').innerHTML = html;
}

// Show showBank Deposit for next year
function showBankDeposit() {

  // start table
  let html = objAnnualAccount.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  let nextBudgetYear = Number(document.querySelector('.filterBudgetYear').value) + 1;


  html += objAnnualAccount.showTableHeaderMenu('#e0f0e0', 'center', '', '', `Budsjett ${nextBudgetYear}`, '', '');


  html += objAnnualAccount.showTableHeaderMenu('', 'center', '', '', 'Konto', 'Dato', 'Budsjett');
  let accAmount = 0;

  // insert a table row (<tr></td>)
  html += objTransaction.insertTableRow('', '', '');

  // Text
  className = `text`;
  html += objAnnualAccount.editTableCell(className, 'Bankinnskudd', 10, false);

  // closingBalanceDate
  let closingBalanceDate = "";
  let rowNumberBankAccount = objBankAccount.arrayBankAccounts.findIndex(bankAccount => bankAccount.condominiumId === objAnnualAccount.condominiumId);
  if (rowNumberBankAccount !== -1) {

    closingBalanceDate = (objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalanceDate);
    closingBalanceDate = formatNumberToNorDate(closingBalanceDate);
  }
  className = `closingBalanceDate`;
  html += objAnnualAccount.editTableCell(className, closingBalanceDate, 10, false);

  // Bank deposit
  //let bankDepositAmount = "";
  const bankDepositAmount = (rowNumberBankAccount === -1)
    ? 0
    : formatOreToKroner(objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalance);

  className = `bankDepositAmount`;
  html += objAnnualAccount.editTableCell(className, bankDepositAmount, 11, false);

  html += "</tr>";

  accAmount += Number(formatKronerToOre(bankDepositAmount));

  // budget
  objBudgets.arrayBudgets.forEach((budget) => {
    if (Number(budget.amount) !== 0) {

      // insert a table row (<tr></td>)
      html += objAnnualAccount.insertTableRow('', '', '');

      // Account Name
      let name = '';
      const rowNumberAccount = objAccount.arrayAccounts.findIndex(account => account.accountId === budget.accountId);
      if (rowNumberAccount !== -1) {

        name = objAccount.arrayAccounts[rowNumberAccount].name;
      }
      className = `name${budget.budgetId}`
      html += objAnnualAccount.editTableCell(className, name, 10, false);

      //empty column
      className = `emptyColumn${budget.budgetId}`
      html += objAnnualAccount.editTableCell(className, 10, false);

      // budget amount
      let amount = formatOreToKroner(budget.amount);
      className = `amount${budget.budgetId}`
      html += objAnnualAccount.editTableCell(className, amount, 11, false);

      html += "</tr>";

      // accumulate
      accAmount += Number(formatKronerToOre(amount));
    }
  });

  // Sum

  // insert a table row (<tr></td>)

  html += objAnnualAccount.insertTableRow('', '', '');

  className = `estimatedBankDeposit`;
  html += objAnnualAccount.editTableCell(className, 'Estimert bankinnskudd', 10, false);

  // Next year
  closingBalanceDate = Number(objAnnualAccount.formatDateToNumber(closingBalanceDate));
  let closingBalanceDateNextYear = closingBalanceDate + 10000;
  closingBalanceDateNextYear = formatNumberToNorDate(closingBalanceDateNextYear);
  className = `closingBalanceDateNextYear`;
  html += objTransaction.editTableCell(className, closingBalanceDateNextYear, 10, false);

  // Bank deposit next year
  const bankDepositNextYear = formatOreToKroner(String(accAmount));
  className = `bankDepositNextYear`;
  html += objTransaction.editTableCell(className, bankDepositNextYear, 10, false);

  // insert table columns in start of a 

  html += objAnnualAccount.insertTableRow('', '', '', '', '', '');

  // The end of the table
  html += objAnnualAccount.endTable();
  document.querySelector('.bankDeposit').innerHTML = html;


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