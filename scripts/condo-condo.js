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

      // Show main menu
      let html = objCondo.ShowHorizontalMenu(objCondo.arrayMainMenu);
      document.querySelector('.mainMenu').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objCondo.condominiumId, resident, objCondo.nineNine);
      await objCondo.loadCondoTable(objCondo.condominiumId, objCondo.nineNine);

      let condoId = 0;
      if (objCondo.arrayCondo.length > 0) condoId = objCondo.arrayCondo.at(-1).condoId;

      // get condoId
      const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === objCondo.userId);
      if (rowNumberUser !== -1) condoId = objUser.arrayUsers[rowNumberUser].condoId;

      // Show header
      

      showHeader();

      // Show filter
      showFilter( condoId);

      // Show result
      editCondo( condoId);

      // Events
      events();
    }
  } else {

    objCondo.showMessageNew(columnWidths, '', 'Server er ikke startet.');
  }
}

// Events for condo
async function events() {

  // show side menu
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('menu-button')) {

      sideMenu.classList.add("open");
      overlay.classList.add("show");
    }
  });

  // Filter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterCondoId')) {

      const condoId = Number(document.querySelector('.filterCondoId').value);
      editCondo(2, condoId);
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

      

      // Show filter
      const condoId = objCondo.arrayCondo.at(-1).condoId;
      showFilter( condoId);
      editCondo( condoId);
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

      editCondo(2, condoId);
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
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter( condoId) {

  // Start table
  let html = objCondo.initializeTable(columnWidths);

  // Header filter (<tr></tr>)
  
  html += objCondo.showTableHeaderMenu( '', '', 'Velg leilighet', '');

  // start table body
  html += objCondo.startTableBody();

  // insert a table row (<tr></td>)
  
  html += objCondo.insertTableRow('');

  // condo
  html += objCondo.showSelectedCondos('filterCondoId', 'width:175px;', condoId, '', '', true)

  html += "<td></td></tr>";

  // end table body
  html += objCondo.endTableBody();

  // The end of the table
  html += objCondo.endTable();
  document.querySelector('.editFilter').innerHTML = html;

  
}

// Maintain condo information
function editCondo( condoId) {

  // start table
  let html = objCondo.initializeTable(columnWidths);

  // Check if condos row exist
  const rowNumberCondo = objCondo.arrayCondo.findIndex(condo => condo.condoId === condoId);

  
  html += objCondo.showTableHeaderMenu( '', '', '', '');

  // name
  
  html += objCondo.showTableHeaderMenu('', '', 'Leilighet', '');

  
  html += objCondo.insertTableRow('');

  const name = (rowNumberCondo === -1) ? '' : objCondo.arrayCondo[rowNumberCondo].name;
  html += objCondo.editTableCell('name', name, 45, enableChanges);
  html += "<td></td></tr>";

  // street, address2
  
  html += objCondo.showTableHeaderMenu('', '', 'Gate', 'Adresse 2');

  // insert a table row (<tr></td>)
  
  html += objCondo.insertTableRow('');

  // street
  const street = (rowNumberCondo === -1)
    ? ''
    : objCondo.arrayCondo[rowNumberCondo].street;
  html += objCondo.editTableCell('street', street, 45, enableChanges);

  // address2
  const address2 = (rowNumberCondo === -1) ? '' : objCondo.arrayCondo[rowNumberCondo].address2;
  html += objCondo.editTableCell('address2', address2, 45, enableChanges);
  html += "</tr>";

  // postalCode, city
  
  html += objCondo.showTableHeaderMenu('', '', 'Postnummer', 'Poststed');

  // insert a table row (<tr></td>)
  
  html += objCondo.insertTableRow('');

  // postalCode
  const postalCode = (rowNumberCondo === -1) ? '' : objCondo.arrayCondo[rowNumberCondo].postalCode;
  html += objCondo.editTableCell('postalCode', postalCode, 4, enableChanges);

  // city
  const city = (rowNumberCondo === -1) ? '' : objCondo.arrayCondo[rowNumberCondo].city;
  html += objCondo.editTableCell('city', city, 45, enableChanges);
  html += "</tr>";

  // squareMeters
  //html += "<tr>";
  
  html += objCondo.showTableHeaderMenu('', '', 'Areal i m2', '');

  // insert a table row (<tr></td>)
  
  html += objCondo.insertTableRow('');

  // squareMeters
  const squareMeters = (rowNumberCondo === -1) ? '' : formatOreToKroner(objCondo.arrayCondo[rowNumberCondo].squareMeters);
  html += objCondo.editTableCell('squareMeters', squareMeters, 10, enableChanges);

  html += "<td></td></tr>";

  // Buttons

  // insert a table row (<tr></td>)
  
  html += objCondo.insertTableRow('');

  html += "<td></td><td></td></tr>";

  // Show buttons (<tr></td>)
  if (enableChanges) {

    // insert a table row (<tr></td>)
    
    html += objCondo.insertTableRow('');

    html += objCondo.showButton('update', 'Oppdater');
    html += objCondo.showButton('cancel', 'Angre');
    html += "</tr>";

    // insert a table row (<tr></td>)
    
    html += objCondo.insertTableRow('');

    html += objCondo.showButton('delete', 'Slett');
    html += objCondo.showButton('insert', 'Ny');
    html += "</tr>";
  }

  // The end of the table
  html += objCondo.endTable();
  document.querySelector('.editCondo').innerHTML = html;

  if (enableChanges) document.querySelector('.cancel').disabled = true;
  
}

// Update a condo row
async function updateCondoRow(condoId) {

  if (condoId === '') condoId = -1
  condoId = Number(condoId);
  const validCondoId = objCondo.validateInterval('condoId', columnWidths, '', 'Ugyldig leilighet', true, condoId, -1, objCondo.nineNine);

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objCondo.validateText('name', columnWidths, '', 'Ugyldig kontonavn', true, name, 3, 45);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = objCondo.validateText('street', columnWidths, '', 'Ugyldig gatenavn', true, street, 3, 45);


  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = objCondo.validateText('address2', columnWidths, '', 'Ugyldig adresse', true, address2, 0, 45);

  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = objCondo.validateInterval('postalCode', columnWidths, '', 'Ugyldig postnummer', true, Number(postalCode), 1, objCondo.nineNine);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = objCondo.validateText('city', columnWidths, '', 'Ugyldig poststed', true, city, 1, 45);

  // validate squaremeters
  const squareMeters = Number(formatKronerToOre(document.querySelector('.squareMeters').value));
  const validSquareMeters = objCondo.validateInterval('squareMeters', columnWidths, '', 'Ugyldig areal', true, squareMeters, 1, objCondo.nineNine);

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

    
    showFilter( condoId);
    editCondo( condoId);

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