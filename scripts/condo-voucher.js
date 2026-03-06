// Voucher maintenance

// Activate classes
const today = new Date();
const objUsers = new User('user');
const objBankAccountTransactions = new BankAccountTransaction('bankaccounttransaction');
const objVouchers = new Voucher('voucher');

let condominiumId = 0;
let user = "";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    condominiumId = Number(sessionStorage.getItem("condominiumId"));
    user = sessionStorage.getItem("user");
    if ((condominiumId === 0 || user === null)) {

      // LogIn is not valid
      window.location.href = 'http://localhost/condo-login.html';
    } else {

      const orderBy = 'bankAccountTransactionId ASC, date DESC, income ASC';
      await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, 'N', objVouchers.nineNine, objVouchers.nineNine, 0, 0, objVouchers.nineNine);

      const bankAccountTransactionId = objBankAccountTransactions.arrayBankAccountTransactions.at(-1).bankAccountTransactionId;

      // Show header
      let menuNumber = 0;

      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber, bankAccountTransactionId);

      // Show result
      menuNumber = showResult(bankAccountTransactionId, menuNumber);

      // Events
      events();
    }
  } else {

    objRemoteHeatings.showMessage(objRemoteHeatings, 'Server condo-server.js har ikke startet.');
  }
}

// Events for condo
function events() {

  // Filter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterbankAccountTransactionId')) {

      filterSync();

      async function filterSync() {

        //const condominiumId = Number(condominiumId);
        await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId);

        const bankAccountTransactionId = Number(document.querySelector('.filterbankAccountTransactionId').value);
        let menuNumber = 0;
        menuNumber = showResult(bankAccountTransactionId, menuNumber);
      }
    };
  });

  // update/insert a condos row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('update')) {

      updateCondoRowSync();

      // Update a condos row
      async function updateCondoRowSync() {

        const bankAccountTransactionId = document.querySelector('.filterbankAccountTransactionId').value;
        updateCondoRow(bankAccountTransactionId);
      }
    };
  });

  // Delete condos row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete')) {

      deleteCondoSync();

      async function deleteCondoSync() {

        deleteCondoRow();

        //const condominiumId = Number(condominiumId);
        await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId);

        let menuNumber = 0;

        // Show filter
        const bankAccountTransactionId = objBankAccountTransactions.arrayBankAccountTransactions.at(-1).bankAccountTransactionId;
        menuNumber = showFilter(menuNumber, bankAccountTransactionId);


        menuNumber = showResult(bankAccountTransactionId, menuNumber);
      };
    };
  });

  // Insert a condo row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload condo table
      reloadCondoSync();
      async function reloadCondoSync() {

        await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId);

        let bankAccountTransactionId = Number(document.querySelector('.filterbankAccountTransactionId').value);
        if (bankAccountTransactionId === 0) bankAccountTransactionId = objBankAccountTransactions.arrayBankAccountTransactions.at(-1).bankAccountTransactionId;

        // Show filter
        let menuNumber = 0;

        // Show filter
        menuNumber = showFilter(menuNumber, bankAccountTransactionId);

        menuNumber = showResult(bankAccountTransactionId, menuNumber);
      };
    };
  });
}

