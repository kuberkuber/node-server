import * as mongoose from 'mongoose';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const repoSchema = new Schema({
	namespace : {
		type : String,
		required : true,
		ref : 'User',
	},
	repoName : {
		type : String,
		required : true,
	},
	imageName : {
		type : String,
		required : true,
	},
	portNum : {
		type : String,
		required : true,
	},
	endpointFile : {
		type : JSON
	},
});

module.exports = mongoose.model('Repo', repoSchema);
