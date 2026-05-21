const root = document.documentElement;
const pageNames = [...document.querySelectorAll("[data-page]")].map((page) => page.dataset.page);
const pageLinks = document.querySelectorAll("[data-page-link]");
const pages = document.querySelectorAll("[data-page]");
const toggle = document.querySelector(".theme-toggle");
const experienceItems = document.querySelectorAll(".experience-item");
const experiencePanels = document.querySelectorAll(".experience-panel");
const projectItems = document.querySelectorAll(".project-item");
const projectPanels = document.querySelectorAll(".project-panel");
const terminals = document.querySelectorAll("[data-terminal]");
const terminalPath = document.querySelector("[data-terminal-path]");
const globalTerminalInput = document.querySelector("[data-global-terminal] [data-terminal-input]");

const terminalPageLabels = {
  bio: "bio",
  experience: "exp",
  projects: "projects",
  contact: "contact",
};

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

  if (terminalPath) {
    terminalPath.textContent = `C:\\Users\\saketh\\portfolio\\${terminalPageLabels[targetPage]}`;
  }

  if (globalTerminalInput) {
    globalTerminalInput.placeholder =
      targetPage === "bio" ? "try help" : "bio, exp, projects, contact";
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

window.addEventListener("hashchange", () => {
  showPage(window.location.hash.replace("#", ""), false);
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

function appendTerminalLine(output, content, className = "") {
  if (!output) return;

  const terminal = output.closest("[data-terminal]");

  const line = document.createElement("p");
  if (className) line.className = className;
  line.innerHTML = content;
  output.append(line);
  output.scrollTop = output.scrollHeight;

  if (terminal?.hasAttribute("data-global-terminal") && className) {
    terminal.classList.add("is-expanded");
  }
}

function escapeTerminalText(text) {
  return text.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}

function runTerminalCommand(rawCommand, output) {
  const command = rawCommand.trim().toLowerCase();
  if (!command) return;

  const terminal = output?.closest("[data-terminal]");
  const isGlobalTerminal = terminal?.hasAttribute("data-global-terminal");

  if (isGlobalTerminal) {
    output.innerHTML = "";
    terminal.classList.remove("is-expanded");
  } else {
    appendTerminalLine(output, `<span class="prompt">$</span> ${escapeTerminalText(command)}`);
  }

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
    if (!isGlobalTerminal) {
      appendTerminalLine(output, `opened ${routes[command]}.`);
    }
    return;
  }

  if (command === "help") {
    if (isGlobalTerminal) {
      appendTerminalLine(output, `<span class="prompt">$</span> ${escapeTerminalText(command)}`, "terminal-help");
    }
    appendTerminalLine(output, "commands: bio, experience, projects, contact, resume, github, linkedin, email, now, clear", "terminal-help");
    return;
  }

  if (command === "now") {
    if (isGlobalTerminal) {
      appendTerminalLine(output, `<span class="prompt">$</span> ${escapeTerminalText(command)}`, "terminal-expand");
    }
    appendTerminalLine(output, "building: personal website + project writeups", "terminal-expand");
    appendTerminalLine(output, "learning: systems, robotics, and practical ai tooling", "terminal-expand");
    appendTerminalLine(output, "outside: gym, cooking, video games, hiking, reading", "terminal-expand");
    return;
  }

  if (command === "resume") {
    window.open("SakethKoradaResume.pdf", "_blank", "noopener,noreferrer");
    if (!isGlobalTerminal) {
      appendTerminalLine(output, "opening resume...");
    }
    return;
  }

  if (command === "github") {
    window.open("https://github.com/sakethkorada", "_blank", "noopener,noreferrer");
    if (!isGlobalTerminal) {
      appendTerminalLine(output, "opening github...");
    }
    return;
  }

  if (command === "linkedin") {
    window.open("https://www.linkedin.com/in/saketh-korada/", "_blank", "noopener,noreferrer");
    if (!isGlobalTerminal) {
      appendTerminalLine(output, "opening linkedin...");
    }
    return;
  }

  if (command === "email") {
    window.location.href = "mailto:skorada@ucsd.edu";
    if (!isGlobalTerminal) {
      appendTerminalLine(output, "opening mail client...");
    }
    return;
  }

  if (command === "clear") {
    output.innerHTML = "";
    terminal?.classList.remove("is-expanded");
    return;
  }

  appendTerminalLine(output, `command not found: ${escapeTerminalText(command)}. try help.`, "terminal-help");
}

terminals.forEach((terminal) => {
  const output = terminal.querySelector("[data-terminal-output]");
  const form = terminal.querySelector("[data-terminal-form]");
  const input = terminal.querySelector("[data-terminal-input]");
  const shortcuts = terminal.querySelectorAll("[data-command-shortcut]");

  const submitCommand = () => {
    runTerminalCommand(input.value, output);
    input.value = "";
  };

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    submitCommand();
  });

  input?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    submitCommand();
  });

  shortcuts.forEach((button) => {
    button.addEventListener("click", () => {
      runTerminalCommand(button.dataset.commandShortcut, output);
      input?.focus();
    });
  });
});

const storedTheme = storage.get("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialPage = window.location.hash.replace("#", "") || "bio";
applyTheme(storedTheme || (prefersDark ? "dark" : "light"));
showPage(initialPage);
