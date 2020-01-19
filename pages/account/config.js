export const features= [{
    title: '记录与收藏',
    features: [{
      name: '打印记录',
      image: '/images/account_print_record.png',
			url: '/pages/package_common/records/index/index',
			key:'printRecord'
    }, {
      name: '购买记录',
      image: '/images/account_order.png',
			url: '/pages/package_common/order_record/index/index',
			key:'buyRecord'
    }, {
      name: '我的收藏',
      image: '/images/account_cllection.png',
			url: '/pages/account/collection/index',
			key:'collect'
    }, ]
  }, {
    title: '帮助与反馈',
    features: [{
      name: '使用说明',
      image: '/images/account_use_info.png',
			url: 'pages/package_common/instructions/index',
			key:'usage'
    }, {
      name: '意见反馈',
      image: '/images/account_feedback.png',
			url: '/pages/package_common/feedback/index',
			key:'feedBack'
    }, {
      name: '在线客服',
      image: '/images/account_service.png',
			url: `/pages/webview/index?url=${encodeURIComponent(`https://gfd178.udesk.cn/im_client/?web_plugin_id=111131`)}`,
			key:'onlineGuest'
    }, ]
	},
	{
    title: '更多服务',
    features: [{
      name: '账号管理',
      image: '/images/account_manage.png',
			url: 'pages/package_common/accountmanagement/index',
			key:'moreService'
    }, {
      name: '纸质化学习方法',
      image: '/images/account_paper.png',
			url: '',
			key:'paperLeraning'
    }, {
      name: '我的家庭',
      image: '/images/account_family.png',
			url: '/pages/package_member/group/index',
			key:'familyGroup'

    }, ]
	}
]
