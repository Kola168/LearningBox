// pages/package_common/account/personal_info.js
const app = getApp()
import gql from '../../../network/graphql_request.js'
import api from '../../../network/restful_request.js'
import router from '../../../utils/nav'
const getImageInfo = util.promisify(wx.getImageInfo)
import {
  co,
  util
} from '../../../utils/common_import.js'
import regeneratorRuntime from '../../../lib/co/runtime'
Page({
  data: {
    birthday: '未填写',
    kidInfo: null,
    location: [
      ['江苏', '广东'],
      // ['南京', '苏州'],
      // ['雨花台区', '铁心桥']
    ],
    locationIndex: [0, 0, 0]
  },
  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    yield this.getProvinces()
    this.provinceZipCode=this.data.location[0][0].zipCode
    yield this.getProvince()
    this.cityZipCode=this.data.location[0][0].zipCode
    yield this.getCity()
  }),
  onShow: function () {
    this.getUserInfo()
  },
  getProvinces: co.wrap(function* () {
    let resp = yield gql.getProvinces()
    let location = resp.provinces
    this.setData({
      'location[0]': location
    })
    console.log()
  }),
  getProvince: co.wrap(function* () {
    let resp = yield gql.getProvince(this.provinceZipCode)
    let location = resp.province.children
    this.setData({
      'location[1]': location
    })
    console.log()
  }),
  getCity: co.wrap(function* () {
    let resp = yield gql.getCity(this.cityZipCode)
    let location = resp.province.children[0].children
    console.log(location)
    this.setData({
      'location[2]': location
    })
    console.log()
  }),
  getUserInfo: co.wrap(function* () {
    this.longToast.toast({
      type: "loading",
      duration: 0
    })
    try {
      let resp = yield gql.getUser()
      this.setData({
        kidInfo: resp.currentUser.selectedKid,
      })
      this.longToast.hide()
    } catch (e) {
      this.longToast.hide()
      util.showError(e)
    }
  }),
  locationChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    this.provinceZipCode=this.data.location[e.detail.column][e.detail.value].zipCode
    console.log(this.provinceZipCode)
  },
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail)
    // this.setData({
    //   multiIndex: e.detail.value
    // })
  },
  changeAvatar: function () {
    this.selectComponent("#checkComponent").showPop()
  },
  changeName: function () {
    router.navigateTo('/pages/package_common/account/name_edit')
  },
  bindbirthChange: co.wrap(function* (e) {
    this.setData({
      birthday: e.detail.value
    })
  }),
  uploadImage: co.wrap(function* (e) {
    if (!e.detail.tempFilePaths[0]) {
      return util.showError({
        title: '照片加载失败',
        content: '请重新选择重试'
      })
    }
    this.path = e.detail.tempFilePaths[0]
    router.navigateTo('/pages/package_common/account/avatar_edit', {
      url: this.path
    })
  }),
  changeGedner: co.wrap(function* (e) {
    let gender = e.currentTarget.id
    console.log(e, e.currentTarget.id)
    if (gender == this.data.kidInfo.gender) {
      return
    }
    yield this.complete({
      kidAttributes: {
        gender: gender,
      }
    })
  }),
  complete: co.wrap(function* (params) {
    this.longToast.toast({
      type: "loading",
      duration: 0
    })
    try {
      const resp = yield gql.changeStage(params)
      console.log(resp)
      // throw(resp)
      this.setData({
        kidInfo: resp.updateKid.kid
      })
      this.longToast.hide()
    } catch (e) {
      util.showError(e)
      this.longToast.hide()
    }
  }),
  changeStage() {
    router.navigateTo('pages/index/grade')
  }
})