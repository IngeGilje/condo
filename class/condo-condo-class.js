
class Condo extends Condos {

  // Condo information
  arrayCondo;

  // Show selected condos
  showSelectedCondos(columnName, condoId, selectAll, selectNone) {

    let selectedOption;

    let html =
      `
        <form 
          id="Condo"
          action="/submit" 
          method="POST"
        >
          <label 
            id="Condo"
            class="label-${columnName}"
            for="Condo"
          >
            Velg leilighet
          </label>
          <select 
            class="select-${columnName}" 
          >
    `;

    // Check if condo array is empty
    const numberOfRows = this.arrayCondo.length;
    if (numberOfRows > 0) {
      this.arrayCondo.forEach((condo) => {
        if (condo.condoId >= 0) {
          if (condo.condoId === condoId) {

            html +=
              `
                <option
                  value = "${condo.condoId}"
                  selected
                >
                  ${condo.condoId} - ${condo.name}
                </option >
              `;
            selectedOption =
              true;

          } else {
            html +=
              `
                <option
                  value = "${condo.condoId}">
                  ${condo.condoId} - ${condo.name}
                </option >
              `;
          }
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
      selectedOption =
        true;
    }

    // Alternative select
    if (selectAll && (numberOfRows > 1)) {
      if (selectedOption) {
        html +=
          `
            <option 
              value=999999999
            >
              ${selectAll}
            </option>
          `;
      } else {

        html +=
          `
            <option 
              value=999999999
              selected
            >
              ${selectAll}
            </option>
          `;
        selectedOption =
          true;
      }
    }

    // Do not select any condo
    if (selectNone && (numberOfRows > 1)) {
      if (selectedOption) {
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
        selectedOption =
          true;

      }
    }

    html +=
      `
          </select >
        </form >
      `;

    document.querySelector(`.div-${columnName}`).innerHTML = html;
  }

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
    const condoRowNumberObj =
      this.arrayCondo.findIndex(condo => condo.condoId === condoId);
    if (condoRowNumberObj !== -1) {
      condoName = this.arrayCondo[condoRowNumberObj].name;
    } else {
      condoName = "-";
    }
    return condoName;
  }

  // Show selected condos
  showSelectedCondosHTML(className, condoId, selectAll,selectNone) {

    let html =
      `
        <div>
          <label 
          >
            Velg leilighet
          </label>
          <select
            class = "${className}"
          > 
      `;

    // Check if condo array is empty
    const numberOfRows = this.arrayCondo.length;
    if (numberOfRows > 0) {
      this.arrayCondo.forEach((condo) => {

        if (condo.condoId === condoId) {
          html +=
            `
            <option
              value = "${condo.condoId}"
              selected
            >
              ${condo.condoId} - ${condo.name}
            </option >
          `;
        } else {

          html +=
            `
              <option
                value = "${condo.condoId}"
              >
                ${condo.condoId} - ${condo.name}
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
    }

    // Select none
    if (selectNone && (numberOfRows > 1)) {

      html +=
        `
          <option 
            value=0
            selected
          >
            ${selectNone}
          </option>
        `;
    }

    html +=
      `
        </select >
      </div>
    `;

    return html;
  }

  // Select condo Id
  selectCondoId(condoId, className) {

    // Check if condo id exist
    const condoRowNumberObj = this.arrayCondo.findIndex(condo => condo.condoId === condoId);
    if (condoRowNumberObj !== -1) {

      document.querySelector(`.select-${className}`).value =
        condoId;
      return true;
    } else {

      return false;
    }
  }

  // get condos
  async loadCondoTable(condominiumId) {

    // Get condos
    try {
      const response = await fetch(`http://localhost:3000/condo?action=select&condominiumId=${condominiumId}`);
      if (!response.ok) throw new Error("Network error (condos)");
      this.arrayCondo = await response.json();
    } catch (error) {
      console.log("Error loading condos:", error);
    }
  }
  // update condo row in condo table
  async updateCondoTable(condoId, user, lastUpdate, name, street, address2, postalCode, city, squareMeters) {

    if (address2 === 'undefined') address2 = '';
    try {
      const response = await fetch(`http://localhost:3000/condo?action=update&condoId=${condoId}&user=${user}&lastUpdate=${lastUpdate}&name=${name}&street=${street}&address2=${address2}&postalCode=${postalCode}&city=${city}&squareMeters=${squareMeters}`);
      if (!response.ok) throw new Error("Network error (condo)");
      this.arrayCondo = await response.json();
    } catch (error) {
      console.log("Error updating condo:", error);
    }
  }

  // insert condo row in condo table
  async insertCondoTable(condominiumId, user, lastUpdate, name, street, address2, postalCode, city, squareMeters) {
    if (address2 === 'undefined') address2 = '';
    try {
      const response = await fetch(`http://localhost:3000/condo?action=insert&condominiumId=${condominiumId}&user=${user}&lastUpdate=${lastUpdate}&name=${name}&street=${street}&address2=${address2}&postalCode=${postalCode}&city=${city}&squareMeters=${squareMeters}`);
      if (!response.ok) throw new Error("Network error (condo)");
      this.arrayCondo = await response.json();
    } catch (error) {
      console.log("Error inserting condo:", error);
    }
  }
  // delete condo row
  async deleteCondoTable(condoId, user, lastUpdate) {

    try {
      const response = await fetch(`http://localhost:3000/condo?action=delete&condoId=${condoId}&user=${user}&lastUpdate=${lastUpdate}`);
      if (!response.ok) throw new Error("Network error (condo)");
      this.arrayCondo = await response.json();
    } catch (error) {
      console.log("Error deleting condo:", error);
    }
  }
}