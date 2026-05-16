// Condo maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');

const enableChanges = (objCondo.securityLevel > 5);

const columnWidths = [175, 175, 175]

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

      // Show horizonal menu
      let html = objCondo.showHorizontalMenu();
      document.querySelector('.horizontalMenu').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objCondo.condominiumId, resident, objCondo.nineNine);
      await objCondo.loadCondoTable(objCondo.condominiumId, objCondo.nineNine);

      let condoId = 0;
      if (objCondo.arrayCondo.length > 0) condoId = objCondo.arrayCondo.at(-1).condoId;

      // get condoId
      const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === objCondo.userId);
      if (rowNumberUser !== -1) condoId = objUser.arrayUsers[rowNumberUser].condoId;

      // Show header
      let menuNumber = 0;

      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber, condoId);

      // Show result
      menuNumber = showCondo(menuNumber, condoId);

      // Events
      events();
    }
  } else {

    objCondo.showMessage(objCondo, '', 'Server er ikke startet.');
  }
}

// Events for condo
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterCondoId')) {

      const condoId = Number(document.querySelector('.filterCondoId').value);
      showCondo(2, condoId);
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

      await objCondo.loadCondoTable(objCondo.condominiumId, objCondo.nineNine);

      let menuNumber = 0;

      // Show filter
      const condoId = objCondo.arrayCondo.at(-1).condoId;
      menuNumber = showFilter(menuNumber, condoId);
      menuNumber = showCondo(menuNumber, condoId);
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
      await objCondo.loadCondoTable(condominiumId, objCondo.nineNine);

      let condoId = Number(document.querySelector('.filterCondoId').value);
      if (condoId === 0) condoId = objCondo.arrayCondo.at(-1).condoId;

      showCondo(2, condoId);
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

