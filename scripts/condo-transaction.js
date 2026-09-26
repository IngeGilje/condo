// Maintain Bank account transaction

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objCondo = new Condo('condo');
const objAccounts = new Accounts('accounts');
const objBankAccounts = new BankAccounts('bankaccounts');
const objSuppliers = new Suppliers('suppliers');
const objCondominiums = new Condominiums('scondominiums');
const objUserBankAccounts = new UserBankAccounts('userbankaccounts');
const objProjects = new Projects('projects');
const objTransactions = new Transactions('transactions');

const enableChanges = (objTransactions.securityLevel > 5);
const applicationName = "condo-transaction";

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramTransactionId = Number(queryParameters.get("transactionId"));
const paramCondoId = Number(queryParameters.get("condoId"));
const paramAccountId = Number(queryParameters.get("accountId"));
const paramProjectId = Number(queryParameters.get("projectId"));
const paramFromDate = Number(queryParameters.get("fromDate"));
const paramToDate = Number(queryParameters.get("toDate"));
const paramAmount = Number(queryParameters.get("amount"));
const paramBackApplication = queryParameters.get("backApplication");

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objTransactions.checkServer()) {

    // Validate LogIn
    if ((objTransactions.condominiumId === 0) || (objTransactions.user === null)) {

      // LogIn is not valid
      const URL = (objTransactions.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show vertical menu
      let html = objTransactions.showMenu(objTransactions.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'Y';
      await objUsers.loadUsersTable(objTransactions.condominiumId, resident, objTransactions.nineNine);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objTransactions.condominiumId, fixedCost);
      await objBankAccounts.loadBankAccountsTable(objTransactions.condominiumId);
      await objUserBankAccounts.loadUserBankAccountsTable(objTransactions.condominiumId, objTransactions.nineNine, objTransactions.nineNine);
      await objCondo.loadCondoTable(objTransactions.condominiumId);
      await objCondominiums.loadCondominiumsTable();
      await objSuppliers.loadSuppliersTable(objTransactions.condominiumId);
      await objProjects.loadProjectsTable(objTransactions.condominiumId);
      const orderBy = 'date DESC, income DESC';
      await objTransactions.loadTransactionsTable(orderBy, objTransactions.condominiumId, 'N', objTransactions.nineNine, objTransactions.nineNine, objTransactions.nineNine, 0, 20190101, 20991231);

      // show filter
      let transactionId = 0;
      if (paramTransactionId === 0) {

        // Application is startet from menu
        objTransactions.getHighestTransactionId(objTransactions.condominiumId);
        transactionId = objTransactions.arrayTransactions.at(-1)?.transactionId ?? 0;

      } else {

        // Application is not startet from menu
        transactionId = paramTransactionId;
      }

      await objTransactions.loadTransactionsTable(orderBy, objTransactions.condominiumId, 'N', objTransactions.nineNine, objTransactions.nineNine, objTransactions.nineNine, 0, 20190101, 20991231);

      showFilter(transactionId);

      // Show bank account transaction
      showTransaction(transactionId);

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
  }
}

// Events
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains("filterTransactionId")) {

      const transactionId = Number(document.querySelector('.filterTransactionId').value);
      showTransaction(transactionId);
    };
  });

  // return to bank account transactions
  document.addEventListener('click', async (event) => {
    //if ([...event.target.classList].some(cls => cls.startsWith('back'))) {
    if (event.target.classList.contains("back")) {

      let URL = (objTransactions.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}${paramBackApplication}?transactionId=${paramTransactionId}&condoId=${paramCondoId}&accountId=${paramAccountId}&projectId=${paramProjectId}&fromDate=${paramFromDate}&toDate=${paramToDate}&amount=${paramAmount}&backApplication=${paramBackApplication}`;
      window.location.href = URL;
    };
  });

  // Insert a condominiums row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // update a bankaccounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const transactionId = Number(document.querySelector(".filterTransactionId").value);
      updateTransactionRow(transactionId);
    };
  });

  // Delete a transactions row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      let transactionId = Number(document.querySelector(".filterTransactionId").value);
      await deleteTransactionsRow(transactionId);
    };
  });

  /*
  // Show bank voucher
  document.addEventListener('click', async (event) => {
    //if ([...event.target.classList].some(cls => cls.startsWith('voucher'))) {
    if (event.target.classList.contains("voucher")) {

       let URL = (objTransactions.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      const condoId = Number(document.querySelector('.condoId').value);
      const accountId = Number(document.querySelector('.accountId').value);
      URL = `${URL}condo-voucher.html?transactionId=${transactionId}&condoId=${condoId}&accountId=${accountId}`;
      window.location.href = URL;
    };
  });
  */

  // Edit transaction
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('edit'))) {

      const arrayPrefixes = ['edit'];

      // Find the first matching class
      let className = arrayPrefixes
        .map(prefix => objTransactions.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let transactionId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        transactionId = Number(className.slice(prefix.length));
      }

      showTransaction(transactionId);
    }
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let URL = (objTransactions.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-login.html`;
      window.location.href = URL;
    };
  });
}

