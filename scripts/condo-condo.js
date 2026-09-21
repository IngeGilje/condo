// Condo maintenance

// Activate classes
const today = new Date();
const objUsers = new Users('users');
const objCondo = new Condo('condo');

const enableChanges = (objCondo.securityLevel > 5);
const applicationName = "condo-condo";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    if ((objCondo.condominiumId === 0) || (objCondo.user === null)) {

      // LogIn is not valid
      const URL = (objUsers.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show menu
      let html = objCondo.showMenu(objCondo.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'Y';
      await objUsers.loadUsersTable(objCondo.condominiumId, resident, objCondo.nineNine);
      await objCondo.loadCondoTable(objCondo.condominiumId, objCondo.nineNine);

      let condoId = 0;
      if (objCondo.arrayCondo.length > 0) condoId = objCondo.arrayCondo.at(-1)?.condoId;

      // get condoId
      const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === objCondo.userId);
      if (rowNumberUser !== -1) condoId = objUsers.arrayUsers[rowNumberUser].condoId;

      // Show filter
      showFilter(condoId);

      // Show result
      showCondo(condoId);

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
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
      showCondo(condoId);
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

      const condoId = Number(document.querySelector('.filterCindoId').value);
      await deleteCondosRow(condoId);
    };
  });

  // Insert a condo row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  /*
  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload condo table
      await objCondo.loadCondoTable(condominiumId, objCondo.nineNine);

      let condoId = Number(document.querySelector('.filterCondoId').value);
      if (condoId === 0) condoId = objCondo.arrayCondo.at(-1)?.condoId ?? 0;

      showCondo(condoId);
    };
  });
  */

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

// Show filter
function showFilter(condoId) {

  // Start frame
  //let html = startTableFilter('filter-frame');

  // Start filter
  let html = startGridFilter("leilighet");

  // Show condos
  html += objCondo.showSelectedCondosNew('filterCondoId', 'Leilighet', condoId, '', '', true);

  /*
  // End frame
  html += "</div>";
  document.querySelector(".showFilter").innerHTML = html;

  // Change frame title
  //setFrameTitle("filter-frame", "Filter");
  */

  // End filter
  html += endGridFilter();
  document.querySelector(".showFilter").innerHTML = html;
}

// Maintain condo information
function showCondo(condoId) {

  // row number user
  const rowNumberCondo = objCondo.arrayCondo.findIndex(condo => condo.condoId === condoId);

  let html = startGrid('Leilighet');

  // condo
  const name = objCondo.arrayCondo[rowNumberCondo]?.name ?? '';
  html += inputText('name', 'Leilighet', name, 45, enableChanges);
  html += "<div></div>";
  //html += "<div></div>";

  // street
  const street = objCondo.arrayCondo[rowNumberCondo]?.street ?? '';
  html += inputText('street', 'Gate', street, 45, enableChanges);

  // address 2
  const address2 = objCondo.arrayCondo[rowNumberCondo]?.address2 ?? '';
  html += inputText('address2', 'Addresse 2', address2, 45, enableChanges);
  //html += "<div></div>";

  // post code
  /*
  const postalCode = (rowNumberCondo === -1)
    ? ''
    : objCondo.arrayCondo[rowNumberCondo].postalCode;
  */
  const postalCode = objCondo.arrayCondo[rowNumberCondo]?.postalCode ?? '';
  html += inputText('postalCode', 'PostNummer', postalCode, 4, enableChanges);

  // City
  const city = objCondo.arrayCondo[rowNumberCondo]?.city ?? '';
  html += inputText('city', 'Poststed', city, 45, enableChanges);
  //html += "<div></div>";

  // squareMeters
  let squareMeters = objCondo.arrayCondo[rowNumberCondo]?.squareMeters ?? '';
  squareMeters = formatNumberToNorAmount(squareMeters);
  html += inputText('squareMeters', 'Areal i m2', squareMeters, 11, enableChanges);
  html += "<div></div>";
  //html += "<div></div>";

  html += endGrid();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update secondary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");
    //html += inputButton("cancel secondary", "Angre", "reset");
    html += inputButton("delete danger", "Slett", "button");

    // End buttons
    html += endButtons();
  }
  document.querySelector('.showCondo').innerHTML = html;
}

// Update a condo row
async function updateCondoRow(condoId) {

  if (condoId === '') condoId = -1
  condoId = Number(condoId);
  const validCondoId = validateIntervalNew('condoId', 'Ugyldig Leilighet',  condoId, 0, objCondo.nineNine);

  // validate name
  const name = document.querySelector('.name').value;
  const validName = validateTextNew('name', 'Ugyldig Kontonavn',  name, 3, 45);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = validateTextNew('street', 'Ugyldig Gatenavn',  street, 3, 45);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = validateTextNew('address2', 'Ugyldig Adresse', address2, 0, 45);

  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = validateIntervalNew('postalCode', 'Ugyldig postnummer', Number(postalCode), 1, 9999);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = validateTextNew('city', 'Ugyldig Poststed', city, 0, 45);

  // validate squaremeters
  let squareMeters = Number(formatNorAmountToNumber(document.querySelector('.squareMeters').value));
  const validSquareMeters = validateIntervalNew('squareMeters', 'Ugyldig Areal', squareMeters, 1,objCondo.nineNine);

  if (validCondoId && validName && validStreet && validAddress2 && validPostalCode && validCity && validSquareMeters) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the condoId exist
    const rowNumberCondo = objCondo.arrayCondo.findIndex(condo => condo.condoId === condoId);
    if (rowNumberCondo !== -1) {

      // update a condo row
      await objCondo.updateCondoTable(condoId, objCondo.user, name, street, address2, postalCode, city, squareMeters);
    } else {

      // Insert the condo row in condo table
      await objCondo.insertCondoTable(objCondo.condominiumId, objCondo.user, name, street, address2, postalCode, city, squareMeters);
      await objCondo.getHighestCondoId(objCondo.condominiumId);
      condoId = objCondo.arrayCondos[0].condoId;
    }

    await objCondo.loadCondoTable(objCondo.condominiumId, objCondo.nineNine);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
    }

    // Show filter
    showFilter(condoId);

    // Show condo
    showCondo(condoId);
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

  // Buttons
  if (enableChanges) {
    disableButton('delete', true);
  }
}

/*
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
*/

// Delete condos row
async function deleteCondosRow(condoId) {

  // Check if condos row exist
  const rowNumberCondos = objCondos.arrayCondos.findIndex(account => account.condoId === condoId);
  if (rowNumberCondos !== -1) {

    // delete condos row
    await objCondos.deleteCondosTable(condoId, objCondos.user);
    await objCondos.getHighestCondoId(objCondos.condominiumId);

    //condoId = objCondos.arrayCondos[0].condoId;
    // Check for empty array
    if (Array.isArray(objCondo.arrayCondos) && objCondo.arrayCondos.length === 0) {

      // Empty array
      condoId = 0;
    } else {

      condoId = objCondo.arrayCondos[0].condoId;
    }
  }

  await objCondos.loadCondosTable(objCondos.condominiumId);

  // Show filter
  showFilter(condoId);

  // Show account
  showCondo(condoId);
}
