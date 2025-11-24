// Condo maintenance

// Activate classes
const today = new Date();
const objUsers = new Users('users');
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

  // Main entry point
  async function main() {

    await objUsers.loadUsersTable(objUserPassword.condominiumId);
    await objCondos.loadCondoTable(objUserPassword.condominiumId);

    const condoId = objCondos.arrayCondo.at(-1).condoId;

    // Show header
    showHeader();

    // Show filter
    showFilter(condoId);

    // Show result
    showResult(condoId);

    // Create events
    createEvents();
  }
}

// Make events for condo
function createEvents() {

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
// Make events for condo
function createEvents() {

  // Select condo
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-condo-condoId')) {

      let CondoId = Number(document.querySelector('.select-condo-condoId').value);
      CondoId = (CondoId !== 0) ? CondoId : objCondos.arrayCondo.at(-1).CondoId;
      if (CondoId) {
        showValues(CondoId);
      }
    }
  });

  // Update condo
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condo-update')) {

      // Update condo and reload condo
      updateCondoSync();

      // Update condo and reload condo
      async function updateCondoSync() {

        // Load condo
        let condoId;
        if (document.querySelector('.select-condo-condoId').value === '') {

          // Insert new row into condo table
          condoId = 0;
        } else {

          // Update existing row in condos table
          condoId = Number(document.querySelector('.select-condo-condoId').value);
        }

        if (validateValues()) {

          await updateCondo(condoId);
          await objCondos.loadCondoTable(objUserPassword.condominiumId);

          // Select last condos if condoId is 0
          if (condoId === 0) condoId = objCondos.arrayCondo.at(-1).condoId;

          // Show leading text
          showLeadingText(condoId);

          // Show all values for condo
          showValues(condoId);
        }

        // Load condos
        let condoId;
        if (document.querySelector('.select-condo-condoId').value === '') {

          // Insert new row into condos table
          condoId = 0;
        } else {

          // Update existing row in condos table
          condoId = Number(document.querySelector('.select-condo-condoId').value);
        }

        await updateCondo(condoId);

        await objCondos.loadCondoTable(objUserPassword.condominiumId);

        // Select last condo if condoId is 0
        if (condoId === 0) condoId = objCondos.arrayCondo.at(-1).condoId;

        // Show leading text
        showLeadingText(condoId);

        // Show all values for condo
        showValues(condoId);
      }
    }
  });

  // New condo
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condo-insert')) {

      resetValues();
    }
  });

  // Delete condo
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condo-delete')) {

      // Delete sondo and reload condos
      deleteCondoSync();

      // Delete condo and reload condos
      async function deleteCondoSync() {

        await deleteCondo();

        // Load condo
        await objCondos.loadCondoTable(objUserPassword.condominiumId);

        // Show leading text
        const condoId = objCondos.arrayCondo.at(-1).condoId;
        showLeadingText(condoId);

        // Show all values for condo
        showValues(condoId);
      };
    };
  });

await deleteCondo();

// Load condos
await objCondos.loadCondoTable(objUserPassword.condominiumId);

// Show leading text
const condoId = objCondos.arrayCondo.at(-1).condoId;
showLeadingText(condoId);

// Show all values for condo
showValues(condoId);

// Cancel
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('button-condo-cancel')) {

    // Reload condo
    reloadCondoSync();
    async function reloadCondoSync() {

      let condominiumId = Number(objUserPassword.condominiumId);
      await objCondos.loadCondoTable(condominiumId);

      // Show leading text for maintenance
      // Select first condo Id
      if (objCondos.arrayCondo.length > 0) {
        condoId = objCondos.arrayCondo[0].condoId;
        showLeadingText(condoId);
      }

      // Show all selected condo
      objCondos.showSelectedCondos('condo-condoId', condoId);

      // Show condo Id
      showValues(condoId);
    }
  }
});
}
*/

/*
// Show leading text for condo
function showLeadingText(condoId) {

  // Show all condos
  objCondos.showSelectedCondos('condo-condoId', condoId);

  // Show condo name
  objCondos.showInput('condo-name', '* Navn', 50, '');

  // Show street name
  objCondos.showInput('condo-street', '* Gateadresse', 50, '');

  // Show address 2
  objCondos.showInput('condo-address2', 'Adresse 2', 50, '');

  // Postal code
  objCondos.showInput('condo-postalCode', '* Postnummer', 4, '');

  // City
  objCondos.showInput('condo-city', '* Poststed', 50, '');

  // square meters
  objCondos.showInput('condo-squareMeters', '* Kvadratmeter', 5, '');

  // show update button
  if (Number(objUserPassword.securityLevel) >= 9) {

    objCondos.showButton('condo-update', 'Oppdater');

    // show new button
    objCondos.showButton('condo-insert', 'Ny');

    // show delete button
    objCondos.showButton('condo-delete', 'Slett');

    // cancel button
    objCondos.showButton('condo-cancel', 'Avbryt');
  }
}
*/

