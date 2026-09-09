// maintenance of remote heating prices

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objRemoteHeatingPrices = new RemoteHeatingPrices('remoteheatingprices');

const enableChanges = (objRemoteHeatingPrices.securityLevel > 5);
const applicationName = "condo-remoteheatingprice";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objRemoteHeatingPrices.condominiumId === 0) || (objRemoteHeatingPrices.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show menu
      let html = objRemoteHeatingPrices.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objRemoteHeatingPrices.condominiumId, resident, objRemoteHeatingPrices.nineNine);
      await objCondo.loadCondoTable(objRemoteHeatingPrices.condominiumId, objRemoteHeatingPrices.nineNine);

      await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(objRemoteHeatingPrices.condominiumId);

      // Show remoteHeatingPrice
      await objRemoteHeatingPrices.getHighestRemoteHeatingPriceId(objRemoteHeatingPrices.condominiumId);
      const remoteHeatingPriceId = objRemoteHeatingPrices.arrayRemoteHeatingPrices[0].remoteHeatingPriceId;
      await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(objRemoteHeatingPrices.condominiumId);

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
      await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(objRemoteHeatingPrices.condominiumId, objRemoteHeatingPrices.nineNine, objRemoteHeatingPrices.nineNine);

      showRemoteHeatingPrice(remoteHeatingPriceId);
    };
  });

  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(objRemoteHeatingPrices.condominiumId);
      const remoteHeatingPriceId = objRemoteHeatingPrices.arrayRemoteHeatingPrices.at(-1)?.remoteHeatingPriceId ?? 0;

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
      await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(objRemoteHeatingPrices.condominiumId);
      remoteHeatingPriceId = objRemoteHeatingPrices.arrayRemoteHeatingPrices.at(-1)?.remoteHeatingPriceId ?? 0;

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

  // Start filter
  let html = startFilter("Tømmekalender");

  html += objRemoteHeatingPrices.showSelectedRemoteheatingPricesNew('filterRemoteHeatingPriceId', 'Pris Fjernvarme', remoteHeatingPriceId, 'Velg Pris Fjernvarme ', '', true);

  // End filter
  html += endFilter();

  document.querySelector(".showFilter").innerHTML = html;
}

// Show remote heating prices
function showRemoteHeatingPrice(remoteHeatingPriceId) {

  const rowNumberRemoteHeatingPrice = objRemoteHeatingPrices.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);

  let html = startContent('Fjernvarmepris');

  // Year
  const year = (objRemoteHeatingPrices.arrayRemoteHeatingPrices[rowNumberRemoteHeatingPrice].year)
    ? objRemoteHeatingPrices.arrayRemoteHeatingPrices[rowNumberRemoteHeatingPrice].year
    : 0;
  html += inputSelectedNumbers('year', 'År', 2020, 2030, year, enableChanges);
  html += "<div></div>";
  html += "<div></div>";

  // price for kilowatt per Hour
  let priceKilowattHour = (objRemoteHeatingPrices.arrayRemoteHeatingPrices[rowNumberRemoteHeatingPrice].priceKilowattHour)
    ? objRemoteHeatingPrices.arrayRemoteHeatingPrices[rowNumberRemoteHeatingPrice].priceKilowattHour
    : '';
  priceKilowattHour = formatNumberToNorAmount(priceKilowattHour);
  html += inputText('priceKilowattHour', 'Pris kilowatTimer', priceKilowattHour, enableChanges);
  html += "<div></div>";
  html += "<div></div>";


  /*
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
  */
  html += endContent();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update primary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");
    html += inputButton("cancel secondary", "Angre", "reset");
    html += inputButton("back secondary", "Tilbake", "button");
    html += inputButton("delete danger", "Slett", "button");

    // End buttons
    html += endButtons();
  }

  document.querySelector('.showRemoteHeatingPrice').innerHTML = html;
}

