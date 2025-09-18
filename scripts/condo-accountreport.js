// Search for amount movements

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondominium = new Condominium('condominium');
const objBudget = new Budget('budget');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objBankAccountMovement = new BankAccountMovement('bankaccountmovement');
const objCondo = new Condo('condo');
const objAccountReport = new AccountReport('accountreport');

let userArrayCreated = false;
let condominiumArrayCreated = false;
let budgetArrayCreated = false;
let accountArrayCreated = false;
let bankAccountArrayCreated = false;
let condoArrayCreated = false;
let bankAccountMovementArrayCreated = false;

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

let isEventsCreated;
let neadToShowLeadingTextFilter = true;

objAccountReport.menu();
objAccountReport.markSelectedMenu('Regnskapsrapport');

let socket;
socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'http://localhost/condo-login.html';
} else {

  let SQLquery;

  // Send a requests to the server
  socket.onopen = () => {

    // Sends a request to the server to get accounts
    SQLquery =
      `
        SELECT * FROM account
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY accountId;
      `;
    updateMySql(SQLquery, 'account', 'SELECT');
    accountArrayCreated =
      false;

    // Sends a request to the server to get bankaccounts
    SQLquery =
      `
        SELECT * FROM bankaccount
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY bankAccountId;
      `;
    updateMySql(SQLquery, 'bankaccount', 'SELECT');
    accountArrayCreated =
      false;

    // Sends a request to the server to get users
    SQLquery =
      `
        SELECT * FROM user
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY userId;
      `;
    updateMySql(SQLquery, 'user', 'SELECT');
    userArrayCreated =
      false;

    // Sends a request to the server to get condominium
    SQLquery =
      `
        SELECT * FROM condominium
        ORDER BY condominiumId;
      `;
    updateMySql(SQLquery, 'condominium', 'SELECT');
    condominiumArrayCreated =
      false;

    /*
    // Sends a request to the server to get budgets
    SQLquery =
      `
        SELECT * FROM budget
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
          AND year = '${today.getFullYear()}'
        ORDER BY budgetId;
      `;
    */
    // Sends a request to the server to get budgets
    SQLquery =
      `
        SELECT * FROM budget
        WHERE condominiumId = ${objUserPassword.condominiumId}
        AND deleted <> 'Y'
        ORDER BY budgetId;
      `;

    updateMySql(SQLquery, 'budget', 'SELECT');
    budgetArrayCreated =
      false;

    // Sends a request to the server to get condo
    SQLquery =
      `
        SELECT * FROM condo
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY name;
      `;
    updateMySql(SQLquery, 'condo', 'SELECT');
    condoArrayCreated =
      false;

    // Sends a request to the server to get bank account movements
    SQLquery =
      `
      SELECT * FROM bankaccountmovement
      WHERE condominiumId = ${objUserPassword.condominiumId}
        AND deleted <> 'Y'
      ORDER BY bankAccountMovementId;
    `;
    updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
    bankAccountMovementArrayCreated =
      false;
  };
}