// Show filter
function showFilter(transactionId) {

  // Start filter
  let html = startBoxFilter("Bilagsnummer");

  // Show transactions
  html += objTransactions.showSelectedTransactionsNew("filterTransactionId", transactionId, '', '', true);

  // End filter
  html += endBoxFilter();

  document.querySelector(".showFilter").innerHTML = html;
}

// Show bank account transaction
function showTransaction(transactionId) {

  // row number bank account transaction
  const rowNumberTransaction = objTransactions.arrayTransactions.findIndex(transaction => transaction.transactionId === transactionId);

  let html = startGrid('Transaksjonsdetaljer');

  // Date
  /*
  let transactionDate = (rowNumberTransaction === -1)
    ? ''
    : objTransactions.arrayTransactions[rowNumberTransaction].date;
  */
  let transactionDate = objTransactions.arrayTransactions[rowNumberTransaction]?.date ?? 0;
  transactionDate = formatNumberToISODate(transactionDate);
  html += inputDate('transactionDate', 'Dato', transactionDate, enableChanges);
  html += "<div></div>";
  //html += "<div></div>";

  // Condo
  /*
  let condoId = (rowNumberTransaction === -1)
    ? ''
    : objTransactions.arrayTransactions[rowNumberTransaction].condoId;
  */
  const condoId = objTransactions.arrayTransactions[rowNumberTransaction]?.condoId ?? 0;
  html += objCondo.showSelectedCondosNew('condoId', 'Leilighet', condoId, 'Velg leilighet', '', enableChanges);

  // Account
  /*
  let accountId = (rowNumberTransaction === -1)
    ? ''
    : objTransactions.arrayTransactions[rowNumberTransaction].accountId;
  */
  const accountId = objTransactions.arrayTransactions[rowNumberTransaction]?.accountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('accountId', 'Konto', accountId, 'Velg konto', '', enableChanges);

  // project
  /*
  let projectId = (rowNumberTransaction === -1)
    ? ''
    : objTransactions.arrayTransactions[rowNumberTransaction].projectId;
  */
  const projectId = objTransactions.arrayTransactions[rowNumberTransaction]?.projectId ?? 0;
  html += objProjects.showSelectedProjectsNew('projectId', 'Prosjekt', projectId, 'Velg prosjekt', '', enableChanges);

  // income
  /*
  let income = (rowNumberTransaction === -1)
    ? ''
    : objTransactions.arrayTransactions[rowNumberTransaction].income;
  */
  let income = objTransactions.arrayTransactions[rowNumberTransaction]?.income ?? '';
  income = formatNumberToNorAmount(income);
  //html += showTextNew('Inntekt', 'income', income, enableChanges, "Inntekt");
  html += inputText('income', 'Inntekt', income, 11, enableChanges);

  // payment
  /*
  let payment = (rowNumberTransaction === -1)
    ? "0"
    : objTransactions.arrayTransactions[rowNumberTransaction].payment;
  */
  let payment = objTransactions.arrayTransactions[rowNumberTransaction]?.payment ?? 0;
  payment = formatNumberToNorAmount(payment);
  //html += showTextNew('Betaling', 'payment', payment, enableChanges, "Betaling");
  html += inputText('payment', 'Betaling', payment, 11, enableChanges);

  // kilowattHour
  /*
  let kilowattHour = (rowNumberTransaction === -1)
    ? "0"
    : objTransactions.arrayTransactions[rowNumberTransaction].kilowattHour;
  */
  let kilowattHour = objTransactions.arrayTransactions[rowNumberTransaction]?.kilowattHour ?? '';
  kilowattHour = formatNumberToNorAmount(kilowattHour);
  //html += showTextNew('KilowatTimer', 'kilowattHour', kilowattHour, enableChanges, "KilowatTimer");
  html += inputText('kilowattHour', 'KilowatTimer', kilowattHour, 11, enableChanges);

  // Text
  /*
  let text = (rowNumberTransaction === -1)
    ? ''
    : objTransactions.arrayTransactions[rowNumberTransaction].text;
  */
  const text = objTransactions.arrayTransactions[rowNumberTransaction]?.text ?? '';
  //html += showTextNew('Tekst', 'text', text, enableChanges, "Tekst");
  //html += inputWideText(  'text','Tekst', text, 2, enableChanges);
  html += inputGridWideText('text', 'Tekst', text, 255, 2)

  html += endGrid();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update secondary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");

    // check for return back to an application
    if (paramBackApplication) {

      html += inputButton("back secondary", "Tilbake", "button");
    }
    html += inputButton("delete danger", "Slett", "button");

    // End buttons
    html += endButtons();
  }
  document.querySelector('.showTransaction').innerHTML = html;
}

