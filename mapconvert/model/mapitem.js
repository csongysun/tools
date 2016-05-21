var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var MapItemSchema = new Schema({
	_id:  Number,
    title: String,
	classifyid:  Number,
	discription: {type: String},
    pic: [String],
    campusid: {type: Number},
    posx: Number,
    posy: Number
});

if (!MapItemSchema.options.toObject) MapItemSchema.options.toObject = {};
MapItemSchema.options.toObject.transform = function (doc, ret, options) {
	delete ret.__v;
   // delete ret.pwd;
	delete ret.rdate;
}


MapItemSchema.index({_id: 1}, {unique: true});

mongoose.model('MapItem', MapItemSchema);
