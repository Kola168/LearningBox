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

  /* 切换Nav */
  toChangeNav: function () {
    this.setData({
      tabToContent: 1
    })
  },

  /* 去订阅 */
  toSubscribe: co.wrap(function *(e){
    try {
      var idx = e.currentTarget.id
      logger.info('idx', idx)
      let sn = this.data.lists[idx].sn
      if(this.data.isMember){
        this.toSubscribeDetail(sn)
      }else{
        this.toProgress(e)
      }
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  toSubscribeDetail: co.wrap(function* (sn) {
    try {
        yield gql.joinPlan(sn)
        let resp = yield gql.getPlans()
        logger.info('=====', resp)
        this.setData({
          lists: resp.plans
        })
    } catch (e) {
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
        subscribe
      }
    )
  }),

  /*** 取消订阅 ***/
  handleSubscribe: co.wrap(function* (e) {
    try {
      this.cancelIndex = e.currentTarget.id
      this.setData({
        ['modalObj.isShow']: true
      })
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  /*** 订阅弹出框 ***/
  confirmModal: co.wrap(function *(cancelIndex) {
    // let index = this.cancelIndex
    let cancelSn = this.data.subscriptList[this.cancelIndex].sn
    try {
      const res = yield gql.deleteUserPlanInput(cancelSn)
      this.getUserPlans()
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
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