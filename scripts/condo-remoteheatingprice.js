// maintenance of remote heating prices

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objRemoteHeatingPrice = new RemoteHeatingPrice('remoteheatingprice');

const enableChanges = (objRemoteHeatingPrice.securityLevel > 5);

const tableWidth = 'width:750px;';

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

      const resident = 'Y';
      await objUser.loadUsersTable(objRemoteHeatingPrice.condominiumId, resident, objRemoteHeatingPrice.nineNine);
      await objCondo.loadCondoTable(objRemoteHeatingPrice.condominiumId);

      // Show header
      let menuNumber = 0;
      showHeader();

      await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId);

      // Show remoteHeatingPrice
      menuNumber = showResult(menuNumber);

      // Events
      events();
    }
  } else {

    objRemoteHeatingPrice.showMessage(objRemoteHeatingPrice, '', 'condo-server.js er ikke startet.');
  }
}

// Events for remoteheatingprices
async function events() {

  // Delete remoteheatingprices row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['delete'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objRemoteHeatingPrice.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      const classNameDelete = `.${className}`
      const deleteRemoteHeatingRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteRemoteHeatingRowValue === "Ja") {

        const remoteHeatingPriceId = Number(className.substring(6));
        await deleteRemoteHeatingPriceRow(remoteHeatingPriceId, className);

        await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId);

        let menuNumber = 0;
        menuNumber = showResult(menuNumber);
      };
    };
  });

  // update a remoteheatingprices row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['year', 'priceKilowattHour'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objRemoteHeatingPrice.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract remoteHeatingPriceId in the class name
      let remoteHeatingPriceId = 0;
      let prefix = '';
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        remoteHeatingPriceId = Number(className.slice(prefix.length));
      }

      // Update a remoteheatingprices row
      await updateRemoteHeatingPricesRow(remoteHeatingPriceId);
    };
  });

  // Delete suppliers row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      const arrayPrefixes = ['delete'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objRemoteHeatingPrice.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      //const className = objRemoteHeatingPrice.getDeleteClass(event.target);
      const classNameDelete = `.${className}`
      const deleteAccountRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteAccountRowValue === "Ja") {

        await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId);

        let menuNumber = 0;
        menuNumber = showResult(menuNumber);
      };
    };
  });
  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objRemoteHeatingPrice.serverStatus === 1)
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
  let html = objRemoteHeatingPrice.startTable(tableWidth);

  // start table body
  html += objRemoteHeatingPrice.startTableBody();

  // show main header
  html += objRemoteHeatingPrice.showTableHeaderLogOut('width:175px;', '', '', 'Fjernvarme priser', '');
  html += "</tr>";

  // end table body
  html += objRemoteHeatingPrice.endTableBody();

  // The end of the table
  html += objRemoteHeatingPrice.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Insert empty table row
function insertEmptyTableRow(menuNumber) {

  let html = '';
  let date = '';

  // insert table columns in start of a row
  html += objRemoteHeatingPrice.insertTableColumns('', menuNumber);

  html += "<td class='center'>Ny fjernvarmepris</td>";

  // Select year
  const year = today.getFullYear();
  html += objRemoteHeatingPrice.selectInterval('year0', 'width:175px;', 2020, 2030, year, enableChanges);

  // priceKilowattHour 
  html += objRemoteHeatingPrice.inputTableColumn('priceKilowattHour0', '', '0,00', 10, enableChanges);

  html += "</tr>";
  return html;
}

