const STORAGE_KEY = "interactive-todos-v1";

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const tasksLeft = document.getElementById("tasks-left");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
const todoItemTemplate = document.getElementById("todo-item-template");

let todos = loadTodos();
let activeFilter = "all";

render();

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  todos.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false,
  });

  todoInput.value = "";
  saveTodos();
  render();
});

clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    render();
  });
});

function loadTodos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function getVisibleTodos() {
  switch (activeFilter) {
    case "active":
      return todos.filter((todo) => !todo.completed);
    case "completed":
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
}

function render() {
  todoList.innerHTML = "";
  const visibleTodos = getVisibleTodos();

  visibleTodos.forEach((todo) => {
    const todoItem = createTodoElement(todo);
    todoList.appendChild(todoItem);
  });

  const activeCount = todos.filter((todo) => !todo.completed).length;
  tasksLeft.textContent = `${activeCount} task${activeCount === 1 ? "" : "s"} left`;

  emptyState.style.display = visibleTodos.length === 0 ? "block" : "none";
}

function createTodoElement(todo) {
  const item = todoItemTemplate.content.firstElementChild.cloneNode(true);
  const checkbox = item.querySelector(".todo-checkbox");
  const text = item.querySelector(".todo-text");
  const editBtn = item.querySelector(".edit-btn");
  const deleteBtn = item.querySelector(".delete-btn");

  text.textContent = todo.text;
  checkbox.checked = todo.completed;
  item.classList.toggle("completed", todo.completed);

  checkbox.addEventListener("change", () => {
    const target = todos.find((candidate) => candidate.id === todo.id);
    if (!target) return;
    target.completed = checkbox.checked;
    saveTodos();
    render();
  });

  editBtn.addEventListener("click", () => {
    const updatedText = prompt("Edit your task:", todo.text);
    if (updatedText === null) return;
    const sanitizedText = updatedText.trim();
    if (!sanitizedText) return;

    const target = todos.find((candidate) => candidate.id === todo.id);
    if (!target) return;
    target.text = sanitizedText;
    saveTodos();
    render();
  });

  deleteBtn.addEventListener("click", () => {
    todos = todos.filter((candidate) => candidate.id !== todo.id);
    saveTodos();
    render();
  });

  return item;
}
