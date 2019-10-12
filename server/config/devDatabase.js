const mongoose = require('mongoose');

// replace with TEST_MONGO_URL if you want test database
mongoose.connect(process.env.MONGO_URL, () => {
  /* eslint no-console: ["error", { allow: ["log"] }] */
  console.log('WE CONNECTED TO THE DATABASE!!! YAYYYY!!!!!');
});
