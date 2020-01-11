// pages/package_subject/sync_learn/components/member-toast/index.js
import {
  wxNav
} from '../../../../../utils/common_import'
Component({
  data: {
    showMemberToast: false
  },

  properties: {
    modal: {
      type: Object,
      value: {
        isShow: true,
        title: '开通学科会员，专项同步练习',
        slotContent: false,
        content: '难度划分更贴心，在家也能做练习',
        image: 'https://cdn-h.gongfudou.com/LearningBox/subject/toast_sync.png',
        slotBottom: true
      }
    }
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
      console.log('触发了开通会员')
      wxNav.navigateTo('pages/package_member/member/index')
      this.hideToast()
    }
  }
})