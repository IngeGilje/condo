// class for account
class Accounts extends Condos {

  // accounts information
  accountsArray;

  // Show all accounts
  showAllAccounts(className, accountsId, alternativeSelect, alternativeSelect2) {

    let selectedOption =
      false;

    let html =
      `
        <form 
          id="accountsId"
          action="/submit" 
          method="POST"
        >
          <label 
            class="label-${className}"
            for="accountsId"
            id="accountsId"
          >
            Velg konto
          </label>
          <select 
            class="select-${className}" 
            id="accountsId"
            name="accountsId"
          >
      `;

    // Check if account movement array is empty
    const numberOfRows = this.accountsArray.length;
    if (numberOfRows > 0) {
      this.accountsArray.forEach((account) => {
        if (account.accountsId === accountsId) {

          html +=
            `
              <option 
                value=${account.accountsId}
                selected
              >
                ${account.accountsId} - ${account.name}
              </option>
            `;
          selectedOption =
            true;
        } else {

          html +=
            `
              <option 
                value="${account.accountsId}">
                ${account.accountsId} - ${account.name}
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

    let accountsId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      accountsId = Number(document.querySelector(`.${className}`).value);
      accountsId = (accountsId === 0) ? accountsArray.at(-1).accountsId : accountsId;
    } else {

      // Get last id in last object in account array
      accountsId = this.accountsArray.at(-1).accountsId;
    }

    return accountsId;
  }


  // Show all accounts
  showAllAccountsHTML(className, selectAll) {

    let html =
      `
        <div>
          <label 
          >
            Velg Konto
          </label>
          <select
            class="${className}"
          > 
      `;

    // Check if account array is empty
    const numberOfRows = accountsArray.length;
    if (numberOfRows > 0) {
      accountsArray.forEach((account) => {

        html +=
          `
            <option
              value = "${account.accountsId}"
            >
              ${account.accountsId} - ${account.name}
            </option >
          `;
      });

    } else {

      html +=
        `
          <option 
            value = "0"
            selected
          >
            Ingen leiligheter
          </option >
        `;
    }

    // Select all
    if (selectAll) {

      html +=
        `
        <option 
          value=999999999
          selected
        >
          ${selectAll}
        </option>
      `;
    }

    html +=
      `
        </select >
      </div>
    `;

    return html;
  }
  // Get accounts
  async sTable() {
    try {
      const response = await fetch("http://localhost:3000/accounts");
      if (!response.ok) throw new Error("Network error (accounts)");
      this.accountsArray = await response.json();
    } catch (error) {
      console.log("Error loading accounts:", error);
    }
  }
  // get accounts
  async loadAccountsTable(condominiumId) {

    // Get accounts
    try {
      const response = await fetch(`http://localhost:3000/accounts?condominiumId=${condominiumId}`);
      if (!response.ok) throw new Error("Network error (users)");
      this.accountsArray = await response.json();
    } catch (error) {
      console.log("Error loading users:", error);
    }
  }
}