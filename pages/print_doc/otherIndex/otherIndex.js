import router from '../../../utils/nav'

Page({
  toOtherIntro ({currentTarget: {id}}) {
    router.navigateTo('/pages/print_doc/otherIntro/otherIntro', {
      type: id
    })
  }
})