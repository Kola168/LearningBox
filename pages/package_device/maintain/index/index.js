import { wxNav } from '../../../../utils/common_import'
Page({
  toNextPage(e){
    let pageKey = e.currentTarget.id
    wxNav.navigateTo(`../${pageKey}/index`)
  }
})