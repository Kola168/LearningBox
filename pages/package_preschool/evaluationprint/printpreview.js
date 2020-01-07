// pages/package_preschool/evaluationprint/printpreview.js
import wxNav from '../../../utils/nav.js'

Page({

  data: {
    printImgs:['../images/record_voice_btn_recorder.png','../images/record_voice_btn_record_stop.png'],
    showIndex:0,
  },

  onLoad: function (options) {

  },

  backImg:function(){
    if(this.data.showIndex<=0){
      this.data.showIndex=this.data.printImgs.length-1
    }else{
      this.data.showIndex--
    }
    this.setData({
      showIndex:this.data.showIndex
    })
  },

  nextImg:function(){
    if(this.data.showIndex>=(this.data.printImgs.length-1)){
      this.data.showIndex=0
    }else{
      this.data.showIndex++
    }
    this.setData({
      showIndex:this.data.showIndex
    })
  },

  setPrint:function(){
    wxNav.redirectTo('/pages/package_preschool/evaluationprint/printset')
  }
})
