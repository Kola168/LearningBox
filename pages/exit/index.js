/*
 * @Author: your name
 * @Date: 2020-01-14 16:48:51
 * @LastEditTime: 2020-01-15 16:54:05
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /LearningBox/pages/exit/index.js
 */
Page({
	onLoad:function(){
	  try {
			wx.clearStorageSync()
		} catch(e) {
			// Do something when catch error
		}
	},

	exit:function(){
		
	}
})