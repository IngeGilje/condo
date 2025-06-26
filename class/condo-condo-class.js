
class Condo extends Condos {

  // Condo information
  condoArray = Array;

  // Show all condos
  showAllCondos(columnName, condoId, alternativeSelect) {

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
    const numberOfRows = condoArray.length;
    if (numberOfRows > 1) {
      condoArray.forEach((condo) => {
        if (condo.condoId > 1) {
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
    }

    // Alternative select
    if (alternativeSelect && (numberOfRows > 1)) {

      html +=
        `
          <option 
            value=999999999
            selected
          >
            ${alternativeSelect}
          </option>
      `;
    }

    html += `
        </select >
      </form >
    `;

    document.querySelector(`.div-${columnName}`).innerHTML = html;
  }

  // Find selected condo id
  getSelectedCondoId(columnName) {

    let condoId = 0;

    // Check if HTML class exist
    const className = `select-${this.applicationName}-${columnName} `;
    if (isClassDefined(className)) {

      condoId =
        Number(document.querySelector(`.${className}`).value);
      condoId = (condoId === 0) ? condoArray.at(-1).condoId : condoId;
    } else {

      // Get last id in last object in condo array
      condoId = condoArray.at(-1).condoId;
    }

    return condoId;
  }


  getCondoName(condoId) {

    let condoName;
    const objCondoRowNumber =
     condoArray.findIndex(condo => condo.condoId === condoId);
    if (objCondoRowNumber !== -1) {
        condoName = condoArray[objCondoRowNumber].name;
    } else {
      condoName = "-";
    }
    return condoName;
  }
}
