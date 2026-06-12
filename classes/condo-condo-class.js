
class Condo extends Condos {

  // Condo information
  arrayCondo;

  // Find selected condo id
  getSelectedCondoId(className) {

    let condoId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      condoId = Number(document.querySelector(`.${className}`).value);
      condoId = (condoId === 0) ? this.arrayCondo.at(-1).condoId : condoId;
    } else {

      // Get last id in last object in condo array
      condoId = this.arrayCondo.at(-1).condoId;
    }

    return condoId;
  }

  getCondoName(condoId) {

    let condoName;
    const rowNumberCondo = this.arrayCondo.findIndex(condo => condo.condoId === condoId);
    if (rowNumberCondo !== -1) {
      condoName = this.arrayCondo[rowNumberCondo].name;
    } else {
      condoName = "";
    }
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
        class="${className} center"
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
        &nbsp;&nbsp;Ingen leiligheter&nbsp;&nbsp;
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

  // get condos
  async loadCondoTable(condominiumId, condoId) {

    // Get condos
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
          condominiumId: condominiumId,
          condoId: condoId
        })
      });
      if (!response.ok) throw new Error("Network error (condo)");
      this.arrayCondo = await response.json();
    } catch (error) {
      console.log("Error loading condos:", error);
    }
  }

  // update condo row in condo table
  async updateCondoTable(condoId, user, name, street, address2, postalCode, city, squareMeters) {

    if (address2 === 'undefined') address2 = '';
    const URL = (this.serverStatus === 1) ? '/api/condo' : 'http://localhost:3000/condo';
    try {

      // POST request
      //const response = await fetch(`${URL}:3000/condo?action=update&condoId=${condoId}&user=${user}&name=${name}&street=${street}&address2=${address2}&postalCode=${postalCode}&city=${city}&squareMeters=${squareMeters}`);
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