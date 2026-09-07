// maintenance of remote heating

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objRemoteHeatingPrices = new RemoteHeatingPrices('remoteheatingprices');
const objRemoteHeatings = new RemoteHeatings('remoteheatings');

// Fixed values
const enableChanges = (objRemoteHeatings.securityLevel > 5);
const applicationName = "condo-remoteheating";

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramRemoteHeatingId = Number(queryParameters.get("remoteHeatingId"));

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objRemoteHeatings.condominiumId === 0) || (objRemoteHeatings.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show vertical menu
      let html = objRemoteHeatings.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      // Change frame title
      //setFrameTitle("menu-frame", "Meny");

      /*
      // Show main menu
      let html = objRemoteHeatings.showHorizontalMenu("filter-frame", objRemoteHeatings.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show remote heating menu
      html = objRemoteHeatings.showHorizontalMenu("filter-frame", objRemoteHeatings.arrayMenuRemoteHeating);
      document.querySelector('.menuRemoteHeating').innerHTML = html;
      objRemoteHeatings.markActivatedApplication(objRemoteHeatings.arrayMenuRemoteHeating, applicationName);
      */

      const resident = 'Y';
      await objUser.loadUsersTable(objRemoteHeatings.condominiumId, resident, objRemoteHeatings.nineNine);
      await objCondo.loadCondoTable(objRemoteHeatings.condominiumId, objRemoteHeatings.nineNine);
      await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(objRemoteHeatings.condominiumId);

      await objRemoteHeatings.loadRemoteHeatingsTable(objRemoteHeatings.condominiumId, objRemoteHeatings.nineNine, objRemoteHeatings.nineNine);

      let remoteHeatingId = 0;
      if (paramRemoteHeatingId === 0) {

        await objRemoteHeatings.getHighestRemoteHeatingId(objRemoteHeatings.condominiumId);
        remoteHeatingId = objRemoteHeatings.arrayRemoteHeatings.at(-1)?.remoteHeatingId ?? 0;
      } else {

        remoteHeatingId = paramRemoteHeatingId;
      }

      await objRemoteHeatings.loadRemoteHeatingsTable(objRemoteHeatings.condominiumId, objRemoteHeatings.nineNine, objRemoteHeatings.nineNine);

      // Show filter
      showFilter(remoteHeatingId);

      // Show remoteHeating
      showRemoteHeating(remoteHeatingId);

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
  }
}

// Events for remoteheatings
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterRemoteHeatingId')) {

      const remoteHeatingId = Number(document.querySelector(".filterRemoteHeatingId").value);
      await objRemoteHeatings.loadRemoteHeatingsTable(objRemoteHeatings.condominiumId, objRemoteHeatings.nineNine, objRemoteHeatings.nineNine);

      showRemoteHeating(remoteHeatingId);
    };
  });

  // Delete remoteheatings row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      const remoteHeatingId = Number(document.querySelector(".filterRemoteHeatingId").value);
      await objRemoteHeatings.deleteRemoteHeatingTable(remoteHeatingId, objRemoteHeatings.user);
      await objRemoteHeatings.loadRemoteHeatingsTable(objRemoteHeatings.condominiumId, objRemoteHeatings.nineNine, objRemoteHeatings.nineNine);

      showRemoteHeating(remoteHeatingId);
    };
  });

  // update a remoteheatings row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const remoteHeatingId = Number(document.querySelector(".filterRemoteHeatingId").value);
      await updateRemoteHeatingRow(remoteHeatingId);
    }
  });

  // Delete a remoteheating row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      const remoteHeatingId = Number(className.substring(6));
      await deleteAccountRow(remoteHeatingId, className);

      await objRemoteHeatings.loadRemoteHeatingsTable(objRemoteHeatings.condominiumId, objRemoteHeatings.nineNine, objRemoteHeatings.nineNine);

      showRemoteHeating(remoteHeatingId);
    };
  });
}

// Show filter
function showFilter(remoteHeatingId) {

  // Start frame
  //let html = startFrame('filter-frame');
   // Start filter
  let html = startFilter("Tømmekalender");

  html += objRemoteHeatings.showSelectedRemoteHeatingsNew('filterRemoteHeatingId', 'Fjernvarme', remoteHeatingId, 'Velg fjernvarme', '', true);  // End filter

  /*
  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("filter-frame", "Filter");
  */
 // End filter
  html += endFilter();

  document.querySelector('.showFilter').innerHTML = html;
}

