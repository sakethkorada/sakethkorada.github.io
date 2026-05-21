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

let activeGame = null;

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

function stopActiveGame() {
  if (!activeGame) return;
  activeGame.stop();
  activeGame = null;
}

function prepareTerminalOutput(output, terminal, command) {
  stopActiveGame();

  if (terminal?.hasAttribute("data-global-terminal")) {
    output.innerHTML = "";
    terminal.classList.remove("is-expanded", "is-game");
  }

  appendTerminalLine(output, `<span class="prompt">$</span> ${escapeTerminalText(command)}`, "terminal-help");
}

function createGameShell(output, title, helpText) {
  const terminal = output.closest("[data-terminal]");
  terminal?.classList.add("is-expanded", "is-game");

  const shell = document.createElement("div");
  shell.className = "terminal-game";
  shell.innerHTML = `
    <p><b>${title}</b> ${helpText}</p>
    <pre class="terminal-game-screen" tabindex="0" aria-label="${title} game"></pre>
    <p data-game-status>score: 0</p>
  `;
  output.append(shell);
  output.scrollTop = output.scrollHeight;

  const screen = shell.querySelector(".terminal-game-screen");
  const status = shell.querySelector("[data-game-status]");
  window.setTimeout(() => screen.focus({ preventScroll: true }), 80);

  return { screen, status };
}

function setGameScreen(screen, lines) {
  screen.textContent = lines.join("\n");
}

function isTypingInTerminal(event) {
  return event.target?.matches("[data-terminal-input]") && event.key.length === 1;
}

function startSnake(output) {
  const { screen, status } = createGameShell(output, "snake", "use arrows/wasd. eat dots, avoid yourself.");
  const cols = 38;
  const rows = 12;
  let snake = [
    { x: 9, y: 7 },
    { x: 8, y: 7 },
    { x: 7, y: 7 },
  ];
  let dir = { x: 1, y: 0 };
  let nextDir = dir;
  let food = { x: 24, y: 7 };
  let score = 0;
  let done = false;

  function placeFood() {
    do {
      food = {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
      };
    } while (snake.some((part) => part.x === food.x && part.y === food.y));
  }

  function draw() {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(" "));
    grid[food.y][food.x] = "*";
    snake.forEach((part, index) => {
      grid[part.y][part.x] = index === 0 ? "@" : "o";
    });
    const border = `+${"-".repeat(cols)}+`;
    setGameScreen(screen, [
      "snake",
      border,
      ...grid.map((row) => `|${row.join("")}|`),
      border,
    ]);

    status.textContent = done ? `game over. score: ${score}. run snake to retry.` : `score: ${score}`;
  }

  function tick() {
    if (done) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    const hitWall = head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows;
    const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);
    if (hitWall || hitSelf) {
      done = true;
      draw();
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 1;
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function onKey(event) {
    if (isTypingInTerminal(event)) return;

    const keys = {
      ArrowUp: { x: 0, y: -1 },
      w: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      s: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      a: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      d: { x: 1, y: 0 },
    };
    const move = keys[event.key];
    if (!move) return;
    event.preventDefault();
    if (move.x + dir.x !== 0 || move.y + dir.y !== 0) {
      nextDir = move;
    }
  }

  window.addEventListener("keydown", onKey);
  const timer = window.setInterval(tick, 130);
  activeGame = {
    stop() {
      window.clearInterval(timer);
      window.removeEventListener("keydown", onKey);
    },
  };
  draw();
}

function startDino(output) {
  const { screen, status } = createGameShell(output, "dino", "press space/w/up to jump.");
  const cols = 58;
  const rows = 11;
  const ground = 7;
  const dinoSprite = ["  ## ", "#### ", " ## #", " ##  "];
  let y = ground;
  let velocity = 0;
  let obstacleX = cols + 8;
  let score = 0;
  let done = false;

  function jump() {
    if (done || y < ground) return;
    velocity = -2.5;
  }

  function draw() {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(" "));
    grid[ground + 4] = Array(cols).fill("_");

    const dinoX = 5;
    const dinoY = Math.round(y);
    dinoSprite.forEach((line, row) => {
      [...line].forEach((char, col) => {
        if (char !== " " && grid[dinoY + row]?.[dinoX + col] !== undefined) {
          grid[dinoY + row][dinoX + col] = char;
        }
      });
    });

    const cactus = [" # ", "###", " # ", " # "];
    cactus.forEach((line, row) => {
      [...line].forEach((char, col) => {
        const x = Math.round(obstacleX) + col;
        const yPos = ground + row;
        if (char !== " " && grid[yPos]?.[x] !== undefined) {
          grid[yPos][x] = char;
        }
      });
    });

    setGameScreen(screen, ["dino", ...grid.map((row) => row.join(""))]);

    status.textContent = done ? `bonked. score: ${score}. run dino to retry.` : `score: ${score}`;
  }

  function tick() {
    if (done) return;
    velocity += 0.22;
    y = Math.min(ground, y + velocity);
    obstacleX -= 1.25;
    if (obstacleX < -5) {
      obstacleX = cols + Math.random() * 16;
      score += 1;
    }

    const hitX = obstacleX < 10 && obstacleX + 3 > 5;
    const hitY = Math.round(y) + dinoSprite.length > ground;
    if (hitX && hitY) done = true;
    draw();
  }

  function onKey(event) {
    if (isTypingInTerminal(event)) return;

    if (![" ", "ArrowUp", "w"].includes(event.key)) return;
    event.preventDefault();
    jump();
  }

  window.addEventListener("keydown", onKey);
  const timer = window.setInterval(tick, 34);
  activeGame = {
    stop() {
      window.clearInterval(timer);
      window.removeEventListener("keydown", onKey);
    },
  };
  draw();
}

