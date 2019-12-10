// pages/package_feature/print_balloon/edit.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    templateList: [{
      area_height: "1499",
      area_width: "1499",
      area_x: "61",
      area_y: "463",
      height: "2339",
      id: 371,
      img_url: "https://cdn-h.gongfudou.com/epbox/templates/85239c29-dc08-48f3-8bab-354997a4aad8",
      name: "圆形气球1",
      preview_url: "https://cdn-h.gongfudou.com/epbox/templates/85239c29-dc08-48f3-8bab-354997a4aad8?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
      width: "1654",
    }, {
      area_height: "1244",
      area_width: "1244",
      area_x: "197",
      area_y: "595",
      height: "2339",
      id: 414,
      img_url: "https://cdn-h.gongfudou.com/epbox/templates/5f66bc7f-d6db-4dcd-9bf4-253981bb1034",
      name: "圆形模板1",
      preview_url: "https://cdn-h.gongfudou.com/epbox/templates/5f66bc7f-d6db-4dcd-9bf4-253981bb1034?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
      width: "1654",
    }, {
      area_height: "1342",
      area_width: "1342",
      area_x: "148",
      area_y: "546",
      height: "2339",
      id: 415,
      img_url: "https://cdn-h.gongfudou.com/epbox/templates/f52c0b9a-4e38-46da-b6d3-a50226c994d0",
      name: "圆形模板2",
      preview_url: "https://cdn-h.gongfudou.com/epbox/templates/f52c0b9a-4e38-46da-b6d3-a50226c994d0?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
      width: "1654",
    }, {
      area_height: "1342",
      area_width: "1342",
      area_x: "148",
      area_y: "546",
      height: "2339",
      id: 415,
      img_url: "https://cdn-h.gongfudou.com/epbox/templates/f52c0b9a-4e38-46da-b6d3-a50226c994d0",
      name: "圆形模板2",
      preview_url: "https://cdn-h.gongfudou.com/epbox/templates/f52c0b9a-4e38-46da-b6d3-a50226c994d0?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
      width: "1654",
    }, {
      area_height: "1342",
      area_width: "1342",
      area_x: "148",
      area_y: "546",
      height: "2339",
      id: 415,
      img_url: "https://cdn-h.gongfudou.com/epbox/templates/f52c0b9a-4e38-46da-b6d3-a50226c994d0",
      name: "圆形模板2",
      preview_url: "https://cdn-h.gongfudou.com/epbox/templates/f52c0b9a-4e38-46da-b6d3-a50226c994d0?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
      width: "1654",
    }, {
      area_height: "1342",
      area_width: "1342",
      area_x: "148",
      area_y: "546",
      height: "2339",
      id: 415,
      img_url: "https://cdn-h.gongfudou.com/epbox/templates/f52c0b9a-4e38-46da-b6d3-a50226c994d0",
      name: "圆形模板2",
      preview_url: "https://cdn-h.gongfudou.com/epbox/templates/f52c0b9a-4e38-46da-b6d3-a50226c994d0?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
      width: "1654",
    }, {
      area_height: "1342",
      area_width: "1342",
      area_x: "148",
      area_y: "546",
      height: "2339",
      id: 415,
      img_url: "https://cdn-h.gongfudou.com/epbox/templates/f52c0b9a-4e38-46da-b6d3-a50226c994d0",
      name: "圆形模板2",
      preview_url: "https://cdn-h.gongfudou.com/epbox/templates/f52c0b9a-4e38-46da-b6d3-a50226c994d0?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
      width: "1654",
    }, {
      area_height: "1342",
      area_width: "1342",
      area_x: "148",
      area_y: "546",
      height: "2339",
      id: 415,
      img_url: "https://cdn-h.gongfudou.com/epbox/templates/f52c0b9a-4e38-46da-b6d3-a50226c994d0",
      name: "圆形模板2",
      preview_url: "https://cdn-h.gongfudou.com/epbox/templates/f52c0b9a-4e38-46da-b6d3-a50226c994d0?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
      width: "1654",
    }], // 模板列表
    selectedIndex:0,  //选中的模板的index
  },

  onLoad: function(options) {
    this.id = options.id
    this.chooseTemplate(this.data.selectedIndex)
  },

  chooseTemplate:function(index){
    this.setData({
      paperSize: {
        width: this.data.templateList[index].width,
        height: this.data.templateList[index].height,
        heightPer: 0.666,
        minLeftHeight: 385,
        sider: 220,
      },
      templateInfo: {
        modeSrc:this.data.templateList[index].img_url,
        modeSize: {
          x: this.data.templateList[index].area_x,
          y: this.data.templateList[index].area_y,
          width: this.data.templateList[index].width,
          height: this.data.templateList[index].height,
          areaWidth: this.data.templateList[index].area_width,
          areaHeight: this.data.templateList[index].area_height,
        }
      }
    })
  },

  tapTemplate:function(e){
    let index=e.currentTarget.dataset.index
    Loger(index)
    this.setData({
      selectedIndex:index
    })
    this.chooseTemplate(index)

  },

})
