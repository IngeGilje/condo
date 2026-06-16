// maintenance of remote heating prices

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objPriceRemoteHeating = new PriceRemoteHeating('priceremoteheating');

const enableChanges = (objPriceRemoteHeating.securityLevel > 5);

const columnWidths = [175, 175, 100];

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objPriceRemoteHeating.condominiumId === 0) || (objPriceRemoteHeating.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = objPriceRemoteHeating.showHorizontalMenu(objPriceRemoteHeating.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show account menu
      html = objPriceRemoteHeating.showHorizontalMenu(objPriceRemoteHeating.arrayMenuAccount);
      document.querySelector('.menuTransaction').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objPriceRemoteHeating.condominiumId, resident, objPriceRemoteHeating.nineNine);
      await objCondo.loadCondoTable(objPriceRemoteHeating.condominiumId, objPriceRemoteHeating.nineNine);

      // Show header

      showHeader();

      await objPriceRemoteHeating.loadPriceRemoteHeatingTable(objPriceRemoteHeating.condominiumId);

      // Show remotePriceHeating
      showRemoteHeating();

      // Events
      events();
    }
  } else {

    objPriceRemoteHeating.showMessageNew(columnWidths, '', 'Server er ikke startet.');
  }
}

// Events for priceremoteheatings
async function events() {

  // Delete priceremoteheatings row
  // update a priceremoteheatings row
  document.addEventListener('click', async (event) => {

    const arrayPrefixes = ['delete'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objPriceRemoteHeating.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract priceRemoteHeatingsId in the class name
      let priceRemoteHeatingsId = 0;
      let prefix = '';
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        priceRemoteHeatingsId = Number(className.slice(prefix.length));
      }
      await deletePriceRemoteHeatingRow(priceRemoteHeatingsId, className);
      await objPriceRemoteHeating.loadPriceRemoteHeatingTable(objPriceRemoteHeating.condominiumId);


      showRemoteHeating();
    };
  });

  // update a priceremoteheatings row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['year', 'priceKilowattHour'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objPriceRemoteHeating.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract priceRemoteHeatingsId in the class name
      let priceRemoteHeatingsId = 0;
      let prefix = '';
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        priceRemoteHeatingsId = Number(className.slice(prefix.length));
      }

      // Update a priceremoteheatings row
      await updatePriceRemoteHeatingsRow(priceRemoteHeatingsId);
    };
  });

  // Delete suppliers row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      const arrayPrefixes = ['delete'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objPriceRemoteHeating.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      //const className = objPriceRemoteHeating.getDeleteClass(event.target);
      const classNameDelete = `.${className}`
      const deleteAccountRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteAccountRowValue === "Ja") {

        await objPriceRemoteHeating.loadPriceRemoteHeatingTable(objPriceRemoteHeating.condominiumId);


        showRemoteHeating();
      };
    };
  });
  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objPriceRemoteHeating.serverStatus === 1)
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
  let html = objPriceRemoteHeating.initializeTable(columnWidths);

  // start table body
  html += objPriceRemoteHeating.startTableBody();

  // show main header
  html += objPriceRemoteHeating.showTableHeaderLogOut('', 'Fjernvarme priser');
  html += "</tr>";

  // end table body
  html += objPriceRemoteHeating.endTableBody();

  // The end of the table
  html += objPriceRemoteHeating.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Insert empty table row
function insertEmptyTableRow() {

  let html = '';
  let date = '';

  // insert a table row (<tr></td>)
  html += objPriceRemoteHeating.insertTableRow('');

  // Select year (<td></td>)
  const year = today.getFullYear();
  html += objPriceRemoteHeating.showSelectedNumbers('year0', '', 2020, 2030, year, true);

  // priceKilowattHour 
  html += objPriceRemoteHeating.editTableCell('priceKilowattHour0', '', '0,00', 10, enableChanges);

  html += "<td>3Ny fjernvarmepris</td></tr>";
  return html;
}

