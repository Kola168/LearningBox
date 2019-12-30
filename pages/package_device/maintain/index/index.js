import { wxNav } from '../../../../utils/common_import'
Page({
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
  }
})