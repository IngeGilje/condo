// Condominium maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objCondominium = new Condominium('condominium');

const enableChanges = (objCondominium.securityLevel > 5);

const columnWidths = [175, 175];

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objCondominium.condominiumId === 0) || (objCondominium.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = objCondominium.showHorizontalMenu(objCondominium.arrayMenuMain);
      document.querySelector('.showMenuMain').innerHTML = html;

      // Show condominium menu
      html = objCondominium.showHorizontalMenu(objCondominium.arrayMenuCondominium);
      document.querySelector('.showMenuCondominium').innerHTML = html;

      await objCondominium.loadCondominiumsTable();
      const resident = 'Y';
      await objUser.loadUsersTable(objCondominium.condominiumId, resident, objCondominium.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objCondominium.condominiumId, fixedCost);
      await objBankAccount.loadBankAccountsTable(objCondominium.condominiumId, objCondominium.nineNine);

      // Show header
      //showHeader();

      // Show filter
      showFilter(objCondominium.condominiumId);

      // Show condominium
      showCondominium(objCondominium.condominiumId);

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
  }
}

// Events for condominium
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterCondominiumId')) {

      // Show condominium
      const fixedCost = 'A';
      const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      await objAccount.loadAccountsTable(condominiumId, fixedCost);
      showCondominium(condominiumId, 3);
    };
  });

  // update/insert a condominiums row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Update a condominiums row
      const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      updateCondominiumRow(condominiumId);
    };
  });

  // Delete condominiums row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      deleteCondominiumRow();

      await objCondominium.loadCondominiumsTable();

      // Show filter
      showFilter(0);

      // Show condominium
      showCondominium(objCondominium.condominiumId);
    };
  });

  // Insert a condominiums row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload condominiums table
      await objCondominium.loadCondominiumsTable();

      let condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      if (condominiumId === 0) condominiumId = objCondominium.arrayCondominiums.at(-1).condominiumId;

      await objCondominium.loadCondominiumsTable();

      // Show filter
      showFilter(condominiumId);

      // Show condominium
      showCondominium(objCondominium.condominiumId);
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objCondominium.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

// Reset all values for condominium
function resetValues() {

  document.querySelector('.filterCondominiumId').value = '';

  document.querySelector('.name').value = '';

  // street
  document.querySelector('.street').value = '';

  //  address 2
  document.querySelector('.address2').value = '';

  // postal code
  document.querySelector('.postalCode').value = '';

  // city
  document.querySelector('.city').value = '';

  // phone number
  document.querySelector('.phone').value = '';

  // email
  document.querySelector('.email').value = '';

  // account id for income remote heating
  document.querySelector('.incomeRemoteHeatingAccountId').value = 0;

  // account id for payment remote heating
  document.querySelector('.paymentRemoteHeatingAccountId').value = 0;

  // account id for common cost
  document.querySelector('.commonCostAccountId').value = 0;

  // organization number
  document.querySelector('.organizationNumber').value = '';

  // name of importfile
  document.querySelector('.importPath').value = '';

  objCondominium.removeMessage();

  document.querySelector('.filterCondominiumId').disabled = true;

  if (enableChanges) {
    document.querySelector('.delete').disabled = true;
    document.querySelector('.insert').disabled = true;
    document.querySelector('.cancel').disabled = false;
  }
}

// Delete condominium row
async function deleteCondominiumRow() {

  // condominiumId
  const condominiumId = Number(document.querySelector('.filterCondominiumId').value);

  // Check if condominiumId exist
  const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (rowNumberCondominium !== -1) {

    // delete condominium row
    await objCondominium.deleteCondominiumsTable(condominiumId, objCondominium.user);
  }
}

