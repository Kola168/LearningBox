// pages/package_preschool/growth_plan/checkpoint/plan_detail.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  wxNav,
  util
} from '../../../../utils/common_import'
// const showModal = util.promisify(wx.showModal)
const event = require('../../../../lib/event/event')
import gql from '../../../../network/graphql/preschool'
import gragql from '../../../../network/graphql_request'
import Logger from '../../../../utils/logger.js'
const logger = new Logger.getLogger('pages/package_preschool/growth_plan/checkpoint/plan_detail')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [],
    current: 0,
    // allPage: 3,
    currentImage: '',
    isFullScreen: false, //iphoneX底部button兼容性
    showArrow: true, //预览图片左右箭头
    isMember: false,
    isSuscribe: false,
    btnText: '',
    showBtn: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    this.userPlanSn = options.userPlanSn
    this.planSn = options.planSn
    this.sn = options.sn
    this.name = options.name
    this.longToast.toast({
      type:'loading'
    })
    try {
      const respMember = yield gragql.getUserMemberInfo()
      const resp = yield gql.getPreviewContent(this.sn)
      this.userPlanSn= resp.content.plan.userPlanSn
      this.featureKey = resp.content.featureKey
      this.contentImagesLength=resp.content.pageCount
      this.setData({
        isFullScreen: app.isFullScreen,
        imgUrls: resp.content.contentImages,
        isMember: respMember.currentUser.isPreschoolMember,
        isSuscribe: resp.content.plan.subscription,
        name: options.name
      })
      this.longToast.hide()
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  //弹出会员
  checkMember: co.wrap(function* () {
    //判断会员标示
    var memberToast = this.selectComponent('#memberToast')
    memberToast.checkAuthMember(() => {
      wxNav.navigateTo('./plan_detail', {
        userPlanSn: this.userPlanSn
      })
    })
  }),

  /* 去订阅 */
  toSubscribe: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading'
    })
    try {
      if(this.data.isMember){
        yield gql.joinPlan(this.planSn)
        this.longToast.hide()
        this.setData({
          isSuscribe: true
        })
        wx.showToast({
          title:'订阅成功',
          icon:'none'
        })
        event.emit('getPlan')
      }else{
        this.longToast.hide()
        this.checkMember()
      }
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  swpierChange(e) {
    if (e.detail.source === 'touch') {
      this.setData({
        current: e.detail.current
      })
    }
  },

   // 翻页
   pageTurn(e) {
    let direction = e.currentTarget.id,
      current = this.data.current
      console.log(e)
    if (direction === 'left') {
      if (current !== 0) {
        this.setData({
          current: current - 1
        })
      }
    } else {
      let sourcesLen = this.data.imgUrls.length
      if (current < sourcesLen - 1) {
        this.setData({
          current: current + 1
        })
      }
    }
  },
  /**
   * 开始打印
   */
  beginPrint: co.wrap(function* (userPlanSn) {
    this.longToast.toast({
      type:'loading'
    })
    const resp = yield gql.getPreviewContent(this.sn)
    this.userPlanSn= resp.content.plan.userPlanSn
    this.sn= resp.content.sn
    wxNav.navigateTo('/pages/package_common/setting/setting', {
      settingData: encodeURIComponent(JSON.stringify({
        file: {
          name: this.name
        },
        orderPms: {
          printType: 'RESOURCE',
          pageCount: this.contentImagesLength,
          featureKey: this.featureKey,
          mediaType:'plan',
          resourceOrderType: 'Plan',
          resourceAttribute: {
            userPlanSn: this.userPlanSn,
            sn: this.sn,
          }
        },
        checkCapabilitys: {
          isSettingColor: true,
        }
      }))
    })
    this.longToast.hide()
  }),
})