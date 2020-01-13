// pages/package_common/instructions/index.js
import wxNav from '../../../utils/nav.js'

Page({

  data: {
    equipmentBrand:[{
      name:'品牌',
      children:[{
        name:'型号'
      }]
    }],
    equipmentIndex:0,
    brandIndex:0,
    questionList:[{
      question:'打印机怎么加墨水',
      link:'https://www.baidu.com'
    },{
      question:'打印机卡纸怎么办',
      link:'https://www.baidu.com'
    },{
      question:'打印机怎么绑定盒子',
      link:'https://www.baidu.com'
    },{
      question:'会员怎么购买',
      link:'https://www.baidu.com'
    }], //问题列表
  },

  onLoad: function (options) {

  },

  toSearch:function(){
    wxNav.navigateTo('/pages/package_common/instructions/search')
  }
})
