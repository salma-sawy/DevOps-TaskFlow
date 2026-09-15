const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');

async function fetchTasks() {
  const res = await fetch('/api/tasks');
  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
  list.innerHTML = '';
  tasks.forEach((task) => {
    const li = document.createElement('li');
    if (task.done) li.classList.add('done');

    const span = document.createElement('span');
    span.className = 'title';
    span.textContent = task.title;
    span.addEventListener('click', () => toggleTask(task));

    const actions = document.createElement('div');
    actions.className = 'task-actions';
    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', () => deleteTask(task.id));
    actions.appendChild(delBtn);

    li.appendChild(span);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

async function toggleTask(task) {
  await fetch(`/api/tasks/${task.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done: !task.done }),
  });
  fetchTasks();
}

async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  fetchTasks();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  input.value = '';
  fetchTasks();
});

async function checkHealth() {
  try {
    const res = await fetch('/health');
    const data = await res.json();
    if (data.status === 'ok') {
      statusDot.className = 'dot ok';
      statusText.textContent = `API healthy — uptime ${data.uptimeSeconds}s`;
    } else {
      statusDot.className = 'dot fail';
      statusText.textContent = 'API degraded — DB disconnected';
    }
  } catch (err) {
    statusDot.className = 'dot fail';
    statusText.textContent = 'API unreachable';
  }
}

fetchTasks();
checkHealth();
setInterval(checkHealth, 15000);