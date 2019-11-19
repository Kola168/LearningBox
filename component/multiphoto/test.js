// pages/gallery/component/multiphoto/test.js
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')
const _ = require('../../lib/underscore/we-underscore')

const request = util.promisify(wx.request)

Page({

    data: {
        templateInfo: {}, //当前模板信息
        modeTemplate: [{
            templateNAme: '6寸',
            templateArr: [{
                    modeSrc: "https://cdn.gongfudou.com/iup/2019/7/23/e06a6e8b-1102-4066-8add-d47a2c04cee0", //模板src地址
                    //模板尺寸，按从上到下依次为从下到上
                    modeSize: [{
                            x: 28,
                            y: 88,
                            width: 1300,
                            height: 1950,
                            areaWidth: 1239,
                            areaHeight: 1042,
                        },
                        {
                            x: 120,
                            y: 1229,
                            width: 1300,
                            height: 1950,
                            areaWidth: 1002,
                            areaHeight: 557,
                        }
                    ],
                },
                {
                    modeSrc: "http://gfd-i.memeyin.com/671f3f6b-5ed0-4346-835e-71bad56db5b6", //白版模板
                    modeSize: [{
                        x: 0,
                        y: 0,
                        width: 1300,
                        height: 1950,
                        areaWidth: 1300,
                        areaHeight: 1950,
                    }],
                }
            ]
        }], //模板列表

        paperSize: {
            width: 1300, //打印纸张尺寸
            height: 1950, //单位px
            heightPer: 0.68 //照片编辑区域所占高度比例
        },
        photoPath: 'https://cdn-h.gongfudou.com/Hyperion/miniapp/2019/10/31/710e66a7-76f6-4edd-8a8d-a3c321cd0750.jpg',
        themeSelectedIndex: 0,
        modeSelectedIndex: 0,

    },

    onLoad: function(options) {
        this.chooseTemplate()
    },

    chooseTheme: function(e) {
        if (this.data.themeSelectedIndex == e.currentTarget.dataset.index) {
            return
        }
        this.setData({
            themeSelectedIndex: e.currentTarget.dataset.index,
            modeSelectedIndex: 0
        })
        this.chooseTemplate()
    },

    chooseMode: function(e) {
        if (this.data.modeSelectedIndex == e.currentTarget.dataset.index) {
            return
        }
        this.setData({
            modeSelectedIndex: e.currentTarget.dataset.index
        })
        this.chooseTemplate()
    },

    chooseTemplate: function() {
        this.setData({
            templateInfo: this.data.modeTemplate[this.data.themeSelectedIndex].templateArr[this.data.modeSelectedIndex]
        })
    },

    getComponentData: co.wrap(function*(e) {
        try {
            let params = this.selectComponent("#mymulti").getImgPoint()[0] //页面调用组件内方法
            console.log(params)
            const resp = yield request({
                // url: `http://192.168.6.40:3000/hyperion_api/v1/designs/${app.openId}/edit_convert`,

                url: app.apiGalleryServer + `/hyperion_api/v1/designs/${app.openId}/6inch_convert`,
                header: {
                    'G-Auth': app.pAuthAppKey
                },
                method: 'POST',
                dataType: 'json',
                data: {
                    before_rotate: params.before_rotate,
                    editor_scale: params.editor_scale,
                    image_height: params.image_height,
                    image_url: params.image_url,
                    image_width: params.image_width,
                    media_type: "_6inch",
                    open_id: "oXI370Mp3xBUtzmezVtreNIh3jso",
                    rotate: params.rotate,
                    scale: params.scale,
                    template_id: 34,
                    x: params.x,
                    y: params.y,
                }
            })
            console.log(resp.data)
            wx.previewImage({
                current: resp.data.url, // 当前显示图片的http链接
                urls: [resp.data.url] // 需要预览的图片http链接列表
            })
        } catch (e) {
            console.log(e)
        }
    }),

    onShareAppMessage: function() {

    }
})
