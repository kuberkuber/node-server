import * as mongoose from 'mongoose';

module.exports = () => {
	const connect = () => {
		if (process.env.NODE_ENV !== 'production') {
			mongoose.set('debug', true);
		}
		mongoose.connect('mongodb://localhost', {
			dbName: 'kuberkuber',
		}).then(() => {
			console.log('Mongo db connected');
		}).catch((error) => {
			console.log('Mongo db connection error', error);
		});
	};
	connect();
	mongoose.connection.on('error', (error) => {
		console.error('연결에러', error);
	});
	mongoose.connection.on('disconnected', () => {
		console.error('연결이 끊겼습니다. 연결을 재시도합니다.');
		connect();
	});
	// require('./repo');
}
