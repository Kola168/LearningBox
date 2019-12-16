var app = getApp()
import router from '../../utils/nav'

Page({
	data: {
		funApplications: [{
			name: '气球打印',
			icon: '/images/funny_ballon.png',
      url: '/pages/package_feature/print_balloon/index',
			key: 'ballon'
		},
		{
			name: '照片书',
			icon: '/images/doc_more_icon.png',
			url: '/pages/package_feature/print_book/index',
			key: 'photo_book'
		},
		{
			name: '台历',
			icon: '/images/funny_calendar.png',
			url: '/pages/package_feature/print_ calendar/index',
			key: 'calendar'
		},
		{
			name: '拇指相册',
			icon: '/images/funny_thumb_album.png',
			url: '/pages/package_feature/print_thumb_album/index',
			key: 'mini_album'
		},
		{
			name: '大头贴',
			icon: '/images/funny_sticker.png',
			url: '/pages/package_feature/print_sticker/index',
			key: 'photo_sticker'
		},
		{
			name: '姓名贴',
			icon: '/images/funny_name.png',
			url: '/pages/package_feature/print_name/index',
			key: 'name_sticker'
		},
		{
			name: '明信片',
			icon: '/images/funny_postcard.png',
			url: '/pages/package_feature/print_postcard/index',
			key: 'postcard'
		}
		],
		smartApplications: [
			{
				name: '图片转文档',
				icon: '/images/print_pic_to_a4.png',
				key: 'picToA4',
				url: '/pages/print_photo_doc/index',
			},
			{
				name: '公众号文章',
				icon: '/images/doc_official_icon.png',
				key: 'weChatArticle',
				url: ''
			},
			{
				name: '复印',
				icon: '/images/doc_copy_icon.png',
				key: 'copy',
				url: '/pages/print_doc/duplicate/index',
			},
			{
				name: '共享文件夹',
				icon: '/images/share_folder.png',
				key: 'shareFolder',
				url: '/pages/print_doc/duplicate/index',
			},
			{
				name: '电子发票',
				icon: '/images/doc_invoice_icon.png',
				key: 'invoice',
				url: '/pages/print_doc/print_invoice/print_invoice'
			}
		]
	},

	onLoad: function () {

	},

	//趣味打印
	toFunApplication: function (e) {
		let type = e.currentTarget.dataset.key
		let url = e.currentTarget.dataset.url
		switch (e.currentTarget.dataset.key) {
			case 'ballon':
				router.navigateTo(url,{
					type:type
				})
				break
			case 'photoBook':
				router.navigateTo(url,{
					type:type
				})
				break
			case 'calendar':
				router.navigateTo(url,{
					type:type
				})
				break
			case 'thumbAlum':
				router.navigateTo(url,{
					type:type
				})
				break
			case 'sticker':
				router.navigateTo(url,{
					type:type
				})
				break
			case 'name':
				router.navigateTo(url,{
					type:type
				})
				break
			case 'calepostcardndar':
				router.navigateTo(url,{
					type:type
				})
				break
			default:
				router.navigateTo(url,{
					type:type
				})
				break
		}
	},

	//智能应用
	toSmartApplication: function (e) {
		let type = e.currentTarget.dataset.key
		let url = e.currentTarget.dataset.url
		switch (e.currentTarget.dataset.key) {
			case 'picToA4':
				router.navigateTo(url)
				break
			case 'weChatArticle':
				router.navigateTo(url)
				break
			case 'copy':
				router.navigateTo(url)
				break
			case 'shareFolder':
				router.navigateTo(url)
				break
			case 'invoice':
				router.navigateTo(url)
				break
		}
	}

})
