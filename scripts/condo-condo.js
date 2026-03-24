// Condo maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');

const disableChanges = (objCondo.securityLevel < 5);
const condominiumId = objCondo.condominiumId;
const user = objCondo.user;

const tableWidth = 'width:600px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objCondo.condominiumId === 0 || objCondo.user === null)) {

      // LogIn is not valid
      //window.location.href = 'http://localhost/condo-login.html';
      const URL = (objUser.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'Y';
      await objUser.loadUsersTable(objCondo.condominiumId, resident);
      await objCondo.loadCondoTable(objCondo.condominiumId);

      const condoId = objCondo.arrayCondo.at(-1).condoId;

      //let html = objCondo.showHorizontalMenu('width: 750px');
      //document.querySelector(".horizontalMenu").innerHTML = html;

      // Show header
      let menuNumber = 0;

      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber, condoId);

      // Show result
      menuNumber = showResult(condoId, menuNumber);

      // Events
      // Events
      events();
    }
  } else {

    objRemoteHeating.showMessage(objRemoteHeating, '', 'condo-server.js er ikke startet.');
  }
}

// Events for condo
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterCondoId')) {

      await objCondo.loadCondoTable(objCondo.condominiumId);

      const condoId = Number(document.querySelector('.filterCondoId').value);
      let menuNumber = 0;
      menuNumber = showResult(condoId, menuNumber);
    };
  });

  // update/insert a condos row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Update a condos row
      const condoId = document.querySelector('.filterCondoId').value;
      updateCondoRow(condoId);
    };
  });

  // Delete condos row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      deleteCondoRow();

      await objCondo.loadCondoTable(objCondo.condominiumId);

      let menuNumber = 0;

      // Show filter
      const condoId = objCondo.arrayCondo.at(-1).condoId;
      menuNumber = showFilter(menuNumber, condoId);


      menuNumber = showResult(condoId, menuNumber);
    };
  });

  // Insert a condo row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload condo table
      await objCondo.loadCondoTable(objCondo.condominiumId);

      let condoId = Number(document.querySelector('.filterCondoId').value);
      if (condoId === 0) condoId = objCondo.arrayCondo.at(-1).condoId;

      // Show filter
      let menuNumber = 0;

      // Show filter
      menuNumber = showFilter(menuNumber, condoId);

      menuNumber = showResult(condoId, menuNumber);
    };
  });
  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objCondo.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

