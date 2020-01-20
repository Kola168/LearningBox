// pages/package_preschool/timed_print/timed_print.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  wxNav,
  util
} from '../../../../utils/common_import'
const _ = require('../../../../lib/underscore/we-underscore')
const showModal = util.promisify(wx.showModal)
import graphql from '../../../../network/graphql_request'
import gql from '../../../../network/graphql/preschool'
// import graphgql from '../../../../network/graphql/feature'
import Logger from '../../../../utils/logger.js'
const logger = new Logger.getLogger('pages/package_preschool/growth_plan/checkpoint/plan_checkpoint')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowDetail: false, //自动打印是否显示详情设置,默认false
    printNumber: 1, //打印份数
    times: ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'], //时间列表选择
    currentTime: '16:00', //默认打印时间
    frequencyLists: [{
      day: 1,
      title: '一天一关'
    }, {
      day: 2,
      title: '两天一关'
    }, {
      day: 3,
      title: '三天一关'
    }], //频率选择
    chooseFrequency: 0, //默认选择打印频率
    isShowTimeLists: false, //是否显示时间列表
    isFullScreen: false, //iphoneX底部button兼容性
    name: '请填写真实昵称', //没有填写昵称时
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    this.setData({
      isFullScreen: app.isFullScreen
    })
    this.planSn = options.planSn
    this.userPlanSn = options.userPlanSn
    try {
      let resp = yield gql.getUserPlan(this.userPlanSn)
      this.sn= resp.userPlan.sn
      this.subscription = resp.userPlan.subscription
      if (resp.userPlan.subscription) {
        this.setData({
          printNumber: resp.userPlan.subscription.copies,
          isShowDetail: resp.userPlan.subscription.enable,
          chooseFrequency: resp.userPlan.subscription.intervalDay - 1,
          currentTime: resp.userPlan.subscription.timing,
        })
      }
      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),
  onShow:co.wrap(function*(){
    this.longToast.toast({
      type:'loading'
    })
    try {
      let respGrah = yield graphql.getUser()
      if (respGrah.currentUser.selectedKid.name == '未命名') {
        respGrah.currentUser.selectedKid.name = '请填写真实昵称'
      }
      this.setData({
        name: respGrah.currentUser.selectedKid.name
      })
      this.longToast.hide()
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  /** 获取昵称 */
  getName: co.wrap(function* () {
    wxNav.navigateTo(`/pages/package_common/account/name_edit`)
  }),

  /** 自动打印开关 */
  setPrint() {
    this.setData({
      isShowDetail: !this.data.isShowDetail
    })
    if (this.data.isShowDetail == false) {
      this.setData({
        printNumber: this.data.printNumber,
        currentTime: this.data.currentTime,
        chooseFrequency: this.data.chooseFrequency
      })
    }
  },

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

  /** 打印时间 */
  printTime(e) {
    logger.info('发送选择改变，携带值为', e)
    logger.info('发送选择改变，携带值为', e.detail.value)
    let idx = parseInt(e.detail.value)
    this.setData({
      isShowTimeLists: true,
      currentTime: this.data.times[idx]
    })
    logger.info('发送选择改变，携带值为', this.data.currentTime)
  },

  /** 打印频率 */
  chooseFrequency: co.wrap(function* (e) {
    let index = e.currentTarget.dataset.index
    logger.info('======选择的频率', this.data.frequencyLists[index])
    this.setData({
      chooseFrequency: index
    })
  }),


  /**
   * 定时打印设置后的确认
   */
  confirmTimedSetting: co.wrap(function* () {

    console.log('1111111111this.userPlan',this.sn)
    // wxNav.navigateTo('/pages/package_preschool/growth_plan/checkpoint/plan_checkpoint')
    // this.longToast.toast({
    //   type:'loading'
    // })
    try {
      const respSubscript = yield gql.joinSubscription({
        // sn: this.userPlanSn,
        sn:this.sn,
        subscriptionResource: 'user_plan',
        // subscriptionResource: 'timed_task',
        subscription: {
          copies: this.data.printNumber,
          enable: this.data.isShowDetail,
          intervalDay: this.data.frequencyLists[this.data.chooseFrequency].day,
          timing: this.data.currentTime
        }
      })
      console.log('respSubscript.joinSubscription.state',respSubscript.joinSubscription)
      if (respSubscript.joinSubscription.state) {
        this.longToast.toast({
          title: '自动打印创建成功',
          duration: 2000,
          icon: false,
          mask: true
        })
      } else {
        this.longToast.toast({
          title: '自动打印创建失败',
          duration: 2000,
          icon: false,
          mask: true
        })
      }
      // wxNav.navigateBack()
      this.longToast.hide()

    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  })
})