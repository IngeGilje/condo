// Search for amount movements

// Activate objects
const today =
  new Date();
const objUser =
  new User('user');
const objBudget =
  new Budget('budget');
const objAccount =
  new Account('account');
const objBankAccountMovement =
  new BankAccountMovement('bankaccountmovement');
const objAccountReport =
  new AccountReport('accountreport');

testMode();

// Redirect application after 2 hours
setTimeout(() => {
  window.location.href = 'http://localhost/condo/condo-login.html'
}, 1 * 60 * 60 * 1000);

let isEventsCreated

objAccountReport.menu();
objAccountReport.markSelectedMenu('Regnskapsrapport');

let socket;
socket =
  connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo/condo-login.html';
} else {

  let SQLquery;

  // Send a requests to the server
  socket.onopen = () => {

    // Sends a request to the server to get accounts
    SQLquery =
      `
        SELECT * FROM account
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY accountId;
      `;
    updateMySql(SQLquery, 'account', 'SELECT');

    // Sends a request to the server to get users
    SQLquery =
      `
        SELECT * FROM user
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY userId;
      `;
    updateMySql(SQLquery, 'user', 'SELECT');

    SQLquery =
      `
        SELECT * FROM budget
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY budgetId;
      `;
    updateMySql(SQLquery, 'budget', 'SELECT');

    // Sends a request to the server to get bank account movements
    SQLquery =
      `
        SELECT * FROM bankaccountmovement
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY bankAccountMovementId;
      `;
    updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
  };

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
          break;

        case 'account':

          // account table
          console.log('accountTable');

          accountArray =
            objInfo.tableArray;
          break;

        case 'budget':

          // budget table
          console.log('budget');

          budgetArray =
            objInfo.tableArray;
          break;

        case 'bankaccountmovement':

          // budget table
          console.log('bankaccountmovementTable');

          // array including objects with budget information
          bankAccountMovementArray =
            objInfo.tableArray;

          // Show leading text
          showLeadingText();

          // Show all bank account movements
          showValues();

          // Make events
          isEventsCreated = (isEventsCreated) ? true : condominiumEvents();
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
              ORDER BY budgetId;
            `;
          updateMySql(SQLquery, 'budget', 'SELECT');
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
}

// Make budget events
function createEvents() {

  // from date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-accountreport-fromDate')) {

      // Show selected budgets
      getSelectedBudgets();

      // Show selected bank account movements
      getSelectedBankAccountMovement();
    };
  });

  // to date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-accountreport-toDate')) {

      // Show selected budgets
      getSelectedBudgets();

      // Show selected bank account movements
      getSelectedBankAccountMovement();
    };
  });

  // budget year
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-accountreport-year')) {

      // Show selected budgets
      getSelectedBudgets();

      // Show selected bank account movements
      getSelectedBankAccountMovement();
    };
  });
}

// Show leading text
function showLeadingText() {

  // from date
  if (!isClassDefined('input-accountreport-fromDate')) {

    objAccountReport.showInput('accountreport-fromDate', 'Fra dato', 10, 'mm.dd.åååå');
    date =
      document.querySelector('.input-accountreport-fromDate').value;
    if (!validateEuroDateFormat(date)) {

      // From date is not ok
      const year =
        String(today.getFullYear());
      document.querySelector('.input-accountreport-fromDate').value =
        "01.01." + year;
    }
  }

  // To date
  if (!isClassDefined('input-accountreport-toDate')) {
    objAccountReport.showInput('accountreport-toDate', 'Til dato', 10, 'mm.dd.åååå');
    date =
      document.querySelector('.input-accountreport-toDate').value;
    if (!validateEuroDateFormat(date)) {

      // To date is not ok
      document.querySelector('.input-accountreport-toDate').value =
        getCurrentDate();
    }
  }

  // Show selected years
  if (!isClassDefined('select-accountreport-year')) {

    // Show years
    const year =
      today.getFullYear();
    objBudget.selectNumber('accountreport-year', 2020, 2030, year, 'År');
  }
}

// Show values for due and income for selected budget
function showValues() {

  // check for valid filter
  if (validateValues()) {

    // Header due
    let htmlColumnAccountName =
      '<div class="columnHeaderRight">Konto</div><br>';
    let htmlColumnBankAccountMovementAmount =
      '<div class="columnHeaderRight">Beløp</div><br>';
    let htmlColumnBudgetAmount =
      '<div class="columnHeaderRight">Budsjett</div><br>';
    let htmlColumnDeviation =
      '<div class="columnHeaderRight">Avvik</div><br>';

    let totalBudgetAmount = 0;
    let totalAccountAmount = 0;
    let rowNumber = 0;

    accountArray.forEach((account) => {
      if (account.accountId >= 0) {

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

        // Budget Amount
        const year =
          Number(document.querySelector('.select-accountreport-year').value);
        let budgetAmount =
          getBudgetAmount(account.accountId, year);
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
      }
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

    document.querySelector('.div-accountreport-columnAccountName').innerHTML =
      htmlColumnAccountName;
    document.querySelector('.div-accountreport-columnBankAccountMovementAmount').innerHTML =
      htmlColumnBankAccountMovementAmount;
    document.querySelector('.div-accountreport-columnBudgetAmount').innerHTML =
      htmlColumnBudgetAmount;
    document.querySelector('.div-accountreport-columnDeviation').innerHTML =
      htmlColumnDeviation;
  }
}

// Check for valid filter values
function validateValues() {

  let fromDate =
    document.querySelector('.input-accountreport-fromDate').value;
  const validFromDate =
    validateNorDate(fromDate, 'accountreport-fromDate', 'Fra dato');

  let toDate =
    document.querySelector('.input-accountreport-toDate').value;
  const validToDate =
    validateNorDate(toDate, 'accountreport-toDate', 'Fra dato');

  let year =
    Number(document.querySelector('.select-accountreport-year').value);
  const validYear =
    validateNumber(year, 2020, 2030, 'accountreport-year', 'Budsjettår');

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
        document.querySelector('.label-accountreport-fromDate').outerHTML =
          "<div class='label-accountreport-fromDate-red label-accountreport-fromDate-red'>Dato er feil</div>";
        validValues = false;
      }
    }
  }

  return (validYear && validFromDate && validToDate && validDateInterval) ? true : false;
}

// Accumulate all bank account movement for specified account id
function getTotalMovementsBankAccount(accountId) {

  let accountAmount = 0;

  let fromDate =
    document.querySelector('.input-accountreport-fromDate').value;

  fromDate =
    Number(convertDateToISOFormat(fromDate));

  let toDate =
    document.querySelector('.input-accountreport-toDate').value;
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

  amount =
    '';

  // Budget Amount
  const objBudgetRowNumber =
    budgetArray.findIndex(budget => budget.accountId === accountId);
  if (objBudgetRowNumber !== -1) {

    const budgetYear =
      Number(budgetArray[objBudgetRowNumber].year);
    if (budgetYear === year) {
      amount =
        budgetArray[objBudgetRowNumber].amount;
    }
  }
  return formatOreToKroner(amount);
}

// Get selected budgets
function getSelectedBudgets() {

  const year =
    Number(document.querySelector('.select-accountreport-year').value);

  const fromDate =
    convertDateToISOFormat(document.querySelector('.input-accountreport-fromDate').value);
  const toDate =
    convertDateToISOFormat(document.querySelector('.input-accountreport-toDate').value);

  // Sends a request to the server to get selected bank account movements
  SQLquery =
    `
      SELECT * FROM budget
      WHERE condominiumId = ${objUserPassword.condominiumId}
      AND year = '${year}';
    `;
  console.log(SQLquery);
  updateMySql(SQLquery, 'budget', 'SELECT');
}

// Get selected bank account movement 
function getSelectedBankAccountMovement() {

  const year =
    Number(document.querySelector('.select-accountreport-year').value);

  const fromDate =
    Number(convertDateToISOFormat(document.querySelector('.input-accountreport-fromDate').value));
  const toDate =
    Number(convertDateToISOFormat(document.querySelector('.input-accountreport-toDate').value));

  // Sends a request to the server to get selected bank account movements
  SQLquery =
    `
      SELECT * FROM bankaccountmovement
      WHERE condominiumId = ${objUserPassword.condominiumId}
      AND date BETWEEN ${fromDate} AND ${toDate};
    `;
  console.log(SQLquery);
  updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
}
