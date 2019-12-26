import { wxNav } from "../../../../utils/common_import"

Page({
  toNext(e){
    let pageKey = e.currentTarget.id
    wxNav.navigateTo(`../${pageKey}/index`)
  }
})