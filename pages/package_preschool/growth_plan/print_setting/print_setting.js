// pages/package_preschool/print_setting/print_setting.js
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
      printNumber: 1,  //打印份数
      colorLists: [
        {name:'黑白', value:'黑白'},
        {name:'全彩', value:'全彩', checked:'true'}, 
      ],  //色彩选择
      focus: false,
      inputValueStart: 1, //打印范围起始页
      inputValueEnd: 1, //打印范围结束页
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      // this.longToast = new app.weToast
      this.weToast = new app.weToast()
  
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

    /** 色彩选择 */
    chooseColor(e){
      console.log('radio发生change事件，携带value值为：', e.detail.value)
    },

    /** input输入 */
    bindKeyInputStart: function (e) {
      console.log('携带value值为：', e.detail.value)
      this.setData({
        inputValueStart: e.detail.value
      })
    },
    bindKeyInputEnd: function (e) {
      console.log('携带value值为：', e.detail.value)
      this.data.inputValueEnd = e.detail.value
      if(this.data.inputValueStart <= this.data.inputValueEnd){
        this.setData({
          inputValueEnd: this.data.inputValueEnd
        })
      }else{
        wx.showModal({
          title: '不能小于起始页',
          content: '',
          showCancel: false
      })
      }
    },
  
    /**
     * 确认打印
     */
    confirmPrint: co.wrap(function* (){
      
    })
  })