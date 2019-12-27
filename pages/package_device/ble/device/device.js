// pages/device/index.js

const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const CryptoJS = require("../../../lib/crypto-js/crypto-js")
const event = require('../../../lib/event/event')


const getSystemInfo = util.promisify(wx.getSystemInfo)
const showModal = util.promisify(wx.showModal)

const createBLEConnection = util.promisify(wx.createBLEConnection)

const getBLEDeviceServices = util.promisify(wx.getBLEDeviceServices)
const getBLEDeviceCharacteristics = util.promisify(wx.getBLEDeviceCharacteristics)
const readBLECharacteristicValue = util.promisify(wx.readBLECharacteristicValue)
const writeBLECharacteristicValue = util.promisify(wx.writeBLECharacteristicValue)
const notifyBLECharacteristicValueChange = util.promisify(wx.notifyBLECharacteristicValueChange)
const request = util.promisify(wx.request)

const scanWifiServiceUUID = '09FC95C0-C111-11E3-9904-0002A5D5C51B'
const setNetworkServiceUUID = '09FC95C0-C178-11E3-9904-0002A5D5C51B'
const debugServiceUUID = '89FC95C8-C178-11E3-9904-0002A5D5C51A'

let tmpSSIDs = []
let networkStatusCount = 0

Page({
    data: {
        device: null,
        bindCode: null,

        scanWifiService: null,
        setNetworkService: null,
        debugService: null,

        ctScanwifiRead: null,
        ctScanwifiNotify: null,
        ctSetNetworkWrite: null,
        ctSetNetworkNotify: null,
        ctDebugWrite: null,

        ssids: [],
        ssid: null,
        psk: "",

        networkStatus: false,
        devices: [],
        state: 'offline', //设备状态为online代表已经连过网
    },

    onLoad: co.wrap(function*(query) {
        this.longToast = new app.WeToast()
        let _this = this
        wx.onBLECharacteristicValueChange(function(res) {
            console.log(res.value)
            var receiveText = util.buf2string(res.value)
            console.log(`接收到CH<${res.characteristicId}>数据：${receiveText}`)
            _this.setData({
                bindCode: receiveText
            })
            if (receiveText != '' && receiveText != null) {
                _this.bindDevice()
            }
        })

        let devices = JSON.parse(decodeURIComponent(query.devices))

        console.log('接收返回的设备列表=======', devices)
        this.setData({
            devices: devices,
            source: query.source
        })
        if (devices.length == 1) {
            yield this.connectSingleDevice()
        }
    }),

    onShow: co.wrap(function*() {

    }),

    //如果只有一个设备 直接自动连接
    connectSingleDevice: co.wrap(function*() {
        let e = {
            currentTarget: {
                id: 0
            }
        }
        this.initBLE(e)
        console.log('构造的id==========', e.currentTarget.id)
    }),

    //连接设备
    initBLE: co.wrap(function*(e) {
        console.log(e)
        console.log('e.currentTarget.id', e.currentTarget.id)
        this.longToast.toast({
            img: '/images/loading.gif',
            title: '连接中',
            duration: 0
        })
        let device = this.data.devices[parseInt(e.currentTarget.id)]
        try {

            console.info('发现EPBOX Lite:', device.localName)

            let mac_address = device.localName.replace('EpboxLite-', '')
            console.info('设备mac_address:', mac_address)

        } catch (e) {
            this.longToast.toast()
            console.error(e)
            wx.showModal({
                title: '提示',
                content: '请检查手机蓝牙是否打开',
                showCancel: false
            })
            return
        }
        console.log('正在连接BLE...')
        try {
            yield this.connectDevice(device)
            console.log('设备连接成功！！！！！！！！')
            event.emit('Authorize', device.deviceId);

        } catch (e) {
            this.longToast.toast()
            console.error(e)
            wx.showModal({
                title: '提示',
                content: '蓝牙连接失败',
                showCancel: false
            })
            return
        }
    }),

    connectDevice: co.wrap(function*(device) {
        console.log('当前准备要连接的设备id=====', device.deviceId)
            // 创建连接
        try {
            yield createBLEConnection({
                deviceId: device.deviceId
            })
        } catch (e) {
            console.log(e)
            const res = yield showModal({
                title: '提示',
                content: '蓝牙连接失败',
                showCancel: false,
                confirmColor: '#fae100',
            })
            if (res.confirm) {
                wx.navigateBack()
                return
            }
        }

        // 获取service
        const services = yield getBLEDeviceServices({
            deviceId: device.deviceId
        })
        console.log('services:', services.services)
        for (let index = 0; index < services.services.length; index++) {
            const service = services.services[index]
            if (service.uuid == scanWifiServiceUUID) {
                this.setData({
                        scanWifiService: service
                    })
                    // 获取Characteristics
                const cts = yield getBLEDeviceCharacteristics({
                    deviceId: device.deviceId,
                    serviceId: service.uuid
                })
                console.log('characteristics:', cts.characteristics)
                    // 遍历Characteristics
                for (let index = 0; index < cts.characteristics.length; index++) {
                    const ct = cts.characteristics[index]
                    if (ct.properties.notify) {
                        this.setData({
                            ctScanwifiNotify: ct
                        })
                    } else if (ct.properties.read) {
                        this.setData({
                            ctScanwifiRead: ct
                        })
                    }
                }
            } else if (service.uuid == setNetworkServiceUUID) {
                this.setData({
                        setNetworkService: service
                    })
                    // 获取Characteristics
                const cts = yield getBLEDeviceCharacteristics({
                    deviceId: device.deviceId,
                    serviceId: service.uuid
                })
                console.log('characteristics:', cts.characteristics)
                    // 遍历Characteristics
                for (let index = 0; index < cts.characteristics.length; index++) {
                    const ct = cts.characteristics[index]
                    if (ct.properties.write) {
                        this.setData({
                            ctSetNetworkWrite: ct
                        })
                    } else if (ct.properties.notify) {
                        this.setData({
                            ctSetNetworkNotify: ct
                        })
                    }
                }
            } else if (service.uuid == debugServiceUUID) {
                this.setData({
                        debugService: service
                    })
                    // 获取Characteristics
                const cts = yield getBLEDeviceCharacteristics({
                    deviceId: device.deviceId,
                    serviceId: service.uuid
                })
                console.log('characteristics:', cts.characteristics)
                    // 遍历Characteristics
                for (let index = 0; index < cts.characteristics.length; index++) {
                    const ct = cts.characteristics[index]
                    if (ct.properties.write) {
                        this.setData({
                            ctDebugWrite: ct
                        })
                    }
                }
            } else {
                console.error('service not found!')
                return
            }
        }

        this.setData({
            device: device
        })

        // test
        // yield this.openDebug()
        yield this.getBindCode()
            // console.log('bindCode=========', bindCode)
            //注册蓝牙设备

        // yield this.bindDevice(bind_code, macAddmac_addressress)
    }),


    openDebug: co.wrap(function*(e) {
        let buffer = yield this.char2buf("on")
        yield writeBLECharacteristicValue({
            deviceId: this.data.device.deviceId,
            serviceId: this.data.debugService.uuid,
            characteristicId: this.data.ctDebugWrite.uuid,
            value: buffer
        })
        console.log('debug open')
    }),

    getBindCode: co.wrap(function*(e) {
        // 返回值通过onBLECharacteristicValueChange获取
        let code = yield readBLECharacteristicValue({
            deviceId: this.data.device.deviceId,
            serviceId: this.data.scanWifiService.uuid,
            characteristicId: this.data.ctScanwifiRead.uuid,
        })
    }),

    bindDevice: co.wrap(function*() {
        let _this = this
        console.log('this.data.device.localName.split====', this.data.device.localName.split('-'))
        let model = this.data.device.localName.split('-')[0]

        let macAddress = (model == 'EP200') ? this.data.device.localName.replace('EP200-', '') : this.data.device.localName.replace('EP300-', '')
        let unionId = wx.getStorageSync('unionId')
        console.log('this.data.device.localName====',
            this.data.device.localName)
        console.info('设备mac_address:', macAddress)
        console.log('model========', model)
        console.log('bind_code=====', this.data.bindCode)
        console.log('unionId=======', unionId)
        let deviceInfo = {
            device: this.data.device,
            scanWifiService: this.data.scanWifiService,
            ctScanwifiRead: this.data.ctScanwifiRead,
            ctScanwifiNotify: this.data.ctScanwifiNotify,
            ctSetNetworkWrite: this.data.ctSetNetworkWrite,
            ctSetNetworkNotify: this.data.ctSetNetworkNotify,
            setNetworkService: this.data.setNetworkService
        }

        try {
            const resp = yield request({
                url: app.apiServer + `/boxapi/v2/device/bind`,
                method: 'POST',
                dataType: 'json',
                data: {
                    unionid: unionId,
                    bind_code: this.data.bindCode,
                    mac_address: macAddress,
                    model: model
                }
            })

            console.log('resp.data=======', resp.data)
            if (resp.data.code != 0) {
                console.log('code======', resp.data.code)
                throw (resp.data)
            }
            console.log('蓝牙盒子注册成功=====', resp.data)
            wx.setStorageSync('box_id', resp.data.res.id)
            this.setData({
                state: resp.data.res.state == 'online' ? 'online' : 'offline'
            })
            this.longToast.toast()

            if (!resp.data.res.bind_state) {
                const res = yield showModal({
                    title: '提示',
                    content: resp.data.res.message,
                    showCancel: false,
                    confirmColor: '#fae100',
                })
                if (res.confirm) {
                    wx.redirectTo({
                        url: `/pages/ble/device/device_connect?deviceInfo=${encodeURIComponent(JSON.stringify(deviceInfo))}&state=${_this.data.state}`
                    })
                }
            } else {
                wx.redirectTo({
                    url: `/pages/ble/device/device_connect?deviceInfo=${encodeURIComponent(JSON.stringify(deviceInfo))}&state=${this.data.state}`
                })
            }
        } catch (e) {
            console.log('hhhhhh')
            this.longToast.toast()
            console.log('E======', e)
        }
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
    serachDeviceSerial: function() {
        wx.navigateTo({
            url: '/pages/ble/common/serach_serial'
        })
    }
})