// Show header
function showHeader() {

  // Start table
  let html = objBankAccountTransactions.startTable('width:600px;');

  // show main header
  html += objBankAccountTransactions.showTableHeader('width:175px;', 'Bankkontotransaksjon');

  // The end of the table
  html += objBankAccountTransactions.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(rowNumber, bankAccountTransactionId) {

  // Start table
  html = objBankAccountTransactions.startTable('width:600px;');

  // Header filter
  rowNumber++;
  html += objBankAccountTransactions.showTableHeaderMenu('width:175px;', rowNumber, 'Velg bankkontotransaksjon', '');

  // start table body
  html += objBankAccountTransactions.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objBankAccountTransactions.insertTableColumns('', rowNumber);

  // show selected bank account transactions
  html += objBankAccountTransactions.showSelectedBankAccountTransactions('filterBankAccountTransactionId', 'width:175px;', bankAccountTransactionId, '', ''                 )
  
  html += "</tr>";

  // end table body
  html += objBankAccountTransactions.endTableBody();

  // The end of the table
  html += objBankAccountTransactions.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}

// Show result
function showResult(bankAccountTransactionId, rowNumber) {

  // start table
  let html = objBankAccountTransactions.startTable('width:600px;');

  // table header
  rowNumber++;
  html += objBankAccountTransactions.showTableHeaderMenu("width:175px;", rowNumber, '', '');

  // Check if bank account transactin row exist
  const rowNumberBankAccountTransaction = objBankAccountTransactions.arrayBankAccountTransactions.findIndex(bankAccountTransaction => bankAccountTransaction.bankAccountTransactionId === bankAccountTransactionId);
  if (rowNumberBankAccountTransaction !== -1) {

    // file name of the voucher
    html += "<tr>";

    rowNumber++;
    html += objBankAccountTransactions.showTableHeaderMenu("width:175px;", rowNumber, '', '');

    html += "</tr>";

    rowNumber++;
    html += objBankAccountTransactions.insertTableColumns('', rowNumber);

    // file name of the voucher
    html += objBankAccountTransactions.inputTableColumn('eInvoiceFileName', '', objBankAccountTransactions.arrayBankAccountTransactions[rowNumberBankAccountTransaction].eInvoiceFileName, 45);

    html += "</tr>";

    // Buttons

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccountTransactions.insertTableColumns('', rowNumber);

    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccountTransactions.insertTableColumns('', rowNumber);

    html += objBankAccountTransactions.showButton('width:175px;', 'update', 'Oppdater');
    html += objBankAccountTransactions.showButton('width:175px;', 'cancel', 'Angre');
    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccountTransactions.insertTableColumns('', rowNumber);

    html += objBankAccountTransactions.showButton('width:175px;', 'delete', 'Slett');
    html += objBankAccountTransactions.showButton('width:175px;', 'insert', 'Ny');
    html += "</tr>";

    // Show the rest of the menu
    rowNumber++;
    html += objBankAccountTransactions.showRestMenu(rowNumber);

    // The end of the table
    html += objBankAccountTransactions.endTable();
    document.querySelector('.result').innerHTML = html;

    return rowNumber;
  }
}

// Update a bank account transaction row
async function updateBankAccountTransactionRow(bankAccountTransactionId) {

  if (bankAccountTransactionId === '') bankAccountTransactionId = -1
  bankAccountTransactionId = Number(bankAccountTransactionId);
  const validbankAccountTransactionId = objBankAccountTransactions.validateNumber('bankAccountTransactionId', bankAccountTransactionId, -1, objBankAccountTransactions.nineNine);

  //const condominiumId = Number(condominiumId);

  //const user = objUserInfo.email;

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objBankAccountTransactions.validateText(name, 3, 50);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = objBankAccountTransactions.validateText(street, 3, 50);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = objBankAccountTransactions.validateText(address2, 0, 50);

  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = objBankAccountTransactions.validateNumber('postalCode', Number(postalCode), 1, 9999);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = objBankAccountTransactions.validateText(city, 1, 50);

  // validate squaremeters
  const squareMeters = Number(formatKronerToOre(document.querySelector('.squareMeters').value));
  const validSquareMeters = objBankAccountTransactions.validateNumber('squareMeters', squareMeters, 1, 100000);

  if (validbankAccountTransactionId && validName && validStreet && validAddress2 && validPostalCode && validCity && validSquareMeters) {

    // Check if the bankAccountTransactionId exist
    const rowNumberBankAccountTransaction = objBankAccountTransactions.arrayBankAccountTransactions.findIndex(condo => condo.bankAccountTransactionId === bankAccountTransactionId);
    if (rowNumberBankAccountTransaction !== -1) {

      // update the condos row
      await objBankAccountTransactions.updateCondoTable(bankAccountTransactionId, user, name, street, address2, postalCode, city, squareMeters);
      await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId);
    } else {

      // Insert the condo row in condo table
      await objBankAccountTransactions.insertCondoTable(condominiumId, user, name, street, address2, postalCode, city, squareMeters);
      await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId);
      bankAccountTransactionId = objBankAccountTransactions.arrayBankAccountTransactions.at(-1).bankAccountTransactionId;
      document.querySelector('.filterbankAccountTransactionId').value = bankAccountTransactionId;
    }

    let menuNumber = 0;

    // Show filter
    menuNumber = showFilter(menuNumber, bankAccountTransactionId);

    menuNumber = showResult(bankAccountTransactionId, menuNumber);

    document.querySelector('.filterbankAccountTransactionId').disabled = false;
    document.querySelector('.delete').disabled = false;
    document.querySelector('.insert').disabled = false;
  }
}

// Reset all values for condo
function resetValues() {

  document.querySelector('.filterbankAccountTransactionId').value = '';

  document.querySelector('.name').value = '';

  // street
  document.querySelector('.street').value = '';

  //  address 2
  document.querySelector('.address2').value = '';

  // postal code
  document.querySelector('.postalCode').value = '';

  // city
  document.querySelector('.city').value = '';

  // squareMeters
  document.querySelector('.squareMeters').value = '';

  document.querySelector('.filterbankAccountTransactionId').disabled = true;
  document.querySelector('.delete').disabled = true;
  document.querySelector('.insert').disabled = true;
}

// Delete condo row
async function deleteCondoRow() {

  // bankAccountTransactionId
  const bankAccountTransactionId = Number(document.querySelector('.filterbankAccountTransactionId').value);

  // Check if condo number exist
  const rowNumberBankAccountTransaction = objBankAccountTransactions.arrayBankAccountTransactions.findIndex(condo => condo.bankAccountTransactionId === bankAccountTransactionId);
  if (rowNumberBankAccountTransaction !== -1) {

    // delete a condo row
    //const user = objUserInfo.email;

    await objBankAccountTransactions.deleteCondoTable(bankAccountTransactionId, user);
  }
}