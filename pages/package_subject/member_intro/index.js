import {
  regeneratorRuntime,
  wxNav,
  co
} from "../../../utils/common_import"

const app = getApp()
Page({
  data: {
    isFullScreen: false
  },
  onLoad: co.wrap(function* () {
    this.setData({
      isIos: yield app.isIos(),
      isFullScreen: app.isFullScreen
    })
  }),
  buyMember(e) {
    if (app.preventMoreTap(e)) return
    wxNav.navigateTo("/pages/package_member/member/index")
  }
})