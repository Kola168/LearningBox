// pages/package_preschool/evaluation/testfinish.js
import wxNav from '../../../utils/nav.js'

Page({

  data: {
    achievementArr:[{
      name:'自信力',
      grade:1,
    },{
      name:'快乐力',
      grade:2,
    },{
      name:'社交能力',
      grade:0,
    },{
      name:'学习知识',
      grade:2,
    },{
      name:'数理思维',
      grade:1,
    },{
      name:'语言表达',
      grade:2,
    },{
      name:'想象创造',
      grade:0,
    }],
    fullMarks:4,   //满分
    scale:2,  //正确题数与分数的比例

  },

  onLoad: function (options) {

  },

  toprint:function(){
    wxNav.navigateTo('/pages/package_preschool/evaluationprint/printpreview')
  },

})
