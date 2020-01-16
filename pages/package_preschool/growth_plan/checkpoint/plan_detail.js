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
    subscription: false,
    btnText: '',
    // isAndroid: false
    showBtn:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    // let currentImage=this.data.imgUrls[1].image
    // let systemInfo = wx.getSystemInfoSync()
    // let isAndroid = systemInfo.system.indexOf('iOS') > -1 ? false : true

    this.userPlanSn = this.options.userPlanSn
    this.planSn = this.options.planSn
    this.sn = this.options.sn
    this.name = this.options.name
    this.subscribe = this.options.subscribe

    try {
      const respMember = yield gragql.getUserMemberInfo()
      console.log('232333',respMember)
      const resp = yield gql.getPreviewContent(this.sn)
      this.featureKey = resp.content.featureKey
      this.contentImagesLength = resp.content.contentImages.length
      this.data.imgUrls = resp.content.contentImages
      this.setData({
        // isAndroid: isAndroid,
        currentImage: this.data.currentImage,
        isFullScreen: app.isFullScreen,
        imgUrls: this.data.imgUrls,
        allPage: resp.content.pageCount,
        // currentPage:this.data.currentPage
        isMember:respMember.currentUser.isPreschoolMember,
        showBtn:true
      })

      if (this.data.allPage == 1) {
        this.setData({
          showArrow: false
        })
      }
      if(this.subscribe == 'noSubscript'){
        this.setData({
          subscription:false,
          showBtn:true
        })
      }else{
        this.setData({
          subscription:true,
          showBtn:false
        })
      }
      console.log('this.data.subscription',this.data.subscription)

      // this.toFunc()

    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  //判断会员
  checkMember: co.wrap(function *(){
    logger.info('member',this.data.isMember)
    if(this.data.isMember){
      yield this.toSubscribe()
    }else{
      logger.info(3333)
      //判断会员标示
      var memberToast = this.selectComponent('#memberToast')
      console.log(memberToast)
      memberToast.checkAuthMember(()=>{
        // wxNav.navigateTo('../plan_detail', {
        //   userPlanSn:this.userPlanSn
        // })
      })
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
        subscription:true,
        showBtn:false
      })
      this.beginPrint()
      this.longToast.hide()
    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
    
  }),

 
  // toFunc: co.wrap(function* (e) {
  //   try {
  //     if (this.data.isMember) {
  //       this.btnType = 'subscription'
  //       this.setData({
  //         btnText: '立即订阅'
  //       })
  //     } else if(this.data.subscription) {
  //       this.btnType = 'print'
  //       this.setData({
  //         btnText: '开始打印'
  //       })
  //     } else {
  //       this.btnType = 'buy'
  //       this.setData({
  //         btnText: '购买会员'
  //       })
  //     }
  //   } catch (error) {
  //     this.longToast.toast()
  //     util.showError(error)
  //   }

  // }),

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

  // btnClick() {
  //   if (this.btnType === 'buy') {
  //     // wxNav.navigateTo(`/pages/package_member/member/index`,{
  //     //   planSn:this.planSn
  //     // })
  //     wxNav.navigateTo(`/pages/package_member/member/index`)
  //   } else {
  //     this.beginPrint()
  //   }
  // },

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
          featureKey: this.featureKey,
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