// pages/package_feature/print_stickerbook/edit.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')
const upload = require('../../../utils/upload')
const imginit = require('../../../utils/imginit')

const showModal = util.promisify(wx.showModal)

import wxNav from '../../../utils/nav.js'
Page({

  data: {
    templateList: [
      {
        "id": 34,
        "name": "热门",
        "templates": [{
            "id": 313,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/bd7703f6-e0bf-41a1-9ba1-a0591bbdac35",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/bd7703f6-e0bf-41a1-9ba1-a0591bbdac35?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "567",
            "area_height": "827",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 315,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/2de6b5a9-5d38-43c0-8239-53b5e182a1bb",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/2de6b5a9-5d38-43c0-8239-53b5e182a1bb?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "567",
            "area_height": "515",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 317,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/ca1ca76a-83a6-422d-8e74-e8c39e456fdd",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/ca1ca76a-83a6-422d-8e74-e8c39e456fdd?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "459",
            "area_height": "538",
            "area_x": "56",
            "area_y": "214"
          },
          {
            "id": 319,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/f06038fe-0bbc-45d9-8e45-47048e86595a",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/f06038fe-0bbc-45d9-8e45-47048e86595a?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "567",
            "area_height": "827",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 321,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/4f956803-21ce-4a3f-b01c-9c084b717946",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/4f956803-21ce-4a3f-b01c-9c084b717946?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "567",
            "area_height": "827",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 323,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/a6349cb2-8b32-46ae-a2bb-1816a60d3bdf",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/a6349cb2-8b32-46ae-a2bb-1816a60d3bdf?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "456",
            "area_height": "539",
            "area_x": "30",
            "area_y": "67"
          }
        ]
      },
      {
        "id": 35,
        "name": "节日",
        "templates": [{
            "id": 325,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/8588b330-d8bf-4889-a58c-5288b8ae8261",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/8588b330-d8bf-4889-a58c-5288b8ae8261?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "543",
            "area_height": "729",
            "area_x": "24",
            "area_y": "74"
          },
          {
            "id": 327,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/ab10d4df-e427-48b4-8c99-49b19bea5f9e",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/ab10d4df-e427-48b4-8c99-49b19bea5f9e?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "550",
            "area_height": "631",
            "area_x": "17",
            "area_y": "79"
          },
          {
            "id": 329,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/6f6f2079-61c3-4f5d-a290-8cebd3edf372",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/6f6f2079-61c3-4f5d-a290-8cebd3edf372?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "567",
            "area_height": "521",
            "area_x": "0",
            "area_y": "27"
          },
          {
            "id": 332,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/0abddb57-6de4-40b0-884c-c1772d172123",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/0abddb57-6de4-40b0-884c-c1772d172123?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "523",
            "area_height": "523",
            "area_x": "22",
            "area_y": "116"
          },
          {
            "id": 334,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/b181dfa4-d244-42f8-bcce-64867e7ee442",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/b181dfa4-d244-42f8-bcce-64867e7ee442?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "555",
            "area_height": "645",
            "area_x": "12",
            "area_y": "15"
          },
          {
            "id": 336,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/bba208ce-26d0-4394-bf61-ae5b11456692",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/bba208ce-26d0-4394-bf61-ae5b11456692?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "512",
            "area_height": "504",
            "area_x": "26",
            "area_y": "231"
          },
          {
            "id": 338,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/cf947e9a-01e4-45c2-ab4b-bf6d0f2fe5b4",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/cf947e9a-01e4-45c2-ab4b-bf6d0f2fe5b4?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "485",
            "area_height": "560",
            "area_x": "40",
            "area_y": "134"
          },
          {
            "id": 340,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/c6ffea8c-8e88-45b7-9ca3-4a52df113156",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/c6ffea8c-8e88-45b7-9ca3-4a52df113156?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "567",
            "area_height": "730",
            "area_x": "0",
            "area_y": "9"
          }
        ]
      },
      {
        "id": 36,
        "name": "亲情",
        "templates": [{
            "id": 342,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/f673d473-16a2-44c2-b9dd-2e666ae8b2d5",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/f673d473-16a2-44c2-b9dd-2e666ae8b2d5?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "567",
            "area_height": "827",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 344,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/7a47550a-883b-4e66-ae68-f7337a06c86b",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/7a47550a-883b-4e66-ae68-f7337a06c86b?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "567",
            "area_height": "696",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 346,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/76268d2c-19ef-487e-a09c-643dbb491d55",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/76268d2c-19ef-487e-a09c-643dbb491d55?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "567",
            "area_height": "827",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 348,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/2a684ecc-b33e-404a-a7e9-c9b0f90b99b7",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/2a684ecc-b33e-404a-a7e9-c9b0f90b99b7?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "567",
            "area_height": "827",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 350,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/93457b0e-38a9-45d0-9a0d-a066447aa917",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/93457b0e-38a9-45d0-9a0d-a066447aa917?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "567",
            "area_height": "827",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 352,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/9e1ed26e-59e4-4f7f-8b4b-3e311d105f0e",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/9e1ed26e-59e4-4f7f-8b4b-3e311d105f0e?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "536",
            "area_height": "827",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 354,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/2d91d5a3-bfb2-4f23-b6ea-515e02a96717",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/2d91d5a3-bfb2-4f23-b6ea-515e02a96717?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "567",
            "area_height": "827",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 356,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/6fbcc76f-3842-4752-a2c2-7329dd9db598",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/6fbcc76f-3842-4752-a2c2-7329dd9db598?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "506",
            "area_height": "827",
            "area_x": "0",
            "area_y": "0"
          }
        ]
      },
      {
        "id": 37,
        "name": "家庭",
        "templates": [{
            "id": 358,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/14019818-f8ee-4d7d-903a-eec77134fd76",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/14019818-f8ee-4d7d-903a-eec77134fd76?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "553",
            "area_height": "641",
            "area_x": "6",
            "area_y": "30"
          },
          {
            "id": 360,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/b025f4f2-2734-4d98-a64e-6cce34b148ca",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/b025f4f2-2734-4d98-a64e-6cce34b148ca?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "512",
            "area_height": "474",
            "area_x": "30",
            "area_y": "318"
          },
          {
            "id": 362,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/a2a9808d-44cf-412d-b63d-33c76fcf7973",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/a2a9808d-44cf-412d-b63d-33c76fcf7973?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "567",
            "area_height": "695",
            "area_x": "0",
            "area_y": "132"
          },
          {
            "id": 364,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/55a91cf2-d29e-4db7-9ca0-88c0ef643eb2",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/55a91cf2-d29e-4db7-9ca0-88c0ef643eb2?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "564",
            "area_height": "391",
            "area_x": "0",
            "area_y": "78"
          },
          {
            "id": 366,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/4df241db-76bf-43a9-ba4c-bba443637ddc",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/4df241db-76bf-43a9-ba4c-bba443637ddc?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "567",
            "area_height": "827",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 369,
            "name": "",
            "width": "567",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/bf1758e4-316a-4f4e-97ec-ab0807d57993",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/bf1758e4-316a-4f4e-97ec-ab0807d57993?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "542",
            "area_height": "456",
            "area_x": "18",
            "area_y": "295"
          }
        ]
      },
      {
        "id": 46,
        "name": "学习",
        "templates": [{
            "id": 439,
            "name": "",
            "width": "527",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/60bf8d00-6f4c-4fb4-b66e-f78203989212",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/60bf8d00-6f4c-4fb4-b66e-f78203989212?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "527",
            "area_height": "827",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 440,
            "name": "",
            "width": "527",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/793db364-645d-490b-b1e0-0c7dc76fd3a1",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/793db364-645d-490b-b1e0-0c7dc76fd3a1?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "461",
            "area_height": "658",
            "area_x": "28",
            "area_y": "41"
          },
          {
            "id": 441,
            "name": "",
            "width": "527",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/a48b2b3a-6c28-4432-96a0-1716edd0daa5",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/a48b2b3a-6c28-4432-96a0-1716edd0daa5?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "460",
            "area_height": "702",
            "area_x": "34",
            "area_y": "60"
          },
          {
            "id": 442,
            "name": "",
            "width": "527",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/93f165ca-7cfc-4a3e-9f54-ab09322b0a43",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/93f165ca-7cfc-4a3e-9f54-ab09322b0a43?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "493",
            "area_height": "712",
            "area_x": "17",
            "area_y": "39"
          },
          {
            "id": 443,
            "name": "",
            "width": "527",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/38fccfa5-4e04-46b7-9156-0f669af8e3ea",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/38fccfa5-4e04-46b7-9156-0f669af8e3ea?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "516",
            "area_height": "516",
            "area_x": "5",
            "area_y": "42"
          },
          {
            "id": 444,
            "name": "",
            "width": "527",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/e097a7cd-f0ef-467a-baad-6cea22711ef5",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/e097a7cd-f0ef-467a-baad-6cea22711ef5?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "442",
            "area_height": "546",
            "area_x": "56",
            "area_y": "52"
          },
          {
            "id": 445,
            "name": "",
            "width": "527",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/fc66965b-0e4b-4b64-add5-7fe914cbf5cc",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/fc66965b-0e4b-4b64-add5-7fe914cbf5cc?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "437",
            "area_height": "669",
            "area_x": "45",
            "area_y": "65"
          },
          {
            "id": 446,
            "name": "",
            "width": "527",
            "height": "827",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/bc05ce62-c4ef-43c2-a915-d3d2fd117728",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/bc05ce62-c4ef-43c2-a915-d3d2fd117728?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "455",
            "area_height": "668",
            "area_x": "37",
            "area_y": "73"
          }
        ]
      }
    ],
    templateInfo: {}, //传入组件的模板信息
    paperSize: {}, //传入组件的纸张信息
    templateIndex: 0, //选择的模板index
    templateTypeIndex: 0, //选择的模板种类index
    direction:'vertical',
  },

  onLoad: function(options) {
    this.imgInfo=JSON.parse(decodeURIComponent(options.imgInfo))
    this.setComponentData()
  },

  setComponentData:function(){
    let templateInfo=this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex]
    let modeSize={
      x: templateInfo.area_x,
      y: templateInfo.area_y,
      areaWidth: templateInfo.area_width,
      areaHeight: templateInfo.area_height,
    }
    this.setData({
      photoPath:this.imgInfo.url,
      imageInfo:{
        width:this.imgInfo.imgInfo.width,
        height:this.imgInfo.imgInfo.height
      },
      paperSize:{
        width: Number(templateInfo.width),
        height: Number(templateInfo.height),
        minLeftHeight: 600,
        sider: 46,
      },
      templateInfo:{
        modeSrc: templateInfo.img_url,
        modeSize: modeSize
      }
    })
  },

  checkTemplateType:function(e){
    let index=e.currentTarget.dataset.index
    this.setData({
      templateTypeIndex:index
    })
    this.checkTemplate(0)
  },

  checkTemplate:function(e){
    let index=e.currentTarget?e.currentTarget.dataset.index:e
    this.setData({
      templateIndex:index
    })
    this.setComponentData()
  },

})
