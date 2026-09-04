// Condominium maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objAccounts = new Accounts('accounts');
const objBankAccount = new BankAccount('bankaccount');
const objCondominium = new Condominium('condominium');

const enableChanges = (objCondominium.securityLevel > 5);
const applicationName = "condo-condominium";

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

      // Show menu
      let html = objCondominium.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      await objCondominium.loadCondominiumsTable();
      const resident = 'Y';
      await objUser.loadUsersTable(objCondominium.condominiumId, resident, objCondominium.nineNine);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objCondominium.condominiumId, fixedCost);
      await objBankAccount.loadBankAccountsTable(objCondominium.condominiumId, objCondominium.nineNine);

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
      await objAccounts.loadAccountsTable(condominiumId, fixedCost);
      showCondominium(condominiumId);
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

      await deleteCondominiumRow();

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
      if (condominiumId === 0) condominiumId = objCondominium.arrayCondominiums.at(-1)?.condominiumId ?? 0;

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

// Show filter
function showFilter(condominiumId) {

  /*
  // Start frame
  let html = startFrame('filter-frame');

  // Show condominiums
  html += objCondominium.showSelectedCondominiumsNew('Sameie', 'filterCondominiumId', '', condominiumId, '', '', true);

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("filter-frame", "Filter");
  */

  // Start filter frame
  let html = startFilterFrame("Sameie");

  // Show condominiums
  html += objCondominium.showSelectedCondominiumsNew('Sameie', 'filterCondominiumId', '', condominiumId, '', '', true);

  // End filter frame
  html += endFilterFrame();

  document.querySelector('.showFilter').innerHTML = html;
}

// Show condominium
function showCondominium(condominiumId) {

  // row number condominium
  const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);

  // Empty line
  //let html = emptyLine();
  //html += startLine();

  let html = startContent('Sameie');

  let name = objCondominium.arrayCondominiums[rowNumberCondominium]?.name.trim() ?? '';
  html += inputText("name", "Navn", name, enableChanges);
  html += "<div></div>";
  html += "<div></div>";

  // street
  const street = (rowNumberCondominium === -1)
    ? ''
    : objCondominium.arrayCondominiums[rowNumberCondominium].street;
  html += inputText("street", "Gatenavn", street, enableChanges);

  // address2
  const address2 = objCondominium.arrayCondominiums[rowNumberCondominium]?.address2.trim() ?? '';
  html += inputText("address2", "Adresse2", address2, enableChanges);
  html += "<div></div>";

  // postalCode
  let postalCode = (rowNumberCondominium === -1)
    ? ''
    : objCondominium.arrayCondominiums[rowNumberCondominium].postalCode;
  if (postalCode === '0') postalCode = "";
  html += inputText("postalCode", "Postnummer", postalCode, enableChanges);

  // city
  const city = objCondominium.arrayCondominiums[rowNumberCondominium]?.city.trim() ?? '';
  html += inputText("city", "Poststed", city, enableChanges);
  html += "<div></div>";

  // phone
  const phone = objCondominium.arrayCondominiums[rowNumberCondominium]?.phone.trim() ?? '';
  html += inputText("phone", "Telefonnummer", phone, enableChanges);

  // email
  const email = objCondominium.arrayCondominiums[rowNumberCondominium]?.email.trim() ?? '';
  html += inputText("email", "E-mail", email, enableChanges);
  html += "<div></div>";

  // income Remote Heating AccountId
  const incomeRemoteHeatingAccountId = objCondominium.arrayCondominiums[rowNumberCondominium]?.incomeRemoteHeatingAccountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('Inntekstkonto fjernvarme', 'incomeRemoteHeatingAccountId', incomeRemoteHeatingAccountId, 'Velg konto', '', enableChanges);

  // payment Remote Heating AccountId
  const paymentRemoteHeatingAccountId = objCondominium.arrayCondominiums[rowNumberCondominium]?.paymentRemoteHeatingAccountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('Ugiftskonto fjernvarme', 'paymentRemoteHeatingAccountId', paymentRemoteHeatingAccountId, 'Velg konto', '', enableChanges);
  html += "<div></div>";

  // common Cost AccountId
  const commonCostAccountId = (rowNumberCondominium === -1)
    ? ''
    : objCondominium.arrayCondominiums[rowNumberCondominium].commonCostAccountId;
  html += objAccounts.showSelectedAccountsNew('Inntektskonto husleie', 'commonCostAccountId', commonCostAccountId, 'Velg konto', '', enableChanges);

  // organizationNumber
  const organizationNumber = objCondominium.arrayCondominiums[rowNumberCondominium]?.organizationNumber ?? '';
  html += inputText("organizationNumber", "Organisasjonsnummer", organizationNumber, enableChanges);
  html += "<div></div>";

  // import Path
  const importPath = objCondominium.arrayCondominiums[rowNumberCondominium]?.importPath.trim() ?? '';
   html += inputWideText("importPath", "Plassering av data", importPath, 2, enableChanges);

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
  document.querySelector('.showCondominium').innerHTML = html;
}

