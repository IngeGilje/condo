// News maintenance 1.1

// Activate classes
const today = new Date();
const objUsers = new Users('users');
const objNews = new News('news');

const enableChanges = (objNews.securityLevel > 5);
const applicationName = "condo-shownews";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    if ((objNews.condominiumId === 0) || (objNews.user === null)) {

      // LogIn is not valid
      const URL = (objUsers.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show vertical menu
      let html = objNews.showMenu(objNews.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      // Load users and news tables
      const resident = 'Y';
      await objUsers.loadUsersTable(objNews.condominiumId, resident, objNews.nineNine);
      await objNews.loadNewsTable(objNews.condominiumId, objNews.nineNine);

      let newsId = 0;
      if (objNews.arrayNews.length > 0) newsId = objNews.arrayNews.at(-1)?.newsId ?? 0;

      // Show news
      showNews();

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
  }
}

// Events for news
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterNewsId')) {
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objNews.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

// Show news
function showNews() {

  let html = `
  <div 
    class="news-container"
  >
    <div
      class="news-card"
    >
  `;

  if (objNews.arrayNews.length > 0) {
    for (const news of objNews.arrayNews) {

      let date = news.date;
      date = formatNumberToNorDate(date);

      // user name
      const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === news.userId);
      /*
      const userName = (rowNumberUser !== -1)
        ? `${objUsers.arrayUsers[rowNumberUser].firstName} ${objUsers.arrayUsers[rowNumberUser].lastName}`
        : 'Ukjent';
      */
     const userName = objUsers.arrayUsers[rowNumberUser]?.userName ?? 'Ukjent';

      html += `
      <div 
        class="news-content"
      >
        <h1
          class="news-title"
        >
          ${news.title}
        </h1>
        <div
          class="news-meta"
        >
          ${date} • av ${userName}
        </div>
        <p 
          class="news-text"
        >
          ${news.content}
        </p>
      </div>`;

    }
    html += `
        </div>
      </div>`;

    document.querySelector('.showNews').innerHTML = html;
  }
}