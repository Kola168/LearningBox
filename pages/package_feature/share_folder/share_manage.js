"use strict"
const app = getApp()

import api from '../../../network/restful_request.js'
const regeneratorRuntime = require('../../../lib/co/runtime')

import {
  co,
  util
} from '../../../utils/common_import'
Page({
  data: {
    memberList: [],
    memberIds: [], //被分享成员id
    selectText: '全选',
    // "memberList": [
    //   {
    //     "user_id": 21,
    //     "nickname": "ʏᴀғᴇᴇ",
    //     "avatar": "https://wx.qlogo.cn/mmopen/vi_32/Wb43ViaHebfW1cvCJfHicNYjrUicv7wlia24pCwXM8Nu5svXClsib5GatqNjVuXkiarWCjFSUWfJ0ZRMWoEI5sptSx6g/132",
    //     "role": "user",
    //     "created_at": "2019-07-10 15:14:30"
    //   }
    // ]
  },

  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    console.log(options)
    this.setData({
      file_name: options.file_name
    })
    this.sn = options.sn
    yield this.getShareList()
  }),

  selectAll: co.wrap(function* (e) {
    this.setData({
      selectText: this.data.selectText === '全选' ? '取消' : '全选'
    })
    if (this.data.selectText === '取消') {
      this.data.memberIds = []
      for (var i = 0; i < this.data.memberList.length; i++) {
        this.data.memberList[i].choose = true,
          this.data.memberIds.push(this.data.memberList[i].user_id)
      }
    } else {
      for (var i = 0; i < this.data.memberList.length; i++) {
        this.data.memberList[i].choose = false
        this.deleteOneId(this.data.memberIds, this.data.memberList[i].user_id)
      }
    }
    this.setData({
      memberList: this.data.memberList
    })
  }),

  choose: co.wrap(function* (e) {
    console.log('e.currentTarget.id======', e.currentTarget.id)
    if (!this.data.memberList[parseInt(e.currentTarget.id)].choose) { //选中
      this.data.memberIds.push(this.data.memberList[parseInt(e.currentTarget.id)].user_id)
    } else {
      this.deleteOneId(this.data.memberIds, this.data.memberList[parseInt(e.currentTarget.id)].user_id)
    }
    this.data.memberList[parseInt(e.currentTarget.id)].choose = !this.data.memberList[parseInt(e.currentTarget.id)].choose
    console.log('this.data.memberList=====', this.data.memberList)
    this.setData({
      memberList: this.data.memberList
    })
    if (this.data.memberIds.length == this.data.memberList.length) {
      console.log("11111")
      this.setData({
        selectText: '取消'
      })
    } else {
      console.log("2222")
      this.setData({
        selectText: '全选'
      })
    }
  }),

  deleteOneId: function (array, item) {
    console.log('这里333333333333')
    Array.prototype.indexOf = function (val) {
      for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
      }
      return -1;
    };
    Array.prototype.remove = function (val) {
      var index = this.indexOf(val);
      if (index > -1) {
        this.splice(index, 1);
      }
    };
    return array.remove(item)
  },

  toClear: function () {
    this.setData({
      showClear: {
        // mediaType: `停止分享`,
        intro: `好友将无法查看文件夹中所有文件`
      }
    })
  },

  cancelIntroduction: co.wrap(function* () {
    this.setData({
      showClear: false
    })
  }),

  //删除成员
  stopShare: co.wrap(function* () {
    console.log('this.data.memberIds===', this.data.memberIds)
    this.longToast.toast({
        type: 'loading',
        duration: 0
      })
    try {
      const resp = yield api.deleteFoldersUsers(app.openId, this.sn, this.data.memberIds)
      if (resp.code != 0) {
        throw (resp)
      }
      this.longToast.toast()
      console.log('删除成员成功', resp.data)
      //刷新
      this.getShareList()

    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),

  //获取分享成员列表
  getShareList: co.wrap(function* () {
    this.longToast.toast({
        type: 'loading',
        duration: 0
      })
    try {
      const resp = yield api.getFoldersUsers(app.openId, this.sn)
      if (resp.code != 0) {
        throw (resp)
      }
      console.log('获取被分享成员列表成功', resp)
      this.setData({
        memberList: resp.res,
      })
      if (this.data.selectText == '取消') {
        console.log("zzzzzz")
        this.data.memberIds = []
        for (var i = 0; i < this.data.memberList.length; i++) {
          this.data.memberList[i].choose = true,
            this.data.memberIds.push(this.data.memberList[i].user_id)
        }
        this.setData({
          memberList: this.data.memberList
        })
      }
      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),
})
