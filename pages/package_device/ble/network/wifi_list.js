const app = getApp()
const regeneratorRuntime = require('../../../../lib/co/runtime')
const co = require('../../../../lib/co/co')
const util = require('../../../../utils/util')

const request = util.promisify(wx.request)
const showModal = util.promisify(wx.showModal)
const notifyBLECharacteristicValueChange = util.promisify(wx.notifyBLECharacteristicValueChange)

let tmpSSIDs = []
let networkStatusCount = 0
let newDevice = false //是否新固件，新固件分包接受数据
let tmpssids, tmpssid //分包数据

Page({
    data: {
        ssids: [],
        deviceInfo: null,
        device: null,
        serviceId: null,
        ctScanwifiRead: null,
        ctScanwifiNotify: null,
        ctSetNetworkWrite: null,
        ctSetNetworkNotify: null,
        setNetworkService: null,
        deviceInfo: null
    },

    onLoad: co.wrap(function*(query) {
        let _this = this
        this.longToast = new app.weToast()
        this.queryDeviceInfo = query.deviceInfo
        let deviceInfo = JSON.parse(decodeURIComponent(query.deviceInfo))

        console.log('接收到的特征值消息=====', deviceInfo)

        this.setData({
            deviceInfo: deviceInfo,
            device: deviceInfo.device,
            scanWifiService: deviceInfo.scanWifiService,
            ctScanwifiRead: deviceInfo.ctScanwifiRead,
            ctScanwifiNotify: deviceInfo.ctScanwifiNotify,
            ctSetNetworkWrite: deviceInfo.ctSetNetworkWrite,
            ctSetNetworkNotify: deviceInfo.ctSetNetworkNotify,
            setNetworkService: deviceInfo.setNetworkService
        })

        yield this.scanWifi()
        wx.onBLECharacteristicValueChange(function(res) {
            console.log(res.value)
            var receiveText = util.buf2string(res.value)
            console.log(`接收到CH<${res.characteristicId}>数据：${receiveText}`)

            if (res.characteristicId == _this.data.ctScanwifiNotify.uuid) {
                // scan wifi notify
                if (receiveText == "#end" || receiveText == "#endsplit") {
                    if (receiveText == "#endsplit") { //针对新的固件
                        console.log('tmpssid===end', tmpssid)
                        newDevice = false
                        tmpssids = tmpssid.split('||')
                        for (var i = 0; i < tmpssids.length; i++) {
                            try {
                                console.log('开始解密=====', tmpssids[i])
                                let ssid = decodeURIComponent(tmpssids[i].replace(/\\x+/g, "%"))
                                console.log('解密成功=====', ssid)
                                tmpSSIDs.push(ssid)
                            } catch (e) {
                                console.log('decode异常======', e)
                            }
                        }
                    }
                    console.log('tmpSSIDs===', tmpSSIDs)
                        // 停止notify
                    wx.notifyBLECharacteristicValueChange({
                        state: false,
                        deviceId: _this.data.device.deviceId,
                        serviceId: _this.data.scanWifiService.uuid,
                        characteristicId: _this.data.ctScanwifiNotify.uuid
                    })
                    if (tmpSSIDs.length == 0) {
                        // 未检搜索到wifi
                        console.log('未检搜索到wifi')
                        wx.navigateTo({
                            url: `/pages/package_device/ble/common/no_wifi?deviceInfo=${_this.queryDeviceInfo}`
                        })
                    } else {
                        console.log('tmpSSIDs========', tmpSSIDs)
                        _this.setData({
                            ssids: tmpSSIDs
                        })
                    }
                    _this.longToast.toast()

                } else {
                    let ssid = receiveText
                    if (receiveText == '#split#') {
                        tmpssid = ''
                        newDevice = true
                    }
                    if (newDevice) {
                        console.log('执行到新固件')
                        if (ssid.trim() != '' && ssid != '#split#') {
                            tmpssid = tmpssid + ssid
                        }
                    } else { //老固件继续执行原来的逻辑
                        console.log('执行到老固件')
                        if (ssid.trim() != '') {
                            try {
                                ssid = decodeURIComponent(receiveText.replace(/\\x+/g, "%"))
                                tmpSSIDs.push(ssid)
                            } catch (e) {
                                console.log('老固件ssid异常', e)
                            }
                        }
                    }
                }
            }
        })

    }),
    onShow: co.wrap(function*() {

    }),

    scanWifi: co.wrap(function*() {
			this.longToast.toast({
				type: "loading",
				title: 'wifi搜索中'
			})
	
        console.log('特征值notify...')
        tmpSSIDs = []
        try {
            yield notifyBLECharacteristicValueChange({
                state: false,
                deviceId: this.data.device.deviceId,
                serviceId: this.data.scanWifiService.uuid,
                characteristicId: this.data.ctScanwifiNotify.uuid
            })
        } catch (error) {
            console.log('notifyBLECharacteristicValueChange1', error)
            this.longToast.toast()
            const res = yield showModal({
                title: '提示',
                content: 'WIFI连接超时',
                showCancel: false,
                confirmColor: '#fae100',
            })
            if (res.confirm) {
                wx.navigateBack()
            }
        }

        try {
            yield notifyBLECharacteristicValueChange({
                state: true,
                deviceId: this.data.device.deviceId,
                serviceId: this.data.scanWifiService.uuid,
                characteristicId: this.data.ctScanwifiNotify.uuid
            })
        } catch (error) {
            console.log('notifyBLECharacteristicValueChange2', error)
            this.longToast.toast()
            const res = yield showModal({
                title: '提示',
                content: 'WIFI连接超时',
                showCancel: false,
                confirmColor: '#fae100',
            })
            if (res.confirm) {
                wx.navigateBack()
            }
        }

        // this.longToast.toast()
        // 定时器判断超时
    }),

    connectWifi: co.wrap(function*(e) {
        console.log('e.currentTarget.id', e.currentTarget.id)
        wx.redirectTo({
            url: `/pages/package_device/ble/network/configure?ssid=${this.data.ssids[parseInt(e.currentTarget.id)]}&&deviceInfo=${encodeURIComponent(JSON.stringify(this.data.deviceInfo))}`
        })
    }),
})