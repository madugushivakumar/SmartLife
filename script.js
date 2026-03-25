"use strict";

const AppState = {
  tasks: [],
  finance: [],
  focus: []
};

// ELEMENTS
const newEntryBtn = document.querySelector(".btn");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");
const saveBtn = document.querySelector(".save-btn");
const menuItems = document.querySelectorAll(".sidebar li");
const sortSelect = document.getElementById("sortSelect");

sortSelect.addEventListener("change", () => {
  sortTasks(sortSelect.value);
  showTasks();
});
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
addBtn.addEventListener("click", () => {
  const title = input.value.trim();
  if (!title) return;

  AppState.tasks.push({
    title,
    priority: "Medium",
    duedate: new Date().toISOString().split("T")[0],
    completed: false
  });

  input.value = "";
  saveToLocal();
  showTasks();
});

// ================= SHOW TASKS =================
function showTasks() {
  const container = document.getElementById("taskList");
  container.innerHTML = "";
  AppState.tasks.forEach((task, index) => {
    let colorClass = task.priority.toLowerCase();
    container.innerHTML += `
      <div class="task-card ${task.completed ? "done" : ""}">
        <input type="checkbox"
          ${task.completed ? "checked" : ""}
          onchange="toggleTask(${index})" />
        <div class="task-content">
          <p>${task.title}</p>
          <span class="priority-tag ${colorClass}">
            ${task.priority}
          </span>
          <small>${task.duedate || ""}</small>
        </div>
        <div>
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
menuItems.forEach(item => {
  item.addEventListener("click", () => {
    document.querySelector(".sidebar li.active").classList.remove("active");
    item.classList.add("active");
    if (item.dataset.page === "tasks") showTasks();
  });
});

// PRIORITY CLICK
document.querySelectorAll(".priority button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".priority button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});
function sortTasks(type) {
  if (type === "date") {
    AppState.tasks.sort((a, b) => (a.duedate || "").localeCompare(b.duedate || ""));
  }

  else if (type === "priority") {
    const order = { High: 1, Medium: 2, Low: 3 };
    AppState.tasks.sort((a, b) => order[a.priority] - order[b.priority]);
  }

  else if (type === "status") {
    AppState.tasks.sort((a, b) => a.completed - b.completed);
  }
}
// INIT
loadFromLocal();
showTasks();