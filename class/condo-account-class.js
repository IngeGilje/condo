// class for account
class Account extends Condos {

  // account information
  accountArray = Array;

  // Show all accounts
  showAllAccounts(className, accountId, alternativeSelect) {

    let html = `
      <form
        id= 
        action="/submit" 
        method="POST">
        <label class="label-${className}"
          for="accountId">
            Velg konto
        </label>
        <select class="select-${className}" 
          id="accountId" name="accountId"
        >
    `;

    // Check if account movement array is empty
    const numberOfRows = accountArray.length;
    if (numberOfRows > 1) {
      accountArray.forEach((account) => {
        if (account.accountId > 1) {
          if (account.accountId === accountId) {

            html += `
            <option 
              value=${account.accountId}
              selected
              >
              ${account.accountId} - ${account.name}
            </option>
          `;
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
        Ingen kontoer
      </option>
    `;
    }

    // Alternative select
    if (alternativeSelect && (numberOfRows > 1)) {
      html += `
        <option 
          value=999999999
          selected
          >
          ${alternativeSelect}
        </option>
      `;
    }

    html += `
      </select >
    </form>
  `;

    document.querySelector(`.div-${className}`).innerHTML = html;
  }

  // Find selected account id
  getSelectedAccountId(className) {

    let accountId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      accountId =
        Number(document.querySelector(`.select-${className}`).value);
      accountId = (accountId === 0) ? accountArray.at(-1).accountId : accountId;
    } else {

      // Get last id in last object in account array
      accountId = accountArray.at(-1).accountId;
    }

    return accountId;
  }
}