// Show priceremoteheatings
function showRemoteHeating() {

  // start table
  let html = objPriceRemoteHeating.initializeTable(columnWidths);

  html += objPriceRemoteHeating.showTableHeaderMenu('', 'center', 'År', `Pris KilowatTimer`, 'Slett');

  objPriceRemoteHeating.arrayPriceRemoteHeatings.forEach((remotePriceHeating) => {

    // insert a table row (<tr></td>)
    html += objPriceRemoteHeating.insertTableRow('');

    // Select year (<td></td>)
    const year = remotePriceHeating.year;
    let className = `year${remotePriceHeating.priceRemoteHeatingsId}`;
    html += objPriceRemoteHeating.showSelectedNumbers(className, '', 2020, 2030, year, true);

    // priceKilowattHour
    let priceKilowattHour = remotePriceHeating.priceKilowattHour;
    className = `priceKilowattHour${remotePriceHeating.priceRemoteHeatingsId}`;
    priceKilowattHour = formatOreToKroner(priceKilowattHour);
    html += objPriceRemoteHeating.editTableCell(className, priceKilowattHour, 10, enableChanges);

    // Delete
    let selected = "Ugyldig verdi";
    if (remotePriceHeating.deleted === 'Y') selected = "Ja";
    if (remotePriceHeating.deleted === 'N') selected = "Nei";

    className = `delete${remotePriceHeating.priceRemoteHeatingsId}`;
    //html += objPriceRemoteHeating.showSelectedValues(className, '', enableChanges, selected, 'Nei', 'Ja')
    html += objPriceRemoteHeating.showButton(className, 'Slett');
    html += "</tr>";
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  if (enableChanges) {


    html += insertEmptyTableRow();
  }

  // The end of the table
  html += objPriceRemoteHeating.endTable();
  document.querySelector('.result').innerHTML = html;


}

// Delete one remotePriceHeating row
async function deleteAccountRow(priceRemoteHeatingsId, className) {



  // Check if remotePriceHeating row exist
  accountsRowNumber = objPriceRemoteHeating.arrayPriceRemoteHeatings.findIndex(remotePriceHeating => remotePriceHeating.priceRemoteHeatingsId === priceRemoteHeatingsId);
  if (accountsRowNumber !== -1) {

    // delete remotePriceHeating row
    await objPriceRemoteHeating.deleteAccountsTable(priceRemoteHeatingsId, objPriceRemoteHeating.user);
  }

  await objPriceRemoteHeating.loadPriceRemoteHeatingTable(objPriceRemoteHeating.condominiumId);
}

// Update a priceremoteheatings table row
async function updatePriceRemoteHeatingsRow(priceRemoteHeatingsId) {

  priceRemoteHeatingsId = Number(priceRemoteHeatingsId);

  // year
  className = `.year${priceRemoteHeatingsId}`;
  let year = document.querySelector(className).value;
  className = `year${priceRemoteHeatingsId}`;
  const validYear = objPriceRemoteHeating.validateInterval(className, columnWidths, '', 'Ugyldig år', true, year, 2020, 2030);

  // priceKilowattHour
  className = `.priceKilowattHour${priceRemoteHeatingsId}`;
  let priceKilowattHour = document.querySelector(className).value;
  priceKilowattHour = formatKronerToOre(priceKilowattHour);
  className = `priceKilowattHour${priceRemoteHeatingsId}`;
  const validKilowattHourPrice = objPriceRemoteHeating.validateInterval(className, columnWidths, '', 'Ugyldig pris per kilowattimer', true, priceKilowattHour, 0, objPriceRemoteHeating.nineNine);

  // Validate priceremoteheatings columns
  if (validYear && validKilowattHourPrice) {

    document.querySelector('.message').style.display = "none";

    // Check if the remotePriceHeating id exist
    const rowNumberPriceRemoteHeating = objPriceRemoteHeating.arrayPriceRemoteHeatings.findIndex(remotePriceHeating => remotePriceHeating.priceRemoteHeatingsId === priceRemoteHeatingsId);
    if (rowNumberPriceRemoteHeating !== -1) {

      // update a priceremoteheatings row
      await objPriceRemoteHeating.updatePriceRemoteHeatingTable(objPriceRemoteHeating.user, priceRemoteHeatingsId, year, priceKilowattHour);
    } else {

      // Insert a priceremoteheatings row
      await objPriceRemoteHeating.insertPriceRemoteHeatingTable(objPriceRemoteHeating.condominiumId, objPriceRemoteHeating.user, year, priceKilowattHour);
    }

    await objPriceRemoteHeating.loadPriceRemoteHeatingTable(objPriceRemoteHeating.condominiumId);


    showRemoteHeating();
  }
}

// Delete a priceremoteheatings row
async function deletePriceRemoteHeatingRow(priceRemoteHeatingsId, className) {



  // Check if priceremoteheatings row exist
  rowNumberPriceRemoteHeating = objPriceRemoteHeating.arrayPriceRemoteHeatings.findIndex(remotePriceHeating => remotePriceHeating.priceRemoteHeatingsId === priceRemoteHeatingsId);
  if (rowNumberPriceRemoteHeating !== -1) {

    // delete priceremoteheatings row
    await objPriceRemoteHeating.deletePriceRemoteHeatingTable(priceRemoteHeatingsId, objPriceRemoteHeating.user);
  }
}
