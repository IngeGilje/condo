// Appartment maintenance

// Activate classes
const today = new Date();
const objUsers = new Users('users');
const objAppartments = new Appartments('appartments');

const enableChanges = (objAppartments.securityLevel > 5);
const applicationName = "condo";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    if ((objAppartments.condominiumId === 0) || (objAppartments.user === null)) {

      // LogIn is not valid
      const URL = (objUsers.serverStatus === 1)
        ? 'http://ingegilje.no/login.html'
        : 'http://localhost/login.html';
      window.location.href = URL;
    } else {

      // Show menu
      let html = objAppartments.showMenu(objAppartments.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'Y';
      await objUsers.loadUsersTable(objAppartments.condominiumId, resident, objAppartments.nineNine);
      await objAppartments.loadCondoTable(objAppartments.condominiumId);

      //let appartmentId = 0;
      //if (objAppartments.arrayCondo.length > 0) appartmentId = objAppartments.arrayCondo.at(-1)?.appartmentId;
      const appartmentId = objAppartments.arrayCondo.at(-1)?.appartmentId ?? 0;

      // get appartmentId
      //const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === objAppartments.userId);
      //if (rowNumberUser !== -1) appartmentId = objUsers.arrayUsers[rowNumberUser].appartmentId;

      // Show filter
      showFilter(appartmentId);

      // Show result
      showCondo(appartmentId);

      // Events
      events();
    }
  } else {

    showMessage('Server er ikke startet.');
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

      const appartmentId = Number(document.querySelector('.filterCondoId').value);
      showCondo(appartmentId);
    };
  });

  // update/insert a condo row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Update a condo row
      const appartmentId = Number(document.querySelector(".filterCondoId").value);
      updateCondoRow(appartmentId);
    };
  });

  /*
  // Delete condo row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      const appartmentId = Number(document.querySelector('.filterCondoId').value);
      await deleteCondoRow(appartmentId);
    };
  });
  */
  // Show delete dialog
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      inputDialog("dialog", "Vil du slette kontoen?");
    };
  });

  // OK to delete a condo row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('okButton')) {

      const appartmentId = Number(document.querySelector('.filterCondoId').value);
      await deleteCondoRow(appartmentId);
      //document.querySelector('.showDialog').style.display = "none";
      const dialog = document.querySelector('.dialog');
      dialog.close();
    };
  });

  // Not OK to delete a condo row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancelButton')) {

      //document.querySelector('.showDialog').style.display = "none";
      const dialog = document.querySelector('.dialog');
      dialog.close();
    };
  });

  // Insert a condo row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objAppartments.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}login.html`;
      window.location.href = url;
    };
  });
}

// Show filter
function showFilter(appartmentId) {

  // Start frame
  //let html = startLineFilter('filter-frame');

  // Start filter
  let html = startBoxFilter("leilighet");

  // Show condo
  html += objAppartments.showSelectedCondosNew('filterCondoId', 'Leilighet', appartmentId, '', '', true);

  // End filter
  html += endBoxFilter();
  document.querySelector(".showFilter").innerHTML = html;
}

// Maintain condo information
function showCondo(appartmentId) {

  // row number user
  const rowNumberCondo = objAppartments.arrayCondo.findIndex(condo => condo.appartmentId === appartmentId);

  let html = startGrid('Leilighet');

  // condo
  const name = objAppartments.arrayCondo[rowNumberCondo]?.name ?? '';
  html += inputText('name', 'Leilighet', name, 45, enableChanges);
  html += "<div></div>";
  //html += "<div></div>";

  // street
  const street = objAppartments.arrayCondo[rowNumberCondo]?.street ?? '';
  html += inputText('street', 'Gate', street, 45, enableChanges);

  // address 2
  const address2 = objAppartments.arrayCondo[rowNumberCondo]?.address2 ?? '';
  html += inputText('address2', 'Addresse 2', address2, 45, enableChanges);
  //html += "<div></div>";

  // post code
  /*
  const postalCode = (rowNumberCondo === -1)
    ? ''
    : objAppartments.arrayCondo[rowNumberCondo].postalCode;
  */
  const postalCode = objAppartments.arrayCondo[rowNumberCondo]?.postalCode ?? '';
  html += inputText('postalCode', 'PostNummer', postalCode, 4, enableChanges);

  // City
  const city = objAppartments.arrayCondo[rowNumberCondo]?.city ?? '';
  html += inputText('city', 'Poststed', city, 45, enableChanges);
  //html += "<div></div>";

  // squareMeters
  let squareMeters = objAppartments.arrayCondo[rowNumberCondo]?.squareMeters ?? '';
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
async function updateCondoRow(appartmentId) {

  // validate name
  const name = document.querySelector('.name').value;
  const validName = validateText('name', 'Ugyldig Kontonavn', name, 3, 45);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = validateText('street', 'Ugyldig Gatenavn', street, 3, 45);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = validateText('address2', 'Ugyldig Adresse', address2, 0, 45);

  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = validateIntervalNew('postalCode', 'Ugyldig postnummer', Number(postalCode), 1, 9999);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = validateText('city', 'Ugyldig Poststed', city, 0, 45);

  // validate squaremeters
  let squareMeters = Number(formatNorAmountToNumber(document.querySelector('.squareMeters').value));
  const validSquareMeters = validateIntervalNew('squareMeters', 'Ugyldig Areal', squareMeters, 1, objAppartments.nineNine);

  if (validName && validStreet && validAddress2 && validPostalCode && validCity && validSquareMeters) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the appartmentId exist
    const rowNumberCondo = objAppartments.arrayCondo.findIndex(condo => condo.appartmentId === appartmentId);
    if (rowNumberCondo !== -1) {

      // update a condo row
      await objAppartments.updateCondoTable(appartmentId, objAppartments.user, name, street, address2, postalCode, city, squareMeters);
    } else {

      // Insert the condo row in condo table
      await objAppartments.insertCondoTable(objAppartments.condominiumId, objAppartments.user, name, street, address2, postalCode, city, squareMeters);
      await objAppartments.getHighestCondoId(objAppartments.condominiumId);
      appartmentId = objAppartments.arrayCondo[0].appartmentId;
    }

    await objAppartments.loadCondoTable(objAppartments.condominiumId);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
    }

    // Show filter
    showFilter(appartmentId);

    // Show condo
    showCondo(appartmentId);
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

// Delete condo row
async function deleteCondoRow(appartmentId) {

  // Check if condo row exist
  const rowNumberCondo = objAppartments.arrayCondo.findIndex(condo => condo.appartmentId === appartmentId);
  if (rowNumberCondo !== -1) {

    // delete condo row
    await objAppartments.deleteCondoTable(appartmentId, objAppartments.user);
    await objAppartments.getHighestCondoId(objAppartments.condominiumId);

    // Check for empty array
    appartmentId = 0;
    if (objAppartments.arrayCondo.length > 0) appartmentId = objAppartments.arrayCondo[0].appartmentId;
  }

  await objAppartments.loadCondoTable(objAppartments.condominiumId);

  // Show filter
  showFilter(appartmentId);

  // Show account
  showCondo(appartmentId);
}
