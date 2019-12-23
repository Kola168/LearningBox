"use strict"

const app = getApp()
import { regeneratorRuntime, co, util, wxNav, storage } from '../../../../utils/common_import'
// const common_util = require('../../../../../utils/common_util')
import api from '../../../../network/restful_request'
const getUserInfo = util.promisify(wx.getUserInfo)
const showModal = util.promisify(wx.showModal)
const saveImageToPhotosAlbum = util.promisify(wx.saveImageToPhotosAlbum)
const downloadFile = util.promisify(wx.downloadFile)
const getSetting = util.promisify(wx.getSetting)
const PRINT_MAX = 30
Page({
  data: {
    images: [],
    savable: true,
    hasAuthPhoneNum: null,
    currentImgIndex: 0,
    printCount: 1,
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png'
    }
  },
  onLoad(query) {
    this.sns = JSON.parse(query.sns)
    this.genre = query.type
    this.type = query.type === 'html' ? 'ymz' : ''
    this.getWritePreview()
  },
  onShow() {
    let hasAuthPhoneNum = Boolean(storage.get('hasAuthPhoneNum'))
    this.hasAuthPhoneNum = hasAuthPhoneNum
    this.setData({
      hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
    })
  },
  tabSlide: function(e) {
    this.setData({
      currentImgIndex: e.detail.current
    })
  },
  turnImg: co.wrap(function*(e) {
    let num = this.data.currentImgIndex;
    let turn = e.currentTarget.dataset.turn;
    if (turn === 'next') {
      if (num < this.data.images.length - 1) {
        num++;
      } else {
        return
      }
    } else if (turn === 'prev') {
      if (num > 0) {
        num--;
      } else {
        return
      }
    }
    this.setData({
      currentImgIndex: num
    })
  }),
  handlePrintCount(e) {
    let type = e.currentTarget.id,
      printCount = this.data.printCount
    if (type === 'increase') {
      if (printCount < PRINT_MAX) {
        printCount++
        this.setData({
          printCount: printCount
        })
      } else {
        wx.showToast({
          title: `最多打印${PRINT_MAX}份`,
          icon: 'none'
        })
      }
    } else {
      if (printCount > 1) {
        printCount--
        this.setData({
          printCount: printCount
        })
      }
    }
  },
  showConfirmMdal() {
    if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
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
  print: co.wrap(function*() {
    this.weToase.toast({
      type: 'loading'
    })
    try {
      let userData = yield getUserInfo(),
        endPage = this.data.images.length
      let params = {
        openid: app.openId,
        media_type: 'cn_guess_write',
        resourceable: {
          type: 'subject_unit',
          sn: this.sn
        },
        setting: {
          number: this.data.printCount,
          start_page: 1,
          end_page: endPage
        },
        from: 'mini_app',
      }
      let resp = yield api.printMemoryWrite(params)
      if (resp.code !== 0) {
        throw (resp)
      }
      this.weToast.hide()
      wxNav.navigateTo('/pages/finish/sourdefinish', {
        type: 'english_memory_write',
        state: resp.order.state,
        media_type: 'memory_write',
        avatarUrl:userData.userInfo.avatarUrl,
        nickName:userData.userInfo.nickName,
        count:resp.statistics.day_count,
        printed_count:resp.statistics.print_count,
        user_share_qrcode:common_util.encodeLongParams(resp.qrcode)
      })
      // wx.redirectTo({
      //   url: `/pages/finish/oral_mistake_index?type=english_memory_write&&state=${resp.order.state}&media_type=memory_write&avatarUrl=${userData.userInfo.avatarUrl}&nickName=${userData.userInfo.nickName}&count=${resp.statistics.day_count}&printed_count=${resp.statistics.print_count}&user_share_qrcode=${common_util.encodeLongParams(resp.qrcode)}`
      // })
    } catch (error) {
      let err = error
      if (err.code === 60001) {
        err.message = '文档转换失败'
      }
      this.weToast.hide()
      util.showError(err)
    }
  }),
  getPhoneNumber: co.wrap(function*(e) {
    yield app.getPhoneNum(e)
    wx.setStorageSync("hasAuthPhoneNum", true)
    this.hasAuthPhoneNum = true
    this.setData({
      hasAuthPhoneNum: true
    })
    this.showConfirmMdal()
  }),
  allowSave: function(e) {
    if (!e.detail.authSetting['scope.writePhotosAlbum']) {
      return
    }
    this.setData({
      savable: true
    })
  },
  saveImg: co.wrap(function*() {
    this.weToast.toast({
      type:'loading'
    })
    try {
      let images = this.data.images
      for (let i = 0; i < images.length; i++) {
        let data = yield downloadFile({
          url: images[i]
        })
        let tempPath = data.tempFilePath;
        yield saveImageToPhotosAlbum({
          filePath: tempPath
        })
        if (i == (images.length - 1)) {
          this.weToast.hide()
          wx.showToast({
            title: '保存成功',
            icon: 'none'
          })
        }
      }
    } catch (e) {
      this.weToast.hide()
      let resp = yield getSetting()
      if (resp.authSetting['scope.writePhotosAlbum'] == false) {
        this.setData({
          savable: false
        })
        return
      }
      yield showModal({
        title: '保存失败',
        content: '请稍后重试',
        showCancel: false,
        confirmColor: '#fae100',
      })
    }
  }),
  getWritePreview: co.wrap(function*() {
    this.weToast.toast({
      type:'loading'
    })
    try {
      let resp = yield api.getWritePreview(app.openId, this.sns, this.genre, this.type)
      if (resp.code !== 0) {
        throw (resp)
      }
      this.weToast.hide()
      this.setData({
        images: resp.res.images
      })
      this.sn = resp.res.sn
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  })
})