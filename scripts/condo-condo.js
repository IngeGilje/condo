// Condo maintenance

// Activate classes
const objUser = new User('user');
const objCondo = new Condo('condo');

testMode();

// Exit application if no activity for 10 minutes
resetInactivityTimer();

let isEventsCreated

objCondo.menu();
objCondo.markSelectedMenu('Leilighet');

let socket;
socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo/condo-login.html';
} else {

  // Send a requests to the server
  socket.onopen = () => {

    // Sends a request to the server to get users
    let SQLquery =
      `
        SELECT * FROM user
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY userId;
      `;
    updateMySql(SQLquery, 'user', 'SELECT');

    // Sends a request to the server to get condos
    SQLquery =
      `
        SELECT * FROM condo
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY name;
      `;

    updateMySql(SQLquery, 'condo', 'SELECT');
  };

  // Handle incoming messages from server
  socket.onmessage = (event) => {

    let messageFromServer =
      event.data;

    //Converts a JavaScript Object Notation (JSON) string into an object
    const objInfo =
      JSON.parse(messageFromServer);

    if (objInfo.CRUD === 'SELECT') {
      switch (objInfo.tableName) {
        case 'user':

          // user table
          console.log('userTable');

          userArray =
            objInfo.tableArray;
          break;

        case 'condo':

          // condo table
          console.log('condoTable');

          // array including objects with condo information
          condoArray =
            objInfo.tableArray;

          // Find selected condo id
          const condoId =
            objCondo.getSelectedCondoId('select-condo-condoId');

          // Show leading text
          showLeadingText(condoId);

          // Show all values for condo
          showValues(condoId);

          // Make events
           isEventsCreated = (isEventsCreated) ? true : condominiumEvents();
                     break;
      }
    }

    if (objInfo.CRUD === 'UPDATE' || objInfo.CRUD === 'INSERT' || objInfo.CRUD === 'DELETE') {

      switch (objInfo.tableName) {
        case 'condo':

          // Sends a request to the server to get condos one more time
          SQLquery =
            `
              SELECT * FROM condo
              WHERE condominiumId = ${objUserPassword.condominiumId}
              ORDER BY condoId;
            `;
          updateMySql(SQLquery, 'condo', 'SELECT');
          break;
      };
    }

    // Handle errors
    socket.onerror = (error) => {

      // Close socket on error and let onclose handle reconnection
      socket.close();
    }

    // Handle disconnection
    socket.onclose = () => {
    }
  }
}

// Make events for condo
function createEvents() {

  // Select condo
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-condo-condoId')) {

      showValues(Number(event.target.value));
    }
  });

  // Update condo
  document.addEventListener('click', (event) => {

    if (event.target.classList.contains('button-condo-update')) {

      const condoId =
        Number(document.querySelector('.select-condo-condoId').value);
      updateCondoRow(condoId);
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

      deleteCondoRow();

    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condo-cancel')) {

      // Sends a request to the server to get all condos
      const SQLquery = `
        SELECT * FROM condo
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY condoId;
      `;
      updateMySql(SQLquery, 'condo', 'SELECT');
    }
  });
}

function updateCondoRow(condoId) {

  let SQLquery = "";
  let isUpdated = false;

  // Check values
  if (validateValues()) {

    const condoName =
      document.querySelector('.input-condo-name').value;
    const street =
      document.querySelector('.input-condo-street').value;
    const postalCode =
      document.querySelector('.input-condo-postalCode').value;
    const city =
      document.querySelector('.input-condo-city').value;
    const address2 =
      document.querySelector('.input-condo-address2').value;

    // current date
    const now = new Date();
    const lastUpdate =
      now.toISOString();

    // Check if condo id exist
    const objCondoRowNumber =
      condoArray.findIndex(condo => condo.condoId === condoId);
    if (objCondoRowNumber !== -1) {

      // Update condo table
      SQLquery = `
        UPDATE condo
        SET 
          user = '${objUserPassword.email}',
          lastUpdate = '${lastUpdate}',
          name = '${condoName}',
          street = '${street}',
          address2 = '${address2}',
          postalCode = '${postalCode}', 
          city = '${city}'
        WHERE condoId = ${condoId};
      `;
      updateMySql(SQLquery, 'condo', 'UPDATE');

    } else {

      SQLquery = `
        INSERT INTO condo (
          tableName,
          condominiumId,
          user,
          lastUpdate,
          name,
          street,
          address2,
          postalCode,
          city)
        VALUES (
          'condo',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          '${condoName}',
          '${street}',
          '${address2}',
          '${postalCode}',
          '${city}'
        );
      `;

      updateMySql(SQLquery, 'condo', 'INSERT');
    }

    document.querySelector('.select-condo-condoId').disabled =
      false;
    document.querySelector('.button-condo-delete').disabled =
      false;
    document.querySelector('.button-condo-insert').disabled =
      false;

    isUpdated = true;
  }
  return isUpdated;
}

