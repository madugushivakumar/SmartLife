"use strict";

/* =====================================
   APP STATE
===================================== */
const AppState = {
  tasks: [],
  finance: [],
  focus: [],
  theme: localStorage.getItem("theme") || "dark"
};

let currentFilter = "all";
let currentDate = new Date();

/* =====================================
   ELEMENTS
===================================== */
const body = document.body;

const newEntryBtn = document.querySelector(".btn");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");
const saveBtn = document.querySelector(".save-btn");

const menuItems = document.querySelectorAll(".sidebar li");

const addBtn = document.getElementById("addBtn");
const input = document.getElementById("taskInput");
const priorityInput = document.getElementById("taskPriority");
const dateInput = document.getElementById("taskDate");

const taskList = document.getElementById("taskList");
const calendarView = document.getElementById("calendarView");

const listBtn = document.querySelector('[data-view="list"]');
const calBtn = document.querySelector('[data-view="calendar"]');

const monthYear = document.getElementById("monthYear");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

const searchInput = document.getElementById("searchTask");
const statsBox = document.getElementById("statsBox");
const themeToggle = document.getElementById("themeToggle");
const exportBtn = document.getElementById("exportBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

/* =====================================
   THEME
===================================== */
function applyTheme() {
  body.classList.remove("dark", "light");
  body.classList.add(AppState.theme);
}

themeToggle?.addEventListener("click", () => {
  AppState.theme =
    AppState.theme === "dark" ? "light" : "dark";

  localStorage.setItem("theme", AppState.theme);

  applyTheme();
});

/* =====================================
   MODAL
===================================== */
newEntryBtn?.addEventListener("click", () => {
  overlay?.classList.remove("hidden");
});

closeBtn?.addEventListener("click", () => {
  overlay?.classList.add("hidden");
});

/* =====================================
   TAB SWITCH
===================================== */
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {

    document
      .querySelector(".tab.active")
      ?.classList.remove("active");

    btn.classList.add("active");

    document
      .querySelector(".section.active")
      ?.classList.remove("active");

    document
      .getElementById(btn.dataset.type)
      ?.classList.add("active");
  });
});

/* =====================================
   SAVE ENTRY
===================================== */
saveBtn?.addEventListener("click", () => {

  const type =
    document.querySelector(".tab.active")
      ?.dataset.type;

  if (type === "task") saveTask();
  if (type === "finance") saveFinance();
  if (type === "focus") saveFocus();

  overlay?.classList.add("hidden");
});

/* =====================================
   SAVE TASK
===================================== */
function saveTask() {

  const titleInput =
    document.querySelector("#task input");

  const title =
    titleInput?.value.trim();

  const priority =
    document.querySelector(
      ".priority button.active"
    )?.innerText || "Medium";

  const duedate =
    document.getElementById("dueDate")
      ?.value || "No date";

  if (!title) return;

  AppState.tasks.push({
    id: Date.now(),
    title,
    priority,
    duedate,
    completed: false,
    createdAt: new Date().toISOString()
  });

  if (titleInput) titleInput.value = "";

  saveToLocal();

  refreshUI();
}

/* =====================================
   QUICK ADD TASK
===================================== */
if (input) input.style.display = "none";
if (priorityInput) priorityInput.style.display = "none";
if (dateInput) dateInput.style.display = "none";

addBtn?.addEventListener("click", () => {

  if (input.style.display === "none") {

    input.style.display = "block";
    priorityInput.style.display = "block";
    dateInput.style.display = "block";

    input.focus();

    return;
  }

  const title = input.value.trim();
  const priority = priorityInput.value;
  const duedate = dateInput.value || "No date";

  if (!title) return;

  AppState.tasks.push({
    id: Date.now(),
    title,
    priority,
    duedate,
    completed: false,
    createdAt: new Date().toISOString()
  });

  input.value = "";
  dateInput.value = "";

  input.style.display = "none";
  priorityInput.style.display = "none";
  dateInput.style.display = "none";

  saveToLocal();

  refreshUI();
});

