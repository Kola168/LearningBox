// pages/package_preschool/evaluationprint/printset.js
Page({

  data: {
    printNum: 1,
    colorType: 'color'
  },

  onLoad: function(options) {

  },

  decreaseNum: function() {
    if (this.data.printNum <= 1) {
      return
    }
    this.data.printNum--
    this.setData({
      printNum: this.data.printNum
    })
  },

  addNum: function() {
    if (this.data.printNum >= 99) {
      return
    }
    this.data.printNum++
    this.setData({
      printNum: this.data.printNum
    })
  },

  changeColor: function(e) {
    let type = e.currentTarget.dataset.type
    this.setData({
      colorType: type
    })
  }
})
