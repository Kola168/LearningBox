// pages/package_subject/sync_learn/components/member-toast/index.js
import {
  wxNav,
  co,
  regeneratorRuntime,
} from '../../../../utils/common_import'
import graphqlAll from '../../../../network/graphql_request'

Component({
  data: {
    showMemberToast: false,
    isPreschoolMember: false
  },

  properties: {
    modal: {
      type: Object,
      value: {
        title: '',
        desc: ''
      }
    }
  },

  pageLifetimes: {
    show: co.wrap(function*(){
      var systemInfo = wx.getSystemInfoSync()
      this.setData({
        isAndroid: systemInfo.system.indexOf('iOS') > -1 ? false : true,
      })
      yield this.getMember()
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

    /**
     * 判断是否是会员
     */
    getMember: co.wrap(function*(){
      try {
        var resp = yield graphqlAll.getUserMemberInfo()
        this.setData({
          isPreschoolMember: resp.currentUser.isPreschoolMember
        })
      } catch(err) {
        util.showError(err)
      }
    }),

    /**
     * 校验是否开通会员
     * @param {*} callback   
     */
    checkAuthMember: function(callback){
      if (!this.data.isPreschoolMember) {
        this.showToast()
      } else {
        callback && callback()
      }
    },

    /**
     * tiao zhuang
     */
    toMember: function () {
      wxNav.navigateTo('pages/package_member/member/index')
      this.hideToast()
    }
  }
})