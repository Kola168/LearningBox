// pages/package_preschool/growth_plan/checkpoint/plan_checkpoint.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  wxNav,
  util
} from '../../../../utils/common_import'
const showModal = util.promisify(wx.showModal)
const event = require('../../../../lib/event/event')
import gql from '../../../../network/graphql/preschool'
import gragql from '../../../../network/graphql_request'
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
    btnImgUrl:'',
    autoPrintBtn:false,
    isAndroid: false,
    isShowBtnCont:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    let systemInfo = wx.getSystemInfoSync()
    let isAndroid = systemInfo.system.indexOf('iOS') > -1 ? false : true
    this.setData({
      isAndroid: isAndroid
    })
    try {
      this.options = options
      this.planSn = this.options.planSn
      this.userPlanSn = this.options.userPlanSn
      this.subscribe = this.options.subscribe
      logger.info('planSn====', this.planSn)
      this.getDetail(this.planSn)
      // this.setData({
      //   isSuscribe:this.data.isSuscribe,
      //   isMember:this.data.isMember
      // })

      console.log('subscribe',this.subscribe)

    const respMember = yield gragql.getUserMemberInfo()
    this.setData({
      isMember:respMember.currentUser.isPreschoolMember
    })
    console.log('232333',respMember)
    console.log('this.data.isSuscribe',this.data.isSuscribe)
      if(this.data.isSuscribe){
        this.setData({
          autoPrintBtn:true
        })
      }else{
        this.toFunc()
      }
      this.longToast.hide()
    } catch (error) {
      this.longToast.toast()
      util.showError(error)
    }
  }),

  toFunc: co.wrap(function *(){
    this.longToast.toast({
      type:'loading'
    })
    try {
      if(this.data.isMember){
        this.btnType='subscribe',
        this.setData({
          btnImgUrl:'https://cdn-h.gongfudou.com/LearningBox/preschool/growth_plan_btn_subscribe.png'
        })
      }else{
        this.btnType='buy',
        this.setData({
          btnImgUrl:'https://cdn-h.gongfudou.com/LearningBox/preschool/growth_plan_btn_buy.png'
        })
      }
      this.longToast.hide()
    } catch (error) {
      this.longToast.toast()
      util.showError(error)
    }
  }),

  btnClick(){
    if(this.btnType === 'subscribe'){
      this.toSubscribe()
    }else if(this.btnType === 'buy'){
      this.BuyMember()
    }
  },

  getDetail: co.wrap(function* (planSn) {
    try {
      const resp = yield gql.getPlanContents(planSn)
      this.setData({
        checkpoints: resp.planContents,
        isShadowOpcity: this.data.isShow
      })
      if (this.subscribe == 'noSubscript') {
        this.setData({
          isSuscribe: false
        })
      }else{
        this.setData({
          isSuscribe: true
        })
      }
      this.longToast.hide()
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  /** 购买会员 */
  BuyMember: co.wrap(function* () {
    // if(this.data.isAndroid){
    //   wxNav.navigateTo(`/pages/package_member/member/index`,{
    //     planSn:this.planSn
    //   })
    // }
    wxNav.navigateTo(`/pages/package_member/member/index`)
  }),

  /* 去订阅 */
  toSubscribe: co.wrap(function* () {
    try {
      yield gql.joinPlan(this.planSn)
      // wxNav.navigateBack()
      event.emit('subscribeList')
      // yield gql.getPlanContents(this.planSn)

      this.longToast.toast({
        type:'loading',
        duration:6000,
        title:'已订阅！'
      })
      this.setData({
        isSuscribe:true,
        isShowBtnCont:true
      })
      this.toSetAuto()
      this.longToast.hide()
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
    
  }),

  toSetAuto:co.wrap(function *(){
    try {
      this.setData({
        // isSuscribe:true,
        autoPrintBtn:true,
        isShowBtnCont:false
      })
      this.longToast.hide()
    } catch (e) {
    console.log(e)  
    }
  }),

  /** 自动打印 */
  setTimedPrint: co.wrap(function* () {
    this.longToast.toast({
      type:'loading'
    })
    try {
      wxNav.navigateTo(`/pages/package_preschool/growth_plan/timed_print/timed_print`,{
        userPlanSn:this.userPlanSn
      })

      this.longToast.hide()
    } catch (error) {
      this.longToast.toast()
      util.showError(error)
    }
    this.longToast.hide()
  }),

  /**打印详情 */
  toPrintDetail: co.wrap(function* (e) {
    try {
      this.longToast.toast({
        type:'loading'
      })

      let clickable = this.data.checkpoints[e.currentTarget.dataset.index].isShow
      if(clickable){
        wxNav.navigateTo(`/pages/package_preschool/growth_plan/checkpoint/plan_detail`, {
          sn:e.currentTarget.dataset.sn,
          userPlanSn: this.userPlanSn,
          name:this.data.checkpoints[e.currentTarget.dataset.index].name,
          subscribe:this.subscribe
        })
      }else{
        return
      }
      this.longToast.hide()
    } catch (e) {
      this.longToast.toast()
      util.showError(encodeURIComponent)
    }
  }),

})