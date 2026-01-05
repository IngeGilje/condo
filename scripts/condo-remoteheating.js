// maintenance of remote heating

// Activate classes
const today = new Date();
const objUsers = new User('user');
const objCondos = new Condo('condo');
const objRemoteHeatings = new RemoteHeating('remoteheating');

testMode();

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    const resident = 'Y';
    await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
    await objCondos.loadCondoTable(objUserPassword.condominiumId);

    let html = objRemoteHeatings.showHorizontalMenu('width: 750px');
    document.querySelector(".horizontalMenu").innerHTML = html;

    // Show header
    let menuNumber = 0;
    showHeader();

    // Show filter
    showFilter();

    await objRemoteHeatings.loadRemoteHeatingTable(objUserPassword.condominiumId, 999999999, 999999999);

    // Show remoteHeating
    menuNumber = showResult(menuNumber);

    // Events
    events();
  }
}

// Events for remoteheatings
function events() {

  // Filter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterYear')
      || event.target.classList.contains('filterPrice')) {

      filterSync();

      async function filterSync() {

        await objRemoteHeatings.loadRemoteHeatingTable(objUserPassword.condominiumId, 999999999, 999999999);

        let menuNumber = 0;
        menuNumber = showResult(menuNumber);
      }
    };
  });

  // Delete remoteheatings row
  document.addEventListener('change', (event) => {

    const arrayPrefixes = ['delete'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objRemoteHeatings.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      const classNameDelete = `.${className}`
      const deleteRemoteHeatingRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteRemoteHeatingRowValue === "Ja") {

        const remoteHeatingId = Number(className.substring(6));
        deleteRemoteHeatingSync();

        async function deleteRemoteHeatingSync() {

          await deleteRemoteHeatingRow(remoteHeatingId, className);

          await objRemoteHeatings.loadRemoteHeatingTable(objUserPassword.condominiumId, 999999999, 999999999);

          let menuNumber = 0;
          menuNumber = showResult(menuNumber);
        };
      };
    };
  });

  // update a remoteheatings row
  document.addEventListener('change', (event) => {

    const arrayPrefixes = ['date', 'condoId', 'kilowattHour'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[2]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objRemoteHeatings.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract remoteHeatingId in the class name
      let remoteHeatingId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        remoteHeatingId = Number(className.slice(prefix.length));
      }

      updateRemoteHeatingSync();

      // Update a remoteheatings row
      async function updateRemoteHeatingSync() {

        await updateRemoteHeatingRow(remoteHeatingId);
      }
    };
  });

  // Delete suppliers row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete')) {

      const arrayPrefixes = ['delete'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objRemoteHeatings.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      //const className = objRemoteHeatings.getDeleteClass(event.target);
      const classNameDelete = `.${className}`
      const deleteAccountRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteAccountRowValue === "Ja") {

        const remoteHeatingId = Number(className.substring(6));
        deleteAccountSync();

        async function deleteAccountSync() {

          deleteAccountRow(remoteHeatingId, className);

          await objRemoteHeatings.loadRemoteHeatingTable(objUserPassword.condominiumId, 999999999, 999999999);

          let menuNumber = 0;
          menuNumber = showResult(menuNumber);
        };
      };
    };
  });
}

// Show header
function showHeader() {

  // Start table
  let html = objRemoteHeatings.startTable('width:1100px;');

  // show main header
  html += objRemoteHeatings.showTableHeader('width:250px;', 'Fjernvarme');

  // The end of the table header
  html += objRemoteHeatings.endTableHeaderNew();

  // The end of the table
  html += objRemoteHeatings.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start table
  html = objRemoteHeatings.startTable('width:1100px;');

  // Header filter
  html += objRemoteHeatings.showTableHeader('width:250px;', '', 'År', 'Pris per kiloWattimer');

  // start table body
  html += objRemoteHeatings.startTableBody();

  // insert table columns in start of a row
  html += objRemoteHeatings.insertTableColumns('', 0, '');

  // Show all selected condos
  // Get last id in last object in condo array
  //const condoId = objCondos.arrayCondo.at(-1).condoId;
  //html += objCondos.showSelectedCondos('filterCondoId', 'width:100px;', condoId, '', '');

  // Select year
  const year = today.getFullYear();
  html += objRemoteHeatings.selectInterval('filterYear', 'width:100px;', 2020, 2030, year);

  // Price/kilowattHour
  const priceKilowattHour = "1,00"
  className = `filterPrice`;
  html += objRemoteHeatings.inputTableColumn(className, priceKilowattHour, 10);

  html += "</tr>";

  // insert table columns in start of a row
  html += objRemoteHeatings.insertTableColumns('', 0, '');

  // end table body
  html += objRemoteHeatings.endTableBody();

  // The end of the table
  html += objRemoteHeatings.endTable();
  document.querySelector('.filter').innerHTML = html;
}

