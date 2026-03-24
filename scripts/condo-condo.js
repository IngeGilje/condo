// Condo maintenance

// Activate classes
const today = new Date();
const objUsers = new User('user');
const objCondos = new Condo('condo');

const tableWidth = 'width:600px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    if ((objCondos.condominiumId === 0 || objCondos.user === null)) {

      // LogIn is not valid
      //window.location.href = 'http://localhost/condo-login.html';
      const URL = (objUsers.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'Y';
      await objUsers.loadUsersTable(objCondos.condominiumId, resident);
      await objCondos.loadCondoTable(objCondos.condominiumId);

      const condoId = objCondos.arrayCondo.at(-1).condoId;

      //let html = objCondos.showHorizontalMenu('width: 750px');
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

    objRemoteHeatings.showMessage(objRemoteHeatings, '', 'condo-server.js er ikke startet.');
  }
}

// Events for condo
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterCondoId')) {

      await objCondos.loadCondoTable(objCondos.condominiumId);

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

      await objCondos.loadCondoTable(objCondos.condominiumId);

      let menuNumber = 0;

      // Show filter
      const condoId = objCondos.arrayCondo.at(-1).condoId;
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
      await objCondos.loadCondoTable(objCondos.condominiumId);

      let condoId = Number(document.querySelector('.filterCondoId').value);
      if (condoId === 0) condoId = objCondos.arrayCondo.at(-1).condoId;

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

      let url = (objCondos.serverStatus === 1)
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
  let html = objCondos.startTable(tableWidth);

  // show main header
  html += objCondos.showTableHeader('width:175px;', 'Leilighet');

  // The end of the table
  html += objCondos.endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  html = objCondos.startTable(tableWidth);

  // start table body
  html += objCondos.startTableBody();

  // show main header
  html += objCondos.showTableHeaderLogOut('width:175px;', '', '', 'Leilighet', '', '');
  html += "</tr>";

  // end table body
  html += objCondos.endTableBody();

  // The end of the table
  html += objCondos.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(rowNumber, condoId) {

  // Start table
  html = objCondos.startTable(tableWidth);

  // Header filter
  rowNumber++;
  html += objCondos.showTableHeaderMenu('width:175px;', rowNumber, 'Velg leilighet', '');

  // start table body
  html += objCondos.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objCondos.insertTableColumns('', rowNumber);

  // condo
  html += objCondos.showSelectedCondos('filterCondoId', 'width:175px;', condoId, '')

  html += "</tr>";

  // end table body
  html += objCondos.endTableBody();

  // The end of the table
  html += objCondos.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}

