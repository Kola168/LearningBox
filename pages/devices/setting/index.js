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
    modalObj: {
      isShow: false,
      title: '',
      showCancel: false,
      image: '',
      soltContent: false
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
      let modalType = e.currentTarget.id
      let modalObj = Object.assign({}, this.resetModalObj)
      modalObj.isShow = true
      switch (modalType) {
        case 'longPrint':
          modalObj.title = "长按打印设置"
          modalObj.content = "微信对话框中的文档或图片可以直接长按打印，打印时的默认设置可在此处修改"
          break;
        case "clearQueue":
          modalObj.title = "确认清空当前打印任务吗？"
          modalObj.content = "确认后将清空发送给小白的所有打印任务,但打印机正在打印的任务无法清空"
          break;
        case "unbindDevice":
          modalObj.title = "解绑设备"
          modalObj.showCancel = true
          modalObj.content = "解绑后您将无法再使用该设备进行打印,是否确认？"
          break;
        case "positiveReverseOrder":
          modalObj.title = "正序逆序是指文档打印时从第一页,开始打印还是从最后一页开始打印"
          modalObj.image = "/images/positive_reverse_order.png"
          modalObj.content = "建议选择逆序（从最后一页开始打印），打印完成后无需手动调整页数顺序，更方便您的浏览哦～"
          break;
        case "noaduit":
          modalObj.title = "使用者发送的打印任务,需要管理员审核才能打印"
          modalObj.slotContent = true
          break;
        case "rename":
          modalObj.title = "修改打印机名称"
          modalObj.showCancel = true
          modalObj.slotContent = true
          break;
      }
      this.setData({
        modalObj,
        modalType
      })
    } catch (error) {
      console.log(error)
    }
  },

  // 获取重命名value
  getRenameVal(e){
    console.log(e)
  },

  // 设备离线解决说明
  toOfflineSolve(){
    wxNav.navigateTo(`../offline/index`)
  }
})