function startPacman(output) {
  const { screen, status } = createGameShell(output, "pacman", "use arrows/wasd. clear dots, dodge the ghost.");
  const cols = 25;
  const rows = 9;
  const walls = new Set(["6,2", "6,3", "6,4", "12,1", "12,2", "12,6", "12,7", "18,4", "19,4"]);
  let player = { x: 2, y: 4 };
  let dir = { x: 1, y: 0 };
  let ghost = { x: 21, y: 4 };
  let dots = new Set();
  let score = 0;
  let done = false;

  for (let y = 1; y < rows - 1; y += 1) {
    for (let x = 1; x < cols - 1; x += 1) {
      if (!walls.has(`${x},${y}`) && !(x === player.x && y === player.y)) dots.add(`${x},${y}`);
    }
  }

  function canMove(pos) {
    return pos.x > 0 && pos.x < cols - 1 && pos.y > 0 && pos.y < rows - 1 && !walls.has(`${pos.x},${pos.y}`);
  }

  function draw() {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(" "));
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1 || walls.has(`${x},${y}`)) {
          grid[y][x] = "#";
        }
      }
    }

    dots.forEach((dot) => {
      const [x, y] = dot.split(",").map(Number);
      grid[y][x] = ".";
    });

    grid[player.y][player.x] = "C";
    grid[ghost.y][ghost.x] = "G";
    setGameScreen(screen, ["pacman", ...grid.map((row) => row.join(""))]);

    if (done) {
      status.textContent = dots.size ? `caught. score: ${score}. run pacman to retry.` : `cleared. score: ${score}.`;
    } else {
      status.textContent = `score: ${score} / ${score + dots.size}`;
    }
  }

  function tick() {
    if (done) return;
    const next = { x: player.x + dir.x, y: player.y + dir.y };
    if (canMove(next)) player = next;
    if (dots.delete(`${player.x},${player.y}`)) score += 1;

    const ghostMoves = [
      { x: ghost.x + 1, y: ghost.y },
      { x: ghost.x - 1, y: ghost.y },
      { x: ghost.x, y: ghost.y + 1 },
      { x: ghost.x, y: ghost.y - 1 },
    ].filter(canMove);
    ghost = ghostMoves.reduce((best, move) => {
      const bestDistance = Math.abs(best.x - player.x) + Math.abs(best.y - player.y);
      const moveDistance = Math.abs(move.x - player.x) + Math.abs(move.y - player.y);
      return moveDistance < bestDistance ? move : best;
    }, ghost);

    if (player.x === ghost.x && player.y === ghost.y) done = true;
    if (!dots.size) done = true;
    draw();
  }

  function onKey(event) {
    if (isTypingInTerminal(event)) return;

    const keys = {
      ArrowUp: { x: 0, y: -1 },
      w: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      s: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      a: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      d: { x: 1, y: 0 },
    };
    if (!keys[event.key]) return;
    event.preventDefault();
    dir = keys[event.key];
  }

  window.addEventListener("keydown", onKey);
  const timer = window.setInterval(tick, 165);
  activeGame = {
    stop() {
      window.clearInterval(timer);
      window.removeEventListener("keydown", onKey);
    },
  };
  draw();
}

function runTerminalCommand(rawCommand, output) {
  const command = rawCommand.trim().toLowerCase();
  if (!command) return;

  const terminal = output?.closest("[data-terminal]");
  const isGlobalTerminal = terminal?.hasAttribute("data-global-terminal");

  if (isGlobalTerminal) {
    stopActiveGame();
    output.innerHTML = "";
    terminal.classList.remove("is-expanded", "is-game");
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

  const games = {
    snake: startSnake,
    dino: startDino,
    pacman: startPacman,
    "pac-man": startPacman,
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
    appendTerminalLine(output, "commands: bio, experience, projects, contact, resume, github, linkedin, email, now, games, clear", "terminal-help");
    appendTerminalLine(output, "games: snake, dino, pacman", "terminal-help");
    return;
  }

  if (command === "games") {
    if (isGlobalTerminal) {
      appendTerminalLine(output, `<span class="prompt">$</span> ${escapeTerminalText(command)}`, "terminal-help");
    }
    appendTerminalLine(output, "available games: snake, dino, pacman", "terminal-help");
    appendTerminalLine(output, "tip: games focus themselves. click the game screen if wasd/space does not respond.", "terminal-help");
    return;
  }

  if (games[command]) {
    prepareTerminalOutput(output, terminal, command);
    games[command](output);
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
    stopActiveGame();
    output.innerHTML = "";
    terminal?.classList.remove("is-expanded", "is-game");
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
