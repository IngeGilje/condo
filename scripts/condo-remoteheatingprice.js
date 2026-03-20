// maintenance of remote heating prices

// Activate classes
const today = new Date();
const objUsers = new User('user');
const objCondos = new Condo('condo');
const objRemoteHeatingPrices = new RemoteHeatingPrice('remoteheatingprice');

let condominiumId = 0;
let user = "";
let securityLevel = 0;
const tableWidth = 'width:750px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    condominiumId = Number(sessionStorage.getItem("condominiumId"));
    user = sessionStorage.getItem("user");
        securityLevel = sessionStorage.getItem("securityLevel");
    if ((condominiumId === 0 || user === null)) {

      // LogIn is not valid
      //window.location.href = 'http://localhost/condo-login.html';
           const URL = (objUsers.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'Y';
      await objUsers.loadUsersTable(condominiumId, resident);
      await objCondos.loadCondoTable(condominiumId);

      // Show header
      let menuNumber = 0;
      showHeader();

      await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(condominiumId);

      // Show remoteHeatingPrice
      menuNumber = showResult(menuNumber);

      // Events
      events();
    }
  } else {

    objRemoteHeatings.showMessage(objRemoteHeatings,'', 'condo-server.js er ikke startet.');
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
        .map(prefix => objRemoteHeatingPrices.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      const classNameDelete = `.${className}`
      const deleteRemoteHeatingRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteRemoteHeatingRowValue === "Ja") {

        const remoteHeatingPriceId = Number(className.substring(6));
        await deleteRemoteHeatingPriceRow(remoteHeatingPriceId, className);

        await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(condominiumId);

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
        .map(prefix => objRemoteHeatingPrices.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract remoteHeatingPriceId in the class name
      let remoteHeatingPriceId = 0;
      let prefix = "";
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
        .map(prefix => objRemoteHeatingPrices.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      //const className = objRemoteHeatingPrices.getDeleteClass(event.target);
      const classNameDelete = `.${className}`
      const deleteAccountRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteAccountRowValue === "Ja") {

        await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(condominiumId);

        let menuNumber = 0;
        menuNumber = showResult(menuNumber);
      };
    };
  });
  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objRemoteHeatingPrices.serverStatus === 1)
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
  let html = objRemoteHeatingPrices.startTable(tableWidth);

  // show main header
  html += objRemoteHeatingPrices.showTableHeader('width:175px;', '', ' Fjernvarme', '');

  // The end of the table header
  html += objRemoteHeatingPrices.endTableHeader();

  // The end of the table
  html += objRemoteHeatingPrices.endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  html = objRemoteHeatingPrices.startTable(tableWidth);

  // start table body
  html += objRemoteHeatingPrices.startTableBody();

  // show main header
  html += objRemoteHeatingPrices.showTableHeaderLogOut('width:175px;', '','','Fjernvarme','');
  html += "</tr>";

  // end table body
  html += objRemoteHeatingPrices.endTableBody();

  // The end of the table
  html += objRemoteHeatingPrices.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Insert empty table row
function insertEmptyTableRow(rowNumber) {

  let html = "";
  let date = "";

  // insert table columns in start of a row
  html += objRemoteHeatingPrices.insertTableColumns('', rowNumber);

  html += "<td class='center'>Ny fjernvarmepris</td>";

  // Select year
  const year = today.getFullYear();
  html += objRemoteHeatingPrices.selectInterval('year0', 'width:175px;', 2020, 2030, year);

  // priceKilowattHour 
  html += objRemoteHeatingPrices.inputTableColumn('priceKilowattHour0', '', "", 10);

  html += "</tr>";
  return html;
}

