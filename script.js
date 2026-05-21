const root = document.documentElement;
const pageNames = [...document.querySelectorAll("[data-page]")].map((page) => page.dataset.page);
const pageLinks = document.querySelectorAll("[data-page-link]");
const pages = document.querySelectorAll("[data-page]");
const toggle = document.querySelector(".theme-toggle");
const experienceItems = document.querySelectorAll(".experience-item");
const experiencePanels = document.querySelectorAll(".experience-panel");
const projectItems = document.querySelectorAll(".project-item");
const projectPanels = document.querySelectorAll(".project-panel");
const terminalOutput = document.querySelector("[data-terminal-output]");
const terminalForm = document.querySelector("[data-terminal-form]");
const terminalInput = document.querySelector("[data-terminal-input]");
const terminalShortcuts = document.querySelectorAll("[data-command-shortcut]");

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

function appendTerminalLine(content, className = "") {
  if (!terminalOutput) return;

  const line = document.createElement("p");
  if (className) line.className = className;
  line.innerHTML = content;
  terminalOutput.append(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function runTerminalCommand(rawCommand) {
  const command = rawCommand.trim().toLowerCase();
  if (!command) return;

  appendTerminalLine(`<span class="prompt">$</span> ${command}`);

  const routes = {
    bio: "bio",
    experience: "experience",
    exp: "experience",
    projects: "projects",
    proj: "projects",
    contact: "contact",
  };

  if (routes[command]) {
    showPage(routes[command]);
    appendTerminalLine(`opened ${routes[command]}.`);
    return;
  }

  if (command === "help") {
    appendTerminalLine("commands: bio, experience, projects, contact, resume, github, linkedin, email, now, clear");
    return;
  }

  if (command === "now") {
    appendTerminalLine("building: personal website + project writeups");
    appendTerminalLine("learning: systems, robotics, and practical ai tooling");
    appendTerminalLine("outside: gym, cooking, video games, hiking, reading");
    return;
  }

  if (command === "resume") {
    window.open("SakethKoradaResume.pdf", "_blank", "noopener,noreferrer");
    appendTerminalLine("opening resume...");
    return;
  }

  if (command === "github") {
    window.open("https://github.com/sakethkorada", "_blank", "noopener,noreferrer");
    appendTerminalLine("opening github...");
    return;
  }

  if (command === "linkedin") {
    window.open("https://www.linkedin.com/in/saketh-korada/", "_blank", "noopener,noreferrer");
    appendTerminalLine("opening linkedin...");
    return;
  }

  if (command === "email") {
    window.location.href = "mailto:skorada@ucsd.edu";
    appendTerminalLine("opening mail client...");
    return;
  }

  if (command === "clear") {
    terminalOutput.innerHTML = "";
    return;
  }

  appendTerminalLine(`command not found: ${command}. try help.`);
}

terminalForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  runTerminalCommand(terminalInput.value);
  terminalInput.value = "";
});

terminalShortcuts.forEach((button) => {
  button.addEventListener("click", () => {
    runTerminalCommand(button.dataset.commandShortcut);
    terminalInput?.focus();
  });
});

const storedTheme = storage.get("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialPage = window.location.hash.replace("#", "") || "bio";
applyTheme(storedTheme || (prefersDark ? "dark" : "light"));
showPage(initialPage);
