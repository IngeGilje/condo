// class for supplier
class Supplier extends Condos {

  // supplier information
  arraySuppliers;

  /*
  // Show all suppliers
  showSelectedSuppliers(classValue, supplierId) {

    let html = `
      <form 
        id="supplier"
        action="/submit"
        method="POST"
      >
        <label class="label-${classValue}"
          id="supplier"
          for="supplier">
            Velg leverandør
        </label>
        <select class="select-${classValue}" 
          id="supplier"
          name="supplier"
        >
    `;

    let selectedOption = false;

    // Check if supplier array is empty
    if (this.arraySuppliers.length > 0) {
      this.arraySuppliers.forEach((supplier) => {
        if (supplier.supplierId >= 0) {
          if (supplier.supplierId === supplierId) {

            html += `
            <option 
              value="${supplier.supplierId}"
              selected
              >
              ${supplier.supplierId} - ${supplier.name}
            </option>
          `;
            selectedOption =
              true;
          } else {
            html += `
            <option 
              value="${supplier.supplierId}">
              ${supplier.supplierId} - ${supplier.name}
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
        Ingen leverandører
      </option>
    `;
      selectedOption =
        true;
    }

    html += `
      </select >
    </form>`;

    document.querySelector(`.div-${classValue}`).innerHTML = html;
  }
  */

  showSelectedSuppliers(className, style, supplierId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <td
      class="centerCell one-line center"
    >
      <select 
        class="${className} center"
        ${(enableChanges) ? '' : 'disabled'}
        ${(style) ? `style=${style}` : 'style=width:175px;'}
      >`;

    // Check if Suppliers array is empty
    if (this.arraySuppliers.length > 0) {
      this.arraySuppliers.forEach((supplier) => {

        html += `
        <option 
          value=${supplier.supplierId}
          ${(supplier.supplierId === supplierId) ? 'selected' : ''}
        >
          ${supplier.name}
        </option>`;
        if (supplier.supplierId === supplierId) selectedValue = true;
      });
    } else {

      html += `
      <option value="0" 
        selected
      >
        Ingen leverandører
      </option>`;
      selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arraySuppliers.length > 1)) {

      html += `
      <option 
        value=${this.nineNine}
        selected
      >
        ${selectAll}
      </option>`;
      selectedValue = true;
    }

    // Select none
    if (selectNone && (this.arraySuppliers.length > 1)) {
      html += `
        <option 
          value=0
          ${(selectedValue) ? selectNone : ''}
        >
          ${selectNone}
        </option>`;
      selectedValue = true;
    }

    html += `
      </select >
    </td>`;

    return html;
  }

  // Find selected supplier id
  getSelectedSupplierId(classValue) {

    let supplierId = 0;

    // Check if HTML class exist
    if (isClassDefined(classValue)) {

      supplierId = Number(document.querySelector(`.${classValue}`).value);
      supplierId = (supplierId === 0) ? this.arraySuppliers.at(-1).supplierId : supplierId;
    } else {

      // Get last supplier Id
      (this.arraySuppliers.length > 0)
        ? supplierId = this.arraySuppliers.at(-1).supplierId
        : 0;
    }
    return supplierId;
  }

  // get suppliers
  async loadSuppliersTable(condominiumId) {

    const URL = (this.serverStatus === 1) ? '/api/suppliers' : 'http://localhost:3000/suppliers';
    try {

      //const response = await fetch(`${URL}:3000/suppliers?action=select&condominiumId=${condominiumId}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'select',
          condominiumId: condominiumId
        })
      });
      if (!response.ok) throw new Error("Network error (users)");
      this.arraySuppliers = await response.json();
    } catch (error) {
      console.log("Error loading suppliers:", error);
    }
  }

  // update supplier row
  async updateSuppliersTable(supplierId, user, name, street, address2, postalCode, city, email, phone, bankAccount, accountId, amount, amountAccountId, text, textAccountId) {

    const URL = (this.serverStatus === 1) ? '/api/suppliers' : 'http://localhost:3000/suppliers';
    try {

      //const response = await fetch(`${URL}:3000/suppliers?action=update&supplierId=${supplierId}
      /*
        &name=${name}
        &street=${street}&address2=${address2}
        &postalCode=${postalCode}&city=${city}
        &email=${email}&phone=${phone}
        &accountId=${accountId}&bankAccount=${bankAccount}
        &amountAccountId=${amountAccountId}&amount=${amount}
        &textAccountId=${textAccountId}&text=${text}`);
      */
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          supplierId: supplierId,
          name: name,
          street: street,
          address2: address2,
          postalCode: postalCode,
          city: city,
          email: email,
          phone: phone,
          accountId: accountId,
          bankAccount: bankAccount,
          amountAccountId: amountAccountId,
          amount: amount,
          textAccountId: textAccountId,
          text: text
        })
      });
      if (!response.ok) throw new Error("Network error (suppliers)");
      this.arraySuppliers = await response.json();
    } catch (error) {
      console.log("Error updating supplier:", error);
    }
  }

  // insert supplier row
  async insertSuppliersTable(condominiumId, user, name, street, address2, postalCode, city, email, phone, bankAccount, accountId, amount, amountAccountId, text, textAccountId) {

    const URL = (this.serverStatus === 1) ? '/api/suppliers' : 'http://localhost:3000/suppliers';
    try {

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'insert',
          condominiumId: condominiumId,
          user: user,
          name: name,
          street: street,
          address2: address2,
          postalCode: postalCode,
          city: city,
          email: email,
          phone: phone,
          bankAccount: bankAccount,
          accountId: accountId,
          amount: amount,
          amountAccountId: amountAccountId,
          text: text,
          textAccountId: textAccountId
        })
      });
      if (!response.ok) throw new Error("Network error (suppliers)");
      this.arraySuppliers = await response.json();
    } catch (error) {
      console.log("Error inserting supplier:", error);
    }
  }

  // delete supplier row
  async deleteSuppliersTable(supplierId, user) {

    const URL = (this.serverStatus === 1) ? '/api/suppliers' : 'http://localhost:3000/suppliers';
    try {

      //const response = await fetch(`${URL}:3000/suppliers?action=delete&supplierId=${supplierId}&user=${user}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          supplierId: supplierId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (suppliers)");
      this.arraySuppliers = await response.json();
    } catch (error) {
      console.log("Error deleting supplier:", error);
    }
  }
}

