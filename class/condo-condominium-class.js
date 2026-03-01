
class Condominium extends Condos {

  // Condominiums informations
  arrayCondominiums = Array;

  /*
  // Show all condominiums
  showSelectedCondominiums(className, condominiumId) {

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
    const numberOfRows = this.arrayCondominiums.length;
    if (numberOfRows > 0) {
      this.arrayCondominiums.forEach((condominium) => {
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
  */

  // Find selected condominium id
  getSelectedCondominiumId(columnName) {

    let condominiumId = 0;

    // Check if HTML class exist
    const className = `select-${this.applicationName}-${columnName}`;
    if (isClassDefined(className)) {

      condominiumId = Number(document.querySelector(`.${className}`).value);
      condominiumId = (condominiumId === 0) ? this.arrayCondominiums.at(-1).condominiumId : condominiumId;
    } else {

      // Get last id in last object in condominium array
      condominiumId = this.arrayCondominiums.at(-1).condominiumId;
    }

    return condominiumId;
  }

  // Show condominiums table with alternative select options
  async loadCondominiumsTable() {

    try {
      const response = await fetch(`http://localhost:3000/condominiums?action=select`);
      if (!response.ok) throw new Error("Network error (condominiums)");
      this.arrayCondominiums = await response.json();
    } catch (error) {
      console.log("Error loading condominiums:", error);
    }
  }
  // update condominium row in condominiums table
  async updateCondominiumsTable(user, condominiumId, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importFileName) {

    try {
      const response = await fetch(`http://localhost:3000/condominiums?action=update&user=${user}&condominiumId=${condominiumId}&name=${name}&street=${street}&address2=${address2}&postalCode=${postalCode}&city=${city}&phone=${phone}&email=${email}&incomeRemoteHeatingAccountId=${incomeRemoteHeatingAccountId}&paymentRemoteHeatingAccountId=${paymentRemoteHeatingAccountId}&commonCostAccountId=${commonCostAccountId}&organizationNumber=${organizationNumber}&importFileName=${importFileName}`);
      if (!response.ok) throw new Error("Network error (condominiums)");
      this.arrayCondominiums = await response.json();
    } catch (error) {
      console.log("Error updating condominiums:", error);
    }
  }

  // insert condominium row in users table
  async insertCondominiumsTable(user, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importFileName) {

    try {
      const response = await fetch(`http://localhost:3000/condominiums?action=insert&user=${user}&name=${name}&street=${street}&address2=${address2}&postalCode=${postalCode}&city=${city}&phone=${phone}&email=${email}&incomeRemoteHeatingAccountId=${incomeRemoteHeatingAccountId}&paymentRemoteHeatingAccountId=${paymentRemoteHeatingAccountId}&commonCostAccountId=${commonCostAccountId}&organizationNumber=${organizationNumber}&importFileName=${importFileName}`);
      if (!response.ok) throw new Error("Network error (condominiums)");
      this.arrayCondominiums = await response.json();
    } catch (error) {
      console.log("Error inserting condominiums:", error);
    }
  }
  // delete condominium row
  async deleteCondominiumsTable(condominiumId, user) {

    try {
      const response = await fetch(`http://localhost:3000/condominiums?action=delete&condominiumId=${condominiumId}&user=${user}`);
      if (!response.ok) throw new Error("Network error (condominiums)");
      this.arrayCondominiums = await response.json();
    } catch (error) {
      console.log("Error deleteing condominiums:", error);
    }
  }

  // Show all selected condominiums
  showSelectedCondominiums(className, style, condominiumId, selectNone, selectAll) {

    let selectedValue = false;

    let html = `
    <td
      class="center one-line"
    >
      <select 
        class="${className} center"
        ${(style) ? `style=${style}` : 'style="width:175px;"'}
      >`;
    
    // Check if condominium array is empty
    const numberOfRows = this.arrayCondominiums.length;
    if (Number(this.arrayCondominiums.length) > 0) {
      this.arrayCondominiums.forEach((condominium) => {
        if (condominium.condominiumId === condominiumId) {

          html += `
          <option 
            value=${condominium.condominiumId}
            selected
          >
            ${condominium.name}
          </option>`;
          selectedValue = true;
        } else {

          html +=
            `
              <option 
                value="${condominium.condominiumId}">
                ${condominium.name}
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
      selectedValue = true;
    }

    // Select all
    if (selectAll && (numberOfRows > 1)) {

      html +=
        `
          <option 
            value=${this.nineNine}
            selected
          >
            ${selectAll}
          </option>
        `;
      selectedValue = true;
    }

    // Select none
    if (selectNone && (numberOfRows > 1)) {
      if (selectedValue) {
        html +=
          `
          <option 
            value=0
          >
            ${selectNone}
          </option>
        `;
      } else {

        html +=
          `
            <option 
              value=0
              selected
            >
              ${selectNone}
            </option>
          `;
        selectedValue = true;
      }
    }

    html +=
      `
          </select >
        </td>
      `;

    return html;
  }
}

