// Maintain Bank account transaction

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccounts = new Accounts('accounts');
const objBankAccount = new BankAccount('bankaccount');
const objSupplier = new Supplier('supplier');
const objCondominium = new Condominium('scondominium');
const objUserBankAccount = new UserBankAccount('userbankaccount');
const objProjects = new Projects('projects');
const objTransactions = new Transactions('transactions');
const objTransaction = new Transaction('transaction');

const enableChanges = (objTransaction.securityLevel > 5);
const applicationName = "condo-transaction";

const columnWidths = [175, 175, 175, 175, 175, 100];

const queryParameters = new URLSearchParams(window.location.search);
const paramTransactionId = Number(queryParameters.get("transactionId"));
const paramCondoId = Number(queryParameters.get("condoId"));
const paramAccountId = Number(queryParameters.get("accountId"));
const paramFromDate = Number(queryParameters.get("fromDate"));
const paramToDate = Number(queryParameters.get("toDate"));
const paramAmount = Number(queryParameters.get("amount"));

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objTransaction.checkServer()) {

    // Validate LogIn
    if ((objTransaction.condominiumId === 0) || (objTransaction.user === null)) {

      // LogIn is not valid
      const URL = (objTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = showHorizontalMenu(objTransaction.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show transaction menu
      html = showHorizontalMenu(objTransaction.arrayMenuTransaction);
      document.querySelector('.menuTransaction').innerHTML = html;
      objTransaction.markActivatedApplication(objTransaction.arrayMenuTransaction, applicationName);

      const resident = 'Y';
      await objUser.loadUsersTable(objTransaction.condominiumId, resident, objTransaction.nineNine);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objTransaction.condominiumId, fixedCost);
      await objBankAccount.loadBankAccountsTable(objTransaction.condominiumId, objTransaction.nineNine);
      await objUserBankAccount.loadUserBankAccountsTable(objTransaction.condominiumId, objTransaction.nineNine, objTransaction.nineNine);
      await objCondo.loadCondoTable(objTransaction.condominiumId, objTransaction.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objSupplier.loadSuppliersTable(objTransaction.condominiumId);
      await objProjects.loadProjectsTable(objTransaction.condominiumId);

      // Show header
      //showHeader();

      const orderBy = 'date DESC, income DESC';
      await objTransactions.loadTransactionsTable(orderBy, objTransaction.condominiumId, 'N', objTransaction.nineNine, objTransaction.nineNine, objTransaction.nineNine, 0, 20190101, 20991231);

      // show filter
      let transactionId = 0;
      if (paramTransactionId === 0) {

        objTransactions.getHighestTransactionId(objTransaction.condominiumId);
        transactionId = objTransactions.arrayTransactions.at(-1)?.transactionId ?? 0;
        const orderBy = 'date DESC, income DESC';
        await objTransactions.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, accountId, objTransaction.nineNine, 0, fromDate, toDate);
      } else {

      }

      showFilter(transactionId);

      // Show bank account transaction
      showTransaction(paramTransactionId);

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

    if ([...event.target.classList].some(cls => cls.startsWith('filterTransactionId'))) {

      // Show transactions after change of filter
      const deleted = 'N';

      const condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = formatISODateToNumber(fromDate);

      let toDate = document.querySelector('.filterToDate').value;
      toDate = formatISODateToNumber(toDate);

      const orderBy = 'date DESC, income DESC';
      await objTransactions.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, accountId, objTransaction.nineNine, 0, fromDate, toDate);

      // Select the 1. transaction
      let transactionId = 0;
      if (objTransactions.arrayTransactions.length > 0) transactionId = objTransactions.arrayTransactions[0].transactionId;
      if (objTransactions.arrayTransactions.length === 0) transactionId = 0;

      showTransaction(transactionId);
    };
  });

  // return to bank account transactions
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('back'))) {

      let URL = (objTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-transactions.html?transactionId=${paramTransactionId}&condoId=${paramCondoId}&accountId=${paramAccountId}&fromDate=${paramFromDate}&toDate=${paramToDate}&amount=${paramAmount}`;
      window.location.href = URL;
    };
  });

  // Insert a condominiums row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      resetValues();
    };
  });

  // update a bankaccounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const transactionId = Number(document.querySelector('.transactionId').value);
      updateTransactionRow(transactionId);
    };
  });

  // Delete a transactions row
  document.addEventListener('click', async (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

      const arrayPrefixes = ['delete'];

      await deleteTransactionRow();

      const amount = 0;
      const deleted = 'N';
      condoId = Number(document.querySelector('.condoId').value);
      accountId = Number(document.querySelector('.accountId').value);
      let fromDate = document.querySelector('.transactionDate').value;
      fromDate = Number(objTransaction.formatDateToNumber(fromDate));
      let toDate = document.querySelector('.transactionDate').value;
      toDate = Number(objTransaction.formatDateToNumber(toDate));
      const orderBy = 'date DESC, income DESC';
      await objTransactions.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, accountId, objTransaction.nineNine, amount, fromDate, toDate);

      showTransaction(transactionId);
    };
  });

  // Show bank voucher
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('voucher'))) {

      const arrayPrefixes = ['voucher'];

      let URL = (objTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      const condoId = Number(document.querySelector('.condoId').value);
      const accountId = Number(document.querySelector('.accountId').value)
      URL = `${URL}condo-voucher.html?transactionId=${transactionId}&condoId=${condoId}&accountId=${accountId}`;
      window.location.href = URL;
    };
  });

  // Edit transaction
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('edit'))) {

      const arrayPrefixes = ['edit'];

      // Find the first matching class
      let className = arrayPrefixes
        .map(prefix => objTransaction.getClassByPrefix(event.target, prefix))
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

      let URL = (objTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-login.html`;
      window.location.href = URL;
    };
  });
}

