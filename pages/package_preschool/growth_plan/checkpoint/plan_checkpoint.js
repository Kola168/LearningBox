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
    isShadowOpcity: false, //是否显示透明层
    isShowBottomBtn: false, //是否显示底部按钮
    checkpointBg: 'https://cdn-h.gongfudou.com/LearningBox/preschool/growth_plan_step_bg.png', //背景图
    shadowOpcityImg: '../../images/growth_plan_lock.png', //透明遮罩层上的图片
    btnImgUrl:'',
    modal: {
      title: '畅享月度合辑',
      desc: '每日一练，每日涨知识',
    },
    showMemberToast: false, //显示会员弹窗
    isPreschoolMember:false,
    userPlanSn: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
      this.planSn = options.planSn
    event.on('getPlan',this,()=>{
      this.getPlanDetail()
    })
  }),
  onShow:co.wrap(function*(){
    try {
      const respMember = yield gragql.getUserMemberInfo()
      const resp = yield gql.getPlan(this.planSn)
      let isMember = respMember.currentUser.isPreschoolMember
      this.setData({ 
        isMember: isMember,
        checkpoints: resp.plan.planShowContents,
        isSuscribe: resp.plan.subscription,
        userPlanSn: resp.plan.userPlanSn
      })
      if(isMember){
        let memberToast = this.selectComponent('#memberToast')
        memberToast.checkAuthMember()
      }
    } catch (error) {
      this.longToast.toast()
      util.showError(error)
    }
  }),

  /* 去订阅 */
  toSubscribe: co.wrap(function* () {
    this.longToast.toast({
      type:'loading'
    })
    try {
      if(this.data.isMember){
        let res = yield gql.joinPlan(this.planSn)
        this.longToast.hide()
        event.emit('subscribeList')
        // this.longToast.toast({
        //   type:'loading',
        //   duration:6000,
        //   title:'已订阅！'
        // })
        this.setData({
          isSuscribe:true,
          userPlanSn:res.joinPlan.userPlan.sn
        })
      }else{
        this.longToast.hide()
        let memberToast = this.selectComponent('#memberToast')
        memberToast.checkAuthMember()
      }
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
    
  }),

  /** 自动打印 */
  setTimedPrint: co.wrap(function* () {
      wxNav.navigateTo(`/pages/package_preschool/growth_plan/timed_print/timed_print`,{
        planSn:this.data.userPlanSn
      })
  }),

  /**打印详情 */
  toPrintDetail: co.wrap(function* (e) {
    try {
      let clickable = this.data.checkpoints[e.currentTarget.dataset.index].isShow
      if(clickable){
        wxNav.navigateTo(`/pages/package_preschool/growth_plan/checkpoint/plan_detail`, {
          sn:e.currentTarget.dataset.sn,
          userPlanSn: this.data.userPlanSn,
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
  onUnload(){
    event.remove('getPlan',this)
  }
})