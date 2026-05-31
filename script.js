const list = document.getElementById('todo-list')
const itemCountSpan = document.getElementById('item-count')
const uncheckedCountSpan = document.getElementById('unchecked-count')

// Завдання 1. Посилання на вашу базу даних Firebase (замініть на своє посилання)
const FIREBASE_URL = 'https://todo-list-de703-default-rtdb.firebaseio.com/todos';

let todos = [];

// Завдання 3. Читання з БД (Метод GET) та Завдання 6 (Умовний рендеринг завантаження/помилки)
function fetchTodos() {
  list.innerHTML = '<li class="list-group-item text-center text-muted">Завантаження даних з бази даних...</li>';

  fetch(`${FIREBASE_URL}.json`)
    .then(response => {
      if (!response.ok) throw new Error('Не вдалося завантажити дані з сервера');
      return response.json();
    })
    .then(data => {
      if (!data) {
        todos = [];
      } else {
        todos = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
      }
      render();
      updateCounter();
    })
    .catch(error => {
      list.innerHTML = `<li class="list-group-item text-center text-danger">Помилка: ${error.message}</li>`;
    });
}

// Завдання 2. Функція addTodo (Метод POST)
function addTodo(text) {
  const todoData = {
    text: text,
    checked: false
  };

  fetch(`${FIREBASE_URL}.json`, {
    method: 'POST',
    body: JSON.stringify(todoData),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) throw new Error('Помилка збереження на сервері');
      return response.json();
    })
    .then(data => {
      const newTodoItem = {
        id: data.name, 
        ...todoData
      };
      todos.push(newTodoItem);
      render();
      updateCounter();
    })
    .catch(error => alert(error.message));
}

function newTodo() {
  const text = prompt('Введіть нове завдання:');
  if (!text || text.trim() === '') return;
  addTodo(text.trim());
}

function renderTodo(todo) {
  return `
    <li class="list-group-item">
      <input type="checkbox" class="form-check-input me-2" id="todo-${todo.id}" ${todo.checked ? 'checked' : ''} onChange="checkTodo('${todo.id}')" />
      <label for="todo-${todo.id}">
        <span class="${todo.checked ? 'text-success text-decoration-line-through' : ''}">${todo.text}</span>
      </label>
      <button class="btn btn-danger btn-sm float-end" onClick="deleteTodo('${todo.id}')">delete</button>
    </li>
  `;
}

function render() {
  const htmlStrings = todos.map(todo => renderTodo(todo));
  list.innerHTML = htmlStrings.join('');
}

function updateCounter() {
  const total = todos.length;
  const unchecked = todos.filter(todo => !todo.checked).length;

  itemCountSpan.textContent = total;
  uncheckedCountSpan.textContent = unchecked;
}

// Завдання 4. Видалення даних (Метод DELETE)
function deleteTodo(id) {
  fetch(`${FIREBASE_URL}/${id}.json`, {
    method: 'DELETE'
  })
    .then(response => {
      if (!response.ok) throw new Error('Не вдалося видалити елемент із бази даних');
      todos = todos.filter(todo => todo.id !== id);
      render();
      updateCounter();
    })
    .catch(error => alert(error.message));
}

// Завдання 5. Оновлення даних (Метод PATCH)
function checkTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  const updatedChecked = !todo.checked;

  fetch(`${FIREBASE_URL}/${id}.json`, {
    method: 'PATCH',
    body: JSON.stringify({ checked: updatedChecked }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) throw new Error('Не вдалося оновити статус у базі даних');
      todo.checked = updatedChecked;
      render();
      updateCounter();
    })
    .catch(error => alert(error.message));
}

fetchTodos();