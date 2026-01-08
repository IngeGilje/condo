// class for user
class User extends Condos {

  // users information
  arrayUsers = Array;

  // Show all users
  showAllUsers(classValue, userId) {

    if (userId === undefined) userId = 0;

    let html =
      `
        <label class="label-${classValue}"
          id="user"
          for="user">
            Velg bruker
        </label>
        <select class="select-${classValue}" 
          id="user"
          name="user"
        >
      `;

    // Select last user if userId is 0
    if (userId === 0) userId = this.arrayUsers.at(-1).userId;

    // Check if user array is empty
    const numberOfRows = this.arrayUsers.length;
    if (numberOfRows > 0) {
      this.arrayUsers.forEach((user) => {
        if (user.userId === userId) {

          html +=
            `
              <option 
                value="${user.userId}"
                selected
              >
                ${user.userId} - ${user.firstName}
              </option>
            `;
        } else {

          html +=
            `
              <option 
                value="${user.userId}">
                ${user.userId} - ${user.firstName}
              </option>
            `;
        }
      });

    } else {

      html +=
        `
          <option
            value="0" 
            selected
          >
            Ingen brukere
          </option>
        `;
    }

    html +=
      `
          </select>
      `;

    document.querySelector(`.div-${classValue}`).innerHTML = html;
  }

  // Find selected user id
  getSelectedUserId(classValue) {

    let userId = 0;

    // Check if HTML class exist
    if (isClassDefined(classValue)) {

      userId = Number(document.querySelector(`.${classValue}`).value);
      userId = (userId === 0) ? this.arrayUsers.at(-1).userId : userId;
    } else {

      // Get last id in last object in user array
      userId = this.arrayUsers.at(-1).userId;
    }
    return userId;
  }

  // get users
  async loadUsersTable(condominiumId, resident) {

    // Get users
    try {
      const response = await fetch(`http://localhost:3000/users?action=select&condominiumId=${condominiumId}&resident=${resident}`);
      if (!response.ok) throw new Error("Network error (users)");
      this.arrayUsers = await response.json();
    } catch (error) {
      console.log("Error loading users:", error);
    }
  }

  // update user row in users table
  async updateUsersTable(resident, user, email, userId, condoId, firstName, lastName, phone, securityLevel, password) {

    try {
      const response = await fetch(`http://localhost:3000/users?action=update&user=${user}&userId=${userId}&condoId=${condoId}&email=${email}&firstName=${firstName}&lastName=${lastName}&phone=${phone}&securityLevel=${securityLevel}&password=${password}&resident=${resident}`);
      if (!response.ok) throw new Error("Network error (users)");
      this.arrayUsers = await response.json();
    } catch (error) {
      console.log("Error updating users:", error);
    }
  }

  // insert user row in users table
  async insertUsersTable(resident, condominiumId, user, email, condoId, firstName, lastName, phone, securityLevel, password) {

    try {
      const response = await fetch(`http://localhost:3000/users?action=insert&condominiumId=${condominiumId}&user=${user}&email=${email}&condoId=${condoId}&firstName=${firstName}&lastName=${lastName}&phone=${phone}&securityLevel=${securityLevel}&password=${password}&resident=${resident}`);
      if (!response.ok) throw new Error("Network error (users)");
      this.arrayUsers = await response.json();
    } catch (error) {
      console.log("Error inserting users:", error);
    }
  }

  // delete user row
  async deleteUsersTable(userId, user) {

    try {
      const response = await fetch(`http://localhost:3000/users?action=delete&userId=${userId}&user=${user}`);
      if (!response.ok) throw new Error("Network error (users)");
      this.arrayUsers = await response.json();
    } catch (error) {
      console.log("Error deleting users:", error);
    }
  }

  // Show all selected users
  showSelectedUsersNew(className, style, userId, selectNone, selectAll) {

    let selectedValue = false;

    let html =
      `
        <td
          class="center one-line"
        >
          <select 
            class="${className} center"
      `;
    if (style) html += `style="${style}"`;
    html += `>`;

    // Check if user array is empty
    const numberOfRows = this.arrayUsers.length;
    if (numberOfRows > 0) {
      this.arrayUsers.forEach((user) => {
        if (user.userId === userId) {

          html +=
            `
              <option 
                value=${user.userId}
                selected
              >
                ${user.firstName}
              </option>
            `;
          selectedValue = true;
        } else {

          html +=
            `
              <option 
                value="${user.userId}"
              >
                ${user.firstName}
              </option>
            `;
        }
      });
    } else {

      html +=
        `
          <option value="0" 
            selected
          >
            Ingen leilighet
          </option>
        `;
      selectedValue = true;
    }

    // Select all
    if (selectAll && (numberOfRows > 1)) {

      html +=
        `
          <option 
            value=${this.nineNine}
            selected
          >
            ${selectAll}
          </option>
        `;
      selectedValue = true;
    }

    // Select none
    if (selectNone && (numberOfRows > 1)) {
      if (selectedValue) {
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
        selectedValue = true;
      }
    }

    html +=
      `
          </select >
        </td>
      `;

    return html;
  }
}