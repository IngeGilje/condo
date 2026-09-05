// Maintenance of suppliers

// Activate objects
const today = new Date();
const objUser = new User('user');
const objAccounts = new Accounts('accounts');
const objSupplier = new Supplier('supplier');

const enableChanges = (objSupplier.securityLevel > 5);
const applicationName = "condo-supplier";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Validate LogIn
if ((objSupplier.condominiumId === 0) || (objSupplier.user === null)) {

  // LogIn is not valid
  const URL = (objUser.serverStatus === 1)
    ? 'http://ingegilje.no/condo-login.html'
    : 'http://localhost/condo-login.html';
  window.location.href = URL;
} else {

  // Call main when script loads
  main();
  async function main() {

    // Check if server is running
    if (await objUser.checkServer()) {

      /*
            // Show vertical menu
      let html = objSupplier.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      // Change frame title
      setFrameTitle("menu-frame", "Meny");


      // Show main menu
      let html = objSupplier.showHorizontalMenu("filter-frame", objSupplier.arrayMainMenu);
      document.querySelector('.showMainMenu').innerHTML = html;

      // Show due menu
      html = objSupplier.showHorizontalMenu("filter-frame", objSupplier.arrayMenuCondominium);
      document.querySelector('.showDueMenu').innerHTML = html;
      objSupplier.markActivatedApplication(objSupplier.arrayMenuCondominium, applicationName);
      */
      // Show menu
      let html = objSupplier.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objSupplier.condominiumId, resident, objSupplier.nineNine);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objSupplier.condominiumId, fixedCost);
      await objSupplier.loadSuppliersTable(objSupplier.condominiumId);

      // Find selected supplier id
      const supplierId = objSupplier.getSelectedSupplierId('select-supplierId');

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

      await objSupplier.loadSuppliersTable(objSupplier.condominiumId);

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

      await deleteSupplierRow();

      //const condominiumId = Number(condominiumId);
      await objSupplier.loadSuppliersTable(objSupplier.condominiumId);

      // Show filter
      const supplierId = (objSupplier.arraySuppliers.length > 0)
        ? objSupplier.arraySuppliers.at(-1)?.supplierId ?? 0
        : 0;
      // Show filter

      showFilter(supplierId);
      showSupplier(supplierId);
    };
  });

  // Insert a supplier row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload suppliers table
      await objSupplier.loadSuppliersTable(objSupplier.condominiumId);

      let supplierId = Number(document.querySelector('.filterSupplierId').value);
      if (supplierId === 0) supplierId = objSupplier.arraySuppliers.at(-1)?.supplierId ?? 0;

      // Show filter

      showFilter(supplierId);
      showSupplier(supplierId);
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objSupplier.serverStatus === 1)
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

  // text
  document.querySelector('.text').value = '';

  document.querySelector('.filterSupplierId').disabled = true;

  // Buttons
  removeMessage();
  if (enableChanges) {
    disableButton('delete', true);
    disableButton('insert', true);
    disableButton('cancel', false);
    disableButton('filterSupplierId', true);
  }
}

// Show filter
function showFilter(supplierId) {

  // Start frame
  //let html = startFrame('filter-frame');

  // Start filter
  let html = startFilter("Leverandør");

  // Show suppliers
  html += objSupplier.showSelectedSuppliersNew('filterSupplierId', 'Leverandør', supplierId, '', '', true);

  // End filter
  html += endFilter();

  document.querySelector('.showFilter').innerHTML = html;
}

// Show supplier
function showSupplier(supplierId) {

  // row Number Supplier
  const rowNumberSupplier = objSupplier.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);

  let html = startContent('Leverandør');

  // name
  const name = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].name.trim();
  html += inputText('name', 'Navn', name, enableChanges);
  html += "<div></div>";
