const express = require('express');
const dotenv = require('dotenv');
// const logger = require('./middleware/logger');
const morgan = require('morgan');

// Route files
const bootcamps = require('./routes/bootcamps');

// Load env vars
dotenv.config({ path: './config/config.env' });

const app = express();

//app.use(logger); /* use custom middleware */

// Dev logging middleware, only use it on development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.disable('x-powered-by');

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT || 5000; /* access with help of dotenv */

app.listen(PORT, console.log(`Server running in '${process.env.NODE_ENV}' mode on port: ${PORT}`));
