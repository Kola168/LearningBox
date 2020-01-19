export default {
  course: {
    btnList: [{
        name: "返回课程首页",
        url: '/pages/package_common/heart_course/index',
        type: 'switchTab',
        params: {},
        externalClasses: 'btn-cancel'
      },
      {
        name: "去学习课程",
        type: 'redirect',
        params: {},
        externalClasses: 'btn-study'
      }
    ],

    initParams: function (options) {
      var sn = options.sn || ''
      this.btnList[1] = Object.assign(this.btnList[1], {
        url: `/pages/package_course/course/course`,
        params: {
          isContinue: 0,
          sn: sn
        }
      })
    },

    initIndexPath: function(stage){
      this.btnList[0] = Object.assign(this.btnList[0], {
        type:  stage == 'preschool'  ? 'switchTab' : 'navigateTo',
        url: stage == 'preschool' ? 'pages/package_common/heart_course/index' : 'pages/course/index',
      })
    }
  }
}