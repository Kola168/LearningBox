"use strict"
import router from '../../../utils/nav'
Page({
  toLongPress() {
    router.navigateTo('pages/print_doc/start_intro/start_intro', {
      type: 'longPress'
    })
  }
})