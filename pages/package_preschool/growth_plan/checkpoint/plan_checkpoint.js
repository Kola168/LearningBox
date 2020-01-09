// pages/package_preschool/growth_plan/checkpoint/plan_checkpoint.js
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
const logger = new Logger.getLogger('pages/package_preschool/growth_plan/checkpoint/plan_checkpoint')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    checkpoints: '',
    isShow: false, //是否显示锁图
    isMember: false, //是否会员
    isSuscribe: false, //是否订阅
    isShowPrint: true, //自动打印按钮是否显示
    isShadowOpcity: false, //是否显示透明层
    isShowBottomBtn: true, //是否显示底部按钮
    checkpointBg: 'https://cdn-h.gongfudou.com/LearningBox/preschool/growth_plan_step_bg.png', //背景图
    shadowOpcityImg: '../../images/growth_plan_lock.png', //透明遮罩层上的图片
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: co.wrap(function* (options) {
    try {

      this.longToast = new app.weToast
      this.options = options
      console.log('onload', this.options)
      this.planSn = this.options.planSn
      this.userPlanSn = this.options.userPlanSn
      this.subscribe = this.options.subscribe
      logger.info('planSn====', this.planSn)
      this.getDetail(this.planSn)
    } catch (error) {
      this.longToast.weToast()
      util.showError(error)
      console.log(error)
    }
  }),

  getDetail: co.wrap(function* (planSn) {
    try {
      const resp = yield gql.getPlanContents(planSn)
      console.log('--56resp-',resp)

      this.setData({
        checkpoints: resp.planContents,
        isShadowOpcity: this.data.isShow
      })

      console.log('subscribesubscribe', this.subscribe)
      console.log('checkpointscheckpoints', this.data.checkpoints)
      if (this.subscribe == 'noSubscript') {
        this.setData({
          isSuscribe: true
        })
      }

      // this.data.checkpoints.forEach(element => {
      //   console.log('element',element)
      //   if(element.isShow){
      //     this.toPrintDetail()
      //   }else{
      //     return
      //   }
      // });




    } catch (e) {
      this.longToast.weToast()
      util.showError(e)
    }
  }),

  /** 购买会员 */
  BuyMember: co.wrap(function* () {
    wxNav.navigateTo('')
  }),

  /* 去订阅 */
  toSubscribe: co.wrap(function (e) {


    wxNav.navigateTo('/pages/package_preschool/growth_plan/timed_print/timed_print')
  }),

  /** 自动打印 */
  setTimedPrint: co.wrap(function* () {


    wxNav.navigateTo(`/pages/package_preschool/growth_plan/timed_print/timed_print`)
  }),

  /**打印详情 */
  toPrintDetail: co.wrap(function* (e) {
    let clickable = this.data.checkpoints[e.currentTarget.dataset.index].isShow
    if(clickable){
      wxNav.navigateTo(`/pages/package_preschool/growth_plan/checkpoint/plan_detail`, {
        sn:e.currentTarget.dataset.sn,
        userPlanSn: this.userPlanSn
      })
    }else{
      return
    }
  }),

})