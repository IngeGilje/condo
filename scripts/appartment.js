// Appartment maintenance

// Activate classes
const today = new Date();
const objUsers = new Users('users');
const objAppartments = new Appartments('appartments');

const enableChanges = (objAppartments.securityLevel > 5);
const applicationName = "appartment";

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
      const html = objAppartments.showMenu(objAppartments.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'Y';
      await objUsers.loadUsersTable(objAppartments.condominiumId, resident, objAppartments.nineNine);
      await objAppartments.loadAppartmentsTable(objAppartments.condominiumId);

      //let appartmentId = 0;
      //if (objAppartments.arrayAppartments.length > 0) appartmentId = objAppartments.arrayAppartments.at(-1)?.appartmentId;
      const appartmentId = objAppartments.arrayAppartments.at(-1)?.appartmentId ?? 0;

      // get appartmentId
      //const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === objAppartments.userId);
      //if (rowNumberUser !== -1) appartmentId = objUsers.arrayUsers[rowNumberUser].appartmentId;

      // Show filter
      showFilter(appartmentId);

      // Show result
      showAppartment(appartmentId);

      // Events
      events();
    }
  } else {

    showMessage('Server er ikke startet.');
  }
}

// Events for appartment
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
    if (event.target.classList.contains('filterAppartmentId')) {

      const appartmentId = Number(document.querySelector('.filterAppartmentId').value);
      showAppartment(appartmentId);
    };
  });

  // update/insert a appartment row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Update a appartment row
      const appartmentId = Number(document.querySelector(".filterAppartmentId").value);
      updateAppartmentRow(appartmentId);
    };
  });

  /*
  // Delete appartment row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      const appartmentId = Number(document.querySelector('.filterAppartmentId').value);
      await deleteAppartmentRow(appartmentId);
    };
  });
  */
  // Show delete dialog
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      inputDialog("dialog", "Vil du slette kontoen?");
    };
  });

  // OK to delete a appartment row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('okButton')) {

      const appartmentId = Number(document.querySelector('.filterAppartmentId').value);
      await deleteAppartmentRow(appartmentId);
      //document.querySelector('.showDialog').style.display = "none";
      const dialog = document.querySelector('.dialog');
      dialog.close();
    };
  });

  // Not OK to delete a appartment row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancelButton')) {

      //document.querySelector('.showDialog').style.display = "none";
      const dialog = document.querySelector('.dialog');
      dialog.close();
    };
  });

  // Insert a appartment row
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

  // Show appartment
  html += objAppartments.showSelectedAppartmentsNew('filterAppartmentId', 'Leilighet', appartmentId, '', '', true);

  // End filter
  html += endBoxFilter();
  document.querySelector(".showFilter").innerHTML = html;
}

// Maintain appartment information
function showAppartment(appartmentId) {

  // row number user
  const rowNumberAppartments = objAppartments.arrayAppartments.findIndex(appartment => appartment.appartmentId === appartmentId);

  let html = startGrid('Leilighet');

  // appartment
  const name = objAppartments.arrayAppartments[rowNumberAppartments]?.name ?? '';
  html += inputText('name', 'Leilighet', name, 45, enableChanges);
  html += "<div></div>";
  //html += "<div></div>";

  // street
  const street = objAppartments.arrayAppartments[rowNumberAppartments]?.street ?? '';
  html += inputText('street', 'Gate', street, 45, enableChanges);

  // address 2
  const address2 = objAppartments.arrayAppartments[rowNumberAppartments]?.address2 ?? '';
  html += inputText('address2', 'Addresse 2', address2, 45, enableChanges);
  //html += "<div></div>";

  // post code
  const postalCode = objAppartments.arrayAppartments[rowNumberAppartments]?.postalCode ?? '';
  html += inputText('postalCode', 'PostNummer', postalCode, 4, enableChanges);

  // City
  const city = objAppartments.arrayAppartments[rowNumberAppartments]?.city ?? '';
  html += inputText('city', 'Poststed', city, 45, enableChanges);
  //html += "<div></div>";

  // squareMeters
  let squareMeters = objAppartments.arrayAppartments[rowNumberAppartments]?.squareMeters ?? '';
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
  document.querySelector('.showAppartment').innerHTML = html;
}

// Update a appartment row
async function updateAppartmentRow(appartmentId) {

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
    const rowNumberAppartments = objAppartments.arrayAppartments.findIndex(appartment => appartment.appartmentId === appartmentId);
    if (rowNumberAppartments !== -1) {

      // update a appartment row
      await objAppartments.updateAppartmentTable(appartmentId, objAppartments.user, name, street, address2, postalCode, city, squareMeters);
    } else {

      // Insert the appartment row in appartment table
      await objAppartments.insertAppartmentTable(objAppartments.condominiumId, objAppartments.user, name, street, address2, postalCode, city, squareMeters);
      await objAppartments.getHighestAppartmentd(objAppartments.condominiumId);
      appartmentId = objAppartments.arrayAppartments[0].appartmentId;
    }

    await objAppartments.loadAppartmentsTable(objAppartments.condominiumId);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
    }

    // Show filter
    showFilter(appartmentId);

    // Show appartment
    showAppartment(appartmentId);
  }
}

// Reset all values for appartment
function resetValues() {

  document.querySelector('.filterAppartmentId').value = '';

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

  document.querySelector('.filterAppartmentId').disabled = true;

  // Buttons
  if (enableChanges) {
    disableButton('delete', true);
  }
}

// Delete appartment row
async function deleteAppartmentRow(appartmentId) {

  // Check if appartment row exist
  const rowNumberAppartments = objAppartments.arrayAppartments.findIndex(appartment => appartment.appartmentId === appartmentId);
  if (rowNumberAppartments !== -1) {

    // delete appartment row
    await objAppartments.deleteAppartmentTable(appartmentId, objAppartments.user);
    await objAppartments.getHighestAppartmentd(objAppartments.condominiumId);

    // Check for empty array
    appartmentId = 0;
    if (objAppartments.arrayAppartments.length > 0) appartmentId = objAppartments.arrayAppartments[0].appartmentId;
  }

  await objAppartments.loadAppartmentsTable(objAppartments.condominiumId);

  // Show filter
  showFilter(appartmentId);

  // Show account
  showAppartment(appartmentId);
}
