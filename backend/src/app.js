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

// Serves uploaded pet photos and documents (TR-010).
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Mounted at root, not /api, to match TRD Section 7's paths exactly
// (e.g. POST /auth/register, GET /clinics/nearby).
app.use('/', routes);

app.use(notFound);
app.use(errorMiddleware);

module.exports = app;
