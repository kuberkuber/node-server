import * as mongoose from 'mongoose';

const { Schema } = mongoose;
const userSchema = new Schema({
	userName: {
		type : String,
		required : true,
		unique : true,
		index : true,
	},
	createAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('User', userSchema);
