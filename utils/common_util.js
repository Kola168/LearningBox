const gfdConfig = require('./gfdConfig.js')

function encodeLongParams(params) {
	return encodeURIComponent(JSON.stringify(params))
}

function decodeLongParams(params) {
	return JSON.parse(decodeURIComponent(params))
}

function wxlog(key, params) {
	if (gfdConfig) {
		console.log(key, params)
	}
}

export { encodeLongParams, decodeLongParams }