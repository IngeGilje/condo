// class for supplier
class Supplier extends Condos {

  // supplier information
  arraySuppliers;

  showSelectedSuppliers(className, style, supplierId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <td
      class="one-line left"
    >
      <select 
        class="${className} center"
        ${(style) ? `style="${style}"` : ""}
        ${(enableChanges) ? '' : 'disabled'}
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
        ${(!selectedValue) ? 'selected' : ''}
      >
        ${selectAll}
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select none
    if (selectNone && (this.arraySuppliers.length > 1)) {
      html += `
      <option 
        value=0
        ${(!selectedValue) ? 'selected' : ''}
      >
        ${selectNone}
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    html += `
      </select >
    </td>`;

    return html;
  }

  // Show selected suppliers
  showSelectedSuppliersNew(label, className, style, supplierId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <div class="field status" style="width:250px">
      <label>
        ${label}
      </label>
      <select 
        class="${className} center one-line"
        ${(enableChanges) ? '' : 'readonly'}
      >`;

    // Check if suppliers array is empty
    if (this.arraySuppliers.length > 0) {
      this.arraySuppliers.forEach((supplier) => {

        html += `
        <option 
          value=${supplier.supplierId}
          ${(supplier.supplierId === supplierId) ? 'selected' : ''}
        >
          &nbsp;&nbsp;${supplier.name.trim()}&nbsp;&nbsp;
        </option>`;

        if (supplier.supplierId === supplierId) selectedValue = true;
      });
    } else {

      // No suppliers
      html += `
      <option 
        value="0" 
         ${(selectedValue) ? '' : 'selected'} 
      >
        &nbsp;&nbsp;Ingen leverandører&nbsp;&nbsp;
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arraySupplier.length > 0)) {

      html += `
      <option 
        value=${this.nineNine}
        ${(selectedValue) ? '' : 'selected'} 
      >
        &nbsp;&nbsp;${selectAll}&nbsp;&nbsp;
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select none
    if (selectNone && (this.arraySupplier.length > 0)) {
      html += `
      <option 
        value=0
        ${(!selectedValue) ? 'selected' : ''}
      >
        &nbsp;&nbsp;${selectNone}&nbsp;&nbsp;
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    html += `
      </select >
      <label>
        ${label}
      </label>
    </div>`;

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

    const URL = (this.serverStatus === 1)
      ? '/api/suppliers'
      : 'http://localhost:3000/suppliers';
    try {

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

    const URL = (this.serverStatus === 1)
      ? '/api/suppliers'
      : 'http://localhost:3000/suppliers';
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

