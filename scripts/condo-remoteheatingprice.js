// maintenance of remote heating prices

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objRemoteHeatingPrice = new RemoteHeatingPrice('remoteheatingprice');

const enableChanges = (objRemoteHeatingPrice.securityLevel > 5);
const applicationName = "condo-remoteheatingprice";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objRemoteHeatingPrice.condominiumId === 0) || (objRemoteHeatingPrice.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

            // Show vertical menu
      let html = objRemoteHeatingPrice.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      // Change frame title
      setFrameTitle("menu-frame", "Meny");

      /*
      // Show main menu
      let html = objRemoteHeatingPrice.showHorizontalMenu("filter-frame", objRemoteHeatingPrice.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show remote heating menu
      html = objRemoteHeatingPrice.showHorizontalMenu("filter-frame", objRemoteHeatingPrice.arrayMenuRemoteHeating);
      document.querySelector('.menuRemoteHeating').innerHTML = html;
      objRemoteHeatingPrice.markActivatedApplication(objRemoteHeatingPrice.arrayMenuRemoteHeating, applicationName);
      */

      const resident = 'Y';
      await objUser.loadUsersTable(objRemoteHeatingPrice.condominiumId, resident, objRemoteHeatingPrice.nineNine);
      await objCondo.loadCondoTable(objRemoteHeatingPrice.condominiumId, objRemoteHeatingPrice.nineNine);

      await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId);

      // Show remoteHeatingPrice
      await objRemoteHeatingPrice.getHighestRemoteHeatingPriceId(objRemoteHeatingPrice.condominiumId);
      const remoteHeatingPriceId = objRemoteHeatingPrice.arrayRemoteHeatingPrices[0].remoteHeatingPriceId;
      await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId);

      // Show filter
      showFilter(remoteHeatingPriceId);

      // Show RemoteHeatingPrice
      showRemoteHeatingPrice(remoteHeatingPriceId);

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
  }
}

// Events for remoteheatingprices
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterRemoteHeatingPriceId')) {

      const remoteHeatingPriceId = Number(document.querySelector(".filterRemoteHeatingPriceId").value);
      showFilter(remoteHeatingPriceId);
      await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId, objRemoteHeatingPrice.nineNine, objRemoteHeatingPrice.nineNine);

      showRemoteHeatingPrice(remoteHeatingPriceId);
    };
  });

  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId);
      const remoteHeatingPriceId = objRemoteHeatingPrice.arrayRemoteHeatingPrices.at(-1)?.remoteHeatingPriceId ?? 0;

      // Show filter
      showFilter(remoteHeatingPriceId);
      showRemoteHeatingPrice(remoteHeatingPriceId);
    };
  });

  // update a remoteheatingprices row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const remoteHeatingPriceId = (Number(document.querySelector(".filterRemoteHeatingPriceId").value));
      await updateRemoteHeatingPricesRow(remoteHeatingPriceId);
    };
  });

  // insert a remoteheatingprices row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // Delete a remoteheatingprice row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      let remoteHeatingPriceId = (Number(document.querySelector(".filterRemoteHeatingPriceId").value));
      await deleteRemoteHeatingPricesRow(remoteHeatingPriceId);
      await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId);
      remoteHeatingPriceId = objRemoteHeatingPrice.arrayRemoteHeatingPrices.at(-1)?.remoteHeatingPriceId ?? 0;

      // Show filter
      showFilter(remoteHeatingPriceId);

      // Show remote heating price
      showRemoteHeatingPrice(remoteHeatingPriceId);

    };
  });

  // Insert a remoteheatingprices row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });
}

// Show filter
function showFilter(remoteHeatingPriceId) {

  // Start frame
  let html = startFrame('filter-frame');

  html += objRemoteHeatingPrice.showSelectedRemoteHeatingPricesNew('Pris Fjernvarme', 'filterRemoteHeatingPriceId', '', remoteHeatingPriceId, 'Velg Pris Fjernvarme ', '', true);

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("filter-frame","Filter");
}

// Show remote heating prices
function showRemoteHeatingPrice(remoteHeatingPriceId) {

  const rowNumberRemoteHeatingPrice = objRemoteHeatingPrice.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);

  // Empty line
  let html = emptyLine();

  // Year
  html += startLine();
  const year = (objRemoteHeatingPrice.arrayRemoteHeatingPrices[rowNumberRemoteHeatingPrice].year)
    ? objRemoteHeatingPrice.arrayRemoteHeatingPrices[rowNumberRemoteHeatingPrice].year
    : 0;
  html += showSelectedNumbersNew('År', 'year', '', 2020, 2030, year, enableChanges);
  html += "</div>"

  // price for kilowatt per Hour
  html += startLine();
  let priceKilowattHour = (objRemoteHeatingPrice.arrayRemoteHeatingPrices[rowNumberRemoteHeatingPrice].priceKilowattHour)
    ? objRemoteHeatingPrice.arrayRemoteHeatingPrices[rowNumberRemoteHeatingPrice].priceKilowattHour
    : '';
  priceKilowattHour = formatNumberToNorAmount(priceKilowattHour);
  html += showTextNew('Pris per kilowatTimer', 'priceKilowattHour', priceKilowattHour, enableChanges, '');
  html += "</div>"

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

  document.querySelector('.showRemoteHeatingPrice').innerHTML = html;

  // Buttons
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('cancel', true);
    //disableButton('filterRemoteHeatingId', false);
  }
}

