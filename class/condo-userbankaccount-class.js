// class for user Bank Accounts
class UserBankAccount extends Condos {

  // user bank account information
  arrayUserBankAccounts;

  // Show all user bank accounts
  showAllSelectedUserBankAccounts(className, userBankAccountId) {

    let html =
      `
        <form 
          id="userBankAccountId"
          action="/submit"
          method="POST"
        >
          <label class="label-${className}"
            id="userBankAccountId"
            for="userBankAccountId">
              Velg bankkonto for bruker
          </label>
          <select class="select-${className}" 
            id="userBankAccountId"
            name="userBankAccountId"
          >
      `;

    // Check if user bank account array is empty
    const numberOfRows = this.arrayUserBankAccounts.length;
    if (numberOfRows > 0) {
      this.arrayUserBankAccounts.forEach((userBankAccount) => {
        if (userBankAccount.userBankAccountId >= 0) {
          if (userBankAccount.userBankAccountId === userBankAccountId) {

            html +=
              `
                <option 
                  value="${userBankAccount.userBankAccountId}"
                  selected
                  >
                    ${userBankAccount.userBankAccountId} - ${userBankAccount.name}
                </option>
          `;
          } else {
            html += `
            <option 
              value="${userBankAccount.userBankAccountId}"
            >
              ${userBankAccount.userBankAccountId} - ${userBankAccount.name}
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
            Ingen bruker bankkonto
          </option>
        `;
    }

    html += 
      `
          </select >
        </form>
      `;

    document.querySelector(`.div-${className}`).innerHTML = html;
  }

  // Find selected user bank account id
  getSelectedUserBankAccountId(className) {

    let userBankAccountId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      userBankAccountId = Number(document.querySelector(`.${className}`).value);
      userBankAccountId = (userBankAccountId === 0) ? this.arrayUserBankAccounts.at(-1).userBankAccountId : userBankAccountId;
    } else {

      // Get last id in last object in user bank account array
      userBankAccountId = this.arrayUserBankAccounts.at(-1).userBankAccountId;
    }
    return userBankAccountId;
  }

  // get user bank accounts
  async loadUserBankAccountsTable(condominiumId, userId, accountId) {

    try {
      const response = await fetch(`http://localhost:3000/userbankaccounts?action=select&condominiumId=${condominiumId}&userId=${userId}&accountId=${accountId}`);
      if (!response.ok) throw new Error("Network error (user bank accounts)");
      this.arrayUserBankAccounts = await response.json();
    } catch (error) {
      console.log("Error loading user bank account:", error);
    }
  }

  // update user bank account row
  async updateUserBankAccountsTable(userBankAccountId, condominiumId, user, lastUpdate, userId, accountId,bankAccount) {

    try {
      const response = await fetch(`http://localhost:3000/userbankaccounts?action=update&userBankAccountId=${userBankAccountId}&condominiumId=${condominiumId}&user=${user}&lastUpdate=${lastUpdate}&userId=${userId}&accountId=${accountId}&bankAccount=${bankAccount}`);
      if (!response.ok) throw new Error("Network error (user bank accounts)");
      this.arrayUserBankAccounts = await response.json();
    } catch (error) {
      console.log("Error updating user bank accounts:", error);
    }
  }

  // insert user bank account row
  async insertUserBankAccountsTable(condominiumId, user, lastUpdate, userId, accountId,bankAccount) {

    try {
      const response = await fetch(`http://localhost:3000/userbankaccounts?action=insert&condominiumId=${condominiumId}&user=${user}&lastUpdate=${lastUpdate}&userId=${userId}&accountId=${accountId}&name=${name}&bankAccount=${bankAccount}`);
      if (!response.ok) throw new Error("Network error (user bank accounts)");
      this.arrayUserBankAccounts = await response.json();
    } catch (error) {
      console.log("Error inserting user bank accounts:", error);
    }
  }

  // delete user bank account row
  async deleteUserBankAccountsTable(userBankAccountId, user, lastUpdate) {

    try {
      const response = await fetch(`http://localhost:3000/userbankaccounts?action=delete&userBankAccountId=${userBankAccountId}&user=${user}&lastUpdate=${lastUpdate}`);
      if (!response.ok) throw new Error("Network error (user bank accounts)");
      this.arrayUserBankAccounts = await response.json();
    } catch (error) {
      console.log("Error deleting user bank accounts:", error);
    }
  }
}