// Handle incoming messages from server
socket.onmessage = (event) => {

  let messageFromServer =
    event.data;

  //Converts a JavaScript Object Notation (JSON) string into an object
  objInfo =
    JSON.parse(messageFromServer);

  if (objInfo.CRUD === 'SELECT') {
    switch (objInfo.tableName) {
      case 'user':

        // user table
        console.log('userTable');

        userArray =
          objInfo.tableArray;
        userArrayCreated =
          true;
        break;

      case 'account':

        // account table
        console.log('accountTable');

        accountArray =
          objInfo.tableArray;
        accountArrayCreated =
          true;
        break;

      case 'bankaccount':

        // bank account table
        console.log('bankaccountTable');

        bankAccountArray =
          objInfo.tableArray;
        bankAccountArrayCreated =
          true;
        break;

      case 'condominium':

        // condominium table
        console.log('condominium');

        condominiumArray =
          objInfo.tableArray;
        condominiumArrayCreated =
          true
        break;

      case 'budget':

        // budget table
        console.log('budget');

        budgetArray =
          objInfo.tableArray;
        budgetArrayCreated =
          true
        break;

      case 'condo':

        // condo table
        console.log('condo');

        condoArray =
          objInfo.tableArray;
        condoArrayCreated =
          true
        break;

      case 'bankaccountmovement':

        // bank account movement table
        console.log('bankaccountmovementTable');

        // array including objects with bank account movement information
        bankAccountMovementArray =
          objInfo.tableArray;
        bankAccountMovementArrayCreated =
          true;

        if (budgetArrayCreated
          && condominiumArrayCreated
          && userArrayCreated
          && condoArrayCreated
          && bankAccountArrayCreated
          && accountArrayCreated
          && bankAccountMovementArrayCreated) {

          // Show leading text for filter
          if (neadToShowLeadingTextFilter) {
            showLeadingTextFilter();
            neadToShowLeadingTextFilter = false;
          }

          // Show values for filter
          showValuesFilter();

          // Show budget
          showBudget();

          // Show calculated income for next year
          showIncomeNextYear();

          // Show remote heating
          showRemoteHeating();

          // Show bank deposit for next year
          showBankDeposit();

          // Make events
          isEventsCreated =
            (isEventsCreated) ? true : createEvents();
        } else {

          console.log("budgetArrayCreated: ", budgetArrayCreated);
          console.log("condominiumArrayCreated: ", condominiumArrayCreated);
          console.log("userArrayCreated: ", userArrayCreated);
          console.log("accountArrayCreated: ", accountArrayCreated);
          console.log("bankAccountArrayCreated: ", accountArrayCreated);
          console.log("condoArrayCreated: ", condoArrayCreated);
          console.log("bankAccountMovementArrayCreated: ", bankAccountMovementArrayCreated);
        }
        break;
    }
  }
  if (objInfo.CRUD === 'UPDATE' || objInfo.CRUD === 'INSERT' || objInfo.CRUD === 'DELETE') {

    switch (objInfo.tableName) {
      case 'budget':

        // Sends a request to the server to get accounts one more time
        //const budgetYear = Number(document.querySelector('.select-filter-budgetYear').value);
        /*
        SQLquery =
          `
              SELECT * FROM budget
              WHERE condominiumId = ${objUserPassword.condominiumId}
                AND deleted <> 'Y'
                AND year = '${budgetYear}'
              ORDER BY budgetId;
            `;
        */
        SQLquery =
          `
              SELECT * FROM budget
              WHERE condominiumId = ${objUserPassword.condominiumId}
                AND deleted <> 'Y'
              ORDER BY budgetId;
            `;
        updateMySql(SQLquery, 'budget', 'SELECT');
        budgetArrayCreated =
          false;
        break;
    };
  }

  // Handle errors
  socket.onerror = (error) => {

    // Close socket on error and let onclose handle reconnection
    socket.close();
  }

  // Handle disconnection
  socket.onclose = () => {
  }
}

// Make budget events
function createEvents() {

  // from date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-filter-fromDate')) {

      // Show selected bank account movements
      getSelectedBankAccountMovement();
    };
  });

  // to date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-filter-toDate')) {

      // Show selected bank account movements
      getSelectedBankAccountMovement();
    };
  });

  // budget year
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-filter-budgetYear')) {

      // Show selected bank account movements
      getSelectedBankAccountMovement();
    };
  });

  // Price per squaremeter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-filter-priceSquareMeter')) {

      let priceSquareMeter = document.querySelector('.input-filter-priceSquareMeter').value;
      priceSquareMeter = formatKronerToOre(priceSquareMeter);
      document.querySelector('.input-filter-priceSquareMeter').value = formatOreToKroner(priceSquareMeter);;

      // Show selected bank account movements
      getSelectedBankAccountMovement();
    };
  });

  return true;
}

// Show leading text Filter
function showLeadingTextFilter() {

  let html = startHTMLFilters();

  // from date
  html += objAccountReport.showInputHTML('input-filter-fromDate', 'Fra dato', 10, 'mm.dd.åååå');

  // To date
  html += objAccountReport.showInputHTML('input-filter-toDate', 'Til dato', 10, 'mm.dd.åååå');

  // Budget year
  let budgetYear = today.getFullYear();
  html += objBudget.selectNumberHTML('select-filter-budgetYear', 2020, 2030, budgetYear, 'Budsjettår');

  // price per square meter
  html += objAccountReport.showInputHTML('input-filter-priceSquareMeter', 'Kvadratmeterpris', 8, '');

  html += endHTMLFilters();
  document.querySelector('.div-grid-accountreport-filter').innerHTML = html;
}

