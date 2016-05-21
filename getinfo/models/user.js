var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
	id: {type: String},
	stuid: {type: String},
	ban: {type: Boolean, default: false},
	password: {type: String},
	nickname: {type: String},
	phone: {type: String},
	//ecard: {type: String},
	epassword: {type: String},
	sex: {type: Boolean},
	clazz: {type: String}
});

UserSchema.index({id: 1}, {unique: true});