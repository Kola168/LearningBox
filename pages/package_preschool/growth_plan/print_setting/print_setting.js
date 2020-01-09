// pages/package_preschool/print_setting/print_setting.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  wxNav,
  util
} from '../../../../utils/common_import'
const showModal = util.promisify(wx.showModal)
import gql from '../../../../network/graphql/preschool'
import Logger from '../../../../utils/logger.js'
const logger = new Logger.getLogger('pages/package_preschool/growth_plan/print_setting/print_setting')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    printNumber: 1, //打印份数
    colorLists: ['黑白', '全彩'], //色彩选择
    focus: false,
    inputValueStart: 1, //打印范围起始页
    inputValueEnd: 1, //打印范围结束页
    chooseColor: 0, //默认选择打印的色彩
    isFullScreen: false, //iphoneX底部button兼容性
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: co.wrap(function* (options) {

    this.userPlanSn = this.options.userPlanSn
    this.featureKey= this.options.featureKey
    this.contentImagesLength= this.options.contentImagesLength
    console.log('8888', this.userPlanSn)
    console.log('featureKey2202020', this.featureKey)

    this.longToast = new app.weToast
    this.setData({
      isFullScreen: app.isFullScreen
    })

  }),

  /** 减少份数 */
  decreaseNum() {
    this.data.printNumber > 1 && this.setData({
      printNumber: this.data.printNumber - 1
    })
  },

  /** 增加份数 */
  increaseNum() {
    if (this.data.printNumber < 30) {
      this.setData({
        printNumber: this.data.printNumber + 1
      })
    } else {
      wx.showModal({
        content: '最多可以打印30份哦~',
        showCancel: false
      })
    }
  },

  /** 色彩选择 */
  chooseColor(e) {
    let index = e ? e.currentTarget.id : 1
    console.log('======选择', this.data.colorLists[index])
    this.setData({
      chooseColor: index
    })
  },

  /** input输入 */
  bindKeyInputStart: function (e) {
    console.log('携带value值为：', e.detail.value)
    this.setData({
      inputValueStart: e.detail.value
    })
  },
  bindKeyInputEnd: function (e) {
    console.log('携带value值为：', e.detail.value)
    this.data.inputValueEnd = e.detail.value
    if (this.data.inputValueStart <= this.data.inputValueEnd) {
      this.setData({
        inputValueEnd: this.data.inputValueEnd
      })
    } else {
      wx.showModal({
        title: '不能小于起始页',
        content: '',
        showCancel: false
      })
    }
  },

  /**
   * 确认打印
   */
  confirmPrint: co.wrap(function* () {
      // this.longToast.toast({
      //   type: 'loading'
      // })

      let params = {

        // featureKey: featureKey,
        resourceOrderType: 'Resource',
        resourceAttribute: {
          resourceType: 'Plan',
          // sn: this.data.detail.sn,
          printNumber: this.data.documentPrintNum,
          inputValueStart: this.data.startPrintPage,
          inputValueEnd: this.data.endPrintPage,
          // duplex:that.data.duplexcheck
        }



        // printNumber: this.data.printNumber,
        // inputValueStart: this.data.inputValueStart,
        // inputValueEnd: this.data.inputValueEnd,
        // colorLists: [{
        //   chooseColor: 0
        // }, {
        //   chooseColor: 1
        // }]
      }
      try {
        console.log(889989898)
      // const resp = yield gql.createResourceOrder(params)
      const resp = yield gql.createResourceOrder(params)
      console.log('respsssf========',resp)
      this.setData({
        fileName:resp.filename,
        printNumber: resp.copies,
        inputValueStart: resp.startPage,
        inputValueEnd: resp.endPage,
        colorLists: resp.color
        // colorLists: resp.colorLists[chooseColor]
      })
      console.log(resp)
      router.redirectTo('/pages/finish/index', {
        // type: 'photo_answer',
        // media_type: 'photo_answer',
        // state: resp.createOrder.state
      })
      this.longToast.hide()

    } catch (error) {
      console.log(error)
    }
  }),
})