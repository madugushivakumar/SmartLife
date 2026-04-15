"use strict";

const AppState = {
  tasks: [],
  finance: [],
  focus: []
};

let currentFilter = "all";
let currentDate = new Date(); // ✅ ADDED

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

// ================= SAVE TASK =================
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

input.style.display = "none";
priorityInput.style.display = "none";
dateInput.style.display = "none";

addBtn.addEventListener("click", () => {
  if (input.style.display === "none") {
    input.style.display = "block";
    priorityInput.style.display = "block";
    dateInput.style.display = "block";
    return input.focus();
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
});

// ================= ADVANCED CALENDAR =================
function renderCalendar() {
  const container = document.getElementById("calendarView");
  const monthYear = document.getElementById("monthYear");

  container.innerHTML = "";

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
  let weekHTML = `<div class="weekdays">`;
  weekdays.forEach(day => weekHTML += `<div>${day}</div>`);
  weekHTML += `</div>`;
  container.innerHTML += weekHTML;

  // Empty cells
  for (let i = 0; i < firstDay; i++) {
    container.innerHTML += `<div></div>`;
  }

  // Days
  for (let i = 1; i <= daysInMonth; i++) {

    let dayTasks = AppState.tasks.filter(task => {
      if (!task.duedate) return false;
      const d = new Date(task.duedate);
      return d.getDate() === i &&
             d.getMonth() === month &&
             d.getFullYear() === year;
    });

    let isToday =
      i === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

   let html = `
  <strong>${i}</strong>
  ${isToday ? `<span class="today-label">Today</span>` : ""}
`;

    dayTasks.forEach(task => {
      html += `<div class="task-dot ${task.priority.toLowerCase()}">
        • ${task.title}
      </div>`;
    });

    container.innerHTML += `
      <div class="day ${isToday ? "today" : ""}">
        ${html}
      </div>
    `;
  }
}

// ================= SHOW TASKS =================
function showTasks() {
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

  filteredTasks.forEach((task) => {
    const realIndex = AppState.tasks.indexOf(task);
    let colorClass = task.priority.toLowerCase();

    container.innerHTML += `
      <div class="task-card ${task.completed ? "done" : ""} ${colorClass}">
        <input type="checkbox"
          ${task.completed ? "checked" : ""}
          onchange="toggleTask(${realIndex})" />

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

// ================= FILTER =================
document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter.active")?.classList.remove("active");
    btn.classList.add("active");

    currentFilter = btn.dataset.filter;
    showTasks();
  });
});

// ================= VIEW TOGGLE =================
document.addEventListener("DOMContentLoaded", () => {

  const listBtn = document.querySelector('[data-view="list"]');
  const calBtn = document.querySelector('[data-view="calendar"]');

  const taskList = document.getElementById("taskList");
  const calendarView = document.getElementById("calendarView");

  listBtn.addEventListener("click", () => {
    document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
    listBtn.classList.add("active");

    taskList.style.display = "block";
    calendarView.style.display = "none";

    showTasks();
  });

  calBtn.addEventListener("click", () => {
    document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
    calBtn.classList.add("active");

    taskList.style.display = "none";
    calendarView.style.display = "grid";

    renderCalendar();
  });

  // ✅ Month navigation
  document.getElementById("prevMonth")?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById("nextMonth")?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

});

// INIT
loadFromLocal();
showTasks();