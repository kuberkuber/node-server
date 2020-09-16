import {
	set,
	connect,
	connection,
} from 'mongoose';

module.exports = () => {
	const dbConnect = () => {
		if (process.env.NODE_ENV !== 'production') {
			set('debug', true);
		}
		// connect('mongodb://localhost:27017', {
			connect('mongodb://mongo:27017', {
			dbName: 'kuberkuber',
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		}).then(() => {
			console.log('Mongo db connected');
		}).catch((error: any) => {
			console.log(typeof error)
			console.log('Mongo db connection error', error);
		});
	};
	dbConnect();
	connection.on('error', (error: any) => {
		console.error('연결에러', error);
	});
	connection.on('disconnected', () => {
		console.error('연결이 끊겼습니다. 연결을 재시도합니다.');
		dbConnect();
	});
	require('./user');
	require('./repo');
}
