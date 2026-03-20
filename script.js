const newEntryBtn = document.querySelector(".btn");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");
// Open modal
newEntryBtn.addEventListener("click", () => {
  overlay.classList.remove("hidden");
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