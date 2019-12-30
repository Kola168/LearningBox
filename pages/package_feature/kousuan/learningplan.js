// pages/package_feature/kousuan/learningplan.js
Page({

  data: {
    planTypeCheck:'executing',
    executingList:[{
      name:'七天专项练习1',
      calculateType:'纯口算',
      typeName:'十以内加减法',
      startTime:'2019-09-09 20:00',
      finishTime:'2019-09-19 20:00'
    }]
  },

  onLoad: function (options) {

  },

  checkPlanType:function(e){
    let type=e.currentTarget.dataset.type
    this.setData({
      planTypeCheck:type
    })
  }

})
