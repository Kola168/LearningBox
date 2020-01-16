// pages/package_common/accountmanagement/index.js
Page({

  data: {

  },

  showModal:function(){
    this.selectComponent("#modal").showModal({
      title: '切换账号',
      content: '确认切换账号吗？每日重新登陆次数有限，请谨慎操作',
      cancelText: '取消',
      confirmText: '确认',
      confirmBg: '#FFDC5E;'
    })
  },

  modelConfirm:function(){

  },

  onLoad: function (options) {

  },

})
