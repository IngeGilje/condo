
class BankAccountMovement extends Condos {

  // account movement information
  bankAccountMovementArray = Array;

  // Show all account movements
  showAllAccountMovements(columnName, bankAccountMovementId) {

    let html = `
      <form 
        id="bankaccountmovement"
        action="/submit" 
        method="POST"
      >
        <label 
          class="label-${columnName}"
          for="bankaccountmovement"
          id="bankaccountmovement"
        >
            Velg kontobevegelse
        </label>
        <select 
          class="select-${columnName}" 
        >
    `;

    // Check if account movement array is empty
    const numberOfRows = bankAccountMovementArray.length;
    if (numberOfRows > 1) {
      bankAccountMovementArray.forEach((BankAccountMovement) => {
        if (bankAccountMovement.bankAccountMovementId > 1) {
          if (bankAccountMovement.bankAccountMovementId === bankAccountMovementId) {

            html += `
              <option 
                value="${bankAccountMovement.bankAccountMovementId}"
                selected
                >
                ${bankAccountMovement.bankAccountMovementId} - ${bankAccountMovement.text}
              </option>
            `;
          } else {

            html += `
              <option 
                value="${bankAccountMovement.bankAccountMovementId}">
                ${bankAccountMovement.bankAccountMovementId} - ${bankAccountMovement.text}
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
          Ingen bankkonto bevegelser
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

  // Find selected account movement id
  getSelectedAccountMovementId(columnName) {

    let bankAccountMovementId = 0;

    // Check if HTML class exist
    const className = `select-${this.applicationName}-${columnName}`;
    if (isClassDefined(className)) {

      bankAccountMovementId =
        Number(document.querySelector(`.${className}`).value);
    } else {

      // Get last id in last object in bank account movement array
      bankAccountMovementId = bankAccountMovementArray.at(-1).bankAccountMovementId;
    }

    return bankAccountMovementId;
  }
}

