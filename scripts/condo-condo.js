// Condo maintenance

// Activate classes
const today = new Date();
const objUsers = new User('user');
const objCondos = new Condo('condo');

testMode();

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();
  async function main() {

    // Check if server is running
    if (await objUsers.checkServer()) {

      const resident = 'Y';
      await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
      await objCondos.loadCondoTable(objUserPassword.condominiumId);

      const condoId = objCondos.arrayCondo.at(-1).condoId;

      let html = objCondos.showHorizontalMenu('width: 750px');
      document.querySelector(".horizontalMenu").innerHTML = html;

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      showFilter(condoId);

      // Show result
      menuNumber = showResult(condoId, menuNumber);

      // Events
      events();
    } else {

      showMessage('Server condo-server.js er ikke startet.');
    }
  }
}

// Events for condo
function events() {

  // Filter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterCondoId')) {

      filterSync();

      async function filterSync() {

        const condominiumId = Number(objUserPassword.condominiumId);
        await objCondos.loadCondoTable(condominiumId);

        const condoId = Number(document.querySelector('.filterCondoId').value);
        let menuNumber = 0;
        menuNumber = showResult(condoId, menuNumber);
      }
    };
  });

  // update/insert a condos row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('update')) {

      updateCondoRowSync();

      // Update a condos row
      async function updateCondoRowSync() {

        const condoId = document.querySelector('.filterCondoId').value;
        updateCondoRow(condoId);
      }
    };
  });

  // Delete condos row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete')) {

      deleteCondoSync();

      async function deleteCondoSync() {

        deleteCondoRow();

        const condominiumId = Number(objUserPassword.condominiumId);
        await objCondos.loadCondoTable(condominiumId);

        // Show filter
        const condoId = objCondos.arrayCondo.at(-1).condoId;
        showFilter(condoId);

        let menuNumber = 0;
        menuNumber = showResult(condoId, menuNumber);
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

        await objCondos.loadCondoTable(objUserPassword.condominiumId);

        let condoId = Number(document.querySelector('.filterCondoId').value);
        if (condoId === 0) condoId = objCondos.arrayCondo.at(-1).condoId;

        // Show filter
        showFilter(condoId);

        let menuNumber = 0;
        menuNumber = showResult(condoId, menuNumber);
      };
    };
  });
}

