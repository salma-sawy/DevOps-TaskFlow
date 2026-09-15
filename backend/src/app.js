const express = require('express');
const cors = require('cors');
const path = require('path');

const healthRoute = require('./routes/health');
const tasksRoute = require('./routes/tasks');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', healthRoute);
app.use('/', tasksRoute);

// Serve the frontend
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

module.exports = app;