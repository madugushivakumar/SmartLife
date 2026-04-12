"use strict";

const AppState = {
  tasks: [],
  finance: [],
  focus: []
};
let currentFilter = "all";
// ELEMENTS
const newEntryBtn = document.querySelector(".btn");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");
const saveBtn = document.querySelector(".save-btn");
const menuItems = document.querySelectorAll(".sidebar li");

// MODAL
newEntryBtn.addEventListener("click", () => {
  overlay.classList.remove("hidden");
});

closeBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
});

// TAB SWITCH
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".tab.active").classList.remove("active");
    btn.classList.add("active");
    document.querySelector(".section.active").classList.remove("active");
    document.getElementById(btn.dataset.type).classList.add("active");
  });
});

// SAVE ENTRY
saveBtn.addEventListener("click", () => {
  const type = document.querySelector(".tab.active").dataset.type;
  if (type === "task") saveTask();
  if (type === "finance") saveFinance();
  if (type === "focus") saveFocus();
  overlay.classList.add("hidden");
});

// =================SAVE TASK =================
function saveTask() {
  const title = document.querySelector("#task input").value;
  const priority = document.querySelector(".priority button.active").innerText;
  const duedate = document.getElementById("dueDate").value;
  if (!title.trim()) return;

  AppState.tasks.push({
    title,
    priority,
    duedate,
    completed: false
  });

  document.querySelector("#task input").value = "";
  saveToLocal();
  showTasks();
}

// ================= ADD BUTTON =================
const addBtn = document.getElementById("addBtn");
const input = document.getElementById("taskInput");
const priorityInput = document.getElementById("taskPriority");
const dateInput = document.getElementById("taskDate");

// 👉 HIDE INITIALLY
input.style.display = "none";
priorityInput.style.display = "none";
dateInput.style.display = "none";

addBtn.addEventListener("click", () => {

  // 👉 IF HIDDEN → SHOW INPUTS
  if (input.style.display === "none") {
    input.style.display = "block";
    priorityInput.style.display = "block";
    dateInput.style.display = "block";
    return input.focus();
  }

  // 👉 IF VISIBLE → SAVE TASK
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

  // 👉 RESET + HIDE AGAIN
  input.value = "";
  dateInput.value = "";

  input.style.display = "none";
  priorityInput.style.display = "none";
  dateInput.style.display = "none";

  saveToLocal();
  showTasks();
});
function renderCalendar() {
  const container = document.getElementById("calendarView");
  container.innerHTML = "";

  for (let i = 1; i <= 31; i++) {
    let tasks = AppState.tasks.filter(task => {
      if (!task.duedate) return false;
      return new Date(task.duedate).getDate() === i;
    });

    let html = `<strong>${i}</strong>`;

    tasks.forEach(task => {
      html += `<div class="task-dot ${task.priority.toLowerCase()}">
        • ${task.title}
      </div>`;
    });

    container.innerHTML += `<div class="day">${html}</div>`;
  }
}
// ================= SHOW TASKS =================
function showTasks() {
  // ===== CALENDAR FUNCTION =====
function renderCalendar() {
  const container = document.getElementById("calendarView");
  container.innerHTML = "";

  for (let i = 1; i <= 31; i++) {

    let dayTasks = AppState.tasks.filter(task => {
      if (!task.duedate) return false;
      return new Date(task.duedate).getDate() === i;
    });

    let html = `<strong>${i}</strong>`;

    dayTasks.forEach(task => {
      html += `<div class="task-dot ${task.priority.toLowerCase()}">
        • ${task.title}
      </div>`;
    });

    container.innerHTML += `<div class="day">${html}</div>`;
  }
}
  const container = document.getElementById("taskList");
  container.innerHTML = "";

  let filteredTasks = AppState.tasks;

  if (currentFilter === "completed") {
    filteredTasks = AppState.tasks.filter(t => t.completed);
  }

  if (currentFilter === "pending") {
    filteredTasks = AppState.tasks.filter(t => !t.completed);
  }

  if (filteredTasks.length === 0) {
    container.innerHTML = `<p class="empty">No tasks found 😴</p>`;
    return;
  }

  filteredTasks.forEach((task, index) => {
    let colorClass = task.priority.toLowerCase();

    container.innerHTML += `
      <div class="task-card ${task.completed ? "done" : ""} ${colorClass}">
        <input type="checkbox"
          ${task.completed ? "checked" : ""}
          onchange="toggleTask(${index})" />

        <div class="task-content">
          <p>${task.title}</p>
          <span class="priority-tag ${colorClass}">
            ${task.priority}
          </span>
          <small>${task.duedate}</small>
        </div>

        <div class="task-actions">
          <button onclick="editTask(${index})">✏</button>
          <button onclick="deleteTask(${index})">🗑</button>
        </div>
      </div>
    `;
  });
}

