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
import Logger from '../../../../utils/logger.js'
const logger = new Logger.getLogger('pages/package_preschool/growth_plan/checkpoint/plan_detail')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls:[],
    currentPage: 1,
    allPage: 3,
    currentImage: '',
    isFullScreen: false, //iphoneX底部button兼容性
    showArrow:true,
    buttonList:[{
      func:0,
      title:'开始打印'
    },{
      func:1,
      title:'购买会员'
    },{
      func:2,
      title:'立即订阅'
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: co.wrap(function *(options) {
      this.longToast = new app.weToast()
      // let currentImage=this.data.imgUrls[1].image
      // this.setData({
      //   currentImage: currentImage,
      //   isFullScreen: app.isFullScreen
      // })

      this.userPlanSn= this.options.userPlanSn
      this.sn = this.options.sn
      this.name= this.options.name
  
    try {
      const resp= yield gql.getPreviewContent(this.sn)
      this.featureKey= resp.content.featureKey
      this.contentImagesLength= resp.content.contentImages.length
      this.data.imgUrls= resp.content.contentImages
      this.setData({
        imgUrls: this.data.imgUrls,
        allPage:resp.content.pageCount,
        // currentPage:this.data.currentPage
      })

    } catch (e) {
      this.longToast.toast()
      util.showError(e)
    }
  }),

  // changeFunc: co.wrap(function *(){

  // })

  /**
   * 上一页
   */
  prePage: function(){
    try{
      this.data.currentImage = this.data.imgUrls[0].image
      let index = this.data.imgUrls.length
      let currentPage = this.data.currentPage
      if(this.data.currentPage > 1){
        this.setData({
          allPage: index,
          currentPage: currentPage - 1
        })
      }else{
        console.log('已经第一张啦 ！')
      }
    }catch(e){
      this.longToast.toast()
      util.showError(e)
    }
  },

  /**
   * 下一页
   */
  nextPage: function(){
    try{
      let index = this.data.imgUrls.length
      let currentPage = this.data.currentPage
      if(this.data.currentPage < index){
        this.setData({
          allPage: index,
          currentPage: currentPage + 1,
          currentImage: this.data.imgUrls[currentPage].image
        })
      }else{
        console.log('已经最后一张啦 ！')
      }
    }catch(e){
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
          featureKey: this.featureKey,
          resourceOrderType: 'plan',
          resourceAttribute: {
            userPlanSn: this.userPlanSn,
            sn: this.sn,
            resourceType: 'plan',
          }
        },
        checkCapabilitys: {
          isSettingColor: true,
        }
     }))
    })
  }),
})