// Show filter
function showFilter(transactionId) {

  // Start frame
  let html = startFrame();

  // Show dues
  html += objTransactions.showSelectedTransactionsNew('Bilag', 'filterTransactionId', '', transactionId, '', '', true);
 
  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("Filter");
}

function resetValues() {

  // Filter values

  // transaction Id
  document.querySelector('.transactionId').value = 0;

  // date
  document.querySelector('.date').value = '';

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
  removeMessage();
  if (enableChanges) {
    disableButton('delete', true);
    disableButton('insert', true);
    disableButton('cancel', false);
    disableButton('filterTransactionId', true);
  }
}

// update transactions row
async function updateTransactionRow(transactionId) {

  transactionId = Number(transactionId);
  const rowNumberTransaction = objTransactions.arrayTransactions.findIndex(bankTransaction => bankTransaction.transactionId === transactionId);

  // transaction Date
  className = '.transactionDate';
  let transactionDate = document.querySelector(className).value;
  transactionDate = formatISODateToNumber(transactionDate);
  className = `date`;
  const validDate = validateInterval(className, '', 'Ugyldig dato', true, transactionDate, 20150101, 20991231);

  // accountId
  className = '.accountId';
  let accountId = Number(document.querySelector(className).value);
  className = 'accountId';
  const validAccountId = validateInterval(className, '', 'Ugyldig konto', true, accountId, 1, objTransaction.nineNine);

  // condoId
  className = `.condoId`;
  let condoId = Number(document.querySelector(className).value);
  className = `condoId`;
  const validCondoId = validateInterval(className, '', 'Ugyldig leilighet', true, condoId, 0, objTransaction.nineNine);

  // projectId 
  className = `.projectId`;
  let projectId = Number(document.querySelector(className).value);
  className = `projectId`;
  const validProjectId = validateInterval(className, '', 'Ugyldig prosjekt', true, projectId, 0, objTransaction.nineNine);

  // income
  className = `.income`;
  let income = Number(formatNorAmountToNumber(document.querySelector(className).value));
  className = `income`;
  const validIncome = validateInterval(className, '', 'Ugyldig inntekt', true, income, objTransaction.minusNineNine, objTransaction.nineNine);

  // payment
  className = `.payment`;
  let payment = Number(formatNorAmountToNumber(document.querySelector(className).value));
  className = `payment`;
  const validPayment = validateInterval(className, '', 'Ugyldig utgift', true, payment, objTransaction.minusNineNine, objTransaction.nineNine);

  // kilowattHour
  className = `.kilowattHour`;
  const kilowattHour = Number(formatNorAmountToNumber(document.querySelector(className).value));
  className = `kilowattHour`;
  const validNumberKWHour = validateInterval(className, '', 'Ugyldig kilowattime', true, kilowattHour, 0, objTransaction.nineNine);

  // text
  className = `.text`;
  const text = document.querySelector(className).value;
  className = `text`;
  //const validText = validateText(   className, columnWidths, '', 'Ugyldig tekst', true, text, 3, 255);
  const validText = validateTextNew(className,               '', 'Ugyldig tekst', true, text, 3, 255);

  // Validate transactions columns
  if (validDate && validCondoId && validAccountId && validProjectId
    && validIncome && validPayment && validNumberKWHour && validText) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the transactions row exist
    if (rowNumberTransaction !== -1) {

      // update the transactions row
      await objTransactions.updateTransactionsTable(transactionId, objTransaction.condominiumId, objTransaction.user, condoId, accountId, projectId, income, payment, kilowattHour, transactionDate, text);
    } else {

      // insert transactions row
      await objTransactions.insertTransactionsTable(objTransaction.condominiumId, objTransaction.user, condoId, accountId, projectId, income, payment, kilowattHour, transactionDate, text, 'N');
    }

     // from date
    className = '.transactionDate';
    let fromDate = document.querySelector(className).value;
    fromDate = formatISODateToNumber(fromDate);

    // to date
    className = '.transactionDate';
    let toDate = document.querySelector(className).value;
    toDate = formatISODateToNumber(toDate);

    /*
    // income
    className = '.income';
    let income = document.querySelector(className).value;
    income = formatkronerToOre(income);

    // payment
    className = '.payment';
    let payment = document.querySelector(className).value;
    payment = formatkronerToOre(payment);
    */

    const orderBy = 'date DESC, income DESC';
    await objTransactions.loadTransactionsTable(orderBy, objTransaction.condominiumId, 'N', condoId, accountId, objTransaction.nineNine, 0, fromDate, toDate);

    transactionId = 0;
    if (objTransactions.arrayTransactions.length > 0) transactionId = objTransactions.arrayTransactions[0].transactionId;

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterTransactionId', false);
    }

    // show filter
    showFilter(transactionId);

    // Show transaction
    showTransaction(transactionId);
  }
}

