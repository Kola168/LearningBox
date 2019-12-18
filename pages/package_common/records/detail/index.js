// pages/record/detail.js
"use strict"

const app = getApp()
import { regeneratorRuntime, co, util, wxNav } from '../../../../utils/common_import'

const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)
Page({
  data: {

  },
  onLoad: function (options) {
    this.order_id = options.order_id
    this.setData({
      // media_type:options.media_type,
      date: options.date
    })
    // this.getList()
  },
  getList: co.wrap(function* () {
    try {
      const resp = yield request({
        url: app.apiServer + `/ec/v2/designs`,
        method: 'GET',
        dataType: 'json',
        data: {
          openid: app.openId,
          order_id: this.order_id
        }
      })
      if (resp.data.code != 0) {
        throw (resp.data)
      }
      console.log('获取任务列表', resp.data)
      this.setData({
        list: resp.data.designs,
        title: resp.data.title
      })
      // for (var i=0;i<this.data.list.length;i++){
      //   if (this.data.list[i].state.substring(0,4)=="打印失败"){
      //     this.setData({
      //       fail:true
      //     })
      //   }
      // }
    } catch (e) {
      util.showErr(e)
    }
  }),
})