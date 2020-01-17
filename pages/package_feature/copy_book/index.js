"use strict"
const app = getApp()

import {
  regeneratorRuntime,
  co,
  util,
  _,
  common_util
} from '../../../utils/common_import'

const getUserInfo =util.promisify(wx.getUserInfo)
import wxNav from '../../../utils/nav.js'
const event = require('../../../lib/event/event')
import graphql from '../../../network/graphql/feature'
import api from '../../../network/restful_request'

Page({
  data: {
    num: 0,
    content: '',
    mediumRecommend: '',
    fontTypeIndex: 0,
    fontList:[{
      name:'楷体',
      type:'kt'
    },{
      name:'黎明手写楷体',
      type:'lmsxk'
    },{
      name:'黎明速写行楷',
      type:'lmsxxk'
    }],
    checkFont:false,
    iosModal: false,
    text: '当日智能字帖生成次数已经用完，升级会员可以畅享使用',
    user_share_qrcode:'https://cdn-h.gongfudou.com/Leviathan/backend/attachment/attachment/59601d4ad98c41e4b10b204c30150b04.png'

  },
  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    console.log(options)
    if(app.isScope()){
      this.copybookSets()
    }
    event.on('Authorize', this, function (data) {
      this.copybookSets()
    })

  }),

  onShow: function () {
     if (!app.isScope()) {
       let url = `/pages/authorize/index`
       wxNav.navigateTo(url)
     }
  },

  copybookSets: co.wrap(function* (e) {
    this.longToast.toast({
      type:'loading'
    })
    try {
      const resp = yield graphql.getCopyBookList('copybook')
      this.setData({
        copybookSets: resp.feature.categories,
        statistics:resp.feature.statistics
      })
      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  contentinput: function (e) {
    let con = e.detail.value;
    this.setData({
      content: con,
      num: con.length
    })
  },

  showFontList:function(){
    this.setData({
      checkFont:!this.data.checkFont
    })
  },

  // 选择字体
  chooseFont(e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      fontTypeIndex:index
    })
  },

  toDetail: co.wrap(function* (e) {
  try {
    let content = this.data.content.trim()
    console.log(content)
    if (content == '') {
      wx.showModal({
        title: '提示',
        content: '请输入内容',
        confirmColor: '#FFE27A',
        showCancel: false
      })
      return
    }
    console.log(content)
    this.longToast.toast({
      type:'loading'
    })
    console.log(1111)
    let type = e.currentTarget.id
    console.log(type)

      let params = {
        is_async:false,
        type: type,
        content: content,
        version:true,
        feature_key: 'custom_copybook'
      }
      if(this.data.fontList[this.data.fontTypeIndex].type!='kt'){
        params.font = this.data.fontList[this.data.fontTypeIndex].type
      }
      console.log(params)
      const resp = yield api.processes(params)
      if (resp.code == 80000) {
        this.longToast.toast()
        return this.setData({
          iosModal: true,
        })
      } else if (resp.code != 0) {
        throw (resp)
      }
      let images = resp.res.images
      this.longToast.toast()
      wxNav.navigateTo('/pages/package_feature/copy_book/detail',{
        title:'自定义练习',
        sn:resp.res.sn,
        type:resp.res.type,
        images:common_util.encodeLongParams(images),
        custom:true,
        user_share_qrcode:common_util.encodeLongParams(this.data.user_share_qrcode)
      })
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  toList: co.wrap(function* (e) {
    let title = this.data.copybookSets[e.currentTarget.id].name
    let sn = this.data.copybookSets[e.currentTarget.id].sn
    wxNav.navigateTo('/pages/package_feature/copy_book/list',{
      title:title,
      sn:sn,
      user_share_qrcode:common_util.encodeLongParams(this.data.user_share_qrcode)
    })
  }),

  toCommonSense: co.wrap(function* (e) {
    wxNav.navigateTo(`/pages/package_feature/copy_book/commonSense`)
  }),

  toShare: co.wrap(function* (e) {
    const info = yield getUserInfo()
    wxNav.navigateTo(`/pages/package_feature/copy_book/post`,{
      user_share_qrcode:common_util.encodeLongParams(this.data.user_share_qrcode),
      word_count:this.data.statistics[0].value,
      day_count:this.data.statistics[1].value,
      print_count:this.data.statistics[2].value,
      avatarUrl:info.userInfo.avatarUrl,
      nickName:info.userInfo.nickName,
    })
  }),

  backToHome: function () {
    try {
      wxNav.switchTab({
        url: '/pages/index/index'
      })
    } catch (e) {
      console.log(e)
    }
  },
  onUnload: function () {
    event.remove('Authorize', this)
  },
  closeIosTip: function () {
    if (this.data.iosModal) {
      this.setData({
        iosModal: false
      })
    }
  }

})