// Show header
function showHeader() {

  // Start table
  let html = objCondo.initializeTable(columnWidths);

  // start table body
  html += objCondo.startTableBody();

  // show main header
  html += objCondo.showTableHeaderLogOut('', 'Leilighet');
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
  let html = objCondo.initializeTable(columnWidths);

  // Header filter (<tr></tr>)
  menuNumber++;
  html += objCondo.showTableHeaderMenu(menuNumber, objCondo.accountMenu, '', '2Velg leilighet', '3');

  // start table body
  html += objCondo.startTableBody();

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objCondo.insertTableRow('', menuNumber, objCondo.accountMenu);

  // condo
  html += objCondo.showSelectedCondos('filterCondoId', 'width:175px;', condoId, '', '', true)

  html += "<td>3</td></tr>";

  // end table body
  html += objCondo.endTableBody();

  // The end of the table
  html += objCondo.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show result
function showCondo(menuNumber, condoId) {

  // start table
  let html = objCondo.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  menuNumber++;
  html += objCondo.showTableHeaderMenu(menuNumber, objCondo.accountMenu, '', '2', '3');

  // Check if condos row exist
  const rowNumberCondo = objCondo.arrayCondo.findIndex(condo => condo.condoId === condoId);

  // name
  //html += "<tr>";

  menuNumber++;
  html += objCondo.showTableHeaderMenu(menuNumber, objCondo.accountMenu, '', '2leilighet', '3');

  menuNumber++;
  html += objCondo.insertTableRow('', menuNumber, objCondo.accountMenu);

  // name
  const name = (rowNumberCondo === -1) ? '' : objCondo.arrayCondo[rowNumberCondo].name;
  html += objCondo.inputTableColumn('name', '', name, 45, enableChanges);
  html += "<td>3</td></tr>";

  // street, address2
  menuNumber++;
  html += objCondo.showTableHeaderMenu(menuNumber, objCondo.accountMenu, '', '2Gate', '3Adresse 2');

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objCondo.insertTableRow('', menuNumber, objCondo.accountMenu);

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
  menuNumber++;
  html += objCondo.showTableHeaderMenu(menuNumber, objCondo.accountMenu, '', '2Postnummer', '3Poststed');

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objCondo.insertTableRow('', menuNumber, objCondo.accountMenu);

  // postalCode
  const postalCode = (rowNumberCondo === -1) ? '' : objCondo.arrayCondo[rowNumberCondo].postalCode;
  html += objCondo.inputTableColumn('postalCode', '', postalCode, 4, enableChanges);

  // city
  const city = (rowNumberCondo === -1) ? '' : objCondo.arrayCondo[rowNumberCondo].city;
  html += objCondo.inputTableColumn('city', '', city, 45, enableChanges);
  html += "</tr>";

  // squareMeters
  //html += "<tr>";
  menuNumber++;
  html += objCondo.showTableHeaderMenu(menuNumber, objCondo.accountMenu, '', '2Areal i m2', '3');

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objCondo.insertTableRow('', menuNumber, objCondo.accountMenu);

  // squareMeters
  const squareMeters = (rowNumberCondo === -1) ? '' : formatOreToKroner(objCondo.arrayCondo[rowNumberCondo].squareMeters);
  html += objCondo.inputTableColumn('squareMeters', '', squareMeters, 10, enableChanges);

  html += "<td>3</td></tr>";

  // Buttons

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objCondo.insertTableRow('', menuNumber, objCondo.accountMenu);

  html += "<td>2</td><td>3</td></tr>";

  // Show buttons (<tr></td>)
  if (enableChanges) {

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objCondo.insertTableRow('', menuNumber, objCondo.accountMenu);

    html += objCondo.showButton('update', '2Oppdater');
    html += objCondo.showButton('cancel', '3Angre');
    html += "</tr>";

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objCondo.insertTableRow('', menuNumber, objCondo.accountMenu);

    html += objCondo.showButton('delete', '2Slett');
    html += objCondo.showButton('insert', '3Ny');
    html += "</tr>";
  }

  // Show the rest of the menu
  menuNumber++;
  html += objCondo.showRestMenu(menuNumber, objCondo.accountMenu, '2', '3');

  // The end of the table
  html += objCondo.endTable();
  document.querySelector('.result').innerHTML = html;

  if (enableChanges) document.querySelector('.cancel').disabled = true;
  return menuNumber;
}

// Update a condo row
async function updateCondoRow(condoId) {

  if (condoId === '') condoId = -1
  condoId = Number(condoId);
  const validCondoId = objCondo.validateInterval('condoId', objCondo, columnWidths, '', 'Ugyldig leilighet', true, condoId, -1, objCondo.nineNine);

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objCondo.validateText('name', objCondo, columnwidths,    '', 'Ugyldig kontonavn', true, name, 3, 45);
 
  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = objCondo.validateText('street', objCondo, columnwidths,   '',  'Ugyldig gatenavn', true, street, 3, 45);
 

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = objCondo.validateText('address2', objCondo, columnwidths,    '', 'Ugyldig adresse', true, address2, 0, 45);
 
  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = objCondo.validateInterval('postalCode', objCondo, columnWidths, '', 'Ugyldig postnummer', true, Number(postalCode), 1, objCondo.nineNine);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = objCondo.validateText('city', objCondo, columnwidths,    '','Ugyldig poststed', true,city, 1, 45);

  // validate squaremeters
  const squareMeters = Number(formatKronerToOre(document.querySelector('.squareMeters').value));
  const validSquareMeters = objCondo.validateInterval('squareMeters', objCondo, columnWidths, '', 'Ugyldig areal', true, squareMeters, 1, objCondo.nineNine);

  if (validCondoId && validName && validStreet && validAddress2 && validPostalCode && validCity && validSquareMeters) {

    document.querySelector('.message').style.display = "none";

    // Check if the condoId exist
    const rowNumberCondo = objCondo.arrayCondo.findIndex(condo => condo.condoId === condoId);
    if (rowNumberCondo !== -1) {

      // update the condos row
      await objCondo.updateCondoTable(condoId, objCondo.user, name, street, address2, postalCode, city, squareMeters);
      await objCondo.loadCondoTable(objCondo.condominiumId, objCondo.nineNine);
    } else {

      // Insert the condo row in condo table
      await objCondo.insertCondoTable(objCondo.condominiumId, objCondo.user, name, street, address2, postalCode, city, squareMeters);
      await objCondo.loadCondoTable(objCondo.condominiumId, objCondo.nineNine);
      condoId = objCondo.arrayCondo.at(-1).condoId;
      document.querySelector('.filterCondoId').value = condoId;
    }

    menuNumber = 0;
    menuNumber = showFilter(menuNumber, condoId);
    menuNumber = showCondo(menuNumber, condoId);

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

  if (enableChanges) {
    document.querySelector('.delete').disabled = true;
    document.querySelector('.insert').disabled = true;
    document.querySelector('.cancel').disabled = false;
  }
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