// Delete transactions row
async function deleteTransactionRow() {

  // Check if transactions row exist
  let transactionId = Number(document.querySelector('.transactionId').value);
  const transactionsRowNumber = objTransactions.arrayTransactions.findIndex(transaction => transaction.transactionId === transactionId);
  if (transactionsRowNumber !== -1) {

    // delete transaction row
    await objTransaction.deleteTransactionsTable(transactionId, objTransaction.user);

    // get last row in transactions table
    await objTransaction.loadLastRowTransactionsTable(objTransaction.condominiumId);
  }

  const rowNumberTransaction = objTransactions.arrayTransactions.at(-1)?.transactionId ?? 0;

  transactionId = objTransactions.arrayTransactions[rowNumberTransaction]?.transactionId ?? 0;
  condoId = objTransactions.arrayTransactions[rowNumberTransaction]?.condoId ?? 0;
  accountId = objTransactions.arrayTransactions[rowNumberTransaction]?.accountId ?? 0;
  income = objTransactions.arrayTransactions[rowNumberTransaction]?.income ?? 0;
  payment = objTransactions.arrayTransactions[rowNumberTransaction]?.payment ?? 0;
  let fromdate = objTransactions.arrayTransactions[rowNumberTransaction]?.date ?? 0;
  let todate = objTransactions.arrayTransactions[rowNumberTransaction]?.date ?? 0;

  // amount
  let amount = objTransactions.arrayTransactions[rowNumberTransaction]?.income ?? 0;
  if (amount === 0) {
    amount = objTransactions.arrayTransactions[rowNumberTransaction]?.payment ?? 0;
  }

  showFilter(transactionId);

  showTransaction(transactionId);
}

