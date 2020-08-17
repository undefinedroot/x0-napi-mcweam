const
  fs = require('fs'),
  mongoose = require('mongoose'),
  colors = require('colors'),
  dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

const // Load models
  Bootcamp = require('./models/Bootcamp'),
  Course = require('./models/Course');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

const // Read JSON files
  bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`), 'utf-8'),
  courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`), 'utf-8');

// Import into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
}

// Delete data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany(); /* no argument = delete all*/
    await Course.deleteMany();
    console.log('Data Destroyed...'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
}

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}

/* >> node seeder -i,-d */