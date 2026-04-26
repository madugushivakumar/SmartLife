"use strict";

/* ===============================
   APP STATE
================================= */
const AppState = {
  tasks: [],
  finance: [],
  focus: []
};

let currentFilter = "all";
let currentDate = new Date();

/* ===============================
   ELEMENTS
================================= */
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

/* ===============================
   MODAL
================================= */
newEntryBtn?.addEventListener("click", () => {
  overlay?.classList.remove("hidden");
});

closeBtn?.addEventListener("click", () => {
  overlay?.classList.add("hidden");
});

/* ===============================
   TAB SWITCH
================================= */
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".tab.active")?.classList.remove("active");
    btn.classList.add("active");

    document.querySelector(".section.active")?.classList.remove("active");
    document.getElementById(btn.dataset.type)?.classList.add("active");
  });
});

/* ===============================
   SAVE ENTRY
================================= */
saveBtn?.addEventListener("click", () => {
  const type = document.querySelector(".tab.active")?.dataset.type;

  if (type === "task") saveTask();
  if (type === "finance") saveFinance();
  if (type === "focus") saveFocus();

  overlay?.classList.add("hidden");
});

/* ===============================
   SAVE TASK FROM MODAL
================================= */
function saveTask() {
  const titleInput = document.querySelector("#task input");
  const title = titleInput?.value.trim();

  const priority =
    document.querySelector(".priority button.active")?.innerText || "Medium";

  const duedate = document.getElementById("dueDate")?.value || "No date";

  if (!title) return;

  AppState.tasks.push({
    title,
    priority,
    duedate,
    completed: false
  });

  if (titleInput) titleInput.value = "";

  saveToLocal();
  showTasks();
  renderCalendar();
}

/* ===============================
   ADD TASK BAR
================================= */
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
    title,
    priority,
    duedate,
    completed: false
  });

  input.value = "";
  dateInput.value = "";

  input.style.display = "none";
  priorityInput.style.display = "none";
  dateInput.style.display = "none";

  saveToLocal();
  showTasks();
  renderCalendar();
});

