var mongoose = require('mongoose');
var config   = require('../config');

mongoose.connect(config.db, config.options, function (err) {
  if (err) {
    console.error('connect to %s error: ', config.db, err.message);
    process.exit(1);
  }
});

// models
require('./mapitem')

exports.MapItem 		 = mongoose.model('MapItem');
