// // pages/error_book/setting.js
// "use strict"

// const app = getApp()
// const regeneratorRuntime = require('../../../lib/co/runtime')
// const co = require('../../../lib/co/co')
// const util = require('../../../utils/util')

// const chooseImage = util.promisify(wx.chooseImage)
// const getSystemInfo = util.promisify(wx.getSystemInfo)
// const uploadFile = util.promisify(wx.uploadFile)
// const request = util.promisify(wx.request)
// const showModal = util.promisify(wx.showModal)

// Page({
//     data: {
//         order: ["按录题时间顺序", "按录题时间逆序"],
//         orderId: 0,
//         templateId: 0
//     },
//     onLoad: co.wrap(function*(options) {
//         console.log("111111", options.middlearrNum)
//         this.middlearrNum = options.middlearrNum
//         this.longToast = new app.weToast()
//         this.longToast.toast({
//             type: 'loading'
//         })
//         yield this.templates()
//     }),
//     templates: co.wrap(function*(e) {
//         try {
//             const resp = yield request({
//                 url: app.apiServer + `/ec/v2/mistake_templates`,
//                 method: 'GET',
//                 dataType: 'json',
//                 data: ''
//             })
//             if (resp.data.code != 0) {
//                 throw (resp.data)
//             }
//             console.log('打印模板====', resp.data)
//             this.setData({
//                 template: resp.data.mistake_template,
//             })
//             this.longToast.toast()
//         } catch (e) {
//             this.longToast.toast()
//             util.showErr(e)
//         }
//     }),
//     chooseOrder: function(e) {
//         let id = e.currentTarget.id
//         this.setData({
//             orderId: id
//         })
//     },
//     chooseTemplate: function(e) {
//         let id = e.currentTarget.id
//         this.setData({
//             templateId: id
//         })
//     },
//     confirm: function() {
//         // let order = this.data.order[this.data.orderId]
//         console.log("1111", this.data.orderId)
//         let order
//         let num
//         if (this.data.orderId == 0) {
//             order = "ASC"
//         }
//         if (this.data.orderId == 1) {
//             order = "DESC"
//         }
//         if (this.data.template[this.data.templateId].category == 'single') {
//             num = "1"
//         }
//         if (this.data.template[this.data.templateId].category == 'double') {
//             num = "2"
//         }

//         // if (this.data.templateId==0){
//         //   num = "1"
//         // }
//         // if (this.data.templateId == 1) {
//         //   num = "2"
//         // }

//         let template_id = this.data.template[this.data.templateId].id

//         var pages = getCurrentPages()
//         var prepage = pages[pages.length - 2]
//         prepage.setData({
//             "num": num,
//             "order": order,
//             "template_id": template_id,
//             "printNum": Math.round(this.middlearrNum / num)
//         })
//         console.log("11111", num, order, template_id)
//         wx.navigateBack()
//     }
// })