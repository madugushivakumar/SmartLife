"use strict";
// ===== GLOBAL STATE =====
const AppState = {
  tasks: [],
  finance: [],
  focus: []
};
// ===== ELEMENTS =====
const newEntryBtn = document.querySelector(".btn");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");
const saveBtn = document.querySelector(".save-btn");
const menuItems = document.querySelectorAll(".sidebar li");
// ===== OPEN MODAL =====
newEntryBtn.addEventListener("click", () => {
  overlay.classList.remove("hidden");
});
// ===== CLOSE MODAL =====
closeBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
});
// ===== TAB SWITCH =====s
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".tab.active").classList.remove("active");
    btn.classList.add("active");
    document.querySelector(".section.active").classList.remove("active");
    document.getElementById(btn.dataset.type).classList.add("active");
  });
});
// ===== SAVE ENTRY =====
saveBtn.addEventListener("click", () => {
  const type = document.querySelector(".tab.active").dataset.type;
  if (type === "task") saveTask();
  if (type === "finance") saveFinance();
  if (type === "focus") saveFocus();
  overlay.classList.add("hidden");
});
// ================= SAVE FUNCTIONS =================
function saveTask() {
  const title = document.querySelector("#task input").value;
  const priority = document.querySelector(".priority button.active").innerText;
  const dueDate = document.getElementById("dueDate").value;

  if (!title.trim()) return;

  AppState.tasks.push({
    title,
    priority,
    dueDate
  });

  document.querySelector("#task input").value = "";
}
function saveFinance() {
  const amount = Number(document.querySelector("#finance input[type='number']").value);
  const category = document.querySelector("#finance input[type='text']").value;
  if (!amount) return;
  AppState.finance.push({
    amount,
    category
  });
  document.querySelector("#finance input[type='number']").value = "";
  document.querySelector("#finance input[type='text']").value = "";
}
function saveFocus() {
  const time = document.querySelector("#focus input[type='time']").value;
  const mode = document.querySelector("#focus input[type='text']").value;
  if (!time) return;
  AppState.focus.push({
    time,
    mode
  });
  document.querySelector("#focus input[type='time']").value = "";
  document.querySelector("#focus input[type='text']").value = "";
}
// ================= SIDEBAR NAVIGATION =================
menuItems.forEach(item => {
  item.addEventListener("click", () => {
    // active highlight
    document.querySelector(".sidebar li.active").classList.remove("active");
    item.classList.add("active");
    const page = item.dataset.page;
    if (page === "dashboard") showDashboard();
    if (page === "tasks") showTasks();
    if (page === "finance") showFinance();
    if (page === "focus") showFocus();
  });
});
// ================= DISPLAY FUNCTIONS =================
// 👉 Dashboard Reset
function showDashboard() {
  location.reload(); // simple reset (for now)
}
// 👉 Show Tasks
function showTasks() {
  const container = document.querySelector(".tasks");
  container.innerHTML = "<h3>All Tasks</h3>";
  AppState.tasks.forEach(task => {
    container.innerHTML += `
      <div class="task">
        <p>${task.title}</p>
        <span>${task.priority}</span>
      </div>
    `;
  });
}
// 👉 Show Finance
function showFinance() {
  const container = document.querySelector(".tasks");
  container.innerHTML = "<h3>Finance Details</h3>";
  AppState.finance.forEach(f => {
    container.innerHTML += `
      <div>
        <p>$${f.amount}</p>
        <span>${f.category}</span>
      </div>
    `;
  });
}
// 👉 Show Focus
function showFocus() {
  const container = document.querySelector(".tasks");
  container.innerHTML = "<h3>Focus Sessions</h3>";
  AppState.focus.forEach(f => {
    container.innerHTML += `
      <div>
        <p>${f.time}</p>
        <span>${f.mode}</span>
      </div>
    `;
  });
}
// ===== PRIORITY BUTTON CLICK =====
const priorityButtons = document.querySelectorAll(".priority button");
priorityButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    // remove active from all
    priorityButtons.forEach(b => b.classList.remove("active"));
    // add active to clicked button
    btn.classList.add("active");
  });
});