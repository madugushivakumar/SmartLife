"use strict";

/* =========================================
   ADVANCED PRODUCTIVITY DASHBOARD PRO
========================================= */

/* =========================================
   GLOBAL APP STATE
========================================= */
const AppState = {
  tasks: JSON.parse(localStorage.getItem("tasks")) || [],
  finance: JSON.parse(localStorage.getItem("finance")) || [],
  focus: JSON.parse(localStorage.getItem("focus")) || [],
  darkMode: JSON.parse(localStorage.getItem("darkMode")) || false,
  productivityScore: 0,
  streak: 0
};

let currentFilter = "all";
let currentView = "list";
let currentDate = new Date();
let draggedTask = null;

/* =========================================
   DOM ELEMENTS
========================================= */
const body = document.body;
const taskList = document.getElementById("taskList");
const calendarView = document.getElementById("calendarView");
const statsContainer = document.getElementById("statsContainer");
const searchInput = document.getElementById("searchTask");
const darkModeBtn = document.getElementById("darkModeBtn");

const addBtn = document.getElementById("addBtn");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("taskPriority");
const dateInput = document.getElementById("taskDate");

const monthYear = document.getElementById("monthYear");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

/* =========================================
   TASK CREATION
========================================= */
addBtn?.addEventListener("click", createTask);

function createTask() {

  const title = taskInput.value.trim();
  const priority = priorityInput.value;
  const dueDate = dateInput.value;

  if (!title) {
    showToast("Please enter task");
    return;
  }

  const task = {
    id: Date.now(),
    title,
    priority,
    dueDate,
    completed: false,
    progress: 0,
    tags: [],
    category: "General",
    createdAt: new Date().toISOString()
  };

  AppState.tasks.push(task);

  taskInput.value = "";
  dateInput.value = "";

  saveAll();
  renderTasks();
  renderCalendar();
  updateStats();

  showToast("Task Added ✅");

  notifyIfNeeded(task);
}

/* =========================================
   RENDER TASKS
========================================= */
function renderTasks(search = "") {

  if (!taskList) return;

  taskList.innerHTML = "";

  let tasks = [...AppState.tasks];

  if (currentFilter === "completed") {
    tasks = tasks.filter(t => t.completed);
  }

  if (currentFilter === "pending") {
    tasks = tasks.filter(t => !t.completed);
  }

  if (search) {
    tasks = tasks.filter(task =>
      task.title.toLowerCase()
      .includes(search.toLowerCase())
    );
  }

  tasks.sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (!tasks.length) {
    taskList.innerHTML = `
      <div class="empty">
        No Tasks Found 😴
      </div>
    `;
    return;
  }

  tasks.forEach(task => {

    const priorityClass =
      task.priority.toLowerCase();

    taskList.innerHTML += `
      <div class="task-card ${task.completed ? "done" : ""}"
           draggable="true"
           ondragstart="dragStart(${task.id})"
           ondragover="dragOver(event)"
           ondrop="dropTask(${task.id})">

        <div class="task-top">

          <input type="checkbox"
                 ${task.completed ? "checked" : ""}
                 onchange="toggleTask(${task.id})">

          <div class="task-content">

            <h3>${task.title}</h3>

            <span class="priority ${priorityClass}">
              ${task.priority}
            </span>

            <small>📅 ${task.dueDate || "No Date"}</small>

          </div>

        </div>

        <div class="progress-wrapper">
          <div class="progress-bar"
               style="width:${task.progress}%">
          </div>
        </div>

        <div class="task-actions">

          <button onclick="increaseProgress(${task.id})">
            📈
          </button>

          <button onclick="editTask(${task.id})">
            ✏️
          </button>

          <button onclick="deleteTask(${task.id})">
            🗑️
          </button>

        </div>

      </div>
    `;
  });
}

/* =========================================
   TASK ACTIONS
========================================= */
function toggleTask(id) {

  const task =
    AppState.tasks.find(t => t.id === id);

  task.completed = !task.completed;

  if (task.completed) {
    AppState.productivityScore += 10;
  }

  saveAll();
  renderTasks();
  renderCalendar();
  updateStats();

  showToast("Task Updated 🚀");
}

function deleteTask(id) {

  AppState.tasks =
    AppState.tasks.filter(t => t.id !== id);

  saveAll();
  renderTasks();
  renderCalendar();
  updateStats();

  showToast("Task Deleted 🗑️");
}

function editTask(id) {

  const task =
    AppState.tasks.find(t => t.id === id);

  const newTitle =
    prompt("Edit Task", task.title);

  if (!newTitle) return;

  task.title = newTitle;

  saveAll();
  renderTasks();

  showToast("Task Edited ✏️");
}

function increaseProgress(id) {

  const task =
    AppState.tasks.find(t => t.id === id);

  task.progress += 10;

  if (task.progress > 100) {
    task.progress = 100;
  }

  saveAll();
  renderTasks();

  showToast("Progress Updated 📈");
}

/* =========================================
   DRAG & DROP
========================================= */
function dragStart(id) {
  draggedTask = id;
}

function dragOver(e) {
  e.preventDefault();
}

function dropTask(id) {

  const draggedIndex =
    AppState.tasks.findIndex(t => t.id === draggedTask);

  const targetIndex =
    AppState.tasks.findIndex(t => t.id === id);

  const draggedItem =
    AppState.tasks.splice(draggedIndex, 1)[0];

  AppState.tasks.splice(targetIndex, 0, draggedItem);

  saveAll();
  renderTasks();

  showToast("Tasks Reordered 🔄");
}