// Show remoteheatingprices
function showResult(menuNumber) {

  // start table
  let html = objRemoteHeatingPrice.startTable(tableWidth);

  menuNumber++;
  html += objRemoteHeatingPrice.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, 'Slett', 'År', `Pris kilowatTimer`);

  objRemoteHeatingPrice.arrayRemoteHeatingPrices.forEach((remoteHeatingPrice) => {

    // insert table columns in start of a row
    menuNumber++;
    html += objRemoteHeatingPrice.insertTableColumns('', menuNumber);

    // Delete
    let selected = "Ugyldig verdi";
    if (remoteHeatingPrice.deleted === 'Y') selected = "Ja";
    if (remoteHeatingPrice.deleted === 'N') selected = "Nei";

    let className = `delete${remoteHeatingPrice.remoteHeatingPriceId}`;
    html += objRemoteHeatingPrice.showSelectedValues(className, 'width:175px;', enableChanges, selected, 'Nei', 'Ja')

    // Select year
    const year = remoteHeatingPrice.year;
    className = `year${remoteHeatingPrice.remoteHeatingPriceId}`;
    html += objRemoteHeatingPrice.selectInterval(className, 'width:175px;', 2020, 2030, year, enableChanges);

    // priceKilowattHour
    let priceKilowattHour = remoteHeatingPrice.priceKilowattHour;
    className = `priceKilowattHour${remoteHeatingPrice.remoteHeatingPriceId}`;
    priceKilowattHour = formatOreToKroner(priceKilowattHour);
    html += objRemoteHeatingPrice.inputTableColumn(className, '', priceKilowattHour, 10, enableChanges);

    html += "</tr>";
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  if (enableChanges) {

    menuNumber++;
    html += insertEmptyTableRow(menuNumber);
  }

  // Show the rest of the menu
  menuNumber++;
  html += objRemoteHeatingPrice.showRestMenu(menuNumber);

  // The end of the table
  html += objRemoteHeatingPrice.endTable();
  document.querySelector('.result').innerHTML = html;

  return menuNumber;
}

// Delete one remoteHeatingPrice row
async function deleteAccountRow(remoteHeatingPriceId, className) {



  // Check if remoteHeatingPrice row exist
  accountsRowNumber = objRemoteHeatingPrice.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
  if (accountsRowNumber !== -1) {

    // delete remoteHeatingPrice row
    objRemoteHeatingPrice.deleteAccountsTable(remoteHeatingPriceId, user);
  }

  await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId);
}

// Update a remoteheatingprices table row
async function updateRemoteHeatingPricesRow(remoteHeatingPriceId) {

  remoteHeatingPriceId = Number(remoteHeatingPriceId);

  // year
  className = `.year${remoteHeatingPriceId}`;
  let year = document.querySelector(className).value;
  className = `year${remoteHeatingPriceId}`;
  const validYear = objRemoteHeatingPrice.validateNumber(className, year, 2020, 2030, objRemoteHeatingPrice, '', 'Ugyldig år');

  // priceKilowattHour
  className = `.priceKilowattHour${remoteHeatingPriceId}`;
  let priceKilowattHour = document.querySelector(className).value;
  priceKilowattHour = formatKronerToOre(priceKilowattHour);
  className = `priceKilowattHour${remoteHeatingPriceId}`;
  const validKilowattHourPrice = objRemoteHeatingPrice.validateNumber(className, priceKilowattHour, 0, objRemoteHeatingPrice.nineNine, objRemoteHeatingPrice, '', 'Ugyldig pris per kilowattimer');

  // Validate remoteheatingprices columns
  if (validYear && validKilowattHourPrice) {

    document.querySelector('.message').style.display = "none";
  
    // Check if the remoteHeatingPrice id exist
    const rowNumberRemoteHeatingPrice = objRemoteHeatingPrice.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
    if (rowNumberRemoteHeatingPrice !== -1) {

      // update a remoteheatingprices row
      await objRemoteHeatingPrice.updateRemoteHeatingPricesTable(objRemoteHeatingPrice.user, remoteHeatingPriceId, year, priceKilowattHour);
    } else {

      // Insert a remoteheatingprices row
      await objRemoteHeatingPrice.insertRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId, objRemoteHeatingPrice.user, year, priceKilowattHour);
    }

    await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId);

    let menuNumber = 0;
    menuNumber = showResult(menuNumber);
  }
}

// Delete a remoteheatingprices row
async function deleteRemoteHeatingPriceRow(remoteHeatingPriceId, className) {



  // Check if remoteheatingprices row exist
  rowNumberRemoteHeatingPrice = objRemoteHeatingPrice.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
  if (rowNumberRemoteHeatingPrice !== -1) {

    // delete remoteheatingprices row
    objRemoteHeatingPrice.deleteRemoteHeatingPricesTable(remoteHeatingPriceId, objRemoteHeatingPrice.user);
  }
}
