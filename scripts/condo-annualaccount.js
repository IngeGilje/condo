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
    let menuNumber = 0;
    menuNumber = showAnnualAccounts(menuNumber);

    // Show income for next year
    menuNumber = showIncomeNextYear(menuNumber);

    // Show remote Heating
    menuNumber = showRemoteHeating(menuNumber);

    // Show bank deposit for next year
    menuNumber = showBankDeposit(menuNumber);

    // Events
    events();
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
        menuNumber = showRemoteHeating(menuNumber);

        // Show bank deposit for next year
        menuNumber = showBankDeposit(menuNumber);
      };
    };
  });
}

/*
// Show leading text Filter
function showLeadingTextFilter() {

  let html = startHTMLFilters();

  // from date
  html += objAnnualAccount.showInputHTML('input-filter-fromDate', 'Fra dato', 10, 'mm.dd.åååå');

  // To date
  html += objAnnualAccount.showInputHTML('input-filter-toDate', 'Til dato', 10, 'mm.dd.åååå');

  // Budget year
  let budgetYear = today.getFullYear();
  html += objBudget.selectIntervalHTMLNew('select-filter-budgetYear', 2020, 2030, budgetYear, 'Budsjettår');

  // price per square meter
  html += objAnnualAccount.showInputHTML('input-filter-priceSquareMeter', 'Kvadratmeterpris', 8, '');

  html += endHTMLFilters();
  document.querySelector('.div-grid-annualaccount-filter').innerHTML = html;
}
*/

/*
// Show values for filter
function showValuesFilter() {

  // From date
  date = document.querySelector('.input-filter-fromDate').value;
  if (!validateEuroDateFormat(date)) {

    // From date is not ok
    const year = String(today.getFullYear());
    document.querySelector('.input-filter-fromDate').value = "01.01." + year;
  }
  objAnnualAccount.showIcon('input-filter-fromDate');

  // to date
  date = document.querySelector('.input-filter-toDate').value;
  if (!validateEuroDateFormat(date)) {

    // To date is not ok
    const year = String(today.getFullYear());
    document.querySelector('.input-filter-toDate').value = getCurrentDate();
  }
  objAnnualAccount.showIcon('input-filter-toDate');

  // Budget year
  budgetYear = Number(document.querySelector('.select-filter-budgetYear').value);
  if (!validateNumberHTML(budgetYear, 2020, 2030)) {

    budgetYear = today.getFullYear() + 1;
    objBudget.selectNumber('select-filter-budgetYear', 2020, 2030, budgetYear, 'Budsjettår');
    objAnnualAccount.showIcon('select-filter-budgetYear');
  }

  // Price per square meter
  priceSquareMeter = document.querySelector('.input-filter-priceSquareMeter').value;
  if (!objAnnualAccount.validateNorAmount(priceSquareMeter)) {

    // To Price per square meter is not ok
    document.querySelector('.input-filter-priceSquareMeter').value = '30,00'
  }
  objAnnualAccount.showIcon('input-filter-priceSquareMeter');
}
*/

