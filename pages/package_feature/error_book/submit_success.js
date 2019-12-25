// // pages/error_book/submit_success.js
// "use strict"

// const app = getApp()
// const regeneratorRuntime = require('../../../lib/co/runtime')
// const co = require('../../../lib/co/co')
// const util = require('../../../utils/util')
// var mta = require('../../../utils/mta_analysis.js');

// const chooseImage = util.promisify(wx.chooseImage)
// const uploadFile = util.promisify(wx.uploadFile)
// const request = util.promisify(wx.request)
// const showModal = util.promisify(wx.showModal)
// Page({
//     data: {

//     },
//     onLoad: function (options) {
//         this.longToast = new app.WeToast()
//         this.course = options.course
//         this.id= options.id
//         this.setData({
//             type: options.type
//         })
//         mta.Page.init()
//     },
//     goBack: co.wrap(function* () {
//         mta.Event.stat('error_book', { 'checkbook': 'true' })
//         wx.redirectTo({
//             url: `index`,
//         })
//     }),
//     camera: co.wrap(function* () {
//         mta.Event.stat('error_book', { 'continue': 'true' })

//         if (this.data.type == 'photoAnswer' || this.data.type == 'error_book_search') {
//             wx.navigateTo({
//                 url: `../photo_answer/camera`,
//             })
//         } else {
//             wx.navigateTo({
//                 url: `camera?course=${this.course}`,
//             })
//         }

//     }),
//      //打印项设置
//      toSetting: function() {
//          let ids=[]
//          ids.push(this.id)
//          console.log(ids)
//         wx.navigateTo({
//             url: `print?course=${this.course}&ids=${JSON.stringify(ids)}&mistakecount=1`,
//         })
//     },
//     onShareAppMessage: function () {
//         return app.share
//     },
// })
