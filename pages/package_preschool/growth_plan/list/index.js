// pages/package_preschool/list/index.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  wxNav,
  util
} from '../../../../utils/common_import'
import gql from '../../../../network/graphql/preschool'
import gragql from '../../../../network/graphql_request'
const showModal = util.promisify(wx.showModal)
const event = require('../../../../lib/event/event')
import Logger from '../../../../utils/logger.js'
const logger = new Logger.getLogger('pages/package_preschool/growth_plan/list/index')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lists: [],
    subscriptList: [],
    completeList: [],
    isSuscribe: false,
    // subscription: false,
    tabToContent: 1,
    modalObj: {
      isShow: false, //是否显示
      title: '不再订阅此计划了吗？',
      content: '', //弹窗内容文字
      hasCancel: true
    },
    isMember: false, //是否会员
    showMemberToast: false, //显示会员弹窗
    isPreschoolMember:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    this.longToast.toast({
      type: "loading",
      duration: 0
    })
    this.currentTab = ''
    event.on('subscribeList',this,(res)=>{
      this.navTap({currentTarget:{
        id:0
      }})
    })
    try {
      const respMember = yield gragql.getUserMemberInfo()
      this.setData({
        isMember:respMember.currentUser.isPreschoolMember
      })
      const resp = yield gql.getPlans()
      // this.data.lists = resp.plans
      // const respUserPlans = yield gql.getUserPlans()
      this.setData({
        lists: resp.plans
      })

      this.longToast.hide()
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  /* 已完成 列表判断是否为会员 */
  toCheck: co.wrap(function *(e) {
    this.longToast.toast({
      type:'loading'
    })
    try {
      if(this.data.isMember){
        this.toProgress(e)
      }else{
        this.showMemberToast()
      }
      this.longToast.hide()
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  //弹窗
  showMemberToast:function (){
    //判断会员标示
    var memberToast = this.selectComponent('#memberToast')
    memberToast.checkAuthMember(()=>{
      wxNav.navigateTo('./../list/index', {
        userPlanSn:this.userPlanSn
      })
    })
  },

  getUserPlans: co.wrap(function* () {
    try {
      let tab = this.currentTab
      const resp = yield gql.getUserPlans(tab)
      logger.info('resp====',resp)
      let dataKey = ''
      if(tab==='subscription'){
        dataKey = 'subscriptList'
      } else if(tab==='finished'){
        dataKey = "completeList"
      } else {
        dataKey = "lists"
      }
      this.setData({
        [dataKey]: resp.userPlans
      })
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  /* 去订阅 */
  toSubscribe: co.wrap(function *(e){
    // var userPlanSn = e.currentTarget.dataset.userPlanSn
    try {
      var idx = e.currentTarget.id
      this.subscribe = e.currentTarget.dataset.subscript
      let sn = this.data.lists[idx].sn
      if(this.data.isSuscribe){
        this.toProgress(e)
      }else{
        if(this.data.isMember){
          this.toSubscribeDetail(sn)
        }else{
          this.toProgress(e)
        }
      }
    } catch (e) {
      console.log(e,'llll')
      this.longToast.toast()
      util.showError(e)
    }
  }),

  toSubscribeDetail: co.wrap(function* (sn) {
    try {
        // let respUserPlans = yield gql.getUserPlans
        // logger.info('=====', resp)
        yield gql.joinPlan(sn)
          let resp = yield gql.getPlans()
          this.setData({
            lists: resp.plans
        })
    } catch (e) {
      console.log('ooo',e)
      this.longToast.toast()
      util.showError(e)
    }
  }),

  /**闯关 */
  toProgress: co.wrap(function* (e) {
    var planSn = e.currentTarget.dataset.plansn
    var userPlanSn = e.currentTarget.dataset.userplansn
    var subscribe = e.currentTarget.dataset.subscript
    wxNav.navigateTo(
      `/pages/package_preschool/growth_plan/checkpoint/plan_checkpoint`,{
        planSn,
        userPlanSn,
        // subscribe
      }
    )
  }),


  /* 切换Nav */
  toChangeNav: function () {
    this.setData({
      tabToContent: 1
    })
  },

  /*** 取消订阅 ***/
  handleSubscribe: co.wrap(function* (e) {
    try {
      this.subscribe = e.currentTarget.dataset.subscript 
      this.cancelIndex = e.currentTarget.id
      this.setData({
        ['modalObj.isShow']: true
      })
      console.log('0000',this.subscribe)
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  /*** 订阅弹出框 ***/
  confirmModal: co.wrap(function *(cancelIndex, subscribe) {
    if(this.subscribe == 'subscript'){
      let cancelSn = this.data.subscriptList[this.cancelIndex].sn
      const res = yield gql.deleteUserPlanInput(cancelSn)
      this.getUserPlans()
    }
    else if(this.subscribe == 'finished'){
      let cancelSn = this.data.completeList[this.cancelIndex].sn
      const res = yield gql.deleteUserPlanInput(cancelSn)
      this.getUserPlans()
    }
    
  }),

  /** 显示列表内容 **/
  navTap: co.wrap(function* (e) {
    logger.info(e)
    this.longToast = new app.weToast()
    this.setData({
      tabToContent: e.currentTarget.id,
      scrollTop: 0
    })
    if (this.data.tabToContent == 0) {
      this.currentTab = 'subscription'
      this.getUserPlans()
    } else if (this.data.tabToContent == 2) {
      this.currentTab = 'finished'
      this.getUserPlans()
    } else {
      this.currentTab = ''
      const resp = yield gql.getPlans()
      this.setData({
        lists: resp.plans
      })
    }
  }),

  onUnload(){
    event.remove('subscribeList')
  }

})