/*
// Show annual accounts
function showAnnualAccounts() {

  let totalBudgetAmount = 0;
  let totalAccountAmount = 0;
  let rowNumber = 0;

  const budgetYear = document.querySelector('.select-filter-budgetYear').value;

  let html = startHTMLTable();
  html += HTMLTableHeader('Konto', 'Beløp', `Budsjett ${budgetYear}`, 'Avvik');
  html += startHTMLTableBody();

  objAccounts.arrayAccounts.forEach((account) => {

    // Budget Amount for fiscal
    const budgetYear = Number(document.querySelector('.select-filter-budgetYear').value);
    let budgetAmount = getBudgetAmount(account.accountId, budgetYear);
    const numBudgetAmount = Number(formatKronerToOre(budgetAmount));

    // Bank account transactions for selected account
    let accountAmount = getTotalMovementsBankAccount(account.accountId);
    accountAmount = formatOreToKroner(accountAmount);
    const numAccountAmount = Number(formatKronerToOre(accountAmount));

    if (numBudgetAmount !== 0 || numAccountAmount !== 0) {

      rowNumber++;

      // check if the number is odd
      const colorClass = (rowNumber % 2 !== 0) ? "green" : "";

      // fixed cost/ variable cost
      let costType = "";
      switch (account.fixedCost) {

        case "Y":
          costType = "Fast kostnad";
          break;

        case "N":
          costType = "Variabel kostnad";
          break;

        default:
          costType = "Variabel kostnad";
          break;
      }

      // Deviation
      accountAmount = Number(formatKronerToOre(accountAmount));
      budgetAmount = Number(formatKronerToOre(budgetAmount));
      let deviation = accountAmount - budgetAmount;

      // Accomulate
      totalAccountAmount += Number(accountAmount);
      totalBudgetAmount += Number(budgetAmount);

      // Format amount
      accountAmount = formatOreToKroner(String(accountAmount));
      budgetAmount = formatOreToKroner(String(budgetAmount));
      deviation = formatOreToKroner(String(deviation));
      html += HTMLTableRow(account.name, accountAmount, budgetAmount, deviation);
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
  let deviation = Number(totalAccountAmount) - Number(totalBudgetAmount);

  deviation = formatOreToKroner(String(deviation));
  totalAccountAmount = formatOreToKroner(String(totalAccountAmount));
  totalBudgetAmount = formatOreToKroner(String(totalBudgetAmount));

  html += HTMLTableRow('Sum', totalAccountAmount, totalBudgetAmount, deviation);
  html += endHTMLTableBody();
  html += endHTMLTable();

  document.querySelector('.div-grid-annualaccount-annualaccount').innerHTML = html;
}
*/

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

/*
// Show calculated income next year
function showIncomeNextYear() {

  // Get fixed costs per month
  let fromDate = document.querySelector('.input-filter-fromDate').value;
  fromDate = Number(convertDateToISOFormat(fromDate));
  let toDate = document.querySelector('.input-filter-toDate').value;
  toDate = Number(convertDateToISOFormat(toDate));
  let numFixedCost = Number(getFixedCost(fromDate, toDate));

  // // Get fixed costs per year
  // 12 month and 7 condos
  let strFixedCost = String(Math.round(numFixedCost / 12 / 7) * (-1));

  // Remove øre
  strFixedCost = strFixedCost.slice(0, -2) + "00";
  numFixedCost = Number(strFixedCost);
  strFixedCost = formatOreToKroner(String(numFixedCost));

  let rowNumber = 0;
  let totalCommonCostsMonth = 0;
  let totalCommonCostsYear = 0;
  let totalSquareMeters = 0;
  let totalFixedCosts = 0;

  let html = startHTMLTable();

  // Header
  html += HTMLTableHeader('Leilighet', 'Kvadratmeter', 'Faste kostnader', 'Felleskostnad/måned', 'Felleskostnad år');

  objCondo.arrayCondo.forEach((condo) => {

    rowNumber++;

    // check if the number is odd
    const colorClass = (rowNumber % 2 !== 0) ? "green" : "";

    // Square meters
    let numSquareMeters = Number(condo.squareMeters);
    let strSquareMeters = formatOreToKroner(condo.squareMeters);

    // Common costs per month
    let priceSquareMeter = document.querySelector('.input-filter-priceSquareMeter').value;
    priceSquareMeter = Number(formatKronerToOre(priceSquareMeter));

    let numCommonCostsMonth = (priceSquareMeter * numSquareMeters) / 100;
    let strCommonCostsMonth = String(numCommonCostsMonth + numFixedCost);
    strCommonCostsMonth = formatOreToKroner(strCommonCostsMonth);

    // Common cost per Year
    let numCommonCostsYear = (numCommonCostsMonth + numFixedCost) * 12;
    let strCommonCostsYear = formatOreToKroner(String(numCommonCostsYear));

    html += HTMLTableRow(condo.name, strSquareMeters, strFixedCost, strCommonCostsMonth, strCommonCostsYear);

    // Accomulate
    totalSquareMeters += Number(numSquareMeters);
    totalFixedCosts += Number(numFixedCost);
    totalCommonCostsMonth += Number(numCommonCostsMonth);
    totalCommonCostsYear += Number(numCommonCostsYear);
  });

  // accumulator row

  // Square meter
  const strSquareMeters = formatOreToKroner(String(totalSquareMeters));

  // Fixed costs
  strFixedCost = formatOreToKroner(String(totalFixedCosts));

  // Common cost per month
  const strCommonCostsMonth = formatOreToKroner(String(totalCommonCostsMonth + totalFixedCosts));

  // Common cost per year
  const strCommonCostsYear = formatOreToKroner(String(totalCommonCostsYear));

  html += HTMLTableRow('Sum', strSquareMeters, strFixedCost, strCommonCostsMonth, strCommonCostsYear);
  html += endHTMLTableBody();
  html += endHTMLTable();
  document.querySelector('.div-grid-annualaccount-income').innerHTML = html;
}
*/

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

// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable('width:1100px;');

  // Main header
  html += objAnnualAccount.showHTMLMainTableHeaderNew('widht:250px;', 0, 'Årsregnskap');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start table
  html = startHTMLTable('width:1100px;');

  // Header filter for search
  html += objAnnualAccount.showHTMLFilterHeader("width:200px;", '');

  // Filter for search
  html += "<tr>";

  // Header filter
  html += objAnnualAccount.showHTMLFilterHeader("width:1100px;", 'Fra dato', 'Til dato', 'Busjettår', 'Pris per m2');

  html += "</tr>";

  html += "<tr>";

  // show from date
  const fromDate = '01.01.' + String(today.getFullYear());
  html += objAnnualAccount.showInputHTMLNew('filterFromDate', fromDate, 10);

  // show to date
  let toDate = getCurrentDate();
  html += objAnnualAccount.showInputHTMLNew('filterToDate', toDate, 10);

  // Budget year
  let year = today.getFullYear();
  html += objBudget.selectIntervalHTMLNew('filterYear', 'width:100px;', 2020, 2030, year, 'Budsjettår');

  // price per square meter
  html += objAnnualAccount.showInputHTMLNew('filterPriceSquareMeter', '45,00', 10);

  html += "</tr>";
  html += "<td></td>";
  html += "<tr></tr>";

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.filter').innerHTML = html;
}

