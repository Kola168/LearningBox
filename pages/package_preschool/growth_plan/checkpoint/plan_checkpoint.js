// pages/package_preschool/growth_plan/checkpoint/plan_checkpoint.js
const app = getApp()
import {regeneratorRuntime, co, wxNav, util, logger} from '../../../../utils/common_import'
const showModal = util.promisify(wx.showModal)

Page({

  /**
   * 页面的初始数据
   */
  data: {
    checkpoints: [
      {
        image: '../../images/checkpoint_img.jpg',
        title: '直线折线曲线'
      },
      {
        image: '../../images/checkpoint_img.jpg',
        title: '直线折线曲线'
      },
      {
        image: '../../images/checkpoint_img.jpg',
        title: '直线折线曲线'
      },
      {
        image: '../../images/checkpoint_img.jpg',
        title: '直线折线曲线'
      }
    ],
    isMember: false, //是否会员
    isSuscribe: false, //是否订阅
    isShowPrint: true, //自动打印按钮是否显示
    isShadowOpcity: false, //是否显示透明层
    isShowBottomBtn: true, //是否显示底部按钮
    checkpointBg: 'https://cdn-h.gongfudou.com/LearningBox/preschool/growth_plan_step_bg.png', //背景图
    shadowOpcityImg: '../../images/growth_plan_lock.png', //透明遮罩层上的图片

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.longToast = new app.weToast
    // this.options = JSON.parse(decodeURIComponent(options.params))
    // this.id = this.options.id
    // this.sn = this.options.sn
    // this.setData({
    //   isMember: this.options.isMember
    // })
    this.getDetail()


  },

  getDetail: co.wrap(function* (){
    this.longToast.weToast({
      type: 'loading',
      title: '请稍候'
    })
    try{
      
    } catch(e){

    }
  }),

  /** 购买会员 */
  BuyMember: co.wrap(function*(){
    wxNav.navigateTo('')
  }),

  /* 去订阅 */
  toSubscribe: function(e){
    wxNav.navigateTo('/pages/package_preschool/growth_plan/timed_print/timed_print')
  },

  /** 自动打印 */
  setTimedPrint: co.wrap(function* (){

    
    wxNav.navigateTo(`/pages/package_preschool/growth_plan/timed_print/timed_print`)
  }),

  /**打印详情 */
  toPrintDetail: function(e){
    wxNav.navigateTo(`/pages/package_preschool/growth_plan/checkpoint/plan_detail`)
  }

})