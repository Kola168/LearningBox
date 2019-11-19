
"use strict"

let {
	WeToast
} = require('lib/toast/wetoast.js')
const regeneratorRuntime = require('lib/co/runtime')
const co = require('lib/co/co')
const util = require('utils/util')
const _ = require('lib/underscore/we-underscore')

const getSystemInfo = util.promisify(wx.getSystemInfo)
const getStorage = util.promisify(wx.getStorage)
const setStorage = util.promisify(wx.setStorage)

const login = util.promisify(wx.login)
const getUserInfo = util.promisify(wx.getUserInfo)
const showModal = util.promisify(wx.showModal)
const request = util.promisify(wx.request)
const uploadFile = util.promisify(wx.uploadFile)
const checkSession = util.promisify(wx.checkSession)


App({
	WeToast,
	version: '2.1.2',


	//线上地址
	apiServer: 'https://epbox.gongfudou.com',
	apiWbviewServer: 'https://epbox.gongfudou.com/',


	authAppKey: 'iMToH51lZ0VrhbkTxO4t5J5m6gCZQJ6c',
	openId: '',
	unionId: '',



})