// Show annual accounts
function showAnnualAccounts(rowNumber) {

  // Start HTML table
  let html = startHTMLTable('width:1100px;');

  // Header
  //html += objAnnualAccount.showHTMLTableHeaderNew('', rowNumber, '', 'Konto', 'Beløp', 'Budsjett', 'Avvik');
  html += objAnnualAccount.showHTMLMainTableHeaderNew('', rowNumber, '', 'Konto', 'Beløp', 'Budsjett', 'Avvik');

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
      html += objBankAccountTransactions.showInputHTMLNew('name', account.name, 45);

      // accountAmount
      accountAmount = formatOreToKroner(accountAmount);
      className = `accountAmount${account.accountId}`;
      html += objBankAccountTransactions.showInputHTMLNew('accountAmount', accountAmount, 10);

      // budgetAmount
      budgetAmount = formatOreToKroner(budgetAmount);
      className = `budgetAmount${account.accountId}`;
      html += objBankAccountTransactions.showInputHTMLNew('budgetAmount', budgetAmount, 10);

      // Deviation
      accountAmount = Number(formatKronerToOre(accountAmount));
      budgetAmount = Number(formatKronerToOre(budgetAmount));
      let deviation = accountAmount - budgetAmount;
      deviation = formatOreToKroner(deviation);
      className = `deviation${account.accountId}`;
      html += objBankAccountTransactions.showInputHTMLNew('deviation', deviation, 10);

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
  html += objBankAccountTransactions.showInputHTMLNew('totalAccountAmount', totalAccountAmount, 10);

  // Budget fiscal year
  totalBudgetAmount = formatOreToKroner(String(totalBudgetAmount));
  html += objBankAccountTransactions.showInputHTMLNew('totalBudgetAmount', totalBudgetAmount, 10);

  // Total deviation
  totalAccountAmount = formatKronerToOre(totalAccountAmount);
  totalBudgetAmount = formatKronerToOre(totalBudgetAmount);
  let totalDeviation = Number(totalAccountAmount) - Number(totalBudgetAmount);
  totalDeviation = formatOreToKroner(String(totalDeviation));
  html += objBankAccountTransactions.showInputHTMLNew('totalDeviation', totalDeviation, 10);

  totalAccountAmount = formatOreToKroner(String(totalAccountAmount));
  totalBudgetAmount = formatOreToKroner(String(totalBudgetAmount));

  html += "</tr>";

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.annualaccount').innerHTML = html;

  return rowNumber;
}

