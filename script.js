// Маленький сайт-открытка для Маши ♥
// Дата начала можно менять здесь — счётчики пересчитаются сами.
const START_DATE = new Date(2026, 6, 29); // 29 июля 2026 (месяцы с нуля)

const output = document.getElementById("terminalOutput");
const input = document.getElementById("terminalInput");
const form = document.getElementById("terminalForm");
const chips = document.getElementById("chips");
const secretText = document.getElementById("secretText");
const heartsLayer = document.getElementById("hearts");

/* ---------- Счётчики ---------- */
function plural(number, one, few, many) {
  const mod100 = number % 100;
  const mod10 = number % 10;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

function monthsSince(start, now) {
  let months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
  if (now.getDate() < start.getDate()) months -= 1;
  return Math.max(0, months);
}

function updateCounters() {
  const now = new Date();
  const days = Math.max(1, Math.floor((now - START_DATE) / 86400000));
  const months = monthsSince(START_DATE, now);

  document.getElementById("heroDays").textContent = days;
  document.getElementById("statDays").textContent = days;
  document.getElementById("statDaysLabel").textContent = plural(days, "день", "дня", "дней") + " вместе";
  document.getElementById("statMonths").textContent = months;
  document.getElementById("statMonthsLabel").textContent = plural(months, "месяц", "месяца", "месяцев") + " вместе";
  document.getElementById("year").textContent = now.getFullYear();
}

/* ---------- Обратный отсчёт до следующей вехи ---------- */
function addMonths(date, count) {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + count);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

function nextMilestone(now = new Date()) {
  const steps = [4, 5, 6, 9, 12, 18, 24, 36, 48, 60, 120];
  for (const months of steps) {
    const date = addMonths(START_DATE, months);
    if (date > now) return { months, date };
  }
  const yearsAhead = Math.floor((now.getFullYear() - START_DATE.getFullYear()) / 10) + 1;
  return { months: yearsAhead * 120, date: addMonths(START_DATE, yearsAhead * 120) };
}

function updateCountdown(now = new Date()) {
  const target = nextMilestone(now);
  const previous = addMonths(START_DATE, target.months - 1);
  const daysLeft = Math.max(0, Math.ceil((target.date - now) / 86400000));
  const progress = Math.max(0, Math.min(1, (now - previous) / (target.date - previous)));

  document.getElementById("countdownDays").textContent = daysLeft;
  document.getElementById("countdownLabel").textContent = plural(daysLeft, "день", "дня", "дней");
  const monthWord = target.months === 1 ? "месяца" : "месяцев";
  document.getElementById("countdownText").textContent =
    `до ${target.months} ${monthWord} вместе · ` +
    target.date.toLocaleDateString("ru-RU");
  document.getElementById("countdownProgress").style.width = `${(progress * 100).toFixed(1)}%`;
}

/* ---------- Счётчик обнимашек ---------- */
const HUG_KEY = "mashaHugs";
const hugCountEl = document.getElementById("hugCount");
const hugPhraseEl = document.getElementById("hugPhrase");
const hugButton = document.getElementById("hugButton");

function readHugs() {
  try {
    return Math.max(0, parseInt(localStorage.getItem(HUG_KEY), 10) || 0);
  } catch {
    return 0;
  }
}

function writeHugs(value) {
  try {
    localStorage.setItem(HUG_KEY, String(value));
  } catch {
    // если хранилище недоступно — просто продолжаем без сохранения
  }
}

function hugPhrase(count) {
  if (count === 0) return "Нажми, чтобы обнять Машу";
  if (count === 1) return "Первое объятие сохранено ♥ Можно ещё?";
  return `${count} ${plural(count, "объятие", "объятия", "объятий")}. Можно ещё? ♥`;
}

function renderHugs() {
  const count = readHugs();
  hugCountEl.textContent = count;
  hugPhraseEl.textContent = hugPhrase(count);
  hugButton.textContent = count === 0 ? "🤗 Обнять" : "🤗 Обнять ещё раз";
}

hugButton.addEventListener("click", () => {
  writeHugs(readHugs() + 1);
  renderHugs();
  spawnHearts(12);
});

/* ---------- Ночной режим ---------- */
const THEME_KEY = "mashaTheme";
const themeToggle = document.getElementById("themeToggle");
let themeMode;

try {
  themeMode = localStorage.getItem(THEME_KEY) || "auto";
} catch {
  themeMode = "auto";
}

function createStars() {
  const stars = document.getElementById("stars");
  for (let i = 0; i < 45; i += 1) {
    const star = document.createElement("span");
    const size = 1 + Math.random() * 2;
    star.className = "star";
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 4}s`;
    star.style.animationDuration = `${2.5 + Math.random() * 3}s`;
    stars.appendChild(star);
  }
}

function isNightByTime() {
  const hour = new Date().getHours();
  return hour >= 21 || hour < 6;
}

function applyTheme(mode) {
  const night = mode === "auto" ? isNightByTime() : mode === "dark";
  document.body.classList.toggle("night", night);
  themeToggle.textContent = night ? "☀️" : "🌙";
  themeToggle.setAttribute("aria-label", night ? "Включить дневной режим" : "Включить ночной режим");
}

themeToggle.addEventListener("click", () => {
  themeMode = document.body.classList.contains("night") ? "light" : "dark";
  try {
    localStorage.setItem(THEME_KEY, themeMode);
  } catch {
    // без сохранения — работает в рамках одной сессии
  }
  applyTheme(themeMode);
});

/* ---------- Сердечки ---------- */
function spawnHearts(count = 10) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < count; i += 1) {
    const heart = document.createElement("span");
    heart.className = "heart-float";
    heart.textContent = ["💗", "💕", "💖", "❤️", "💘"][i % 5];
    heart.style.left = `${6 + Math.random() * 88}%`;
    heart.style.animationDelay = `${Math.random() * 0.5}s`;
    heart.style.animationDuration = `${2.2 + Math.random() * 1.4}s`;
    heart.style.setProperty("--spin", `${Math.round(-60 + Math.random() * 120)}deg`);
    heartsLayer.appendChild(heart);
    heart.addEventListener("animationend", () => heart.remove());
  }
}

/* ---------- Терминал ---------- */
function addLine(text = "", className = "") {
  const line = document.createElement("div");
  line.className = `line ${className}`.trim();
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function addBlock(lines, className = "") {
  lines.forEach((line) => addLine(line, className));
}

function revealSecret() {
  secretText.hidden = false;
  spawnHearts(20);
  addBlock([
    "→ доступ разрешён ♥",
    "Маша, три месяца — только первый коммит.",
    "Хочу быть с тобой в каждой следующей версии.",
  ], "heart");
}

const commands = {
  help() {
    addBlock([
      "Доступные команды:",
      "  cat why.txt       — почему я тебя люблю",
      "  cat plans.md      — наши планы",
      "  ./hug.sh          — обнять",
      "  ./hug.sh --again  — обнять ещё раз",
      "  hug --count       — сколько раз уже обнялись",
      "  git log           — наши три месяца",
      "  date              — сколько дней мы вместе",
      "  surprise          — секрет 💗",
      "  clear             — очистить экран",
    ], "muted");
  },
  whoami() {
    addLine("Я — тот, кто влюблён в Машу. И я не против навсегда. ♥", "heart");
  },
  ls() {
    addBlock(["why.txt  plans.md  hugs/  our-song.mp3  forever/"], "muted");
  },
  "cat why.txt"() {
    addBlock([
      "1. ты умеешь делать обычный день особенным",
      "2. твой смех — мой любимый звук",
      "3. рядом с тобой хочется быть лучше",
      "4. ты терпишь мои шутки про код",
      "5. просто ты. И этого достаточно ♥",
    ]);
  },
  "cat plans.md"() {
    addBlock([
      "# Наши планы",
      "- [ ] ещё много свиданий",
      "- [ ] обнять столько раз, сколько дней вместе",
      "- [ ] посмотреть все серии, которые мы отложили",
      "- [ ] написать следующий коммит вместе",
    ]);
  },
  "./hug.sh"() {
    spawnHearts(14);
    addLine("🤗 Обнимаю! Если можно, ещё чуть-чуть подольше.", "heart");
  },
  "./hug.sh --again"() {
    spawnHearts(18);
    addLine("🤗✅ Повторный обнять выполнен. Лимит не ограничен.", "heart");
  },
  "hug --count"() {
    const count = readHugs();
    addLine(`🤗 Мы обнялись ${count} ${plural(count, "раз", "раза", "раз")}. Можно ещё? ♥`, "heart");
  },
  "git log"() {
    addBlock([
      "3f9a1c2  release: 3 месяца 🎉",
      "88b04de  fix: научился просто слушать",
      "5c17e9a  feat: первое свидание",
      "29jul26  feat: всё началось (authored by fate)",
    ]);
  },
  date() {
    const now = new Date();
    const days = Math.max(1, Math.floor((now - START_DATE) / 86400000));
    addLine(`${now.toLocaleString("ru-RU", { dateStyle: "long", timeStyle: "short" })} · день №${days} вместе ♥`, "heart");
  },
  surprise() {
    revealSecret();
  },
  clear() {
    output.replaceChildren();
  },
};

function runCommand(raw) {
  const value = raw.trim();
  if (!value) return;
  addLine(`маша@сердце:~$ ${value}`, "command");
  const handler = commands[value.toLowerCase()];
  if (handler) handler();
  else addLine("не знаю такую команду :( набери help", "error");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  runCommand(input.value);
  input.value = "";
  input.focus();
});

chips.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-command]");
  if (!button) return;
  runCommand(button.dataset.command);
  input.focus();
});

// История команд стрелками вверх/вниз
const history = [];
let historyIndex = -1;

input.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" && history.length) {
    event.preventDefault();
    historyIndex = historyIndex <= 0 ? history.length - 1 : historyIndex - 1;
    input.value = history[historyIndex];
  } else if (event.key === "ArrowDown" && history.length) {
    event.preventDefault();
    historyIndex = (historyIndex + 1) % history.length;
    input.value = history[historyIndex];
  } else if (event.key === "Enter" && input.value.trim()) {
    history.push(input.value.trim());
    historyIndex = history.length;
  }
});

document.getElementById("surpriseButton").addEventListener("click", revealSecret);

/* ---------- Старт ---------- */
updateCounters();
updateCountdown();
renderHugs();
createStars();
applyTheme(themeMode);

setInterval(() => {
  const now = new Date();
  updateCounters(now);
  updateCountdown(now);
  if (themeMode === "auto") applyTheme("auto");
}, 600000);

const initialMonths = monthsSince(START_DATE, new Date());
addBlock([
  "Привет, Маша! ♥",
  `Это маленький сайт про наши ${initialMonths} ${plural(initialMonths, "месяц", "месяца", "месяцев")} вместе.`,
  "Набери help, чтобы посмотреть, что здесь можно сделать.",
], "muted");

// Офлайн-кэш: после первой загрузки сайт открывается без интернета.
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

/* ---------- Галерея фотографий ---------- */
const photoButtons = Array.from(document.querySelectorAll(".photo-button"));
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");

const photos = photoButtons.map((button) => {
  const image = button.querySelector("img");
  const figure = button.closest(".polaroid");
  return {
    src: image.getAttribute("src"),
    alt: image.getAttribute("alt"),
    caption: figure.dataset.caption || figure.querySelector("figcaption").textContent,
  };
});

let currentPhoto = 0;

function showPhoto(index) {
  if (!photos.length) return;
  currentPhoto = (index + photos.length) % photos.length;
  lightboxImage.src = photos[currentPhoto].src;
  lightboxImage.alt = photos[currentPhoto].alt;
  lightboxCaption.textContent = photos[currentPhoto].caption;
}

function openPhoto(index) {
  showPhoto(index);
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  lightboxClose.focus();
}

function closePhoto() {
  lightbox.hidden = true;
  document.body.style.overflow = "";
}

photoButtons.forEach((button, index) => {
  button.addEventListener("click", () => openPhoto(index));
});

lightboxClose.addEventListener("click", closePhoto);
lightboxPrev.addEventListener("click", () => showPhoto(currentPhoto - 1));
lightboxNext.addEventListener("click", () => showPhoto(currentPhoto + 1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closePhoto();
});

document.addEventListener("keydown", (event) => {
  if (lightbox.hidden) return;
  if (event.key === "Escape") closePhoto();
  if (event.key === "ArrowLeft") showPhoto(currentPhoto - 1);
  if (event.key === "ArrowRight") showPhoto(currentPhoto + 1);
});
