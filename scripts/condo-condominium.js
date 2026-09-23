// Condominium maintenance

// Activate classes
const today = new Date();
const objUsers = new Users('users');
const objAccounts = new Accounts('accounts');
const objBankAccounts = new BankAccounts('bankaccounts');
const objCondominiums = new Condominiums('condominiums');

const enableChanges = (objCondominiums.securityLevel > 5);
const applicationName = "condo-condominium";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    if ((objCondominiums.condominiumId === 0) || (objCondominiums.user === null)) {

      // LogIn is not valid
      const URL = (objUsers.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show menu
      let html = objCondominiums.showMenu(objCondominiums.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      await objCondominiums.loadCondominiumsTable();
      const resident = 'Y';
      await objUsers.loadUsersTable(objCondominiums.condominiumId, resident, objCondominiums.nineNine);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objCondominiums.condominiumId, fixedCost);
      await objBankAccounts.loadBankAccountsTable(objCondominiums.condominiumId);

      // Show filter
      showFilter(objCondominiums.condominiumId);

      // Show condominium
      showCondominium(objCondominiums.condominiumId);

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

      const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      await deleteCondominiumsRow(condominiumId);
    };
  });

  // Insert a condominiums row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  /*
  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload condominiums table
      await objCondominiums.loadCondominiumsTable();

      let condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      if (condominiumId === 0) condominiumId = objCondominiums.arrayCondominiums.at(-1)?.condominiumId ?? 0;

      await objCondominiums.loadCondominiumsTable();

      // Show filter
      showFilter(condominiumId);

      // Show condominium
      showCondominium(objCondominiums.condominiumId);
    };
  });
  */

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objCondominiums.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

// Show filter
function showFilter(condominiumId) {

  // Start filter
  let html = startGridFilter("Sameie");

  // Show condominiums
  html += objCondominiums.showSelectedCondominiumsNew('filterCondominiumId', 'Sameie', condominiumId, '', '', true);

  // End filter
  html += endGridFilter();
  document.querySelector(".showFilter").innerHTML = html;
}