// Show income for next year
function showIncomeNextYear(rowNumber) {

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
  let html = startHTMLTable('width:1100px;');

  // Header filter for search
  html += objAnnualAccount.showHTMLFilterHeader("width:200px;", '');

  // Header
  rowNumber++;
  html += objAnnualAccount.showHTMLMainTableHeaderNew('', rowNumber, 'Leilighet', 'Kvadratmeter', 'Faste kostnader', 'Felleskostnad/måned', 'Felleskostnad/år');

  objCondo.arrayCondo.forEach((condo) => {

    html += '<tr>';

    // Show menu
    rowNumber++;
    html += objBankAccountTransactions.menuNew(rowNumber);

    // name
    className = `name${condo.condoId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, condo.name, 45);

    // Square meters
    let squareMeters = formatOreToKroner(condo.squareMeters);
    className = `squareMeters${condo.condoId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, squareMeters, 10);

    // price/ squareMeter
    let priceSquareMeter = document.querySelector('.filterPriceSquareMeter').value;
    className = `priceSquareMeter${condo.condoId}`;
    //html += objBankAccountTransactions.showInputHTMLNew(className, priceSquareMeter, 10);

    // Fixed cost
    fixedCost = formatOreToKroner(fixedCost);
    className = `fixedCost${condo.condoId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, fixedCost, 10);

    // Common cost per month
    priceSquareMeter = Number(formatKronerToOre(priceSquareMeter));
    squareMeters = Number(formatKronerToOre(squareMeters));
    let commonCostsMonth = (priceSquareMeter * squareMeters) / 100;
    fixedCost = Number(formatKronerToOre(fixedCost));
    commonCostsMonth = formatOreToKroner(String(commonCostsMonth + fixedCost));
    className = `commonCostsMonth${condo.accountId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, commonCostsMonth, 10);

    // Common cost per Year
    commonCostsMonth = Number(formatKronerToOre(commonCostsMonth));
    let commonCostsYear = (commonCostsMonth + fixedCost) * 12;
    commonCostsYear = formatOreToKroner(String(commonCostsYear));
    className = `commonCostsYear${condo.accountId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, commonCostsYear, 10);

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

  html += objBankAccountTransactions.showInputHTMLNew('totalSquareMeters', formatOreToKroner(String(totalSquareMeters, 10)));
  html += objBankAccountTransactions.showInputHTMLNew('totalFixedCosts', formatOreToKroner(String(totalFixedCosts, 10)));
  html += objBankAccountTransactions.showInputHTMLNew('totalCommonCostsMonth', formatOreToKroner(String(totalCommonCostsMonth, 10)));
  html += objBankAccountTransactions.showInputHTMLNew('totalCommonCostsYear', formatOreToKroner(String(totalCommonCostsYear, 10)));

  html += "</tr>";

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.incomeNextYear').innerHTML = html;

  return rowNumber;
}

/*
// Show remote heating
function showRemoteHeating() {

  let rowNumber = 0;

  html =
    `
        <!-- Budget Table Heading -->
        <table>
          <thead>
            <tr>
              <th>Betalings dato</th>
              <th>Beløp</th>
              <th>Kilowatt timer</th>
              <th>Pris/Kilowatt timer</th>
            </tr>
          </thead>
        <tbody>
      `;

  // Filter
  let fromDate = convertDateToISOFormat(document.querySelector('.input-filter-fromDate').value);
  let toDate = convertDateToISOFormat(document.querySelector('.input-filter-toDate').value);

  // Accomulate
  let sumColumnPayment = 0;
  let sumColumnNumberKWHour = 0;

  // Get row number for payment Remote Heating Account Id
  const condominiumRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
  if (condominiumRowNumber !== -1) {

    objBankAccountTransactions.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {
      if (bankAccountTransaction.accountId === objCondominiums.arrayCondominiums[condominiumRowNumber].paymentRemoteHeatingAccountId) {
        if (Number(bankAccountTransaction.date) >= Number(fromDate) && Number(bankAccountTransaction.date) <= Number(toDate)) {

          rowNumber++;

          // check if the number is odd
          const colorClass =
            (rowNumber % 2 !== 0) ? "green" : "";
          html +=
            `
                <tr>
              `;

          // date
          const date = formatToNorDate(bankAccountTransaction.date);
          // Date
          html +=
            `
                <td>${date}</td>
              `;

          // payment
          let payment =
            formatOreToKroner(bankAccountTransaction.payment);
          html +=
            `
                <td>${payment}</td>
              `;

          // Number of kw/h
          let numberKWHour =
            formatOreToKroner(bankAccountTransaction.numberKWHour);
          html +=
            `
                <td>${numberKWHour}</td>
              `;

          // Price per KWHour
          payment =
            Number(bankAccountTransaction.payment);
          numberKWHour =
            Number(bankAccountTransaction.numberKWHour);

          let priceKWHour = '';
          if (numberKWHour !== 0 && payment !== 0) {

            priceKWHour = (-1 * payment) / numberKWHour;
            priceKWHour =
              priceKWHour.toFixed(2);
          }
          html +=
            `
                <td>${priceKWHour}</td>
              `;

          // Accomulate
          // payment
          sumColumnPayment += Number(bankAccountTransaction.payment);

          // KWHour
          sumColumnNumberKWHour += Number(bankAccountTransaction.numberKWHour);
        }
      }
      html +=
        `
            </tr>
          `;
    });

    html +=
      `
            <tr>
          `;


    html +=
      `
          <td>Sum</td>
        `;

    // Payment
    let payment = formatOreToKroner(String(sumColumnPayment));
    html +=
      `
          <td>${payment}</td>
        `;

    // Kilowatt/hour
    const KWHour = formatOreToKroner(String(sumColumnNumberKWHour));
    html +=
      `
          <td>${KWHour}</td>
        `;

    // Price per KWHour
    payment = Number(sumColumnPayment);
    numberKWHour = Number(sumColumnNumberKWHour);

    let sumPriceKWHour = '-';
    if (payment !== 0 && numberKWHour !== 0) {

      sumPriceKWHour =
        ((-1 * payment) / numberKWHour);
      sumPriceKWHour =
        sumPriceKWHour.toFixed(2);
    }

    html +=
      `
          <td>${sumPriceKWHour}</td>
        `;

    html +=
      `
                </tr>
              </tbody>
            </table>
          </div>
        `;
    document.querySelector('.div-grid-annualaccount-remoteHeating').innerHTML = html;
  }
}
*/

// Show remote heating
function showRemoteHeating(rowNumber) {

  // Accomulators
  // payment
  let sumPayment = 0;

  // KWHour
  let sumNumberKWHour = 0;

  // Filter
  const fromDate = convertDateToISOFormat(document.querySelector('.filterFromDate').value);
  const toDate = convertDateToISOFormat(document.querySelector('.filterToDate').value);

  // Start HTML table
  let html = startHTMLTable('width:1100px;');

  // Header filter for search
  html += objAnnualAccount.showHTMLFilterHeader("width:200px;", '');

  // Header
  rowNumber++;
  html += objAnnualAccount.showHTMLMainTableHeaderNew('', rowNumber, 'Betalingsdato', 'Beløp', 'Kilowattimer', 'Pris/Kilowatt timer');

  // Get row number for payment Remote Heating Account Id
  const condominiumRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
  if (condominiumRowNumber !== -1) {

    const paymentRemoteHeatingAccountId = Number(objCondominiums.arrayCondominiums[condominiumRowNumber].paymentRemoteHeatingAccountId);
    objBankAccountTransactions.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {
      if (bankAccountTransaction.accountId === paymentRemoteHeatingAccountId) {
        if (Number(bankAccountTransaction.date) >= Number(fromDate) && Number(bankAccountTransaction.date) <= Number(toDate)) {

          html += '<tr>';

          // Show menu
          rowNumber++;
          html += objBankAccountTransactions.menuNew(rowNumber);

          const date = formatToNorDate(bankAccountTransaction.date);
          className = `date${bankAccountTransaction.bankAccountTransactionId}`;
          html += objBankAccountTransactions.showInputHTMLNew(className, date, 10);

          let payment = formatOreToKroner(bankAccountTransaction.payment);
          className = `payment${bankAccountTransaction.bankAccountTransactionId}`;
          html += objBankAccountTransactions.showInputHTMLNew(className, payment, 10);

          // numberKWHour
          let numberKWHour = formatOreToKroner(bankAccountTransaction.numberKWHour);
          className = `numberKWHour${bankAccountTransaction.bankAccountTransactionId}`;
          html += objBankAccountTransactions.showInputHTMLNew(className, numberKWHour, 10);

          // Price per KWHour
          payment = Number(bankAccountTransaction.payment);
          numberKWHour = Number(bankAccountTransaction.numberKWHour);

          let priceKWHour = '';
          if (numberKWHour !== 0 && payment !== 0) priceKWHour = (-1 * payment) / numberKWHour;

          if (priceKWHour > 0) priceKWHour = priceKWHour.toFixed(2);
          priceKWHour = priceKWHour.replace(".", ",");
          priceKWHour = formatOreToKroner(priceKWHour);
          className = ` priceKWHour${bankAccountTransaction.bankAccountTransactionId}`;
          html += objBankAccountTransactions.showInputHTMLNew(className, priceKWHour, 10);

          html += "</tr>";

          // Accomulate
          // payment
          sumPayment += Number(bankAccountTransaction.payment);

          // KWHour
          sumNumberKWHour += Number(bankAccountTransaction.numberKWHour);
        }
      }
    });

    // Sum row
    html += "<tr>";

    // Show menu
    rowNumber++;
    html += objBankAccountTransactions.menuNew(rowNumber);

    html += "<td class='center bold'>Sum</td>";

    html += objBankAccountTransactions.showInputHTMLNew('sumPayment', formatOreToKroner(String(sumPayment, 10)));
    html += objBankAccountTransactions.showInputHTMLNew('sumNumberKWHour', formatOreToKroner(String(sumNumberKWHour, 10)));

    // Price per KWHour
    let priceKWHour = '';
    if (sumNumberKWHour !== 0 && sumPayment !== 0) priceKWHour = (-1 * sumPayment) / sumNumberKWHour;
    priceKWHour = priceKWHour.toFixed(2);
    priceKWHour = priceKWHour.replace(".", ",");
    priceKWHour = formatOreToKroner(priceKWHour);
    className = `priceKWHour`;
    html += objBankAccountTransactions.showInputHTMLNew(className, formatOreToKroner(String(priceKWHour, 10)));

    html += "</tr>";

    // The end of the table
    html += endHTMLTable();
    document.querySelector('.remoteHeating').innerHTML = html;

    return rowNumber;
  }
}

/*
// Show current bank deposit and estimated bank deposit for next year
function showBankDeposit() {

  let nextBudgetYear = Number(document.querySelector('.select-filter-budgetYear').value) + 1;

  let html = startHTMLTable();
  html += HTMLTableHeader('Tekst', 'Dato', `Beløp ${nextBudgetYear}`);

  let rowNumber = 0;
  let accAmount = 0;

  rowNumber++;

  // check if the number is odd
  let colorClass = (rowNumber % 2 !== 0) ? "green" : "";

  html += startHTMLTableBody();

  // Date
  let closingBalanceDate = "";
  const bankAccountRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.condominiumId === objUserPassword.condominiumId);
  if (bankAccountRowNumber !== -1) {

    closingBalanceDate = (objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalanceDate);
    closingBalanceDate = formatToNorDate(closingBalanceDate);
  }

  // Bank deposit
  let bankDepositAmount = "";

  bankDepositAmount = (objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalance);
  bankDepositAmount = formatOreToKroner(bankDepositAmount);

  html += HTMLTableRow('Bankinnskudd', closingBalanceDate, bankDepositAmount);

  accAmount += Number(formatKronerToOre(bankDepositAmount));

  // budget
  objBudget.arrayBudgets.forEach((budget) => {
    if (Number(budget.year) === nextBudgetYear) {
      if (Number(budget.amount) !== 0) {

        rowNumber++;

        // check if the number is odd
        colorClass = (rowNumber % 2 !== 0) ? "green" : "";

        // Account Name
        let name = '';

        const accountRowNumber = objAccounts.arrayAccounts.findIndex(account => account.accountId === budget.accountId);
        if (accountRowNumber !== -1) {

          name = objAccounts.arrayAccounts[accountRowNumber].name;
        }

        // Dato

        // budget amount
        let amount = Number(budget.amount);
        amount = formatOreToKroner(amount);

        // accumulate
        const numAmmount = Number(formatKronerToOre(amount));
        accAmount += numAmmount;

        html += HTMLTableRow(name, '', amount);
      }
    }
  });

  // Calculated closining balance next year
  rowNumber++;

  // check if the number is odd
  colorClass = (rowNumber % 2 !== 0) ? "green" : "";

  // Dato
  closingBalanceDate = Number(objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalanceDate);

  // Next year
  closingBalanceDate = closingBalanceDate + 10000;
  closingBalanceDate = formatToNorDate(String(closingBalanceDate));

  // Bank deposit next year
  bankDepositAmount = formatOreToKroner(String(accAmount));

  html += HTMLTableRow('Estimert bankinnskudd', closingBalanceDate, bankDepositAmount);

  html += endHTMLTableBody();
  html += endHTMLTable();

  document.querySelector('.div-grid-annualaccount-bankDeposit').innerHTML = html;
}
*/

// Show showBank Deposit for next year
function showBankDeposit(rowNumber) {
  /*
  
    // Date
    let closingBalanceDate = "";
    const bankAccountRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.condominiumId === objUserPassword.condominiumId);
    if (bankAccountRowNumber !== -1) {
  
      closingBalanceDate = (objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalanceDate);
      closingBalanceDate = formatToNorDate(closingBalanceDate);
    }
  
    // Bank deposit
    let bankDepositAmount = "";
  
    bankDepositAmount = (objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalance);
    bankDepositAmount = formatOreToKroner(bankDepositAmount);
  
    html += HTMLTableRow('Bankinnskudd', closingBalanceDate, bankDepositAmount);
  
    accAmount += Number(formatKronerToOre(bankDepositAmount));
  
  
  */

  let nextBudgetYear = Number(document.querySelector('.filterYear').value) + 1;

  let accAmount = 0;

  // Start HTML table
  let html = startHTMLTable('width:1100px;');

  // Header filter for search
  html += objAnnualAccount.showHTMLFilterHeader("width:200px;", '');

  html += "<tr>";

  // Header
  html += objAnnualAccount.showHTMLMainTableHeaderNew('', rowNumber, 'Text', 'Dato', `Budsjett ${nextBudgetYear}`);

  // Show menu
  rowNumber++;
  html += objBankAccountTransactions.menuNew(rowNumber);

  // Text
  className = `text`;
  html += objBankAccountTransactions.showInputHTMLNew(className, 'Bankinnskudd', 10);

  // closingBalanceDate
  let closingBalanceDate = "";
  let bankAccountRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.condominiumId === objUserPassword.condominiumId);
  if (bankAccountRowNumber !== -1) {

    closingBalanceDate = (objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalanceDate);
    closingBalanceDate = formatToNorDate(closingBalanceDate);
  }
  className = `closingBalanceDate`;
  html += objBankAccountTransactions.showInputHTMLNew(className, closingBalanceDate, 10);

  // Bank deposit
  let bankDepositAmount = "";
  bankDepositAmount = (objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalance);
  bankDepositAmount = formatOreToKroner(bankDepositAmount);

  className = `bankDepositAmount`
  html += objBankAccountTransactions.showInputHTMLNew(className, bankDepositAmount, 10);

  html += "</tr>";

  accAmount += Number(formatKronerToOre(bankDepositAmount));

  // budget
  objBudget.arrayBudgets.forEach((budget) => {
    if (Number(budget.year) === nextBudgetYear) {
      if (Number(budget.amount) !== 0) {

        html += "<tr>";

        // Show menu
        rowNumber++;
        html += objBankAccountTransactions.menuNew(rowNumber);

        // Account Name
        let name = '';
        const accountRowNumber = objAccounts.arrayAccounts.findIndex(account => account.accountId === budget.accountId);
        if (accountRowNumber !== -1) {

          name = objAccounts.arrayAccounts[accountRowNumber].name;
        }
        className = `name${budget.budgetId}`
        html += objBankAccountTransactions.showInputHTMLNew(className, name, 10);

        // Date
        html += "<td></td>";

        // budget amount
        let amount = formatOreToKroner(budget.amount);
        className = `amount${budget.budgetId}`
        html += objBankAccountTransactions.showInputHTMLNew(className, amount, 10);

        html += "</tr>";

        // accumulate
        accAmount += Number(formatKronerToOre(amount));
      }
    }
  });

  html += '<tr>';

  // Show menu
  rowNumber++;
  html += objBankAccountTransactions.menuNew(rowNumber);

  className = `estimatedBankDeposit`;
  html += objBankAccountTransactions.showInputHTMLNew(className, 'Estimert bankinnskudd', 10);

  // Next year
  closingBalanceDate = Number(convertDateToISOFormat(closingBalanceDate));
  let closingBalanceDateNextYear = closingBalanceDate + 10000;
  closingBalanceDateNextYear = formatToNorDate(closingBalanceDateNextYear);
  className = `closingBalanceDateNextYear`;
  html += objBankAccountTransactions.showInputHTMLNew(className, closingBalanceDateNextYear, 10);

  // Bank deposit next year
  const bankDepositNextYear = formatOreToKroner(String(accAmount));
  className = `bankDepositNextYear`;
  html += objBankAccountTransactions.showInputHTMLNew(className, bankDepositNextYear, 10);

  html += "<tr>";

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.bankDeposit').innerHTML = html;

  return rowNumber;
}
