// Search for amount movements

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objCondominiums = new Condominiums('condominiums');
const objBudget = new Budget('budget');
const objAccounts = new Account('account');
const objBankAccounts = new BankAccounts('bankaccounts');
const objBankAccountTransactions = new BankAccountTransactions('bankaccounttransactions');
const objCondo = new Condo('condo');
const objAnnualAccount = new AnnualAccount('annualaccount');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

objAnnualAccount.menu();
objAnnualAccount.markSelectedMenu('Årsregnskap');

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    await objUsers.loadUsersTable(objUserPassword.condominiumId);
    await objCondominiums.loadCondominiumsTable(objUserPassword.condominiumId);
    await objCondo.loadCondoTable(objUserPassword.condominiumId);
    await objBudget.loadBudgetsTable(objUserPassword.condominiumId, 999999999, 999999999);
    await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId);
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId);

    // Show leading text for filter
    showLeadingTextFilter();

    // Show values for filter
    showValuesFilter();

    const condominiumId = Number(objUserPassword.condominiumId);
    const deleted = "N";
    const year = today.getFullYear();
    let fromDate = "01.01." + year;
    fromDate = Number(convertDateToISOFormat(fromDate));
    let toDate = getCurrentDate();
    toDate = Number(convertDateToISOFormat(toDate));
    const orderBy = 'condoId ASC, date DESC, income ASC';
    await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, 999999999, 999999999, 0, fromDate, toDate);

    // Show annual accounts
    showAnnualAccounts();

    // Show income for next year
    showIncomeNextYear();

    // Show remote Heating
    showRemoteHeating();

    // Show bank deposit for next year
    showBankDeposit();

    // Make events
    createEvents();
  }
}

// Make budget events
function createEvents() {

  // from date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-filter-fromDate')) {

      // Search Bank account transactions and reload Bank account transactions
      searchFromDateSync();

      // Search for Bank account transactions
      async function searchFromDateSync() {

        const condominiumId = Number(objUserPassword.condominiumId);
        const deleted = 'N';
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-fromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-toDate').value));
        const orderBy = 'condoId ASC, date DESC, income ASC';
        await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, 999999999, 999999999, 0, fromDate, toDate);

        // Show annual accounts
        showAnnualAccounts();

        // Show income for next year
        showIncomeNextYear();

        // Show remote Heating
        showRemoteHeating();

        // Show bank deposit for next year
        showBankDeposit();
      };
    };
  });

  // to date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-filter-toDate')) {

      // Search Bank account transactions and reload Bank account transactions
      searchToDateSync();

      // Search for bank account transactions
      async function searchToDateSync() {

        const condominiumId = Number(objUserPassword.condominiumId);
        const deleted = 'N';
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-fromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-toDate').value));
        const orderBy = 'condoId ASC, date DESC, income ASC';
        await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, 999999999, 999999999, 0, fromDate, toDate);

        // Show annual accounts
        showAnnualAccounts();

        // Show income for next year
        showIncomeNextYear();

        // Show remote Heating
        showRemoteHeating();

        // Show bank deposit for next year
        showBankDeposit();
      };
    };
  });

  // budget year
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-filter-budgetYear')) {

      // Search Bank account transactions and reload Bank account transactions
      searchBudgetYearSync();

      // Search for bank account transactions
      async function searchBudgetYearSync() {

        const condominiumId = Number(objUserPassword.condominiumId);
        const deleted = 'N';
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-fromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-toDate').value));
        const orderBy = 'condoId ASC, date DESC, income ASC';
        await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, 999999999, 999999999, 0, fromDate, toDate);

        // Show annual accounts
        showAnnualAccounts();

        // Show income for next year
        showIncomeNextYear();

        // Show remote Heating
        showRemoteHeating();

        // Show bank deposit for next year
        showBankDeposit();
      };
    };
  });

  // Price per squaremeter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-filter-priceSquareMeter')) {

      // Search Bank account transactions and reload Bank account transactions
      searchBudgetYearSync();

      // Search for bank account transactions
      async function searchBudgetYearSync() {

        let priceSquareMeter = document.querySelector('.input-filter-priceSquareMeter').value;
        priceSquareMeter = formatKronerToOre(priceSquareMeter);
        document.querySelector('.input-filter-priceSquareMeter').value = formatOreToKroner(priceSquareMeter);

        const condominiumId = Number(objUserPassword.condominiumId);
        const deleted = 'N';
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-fromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-toDate').value));
        const orderBy = 'condoId ASC, date DESC, income ASC';
        await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, 999999999, 999999999, 0, fromDate, toDate);

        // Show annual accounts
        showAnnualAccounts();

        // Show income for next year
        showIncomeNextYear();

        // Show remote Heating
        showRemoteHeating();

        // Show bank deposit for next year
        showBankDeposit();
      };
    };
  });
}

