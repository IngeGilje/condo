// class for user
class User extends Condos {

  // user information
  userArray = Array;

  // Show all users
  showAllUsers(classValue, userId) {

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

    // Check if user array is empty
    const numberOfRows = userArray.length;
    if (numberOfRows > 0) {
      userArray.forEach((user) => {
        if (user.userId >= 0) {
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

    let userId = 0;

    // Check if HTML class exist
    if (isClassDefined(classValue)) {

      userId =
        Number(document.querySelector(`.${classValue}`).value);
      userId = (userId === 0) ? userArray.at(-1).userId : userId;
    } else {

      // Get last id in last object in user array
      userId = userArray.at(-1).userId;
    }
    return userId;
  }
}