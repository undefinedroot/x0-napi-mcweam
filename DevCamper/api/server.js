const express = require('express');
const dotenv = require('dotenv');
// const logger = require('./middleware/logger');
const morgan = require('morgan');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Route files
const bootcamps = require('./routes/bootcamps');

const app = express();

//app.use(logger); /* use custom middleware */

// Body parser, so that we can retrieve the posted JSON data from the body property of the request object
app.use(express.json());

// Dev logging middleware, only use it on development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); /* enable logging of operation messages */
}

app.disable('x-powered-by');

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

app.use(errorHandler); /* should be defined after the routes, middleware to handle errors */

const PORT = process.env.PORT || 5000; /* access with help of dotenv */

const server = app.listen(PORT, console.log(`Server running in '${process.env.NODE_ENV}' mode on port: ${PORT}`.yellow.bold));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
