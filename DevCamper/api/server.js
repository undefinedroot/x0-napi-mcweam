const
  path = require('path'),
  express = require('express'),
  dotenv = require('dotenv'),
  morgan = require('morgan'),
  colors = require('colors'),
  errorHandler = require('./middleware/error'),
  connectDB = require('./config/db'),
  fileupload = require('express-fileupload'),
  cookieParser = require('cookie-parser');
// const logger = require('./middleware/logger');

// Load env vars, important: load this before any connection or importing of routes
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const
  bootcamps = require('./routes/bootcamps'), /* route files */
  courses = require('./routes/courses'),
  auth = require('./routes/auth');

const app = express();

//app.use(logger); /* use custom middleware */

// Dev logging middleware, only use it on development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); /* enable logging of operation messages */
}

// Body parser, so that we can retrieve the posted JSON data from the body property of the request object
app.use(express.json());

// implement uploading of files
app.use(fileupload());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// cookie parser
app.use(cookieParser());

app.disable('x-powered-by');

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

app.use(errorHandler); /* should be defined after the routes, middleware to handle errors */

const PORT = process.env.PORT || 5000; /* access with help of dotenv */

const server = app.listen(PORT, console.log(`Server running in '${process.env.NODE_ENV}' mode on port: ${PORT}`.yellow.bold));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
