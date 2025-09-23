
class Condo extends Condos {

  // Condo information
  condosArray = Array;

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
    const numberOfRows = this.condosArray.length;
    if (numberOfRows > 0) {
      this.condosArray.forEach((condo) => {
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

    document.querySelector(`.div-${columnName}`).innerHTML =
      html;
  }

  // Find selected condo id
  getSelectedCondoId(className) {

    let condoId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      condoId =
        Number(document.querySelector(`.${className}`).value);
      condoId = (condoId === 0) ? condosArray.at(-1).condoId : condoId;
    } else {

      // Get last id in last object in condo array
      condoId = condosArray.at(-1).condoId;
    }

    return condoId;
  }


  getCondoName(condoId) {

    let condoName;
    const objCondoRowNumber =
      condosArray.findIndex(condo => condo.condoId === condoId);
    if (objCondoRowNumber !== -1) {
      condoName = condoArray[objCondoRowNumber].name;
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
    const numberOfRows = condosArray.length;
    if (numberOfRows > 0) {
      condosArray.forEach((condo) => {

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
  // get condos
  async loadCondosTable(condominiumId) {

    // Get condos
    try {
      const response = await fetch(`http://localhost:3000/condos?action=select&condominiumId=${condominiumId}`);
      if (!response.ok) throw new Error("Network error (condos)");
      this.condosArray = await response.json();
    } catch (error) {
      console.log("Error loading condos:", error);
    }
  }
}