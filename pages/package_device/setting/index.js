const app = getApp()
const event = require('../../../lib/event/event')
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../utils/common_import'
import graphql from '../../../network/graphql/device'
Page({
  data: {
    device: {
      isAdmin: false
    },
    settingType: "base",
    modalType: "",
    printType: "ep320",
    renameVal: "",
    modalObj: {
      isShow: false,
      title: '',
      image: '',
      content: '',
      slotContent: false,
      confirmText: ''
    }
  },
  onLoad: function (query) {
    this.weToast = new app.weToast()
    this.resetModalObj = this.data.modalObj
    this.deviceSn = query.sn
    this.getDeviceDetail()
  },

  getDeviceDetail: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getDeviceDetail(this.deviceSn)
      this.weToast.hide()
      let device = res.currentUser.devices[0]
      this.pressPrint = res.currentUser.pressPrint
      this.setData({
        device
      })
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),

  updateSetting(e) {
    let setKey = e.currentTarget.dataset.key,
      setVal = e.currentTarget.dataset.val
    this.updateDeviceSetting(setKey, setVal)
  },

  /**
   * 更新打印机设置
   * @param {string} setKey required 设置的选项
   * @param {string} setVal required 设置选项值
   */
  updateDeviceSetting: co.wrap(function* (setKey, setVal) {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      yield graphql.updateDeviceSetting(this.deviceSn, {
        [setKey]: setVal
      }, setKey)
      if (setKey === 'connectTo') {
        setKey = 'connectThrough'
      }
      this.setData({
        [`device.${setKey}`]: setVal
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),

  // 切换设置类型
  changeSettingType(e) {
    let settingType = e.currentTarget.dataset.type
    this.setData({
      settingType
    })
  },

  // 弹窗提示
  showModal: co.wrap(function* (e) {
    try {
      let modalType = e.currentTarget.id,
        modalObj = Object.assign({}, this.resetModalObj),
        extraData = {}
      this.modalType = modalType
      switch (modalType) {
        case 'longPrint':
          modalObj.title = "长按打印设置"
          modalObj.content = "微信对话框中的文档或图片可以直接长按打印，打印时的默认设置可在此处修改"
          break;
        case "clearQueue":
          modalObj.title = "确认清空当前打印任务吗？"
          modalObj.content = "确认后将清空发送给小白的所有打印任务，但打印机正在打印的任务无法清空"
          modalObj.hasCancel = true
          modalObj.confirmText = "确认清空"
          break;
        case "unbindDevice":
          modalObj.title = "解绑设备"
          modalObj.content = "解绑后您将无法再使用该设备进行打印，是否确认？"
          modalObj.hasCancel = true
          modalObj.confirmText = "确认解绑"
          break;
        case "positiveReverseOrder":
          modalObj.title = "正序逆序是指文档打印时从第一页，开始打印还是从最后一页开始打印"
          modalObj.image = "https://cdn-h.gongfudou.com/LearningBox/device/device_positive_reverse.png"
          modalObj.content = "建议选择逆序（从最后一页开始打印），打印完成后无需手动调整页数顺序，更方便您的浏览哦～"
          break;
        case "noaduit":
          modalObj.title = "使用者发送的打印任务，需要管理员审核才能打印"
          modalObj.slotContent = true
          break;
        case "rename":
          modalObj.title = "修改打印机名称"
          modalObj.hasCancel = true
          modalObj.slotContent = true
          extraData.renameVal = ''
          break;
        case "connectThrough":
          let switchFlag = this.data.device.connectThrough === 'pc' ? true : false
          // 重新显示提示框
          this.reSwitchComputerPrint = false
          if (switchFlag) {
            if (e.hasComputerStatus) {
              modalObj.title = "您现在已处于电脑打印状态"
              modalObj.content = "此时在小程序上发送的打印任务暂时无法打印哦"
            } else {
              let type = this.data.device.connectThrough === 'box' ? 'pc' : 'box'
              yield this.updateDeviceSetting('connectTo', type)
              modalObj.title = "电脑打印状态已关闭"
              modalObj.content = "小程序已恢复打印状态"
            }
          } else {
            modalObj.title = "电脑端打印请提前检查驱动是否安装完成"
            modalObj.content = "开启电脑打印状态后，小程序的打印状态将暂停"
            modalObj.confirmText = "知道了"
            this.reSwitchComputerPrint = true
          }
          break;
      }
      modalObj.isShow = true
      let dataObj = {
        modalObj,
        modalType
      }
      dataObj = Object.assign(dataObj, extraData)
      this.setData(dataObj)
    } catch (error) {
      console.log(error)
    }
  }),

  // 确认弹窗
  confirmModal: co.wrap(function* () {
    let modalType = this.modalType
    switch (modalType) {
      case "connectThrough":
        if (this.reSwitchComputerPrint) {
          let type = this.data.device.connectThrough === 'box' ? 'pc' : 'box'
          yield this.updateDeviceSetting('connectTo', type)
          this.showModal({
            currentTarget: {
              id: "connectThrough"
            },
            hasComputerStatus: true
          })
        }
        break;
      case "rename":
        this.comfirmRename()
        break;
      case "clearQueue":
        this.clearJobs()
        break;
      case "unbindDevice":
        this.unbindDevice()
        break;
    }
  }),

  // 确认修改名称
  comfirmRename() {
    if (this.data.renameVal.length > 0) {
      this.updateDeviceSetting('name', this.data.renameVal)
      event.emit('deviceChange')
    } else {
      this.setData({
        ['modalObj.isShow']: true
      })
      wx.showToast({
        title: '请输入打印机名称',
        icon: 'none'
      })
    }
  },

  // 解绑打印机
  unbindDevice: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      yield graphql.unbindDevice(this.deviceSn)
      this.weToast.hide()
      event.emit('deviceChange')
      wxNav.navigateBack()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),

  // 获取重命名value
  getRenameVal(e) {
    let name = e.detail.value.trim()
    this.setData({
      renameVal: name
    })
  },

  // 设备离线解决说明
  toOfflineSolve() {
    wxNav.navigateTo(`../offline/index`)
  },

  // 跳转
  toNextPage(e) {
    let pageKey = e.currentTarget.dataset.key,
      url = '',
      params = {}
    switch (pageKey) {
      case "longpress":
        url = `../longpress/index`
        params.sn = this.deviceSn
        params.pressPrint = Number(this.pressPrint)
        break;
      case "offlineSolve":
        url = `../offline/index`
        break;
      case "shareManage":
        url = `../share_manage/index`
        params.sn = this.deviceSn
        break;
      case "share":
        url = `../share/index`
        params.shareQrcode = encodeURIComponent(JSON.stringify(this.data.device.shareQrcode))
        params.deviceSn = this.deviceSn
        break;
      case "reNetwork":
        url = `../network/index/index`
        break;
      case "deviceMaintain":
        url = `../maintain/index/index`
        params.sn = this.deviceSn
        params.updateInfo = this.data.device.updateInfo
        break;
    }
    wxNav.navigateTo(url, params)
  },

  // 清空打印队列
  clearJobs: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.clearJobs(this.deviceSn)
      this.weToast.hide()
      if (res.cancelJob.state) {
        wx.showToast({
          title: '已清空',
          icon: 'none'
        })
      }
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  })
})