
class ImportFile extends Condos {

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
    const numberOfRows = this.importFileArray.length;
    if (numberOfRows > 0) {
      this.importFileArray.forEach((importFile) => {
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
    if (alternativeSelect && (numberOfRows > 1)) {
      if (selectedOption) {

        htmlImportFile +=
          `
            <option 
              value=999999999
            >
              ${alternativeSelect}
            </option>
          `;
      } else {

        htmlImportFile +=
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

    htmlImportFile +=
      `
          </select >
        </form >
      `;

    document.querySelector(`.div-${columnName}`).innerHTML =
      htmlImportFile;
  }

  // get text file from local disk
  async loadTextFile(textFileName) {

    const response = await fetch("http://localhost:3000/import-text");
    const result = await response.json();
    this.importFileArray = result.content;

    // Parse into objects
    const rawText = objImportFile.importFileArray; // the whole text file as string

    this.importFileArray = parseCSV(rawText);

    console.log(this.importFileArray);

    //this.importFileArray = result.content;
    //console.log(this.importFileArray);


    /*
   try {
 
     const response = await fetch(`http://localhost:3000/import-csv`);
     if (!response.ok) throw new Error("Network error (import of csv file)");
 
     this.importFileArray = await response.json();
     console.log(this.importFileArray);
   } catch (error) {
 
     console.log("Error loading csv file:", error);
   }
   */


    /*
    const response = await fetch("http://localhost:3000/upload-csv");
    this.importFileArray = await response.json();
    console.log(this.importFileArray);
    */
  }
}

function parseCSV(text) {

  // Split into lines
  const lines = text.trim().split("\n");

  // First line = headers
  const headers = lines[0].split(";").map(h => h.trim());

  // Remaining lines = data
  const data = lines.slice(1).map(line => {
    const values = line.split(";");

    // Build an object for each row
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i] ? values[i].replace(/^"|"$/g, "").trim() : "";
      return obj;
    }, {});
  });

  return data;
}