// Show remoteheatings
function showRemoteHeating(remoteHeatingId) {

  const rowNumberRemoteHeating = objRemoteHeatings.arrayRemoteHeatings.findIndex(remoteHeating => remoteHeating.remoteHeatingId === remoteHeatingId);

  let html = startContent('Fjernvarme');
  // Empty line
  //let html = emptyLine();

  // date
  html += startLine();
  let remoteHeatingDate = (objRemoteHeatings.arrayRemoteHeatings[rowNumberRemoteHeating].date)
    ? objRemoteHeatings.arrayRemoteHeatings[rowNumberRemoteHeating].date
    : 0;
  // Format date from yyyymmdd -> yyyy-mm-dd (ISO format)
  remoteHeatingDate = formatNumberToISODate(remoteHeatingDate);
  //html += showDate('Dato', 'remoteHeatingDate', remoteHeatingDate, enableChanges)
  html += inputDate('remoteHeatingDate', 'Dato', remoteHeatingDate, enableChanges)
  html += "</div>";

  // condo Id
  html += startLine();
  let condoId = (objRemoteHeatings.arrayRemoteHeatings[rowNumberRemoteHeating].condoId)
    ? objRemoteHeatings.arrayRemoteHeatings[rowNumberRemoteHeating].condoId
    : 0;
  html += objCondo.showSelectedCondosNew('condoId', 'Leilighet', condoId, '', '', enableChanges);
  html += "</div>";

  // kilowattHour current year
  html += startLine();
  let kilowattHour = (objRemoteHeatings.arrayRemoteHeatings[rowNumberRemoteHeating].kilowattHour)
    ? objRemoteHeatings.arrayRemoteHeatings[rowNumberRemoteHeating].kilowattHour
    : 0;
  kilowattHour = formatNumberToNorAmount(kilowattHour);
  html += showTextNew('kilowattHour','K.timer',  kilowattHour, enableChanges, 'Kontonavn');
  html += "</div>";

  // Price for current year
  html += startLine();
  let priceYear = (objRemoteHeatings.arrayRemoteHeatings[rowNumberRemoteHeating].priceYear)
    ? objRemoteHeatings.arrayRemoteHeatings[rowNumberRemoteHeating].priceYear
    : 0;
  priceYear = formatNumberToNorAmount(priceYear);
  html += showTextNew('priceYear','Beløp',  priceYear, enableChanges, 'Beløp');
  html += "</div>";

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

  if (paramRemoteHeatingId > 0) {
    html += startLine();
    html += showButtonNew('back', 'Tilbake');
    html += "</div>";
  }

  document.querySelector('.showRemoteHeating').innerHTML = html;

  // Buttons
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('cancel', true);
    disableButton('filterRemoteHeatingId', false);
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
  document.querySelector('.showRemoteHeating').innerHTML = html;
}

// Insert empty row
function insertEmptyRow() {

  // start new row
  //let html = startRow();

  // insert a table row (<tr></td>)
  html += objRemoteHeatings.insertTableRow('');

  // Date
  const currentYear = Number(document.querySelector(".filterRemoteHeating").value);
  const lastYear = currentYear - 1;

  let className = `date0`;
  //let html = showDate('Dato', className, "", enableChanges)
  let html = inputDate(className,'Dato',  "", enableChanges);

  // condo Id
  className = `condoId0`;
  html += objCondo.showSelectedCondosNew(className, 'Leilighet', 0, 'Velg leilighet', '', enableChanges);

  // kilowattHour current year
  className = `kilowattHour0`;
  html += showTextNew(className, `K.timer ${currentYear}`, enableChanges, `K.timer ${currentYear}`);

  // kilowattHour last year
  className = `kilowattHourLastYear0`;
  html += showTextNew(className,`K.timer ${lastYear}`,  enableChanges, `K.timer ${lastYear}`);

  className = `priceYear0`;
  html += showTextNew(className,'Beløp',  enableChanges, 'Beløp');

  // end row
  html += showButtonNew('update', '');
  return html;
}

// Delete one remoteHeating row
async function deleteAccountRow(remoteHeatingId, className) {

  // Check if remoteHeating row exist
  accountsRowNumber = objRemoteHeatings.arrayRemoteHeatings.findIndex(remoteHeating => remoteHeating.remoteHeatingId === remoteHeatingId);
  if (accountsRowNumber !== -1) {

    // delete remoteHeating row
    await objRemoteHeatings.deleteAccountsTable(remoteHeatingId, objRemoteHeatings.user);
  }

  await objRemoteHeatings.loadRemoteHeatingsTable(objRemoteHeatings.condominiumId, objRemoteHeatings.nineNine, objRemoteHeatings.nineNine);
}

