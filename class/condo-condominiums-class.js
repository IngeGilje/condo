
class Condominiums extends Condos {

  // Condominiums informations
  condominiumsArray = Array;

  // Show all condominiums
  showAllCondominiums(className, condominiumId) {

    let html =
      `
        <form 
          id="Condominium"
          action="/submit" 
          method="POST"
        >
        <label 
          class="label-${className}"
          for="Condominium"
        >
          Velg sameie
        </label>
        <select 
          class="select-${className}" 
          id="Condominium"
        >
      `;

    let selectedOption = false;

    // Check if condominium array is empty
    const numberOfRows = this.condominiumsArray.length;
    if (numberOfRows > 0) {
      this.condominiumsArray.forEach((condominium) => {
        if (condominium.condominiumId >= 0) {
          if (condominium.condominiumId === condominiumId) {

            html += 
              `
                <option 
                  value="${condominium.condominiumId}"
                  selected
                >
                  ${condominium.condominiumId} - ${condominium.name}
                </option>
              `;
            selectedOption = true;
          } else {
            html += 
            `
              <option 
                value="${condominium.condominiumId}"
              >
                ${condominium.condominiumId} - ${condominium.name}
              </option>
            `;
          }
        }
      });
    } else {

      html += 
        `
          <option value="0" 
            selected
          >
            Ingen sameier
          </option>
        `;
      selectedOption =
        true;
    }

    html +=
      `
          </select>
        </form>
      `;
    document.querySelector(`.div-${className}`).innerHTML = html;
  }

  // Find selected condominium id
  getSelectedCondominiumId(columnName) {

    let condominiumId = 0;

    // Check if HTML class exist
    const className = `select-${this.applicationName}-${columnName}`;
    if (isClassDefined(className)) {

      condominiumId =
        Number(document.querySelector(`.${className}`).value);
      condominiumId = (condominiumId === 0) ? this.condominiumsArray.at(-1).condominiumId : condominiumId;
    } else {

      // Get last id in last object in condominium array
      condominiumId = this.condominiumsArray.at(-1).condominiumId;
    }

    return condominiumId;
  }

  // Show condominiums table with alternative select options
  async loadCondominiumsTable(condominiumId) {

    try {
      const response = await fetch(`http://localhost:3000/condominiums?action=select&condominiumId=${condominiumId}`);
      if (!response.ok) throw new Error("Network error (condominiums)");
      this.condominiumsArray = await response.json();
    } catch (error) {
      console.log("Error loading condominiums:", error);
    }
  }
  // update condominium row in condominiums table
  async updateCondominiumTable(user, condominiumId,lastUpdate, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importPath) {

    try {
      const response = await fetch(`http://localhost:3000/condominiums?action=update&user=${user}&condominiumId=${condominiumId}&lastUpdate=${lastUpdate}&name=${name}&street=${street}&address2=${address2}&postalCode=${postalCode}&city=${city}&phone=${phone}&email=${email}&incomeRemoteHeatingAccountId=${incomeRemoteHeatingAccountId}&paymentRemoteHeatingAccountId=${paymentRemoteHeatingAccountId}&commonCostAccountId=${commonCostAccountId}&organizationNumber=${organizationNumber}&importPath=${importPath}`);
      if (!response.ok) throw new Error("Network error (condominiums)");
      this.condominiumsArray = await response.json();
    } catch (error) {
      console.log("Error loading condominiums:", error);
    }
  }

  // insert condominium row in users table
  async insertCondominiumTable(user, lastUpdate, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importPath) {
 
    try {
      const response = await fetch(`http://localhost:3000/condominiums?action=insert&user=${user}&lastUpdate=${lastUpdate}&name=${name}&street=${street}&address2=${address2}&postalCode=${postalCode}&city=${city}&phone=${phone}&email=${email}&incomeRemoteHeatingAccountId=${incomeRemoteHeatingAccountId}&paymentRemoteHeatingAccountId=${paymentRemoteHeatingAccountId}&commonCostAccountId=${commonCostAccountId}&organizationNumber=${organizationNumber}&importPath=${importPath}`);
      if (!response.ok) throw new Error("Network error (condominiums)");
      this.condominiumsArray = await response.json();
    } catch (error) {
      console.log("Error loading condominiums:", error);
    }
  }
  // delete condominium row
  async deleteCondominiumsTable(condominiumId, user, lastUpdate) {

    try {
      const response = await fetch(`http://localhost:3000/condominiums?action=delete&condominiumId=${condominiumId}&user=${user}&lastUpdate=${lastUpdate}`);
      if (!response.ok) throw new Error("Network error (condominiums)");
      this.condominiumsArray = await response.json();
    } catch (error) {
      console.log("Error loading condominiums:", error);
    }
  }
}

