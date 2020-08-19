const
  path = require('path'),
  express = require('express'),
  dotenv = require('dotenv'),
  morgan = require('morgan'),
  colors = require('colors'),
  errorHandler = require('./middleware/errorHandler'),
  connectDB = require('./config/db'),
  fileupload = require('express-fileupload'),
  cookieParser = require('cookie-parser');

// Load env vars, important: load this before any connection or importing of routes
dotenv.config({ path: './config/config.env' });

connectDB(); // connect to database

const /* route files */
  bootcamps = require('./routes/bootcamps'),
  courses = require('./routes/courses'),
  auth = require('./routes/auth');

const app = express();

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

// remove x-powered-by on response headers so that info about this running Express is not shown
app.disable('x-powered-by');

// Mount routers
app.use(`${process.env.API_PATH}/bootcamps`, bootcamps);
app.use(`${process.env.API_PATH}/courses`, courses);
app.use(`${process.env.API_PATH}/auth`, auth);

// should be defined after the routes, middleware to handle errors
app.use(errorHandler);

// access with help of dotenv
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running in '${process.env.NODE_ENV}' mode on port: ${PORT}`.yellow.bold));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
