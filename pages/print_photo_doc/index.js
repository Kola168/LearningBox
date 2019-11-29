//pages/print_photo_doc/choose.js
"use strict"
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const util = require('../../utils/util')

const imgInit = require('../../utils/imgInit')  
const chooseImage = util.promisify(wx.chooseImage)
const showModal = util.promisify(wx.showModal)


const chooseCtx = {
    data: {
        showArea: false,
        showIndex: false,
        popWindow: false,
        showConsumablesModal: false, //耗材推荐弹窗
        consumablesIcon: false, //耗材推荐图标
        images: [],
        


    }
}

page(chooseCtx)
