const
  path = require('path'),
  express = require('express'),
  dotenv = require('dotenv'),
  morgan = require('morgan'),
  colors = require('colors'),
  errorHandler = require('./middleware/errorHandler'),
  connectDB = require('./config/db'),
  fileupload = require('express-fileupload'),
  cookieParser = require('cookie-parser'),
  mongoSanitize = require('express-mongo-sanitize'),
  helmet = require('helmet'),
  xss = require('xss-clean'),
  rateLimit = require('express-rate-limit'),
  hpp = require('hpp'),
  cors = require('cors');

// Load env vars, IMPORTANT: load this before any connection or importing of routes
dotenv.config({ path: './config/config.env' });

connectDB(); // connect to database

const /* route files */
  bootcamps = require('./routes/bootcamps'),
  courses = require('./routes/courses'),
  auth = require('./routes/auth'),
  users = require('./routes/users'),
  reviews = require('./routes/reviews');

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

// prevent nosql injection by sanitizing request data
app.use(mongoSanitize());

// set secure HTTP headers
app.use(helmet());

// prevent XSS
app.use(xss());

// rate limiting
app.use(rateLimit({
  windowMs: 10 * 60 * 1000, /* 10 minutes */
  max: 100 /* maximum number of requests per windowMs */
}));

// prevent http parameter pollution
app.use(hpp());

// enable CORS (so that others can connect to this api on a different domain because this is a public api)
app.use(cors());

// remove x-powered-by on response headers so that info about this running Express is not shown
app.disable('x-powered-by');

// Mount routers
app.use(`${process.env.BOOTCAMP_API_PATH}`, bootcamps);
app.use(`${process.env.COURSES_API_PATH}`, courses);
app.use(`${process.env.AUTH_API_PATH}`, auth);
app.use(`${process.env.ADMIN_API_PATH}`, users);
app.use(`${process.env.REVIEWS_API_PATH}`, reviews);

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
