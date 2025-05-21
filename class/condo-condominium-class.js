
class Condominium extends Condos {

  // Condominium information
  condominiumArray = Array;

  // Show all condominiums
  showAllCondominiums(columnName, condominiumId) {

    let html = `
    <form 
      id="Condominium"
      action="/submit" 
      method="POST"
    >
      <label 
        class="label-condominium-${columnName}"
        for="Condominium"
        id="Condominium"
      >
          Velg sameie
      </label>
      <select 
        class="select-condominium-${columnName}" 
        id="Condominium"
      >
    `;

    // Check if condominium array is empty
    const numberOfRows = condominiumArray.length;
    if (numberOfRows > 1) {
      condominiumArray.forEach((condominium) => {
        if (condominium.condominiumId > 1) {
          if (condominium.condominiumId === condominiumId) {

            html += `
          <option 
            value="${condominium.condominiumId}"
            selected
            >
            ${condominium.condominiumId} - ${condominium.condominiumName}
          </option>
        `;
          } else {
            html += `
          <option 
            value="${condominium.condominiumId}">
            ${condominium.condominiumId} - ${condominium.condominiumName}
          </option>
        `;
          }
        }
      });
    } else {

      html += `
        <option value="0" 
          selected
        >
          Ingen leiligheter
        </option>
      `;
    }

    html += `
      </select >
    </form>
  `;
    document.querySelector(`.div-condominium-${columnName}`).innerHTML = html;
  }

  // Get all condominiums from MySQL database
  getCondominiums(socket) {

    const SQLquery = `
      SELECT * FROM condominium
      ORDER BY condominiumName;
    `;
    socket.send(SQLquery);
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