// Show leading text Filter
function showLeadingTextFilter() {

  let html = startHTMLFilters();

  // from date
  html += objAnnualAccount.showInputHTML('input-filter-fromDate', 'Fra dato', 10, 'mm.dd.åååå');

  // To date
  html += objAnnualAccount.showInputHTML('input-filter-toDate', 'Til dato', 10, 'mm.dd.åååå');

  // Budget year
  let budgetYear = today.getFullYear();
  html += objBudget.selectNumberHTML('select-filter-budgetYear', 2020, 2030, budgetYear, 'Budsjettår');

  // price per square meter
  html += objAnnualAccount.showInputHTML('input-filter-priceSquareMeter', 'Kvadratmeterpris', 8, '');

  html += endHTMLFilters();
  document.querySelector('.div-grid-annualaccount-filter').innerHTML = html;
}

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

  // Sum line

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

// Accumulate all Bank account transactions for specified account id
function getTotalMovementsBankAccount(accountId) {

  let accountAmount = 0;

  let fromDate = document.querySelector('.input-filter-fromDate').value;

  fromDate = Number(convertDateToISOFormat(fromDate));

  let toDate = document.querySelector('.input-filter-toDate').value;
  toDate = Number(convertDateToISOFormat(toDate));

  objBankAccountTransactions.arrayBankAccountTranactions.forEach((bankAccountTransaction) => {

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

  // accumulator line

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

// Get fixed costs
function getFixedCost(fromDate, toDate) {

  let fixedCost = 0;

  objBankAccountTransactions.arrayBankAccountTranactions.forEach((bankAccountTransaction) => {

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

    objBankAccountTransactions.arrayBankAccountTranactions.forEach((bankaccounttransaction) => {
      if (bankaccounttransaction.accountId === objCondominiums.arrayCondominiums[condominiumRowNumber].paymentRemoteHeatingAccountId) {
        if (Number(bankaccounttransaction.date) >= Number(fromDate) && Number(bankaccounttransaction.date) <= Number(toDate)) {

          rowNumber++;

          // check if the number is odd
          const colorClass =
            (rowNumber % 2 !== 0) ? "green" : "";
          html +=
            `
                <tr>
              `;

          // date
          const date = formatToNorDate(bankaccounttransaction.date);
          // Date
          html +=
            `
                <td>${date}</td>
              `;

          // payment
          let payment =
            formatOreToKroner(bankaccounttransaction.payment);
          html +=
            `
                <td>${payment}</td>
              `;

          // Number of kw/h
          let numberKWHour =
            formatOreToKroner(bankaccounttransaction.numberKWHour);
          html +=
            `
                <td>${numberKWHour}</td>
              `;

          // Price per KWHour
          payment =
            Number(bankaccounttransaction.payment);
          numberKWHour =
            Number(bankaccounttransaction.numberKWHour);

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
          sumColumnPayment += Number(bankaccounttransaction.payment);

          // KWHour
          sumColumnNumberKWHour += Number(bankaccounttransaction.numberKWHour);
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
