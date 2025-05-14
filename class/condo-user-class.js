// class for user
class User extends Condos {

  // user information
  userArray = Array;

  // Show all users
  showAllUsers(classValue, userId) {

    let html = `
      <form action="/submit" method="POST">
        <label class="label-${classValue}"
          for="user">
            Velg bruker
        </label>
        <select class="select-${classValue}" 
          id="user" name="user"
        >
    `;

    // Check if user array is empty
    const numberOfRows = userArray.length;
    if (numberOfRows > 1) {
      userArray.forEach((user) => {
        if (user.userId > 1) {
          if (user.userId === userId) {

            html += `
            <option 
              value="${user.userId}"
              selected
              >
              ${user.userId} - ${user.firstName}
            </option>
          `;
          } else {
            html += `
            <option 
              value="${user.userId}">
              ${user.userId} - ${user.firstName}
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

    let user = 0;

    // Check if HTML class exist
    if (isClassDefined(classValue)) {

      user =
        Number(document.querySelector(`.${classValue}`).value);
      user = (user === 0) ? userArray.at(-1).user : user;
    } else {

      // Get last id in last object in user array
      user = userArray.at(-1).userId;
    }
    return user;
  }
}

