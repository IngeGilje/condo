// Condo maintenance

// Activate classes
const today = new Date();
const objUsers = new User('user');
const objCondos = new Condo('condo');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

//objCondos.menu();
//objCondos.markSelectedMenu('Leilighet');

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();
  async function main() {

    const resident = 'Y';
    await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
    await objCondos.loadCondoTable(objUserPassword.condominiumId);

    const condoId = objCondos.arrayCondo.at(-1).condoId;

    // Show header
    showHeader();

    // Show filter
    showFilter(condoId);

    // Show result
    showResult(condoId);

    // Events
    events();
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
        showResult(condoId);
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

        showResult(condoId);
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

        showResult(condoId);
      };
    };
  });
}

/*
// Delete a condo row
async function deleteCondoRow() {

  // Check for valid condo Id
  const condoId = Number(document.querySelector('.select-condo-condoId').value);

  // Check if condo id exist
  const condoRowNumber = objCondos.arrayCondo.findIndex(condo => condo.condoId === condoId);
  if (condoRowNumber !== -1) {

    // delete condo row
    const user = objUserPassword.email;
    
    objCondos.deleteCondoTable(condoId, user);
  }
}
*/

// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable('width:750px;');

  // Main header
  html += objCondos.showHTMLMainTableHeaderNew('widht:250px;', '', 'Leilighet', '');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(condoId) {

  // Start table
  html = startHTMLTable('width:750px;');

  // Header filter for search
  html += showHTMLFilterHeader("width:250px;", '', '', '');
  html += showHTMLFilterHeader("width:250px;", '', 'Velg leilighet', '');

  // Filter for search
  html += "<tr>";

  html += "<td></td>";

  // condo
  html += objCondos.showSelectedCondosNew('filterCondoId', 'width:100px;', condoId, '', '')

  html += "</tr>";

  // Header filter for search
  html += showHTMLFilterHeader("width:750px;", '', '', '');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.filter').innerHTML = html;
}

// Show result
function showResult(condoId) {

  // Check if condos row exist
  const condoRowNumber = objCondos.arrayCondo.findIndex(condo => condo.condoId === condoId);
  if (condoRowNumber !== -1) {

    let menuNumber = 0;

    // Start table
    html = startHTMLTable('width:750px;');

    // Main header
    html += objCondos.showHTMLMainTableHeaderNew('widht:250px;', '', '', '');

    // Show menu
    // Header for value including menu
    menuNumber++;
    html += objCondos.showHTMLTableHeader("width:250px;", menuNumber, 'Navn');

    html += "<tr>";

    // Show menu
    html += "<tr>";
    menuNumber++;
    html += objCondos.menuNew(menuNumber);

    // name
    html += objCondos.showInputHTMLNew('name', objCondos.arrayCondo[condoRowNumber].name, 45);

    html += "</tr>";

    // street, address2
    html += "<tr>";
    menuNumber++;
    html += objCondos.showHTMLTableHeader("width:250px;", menuNumber, 'Gate', 'Adresse 2');

    // Show menu
    html += "<tr>";
    menuNumber++;
    html += objCondos.menuNew(menuNumber);

    // street
    html += objCondos.showInputHTMLNew('street', objCondos.arrayCondo[condoRowNumber].street, 45);

    // address2
    html += objCondos.showInputHTMLNew('address2', objCondos.arrayCondo[condoRowNumber].address2, 45);

    html += "</tr>";

    // postalCode, city
    html += "<tr>";
    menuNumber++;
    html += objCondos.showHTMLTableHeader("width:250px;", menuNumber, 'Postnummer', 'Poststed');

    // Show menu
    html += "<tr>";
    menuNumber++;
    html += objCondos.menuNew(menuNumber);

    // postalCode
    html += objCondos.showInputHTMLNew('postalCode', objCondos.arrayCondo[condoRowNumber].postalCode, 4);

    // city
    html += objCondos.showInputHTMLNew('city', objCondos.arrayCondo[condoRowNumber].city, 45);

    html += "</tr>";

    // squareMeters
    html += "<tr>";
    menuNumber++;
    html += objCondos.showHTMLTableHeader("width:250px;", menuNumber, 'Kvadratmeter');

    // Show menu
    menuNumber++;
    html += objCondos.menuNew(menuNumber);

    // squareMeters
    html += objCondos.showInputHTMLNew('squareMeters', formatOreToKroner(objCondos.arrayCondo[condoRowNumber].squareMeters), 10);

    html += "</tr>";

    // Show menu
    html += "<tr>";
    menuNumber++;
    html += objCondos.menuNew(menuNumber);
    html += "</tr>";

    // show buttons
    html += "<tr>";
    // Show menu
    menuNumber++;
    html += objCondos.menuNew(menuNumber);

    html += objCondos.showButtonNew('width:170px;', 'update', 'Oppdater');
    html += objCondos.showButtonNew('width:170px;', 'cancel', 'Angre');
    html += "</tr>";

    // Show menu
    html += "<tr>";
    menuNumber++;
    html += objCondos.menuNew(menuNumber);
    html += "</tr>";

    // show buttons
    html += "<tr>";
    // Show menu
    menuNumber++;
    html += objCondos.menuNew(menuNumber);

    html += objCondos.showButtonNew('width:170px;', 'delete', 'Slett');
    html += objCondos.showButtonNew('width:170px;', 'insert', 'Ny');
    html += "</tr>";

    // Show the rest of the menu
    html += objCondos.showRestMenuNew(menuNumber);

    // The end of the table
    html += endHTMLTable();
    document.querySelector('.result').innerHTML = html;
  }
}

// Update a condo row
async function updateCondoRow(condoId) {

  if (condoId === '') condoId = -1
  condoId = Number(condoId);
  const validCondoId = validateNumberNew(condoId, -1, 999999999);

  const condominiumId = Number(objUserPassword.condominiumId);

  const user = objUserPassword.email;
  

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objCondos.validateTextNew(name, 3, 50);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = objCondos.validateTextNew(street, 3, 50);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = objCondos.validateTextNew(address2, 0, 50);

  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = objCondos.validateIntervalNew(Number(postalCode), 1, 9999);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = objCondos.validateTextNew(city, 1, 50);

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

    showResult(condoId);

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