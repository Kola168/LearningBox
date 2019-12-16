// pages/package_feature/print_balloon/edit.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')

import wxNav from '../../../utils/nav.js'
import graphql from '../../../network/graphql_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    templateList: [], // 模板列表
    selectedIndex:0,  //选中的模板的index
  },

  onLoad: function(options) {
    this.id = options.id
    this.getTemplate()
    this.chooseTemplate(this.data.selectedIndex)
  },

  getTemplate:co.wrap(function*(){
    let resp=yield graphql.searchTemplate('balloon')
    console.log(resp)
  }),

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
