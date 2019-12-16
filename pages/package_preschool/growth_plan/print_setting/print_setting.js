// pages/package_preschool/print_setting/print_setting.js
const app = getApp()
import {regeneratorRuntime, co, wxNav, util, logger} from '../../../../utils/common_import'
import api from '../../../../network/restful_request';
const showModal = util.promisify(wx.showModal)
const request = util.promisify(wx.request)

Page({

    /**
     * 页面的初始数据
     */
    data: {
      printNumber: 1,  //打印份数
      colorLists: ['黑白', '全彩'],  //色彩选择
      focus: false,
      inputValueStart: 1, //打印范围起始页
      inputValueEnd: 1, //打印范围结束页
      chooseColor: 0, //默认选择打印的色彩
      isFullScreen: false, //iphoneX底部button兼容性
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.longToast = new app.weToast
      this.setData({
        isFullScreen: app.isFullScreen
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
      if(this.data.printNumber < 30){
        this.setData({
          printNumber: this.data.printNumber + 1
        })
      }else{
        wx.showModal({
          content: '最多可以打印30份哦~',
          showCancel: false
        })
      }
    },

    /** 色彩选择 */
    chooseColor(e){
      let index = e ? e.currentTarget.id : 1
      console.log('======选择',this.data.colorLists[index])
      this.setData({
        chooseColor: index
      })
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
      // this.longToast.weToast({
      //   type:'loading',
      //   duration: 0
      // })

      // const params = {
        
      // }

      // try{
      //   const resp = yield request({
      //     url: app.apiServer+'',
      //     dataType: 'json',
      //     method: 'post',
      //     data: params
      //   })
      //   if(resp.data.code !== 0){
      //     throw(resp.data)
      //   }
      //   this.longToast.weToast()
      //   wxNav.redirectTo('/pages/index/index',{
      //     type:'test'
      //   })
      // }catch(e){
      //   this.longToast.weToast()
      //   util.showError(e)
      // }

    })
  })