// Delete one remoteHeatingPrice row
async function deleteAccountRow(remoteHeatingPriceId, className) {

  // Check if remoteHeatingPrice row exist
  accountsRowNumber = objRemoteHeatingPrices.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
  if (accountsRowNumber !== -1) {

    // delete remoteHeatingPrice row
    await objRemoteHeatingPrices.deleteAccountsTable(remoteHeatingPriceId, objRemoteHeatingPrices.user);
  }

  await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(objRemoteHeatingPrices.condominiumId);
}

// Update a remoteheatingprices table row
async function updateRemoteHeatingPricesRow(remoteHeatingPriceId) {

  remoteHeatingPriceId = Number(remoteHeatingPriceId);

  // year
  const year = Number(document.querySelector('.year').value)
  let validYear = validateIntervalNew('year', 'Ugyldig år', true, year, 2020, 2030);

  // Check if year already exist (year is unique)
  rowNumberRemoteHeatingPrice = objRemoteHeatingPrices.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
  if (rowNumberRemoteHeatingPrice === -1) {

    objRemoteHeatingPrices.arrayRemoteHeatingPrices.forEach(remoteHeatingPrice => {
      if (remoteHeatingPrice.year === year) validYear = false;
    });
  }

  // priceKilowattHour
  let priceKilowattHour = document.querySelector('.priceKilowattHour').value;
  priceKilowattHour = formatNorAmountToNumber(priceKilowattHour);
  const validKilowattHourPrice = validateIntervalNew('priceKilowattHour', 'Ugyldig Pris Per Kilowattimer', true, priceKilowattHour, 0, objRemoteHeatingPrices.nineNine);

  // Validate remoteheatingprices columns
  if (validYear && validKilowattHourPrice) {

    /*
    document.querySelector('.showMessage').style.display = "none";

    // Check if the remoteHeatingPrice Id exist
    if (rowNumberRemoteHeatingPrice !== -1) {

      // update a remoteheatingprices row
      await objRemoteHeatingPrices.updateRemoteHeatingPricesTable(objRemoteHeatingPrices.user, remoteHeatingPriceId, year, priceKilowattHour);
      await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(objRemoteHeatingPrices.condominiumId);
    } else {

      // Insert a remoteheatingprices row
      await objRemoteHeatingPrices.insertRemoteHeatingPricesTable(objRemoteHeatingPrices.condominiumId, objRemoteHeatingPrices.user, year, priceKilowattHour);
      await objRemoteHeatingPrices.getHighestRemoteHeatingPriceId(objRemoteHeatingPrices.condominiumId);
      remoteHeatingPriceId = objRemoteHeatingPrices.arrayRemoteHeatingPrices[0].remoteHeatingPriceId;
      await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(objRemoteHeatingPrices.condominiumId);
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
    const rowNumberRemoteHeatingPrice = objRemoteHeatingPrices.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
    if (rowNumberRemoteHeatingPrice !== -1) {

      // update a remoteheatingprices row
      await objRemoteHeatingPrices.updateRemoteHeatingPricesTable(objRemoteHeatingPrices.user, remoteHeatingPriceId, year, priceKilowattHour);
    } else {

      // Insert a remoteheatingprices row
      await objRemoteHeatingPrices.insertRemoteHeatingPricesTable(objRemoteHeatingPrices.condominiumId, objRemoteHeatingPrices.user, year, priceKilowattHour);
      await objRemoteHeatingPrices.getHighestRemoteHeatingPriceId(objRemoteHeatingPrices.condominiumId);
      remoteHeatingPriceId = objRemoteHeatingPrices.arrayobjRemoteHeatingPrices[0].remoteHeatingPriceId;
    }

    await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(objRemoteHeatingPrices.condominiumId);

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
  rowNumberRemoteHeatingPrice = objRemoteHeatingPrices.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
  if (rowNumberRemoteHeatingPrice !== -1) {

    // delete remoteheatingprices row
    await objRemoteHeatingPrices.deleteRemoteHeatingPricesTable(remoteHeatingPriceId, objRemoteHeatingPrices.user);
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