var Fly = require("../lib/net/wx.umd.min.js")
var request = new Fly()

request.interceptors.request.use((request) => {
    return request
})

request.interceptors.response.use(
    (response, promise) => {
        return promise.resolve(response.data)
    },
    (error, promise) => {
        // return promise.reject()
        return promise.resolve(error)
    }
)

export default request