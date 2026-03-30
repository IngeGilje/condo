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
  async loadUsersTable(condominiumId, resident, userId) {

    const URL = (this.serverStatus === 1)
      ? '/api/users'
      : 'http://localhost:3000/users';
    try {

      // Get users
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'select',
          condominiumId: condominiumId,
          userId: userId,
          resident: resident
        })
      });
      if (!response.ok) throw new Error("Network error (users)");
      this.arrayUsers = await response.json();

    } catch (error) {
      console.log("Error loading users:", error);
    }
  }

  // get all users even they are deleted
  async loadAllUsersTable() {

    const URL = (this.serverStatus === 1)
      ? '/api/users'
      : 'http://localhost:3000/users';
    try {

      // Get users
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'selectAll'
        })
      });
      if (!response.ok) throw new Error("Network error (users)");
      this.arrayUsers = await response.json();

    } catch (error) {
      console.log("Error loading users:", error);
    }
  }

  // update user row in users table
  async updateUsersTable(condominiumId, resident, user, email, userId, condoId, firstName, lastName, phone) {

    const URL = (this.serverStatus === 1)
      ? '/api/users'
      : 'http://localhost:3000/users';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          user: user,
          condominiumId: condominiumId,
          email: email,
          userId: userId,
          condoId: condoId,
          firstName: firstName,
          lastName: lastName,
          phone: phone,
          resident: resident
        })
      });
      if (!response.ok) throw new Error("Network error (users)");
      this.arrayUsers = await response.json();
    } catch (error) {
      console.log("Error updating users:", error);
    }
  }

  // update user row in users table
  async updateUserPassword(user, userId, securityLevel, password) {

    const URL = (this.serverStatus === 1) ? '/api/users' : 'http://localhost:3000/users';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'updateUserPassword',
          user: user,
          userId: userId,
          securityLevel: securityLevel,
          password: password
        })
      });
      if (!response.ok) throw new Error("Network error (users)");
      this.arrayUsers = await response.json();
    } catch (error) {
      console.log("Error updating password:", error);
    }
  }

  // insert user row in users table
  async insertUsersTable(resident, condominiumId, user, email, condoId, firstName, lastName, phone, securityLevel, password) {

    const URL = (this.serverStatus === 1) ? '/api/users' : 'http://localhost:3000/users';
    try {

      //const response = await fetch(`${URL}:3000/users?action=insert&condominiumId=${condominiumId}&user=${user}&email=${email}&condoId=${condoId}&firstName=${firstName}&lastName=${lastName}&phone=${phone}&securityLevel=${securityLevel}&password=${password}&resident=${resident}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'insert',
          condominiumId: condominiumId,
          user: user,
          email: email,
          condoId: condoId,
          firstName: firstName,
          lastName: lastName,
          phone: phone,
          securityLevel: securityLevel,
          password: password,
          resident: resident
        })
      });
      if (!response.ok) throw new Error("Network error (users)");
      this.arrayUsers = await response.json();
    } catch (error) {
      console.log("Error inserting users:", error);
    }
  }

  // delete user row
  async deleteUsersTable(userId, user) {

    const URL = (this.serverStatus === 1) ? '/api/users' : 'http://localhost:3000/users';
    try {

      //const response = await fetch(`${URL}:3000/users?action=delete&userId=${userId}&user=${user}`);
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          userId: userId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (users)");
      this.arrayUsers = await response.json();
    } catch (error) {
      console.log("Error deleting users:", error);
    }
  }

  // validate User
  async validateUser(userId, password) {

    const URL = (this.serverStatus === 1) ? '/api/login' : 'http://localhost:3000/login';
    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: userId,
        password: password
      })
    });

    return response.ok;
  }

  // Show all selected users
  showSelectedUsers(className, style, userId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <td
      class="center one-line"
    >
      <select 
        class="${className} center"
        ${(enableChanges) ? '' : 'disabled'}
        ${(style) ? `style=${style}` : 'style="width:175px;"'}>`;

    // Check if user array is empty
    const numberOfRows = this.arrayUsers.length;
    if (numberOfRows > 0) {
      this.arrayUsers.forEach((user) => {
        html += `
          <option 
            value=${user.userId}
            ${(user.userId === userId) ? 'selected' : ''}
          >
            ${user.firstName}
          </option>`;
        if (user.userId === userId) selectedValue = true;
      });
    } else {

      html += `
      <option value="0" 
        selected
      >
        Ingen leilighet
      </option>`;
      selectedValue = true;
    }

    // Select all
    if (selectAll && (numberOfRows > 0)) {

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
    if (selectNone && (numberOfRows > 1)) {

      html +=
        `
          <option 
            value=0
          >
            ${selectNone}
          </option>
        `;

      //if (selectedValue) {
      html +=
        `
          <option 
            value=0
            ${(!selectedValue) ? 'selected' : ''}
          >
            ${selectNone}
          </option>`;
      if (!selectedValue) selectedValue = true;
      /*
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
      */
    }

    html +=
    `
        </select >
      </td>
    `;

    return html;
  }

  // Check for unique email
  checkUiqueEmail(email, object, style, message) {

    // Check if email exist in users table
    const rowNumberUser = this.arrayUsers.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
    if (rowNumberUser !== -1) {

      // email exist
      object.showMessage(object, style, message)
      return false;
    } else {

      // email does not exist for any user
      return true;
    }
  }
}
