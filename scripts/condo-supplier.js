// Maintenance of suppliers

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objAccounts = new Accounts('accounts');
const objSuppliers = new Suppliers('suppliers');

const enableChanges = (objSuppliers.securityLevel > 5);
const applicationName = "condo-supplier";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Validate LogIn
if ((objSuppliers.condominiumId === 0) || (objSuppliers.user === null)) {

  // LogIn is not valid
  const URL = (objUsers.serverStatus === 1)
    ? 'http://ingegilje.no/condo-login.html'
    : 'http://localhost/condo-login.html';
  window.location.href = URL;
} else {

  // Call main when script loads
  main();
  async function main() {

    // Check if server is running
    if (await objUsers.checkServer()) {

      // Show menu
      let html = objSuppliers.showMenu(objSuppliers.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'Y';
      await objUsers.loadUsersTable(objSuppliers.condominiumId, resident, objSuppliers.nineNine);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objSuppliers.condominiumId, fixedCost);
      await objSuppliers.loadSuppliersTable(objSuppliers.condominiumId);

      // Find selected supplier id
      const supplierId = objSuppliers.getSelectedSupplierId('select-supplierId');

      // Show filter
      showFilter(supplierId);

      // Show supplier
      showSupplier(supplierId);

      // Events
      events();
    } else {

      showMessageNew('Server er ikke startet.');
    }
  }
}

// Events for suppliers
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterSupplierId')) {

      await objSuppliers.loadSuppliersTable(objSuppliers.condominiumId);

      const supplierId = Number(document.querySelector('.filterSupplierId').value);

      showSupplier(supplierId);
    };
  });

  // update/insert a suppliers row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const supplierId = document.querySelector('.filterSupplierId').value;
      updateSuppliersRow(supplierId);
    };
  });

  // Delete suppliers row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      const supplierId = Number(document.querySelector('.filterSupplierId').value);
      await deleteSuppliersRow(supplierId);
    };
  });

  // Insert a supplier row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  /*
  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload suppliers table
      await objSuppliers.loadSuppliersTable(objSuppliers.condominiumId);

      let supplierId = Number(document.querySelector('.filterSupplierId').value);
      if (supplierId === 0) supplierId = objSuppliers.arraySuppliers.at(-1)?.supplierId ?? 0;

      // Show filter

      showFilter(supplierId);
      showSupplier(supplierId);
    };
  });
  */

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objSuppliers.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

function resetValues() {

  // supplier Id
  document.querySelector('.filterSupplierId').value = 0;

  // reset name
  document.querySelector('.name').value = '';

  // street
  document.querySelector('.street').value = '';

  // address 2
  document.querySelector('.address2').value = '';

  // reset postal code
  document.querySelector('.postalCode').value = '';

  // reset city
  document.querySelector('.city').value = '';

  // reset e-mail
  document.querySelector('.email').value = '';

  // reset phone number
  document.querySelector('.phone').value = '';

  // reset bank account
  document.querySelector('.bankAccount').value = '';

  // account Id
  document.querySelector('.accountId').value = 0;

  // amount accountId Id
  document.querySelector('.amountAccountId').value = 0;

  // text accountId Id
  document.querySelector('.textAccountId').value = 0;

  // amount
  document.querySelector('.amount').value = '';

  // textAccountId
  document.querySelector('.textAccountId').value = 0;

  // ccount text
  document.querySelector('.accountText').value = '';

  // Buttons
  if (enableChanges) {
    disableButton('delete', true);
  }
}

// Show filter
function showFilter(supplierId) {

  // Start frame
  //let html = startTableFilter('filter-frame');

  // Start filter
  let html = startGridFilter("Leverandør");

  // Show suppliers
  html += objSuppliers.showSelectedSuppliersNew('filterSupplierId', 'Leverandør', supplierId, '', '', true);

  // End filter
  html += endGridFilter();

  document.querySelector(".showFilter").innerHTML = html;
}

