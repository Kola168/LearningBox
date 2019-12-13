// pages/package_preschool/timed_print/timed_print.js
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
      isShowDetail: false,  //自动打印是否显示详情设置
      printNumber: 1,  //打印份数
      times:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],  //时间列表选择
      currentTime: 19, //默认打印时间
      isChooseFrequency: false, //选择打印频率
      frequencyLists: [
        {name:'一天一关', value:'一天一关', checked:'true'},
        {name:'两天一关', value:'两天一关'},
        {name:'三天一关', value:'三天一关'}
      ], //频率选择
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.longToast = new app.weToast
  
    },

    /** 获取昵称 */
    getName(){
      wxNav.navigateTo(``)
    },

    /** 自动打印开关 */
    setPrint(){
      this.setData({
        isShowDetail: !this.data.isShowDetail
      })
    },

    /** 减少份数 */
    decreaseNum(){
      this.data.printNumber > 1 && this.setData({
        printNumber: this.data.printNumber - 1
      })
    },

    /** 增加份数 */
    increaseNum(){
      this.data.printNumber < 10 && this.setData({
        printNumber: this.data.printNumber + 1
      })
    },

    /** 打印时间 */
    printTime(e){
      console.log('picker发送选择改变，携带值为', e.detail.value)
      this.setData({
        isShowTime: true,
        currentTime: e.detail.value
      })
    },

    /** 打印频率 */
    chooseFrequency(e){
      console.log('radio发生change事件，携带value值为：', e.detail.value)
    },

  
    /**
     * 定时打印设置后的确认
     */
    confirmTimedSetting: co.wrap(function* (){
      // this.weToast.toast('订阅成功')
      wxNav.navigateTo('/pages/package_preschool/growth_plan/checkpoint/plan_checkpoint')
    })
  })