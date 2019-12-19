// components/progress-modal/index.js
const app = getApp()
const MINVERSION = '1.4.0'

Component({
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    /**
     * 组件的属性列表
     */
    properties: {
        // 上传完成的数量
        completeCount: {
            type: Number,
            value: 0
        },
        percent: Number,
        // 当前选择的图片数量
        currentChooseCount: {
            type: Number,
            value: 0
        },
        // 主题色
        color: {
            type: String,
            value: '#FFE27A'
        },
        // 是否就显示百分比
        showInfo: {
            type: Boolean,
            value: false
        },
        // 文件类型标识
        key: {
            type: String,
            value: 'all'
        },
        slotTitle: Boolean,
        slotContent: Boolean,
        showInfo: Boolean,
        borderRadis: Number,
        fontSize: {
            type: Number,
            value: 15
        },
        width: {
            type: Number,
            value: 6
        },
        height: {
            type: Number,
            value: 10
        },
        activeColor: {
            type: String,
            value: '#FFE27A'
        },
        bgColor: {
            type: String,
            value: '#EFF0F5'
        }
    },
    data: {
        canUseProgressBar: false
    },
    attached () {
        this.verifyVersion()
    },
    methods: {
        cancelUpload () {
            this.triggerEvent('cancel')
        },
        verifyVersion: function () {
                this.setData({
                    canUseProgressBar: true
                })
        }
    }
})
