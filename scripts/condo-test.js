// Condominium maintenance

// Activate classes
const today =
  new Date();

const objUser =
  new User('user');
let userTableOpen

const objAccount =
  new Account('account');
let accountTableOpen

const objBankAccount =
  new BankAccount('bankaccount');
let bankAccountTableOpen

const objCondominium =
  new Condominium('condominium');
let condominiumTableOpen;

let socket;
socket =
  connectingToServer();

getUser()
  .then(getWeatherIcon)
  .then(onSuccess)
  .catch(onError);

function getUser() {

  return new Promise(function (resolve, reject) {

    setTimeout(() => {

      // Send a requests to the server
      socket.onopen = () => {

        let SQLquery;

        // Sends a request to the server to get users
        SQLquery =
          `
            SELECT * FROM user
            WHERE condominiumId = 2
            ORDER BY userId;
          `;

        console.log(SQLquery);
        updateMySql(SQLquery, 'user', 'SELECT');
        userArrayCreated =
      false;
        console.log('Cloudy');
        resolve('Cloudy');
      }
    }, 1000);
  })
}

function getWeatherIcon(weather) {

  return new Promise(function (resolve) {

    setTimeout(() => {

      switch (weather) {
        case 'Sunny':
          resolve('😁');
          break;
        case 'Cloudy':
          resolve('😒');
          break;
        case 'Ranny':
          resolve('😠');
          break;
        default:
          resolve('🤔');
          break;
      }

    }, 100);
  })
}

function onSuccess(success) {

  console.log('Succsess', success)
}

function onError(error) {

  console.log('Error', error)
}

