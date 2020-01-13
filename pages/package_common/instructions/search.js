// pages/package_common/instructions/search.js
Page({

  data: {
    inputVal:null,
    searchList:[{
      name:'盒子红灯一直闪烁是怎么回事？',
      link:'https://www.baidu.com',
    },{
      name:'打印机出纸太慢了？',
      link:'https://www.baidu.com',
    },{
      name:'打印机卡住了，不出纸了？',
      link:'https://www.baidu.com',
    }]
  },

  onLoad: function (options) {

  },

  inputChange:function(e){
    this.setData({
      inputVal:e.detail.value
    })
  },

  clearSearchVal:function(){
    this.setData({
      inputVal:''
    })
  },


})
