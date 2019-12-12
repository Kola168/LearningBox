// pages/learning/issue_list/issue_list.js
import {regeneratorRuntime, co, util} from '../../../utils/common_import'
const app = getApp()
import graphql from '../../../network/graphql_request'
import router from '../../../utils/nav'
import Logger from '../../../utils/logger.js'
const logger = new Logger.getLogger('pages/package_course/issue_list/issue_list')
Page({
	data: {
		is_empty: false,
		categoryList: []
	},
	
	onLoad: function (options) {
		this.getCategoryList()
	},

	// 获取课程列表
	getCategoryList: co.wrap(function*(){
		try {
			var selectCategories = yield graphql.getCourseSubject('course')
			this.setData({
				categoryList:  selectCategories.feature && selectCategories.feature.categories || [],
				is_empty: selectCategories.feature && selectCategories.feature.categories.length ? false : true
			})
		} catch(err) {
			logger.info(err)
		}
	}),

	toIssueDetail ({currentTarget: {dataset: {sn}}}) {
		router.navigateTo('/pages/package_course/issue_center/issue_center', {
			sn: sn
		})
	}

})