
class Project extends Condos {

  // Project information
  arrayProjects = [];

  // show selected projects
  showSelectedProjects(className, style, projectId, selectNone, selectAll, enableChanges = false) {

    let selectedValue = false;

    let html = `
    <td
      class="one-line left"
    >
      <select 
        class="${className} center"
        ${(style) ? `style="${style}"` : ""}
        ${(enableChanges) ? '' : 'disabled'}
      >`;

    // Check if projects array is empty
    if (this.arrayProjects.length > 0) {
      this.arrayProjects.forEach((project) => {

        html += `
        <option 
          value=${project.projectId}
          ${(project.projectId === projectId) ? 'selected' : ''}
        >
          ${project.name}
        </option>`;
        if (project.projectId === projectId) selectedValue = true;
      });
    } else {

      html += `
      <option value="0" 
        selected
      >
        Velg Prosjekt
      </option>`;

      selectedValue = true;
    }

    // Select all
    if (selectAll && (this.arrayProjects.length > 0)) {

      html += `
      <option 
        value=${this.nineNine}
        ${(!selectedValue) ? 'selected' : ''}
      >
        ${selectAll}
      </option>`;
      if (!selectedValue) selectedValue = true;
    }

    // Select none
    if (selectNone && (this.arrayProjects.length > 0)) {
      html += `
      <option 
        value=0
        ${(!selectedValue) ? 'selected' : ''}
      >
        ${selectNone}
      </option>`;
      if (!selectedValue) selectedValue = true;
    }
    html += `
      </select >
    </td>`;

    return html;
  }

  // Find selected project id
  getSelectedProjectId(className) {

    let projectId = 0;

    // Check if HTML class exist
    if (isClassDefined(className)) {

      projectId = Number(document.querySelector(`.${className}`).value);
      projectId = (projectId === 0) ? this.arrayProjects.at(-1).projectId : projectId;
    } else {

      // Get last id in last object in project array
      projectId = (this.arrayProjects.length > 0) ? this.arrayProjects.at(-1).projectId : 0;
    }

    return projectId;
  }

  // Select project
  selectProjectId(projectId, className) {

    // Check if project id exist
    const objProjectNumber = this.arrayProjects.findIndex(project => project.projectId === projectId);
    if (objProjectNumber !== -1) {

      document.querySelector(`.select-${className}`).value = projectId;
      return true;
    } else {

      return false;
    }
  }

  // get projects
  async loadProjectsTable(condominiumId) {

    const URL = (this.serverStatus === 1)
      ? '/api/projects'
      : 'http://localhost:3000/projects';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'select',
          condominiumId: condominiumId
        })
      });
      if (!response.ok) throw new Error("Network error (projects)");
      this.arrayProjects = await response.json();
    } catch (error) {
      console.log("Error loading projects:", error);
    }
  }

  // update project row in projects table
  async updateProjectsTable(projectId, user,  name,accountId, amount) {

    const URL = (this.serverStatus === 1)
      ? '/api/projects'
      : 'http://localhost:3000/projects';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'update',
          projectId: projectId,
          user: user,
          name: name,
          accountId: accountId,
          amount: amount
        })
      });
      if (!response.ok) throw new Error("Network error (projects)");
      this.arrayProjects = await response.json();
    } catch (error) {
      console.log("Error updateing projects:", error);
    }
  }

  // insert project row in projects table
  async insertProjectsTable(condominiumId, user, name,accountId, amount) {

    const URL = (this.serverStatus === 1)
      ? '/api/projects'
      : 'http://localhost:3000/projects';
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
          name: name,
          accountId: accountId,
          amount: amount
        })
      });
      if (!response.ok) throw new Error("Network error (projects)");
      this.arrayProjects = await response.json();
    } catch (error) {
      console.log("Error inserting projects:", error);
    }
  }
  // delete project row
  async deleteProjectsTable(projectId, user) {

    const URL = (this.serverStatus === 1)
      ? '/api/projects'
      : 'http://localhost:3000/projects';
    try {

      // POST request
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: 'delete',
          projectId: projectId,
          user: user
        })
      });
      if (!response.ok) throw new Error("Network error (projects)");
      this.arrayProjects = await response.json();
    } catch (error) {
      console.log("Error deleting projects:", error);
    }
  }
}
