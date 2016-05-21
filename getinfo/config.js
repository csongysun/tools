var config = {
	db: 'mongodb://127.0.0.1/info',
	options: {
		server: {
			auto_reconnect: true,
			poolSize: 3
		}
	}

};

module.exports = config;