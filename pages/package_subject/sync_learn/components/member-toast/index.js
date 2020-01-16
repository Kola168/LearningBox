// pages/package_subject/sync_learn/components/member-toast/index.js
import {
  wxNav
} from '../../../../../utils/common_import'
import copyWriter from './config'
Component({
  data: {
    showMemberToast: false,
    isAndroid: false,
    modal: {}
  },

  properties: {
    memberToast: {
      type:String,
      value: ''
    }
  },
  
  attached: function(){
    var systemInfo = wx.getSystemInfoSync()
    var isAndroid = systemInfo.system.indexOf('iOS') > -1 ? false : true
    this.setData({
      modal: copyWriter[this.data.memberToast][isAndroid ? 'android' : 'ios'],
      isAndroid: isAndroid,
    })
  },

  methods: {
    showToast: function () {
      this.setData({
        showMemberToast: true
      })
    },

    hideToast: function () {
      this.setData({
        showMemberToast: false
      })
    },

    toMember: function () {
      wxNav.navigateTo('pages/package_member/member/index')
      this.hideToast()
    }
  }
})