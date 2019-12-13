// pages/package_preschool/growth_plan/checkpoint/plan_detail.js
const app = getApp()
import {regeneratorRuntime, co, wxNav, util, logger} from '../../../../utils/common_import'
// import { threadId } from 'worker_threads';
// import api from '../../../network/restful_request'
const showModal = util.promisify(wx.showModal)

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      {
        image: '../../images/plan_detail_img.jpg'
      },
      {
        image: '../../images/plan_detail_img.jpg'
      },
      {
        image: '../../images/plan_detail_img.jpg'
      }
    ],
    currentPage: 1,
    allPage: 3,
    currentImage: ''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.longToast = new app.weToast
    let currentImage=this.data.imgUrls[1].image
    this.setData({
      currentImage: currentImage
    })

  },

  /**
   * 上一页
   */
  prePage: function(){
    try{
      this.data.currentImage = this.data.imgUrls[0].image
      console.log('currentImage++++',this.data.currentImage)
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
  beginPrint: co.wrap(function* () {
    wxNav.navigateTo('/pages/package_preschool/growth_plan/print_setting/print_setting')
  }),
})