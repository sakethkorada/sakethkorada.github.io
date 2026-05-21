const root = document.documentElement;
const pageNames = [...document.querySelectorAll("[data-page]")].map((page) => page.dataset.page);
const pageLinks = document.querySelectorAll("[data-page-link]");
const pages = document.querySelectorAll("[data-page]");
const toggle = document.querySelector(".theme-toggle");
const experienceItems = document.querySelectorAll(".experience-item");
const experiencePanels = document.querySelectorAll(".experience-panel");
const projectItems = document.querySelectorAll(".project-item");
const projectPanels = document.querySelectorAll(".project-panel");

const storage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      return null;
    }
  },
};

function showPage(pageName, updateHash = true) {
  const targetPage = pageNames.includes(pageName) ? pageName : "bio";

  pages.forEach((page) => {
    page.classList.toggle("is-active", page.dataset.page === targetPage);
  });

  pageLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.pageLink === targetPage);
  });

  if (updateHash) {
    history.replaceState(null, "", `#${targetPage}`);
  }
}

function applyTheme(theme) {
  root.classList.toggle("dark", theme === "dark");
  storage.set("theme", theme);
}

pageLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showPage(link.dataset.pageLink);
  });
});

const brandLink = document.querySelector("[data-brand-link]");
brandLink.addEventListener("click", (event) => {
  event.preventDefault();
  showPage("bio");
});

toggle.addEventListener("click", () => {
  const nextTheme = root.classList.contains("dark") ? "light" : "dark";
  applyTheme(nextTheme);
});

experienceItems.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.experience;

    experienceItems.forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });

    experiencePanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.experiencePanel === target);
    });
  });
});

projectItems.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.project;

    projectItems.forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });

    projectPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.projectPanel === target);
    });
  });
});

const storedTheme = storage.get("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialPage = window.location.hash.replace("#", "") || "bio";
applyTheme(storedTheme || (prefersDark ? "dark" : "light"));
showPage(initialPage);
