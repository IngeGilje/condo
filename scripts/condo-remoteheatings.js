// maintenance of remote heating

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objRemoteHeatingPrice = new RemoteHeatingPrice('remoteheatingprice');
const objRemoteHeatings = new RemoteHeatings('remoteheatings');

// Fixed values
const enableChanges = (objRemoteHeatings.securityLevel > 5);
const applicationName = "condo-remoteheatings";

const columnWidths = [150, 150, 175, 175, 175, 100];

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
      setFrameTitle("menu-frame", "Meny");

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
      await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeatings.condominiumId);

      // Show filter
      const year = today.getFullYear();
      showFilter(year);

      await objRemoteHeatings.loadRemoteHeatingsTable(objRemoteHeatings.condominiumId, objRemoteHeatings.nineNine, objRemoteHeatings.nineNine);

      // Show remoteHeating
      showRemoteHeatings();

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
    if (event.target.classList.contains('filterYear')) {

      const year = Number(document.querySelector(".filterYear").value);
      showFilter(year);
      await objRemoteHeatings.loadRemoteHeatingsTable(objRemoteHeatings.condominiumId, objRemoteHeatings.nineNine, objRemoteHeatings.nineNine);

      showRemoteHeatings();
    };
  });

  // Maintain remoteheatings row
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('change'))) {

      const arrayPrefixes = ['change'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objRemoteHeatings.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let remoteHeatingId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        remoteHeatingId = Number(className.slice(prefix.length));
      }

      let URL = (objRemoteHeatings.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-remoteheating.html?remoteHeatingId=${remoteHeatingId}`;
      window.location.href = URL;
    };
  });
};

// Show filter
function showFilter(year) {

  // Start frame
  let html = startFrame('filter-frame');

  // Show years
  html += showSelectedNumbersNew('År', 'filterYear', 2020, 2030, year, true);

  /*
  // Price/kilowattHour
  const priceKilowattHour = getPriceKilowattHour(year);
  className = `filterPrice`;
  //html += showAmount('Pris KilowatTimer', 'filterPrice', priceKilowattHour, true);
  html += showTextNew('Pris KilowatTimer', 'filterPrice', priceKilowattHour, true, 'Pris KilowatTimer');
  html += "</div>";
  */

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("filter-frame","Filter");
}

// Show remoteheatings
function showRemoteHeatings() {
  let totalPriceYear = 0;

  // start table
  let html = objRemoteHeatings.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  const currentYear = Number(document.querySelector(".filterYear").value);
  const lastYear = currentYear - 1;

  html += objRemoteHeatings.showTableHeader('center', 'Dato', 'Leilighet', `K.timer ${currentYear}`, `K.timer ${lastYear}`, 'Beløp', '');

  objRemoteHeatings.arrayRemoteHeatings.forEach((remoteHeating) => {

    if (remoteHeating.year === currentYear) {

      // insert a table row (<tr></td>)
      html += objRemoteHeatings.insertTableRow('');

      // date
      let date = remoteHeating.date;
      let className = `date${remoteHeating.remoteHeatingId}`;
      date = formatNumberToNorDate(date);
      html += editTableCell(className, date, 10, enableChanges);

      // condoId
      const condoId = remoteHeating.condoId;
      className = `condoId${remoteHeating.remoteHeatingId}`;
      html += objCondo.showSelectedCondos(className, '', condoId, '', '', enableChanges);

      // kilowattHour current year
      let kilowattHour = remoteHeating.kilowattHour;
      className = `kilowattHour${remoteHeating.remoteHeatingId}`;
      kilowattHour = formatNumberToNorAmount(kilowattHour);
      html += editTableCell(className, kilowattHour, 10, enableChanges);

      // kilowattHour last year
      let kilowattHourLastYear = getKilowattHourLastYear(remoteHeating.condoId);
      className = `kilowattHourLastYear${remoteHeating.remoteHeatingId}`;
      kilowattHourLastYear = formatNumberToNorAmount(kilowattHourLastYear);
      html += editTableCell(className, kilowattHourLastYear, 10, false);

      // price for used elcticity/remote heating for one year
      let priceYear = Number(remoteHeating.priceYear);
      if (priceYear === 0) {

        // calculate price for used elcticity/remote heating for one year
        let price = document.querySelector('.filterPrice').value;
        price = formatNumberToNorAmount(price);
        kilowattHour = formatNumberToNorAmount(kilowattHour);
        kilowattHourLastYear = formatNumberToNorAmount(kilowattHourLastYear);
        priceYear = Number(price) * (Number(kilowattHour) - Number(kilowattHourLastYear));
        priceYear = (priceYear / 100);
        priceYear = formatNumberToNorAmount(priceYear);
      } else {

        priceYear = formatNumberToNorAmount(remoteHeating.priceYear);
      }
      className = `priceYear${remoteHeating.remoteHeatingId}`;
      html += editTableCell(className, priceYear, 10, enableChanges);

      // Delete
      let selected = "Ugyldig verdi";
      if (remoteHeating.deleted === 'Y') selected = "Ja";
      if (remoteHeating.deleted === 'N') selected = "Nei";

      className = `change${remoteHeating.remoteHeatingId}`;
      html += objRemoteHeatings.showButton(className, 'Rediger');
      html += "</tr>";

      // accumulate
      priceYear = formatNumberToNorAmount(priceYear);
      totalPriceYear += priceYear;
    }
  });

  // How much to pay for remote heating for all condos
  totalPriceYear = formatNumberToNorAmount(totalPriceYear);

  html += objRemoteHeatings.insertTableRow('', '', '', 'Totalt', totalPriceYear, '', '');
  html += "</tr>";

  // The end of the table
  html += objRemoteHeatings.endTable();
  document.querySelector('.showRemoteHeatings').innerHTML = html;
}

// Insert empty row
function insertEmptyRow() {

  // start new row
  //let html = startRow();

  // insert a table row (<tr></td>)
  html += objRemoteHeatings.insertTableRow('');

  // Date
  const currentYear = Number(document.querySelector(".filterYear").value);
  const lastYear = currentYear - 1;

  let className = `date0`;
  let html = showDate('Dato', className, "", enableChanges)

  // condo Id
  className = `condoId0`;
  html += objCondo.showSelectedCondosNew('Leilighet', className, 0, 'Velg leilighet', '', enableChanges);

  // kilowattHour current year
  className = `kilowattHour0`;
  html += showTextNew(`K.timer ${currentYear}`, className, "", enableChanges, `K.timer ${currentYear}`);

  // kilowattHour last year
  className = `kilowattHourLastYear0`;
  html += showTextNew(`K.timer ${lastYear}`, className, "", enableChanges, `K.timer ${lastYear}`);

  className = `priceYear0`;
  html += showTextNew('Beløp', className, "", enableChanges, 'Beløp');

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

// get number of kilowattHour for last year
function getKilowattHourLastYear(condoId) {

  let kilowattHourLastYear = 0;
  condoId = Number(condoId);

  // Last year
  let year = Number(document.querySelector('.filterYear').value);
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
  objRemoteHeatingPrice.arrayRemoteHeatingPrices.forEach((RremoteHeatingPrice) => {

    if (RremoteHeatingPrice.year === year) priceKilowattHour = Number(RremoteHeatingPrice.priceKilowattHour);
  });

  priceKilowattHour = formatNumberToNorAmount(priceKilowattHour);
  return priceKilowattHour;
}