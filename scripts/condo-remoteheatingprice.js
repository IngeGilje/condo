// maintenance of remote heating prices

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objRemoteHeatingPrice = new RemoteHeatingPrice('remoteheatingprice');

const enableChanges = (objRemoteHeatingPrice.securityLevel > 5);

const columnWidths = [175, 175, 100];

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

      // Show main menu
      let html = objRemoteHeatingPrice.showHorizontalMenu(objRemoteHeatingPrice.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show remote heating menu
      html = objRemoteHeatingPrice.showHorizontalMenu(objRemoteHeatingPrice.arrayMenuRemoteHeating);
      document.querySelector('.menuRemoteHeating').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objRemoteHeatingPrice.condominiumId, resident, objRemoteHeatingPrice.nineNine);
      await objCondo.loadCondoTable(objRemoteHeatingPrice.condominiumId, objRemoteHeatingPrice.nineNine);

      // Show header
      showHeader();

      await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId);

      // Show remoteHeatingPrice
      showRemoteHeating();

      // Events
      events();
    }
  } else {

    objRemoteHeatingPrice.showMessageNew(columnWidths, '', 'Server er ikke startet.');
  }
}

// Events for remoteheatingprices
async function events() {

  // Delete remoteheatingprices row
  // update a remoteheatingprices row
  document.addEventListener('click', async (event) => {

    const arrayPrefixes = ['delete'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

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
      await deleteRemoteHeatingPriceRow(remoteHeatingPriceId, className);
      await objRemoteHeatingPrice.loadRemoteHeatingPricesTable(objRemoteHeatingPrice.condominiumId);

      showRemoteHeating();
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

        showRemoteHeating();
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
  let html = objRemoteHeatingPrice.initializeTable(columnWidths);

  // start table body
  html += objRemoteHeatingPrice.startTableBody();

  // show main header
  html += objRemoteHeatingPrice.showTableHeaderLogOut('', 'Fjernvarme priser');
  html += "</tr>";

  // end table body
  html += objRemoteHeatingPrice.endTableBody();

  // The end of the table
  html += objRemoteHeatingPrice.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Insert empty table row
function insertEmptyTableRow() {

  let html = '';
  let date = '';

  // insert a table row (<tr></td>)
  html += objRemoteHeatingPrice.insertTableRow('');

  // Select year (<td></td>)
  const year = today.getFullYear();
  html += objRemoteHeatingPrice.showSelectedNumbers('year0', 'width:175px;', 2020, 2030, year, true);

  // priceKilowattHour 
  html += objRemoteHeatingPrice.editTableCell('priceKilowattHour0', '', '0,00', 10, enableChanges);

  html += "<td>Ny fjernvarmepris</td></tr>";
  return html;
}

// Show remoteheatingprices
function showRemoteHeating() {

  // start table
  let html = objRemoteHeatingPrice.initializeTable(columnWidths);

  html += objRemoteHeatingPrice.showTableHeaderMenu( '','center', 'År', `Pris kilowatTimer`, 'Slett');

  objRemoteHeatingPrice.arrayRemoteHeatingPrices.forEach((remoteHeatingPrice) => {

    // insert a table row (<tr></td>)
    html += objRemoteHeatingPrice.insertTableRow('');

    // Select year (<td></td>)
    const year = remoteHeatingPrice.year;
    let className = `year${remoteHeatingPrice.remoteHeatingPriceId}`;
    html += objRemoteHeatingPrice.showSelectedNumbers(className, 'width:175px;', 2020, 2030, year, true);

    // priceKilowattHour
    let priceKilowattHour = remoteHeatingPrice.priceKilowattHour;
    className = `priceKilowattHour${remoteHeatingPrice.remoteHeatingPriceId}`;
    priceKilowattHour = formatOreToKroner(priceKilowattHour);
    html += objRemoteHeatingPrice.editTableCell(className,  priceKilowattHour, 10, enableChanges);

    // Delete
    let selected = "Ugyldig verdi";
    if (remoteHeatingPrice.deleted === 'Y') selected = "Ja";
    if (remoteHeatingPrice.deleted === 'N') selected = "Nei";

    className = `delete${remoteHeatingPrice.remoteHeatingPriceId}`;
    //html += objRemoteHeatingPrice.showSelectedValues(className, 'width:175px;', enableChanges, selected, 'Nei', 'Ja')
    html += objRemoteHeatingPrice.showButton(className, 'Slett');
    html += "</tr>";
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  if (enableChanges) {

    html += insertEmptyTableRow();
  }

  // The end of the table
  html += objRemoteHeatingPrice.endTable();
  document.querySelector('.result').innerHTML = html;
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
  className = `.year${remoteHeatingPriceId}`;
  let year = document.querySelector(className).value;
  className = `year${remoteHeatingPriceId}`;
  const validYear = objRemoteHeatingPrice.validateInterval(className, columnWidths, '', 'Ugyldig år', true, year, 2020, 2030);

  // priceKilowattHour
  className = `.priceKilowattHour${remoteHeatingPriceId}`;
  let priceKilowattHour = document.querySelector(className).value;
  priceKilowattHour = formatKronerToOre(priceKilowattHour);
  className = `priceKilowattHour${remoteHeatingPriceId}`;
  const validKilowattHourPrice = objRemoteHeatingPrice.validateInterval(className, columnWidths, '', 'Ugyldig pris per kilowattimer', true, priceKilowattHour, 0, objRemoteHeatingPrice.nineNine);

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

    showRemoteHeating();
  }
}

// Delete a remoteheatingprices row
async function deleteRemoteHeatingPriceRow(remoteHeatingPriceId, className) {



  // Check if remoteheatingprices row exist
  rowNumberRemoteHeatingPrice = objRemoteHeatingPrice.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
  if (rowNumberRemoteHeatingPrice !== -1) {

    // delete remoteheatingprices row
    await objRemoteHeatingPrice.deleteRemoteHeatingPricesTable(remoteHeatingPriceId, objRemoteHeatingPrice.user);
  }
}
