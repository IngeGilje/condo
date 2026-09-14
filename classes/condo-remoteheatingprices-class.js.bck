// class for remote heating price
class RemoteHeatingPrices extends Condos {

  // remote heating information
  arrayRemoteHeatingPrices;

  /*
  // Show remoteHeatingPrices
  showSelectedRemoteHeatingPricesNew(label, className, style, remoteHeatingPriceId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <div 
      class="field field-position"
    <label>
      ${label}
    </label>
    <select 
      class="${className} center one-line"
      ${(enableChanges) ? '' : 'readonly'}
    >`;

    // Check if remoteHeatingPrices array is empty
    if (this.arrayRemoteHeatingPrices.length > 0) {
      this.arrayRemoteHeatingPrices.forEach((remoteHeating) => {

        html += `
        <option 
          value=${remoteHeating.remoteHeatingPriceId}
          ${(remoteHeating.remoteHeatingPriceId === remoteHeatingPriceId) ? 'selected' : ''}
        >
          &nbsp;&nbsp;${remoteHeating.year}&nbsp;&nbsp;
        </option>`;
        if (remoteHeating.remoteHeatingPriceId === remoteHeatingPriceId) selectedValue = true;
      });
    } else {

      // No remoteHeatingPrices
      html += `
      <option 
        value="0" 
         ${(selectedValue) ? '' : 'selected'} 
      >
        Ingen fjernvarmepriser
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayRemoteHeatingPrices.length > 0)) {

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
    if (selectNone && (this.arrayRemoteHeatingPrices.length > 0)) {
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

  // get remoteheatingprices
  async loadRemoteHeatingPricesTable(condominiumId) {

    const URL = (this.serverStatus === 1)
      ? '/api/remoteheatingprices'
      : 'http://localhost:3000/remoteheatingprices';
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
      if (!response.ok) throw new Error("Network error (remoteheatingprices)");
      this.arrayRemoteHeatingPrices = await response.json();
    } catch (error) {
      console.log("Error loading remoteheatingprices:", error);
    }
  }

  // Get the highest ID in the table
  async getHighestRemoteHeatingPriceId(condominiumId) {
    const URL = (this.serverStatus === 1)
      ? '/api/remoteheatingprices'
      : 'http://localhost:3000/remoteheatingprices';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'highestRemoteHeatingPriceId',
          condominiumId: condominiumId
        })
      });
      if (!response.ok) throw new Error("Network error (remoteheatingprices)");
      this.arrayRemoteHeatingPrices = await response.json();
    } catch (error) {
      console.log("Error selecting remoteheatingprices:", error);
    }
  }

  // update a remoteheatingprices row
  async updateRemoteHeatingPricesTable(user, remoteHeatingPriceId, year, priceKilowattHour) {

    const URL = (this.serverStatus === 1)
      ? '/api/remoteheatingprices'
      : 'http://localhost:3000/remoteheatingprices';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          user: user,
          remoteHeatingPriceId: remoteHeatingPriceId,
          year: year,
          priceKilowattHour: priceKilowattHour
        })
      });
      if (!response.ok) throw new Error("Network error (remoteheatingprices)");
      this.arrayRemoteHeatingPrices = await response.json();
    } catch (error) {
      console.log("Error updating remoteheatingprices:", error);
    }
  }

  // insert remoteheatingprices row
  async insertRemoteHeatingPricesTable(condominiumId, user, year, priceKilowattHour) {

    const URL = (this.serverStatus === 1) 
    ? '/api/remoteheatingprices' 
    : 'http://localhost:3000/remoteheatingprices';
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
          priceKilowattHour: priceKilowattHour
        })
      });
      if (!response.ok) throw new Error("Network error (remoteheatingprices)");
      this.arrayRemoteHeatingPrices = await response.json();
    } catch (error) {
      console.log("Error insert remoteheatingprices:", error);
    }
  }

  // delete a remoteheatingprices row
  async deleteRemoteHeatingPricesTable(remoteHeatingPriceId, user) {

    const URL = (this.serverStatus === 1) 
    ? '/api/remoteheatingprices' 
    : 'http://localhost:3000/remoteheatingprices';
    try {

      // Fetch for sending a message to server(request)
      // response is a message in .json format send from server(response)
      //const response = await fetch(`${URL}:3000/remoteheatingprices?action=delete&remoteHeatingPriceId=${remoteHeatingPriceId}&user=${user}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          remoteHeatingPriceId: remoteHeatingPriceId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (remoteheatingprices)");
      this.arrayRemoteHeatingPrices = await response.json();
    } catch (error) {
      console.log("Error delete remoteheatingprices:", error);
    }
  }
  
  // Show remoteheatingprices
  showSelectedRemoteheatingPricesNew(className,label,  remoteHeatingPriceId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <!-- start showSelectedRemoteheatingPricesNew -->
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

    // Check if remoteheatingprices array is empty
    if (this.arrayRemoteHeatingPrices.length > 0) {
      this.arrayRemoteHeatingPrices.forEach((remoteHeatingPrice) => {

        html += `
        <option 
          value=${remoteHeatingPrice.remoteHeatingPriceId}
          ${(remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId) ? 'selected' : ''}
        >
          ${remoteHeatingPrice.year}
        </option>`;
        if (remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId) selectedValue = true;
      });
    } else {

      // No remoteheatingprices
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
    if (selectAll && (this.arrayRemoteHeatingPrices.length > 0)) {

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
    if (selectNone && (this.arrayRemoteHeatingPrices.length > 0)) {
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
    <!-- end showSelectedRemoteheatingPricesNew -->
    `;

    return html;
  }
}