// class for user
class Users extends Condos {

  // users information
  usersArray = Array;

  // Show all users
  showAllUsers(classValue, userId) {

    if (userId === undefined) userId = 0;

    let html = `
      <form 
        id="user"
        action="/submit"
        method="POST"
      >
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
    if (userId === 0) userId = this.usersArray.at(-1).userId;

    // Check if user array is empty
    const numberOfRows = this.usersArray.length;
    if (numberOfRows > 0) {
      this.usersArray.forEach((user) => {
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
        </form>
      `;

    document.querySelector(`.div-${classValue}`).innerHTML = html;
  }

  // Find selected user id
  getSelectedUserId(classValue) {

    let userId = 0;

    // Check if HTML class exist
    if (isClassDefined(classValue)) {

      userId = Number(document.querySelector(`.${classValue}`).value);
      userId = (userId === 0) ? this.usersArray.at(-1).userId : userId;
    } else {

      // Get last id in last object in user array
      userId = this.usersArray.at(-1).userId;
    }
    return userId;
  }

  // get users
  async loadUsersTable(condominiumId) {

    // Get users
    try {
      const response = await fetch(`http://localhost:3000/users?action=select&condominiumId=${condominiumId}`);

      if (!response.ok) throw new Error("Network error (users)");
      this.usersArray = await response.json();
    } catch (error) {
      console.log("Error loading users:", error);
    }
  }


  // update user row in users table
  async updateUsersTable(user, lastUpdate, email, condoId, firstName, lastName, phone, securityLevel, password) {

    try {
      const response = await fetch(`http://localhost:3000/users?action=update&user=${user}&lastUpdate=${lastUpdate}&email=${email}&condoId=${condoId}&firstName=${firstName}&lastName=${lastName}&phone=${phone}&securityLevel=${securityLevel}&password=${password}`);
      if (!response.ok) throw new Error("Network error (users)");
      this.usersArray = await response.json();
    } catch (error) {
      console.log("Error updating users:", error);
    }
  }

  // insert user row in users table
  async insertUsersTable(condominiumId, user, lastUpdate, email, condoId, firstName, lastName, phone, securityLevel, password) {

    try {
      const response = await fetch(`http://localhost:3000/users?action=insert&condominiumId=${condominiumId}&user=${user}&lastUpdate=${lastUpdate}&email=${email}&condoId=${condoId}&firstName=${firstName}&lastName=${lastName}&phone=${phone}&securityLevel=${securityLevel}&password=${password}`);
      if (!response.ok) throw new Error("Network error (users)");
      this.usersArray = await response.json();
    } catch (error) {
      console.log("Error inserting users:", error);
    }
  }

  // delete user row
  async deleteUsersTable(userId, user, lastUpdate) {

    try {
      const response = await fetch(`http://localhost:3000/users?action=delete&userId=${userId}&user=${user}&lastUpdate=${lastUpdate}`);
      if (!response.ok) throw new Error("Network error (users)");
      this.usersArray = await response.json();
    } catch (error) {
      console.log("Error deleting users:", error);
    }
  }
}