// Show supplier
function showSupplier(supplierId) {

  // row Number Supplier
  const rowNumberSupplier = objSuppliers.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);

  let html = startGrid('Leverandør');

  // name
  /*
  const name = (rowNumberSupplier === -1)
    ? ''
    : objSuppliers.arraySuppliers[rowNumberSupplier].name.trim();
  */
  const name = objSuppliers.arraySuppliers[rowNumberSupplier]?.name.trim() ?? '';
  html += inputText('name', 'Navn', name, 45, enableChanges);
  html += "<div></div>";
  //html += "<div></div>";

  // street
  const street = (rowNumberSupplier === -1)
    ? ''
    : objSuppliers.arraySuppliers[rowNumberSupplier].street;
  html += inputText('street', 'Gatenavn', street, 45, enableChanges);

  // address2
  /*
  const address2 = (rowNumberSupplier === -1)
    ? ''
    : objSuppliers.arraySuppliers[rowNumberSupplier].address2;
  */
  const address2 = objSuppliers.arraySuppliers[rowNumberSupplier]?.address2 ?? '';
  html += inputText('address2', 'Adresse2', address2, 45, enableChanges);
  //html += "<div></div>";

  // postalCode
  /*
  let postalCode = (rowNumberSupplier === -1)
    ? ''
    : objSuppliers.arraySuppliers[rowNumberSupplier].postalCode;
  */
  const postalCode = objSuppliers.arraySuppliers[rowNumberSupplier]?.postalCode ?? '';
  //if (postalCode === '0') postalCode = "";
  html += inputText('postalCode', 'Postnummer', postalCode, 4, enableChanges);

  // city
  /*
  const city = (rowNumberSupplier === -1)
    ? ''
    : objSuppliers.arraySuppliers[rowNumberSupplier].city;
  */
  const city = objSuppliers.arraySuppliers[rowNumberSupplier]?.city ?? '';
  html += inputText('city', 'Poststed', city, 45, enableChanges);
  //html += "<div></div>";

  // email
  /*
  let email = (rowNumberSupplier === -1)
    ? ''
    : objSuppliers.arraySuppliers[rowNumberSupplier].email;
  */
  const email = objSuppliers.arraySuppliers[rowNumberSupplier]?.email ?? '';
  html += inputText('email', 'E-mail', email, 45, enableChanges);

  // phone
  /*
  const phone = (rowNumberSupplier === -1)
    ? ''
    : objSuppliers.arraySuppliers[rowNumberSupplier].phone;
  */
  const phone = objSuppliers.arraySuppliers[rowNumberSupplier]?.phone ?? '';
  html += inputText('phone', 'Telefonnummer', phone, 20, enableChanges);
  //html += "<div></div>";

  // accountId
  /*
  const accountId = (rowNumberSupplier === -1)
    ? 0
    : objSuppliers.arraySuppliers[rowNumberSupplier].accountId;
  */
  const accountId = objSuppliers.arraySuppliers[rowNumberSupplier]?.accountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('accountId', 'Konto', accountId, 'Velg konto', '', enableChanges);

  // bank Account number
  /*
  const bankAccount = (rowNumberSupplier === -1)
    ? ''
    : objSuppliers.arraySuppliers[rowNumberSupplier].bankAccount;
  */
  const bankAccount = objSuppliers.arraySuppliers[rowNumberSupplier]?.bankAccount ?? '';
  html += inputText('bankAccount', 'Bankkonto', bankAccount, 11, enableChanges);
  //html += "<div></div>";

  // amountAccountId
  /*
  const amountAccountId = (rowNumberSupplier === -1)
    ? 0
    : objSuppliers.arraySuppliers[rowNumberSupplier].amountAccountId;
  */
  const amountAccountId = objSuppliers.arraySuppliers[rowNumberSupplier]?.amountAccountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('amountAccountId', 'Konto for beløp', amountAccountId, 'Velg konto', '', enableChanges);

  // amount
  /*
  let amount = (rowNumberSupplier === -1)
    ? ''
    : objSuppliers.arraySuppliers[rowNumberSupplier].amount;
  */
  const amount = objSuppliers.arraySuppliers[rowNumberSupplier]?.amount ?? '';
  //if (amount === '0') amount = "";
  html += inputText('amount', 'Beløp', amount, 11, enableChanges);
  //html += "<div></div>";

  // AccountId for text
  /*
  const textAccountId = (rowNumberSupplier === -1)
    ? 0
    : objSuppliers.arraySuppliers[rowNumberSupplier].textAccountId;
  */
  const textAccountId = objSuppliers.arraySuppliers[rowNumberSupplier]?.textAccountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('textAccountId', 'Konto for tekst', textAccountId, 'Velg konto', '', enableChanges);

  // text for account id
  /*
  const text = (rowNumberSupplier === -1)
    ? ''
    : objSuppliers.arraySuppliers[rowNumberSupplier].text;
  */
  const text = objSuppliers.arraySuppliers[rowNumberSupplier]?.text ?? '';
  html += inputText('accountText', 'Tekst', text, 45, enableChanges);

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
  document.querySelector('.showSupplier').innerHTML = html;
}

