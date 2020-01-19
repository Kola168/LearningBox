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
import gragqlMember from '../../components/member-toast/index'

// import gragqlmember from '../../components/member-toast/index'
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
    isShowPrint: false, //自动打印按钮是否显示
    isShadowOpcity: false, //是否显示透明层
    isShowBottomBtn: false, //是否显示底部按钮
    checkpointBg: 'https://cdn-h.gongfudou.com/LearningBox/preschool/growth_plan_step_bg.png', //背景图
    shadowOpcityImg: '../../images/growth_plan_lock.png', //透明遮罩层上的图片
    btnImgUrl:'',
    autoPrintBtn:false,
    // isAndroid: false,
    isShowBtnCont:false,
    modal: {
      title: '畅享月度合辑',
      desc: '每日一练，每日涨知识',
    },
    showMemberToast: false, //显示会员弹窗
    isPreschoolMember:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    try {
      this.options = options
      this.planSn = this.options.planSn
      this.userPlanSn = this.options.userPlanSn
      this.subscribe = this.options.subscribe
      logger.info('planSn====', this.planSn)
      this.getDetail(this.planSn)
      const respMember = yield gragql.getUserMemberInfo()
      this.setData({
        isMember:respMember.currentUser.isPreschoolMember,
        isShowBtnCont:true,
        autoPrintBtn:false
      })

    if(this.subscribe == 'subscript' || this.subscribe == 'finished'){
      this.setData({
        autoPrintBtn:true,
        isShowBtnCont:false
      })
    }else{
      this.setData({
        autoPrintBtn:false,
        isShowBtnCont:true
      })
    }
      this.longToast.hide()
    } catch (error) {
      this.longToast.toast()
      util.showError(error)
    }
  }),

  getDetail: co.wrap(function* (planSn) {
    this.longToast.toast({
      type:'loading'
    })
    try {
      const resp = yield gql.getPlanContents(planSn)
      this.setData({
        checkpoints: resp.planContents
      })
      console.log('resp',resp.planContents)
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

  //判断会员
  checkMember: co.wrap(function *(){

    try{
      if(this.data.isMember){
        yield this.toSubscribe()
      }else{
        //判断会员标示
        var memberToast = this.selectComponent('#memberToast')
        memberToast.checkAuthMember(()=>{
          wxNav.navigateTo('./plan_checkpoint', {
            userPlanSn:this.userPlanSn
          })
        })
      }
    } catch(e){
      this.longToast.toast()
      util.showError(e)
    }
  }),


  /* 去订阅 */
  toSubscribe: co.wrap(function* () {
    this.longToast.toast({
      type:'loading'
    })
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
        isShowBtnCont:false
      })
      this.toSetAuto()
      this.longToast.hide()
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
    
  }),

  toSetAuto:co.wrap(function *(){
    this.longToast.toast({
      type:'loading'
    })
    try {
      this.setData({
        // isSuscribe:true,
        autoPrintBtn:true,
        isShowBtnCont:false
      })
      this.longToast.hide()
    } catch (e) {
      this.longToast.toast()
      util.showError(e) 
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
      let clickable = this.data.checkpoints[e.currentTarget.dataset.index].isShow
      if(clickable){
        wxNav.navigateTo(`/pages/package_preschool/growth_plan/checkpoint/plan_detail`, {
          sn:e.currentTarget.dataset.sn,
          userPlanSn: this.userPlanSn,
          name:this.data.checkpoints[e.currentTarget.dataset.index].name,
          subscribe:this.subscribe,
          planSn:this.planSn
        })
      }else{
        return
      }
    } catch (e) {
      this.longToast.toast()
      util.showError(encodeURIComponent)
    }
  }),

})