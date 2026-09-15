const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const corsOptions = require('./config/cors');
const routes = require('./routes');
const notFound = require('./middleware/notFound.middleware');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded pet photos and documents from disk
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/', routes);

app.use(notFound);
app.use(errorMiddleware);

module.exports = app;