// Show bank account transaction
function showTransaction(transactionId) {

  // row number bank account transaction
  const rowNumberTransaction = objTransactions.arrayTransactions.findIndex(transaction => transaction.transactionId === transactionId);

  // Empty line
  let html = emptyLine();

  // Transaction Id
  html += startLine();
  html += showTextNew('Bilagsnummer', 'transactionId', transactionId, false, "Bilagsnummer");
  html += "</div>";

  // Date
  html += startLine();
  let transactionDate = (rowNumberTransaction === -1)
    ? ''
    : objTransactions.arrayTransactions[rowNumberTransaction].date;

  // Format date from yyyymmdd -> yyyy-mm-dd (ISO format)
  transactionDate = formatNumberToISODate(transactionDate);
  html += showDate('Dato', 'transactionDate', transactionDate, enableChanges);
  html += "</div>";

  // Condos
  html += startLine();
  let condoId = (rowNumberTransaction === -1)
    ? ''
    : objTransactions.arrayTransactions[rowNumberTransaction].condoId;
  html += objCondo.showSelectedCondosNew('Leilighet', 'condoId', '', condoId, 'Velg leilighet', '', enableChanges);

  /*
  // condos
  const condoId = objTransactions.arrayTransactions[rowNumberTransaction]?.condoId ?? 0;
  className = `condoId`;
  html += objCondo.showSelectedCondos(className, '', condoId, 'Velg leilighet', '', enableChanges);
  html += "</tr>";
  */
  // Accounts
  let accountId = (rowNumberTransaction === -1)
    ? ''
    : objTransactions.arrayTransactions[rowNumberTransaction].accountId;

  html += objAccounts.showSelectedAccountsNew('Konto', 'accountId', '', accountId, 'Velg konto', '', enableChanges);

  /*
    // account Id
  const accountId = objTransactions.arrayTransactions[rowNumberTransaction]?.accountId ?? 0;
  className = `accountId`;
  html += objAccounts.showSelectedAccounts(className, '', accountId, 'Velg konto', '', enableChanges);
  */

  // projects
  let projectId = (rowNumberTransaction === -1)
    ? ''
    : objTransactions.arrayTransactions[rowNumberTransaction].projectId;

  html += objProjects.showSelectedProjectsNew('Prosjekt', 'projectId', '', projectId, 'Velg prosjekt', '', enableChanges);
  html += "</div>";

  // income
  html += startLine();
  let income = (rowNumberTransaction === -1)
    ? ''
    : objTransactions.arrayTransactions[rowNumberTransaction].income;
  income = formatNumberToNorAmount(income);
  html += showTextNew('Inntekt', 'income', income, enableChanges, "Inntekt");

  // payment
  let payment = (rowNumberTransaction === -1)
    ? "0"
    : objTransactions.arrayTransactions[rowNumberTransaction].payment;
  payment = formatNumberToNorAmount(payment);
  html += showTextNew('Betaling', 'payment', payment, enableChanges, "Betaling");

  // kilowattHour
  let kilowattHour = (rowNumberTransaction === -1)
    ? "0"
    : objTransactions.arrayTransactions[rowNumberTransaction].kilowattHour;
  kilowattHour = formatNumberToNorAmount(kilowattHour);
  html += showTextNew('KilowatTimer', 'kilowattHour', kilowattHour, enableChanges, "KilowatTimer");
  html += "</div>";
  
  // Text
  html += startLine();
  let text = (rowNumberTransaction === -1)
    ? ''
    : objTransactions.arrayTransactions[rowNumberTransaction].text;
  html += showTextNew('Tekst', 'text', text, enableChanges, "Tekst");
  html += "</div>";
  
  // Buttons
  if (enableChanges) {

    html += startLine();
    html += showButtonNew('update', 'Oppdater');
    html += showButtonNew('cancel', 'Angre');
    html += "</div>";

    html += startLine();
    html += showButtonNew('delete', 'Slett');
    html += showButtonNew('insert', 'Ny');
    html += "</div>";
  }

  html += startLine();
  html += showButtonNew('back', 'Tilbake');
  html += "</div>";


  document.querySelector('.showTransaction').innerHTML = html;

  //if (enableChanges) document.querySelector('.cancel').disabled = true;

  // Buttons
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('cancel', true);
    disableButton('filterTransactionId', false, 'white');
  }
}