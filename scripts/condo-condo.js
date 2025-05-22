// Condo maintenance

// Activate objects
const objUser = new User('user');
const objCondo = new Condo('condo');

const objUserPassword = JSON.parse(localStorage.getItem('user'));

// Connection to a server
let socket;
switch (objUser.serverStatus) {

  // Web server
  case 1: {
    socket = new WebSocket('ws://ingegilje.no:7000');
    break;
  }
  // Test web server/ local web server
  case 2: {
    socket = new WebSocket('ws://localhost:7000');
    break;
  }
  // Test server/ local test server
  case 3: {
    socket = new WebSocket('ws://localhost:7000');

    break;
  }
  default:
    break;
}

let isEventsCreated = false;

objCondo.menu();
objCondo.markSelectedMenu('Leilighet');

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

    // Check user/password
    (objUser.validateUser(objUserPassword.email, objUserPassword.password)) ? '' : window.location.href('file:///C:/inetpub/wwwroot/condo-login.html');

    // username and password is ok
    // Sends a request to the server to get all condos
    //objCondo.getCondos(socket);
    const SQLquery = `
      SELECT * FROM condo
      ORDER BY condoName;
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
    condoArray.sort((a, b) => a.condoName.localeCompare(b.condoName));

    // Find selected condo id
    const condoId = objCondo.getSelectedCondoId('condoId');

    // Show all leading text
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
      ORDER BY condoName;
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
      if (updateCondoRow(condoId)) {
        showValues(condoId);
      }
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
        ORDER BY condoName;
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
        ORDER BY condoName;
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
      document.querySelector('.input-condo-condoName').value;
    const street =
      document.querySelector('.input-condo-street').value;
    const postalCode =
      document.querySelector('.input-condo-postalCode').value;
    const city =
      document.querySelector('.input-condo-city').value;
    const address2 =
      document.querySelector('.input-condo-address2').value;
    /*
    const phone =
      document.querySelector('.input-condo-phone').value;
    const email =
      document.querySelector('.input-condo-email').value;
    */

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
          condoName = '${condoName}',
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
          user,
          lastUpdate,
          condoName,
          street,
          address2,
          postalCode,
          city)
        VALUES (
          'condo',
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
    //document.querySelector('.button-condo-cancel').disabled =
    //  false;
    isUpdated = true;
  }
  return isUpdated;
}

// Show all leading text for condo
function showLeadingText(condoId) {

  // Show all condos
  objCondo.showAllCondos('condo-condoId', condoId);

  // Show condo name
  objCondo.showInput('condo-condoName', '* Navn', 50, '');

  // Show street name
  objCondo.showInput('condo-street', '* Gatenavn', 50, '');

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
      document.querySelector('.input-condo-condoName').value =
        condoArray[objectNumberCondo].condoName;

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

  document.querySelector('.input-condo-condoName').value =
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

  /*
  // Show phone number
  document.querySelector('.input-condo-phone').value =
    '';

  // Show email
  document.querySelector('.input-condo-email').value =
    '';
  */

  document.querySelector('.select-condo-condoId').disabled =
    true;
  document.querySelector('.button-condo-delete').disabled =
    true;
  document.querySelector('.button-condo-new').disabled =
    true;
  //document.querySelector('.button-condo-cancel').disabled =
  //  true;
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
      ORDER BY condoName;
    `;
    socket.send(SQLquery);

  }
}

// Check for valid condo number
function validateValues() {

  // Check condo name
  const condoName = document.querySelector('.input-condo-condoName').value;
  const validCondoName = objCondo.validateText(condoName, "label-condo-condoName", "Navn");

  // Check street name
  const street = document.querySelector('.input-condo-street').value;
  const validStreet = objCondo.validateText(street, "label-condo-street", "Gateadresse");

  // Check postal code
  const postalCode = document.querySelector('.input-condo-postalCode').value;
  const validPostalCode = objCondo.validatePostalCode(postalCode, "label-condo-postalCode", "Postnummer");

  // Check city
  const city = document.querySelector('.input-condo-city').value;
  const validCity = objCondo.validateText(city, "label-condo-city", "Poststed");

  /*
  // Check email
  const eMail = document.querySelector('.input-condo-email').value;
  const validEmail = objCondo.validateEmail(eMail, "label-condo-email", "E-mail");
  */

  if (validCondoName
    && validStreet
    && validPostalCode
    && validCity) {
    return true;
  } else {
    return false;
  }
}

/*
DROP TABLE condo;
CREATE TABLE condo (
  condoId INT AUTO_INCREMENT PRIMARY KEY,
  tableName VARCHAR(50),
  user VARCHAR (50),
  lastUpdate VarChar (40),
  condoName VARCHAR(50) NOT NULL,
  street VARCHAR(50) NOT NULL,
  address2 VARCHAR(50),
  postalCode VARCHAR(4) NOT NULL,
  city VARCHAR(50) NOT NULL
);
INSERT INTO condo (
  tableName,
  user,
  lastUpdate,
  condoName,
  street,
  address2,
  postalCode,
  city)
VALUES (
  'condo',
  'Initiation',
  '2099-12-31T23:59:59.596Z',
  '',
  '',
  '',
  '',
  ''
);
*/