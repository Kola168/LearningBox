// pages/package_preschool/evaluation/secondlevel.js
import wxNav from '../../../utils/nav.js'

Page({

  data: {
    testPaper: [{
      image: '../images/record_voice_btn_record_stop.png',
      title: '测试标题2',
      desc: '描述2',
      state: '',
    },{
      image:'../images/record_voice_btn_record_stop.png',
      title:'测试标题3',
      desc:'描述3',
      state:'',
      children:[],
    }],
    title:''
  },

  onLoad: function(options) {
    this.setData({
      title:options.title
    })
  },
  startTest:function(e){
    let index=e.currentTarget.dataset.index
    wxNav.navigateTo('/pages/package_preschool/evaluation/test',{
      sn:this.data.gradeList[this.data.gradeIndex].testPaper[index].state
    })
  }
})
