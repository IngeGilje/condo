// class for user
class Users extends Condos {

  // users information
  usersArray = Array;

  // Show all users
  showAllUsers(classValue, usersId) {

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

    let selectedOption =
      false;

    // Check if user array is empty
    const numberOfRows = userArray.length;
    if (numberOfRows > 0) {
      userArray.forEach((user) => {
        if (user.usersId >= 0) {
          if (user.usersId === usersId) {

            html += `
            <option 
              value="${user.usersId}"
              selected
              >
              ${user.usersId} - ${user.firstName}
            </option>
          `;
            selectedOption =
              true;
          } else {
            html += `
            <option 
              value="${user.usersId}">
              ${user.usersId} - ${user.firstName}
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
        Ingen brukere
      </option>
    `;
      selectedOption =
        true;
    }

    html += `
      </select >
    </form>
  `;

    document.querySelector(`.div-${classValue}`).innerHTML =
      html;
  }

  // Find selected user id
  getSelectedUserId(classValue) {

    let usersId = 0;

    // Check if HTML class exist
    if (isClassDefined(classValue)) {

      usersId =
        Number(document.querySelector(`.${classValue}`).value);
      usersId = (usersId === 0) ? userArray.at(-1).usersId : usersId;
    } else {

      // Get last id in last object in user array
      usersId = userArray.at(-1).usersId;
    }
    return usersId;
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
}