// Update a remoteheatings table row
async function updateRemoteHeatingRow(remoteHeatingId) {

  remoteHeatingId = Number(remoteHeatingId);

  // date
  let remoteHeatingDate = document.querySelector('.remoteHeatingDate').value;
  remoteHeatingDate = formatISODateToNumber(remoteHeatingDate);
  const validDate = validateIntervalNew('remoteHeatingDate', '', 'Ugyldig Dato', true, remoteHeatingDate, 20150101, 20291231);

  // condoId
  const condoId = Number(document.querySelector('.condoId').value);
  const validCondoId = validateIntervalNew('condoId', '', 'Ugyldig Leilighet', true, condoId, 1, objRemoteHeatings.nineNine);

  // kilowattHour
  let kilowattHour = document.querySelector('.kilowattHour').value;
  kilowattHour = formatNorAmountToNumber(kilowattHour);
  const validkilowattHour = validateIntervalNew('kilowattHour', '', 'Ugyldig Kilowatttime', true, kilowattHour, 1, objRemoteHeatings.nineNine);

  // Price for one year
  let priceYear = document.querySelector('.priceYear').value;
  priceYear = formatNorAmountToNumber(priceYear);
  const validPriceYear = validateIntervalNew('priceYear', '', 'Ugyldig beløp', true, priceYear, 0, objRemoteHeatings.nineNine);

  // Validate remoteheatings columns
  if (validDate && validCondoId && validkilowattHour && validPriceYear) {

    /*
    document.querySelector('.showMessage').style.display = "none";

    // Check if the remoteHeating id exist
    rowNumberRemoteHeating = objRemoteHeatings.arrayRemoteHeatings.findIndex(remoteHeating => remoteHeating.remoteHeatingId === remoteHeatingId);
    if (rowNumberRemoteHeating !== -1) {

      // update a remoteheatings row
      await objRemoteHeatings.updateRemoteHeatingTable(objRemoteHeatings.user, remoteHeatingId, condoId, year, date, kilowattHour, priceYear);
    } else {

      // Insert a remoteheatings row
      await objRemoteHeatings.insertRemoteHeatingTable(objRemoteHeatings.condominiumId, objRemoteHeatings.user, condoId, year, date, kilowattHour, priceYear);
    }

    await objRemoteHeatings.loadRemoteHeatingsTable(objRemoteHeatings.condominiumId, objRemoteHeatings.nineNine, objRemoteHeatings.nineNine);

    showRemoteHeating(remoteHeatingId);
    */

    document.querySelector('.showMessage').style.display = "none";

    // Check if the remoteHeating id exist
    rowNumberRemoteHeating = objRemoteHeatings.arrayRemoteHeatings.findIndex(remoteHeating => remoteHeating.remoteHeatingId === remoteHeatingId);
    if (rowNumberRemoteHeating !== -1) {

      // update a remoteheatings row
      await objRemoteHeatings.updateRemoteHeatingTable(objRemoteHeatings.user, remoteHeatingId, condoId, year, remoteHeatingDate, kilowattHour, priceYear);
    } else {

      // Insert a remoteheatings row
      await objRemoteHeatings.insertRemoteHeatingTable(objRemoteHeatings.condominiumId, objRemoteHeatings.user, condoId, year, remoteHeatingDate, kilowattHour, priceYear);
      await objRemoteHeatings.getHighestRemoteHeatingId(objRemoteHeatings.condominiumId);
      remoteHeatingId = objRemoteHeatings.arrayRemoteHeatings[0].remoteheatingId;
    }

    await objRemoteHeatings.loadRemoteHeatingsTable(objRemoteHeatings.condominiumId, objRemoteHeatings.nineNine, objRemoteHeatings.nineNine);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterRemoteHeatingId', false);
    }

    // Show filter
    showFilter(remoteHeatingId);

    // Show remoteheating row
    showRemoteHeating(remoteHeatingId);
  }
}

// get number of kilowattHour for last year
function getKilowattHourLastYear(condoId) {

  let kilowattHourLastYear = 0;
  condoId = Number(condoId);

  // Last year
  let year = Number(document.querySelector('.filterRemoteHeatingId').value);
  year--;

  objRemoteHeatings.arrayRemoteHeatings.forEach((remoteHeating) => {

    if ((remoteHeating.year === year) && (remoteHeating.condoId === condoId)) kilowattHourLastYear = Number(remoteHeating.kilowattHour);
  });

  return kilowattHourLastYear;
}

// Delete remoteheatings row
async function deleteRemoteHeatingRow(remoteHeatingId) {

  // Check if remoteheatings row exist
  rowNumberRemoteHeating = objRemoteHeatings.arrayRemoteHeatings.findIndex(remoteHeating => remoteHeating.remoteHeatingId === remoteHeatingId);
  if (rowNumberRemoteHeating !== -1) {

    // delete remoteheatings row
    await objRemoteHeatings.deleteRemoteHeatingTable(remoteHeatingId, objRemoteHeatings.user);
  }
}

function getPriceKilowattHour(year) {

  year = Number(year);
  let priceKilowattHour = 0;
  objRemoteHeatingPrices.arrayRemoteHeatingPrices.forEach((RremoteHeatingPrice) => {

    if (RremoteHeatingPrice.year === year) priceKilowattHour = Number(RremoteHeatingPrice.priceKilowattHour);
  });

  priceKilowattHour = formatNumberToNorAmount(priceKilowattHour);
  return priceKilowattHour;
}