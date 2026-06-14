"use strict";
const AppState = {
  tasks: [],
  finance: [],
  focus: []
};

const newEntryBtn = document.querySelector(".btn");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");
const saveBtn = document.querySelector(".save-btn");
const menuItems = document.querySelectorAll(".sidebar li");
const header=document.querySelector(".header");
const cards=document.querySelector(".cards");
const score=document.querySelector(".score");
const newTaskblock=document.querySelector(".NewTaskblock");
const addNewTask=document.querySelector("#addnewtask");
const enternewTask=document.querySelector("#enternewtask");
const tasksContainer = document.querySelector(".tasks");
const taskList = document.querySelector("#taskList");
const dailytasks=document.querySelector(".DailyTasks");
  const modalInput = document.querySelector("#task input");

  const tasktogglebtn=document.querySelector(".taskstoggle");
  const calendertogglebtn=document.querySelector(".calendertoggle");
const calendersection=document.querySelector(".calendersection");

function ShowOnlyTaskMode(){
  document.querySelector('[data-type="finance"]').style.display="None";
  document.querySelector('[data-type="focus"]').style.display="None";
}

function ShowEveryTab(){
  document.querySelectorAll(".tab").forEach(tab=>{
    tab.style.display="inline-block";
  })
}

addNewTask.addEventListener("click", ()=>{
 
    overlay.classList.remove("hidden");
    ShowOnlyTaskMode();
   document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
      });

      document.getElementById("task").classList.add("active");

  // highlight TASK tab
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.remove("active");
  });
   document.querySelector('[data-type="task"]').classList.add("active");
    modalInput.value = enternewTask.value;

});


// Open modal
newEntryBtn.addEventListener("click", () => {
  overlay.classList.remove("hidden");
  ShowEveryTab();
});
 
// Close modal
closeBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
});

// Switch tabs
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {

    // remove active from tabs
    document.querySelector(".tab.active").classList.remove("active");
    btn.classList.add("active");

    // switch section
    document.querySelector(".section.active").classList.remove("active");
    document.getElementById(btn.dataset.type).classList.add("active");

  });
});

saveBtn.addEventListener("click", () => {
  const type = document.querySelector(".tab.active").dataset.type;
  if (type === "task") saveTask();
  if (type === "finance") saveFinance();
  if (type === "focus") saveFocus();
  overlay.classList.add("hidden");
});
// ================= SAVE FUNCTIONS =================
function saveTask() {

   const topInput = document.querySelector("#enternewtask").value;
  const modalInput = document.querySelector("#task input").value;
  const title = topInput || modalInput || "";

  let taskcount=0;

  const activepriority= document.querySelector(".priority .active");

  const priority=activepriority?activepriority.innerText:"None";

  const Duedate=document.querySelector(".TaskDueDate input").value;

  AppState.tasks.push({
    title,
    priority,
    Duedate
  });

  if(!title.trim()) return;
  const TaskDiv=document.createElement("div"); //TaskDiv will have all the tasks that are added as tasks.
TaskDiv.classList.add("task");

  TaskDiv.innerHTML=`
  <div class="Taskdetails" type=>
    <div class="TaskTitleAndCheckbox">
<input  class="taskcheckbox" type="checkbox"><p class="TaskTitle">${title}</p> </div>
<div class="TaskPriorityAndDueDate">
  <span class="TaskPriority">${priority}</span>
  <span class="TaskDueDate">${Duedate}</span>
  </div>
  </div>
  `;
  
taskList.appendChild(TaskDiv);
updateTaskcompletedcard();
taskcount++;

document.querySelector("#enternewtask").value = "";
document.querySelector("#task input").value="";
document.querySelector(".TaskDueDate input").value="";

 if (modalInput) {
    overlay.classList.add("hidden");
  }
}

 taskList.addEventListener("click", (e)=>{
if(e.target.classList.contains("taskcheckbox")){
  const Task=e.target.closest(".Taskdetails");
  const Title= Task.querySelector(".TaskTitle");
if(e.target.checked){
  Title.style.textDecoration = "line-through";
}
else{
  Title.style.textDecoration = "none";
}
 updateTaskcompletedcard();
}
});

