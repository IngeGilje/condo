// class for remote heating price
class RemoteHeatingPrice extends Condos {

  // remote heating information
  arrayRemoteHeating;

  // Show all selected remoteheating prices
  showSelectedRemoteHeatingsNew(className, style, remoteHeatingPriceId, selectNone, selectAll) {

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

    // Check if remoteHeatingprices array is empty
    const numberOfRows = this.arrayRemoteHeatingPrices.length;
    if (numberOfRows > 0) {
      this.arrayRemoteHeatingPrices.forEach((remoteHeatingPrice) => {
        if (remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId) {

          html +=
            `
              <option 
                value=${remoteHeatingPrice.remoteHeatingPriceId}
                selected
              >
                ${remoteHeatingPrice.name}
              </option>
            `;
          selectedValue = true;
        } else {

          html +=
            `
              <option 
                value="${remoteHeatingPrice.remoteHeatingPriceId}">
                ${remoteHeatingPrice.name}
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

    let remoteHeatingPriceId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      remoteHeatingPriceId = Number(document.querySelector(`.${className}`).value);
      remoteHeatingPriceId = (remoteHeatingPriceId === 0) ? this.arrayRemoteHeatingPrices.at(-1).remoteHeatingPriceId : remoteHeatingPriceId;
    } else {

      // Get last id in last object in remoteHeatingPrice array
      remoteHeatingPriceId = this.arrayRemoteHeatingPrices.at(-1).remoteHeatingPriceId;
    }

    return remoteHeatingPriceId;
  }

  // Show all RemoteHeatings
  showSelectedRemoteHeatingsHTML(className, remoteHeatingPriceId, selectAll) {

    remoteHeatingPriceId = Number(remoteHeatingPriceId);

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

    // Check if remoteHeatingPrice array is empty
    if (this.arrayRemoteHeatingPrices.length > 0) {
      this.arrayRemoteHeatingPrices.forEach((remoteHeatingPrice) => {

        if (remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId) {
          html +=
            `
              <option
                value = "${remoteHeatingPrice.remoteHeatingPriceId}"
                selected
              >
                ${remoteHeatingPrice.remoteHeatingPriceId} - ${remoteHeatingPrice.name}
              </option >
            `;
          selectedValue = true;
        } else {

          html +=
            `
            <option
              value = "${remoteHeatingPrice.remoteHeatingPriceId}"
            >
              ${remoteHeatingPrice.remoteHeatingPriceId} - ${remoteHeatingPrice.name}
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
  selectRemoteHeatingId(remoteHeatingPriceId, className) {

    // Check if remote heating id exist
    const rowNumberRemoteHeating = this.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
    if (rowNumberRemoteHeating !== -1) {

      document.querySelector(`.select-${className}`).value = this.arrayRemoteHeatingPrices[rowNumberRemoteHeating].remoteHeatingPriceId;
      return true;
    } else {

      return false;
    }
  }

  // Select remoteHeatingPrice Id
  selectRemoteHeatingIdNew(remoteHeatingPriceId) {

    // Check if remote heating id exist
    const rowNumberRemoteHeating = this.arrayRemoteHeatingPrices.findIndex(remoteHeatingPrice => remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId);
    if (rowNumberRemoteHeating !== -1) remoteHeatingPriceId = this.arrayRemoteHeatingPrices[rowNumberRemoteHeating].remoteHeatingPriceId;

    return remoteHeatingPriceId;
  }

  // Show all selected remoteheatingprices
  showSelectedRemoteHeatingsNew(className, style, remoteHeatingPriceId, selectNone, selectAll) {

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
    if (this.arrayRemoteHeatingPrices.length > 0) {
      this.arrayRemoteHeatingPrices.forEach((remoteHeatingPrice) => {
        if (remoteHeatingPrice.remoteHeatingPriceId === remoteHeatingPriceId) {

          html +=
            `
              <option 
                value=${remoteHeatingPrice.remoteHeatingPriceId}
                selected
              >
                ${remoteHeatingPrice.name}
              </option>
            `;
          selectedValue = true;
        } else {

          html +=
            `
              <option 
                value="${remoteHeatingPrice.remoteHeatingPriceId}">
                ${remoteHeatingPrice.name}
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
    if (selectAll && (this.arrayRemoteHeatingPrices.length > 1)) {

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
    if (selectNone && (this.arrayRemoteHeatingPrices.length > 1)) {
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

  // get remoteheatingprices
  async loadRemoteHeatingPricesTable(condominiumId) {

    try {
      const response = await fetch(`http://localhost:3000/remoteheatingprices?action=select&condominiumId=${condominiumId}`);
      if (!response.ok) throw new Error("Network error (remoteheatingprices)");
      this.arrayRemoteHeatingPrices = await response.json();
    } catch (error) {
      console.log("Error loading remoteheatingprices:", error);
    }
  }

  // update a remoteheatingprices row
  async updateRemoteHeatingPricesTable(user, remoteHeatingPriceId, year, priceKilowattHour) {

    try {
      const response = await fetch(`http://localhost:3000/remoteheatingprices?action=update&user=${user}&remoteHeatingPriceId=${remoteHeatingPriceId}&year=${year}&priceKilowattHour=${priceKilowattHour}`);
      if (!response.ok) throw new Error("Network error (remoteheatingprices)");
      this.arrayRemoteHeatingPrices = await response.json();
    } catch (error) {
      console.log("Error updating remoteheatingprices:", error);
    }
  }

  // insert remoteheatingprices row
  async insertRemoteHeatingPricesTable(condominiumId, user, year, priceKilowattHour) {

    try {
      const response = await fetch(`http://localhost:3000/remoteheatingprices?action=insert&condominiumId=${condominiumId}&user=${user}&year=${year}&priceKilowattHour=${priceKilowattHour}`);
      if (!response.ok) throw new Error("Network error (remoteheatingprices)");
      this.arrayRemoteHeatingPrices = await response.json();
    } catch (error) {
      console.log("Error insert remoteheatingprices:", error);
    }
  }

  // delete a remoteheatingprices row
  async deleteRemoteHeatingPricesTable(remoteHeatingPriceId, user) {

    try {
      // Fetch for sending a message to server(request)
      // response is a message in .json format send from server(response)
      const response = await fetch(`http://localhost:3000/remoteheatingprices?action=delete&remoteHeatingPriceId=${remoteHeatingPriceId}&user=${user}`);
      if (!response.ok) throw new Error("Network error (remoteheatingprices)");
      this.arrayRemoteHeatingPrices = await response.json();
    } catch (error) {
      console.log("Error delete remoteheatingprices:", error);
    }
  }
}