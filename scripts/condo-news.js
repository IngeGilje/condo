// News maintenance 1.1

// Activate classes
const today = new Date();
const objUsers = new Users('users');
const objNews = new News('news');

const enableChanges = (objNews.securityLevel > 5);
const applicationName = "condo-news";

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

      const resident = 'Y';
      await objUsers.loadUsersTable(objNews.condominiumId, resident, objNews.nineNine);
      await objNews.loadNewsTable(objNews.condominiumId, objNews.nineNine);

      let newsId = 0;
      if (objNews.arrayNews.length > 0) newsId = objNews.arrayNews[0].newsId;

      // Show filter
      showFilter(newsId);

      // Show news
      showNews(newsId);

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

      const newsId = Number(document.querySelector('.filterNewsId').value);
      showNews(newsId);
    };
  });

  // update/insert a news row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Update a news row
      const newsId = document.querySelector('.filterNewsId').value;
      updateNewsRow(newsId);
    };
  });

  // Delete news row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      let newsId = Number(document.querySelector('.filterNewsId').value);
      await deleteNewsRow(newsId);
    };
  });

  // insert a new news row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      // Insert new news row
      resetValues();
    };
  });

  /*
  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload news table
      await objNews.loadNewsTable(objNews.condominiumId, objNews.nineNine);

      let newsId = Number(document.querySelector('.filterNewsId').value);
      if (newsId === 0) newsId = objNews.arrayNews[0].newsId;

      // Show filter
      showFilter(newsId);

      // show news
      showNews(newsId);
    };
  });
  */

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

// Show filter
function showFilter(newsId) {

  // Start filter
  let html = startGridFilter("Nyheter");

  // Show news
  html += objNews.showSelectedNewsNew('filterNewsId', newsId, '', '', enableChanges);

  // End filter
  html += endGridFilter();
  document.querySelector(".showFilter").innerHTML = html;
}

// Show news
function showNews(newsId) {

  // row number news array
  const rowNumberNews = objNews.arrayNews.findIndex(news => news.newsId === newsId);

  let html = startGrid('Nyheter');

  // news date
  let newsDate = objNews.arrayNews[rowNumberNews]?.date ?? 0;
  newsDate = formatNumberToISODate(newsDate);
  html += inputDate('newsDate', 'Dato', newsDate, enableChanges);
  html += "<div></div>";
  //html += "<div></div>";

  // userId
  const userId = objNews.arrayNews[rowNumberNews]?.userId ?? 0;
  html += objUsers.showSelectedUsersNew('userId', 'Forfatter', userId, '', '', true);
  html += "<div></div>";
  //html += "<div></div>";

  // title
  const title = objNews.arrayNews[rowNumberNews]?.title ?? '';
  html += inputGridWideText('title', "Tittel", title, 45, 1);
  //html += "<div></div>";

  // content
  const content = objNews.arrayNews[rowNumberNews]?.content ?? '';
  html += inputGridWideText('content', "Innhold", content, 250, 10);

  html += endGrid();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update secondary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");
    //html += inputButton("cancel secondary", "Angre", "reset");
    html += inputButton("delete danger", "Slett", "button");

    // End buttons
    html += endButtons();
  }

  document.querySelector('.showNews').innerHTML = html;
}

// Update a news row
async function updateNewsRow(newsId) {

  if (newsId === '') newsId = -1
  newsId = Number(newsId);
  const validNewsId = validateIntervalNew('newsId', 'Ugyldig Leilighet',  newsId, 0, objNews.nineNine);

  // validate title
  const title = document.querySelector('.title').value.trim();
  const validTitle = validateTextNew('title', 'Ugyldig Tittel',  title, 3, 45);

  // validate date
  let date = document.querySelector('.newsDate').value;
  date = Number(objNews.formatDateToNumber(date));
  const validDate = validateIntervalNew('date', 'Ugyldig Dato', date, 20200101, 20291231);

  // validate userId  
  const userId = Number(document.querySelector('.userId').value);
  const validUserId = validateIntervalNew('userId', 'Ugyldig forfatter', userId, 1, objNews.nineNine);

  // clean content
  let content = document.querySelector('.content').value.trim();
  //content = content.replace(/<[^>]*>?/gm, "");
  const validContent = validateTextNew('content', 'Ugyldig innhold',  content, 3, 512);

  if (validTitle && validDate && validUserId && validContent) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the news row exist
    const rowNumberNews = objNews.arrayNews.findIndex(news => news.newsId === newsId);
    if (rowNumberNews !== -1) {

      // update the news row
      await objNews.updateNewsTable(newsId, objNews.user, date, userId, title, content, '');
    } else {

      // Insert a news row
      await objNews.insertNewsTable(objNews.condominiumId, objNews.user, date, userId, title, content, '');
      await objNews.getHighestNewsId(objNews.condominiumId);
      newsId = objNews.arrayNews.at(-1)?.newsId ?? 0;
    }

    await objNews.loadNewsTable(objNews.condominiumId, objNews.nineNine);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
    }

    // Show filter
    showFilter(newsId);

    // Show news
    showNews(newsId);
  }
}

// Reset all values for news
function resetValues() {

  document.querySelector('.filterNewsId').value = '';

  // news date
  const newsDate = getCurrentISODate();
  document.querySelector('.newsDate').value = newsDate;

  // title
  document.querySelector('.title').value = '';

  //  content
  document.querySelector('.content').value = '';

  // userId
  document.querySelector('.userId').value = '';

  document.querySelector('.filterNewsId').disabled = true;

  // Buttons
  if (enableChanges) {

    disableButton('delete', true);
  }
}

// Delete a news row
async function deleteNewsRow(newsId) {

  // Check if news row exist
  newsRowNumber = objNews.arrayNews.findIndex(news => news.newsId === newsId);
  if (newsRowNumber !== -1) {

    // delete news row
    await objNews.deleteNewsTable(newsId, objNews.user);
    await objNews.getHighestNewsId(objNews.condominiumId);

    //newsId = objNews.arrayNews[0].newsId;
    // Check for empty array
    if (Array.isArray(objNews.arrayNews) && objNews.arrayNews.length === 0) {

      // Empty array
      newsId = 0;
    } else {

      newsId = objNews.arrayNews[0].newsId;
    }
  }

  await objNews.loadNewsTable(objNews.condominiumId);

  // Show filter
  showFilter(newsId);

  // Show news
  showNews(newsId);
}
