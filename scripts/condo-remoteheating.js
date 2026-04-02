// maintenance of remote heating

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objRemoteHeatingPrice = new RemoteHeatingPrice('remoteheatingprice');
const objRemoteHeating = new RemoteHeating('remoteheating');

const enableChanges = (objRemoteHeating.securityLevel > 5);

const tableWidth = 'width:1250px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objRemoteHeating.condominiumId === 0 || objRemoteHeating.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'Y';
      await objUser.loadUsersTable(condominiumId, resident, objRemoteHeating.nineNine);
      await objCondo.loadCondoTable(condominiumId);
      await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(condominiumId);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      const year = today.getFullYear();
      menuNumber = showFilter(menuNumber, year);

      await objRemoteHeating.loadRemoteHeatingTable(condominiumId, objRemoteHeating.nineNine, objRemoteHeating.nineNine);

      // Show remoteHeating
      menuNumber = showResult(menuNumber);

      // Events
      events();
    }
  } else {

    objRemoteHeating.showMessage(objRemoteHeating, '', 'condo-server.js er ikke startet.');
  }
}

// Events for remoteheatings
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterYear')
      || event.target.classList.contains('filterPrice')) {

      let menuNumber = 0;

      const year = Number(document.querySelector(".filterYear").value);
      //menuNumber = showFilter(menuNumber, year);
      await objRemoteHeating.loadRemoteHeatingTable(condominiumId, objRemoteHeating.nineNine, objRemoteHeating.nineNine);

      //menuNumber = showResult(menuNumber);
      showResult(3);
    };
  });

  // Delete remoteheatings row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['delete'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objRemoteHeating.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      const classNameDelete = `.${className}`
      const deleteRemoteHeatingRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteRemoteHeatingRowValue === "Ja") {

        const remoteHeatingId = Number(className.substring(6));
        await deleteRemoteHeatingRow(remoteHeatingId, className);

        await objRemoteHeating.loadRemoteHeatingTable(condominiumId, objRemoteHeating.nineNine, objRemoteHeating.nineNine);

        let menuNumber = 0;
        menuNumber = showResult(menuNumber);
      };
    };
  });

  // update a remoteheatings row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['date', 'condoId', 'kilowattHour', 'priceYear'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[2]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[3]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objRemoteHeating.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract remoteHeatingId in the class name
      let remoteHeatingId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        remoteHeatingId = Number(className.slice(prefix.length));
      }

      await updateRemoteHeatingRow(remoteHeatingId);
    };
  });

  // Delete suppliers row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      const arrayPrefixes = ['delete'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objRemoteHeating.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      //const className = objRemoteHeating.getDeleteClass(event.target);
      const classNameDelete = `.${className}`
      const deleteAccountRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteAccountRowValue === "Ja") {

        const remoteHeatingId = Number(className.substring(6));
        deleteAccountRow(remoteHeatingId, className);

        await objRemoteHeating.loadRemoteHeatingTable(condominiumId, objRemoteHeating.nineNine, objRemoteHeating.nineNine);

        let menuNumber = 0;
        menuNumber = showResult(menuNumber);
      };
    };
  });
  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objRemoteHeating.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

