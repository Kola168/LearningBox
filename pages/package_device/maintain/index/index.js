import {
  wxNav
} from '../../../../utils/common_import'
Page({
  data: {
    modalObj: {
      isShow: false,
      slotBottom: true,
      content: '联系系统客服回复“小白”，点击链接长按识别二维码即可关注公众号'
    }
  },
  onLoad(query) {
    this.sn = query.sn
    this.updateInfo = query.updateInfo
  },
  toNextPage(e) {
    let pageKey = e.currentTarget.id,
      params = {
        sn: this.sn
      }
    if (pageKey === 'firmware') {
      params.updateInfo = this.updateInfo
    }
    wxNav.navigateTo(`../${pageKey}/index`, params)
  },
  showModal() {
    this.setData({
      ['modalObj.isShow']: true
    })
  }
})