// Show condominium
function showCondominium(condominiumId) {

  // row number condominium
  const rowNumberCondominium = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);

  let html = startGrid('Sameie');

  let name = objCondominiums.arrayCondominiums[rowNumberCondominium]?.name.trim() ?? '';
  html += inputText("name", "Navn", name, 45, enableChanges);
  html += "<div></div>";
  //html += "<div></div>";

  // street
  /*
  const street = (rowNumberCondominium === -1)
    ? ''
    : objCondominiums.arrayCondominiums[rowNumberCondominium].street;
  */
  const street = objCondominiums.arrayCondominiums[rowNumberCondominium]?.street ?? 0;
  html += inputText("street", "Gatenavn", street, 45, enableChanges);

  // address2
  const address2 = objCondominiums.arrayCondominiums[rowNumberCondominium]?.address2.trim() ?? '';
  html += inputText("address2", "Adresse2", address2, 45, enableChanges);
  //html += "<div></div>";

  // postalCode
  /*
  let postalCode = (rowNumberCondominium === -1)
    ? ''
    : objCondominiums.arrayCondominiums[rowNumberCondominium].postalCode;
  */
  const postalCode = objCondominiums.arrayCondominiums[rowNumberCondominium]?.postalCode ?? "";
  //if (postalCode === '0') postalCode = "";
  html += inputText("postalCode", "Postnummer", postalCode, 4, enableChanges);

  // city
  const city = objCondominiums.arrayCondominiums[rowNumberCondominium]?.city.trim() ?? '';
  html += inputText("city", "Poststed", city, 45, enableChanges);
  //html += "<div></div>";

  // phone
  const phone = objCondominiums.arrayCondominiums[rowNumberCondominium]?.phone.trim() ?? '';
  html += inputText("phone", "Telefonnummer", phone, 20, enableChanges);

  // email
  const email = objCondominiums.arrayCondominiums[rowNumberCondominium]?.email.trim() ?? '';
  html += inputText("email", "E-mail", email, 45, enableChanges);
  //html += "<div></div>";

  // income Remote Heating AccountId
  const incomeRemoteHeatingAccountId = objCondominiums.arrayCondominiums[rowNumberCondominium]?.incomeRemoteHeatingAccountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('incomeRemoteHeatingAccountId', 'Inntekstkonto fjernvarme', incomeRemoteHeatingAccountId, 'Velg konto', '', enableChanges);

  // payment Remote Heating AccountId
  const paymentRemoteHeatingAccountId = objCondominiums.arrayCondominiums[rowNumberCondominium]?.paymentRemoteHeatingAccountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('paymentRemoteHeatingAccountId', 'Ugiftskonto fjernvarme', paymentRemoteHeatingAccountId, 'Velg konto', '', enableChanges);
  //html += "<div></div>";

  // common Cost AccountId
  /*
  const commonCostAccountId = (rowNumberCondominium === -1)
    ? ''
    : objCondominiums.arrayCondominiums[rowNumberCondominium].commonCostAccountId;
  */
  const commonCostAccountId = objCondominiums.arrayCondominiums[rowNumberCondominium]?.commonCostAccountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('commonCostAccountId', 'Inntektskonto husleie', commonCostAccountId, 'Velg konto', '', enableChanges);

  // organizationNumber
  const organizationNumber = objCondominiums.arrayCondominiums[rowNumberCondominium]?.organizationNumber ?? '';
  html += inputText("organizationNumber", "Organisasjonsnummer", organizationNumber, 9, enableChanges);
  //html += "<div></div>";

  // from month
  const fromMonth = objCondominiums.arrayCondominiums[rowNumberCondominium]?.fromMonth ?? 0;
  html += showSelectedMonthsNew("fromMonth", "Fra måned regnskapsår", fromMonth, enableChanges);

  // to month
  const toMonth = objCondominiums.arrayCondominiums[rowNumberCondominium]?.toMonth ?? 0;
  html += showSelectedMonthsNew("toMonth", "Til måned regnskapsår", toMonth, enableChanges);
  //html += "<div></div>";

  // import Path
  const importPath = objCondominiums.arrayCondominiums[rowNumberCondominium]?.importPath.trim() ?? '';
  //html += inputWideText("importPath", "Plassering av data", importPath, 2, enableChanges);
  html += inputGridWideText("importPath", "Plassering av data", importPath, 100, 2)

  html += endGrid();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update secondary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");
    //html += inputButton("cancel secondary", "Angre", "reset");
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
  const validName = validateTextNew('name', 'Ugyldig Navn', name, 3, 45);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = validateTextNew('street', 'Ugyldig Addresse', street, 3, 45);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = validateTextNew('address2', 'Ugyldig addresse', address2, 0, 45);

  // validate postalCode
  const postalCode = document.querySelector('.postalCode').value;
  const validPostalCode = validateIntervalNew('postalCode', 'Ugyldig postnummer', Number(postalCode), 1, objCondominiums.nineNine);

  // validate city
  const city = document.querySelector('.city').value;
  const validCity = validateTextNew('city', 'Ugyldig Poststed', city, 0, 45);

  // validate phone
  const phone = document.querySelector('.phone').value;
  const validPhone = validatePhoneNew('phone', phone, "Ugyldig Telefonnummer");

  // validate email
  const email = document.querySelector('.email').value;
  //const validEmail = objCondominiums.validateEmail('email', email, objCondominium, '', 'Ugyldig mail');
  const validEmail = validateEmail('email', email, 'Ugyldig mail')

  // validate incomeRemoteHeatingAccountId
  const incomeRemoteHeatingAccountId = Number(document.querySelector('.incomeRemoteHeatingAccountId').value);
  const validIncomeRemoteHeatingAccountId = validateIntervalNew('incomeRemoteHeatingAccountId', 'Ugyldig inntektskonto for husleie', incomeRemoteHeatingAccountId, 0, objCondominiums.nineNine);

  // validate paymentRemoteHeatingAccountId
  const paymentRemoteHeatingAccountId = Number(document.querySelector('.paymentRemoteHeatingAccountId').value);
  const validPaymentRemoteHeatingAccountId = validateIntervalNew('paymentRemoteHeatingAccountId', 'Ugyldig Inntektskonto for Fjernvarme', paymentRemoteHeatingAccountId, 0, objCondominiums.nineNine);

  // validate commonCostAccountId
  const commonCostAccountId = Number(document.querySelector('.commonCostAccountId').value);
  const validCommonCostAccountId = validateIntervalNew('commonCostAccountId', 'Ugyldig Konto', commonCostAccountId, 0, objCondominiums.nineNine);

  // validate organizationNumber
  const organizationNumber = Number(document.querySelector('.organizationNumber').value);
  const validOrganizationNumber = validateOrganizationNumberNew('organizationNumber', organizationNumber, "Ugyldig organisasjonsnummer");

  // Validate importPath
  const importPath = document.querySelector('.importPath').value;
  const validimportPath = true;

  // Valid from month
  const fromMonth = document.querySelector('.fromMonth').value;
  const validFromMonth = validateIntervalNew('fromMonth', 'Ugyldig måned', fromMonth, 1, 12);

  // Valid to month
  const toMonth = document.querySelector('.toMonth').value;
  const validToMonth = validateIntervalNew('toMonth', 'Ugyldig måned', toMonth, 1, 12);

  if (validName && validStreet && validAddress2 && validPostalCode && validCity && validPhone && validEmail
    && validIncomeRemoteHeatingAccountId && validPaymentRemoteHeatingAccountId
    && validCommonCostAccountId && validOrganizationNumber && validimportPath
    && validFromMonth && validToMonth) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the condominium row exist
    const rowNumberCondominium = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
    if (rowNumberCondominium !== -1) {

      // update a condominiums row
      await objCondominiums.updateCondominiumsTable(objCondominiums.user, condominiumId, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importPath, fromMonth, toMonth);
    } else {

      // Insert a condominiums row
      await objCondominiums.insertCondominiumsTable(objCondominiums.user, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importPath, fromMonth, toMonth);
      await objCondominiums.getHighestCondominiumId(objCondominiums.condominiumId);
      condominiumId = objCondominiums.arrayCondominiums[0].condominiumId;
    }

    await objCondominiums.loadCondominiumsTable();

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
    }

    // Show filter
    showFilter(condominiumId);

    // Show condominium
    showCondominium(condominiumId);
  }
}

