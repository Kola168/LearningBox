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
    modal: {
      isShow: true,
      title: '开通学科会员，专项同步练习',
      slotContent: false,
      content: '难度划分更贴心，在家也能做练习',
      image: 'https://cdn-h.gongfudou.com/LearningBox/subject/toast_sync.png',
      soltBottom: true
    },
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
