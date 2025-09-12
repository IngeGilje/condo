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
exitIfNoActivity();

let isEventsCreated

objAccountReport.menu();
objAccountReport.markSelectedMenu('Regnskapsrapport');

let socket;
socket =
  connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'http://localhost:8080/condo-login.html';
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
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY condominiumId;
      `;
    updateMySql(SQLquery, 'condominium', 'SELECT');
    condominiumArrayCreated =
      false;

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

          // Show leading text
          showLeadingText();

          // Show budget
          showBudget();

          // Show calculated income for next year
          showIncomeNextYear();

          // Show bank deposit
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
    if (event.target.classList.contains('input-accountreport-search-fromDate')) {

      // Show selected budgets
      getSelectedBudgets();

      // Show selected bank account movements
      getSelectedBankAccountMovement();
    };
  });

  // to date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-accountreport-search-toDate')) {

      // Show selected budgets
      getSelectedBudgets();

      // Show selected bank account movements
      getSelectedBankAccountMovement();
    };
  });

  // budget year
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-accountreport-search-fiscalYear')) {

      // Show selected budgets
      getSelectedBudgets();

      // Show selected bank account movements
      getSelectedBankAccountMovement();
    };
  });

  // Price per squaremeter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-accountreport-search-priceSquareMeter')) {

      let priceSquareMeter = document.querySelector('.input-accountreport-search-priceSquareMeter').value;
      priceSquareMeter = formatKronerToOre(priceSquareMeter);
      document.querySelector('.input-accountreport-search-priceSquareMeter').value = formatOreToKroner(priceSquareMeter);;

      // Show selected budgets
      getSelectedBudgets();

      // Show selected bank account movements
      getSelectedBankAccountMovement();
    };
  });

  return true;
}

// Show leading text
function showLeadingText() {

  // from date
  if (!isClassDefined('input-accountreport-search-fromDate')) {

    objAccountReport.showInput('accountreport-search-fromDate', 'Fra dato', 10, 'mm.dd.åååå');
    date =
      document.querySelector('.input-accountreport-search-fromDate').value;
    if (!validateEuroDateFormat(date)) {

      // From date is not ok
      const year =
        String(today.getFullYear());
      document.querySelector('.input-accountreport-search-fromDate').value =
        "01.01." + year;
    }
  }

  // To date
  if (!isClassDefined('input-accountreport-search-toDate')) {
    objAccountReport.showInput('accountreport-search-toDate', 'Til dato', 10, 'mm.dd.åååå');
    date =
      document.querySelector('.input-accountreport-search-toDate').value;
    if (!validateEuroDateFormat(date)) {

      // To date is not ok
      document.querySelector('.input-accountreport-search-toDate').value =
        getCurrentDate();
    }
  }

  // Show selected fiscal year
  if (!isClassDefined('select-accountreport-search-fiscalYear')) {

    // Show years
    const year =
      today.getFullYear();
    objBudget.selectNumber('accountreport-search-fiscalYear', 2020, 2030, year, 'Regnskapsår');
  }

  // Show selected budget year
  if (!isClassDefined('select-accountreport-search-budgetYear')) {

    // Show years
    const year =
      today.getFullYear() + 1;
    objBudget.selectNumber('accountreport-search-budgetYear', 2020, 2030, year, 'Budsjettår');
  }

  // Show price per square meter
  if (!isClassDefined('input-accountreport-search-priceSquareMeter')) {

    objAccountReport.showInput('accountreport-search-priceSquareMeter', 'Kvadratmeterpris', 8, '');
    document.querySelector('.input-accountreport-search-priceSquareMeter').value = '30,00';
  }

  return true;
}

// Show budgets
function showBudget() {

  // check for valid filter
  if (validateValues()) {

    // Header budget
    let htmlColumnAccountName =
      '<div class="columnHeaderRight">Konto</div><br>';
    let htmlColumnCostType =
      '<div class="columnHeaderRight">K.type</div><br>';
    const fiscalYear = document.querySelector('.select-accountreport-search-fiscalYear').value;
    let htmlColumnBankAccountMovementAmount =
      `<div class="columnHeaderRight">Beløp ${fiscalYear}</div><br>`;
    let htmlColumnBudgetAmount =
      `<div class="columnHeaderRight">Budsjett ${fiscalYear}</div><br>`;
    let htmlColumnDeviation =
      '<div class="columnHeaderRight">Avvik</div><br>';

    let totalBudgetAmount = 0;
    let totalAccountAmount = 0;
    let rowNumber = 0;

    accountArray.forEach((account) => {

      rowNumber++;

      // check if the number is odd
      const colorClass =
        (rowNumber % 2 !== 0) ? "green" : "";

      //accountName =
      htmlColumnAccountName +=
        `
          <div 
            class="rightCell ${colorClass} one-line"
          >
            ${account.name}
          </div>
        `;

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

      htmlColumnCostType +=
        `
          <div 
            class="rightCell ${colorClass} one-line"
          >
            ${costType}
          </div>
        `;

      // bank account movement for selected account
      let accountAmount =
        getTotalMovementsBankAccount(account.accountId);
      accountAmount =
        formatOreToKroner(accountAmount);
      htmlColumnBankAccountMovementAmount +=
        `
          <div 
            class="rightCell ${colorClass}"
          >
            ${accountAmount}
          </div>
        `;

      // Budget Amount for fiscal year
      const fiscalYear = Number(document.querySelector('.select-accountreport-search-fiscalYear').value);
      let budgetAmount = getBudgetAmount(account.accountId, fiscalYear);
      htmlColumnBudgetAmount +=
        `
          <div 
            class="rightCell ${colorClass}"
          >
            ${budgetAmount}
          </div>
        `;

      // Deviation
      accountAmount =
        Number(formatKronerToOre(accountAmount));
      budgetAmount =
        Number(formatKronerToOre(budgetAmount));
      let deviation =
        accountAmount - budgetAmount;
      deviation =
        formatOreToKroner(String(deviation));
      htmlColumnDeviation +=
        `
          <div 
            class="rightCell ${colorClass}">
            ${deviation}
          </div>
        `;

      // Accomulate
      totalAccountAmount +=
        Number(accountAmount);

      totalBudgetAmount +=
        Number(budgetAmount);
    });

    // Show total line
    htmlColumnAccountName +=
      `
        <div
          class="sumCellRight"
        >
          Sum
        </div>
      `;

    totalAccountAmount =
      formatOreToKroner(totalAccountAmount);

    htmlColumnBankAccountMovementAmount +=
      `
        <div 
          class="sumCellRight"
        >
          ${totalAccountAmount}
        </div>
      `;

    totalBudgetAmount =
      formatOreToKroner(String(totalBudgetAmount));

    htmlColumnBudgetAmount +=
      `
        <div 
          class="sumCellRight"
        >
          ${totalBudgetAmount}
        </div>
      `;

    totalAccountAmount =
      formatKronerToOre(totalAccountAmount);
    totalBudgetAmount =
      formatKronerToOre(totalBudgetAmount);
    let deviation =
      Number(totalAccountAmount) - Number(totalBudgetAmount);
    deviation =
      formatOreToKroner(String(deviation));

    htmlColumnDeviation +=
      `
        <div 
          class="sumCellRight"
        >
          ${deviation}
        </div>
      `;

    document.querySelector('.div-accountreport-accountName').innerHTML =
      htmlColumnAccountName;
    document.querySelector('.div-accountreport-costType').innerHTML =
      htmlColumnCostType;
    document.querySelector('.div-accountreport-amount').innerHTML =
      htmlColumnBankAccountMovementAmount;
    document.querySelector('.div-accountreport-budgetAmount').innerHTML =
      htmlColumnBudgetAmount;
    document.querySelector('.div-accountreport-deviation').innerHTML =
      htmlColumnDeviation;
  }
}

// Check for valid filter values
function validateValues() {

  let fromDate =
    document.querySelector('.input-accountreport-search-fromDate').value;
  const validFromDate =
    validateNorDate(fromDate, 'accountreport-search-fromDate', 'Fra dato');

  let toDate =
    document.querySelector('.input-accountreport-search-toDate').value;
  const validToDate =
    validateNorDate(toDate, 'accountreport-search-toDate', 'Fra dato');

  let fiscalYear =
    Number(document.querySelector('.select-accountreport-search-fiscalYear').value);
  const validFiscalYear =
    validateNumber(year, 2020, 2030, 'accountreport-search-fiscalYear', 'Regnskapsår');

  let budgetYear =
    Number(document.querySelector('.select-accountreport-search-budgetYear').value);
  const validBudgetYear =
    validateNumber(year, 2020, 2030, 'accountreport-search-budgetYear', 'Budsjettår');

  // Check date interval
  fromDate = Number(convertDateToISOFormat(fromDate));
  toDate = Number(convertDateToISOFormat(toDate));

  validDateInterval = (fromDate <= toDate) ? true : false;

  fromDate =
    formatToNorDate(fromDate);
  toDate =
    formatToNorDate(toDate);

  if (validFromDate && validToDate && validDateInterval) {

    if (fromDate !== '' && toDate !== '') {
      const flipedFromDate = convertDateToISOFormat(fromDate);
      const flipedToDate = convertDateToISOFormat(toDate);

      if (flipedFromDate > flipedToDate) {
        document.querySelector('.label-accountreport-search-fromDate').outerHTML =
          "<div class='label-accountreport-search-fromDate-red label-accountreport-search-fromDate-red'>Dato er feil</div>";
        validValues = false;
      }
    }
  }

  return (validFiscalYear && validBudgetYear && validFromDate && validToDate && validDateInterval) ? true : false;
}

// Accumulate all bank account movement for specified account id
function getTotalMovementsBankAccount(accountId) {

  let accountAmount = 0;

  let fromDate =
    document.querySelector('.input-accountreport-search-fromDate').value;

  fromDate =
    Number(convertDateToISOFormat(fromDate));

  let toDate =
    document.querySelector('.input-accountreport-search-toDate').value;
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

// Get selected budgets
function getSelectedBudgets() {

  const fiscalYear = 
  Number(document.querySelector('.select-accountreport-search-fiscalYear').value);

  const budgetYear = 
  Number(document.querySelector('.select-accountreport-search-budgetYear').value);

  const fromDate = 
  convertDateToISOFormat(document.querySelector('.input-accountreport-search-fromDate').value);
  const toDate = 
  convertDateToISOFormat(document.querySelector('.input-accountreport-search-toDate').value);

  // Sends a request to the server to get selected bank account movements
  SQLquery =
    `
      SELECT * FROM budget
      WHERE condominiumId = ${objUserPassword.condominiumId}
        AND deleted <> 'Y'
      ORDER BY budgetId;
    `;
  console.log(SQLquery);
  updateMySql(SQLquery, 'budget', 'SELECT');
  budgetArrayCreated =
    false;
}

// Get selected bank account movement 
function getSelectedBankAccountMovement() {

  const fiscalYear =
    Number(document.querySelector('.select-accountreport-search-fiscalYear').value);

  const budgetYear =
    Number(document.querySelector('.select-accountreport-search-budgetYear').value);

  const fromDate =
    Number(convertDateToISOFormat(document.querySelector('.input-accountreport-search-fromDate').value));
  const toDate =
    Number(convertDateToISOFormat(document.querySelector('.input-accountreport-search-toDate').value));

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

// Show calculated income next year
function showIncomeNextYear() {

  // Get fixed costs per month
  let fromDate = document.querySelector('.input-accountreport-search-fromDate').value;
  fromDate = Number(convertDateToISOFormat(fromDate));
  let toDate = document.querySelector('.input-accountreport-search-toDate').value;
  toDate = Number(convertDateToISOFormat(toDate));
  let numFixedCost = Number(getFixedCost(fromDate, toDate));

  // 12 month and 7 condos
  let strFixedCost = String(Math.round(numFixedCost / 12 / 7) * (-1));

  // Remove øre
  strFixedCost = strFixedCost.slice(0, -2) + "00";
  numFixedCost = Number(strFixedCost);
  strFixedCost = formatOreToKroner(String(numFixedCost));

  // Header budget
  let htmlBudgetCondoId =
    '<div class="columnHeaderRight">Leilighet</div><br>';
  let htmlBudgetSquareMeters =
    '<div class="columnHeaderRight">Kvadratmeter</div><br>';
  let htmlBudFixedCosts =
    '<div class="columnHeaderRight">Faste kostnader</div><br>';
  let htmlCommonCostsMonth =
    '<div class="columnHeaderRight">Fellesk. måned</div><br>';
  let htmlCommonCostsYear =
    '<div class="columnHeaderRight">Fellesk. år</div><br>';

  let rowNumber = 0;
  let totalCommonCostsMonth = 0;
  let totalCommonCostsYear = 0;
  let totalSquareMeters = 0;
  let totalFixedCosts = 0;

  condoArray.forEach((condo) => {

    rowNumber++;

    // check if the number is odd
    const colorClass =
      (rowNumber % 2 !== 0) ? "green" : "";

    htmlBudgetCondoId +=
      `
        <div 
          class="rightCell ${colorClass} one-line"
        >
          ${condo.name}
        </div>
      `;

    // square meters
    let numSquareMeters = Number(condo.squareMeters);
    let strSquareMeters = formatOreToKroner(condo.squareMeters);
    htmlBudgetSquareMeters +=
      `
        <div 
          class="rightCell ${colorClass}"
        >
          ${strSquareMeters}
        </div>
      `;

    // Fixed costs
    htmlBudFixedCosts +=
      `
        <div 
          class="rightCell ${colorClass}"
        >
          ${strFixedCost}
        </div>
      `;

    // Common costs per month
    let priceSquareMeter = document.querySelector('.input-accountreport-search-priceSquareMeter').value;
    priceSquareMeter = Number(formatKronerToOre(priceSquareMeter));

    let numCommonCostsMonth = (priceSquareMeter * numSquareMeters) / 100;
    let strCommonCostsMonth = String(numCommonCostsMonth + numFixedCost);
    strCommonCostsMonth = formatOreToKroner(strCommonCostsMonth);

    htmlCommonCostsMonth +=
      `
        <div 
          class="rightCell ${colorClass}">
          ${strCommonCostsMonth}
        </div>
      `;

    // Common cost per Year
    let numCommonCostsYear = (numCommonCostsMonth + numFixedCost) * 12;
    let strCommonCostsYear = formatOreToKroner(String(numCommonCostsYear));
    htmlCommonCostsYear +=
      `
        <div 
          class="rightCell ${colorClass}"
        >
          ${strCommonCostsYear}
        </div>
      `;

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

  // Show sum
  // Leilighet

  // Square meter
  const strSquareMeters = formatOreToKroner(String(totalSquareMeters));
  htmlBudgetSquareMeters +=
    `
      <div 
        class="sumCellRight">
        ${strSquareMeters}
      </div>
    `;

  // Fixed costs
  strFixedCost = formatOreToKroner(String(totalFixedCosts));
  htmlBudFixedCosts +=
    `
      <div 
        class="sumCellRight"
      >
        ${strFixedCost}
      </div>
    `;

  // Common cost per month
  const strCommonCostsMonth = formatOreToKroner(String(totalCommonCostsMonth));
  htmlCommonCostsMonth +=
    `
      <div 
        class="sumCellRight"
      >
        ${strCommonCostsMonth}
      </div>
    `;

  // Common cost per year
  const strCommonCostsYear = formatOreToKroner(String(totalCommonCostsYear));
  htmlCommonCostsYear +=
    `
      <div 
        class="sumCellRight">
        ${strCommonCostsYear}
      </div>
    `;

  document.querySelector('.div-accountreport-budget-name').innerHTML =
    htmlBudgetCondoId;
  document.querySelector('.div-accountreport-budget-squareMeter').innerHTML =
    htmlBudgetSquareMeters;
  document.querySelector('.div-accountreport-budget-fixedCosts').innerHTML =
    htmlBudFixedCosts;
  document.querySelector('.div-accountreport-budget-commonCostsMonth').innerHTML =
    htmlCommonCostsMonth;
  document.querySelector('.div-accountreport-budget-commonCostsYear').innerHTML =
    htmlCommonCostsYear;
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

// Show current bankdeposit and estimated for next year
function showBankDeposit() {

  // Header bank deposit
  let htmlBankDepositText =
    '<div class="columnHeaderLeft">Tekst</div><br>';
  let htmlBankDepositDate =
    '<div class="columnHeaderRight">Dato</div><br>';
  let htmlBankDepositAmount =
    '<div class="columnHeaderRight">Beløp</div><br>';

  let rowNumber = 0;
  let accAmount = 0;

  rowNumber++;

  // check if the number is odd
  let colorClass =
    (rowNumber % 2 !== 0) ? "green" : "";

  // Text
  htmlBankDepositText +=
    `
      <div 
        class="leftCell ${colorClass} one-line"
      >
        Bankinnskudd
      </div>
    `;

  // Dato
  let closingBalanceDate = "";
  const objBankAccountRowNumber =
    bankAccountArray.findIndex(bankAccount => bankAccount.condominiumId === objUserPassword.condominiumId);
  if (objBankAccountRowNumber !== -1) {

    closingBalanceDate = (bankAccountArray[objBankAccountRowNumber].closingBalanceDate);
    closingBalanceDate = formatToNorDate(closingBalanceDate);
  }

  htmlBankDepositDate +=
    `
      <div 
        class="rightCell ${colorClass}"
      >
        ${closingBalanceDate}
      </div>
    `;

  // Bank deposit
  let bankDepositAmount = "";

  bankDepositAmount = (bankAccountArray[objBankAccountRowNumber].closingBalance);
  bankDepositAmount = formatOreToKroner(bankDepositAmount);

  htmlBankDepositAmount +=
    `
      <div 
        class="rightCell ${colorClass}"
      >
        ${bankDepositAmount}
      </div>
    `;

  accAmount += Number(formatKronerToOre(bankDepositAmount));

  // budget
  budgetArray.forEach((budget) => {

    const budgetYear = document.querySelector('.select-accountreport-search-budgetYear').value;
    if (Number(budget.year) === Number(budgetYear)) {

      if (Number(budget.amount) !== 0) {

        rowNumber++;

        // check if the number is odd
        colorClass =
          (rowNumber % 2 !== 0) ? "green" : "";

        // Text
        const objAccountRowNumber =
          accountArray.findIndex(account => account.accountId === budget.accountId);
        if (objAccountRowNumber !== -1) {

          const name =
            accountArray[objAccountRowNumber].name;
          htmlBankDepositText +=
            `
              <div 
                class="leftCell ${colorClass} one-line"
              >
                ${name}
              </div>
            `;

          // Dato
          htmlBankDepositDate +=
            `
              <div 
                class="rightCell ${colorClass}"
              >
                -
              </div>
            `;

          // budget amount
          let amount = Number(budget.amount);
          amount = formatOreToKroner(amount);

          htmlBankDepositAmount +=
            `
              <div 
                class="rightCell ${colorClass}"
              >
                ${amount}
              </div>
            `;

          // accumulate
          const numAmmount = Number(formatKronerToOre(amount));
          accAmount += numAmmount;
        }
      }
    }
  });

  // Calculated closining balance next year
  rowNumber++;

  // check if the number is odd
  colorClass =
    (rowNumber % 2 !== 0) ? "green" : "";

  // Text
  htmlBankDepositText +=
    `
      <div 
        class="leftCell ${colorClass} one-line"
      >
        Estimert bankinnskudd
      </div>
    `;

  // Dato
  closingBalanceDate = Number(bankAccountArray[objBankAccountRowNumber].closingBalanceDate);

  // Next year
  closingBalanceDate = closingBalanceDate + 10000;
  closingBalanceDate = formatToNorDate(String(closingBalanceDate));

  htmlBankDepositDate +=
    `
      <div 
        class="rightCell ${colorClass}"
      >
        ${closingBalanceDate}
      </div>
    `;

  // Bank deposit next year
  bankDepositAmount = formatOreToKroner(String(accAmount));

  htmlBankDepositAmount +=
    `
      <div 
        class="rightCell ${colorClass}"
      >
        ${bankDepositAmount}
      </div>
    `;

  document.querySelector('.div-accountreport-bankdeposit-text').innerHTML =
    htmlBankDepositText;
  document.querySelector('.div-accountreport-bankdeposit-date').innerHTML =
    htmlBankDepositDate;
  document.querySelector('.div-accountreport-bankdeposit-amount').innerHTML =
    htmlBankDepositAmount;
}