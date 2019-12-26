// pages/package_subject/sync_learn/components/member-toast/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    showMemberToast: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showToast: function() {
      this.setData({
        showMemberToast: true
      })
    },

    hideToast: function() {
      this.setData({
        showMemberToast: false
      })
    },

    toMember: function() {
      console.log('触发了开通会员')
      this.hideToast()
    }
  }
})
