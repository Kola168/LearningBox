// pages/package_preschool/evaluation/test.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')
const event = require('../../../lib/event/event')

import wxNav from '../../../utils/nav.js'
import api from '../../../network/restful_request'
import graphql from '../../../network/graphql/feature'
import commonRequest from '../../../utils/common_request'

let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    subjectList:[{
      voice:null,
      question:'../images/record_tips.png',
      options:['../images/record_voice_btn_recorder.png','../images/record_voice_btn_record_stop.png','../images/record_voice_btn_record_disabled.png','../images/record_voice_btn_playing.png'],
      correctOption:0,
    },{
      voice:"https://cdn-h.gongfudou.com/epbox/pciup/2020/1/2/f990435d-f5cd-4ba2-8dc1-75f6a80c4082.m4a",
      question:'../images/record_tips.png',
      options:['../images/record_voice_btn_recorder.png','../images/record_voice_btn_record_stop.png','../images/record_voice_btn_record_disabled.png','../images/record_voice_btn_playing.png'],
      correctOption:0,
    },{
      voice:null,
      question:'../images/record_tips.png',
      options:['../images/record_voice_btn_recorder.png','../images/record_voice_btn_record_stop.png','../images/record_voice_btn_record_disabled.png','../images/record_voice_btn_playing.png'],
      correctOption:0,
    },{
      voice:null,
      question:'../images/record_tips.png',
      options:['../images/record_voice_btn_recorder.png','../images/record_voice_btn_record_stop.png','../images/record_voice_btn_record_disabled.png','../images/record_voice_btn_playing.png'],
      correctOption:0,
    },{
      voice:null,
      question:'../images/record_tips.png',
      options:['../images/record_voice_btn_recorder.png','../images/record_voice_btn_record_stop.png','../images/record_voice_btn_record_disabled.png','../images/record_voice_btn_playing.png'],
      correctOption:0,
    },{
      voice:null,
      question:'../images/record_tips.png',
      options:['../images/record_voice_btn_recorder.png','../images/record_voice_btn_record_stop.png','../images/record_voice_btn_record_disabled.png','../images/record_voice_btn_playing.png'],
      correctOption:0,
    }],
    nowIndex:1, //当前测试index
    remainingTime:90, //剩余时间
    selectIndex:0,
  },

  onLoad: function (options) {

  },


})
