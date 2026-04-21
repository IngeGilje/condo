
class Condominium extends Condos {

  // Condominiums informations
  arrayCondominiums = Array;

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

    const URL = (this.serverStatus === 1)
      ? '/api/condominiums'
      : 'http://localhost:3000/condominiums';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'select'
        })
      });
      if (!response.ok) throw new Error("Network error (condominiums)");
      this.arrayCondominiums = await response.json();
    } catch (error) {
      console.log("Error loading condominiums:", error);
    }
  }
  // update condominium row in condominiums table
  async updateCondominiumsTable(user, condominiumId, name, street, address2,
    postalCode, city, phone, email, incomeRemoteHeatingAccountId,
    paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importPath) {

    const URL = (this.serverStatus === 1)
      ? '/api/condominiums'
      : 'http://localhost:3000/condominiums';

    try {
      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          user: user,
          condominiumId: condominiumId,
          name: name,
          street: street,
          address2: address2,
          postalCode: postalCode,
          city: city,
          phone: phone,
          email: email,
          incomeRemoteHeatingAccountId: incomeRemoteHeatingAccountId,
          paymentRemoteHeatingAccountId: paymentRemoteHeatingAccountId,
          commonCostAccountId: commonCostAccountId,
          organizationNumber: organizationNumber,
          importPath: importPath
        })
      });
      if (!response.ok) throw new Error("Network error (condominiums)");
      this.arrayCondominiums = await response.json();
    } catch (error) {
      console.log("Error updating condominiums:", error);
    }
  }

  // insert condominium row in users table
  async insertCondominiumsTable(user, name, street, address2, postalCode, city, phone, email, incomeRemoteHeatingAccountId, paymentRemoteHeatingAccountId, commonCostAccountId, organizationNumber, importPath) {

    const URL = (this.serverStatus === 1) ? '/api/condominiums' : 'http://localhost:3000/condominiums';
    try {

      // POST request
      //const response = await fetch(`${URL}:3000/condominiums?action=insert&user=${user}&name=${name}&street=${street}&address2=${address2}&postalCode=${postalCode}&city=${city}&phone=${phone}&email=${email}&incomeRemoteHeatingAccountId=${incomeRemoteHeatingAccountId}&paymentRemoteHeatingAccountId=${paymentRemoteHeatingAccountId}&commonCostAccountId=${commonCostAccountId}&organizationNumber=${organizationNumber}&importPath=${importPath}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'insert',
          user: user,
          name: name,
          street: street,
          address2: address2,
          postalCode: postalCode,
          city: city,
          phone: phone,
          email: email,
          incomeRemoteHeatingAccountId: incomeRemoteHeatingAccountId,
          paymentRemoteHeatingAccountId: paymentRemoteHeatingAccountId,
          commonCostAccountId: commonCostAccountId,
          organizationNumber: organizationNumber,
          importPath: importPath
        })
      });
      if (!response.ok) throw new Error("Network error (condominiums)");
      this.arrayCondominiums = await response.json();
    } catch (error) {
      console.log("Error inserting condominiums:", error);
    }
  }
  // delete condominium row
  async deleteCondominiumsTable(condominiumId, user) {

    const URL = (this.serverStatus === 1) ? '/api/condominiums' : 'http://localhost:3000/condominiums';
    try {

      // POST request
      //const response = await fetch(`${URL}:3000/condominiums?action=delete&condominiumId=${condominiumId}&user=${user}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          condominiumId: condominiumId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (condominiums)");
      this.arrayCondominiums = await response.json();
    } catch (error) {
      console.log("Error deleteing condominiums:", error);
    }
  }

  // Show all selected condominiums
  showSelectedCondominiums(className, style, condominiumId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <td
      class="center one-line"
    >
      <select 
        class="${className} center"
        ${(enableChanges) ? '' : 'disabled'}
        ${(style) ? `style=${style}` : 'style="width:175px;"'}
      >`;

    // Check if condominium array is empty
    if (Number(this.arrayCondominiums.length) > 0) {
      this.arrayCondominiums.forEach((condominium) => {

        html += `
        <option 
          value=${condominium.condominiumId}
          ${(condominium.condominiumId === condominiumId) ? 'selected' : ''}
        >
          ${condominium.name}
        </option>`;
        if (condominium.condominiumId === condominiumId) selectedValue = true;
      });
    } else {

      html += `
      <option value="0" 
        selected
      >
        Ingen sameier
      </option>`;
      selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayCondominiums.length > 0)) {

      html += `
      <option 
        value=${this.nineNine}
        ${(selectAll) ? '' : 'selected'}
      >
        ${selectAll}
      </option>`;
      selectedValue = true;
    }

    // Select none
    if (selectNone && (this.arrayCondominiums.length > 1)) {
      html += `
      <option 
        value=0
        ${(selectedValue) ? '' : 'selected'}
      >
        ${selectNone}
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    html += `
      </select >
    </td>`;

    return html;
  }
}

