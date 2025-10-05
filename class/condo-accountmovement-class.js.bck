
class AccountMovement extends Condos {

  // account movement information
  accountMovementArray = Array;

  // Show all account movements
  showAllAccountMovements(columnName, accountMovementId) {

    let html = `
      <form 
        id="accountmovement"
        action="/submit" 
        method="POST"
      >
        <label 
          class="label-${columnName}"
          for="accountmovement"
          id="accountmovement"
        >
            Velg kontobevegelse
        </label>
        <select 
          class="select-${columnName}" 
        >
    `;

    // Check if account movement array is empty
    const numberOfRows = accountMovementArray.length;
    if (numberOfRows > 1) {
      accountMovementArray.forEach((accountMovement) => {
        if (accountMovement.accountMovementId > 1) {
          if (accountMovement.accountMovementId === accountMovementId) {

            html += `
              <option 
                value="${accountMovement.accountMovementId}"
                selected
                >
                ${accountMovement.accountMovementId} - ${accountMovement.text}
              </option>
            `;
          } else {

            html += `
              <option 
                value="${accountMovement.accountMovementId}">
                ${accountMovement.accountMovementId} - ${accountMovement.text}
              </option>
            `;
          }
        }
      });
    } else {

      html += `
        <option value="0" 
          selected
        >
          Ingen kontobevegelser
        </option>
      `;
    }

    html += `
      </select >
    </form>
  `;

    document.querySelector(`.div-${columnName}`).innerHTML =
      html;
  }

  getBankAccountName(accountId, unKnown = 'Ukjent') {

    let bankAccountName = unKnown;
    const objectNumberAccount = accountsArray.findIndex(account => account.accountId === accountId);
    if (objectNumberAccount > 0) {
      const bankAccountId = Number(accountsArray[objectNumberAccount].bankAccountId);
      const objectNumberBankAccount = bankAccountsArray.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
      if (objectNumberBankAccount > 0) {
        bankAccountName = bankAccountsArray[objectNumberBankAccount].name;
      }
    }
    return bankAccountName;
  }

  // Find selected account movement id
  getSelectedAccountMovementId(columnName) {

    let accountMovementId = 0;

    // Check if HTML class exist
    const className = `select-${this.applicationName}-${columnName}`;
    if (isClassDefined(className)) {

      accountMovementId =
        Number(document.querySelector(`.${className}`).value);
    } else {

      // Get last id in last object in accountmovement array
      accountMovementId = accountMovementArray.at(-1).accountMovementId;
    }

    return accountMovementId;
  }
}