// Update a condominiums row
async function updateCondominiumRow(condominiumId) {

  if (condominiumId === '') condominiumId = -1
  condominiumId = Number(condominiumId);

  // validate name
  const name = document.querySelector('.name').value;
  const validName = validateTextNew('name', '', 'Ugyldig Navn', true, name, 3, 45);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = validateTextNew('street', '', 'Ugyldig Addresse', true, street, 3, 45);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = validateTextNew('address2', '', 'Ugyldig addresse', true, address2, 0, 45);

  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = validateIntervalNew('postalCode', '', 'Ugyldig postnummer', true, Number(postalCode), 1, objCondominium.nineNine);

  // validate city
  const city = document.querySelector('.city').value;
  //const validCity = validateTextNew('city', '', 'Ugyldig poststed', true, city, 1, 45);
  const validCity = validateTextNew('city', '', 'Ugyldig Poststed', true, city, 0, 45);

  // validate phone
  const phone = document.querySelector('.phone').value;
  const validPhone = validatePhoneNew('phone', phone);

  // validate email
  const email = document.querySelector('.email').value;
  const validEmail = objCondominium.validateEmail('email', email, objCondominium, '', 'Ugyldig mail');

  // validate incomeRemoteHeatingAccountId
  const incomeRemoteHeatingAccountId = Number(document.querySelector('.incomeRemoteHeatingAccountId').value);
  const validIncomeRemoteHeatingAccountId = validateIntervalNew('incomeRemoteHeatingAccountId', '', 'Ugyldig inntektskonto for husleie', true, incomeRemoteHeatingAccountId, 0, objCondominium.nineNine);

  // validate paymentRemoteHeatingAccountId
  const paymentRemoteHeatingAccountId = Number(document.querySelector('.paymentRemoteHeatingAccountId').value);
  //const validPaymentRemoteHeatingAccountId = validateIntervalNew('paymentRemoteHeatingAccountId', '', 'Ugyldig inntektskonto for fjernvarme', true, paymentRemoteHeatingAccountId, 0, objCondominium.nineNine);
  const validPaymentRemoteHeatingAccountId = validateIntervalNew('paymentRemoteHeatingAccountId', '', 'Ugyldig Inntektskonto for Fjernvarme', true, paymentRemoteHeatingAccountId, 0, objCondominium.nineNine);

  // validate commonCostAccountId
  const commonCostAccountId = Number(document.querySelector('.commonCostAccountId').value);
  //const validCommonCostAccountId = validateIntervalNew('commonCostAccountId', '', 'Ugyldig konto', true, commonCostAccountId, 0, objCondominium.nineNine);
  const validCommonCostAccountId = validateIntervalNew('commonCostAccountId', '', 'Ugyldig Konto', true, commonCostAccountId, 0, objCondominium.nineNine);

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

    // Check if the condominium row exist
    const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (rowNumberCondominium !== -1) {

      // update a condominiums row
      await objCondominium.updateCondominiumsTable(objCondominium.user, condominiumId, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importPath);
    } else {

      // Insert a condominiums row
      await objCondominium.insertCondominiumsTable(objCondominium.user, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importPath);
      await objCondominium.getHighestAccountId(objCondominium.condominiumId);
      condominiumId = objCondominium.arrayCondominiums[0].condominiumId;
    }

    await objCondominium.loadCondominiumsTable();

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterCondominiumId', false);
    }

    // Show filter
    showFilter(condominiumId);

    // Show condominium
    showCondominium(condominiumId);
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

  removeMessage();

  document.querySelector('.filterCondominiumId').disabled = true;

  // Buttons
  removeMessage();
  if (enableChanges) {
    disableButton('delete', true);
    disableButton('insert', true);
    disableButton('cancel', false);
    disableButton('filterCondominiumId', true);
  }
}