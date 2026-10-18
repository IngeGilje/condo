
class Appartments extends Condos {

  // appartment information
  arrayAppartments;

  /*
  // Find selected appartment id
  getSelectedAppartments(className) {

    let appartmentId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      appartmentId = Number(document.querySelector(`.${className}`).value);
      appartmentId = (appartmentId === 0)
        ? this.arrayAppartments.at(-1)?.appartmentId ?? 0
        : appartmentId;
    } else {

      // Get last id in last object in appartments array
      appartmentId = (this.arrayAppartments.length > 0)
        ? this.arrayAppartments.at(-1)?.appartmentId ?? 0
        : 0;
    }

    return appartmentId;
  }
  */

  getAppartmentNameById(appartmentId) {

    const rowNumberAppartments = this.arrayAppartments.findIndex(appartment => appartment.appartmentId === appartmentId);
    const appartmentName = this.arrayAppartments[rowNumberAppartments]?.name ?? '';
    return appartmentName;
  }

  // Select appartment Id
  selectCondoId(appartmentId, className) {

    // Check if appartment id exist
    const rowNumberAppartments = this.arrayAppartments.findIndex(appartment => appartment.appartmentId === appartmentId);
    if (rowNumberAppartments !== -1) {

      document.querySelector(`.select-${className}`).value =
        appartmentId;
      return true;
    } else {

      return false;
    }
  }

  showSelectedAppartments(className, style, appartmentId, selectNone, selectAll, enableChanges) {

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

    // Check if appartments array is empty
    if (this.arrayAppartments.length > 0) {
      this.arrayAppartments.forEach((appartment) => {

        html += `
        <option 
          value=${appartment.appartmentId}
          ${(appartment.appartmentId === appartmentId) ? 'selected' : ''}
        >
          &nbsp;&nbsp;${appartment.name.trim()}&nbsp;&nbsp;
        </option>`;
        if (appartment.appartmentId === appartmentId) selectedValue = true;
      });
    } else {

      // No appartments
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
    if (selectAll && (this.arrayAppartments.length > 0)) {

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
    if (selectNone && (this.arrayAppartments.length > 0)) {
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

  // Show appartments
  showSelectedAppartmentsNew(className, label, appartmentId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <!-- start showSelectedAppartmentsNew -->
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

    // Check if appartments array is empty
    if (this.arrayAppartments.length > 0) {
      this.arrayAppartments.forEach(appartment => {

        html += `
        <option 
          value=${appartment.appartmentId}
          ${(appartment.appartmentId === appartmentId) ? 'selected' : ''}
        >
          ${appartment.name.trim()}
        </option>`;
        if (appartment.appartmentId === appartmentId) selectedValue = true;
      });
    } else {

      // No appartments
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
    if (selectAll && (this.arrayAppartments.length > 0)) {

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
    if (selectNone && (this.arrayAppartments.length > 0)) {
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
    <!-- end showSelectedAppartmentsNew -->
    `;

    return html;
  }

  // Show appartments 
  showLineFilterAppartments(className, label, appartmentId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <!-- start showLineFilterAppartments -->
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

    // Check if appartments array is empty
    if (this.arrayAppartments.length > 0) {
      this.arrayAppartments.forEach(appartment => {

        html += `
        <option 
          value=${appartment.appartmentId}
          ${(appartment.appartmentId === appartmentId) ? 'selected' : ''}
        >
          ${appartment.name.trim()}
        </option>`;
        if (appartment.appartmentId === appartmentId) selectedValue = true;
      });
    } else {

      // No appartments
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
    if (selectAll && (this.arrayAppartments.length > 0)) {

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
    if (selectNone && (this.arrayAppartments.length > 0)) {
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
    <!-- end showLineFilterAppartments -->
    `;

    return html;
  }

  // get appartments
  async loadAppartmentsTable(condominiumId) {

    // Get appartment
    const URL = (this.serverStatus === 1)
      ? '/api/appartments'
      : 'http://localhost:3000/appartments';
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
      if (!response.ok) throw new Error("Network error (appartment.");
      this.arrayAppartments = await response.json();
    } catch (error) {
      console.log("Error loading appartments:", error);
    }
  }

  // Get the highest ID in the table
  async getHighestAppartmentd(condominiumId) {
    const URL = (this.serverStatus === 1)
      ? '/api/appartments'
      : 'http://localhost:3000/appartments';
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
      if (!response.ok) throw new Error("Network error (appartment.");
      this.arrayAppartments = await response.json();
    } catch (error) {
      console.log("Error selecting appartments:", error);
    }
  }

  // update appartments row
  async updateAppartmentTable(appartmentId, user, name, street, address2, postalCode, city, squareMeters) {

    if (address2 === 'undefined') address2 = '';
    const URL = (this.serverStatus === 1)
      ? '/api/appartments'
      : 'http://localhost:3000/appartments';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          appartmentId: appartmentId,
          user: user,
          name: name,
          street: street,
          address2: address2,
          postalCode: postalCode,
          city: city,
          squareMeters: squareMeters
        })
      });
      if (!response.ok) throw new Error("Network error (appartment");
      this.arrayAppartments = await response.json();
    } catch (error) {
      console.log("Error updating appartments:", error);
    }
  }

  // insert appartments row
  async insertAppartmentTable(condominiumId, user, name, street, address2, postalCode, city, squareMeters) {
    if (address2 === 'undefined') address2 = '';
    const URL = (this.serverStatus === 1)
      ? '/api/appartments'
      : 'http://localhost:3000/appartments';
    try {
      // POST request
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
      if (!response.ok) throw new Error("Network error (appartment)");
      this.arrayAppartments = await response.json();
    } catch (error) {
      console.log("Error inserting appartment:", error);
    }
  }

  // delete appartments row
  async deleteAppartmentTable(appartmentId, user) {

    const URL = (this.serverStatus === 1)
      ? '/api/appartments'
      : 'http://localhost:3000/appartments';
    try {
      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          appartmentId: appartmentId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (appartments)");
      this.arrayAppartments = await response.json();
    } catch (error) {
      console.log("Error deleting appartments:", error);
    }
  }
}