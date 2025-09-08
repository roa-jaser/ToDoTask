// --- عناصر الصفحة ---
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const errorMsg = document.getElementById("errorMsg");
const list = document.getElementById("list");
let currentFilter = "all"; // القيمة الافتراضية

// --- Load tasks from localStorage ---
function load() { // استخدمت function declaration لتجنب خطأ hoisting
  try {
    return JSON.parse(localStorage.getItem("todo-tasks-v1")) || [];
  } catch {
    return [];
  }
}

// --- Save tasks to localStorage ---
function save() {
  localStorage.setItem("todo-tasks-v1", JSON.stringify(tasks));
}

// --- Validate task ---
function validate(value) {
  const text = value.trim();
  if (text === "") return "The task can not be empty";
  if (text.length <= 5) return "The task have to be more than 5 characters";
  if (text[0] >= "0" && text[0] <= "9") return "The task can not start with a number";
  return null;
}

// --- Show error ---
function showError(msg) {
  errorMsg.textContent = msg || "";
}

// --- Tasks array ---
let tasks = load(); // Load saved tasks

// --- Render tasks ---
function render() {
  list.innerHTML = "";

  let filteredTasks = tasks;
  if (currentFilter === "done") filteredTasks = tasks.filter(t => t.done);
  else if (currentFilter === "todo") filteredTasks = tasks.filter(t => !t.done);

  if (filteredTasks.length === 0) {
    list.innerHTML = `<div class="empty">No tasks</div>`;
    return;
  }

  for (const t of filteredTasks) {
    const row = document.createElement("div");
    row.className = `task ${t.done ? "completed" : ""}`;
    row.dataset.id = t.id;

    row.innerHTML = `
      <div class="task-left">
        <span class="text">${t.text}</span>
      </div>
      <div class="task-actions">
        <input type="checkbox" class="toggle" ${t.done ? "checked" : ""} aria-label="Mark done">
        <button class="icon-btn edit" title="Edit" aria-label="Edit task"><i class="fa-solid fa-pen"></i></button>
        <button class="icon-btn delete" title="Delete" aria-label="Delete task"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    // Toggle done
    row.querySelector(".toggle").addEventListener("change", e => {
      const task = tasks.find(task => task.id === row.dataset.id);
      if (task) {
        task.done = e.target.checked;
        save();
        render();
      }
    });

    // Delete task
    row.querySelector(".delete").addEventListener("click", () => {
      showConfirm("Are you sure you want to delete this task?", () => {
        tasks = tasks.filter(task => task.id !== row.dataset.id);
        save();
        render();
      });
    });

    list.appendChild(row);
  }
}

// --- Add task ---
function addTask() {
  const text = taskInput.value;
  const err = validate(text);
  if (err) {
    showError(err);
    return;
  }

  tasks.push({
    id: Date.now().toString(),
    text: text.trim(),
    done: false,
  });

  save();
  taskInput.value = "";
  showError("");
  render();
}

// --- Event listeners ---
taskInput.addEventListener("input", () => {
  const err = validate(taskInput.value);
  showError(err);
  addBtn.disabled = !!err;
});

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", e => {
  if (e.key === "Enter") addTask();
});

// Filter tabs
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

// --- Confirm modal ---
const modal = document.createElement("div");
modal.id = "confirmModal";
modal.className = "modal";
modal.innerHTML = `
<div class="modal-content">
    <h3 id="modalTitle">Delete Task</h3>
    <p id="modalMessage"></p>
    <div class="modal-actions">
        <button id="confirmBtn" class="btn btn-danger">Confirm</button>
        <button id="cancelBtn" class="btn btn-secondary">Cancel</button>
    </div>
</div>
`;
document.body.appendChild(modal);

function showConfirm(message, onConfirm) {
  const modal = document.getElementById("confirmModal");
  const modalMessage = document.getElementById("modalMessage");
  const confirmBtn = document.getElementById("confirmBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  modalMessage.textContent = message;
  modal.style.display = "block";

  confirmBtn.replaceWith(confirmBtn.cloneNode(true));
  cancelBtn.replaceWith(cancelBtn.cloneNode(true));

  const newConfirmBtn = document.getElementById("confirmBtn");
  const newCancelBtn = document.getElementById("cancelBtn");

  newConfirmBtn.onclick = () => {
    modal.style.display = "none";
    onConfirm();
  };
  newCancelBtn.onclick = () => {
    modal.style.display = "none";
  };
}

// Delete all tasks
document.getElementById("deleteAllBtn").addEventListener("click", () => {
  showConfirm("Are you sure you want to delete ALL tasks?", () => {
    tasks = [];
    save();
    render();
  });
});

// Delete done tasks
document.getElementById("deleteDoneBtn").addEventListener("click", () => {
  showConfirm("Are you sure you want to delete all DONE tasks?", () => {
    tasks = tasks.filter(t => !t.done);
    save();
    render();
  });
});

// --- Initial render ---
render();
