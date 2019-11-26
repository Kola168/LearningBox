let cropperUtil = require('./welCropperUtil.js')

var init = function (W, H, TOP) {
	let that = this
	that.setData({
		cropperData: {
			drawSign: 0,
			hidden: true,
			left: 0,
			top: 0,
			width: W,
			height: H,
			W: W,
			H: H,
			itemLength: 26,
			imageInfo: {
				path: '',
				width: 0,
				height: 0
			},
			scaleInfo: {
				x: 1,
				y: 1
			},
			cropCallback: null,
			sizeType: ['original', 'compressed'], //'original'(default) | 'compressed'
			original: true, // 默认不压缩
			mode: 'rectangle', //默认矩形
			TOP: TOP ? TOP : 0,
			from: ''
		},
		cropperMovableItems: {
			topleft: {
				x: 50,
				y: 50
			},
			topright: {
				x: W - 50,
				y: 50
			},
			bottomleft: {
				x: 50,
				y: H - 50
			},
			bottomright: {
				x: W - 50,
				y: H - 50
			}
		},
		cropperMainItem: {
			x: 110,
			y: 110,
			w: 50,
			h: 50
		},
		cropperChangableData: {
			canCrop: true,
			rotateDegree: 0,
			// rotateDegree: 270,
			originalSize: {
				width: 0,
				height: 0
			},
			scaleSize: {
				width: 0,
				height: 0
			},
			shape: {

			},
			previewImageInfo: {
				x: 0,
				y: 0,
				w: 0,
				h: 0
			}
		},
		isRotate: false
	})

	// 显示cropper，如果有图片则载入
	that.showCropper = (options) => {
		wx.showLoading({
			title: '加载中',
		})
		console.log('options', options)
		let z = this
		let cropperData = z.data.cropperData
		let src = options.src
		let callback = options.callback
		let sizeType = options.sizeType
		let maxLength = options.maxLength || 2500
		let mode = options.mode

		let filterType = []
		if (sizeType.indexOf('original') > -1) {
			filterType.push('original')
		}
		if (sizeType.indexOf('compressed') > -1) {
			filterType.push('compressed')
		}
		if (filterType.length == 1 && filterType.indexOf('original') > -1) {
			console.log('原图操作=====================')
			cropperData.original = true
		}

		if (maxLength) {
			cropperData.maxLength = maxLength
		}
		if (mode) {
			cropperData.mode = mode
		}
		cropperData.from = options.from
		cropperData.hidden = false
		cropperData.hash = Math.random()
		cropperData.cropCallback = callback
		cropperData.sizeType = filterType

		console.log('cropperData.mode =======', cropperData.mode)

		if (src) {
			console.log(src)
			wx.getImageInfo({
				src: src,
				success: function (res) {
					var w = res.width,
						h = res.height

					console.log({
						w,
						h
					})
					var size = cropperUtil.getAdjustMaxSize(w, h, maxLength)
					console.log(size)
					cropperData.imageInfo = {
						path: src,
						width: size.width,
						height: size.height
					}
					z.setData({
						cropperData: cropperData,
					})
					z.loadImage(src, w, h, false)

						//针对矩形特需旋转处理
						if (cropperData.mode == 'rectangle') {
							setTimeout(()=>{
								z.rotateImage()
							},150)
						
						}
				}
			})
		}
	},

		that.finishLoad = () => {
			console.log('执行到加载完图片======')
			wx.hideLoading()
			// let cropperChangableData = that.data.cropperChangableData
			// cropperChangableData.canCrop = true
			// that.setData({
			// 		cropperChangableData: cropperChangableData
			// })
		},

		// 隐藏cropper
		that.hideCropper = () => {
			let that = this

			that.data.cropperData.hidden = true
			that.data.cropperData.cropCallback = null

			that.setData({
				cropperData: that.data.cropperData,
				cropperMovableItems: {
					topleft: {
						x: -1,
						y: -1
					},
					topright: {
						x: -1,
						y: -1
					},
					bottomleft: {
						x: -1,
						y: -1
					},
					bottomright: {
						x: -1,
						y: -1
					}
				},
				cropperChangableData: {
					canCrop: true,
					rotateDegree: 0,
					previewImageInfo: {
						x: 0,
						y: 0,
						w: 0,
						h: 0,
					}
				}
			})

			that.clearCanvas(that.data.cropperData.imageInfo)
		}

	// 截取选中图片，如果有回调，则调用
	that.cropImage = () => {
		let that = this
		let cropperData = that.data.cropperData
		let mode = cropperData.mode
		let scaleInfo = cropperData.scaleInfo
		let width = cropperData.width
		let height = cropperData.height

		let cropperMovableItems = that.data.cropperMovableItems

		if (mode == 'rectangle') {
			let maxX = 0,
				maxY = 0
			for (let key in cropperMovableItems) {
				let item = cropperMovableItems[key]
				maxX = item.x > maxX ? item.x : maxX
				maxY = item.y > maxY ? item.y : maxY
			}

			let minX = maxX,
				minY = maxY
			for (let key in cropperMovableItems) {
				let item = cropperMovableItems[key]
				minX = item.x < minX ? item.x : minX
				minY = item.y < minY ? item.y : minY
			}

			let w = maxX - minX,
				h = maxY - minY
			w *= scaleInfo.x
			h *= scaleInfo.y

			let x = minX * scaleInfo.x,
				y = minY * scaleInfo.y

			console.log('crop rect: x=' + x + ',y=' + y + ',w=' + w + ',h=' + h)

			let ctx = wx.createCanvasContext("originalCanvas")

			wx.showLoading({
				title: '正在截取...',
			})
			wx.canvasToTempFilePath({
				x: x,
				y: y,
				width: w,
				height: h,
				destWidth: w,
				destHeight: h,
				canvasId: 'originalCanvas',
				success: function (res) {
					let tempFilePath = res.tempFilePath

					wx.hideLoading()

					if (that.data.cropperData.cropCallback) {
						that.data.cropperData.cropCallback(tempFilePath)
					}
				},
				fail(res) {
					wx.hideLoading()
					wx.showModal({
						title: '截取失败',
						content: res.errMsg
					})
					console.log("fail res:")
					console.log(res)
				}
			})
		} else {
			let res = [
				[0, 0],
				[0, 0],
				[0, 0],
				[0, 0]
			]
			let points = []
			for (let key in cropperMovableItems) {
				let x = Math.ceil(cropperMovableItems[key].x * scaleInfo.x)
				let y = Math.ceil(cropperMovableItems[key].y * scaleInfo.y)


				let index = 0
				if (key == 'topleft') {
					index = 0
				} else if (key == 'bottomleft') {
					index = 1
				} else if (key == 'bottomright') {
					index = 2
				} else if (key == 'topright') {
					index = 3
				}
				res[index] = [x, y]

				points.push({
					x,
					y
				})
			}

			cropperUtil.convexHull(points, points.length)

			if (that.data.cropperData.cropCallback) {
				that.data.cropperData.cropCallback(res)
			}
		}
	}

	// 测试
	// 截取形状
	that.changeCropShapeHandler = () => {
		const map = [
			'no',
			'square'
		]
		wx.showActionSheet({
			itemList: ['不定形状', '正方形'],
			success: function (res) {
				console.log(res.tapIndex)
			},
			fail: function (res) {
				console.log(res.errMsg)
			}
		})
	}

	// 根据图片大小设置canvas大小，并绘制图片
	that.loadImage = (src, width, height, isRotate) => {
		let z = this
		let size = cropperUtil.getAdjustSize(W, H, width, height)
		console.log('size*******************====', size)
		// 适应屏幕的位置
		let left = (W - size.width) / 2
		let top = (H - size.height) / 2

		// set data
		let updateData = {}
		let cropperData = z.data.cropperData

		if (cropperData.mode == 'rectangle') {
			cropperData.drawSign = true
		} else {
			cropperData.drawSign = false
		}

		console.log('cropperData.drawSign=====', cropperData.drawSign)
		if (!isRotate) {
			cropperData.imageInfo = {
				path: src,
				width: width,
				height: height
			}
		}
		cropperData.left = left
		cropperData.top = top
		cropperData.width = size.width
		cropperData.height = size.height

		let compressedScale = z.data.cropperData.original ? 1.0 : 0.4

		cropperData.scaleInfo = {
			x: width * compressedScale / size.width,
			y: height * compressedScale / size.height
		}

		updateData.cropperData = cropperData

		// updateData.cropperMovableItems = {
		//     topleft: {
		//         x: 50,
		//         y: 50
		//     },
		//     topright: {
		//         x: size.width - 50,
		//         y: 50
		//     },
		//     bottomleft: {
		//         x: 50,
		//         y: size.height - 50
		//     },
		//     bottomright: {
		//         x: size.width - 50,
		//         y: size.height - 50
		//     }
		// }
		updateData.cropperMovableItems = {
			topleft: {
				x: 25,
				y: 25
			},
			topright: {
				x: size.width - 25,
				y: 25
			},
			bottomleft: {
				x: 25,
				y: size.height - 25
			},
			bottomright: {
				x: size.width - 25,
				y: size.height - 25
			}
		}

		let cropperChangableData = z.data.cropperChangableData
		let rotateDegree = cropperChangableData.rotateDegree

		// 判断是否为垂直方向
		let isVertical = rotateDegree % 180 > 0
		let rotateWidth = isVertical ? size.height : size.width
		let rotateHeight = isVertical ? size.width : size.height
		console.log(size)
		console.log('rotateDegree:' + rotateDegree)
		console.log('rotateWidth:' + rotateWidth + ', rotateHeight:' + rotateHeight)

		cropperChangableData.previewImageInfo.x = (W - rotateWidth) / 2
		cropperChangableData.previewImageInfo.y = (H - rotateHeight) / 2
		cropperChangableData.previewImageInfo.w = rotateWidth
		cropperChangableData.previewImageInfo.h = rotateHeight

		cropperChangableData.originalSize = {
			width: width,
			height: height
		}
		cropperChangableData.scaleSize = {
			width: size.width,
			height: size.height
		}

		updateData.cropperChangableData = cropperChangableData

		z.setData(updateData, function () {
			console.log('cropperData2******************************', z.data.cropperMovableItems)

			console.log("loadImage size:" + width + "*" + height)
			z.drawImage({
				path: z.data.cropperData.imageInfo.path,
				width: width,
				height: height
			})
			// z.drawLines(z.data.cropperMovableItems, z.data.cropperData.imageInfo)
			// setTimeout(() => {
			// 	z.drawLines(z.data.cropperMovableItems, z.data.cropperData.imageInfo)
			// }, 1000)	
			z.drawLines(z.data.cropperMovableItems, z.data.cropperData.imageInfo)
			console.log('z.data.cropperMovableItems=========', z.data.cropperMovableItems)
		})

	}

	// 清空canvas上的数据
	that.clearCanvas = (imageInfo) => {
		let cropperData = that.data.cropperData
		let size = cropperUtil.getAdjustSize(W, H, imageInfo.width, imageInfo.height)

		if (imageInfo.path != '') {
			let compressedScale = that.data.cropperData.original ? 1.0 : 0.4

			//清空原图
			let ctx = wx.createCanvasContext("originalCanvas")
			ctx.clearRect(0, 0, imageInfo.width * compressedScale, imageInfo.height * compressedScale)
			ctx.draw()

			//清空选择区图片
			let canvas = wx.createCanvasContext("canvas")
			canvas.clearRect(0, 0, size.width, size.height)
			canvas.draw()

			// 清空白线框
			let moveCanvas = wx.createCanvasContext("moveCanvas")
			moveCanvas.clearRect(0, 0, size.width, size.height)
			moveCanvas.draw()
		}
	}

	//绘制图片
	that.drawImage = (imageInfo) => {
		let z = this
		let cropperData = z.data.cropperData
		let size = cropperUtil.getAdjustSize(W, H, imageInfo.width, imageInfo.height)

		if (imageInfo.path != '') {
			let path = imageInfo.path
			let compressedScale = z.data.cropperData.original ? 1.0 : 0.4

			let rotateDegree = z.data.cropperChangableData.rotateDegree

			let canvasCtx = wx.createCanvasContext('canvas', z)
			let originalCanvasCtx = wx.createCanvasContext('originalCanvas', z)
			//绘制原图
			cropperUtil.drawImageWithDegree(
				originalCanvasCtx,
				path,
				imageInfo.width * compressedScale,
				imageInfo.height * compressedScale,
				rotateDegree
			)
			//绘制选择区图片
			cropperUtil.drawImageWithDegree(canvasCtx, path, size.width, size.height, rotateDegree)
			console.log("draw=" + path)
			if (z.data.cropperData.TOP == 50) {
				z.longToast.toast()
			}
		}
	}

	//绘制选框
	that.drawLines = function (cropperMovableItems, imageInfo, callback) {
		// console.log('绘制选框========', cropperMovableItems)
		// console.log((new Date()).getTime())
		let that = this
		let cropperData = that.data.cropperData
		let mode = cropperData.mode
		let rotateDegree = that.data.cropperChangableData.rotateDegree
		console.log('imageInfo width height', imageInfo.width, imageInfo.height)
		let size
		if (rotateDegree % 180 > 0) {
			// size = cropperUtil.getAdjustSize(W, H, imageInfo.height, imageInfo.width)
			size = cropperUtil.getAdjustSize(W, H, imageInfo.height, imageInfo.width)
		} else {
			size = cropperUtil.getAdjustSize(W, H, imageInfo.width, imageInfo.height)
		}
		// console.log('size.width,size.height=========', size.width, size.height)

		let convexDots = []
		let orderedDots = []

		orderedDots.push(cropperMovableItems['topleft'])
		orderedDots.push(cropperMovableItems['topright'])
		orderedDots.push(cropperMovableItems['bottomright'])
		orderedDots.push(cropperMovableItems['bottomleft'])

		// 获取凸边形的点
		convexDots = cropperUtil.convexHull(orderedDots, orderedDots.length)

		// 四个点组成的四边形是不是凸四边形
		let canCrop = convexDots.length == 4
		if (callback) {
			callback(canCrop)
		}

		let ctx = wx.createCanvasContext("moveCanvas")

		//绘制高亮选中区域
		let rect = cropperUtil.getCropRect(convexDots)

		if (mode == 'rectangle') {
			// console.log('size.width,size.height=========', size.width, size.height)
			// 绘制半透明遮罩
			// ctx.setFillStyle('rgba(0,0,0,0.5)')

			// ctx.fillRect(0, 0, size.width, size.height)

			// // // 清除选中区域的半透明遮罩，使选中区域高亮
			// ctx.setFillStyle('rgba(0,0,0,0)')
			ctx.clearRect(rect.x, rect.y, rect.w, rect.h)

			//绘制选中边框
			// ctx.setStrokeStyle('white')
			ctx.setStrokeStyle('#ffe27a')
			ctx.setLineWidth(2)
			ctx.beginPath()
			ctx.moveTo(rect.x, rect.y)
			ctx.lineTo(rect.x + rect.w, rect.y)
			ctx.lineTo(rect.x + rect.w, rect.y + rect.h)
			ctx.lineTo(rect.x, rect.y + rect.h)
			ctx.lineTo(rect.x, rect.y)
			ctx.stroke()
			ctx.closePath()

			//绘制对齐线
			ctx.setStrokeStyle('white')
			ctx.setLineWidth(1)
			ctx.beginPath()
			ctx.moveTo(rect.x + rect.w / 3, rect.y)
			ctx.lineTo(rect.x + rect.w / 3, rect.y + rect.h)
			ctx.moveTo(rect.x + rect.w / 3 * 2, rect.y)
			ctx.lineTo(rect.x + rect.w / 3 * 2, rect.y + rect.h)

			ctx.moveTo(rect.x, rect.y + rect.h / 3)
			ctx.lineTo(rect.x + rect.w, rect.y + rect.h / 3)

			ctx.moveTo(rect.x, rect.y + rect.h / 3 * 2)
			ctx.lineTo(rect.x + rect.w, rect.y + rect.h / 3 * 2)
			ctx.stroke()
			ctx.closePath()
		} else {
			//绘制选中边框
			// 如果四个点组成的四边形不是凸四边形，则显示红色，表示不可取
			// let color = canCrop ? 'white' : 'red'
			let color = canCrop ? '#ffe27a' : 'red'

			ctx.setStrokeStyle(color)
			ctx.setLineWidth(2)
			ctx.beginPath()
			for (let i = 0, len = convexDots.length; i < len; i++) {
				let dot = convexDots[i]
				if (i == 0) {
					ctx.moveTo(dot.x, dot.y)
				} else {
					ctx.lineTo(dot.x, dot.y)
				}
			}
			let dot = convexDots[0]
			ctx.lineTo(dot.x, dot.y)

			ctx.stroke()
			ctx.closePath()
		}

		//绘制四个角
		let cornerType = mode == 'rectangle' ? 'rect' : 'circle'
		// ctx.setFillStyle('white')
		// ctx.setStrokeStyle('white')

		ctx.setFillStyle('#ffe27a')
		ctx.setStrokeStyle('#ffe27a')
		// 绘制不同样式的角
		if (cornerType == 'circle') {
			for (let i = 0, len = orderedDots.length; i < len; i++) {
				let dot = orderedDots[i]

				ctx.beginPath()
				ctx.arc(dot.x, dot.y, 10, 0, 2 * Math.PI, true)
				ctx.fill()
				ctx.closePath()
			}
		} else if (cornerType == 'rect') {
			let len = 13,
				w = 3.0,
				offset = w / 2.0

			ctx.setLineWidth(w)
			ctx.beginPath()

			ctx.moveTo(rect.x - offset, rect.y - offset + len)
			ctx.lineTo(rect.x - offset, rect.y - offset)
			ctx.lineTo(rect.x - offset + len, rect.y - offset)

			ctx.moveTo(rect.x + offset + rect.w - len, rect.y - offset)
			ctx.lineTo(rect.x + offset + rect.w, rect.y - offset)
			ctx.lineTo(rect.x + offset + rect.w, rect.y - offset + len)

			ctx.moveTo(rect.x + offset + rect.w, rect.y + offset + rect.h - len)
			ctx.lineTo(rect.x + offset + rect.w, rect.y + offset + rect.h)
			ctx.lineTo(rect.x + offset + rect.w - len, rect.y + offset + rect.h)

			ctx.moveTo(rect.x - offset, rect.y + offset + rect.h - len)
			ctx.lineTo(rect.x - offset, rect.y + offset + rect.h)
			ctx.lineTo(rect.x - offset + len, rect.y + offset + rect.h)


			ctx.stroke()

			ctx.closePath()
		}

		ctx.draw()
	}

	//corner move events
	that.setupMoveItem = (key, changedTouches, imageInfo, callback) => {
		let that = this
		let cropperData = that.data.cropperData
		let cropperMovableItems = that.data.cropperMovableItems

		let left = cropperData.left
		let top = cropperData.top
		let mode = cropperData.mode
		let size = cropperUtil.getAdjustSize(W, H, imageInfo.width, imageInfo.height)

		if (changedTouches.length == 1) {
			let touch = changedTouches[0]
			let x = touch.clientX
			let y = touch.clientY

			x = x - left
			y = y - top
			// 相对画布的点
			cropperMovableItems[key].x = x
			cropperMovableItems[key].y = y

			// 边界检测，使截图不超出截图区域
			x = x < 0 ? 0 : (x > size.width ? size.width : x)
			y = y < 0 ? 0 : (y > size.height ? size.height : y)
			cropperMovableItems[key].x = x
			cropperMovableItems[key].y = y

			// 如果是在矩形模式下
			if (mode == 'rectangle') {
				// 同时设置相连两个点的位置，是相邻的两个点跟随着移动点动，保证选框为矩形
				if (key == 'topleft') {
					console.log('左顶点检测=============')
					//向右下方滑行检测
					if (cropperMovableItems['topleft'].y > (cropperMovableItems['bottomleft'].y - 32) && cropperMovableItems['topleft'].x > (cropperMovableItems['topright'].x - 32)) {
						cropperMovableItems['topleft'].x = cropperMovableItems['topright'].x - 32
						cropperMovableItems['topleft'].y = cropperMovableItems['bottomleft'].y - 32
						cropperMovableItems['bottomleft'].x = cropperMovableItems['topright'].x - 32
						cropperMovableItems['topright'].y = cropperMovableItems['bottomleft'].y - 32
					} //向下滑行检测
					else if (cropperMovableItems['topleft'].y > (cropperMovableItems['bottomleft'].y - 32) && cropperMovableItems['topleft'].x < (cropperMovableItems['topright'].x - 32)) {
						cropperMovableItems['topleft'].x = x
						cropperMovableItems['topleft'].y = cropperMovableItems['bottomleft'].y - 32
						cropperMovableItems['bottomleft'].x = x
						cropperMovableItems['topright'].y = cropperMovableItems['bottomleft'].y - 32
					}
					//向右滑行
					else if (cropperMovableItems['topleft'].y < (cropperMovableItems['bottomleft'].y - 32) && cropperMovableItems['topleft'].x > (cropperMovableItems['topright'].x - 32)) {
						cropperMovableItems['topleft'].x = cropperMovableItems['topright'].x - 32
						cropperMovableItems['topleft'].y = y
						cropperMovableItems['bottomleft'].x = cropperMovableItems['topright'].x - 32
						cropperMovableItems['topright'].y = y
					} else {
						cropperMovableItems['bottomleft'].x = x
						cropperMovableItems['topright'].y = y
					}
				} else if (key == 'topright') {
					//向左下方滑行检测
					console.log('右顶点检测==============')
					if (cropperMovableItems['topright'].x < (cropperMovableItems['topleft'].x + 32) && cropperMovableItems['topright'].y > (cropperMovableItems['bottomright'].y - 32)) {
						cropperMovableItems['topright'].x = cropperMovableItems['topleft'].x + 32
						cropperMovableItems['topright'].y = cropperMovableItems['bottomright'].y - 32
						cropperMovableItems['bottomright'].x = cropperMovableItems['topleft'].x + 32
						cropperMovableItems['topleft'].y = cropperMovableItems['bottomright'].y - 32
					}
					//向左检测
					else if (cropperMovableItems['topright'].x < (cropperMovableItems['topleft'].x + 32) && cropperMovableItems['topright'].y < (cropperMovableItems['bottomright'].y - 32)) {
						cropperMovableItems['topright'].x = cropperMovableItems['topleft'].x + 32
						cropperMovableItems['topright'].y = y
						cropperMovableItems['bottomright'].x = cropperMovableItems['topleft'].x + 32
						cropperMovableItems['topleft'].y = y
					}
					//向下检测
					else if (cropperMovableItems['topright'].x > (cropperMovableItems['topleft'].x + 32) && cropperMovableItems['topright'].y > (cropperMovableItems['bottomright'].y - 32)) {
						cropperMovableItems['topright'].x = x
						cropperMovableItems['topright'].y = cropperMovableItems['bottomright'].y - 32
						cropperMovableItems['bottomright'].x = x
						cropperMovableItems['topleft'].y = cropperMovableItems['bottomright'].y - 32
					} else {
						cropperMovableItems['bottomright'].x = x
						cropperMovableItems['topleft'].y = y
					}
				} else if (key == 'bottomleft') {
					console.log('左下顶点检测=============')
					if (cropperMovableItems['bottomleft'].y < (cropperMovableItems['topleft'].y + 32) && cropperMovableItems['bottomleft'].x > (cropperMovableItems['bottomright'].x - 32)) {
						cropperMovableItems['bottomleft'].x = cropperMovableItems['bottomright'].x - 32
						cropperMovableItems['bottomleft'].y = cropperMovableItems['topleft'].y + 32
						cropperMovableItems['topleft'].x = cropperMovableItems['bottomright'].x - 32
						cropperMovableItems['bottomright'].y = cropperMovableItems['topleft'].y + 32
					} //向右检测
					else if (cropperMovableItems['bottomleft'].y > (cropperMovableItems['topleft'].y + 32) && cropperMovableItems['bottomleft'].x > (cropperMovableItems['bottomright'].x - 32)) {
						cropperMovableItems['bottomleft'].x = cropperMovableItems['bottomright'].x - 32
						cropperMovableItems['bottomleft'].y = y
						cropperMovableItems['topleft'].x = cropperMovableItems['bottomright'].x - 32
						cropperMovableItems['bottomright'].y = y
					} //向上检测
					else if (cropperMovableItems['bottomleft'].y < (cropperMovableItems['topleft'].y + 32) && cropperMovableItems['bottomleft'].x < (cropperMovableItems['bottomright'].x - 32)) {
						cropperMovableItems['bottomleft'].x = x
						cropperMovableItems['bottomleft'].y = cropperMovableItems['topleft'].y + 32
						cropperMovableItems['topleft'].x = x
						cropperMovableItems['bottomright'].y = cropperMovableItems['topleft'].y + 32
					} else {
						cropperMovableItems['topleft'].x = x
						cropperMovableItems['bottomright'].y = y
					}
				} else if (key == 'bottomright') {
					console.log('右下顶点检测=============')
					if (cropperMovableItems['bottomright'].x < (cropperMovableItems['bottomleft'].x + 32) && cropperMovableItems['bottomright'].y < (cropperMovableItems['topright'].y + 32)) {
						cropperMovableItems['bottomright'].x = cropperMovableItems['bottomleft'].x + 32
						cropperMovableItems['bottomright'].y = cropperMovableItems['topright'].y + 32
						cropperMovableItems['topright'].x = cropperMovableItems['bottomleft'].x + 32
						cropperMovableItems['bottomleft'].y = cropperMovableItems['topright'].y + 32
					}
					//向左检测
					else if (cropperMovableItems['bottomright'].x < (cropperMovableItems['bottomleft'].x + 32) && cropperMovableItems['bottomright'].y > (cropperMovableItems['topright'].y + 32)) {
						cropperMovableItems['bottomright'].x = cropperMovableItems['bottomleft'].x + 32
						cropperMovableItems['bottomright'].y = y
						cropperMovableItems['topright'].x = cropperMovableItems['bottomleft'].x + 32
						cropperMovableItems['bottomleft'].y = y
					}
					//向上检测
					else if (cropperMovableItems['bottomright'].x > (cropperMovableItems['bottomleft'].x + 32) && cropperMovableItems['bottomright'].y < (cropperMovableItems['topright'].y + 32)) {
						cropperMovableItems['bottomright'].x = x
						cropperMovableItems['bottomright'].y = cropperMovableItems['topright'].y + 32
						cropperMovableItems['topright'].x = x
						cropperMovableItems['bottomleft'].y = cropperMovableItems['topright'].y + 32
					} else {
						cropperMovableItems['topright'].x = x
						cropperMovableItems['bottomleft'].y = y
					}

				}
			}

			that.drawLines(cropperMovableItems, imageInfo, function (canCrop) {
				console.log('setupMoveItem===cropperMovableItems', cropperMovableItems)
				if (callback) {
					callback(cropperMovableItems, canCrop)
				}
			})
		}
	}

	that.startEvent = (e) => {
		let that = this
		console.log('e=============', e)
		that.touchX = e.changedTouches[0].clientX
		that.touchY = e.changedTouches[0].clientY
		that.lastMoveX = 0
		that.lastMoveY = 0
	}


	//all range move events
	that.setupOuterMoveItem = (key, changedTouches, imageInfo, callback) => {

		let cropperData = that.data.cropperData
		let cropperMovableItems = that.data.cropperMovableItems
		let left = cropperData.left
		let top = cropperData.top
		let mode = cropperData.mode
		let size = cropperUtil.getAdjustSize(W, H, imageInfo.width, imageInfo.height)
		let cropperChangableData = that.data.cropperChangableData
		let lastMoveX, lastMoveY = 0

		console.log('left,right=====', left, top)
		console.log('cropperData======', cropperData)

		if (changedTouches.length == 1) {
			let touch = changedTouches[0]
			let x = touch.clientX
			let y = touch.clientY
			console.log('touch.clientX,touch.clientY=======', x, y)

			let width = cropperMovableItems['topright'].x - cropperMovableItems['topleft'].x
			let height = cropperMovableItems['bottomleft'].y - cropperMovableItems['topleft'].y
			console.log('width,height====', width, height)

			// x = x - left - (width - 60) / 2 - 32 //x坐标系修正
			// y = y - top - (height - 60) / 2 - 32 //y坐标系修正

			that.moveX = cropperMovableItems['topleft'].x + x - that.touchX - that.lastMoveX
			that.moveY = cropperMovableItems['topleft'].y + y - that.touchY - that.lastMoveY
			x = cropperMovableItems['topleft'].x + x - that.touchX - that.lastMoveX
			y = cropperMovableItems['topleft'].y + y - that.touchY - that.lastMoveY

			that.lastMoveX = touch.clientX - that.touchX
			that.lastMoveY = touch.clientY - that.touchY



			// console.log('x,y=======', x, y)
			// cropperChangableData.previewImageInfo

			cropperMovableItems['topleft'].x = x
			cropperMovableItems['topleft'].y = y
			// cropperMovableItems['topright'].x = x + width
			// cropperMovableItems['topright'].y = y
			// cropperMovableItems['bottomleft'].x = x
			// cropperMovableItems['bottomleft'].y = y + height
			// cropperMovableItems['bottomright'].x = x + width
			// cropperMovableItems['bottomright'].y = y + height

			// 边界检测，使截图不超出截图区域,区别于边界和四个角的顶点
			x = x < 0 ? 0 : (x > size.width ? size.width : x)
			y = y < 0 ? 0 : (y > size.height ? size.height : y)

			x = (x + width) > size.width ? (size.width - width) : ((x + width) < 0 ? 0 : x)
			y = (y + height) > size.height ? (size.height - height) : ((y + height) < 0 ? 0 : y)

			cropperMovableItems['topleft'].x = x
			cropperMovableItems['topleft'].y = y

			// 如果是在矩形模式下
			if (mode == 'rectangle') {
				cropperMovableItems['topleft'].x = x
				cropperMovableItems['topleft'].y = y
				cropperMovableItems['topright'].x = x + width
				cropperMovableItems['topright'].y = y
				cropperMovableItems['bottomleft'].x = x
				cropperMovableItems['bottomleft'].y = y + height
				cropperMovableItems['bottomright'].x = x + width
				cropperMovableItems['bottomright'].y = y + height
			}

			that.drawLines(cropperMovableItems, imageInfo, function (canCrop) {
				if (callback) {
					callback(cropperMovableItems, canCrop)
				}
			})
		}
	}

	// border move events
	that.setupBorderMoveItem = (key, changedTouches, imageInfo, callback) => {
		let that = this
		let cropperData = that.data.cropperData
		let cropperMovableItems = that.data.cropperMovableItems
		let left = cropperData.left
		let top = cropperData.top
		let mode = cropperData.mode
		let size = cropperUtil.getAdjustSize(W, H, imageInfo.width, imageInfo.height)

		if (changedTouches.length == 1) {
			let touch = changedTouches[0]
			let x = touch.clientX
			let y = touch.clientY

			if (key == 'up') {
				console.log('111111111')
				y = y - top
				cropperMovableItems['topleft'].y = y
			} else if (key == 'right') {
				x = x - left
				cropperMovableItems['topright'].x = x
			} else if (key == 'bottom') {
				y = y - top
				cropperMovableItems['bottomright'].y = y
			} else if (key == 'left') {
				x = x - left
				cropperMovableItems['bottomleft'].x = x
			}

			// 边界检测，使截图不超出截图区域
			x = x < 0 ? 0 : (x > size.width ? size.width : x)
			y = y < 0 ? 0 : (y > size.height ? size.height : y)

			if (key == 'up') {
				cropperMovableItems['topleft'].y = y
			} else if (key == 'right') {
				cropperMovableItems['topright'].x = x
			} else if (key == 'bottom') {
				cropperMovableItems['bottomright'].y = y
			} else if (key == 'left') {
				cropperMovableItems['bottomleft'].x = x
			}



			// 如果是在矩形模式下
			if (mode == 'rectangle') {
				// 同时设置相连两个点的位置，是相邻的两个点跟随着移动点动，保证选框为矩形
				if (key == 'up') {
					console.log('33333333')
					cropperMovableItems['topright'].y = y
				} else if (key == 'right') {
					cropperMovableItems['bottomright'].x = x
				} else if (key == 'bottom') {
					cropperMovableItems['bottomleft'].y = y
				} else if (key == 'left') {
					cropperMovableItems['topleft'].x = x
				}

				//矩形翻转检测，四边的相对位置必须要固定,检测左上，左下，右上三个点
				if (key == 'up') {
					if (cropperMovableItems['topleft'].y > (cropperMovableItems['bottomleft'].y - 32)) {
						//     //上边检测
						console.log('上边检测=============')
						cropperMovableItems['topleft'].y = cropperMovableItems['bottomright'].y - 32
						cropperMovableItems['topright'].y = cropperMovableItems['bottomright'].y - 32
					}
				} else if (key == 'right') {
					if (cropperMovableItems['topright'].x < (cropperMovableItems['topleft'].x + 32)) {
						console.log('右边检测==============')
						cropperMovableItems['topright'].x = cropperMovableItems['topleft'].x + 32
						cropperMovableItems['bottomright'].x = cropperMovableItems['topleft'].x + 32
					}
				} else if (key == 'bottom') {
					if (cropperMovableItems['bottomleft'].y <= (cropperMovableItems['topleft'].y + 32)) {
						console.log('下边检测=============')
						cropperMovableItems['bottomleft'].y = cropperMovableItems['topleft'].y + 32
						cropperMovableItems['bottomright'].y = cropperMovableItems['topleft'].y + 32
					}
				} else if (key == 'left') {
					if (cropperMovableItems['topleft'].x > (cropperMovableItems['topright'].x - 32)) {
						console.log('左边检测==============')
						x = cropperMovableItems['topright'].x - 32
						cropperMovableItems['bottomleft'].x = x
						cropperMovableItems['topleft'].x = x
					}
				}
			}

			that.drawLines(cropperMovableItems, imageInfo, function (canCrop) {
				if (callback) {
					callback(cropperMovableItems, canCrop)
				}
			})
		}
	}

	// moveable-view touchmove
	that.moveEvent = (e) => {
		let that = this
		let key = e.currentTarget.dataset.key
		let originalSize = that.data.cropperChangableData.originalSize

		if (key == 'up' || key == 'right' || key == 'bottom' || key == 'left') {
			that.setupBorderMoveItem(key, e.changedTouches, {
				path: that.data.cropperData.imageInfo.path,
				width: originalSize.width,
				height: originalSize.height
			})
		} else if (key == 'all') {
			that.setupOuterMoveItem(key, e.changedTouches, {
				path: that.data.cropperData.imageInfo.path,
				width: originalSize.width,
				height: originalSize.height
			})
		} else {
			that.setupMoveItem(key, e.changedTouches, {
				path: that.data.cropperData.imageInfo.path,
				width: originalSize.width,
				height: originalSize.height
			})
		}
	}

	// moveable-view touchend，end的时候设置movable-view的位置，如果在move阶段设置位置，选中会不流畅
	that.endEvent = (e) => {
		console.log("end")
		let that = this
		let cropperData = that.data.cropperData
		let cropperMovableItems = that.data.cropperMovableItems
		let cropperChangableData = that.data.cropperChangableData
		let originalSize = cropperChangableData.originalSize
		let key = e.currentTarget.dataset.key

		if (key == 'up' || key == 'right' || key == 'bottom' || key == 'left') {
			that.setupBorderMoveItem(key, e.changedTouches, {
				path: that.data.cropperData.imageInfo.path,
				width: originalSize.width,
				height: originalSize.height
			}, (cropperMovableItems, canCrop) => {
				cropperChangableData.canCrop = canCrop
				that.setData({
					cropperChangableData: cropperChangableData,
					cropperMovableItems: cropperMovableItems
				})
			})
		} else if (key == 'all') {
			that.setupOuterMoveItem(key, e.changedTouches, {
				path: that.data.cropperData.imageInfo.path,
				width: originalSize.width,
				height: originalSize.height
			}, (cropperMovableItems, canCrop) => {
				cropperChangableData.canCrop = canCrop
				that.setData({
					cropperChangableData: cropperChangableData,
					cropperMovableItems: cropperMovableItems
				})
			})
		} else {
			that.setupMoveItem(key, e.changedTouches, {
				path: that.data.cropperData.imageInfo.path,
				width: originalSize.width,
				height: originalSize.height
			}, (cropperMovableItems, canCrop) => {
				cropperChangableData.canCrop = canCrop
				that.setData({
					cropperChangableData: cropperChangableData,
					cropperMovableItems: cropperMovableItems
				})
			})
		}
	}

	that.drawOriginalImage = () => {
		let z = this
		let cropperData = z.data.cropperData
		let imageInfo = cropperData.imageInfo
		let originalSize = z.data.cropperChangableData.originalSize

		if (imageInfo.path != '') {
			let path = imageInfo.path
			let compressedScale = z.data.cropperData.original ? 1.0 : 0.4
			let rotateDegree = z.data.cropperChangableData.rotateDegree

			let originalCanvasCtx = wx.createCanvasContext('originalCanvas', z)
			//绘制原图
			cropperUtil.drawImageWithDegree(
				originalCanvasCtx,
				path,
				originalSize.width * compressedScale,
				originalSize.height * compressedScale,
				rotateDegree
			)
		}
	}

	// 旋转图片
	that.rotateImage = () => {
		console.log("rotate image =========")
		let that = this
		let imageInfo = that.data.cropperData.imageInfo
		let width = imageInfo.width
		let height = imageInfo.height
		let rotateDegree = that.data.cropperChangableData.rotateDegree

		//逆时针
		rotateDegree = rotateDegree == (0) ? (270) : rotateDegree - 90

		// 判断是否为垂直方向
		let isVertical = (rotateDegree) % (180) > 0

		let rotateWidth = isVertical ? height : width
		let rotateHeight = isVertical ? width : height
		that.setData({
			isRotate: isVertical ? true : false
		})

		let size = cropperUtil.getAdjustSize(W, H, rotateWidth, rotateHeight)

		// 适应屏幕的位置
		let left = (W - size.width) / 2
		let top = (H - size.height) / 2
		let cropperData = that.data.cropperData

		cropperData.left = left
		cropperData.top = top

		let cropperChangableData = that.data.cropperChangableData
		cropperChangableData.originalSize = {
			width: rotateWidth,
			height: rotateHeight
		}
		cropperChangableData.scaleSize = {
			width: size.width,
			height: size.height
		}
		cropperChangableData.rotateDegree = rotateDegree

		that.setData({
			cropperChangableData: cropperChangableData,
			cropperData: cropperData
		})

		console.log(cropperChangableData)

		let cropperMovableItemsCopy = that.data.cropperMovableItems
		let cropperMovableItems = {
			topleft: {
				x: 0,
				y: 0
			},
			topright: {
				x: 0,
				y: 0
			},
			bottomleft: {
				x: 0,
				y: 0
			},
			bottomright: {
				x: 0,
				y: 0
			}
		}

		that.setData({
			cropperMovableItems: cropperMovableItems
		})

		setTimeout(() => {
			that.loadImage(imageInfo.path, rotateWidth, rotateHeight, true)
			// that.setData({
			//     cropperMovableItems: cropperMovableItemsCopy
			// })
		}, 50)

	}

	that.cancel = () => {
		wx.navigateBack()
	}

	// 重新拍照搜题
	that.rePhoto = () => {
		wx.redirectTo({
			url: '/pages/error_book/pages/photo_answer/camera'
		})
	}
}

module.exports = {
	init
}