
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

  // get file from local disk
  async loadTextFile(fileName) {

    const URL = (this.serverStatus === 1) 
    ? '/api/importFile' 
    : 'http://localhost:3000/importFile';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'upload',
          fileName: fileName
        })
      });
      if (!response.ok) throw new Error("Network error (load text file)");
      const result = await response.json();
      this.strCSVTransaction = result.content;
      return true;
    } catch (error) {
      objImportFile.showMessage(objImportFile, '', 'Ugyldig navn på transaksjonsfil.');
      return false;
    }
  }
}