/*
// Show header
function showHeader() {

  // Start table
  let html = objCondo.startTable(tableWidth);

  // show main header
  html += objCondo.showTableHeader('width:175px;', 'Leilighet');

  // The end of the table
  html += objCondo.endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  html = objCondo.startTable(tableWidth);

  // start table body
  html += objCondo.startTableBody();

  // show main header
  html += objCondo.showTableHeaderLogOut('width:175px;', '', '', 'Leilighet', '', '');
  html += "</tr>";

  // end table body
  html += objCondo.endTableBody();

  // The end of the table
  html += objCondo.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(rowNumber, condoId) {

  // Start table
  html = objCondo.startTable(tableWidth);

  // Header filter
  rowNumber++;
  html += objCondo.showTableHeaderMenu('width:175px;', rowNumber, 'Velg leilighet', '');

  // start table body
  html += objCondo.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objCondo.insertTableColumns('', rowNumber);

  // condo
  html += objCondo.showSelectedCondos('filterCondoId', 'width:175px;', condoId, '')

  html += "</tr>";

  // end table body
  html += objCondo.endTableBody();

  // The end of the table
  html += objCondo.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}

// Show result
function showResult(condoId, rowNumber) {

  // start table
  let html = objCondo.startTable(tableWidth);

  // table header
  rowNumber++;
  html += objCondo.showTableHeaderMenu("width:175px;", rowNumber, '', '');

  // Check if condos row exist
  const rowNumberCondo = objCondo.arrayCondo.findIndex(condo => condo.condoId === condoId);
  if (rowNumberCondo !== -1) {

    // name
    html += "<tr>";

    rowNumber++;
    html += objCondo.showTableHeaderMenu("width:175px;", rowNumber, 'Navn', '');

    html += "</tr>";

    rowNumber++;
    html += objCondo.insertTableColumns('', rowNumber);

    // name
    html += objCondo.inputTableColumn('name', '', objCondo.arrayCondo[rowNumberCondo].name, 45,disableChanges);

    html += "</tr>";

    // street, address2
    rowNumber++;
    html += objCondo.showTableHeaderMenu("width:175px;", rowNumber, 'Gate', 'Adresse 2');
    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objCondo.insertTableColumns('', rowNumber);

    // street
    html += objCondo.inputTableColumn('street', '', objCondo.arrayCondo[rowNumberCondo].street, 45,disableChanges);

    // address2
    html += objCondo.inputTableColumn('address2', '', objCondo.arrayCondo[rowNumberCondo].address2, 45,disableChanges);

    html += "</tr>";

    // postalCode, city
    html += "<tr>";
    rowNumber++;
    html += objCondo.showTableHeaderMenu("width:175px;", rowNumber, 'Postnummer', 'Poststed');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondo.insertTableColumns('', rowNumber);

    // postalCode
    html += objCondo.inputTableColumn('postalCode', '', objCondo.arrayCondo[rowNumberCondo].postalCode, 4,disableChanges);

    // city
    html += objCondo.inputTableColumn('city', '', objCondo.arrayCondo[rowNumberCondo].city, 45,disableChanges);

    html += "</tr>";

    // squareMeters
    html += "<tr>";
    rowNumber++;
    html += objCondo.showTableHeaderMenu("width:175px;", rowNumber, 'Kvadratmeter');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondo.insertTableColumns('', rowNumber);

    // squareMeters
    html += objCondo.inputTableColumn('squareMeters', '', formatOreToKroner(objCondo.arrayCondo[rowNumberCondo].squareMeters), 10,disableChanges);

    html += "</tr>";

    // Buttons

    // insert table columns in start of a row
    rowNumber++;
    html += objCondo.insertTableColumns('', rowNumber);

    html += "</tr>";

    if (!disableChanges) {
      // insert table columns in start of a row
      rowNumber++;
      html += objCondo.insertTableColumns('', rowNumber);

      html += objCondo.showButton('width:175px;', 'update', 'Oppdater');
      html += objCondo.showButton('width:175px;', 'cancel', 'Angre');
      html += "</tr>";

      // insert table columns in start of a row
      rowNumber++;
      html += objCondo.insertTableColumns('', rowNumber);

      html += objCondo.showButton('width:175px;', 'delete', 'Slett');
      html += objCondo.showButton('width:175px;', 'insert', 'Ny');
      html += "</tr>";
    }
    // Show the rest of the menu
    rowNumber++;
    html += objCondo.showRestMenu(rowNumber);

    // The end of the table
    html += objCondo.endTable();
    document.querySelector('.result').innerHTML = html;

    return rowNumber;
  }
}

// Update a condo row
async function updateCondoRow(condoId) {

  if (condoId === '') condoId = -1
  condoId = Number(condoId);
  const validCondoId = objCondo.validateNumber('condoId', condoId, -1, objCondo.nineNine);

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objCondo.validateText(name, 3, 50);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = objCondo.validateText(street, 3, 50);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = objCondo.validateText(address2, 0, 50);

  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = objCondo.validateNumber('postalCode', Number(postalCode), 1, 9999);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = objCondo.validateText(city, 1, 50);

  // validate squaremeters
  const squareMeters = Number(formatKronerToOre(document.querySelector('.squareMeters').value));
  const validSquareMeters = objCondo.validateNumber('squareMeters', squareMeters, 1, 100000);

  if (validCondoId && validName && validStreet && validAddress2 && validPostalCode && validCity && validSquareMeters) {

    // Check if the condoId exist
    const rowNumberCondo = objCondo.arrayCondo.findIndex(condo => condo.condoId === condoId);
    if (rowNumberCondo !== -1) {

      // update the condos row
      await objCondo.updateCondoTable(condoId, user, name, street, address2, postalCode, city, squareMeters);
      await objCondo.loadCondoTable(objCondo.condominiumId);
    } else {

      // Insert the condo row in condo table
      await objCondo.insertCondoTable(objCondo.condominiumId, user, name, street, address2, postalCode, city, squareMeters);
      await objCondo.loadCondoTable(objCondo.condominiumId);
      condoId = objCondo.arrayCondo.at(-1).condoId;
      document.querySelector('.filterCondoId').value = condoId;
    }

    let menuNumber = 0;

    // Show filter
    menuNumber = showFilter(menuNumber, condoId);

    menuNumber = showResult(condoId, menuNumber);

    document.querySelector('.filterCondoId').disabled = false;
    document.querySelector('.delete').disabled = false;
    document.querySelector('.insert').disabled = false;
  }
}

// Reset all values for condo
function resetValues() {

  document.querySelector('.filterCondoId').value = '';

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

  document.querySelector('.filterCondoId').disabled = true;
  document.querySelector('.delete').disabled = true;
  document.querySelector('.insert').disabled = true;
}

// Delete condo row
async function deleteCondoRow() {

  // condoId
  const condoId = Number(document.querySelector('.filterCondoId').value);

  // Check if condo number exist
  const rowNumberCondo = objCondo.arrayCondo.findIndex(condo => condo.condoId === condoId);
  if (rowNumberCondo !== -1) {

    // delete a condo row


    await objCondo.deleteCondoTable(condoId, user);
  }
}