
class BankAccountMovement extends Condos {

  // bank account movement information
  bankAccountMovementArray = Array;

  // Show all bank account movements
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

    // Check if bank account movement array is empty
    const numberOfRows =
     bankAccountMovementArray.length;
    if (numberOfRows > 0) {
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
          Ingen bankkonto transaksjoner
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

  // Find selected bank account movement id
  getSelectedBankAccountMovements(columnName) {

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

  // Show all bank account movements
  showAllBankAccountMovements(className, bankAccountMovementId, alternativeSelect) {

    let html =
      `
        <form
          id="bankAccountMovementId"
          action="/submit" 
          method="POST"
        >
          <label 
            class="label-${className}"
            for="bankAccountMovementId"
            id="bankAccountMovementId"
          >
            Velg kontobevegelse
          </label>
          <select 
            class="select-${className}" 
            id="bankAccountMovementId"
            name="bankAccountMovementId"
          >
      `;

    let lineNumber =
      0;

    // Check if bank account movement array is empty
    const numberOfRows = 
    bankAccountMovementArray.length;
    if (numberOfRows > 0) {
      bankAccountMovementArray.forEach((bankaccountmovement) => {
        if (bankaccountmovement.bankAccountMovementId > 1) {

          lineNumber++;
          if (bankaccountmovement.bankAccountMovementId === bankAccountMovementId) {

            html += 
              `
                <option 
                  value=${bankaccountmovement.bankAccountMovementId}
                  selected
                >
                  ${lineNumber} - ${bankaccountmovement.text} 
                </option>
              `;
          } else {

            html +=
              `
                <option 
                  value="${bankaccountmovement.bankAccountMovementId}">
                  ${lineNumber} - ${bankaccountmovement.text} 
                </option>
              `;
          }
        }
      });
    } else {

      html += 
      `
        <option 
          value="0" 
          selected
        >
          Ingen bankkonto transaksjoner
        </option>
    `;
    }

    // Alternative select
    if (alternativeSelect && (numberOfRows > 1)) {
      html +=
        `
          <option 
            value=999999999
            selected
          >
            ${alternativeSelect}
          </option>
        `;
    }

    html +=
      `
          </select >
        </form>
    `;

    document.querySelector(`.div-${className}`).innerHTML =
      html;
  }

  // Find selected Bank Account Movement Id
  getSelectedBankAccountMovementId(className) {

    let bankAccountMovementId = 0;

    // Check if class exist
    if (isClassDefined(className)) {

      bankAccountMovementId =
        Number(document.querySelector(`.${className}`).value);
      bankAccountMovementId =
       (bankAccountMovementId === 0) ? bankAccountMovementArray.at(-1).bankAccountMovementId : bankAccountMovementId;
    } else {

      // Get last id in last object in budget array
      bankAccountMovementId =
       bankAccountMovementArray.at(-1).bankAccountMovementId;
    }

    return bankAccountMovementId;
  }
}