// Delete one remoteHeatingPrice row
async function deleteAccountRow(remoteHeatingPriceId, className) {

  // Check if remoteHeatingPrice row exist
  accountsRowNumber = objRemoteHeatingPrice.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
  if (accountsRowNumber !== -1) {

    // delete remoteHeatingPrice row
    await objRemoteHeatingPrice.deleteAccountsTable(remoteHeatingPriceId, objRemoteHeatingPrice.user);
  }

  await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId);
}

// Update a remoteheatingprices table row
async function updateRemoteHeatingPricesRow(remoteHeatingPriceId) {

  remoteHeatingPriceId = Number(remoteHeatingPriceId);

  // year
  const year = Number(document.querySelector('.year').value)
  let validYear = validateIntervalNew('year', '', 'Ugyldig år', true, year, 2020, 2030);

  // Check if year already exist (year is unique)
  rowNumberRemoteHeatingPrice = objRemoteHeatingPrice.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
  if (rowNumberRemoteHeatingPrice === -1) {

    objRemoteHeatingPrice.arrayRemoteHeatingPrices.forEach(remoteHeatingPrice => {
      if (remoteHeatingPrice.year === year) validYear = false;
    });
  }

  // priceKilowattHour
  let priceKilowattHour = document.querySelector('.priceKilowattHour').value;
  priceKilowattHour = formatNorAmountToNumber(priceKilowattHour);
  const validKilowattHourPrice = validateIntervalNew('priceKilowattHour', '', 'Ugyldig Pris Per Kilowattimer', true, priceKilowattHour, 0, objRemoteHeatingPrice.nineNine);

  // Validate remoteheatingprices columns
  if (validYear && validKilowattHourPrice) {

    /*
    document.querySelector('.showMessage').style.display = "none";

    // Check if the remoteHeatingPrice Id exist
    if (rowNumberRemoteHeatingPrice !== -1) {

      // update a remoteheatingprices row
      await objRemoteHeatingPrice.updateRemoteHeatingPricesTable(objRemoteHeatingPrice.user, remoteHeatingPriceId, year, priceKilowattHour);
      await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId);
    } else {

      // Insert a remoteheatingprices row
      await objRemoteHeatingPrice.insertRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId, objRemoteHeatingPrice.user, year, priceKilowattHour);
      await objRemoteHeatingPrice.getHighestRemoteHeatingPriceId(objRemoteHeatingPrice.condominiumId);
      remoteHeatingPriceId = objRemoteHeatingPrice.arrayRemoteHeatingPrices[0].remoteHeatingPriceId;
      await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId);
    }

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterRemoteHeatingPriceId', false);
    }

    // Show filter
    showFilter(remoteHeatingPriceId);

    // Show remote heating price
    showRemoteHeatingPrice(remoteHeatingPriceId);
  }
  */
    document.querySelector('.showMessage').style.display = "none";

    // Check if the remoteHeatingPrice Id exist
    const rowNumberRemoteHeatingPrice = objRemoteHeatingPrice.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
    if (rowNumberRemoteHeatingPrice !== -1) {

      // update a remoteheatingprices row
      await objRemoteHeatingPrice.updateRemoteHeatingPricesTable(objRemoteHeatingPrice.user, remoteHeatingPriceId, year, priceKilowattHour);
    } else {

      // Insert a remoteheatingprices row
      await objRemoteHeatingPrice.insertRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId, objRemoteHeatingPrice.user, year, priceKilowattHour);
      await objRemoteHeatingPrice.getHighestRemoteHeatingPriceId(objRemoteHeatingPrice.condominiumId);
      remoteHeatingPriceId = objRemoteHeatingPrice.arrayobjRemoteHeatingPrices[0].remoteHeatingPriceId;
    }

     await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterRemoteHeatingPriceId', false);
    }

    // Show filter
    showFilter(remoteHeatingPriceId);

    // Show remoteHeatingPrice
    showRemoteHeatingPrice(remoteHeatingPriceId);
  }
}

// Delete a remoteheatingprices row
async function deleteRemoteHeatingPricesRow(remoteHeatingPriceId) {

  debugger;
  // Check if remoteheatingprices row exist
  rowNumberRemoteHeatingPrice = objRemoteHeatingPrice.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
  if (rowNumberRemoteHeatingPrice !== -1) {

    // delete remoteheatingprices row
    await objRemoteHeatingPrice.deleteRemoteHeatingPricesTable(remoteHeatingPriceId, objRemoteHeatingPrice.user);
  }
}

// Reset values
function resetValues() {

  // year
  document.querySelector('.filterRemoteHeatingPriceId').value = '';

  // year
  document.querySelector('.year').value = '';

  // price kilowatt hour
  document.querySelector('.priceKilowattHour').value = '0,00';

  // Buttons
  removeMessage();
  if (enableChanges) {
    disableButton('delete', true);
    disableButton('insert', true);
    disableButton('cancel', false);
    disableButton('filterRemoteHeatingPriceId', true);
  }
}