html += "<div></div>";

  // street
  const street = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].street;
  html += inputText('street', 'Gatenavn', street, enableChanges);

  // address2
  const address2 = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].address2;
  html += inputText('address2', 'Adresse2', address2, enableChanges);
  html += "<div></div>";

  // postalCode
  let postalCode = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].postalCode;
  if (postalCode === '0') postalCode = "";
  html += inputText('postalCode', 'Postnummer', postalCode, enableChanges);

  // city
  const city = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].city;
  html += inputText('city', 'Poststed', city, enableChanges);
  html += "<div></div>";

  // email
  let email = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].email;
  html += inputText('email', 'E-mail', email, enableChanges);

  // phone
  const phone = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].phone;
  html += inputText('phone', 'Telefonnummer', phone, enableChanges);
  html += "<div></div>";

  // accountId
  const accountId = (rowNumberSupplier === -1)
    ? 0
    : objSupplier.arraySuppliers[rowNumberSupplier].accountId;
  html += objAccounts.showSelectedAccountsNew('accountId', 'Konto', accountId, 'Velg konto', '', enableChanges);

  // bank Account number
  const bankAccount = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].bankAccount;
  html += inputText('bankAccount', 'Bankkonto', bankAccount, enableChanges);
  html += "<div></div>";

  // amountAccountId
  const amountAccountId = (rowNumberSupplier === -1)
    ? 0
    : objSupplier.arraySuppliers[rowNumberSupplier].amountAccountId;
  html += objAccounts.showSelectedAccountsNew('amountAccountId', 'Konto for beløp', amountAccountId, 'Velg konto', '', enableChanges);

  // amount
  let amount = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].amount;
  if (amount === '0') amount = "";
  html += inputText('amount', 'Beløp', amount, enableChanges);
    html += "<div></div>";

  // AccountId for text
  const textAccountId = (rowNumberSupplier === -1)
    ? 0
    : objSupplier.arraySuppliers[rowNumberSupplier].textAccountId;
  html += objAccounts.showSelectedAccountsNew('textAccountId', 'Konto for tekst', textAccountId, 'Velg konto', '', enableChanges);

  // text for account id
  const text = (rowNumberSupplier === -1)
    ? ''
    : objSupplier.arraySuppliers[rowNumberSupplier].text;
  html += inputText('accountText', 'Tekst', text, enableChanges);

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

  document.querySelector('.showSupplier').innerHTML = html;

  //if (enableChanges) document.querySelector('.cancel').disabled = true;
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('cancel', true);
    disableButton('filterSupplierId', false, 'white');
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
  document.querySelector('.showSupplier').innerHTML = html;
}

