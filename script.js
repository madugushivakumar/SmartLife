"use strict";

/* =========================
   GLOBAL ENGINE (globalThis)
========================= */
globalThis.SmartLifeApp = {
  name: "SmartLife",
  initialized: false
};

/* =========================
   HOISTING DEMO
========================= */
initMessage(); // works because of hoisting

function initMessage() {
  console.log("🚀 SmartLife App Starting...");
}

/* =========================
   TDZ DEMO
========================= */
try {
  console.log(appStatus); // ❌ TDZ
} catch (err) {
  console.log("TDZ Error:", err.message);
}

let appStatus = "LOADING";

/* =========================
   CORE STATE
========================= */
const AppState = {
  entries: []
};

/* =========================
   MAIN INITIALIZER
========================= */
function initializeApp() {
  console.log("Initializing App...");

  SmartLifeApp.initialized = true;
  appStatus = "READY";

  attachEventListeners();
}

/* =========================
   EVENT LISTENER SETUP
========================= */
function attachEventListeners() {
  const newEntryBtn = document.querySelector(".btn");

  newEntryBtn.addEventListener("click", handleNewEntryClick);
}

/* =========================
   BUTTON CLICK HANDLER
========================= */
function handleNewEntryClick() {
  console.log("➕ New Entry Clicked");

  // Expression vs Statement
  let entryType = AppState.entries.length === 0 ? "FIRST_ENTRY" : "NORMAL_ENTRY";

  // Call Stack Flow
  createNewEntry(entryType);
}

/* =========================
   CREATE ENTRY (CALL STACK)
========================= */
function createNewEntry(type) {
  console.log("Creating Entry:", type);

  const newEntry = generateEntry(type);

  AppState.entries.push(newEntry);

  renderEntry(newEntry);
}

/* =========================
   GENERATE ENTRY (PURE LOGIC)
========================= */
function generateEntry(type) {
  return {
    id: Date.now(),
    type: type,
    createdAt: new Date().toLocaleTimeString()
  };
}

/* =========================
   RENDER ENTRY TO UI
========================= */
function renderEntry(entry) {
  const tasksContainer = document.querySelector(".tasks");

  const div = document.createElement("div");
  div.className = "task";

  div.innerHTML = `
    <input type="checkbox">
    <div>
      <p>New Entry (${entry.type})</p>
      <span>${entry.createdAt}</span>
    </div>
  `;

  tasksContainer.appendChild(div);
}

/* =========================
   EXECUTION CONTEXT START
========================= */
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Loaded");

  initializeApp();
});