/* =====================================
   CALENDAR
===================================== */
function renderCalendar() {

  if (!calendarView) return;

  calendarView.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay =
    new Date(year, month, 1).getDay();

  const daysInMonth =
    new Date(year, month + 1, 0).getDate();

  const today = new Date();

  const monthNames = [
    "January","February","March","April",
    "May","June","July","August",
    "September","October","November","December"
  ];

  if (monthYear) {
    monthYear.innerText =
      `${monthNames[month]} ${year}`;
  }

  const weekDays = [
    "SUN","MON","TUE",
    "WED","THU","FRI","SAT"
  ];

  weekDays.forEach(day => {

    calendarView.innerHTML += `
      <div class="week-name">
        ${day}
      </div>
    `;
  });

  for (let i = 0; i < firstDay; i++) {

    calendarView.innerHTML += `
      <div class="empty-box"></div>
    `;
  }

  for (let date = 1; date <= daysInMonth; date++) {

    const isToday =
      date === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    const tasksForDay =
      AppState.tasks.filter(task => {

        if (
          !task.duedate ||
          task.duedate === "No date"
        ) return false;

        const d = new Date(task.duedate);

        return (
          d.getDate() === date &&
          d.getMonth() === month &&
          d.getFullYear() === year
        );
      });

    let taskHTML = "";

    tasksForDay.slice(0, 2).forEach(task => {

      taskHTML += `
        <div class="task-dot ${task.priority.toLowerCase()}">
          • ${task.title}
        </div>
      `;
    });

    if (tasksForDay.length > 2) {

      taskHTML += `
        <div class="more-tasks">
          +${tasksForDay.length - 2} more
        </div>
      `;
    }

    calendarView.innerHTML += `
      <div class="day-box ${isToday ? "today" : ""}">
        <div class="day-top">
          <span class="day-number">${date}</span>
          ${isToday ? `<span class="today-label">Today</span>` : ""}
        </div>

        <div class="calendar-tasks">
          ${taskHTML}
        </div>
      </div>
    `;
  }
}

/* =====================================
   SHOW TASKS
===================================== */
function showTasks() {

  if (!taskList) return;

  taskList.innerHTML = "";

  let filteredTasks = [...AppState.tasks];

  if (currentFilter === "completed") {
    filteredTasks =
      filteredTasks.filter(t => t.completed);
  }

  if (currentFilter === "pending") {
    filteredTasks =
      filteredTasks.filter(t => !t.completed);
  }

  /* SEARCH */
  if (searchInput?.value.trim()) {

    const keyword =
      searchInput.value.toLowerCase();

    filteredTasks =
      filteredTasks.filter(task =>
        task.title.toLowerCase().includes(keyword)
      );
  }

  if (filteredTasks.length === 0) {

    taskList.innerHTML = `
      <p class="empty">
        No tasks found 😴
      </p>
    `;

    return;
  }

  filteredTasks.forEach(task => {

    const realIndex =
      AppState.tasks.indexOf(task);

    const colorClass =
      task.priority.toLowerCase();

    taskList.innerHTML += `
      <div class="task-card ${task.completed ? "done" : ""}">

        <input
          type="checkbox"
          ${task.completed ? "checked" : ""}
          onchange="toggleTask(${realIndex})"
        />

        <div class="task-content">

          <p>${task.title}</p>

          <span class="priority-tag ${colorClass}">
            ${task.priority}
          </span>

          <small>${task.duedate}</small>

        </div>

        <div class="task-actions">

          <button onclick="editTask(${realIndex})">
            ✏
          </button>

          <button onclick="deleteTask(${realIndex})">
            🗑
          </button>

        </div>
      </div>
    `;
  });

  updateStats();
}

/* =====================================
   TASK ACTIONS
===================================== */
function toggleTask(index) {

  AppState.tasks[index].completed =
    !AppState.tasks[index].completed;

  saveToLocal();

  refreshUI();
}

function deleteTask(index) {

  if (!confirm("Delete this task?")) return;

  AppState.tasks.splice(index, 1);

  saveToLocal();

  refreshUI();
}

function editTask(index) {

  const task = AppState.tasks[index];

  const newTitle =
    prompt("Edit task", task.title);

  if (!newTitle) return;

  task.title = newTitle;

  saveToLocal();

  refreshUI();
}

