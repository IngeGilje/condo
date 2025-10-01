
class Condo extends Condos {

  // Condo information
  condoArray;

  // Show all condos
  showAllCondos(columnName, condoId, alternativeSelect, alternativeSelect2) {

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
    const numberOfRows = this.condoArray.length;
    if (numberOfRows > 0) {
      this.condoArray.forEach((condo) => {
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
    if (alternativeSelect && (numberOfRows > 1)) {
      if (selectedOption) {
        html +=
          `
            <option 
              value=999999999
            >
              ${alternativeSelect}
            </option>
          `;
      } else {

        html +=
          `
            <option 
              value=999999999
              selected
            >
              ${alternativeSelect}
            </option>
          `;
        selectedOption =
          true;
      }
    }

    // Do not select any condo
    if (alternativeSelect2 && (numberOfRows > 1)) {
      if (selectedOption) {
        html +=
          `
            <option 
              value=0
            >
              ${alternativeSelect2}
            </option>
          `;
      } else {

        html +=
          `
            <option 
              value=0
              selected
            >
              ${alternativeSelect2}
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
      condoId = (condoId === 0) ? this.condoArray.at(-1).condoId : condoId;
    } else {

      // Get last id in last object in condo array
      condoId = this.condoArray.at(-1).condoId;
    }

    return condoId;
  }

  getCondoName(condoId) {

    let condoName;
    const condoRowNumberObj =
      this.condoArray.findIndex(condo => condo.condoId === condoId);
    if (condoRowNumberObj !== -1) {
      condoName = this.condoArray[condoRowNumberObj].name;
    } else {
      condoName = "-";
    }
    return condoName;
  }

  // Show all condos
  showAllCondosHTML(className, selectAll) {

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
    const numberOfRows = this.condoArray.length;
    if (numberOfRows > 0) {
      this.condoArray.forEach((condo) => {

        html +=
          `
            <option
              value = "${condo.condoId}"
            >
              ${condo.condoId} - ${condo.name}
            </option >
          `;
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
    const condoRowNumberObj = this.condoArray.findIndex(condo => condo.condoId === condoId);
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
      this.condoArray = await response.json();
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
      this.condoArray = await response.json();
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
      this.condoArray = await response.json();
    } catch (error) {
      console.log("Error inserting condo:", error);
    }
  }
  // delete condo row
  async deleteCondoTable(condoId, user, lastUpdate) {

    try {
      const response = await fetch(`http://localhost:3000/condo?action=delete&condoId=${condoId}&user=${user}&lastUpdate=${lastUpdate}`);
      if (!response.ok) throw new Error("Network error (condo)");
      this.condoArray = await response.json();
    } catch (error) {
      console.log("Error deleting condo:", error);
    }
  }
}