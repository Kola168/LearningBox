const app = getApp()
import { regeneratorRuntime, co, util, wxNav } from '../../../utils/common_import'
import gqlDevice from '../../../network/graphql/device'
Page({
  data: {
    navBarTitle: '长按打印设置',
    hasSetting: false,
    longpressSetting: {},
    loadReady: false,
    modalObj: {
      isShow: false,
      title: '重要提醒',
      hasCancel: true,
      content: '关闭后，每次都需要您进入公众号手动确认后才能打印哦～'
    }
  },
  onLoad(query) {
    this.weToast = new app.weToast()
    this.deviceSn = query.sn
    this.getLongpressSetting()
  },
  // 获取长按打印设置
  getLongpressSetting: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield gqlDevice.getLongPressSetting(this.deviceSn)

      this.setData({
        longpressSetting: res.currentUser.devices[0],
        loadReady: true
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  // 开启长按打印
  openSettingLongpress: co.wrap(function*(e) {
    let flag = e.currentTarget.id === 'open' ? 1 : 0
    this.updateLongpressSetting({
      currentTarget: {
        dataset: {
          key: 'autoPressPrint',
          val: flag
        }
      }
    })
  }),

  updateLongpressSetting: co.wrap(function*(e) {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let setKey = e.currentTarget.dataset.key,
        setVal = Boolean(Number(e.currentTarget.dataset.val))
      let res = yield gqlDevice.updateDeviceSetting(this.deviceSn, {
        [setKey]: setVal
      }, 'autoPressPrint,pressPrintColor,pressPrintDuplex')
      let setting = res.updateDeviceSetting.device
      this.setData({
        longpressSetting: setting,
        hasSetting: true
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),


  handleLongpressSwitch() {
    let switchFlag = this.data.longpressSetting.autoPressPrint
    if (switchFlag) {
      this.setData({
        ['modalObj.isShow']: true
      })
    } else {
      this.openSettingLongpress({
        currentTarget: {
          id: 'open'
        }
      })
    }
  },
  confirmModal() {
    this.openSettingLongpress({
      currentTarget: {
        id: 'close'
      }
    })
  },
  cancelModal() {
    this.setData({
      ['modalObj.isShow']: false
    })
  }
})