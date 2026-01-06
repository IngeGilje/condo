// class for remote heating
class RemoteHeating extends Condos {

  // remote heating information
  arrayRemoteHeating;

  // Show all selected remoteheatings
  showSelectedRemoteHeatingsNew(className, style, remoteHeatingId, selectNone, selectAll) {

    let selectedValue = false;

    let html =
      `
        <td
          class="center one-line"
        >
          <select 
            class="${className} center"
            style="${style}"
          >
      `;

    // Check if remoteHeatings array is empty
    const numberOfRows = this.arrayRemoteHeatings.length;
    if (numberOfRows > 0) {
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
    if (selectAll && (numberOfRows > 1)) {

      html +=
        `
          <option 
            value=999999999
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
  
  // Get selected remote heating id
  getSelectedRemoteHeatingId(className) {

    let remoteHeatingId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      remoteHeatingId = Number(document.querySelector(`.${className}`).value);
      remoteHeatingId = (remoteHeatingId === 0) ? this.arrayRemoteHeatings.at(-1).remoteHeatingId : remoteHeatingId;
    } else {

      // Get last id in last object in remoteHeating array
      remoteHeatingId = this.arrayRemoteHeatings.at(-1).remoteHeatingId;
    }

    return remoteHeatingId;
  }

  // Show all RemoteHeatings
  showSelectedRemoteHeatingsHTML(className, remoteHeatingId, selectAll) {

    remoteHeatingId = Number(remoteHeatingId);

    let html =
      `
        <div>
          <label 
          >
            Velg Konto
          </label>
          <select
            class="${className}"
          > 
      `;

    // Check if remoteHeating array is empty
    if (this.arrayRemoteHeatings.length > 0) {
      this.arrayRemoteHeatings.forEach((remoteHeating) => {

        if (remoteHeating.remoteHeatingId === remoteHeatingId) {
          html +=
            `
              <option
                value = "${remoteHeating.remoteHeatingId}"
                selected
              >
                ${remoteHeating.remoteHeatingId} - ${remoteHeating.name}
              </option >
            `;
          selectedValue = true;
        } else {

          html +=
            `
            <option
              value = "${remoteHeating.remoteHeatingId}"
            >
              ${remoteHeating.remoteHeatingId} - ${remoteHeating.name}
            </option >
          `;
        }
      });

    } else {

      html +=
        `
          <option 
            value = "0"
            selected
          >
            Ingen leiligheter
          </option >
        `;
      selectedValue = true;
    }

    // Select all
    if (selectAll) {

      html +=
        `
        <option 
          value=999999999
          selected
        >
          ${selectAll}
        </option>
      `;
      selectedValue = true;
    }

    html +=
      `
        </select >
      </div>
    `;

    return html;
  }

  // Select remote heating Id
  selectRemoteHeatingId(remoteHeatingId, className) {

    // Check if remote heating id exist
    const rowNumberRemoteHeating = this.arrayRemoteHeatings.findIndex(remoteHeating => remoteHeating.remoteHeatingId === remoteHeatingId);
    if (rowNumberRemoteHeating !== -1) {

      document.querySelector(`.select-${className}`).value = this.arrayRemoteHeatings[rowNumberRemoteHeating].remoteHeatingId;
      return true;
    } else {

      return false;
    }
  }

  // Select remoteHeating Id
  selectRemoteHeatingIdNew(remoteHeatingId) {

    // Check if remote heating id exist
    const rowNumberRemoteHeating = this.arrayRemoteHeatings.findIndex(remoteHeating => remoteHeating.remoteHeatingId === remoteHeatingId);
    if (rowNumberRemoteHeating !== -1) remoteHeatingId = this.arrayRemoteHeatings[rowNumberRemoteHeating].remoteHeatingId;

    return remoteHeatingId;
  }

  // Show all selected remoteheatings
  showSelectedRemoteHeatingsNew(className, style, remoteHeatingId, selectNone, selectAll) {

    let selectedValue = false;

    let html =
      `
        <td
          class="centerCell one-line center"
        >
          <select 
            class="${className} center"
      `;
      if (style !== '') html += `style="${style}"`;
      html += `>`;

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

      html +=
        `
          <option 
            value=999999999
            selected
          >
            ${selectAll}
          </option>
        `;
      selectedValue = true;
    }

    // Select none
    if (selectNone && (this.arrayRemoteHeatings.length > 1)) {
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

  // get remoteheatings from remoteheatings table
  async loadRemoteHeatingTable(condominiumId, year, condoId) {

    try {
      const response = await fetch(`http://localhost:3000/remoteheatings?action=select&condominiumId=${condominiumId}&year=${year}&condoId=${condoId}`);
      if (!response.ok) throw new Error("Network error (remoteheatings)");
      this.arrayRemoteHeatings = await response.json();
    } catch (error) {
      console.log("Error loading remoteheatings:", error);
    }
  }

  // update a remoteheatings row
  async updateRemoteHeatingTable(user, remoteHeatingId, condoId, year, date, kilowattHour) {

    try {
      const response = await fetch(`http://localhost:3000/remoteheatings?action=update&user=${user}&remoteHeatingId=${remoteHeatingId}&condoId=${condoId}&year=${year}&date=${date}&kilowattHour=${kilowattHour}`);
      if (!response.ok) throw new Error("Network error (remoteheatings)");
      this.arrayRemoteHeatings = await response.json();
    } catch (error) {
      console.log("Error updating remoteheatings:", error);
    }
  }

  // insert remoteheatings row
  async insertRemoteHeatingTable(condominiumId, user, condoId, year, date, kilowattHour) {

    try {
      const response = await fetch(`http://localhost:3000/remoteheatings?action=insert&condominiumId=${condominiumId}&user=${user}&condoId=${condoId}&year=${year}&date=${date}&kilowattHour=${kilowattHour}`);
      if (!response.ok) throw new Error("Network error (remoteheatings)");
      this.arrayRemoteHeatings = await response.json();
    } catch (error) {
      console.log("Error insert remoteheatings:", error);
    }
  }

  // delete a remoteheatings row
  async deleteRemoteHeatingTable(remoteHeatingId, user) {

    try {
      // Fetch for sending a message to server(request)
      // response is a message in .json format send from server(response)
      const response = await fetch(`http://localhost:3000/remoteheatings?action=delete&remoteHeatingId=${remoteHeatingId}&user=${user}`);
      if (!response.ok) throw new Error("Network error (remoteheatings)");
      this.arrayRemoteHeatings = await response.json();
    } catch (error) {
      console.log("Error delete remoteheatings:", error);
    }
  }
}