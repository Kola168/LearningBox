// pages/package_preschool/growth_plan/checkpoint/plan_detail.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  wxNav,
  util
} from '../../../../utils/common_import'
const showModal = util.promisify(wx.showModal)
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
    member: false,
    subscription: false,
    btnText: '',
    isAndroid: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    // let currentImage=this.data.imgUrls[1].image
    let systemInfo = wx.getSystemInfoSync()
    let isAndroid = systemInfo.system.indexOf('iOS') > -1 ? false : true
    this.setData({
      isAndroid: isAndroid,
      currentImage: this.data.currentImage,
      isFullScreen: app.isFullScreen
    })

    this.userPlanSn = this.options.userPlanSn
    this.sn = this.options.sn
    this.name = this.options.name
    this.subscribe = this.options.subscribe

    try {
      const resp = yield gql.getPreviewContent(this.sn)
      this.featureKey = resp.content.featureKey
      this.contentImagesLength = resp.content.contentImages.length
      this.data.imgUrls = resp.content.contentImages
      this.setData({
        imgUrls: this.data.imgUrls,
        allPage: resp.content.pageCount,
        // currentPage:this.data.currentPage
      })

      if (this.data.allPage == 1) {
        this.setData({
          showArrow: false
        })
      }

      const respMember = yield gragql.getUserMemberInfo()
      this.setData({
        isMember:respMember.currentUser.isPreschoolMember
      })
      console.log('232333',respMember)
      console.log('this.data.isSuscribe',this.data.isSuscribe)
      if(this.subscribe == 'noSubscript'){
        this.setData({
          subscription:false
        })
      }else{
        this.setData({
          subscription:true
        })
      }

      this.toFunc()

    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  toFunc: co.wrap(function* (e) {
    try {
      if (this.data.subscription) {
        this.btnType = 'print'
        this.setData({
          btnText: '开始打印'
        })

      } else if (!this.data.member) {
        this.btnType = 'buy'
        this.setData({
          btnText: '购买会员'
        })
      } else {
        this.btnType = 'subscription'
        this.setData({
          btnText: '立即订阅'
        })
      }
    } catch (error) {
      this.longToast.toast()
      util.showError(error)
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

  btnClick() {
    if (this.btnType === 'buy') {
      // wxNav.navigateTo(`/pages/package_member/member/index`,{
      //   planSn:this.planSn
      // })
      wxNav.navigateTo(`/pages/package_member/member/index`)
    } else {
      this.beginPrint()
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