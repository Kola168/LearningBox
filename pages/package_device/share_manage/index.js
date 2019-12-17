import { util, co, regeneratorRuntime, wxNav } from "../../../utils/common_import"
import graphql from "../../../network/graphql_request"

const app = getApp()
Page({
  data: {
    selectAllFlag: false,
    isFullScreen: false,
    userList: []
      // [{
      //   url: '/images/doc_member_circle.png',
      //   name: '十月的雨季',
      //   selectFlag: false
      // }, {
      //   url: '/images/doc_member_circle.png',
      //   name: '遇见',
      //   selectFlag: true
      // }, {
      //   url: '/images/doc_member_circle.png',
      //   name: '千余秋安讯',
      //   selectFlag: false
      // }, {
      //   url: '/images/doc_member_circle.png',
      //   name: '十月的预计',
      //   selectFlag: false
      // }]
  },
  onLoad(query) {
    this.weToast = new app.weToast()
    this.deviceSn = query.sn
    this.setData({
      isFullScreen: app.isFullScreen
    })
    this.getShareUsers()
  },
  getShareUsers: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getDeviceShareUsers(this.deviceSn)
      let shareUsers = res.device.shareUsers
      for (let i = 0; i < shareUsers.length; i++) {
        shareUsers[i].selectFlag = false
      }
      this.setData({
        userList: shareUsers
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  selectAllUser() {
    let originFlag = this.data.selectAllFlag,
      dataObj = {
        selectAllFlag: !originFlag
      }
    if (originFlag) {
      let userList = this.data.userList
      for (let i = 0; i < userList.length; i++) {
        userList[i].selectFlag = false
      }
      dataObj.userList = userList
    }
    this.setData(dataObj)
  },
  seletcUser(e) {
    let index = e.currentTarget.id,
      originFlag = this.data.userList[index].selectFlag
    dataKey = 'userList[' + index + '].selectFlag'
    this.setData({
      [dataKey]: !originFlag
    })
    this.isSelectAll()
  },
  isSelectAll() {
    let userList = this.data.userList
    let selectAllFlag = userList.every((item) => {
      return item.selectFlag
    })
    this.setData({
      selectAllFlag
    })
  },
  // 停止分享
  stopShare(e) {
    if (app.preventMoreTap(e)) return
    this.weToast.toast({
      type: 'loading'
    })
    let usersSns = [],
      users = this.data.userList
    for (let i = 0; i < users.length; i++) {
      if (users[i].selectFlag) {
        usersSns.push(users[i].sn)
      }
    }
    try {
      yield graphql.stopShareDeviceUsers(this.deviceSn, usersSns)
      this.weToast.hide()
      wxNav.navigateBack()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }
})