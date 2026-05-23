"use strict";

/* =========================================
   ADVANCED PRODUCTIVITY DASHBOARD
   FULL UPDATED VERSION
========================================= */

/* =========================================
   APP STATE
========================================= */
const AppState = {
  tasks: [],
  finance: [],
  focus: [],
  darkMode: false
};

let currentFilter = "all";
let currentDate = new Date();
let currentView = "list";

/* =========================================
   ELEMENTS
========================================= */
const body = document.body;

const newEntryBtn = document.querySelector(".btn");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");
const saveBtn = document.querySelector(".save-btn");

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

const menuItems = document.querySelectorAll(".sidebar li");

const searchInput = document.getElementById("searchTask");
const statsContainer = document.getElementById("statsContainer");
const darkModeBtn = document.getElementById("darkModeBtn");

/* =========================================
   MODAL
========================================= */
newEntryBtn?.addEventListener("click", () => {
  overlay?.classList.remove("hidden");
});

closeBtn?.addEventListener("click", () => {
  overlay?.classList.add("hidden");
});

/* =========================================
   TAB SWITCH
========================================= */
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".tab.active")
      ?.classList.remove("active");

    btn.classList.add("active");

    document.querySelector(".section.active")
      ?.classList.remove("active");

    document.getElementById(btn.dataset.type)
      ?.classList.add("active");
  });
});

/* =========================================
   SAVE ENTRY
========================================= */
saveBtn?.addEventListener("click", () => {

  const type =
    document.querySelector(".tab.active")
      ?.dataset.type;

  if (type === "task") saveTask();
  if (type === "finance") saveFinance();
  if (type === "focus") saveFocus();

  overlay?.classList.add("hidden");
});

/* =========================================
   SAVE TASK
========================================= */
function saveTask() {

  const titleInput =
    document.querySelector("#task input");

  const title = titleInput?.value.trim();

  const priority =
    document.querySelector(".priority button.active")
      ?.innerText || "Medium";

  const duedate =
    document.getElementById("dueDate")?.value || "No date";

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
  showTasks();
  renderCalendar();
  updateStats();
}

/* =========================================
   QUICK ADD TASK BAR
========================================= */
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
  showTasks();
  renderCalendar();
  updateStats();

  showToast("Task Added Successfully ✅");
});

/* =========================================
   SEARCH TASKS
========================================= */
searchInput?.addEventListener("input", () => {
  showTasks(searchInput.value);
});

/* =========================================
   SHOW TASKS
========================================= */
function showTasks(search = "") {

  if (!taskList) return;

  taskList.innerHTML = "";

  let filteredTasks = [...AppState.tasks];

  /* FILTERS */
  if (currentFilter === "completed") {
    filteredTasks =
      filteredTasks.filter(t => t.completed);
  }

  if (currentFilter === "pending") {
    filteredTasks =
      filteredTasks.filter(t => !t.completed);
  }

  /* SEARCH */
  if (search.trim() !== "") {
    filteredTasks = filteredTasks.filter(task =>
      task.title
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }

  /* SORT BY DATE */
  filteredTasks.sort((a, b) => {
    return new Date(a.createdAt) -
      new Date(b.createdAt);
  });

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
      AppState.tasks.findIndex(t => t.id === task.id);

    const colorClass =
      task.priority.toLowerCase();

    taskList.innerHTML += `
      <div class="task-card ${task.completed ? "done" : ""}">
        
        <input type="checkbox"
          ${task.completed ? "checked" : ""}
          onchange="toggleTask(${realIndex})"
        />

        <div class="task-content">

          <p>${task.title}</p>

          <span class="priority-tag ${colorClass}">
            ${task.priority}
          </span>

          <small>
            📅 ${task.duedate}
          </small>

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
}

/* =========================================
   TOGGLE TASK
========================================= */
function toggleTask(index) {

  AppState.tasks[index].completed =
    !AppState.tasks[index].completed;

  saveToLocal();
  showTasks();
  renderCalendar();
  updateStats();

  showToast("Task Updated 🚀");
}

/* =========================================
   DELETE TASK
========================================= */
function deleteTask(index) {

  if (!confirm("Delete this task?")) return;

  AppState.tasks.splice(index, 1);

  saveToLocal();
  showTasks();
  renderCalendar();
  updateStats();

  showToast("Task Deleted 🗑");
}

/* =========================================
   EDIT TASK
========================================= */
function editTask(index) {

  const task = AppState.tasks[index];

  const newTitle =
    prompt("Edit task", task.title);

  if (!newTitle) return;

  task.title = newTitle;

  saveToLocal();
  showTasks();
  renderCalendar();

  showToast("Task Edited ✏");
}

/* =========================================
   CALENDAR RENDER
========================================= */
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
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
  ];

  if (monthYear) {
    monthYear.innerText =
      `${monthNames[month]} ${year}`;
  }

  const weekDays = [
    "SUN", "MON", "TUE",
    "WED", "THU", "FRI", "SAT"
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
        ) {
          return false;
        }

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

          <span class="day-number">
            ${date}
          </span>

          ${isToday
            ? `<span class="today-label">Today</span>`
            : ""}

        </div>

        <div class="calendar-tasks">
          ${taskHTML}
        </div>

      </div>
    `;
  }
}