// Show remoteheatingprices
function showResult(rowNumber) {

  // start table
  let html = objRemoteHeatingPrices.startTable(tableWidth);

  rowNumber++;
  html += objRemoteHeatingPrices.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, 'Slett', 'År', `Pris kilowatTimer`);

  objRemoteHeatingPrices.arrayRemoteHeatingPrices.forEach((remoteHeatingPrice) => {

    // insert table columns in start of a row
    rowNumber++;
    html += objRemoteHeatingPrices.insertTableColumns('', rowNumber);

    // Delete
    let selectedChoice = "Ugyldig verdi";
    if (remoteHeatingPrice.deleted === 'Y') selectedChoice = "Ja";
    if (remoteHeatingPrice.deleted === 'N') selectedChoice = "Nei";

    let className = `delete${remoteHeatingPrice.remoteHeatingPriceId}`;
    html += objRemoteHeatingPrices.showSelectedValues(className, 'width:175px;', selectedChoice, 'Nei', 'Ja')

    // Select year
    const year = remoteHeatingPrice.year;
    className = `year${remoteHeatingPrice.remoteHeatingPriceId}`;
    html += objRemoteHeatingPrices.selectInterval(className, 'width:175px;', 2020, 2030, year);

    // priceKilowattHour
    let priceKilowattHour = remoteHeatingPrice.priceKilowattHour;
    className = `priceKilowattHour${remoteHeatingPrice.remoteHeatingPriceId}`;
    priceKilowattHour = formatOreToKroner(priceKilowattHour);
    html += objRemoteHeatingPrices.inputTableColumn(className, '', priceKilowattHour, 10);

    html += "</tr>";
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  rowNumber++;
  html += insertEmptyTableRow(rowNumber);

  // Show the rest of the menu
  rowNumber++;
  html += objRemoteHeatingPrices.showRestMenu(rowNumber);

  // The end of the table
  html += objRemoteHeatingPrices.endTable();
  document.querySelector('.result').innerHTML = html;

  return rowNumber;
}

// Delete one remoteHeatingPrice row
async function deleteAccountRow(remoteHeatingPriceId, className) {



  // Check if remoteHeatingPrice row exist
  accountsRowNumber = objRemoteHeatingPrices.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
  if (accountsRowNumber !== -1) {

    // delete remoteHeatingPrice row
    objRemoteHeatingPrices.deleteAccountsTable(remoteHeatingPriceId, user);
  }

  await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(condominiumId);
}

// Update a remoteheatingprices table row
async function updateRemoteHeatingPricesRow(remoteHeatingPriceId) {

  remoteHeatingPriceId = Number(remoteHeatingPriceId);

  //const condominiumId = Number(condominiumId);


  // year
  className = `.year${remoteHeatingPriceId}`;
  let year = document.querySelector(className).value;
  className = `year${remoteHeatingPriceId}`;
  const validYear = objRemoteHeatingPrices.validateNumber(className, year, 2020, 2030);

  // priceKilowattHour
  className = `.priceKilowattHour${remoteHeatingPriceId}`;
  let priceKilowattHour = document.querySelector(className).value;
  priceKilowattHour = formatKronerToOre(priceKilowattHour);
  className = `priceKilowattHour${remoteHeatingPriceId}`;
  const validKilowattHourPrice = objRemoteHeatingPrices.validateNumber(className, priceKilowattHour, 0, objRemoteHeatingPrices.nineNine);

  // Validate remoteheatingprices columns
  if (validYear && validKilowattHourPrice) {

    // Check if the remoteHeatingPrice id exist
    const rowNumberRemoteHeatingPrice = objRemoteHeatingPrices.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
    if (rowNumberRemoteHeatingPrice !== -1) {

      // update a remoteheatingprices row
      await objRemoteHeatingPrices.updateRemoteHeatingPricesTable(user, remoteHeatingPriceId, year, priceKilowattHour);
    } else {

      // Insert a remoteheatingprices row
      await objRemoteHeatingPrices.insertRemoteHeatingPricesTable(condominiumId, user, year, priceKilowattHour);
    }

    await objRemoteHeatingPrices.loadRemoteHeatingPricesTable(condominiumId);

    let menuNumber = 0;
    menuNumber = showResult(menuNumber);
  }
}

// Delete a remoteheatingprices row
async function deleteRemoteHeatingPriceRow(remoteHeatingPriceId, className) {



  // Check if remoteheatingprices row exist
  rowNumberRemoteHeatingPrice = objRemoteHeatingPrices.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
  if (rowNumberRemoteHeatingPrice !== -1) {

    // delete remoteheatingprices row
    objRemoteHeatingPrices.deleteRemoteHeatingPricesTable(remoteHeatingPriceId, user);
  }
}