// Update a supplier row
async function updateSuppliersRow(supplierId) {

  if (supplierId === '') supplierId = -1;
  supplierId = Number(supplierId);
  const validSupplierId = validateIntervalNew('supplierId', '', 'Ugyldig Leverandør', true, supplierId, -1, objSupplier.nineNine);

  const name = document.querySelector('.name').value;
  const validName = validateTextNew('name', '', 'Ugyldig navn', true, name, 3, 45);

  // validate street
  const street = document.querySelector('.street').value;
  const validStreet = validateTextNew('street', '', 'Ugyldig adresse', true, street, 0, 45);

  // validate address2
  const address2 = document.querySelector('.address2').value;
  const validAddress2 = validateTextNew('address2', '', 'Ugyldig adresse', true, address2, 0, 45);

  // validate postalCode
  const postalCode = Number(document.querySelector('.postalCode').value);
  const validPostalCode = validateIntervalNew('postalCode', '', 'Ugyldig poststed', true, Number(postalCode), 0, objSupplier.nineNine);

  // validate city
  const city = document.querySelector('.city').value.trim();
  const validCity = validateTextNew('city', '', 'Ugyldig poststed', true, city, 0, 45, '',);

  // validate email
  const email = document.querySelector('.email').value.trim();
  const validEmail = (email === '')
    ? true
    : objSupplier.validateEmail('email', email, objSupplier, '', 'Ugyldig mail');

  // validate phone
  const phone = document.querySelector('.phone').value.trim();
  if (phone === '') validPhone = true;

  // validate accountId
  const accountId = Number(document.querySelector('.accountId').value);
  const validAccountId = validateIntervalNew('accountId', '', 'Ugyldig konto', true, accountId, 1, objSupplier.nineNine);

  // validate bankAccount
  const bankAccount = document.querySelector('.bankAccount').value.trim();
  let validBankAccount = validateBankAccountNew('bankAccount', true, bankAccount, '', 'Ugyldig bankkontonummer');

  if (bankAccount === '') validBankAccount = true;

  // validate amountAccountId
  const amountAccountId = Number(document.querySelector('.amountAccountId').value);
  const validAmountAccountId = validateIntervalNew('amountAccountId', '', 'Ugyldig konto for beløp', true, amountAccountId, 0, objSupplier.nineNine);

  // validate amount
  let amount = document.querySelector('.amount').value;
  amount = Number(formatNorAmountToNumber(amount));
  const validAmount = validateIntervalNew('amount', '', 'Ugyldig beløp', true, amount, objSupplier.minusNineNine, objSupplier.nineNine);


  // validate textAccountId
  const textAccountId = Number(document.querySelector('.textAccountId').value);
  const validTextAccountId = validateIntervalNew('textAccountId', '', 'Ugyldig konto for tekst', true, textAccountId, 0, objSupplier.nineNine);

  // validate text
  const text = document.querySelector('.accountText').value;
  const validText = validateTextNew('accountText', '', 'Ugyldig tekst', true, text, 0, 45);

  if (validSupplierId && validName && validStreet && validAddress2
    && validPostalCode && validCity && validBankAccount && validAccountId
    && validAmountAccountId && validAmount && validTextAccountId
    && validEmail && validText) {

    /*
    document.querySelector('.showMessage').style.display = "none";

    // Check if the supplierId exist
    const rowNumberSupplier = objSupplier.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);
    if (rowNumberSupplier !== -1) {

      // update the suppliers row
      await objSupplier.updateSuppliersTable(supplierId, objSupplier.user, name, street, address2, postalCode, city, email, phone, bankAccount, accountId, amount, amountAccountId, text, textAccountId);
      await objSupplier.loadSuppliersTable(objSupplier.condominiumId);
    } else {

      // Insert the supplier row in supplier table
      await objSupplier.insertSuppliersTable(objSupplier.condominiumId, objSupplier.user, name, street, address2, postalCode, city, email, phone, bankAccount, accountId, amount, amountAccountId, text, textAccountId);
      await objSupplier.loadSuppliersTable(objSupplier.condominiumId);
      supplierId = objSupplier.arraySuppliers.at(-1)?.supplierId ?? 0;
    }

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
       disableButton('update', false);
      disableButton('cancel', true);
            disableButton('filterSupplierId', false, 'white');
    }

    // show filter
    showFilter(supplierId);

    // Show supplier
    showSupplier(supplierId);
  }
  */

    document.querySelector('.showMessage').style.display = "none";

    // Check if the supplierId exist
    const rowNumberSupplier = objSupplier.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);
    if (rowNumberSupplier !== -1) {

      // update the suppliers row
      await objSupplier.updateSuppliersTable(supplierId, objSupplier.user, name, street, address2, postalCode, city, email, phone, bankAccount, accountId, amount, amountAccountId, text, textAccountId);
    } else {

      // Insert the supplier row in supplier table
      await objSupplier.insertSuppliersTable(objSupplier.condominiumId, objSupplier.user, name, street, address2, postalCode, city, email, phone, bankAccount, accountId, amount, amountAccountId, text, textAccountId);
      await objSupplier.getHighestSupplierId(objSupplier.condominiumId);
      supplierId = objSupplier.arrSuppliers[0].supplierId;
    }

    await objSupplier.loadSuppliersTable(objSupplier.condominiumId);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterSupplierId', false);
    }

    // Show filter
    showFilter(supplierId);

    // Show supplier
    showSupplier(supplierId);
  }
}

// Delete a suppliers row
async function deleteSupplierRow() {

  // Check for supplier Id
  const supplierId = Number(document.querySelector('.filterSupplierId').value);

  // Check if supplier id exist
  const rowNumberSupplier = objSupplier.arraySuppliers.findIndex(supplier => supplier.supplierId === supplierId);
  if (rowNumberSupplier !== -1) {

    // delete supplier row
    await objSupplier.deleteSuppliersTable(supplierId, objSupplier.user);
  }
}