/* =========================================
   FILTER BUTTONS
========================================= */
document.querySelectorAll(".filter").forEach(btn => {

  btn.addEventListener("click", () => {

    document.querySelector(".filter.active")
      ?.classList.remove("active");

    btn.classList.add("active");

    currentFilter =
      btn.dataset.filter;

    showTasks();
  });
});

/* =========================================
   VIEW TOGGLE
========================================= */
listBtn?.addEventListener("click", () => {

  currentView = "list";

  document.querySelectorAll(".view-btn")
    .forEach(btn => {
      btn.classList.remove("active");
    });

  listBtn.classList.add("active");

  if (taskList)
    taskList.style.display = "block";

  if (calendarView)
    calendarView.style.display = "none";

  showTasks();
});

calBtn?.addEventListener("click", () => {

  currentView = "calendar";

  document.querySelectorAll(".view-btn")
    .forEach(btn => {
      btn.classList.remove("active");
    });

  calBtn.classList.add("active");

  if (taskList)
    taskList.style.display = "none";

  if (calendarView)
    calendarView.style.display = "grid";

  renderCalendar();
});

/* =========================================
   MONTH NAVIGATION
========================================= */
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

/* =========================================
   SIDEBAR NAVIGATION
========================================= */
menuItems.forEach(item => {

  item.addEventListener("click", () => {

    document.querySelector(".sidebar li.active")
      ?.classList.remove("active");

    item.classList.add("active");

    const page = item.dataset.page;

    document.querySelectorAll(".page")
      .forEach(section => {
        section.style.display = "none";
      });

    document.getElementById(page)
      ?.style.setProperty("display", "block");
  });
});

/* =========================================
   STATS
========================================= */
function updateStats() {

  if (!statsContainer) return;

  const total =
    AppState.tasks.length;

  const completed =
    AppState.tasks.filter(t => t.completed).length;

  const pending =
    total - completed;

  statsContainer.innerHTML = `
  
    <div class="stat-card">
      <h3>${total}</h3>
      <p>Total Tasks</p>
    </div>

    <div class="stat-card">
      <h3>${completed}</h3>
      <p>Completed</p>
    </div>

    <div class="stat-card">
      <h3>${pending}</h3>
      <p>Pending</p>
    </div>
  `;
}

/* =========================================
   DARK MODE
========================================= */
darkModeBtn?.addEventListener("click", () => {

  AppState.darkMode =
    !AppState.darkMode;

  body.classList.toggle("dark");

  localStorage.setItem(
    "darkMode",
    JSON.stringify(AppState.darkMode)
  );
});

function loadDarkMode() {

  const dark =
    JSON.parse(
      localStorage.getItem("darkMode")
    );

  if (dark) {

    AppState.darkMode = true;

    body.classList.add("dark");
  }
}

/* =========================================
   TOAST NOTIFICATION
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
   LOCAL STORAGE
========================================= */
function loadFromLocal() {

  const data =
    localStorage.getItem("tasks");

  if (data) {

    AppState.tasks =
      JSON.parse(data);
  }
}

function saveToLocal() {

  localStorage.setItem(
    "tasks",
    JSON.stringify(AppState.tasks)
  );
}

/* =========================================
   FINANCE MODULE
========================================= */
function saveFinance() {

  const amount =
    document.getElementById("financeAmount")
      ?.value;

  const title =
    document.getElementById("financeTitle")
      ?.value;

  if (!amount || !title) return;

  AppState.finance.push({
    title,
    amount
  });

  showToast("Finance Saved 💰");
}

/* =========================================
   FOCUS MODULE
========================================= */
function saveFocus() {

  const focusInput =
    document.getElementById("focusInput");

  if (!focusInput?.value) return;

  AppState.focus.push({
    text: focusInput.value
  });

  focusInput.value = "";

  showToast("Focus Goal Saved 🎯");
}

/* =========================================
   KEYBOARD SHORTCUTS
========================================= */
document.addEventListener("keydown", e => {

  if (e.key === "/") {

    e.preventDefault();

    searchInput?.focus();
  }

  if (
    e.ctrlKey &&
    e.key === "n"
  ) {

    e.preventDefault();

    overlay?.classList.remove("hidden");
  }
});

/* =========================================
   INIT
========================================= */
loadFromLocal();
loadDarkMode();

showTasks();
renderCalendar();
updateStats();

console.log(
  "🚀 Productivity Dashboard Loaded"
);