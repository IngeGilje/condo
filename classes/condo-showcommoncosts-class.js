// class for commoncosts
class CommonCosts extends Condos {

  // common cost information
  arrayCommonCosts;

  // Get selected common cost id
  getSelectedCommonCostId(className) {

    letcommonCostId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      commonCostId = Number(document.querySelector(`.${className}`).value);
      commonCostId = (commonCostId === 0)
        ? this.arrayCommonCosts.at(-1)?.commonCostId ?? 0
        : commonCostId;
    } else {

      // Get last id in last object in commonCost array
      commonCostId = (this.arrayCommonCosts.length > 0)
        ? this.arrayCommonCosts.at(-1)?.commonCostId ?? 0
        : 0;
    }

    returncommonCostId;
  }

  /*
  // Select common cost Id
  selectCommonCostId(commonCostId, className) {

    // Check if common cost id exist
    const rowNumberCommonCost = this.arrayCommonCosts.findIndex(commonCost => commonCost.commonCostId === commonCostId);
    if (rowNumberCommonCost !== -1) {

      document.querySelector(`.select-${className}`).value = this.arrayCommonCosts[rowNumberCommonCost].commonCostId;
      return true;
    } else {

      return false;
    }
  }
  */

  /*
  // Select commonCost Id
  selectCommonCostId(commonCostId) {

    // Check if common cost id exist
    const rowNumberCommonCost = this.arrayCommonCosts.findIndex(commonCost => commonCost.commonCostId === commonCostId);
    if (rowNumberCommonCost !== -1) commonCostId = this.arrayCommonCosts[rowNumberCommonCost].commonCostId;

    returncommonCostId;
  }
  */

  /*
  // Show commoncosts
  showSelectedCommonCostsNew(label, className, style, commonCostId, selectNone, selectAll, enableChanges) {

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
      >
    `;

    // Check if commoncosts array is empty
    if (this.arrayCommonCosts.length > 0) {
      this.arrayCommonCosts.forEach((commonCost) => {

        html += `
        <option 
          value=${commonCost.commonCostId}
          ${(commonCost.commonCostId === commonCostId) ? 'selected' : ''}
        >
          &nbsp;&nbsp;${commonCost.year}&nbsp;&nbsp;
        </option>`;

        if (commonCost.commonCostId === commonCostId) selectedValue = true;
      });
    } else {

      // No commoncosts
      html += `
      <option 
        value="0" 
         ${(selectedValue) ? '' : 'selected'} 
      >
        Ingen Felleskostnad
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayCommonCosts.length > 0)) {

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
    if (selectNone && (this.arrayCommonCosts.length > 0)) {
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

  // get commoncosts
  async loadCommonCostsTable(condominiumId) {

    const URL = (this.serverStatus === 1)
      ? '/api/commoncosts'
      : 'http://localhost:3000/commoncosts';
    try {

      // POST request
      //const response = await fetch(`${URL}:3000/commoncosts?action=select&condominiumId=${condominiumId}`);
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
      if (!response.ok) throw new Error("Network error (commoncosts)");
      this.arrayCommonCosts = await response.json();
    } catch (error) {
      console.log("Error loading commoncosts:", error);
    }
  }

  // Get the highest ID in the table
  async getHighestCommonCostId(condominiumId) {
    const URL = (this.serverStatus === 1)
      ? '/api/commoncosts'
      : 'http://localhost:3000/commoncosts';
    try {

      /*
       const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'highestCommonCostId',
          condominiumId: condominiumId
        })
      });
      */
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'highestCommonCostId',
          condominiumId: condominiumId
        })
      });

      if (!response.ok) throw new Error("Network error (commoncosts)");
      this.arrayCommonCosts = await response.json();
    } catch (error) {
      console.log("Error selecting commoncosts:", error);
    }
  }

  // update a commoncosts row
  async updateCommonCostsTable(user, commonCostId, year, commonCostSquareMeter, fixedCostCondo) {

    const URL = (this.serverStatus === 1)
      ? '/api/commoncosts'
      : 'http://localhost:3000/commoncosts';
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
          commonCostId: commonCostId,
          year: year,
          commonCostSquareMeter: commonCostSquareMeter,
          fixedCostCondo: fixedCostCondo
        })
      });
      if (!response.ok) throw new Error("Network error (commoncosts)");
      this.arrayCommonCosts = await response.json();
    } catch (error) {
      console.log("Error updating commoncosts:", error);
    }
  }

  // insert commoncosts row
  async insertCommonCostsTable(condominiumId, user, year, commonCostSquareMeter, fixedCostCondo) {

    const URL = (this.serverStatus === 1)
      ? '/api/commoncosts'
      : 'http://localhost:3000/commoncosts';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'insert',
          condominiumId: condominiumId,
          user: user,
          year: year,
          commonCostSquareMeter: commonCostSquareMeter,
          fixedCostCondo: fixedCostCondo
        })
      });
      if (!response.ok) throw new Error("Network error (commoncosts)");
      this.arrayCommonCosts = await response.json();
    } catch (error) {
      console.log("Error insert commoncosts:", error);
    }
  }

  // delete a commoncosts row
  async deleteCommonCostsTable(commonCostId, user) {

    const URL = (this.serverStatus === 1)
      ? '/api/commoncosts'
      : 'http://localhost:3000/commoncosts';
    try {

      // Fetch for sending a message to server(request)
      // response is a message in .json format send from server(response)
      //const response = await fetch(`${URL}:3000/commoncosts?action=delete&commonCostId=${commonCostId}&user=${user}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          commonCostId: commonCostId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (commoncosts)");
      this.arrayCommonCosts = await response.json();
    } catch (error) {
      console.log("Error delete commoncosts:", error);
    }
  }

  // Show commonCosts
  showSelectedCommonCostsNew(className, label, commonCostId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <!-- start showSelectedCommonCostsNew -->
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

    // Check if commonCosts array is empty
    if (this.arrayCommonCosts.length > 0) {
      this.arrayCommonCosts.forEach((commonCost) => {

        html += `
        <option 
          value=${commonCost.commonCostId}
          ${(commonCost.commonCostId === commonCostId) ? 'selected' : ''}
        >
          ${commonCost.year}
        </option>`;
        if (commonCost.commonCostId === commonCostId) selectedValue = true;
      });
    } else {

      // No commonCosts
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
    if (selectAll && (this.arrayCommonCosts.length > 0)) {

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
    if (selectNone && (this.arrayCommonCosts.length > 0)) {
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
    <!-- end showSelectedCommonCostsNew -->
    `;

    return html;
  }
}