// class for remote heating
class RemoteHeating extends Condos {

  // remote heating information
  arrayRemoteHeatings;

  // Show all selected remoteheatings
  showSelectedRemoteHeatings(className, style, remoteHeatingId, selectNone, selectAll) {

    let selectedValue = false;

    let html = `
    <td
      class="one-line left"
    >
      <select 
        class="${className} center"
        ${(style) ? `style="${style}"` : ''}
        ${(enableChanges) ? '' : 'disabled'}
      >`;

    // Check if RemoteHeatings array is empty
    if (this.arrayRemoteHeatings.length > 0) {
      this.arrayRemoteHeatings.forEach((remoteHeating) => {
        if (remoteHeating.remoteHeatingId === remoteHeatingId) {

          html +=
            `
              <option 
                value=${remoteHeating.remoteHeatingId}
                selected
              >
                ${remoteHeating.name}
              </option>
            `;
          selectedValue = true;
        } else {

          html +=
            `
              <option 
                value="${remoteHeating.remoteHeatingId}">
                ${remoteHeating.name}
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
    if (selectAll && (this.arrayRemoteHeatings.length > 1)) {

      html += `
      <option 
        value=${this.nineNine}
        ${(!selectedValue) ? 'selected' : ''}
      >
        ${selectAll}
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select none
    if (selectNone && (this.arrayRemoteHeatings.length > 1)) {
      if (selectedValue) {
        html += `
        <option 
          value=0
          ${(!selectedValue) ? 'selected' : ''}
        >
          ${selectNone}
        </option>`;
        if (!selectedValue) selectedValue = true;
      } else {

        html += `
        <option 
          value=0
          ${(!selectedValue) ? 'selected' : ''}
        >
          ${selectNone}
        </option>`;
        if (!selectedValue) selectedValue = true;
      }
    }

    html +=
      `
        </select >
      </td>
    `;

    return html;
  }

  // get remoteheatings from remoteheatings table
  async loadRemoteHeatingTable(condominiumId, year, condoId) {

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
}