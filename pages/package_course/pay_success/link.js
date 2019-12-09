export default {
  course: {
    btnList: [{
        name: "返回课程首页",
        url: '/pages/index/index',
        type: 'switchTab',
        externalClasses: 'btn-cancel'
      },
      {
        name: "去学习课程",
        type: 'redirect',
        externalClasses: 'btn-study'
      }
    ],

    initParams: function (options) {
      var sn = options.sn || ''
      this.btnList[1] = Object.assign(this.btnList[1], {
        url: `/pages/package_course/course/course?isContinue=0&sn=${sn}`,
      })
    }
  }
}