/*
// Show header
function showHeader() {

  // Start table
  let html = objRemoteHeating.startTable(tableWidth);

  // show main header
  html += objRemoteHeating.showTableHeader('width:175px;', 'Fjernvarme');

  // The end of the table header
  html += objRemoteHeating.endTableHeader();

  // The end of the table
  html += objRemoteHeating.endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  html = objRemoteHeating.startTable(tableWidth);

  // start table body
  html += objRemoteHeating.startTableBody();

  // show main header
  html += objRemoteHeating.showTableHeaderLogOut('width:175px;', '', '', '', '', 'Fjernvarme', '', '');
  html += "</tr>";

  // end table body
  html += objRemoteHeating.endTableBody();

  // The end of the table
  html += objRemoteHeating.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(menuNumber, year) {

  // Start table
  html = objRemoteHeating.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objRemoteHeating.showTableHeaderMenu('width:175px;', menuNumber, '', 'År', 'Pris per kiloWattimer', '', '', '');

  // start table body
  html += objRemoteHeating.startTableBody();

  // insert table columns in start of a row
  menuNumber++;
  html += objRemoteHeating.insertTableColumns('', menuNumber, '');

  // Select year
  html += objRemoteHeating.selectInterval('filterYear', 'width:175px;', 2020, 2030, year, true);

  // Price/kilowattHour
  const priceKilowattHour = getPriceKilowattHour(year);
  className = `filterPrice`;
  html += objRemoteHeating.inputTableColumn(className, '', priceKilowattHour, 10, true);

  html += "<td></td><td></td><td></td></tr>";

  // insert table columns in start of a row
  menuNumber++;
  html += objRemoteHeating.insertTableColumns('', menuNumber, '', '', '', '', '', '');

  // end table body
  html += objRemoteHeating.endTableBody();

  // The end of the table
  html += objRemoteHeating.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Insert empty table row
function insertEmptyTableRow(menuNumber) {

  let html = "";
  let date = "";

  // insert table columns in start of a row
  html += objRemoteHeating.insertTableColumns('', menuNumber);

  html += "<td class='center'>Ny fjernvarme</td>";

  // Date
  html += objRemoteHeating.inputTableColumn('date0', '', '', 10, enableChanges);

  // condoId
  html += objCondo.showSelectedCondos('condoId0', 'width:175px;', 0, 'Ikke valgt', '', enableChanges);

  // kilowattHour this year
  html += objRemoteHeating.inputTableColumn('kilowattHour0', '', "0,00", 10, enableChanges);

  // kilowattHour last year
  html += objRemoteHeating.inputTableColumn('kilowattHourLastYear0', '', "0,00", 10, enableChanges);

  // price for remote heating for one year
  html += objRemoteHeating.inputTableColumn('priceYear0', '', "0,00", 10, enableChanges);

  html += "</tr>";
  return html;
}

// Show remoteheatings
function showResult(menuNumber) {

  let totalPriceYear = 0;

  // start table
  let html = objRemoteHeating.startTable(tableWidth);

  // table header
  const currentYear = Number(document.querySelector(".filterYear").value);
  const lastYear = currentYear - 1;
  menuNumber++;
  html += objRemoteHeating.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, 'Slett', 'Dato', 'Leilighet', `K.timer ${currentYear}`, `K.timer ${lastYear}`, 'Beløp');

  objRemoteHeating.arrayRemoteHeatings.forEach((remoteHeating) => {

    if (remoteHeating.year === currentYear) {

      // insert table columns in start of a row
      menuNumber++;
      html += objRemoteHeating.insertTableColumns('', menuNumber);

      // Delete
      let selected = "Ugyldig verdi";
      if (remoteHeating.deleted === 'Y') selected = "Ja";
      if (remoteHeating.deleted === 'N') selected = "Nei";

      let className = `delete${remoteHeating.remoteHeatingId}`;
      html += objRemoteHeating.showSelectedValues(className, 'width:175px;', enableChanges, selected, 'Nei', 'Ja')

      // date
      let date = remoteHeating.date;
      className = `date${remoteHeating.remoteHeatingId}`;
      date = formatToNorDate(date);
      html += objRemoteHeating.inputTableColumn(className, '', date, 10, enableChanges);

      // condoId
      const condoId = remoteHeating.condoId;
      className = `condoId${remoteHeating.remoteHeatingId}`;
      html += objCondo.showSelectedCondos(className, 'width:175px;', condoId, '', '', enableChanges);

      // kilowattHour current year
      let kilowattHour = remoteHeating.kilowattHour;
      className = `kilowattHour${remoteHeating.remoteHeatingId}`;
      kilowattHour = formatOreToKroner(kilowattHour);
      html += objRemoteHeating.inputTableColumn(className, '', kilowattHour, 10, enableChanges);

      // kilowattHour resent year
      let kilowattHourLastYear = getKilowattHourLastYear(remoteHeating.condoId);
      className = `kilowattHourLastYear${remoteHeating.remoteHeatingId}`;
      kilowattHourLastYear = formatOreToKroner(kilowattHourLastYear);
      html += objRemoteHeating.inputTableColumn(className, '', kilowattHourLastYear, 10, enableChanges);

      // price for used elcticity/remote heating for one year
      let priceYear = Number(remoteHeating.priceYear);
      if (priceYear === 0) {

        // calculate price for used elcticity/remote heating for one year
        let price = document.querySelector('.filterPrice').value;
        price = formatKronerToOre(price);
        kilowattHour = formatKronerToOre(kilowattHour);
        kilowattHourLastYear = formatKronerToOre(kilowattHourLastYear);
        priceYear = Number(price) * (Number(kilowattHour) - Number(kilowattHourLastYear));
        priceYear = (priceYear / 100);
        priceYear = formatOreToKroner(priceYear);
      } else {

        priceYear = formatOreToKroner(remoteHeating.priceYear);
      }
      className = `priceYear${remoteHeating.remoteHeatingId}`;
      html += objRemoteHeating.inputTableColumn(className, '', priceYear, 10, enableChanges);

      html += "</tr>";

      // accumulate
      priceYear = formatKronerToOre(priceYear);
      totalPriceYear += priceYear;
    }
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  if (enableChanges) {

    menuNumber++;
    html += insertEmptyTableRow(menuNumber);
  }

  // How much to pay for remote heating for all condos
  totalPriceYear = formatOreToKroner(totalPriceYear);
  menuNumber++;
  html += objRemoteHeating.insertTableColumns('', menuNumber, '', '', '', '', 'Totalt', totalPriceYear);

  html += "</tr>";

  // Show the rest of the menu
  menuNumber++;
  html += objRemoteHeating.showRestMenu(menuNumber);

  // The end of the table
  html += objRemoteHeating.endTable();
  document.querySelector('.result').innerHTML = html;

  return menuNumber;
}

// Delete one remoteHeating row
async function deleteAccountRow(remoteHeatingId, className) {



  // Check if remoteHeating row exist
  accountsRowNumber = objRemoteHeating.arrayRemoteHeatings.findIndex(remoteHeating => remoteHeating.remoteHeatingId === remoteHeatingId);
  if (accountsRowNumber !== -1) {

    // delete remoteHeating row
    objRemoteHeating.deleteAccountsTable(remoteHeatingId, user);
  }

  await objRemoteHeating.loadRemoteHeatingTable(condominiumId, objRemoteHeating.nineNine, objRemoteHeating.nineNine);
}

// Update a remoteheatings table row
async function updateRemoteHeatingRow(remoteHeatingId) {

  remoteHeatingId = Number(remoteHeatingId);

  // year
  className = ".filterYear";
  const year = Number(document.querySelector(className).value);
  className = "filterYear";
  const validYear = objRemoteHeating.validateNumber(className, year, 2020, 2030, object, style, message);

  // date
  className = `.date${remoteHeatingId}`;
  let date = document.querySelector(className).value;
  date = objRemoteHeating.formatNorDateToNumber(date);
  className = `date${remoteHeatingId}`;
  const validDate = objRemoteHeating.validateNumber(className, Number(date), 20200101, 20291231);

  // condoId
  className = `.condoId${remoteHeatingId}`;
  const condoId = Number(document.querySelector(className).value);
  className = `condoId${remoteHeatingId}`;
  const validCondoId = objRemoteHeating.validateNumber(className, condoId, 1, objRemoteHeating.nineNine, object, style, message);

  // kilowattHour
  className = `.kilowattHour${remoteHeatingId}`;
  let kilowattHour = document.querySelector(className).value;
  kilowattHour = formatKronerToOre(kilowattHour);
  className = `kilowattHour${remoteHeatingId}`;
  const validkilowattHour = objRemoteHeating.validateNumber(className, kilowattHour, 1, objRemoteHeating.nineNine, object, style, message);

  // Price for one year
  className = `.priceYear${remoteHeatingId}`;
  let priceYear = document.querySelector(className).value;
  priceYear = formatKronerToOre(priceYear);
  className = `priceYear${remoteHeatingId}`;
  const validPriceYear = objRemoteHeating.validateNumber(className, priceYear, 0, objRemoteHeating.nineNine, object, style, message);

  // Validate remoteheatings columns
  if (validYear && validDate && validCondoId && validkilowattHour && validPriceYear) {

    document.querySelector('.message').style.display = "none";
  
    // Check if the remoteHeating id exist
    rowNumberRemoteHeating = objRemoteHeating.arrayRemoteHeatings.findIndex(remoteHeating => remoteHeating.remoteHeatingId === remoteHeatingId);
    if (rowNumberRemoteHeating !== -1) {

      // update a remoteheatings row
      await objRemoteHeating.updateRemoteHeatingTable(user, remoteHeatingId, condoId, year, date, kilowattHour, priceYear);
    } else {

      // Insert a remoteheatings row
      await objRemoteHeating.insertRemoteHeatingTable(condominiumId, user, condoId, year, date, kilowattHour, priceYear);
    }

    await objRemoteHeating.loadRemoteHeatingTable(condominiumId, objRemoteHeating.nineNine, objRemoteHeating.nineNine);

    let menuNumber = 0;
    menuNumber = showResult(menuNumber);
  }
}

// get number of KilowattHour for last year
function getKilowattHourLastYear(condoId) {

  let remoteHeatingLastYear = 0;
  condoId = Number(condoId);

  // Last year
  let year = Number(document.querySelector('.filterYear').value);
  year--;

  objRemoteHeating.arrayRemoteHeatings.forEach((remoteHeating) => {

    if ((remoteHeating.year === year) && (remoteHeating.condoId === condoId)) remoteHeatingLastYear = Number(remoteHeating.kilowattHour);
  });

  return remoteHeatingLastYear;
}

// Delete remoteheatings row
async function deleteRemoteHeatingRow(remoteHeatingId, className) {



  // Check if remoteheatings row exist
  rowNumberRemoteHeating = objRemoteHeating.arrayRemoteHeatings.findIndex(remoteHeating => remoteHeating.remoteHeatingId === remoteHeatingId);
  if (rowNumberRemoteHeating !== -1) {

    // delete remoteheatings row
    objRemoteHeating.deleteRemoteHeatingTable(remoteHeatingId, user);
  }
}

function getPriceKilowattHour(year) {

  year = Number(year);
  let priceKilowattHour = 0;
  objRemoteHeatingPrice.arrayRemoteHeatingPrices.forEach((remoteHeatingPrices) => {

    if (remoteHeatingPrices.year === year) priceKilowattHour = Number(remoteHeatingPrices.priceKilowattHour);
  });

  priceKilowattHour = formatOreToKroner(priceKilowattHour);
  return priceKilowattHour;
}