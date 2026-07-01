// maintenance of remote heating

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objRemoteHeatingPrice = new RemoteHeatingPrice('remoteheatingprice');
const objRemoteHeating = new RemoteHeating('remoteheating');

const enableChanges = (objRemoteHeating.securityLevel > 5);

const columnWidths = [150, 150, 175, 175, 175, 100];

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objRemoteHeating.condominiumId === 0) || (objRemoteHeating.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = objRemoteHeating.showHorizontalMenu(objRemoteHeating.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show remote heating menu
      html = objRemoteHeating.showHorizontalMenu(objRemoteHeating.arrayMenuRemoteHeating);
      document.querySelector('.menuRemoteHeating').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objRemoteHeating.condominiumId, resident, objRemoteHeating.nineNine);
      await objCondo.loadCondoTable(objRemoteHeating.condominiumId, objRemoteHeating.nineNine);
      await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeating.condominiumId);

      // Show header
      //showHeader();

      // Show filter
      const year = today.getFullYear();
      showFilter(year);

      await objRemoteHeating.loadRemoteHeatingTable(objRemoteHeating.condominiumId, objRemoteHeating.nineNine, objRemoteHeating.nineNine);

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
      await objRemoteHeating.loadRemoteHeatingTable(objRemoteHeating.condominiumId, objRemoteHeating.nineNine, objRemoteHeating.nineNine);

      showRemoteHeatings();
    };
  });

  // Delete remoteheatings row
  document.addEventListener('click', async (event) => {

    const arrayPrefixes = ['delete'];
    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

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

      await objRemoteHeating.deleteRemoteHeatingTable(remoteHeatingId, objRemoteHeating.user);
      await objRemoteHeating.loadRemoteHeatingTable(objRemoteHeating.condominiumId, objRemoteHeating.nineNine, objRemoteHeating.nineNine);

      showRemoteHeatings();
    };
  });

  // update a remoteheatings row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['date', 'condoId', 'kilowattHour', 'priceYear'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[2]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[3]))
    ) {

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

  /*
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

        await objRemoteHeating.loadRemoteHeatingTable(objRemoteHeating.condominiumId, objRemoteHeating.nineNine, objRemoteHeating.nineNine);

        showRemoteHeatings();
      };
    };
  });
  */

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

// Show header
function showHeader() {

  // Start table
  let html = objRemoteHeating.initializeTable(columnWidths);

  // start table body
  html += objRemoteHeating.startTableBody();

  // show main header
  html += objRemoteHeating.showTableHeaderLogOut('', '', '', 'Fjernvarme', '');
  html += "</tr>";

  // end table body
  html += objRemoteHeating.endTableBody();

  // The end of the table
  html += objRemoteHeating.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter(year) {

  // Start frame
  let html = startFrame();

  // show filter
  html += startRow();

  // Show years
  html += showSelectedNumbersNew('År', 'filterYear', '', 2020, 2030, year, true);

  // Price/kilowattHour
  const priceKilowattHour = getPriceKilowattHour(year);
  className = `filterPrice`;
  html += objRemoteHeating.editAmount('Pris KilowatTimer', 'filterPrice', priceKilowattHour, true);
  html += "</div>";

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;
}

// Show remoteheatings
function showRemoteHeatings() {

  /*
  let totalPriceYear = 0;

  // start table
  let html = objRemoteHeating.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  const currentYear = Number(document.querySelector(".filterYear").value);
  const lastYear = currentYear - 1;

  html += objRemoteHeating.showTableHeaderMenu('#e0f0e0', 'center', 'Dato', 'Leilighet', `K.timer ${currentYear}`, `K.timer ${lastYear}`, 'Beløp', '');

  objRemoteHeating.arrayRemoteHeatings.forEach((remoteHeating) => {

    if (remoteHeating.year === currentYear) {

      // insert a table row (<tr></td>)
      html += objRemoteHeating.insertTableRow('');

      // date
      let date = remoteHeating.date;
      let className = `date${remoteHeating.remoteHeatingId}`;
      date = formatNumberToNorDate(date);
      html += objRemoteHeating.editTableCell(className, date, 10, enableChanges);

      // condoId
      const condoId = remoteHeating.condoId;
      className = `condoId${remoteHeating.remoteHeatingId}`;
      html += objCondo.showSelectedCondos(className, '', condoId, '', '', enableChanges);

      // kilowattHour current year
      let kilowattHour = remoteHeating.kilowattHour;
      className = `kilowattHour${remoteHeating.remoteHeatingId}`;
      kilowattHour = formatOreToKroner(kilowattHour);
      html += objRemoteHeating.editTableCell(className, kilowattHour, 10, enableChanges);

      // kilowattHour last year
      let kilowattHourLastYear = getKilowattHourLastYear(remoteHeating.condoId);
      className = `kilowattHourLastYear${remoteHeating.remoteHeatingId}`;
      kilowattHourLastYear = formatOreToKroner(kilowattHourLastYear);
      html += objRemoteHeating.editTableCell(className, kilowattHourLastYear, 10, false);

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
      html += objRemoteHeating.editTableCell(className, priceYear, 10, enableChanges);

      // Delete
      let selected = "Ugyldig verdi";
      if (remoteHeating.deleted === 'Y') selected = "Ja";
      if (remoteHeating.deleted === 'N') selected = "Nei";

      className = `delete${remoteHeating.remoteHeatingId}`;
      html += objRemoteHeating.showButton(className, 'Slett');
      html += "</tr>";

      // accumulate
      priceYear = formatKronerToOre(priceYear);
      totalPriceYear += priceYear;
    }
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  if (enableChanges) {


    html += insertEmptyTableRow();
  }

  // How much to pay for remote heating for all condos
  totalPriceYear = formatOreToKroner(totalPriceYear);

  html += objRemoteHeating.insertTableRow('', '', '', 'Totalt', totalPriceYear, '', '');

  html += "</tr>";

  // The end of the table
  html += objRemoteHeating.endTable();
  document.querySelector('.result').innerHTML = html;
  */
  // row number remoteheating

  const currentYear = Number(document.querySelector(".filterYear").value);
  const lastYear = currentYear - 1;

  // Empty row
  let html = emptyRow();

  objRemoteHeating.arrayRemoteHeatings.forEach((remoteHeating) => {
    if (remoteHeating.year === currentYear) {

      html += startRow();

      // date
      let date = (remoteHeating.date)
        ? remoteHeating.date
        : 0;
      // Format date from yyyymmdd -> yyyy-mm-dd (ISO format)
      date = formatNumberToISODate(date);
      let className = `date${remoteHeating.remoteHeatingId}`;
      html += editDate('Dato', className, date, enableChanges)

      // condo Id
      let condoId = (remoteHeating.condoId)
        ? remoteHeating.condoId
        : 0;
      className = `condoId${remoteHeating.remoteHeatingId}`;
      html += objCondo.showSelectedCondosNew('Leilighet', className, '', condoId, '', '', enableChanges);

      // kilowattHour current year
      let kilowattHour = (remoteHeating.kilowattHour)
        ? remoteHeating.kilowattHour
        : 0;
      kilowattHour = formatOreToKroner(kilowattHour);
      className = `kilowattHour${remoteHeating.remoteHeatingId}`;
      html += showTextNew(`K.timer ${currentYear}`, className, kilowattHour, enableChanges, 'Kontonavn');

      // kilowattHour last year
      let kilowattHourLastYear = (getKilowattHourLastYear(remoteHeating.condoId))
        ? getKilowattHourLastYear(remoteHeating.condoId)
        : 0;
      kilowattHourLastYear = formatOreToKroner(kilowattHourLastYear);
      className = `kilowattHourLastYear${remoteHeating.remoteHeatingId}`;
      html += showTextNew(`K.timer ${lastYear}`, className, kilowattHourLastYear, enableChanges, `K.timer ${lastYear}`);

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
      html += showTextNew('Beløp', className, priceYear, enableChanges, 'Beløp');

      // Button
      if (enableChanges) {

        html += showButtonNew('delete', 'Slett');
      }

      html += "</div>";
    }
  });

  // Make one last table row for insertion in table 
  if (enableChanges) {

    // Insert empty row for insertion
    html += insertEmptyRow();
  };
  document.querySelector('.showRemoteHeatings').innerHTML = html;
}

// Insert empty row
function insertEmptyRow() {

  /*
  let html = "";
  let date = "";

  // insert a table row (<tr></td>)
  html += objRemoteHeating.insertTableRow('');

  // Date
  html += objRemoteHeating.editTableCell('date0', '', '', 10, enableChanges);

  // condoId
  html += objCondo.showSelectedCondos('condoId0', '', 0, 'Velg leilighet', '', enableChanges);

  // kilowattHour this year
  html += objRemoteHeating.editTableCell('kilowattHour0', '', '0,00', 10, enableChanges);

  // kilowattHour last year
  html += objRemoteHeating.editTableCell('kilowattHourLastYear0', '', '0,00', 10, false);

  // price for remote heating for one year
  html += objRemoteHeating.editTableCell('priceYear0', '', '0,00', 10, enableChanges);
  html += "<td class='center'>Ny fjernvarme</td></tr>";
  return html;
*/
  // start new row
  let html = startRow();
  // Date
  const currentYear = Number(document.querySelector(".filterYear").value);
  const lastYear = currentYear - 1;

  let className = `date0`;
  html += editDate('Dato', className, "", enableChanges)

  // condo Id
  className = `condoId0`;
  html += objCondo.showSelectedCondosNew('Leilighet', className, '', 0, 'Velg leilighet', '', enableChanges);

  // kilowattHour current year
  className = `kilowattHour0`;
  html += showTextNew(`K.timer ${currentYear}`, className, "", enableChanges, `K.timer ${currentYear}`);

  // kilowattHour last year
  className = `kilowattHourLastYear0`;
   html += showTextNew(`K.timer ${lastYear}`, className, "", enableChanges, `K.timer ${lastYear}`);

  /*
  // calculate price for used elcticity/remote heating for one year
  let price = document.querySelector('.filterPrice').value;
  price = formatKronerToOre(price);
  kilowattHour = formatKronerToOre(kilowattHour);
  kilowattHourLastYear = formatKronerToOre(kilowattHourLastYear);
  priceYear = Number(price) * (Number(kilowattHour) - Number(kilowattHourLastYear));
  priceYear = (priceYear / 100);
  priceYear = formatOreToKroner(priceYear);
  */

  className = `priceYear0`;
  html += showTextNew('Beløp', className, "", enableChanges, 'Beløp');

  // end row
  html += showButtonNew('update', '');
  return html;
}

// Delete one remoteHeating row
async function deleteAccountRow(remoteHeatingId, className) {

  // Check if remoteHeating row exist
  accountsRowNumber = objRemoteHeating.arrayRemoteHeatings.findIndex(remoteHeating => remoteHeating.remoteHeatingId === remoteHeatingId);
  if (accountsRowNumber !== -1) {

    // delete remoteHeating row
    await objRemoteHeating.deleteAccountsTable(remoteHeatingId, objRemoteHeating.user);
  }

  await objRemoteHeating.loadRemoteHeatingTable(objRemoteHeating.condominiumId, objRemoteHeating.nineNine, objRemoteHeating.nineNine);
}

// Update a remoteheatings table row
async function updateRemoteHeatingRow(remoteHeatingId) {

  remoteHeatingId = Number(remoteHeatingId);

  // year
  className = ".filterYear";
  const year = Number(document.querySelector(className).value);
  className = "filterYear";
  const validYear = objRemoteHeating.validateInterval(className, columnWidths, '', 'Ugyldig pris per kilowattime', true, year, 2020, 2030);

  // date
  className = `.date${remoteHeatingId}`;
  let date = document.querySelector(className).value;
  if (date === '') date = '01.01.2000';
  date = objRemoteHeating.formatDateToNumber(date);
  className = `date${remoteHeatingId}`;
  const validDate = objRemoteHeating.validateInterval(className, columnWidths, '', 'Ugyldig dato', true, Number(date), 20150101, 20291231);

  // condoId
  className = `.condoId${remoteHeatingId}`;
  const condoId = Number(document.querySelector(className).value);
  className = `condoId${remoteHeatingId}`;
  const validCondoId = objRemoteHeating.validateInterval(className, columnWidths, '', 'Ugyldig leilighet', true, condoId, 1, objRemoteHeating.nineNine);

  // kilowattHour
  className = `.kilowattHour${remoteHeatingId}`;
  let kilowattHour = document.querySelector(className).value;
  kilowattHour = formatKronerToOre(kilowattHour);
  className = `kilowattHour${remoteHeatingId}`;
  const validkilowattHour = objRemoteHeating.validateInterval(className, columnWidths, '', 'Ugyldig kilowatttime', true, kilowattHour, 1, objRemoteHeating.nineNine);

  // Price for one year
  className = `.priceYear${remoteHeatingId}`;
  let priceYear = document.querySelector(className).value;
  priceYear = formatKronerToOre(priceYear);
  className = `priceYear${remoteHeatingId}`;
  const validPriceYear = objRemoteHeating.validateInterval(className, columnWidths, '', 'Ugyldig beløp', true, priceYear, 0, objRemoteHeating.nineNine);

  // Validate remoteheatings columns
  if (validYear && validDate && validCondoId && validkilowattHour && validPriceYear) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the remoteHeating id exist
    rowNumberRemoteHeating = objRemoteHeating.arrayRemoteHeatings.findIndex(remoteHeating => remoteHeating.remoteHeatingId === remoteHeatingId);
    if (rowNumberRemoteHeating !== -1) {

      // update a remoteheatings row
      await objRemoteHeating.updateRemoteHeatingTable(objRemoteHeating.user, remoteHeatingId, condoId, year, date, kilowattHour, priceYear);
    } else {

      // Insert a remoteheatings row
      await objRemoteHeating.insertRemoteHeatingTable(objRemoteHeating.condominiumId, objRemoteHeating.user, condoId, year, date, kilowattHour, priceYear);
    }

    await objRemoteHeating.loadRemoteHeatingTable(objRemoteHeating.condominiumId, objRemoteHeating.nineNine, objRemoteHeating.nineNine);

    showRemoteHeatings();
  }
}

// get number of KilowattHour for last year
function getKilowattHourLastYear(condoId) {

  let kilowattHourLastYear = 0;
  condoId = Number(condoId);

  // Last year
  let year = Number(document.querySelector('.filterYear').value);
  year--;

  objRemoteHeating.arrayRemoteHeatings.forEach((remoteHeating) => {

    if ((remoteHeating.year === year) && (remoteHeating.condoId === condoId)) kilowattHourLastYear = Number(remoteHeating.kilowattHour);
  });

  return kilowattHourLastYear;
}

// Delete remoteheatings row
async function deleteRemoteHeatingRow(remoteHeatingId) {

  // Check if remoteheatings row exist
  rowNumberRemoteHeating = objRemoteHeating.arrayRemoteHeatings.findIndex(remoteHeating => remoteHeating.remoteHeatingId === remoteHeatingId);
  if (rowNumberRemoteHeating !== -1) {

    // delete remoteheatings row
    await objRemoteHeating.deleteRemoteHeatingTable(remoteHeatingId, objRemoteHeating.user);
  }
}

function getPriceKilowattHour(year) {

  year = Number(year);
  let priceKilowattHour = 0;
  objRemoteHeatingPrice.arrayRemoteHeatingPrices.forEach((RremoteHeatingPrice) => {

    if (RremoteHeatingPrice.year === year) priceKilowattHour = Number(RremoteHeatingPrice.priceKilowattHour);
  });

  priceKilowattHour = formatOreToKroner(priceKilowattHour);
  return priceKilowattHour;
}