// Show values for text
function showValuesFilter() {

  // From date
  date = document.querySelector('.input-filter-fromDate').value;
  if (!validateEuroDateFormat(date)) {

    // From date is not ok
    const year =
      String(today.getFullYear());
    document.querySelector('.input-filter-fromDate').value =
      "01.01." + year;
  }
  objAccountReport.showIcon('input-filter-fromDate');

  // to date
  date = document.querySelector('.input-filter-toDate').value;
  if (!validateEuroDateFormat(date)) {

    // To date is not ok
    const year =
      String(today.getFullYear());
    document.querySelector('.input-filter-toDate').value =
      getCurrentDate();
  }
  objAccountReport.showIcon('input-filter-toDate');

  // Budget year
  budgetYear = Number(document.querySelector('.select-filter-budgetYear').value);
  if (!validateNumberHTML(budgetYear, 2020, 2030)) {

    budgetYear =
      today.getFullYear() + 1;
    objBudget.selectNumber('select-filter-budgetYear', 2020, 2030, budgetYear, 'Budsjettår');
    objAccountReport.showIcon('select-filter-budgetYear');
  }

  // Price per square meter
  priceSquareMeter = document.querySelector('.input-filter-priceSquareMeter').value;
  if (!objAccountReport.validateAmount(priceSquareMeter)) {

    // To Price per square meter is not ok
    document.querySelector('.input-filter-priceSquareMeter').value = '30,00'
  }
  objAccountReport.showIcon('input-filter-priceSquareMeter');
}

// Show budgets
function showBudget() {

  // check for valid filter
  if (validateFilter()) {

    let totalBudgetAmount = 0;
    let totalAccountAmount = 0;
    let rowNumber = 0;

    //const fiscalYear = document.querySelector('.select-filter-fiscalYear').value;
    const budgetYear = document.querySelector('.select-filter-budgetYear').value;

    let html = startHTMLTable();
    html += HTMLTableHeader('Konto', 'Kontotype', 'Beløp', `Budsjett ${budgetYear}`, 'Avvik');

    accountArray.forEach((account) => {

      rowNumber++;

      // check if the number is odd
      const colorClass =
        (rowNumber % 2 !== 0) ? "green" : "";

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

      // bank account movement for selected account
      let accountAmount = getTotalMovementsBankAccount(account.accountId);
      accountAmount = formatOreToKroner(accountAmount);

      // Budget Amount for fiscal
      const budgetYear = Number(document.querySelector('.select-filter-budgetYear').value);
      let budgetAmount = getBudgetAmount(account.accountId, budgetYear);

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
      html += HTMLTableRow(account.name, costType, accountAmount, budgetAmount, deviation);
    });

    // Sum line

    // Total amount annual accounts
    totalAccountAmount =
      formatOreToKroner(totalAccountAmount);

    // Budget fiscal year
    totalBudgetAmount =
      formatOreToKroner(String(totalBudgetAmount));

    // Total deviation
    totalAccountAmount = formatKronerToOre(totalAccountAmount);
    totalBudgetAmount = formatKronerToOre(totalBudgetAmount);
    let deviation = Number(totalAccountAmount) - Number(totalBudgetAmount);

    deviation = formatOreToKroner(String(deviation));
    totalAccountAmount = formatOreToKroner(String(totalAccountAmount));
    totalBudgetAmount = formatOreToKroner(String(totalBudgetAmount));

    html += HTMLTableRow('Sum', '', totalAccountAmount, totalBudgetAmount, deviation);
    html += endHTMLTableBody();
    html += endHTMLTable();

    document.querySelector('.div-grid-accountreport-fiscalBudget').innerHTML = html;
  }
}

// Check for valid filter values
function validateFilter() {

  let fromDate = document.querySelector('.input-filter-fromDate').value;
  const validFromDate = validateNorDateHTML(fromDate);

  let toDate = document.querySelector('.input-filter-toDate').value;
  const validToDate = validateNorDateHTML(toDate);

  let budgetYear = Number(document.querySelector('.select-filter-budgetYear').value);
  const validBudgetYear = validateNumberHTML(budgetYear, 2020, 2030);

  // Check date interval
  fromDate = Number(convertDateToISOFormat(fromDate));
  toDate = Number(convertDateToISOFormat(toDate));

  validDateInterval = (fromDate <= toDate) ? true : false;

  return (validBudgetYear && validFromDate && validToDate && validDateInterval) ? true : false;
}

