// Condo maintenance

// Activate classes
const today = new Date();
const objCondo = new Condo('condo');
const objUsers = new Users('users');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

objCondo.menu();
objCondo.markSelectedMenu('Leilighet');

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    await objUsers.loadUsersTable(objUserPassword.condominiumId);

    await objCondo.loadCondoTable(objUserPassword.condominiumId);

    // Find selected condo id
    const condoId = objCondo.getSelectedCondoId('select-condo-condoId');

    // Show leading text
    showLeadingText(condoId);

    // Show all values for condo
    showValues(condoId);

    // Make events
    createEvents();
  }
}

// Make events for condo
function createEvents() {

  // Select condo
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-condo-condoId')) {

      let CondoId = Number(document.querySelector('.select-condo-condoId').value);
      CondoId = (CondoId !== 0) ? CondoId : objCondo.arrayCondo.at(-1).CondoId;
      if (CondoId) {
        showValues(CondoId);
      }
    }
  });

  // Update condo
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condo-update')) {

      // Update condo and reload condo
      updateCondoSync();

      // Update condo and reload condo
      async function updateCondoSync() {

        // Load condo
        let condoId;
        if (document.querySelector('.select-condo-condoId').value === '') {

          // Insert new row into condo table
          condoId = 0;
        } else {

          // Update existing row in condos table
          condoId = Number(document.querySelector('.select-condo-condoId').value);
        }

        if (validateValues()) {

          await updateCondo(condoId);
          await objCondo.loadCondoTable(objUserPassword.condominiumId);

          // Select last condos if condoId is 0
          if (condoId === 0) condoId = objCondo.arrayCondo.at(-1).condoId;

          // Show leading text
          showLeadingText(condoId);

          // Show all values for condo
          showValues(condoId);
        }
        /*
        // Load condos
        let condoId;
        if (document.querySelector('.select-condo-condoId').value === '') {

          // Insert new row into condos table
          condoId = 0;
        } else {

          // Update existing row in condos table
          condoId = Number(document.querySelector('.select-condo-condoId').value);
        }

        await updateCondo(condoId);

        await objCondo.loadCondoTable(objUserPassword.condominiumId);

        // Select last condo if condoId is 0
        if (condoId === 0) condoId = objCondo.arrayCondo.at(-1).condoId;

        // Show leading text
        showLeadingText(condoId);

        // Show all values for condo
        showValues(condoId);
        */
      }
    }
  });

  // New condo
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condo-insert')) {

      resetValues();
    }
  });

  // Delete condo
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condo-delete')) {

      // Delete sondo and reload condos
      deleteCondoSync();

      // Delete condo and reload condos
      async function deleteCondoSync() {

        await deleteCondo();

        // Load condo
        await objCondo.loadCondoTable(objUserPassword.condominiumId);

        // Show leading text
        const condoId = objCondo.arrayCondo.at(-1).condoId;
        showLeadingText(condoId);

        // Show all values for condo
        showValues(condoId);
      };
    };
  });
  /*
  await deleteCondo();

  // Load condos
  await objCondo.loadCondoTable(objUserPassword.condominiumId);

  // Show leading text
  const condoId = objCondo.arrayCondo.at(-1).condoId;
  showLeadingText(condoId);

  // Show all values for condo
  showValues(condoId);
  */


  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condo-cancel')) {

      // Reload condo
      reloadCondoSync();
      async function reloadCondoSync() {

        let condominiumId = Number(objUserPassword.condominiumId);
        await objCondo.loadCondoTable(condominiumId);

        // Show leading text for maintenance
        // Select first condo Id
        if (objCondo.arrayCondo.length > 0) {
          condoId = objCondo.arrayCondo[0].condoId;
          showLeadingText(condoId);
        }

        // Show all selected condo
        objCondo.showSelectedCondos('condo-condoId', condoId);

        // Show condo Id
        showValues(condoId);
      }
    }
  });
}

/*
// Sends a request to the server to get all condos
const SQLquery = `
  SELECT * FROM condo
  WHERE condominiumId = ${objUserPassword.condominiumId}
    AND deleted <> 'Y'
  ORDER BY condoId;
`;
updateMySql(SQLquery, 'condo', 'SELECT');
condoArrayCreated =
  false;
*/


// Show leading text for condo
function showLeadingText(condoId) {

  // Show all condos
  objCondo.showSelectedCondos('condo-condoId', condoId);

  // Show condo name
  objCondo.showInput('condo-name', '* Navn', 50, '');

  // Show street name
  objCondo.showInput('condo-street', '* Gateadresse', 50, '');

  // Show address 2
  objCondo.showInput('condo-address2', 'Adresse 2', 50, '');

  // Postal code
  objCondo.showInput('condo-postalCode', '* Postnummer', 4, '');

  // City
  objCondo.showInput('condo-city', '* Poststed', 50, '');

  // square meters
  objCondo.showInput('condo-squareMeters', '* Kvadratmeter', 5, '');

  // show update button
  if (Number(objUserPassword.securityLevel) >= 9) {

    objCondo.showButton('condo-update', 'Oppdater');

    // show new button
    objCondo.showButton('condo-insert', 'Ny');

    // show delete button
    objCondo.showButton('condo-delete', 'Slett');

    // cancel button
    objCondo.showButton('condo-cancel', 'Avbryt');
  }
}

