// Condo maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');

const enableChanges = (objCondo.securityLevel > 5);

const tableWidth = 'width:600px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objCondo.condominiumId === 0) || (objCondo.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'Y';
      await objUser.loadUsersTable(objCondo.condominiumId, resident, objCondo.nineNine);
      await objCondo.loadCondoTable(objCondo.condominiumId);

      let condoId = 0;
      if (objCondo.arrayCondo.length > 0) condoId = objCondo.arrayCondo.at(-1).condoId;

      // Show header
      let menuNumber = 0;

      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber, condoId);

      // Show result
      menuNumber = showResult(menuNumber, condoId);

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

      //await objCondo.loadCondoTable(condominiumId);

      const condoId = Number(document.querySelector('.filterCondoId').value);
      showResult(2,condoId);
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
      menuNumber = showResult(menuNumber,condoId);
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
      await objCondo.loadCondoTable(condominiumId);

      let condoId = Number(document.querySelector('.filterCondoId').value);
      if (condoId === 0) condoId = objCondo.arrayCondo.at(-1).condoId;

      showResult(2,condoId);
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
function showFilter(menuNumber, condoId) {

  // Start table
  html = objCondo.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objCondo.showTableHeaderMenu('width:175px;', menuNumber, 'Velg leilighet', '');

  // start table body
  html += objCondo.startTableBody();

  // insert table columns in start of a row
  menuNumber++;
  html += objCondo.insertTableColumns('', menuNumber);

  // condo
  html += objCondo.showSelectedCondos('filterCondoId', 'width:175px;', condoId, '', '', true)

  html += "</tr>";

  // end table body
  html += objCondo.endTableBody();

  // The end of the table
  html += objCondo.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show result
function showResult(menuNumber,condoId) {

  // start table
  let html = objCondo.startTable(tableWidth);

  // table header
  menuNumber++;
  html += objCondo.showTableHeaderMenu("width:175px;", menuNumber, '', '');

  // Check if condos row exist
  const rowNumberCondo = objCondo.arrayCondo.findIndex(condo => condo.condoId === condoId);
  //if (rowNumberCondo !== -1) {

  // name
  html += "<tr>";

  menuNumber++;
  html += objCondo.showTableHeaderMenu("width:175px;", menuNumber, 'Navn', '');

  html += "</tr>";

  menuNumber++;
  html += objCondo.insertTableColumns('', menuNumber);

  // name
  const name = (rowNumberCondo === -1) ? '' : objCondo.arrayCondo[rowNumberCondo].name;
  html += objCondo.inputTableColumn('name', '', name, 45, enableChanges);

  html += "</tr>";

  // street, address2
  menuNumber++;
  html += objCondo.showTableHeaderMenu("width:175px;", menuNumber, 'Gate', 'Adresse 2');
  html += "</tr>";

  // insert table columns in start of a row
  menuNumber++;
  html += objCondo.insertTableColumns('', menuNumber);

  // street
  const street = (rowNumberCondo === -1) 
  ? '' 
  : objCondo.arrayCondo[rowNumberCondo].street;
  html += objCondo.inputTableColumn('street', '', street, 45, enableChanges);

  // address2
  const address2 = (rowNumberCondo === -1) ? '' : objCondo.arrayCondo[rowNumberCondo].address2;
  html += objCondo.inputTableColumn('address2', '', address2, 45, enableChanges);

  html += "</tr>";

  // postalCode, city
  html += "<tr>";
  menuNumber++;
  html += objCondo.showTableHeaderMenu("width:175px;", menuNumber, 'Postnummer', 'Poststed');

  // insert table columns in start of a row
  menuNumber++;
  html += objCondo.insertTableColumns('', menuNumber);

  // postalCode
  const postalCode = (rowNumberCondo === -1) ? '' : objCondo.arrayCondo[rowNumberCondo].postalCode;
  html += objCondo.inputTableColumn('postalCode', '', postalCode, 4, enableChanges);

  // city
  const city = (rowNumberCondo === -1) ? '' : objCondo.arrayCondo[rowNumberCondo].city;
  html += objCondo.inputTableColumn('city', '', city, 45, enableChanges);

  html += "</tr>";

  // squareMeters
  html += "<tr>";
  menuNumber++;
  html += objCondo.showTableHeaderMenu("width:175px;", menuNumber, 'Kvadratmeter');

  // insert table columns in start of a row
  menuNumber++;
  html += objCondo.insertTableColumns('', menuNumber);

  // squareMeters
  const squareMeters = (rowNumberCondo === -1) ? '' : formatOreToKroner(objCondo.arrayCondo[rowNumberCondo].squareMeters);
  html += objCondo.inputTableColumn('squareMeters', '', squareMeters, 10, enableChanges);

  html += "</tr>";

  // Buttons

  // insert table columns in start of a row
  menuNumber++;
  html += objCondo.insertTableColumns('', menuNumber);

  html += "</tr>";

  // Show buttons
  if (enableChanges) {

    // insert table columns in start of a row
    menuNumber++;
    html += objCondo.insertTableColumns('', menuNumber);

    html += objCondo.showButton('width:175px;', 'update', 'Oppdater');
    html += objCondo.showButton('width:175px;', 'cancel', 'Angre');
    html += "</tr>";

    // insert table columns in start of a row
    menuNumber++;
    html += objCondo.insertTableColumns('', menuNumber);

    html += objCondo.showButton('width:175px;', 'delete', 'Slett');
    html += objCondo.showButton('width:175px;', 'insert', 'Ny');
    html += "</tr>";
  }

  // Show the rest of the menu
  menuNumber++;
  html += objCondo.showRestMenu(menuNumber);

  // The end of the table
  html += objCondo.endTable();
  document.querySelector('.result').innerHTML = html;
  //}
  return menuNumber;
}

// Update a condo row
async function updateCondoRow(condoId) {

  if (condoId === '') condoId = -1
  condoId = Number(condoId);
  const validCondoId = objCondo.validateNumber('condoId', condoId, -1, objCondo.nineNine, object, style, message);

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objCondo.validateText('name', name, 3, 45, objCondo, '', 'Ugyldig kontonavn');

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = objCondo.validateText('street', street, 3, 45, objCondo, '', 'Ugyldig gatenavn');

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = objCondo.validateText('address2', address2, 0, 45, objCondo, '', 'Ugyldig adresse');

  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = objCondo.validateNumber('postalCode', Number(postalCode), 1, objCondo.nineNine, object, style, message);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = objCondo.validateText('city', city, 1, 45, objCondo, '', 'Ugyldig poststed');

  // validate squaremeters
  const squareMeters = Number(formatKronerToOre(document.querySelector('.squareMeters').value));
  const validSquareMeters = objCondo.validateNumber('squareMeters', squareMeters, 1, objCondo.nineNine, object, style, message);

  if (validCondoId && validName && validStreet && validAddress2 && validPostalCode && validCity && validSquareMeters) {

    document.querySelector('.message').style.display = "none";

    // Check if the condoId exist
    const rowNumberCondo = objCondo.arrayCondo.findIndex(condo => condo.condoId === condoId);
    if (rowNumberCondo !== -1) {

      // update the condos row
      await objCondo.updateCondoTable(condoId, objCondo.user, name, street, address2, postalCode, city, squareMeters);
      await objCondo.loadCondoTable(objCondo.condominiumId);
    } else {

      // Insert the condo row in condo table
      await objCondo.insertCondoTable(objCondo.condominiumId, objCondo.user, name, street, address2, postalCode, city, squareMeters);
      await objCondo.loadCondoTable(objCondo.condominiumId);
      condoId = objCondo.arrayCondo.at(-1).condoId;
      document.querySelector('.filterCondoId').value = condoId;
    }

    menuNumber = 0;
    menuNumber = showFilter(menuNumber, condoId);
    menuNumber = showResult(menuNumber, condoId);

    objCondo.removeMessage();
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
  document.querySelector('.cancel').disabled = false;
}

// Delete condo row
async function deleteCondoRow() {

  // condoId
  const condoId = Number(document.querySelector('.filterCondoId').value);

  // Check if condo number exist
  const rowNumberCondo = objCondo.arrayCondo.findIndex(condo => condo.condoId === condoId);
  if (rowNumberCondo !== -1) {

    // delete a condo row


    await objCondo.deleteCondoTable(condoId, objCondo.user);
  }
}