// Show header
function showHeader() {

  // Start table
  let html = objCondominium.initializeTable(columnWidths);

  // show main header
  html += objCondominium.showTableHeaderLogOut('', 'Sameie');

  html += "</tr>";

  // end table body
  html += objCondominium.endTableBody();

  // The end of the table
  html += objCondominium.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter(condominiumId) {

  // Start frame
  let html = startFrame();

  // show filter
  html += startRow();

  // Show condominiums
  html += objCondominium.showSelectedCondominiumsNew('Sameie', 'filterCondominiumId', '', condominiumId, '', '', true);

  html += "</div>";

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("Filter");
}

// Show condominium
function showCondominium(condominiumId) {

  // row number condominium
  const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);

  let html = emptyRow();
  html += startRow();

  // name
  /*
  const name = (rowNumberCondominium === -1)
    ? ''
    : objCondominium.arrayCondominiums[rowNumberCondominium].name.trim();
  */
  let name = objCondominium.arrayCondominiums[rowNumberCondominium]?.name.trim() ?? '';
  html += showTextNew('Navn', 'name', name, enableChanges, "Leverandørnavn");
  html += "</div>";

  // street, address2
  html += startRow();

  // street
  const street = (rowNumberCondominium === -1)
    ? ''
    : objCondominium.arrayCondominiums[rowNumberCondominium].street;
  html += showTextNew('Gatenavn', 'street', street, enableChanges);

  // address2
  /*
  const address2 = (rowNumberCondominium === -1)
    ? ''
    : objCondominium.arrayCondominiums[rowNumberCondominium].address2;
  */
  const address2 = objCondominium.arrayCondominiums[rowNumberCondominium]?.address2.trim() ?? '';
  html += showTextNew('Adresse2', 'address2', address2, enableChanges);
  html += "</div>";

  // postalCode, city
  html += startRow();

  let postalCode = (rowNumberCondominium === -1)
    ? ''
    : objCondominium.arrayCondominiums[rowNumberCondominium].postalCode;
  if (postalCode === '0') postalCode = "";
  html += showTextNew('Postnummer', 'postalCode', postalCode, enableChanges);

  // city
  /*
  const city = (rowNumberCondominium === -1)
    ? ''
    : objCondominium.arrayCondominiums[rowNumberCondominium].city;
  */
  const city = objCondominium.arrayCondominiums[rowNumberCondominium]?.city.trim() ?? '';

  html += showTextNew('Poststed', 'city', city, enableChanges);
  html += "</div>";

  // phone, email
  html += startRow();

  // phone
  /*
  const phone = (rowNumberCondominium === -1)
    ? ''
    : objCondominium.arrayCondominiums[rowNumberCondominium].phone;
  */
  const phone = objCondominium.arrayCondominiums[rowNumberCondominium]?.phone.trim() ?? '';
  html += showTextNew('Telefonnummer', 'phone', phone, enableChanges);

  // email
  /*
  let email = (rowNumberCondominium === -1)
    ? ''
    : objCondominium.arrayCondominiums[rowNumberCondominium].email;
  */
  const email = objCondominium.arrayCondominiums[rowNumberCondominium]?.email.trim() ?? '';
  html += showTextNew('E-mail', 'email', email, enableChanges);
  html += "</div>";

  // income Remote Heating AccountId, bankAccount, commonCostAccountId
  html += startRow();

  // income Remote Heating AccountId
  /*
  const incomeRemoteHeatingAccountId = (rowNumberCondominium === -1)
    ? ''
    : objCondominium.arrayCondominiums[rowNumberCondominium].incomeRemoteHeatingAccountId;
  */
  const incomeRemoteHeatingAccountId = objCondominium.arrayCondominiums[rowNumberCondominium]?.incomeRemoteHeatingAccountId ?? 0;
  html += objAccount.showSelectedAccountsNew('Inntekstkonto fjernvarme', 'incomeRemoteHeatingAccountId', '', incomeRemoteHeatingAccountId, 'Velg konto', '', enableChanges);

  // payment Remote Heating AccountId
  /*
  const paymentRemoteHeatingAccountId = (rowNumberCondominium === -1)
    ? ''
    : objCondominium.arrayCondominiums[rowNumberCondominium].paymentRemoteHeatingAccountId;
    */
  const paymentRemoteHeatingAccountId = objCondominium.arrayCondominiums[rowNumberCondominium]?.paymentRemoteHeatingAccountId ?? 0;
  html += objAccount.showSelectedAccountsNew('Ugiftskonto fjernvarme', 'paymentRemoteHeatingAccountId', '', paymentRemoteHeatingAccountId, 'Velg konto', '', enableChanges);

  // common Cost AccountId
  const commonCostAccountId = (rowNumberCondominium === -1)
    ? ''
    : objCondominium.arrayCondominiums[rowNumberCondominium].commonCostAccountId;
  html += objAccount.showSelectedAccountsNew('Inntektskonto husleie', 'commonCostAccountId', '', commonCostAccountId, 'Velg konto', '', enableChanges);
  html += "</div>";

  // organizationNumber
  html += startRow();
  /*
  const organizationNumber = (rowNumberCondominium === -1)
    ? ''
    : objCondominium.arrayCondominiums[rowNumberCondominium].organizationNumber;
  */
  const organizationNumber = objCondominium.arrayCondominiums[rowNumberCondominium]?.organizationNumber ?? '';
  html += showTextNew('Organisasjonsnummer', 'organizationNumber', organizationNumber, enableChanges);
  html += "</div>";

  // import Path
  html += startRow();
  /*
  const importPath = (rowNumberCondominium === -1)
    ? ''
    : objCondominium.arrayCondominiums[rowNumberCondominium].importPath;
  */
  const importPath = objCondominium.arrayCondominiums[rowNumberCondominium]?.importPath.trim() ?? '';
  html += showTextNew('Plassering av data', 'importPath', importPath, enableChanges);
  html += "</div>";

  // Buttons
  if (enableChanges) {

    html += startRow();
    html += showButtonNew('update', 'Oppdater');
    html += showButtonNew('cancel', 'Angre');
    html += "</div>";

    html += startRow();
    html += showButtonNew('delete', 'Slett');
    html += showButtonNew('insert', 'Ny');
    html += "</div>";
  }

  document.querySelector('.showCondominium').innerHTML = html;

  if (enableChanges) document.querySelector('.cancel').disabled = true;
}

