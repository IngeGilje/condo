
class Condo extends Condos {

  // Condo information
  arrayCondo;

  /*
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
                  ${condo.name}
                </option >
              `;
            selectedOption =
              true;

          } else {
            html +=
              `
                <option
                  value = "${condo.condoId}">
                  ${condo.name}
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
              value=${this.nineNine}
            >
              ${selectAll}
            </option>
          `;
      } else {

        html +=
          `
            <option 
              value=${this.nineNine}
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
  */

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
    const condoRowNumber = this.arrayCondo.findIndex(condo => condo.condoId === condoId);
    if (condoRowNumber !== -1) {
      condoName = this.arrayCondo[condoRowNumber].name;
    } else {
      condoName = "-";
    }
    return condoName;
  }

  // Select condo Id
  selectCondoId(condoId, className) {

    // Check if condo id exist
    const condoRowNumber = this.arrayCondo.findIndex(condo => condo.condoId === condoId);
    if (condoRowNumber !== -1) {

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
  async updateCondoTable(condoId, user, name, street, address2, postalCode, city, squareMeters) {

    if (address2 === 'undefined') address2 = '';
    try {
      const response = await fetch(`http://localhost:3000/condo?action=update&condoId=${condoId}&user=${user}&name=${name}&street=${street}&address2=${address2}&postalCode=${postalCode}&city=${city}&squareMeters=${squareMeters}`);
      if (!response.ok) throw new Error("Network error (condo)");
      this.arrayCondo = await response.json();
    } catch (error) {
      console.log("Error updating condo:", error);
    }
  }

  // insert condo row in condo table
  async insertCondoTable(condominiumId, user, name, street, address2, postalCode, city, squareMeters) {
    if (address2 === 'undefined') address2 = '';
    try {
      const response = await fetch(`http://localhost:3000/condo?action=insert&condominiumId=${condominiumId}&user=${user}&name=${name}&street=${street}&address2=${address2}&postalCode=${postalCode}&city=${city}&squareMeters=${squareMeters}`);
      if (!response.ok) throw new Error("Network error (condo)");
      this.arrayCondo = await response.json();
    } catch (error) {
      console.log("Error inserting condo:", error);
    }
  }

  // delete condo row
  async deleteCondoTable(condoId, user) {

    try {
      const response = await fetch(`http://localhost:3000/condo?action=delete&condoId=${condoId}&user=${user}`);
      if (!response.ok) throw new Error("Network error (condo)");
      this.arrayCondo = await response.json();
    } catch (error) {
      console.log("Error deleting condo:", error);
    }
  }

  // Show all selected condos
  showSelectedCondos(className, style, condoId, selectNone, selectAll) {

    let selectedValue = false;

    let html = `<td class="center one-line"> <select class="${className} center"`;
    if (style) html += `style="${style}"`;
    html += `>`;

    // Check if condo array is empty
    const numberOfRows = this.arrayCondo.length;
    if (numberOfRows > 0) {
      this.arrayCondo.forEach((condo) => {
        if (condo.condoId === condoId) {

          html += `<option value=${condo.condoId} selected>${condo.name}</option>`;
          selectedValue = true;
        } else {

          html += `<option value=${condo.condoId}>${condo.name}</option>`;
        }
      });
    } else {

      html += `<option value=0 selected>Ingen leilighet</option>`;
      selectedValue = true;
    }

    // Select all
    if (selectAll && (numberOfRows > 1)) {

      html += `<option value=${this.nineNine} selected>${selectAll}</option>`;
      selectedValue = true;
    }

    // Select none
    if (selectNone && (numberOfRows > 1)) {
      if (selectedValue) {
        html += `<option value=0>${selectNone}</option>`;
      } else {

        html += `<option value=0 selected>${selectNone}</option>`;
        selectedValue = true;
      }
    }

    html += `</select></td>`;

    return html;
  }
}