const app = getApp()
Page({
  data: {
    selectAllFlag: false,
    isFullScreen:false,
    userList: [{
      url: '/images/doc_member_circle.png',
      name: '十月的雨季',
      selectFlag: false
    }, {
      url: '/images/doc_member_circle.png',
      name: '遇见',
      selectFlag: true
    }, {
      url: '/images/doc_member_circle.png',
      name: '千余秋安讯',
      selectFlag: false
    }, {
      url: '/images/doc_member_circle.png',
      name: '十月的预计',
      selectFlag: false
    }]
  },
  onLoad(){
    this.setData({
      isFullScreen:app.isFullScreen
    })
  },
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
  }
})