// Update a condominiums row
async function updateCondominiumRow(condominiumId) {

  if (condominiumId === '') condominiumId = -1
  condominiumId = Number(condominiumId);

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objCondominium.validateText('name', columnWidths, '', 'Ugyldig navn', true, name, 3, 45);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = objCondominium.validateText('street', columnWidths, '', 'Ugyldig addresse', true, street, 3, 45);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = objCondominium.validateText('address2', columnWidths, '', 'Ugyldig addresse', true, address2, 0, 45);

  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = objCondominium.validateInterval('postalCode', columnWidths, '', 'Ugyldig postnummer', true, Number(postalCode), 1, objCondominium.nineNine);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = objCondominium.validateText('city', columnWidths, '', 'Ugyldig poststed', true, city, 1, 45);

  // validate phone
  const phone = document.querySelector('.phone').value;
  const validPhone = objCondominium.validatePhone('phone', phone);

  // validate email
  const email = document.querySelector('.email').value;
  const validEmail = objCondominium.validateEmail('email', email, objCondominium, '', 'Ugyldig mail');

  // validate incomeRemoteHeatingAccountId
  const incomeRemoteHeatingAccountId = Number(document.querySelector('.incomeRemoteHeatingAccountId').value);
  const validIncomeRemoteHeatingAccountId = objCondominium.validateInterval('incomeRemoteHeatingAccountId', columnWidths, '', 'Ugyldig inntektskonto for husleie', true, incomeRemoteHeatingAccountId, 0, objCondominium.nineNine);

  // validate paymentRemoteHeatingAccountId
  const paymentRemoteHeatingAccountId = Number(document.querySelector('.paymentRemoteHeatingAccountId').value);
  const validPaymentRemoteHeatingAccountId = objCondominium.validateInterval('paymentRemoteHeatingAccountId', columnWidths, '', 'Ugyldig inntektskonto for fjernvarme', true, paymentRemoteHeatingAccountId, 0, objCondominium.nineNine);

  // validate commonCostAccountId
  const commonCostAccountId = Number(document.querySelector('.commonCostAccountId').value);
  const validCommonCostAccountId = objCondominium.validateInterval('commonCostAccountId', columnWidths, '', 'Ugyldig konto', true, commonCostAccountId, 0, objCondominium.nineNine);

  // validate organizationNumber
  const organizationNumber = Number(document.querySelector('.organizationNumber').value);
  const validOrganizationNumber = objCondominium.validateOrganizationNumber('organizationNumber', organizationNumber);

  // Validate importPath
  const importPath = document.querySelector('.importPath').value;
  const validimportPath = true;

  if (validName && validStreet && validAddress2 && validPostalCode && validCity && validPhone && validEmail
    && validIncomeRemoteHeatingAccountId && validPaymentRemoteHeatingAccountId
    && validCommonCostAccountId && validOrganizationNumber && validimportPath) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the condominiumId exist
    const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (rowNumberCondominium !== -1) {

      // update the condominiums row
      await objCondominium.updateCondominiumsTable(objCondominium.user, condominiumId, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importPath);
      await objCondominium.loadCondominiumsTable();
    } else {

      // Insert the bankaccount row in condominiums table
      await objCondominium.insertCondominiumsTable(objCondominium.user, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importPath);
      await objCondominium.loadCondominiumsTable();
      condominiumId = Number(objCondominium.arrayCondominiums.at(-1).condominiumId);
    }

    // Show filter
    showFilter(condominiumId);

    // Show condominium
    showCondominium(condominiumId);

    document.querySelector('.filterCondominiumId').disabled = false;
    document.querySelector('.delete').disabled = false;
    document.querySelector('.insert').disabled = false;
  }
}
