// Maintenance of bankaccounts

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objCondominiums = new Condominiums('condominiums');
const objBankAccounts = new BankAccounts('bankaccounts');

const enableChanges = (objBankAccounts.securityLevel > 5);
const applicationName = "condo-bankaccount";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Validate LogIn
if ((objBankAccounts.condominiumId === 0) || (objBankAccounts.user === null)) {

  // LogIn is not valid
  const URL = (objUsers.serverStatus === 1)
    ? 'http://ingegilje.no/condo-login.html'
    : 'http://localhost/condo-login.html';
  window.location.href = URL;
} else {

  // Show menu
  let html = objCondominiums.showMenu(objBankAccounts.securityLevel);
  document.querySelector('.menuVertical').innerHTML = html;

  // Call main when script loads
  main();
  async function main() {

    // Check if server is running
    if (await objUsers.checkServer()) {

      const resident = 'Y';
      await objUsers.loadUsersTable(objBankAccounts.condominiumId, resident, objBankAccounts.nineNine);
      await objCondominiums.loadCondominiumsTable();
      await objBankAccounts.loadBankAccountsTable(objBankAccounts.condominiumId);

      // Show filter
      // Get last id in last object in condominiums array
      let bankAccountId = (objCondominiums.arrayCondominiums.length > 0)
        ? objCondominiums.arrayCondominiums.at(-1)?.bankAccountId ?? 0
        : 0;
      showFilter(bankAccountId);

      // Show bank account
      bankAccountId = Number(document.querySelector('.filterBankAccountId').value);

      showBankAccount(bankAccountId);

      // Events
      events();
    } else {

      showMessageNew('Server er ikke startet.');
    }
  }
}

// Events for bankaccounts
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterBankAccountId')) {

      const bankAccountId = Number(document.querySelector('.filterBankAccountId').value);

      // show filter
      showFilter(bankAccountId);

      // show bank account
      showBankAccount(bankAccountId);
    };
  });

  // update a bankaccounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
      updateBankAccountRow(bankAccountId);
    };
  });

  // Delete bankaccounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      //const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      let bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
      await deleteBankAccountsRow(bankAccountId);
    };
  });

  // Insert a bankaccounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objBankAccounts.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

/*
async function deleteBankAccount() {

  const bankAccountId = Number(document.querySelector('.select-bankaccounts-bankAccountId').value);
  if (bankAccountId >= 0) {

    // Check if bank account exist
    const rowNumberBankAccount = objBankAccounts.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
    if (rowNumberBankAccount !== -1) {

      // Delete bank bankaccounts row


      await objBankAccounts.deleteBankAccountsTable(bankAccountId, objBankAccounts.user);
    }
  }
}
*/

// Show filter
function showFilter(bankAccountId) {

  // Start filter
  let html = startBoxFilter("Bankkonto");

  // Show bankaccounts
  html += objBankAccounts.showSelectedBankAccountsNew('filterBankAccountId', 'Bankkonto', bankAccountId, '', '', true);

  // End filter
  html += endBoxFilter();

  document.querySelector(".showFilter").innerHTML = html;
}

// Show bank account
function showBankAccount(bankAccountId) {

  // row number bank account
  const rowNumberBankAccount = objBankAccounts.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);

  let html = startGrid('Bankkonto');

  // name
  const name = objBankAccounts.arrayBankAccounts[rowNumberBankAccount]?.name ?? '';
  html += inputText('name', 'Navn', name, 45, enableChanges);
  html += "<div></div>";

  // bank account number
  /*
  const bankAccount = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccounts.arrayBankAccounts[rowNumberBankAccount].bankAccount.trim();
  */
  const bankAccount = objBankAccounts.arrayBankAccounts[rowNumberBankAccount]?.bankAccount.trim() ?? '';
  html += inputText('bankAccount', 'Bankkontonummer', bankAccount, 11, enableChanges);
  html += "<div></div>";

  // opening balance date
  /*
  let openingBalanceDate = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccounts.arrayBankAccounts[rowNumberBankAccount].openingBalanceDate.trim();
  */
  let openingBalanceDate = objBankAccounts.arrayBankAccounts[rowNumberBankAccount]?.openingBalanceDate ?? '';

  // Format date from yyyymmdd -> yyyy-mm-dd (ISO format)
  openingBalanceDate = formatNumberToISODate(openingBalanceDate);
  html += inputDate('openingBalanceDate', 'Dato', openingBalanceDate, enableChanges);

  // opening balance
  let openingBalance = objBankAccounts.arrayBankAccounts[rowNumberBankAccount]?.openingBalance ?? '';
  openingBalance = formatNumberToNorAmount(openingBalance);
  //html += showTextNew('Inngående saldo', 'openingBalance', openingBalance, enableChanges, "Inngående saldo");
  html += inputText('openingBalance', 'Inngående saldo', openingBalance, 11, enableChanges)

  // closing balance date
  let closingBalanceDate = objBankAccounts.arrayBankAccounts[rowNumberBankAccount]?.closingBalanceDate ?? '';
  // Format date from yyyymmdd -> yyyy-mm-dd (ISO format)
  closingBalanceDate = formatNumberToISODate(closingBalanceDate);
  //html += showDate('Dato', 'closingBalanceDate', closingBalanceDate, enableChanges);
  html += inputDate('closingBalanceDate', 'Dato', closingBalanceDate, enableChanges);

  // closing balance
  let closingBalance = objBankAccounts.arrayBankAccounts[rowNumberBankAccount]?.closingBalance ?? '';
  closingBalance = formatNumberToNorAmount(closingBalance);

  //html += showTextNew('Utgående saldo', 'closingBalance', closingBalance, enableChanges, "Utgående saldo");
  html += inputText('closingBalance', 'Utgående saldo', closingBalance, 11, enableChanges)

  html += endGrid();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update secondary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");
    html += inputButton("delete danger", "Slett", "button");

    // End buttons
    html += endButtons();
  }

  document.querySelector('.showBankAccount').innerHTML = html;
}