/*
// Show all values for condo
function showValues(condoId) {

  // Check for valid condo Id
  if (condoId >= 0) {

    // find object number for selected condo id
    const condoRowNumber = objCondos.arrayCondo.findIndex(condo => condo.condoId === condoId);
    if (condoRowNumber !== -1) {

      // Condo id
      const condoId = objCondos.arrayCondo[condoRowNumber].condoId;
      objCondos.selectCondoId(condoId, 'condo-condoId')

      // Condo name
      document.querySelector('.input-condo-name').value = objCondos.arrayCondo[condoRowNumber].name;

      // Show street
      document.querySelector('.input-condo-street').value = objCondos.arrayCondo[condoRowNumber].street;

      // Show address 2
      document.querySelector('.input-condo-address2').value = objCondos.arrayCondo[condoRowNumber].address2;

      // Show postal code
      document.querySelector('.input-condo-postalCode').value = objCondos.arrayCondo[condoRowNumber].postalCode;

      // Show city
      document.querySelector('.input-condo-city').value = objCondos.arrayCondo[condoRowNumber].city;

      // Show square meters
      document.querySelector('.input-condo-squareMeters').value = formatOreToKroner(objCondos.arrayCondo[condoRowNumber].squareMeters);
    }
  }
}
*/

/*
// Reset all values for condo
function resetValues() {

  document.querySelector('.select-condo-condoId').value = '';

  document.querySelector('.input-condo-name').value = '';

  // Show street
  document.querySelector('.input-condo-street').value = '';

  // Show address 2
  document.querySelector('.input-condo-address2').value = '';

  // Show postal code
  document.querySelector('.input-condo-postalCode').value = '';

  // Show city
  document.querySelector('.input-condo-city').value = '';

  // Show square meters
  document.querySelector('.input-condo-squareMeters').value = '';

  document.querySelector('.select-condo-condoId').disabled = true;
  document.querySelector('.button-condo-delete').disabled = true;
  document.querySelector('.button-condo-insert').disabled = true;
}
*/

/*
// check for valid condo number
function validateValues() {

  // Check condo name
  const condoName = document.querySelector('.input-condo-name').value;
  const validCondoName = objCondos.validateText(condoName, "label-condo-name", "Navn");

  // Check street name
  const street = document.querySelector('.input-condo-street').value;
  const validStreet = objCondos.validateText(street, "label-condo-street", "Gateadresse");

  // Check postal code
  const postalCode = document.querySelector('.input-condo-postalCode').value;
  const validPostalCode = objCondos.validatePostalCode(postalCode, "label-condo-postalCode", "Postnummer");

  // Validate city
  const city = document.querySelector('.input-condo-city').value;
  const validCity = objCondos.validateText(city, "label-condo-city", "Poststed");

  // Check square meters
  const squareMeters = formatToNorAmount(document.querySelector('.input-condo-squareMeters').value);
  const validSquareMeters = objCondos.validateNorAmount(squareMeters, 'label-condo-squareMeters', "Kvadratmeter");

  return (validCondoName && validStreet && validPostalCode && validCity && validSquareMeters);
}
*/

/*
// Update condo row
async function updateCondoRow(condoId) {

  // Check values
  if (validateValues()) {

    // user
    const user = objUserPassword.email;

    // Condominium
    const condominiumId = Number(objUserPassword.condominiumId);

    // current date
    const lastUpdate = today.toISOString();

    // Condo id
    const condoId = Number(document.querySelector('.select-condo-condoId').value);

    // Condo name
    const name = document.querySelector('.input-condo-name').value;

    // Street
    const street = document.querySelector('.input-condo-street').value;

    // Address 2
    const address2 = document.querySelector('.input-condo-address2').value

    // Postal code
    const postalCode = document.querySelector('.input-condo-postalCode').value;

    // City
    const city = document.querySelector('.input-condo-city').value;

    // Square meters
    //const squareMeters = formatToNorAmount(document.querySelector('.input-condo-squareMeters').value);
    const squareMeters = formatKronerToOre(document.querySelector('.input-condo-squareMeters').value);

    // Check if condo id exist
    const condoRowNumber = objCondos.arrayCondo.findIndex(condo => condo.condoId === condoId);
    if (condoRowNumber !== -1) {

      // update condo
      await objCondos.updateCondoTable(condoId, user, lastUpdate, name, street, address2, postalCode, city, squareMeters);

    } else {

      // Insert condo row in condo table
      await objCondos.insertCondoTable(condominiumId, user, lastUpdate, name, street, address2, postalCode, city, squareMeters);

    }
  }
}
*/

// Delete condo
async function deleteCondo() {

  // Check for valid condo Id
  const condoId = Number(document.querySelector('.select-condo-condoId').value);

  // Check if condo id exist
  const condoRowNumber = objCondos.arrayCondo.findIndex(condo => condo.condoId === condoId);
  if (condoRowNumber !== -1) {

    // delete condo row
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    objCondos.deleteCondoTable(condoId, user, lastUpdate);
  }
}

// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable('width:750px;');

  // Main header
  html += showHTMLMainTableHeader('widht:250px;', '', 'Leilighet', '');

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
    html += showHTMLMainTableHeader('widht:250px;', '', '', '');

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

  const condominiumId = Number(objUserPassword.condominiumId);

  const user = objUserPassword.email;
  const lastUpdate = today.toISOString();

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

  if (validName && validStreet && validAddress2 && validPostalCode && validCity && validSquareMeters) {

    // Check if the condoId exist
    const condoRowNumber = objCondos.arrayCondo.findIndex(condo => condo.condoId === condoId);
    if (condoRowNumber !== -1) {

      // update the condos row
      await objCondos.updateCondoTable(condoId, user, lastUpdate, name, street, address2, postalCode, city, squareMeters);
      await objCondos.loadCondoTable(condominiumId);
    } else {

      // Insert the condo row in condo table
      await objCondos.insertCondoTable(condominiumId, user, lastUpdate, name, street, address2, postalCode, city, squareMeters);
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

    // delete condo row
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    await objCondos.deleteCondoTable(condoId, user, lastUpdate);
  }
}