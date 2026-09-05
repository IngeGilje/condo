// class for remote heating
class RemoteHeatings extends Condos {

  // remote heating information
  arrayRemoteHeatings;

  /*
  // Show remoteHeatings
  showSelectedRemoteHeatingsNew(label, className, style, remoteHeatingId, selectNone, selectAll, enableChanges) {

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

    // Check if remoteHeatings array is empty
    if (this.arrayRemoteHeatings.length > 0) {
      this.arrayRemoteHeatings.forEach((remoteHeating) => {

        // Condo name
        const condoName = (remoteHeating.condoId)
          ? objCondo.getCondoNameById(remoteHeating.condoId)
          : '';

        html += `
        <option 
          value=${remoteHeating.remoteHeatingId}
          ${(remoteHeating.remoteHeatingId === remoteHeatingId) ? 'selected' : ''}
        >
          &nbsp;&nbsp;${condoName} - ${remoteHeating.year}&nbsp;&nbsp;
        </option>`;
        if (remoteHeating.remoteHeatingId === remoteHeatingId) selectedValue = true;
      });
    } else {

      // No remoteHeatings
      html += `
      <option 
        value="0" 
         ${(selectedValue) ? '' : 'selected'} 
      >
        Ingen fjernvarme
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayRemoteHeatings.length > 0)) {

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
    if (selectNone && (this.arrayRemoteHeatings.length > 0)) {
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

  // get remoteheatings from remoteheatings table
  async loadRemoteHeatingsTable(condominiumId, year, condoId) {

    const URL = (this.serverStatus === 1)
      ? '/api/remoteheatings'
      : 'http://localhost:3000/remoteheatings';
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
          year: year,
          condoId: condoId
        })
      });
      if (!response.ok) throw new Error("Network error (remoteheatings)");
      this.arrayRemoteHeatings = await response.json();
    } catch (error) {
      console.log("Error loading remoteheatings:", error);
    }
  }

  // Get the highest ID in the table
  async getHighestRemoteHeatingId(condominiumId) {
    const URL = (this.serverStatus === 1)
      ? '/api/remoteheatings'
      : 'http://localhost:3000/remoteheatings';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'highestRemoteHeatingId',
          condominiumId: condominiumId
        })
      });
      if (!response.ok) throw new Error("Network error (remoteheatings)");
      this.arrayRemoteHeatings = await response.json();
    } catch (error) {
      console.log("Error selecting remoteheatings:", error);
    }
  }

  // update a remoteheatings row
  async updateRemoteHeatingTable(user, remoteHeatingId, condoId, year, date, kilowattHour, priceYear) {

    const URL = (this.serverStatus === 1) ? '/api/remoteheatings' : 'http://localhost:3000/remoteheatings';
    try {

      // POST request
      //const response = await fetch(`${URL}:3000/remoteheatings?action=update&user=${user}&remoteHeatingId=${remoteHeatingId}&condoId=${condoId}&year=${year}&date=${date}&kilowattHour=${kilowattHour}&priceYear=${priceYear}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          user: user,
          remoteHeatingId: remoteHeatingId,
          condoId: condoId,
          year: year,
          date: date,
          kilowattHour: kilowattHour,
          priceYear: priceYear
        })
      });
      if (!response.ok) throw new Error("Network error (remoteheatings)");
      this.arrayRemoteHeatings = await response.json();
    } catch (error) {
      console.log("Error updating remoteheatings:", error);
    }
  }

  // insert remoteheatings row
  async insertRemoteHeatingTable(condominiumId, user, condoId, year, date, kilowattHour, priceYear) {

    const URL = (this.serverStatus === 1) ? '/api/remoteheatings' : 'http://localhost:3000/remoteheatings';
    try {

      // POST request
      //const response = await fetch(`${URL}:3000/remoteheatings?action=insert&condominiumId=${condominiumId}&user=${user}&condoId=${condoId}&year=${year}&date=${date}&kilowattHour=${kilowattHour}&priceYear=${priceYear}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'insert',
          condominiumId: condominiumId,
          user: user,
          condoId: condoId,
          year: year,
          date: date,
          kilowattHour: kilowattHour,
          priceYear: priceYear
        })
      });
      if (!response.ok) throw new Error("Network error (remoteheatings)");
      this.arrayRemoteHeatings = await response.json();
    } catch (error) {
      console.log("Error insert remoteheatings:", error);
    }
  }

  // delete a remoteheatings row
  async deleteRemoteHeatingTable(remoteHeatingId, user) {

    const URL = (this.serverStatus === 1)
      ? '/api/remoteheatings'
      : 'http://localhost:3000/remoteheatings';
    try {

      // Fetch for sending a message to server(request)
      // response is a message in .json format send from server(response)
      // POST request
      //const response = await fetch(`${URL}:3000/remoteheatings?action=delete&remoteHeatingId=${remoteHeatingId}&user=${user}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          remoteHeatingId: remoteHeatingId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (remoteheatings)");
      this.arrayRemoteHeatings = await response.json();
    } catch (error) {
      console.log("Error delete remoteheatings:", error);
    }
  }

  // Show remoteheatings
  showSelectedRemoteheatingsNew(className, label, remoteHeatingId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <!-- start showSelectedRemoteheatingsNew -->
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

    // Check if remoteheatings array is empty
    if (this.arrayRemoteheatings.length > 0) {
      this.arrayRemoteheatings.forEach((remoteHeating) => {

        html += `
        <option 
          value=${remoteHeating.remoteHeatingId}
          ${(remoteHeating.remoteHeatingId === remoteHeatingId) ? 'selected' : ''}
        >
          ${remoteHeating.name.trim()}
        </option>`;
        if (remoteHeating.remoteHeatingId === remoteHeatingId) selectedValue = true;
      });
    } else {

      // No remoteheatings
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
    if (selectAll && (this.arrayRemoteheatings.length > 0)) {

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
    if (selectNone && (this.arrayRemoteheatings.length > 0)) {
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
    <!-- end showSelectedRemoteheatingsNew -->
    `;

    return html;
  }
}