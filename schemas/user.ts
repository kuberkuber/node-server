import * as mongoose from 'mongoose';

const { Schema } = mongoose;
const userSchema = new Schema({
	name: {
		type : String,
		required : true,
		unique : true,
	},
	id: {
		type : String,
		required : true,
		unique : true,
		index : true,
	},
	accessToken: {
		type: String,
	},
})

export const Users = mongoose.model('User', userSchema);
