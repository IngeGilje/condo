
class ImportFile extends Condos {

  strCSVTransaction;

  // Show all account movements to update
  showImportFile(columnName, importFileId, alternativeSelect) {

    let htmlImportFile =
      `
        <form 
          id="ImportFile"
          action="/submit" 
          method="POST"
        >
          <label 
            id="ImportFile"
            class="label-${columnName}"
            for="ImportFile"
          >
              Velg import linje
          </label>
          <select 
            class="select-${columnName}" 
          >
      `;

    let selectedOption = false;

    // Check if file import array is empty
    if (this.strCSVTransaction.length > 0) {
      this.strCSVTransaction.forEach((importFile) => {
        if (importFile.importFileId >= 0) {
          if (importFile.importFileId === importFileId) {

            htmlImportFile += `
              <option
                value = "${importFile.importFileId}"
                selected
              >
                ${importFile.importFileId} - ${importFile.text}
              </option >
            `;
            selectedOption =
              true;
          } else {
            htmlImportFile += `
              <option
                value = "${importFile.importFileId}">
                ${importFile.importFileId} - ${importFile.text}
              </option >
            `;
          }
        }
      });

    } else {

      htmlImportFile += `
        <option value = "0"
      selected
        >
        Ingen import linjer
        </option >
        `;
      selectedOption =
        true;
    }

    // Alternative select
    if (alternativeSelect && (this.strCSVTransaction.length > 1)) {
      if (selectedOption) {

        htmlImportFile += `
            <option 
              value=${this.nineNine}
            >
              ${alternativeSelect}
            </option>`;
      } else {

        htmlImportFile +=
          `
            <option 
              value=${this.nineNine}
              selected
            >
              ${alternativeSelect}
            </option>
          `;
        selectedOption =
          true;
      }
    }

    htmlImportFile +=
      `
          </select >
        </form >
      `;

    document.querySelector(`.div-${columnName}`).innerHTML = htmlImportFile;
  }

  // get csv file from local disk
  async loadCsvFile(csvFileName) {

    const URL = (this.serverStatus === 1) ? '/api/import-csvFile' : 'http://localhost:3000/import-csvFile';
    try {

      // POST request
      //const response = await fetch(`${URL}:3000/import-csvFile?action=upload&csvFileName=${csvFileName}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'upload',
          csvFileName: csvFileName
        })
      });
      if (!response.ok) throw new Error("Network error (load csv file)");
      const result = await response.json();
      this.strCSVTransaction = result.content;
      return true;
    } catch (error) {
      objImportFile.showMessage(objImportFile, '', 'Sjekk transaksjonsfil.');
      return false;
    }
  }
}
