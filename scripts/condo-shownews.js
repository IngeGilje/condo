// News maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objNews = new News('news');
const objShowNews = new Shownews('shownews');

const enableChanges = (objShowNews.securityLevel > 5);
const tableWidth = 'width:600px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objShowNews.condominiumId === 0) || (objShowNews.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show horizonal menu
      let html = objShowNews.showHorizontalMenu();
      document.querySelector('.horizontalMenu').innerHTML = html;

      // Load users and news tables
      const resident = 'Y';
      await objUser.loadUsersTable(objShowNews.condominiumId, resident, objShowNews.nineNine);
      await objNews.loadNewsTable(objShowNews.condominiumId, objShowNews.nineNine);

      let newsId = 0;
      if (objNews.arrayNews.length > 0) newsId = objNews.arrayNews.at(-1).newsId;

      // Show news
      let menuNumber = 0;
      menuNumber = showNews(menuNumber);

      // Events
      events();
    }
  } else {

    objShowNews.showMessage(objShowNews, '', 'Server er ikke startet.');
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

      let url = (objShowNews.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

// Show news
function showNews(menuNumber) {

  if (objNews.arrayNews.length > 0) {

    for (const news of objNews.arrayNews) {

      let date = news.date;
      date = formatNumberToNorDate(date);
      const text = news.text;

      // user name
      const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === news.userId);
      const userName = (rowNumberUser !== -1)
        ? `${objUser.arrayUsers[rowNumberUser].firstName} ${objUser.arrayUsers[rowNumberUser].lastName}`
        : 'Ukjent';

      let html = `
      <div class="news-container">
        <div class="news-card">
          <div class="news-image">
            <img src="http://localhost/images/hinna-park.jpg" alt="News Image">
          </div>
          <div class="news-content">
            <h1 class="news-title">${news.title}</h1>
            <div class="news-meta">${date} • av ${userName}</div>
            <p class="news-text">
              ${news.content}
            </p>
          </div>
        </div>
      </div>
    `;

      document.querySelector('.news').innerHTML = html;
    }
  }
  return menuNumber;
}

// Show horizonal menu
function showHorizontalMenu(objShowNews) {

  html = `
  <nav class="navbar">
    <ul class="nav-links">
      <li><a href="#" class="active">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Services</a></li>
      <li><a href="#">Portfolio</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
  </nav>`;
}