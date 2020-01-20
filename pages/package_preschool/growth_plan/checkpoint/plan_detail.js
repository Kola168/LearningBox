// pages/package_preschool/growth_plan/checkpoint/plan_detail.js
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
const logger = new Logger.getLogger('pages/package_preschool/growth_plan/checkpoint/plan_detail')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [],
    currentPage: 1,
    allPage: 3,
    currentImage: '',
    isFullScreen: false, //iphoneX底部button兼容性
    showArrow: true, //预览图片左右箭头
    isMember: false,
    isSuscribe: false,
    btnText: '',
    // isAndroid: false
    showBtn: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    // this.userPlanSn = this.options.userPlanSn
    this.planSn = this.options.planSn
    this.sn = this.options.sn
    this.name = this.options.name
    // this.subscribe = this.options.subscribe

    try {
      const respMember = yield gragql.getUserMemberInfo()
      const resp = yield gql.getPreviewContent(this.sn)
      console.log(resp,'plandetail resp')
      this.featureKey = resp.content.featureKey
      this.contentImagesLength = resp.content.contentImages.length
      this.data.imgUrls = resp.content.contentImages
      this.setData({
        currentImage: this.data.currentImage,
        isFullScreen: app.isFullScreen,
        imgUrls: this.data.imgUrls,
        allPage: resp.content.pageCount,
        isMember: respMember.currentUser.isPreschoolMember,
        isSuscribe: resp.content.plan.subscription
      })

      if (this.data.allPage == 1) {
        this.setData({
          showArrow: false
        })
      }
      if (this.data.isMember) {
        if(this.data.isSuscribe){
          this.setData({
              showBtn:false
            })
          }else{
            this.setData({
              showBtn:true
            })
          }
      } else {
        this.checkMember()
      }

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
      yield gql.joinPlan(this.planSn)
      event.emit('subscribeList')
      this.longToast.toast({
        type: 'loading',
        duration: 6000,
        title: '已订阅！'
      })
      this.setData({
        isSuscribe: true,
        showBtn: false
      })
      this.longToast.hide()
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }

  }),

  /**
   * 上一页
   */
  prePage: function () {
    try {
      this.data.currentImage = this.data.imgUrls[0].image
      let index = this.data.imgUrls.length
      let currentPage = this.data.currentPage
      if (this.data.currentPage > 1) {
        this.setData({
          allPage: index,
          currentPage: currentPage - 1
        })
        if (this.data.allPage == 1) {
          this.setData({
            showArrow: false
          })
        }
      } else {
        console.log('已经第一张啦 ！')
      }
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  },

  /**
   * 下一页
   */
  nextPage: function () {
    try {
      let index = this.data.imgUrls.length
      let currentPage = this.data.currentPage
      if (this.data.currentPage < index) {
        this.setData({
          allPage: index,
          currentPage: currentPage + 1,
          currentImage: this.data.imgUrls[currentPage].image
        })
        if (this.data.allPage == 1) {
          this.setData({
            showArrow: false
          })
        }
      } else {
        console.log('已经最后一张啦 ！')
      }
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  },

  /**
   * 开始打印
   */
  beginPrint: co.wrap(function* (userPlanSn) {
    wxNav.navigateTo('/pages/package_common/setting/setting', {
      settingData: encodeURIComponent(JSON.stringify({
        file: {
          name: this.name
        },
        orderPms: {
          printType: 'RESOURCE',
          pageCount: this.contentImagesLength,
          // featureKey: this.featureKey,
          featureKey: 'qdnl',
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
  }),
})