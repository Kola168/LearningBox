import {
  wxNav
} from "../../../utils/common_import"

const app = getApp()
Page({
  data: {
    isFullScreen: false
  },
  onLoad() {
    this.setData({
      isFullScreen: app.isFullScreen
    })
  },
  buyMember(e) {
    if (app.preventMoreTap(e)) return
    wxNav.navigateTo("/pages/package_member/member/index")
  }
})