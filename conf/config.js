////////////////////////////////////////////////////////////////////////////////////
// Exports
////////////////////////////////////////////////////////////////////////////////////

const os = require('os');
const pkg = require('../package.json');

var env = process.env.NODE_ENV || 'development';
var appName = `${pkg.name}-${env}-${os.hostname()}`;

var workerId = process.env.WORKER_ID;
if (workerId) {
	appName += `-${workerId}`;
}

var config = {
	env: env,
	scheme: process.env.APP_SCHEME || 'http',
	host: process.env.APP_HOST || 'localhost',
	port: process.env.APP_PORT || process.env.PORT || 9000,
	appname: appName,
	appversion: `${pkg.version}`,
	session: {
		secret: process.env.SESSION_SECRET || "SESSION_SECRET"
	},
	logger: {
		threshold: process.env.LOGGER_THRESHOLD_LEVEL || 'debug',
		console: {
			level: process.env.LOGGER_CONSOLE_LEVEL || 'debug'
		}
	}
};

module.exports = config;