// Show all values for condo
function showValues(condoId) {

  // Check for valid condo Id
  if (condoId >= 0) {

    // find object number for selected condo id
    const condoRowNumberObj = objCondo.arrayCondo.findIndex(condo => condo.condoId === condoId);
    if (condoRowNumberObj !== -1) {

      // Condo id
      const condoId = objCondo.arrayCondo[condoRowNumberObj].condoId;
      objCondo.selectCondoId(condoId, 'condo-condoId')

      // Condo name
      document.querySelector('.input-condo-name').value = objCondo.arrayCondo[condoRowNumberObj].name;

      // Show street
      document.querySelector('.input-condo-street').value = objCondo.arrayCondo[condoRowNumberObj].street;

      // Show address 2
      document.querySelector('.input-condo-address2').value = objCondo.arrayCondo[condoRowNumberObj].address2;

      // Show postal code
      document.querySelector('.input-condo-postalCode').value = objCondo.arrayCondo[condoRowNumberObj].postalCode;

      // Show city
      document.querySelector('.input-condo-city').value = objCondo.arrayCondo[condoRowNumberObj].city;

      // Show square meters
      document.querySelector('.input-condo-squareMeters').value = formatOreToKroner(objCondo.arrayCondo[condoRowNumberObj].squareMeters);
    }
  }
}

// Reset all values for condo
function resetValues() {

  document.querySelector('.select-condo-condoId').value = '';

  document.querySelector('.input-condo-name').value = '';

  // Show street
  document.querySelector('.input-condo-street').value = '';

  // Show address 2
  document.querySelector('.input-condo-address2').value = '';

  // Show postal code
  document.querySelector('.input-condo-postalCode').value = '';

  // Show city
  document.querySelector('.input-condo-city').value = '';

  // Show square meters
  document.querySelector('.input-condo-squareMeters').value = '';

  document.querySelector('.select-condo-condoId').disabled = true;
  document.querySelector('.button-condo-delete').disabled = true;
  document.querySelector('.button-condo-insert').disabled = true;
}

// check for valid condo number
function validateValues() {

  // Check condo name
  const condoName = document.querySelector('.input-condo-name').value;
  const validCondoName = objCondo.validateText(condoName, "label-condo-name", "Navn");

  // Check street name
  const street = document.querySelector('.input-condo-street').value;
  const validStreet = objCondo.validateText(street, "label-condo-street", "Gateadresse");

  // Check postal code
  const postalCode = document.querySelector('.input-condo-postalCode').value;
  const validPostalCode = objCondo.validatePostalCode(postalCode, "label-condo-postalCode", "Postnummer");

  // Validate city
  const city = document.querySelector('.input-condo-city').value;
  const validCity = objCondo.validateText(city, "label-condo-city", "Poststed");

  // Check square meters
  const squareMeters = formatToNorAmount(document.querySelector('.input-condo-squareMeters').value);
  const validSquareMeters = objCondo.validateAmount(squareMeters, 'label-condo-squareMeters', "Kvadratmeter");

  return (validCondoName && validStreet && validPostalCode && validCity && validSquareMeters);
}

// Update condo
async function updateCondo(condoId) {

  // Check values
  if (validateValues()) {

    // user
    const user = objUserPassword.email;

    // Condominium
    const condominiumId = Number(objUserPassword.condominiumId);

    // current date
    const lastUpdate = today.toISOString();

    // Condo id
    const condoId = Number(document.querySelector('.select-condo-condoId').value);

    // Condo name
    const name = document.querySelector('.input-condo-name').value;

    // Street
    const street = document.querySelector('.input-condo-street').value;

    // Address 2
    const address2 = document.querySelector('.input-condo-address2').value

    // Postal code
    const postalCode = document.querySelector('.input-condo-postalCode').value;

    // City
    const city = document.querySelector('.input-condo-city').value;

    // Square meters
    //const squareMeters = formatToNorAmount(document.querySelector('.input-condo-squareMeters').value);
    const squareMeters = formatKronerToOre(document.querySelector('.input-condo-squareMeters').value);

    // Check if condo id exist
    const condoRowNumberObj = objCondo.arrayCondo.findIndex(condo => condo.condoId === condoId);
    if (condoRowNumberObj !== -1) {

      // update condo
      await objCondo.updateCondoTable(condoId, user, lastUpdate, name, street, address2, postalCode, city, squareMeters);

    } else {

      // Insert condo row in condo table
      await objCondo.insertCondoTable(condominiumId, user, lastUpdate, name, street, address2, postalCode, city, squareMeters);

    }
  }
}

// Delete condo
async function deleteCondo() {

  // Check for valid condo Id
  const condoId = Number(document.querySelector('.select-condo-condoId').value);

  // Check if condo id exist
  const condoRowNumberObj = objCondo.arrayCondo.findIndex(condo => condo.condoId === condoId);
  if (condoRowNumberObj !== -1) {

    // delete condo row
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    objCondo.deleteCondoTable(condoId, user, lastUpdate);
  }
}