// Accumulate all bank account movement for specified account id
function getTotalMovementsBankAccount(accountId) {

  let accountAmount = 0;

  let fromDate =
    document.querySelector('.input-filter-fromDate').value;

  fromDate =
    Number(convertDateToISOFormat(fromDate));

  let toDate =
    document.querySelector('.input-filter-toDate').value;
  toDate =
    Number(convertDateToISOFormat(toDate));

  bankAccountMovementArray.forEach((bankAccountMovement) => {

    if (Number(bankAccountMovement.date) >= fromDate
      && (Number(bankAccountMovement.date) <= toDate
        && bankAccountMovement.accountId === accountId)) {

      accountAmount +=
        Number(bankAccountMovement.income);
      accountAmount +=
        Number(bankAccountMovement.payment);
    }
  })

  return accountAmount;
}

// get budget amount
function getBudgetAmount(accountId, year) {

  let amount = 0;

  // Budget Amount

  budgetArray.forEach(budget => {
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

  condoArray.forEach((condo) => {

    rowNumber++;

    // check if the number is odd
    const colorClass =
      (rowNumber % 2 !== 0) ? "green" : "";

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
    totalSquareMeters +=
      Number(numSquareMeters);
    totalFixedCosts +=
      Number(numFixedCost);
    totalCommonCostsMonth +=
      Number(numCommonCostsMonth);
    totalCommonCostsYear +=
      Number(numCommonCostsYear);
  });

  // accumulator line

  // Square meter
  const strSquareMeters = formatOreToKroner(String(totalSquareMeters));

  // Fixed costs
  strFixedCost = formatOreToKroner(String(totalFixedCosts));

  // Common cost per month
  const strCommonCostsMonth = formatOreToKroner(String(totalCommonCostsMonth));

  // Common cost per year
  const strCommonCostsYear = formatOreToKroner(String(totalCommonCostsYear));

  html += HTMLTableRow('', strSquareMeters, strFixedCost, strCommonCostsMonth, strCommonCostsYear);
  html += endHTMLTableBody();
  html += endHTMLTable();
  document.querySelector('.div-grid-accountreport-budget').innerHTML = html;
}

// Get fixed costs
function getFixedCost(fromDate, toDate) {

  let fixedCost = 0;

  bankAccountMovementArray.forEach((bankAccountMovement) => {

    if (Number(bankAccountMovement.date) >= fromDate
      && (Number(bankAccountMovement.date) <= toDate)) {

      // Check for fixed cost
      const objAccountNumber =
        accountArray.findIndex(account => account.accountId === bankAccountMovement.accountId);
      if (objAccountNumber !== -1) {

        if (accountArray[objAccountNumber].fixedCost === 'Y') {

          fixedCost +=
            Number(bankAccountMovement.income);
          fixedCost +=
            Number(bankAccountMovement.payment);
        }
      }
    }
  })
  return fixedCost;
}

// Show current bank deposit and estimated bank deposit for next year
function showBankDeposit() {
  let budgetYear = document.querySelector('.select-filter-budgetYear').value;

  let html = startHTMLTable();
  html += HTMLTableHeader('Tekst', 'Dato', `Beløp ${budgetYear}`);

  let rowNumber = 0;
  let accAmount = 0;

  rowNumber++;

  // check if the number is odd
  let colorClass =
    (rowNumber % 2 !== 0) ? "green" : "";

  html += startHTMLTableBody();

  // Dato
  let closingBalanceDate = "";
  const objBankAccountRowNumber =
    bankAccountArray.findIndex(bankAccount => bankAccount.condominiumId === objUserPassword.condominiumId);
  if (objBankAccountRowNumber !== -1) {

    closingBalanceDate = (bankAccountArray[objBankAccountRowNumber].closingBalanceDate);
    closingBalanceDate = formatToNorDate(closingBalanceDate);
  }

  // Bank deposit
  let bankDepositAmount = "";

  bankDepositAmount = (bankAccountArray[objBankAccountRowNumber].closingBalance);
  bankDepositAmount = formatOreToKroner(bankDepositAmount);

  html += HTMLTableRow('Bankinnskudd', closingBalanceDate, bankDepositAmount);

  accAmount += Number(formatKronerToOre(bankDepositAmount));

  // Next budget year
  budgetYear = Number(document.querySelector('.select-filter-budgetYear').value) + 1;

  // budget
  budgetArray.forEach((budget) => {
    if (Number(budget.year) === budgetYear) {
      if (Number(budget.amount) !== 0) {

        rowNumber++;

        // check if the number is odd
        colorClass = (rowNumber % 2 !== 0) ? "green" : "";

        // Account Name
        let name = '';

        const objAccountRowNumber = accountArray.findIndex(account => account.accountId === budget.accountId);
        if (objAccountRowNumber !== -1) {

          name = accountArray[objAccountRowNumber].name;
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
  colorClass =
    (rowNumber % 2 !== 0) ? "green" : "";

  // Dato
  closingBalanceDate = Number(bankAccountArray[objBankAccountRowNumber].closingBalanceDate);

  // Next year
  closingBalanceDate = closingBalanceDate + 10000;
  closingBalanceDate = formatToNorDate(String(closingBalanceDate));

  // Bank deposit next year
  bankDepositAmount = formatOreToKroner(String(accAmount));

  html += HTMLTableRow('Estimert bankinnskudd', closingBalanceDate, bankDepositAmount);

  html += endHTMLTableBody();
  html += endHTMLTable();

  document.querySelector('.div-grid-accountreport-bankdeposit').innerHTML = html;
}

// Get selected bank account movement 
function getSelectedBankAccountMovement() {

  const budgetYear =
    Number(document.querySelector('.select-filter-budgetYear').value);

  const fromDate =
    Number(convertDateToISOFormat(document.querySelector('.input-filter-fromDate').value));
  const toDate =
    Number(convertDateToISOFormat(document.querySelector('.input-filter-toDate').value));

  // Sends a request to the server to get selected bank account movements
  SQLquery =
    `
      SELECT * FROM bankaccountmovement
      WHERE condominiumId = ${objUserPassword.condominiumId}
      AND deleted <> 'Y'
      AND date BETWEEN ${fromDate} AND ${toDate};
    `;
  console.log(SQLquery);
  updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
  bankAccountMovementArrayCreated =
    false;
}

// Show remote heating
function showRemoteHeating() {

  // check for valid filter
  if (validateFilter()) {

    let rowNumber = 0;

    const budgetYear = document.querySelector('.select-filter-budgetYear').value;
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
    const objCondominiumRowNumber =
      condominiumArray.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
    if (objCondominiumRowNumber !== -1) {

      bankAccountMovementArray.forEach((bankaccountmovement) => {
        if (bankaccountmovement.accountId === condominiumArray[objCondominiumRowNumber].paymentRemoteHeatingAccountId) {
          if (Number(bankaccountmovement.date) >= Number(fromDate) && Number(bankaccountmovement.date) <= Number(toDate)) {

            rowNumber++;

            // check if the number is odd
            const colorClass =
              (rowNumber % 2 !== 0) ? "green" : "";
            html +=
              `
                <tr>
              `;

            // date
            const date = formatToNorDate(bankaccountmovement.date);
            // Date
            html +=
              `
                <td>${date}</td>
              `;

            // payment
            let payment =
              formatOreToKroner(bankaccountmovement.payment);
            html +=
              `
                <td>${payment}</td>
              `;

            // Number of kw/h
            let numberKWHour =
              formatOreToKroner(bankaccountmovement.numberKWHour);
            html +=
              `
                <td>${numberKWHour}</td>
              `;

            // Price per KWHour
            payment =
              Number(bankaccountmovement.payment);
            numberKWHour =
              Number(bankaccountmovement.numberKWHour);

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
            sumColumnPayment += Number(bankaccountmovement.payment);

            // KWHour
            sumColumnNumberKWHour += Number(bankaccountmovement.numberKWHour);
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
      document.querySelector('.div-grid-accountreport-remoteHeating').innerHTML =
        html;
    }
  }
}
