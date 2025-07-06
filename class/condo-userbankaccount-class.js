// class for userBankAccountId
class UserBankAccount extends Condos {

  // user bank account information
  userBankAccountArray = [];

  // Show all user bank accounts
  showAllUserBankAccounts(classValue, userBankAccountId) {

    let html = 
      `
        <form 
          id="userBankAccountId"
          action="/submit"
          method="POST"
        >
          <label class="label-${classValue}"
            id="userBankAccountId"
            for="userBankAccountId">
              Velg bankkonto for bruker
          </label>
          <select class="select-${classValue}" 
            id="userBankAccountId"
            name="userBankAccountId"
          >
      `;

    // Check if user bank account array is empty
    const numberOfRows = userBankAccountArray.length;
    if (numberOfRows > 0) {
      userBankAccountArray.forEach((userBankAccount) => {
        if (userBankAccount.userBankAccountId > 1) {
          if (userBankAccount.userBankAccountId === userBankAccountId) {

            html += `
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
              value="${userBankAccount.userBankAccountId}">
              ${userBankAccount.userBankAccountId} - ${userBankAccount.name}
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
        Ingen bruker bankkonto
      </option>
    `;
    }

    html += `
      </select >
    </form>
  `;

    document.querySelector(`.div-${classValue}`).innerHTML =
      html;
  }

  // Find selected user bank account id
  getSelectedUserBankAccountId(classValue) {

    let userBankAccountId = 0;

    // Check if HTML class exist
    if (isClassDefined(classValue)) {

      userBankAccountId =
        Number(document.querySelector(`.${classValue}`).value);
      userBankAccountId = (userBankAccountId === 0) ? userBankAccountArray.at(-1).userBankAccountId : userBankAccountId;
    } else {

      // Get last id in last object in user bank account array
      userBankAccountId = userBankAccountArray.at(-1).userBankAccountId;
    }
    return userBankAccountId;
  }
}

