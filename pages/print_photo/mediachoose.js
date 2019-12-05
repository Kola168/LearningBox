// pages/print_photo/mediachoose.js
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const _ = require('../../lib/underscore/we-underscore')
const util = require('../../utils/util')

import wxNav from '../../utils/nav.js'
Page({
  data: {

  },

  onLoad: function (options) {

  },

  choosemedia:function(e){
    wxNav.redirectTo('/pages/print_photo/photolist', {
      mediaType:e.currentTarget.dataset.type
    })
  },
})
