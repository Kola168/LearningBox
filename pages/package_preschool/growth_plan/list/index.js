// pages/package_preschool/list/index.js
const app = getApp()
import {regeneratorRuntime, co, wxNav, util, logger} from '../../../../utils/common_import'
// import api from '../../../network/restful_request'
const showModal = util.promisify(wx.showModal)
// const logger = new Logger.getLogger('pages/index/index')
import Logger from '../../../../utils/logger.js'
const logger = new Logger.getLogger('pages/package_preschool/growth_plan/list/index')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lists: [
      {
        image: 'https://cdn-h.gongfudou.com/LearningBox/main/pic2doc_add_img.png',
        title: '好奇宝宝培养计划',
        desc: '简单描述描述描述描述简单描述描述描述描述',
        tag: '在家上早教',
        currentProgress: '30',
        allProgress: '100'
      },
      {
        image: 'https://cdn-h.gongfudou.com/LearningBox/main/pic2doc_add_img.png',
        title: '轻松抓住语言关键期',
        desc: '简单描述描述描述描述',
        tag: '入园早准备',
        currentProgress: '60',
        allProgress: '100'
      }
    ],
    tabToContent: 1,
    modalObj: {
      isShow: false, //是否显示
      title: '不再订阅此计划了吗？',
      content: '', //弹窗内容文字
      hasCancel: true
    }      
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.longToast = new app.weToast

  },

  /* 去订阅 */
  toSubscribe: function(e){
      wxNav.navigateTo('/pages/package_preschool/growth_plan/checkpoint/plan_checkpoint')
  },

 /*** 取消订阅 ***/
  handleSubscribe: function(e){
    console.log('=====', e)
    console.log('=====', e.currentTarget.id)
    this.cancelIndex = e.currentTarget.id
    if(this.data.lists.length > 0){
      this.setData({
        ['modalObj.isShow']:true
      })
    }
  },

  /*** 订阅弹出框 ***/
  confirmModal: function(e){
    console.log('=====ppp', e)
    console.log('=====ppp', e.currentTarget.id)
    let index = this.cancelIndex
    this.data.lists.slice(index, 1)
    this.setData({
      lists: this.data.lists,
      ['modalObj.isShow']: false
    })
  }, 

  /** 显示列表内容 **/
  navTap: co.wrap(function* (e) {
    // logger.info(e)
    // this.longToast = new app.weToast() 
    let index = e ? e.currentTarget.id : 1
    this.setData({
      tabToContent: index,
      scrollTop: 0
    })
	}),

})