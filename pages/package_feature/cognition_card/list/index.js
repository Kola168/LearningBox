"use strict"

const app = getApp()
import { regeneratorRuntime, co, util, wxNav, storage } from '../../../../utils/common_import'
import commonRequest from '../../../../utils/common_request'
const showModal = util.promisify(wx.showModal)
import api from '../../../../network/restful_request'
Page({
  data: {
    showModal: false,
    loadReady: false,
    cognitionCardImgs: [],
    printerAlias: '3nfe8xk3b6vew',
    appId: 'wxde848be28728999c',
    shopId: 24056376,
    hasAuthPhoneNum: false,
    confirmModal: {
      isShow: false,
      hasCancel: true,
      cancelText: '选购相纸',
      confirmText: '开始制作',
      title: '打印前请选择LOMO相纸',
      image: 'https://cdn-h.gongfudou.com/LearningBox/main/confirm_print_lomo.png'
    }
  },
  onLoad(query) {
    this.weToast = new app.weToast()
    let cognitionCardImgs = storage.get('literacy_card')
    this.templateSn = query.sn
    let isFull = query.isFull == 1 ? true : false
    if (isFull) {
      wx.showModal({
        title: '提示',
        content: '自定义认知卡一次最多制作18张，请删减后继续制作',
        confirmColor: '#FFE27A',
        showCancel: false
      })
    }
    this.setData({
      cognitionCardImgs: cognitionCardImgs,
      loadReady: true
    })
  },
  onShow: function() {
    let hasAuthPhoneNum = Boolean(storage.get('hasAuthPhoneNum'))
    this.hasAuthPhoneNum = hasAuthPhoneNum
    this.setData({
      hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
    })
  },
  toShopping: function() {
    wxNav.navigateTo(`/pages/cart/transit/transit?pageType=goodsDetail&goodsId=${this.data.printerAlias}&openId=${app.openId}&shopId=${this.data.shopId}&appId=${this.data.appId}`)
  },
  toEdit(e) {
    let dataset = e.currentTarget.dataset,
      editUrl = dataset.url,
      index = dataset.index,
      name = dataset.name,
      navUrl = `../edit/index`
    wxNav.redirectTo(navUrl, {
      sn: this.templateSn,
      type: 'custom',
      index: index,
      hasEdit: 1,
      cardName: name,
      editUrl: encodeURIComponent(JSON.stringify(editUrl))
    })
  },
  deleteImg: co.wrap(function*(e) {
    try {
      let images = this.data.cognitionCardImgs
      let index = e.currentTarget.id
      let del = yield showModal({
        title: '确认删除',
        content: '确定删除这张照片吗',
        confirmColor: '#FFE27A'
      })
      if (!del.confirm) {
        return
      }
      images.splice(index, 1)
      this.setData({
        cognitionCardImgs: images
      })
    } catch (error) {
      util.showError(error)
    }
  }),
  preConfirm() {
    if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
      return
    }
    if (this.data.cognitionCardImgs.length === 0) {
      wx.showModal({
        title: '提示',
        content: '暂时没有认知卡可以打印，快去制作',
        confirmText: '知道了',
        confirmColor: '#FFE27A',
        showCancel: false
      })
      return
    }
    let hideConfirmPrintBox = Boolean(storage.get("hideConfirmPrintBox"))
    if (hideConfirmPrintBox) {
      this.print()
    } else {
      this.setData({
        ['confirmModal.isShow']: true
      })
    }
  },
  getPhoneNumber: co.wrap(function*(e) {
    // yield app.getPhoneNum(e)
    storage.put("hasAuthPhoneNum", true)
    this.hasAuthPhoneNum = true
    this.setData({
      hasAuthPhoneNum: true
    })
    this.preConfirm()
  }),
  print: co.wrap(function*() {
    this.setData({
      showModal: false
    })
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let imgs = this.data.cognitionCardImgs,
        reImgs = []
      for (let i = 0; i < imgs.length; i++) {
        let imgObj = {
          originalUrl: imgs[i].url,
          printUrl: imgs[i].url
        }
        reImgs.push(imgObj)
      }
      let resp = yield commonRequest.createOrder('literacy_card', reImgs)
      this.weToast.hide()
      if(resp.createOrder.state) {
        wxNav.redirectTo(`/pages/index/index`)
      }
      // wxNav.redirectTo(`../../../../finish/index`, {
      //   media_type: 'literacy_card',
      //   state: resp.state,
      //   type: 'literacy_card'
      // })
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  toAdd() {
    let len = this.data.cognitionCardImgs.length
    if (len >= 18) {
      wx.showModal({
        title: '提示',
        content: '一次最多打印18张认知卡哦~',
        confirmColor: '#FFE27A',
        showCancel: false
      })
    } else {
      let url = `../edit/index`
      wxNav.redirectTo(url, {
        sn: this.templateSn,
        type: 'custom',
        hasEdit: 0,
        editUrl: ''
      })
    }
  },
  hideModal() {
    this.setData({
      showModal: false
    })
  },
  setStorageImgs() {
    storage.put('literacy_card', this.data.cognitionCardImgs)
  },
  onHide() {
    this.setStorageImgs()
  },
  onUnload() {
    this.setStorageImgs()
  }
})