/* ===============================
   CALENDAR
================================= */
function renderCalendar() {
  if (!calendarView) return;

  calendarView.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  if (monthYear) {
    monthYear.innerText = `${monthNames[month]} ${year}`;
  }

  // Weekdays
  const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  let weekRow = `<div class="weekdays">`;

  weekdays.forEach(day => {
    weekRow += `<div>${day}</div>`;
  });

  weekRow += `</div>`;

  calendarView.innerHTML += weekRow;

  // Empty cells
  for (let i = 0; i < firstDay; i++) {
    calendarView.innerHTML += `<div></div>`;
  }

  // Dates
  for (let i = 1; i <= daysInMonth; i++) {

    const tasksForDay = AppState.tasks.filter(task => {
      if (!task.duedate || task.duedate === "No date") return false;

      const d = new Date(task.duedate);

      return (
        d.getDate() === i &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });

    const isToday =
      i === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    let html = `<strong>${i}</strong>`;

    tasksForDay.forEach(task => {
      html += `
        <div class="task-dot ${task.priority.toLowerCase()}">
          • ${task.title}
        </div>
      `;
    });

    calendarView.innerHTML += `
      <div class="day ${isToday ? "today" : ""}">
        ${html}
      </div>
    `;
  }
}

/* ===============================
   SHOW TASKS
================================= */
function showTasks() {
  if (!taskList) return;

  taskList.innerHTML = "";

 let filteredTasks = [...AppState.tasks];

if (searchText.trim() !== "") {
  filteredTasks = filteredTasks.filter(task =>
    task.title.toLowerCase().includes(searchText.toLowerCase())
  );
}

  if (currentFilter === "completed") {
    filteredTasks = filteredTasks.filter(t => t.completed);
  }

  if (currentFilter === "pending") {
    filteredTasks = filteredTasks.filter(t => !t.completed);
  }

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `<p class="empty">No tasks found 😴</p>`;
    return;
  }

  filteredTasks.forEach(task => {

    const realIndex = AppState.tasks.indexOf(task);
    const colorClass = task.priority.toLowerCase();

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

          <small>${task.duedate}</small>
        </div>

        <div class="task-actions">
          <button onclick="editTask(${realIndex})">✏</button>
          <button onclick="deleteTask(${realIndex})">🗑</button>
        </div>

      </div>
    `;
  });
}

/* ===============================
   TASK ACTIONS
================================= */
function toggleTask(index) {
  AppState.tasks[index].completed =
    !AppState.tasks[index].completed;

  saveToLocal();
  showTasks();
  renderCalendar();
}

function deleteTask(index) {
  AppState.tasks.splice(index, 1);

  saveToLocal();
  showTasks();
  renderCalendar();
}

function editTask(index) {
  const newTitle = prompt(
    "Edit task",
    AppState.tasks[index].title
  );

  if (!newTitle) return;

  AppState.tasks[index].title = newTitle;

  saveToLocal();
  showTasks();
  renderCalendar();
}

/* ===============================
   LOCAL STORAGE
================================= */
function loadFromLocal() {
  const data = localStorage.getItem("tasks");

  if (data) {
    AppState.tasks = JSON.parse(data);
  }
}

function saveToLocal() {
  localStorage.setItem(
    "tasks",
    JSON.stringify(AppState.tasks)
  );
}

/* ===============================
   FILTER BUTTONS
================================= */
document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {

    document
      .querySelector(".filter.active")
      ?.classList.remove("active");

    btn.classList.add("active");

    currentFilter = btn.dataset.filter;

    showTasks();
  });
});

/* ===============================
   LIST / CALENDAR TOGGLE
================================= */
listBtn?.addEventListener("click", () => {

  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  listBtn.classList.add("active");

  if (taskList) taskList.style.display = "block";
  if (calendarView) calendarView.style.display = "none";

  showTasks();
});

calBtn?.addEventListener("click", () => {

  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  calBtn.classList.add("active");

  if (taskList) taskList.style.display = "none";
  if (calendarView) calendarView.style.display = "grid";

  renderCalendar();
});

/* ===============================
   MONTH NAVIGATION
================================= */
prevMonth?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonth?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

/* ===============================
   SIDEBAR NAVIGATION
================================= */
menuItems.forEach(item => {
  item.addEventListener("click", () => {

    document
      .querySelector(".sidebar li.active")
      ?.classList.remove("active");

    item.classList.add("active");

    const page = item.dataset.page;

    const header = document.querySelector(".header");
    const cards = document.querySelector(".cards");
    const score = document.querySelector(".score");
    const tasks = document.querySelector(".tasks");
    const finance = document.querySelector(".finance-section");

    // Hide all
    if (header) header.style.display = "none";
    if (cards) cards.style.display = "none";
    if (score) score.style.display = "none";
    if (tasks) tasks.style.display = "none";
    if (finance) finance.style.display = "none";

    /* DASHBOARD */
    if (page === "dashboard") {

      if (header) header.style.display = "flex";
      if (cards) cards.style.display = "flex";
      if (score) score.style.display = "block";
      if (tasks) tasks.style.display = "block";

      document.querySelector(".tasks-header h3").innerText =
        "Recent Tasks";

      document.querySelector(".add-task").style.display = "none";
      document.querySelector(".filters").style.display = "none";

      document.querySelectorAll(".view-btn").forEach(btn => {
        btn.style.display = "none";
      });

      if (monthYear?.parentElement) {
        monthYear.parentElement.style.display = "none";
      }

      taskList.style.display = "block";
      calendarView.style.display = "none";

      showTasks();
    }

    /* TASKS */
    if (page === "tasks") {

      if (tasks) tasks.style.display = "block";

      document.querySelector(".tasks-header h3").innerText =
        "Task Manager";

      document.querySelector(".add-task").style.display = "flex";
      document.querySelector(".filters").style.display = "flex";

      document.querySelectorAll(".view-btn").forEach(btn => {
        btn.style.display = "inline-block";
      });

      if (monthYear?.parentElement) {
        monthYear.parentElement.style.display = "flex";
      }

      taskList.style.display = "block";
      calendarView.style.display = "none";

      showTasks();
    }

    /* FINANCE */
    if (page === "finance") {
      if (finance) finance.style.display = "block";
    }
  });
});

/* ===============================
   EMPTY FUNCTIONS
================================= */
function saveFinance() {}
function saveFocus() {}

/* ===============================
   INIT
================================= */
loadFromLocal();
showTasks();
renderCalendar();