const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
import api from '../../../network/restful_request'
import wxNav from '../../../utils/nav'
import util from '../../../utils/util'
Page({
  data: {
    devices: [],
    settingType: "base",
    modalType: "",
    printType: "ep300",
    renameVal: "",
    // 电脑打印
    computerPrintFlag: false,
    modalObj: {
      isShow: false,
      title: '',
      showCancel: false,
      image: '',
      content: '',
      soltContent: false,
      confirmText: ''
    }
  },
  onLoad: function() {
    this.resetModalObj = this.data.modalObj
    this.weToast = new app.weToast()
  },

  // 切换设置类型
  changeSettingType(e) {
    let settingType = e.currentTarget.dataset.type
    this.setData({
      settingType
    })
  },

  // 弹窗提示
  showModal(e) {
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
          break;
        case "computerPrint":
          let switchFlag = this.data.computerPrintFlag
            // 重新显示提示框
          this.reSwitchComputerPrint = false
          if (switchFlag) {
            if (e.hasComputerStatus) {
              modalObj.title = "您现在已处于电脑打印状态"
              modalObj.content = "此时在小程序上发送的打印任务暂时无法打印哦"
            } else {
              modalObj.title = "电脑打印状态已关闭"
              modalObj.content = "小程序已恢复打印状态"
              extraData.computerPrintFlag = !switchFlag
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
  },

  // 确认弹窗
  confirmModal() {
    let modalType = this.modalType
    switch (modalType) {
      case "computerPrint":
        if (this.reSwitchComputerPrint) {
          this.setData({
            computerPrintFlag: !this.data.computerPrintFlag
          })
          this.showModal({
            currentTarget: {
              id: "computerPrint"
            },
            hasComputerStatus: true
          })
        }
        break;
      case "clearQueue":
        break;
      case "unbindDevice":
        break;
    }
  },

  // 关闭弹窗
  closeModal() {

  },

  // 获取重命名value
  getRenameVal(e) {
    console.log(e)
  },

  // 设备离线解决说明
  toOfflineSolve() {
    wxNav.navigateTo(`../offline/index`)
  },

  // 长按打印
  toNextPage(e) {
    let pageKey = e.currentTarget.dataset.key,
      url = ''
    switch (pageKey) {
      case "longpress":
        url = `../longpress/index`
        break;
      case "offlineSolve":
        url = `../offline/index`
        break;
      case "shareManage":
        url = `../share_manage/index`
        break;
      case "share":
        url = `../share/index`
        break;
      case "reNetwork":
        url = `../network/index`
        break;
    }
    wxNav.navigateTo(url)
  },
})