// Show result
function showResult(condoId, rowNumber) {

  // start table
  let html = objCondos.startTable(tableWidth);

  // table header
  rowNumber++;
  html += objCondos.showTableHeaderMenu("width:175px;", rowNumber, '', '');

  // Check if condos row exist
  const rowNumberCondo = objCondos.arrayCondo.findIndex(condo => condo.condoId === condoId);
  if (rowNumberCondo !== -1) {

    // name
    html += "<tr>";

    rowNumber++;
    html += objCondos.showTableHeaderMenu("width:175px;", rowNumber, 'Navn', '');

    html += "</tr>";

    rowNumber++;
    html += objCondos.insertTableColumns('', rowNumber);

    // name
    html += objCondos.inputTableColumn('name', '', objCondos.arrayCondo[rowNumberCondo].name, 45, (objCondos.securityLevel < 5));

    html += "</tr>";

    // street, address2
    rowNumber++;
    html += objCondos.showTableHeaderMenu("width:175px;", rowNumber, 'Gate', 'Adresse 2');
    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objCondos.insertTableColumns('', rowNumber);

    // street
    html += objCondos.inputTableColumn('street', '', objCondos.arrayCondo[rowNumberCondo].street, 45, (objCondos.securityLevel < 5));

    // address2
    html += objCondos.inputTableColumn('address2', '', objCondos.arrayCondo[rowNumberCondo].address2, 45, (objCondos.securityLevel < 5));

    html += "</tr>";

    // postalCode, city
    html += "<tr>";
    rowNumber++;
    html += objCondos.showTableHeaderMenu("width:175px;", rowNumber, 'Postnummer', 'Poststed');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondos.insertTableColumns('', rowNumber);

    // postalCode
    html += objCondos.inputTableColumn('postalCode', '', objCondos.arrayCondo[rowNumberCondo].postalCode, 4, (objCondos.securityLevel < 5));

    // city
    html += objCondos.inputTableColumn('city', '', objCondos.arrayCondo[rowNumberCondo].city, 45, (objCondos.securityLevel < 5));

    html += "</tr>";

    // squareMeters
    html += "<tr>";
    rowNumber++;
    html += objCondos.showTableHeaderMenu("width:175px;", rowNumber, 'Kvadratmeter');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondos.insertTableColumns('', rowNumber);

    // squareMeters
    html += objCondos.inputTableColumn('squareMeters', '', formatOreToKroner(objCondos.arrayCondo[rowNumberCondo].squareMeters), 10, (objCondos.securityLevel < 5));

    html += "</tr>";

    // Buttons

    // insert table columns in start of a row
    rowNumber++;
    html += objCondos.insertTableColumns('', rowNumber);

    html += "</tr>";

    if (objCondos.securityLevel > 5) {
      // insert table columns in start of a row
      rowNumber++;
      html += objCondos.insertTableColumns('', rowNumber);

      html += objCondos.showButton('width:175px;', 'update', 'Oppdater');
      html += objCondos.showButton('width:175px;', 'cancel', 'Angre');
      html += "</tr>";

      // insert table columns in start of a row
      rowNumber++;
      html += objCondos.insertTableColumns('', rowNumber);

      html += objCondos.showButton('width:175px;', 'delete', 'Slett');
      html += objCondos.showButton('width:175px;', 'insert', 'Ny');
      html += "</tr>";
    }
    // Show the rest of the menu
    rowNumber++;
    html += objCondos.showRestMenu(rowNumber);

    // The end of the table
    html += objCondos.endTable();
    document.querySelector('.result').innerHTML = html;

    return rowNumber;
  }
}

// Update a condo row
async function updateCondoRow(condoId) {

  if (condoId === '') condoId = -1
  condoId = Number(condoId);
  const validCondoId = objCondos.validateNumber('condoId', condoId, -1, objCondos.nineNine);

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objCondos.validateText(name, 3, 50);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = objCondos.validateText(street, 3, 50);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = objCondos.validateText(address2, 0, 50);

  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = objCondos.validateNumber('postalCode', Number(postalCode), 1, 9999);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = objCondos.validateText(city, 1, 50);

  // validate squaremeters
  const squareMeters = Number(formatKronerToOre(document.querySelector('.squareMeters').value));
  const validSquareMeters = objCondos.validateNumber('squareMeters', squareMeters, 1, 100000);

  if (validCondoId && validName && validStreet && validAddress2 && validPostalCode && validCity && validSquareMeters) {

    // Check if the condoId exist
    const rowNumberCondo = objCondos.arrayCondo.findIndex(condo => condo.condoId === condoId);
    if (rowNumberCondo !== -1) {

      // update the condos row
      await objCondos.updateCondoTable(condoId, user, name, street, address2, postalCode, city, squareMeters);
      await objCondos.loadCondoTable(objCondos.condominiumId);
    } else {

      // Insert the condo row in condo table
      await objCondos.insertCondoTable(objCondos.condominiumId, user, name, street, address2, postalCode, city, squareMeters);
      await objCondos.loadCondoTable(objCondos.condominiumId);
      condoId = objCondos.arrayCondo.at(-1).condoId;
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
  const rowNumberCondo = objCondos.arrayCondo.findIndex(condo => condo.condoId === condoId);
  if (rowNumberCondo !== -1) {

    // delete a condo row


    await objCondos.deleteCondoTable(condoId, user);
  }
}