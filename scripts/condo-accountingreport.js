// Search for amount movements

// Activate objects
const objUser = new User('user');
const objBudget = new Budget('budget');
const objAccount = new Account('account');
const objBankAccountMovement = new BankAccountMovement('bankaccountmovement');
const objAccountingReport = new AccountingReport('accountingreport');

testMode();

let isEventsCreated = false;

objAccountingReport.menu();
objAccountingReport.markSelectedMenu('Regnskapsrapport');

let socket =
  connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  showLoginError('condo-login');
} else {

  // Send a message to the server
  socket.onopen = () => {

    // Sends a request to the server to get all users
    const SQLquery =
      `
        SELECT * FROM user
        ORDER BY userId;
      `;
    socket.send(SQLquery);
  };

  // Handle incoming messages from server
  socket.onmessage = (event) => {

    let message = event.data;

    // Create user array including objets
    if (message.includes('"tableName":"user"')) {

      console.log('userTable');

      // user array including objects with user information
      userArray = JSON.parse(message);

      // Sends a request to the server to get all condos
      const SQLquery =
        `
          SELECT * FROM bankaccountmovement
          ORDER BY bankaccountmovementId;
        `;
      socket.send(SQLquery);
    }

    // Create bank account movement array including objets
    if (message.includes('"tableName":"bankaccountmovement"')) {

      console.log('bankaccountmovementTable');

      // user array including objects with user information
      bankAccountMovementArray = JSON.parse(message);

      // Sends a request to the server to get all condos
      const SQLquery =
        `
          SELECT * FROM account
          ORDER BY accountId;
        `;
      socket.send(SQLquery);
    }

    // Create account array including objets
    if (message.includes('"tableName":"account"')) {

      console.log('accountTable');

      // array including objects with account information
      accountArray = JSON.parse(message);

      // Sends a request to the server to get all budgets
      const SQLquery =
        `
          SELECT * FROM budget
          ORDER BY budgetId;
        `;
      socket.send(SQLquery);
    }

    // Create bank account movements array including objets
    if (message.includes('"tableName":"budget"')) {

      // budget table
      console.log('budgetTable');

      // array including objects with budget information
      budgetArray = JSON.parse(message);

      // Show leading text
      showLeadingText();

      // Make events
      if (!isEventsCreated) {
        createEvents();
        isEventsCreated = true;
      }
    }

    // Check for update, delete ...
    if (message.includes('"affectedRows"')) {
      console.log('affectedRows');
    }
  };

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

  // Start search
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-accountingreport-search')) {

      // Show all values for payment
      showValues();
    };
  });
}

// Show leading text for payment
function showLeadingText() {

  // Show from date
  objAccountingReport.showInput('accountingreport-fromDate', 'Fra dato', 10, 'mm.dd.åååå');
  document.querySelector('.input-accountingreport-fromDate').value =
    '01.01.2024';

  // Show to date
  objAccountingReport.showInput('accountingreport-toDate', 'Til dato', 10, 'mm.dd.åååå');
  document.querySelector('.input-accountingreport-toDate').value =
    getCurrentDate();

  // show start search button
  objAccountingReport.showButton('accountingreport-search', 'Start søk');
}

// Show values for due and income for selected condo
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
      if (account.accountId > 1) {

        rowNumber++;

        // check if the number is odd
        const colorClass =
          (rowNumber % 2 !== 0) ? "green" : "";

        accountName =
          truncateText(account.name, 'div-accountingreport-columnAccountName');
        htmlColumnAccountName +=
          `
            <div 
              class="rightCell ${colorClass}"
            >
              ${accountName}
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
        let budgetAmount = 0;
        const objBudgetRowNumber =
          budgetArray.findIndex(budget => budget.accountId === account.accountId);
        if (objBudgetRowNumber !== -1) {
          budgetAmount =
            budgetArray[objBudgetRowNumber].amount;
        }
        budgetAmount =
          formatOreToKroner(String(budgetAmount));

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
          formatKronerToOre(accountAmount);
        budgetAmount =
          formatKronerToOre(budgetAmount);
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

    document.querySelector('.div-accountingreport-columnAccountName').innerHTML =
      htmlColumnAccountName;
    document.querySelector('.div-accountingreport-columnBankAccountMovementAmount').innerHTML =
      htmlColumnBankAccountMovementAmount;
    document.querySelector('.div-accountingreport-columnBudgetAmount').innerHTML =
      htmlColumnBudgetAmount;
    document.querySelector('.div-accountingreport-columnDeviation').innerHTML =
      htmlColumnDeviation;
  }
}

// Check for valid filter values
function validateValues() {

  let fromDate = document.querySelector('.input-accountingreport-fromDate').value;
  const validFromDate = validateNorDate(fromDate, 'accountingreport-fromDate', 'Fra dato');

  let toDate = document.querySelector('.input-accountingreport-toDate').value;
  const validToDate = validateNorDate(toDate, 'accountingreport-toDate', 'Fra dato');

  // Check date interval
  fromDate = Number(convertDateToISOFormat(fromDate));
  toDate = Number(convertDateToISOFormat(toDate));

  validDateInterval = (fromDate <= toDate) ? true : false;

  fromDate =
    formatToNorDate(fromDate);
  toDate =
    formatToNorDate(toDate);


  /*
  if (toDate !== '') {
    // Check to date dd.mm.yyyy
    if (!validateEuroDateFormat(toDate)) {
      document.querySelector('.label-accountingreport-fromDate').outerHTML =
        "<div class='label-accountingreport-fromDate-red'>Format dd.mm.åååå</div>";
      validValues = false;
    }
  }
  */

  if (validFromDate && validToDate && validDateInterval) {

    if (fromDate !== '' && toDate !== '') {
      const flipedFromDate = convertDateToISOFormat(fromDate);
      const flipedToDate = convertDateToISOFormat(toDate);

      if (flipedFromDate > flipedToDate) {
        document.querySelector('.label-accountingreport-fromDate').outerHTML =
          "<div class='label-accountingreport-fromDate-red label-accountingreport-fromDate-red'>Dato er feil</div>";
        validValues = false;
      }
    }
  }

  return (validFromDate && validToDate && validDateInterval) ? true : false;
}

// Accumulate all bank account movement for specified account id
function getTotalMovementsBankAccount(accountId) {

  let totalAccountAmount = 0;
  let totalPaymentAmount = 0;

  let fromDate =
    document.querySelector('.input-accountingreport-fromDate').value;

  fromDate =
    Number(convertDateToISOFormat(fromDate));

  let toDate =
    document.querySelector('.input-accountingreport-toDate').value;
  toDate =
    Number(convertDateToISOFormat(toDate));

  bankAccountMovementArray.forEach((bankAccountMovement) => {

    if (Number(bankAccountMovement.date) >= fromDate
      && (Number(bankAccountMovement.date) <= toDate)) {

      if (bankAccountMovement.accountId === accountId) {

        totalAccountAmount +=
          Number(bankAccountMovement.income);
        totalPaymentAmount +=
          Number(bankAccountMovement.payment);
      }
    }
  })

  return totalAccountAmount;
}