// Insert empty table row
function insertEmptyTableRow(rowNumber) {

  let html = "";
  let date = "";

  // insert table columns in start of a row
  html += objRemoteHeatings.insertTableColumns('', rowNumber);

  html += "<td class='center'>Ny fjernvarme</td>";

  // Date
  html += objRemoteHeatings.inputTableColumn('date0', "", 10);

  // condoId
  html += objCondos.showSelectedCondos('condoId0', 'width:100px;', 0, 'Ikke valgt', '');

  // kilowattHour this year
  html += objRemoteHeatings.inputTableColumn('kilowattHour0', "", 10);

  html += "</tr>";
  return html;
}

// Show remoteheatings
function showResult(rowNumber) {

  // start table
  let html = objRemoteHeatings.startTable('width:1100px;');

  // table header
  const currentYear = Number(document.querySelector(".filterYear").value);
  const lastYear = currentYear - 1;
  html += objRemoteHeatings.showTableHeader('width:250px;', '', 'Slett', 'Dato', 'Leilighet', `K.timer ${currentYear}`, `K.timer ${lastYear}`, 'Beløp');

  // condoId
  //const condoId = Number(document.querySelector(".filterCondoId").value);

  objRemoteHeatings.arrayRemoteHeatings.forEach((remoteHeating) => {

    if (remoteHeating.year === currentYear) {

      // insert table columns in start of a row
      rowNumber++;
      html += objRemoteHeatings.insertTableColumns('', rowNumber);

      // Delete
      let selectedChoice = "Ugyldig verdi";
      if (remoteHeating.deleted === 'Y') selectedChoice = "Ja";
      if (remoteHeating.deleted === 'N') selectedChoice = "Nei";

      let className = `delete${remoteHeating.remoteHeatingId}`;
      html += objRemoteHeatings.showSelectedValues(className, 'width:75px;', selectedChoice, 'Nei', 'Ja')

      // date
      let date = remoteHeating.date;
      className = `date${remoteHeating.remoteHeatingId}`;
      date = formatToNorDate(date);
      html += objRemoteHeatings.inputTableColumn(className, date, 10);

      // condoId
      const condoId = remoteHeating.condoId;
      className = `condoId${remoteHeating.remoteHeatingId}`;
      html += objCondos.showSelectedCondos(className, 'width: 100px;', condoId, '', '');

      // kilowattHour current year
      let kilowattHour = remoteHeating.kilowattHour;
      className = `kilowattHour${remoteHeating.remoteHeatingId}`;
      kilowattHour = formatOreToKroner(kilowattHour);
      html += objRemoteHeatings.inputTableColumn(className, kilowattHour, 10);

      // kilowattHour last year
      let kilowattHourLastYear = getKilowattHour(remoteHeating.condoId);
      className = `kilowattHourLastYear${remoteHeating.remoteHeatingId}`;
      kilowattHourLastYear = formatOreToKroner(kilowattHourLastYear);
      html += objRemoteHeatings.inputTableColumn(className, kilowattHourLastYear, 10);

      // price kilowattHour for one year
      let price = document.querySelector('.filterPrice').value;
      price = Number(formatKronerToOre(price)) / 100;
      kilowattHour = Number(formatKronerToOre(kilowattHour));
      kilowattHourLastYear = Number(formatKronerToOre(kilowattHourLastYear));
      priceYear = price * ((kilowattHour - kilowattHourLastYear));
      priceYear = formatOreToKroner(priceYear);
      className = `priceYear${remoteHeating.remoteHeatingId}`;
      html += objRemoteHeatings.inputTableColumn(className, priceYear, 10);

      html += "</tr>";
    }
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  rowNumber++;
  html += insertEmptyTableRow(rowNumber);

  // Show the rest of the menu
  rowNumber++;
  html += objRemoteHeatings.showRestMenu(rowNumber);

  // The end of the table
  html += objRemoteHeatings.endTable();
  document.querySelector('.result').innerHTML = html;

  return rowNumber;
}

// Delete one remoteHeating row
async function deleteAccountRow(remoteHeatingId, className) {

  const user = objUserPassword.email;

  // Check if remoteHeating row exist
  accountsRowNumber = objRemoteHeatings.arrayRemoteHeatings.findIndex(remoteHeating => remoteHeating.remoteHeatingId === remoteHeatingId);
  if (accountsRowNumber !== -1) {

    // delete remoteHeating row
    objRemoteHeatings.deleteAccountsTable(remoteHeatingId, user);
  }

  await objRemoteHeatings.loadRemoteHeatingTable(objUserPassword.condominiumId, 999999999, 999999999);
}

// Update a remoteheatings table row
async function updateRemoteHeatingRow(remoteHeatingId) {

  remoteHeatingId = Number(remoteHeatingId);

  const condominiumId = Number(objUserPassword.condominiumId);
  const user = objUserPassword.email;

  // year
  className = ".filterYear";
  const year = Number(document.querySelector(className).value);
  const validYear = objRemoteHeatings.validateIntervalNew(year, 2020, 2030);

  // date
  className = `.date${remoteHeatingId}`;
  let date = document.querySelector(className).value;
  date = objRemoteHeatings.formatNorDateToNumberNew(date);
  const validDate = objRemoteHeatings.validateIntervalNew(Number(date), 20200101, 20291231);

  // condoId
  className = `.condoId${remoteHeatingId}`;
  const condoId = Number(document.querySelector(className).value);
  const validCondoId = objRemoteHeatings.validateIntervalNew(condoId, 1, 999999999);

  // kilowattHour
  className = `.kilowattHour${remoteHeatingId}`;
  let kilowattHour = document.querySelector(className).value;
  kilowattHour = formatKronerToOre(kilowattHour);
  const validkilowattHour = validateNumberNew(kilowattHour, 0, 999999999);

  // Validate remoteheatings columns
  if (validYear && validDate && validCondoId && validkilowattHour) {

    // Check if the remoteHeating id exist
    rowNumberRemoteHeating = objRemoteHeatings.arrayRemoteHeatings.findIndex(remoteHeating => remoteHeating.remoteHeatingId === remoteHeatingId);
    if (rowNumberRemoteHeating !== -1) {

      // update a remoteheatings row
      await objRemoteHeatings.updateRemoteHeatingTable(user, remoteHeatingId, condoId, year, date, kilowattHour);
    } else {

      // Insert a remoteheatings row
      await objRemoteHeatings.insertRemoteHeatingTable(condominiumId, user, condoId, year, date, kilowattHour);
    }

    await objRemoteHeatings.loadRemoteHeatingTable(objUserPassword.condominiumId, 999999999, 999999999);

    let menuNumber = 0;
    menuNumber = showResult(menuNumber);
  }
}

// get number of KilowattHour for last year
function getKilowattHour(condoId) {

  let remoteHeatingLastYear = 0;
  condoId = Number(condoId);

  // Last year
  let year = Number(document.querySelector('.filterYear').value);
  year--;

  // condoId
  //const condoId = Number(document.querySelector(".filterCondoId").value);

  objRemoteHeatings.arrayRemoteHeatings.forEach((remoteHeating) => {

    if ((remoteHeating.year === year) && (remoteHeating.condoId === condoId)) remoteHeatingLastYear = Number(remoteHeating.kilowattHour);
  });

  return remoteHeatingLastYear;
}

// Delete remoteheatings row
async function deleteRemoteHeatingRow(remoteHeatingId, className) {

  const user = objUserPassword.email;

  // Check if remoteheatings row exist
  rowNumberRemoteHeating = objRemoteHeatings.arrayRemoteHeatings.findIndex(remoteHeating => remoteHeating.remoteHeatingId === remoteHeatingId);
  if (rowNumberRemoteHeating !== -1) {

    // delete remoteheatings row
    objRemoteHeatings.deleteRemoteHeatingTable(remoteHeatingId, user);
  }
}
