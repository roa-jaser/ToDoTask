const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const errorMsg = document.getElementById("errorMsg");
const list = document.getElementById("list");
let currentFilter = "all"; // القيمة الافتراضية

//using local storage
let tasks = load(); //it will return all the saved tasks
render();

// saving the task in the localstorage
const save=()=> {
  localStorage.setItem("todo-tasks-v1", JSON.stringify(tasks));
}

//loading the saved tasks list
    const load=()=> {
  try {
    return JSON.parse(localStorage.getItem("todo-tasks-v1")) || [];
  } catch {
    return [];
  }
}

// validate task
    const validate=(value)=> {
  const text = value.trim();

  if (text === "") return "The task can not be empty";
  if (text.length <= 5) return "The task have to be more than 5 characters";
  if (text[0] >= "0" && text[0] <= "9")
    return "The task can not start with a number";

  return null;
}

// Show error
const showError=(msg) =>{
    errorMsg.textContent = msg || "";
}

//live validatiin while typing
taskInput.addEventListener("input", ()=> {
  const err = validate(taskInput.value); // نتحقق من النص الحالي
  showError(err); // نعرض رسالة الخطأ إذا فيه
  addBtn.disabled = !!err; // Disable button if there's an error
});

// Add task
const addTask=()=> {
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

// Render tasks
const render=() =>{
  list.innerHTML = "";

  // نحدد أي مهام نعرض بناءً على الفلتر
  let filteredTasks = tasks;
  if (currentFilter === "done") {
    filteredTasks = tasks.filter((t) => t.done);
  } else if (currentFilter === "todo") {
    filteredTasks = tasks.filter((t) => !t.done);
  }

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
        <input type="checkbox" class="toggle" ${
          t.done ? "checked" : ""
        } aria-label="Mark done">
        <button class="icon-btn edit" title="Edit" aria-label="Edit task"><i class="fa-solid fa-pen"></i></button>
        <button class="icon-btn delete" title="Delete" aria-label="Delete task"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    //  toggle مهمة done / not done
    row.querySelector(".toggle").addEventListener("change", (e) => {
        const id = row.dataset.id;
        const task = tasks.find((t) => t.id === id);
        if (task) {
        task.done = e.target.checked;
        save();
        render();
        }
    });

    //  delete
    row.querySelector(".delete").addEventListener("click", () => {
        const id = row.dataset.id;
        showConfirm("Are you sure you want to delete this task?", () => {
        tasks = tasks.filter((t) => t.id !== id);
        save();
        render();
        });
    });

    list.appendChild(row);
    }
}

// adding button
addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
});

// فلترة المهام
document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
    // نشيل active من كل الأزرار
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // نغير الفلتر الحالي
    currentFilter = btn.dataset.filter;
    render();
    });
});



// --- Create Confirm Modal dynamically ---
const modal = document.createElement("div");
modal.id = "confirmModal";
modal.className = "modal";
modal.innerHTML = `
<div class="modal-content">
    <h3 id="modalTitle">Delete Task</h3>
    <p id="modalMessage">Are you sure you want to delete this task?</p>
    <div class="modal-actions">
        <button id="confirmBtn" class="btn btn-danger">Confirm</button>
        <button id="cancelBtn" class="btn btn-secondary">Cancel</button>
    </div>
    </div>
`;
document.body.appendChild(modal);

// function to show confirm popup
const showConfirm=(message, onConfirm) =>{
    const modal = document.getElementById("confirmModal");
    const modalMessage = document.getElementById("modalMessage");
    const confirmBtn = document.getElementById("confirmBtn");
    const cancelBtn = document.getElementById("cancelBtn");

  // غير الرسالة
    modalMessage.textContent = message;
    modal.style.display = "block";

  // امسح أي events سابقة
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));

  // رجعهم بعد الاستبدال
    const newConfirmBtn = document.getElementById("confirmBtn");
    const newCancelBtn = document.getElementById("cancelBtn");

  // لو ضغط تأكيد
    newConfirmBtn.onclick = () => {
    modal.style.display = "none";
    onConfirm();
    };

  // لو ضغط إلغاء
    newCancelBtn.onclick = () => {
    modal.style.display = "none";
    };
}

// حذف كل المهام
document.getElementById("deleteAllBtn").addEventListener("click", () => {
    showConfirm("Are you sure you want to delete ALL tasks?", () => {
    tasks = [];
    save();
    render();
    });
});

// حذف المهام المنجزة
document.getElementById("deleteDoneBtn").addEventListener("click", () => {
    showConfirm("Are you sure you want to delete all DONE tasks?", () => {
    tasks = tasks.filter((t) => !t.done);
    save();
    render();
    });
});
