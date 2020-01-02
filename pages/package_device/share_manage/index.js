import {
  util,
  co,
  regeneratorRuntime,
  wxNav
} from "../../../utils/common_import"
import graphql from "../../../network/graphql/device"

const app = getApp()
Page({
  data: {
    selectAllFlag: false,
    isFullScreen: false,
    loadReady: false,
    userList: [],
    modalObj: {
      isShow: false,
      title: '停止分享',
      hasCancel: true,
      content: '停止分享后，您所选的使用者都将自行解绑设备并且无法进行任何操作',
      confirmText: '确认解绑'
    }
  },
  onLoad(query) {
    this.weToast = new app.weToast()
    this.deviceSn = query.sn
    this.setData({
      isFullScreen: app.isFullScreen
    })
    this.getShareUsers()
  },
  getShareUsers: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield graphql.getDeviceShareUsers(this.deviceSn)
      let shareUsers = res.currentUser.devices[0].sharers
      for (let i = 0; i < shareUsers.length; i++) {
        shareUsers[i].selectFlag = false
      }
      this.setData({
        userList: shareUsers,
        loadReady: true
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
  selectUser(e) {
    let index = e.currentTarget.id,
      originFlag = this.data.userList[index].selectFlag,
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
  showConfirm(e) {
    if (app.preventMoreTap(e)) return
    let usersSns = [],
      users = this.data.userList
    for (let i = 0; i < users.length; i++) {
      if (users[i].selectFlag) {
        usersSns.push(users[i].sn)
      }
    }
    if (usersSns.length === 0) {
      wx.showToast({
        icon: 'none',
        title: '请先勾选使用者'
      })
      return
    } else {
      this.setData({
        ['modalObj.isShow']: true
      })
      this.usersSns = usersSns
    }
  },
  // 停止分享
  stopShare: co.wrap(function* (e) {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      yield graphql.stopShareDeviceUsers(this.deviceSn, this.usersSns)
      this.weToast.hide()
      this.getShareUsers()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  })
})