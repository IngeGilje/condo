
class Condominium extends Condos {

  // Condominium information
  condominiumArray = Array;

  // Show all condominiums
  showAllCondominiums(className, condominiumId) {

    let html =
      `
        <form 
          id="Condominium"
          action="/submit" 
          method="POST"
        >
        <label 
          class="label-${className}"
          for="Condominium"
        >
          Velg sameie
        </label>
        <select 
          class="select-${className}" 
          id="Condominium"
        >
      `;

    let selectedOption = false;

    // Check if condominium array is empty
    const numberOfRows = condominiumArray.length;
    if (numberOfRows > 0) {
      condominiumArray.forEach((condominium) => {
        if (condominium.condominiumId >= 0) {
          if (condominium.condominiumId === condominiumId) {

            html += 
              `
                <option 
                  value="${condominium.condominiumId}"
                  selected
                >
                  ${condominium.condominiumId} - ${condominium.name}
                </option>
              `;
            selectedOption = true;
          } else {
            html += 
            `
              <option 
                value="${condominium.condominiumId}"
              >
                ${condominium.condominiumId} - ${condominium.name}
              </option>
            `;
          }
        }
      });
    } else {

      html += 
        `
          <option value="0" 
            selected
          >
            Ingen sameier
          </option>
        `;
      selectedOption =
        true;
    }

    html +=
      `
          </select>
        </form>
      `;
    document.querySelector(`.div-${className}`).innerHTML = html;
  }

  // Find selected condominium id
  getSelectedCondominiumId(columnName) {

    let condominiumId = 0;

    // Check if HTML class exist
    const className = `select-${this.applicationName}-${columnName}`;
    if (isClassDefined(className)) {

      condominiumId =
        Number(document.querySelector(`.${className}`).value);
      condominiumId = (condominiumId === 0) ? condominiumArray.at(-1).condominiumId : condominiumId;
    } else {

      // Get last id in last object in condominium array
      condominiumId = condominiumArray.at(-1).condominiumId;
    }

    return condominiumId;
  }
}

