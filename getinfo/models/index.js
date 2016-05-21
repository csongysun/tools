var mongoose = require('mongoose');
var config   = require('../config');

mongoose.connect(config.db, config.options, function (err) {
  if (err) {
    console.error('connect to %s error: ', config.db, err.message);
    process.exit(1);
  }
});

// models
//require('./user');
require('./clazzinfo');
require('./stuinfo');

//exports.User         = mongoose.model('User');
exports.Clazz        = mongoose.model('Clazz');
exports.Stu 		 = mongoose.model('Stu');
exports.Course		 = mongoose.model('Course');