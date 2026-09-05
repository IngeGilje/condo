
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
      condominiumId = (condominiumId === 0)
        ? this.arrayCondominiums.at(-1)?.condominiumId ?? 0
        : condominiumId;
    } else {

      // Get last id in last object in condominium array
      condominiumId = this.arrayCondominiums.at(-1)?.condominiumId ?? 0;
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

  // Get the highest ID in the table
  async getHighestCondominiumId(condominiumId) {
    const URL = (this.serverStatus === 1)
      ? '/api/condominiums'
      : 'http://localhost:3000/condominiums';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'highestCondominiumId',
          condominiumId: condominiumId
        })
      });
      if (!response.ok) throw new Error("Network error (condominiums)");
      this.arrayCondominiums = await response.json();
    } catch (error) {
      console.log("Error selecting condominiums:", error);
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
      class="one-line left"
    >
      <select 
        class="${className} center"
        ${(style) ? `style="${style}"` : ""}
        ${(enableChanges) ? '' : 'disabled'}
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
      if (!selectedValue) selectedValue = true;
    }

    // Select none
    if (selectNone && (this.arrayCondominiums.length > 1)) {
      html += `
      <option 
        value=0
        ${(!selectedValue) ? 'selected' : ''}
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

  /*
  // Show condominiums
  showSelectedCondominiumsNew(label, className, style, condominiumId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <div 
      class="field field-position" 
    >
    <label>
      ${label}
    </label>
    <select 
      class="${className} center one-line"
      ${(enableChanges) ? '' : 'readonly'}
    >`;

    // Check if condominiums array is empty
    if (this.arrayCondominiums.length > 0) {
      this.arrayCondominiums.forEach((condominium) => {

        html += `
        <option 
          value=${condominium.condominiumId}
          ${(condominium.condominiumId === condominiumId) ? 'selected' : ''}
        >
          &nbsp;&nbsp;${condominium.name.trim()}&nbsp;&nbsp;
        </option>`;

        if (condominium.condominiumId === condominiumId) selectedValue = true;
      });
    } else {

      // No condominiums
      html += `
      <option 
        value="0" 
         ${(selectedValue) ? '' : 'selected'} 
      >
        &nbsp;&nbsp;Ingen sameier&nbsp;&nbsp;
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayCondominiums.length > 0)) {

      html += `
      <option 
        value=${this.nineNine}
        ${(selectedValue) ? '' : 'selected'} 
      >
        &nbsp;&nbsp;${selectAll}&nbsp;&nbsp;
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select none
    if (selectNone && (this.arrayCondominiums.length > 0)) {
      html += `
      <option 
        value=0
        ${(!selectedValue) ? 'selected' : ''}
      >
        &nbsp;&nbsp;${selectNone}&nbsp;&nbsp;
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    html += `
      </select >
      <label>
        ${label}
      </label>
    </div>`;

    return html;
  }
  */

  // Show condominiums
  showSelectedCondominiumsNew(className, label, condominiumId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <!-- start showSelectedCondominiumsNew -->
    <div 
      class="field"
    >
      <label for="${className}">
        ${label}
      </label>
      <select 
        id="${className}"
        class="${className}"
        ${(enableChanges) ? '' : 'readonly'}
      >
    `;

    // Check if condominiums array is empty
    if (this.arrayCondominiums.length > 0) {
      this.arrayCondominiums.forEach((condominium) => {

        html += `
        <option 
          value=${condominium.condominiumId}
          ${(condominium.condominiumId === condominiumId) ? 'selected' : ''}
        >
          ${condominium.name.trim()}
        </option>`;
        if (condominium.condominiumId === condominiumId) selectedValue = true;
      });
    } else {

      // No condominiums
      html += `
      <option 
        value="0" 
         ${(selectedValue) ? '' : 'selected'} 
      >
        Ingen konti
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayCondominiums.length > 0)) {

      html += `
      <option 
        value=${this.nineNine}
        ${(selectedValue) ? '' : 'selected'} 
      >
        ${selectAll}
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select none
    if (selectNone && (this.arrayCondominiums.length > 0)) {
      html += `
      <option 
        value=0
        ${(!selectedValue) ? 'selected' : ''}
      >
        ${selectNone}
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    html += `
      </select >
    </div>
    <!-- end showSelectedCondominiumsNew -->
    `;

    return html;
  }
}

