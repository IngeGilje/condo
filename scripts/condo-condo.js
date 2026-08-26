// Condo maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');

const enableChanges = (objCondo.securityLevel > 5);
const applicationName = "condo-condo";

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

            // Show vertical menu
      let html = objCondo.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      // Change frame title
      setFrameTitle("menu-frame", "Meny");

      /*
      // Show main menu
      let html = objCondo.showHorizontalMenu("filter-frame", objCondo.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show user menu
      html = objCondo.showHorizontalMenu("filter-frame", objCondo.arrayMenuUser);
      document.querySelector('.menuUser').innerHTML = html;
      objCondo.markActivatedApplication(objCondo.arrayMenuUser, applicationName);
      */

      const resident = 'Y';
      await objUser.loadUsersTable(objCondo.condominiumId, resident, objCondo.nineNine);
      await objCondo.loadCondoTable(objCondo.condominiumId, objCondo.nineNine);

      let condoId = 0;
      if (objCondo.arrayCondo.length > 0) condoId = objCondo.arrayCondo.at(-1)?.condoId;

      // get condoId
      const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === objCondo.userId);
      if (rowNumberUser !== -1) condoId = objUser.arrayUsers[rowNumberUser].condoId;

      // Show header
      //showHeader();

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

      awaitdeleteCondoRow();

      await objCondo.loadCondoTable(objCondo.condominiumId, objCondo.nineNine);

      // Show filter
      const condoId = objCondo.arrayCondo.at(-1)?.condoId ?? 0;
      showFilter(condoId);
      showCondo(condoId);
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
      if (condoId === 0) condoId = objCondo.arrayCondo.at(-1)?.condoId ?? 0;

      showCondo(condoId);
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

// Show filter
function showFilter(condoId) {

  // Start frame
  let html = startFrame('filter-frame');

  // Show condos
  html += objCondo.showSelectedCondosNew('Leilighet', 'filterCondoId', condoId, '', '', true);

  // End frame
  html += "</div>";
  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("filter-frame","Filter");
}

// Maintain condo information
function showCondo(condoId) {

  // row number user
  const rowNumberCondo = objCondo.arrayCondo.findIndex(condo => condo.condoId === condoId);

  // condo
  // Empty line
  let html = emptyLine();

  // condo
  html += startLine();
  /*
  const name = (rowNumberCondo === -1)
    ? ''
    : objCondo.arrayCondo[rowNumberCondo].name.trim();
  */
  const name = objCondo.arrayCondo[rowNumberCondo]?.name ?? '';
  html += showTextNew('Leilighet', 'name', name, enableChanges, "Leilighet");
  html += "</div>";

  // street, address2
  html += startLine();

  // street
  /*
  const street = (rowNumberCondo === -1)
    ? ''
    : objCondo.arrayCondo[rowNumberCondo].street.trim();
  */
  const street = objCondo.arrayCondo[rowNumberCondo]?.street ?? '';
  html += showTextNew('Gate', 'street', street, enableChanges, "Gate");

  // address 2
  /*
  const address2 = (rowNumberCondo === -1)
    ? ''
    : objCondo.arrayCondo[rowNumberCondo].address2.trim();
    */
  const address2 = objCondo.arrayCondo[rowNumberCondo]?.address2 ?? '';
  html += showTextNew('Addresse 2', 'address2', address2, enableChanges, "");
  html += "</div>";

  // post code, city
  html += startLine();

  // post code
  const postalCode = (rowNumberCondo === -1)
    ? ''
    : objCondo.arrayCondo[rowNumberCondo].postalCode;
  html += showTextNew('PostNummer', 'postalCode', postalCode, enableChanges, "Postnummer");

  // City
  /*
  const city = (rowNumberCondo === -1)
    ? ''
    : objCondo.arrayCondo[rowNumberCondo].city.trim();
  */
  const city = objCondo.arrayCondo[rowNumberCondo]?.city ?? '';
  html += showTextNew('Poststed', 'city', city, enableChanges, "Poststed");
  html += "</div>";

  // squareMeters
  html += startLine();
  /*
  let squareMeters = (rowNumberCondo === -1)
    ? ''
    : objCondo.arrayCondo[rowNumberCondo].squareMeters;
  */
  let squareMeters = objCondo.arrayCondo[rowNumberCondo]?.squareMeters ?? '';
  squareMeters = formatNumberToNorAmount(squareMeters);
  html += showTextNew('Areal i m2', 'squareMeters', squareMeters, enableChanges, "Leilighet");
  html += "</div>";

  // Buttons
  if (enableChanges) {

    html += startLine();
    html += showButtonNew('update', 'Oppdater');
    html += showButtonNew('cancel', 'Angre');
    html += "</div>";

    html += startLine();
    html += showButtonNew('delete', 'Slett');
    html += showButtonNew('insert', 'Ny');
    html += "</div>";
  }

  document.querySelector('.showCondo').innerHTML = html;

  //if (enableChanges) document.querySelector('.cancel').disabled = true;
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('cancel', true);
    disableButton('filterCondoId', false, 'white');
  }
}

// Update a condo row
async function updateCondoRow(condoId) {

  if (condoId === '') condoId = -1
  condoId = Number(condoId);
  const validCondoId = validateIntervalNew('condoId', '', 'Ugyldig Leilighet', true, condoId, 0, objCondo.nineNine);

  // validate name
  const name = document.querySelector('.name').value;
  const validName = validateTextNew('name', '', 'Ugyldig Kontonavn', showMessage = true, name, 3, 45);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = validateTextNew('street', '', 'Ugyldig Gatenavn', true, street, 3, 45);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = validateTextNew('address2', '', 'Ugyldig Adresse', true, address2, 0, 45);

  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = validateIntervalNew('postalCode', '', 'Ugyldig postnummer', true, Number(postalCode), 1, 9999);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = validateTextNew('city', '', 'Ugyldig Poststed', true, city, 0, 45);

  // validate squaremeters
  const squareMeters = Number(formatNorAmountToNumber(document.querySelector('.squareMeters').value));
  const validSquareMeters = validateIntervalNew('squareMeters', '', 'Ugyldig Areal', true, squareMeters, 1, 9999);

  if (validCondoId && validName && validStreet && validAddress2 && validPostalCode && validCity && validSquareMeters) {

    /*
    document.querySelector('.showMessage').style.display = "none";
 
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
      condoId = objCondo.arrayCondo.at(-1)?.condoId;
      document.querySelector('.filterCondoId').value = condoId;
    }
 
    removeMessage();
 
    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
          disableButton('update', false);
                disableButton('cancel', true);
      disableButton('filterCondoId', false, 'white');
    }
 
    // show filter
    showFilter(condoId);
 
    // Show condo
    showCondo(condoId);
    */
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
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterCondoId', false);
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
  removeMessage();
  if (enableChanges) {
    disableButton('delete', true);
    disableButton('insert', true);
    disableButton('cancel', false);
    disableButton('filterCondoId', true);
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