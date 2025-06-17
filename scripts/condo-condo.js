// Condo maintenance

// Activate Account class
const objUser = new User('user');
const objCondo = new Condo('condo');

testMode();

let isEventsCreated = false;

objCondo.menu();
objCondo.markSelectedMenu('Leilighet');

let socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  showLoginError('condo-login');
} else {

  // Send a message to the server
  socket.onopen = () => {

    // Sends a request to the server to get all users
    const SQLquery = `
    SELECT * FROM user
    ORDER BY userId;
  `;
    socket.send(SQLquery);
  };

  // Handle incoming messages from server
  socket.onmessage = (event) => {

    let message = event.data;

    // Create user array including objets
    if (message.includes('"tableName":"user"')) {

      console.log('userTable');

      // user array including objects with user information
      userArray = JSON.parse(message);

      // Sends a request to the server to get all condos
      const SQLquery = `
      SELECT * FROM condo
      ORDER BY condoId;
    `;
      socket.send(SQLquery);
    }

    // Create condo array including objets
    if (message.includes('"tableName":"condo"')) {

      // condo table
      console.log('condoTable');

      // array including objects with condo information
      condoArray = JSON.parse(message);

      // Sort condo name
      condoArray.sort((a, b) => a.name.localeCompare(b.name));

      // Find selected condo id
      const condoId = objCondo.getSelectedCondoId('condoId');

      // Show leading text
      showLeadingText(condoId);

      // Show all values for condo
      showValues(condoId);

      // Make events
      if (!isEventsCreated) {
        condoEvents();
        isEventsCreated = true;
      }
    }

    // Check for update, delete ...
    if (message.includes('"affectedRows":1')) {

      console.log('affectedRows');

      // Sends a request to the server to get all condos
      //objCondo.getCondos(socket);
      const SQLquery = `
      SELECT * FROM condo
      ORDER BY condoId;
    `;
      socket.send(SQLquery);
    }
  };

  // Handle errors
  socket.onerror = (error) => {

    // Close socket on error and let onclose handle reconnection
    socket.close();
  }

  // Handle disconnection
  socket.onclose = () => {
  }
}
// Make events for condo
function condoEvents() {

  // Select condo
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-condo-condoId')) {

      showValues(Number(event.target.value));
    }
  });

  // Update condo
  document.addEventListener('click', (event) => {

    if (event.target.classList.contains('button-condo-update')) {

      const condoId = Number(document.querySelector('.select-condo-condoId').value);
      updateCondoRow(condoId);
    }
  });

  // New condo
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condo-new')) {
      resetValues();
    }
  });

  // Delete condo
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condo-delete')) {

      deleteCondoRow();

      // Sends a request to the server to get all condos
      //objCondo.getCondos(socket);
      const SQLquery = `
        SELECT * FROM condo
        ORDER BY condoId;
      `;
      socket.send(SQLquery);
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condo-cancel')) {

      // Sends a request to the server to get all condos
      //objCondo.getCondos(socket);
      const SQLquery = `
        SELECT * FROM condo
        ORDER BY condoId;
      `;
      socket.send(SQLquery);
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
    const objectNumberCondo =
      condoArray.findIndex(condo => condo.condoId === condoId);
    if (objectNumberCondo >= 0) {

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
    }
    // Client sends a request to the server
    socket.send(SQLquery);

    document.querySelector('.select-condo-condoId').disabled =
      false;
    document.querySelector('.button-condo-delete').disabled =
      false;
    document.querySelector('.button-condo-new').disabled =
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
    objCondo.showButton('condo-new', 'Ny');

    // show delete button
    objCondo.showButton('condo-delete', 'Slett');

    // cancel button
    objCondo.showButton('condo-cancel', 'Avbryt');
  }
}

// Show all values for condo
function showValues(condoId) {

  // Check for valid condo Id
  if (condoId > 1) {

    // find object number for selected condo id
    const objectNumberCondo = condoArray.findIndex(condo => condo.condoId === condoId);
    if (objectNumberCondo >= 0) {

      // Condo id
      const condoId = condoArray[objectNumberCondo].condoId;
      objCondo.selectCondoId(condoId, 'condo-condoId')

      // Condo name
      document.querySelector('.input-condo-name').value =
        condoArray[objectNumberCondo].name;

      // Show street
      document.querySelector('.input-condo-street').value =
        condoArray[objectNumberCondo].street;

      // Show address 2
      document.querySelector('.input-condo-address2').value =
        condoArray[objectNumberCondo].address2;

      // Show postal code
      document.querySelector('.input-condo-postalCode').value =
        condoArray[objectNumberCondo].postalCode;

      // Show city
      document.querySelector('.input-condo-city').value =
        condoArray[objectNumberCondo].city;

      /*
      // Show phone number
      document.querySelector('.input-condo-phone').value =
        condoArray[objectNumberCondo].phone;

      // Show email
      document.querySelector('.input-condo-email').value =
        condoArray[objectNumberCondo].email;
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
  document.querySelector('.button-condo-new').disabled =
    true;
}

function deleteCondoRow() {

  let SQLquery = "";

  // Check for valid condo Id

  const condoId = Number(document.querySelector('.select-condo-condoId').value);
  if (condoId > 1) {

    // Check if condo exist
    const objectNumberCondo = condoArray.findIndex(condo => condo.condoId === condoId);
    if (objectNumberCondo >= 0) {

      // Delete table
      SQLquery = `
        DELETE FROM condo
        WHERE condoId = ${condoId};
      `;
    }
    // Client sends a request to the server
    socket.send(SQLquery);

    // Show updated condos
    //objCondo.getCondos(socket);
    const SQLquery = `
      SELECT * FROM condo
      ORDER BY condoId;
    `;
    socket.send(SQLquery);

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