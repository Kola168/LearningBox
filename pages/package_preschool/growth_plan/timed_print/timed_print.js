// pages/package_preschool/timed_print/timed_print.js
const app = getApp()
import {regeneratorRuntime, co, wxNav, util, logger} from '../../../../utils/common_import'
import gql from './../../../../network/graphql_request.js'
const showModal = util.promisify(wx.showModal)

Page({

    /**
     * 页面的初始数据
     */
    data: {
      isShowDetail: false,  //自动打印是否显示详情设置,默认false
      printNumber: 1,  //打印份数
      times:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],  //时间列表选择
      currentTime: 16, //默认打印时间
      frequencyLists: ['一天一关','两天一关','三天一关'], //频率选择
      chooseFrequency: 0, //默认选择打印频率
      isShowTimeLists: false, //是否显示时间列表
      isFullScreen: false, //iphoneX底部button兼容性
      name: '请填写真实昵称', //没有填写昵称时
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: co.wrap(function* (options) {
      this.longToast = new app.weToast
      // let resp = yield gql.getUser()
      this.setData({
        isFullScreen: app.isFullScreen,
        // name: resp.currentUser.selectedKid.name
      })
      try{
          let resp = yield gql.getUser()
          resp.currentUser.selectedKid.name == 'MM'
          if(resp.currentUser.selectedKid.name == '未命名'){
            resp.currentUser.selectedKid.name = '请填写真实昵称'
          }
          this.setData({
            name: resp.currentUser.selectedKid.name
          })
        }catch(e){
          this.longToast.weToast()
          util.showError(e)
        }
    }),

    /** 获取昵称 */
    getName: co.wrap(function* (){
      // wxNav.navigateTo(`/pages/package_common/account/name_edit`)
      // try{
      //   let resp = yield gql.getUser()
      //   resp.currentUser.selectedKid.name == 'MM'
      //   if(resp.currentUser.selectedKid.name !== '未命名'){
      //     resp.currentUser.selectedKid.name = '请填写真实昵称'
      //   }
      //   this.setData({
      //     name: resp.currentUser.selectedKid.name
      //   })
      // }catch(e){
      //   this.longToast.weToast()
      //   util.showError(e)
      // }
    }),

    /** 自动打印开关 */
    setPrint(){
      this.setData({
        isShowDetail: !this.data.isShowDetail
      })
      if(this.data.isShowDetail == 'false'){
        this.setData({
          printNumber: 1,
          currentTime: 16,
          chooseFrequency: 0
        })
      }
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

    /** 打印时间 */
    printTime(e){
      console.log('发送选择改变，携带值为', e)
      console.log('发送选择改变，携带值为', e.detail.value)
      let time = parseInt(e.detail.value)
      time=time+1
      this.setData({
        isShowTimeLists: true,
        currentTime: time
      })
      console.log('发送选择改变，携带值为', this.data.currentTime)
    },

    /** 打印频率 */
    chooseFrequency: co.wrap(function* (e) {
      let index = e ? e.currentTarget.id : 1
      console.log('======选择的频率',this.data.frequencyLists[index])
      this.setData({
        chooseFrequency: index
      })
    }),

  
    /**
     * 定时打印设置后的确认
     */
    confirmTimedSetting: co.wrap(function* (){
      wxNav.navigateTo('/pages/package_preschool/growth_plan/checkpoint/plan_checkpoint')
    //   this.weToast.toast({
    //     type: 'loading',
    //     duration: 0
    //   })
    //   const params = {

    //   }
    //   try{
    //     const resp = yield request({
    //       url: app.apiServer + ``,
    //       method: 'POST',
    //       dataType: 'json',
    //       data: params
    //     })
    //     if(resp.data.code !== 0){
    //       throw(resp.data)
    //     }
    //     this.longToast.weToast()
    //     wxNav.navigateTo('/pages/package_preschool/growth_plan/checkpoint/plan_checkpoint')
    //   }catch(e){
    //     this.longToast.weToast()
    //     util.showError(e)
    //   }
    })
  })