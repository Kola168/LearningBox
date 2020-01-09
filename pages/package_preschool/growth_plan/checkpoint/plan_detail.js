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
    showArrow:true

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: co.wrap(function *(options) {
      // this.longToast = new app.weToast
      // let currentImage=this.data.imgUrls[1].image
      // this.setData({
      //   currentImage: currentImage,
      //   isFullScreen: app.isFullScreen
      // })

      this.userPlanSn= this.options.userPlanSn
      this.sn = this.options.sn
  
    try {
      const resp= yield gql.getPreviewContent(this.sn)
      console.log('resp===',resp)
      this.featureKey= resp.content.featureKey
      this.contentImagesLength= resp.content.contentImages.length
      console.log('contentImagesLength===',this.contentImagesLength)
      this.data.imgUrls= resp.content.contentImages
      console.log('this.data.imgUrls===',this.data.imgUrls)
      this.setData({
        imgUrls: this.data.imgUrls,
        allPage:resp.content.pageCount,
        // currentPage:this.data.currentPage
      })

    } catch (error) {
      this.longToast.weToast()
      util.showError(error)
      console.log(error)
    }
  }),

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
      console.log('======',e)
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
      console.log('======',e)
    }
  },


  /**
   * 开始打印
   */
  beginPrint: co.wrap(function* (userPlanSn) {
    console.log('lalal',this.userPlanSn)
    wxNav.navigateTo('/pages/package_preschool/growth_plan/print_setting/print_setting',{
      userPlanSn:this.userPlanSn,
      featureKey:this.featureKey,
      contentImagesLength:this.contentImagesLength
    })
  }),
})