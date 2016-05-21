var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var CourseSchema = new Schema({
	name: {type: String},
	teacher: {type: String},
	room: {type: String},
	row: {type: Number},
	colume: {type: Number},
	rowspan: {type: Number},
	enable: [{type: Number}],
});

var ClazzSchema = new Schema({
	_id: {type: String},
	name: {type: String},
	depart: {type: String},
	course: { type: Schema.Types.Mixed, default: [] }
});



ClazzSchema.index({_id: 1}, {unique: true});

mongoose.model('Course', CourseSchema);
mongoose.model('Clazz', ClazzSchema);