// ================= ACTIONS =================
function toggleTask(index) {
  AppState.tasks[index].completed = !AppState.tasks[index].completed;
  saveToLocal();
  showTasks();
}

function deleteTask(index) {
  AppState.tasks.splice(index, 1);
  saveToLocal();
  showTasks();
}

function editTask(index) {
  const newTitle = prompt("Edit task", AppState.tasks[index].title);
  if (!newTitle) return;
  AppState.tasks[index].title = newTitle;
  saveToLocal();
  showTasks();
}

// ================= STORAGE =================
function loadFromLocal() {
  const data = localStorage.getItem("tasks");
  if (data) AppState.tasks = JSON.parse(data);
}

function saveToLocal() {
  localStorage.setItem("tasks", JSON.stringify(AppState.tasks));
}

// ================= OTHER =================
function saveFinance() {}
function saveFocus() {}
menuItems.forEach(item =>
  item.addEventListener("click", () => {
    document.querySelector(".sidebar li.active")?.classList.remove("active");
    item.classList.add("active");

    const page = item.dataset.page;

    const header = document.querySelector(".header");
    const cards = document.querySelector(".cards");
    const score = document.querySelector(".score");
    const tasks = document.querySelector(".tasks");
    const finance = document.querySelector(".finance-section");

    // RESET ALL
    header.style.display = "none";
    cards.style.display = "none";
    score.style.display = "none";
    tasks.style.display = "none";
    finance.style.display = "none";
    // SHOW BASED ON PAGE
    if (page === "dashboard") {
      header.style.display = "flex";
      cards.style.display = "flex";
      score.style.display = "block";
    }

    if (page === "tasks") {
      tasks.style.display = "block";
      showTasks();
    }

    if (page === "finance") {
      finance.style.display = "block";
    }
  })
);

// PRIORITY CLICK
document.querySelectorAll(".priority button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".priority button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// INIT
loadFromLocal();
showTasks();
document.querySelectorAll(".filter").forEach(btn => {
  // ===== LIST / CALENDAR TOGGLE =====
let currentView = "list";

document.querySelectorAll(".view-btn").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelector(".view-btn.active")?.classList.remove("active");
    btn.classList.add("active");

    currentView = btn.dataset.view;

    if (currentView === "list") {
      document.getElementById("taskList").style.display = "block";
      document.getElementById("calendarView").classList.add("hidden");

      showTasks();
    } else {
      document.getElementById("taskList").style.display = "none";
      document.getElementById("calendarView").classList.remove("hidden");

      renderCalendar();
    }
  });
});
  
  btn.addEventListener("click", () => {

    document.querySelector(".filter.active")?.classList.remove("active");
    btn.classList.add("active");

    currentFilter = btn.dataset.filter;

    showTasks();
  });
});
// ===== FIXED VIEW TOGGLE =====
document.addEventListener("DOMContentLoaded", () => {

  const listBtn = document.querySelector('[data-view="list"]');
  const calBtn = document.querySelector('[data-view="calendar"]');

  const taskList = document.getElementById("taskList");
  const calendarView = document.getElementById("calendarView");

  listBtn.addEventListener("click", () => {
    // active UI
    document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
    listBtn.classList.add("active");

    // show list
    taskList.style.display = "block";
    calendarView.style.display = "none";

    showTasks(); // 🔥 IMPORTANT
  });

  calBtn.addEventListener("click", () => {
    // active UI
    document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
    calBtn.classList.add("active");

    // show calendar
    taskList.style.display = "none";
    calendarView.style.display = "grid";

    renderCalendar(); // 🔥 IMPORTANT
  });

});