/*
// Delete condominium row
async function deleteCondominiumRow() {

  // condominiumId
  const condominiumId = Number(document.querySelector('.filterCondominiumId').value);

  // Check if condominiumId exist
  const rowNumberCondominium = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (rowNumberCondominium !== -1) {

    // delete condominium row
    await objCondominiums.deleteCondominiumsTable(condominiumId, objCondominiums.user);
  }
}
*/

// Delete condominiums row
async function deleteCondominiumsRow(condominiumId) {

  // Check if condominiums row exist
  const rowNumberCondominiums = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (rowNumberCondominiums !== -1) {

    // delete condominiums row
    await objCondominiums.deleteCondominiumsTable(condominiumId, objCondominiums.user);
    await objCondominiums.getHighestCondominiumId(objCondominiums.condominiumId);

    //condominiumId = objCondominiums.arrayCondominiums[0].condominiumId;
    // Check for empty array
    condominiumId = 0;
    if (objCondominiums.arrayCondominiums.length > 0) condominiumId = objCondominiums.arrayCondominiums[0].condominiumId;
  }

  await objCondominiums.loadCondominiumsTable(objCondominiums.condominiumId);

  // Show filter
  showFilter(condominiumId);

  // Show condominium
  showCondominium(condominiumId);
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

  // Filter
  //document.querySelector('.filterCondominiumId').disabled = true;

  // Buttons
  if (enableChanges) {

    disableButton('delete', true);
  }
}