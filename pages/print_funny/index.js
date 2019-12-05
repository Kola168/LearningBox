Page({
  data: {
		funApplications: [{
        name: '气球打印',
        icon: '/images/funny_ballon.png',
        key: 'ballon'
      },
      {
        name: '照片书',
        icon: '/images/doc_more_icon.png',
        url: '',
        key: 'photoBook'
			},
			{
        name: '台历',
        icon: '/images/doc_more_icon.png',
        url: '',
        key: 'calendar'
			},
			{
        name: '拇指相册',
        icon: '/images/funny_thumb_album.png',
        url: '',
        key: 'thumbAlum'
			},
			{
        name: '大头贴',
        icon: '/images/funny_sticker.png',
        url: '/pages/print_doc/function_list/function_list',
        key: 'sticker'
			},
			{
        name: '姓名贴',
        icon: '/images/funny_name.png',
        url: '',
        key: 'name'
			},
			{
        name: '明信片',
        icon: '/images/funny_postcard.png',
        url: '',
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

})