/* =====================================
   STATS
===================================== */
function updateStats() {

  if (!statsBox) return;

  const total =
    AppState.tasks.length;

  const completed =
    AppState.tasks.filter(
      t => t.completed
    ).length;

  const pending = total - completed;

  statsBox.innerHTML = `
    <div>Total: ${total}</div>
    <div>Completed: ${completed}</div>
    <div>Pending: ${pending}</div>
  `;
}

/* =====================================
   SEARCH
===================================== */
searchInput?.addEventListener("input", () => {
  showTasks();
});

/* =====================================
   FILTER BUTTONS
===================================== */
document.querySelectorAll(".filter")
.forEach(btn => {

  btn.addEventListener("click", () => {

    document
      .querySelector(".filter.active")
      ?.classList.remove("active");

    btn.classList.add("active");

    currentFilter =
      btn.dataset.filter;

    showTasks();
  });
});

/* =====================================
   LIST / CALENDAR TOGGLE
===================================== */
listBtn?.addEventListener("click", () => {

  document
    .querySelectorAll(".view-btn")
    .forEach(btn =>
      btn.classList.remove("active")
    );

  listBtn.classList.add("active");

  taskList.style.display = "block";
  calendarView.style.display = "none";

  showTasks();
});

calBtn?.addEventListener("click", () => {

  document
    .querySelectorAll(".view-btn")
    .forEach(btn =>
      btn.classList.remove("active")
    );

  calBtn.classList.add("active");

  taskList.style.display = "none";
  calendarView.style.display = "grid";

  renderCalendar();
});

/* =====================================
   MONTH NAVIGATION
===================================== */
prevMonth?.addEventListener("click", () => {

  currentDate.setMonth(
    currentDate.getMonth() - 1
  );

  renderCalendar();
});

nextMonth?.addEventListener("click", () => {

  currentDate.setMonth(
    currentDate.getMonth() + 1
  );

  renderCalendar();
});

/* =====================================
   EXPORT TASKS
===================================== */
exportBtn?.addEventListener("click", () => {

  const blob = new Blob(
    [JSON.stringify(AppState.tasks, null, 2)],
    { type: "application/json" }
  );

  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);

  a.download = "tasks.json";

  a.click();
});

/* =====================================
   CLEAR ALL
===================================== */
clearAllBtn?.addEventListener("click", () => {

  const ok =
    confirm("Clear all tasks?");

  if (!ok) return;

  AppState.tasks = [];

  saveToLocal();

  refreshUI();
});

/* =====================================
   SIDEBAR NAVIGATION
===================================== */
menuItems.forEach(item => {

  item.addEventListener("click", () => {

    document
      .querySelector(".sidebar li.active")
      ?.classList.remove("active");

    item.classList.add("active");

    const page = item.dataset.page;

    const sections = [
      ".header",
      ".cards",
      ".score",
      ".tasks",
      ".finance-section"
    ];

    sections.forEach(selector => {

      const el =
        document.querySelector(selector);

      if (el) el.style.display = "none";
    });

    if (page === "dashboard") {

      document.querySelector(".header").style.display = "flex";
      document.querySelector(".cards").style.display = "flex";
      document.querySelector(".score").style.display = "block";
      document.querySelector(".tasks").style.display = "block";

      showTasks();
    }

    if (page === "tasks") {

      document.querySelector(".tasks").style.display = "block";

      showTasks();
    }

    if (page === "finance") {

      document.querySelector(".finance-section").style.display = "block";
    }
  });
});

/* =====================================
   LOCAL STORAGE
===================================== */
function saveToLocal() {

  localStorage.setItem(
    "tasks",
    JSON.stringify(AppState.tasks)
  );
}

function loadFromLocal() {

  const data =
    localStorage.getItem("tasks");

  if (data) {

    AppState.tasks = JSON.parse(data);
  }
}

/* =====================================
   REFRESH UI
===================================== */
function refreshUI() {

  showTasks();

  renderCalendar();

  updateStats();
}

/* =====================================
   EMPTY FUNCTIONS
===================================== */
function saveFinance() {
  console.log("Finance Saved");
}

function saveFocus() {
  console.log("Focus Saved");
}

/* =====================================
   INIT
===================================== */
loadFromLocal();

applyTheme();

refreshUI();