// Show header
function showHeader() {

  // Start table
  let html = objCondos.startTable('width:750px;');

  // show main header
  html += objCondos.showTableHeader('width:250px;', 'Leilighet');

  // The end of the table
  html += objCondos.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show message
function showMessage(message) {

  // Start table
  let html = objCondos.startTable('width:750px;');

  // show main header
  html += objCondos.showTableHeader('width:250px;', message);

  // The end of the table
  html += objCondos.endTable();
  document.querySelector('.message').innerHTML = html;
}

// Show filter
function showFilter(condoId) {

  // Start table
  html = objCondos.startTable('width:750px;');

  // Header filter
  html += objCondos.showTableHeader('width:250px;', '', 'Velg leilighet', '');

  // start table body
  html += objCondos.startTableBody();

  // insert table columns in start of a row
  html += objCondos.insertTableColumns('', 0, '');

  // condo
  html += objCondos.showSelectedCondos('filterCondoId', 'width:100px;', condoId, '', '')

  html += "</tr>";

  // insert table columns in start of a row
  html += objCondos.insertTableColumns('', 0, '');

  // end table body
  html += objCondos.endTableBody();

  // The end of the table
  html += objCondos.endTable();
  document.querySelector('.filter').innerHTML = html;
}

// Show result
function showResult(condoId, rowNumber) {

  // start table
  let html = objCondos.startTable('width:750px;');

  // table header
  html += objCondos.showTableHeader("width:250px;", '', '', '');

  // Check if condos row exist
  const condoRowNumber = objCondos.arrayCondo.findIndex(condo => condo.condoId === condoId);
  if (condoRowNumber !== -1) {

    // name
    html += "<tr>";

    rowNumber++;
    html += objCondos.showTableHeaderMenu("width:250px;", rowNumber, 'Navn');

    html += "</tr>";

    rowNumber++;
    html += objCondos.insertTableColumns('', rowNumber);

    // name
    html += objCondos.inputTableColumn('name', objCondos.arrayCondo[condoRowNumber].name, 45);

    html += "</tr>";

    // street, address2
    rowNumber++;
    html += objCondos.showTableHeaderMenu("width:250px;", rowNumber, 'Gate', 'Adresse 2');
    //html += objCondos.showLabelError("labelStreet","width:250px;", rowNumber, 'Gate', 'Adresse 2');
    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objCondos.insertTableColumns('', rowNumber);

    // street
    html += objCondos.inputTableColumn('street', objCondos.arrayCondo[condoRowNumber].street, 45);

    // address2
    html += objCondos.inputTableColumn('address2', objCondos.arrayCondo[condoRowNumber].address2, 45);

    html += "</tr>";

    // postalCode, city
    html += "<tr>";
    rowNumber++;
    html += objCondos.showTableHeaderMenu("width:250px;", rowNumber, 'Postnummer', 'Poststed');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondos.insertTableColumns('', rowNumber);

    // postalCode
    html += objCondos.inputTableColumn('postalCode', objCondos.arrayCondo[condoRowNumber].postalCode, 4);

    // city
    html += objCondos.inputTableColumn('city', objCondos.arrayCondo[condoRowNumber].city, 45);

    html += "</tr>";

    // squareMeters
    html += "<tr>";
    rowNumber++;
    html += objCondos.showTableHeaderMenu("width:250px;", rowNumber, 'Kvadratmeter');

    // insert table columns in start of a row
    rowNumber++;
    html += objCondos.insertTableColumns('', rowNumber);

    // squareMeters
    html += objCondos.inputTableColumn('squareMeters', formatOreToKroner(objCondos.arrayCondo[condoRowNumber].squareMeters), 10);

    html += "</tr>";

    // Buttons

    // insert table columns in start of a row
    rowNumber++;
    html += objCondos.insertTableColumns('', rowNumber);

    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objCondos.insertTableColumns('', rowNumber);

    html += objCondos.showButton('width:170px;', 'update', 'Oppdater');
    html += objCondos.showButton('width:170px;', 'cancel', 'Angre');
    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objCondos.insertTableColumns('', rowNumber);

    html += objCondos.showButton('width:170px;', 'delete', 'Slett');
    html += objCondos.showButton('width:170px;', 'insert', 'Ny');
    html += "</tr>";

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
  const validCondoId = objCondos.validateNumber('condoId', condoId, -1, objCondo.nineNine);

  const condominiumId = Number(objUserPassword.condominiumId);

  const user = objUserPassword.email;

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
  const validPostalCode = objCondos.validateIntervalNew(Number(postalCode), 1, 9999);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = objCondos.validateText(city, 1, 50);

  // validate squaremeters
  const squareMeters = Number(formatKronerToOre(document.querySelector('.squareMeters').value));
  const validSquareMeters = objCondos.validateIntervalNew(squareMeters, 1, 100000);

  if (validCondoId && validName && validStreet && validAddress2 && validPostalCode && validCity && validSquareMeters) {

    // Check if the condoId exist
    const condoRowNumber = objCondos.arrayCondo.findIndex(condo => condo.condoId === condoId);
    if (condoRowNumber !== -1) {

      // update the condos row
      await objCondos.updateCondoTable(condoId, user, name, street, address2, postalCode, city, squareMeters);
      await objCondos.loadCondoTable(condominiumId);
    } else {

      // Insert the condo row in condo table
      await objCondos.insertCondoTable(condominiumId, user, name, street, address2, postalCode, city, squareMeters);
      await objCondos.loadCondoTable(condominiumId);
      condoId = objCondos.arrayCondo.at(-1).condoId;
      document.querySelector('.filterCondoId').value = condoId;
    }

    // Show filter
    showFilter(condoId);

    let menuNumber = 0;
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
  const condoRowNumber = objCondos.arrayCondo.findIndex(condo => condo.condoId === condoId);
  if (condoRowNumber !== -1) {

    // delete a condo row
    const user = objUserPassword.email;

    await objCondos.deleteCondoTable(condoId, user);
  }
}