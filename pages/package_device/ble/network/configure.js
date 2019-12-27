// pages/device/index.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const CryptoJS = require("../../../lib/crypto-js/crypto-js")

const getSystemInfo = util.promisify(wx.getSystemInfo)
const showModal = util.promisify(wx.showModal)


const writeBLECharacteristicValue = util.promisify(wx.writeBLECharacteristicValue)
const notifyBLECharacteristicValueChange = util.promisify(wx.notifyBLECharacteristicValueChange)



let networkStatusCount = 0



Page({
    data: {
        device: null,
        scanWifiService: null,
        setNetworkService: null,
        debugService: null,
        ctScanwifiRead: null,
        ctScanwifiNotify: null,
        ctSetNetworkWrite: null,
        ctSetNetworkNotify: null,
        ctDebugWrite: null,
        setNetworkService: null,

        ssid: null,
        psk: "",

        networkStatus: false,
        password: '',
        deviceImage: '', //设备图片
    },

    inputValue: function(e) {
        console.log('input e=========', e)
    },
    endInput: function(e) {
        console.log('endValue e=====', e.detail.value)
        this.setData({
            psk: e.detail.value
        })
    },

    initUI: co.wrap(function*(deviceInfo) {
        let deviceName = deviceInfo.device.localName.split('-')[0]
        this.setData({
            deviceTitle: deviceName == 'EP200' ? '请设置小白盒WIFI' : '请设置打印机WIFI',
            deviceImage: deviceName == 'EP200' ? 'https://cdn.gongfudou.com/miniapp/ec/ble/ble_box_light_red.png' : 'https://cdn.gongfudou.com/miniapp/ec/ble/l3115_new_red.png',
            deviceDesc: deviceName == 'EP200' ? '请检查小白盒指示灯是否为红色闪烁状态' : '请检查上图指示灯是否为红色闪烁状态'
        })
    }),

    onLoad: co.wrap(function*(query) {
        let _this = this

        this.longToast = new app.WeToast()
        this.deviceInfo = query.deviceInfo
        let deviceInfo = JSON.parse(decodeURIComponent(query.deviceInfo))

        console.log('配置页面接收到的特征值消息=====', deviceInfo)
        yield this.initUI(deviceInfo)
        this.setData({
            ssid: query.ssid,
            device: deviceInfo.device,
            scanWifiService: deviceInfo.scanWifiService,
            ctScanwifiRead: deviceInfo.ctScanwifiRead,
            ctScanwifiNotify: deviceInfo.ctScanwifiNotify,
            ctSetNetworkWrite: deviceInfo.ctSetNetworkWrite,
            ctSetNetworkNotify: deviceInfo.ctSetNetworkNotify,
            setNetworkService: deviceInfo.setNetworkService
        })

        // 监听蓝牙适配器状态
        wx.onBluetoothAdapterStateChange(function(res) {
            console.log(`蓝牙适配器状态 available:${res.available} discovering:${res.discovering}`)
        })

        wx.onBLECharacteristicValueChange(function(res) {
            console.log(res.value)
            var receiveText = util.buf2string(res.value)
            console.log(`接收到CH<${res.characteristicId}>数据：${receiveText}`)

            if (res.characteristicId == _this.data.ctScanwifiNotify.uuid) {
                // scan wifi notify
                if (receiveText == "#end") {
                    // 停止notify
                    wx.notifyBLECharacteristicValueChange({
                        state: false,
                        deviceId: _this.data.device.deviceId,
                        serviceId: _this.data.scanWifiService.uuid,
                        characteristicId: _this.data.ctScanwifiNotify.uuid
                    })
                    if (tmpSSIDs.length == 0) {
                        // 未检搜索到wifi
                    } else {
                        _this.setData({
                            ssids: tmpSSIDs
                        })
                    }
                    wx.hideLoading()
                } else {
                    let ssid = decodeURIComponent(receiveText.replace(/\\x+/g, "%"))
                    tmpSSIDs.push(ssid)
                }
            } else if (res.characteristicId == _this.data.ctSetNetworkNotify.uuid) {
                // network status notify
                networkStatusCount++
                if (receiveText == "true") {
                    // 联网成功
                    wx.notifyBLECharacteristicValueChange({
                        state: false,
                        deviceId: _this.data.device.deviceId,
                        serviceId: _this.data.setNetworkService.uuid,
                        characteristicId: _this.data.ctSetNetworkNotify.uuid
                    })

                    _this.setData({
                        networkStatus: true
                    })
                    _this.longToast.toast()
                        // wx.showToast({
                        //     title: '配网成功！',
                        //     icon: 'success',
                        //     duration: 3000
                        // })
                        // setTimeout(function() {
                        //     wx.navigateTo({
                        //         url: `/pages/ble/common/connect_success`
                        //     })
                        // }, 3000)
                    wx.redirectTo({
                        url: `/pages/ble/common/connect_success?deviceInfo=${_this.deviceInfo}`
                    })

                } else {
                    // 联网失败
                    _this.setData({
                        networkStatus: false
                    })
                    if (networkStatusCount > 20) {
                        // 超时
                        wx.notifyBLECharacteristicValueChange({
                            state: false,
                            deviceId: _this.data.device.deviceId,
                            serviceId: _this.data.setNetworkService.uuid,
                            characteristicId: _this.data.ctSetNetworkNotify.uuid
                        })

                        _this.longToast.toast()
                        wx.showModal({
                            title: '提示',
                            content: '网络配置失败，请检查wifi和密码是否正确！',
                            showCancel: false
                        })
                    }
                }
            } else if (res.characteristicId == _this.data.ctScanwifiRead.uuid) {
                wx.showModal({
                    title: 'bindCode',
                    content: receiveText,
                    showCancel: false
                })
            }
        })
    }),

    onShow: co.wrap(function*() {

    }),
    changeSSID: co.wrap(function*(e) {
        this.setData({
            ssid: this.data.ssids[e.detail.value]
        })
    }),

    setNetwork: co.wrap(function*(e) {
        //校验wifi密码
        // if (this.data.psk.trim() == '') {
        //     wx.showModal({
        //         title: '提示',
        //         content: '请输入WIFI密码',
        //         showCancel: false
        //     })
        //     return
        // }
        console.log('this.data.ssid,this.data.psk===', this.data.ssid, this.data.psk)
        this.longToast.toast({
            img: '/images/loading.gif',
            title: '配网中...',
            duration: 0
        })
        let wordArray = CryptoJS.enc.Utf8.parse(`${this.data.ssid}||${this.data.psk}`)
        let ssidPsk = CryptoJS.enc.Base64.stringify(wordArray)
        let dataStr = `${ssidPsk}#end`
        console.log(`write data: ${dataStr}`)
        var sendCount = Math.ceil(dataStr.length / 18)
        console.log('发送的数据包数为:' + sendCount)
        for (let i = 0; i < sendCount; i++) {
            let temp = ''
            if (i == sendCount - 1) {
                temp = dataStr.substring(dataStr.length % 18 == 0 ? 18 : dataStr.length - dataStr.length % 18)
            } else {
                temp = dataStr.substr(i == 0 ? 0 : i * 18, 18)
            }
            console.log(i + '单包数据为:', temp)
            let buffer = yield this.char2buf(temp)
            try {
                yield writeBLECharacteristicValue({
                    deviceId: this.data.device.deviceId,
                    serviceId: this.data.setNetworkService.uuid,
                    characteristicId: this.data.ctSetNetworkWrite.uuid,
                    value: buffer
                })
            } catch (e) {
                console.log('低功耗蓝牙e========', e)
            }
            console.log('执行到这里========')
                // 间隔
            yield util.sleep(250)
            console.log('执行到这里111111========')
        }
        console.log('发送完毕')

        // 监听notify
        networkStatusCount = 0
        yield notifyBLECharacteristicValueChange({
            state: false,
            deviceId: this.data.device.deviceId,
            serviceId: this.data.setNetworkService.uuid,
            characteristicId: this.data.ctSetNetworkNotify.uuid
        })
        yield notifyBLECharacteristicValueChange({
            state: true,
            deviceId: this.data.device.deviceId,
            serviceId: this.data.setNetworkService.uuid,
            characteristicId: this.data.ctSetNetworkNotify.uuid
        })
    }),

    char2buf: co.wrap(function*(str) {
        var out = new ArrayBuffer(str.length)
        var u8a = new Uint8Array(out)
        var strs = str.split("")
        for (var i = 0; i < strs.length; i++) {
            u8a[i] = strs[i].charCodeAt()
        }
        return out
    }),

    changeNetwork: co.wrap(function*() {
        wx.redirectTo({
            url: `/pages/ble/network/wifi_list?deviceInfo=${this.deviceInfo}`
        })
    })
})