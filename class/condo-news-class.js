
class News extends Condos {

  // News 
  arrayNews;

  // Find selected news id
  getSelectedNewsId(className) {

    let newsId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      newsId = Number(document.querySelector(`.${className}`).value);
      newsId = (newsId === 0) ? this.arrayNews.at(-1).newsId : newsId;
    } else {

      // Get last id in last object in news array
      newsId = this.arrayNews.at(-1).newsId;
    }

    return newsId;
  }

  getNewsTitle(newsId) {

    let newsTitle;
    const rowNumberNews = this.arrayNews.findIndex(news => news.newsId === newsId);
    if (rowNumberNews !== -1) {
      newsTitle = this.arrayNews[rowNumberNews].title;
    } else {
      newsTitle = "";
    }
    return newsTitle;
  }

  // Select news Id
  selectNewsId(newsId, className) {

    // Check if news id exist
    const rowNumberNews = this.arrayNews.findIndex(news => news.newsId === newsId);
    if (rowNumberNews !== -1) {

      document.querySelector(`.select-${className}`).value =
        newsId;
      return true;
    } else {

      return false;
    }
  }

  showSelectedNews(className, style, newsId, selectNone, selectAll, enableChanges) {

    let selectedValue = false;

    let html = `
    <td
      class="centerCell one-line center"
    >
      <select 
        class="${className} center"
        ${(enableChanges) ? '' : 'disabled'}
        ${(style) ? `style="${style}"` : 'style="width:175px;"'}
      >`;

    // Check if News array is empty
    if (this.arrayNews.length > 0) {
      this.arrayNews.forEach((news) => {

        html += `
        <option 
          value=${news.newsId}
          ${(news.newsId === newsId) ? 'selected' : ''}
        >
          ${news.title}
        </option>`;
        if (news.newsId === newsId) selectedValue = true;
      });
    } else {

      html += `
      <option value="0" 
        selected
      >
        Ingen nyheter
      </option>`;
      selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayNews.length > 0)) {

      html += `
      <option 
        value=${this.nineNine}
        ${(selectedValue) ? '' : 'selected'} 
      >
        ${selectAll}
      </option>`;
      selectedValue = true;
    }

    // Select none
    if (selectNone && (this.arrayNews.length > 0)) {
      html += `
      <option 
        value=0
        ${(selectedValue) ? selectNone : ''}
        ${(newsId === 0) ? 'selected' : ''}
      >
        ${selectNone}
      </option>`;
      selectedValue = true;
    }

    html += `
      </select >
    </td>`;

    return html;
  }

  // get News
  async loadNewsTable(condominiumId, newsId) {

    // Get News
    const URL = (this.serverStatus === 1)
      ? '/api/news'
      : 'http://localhost:3000/news';
    try {
      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'select',
          condominiumId: condominiumId,
          newsId: newsId
        })
      });
      if (!response.ok) throw new Error("Network error (news)");
      this.arrayNews = await response.json();
    } catch (error) {
      console.log("Error loading News:", error);
    }
  }

  // update news row in news table
  async updateNewsTable(newsId, user, date, userId, title, content, image) {

    const URL = (this.serverStatus === 1)
      ? '/api/news'
      : 'http://localhost:3000/news';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          newsId: newsId,
          user: user,
          date: date,
          userId: userId,
          title: title,
          content: content,
          image: image
        })
      });
      if (!response.ok) throw new Error("Network error (news)");
      this.arrayNews = await response.json();
    } catch (error) {
      console.log("Error updating news:", error);
    }
  }

  // insert news row in news table
  async insertNewsTable(condominiumId, user, date, userId, title, content, image) {
    const URL = (this.serverStatus === 1)
      ? '/api/news'
      : 'http://localhost:3000/news';
    try {
      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'insert',
          condominiumId: condominiumId,
          user: user,
          date: date,
          userId: userId,
          title: title,
          content: content,
          image: image
        })
      });
      if (!response.ok) throw new Error("Network error (news)");
      this.arrayNews = await response.json();
    } catch (error) {
      console.log("Error inserting news:", error);
    }
  }

  // delete news row
  async deleteNewsTable(newsId, user) {

    const URL = (this.serverStatus === 1) 
    ? '/api/news' 
    : 'http://localhost:3000/news';
    try {
      // POST request
       const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          newsId: newsId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (news)");
      this.arrayNews = await response.json();
    } catch (error) {
      console.log("Error deleting news:", error);
    }
  }
}