// Update a supplier row
async function updateSuppliersRow(supplierId) {

  if (supplierId === '') supplierId = -1;
  supplierId = Number(supplierId);
  const validSupplierId = validateIntervalNew('supplierId', 'Ugyldig Leverandør', supplierId, -1, objSuppliers.nineNine);

  const name = document.querySelector('.name').value;
  const validName = validateTextNew('name', 'Ugyldig navn', name, 3, 45);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = validateTextNew('street', 'Ugyldig adresse', street, 0, 45);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = validateTextNew('address2', 'Ugyldig adresse', address2, 0, 45);

  // validate postalCode
  const postalCode = Number(document.querySelector('.postalCode').value);
  const validPostalCode = validateIntervalNew('postalCode', 'Ugyldig poststed', Number(postalCode), 0, objSuppliers.nineNine);

  // validate city
  const city = document.querySelector('.city').value.trim();
  const validCity = validateTextNew('city', 'Ugyldig poststed', city, 0, 45, '',);

  // validate email
  const email = document.querySelector('.email').value.trim();
  const validEmail = (email === '')
    ? true
    : validateEmail('email', email, objSupplier, 'Ugyldig mail');

  // validate phone
  const phone = document.querySelector('.phone').value.trim();
  if (phone === '') validPhone = true;

  // validate accountId
  const accountId = Number(document.querySelector('.accountId').value);
  const validAccountId = validateIntervalNew('accountId', 'Ugyldig konto', accountId, 1, objSuppliers.nineNine);

  // validate bankAccount
  const bankAccount = document.querySelector('.bankAccount').value.trim();
  let validBankAccount = validateBankAccountNew('bankAccount', bankAccount, 'Ugyldig bankkontonummer');

  if (bankAccount === '') validBankAccount = true;

  // validate amountAccountId
  const amountAccountId = Number(document.querySelector('.amountAccountId').value);
  const validAmountAccountId = validateIntervalNew('amountAccountId', 'Ugyldig konto for beløp', amountAccountId, 0, objSuppliers.nineNine);

  // validate amount
  let amount = document.querySelector('.amount').value;
  amount = Number(formatNorAmountToNumber(amount));
  const validAmount = validateIntervalNew('amount', 'Ugyldig beløp', amount, objSuppliers.minusNineNine, objSuppliers.nineNine);

  // validate textAccountId
  const textAccountId = Number(document.querySelector('.textAccountId').value);
  const validTextAccountId = validateIntervalNew('textAccountId', 'Ugyldig konto for tekst', textAccountId, 0, objSuppliers.nineNine);

  // validate text
  const text = document.querySelector('.accountText').value;
  const validText = validateTextNew('accountText', 'Ugyldig tekst', text, 0, 45);

  if (validSupplierId && validName && validStreet && validAddress2
    && validPostalCode && validCity && validBankAccount && validAccountId
    && validAmountAccountId && validAmount && validTextAccountId
    && validEmail && validText) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the supplierId exist
    const rowNumberSupplier = objSuppliers.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);
    if (rowNumberSupplier !== -1) {

      // update the suppliers row
      await objSuppliers.updateSuppliersTable(supplierId, objSuppliers.user, name, street, address2, postalCode, city, email, phone, bankAccount, accountId, amount, amountAccountId, text, textAccountId);
    } else {

      // Insert the supplier row in supplier table
      await objSuppliers.insertSuppliersTable(objSuppliers.condominiumId, objSuppliers.user, name, street, address2, postalCode, city, email, phone, bankAccount, accountId, amount, amountAccountId, text, textAccountId);
      await objSuppliers.getHighestSupplierId(objSuppliers.condominiumId);
      supplierId = objSuppliers.arraySuppliers[0].supplierId;
    }

    await objSuppliers.loadSuppliersTable(objSuppliers.condominiumId);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
    }

    // Show filter
    showFilter(supplierId);

    // Show supplier
    showSupplier(supplierId);
  }
}

// Delete suppliers row
async function deleteSuppliersRow(supplierId) {

  // Check if suppliers row exist
  const rowNumberSuppliers = objSuppliers.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);
  if (rowNumberSuppliers !== -1) {

    // delete suppliers row
    await objSuppliers.deleteSuppliersTable(supplierId, objSuppliers.user);
    await objSuppliers.getHighestSupplierId(objSuppliers.condominiumId);

    // Check for empty array
    supplierId = 0;
    if (objSuppliers.arraySuppliers.length > 0) supplierId = objSuppliers.arraySuppliers[0].supplierId;
  }

  await objSuppliers.loadSuppliersTable(objSuppliers.condominiumId);

  // Show filter
  showFilter(supplierId);

  // Show supplier
  showSupplier(supplierId);
}