/* =========================================
   SEARCH
========================================= */
searchInput?.addEventListener("input", e => {
  renderTasks(e.target.value);
});

/* =========================================
   CALENDAR
========================================= */
function renderCalendar() {

  if (!calendarView) return;

  calendarView.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days =
    new Date(year, month + 1, 0).getDate();

  const firstDay =
    new Date(year, month, 1).getDay();

  const monthNames = [
    "January","February","March","April",
    "May","June","July","August",
    "September","October","November","December"
  ];

  monthYear.innerText =
    `${monthNames[month]} ${year}`;

  for (let i = 0; i < firstDay; i++) {
    calendarView.innerHTML +=
      `<div class="empty-box"></div>`;
  }

  for (let d = 1; d <= days; d++) {

    const tasks =
      AppState.tasks.filter(task => {

        if (!task.dueDate) return false;

        const taskDate = new Date(task.dueDate);

        return (
          taskDate.getDate() === d &&
          taskDate.getMonth() === month &&
          taskDate.getFullYear() === year
        );
      });

    calendarView.innerHTML += `
      <div class="day-box">

        <div class="day-number">${d}</div>

        ${tasks.map(task => `
          <div class="calendar-task ${task.priority.toLowerCase()}">
            ${task.title}
          </div>
        `).join("")}

      </div>
    `;
  }
}

/* =========================================
   MONTH NAVIGATION
========================================= */
prevMonth?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonth?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

/* =========================================
   STATS & ANALYTICS
========================================= */
function updateStats() {

  const total = AppState.tasks.length;

  const completed =
    AppState.tasks.filter(t => t.completed).length;

  const pending = total - completed;

  const productivity =
    total === 0 ? 0 :
    Math.round((completed / total) * 100);

  AppState.productivityScore = productivity;

  statsContainer.innerHTML = `
    <div class="stat-card">
      <h2>${total}</h2>
      <p>Total Tasks</p>
    </div>

    <div class="stat-card">
      <h2>${completed}</h2>
      <p>Completed</p>
    </div>

    <div class="stat-card">
      <h2>${pending}</h2>
      <p>Pending</p>
    </div>

    <div class="stat-card">
      <h2>${productivity}%</h2>
      <p>Productivity</p>
    </div>
  `;
}

/* =========================================
   DARK MODE
========================================= */
darkModeBtn?.addEventListener("click", () => {

  AppState.darkMode = !AppState.darkMode;

  body.classList.toggle("dark");

  localStorage.setItem(
    "darkMode",
    JSON.stringify(AppState.darkMode)
  );
});

function loadDarkMode() {

  if (AppState.darkMode) {
    body.classList.add("dark");
  }
}

/* =========================================
   POMODORO TIMER
========================================= */
let pomodoroTime = 25 * 60;
let pomodoroInterval = null;

function startPomodoro() {

  clearInterval(pomodoroInterval);

  pomodoroInterval = setInterval(() => {

    pomodoroTime--;

    const minutes =
      Math.floor(pomodoroTime / 60);

    const seconds =
      pomodoroTime % 60;

    console.log(
      `${minutes}:${seconds}`
    );

    if (pomodoroTime <= 0) {

      clearInterval(pomodoroInterval);

      showToast("Pomodoro Complete 🍅");

      pomodoroTime = 25 * 60;
    }

  }, 1000);
}

/* =========================================
   NOTIFICATIONS
========================================= */
function notifyIfNeeded(task) {

  if (!("Notification" in window)) return;

  Notification.requestPermission()
    .then(permission => {

      if (permission === "granted") {

        new Notification(
          "Task Created",
          {
            body: task.title
          }
        );
      }
    });
}

/* =========================================
   EXPORT / IMPORT
========================================= */
function exportTasks() {

  const data =
    JSON.stringify(AppState.tasks);

  const blob =
    new Blob([data], {
      type: "application/json"
    });

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;
  a.download = "tasks.json";
  a.click();

  showToast("Tasks Exported 📦");
}

function importTasks(event) {

  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = e => {

    AppState.tasks =
      JSON.parse(e.target.result);

    saveAll();
    renderTasks();
    renderCalendar();
    updateStats();

    showToast("Tasks Imported ✅");
  };

  reader.readAsText(file);
}

/* =========================================
   LOCAL STORAGE
========================================= */
function saveAll() {

  localStorage.setItem(
    "tasks",
    JSON.stringify(AppState.tasks)
  );

  localStorage.setItem(
    "finance",
    JSON.stringify(AppState.finance)
  );

  localStorage.setItem(
    "focus",
    JSON.stringify(AppState.focus)
  );
}

/* =========================================
   TOAST
========================================= */
function showToast(message) {

  const toast =
    document.createElement("div");

  toast.className = "toast";
  toast.innerText = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {

    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);

  }, 2500);
}

/* =========================================
   KEYBOARD SHORTCUTS
========================================= */
document.addEventListener("keydown", e => {

  if (e.key === "/") {
    e.preventDefault();
    searchInput.focus();
  }

  if (e.ctrlKey && e.key === "n") {
    e.preventDefault();
    taskInput.focus();
  }
});

/* =========================================
   INIT
========================================= */
loadDarkMode();

renderTasks();
renderCalendar();
updateStats();

console.log(
  "🚀 Productivity Dashboard PRO Loaded"
);