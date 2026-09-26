
class Condo extends Condos {

  // Condo information
  arrayCondo;

  // Find selected condo id
  getSelectedCondoId(className) {

    let condoId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      condoId = Number(document.querySelector(`.${className}`).value);
      condoId = (condoId === 0)
        ? this.arrayCondo.at(-1)?.condoId ?? 0
        : condoId;
    } else {

      // Get last id in last object in condo array
      condoId = (this.arrayCondo.length > 0)
        ? this.arrayCondo.at(-1)?.condoId ?? 0
        : 0;
    }

    return condoId;
  }

  getCondoNameById(condoId) {

    //let condoName;
    const rowNumberCondo = this.arrayCondo.findIndex(condo => condo.condoId === condoId);
    /*
    if (rowNumberCondo !== -1) {
      condoName = this.arrayCondo[rowNumberCondo].name;
    } else {
      condoName = "";
    }
    */
    const condoName = this.arrayCondo[rowNumberCondo]?.name ?? '';
    return condoName;
  }

  // Select condo Id
  selectCondoId(condoId, className) {

    // Check if condo id exist
    const rowNumberCondo = this.arrayCondo.findIndex(condo => condo.condoId === condoId);
    if (rowNumberCondo !== -1) {

      document.querySelector(`.select-${className}`).value =
        condoId;
      return true;
    } else {

      return false;
    }
  }

  showSelectedCondos(className, style, condoId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <td
      class="one-line center"
    >
      <select 
        class="${className} center select"
        ${(style) ? `style="${style}"` : ""}
        ${(enableChanges) ? '' : 'disabled'}
      >`;

    // Check if condos array is empty
    if (this.arrayCondo.length > 0) {
      this.arrayCondo.forEach((condo) => {

        html += `
        <option 
          value=${condo.condoId}
          ${(condo.condoId === condoId) ? 'selected' : ''}
        >
          &nbsp;&nbsp;${condo.name.trim()}&nbsp;&nbsp;
        </option>`;
        if (condo.condoId === condoId) selectedValue = true;
      });
    } else {

      // No condos
      html += `
      <option 
        value="0" 
        selected
      >
        Ingen Brukere
      </option>`;
      selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayCondo.length > 0)) {

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
    if (selectNone && (this.arrayCondo.length > 0)) {
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
    </td>`;

    return html;
  }

  // Show condos
  showSelectedCondosNew(className, label, condoId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <!-- start showSelectedCondosNew -->
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

    // Check if condos array is empty
    if (this.arrayCondo.length > 0) {
      this.arrayCondo.forEach((condo) => {

        html += `
        <option 
          value=${condo.condoId}
          ${(condo.condoId === condoId) ? 'selected' : ''}
        >
          ${condo.name.trim()}
        </option>`;
        if (condo.condoId === condoId) selectedValue = true;
      });
    } else {

      // No condos
      html += `
      <option 
        value="0" 
         ${(selectedValue) ? '' : 'selected'} 
      >
        Ingen Leiligheter
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayCondo.length > 0)) {

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
    if (selectNone && (this.arrayCondo.length > 0)) {
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
    <!-- end showSelectedCondosNew -->
    `;

    return html;
  }

  // Show condos 
  showLineFilterCondos(className, label, condoId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    /*
    let html = `
    <!-- start showLineFilterCondos -->
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
    */
   
   let html = `
    <!-- start showLineFilterCondos -->
    <div 
      class="filter-field"
    >
      <div
        class="grid"
      >
        <div 
          class="field"
        >
          <label 
            for="${className}"
          >
            ${label}
          </label>
          <select 
            id="${className}"
            class="${className}"
            ${(enableChanges) ? '' : 'readonly'}
          >
    `;

    // Check if condos array is empty
    if (this.arrayCondo.length > 0) {
      this.arrayCondo.forEach((condo) => {

        html += `
        <option 
          value=${condo.condoId}
          ${(condo.condoId === condoId) ? 'selected' : ''}
        >
          ${condo.name.trim()}
        </option>`;
        if (condo.condoId === condoId) selectedValue = true;
      });
    } else {

      // No condos
      html += `
      <option 
        value="0" 
         ${(selectedValue) ? '' : 'selected'} 
      >
        Ingen Leiligheter
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayCondo.length > 0)) {

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
    if (selectNone && (this.arrayCondo.length > 0)) {
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
      </div>
    </div>
    <!-- end showLineFilterCondos -->
    `;

    return html;
  }

  // get condo
  async loadCondoTable(condominiumId) {

    // Get condo
    const URL = (this.serverStatus === 1)
      ? '/api/condo'
      : 'http://localhost:3000/condo';
    try {
      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'select',
          condominiumId: condominiumId
        })
      });
      if (!response.ok) throw new Error("Network error (condo)");
      this.arrayCondo = await response.json();
    } catch (error) {
      console.log("Error loading condos:", error);
    }
  }

  // Get the highest ID in the table
  async getHighestCondoId(condominiumId) {
    const URL = (this.serverStatus === 1)
      ? '/api/condo'
      : 'http://localhost:3000/condo';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'highestCondoId',
          condominiumId: condominiumId
        })
      });
      if (!response.ok) throw new Error("Network error (condo)");
      this.arrayCondo = await response.json();
    } catch (error) {
      console.log("Error selecting condos:", error);
    }
  }

  // update condo row in condo table
  async updateCondoTable(condoId, user, name, street, address2, postalCode, city, squareMeters) {

    if (address2 === 'undefined') address2 = '';
    const URL = (this.serverStatus === 1) ? '/api/condo' : 'http://localhost:3000/condo';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          condoId: condoId,
          user: user,
          name: name,
          street: street,
          address2: address2,
          postalCode: postalCode,
          city: city,
          squareMeters: squareMeters
        })
      });
      if (!response.ok) throw new Error("Network error (condo)");
      this.arrayCondo = await response.json();
    } catch (error) {
      console.log("Error updating condo:", error);
    }
  }

  // insert condo row in condo table
  async insertCondoTable(condominiumId, user, name, street, address2, postalCode, city, squareMeters) {
    if (address2 === 'undefined') address2 = '';
    const URL = (this.serverStatus === 1) ? '/api/condo' : 'http://localhost:3000/condo';
    try {
      // POST request
      //const response = await fetch(`${URL}:3000/condo?action=insert&condominiumId=${condominiumId}&user=${user}&name=${name}&street=${street}&address2=${address2}&postalCode=${postalCode}&city=${city}&squareMeters=${squareMeters}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'insert',
          condominiumId: condominiumId,
          user: user,
          name: name,
          street: street,
          address2: address2,
          postalCode: postalCode,
          city: city,
          squareMeters: squareMeters
        })
      });
      if (!response.ok) throw new Error("Network error (condo)");
      this.arrayCondo = await response.json();
    } catch (error) {
      console.log("Error inserting condo:", error);
    }
  }

  // delete condo row
  async deleteCondoTable(condoId, user) {

    const URL = (this.serverStatus === 1) ? '/api/condo' : 'http://localhost:3000/condo';
    try {
      // POST request
      //const response = await fetch(`${URL}:3000/condo?action=delete&condoId=${condoId}&user=${user}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          condoId: condoId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (condo)");
      this.arrayCondo = await response.json();
    } catch (error) {
      console.log("Error deleting condo:", error);
    }
  }
}