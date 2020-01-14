
"use strict"
const app = getApp()


const getUserInfo = util.promisify(wx.getUserInfo)

Page({
  data: {
    time: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
    num: 0,
    content: '',
    from_temp: false,
    mediumRecommend: '',
    fontType: 'kt',
    iosModal: false,
    text: '当日智能字帖生成次数已经用完，升级会员可以畅享使用'
  }

})
