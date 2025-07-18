// class for account
class Account extends Condos {

  // account information
  accountArray = Array;

  // Show all accounts
  showAllAccounts(className, accountId, alternativeSelect, alternativeSelect2) {

    let selectedOption =
      false;

    let html =
      `
        <form
          id="accountId"
          action="/submit" 
          method="POST"
        >
          <label 
            class="label-${className}"
            for="accountId"
            id="accountId"
          >
            Velg konto
          </label>
          <select 
            class="select-${className}" 
            id="accountId"
            name="accountId"
          >
      `;

    // Check if account movement array is empty
    const numberOfRows = accountArray.length;
    if (numberOfRows > 0) {
      accountArray.forEach((account) => {
        if (account.accountId >= 0) {
          if (account.accountId === accountId) {

            html +=
              `
                <option 
                  value=${account.accountId}
                  selected
                >
                  ${account.accountId} - ${account.name}
                </option>
              `;
            selectedOption =
              true;
          } else {

            html += `
            <option 
              value="${account.accountId}">
              ${account.accountId} - ${account.name}
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
        Ingen konti
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
        selectedOption =
          true;
      }
    }

    // Alternative select
    if (alternativeSelect2 && (numberOfRows > 1)) {
      if (selectedOption) {
        html +=
          `
          <option 
            value=0
          >
            ${alternativeSelect2}
          </option>
        `;
      } else {

        html +=
          `
          <option 
            value=0
            selected
          >
            ${alternativeSelect2}
          </option>
        `;
        selectedOption =
          true;
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

  // Get selected account id
  getSelectedAccountId(className) {

    let accountId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      accountId =
        Number(document.querySelector(`.${className}`).value);
      accountId =
        (accountId === 0) ? accountArray.at(-1).accountId : accountId;
    } else {

      // Get last id in last object in account array
      accountId =
        accountArray.at(-1).accountId;
    }

    return accountId;
  }
}

