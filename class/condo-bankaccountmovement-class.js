
class BankAccountMovement extends Condos {

  // bank account movement information
  bankAccountMovementArray =
   Array;

  // Show all selected bank account movements
  //showAllSelectedAccountMovements(columnName, bankAccountMovementId, fromDate, toDate, condoId, accountId) {
  showAllSelectedAccountMovements(columnName, bankAccountMovementId) {

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

    let lineNumber = 0;

    let selectedOption =
      false;

    // Check if bank account movement array is empty
    const numberOfRows =
      bankAccountMovementArray.length;
    if (numberOfRows > 0) {
      bankAccountMovementArray.forEach((bankAccountMovement) => {

        lineNumber++;
        if (bankAccountMovement.bankAccountMovementId === bankAccountMovementId) {

          html +=
            `
              <option 
                value="${bankAccountMovement.bankAccountMovementId}"
                selected
              >
                ${lineNumber} - ${bankAccountMovement.bankAccountMovementId}
              </option>
            `;
          selectedOption =
            true;
        } else {

          html +=
            `
              <option 
                value="${bankAccountMovement.bankAccountMovementId}">
                ${lineNumber} - ${bankAccountMovement.bankAccountMovementId}
              </option>
            `;
        }
      });
    } else {

      html +=
        `
          <option value="0" 
            selected
          >
            Ingen banktransaksjoner
          </option>
        `;
      selectedOption =
        true;
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

    let selectedOption =
      false;

    // Check if bank account movement array is empty
    const numberOfRows =
      bankAccountMovementArray.length;
    if (numberOfRows > 0) {
      bankAccountMovementArray.forEach((bankaccountmovement) => {

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
          selectedOption =
            true;
        } else {

          html +=
            `
                <option 
                  value="${bankaccountmovement.bankAccountMovementId}">
                  ${lineNumber} - ${bankaccountmovement.text} 
                </option>
              `;
        }
      });
    } else {

      html +=
        `
          <option 
            value="0" 
            selected
          >
            Ingen banktransaksjoner
          </option>
        `;
      selectedOption =
        true;
    }

    // Alternative select
    if (alternativeSelect && (numberOfRows > 1)) {
      if (selectedOption) {
        html +=
          `
          <option 
            value=999999999
          >
            ${alternativeSelect}
          </option>
        `;
      } else {

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
      if (bankAccountMovementArray.length > 0) {
        bankAccountMovementId =
          (bankAccountMovementId === 0) ? bankAccountMovementArray[0].bankAccountMovementId : bankAccountMovementId;
      }
    } else {

      // Get last id in last object in budget array
      if (bankAccountMovementArray.length > 0) {
        bankAccountMovementId =
          bankAccountMovementArray[0].bankAccountMovementId;
      }
    }

    return bankAccountMovementId;
  }
}

