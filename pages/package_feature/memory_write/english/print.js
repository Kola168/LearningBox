"use strict"

const app = getApp()
import { regeneratorRuntime, co, util, wxNav, storage } from '../../../../utils/common_import'
import api from '../../../../network/restful_request'
import graphql from '../../../../network/graphql_request'
const showModal = util.promisify(wx.showModal)
const saveImageToPhotosAlbum = util.promisify(wx.saveImageToPhotosAlbum)
const downloadFile = util.promisify(wx.downloadFile)
const getSetting = util.promisify(wx.getSetting)
const getUserInfo = util.promisify(wx.getUserInfo)
const PRINT_MAX = 30
Page({
  data: {
    images: [],
    savable: true,
    hasPhoneNum: null,
    currentImgIndex: 0,
    currentTemplateType: 'yyz',
    templateTypes: ['yyz', 'zyy'],
    printCount: 1,
    hasAuthPhoneNum: false,
    isFullScreen: false,
    areaHeight: 0,
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png'
    }
  },
  onLoad(query) {
    this.weToast = new app.weToast()
    this.sns = JSON.parse(decodeURIComponent(query.sns))
    let topBarHeight = app.navBarInfo.topBarHeight,
      safeArea = app.isFullScreen ? 30 : 0
    this.setData({
      areaHeight: app.sysInfo.screenHeight - topBarHeight - safeArea,
      isFullScreen: app.isFullScreen
    })
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
  templateChoose: co.wrap(function*(e) {
    let currentTemplateType = e.currentTarget.id
    this.setData({
      currentTemplateType,
      currentImgIndex: 0
    })
    this.getWritePreview()
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
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let userData = yield getUserInfo()
      let params = {
        featureKey: 'guess_write',
        resourceOrderType: 'GuessWrite',
        resourceAttribute: {
          originalUrl: this.previewPdfUrl,
          copies: this.data.printCount,
          categorySns: this.sns,
        }
      }
      let resp = yield graphql.createResourceOrder(params)
      this.weToast.hide()
      wxNav.navigateTo('/pages/finish/sourcefinish', {
        type: 'english_memory_write',
        state: resp.createResourceOrder.state,
        media_type: 'memory_write',
        avatarUrl: encodeURIComponent(JSON.stringify(userData.userInfo.avatarUrl)),
        nickName: userData.userInfo.nickName,
      })
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }

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
    wx.showLoading({
      title: '请稍等'
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
      type: 'loading'
    })
    try {
      let currentTemplateType = this.data.currentTemplateType,
        params = {
          feature_key: 'guess_write',
          category_sns: this.sns,
          language_type: 'en',
          en_type: currentTemplateType
        }
      let resp = yield api.synthesisWorker(params)
      if (resp.code !== 0) {
        throw (resp)
      }
      this.weToast.hide()
      this.setData({
        images: resp.res.image_urls
      })
      this.previewPdfUrl = resp.res.pdf_url
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  })
})