// Update a bankaccounts row
async function updateBankAccountRow(bankAccountId) {

  // validate name
  const name = document.querySelector('.name').value;
  const validName = validateTextNew('name', 'Ugyldig navn', name, 3, 45)

  // validate bank account number
  const bankAccount = document.querySelector('.bankAccount').value;
  const validBankAccount = validateBankAccountNew('bankAccount', bankAccount, 'Ugyldig bankkonto');

  // Opening balance date
  let openingBalanceDate = document.querySelector('.openingBalanceDate').value;
  openingBalanceDate = formatISODateToNumber(openingBalanceDate);
  const validOpeningBalanceDate = validateIntervalNew('openingBalanceDate', 'Ugyldig Dato inngående saldo', openingBalanceDate, 20200101, 20291231);

  // Opening balance
  let openingBalance = document.querySelector('.openingBalance').value;
  openingBalance = formatNorAmountToNumber(openingBalance);
  const validOpeningBalance = validateIntervalNew('openingBalance', 'Ugyldig beløp inngående saldo', openingBalance, objBankAccounts.minusNineNine, objBankAccounts.nineNine);

  // Closing balance date
  let closingBalanceDate = document.querySelector('.closingBalanceDate').value;
  closingBalanceDate = formatISODateToNumber(closingBalanceDate)
  const validClosingBalanceDate = validateIntervalNew('closingBalanceDate', 'Ugyldig dato for utgående saldo', closingBalanceDate, 20200101, 20291231);

  // Closing balance
  let closingBalance = document.querySelector('.closingBalance').value;
  closingBalance = formatNorAmountToNumber(closingBalance);
  const validClosingBalance = validateIntervalNew('closingBalance', 'Ugyldig beløp utgående saldo', closingBalance, objBankAccounts.minusNineNine, objBankAccounts.nineNine);

  if (validBankAccount && validName && validOpeningBalanceDate && validOpeningBalance
    && validClosingBalanceDate && validOpeningBalance) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the bankAccount Id exist
    const rowNumberBankAccount = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
    if (rowNumberBankAccount !== -1) {

      // update a bankAccounts row
      await objBankAccounts.updateBankAccountsTable(bankAccountId, objBankAccounts.user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
    } else {

      // Insert a bankAccounts row
      await objBankAccounts.insertBankAccountsTable(objBankAccounts.condominiumId, objBankAccounts.user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
      await objBankAccounts.getHighestBankAccountId(objBankAccounts.condominiumId);
      bankAccountId = objBankAccounts.arrayBankAccounts[0].bankAccountId;
    }

    await objBankAccounts.loadBankAccountsTable(objBankAccounts.condominiumId);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
    }

    // Show filter
    showFilter(bankAccountId);

    // Show bankAccount
    showBankAccount(bankAccountId);
  }

}

// Reset values
function resetValues() {

  // Bank account Id
  document.querySelector('.filterBankAccountId').value = '';

  // Bank account number
  document.querySelector('.bankAccount').value = '';

  // Bank account Name
  document.querySelector('.name').value = '';

  // Opening balance
  document.querySelector('.openingBalance').value = '';

  // Opening balance date
  document.querySelector('.openingBalanceDate').value = '';

  // Closing balance
  document.querySelector('.closingBalance').value = '';

  // Closing balance date
  document.querySelector('.closingBalanceDate').value = '';

  // Buttons
  if (enableChanges) {
    disableButton('delete', true);
  }
}

// Delete one bankAccounts row
async function deleteBankAccountsRow(bankAccountId) {

  // Check if bankaccount row exist
  const rowNumberBankAccounts = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
  if (rowNumberBankAccounts !== -1) {

    // delete bankaccounts row
    await objBankAccounts.deleteBankAccountsTable(bankAccountId, objBankAccounts.user);
    await objBankAccounts.getHighestBankAccountId(objBankAccounts.condominiumId);

    // Check for empty array after deleting
    bankAccountId = 0;
    if (objBankAccounts.arrayBankAccounts.length > 0) bankAccountId = objBankAccounts.arrayBankAccounts[0].bankAccountId;
  }

  await objBankAccounts.loadBankAccountsTable(objBankAccounts.condominiumId);

  // Show filter
  showFilter(bankAccountId);

  // Show bankAccount
  showBankAccount(bankAccountId);
}