// Show leading text for condo
function showLeadingText(condoId) {

  // Show all condos
  objCondo.showAllCondos('condo-condoId', condoId);

  // Show condo name
  objCondo.showInput('condo-name', '* Navn', 50, '');

  // Show street name
  objCondo.showInput('condo-street', '* Gateadresse', 50, '');

  // Show address 2
  objCondo.showInput('condo-address2', 'Adresse 2', 50, '');

  // Postal code
  objCondo.showInput('condo-postalCode', '* Postnummer', 4, '4 siffer');

  // City
  objCondo.showInput('condo-city', '* Poststed', 50, '');

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
    const objCondoRowNumber =
      condoArray.findIndex(condo => condo.condoId === condoId);
    if (objCondoRowNumber !== -1) {

      // Condo id
      const condoId =
        condoArray[objCondoRowNumber].condoId;
      objCondo.selectCondoId(condoId, 'condo-condoId')

      // Condo name
      document.querySelector('.input-condo-name').value =
        condoArray[objCondoRowNumber].name;

      // Show street
      document.querySelector('.input-condo-street').value =
        condoArray[objCondoRowNumber].street;

      // Show address 2
      document.querySelector('.input-condo-address2').value =
        condoArray[objCondoRowNumber].address2;

      // Show postal code
      document.querySelector('.input-condo-postalCode').value =
        condoArray[objCondoRowNumber].postalCode;

      // Show city
      document.querySelector('.input-condo-city').value =
        condoArray[objCondoRowNumber].city;

      /*
      // Show phone number
      document.querySelector('.input-condo-phone').value =
        condoArray[objCondoRowNumber].phone;

      // Show email
      document.querySelector('.input-condo-email').value =
        condoArray[objCondoRowNumber].email;
      */
    }
  }
}

// Reset all values for condo
function resetValues() {

  document.querySelector('.select-condo-condoId').value =
    '';

  document.querySelector('.input-condo-name').value =
    '';

  // Show street
  document.querySelector('.input-condo-street').value =
    '';

  // Show address 2
  document.querySelector('.input-condo-address2').value =
    '';

  // Show postal code
  document.querySelector('.input-condo-postalCode').value =
    '';

  // Show city
  document.querySelector('.input-condo-city').value =
    '';

  document.querySelector('.select-condo-condoId').disabled =
    true;
  document.querySelector('.button-condo-delete').disabled =
    true;
  document.querySelector('.button-condo-insert').disabled =
    true;
}

function deleteCondoRow() {

  let SQLquery = "";

  // Check for valid condo Id
  const condoId = Number(document.querySelector('.select-condo-condoId').value);
  if (condoId >= 0) {

    // Check if condo exist
    const objCondoRowNumber =
      condoArray.findIndex(condo => condo.condoId === condoId);
    if (objCondoRowNumber !== -1) {

      // Delete table
      SQLquery = `
        DELETE FROM condo
        WHERE condoId = ${condoId};
      `;
    }
    // Client sends a request to the server
    updateMySql(SQLquery, 'condo', 'DELETE');

    // Show updated condos
    //objCondo.getCondos(socket);
    const SQLquery = `
      SELECT * FROM condo
      WHERE condominiumId = ${objUserPassword.condominiumId}
      ORDER BY condoId;
    `;
    updateMySql(SQLquery, 'condo', 'SELECT');
  }
}

// Check for valid condo number
function validateValues() {

  // Check condo name
  const condoName =
    document.querySelector('.input-condo-name').value;
  const validCondoName =
    objCondo.validateText(condoName, "label-condo-name", "Navn");

  // Check street name
  const street = document.querySelector('.input-condo-street').value;
  const validStreet = objCondo.validateText(street, "label-condo-street", "Gateadresse");

  // Check postal code
  const postalCode = document.querySelector('.input-condo-postalCode').value;
  const validPostalCode = objCondo.validatePostalCode(postalCode, "label-condo-postalCode", "Postnummer");

  // Validate city
  const city = document.querySelector('.input-condo-city').value;
  const validCity = objCondo.validateText(city, "label-condo-city", "Poststed");

  if (validCondoName
    && validStreet
    && validPostalCode
    && validCity) {
    return true;
  } else {
    return false;
  }
}