// update transactions row
async function updateTransactionRow(transactionId) {

  transactionId = Number(transactionId);
  const rowNumberTransaction = objTransactions.arrayTransactions.findIndex(bankTransaction => bankTransaction.transactionId === transactionId);

  // transaction Date
  className = '.transactionDate';
  let transactionDate = document.querySelector(className).value;
  transactionDate = formatISODateToNumber(transactionDate);
  className = "transactionDate";
  const validDate = validateIntervalNew(className, 'Ugyldig Dato', transactionDate, 20150101, 20991231);

  // accountId
  className = '.accountId';
  let accountId = Number(document.querySelector(className).value);
  className = 'accountId';
  const validAccountId = validateIntervalNew(className, 'Ugyldig konto', accountId, 1, objTransactions.nineNine);

  // condoId
  className = `.condoId`;
  let condoId = Number(document.querySelector(className).value);
  className = `condoId`;
  const validCondoId = validateIntervalNew(className, 'Ugyldig Leilighet', condoId, 0, objTransactions.nineNine);

  // projectId 
  className = `.projectId`;
  let projectId = Number(document.querySelector(className).value);
  className = `projectId`;
  const validProjectId = validateIntervalNew(className, 'Ugyldig prosjekt', projectId, 0, objTransactions.nineNine);

  // income
  className = `.income`;
  let income = Number(formatNorAmountToNumber(document.querySelector(className).value));
  className = `income`;
  const validIncome = validateIntervalNew(className, 'Ugyldig inntekt', income, objTransactions.minusNineNine, objTransactions.nineNine);

  // payment
  className = `.payment`;
  let payment = Number(formatNorAmountToNumber(document.querySelector(className).value));
  className = `payment`;
  const validPayment = validateIntervalNew(className, 'Ugyldig utgift', payment, objTransactions.minusNineNine, objTransactions.nineNine);

  // kilowattHour
  className = `.kilowattHour`;
  const kilowattHour = Number(formatNorAmountToNumber(document.querySelector(className).value));
  className = `kilowattHour`;
  const validNumberKWHour = validateIntervalNew(className, 'Ugyldig kilowattime', kilowattHour, 0, objTransactions.nineNine);

  // text
  className = `.text`;
  const text = document.querySelector(className).value;
  className = `text`;
  const validText = validateTextNew(className, 'Ugyldig tekst', text, 3, 255);

  // Validate transactions columns
  if (validDate && validCondoId && validAccountId && validProjectId
    && validIncome && validPayment && validNumberKWHour && validText) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the transactions row exist
    if (rowNumberTransaction !== -1) {

      // update the transactions row
      await objTransactions.updateTransactionsTable(transactionId, objTransactions.condominiumId, objTransactions.user, condoId, accountId, projectId, income, payment, kilowattHour, transactionDate, text);
    } else {

      // insert transactions row
      await objTransactions.insertTransactionsTable(objTransactions.condominiumId, objTransactions.user, condoId, accountId, projectId, income, payment, kilowattHour, transactionDate, text, 'N');
      await objAccounts.getHighestAccountId(objAccounts.condominiumId);
      await objTransactions.getHighestTransactionId(objTransactions.condominiumId);
      transactionId = objTransactions.arrayTransactions[0].transactionId;
    }

    const orderBy = 'date DESC, income DESC';
    await objTransactions.loadTransactionsTable(orderBy, objTransactions.condominiumId, 'N', objTransactions.nineNine, objTransactions.nineNine, objTransactions.nineNine, 0, 20190101, 20291231);

    if (enableChanges) {
      disableButton('delete', false);
    }

    removeMessage();

    // Show filter
    showFilter(transactionId);

    // Show transaction
    showTransaction(transactionId);
  }
}

function resetValues() {

  // Filter values
  // transaction Id
  document.querySelector(".filterTransactionId").value = 0;

  // date
  document.querySelector('.transactionDate').value = '';

  // condo Id
  document.querySelector('.condoId').value = 0;

  // account Id
  document.querySelector('.accountId').value = 0;

  // project Id
  document.querySelector('.projectId').value = 0;

  // income
  document.querySelector('.income').value = '';

  // payment
  document.querySelector('.payment').value = '';

  // kilowattHour
  document.querySelector('.kilowattHour').value = '';

  // text
  document.querySelector('.text').value = '';

  // Buttons
  if (enableChanges) {

    disableButton('delete', true);
  }
}

// Delete transactions row
async function deleteTransactionsRow(transactionId) {

  // Check if transactions row exist
  const rowNumberTransactions = objTransactions.arrayTransactions.findIndex(transaction => transaction.transactionId === transactionId);
  if (rowNumberTransactions !== -1) {

    // delete transactions row
    await objTransactions.deleteTransactionsTable(transactionId, objTransactions.user);
    await objTransactions.getHighestTransactionId(objTransactions.condominiumId);

    //transactionId = objTransactions.arrayTransactions[0].transactionId;
    // Check for empty array
    transactionId = 0;
    if (objTransactions.arrayTransactions.length > 0) transactionId = objTransactions.arrayTransactions[0].transactionId;
  }

  const orderBy = 'date DESC, income DESC';
  await objTransactions.loadTransactionsTable(orderBy, objTransactions.condominiumId, 'N', objTransactions.nineNine, objTransactions.nineNine, objTransactions.nineNine, 0, 20190101, 20991231);

  // Show filter
  showFilter(transactionId);

  // Show transaction
  showTransaction(transactionId);
}