function updateTaskcompletedcard(){
  const dailytasks=document.querySelector(".DailyTasks");
  const totalTasks=taskList.children.length;
  const completedtask=document.querySelectorAll(".taskcheckbox:checked").length;


  dailytasks.innerText=`Tasks remaining: ${completedtask} / ${totalTasks}`;
  dailytasks.style.fontWeight = "bold";
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
// function showDashboard() {
//   location.reload(); // simple reset (for now)
// }


// function showDashboard(){
//  togglebtns.style.display="none";
// }
function showTasks() {
    header.style.display = "none";
  cards.style.display = "none";
  score.style.display = "none";
  togglebtns.style.display = "flex";
  newTaskblock.classList.remove("hidden");


  
  const container = document.querySelector(".tasks");
    container.style.display="block";

  // container.innerHTML += "<h3>All Tasks</h3>";
  AppState.tasks.forEach(task => {
    container.innerHTML += `
      <div class="task">
        <p>${task.title}</p>
        <span>${task.priority}</span>
          <span>${task.duedate}</span>
        
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

const priorityButtons = document.querySelectorAll(".priority button");

priorityButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    
    // remove active from all
    priorityButtons.forEach(b => b.classList.remove("active"));
    
    // add active to clicked button
    btn.classList.add("active");
  });
});


//toggle btn logic
const taskHeader=document.querySelector(".tasks-header");
calendersection.style.display="none";
const togglebtns=document.querySelector(".togglebtns");
 togglebtns.style.display="none";

tasktogglebtn.addEventListener("click", ()=>{
  tasktogglebtn.classList.add("showbtn");
  calendertogglebtn.classList.remove("showbtn");  //showbtn it is used to modify the color of the button to purple when we click
  calendersection.style.display="none";
   taskList.style.display = "block";
newTaskblock.style.display="block";

});

calendertogglebtn.addEventListener("click", ()=>{
  calendertogglebtn.classList.add("showbtn");
  tasktogglebtn.classList.remove("showbtn");
calendersection.style.display="block";
// document.querySelector(".inputbtns").style.display = "none";
taskList.style.display = "none"; //ta
newTaskblock.style.display="none";
// taskHeader.style.display="none";
togglebtns.style.display="flex";
newTaskblock.style.display = "none";

})


//calender logic
const calenderblock=document.querySelector(".calenderblock");
const monthyear=document.querySelector("#monthYear");
const currentday=new Date();
const Today=new Date();
function rendercalender(date){
  // container.style.display="none";
const month=date.getMonth(); // number
const year = date.getFullYear();
const FirstDay= new Date(year,month,1).getDay();
const LastDay=new Date(year,month+1,0).getDate();
let months=["jan","feb","march","apr","may","june","july","aug","sep","oct","nov","dec"]; 
calenderblock.textContent="";

//emptyboxes
for(let i=0;i<FirstDay;i++){
  const empty=document.createElement("div");
  calenderblock.appendChild(empty);
}

// actual days
for (let i = 1; i <= LastDay; i++) {
  const day = document.createElement("div");
  if(i===Today.getDate() && month=== Today.getMonth() && year=== Today.getFullYear()){
  day.style.backgroundColor="greenyellow";}
  day.textContent = i;
  calenderblock.appendChild(day);
}
const HeadingMonth=months[month];  // string
monthyear.textContent=`${HeadingMonth} ${year}`;
}
const prevBtn=document.getElementById("prevMonth");
const nextBtn=document.getElementById("NextMonth");
prevBtn.addEventListener("click",function(){
currentday.setMonth(currentday.getMonth()-1);
rendercalender(currentday);
})
nextBtn.addEventListener("click",function(){
currentday.setMonth(currentday.getMonth()+1);
rendercalender(currentday);
})
rendercalender(currentday);


//logic  Tasks on the calender that i add in the tasks dashboard

initApp();