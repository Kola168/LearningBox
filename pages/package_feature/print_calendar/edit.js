// pages/package_feature/print_ calendar/edit.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')
const upload = require('../../../utils/upload')
const imginit = require('../../../utils/imginit')

const showModal = util.promisify(wx.showModal)

import wxNav from '../../../utils/nav.js'
Page({

  data: {
    titleName: '',
    mainTemplateList: {
      diy: {
        horizontal: [{
            id: 52,
            name: '节日',
            templates: [{
              area_info: [{ area_height: "918", area_width: 1220, area_x: "0", area_y: "100", }, { area_height: "918", area_width: 1220, area_x: 1260, area_y: "100" }],
              height: "1748",
              id: 484,
              img_url: "https://cdn-h.gongfudou.com/epbox/templates/4686f5d6-f2e9-42d8-bfc4-fe28b098c5b6",
              name: "1-2月",
              preview_url: "https://cdn-h.gongfudou.com/epbox/templates/4686f5d6-f2e9-42d8-bfc4-fe28b098c5b6?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
              width: "2480",
            }, {
              area_info: [{ area_width: 1220, area_height: "918", area_x: "0", area_y: "100" }, { area_width: 1220, area_height: "918", area_x: 1260, area_y: "100" }],
              height: "1748",
              id: 485,
              img_url: "https://cdn-h.gongfudou.com/epbox/templates/96c38450-5dfb-4ab6-b5d0-dcf8b3c370bb",
              name: "3-4月",
              preview_url: "https://cdn-h.gongfudou.com/epbox/templates/96c38450-5dfb-4ab6-b5d0-dcf8b3c370bb?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
              width: "2480",
            }, {
              area_info: [{ area_width: 1220, area_height: "918", area_x: "0", area_y: "100" }, { area_width: 1220, area_height: "918", area_x: 1260, area_y: "100" }],
              height: "1748",
              id: 486,
              img_url: "https://cdn-h.gongfudou.com/epbox/templates/08c5200f-af48-4efa-b406-d3cc380feec6",
              name: "5-6月",
              preview_url: "https://cdn-h.gongfudou.com/epbox/templates/08c5200f-af48-4efa-b406-d3cc380feec6?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
              width: "2480",
            }, {
              area_info: [{ area_width: 1220, area_height: "918", area_x: "0", area_y: "100" }, { area_width: 1220, area_height: "918", area_x: 1260, area_y: "100" }],
              height: "1748",
              id: 487,
              img_url: "https://cdn-h.gongfudou.com/epbox/templates/4c9265eb-ed82-473f-85a1-68ed622a31cb",
              name: "7-8月",
              preview_url: "https://cdn-h.gongfudou.com/epbox/templates/4c9265eb-ed82-473f-85a1-68ed622a31cb?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
              width: "2480",
            }, {
              area_info: [{ area_width: 1220, area_height: "918", area_x: "0", area_y: "100" }, { area_width: 1220, area_height: "918", area_x: 1260, area_y: "100" }],
              height: "1748",
              id: 488,
              img_url: "https://cdn-h.gongfudou.com/epbox/templates/fc9bd193-8d76-44e8-aa31-63162b5a80dd",
              name: "9-10月",
              preview_url: "https://cdn-h.gongfudou.com/epbox/templates/fc9bd193-8d76-44e8-aa31-63162b5a80dd?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
              width: "2480",
            }, {
              area_info: [{ area_width: 1220, area_height: "918", area_x: "0", area_y: "100" }, { area_width: 1220, area_height: "918", area_x: 1260, area_y: "100" }],
              height: "1748",
              id: 489,
              img_url: "https://cdn-h.gongfudou.com/epbox/templates/3a81b7b5-4024-40b8-ac91-5378f4dcfd27",
              name: "11-12月",
              preview_url: "https://cdn-h.gongfudou.com/epbox/templates/3a81b7b5-4024-40b8-ac91-5378f4dcfd27?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
              width: "2480",
            }, {
              area_info: [{ area_width: 1220, area_height: "918", area_x: "0", area_y: "100" }, { area_width: 1220, area_height: "918", area_x: 1260, area_y: "100" }],
              height: "1748",
              id: 490,
              img_url: "https://cdn-h.gongfudou.com/epbox/templates/40ca7068-056e-47b9-a038-1b8f0de3a133",
              name: "封面（横）",
              preview_url: "https://cdn-h.gongfudou.com/epbox/templates/40ca7068-056e-47b9-a038-1b8f0de3a133?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
              width: "2480",
            }]
          },
          {
            id: 53,
            name: "生肖",
            templates: [{
              area_info: [{ area_height: "918", area_width: 1220, area_x: "0", area_y: "100", }, { area_height: "918", area_width: 1220, area_x: 1260, area_y: "100" }],
              height: "1748",
              id: 498,
              img_url: "https://cdn-h.gongfudou.com/epbox/templates/787ebab4-226f-40f8-b23f-6c8fa52c24ef",
              name: "1-2月",
              preview_url: "https://cdn-h.gongfudou.com/epbox/templates/787ebab4-226f-40f8-b23f-6c8fa52c24ef?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
              width: "2480",
            }, {
              area_info: [{ area_width: 1220, area_height: "918", area_x: "0", area_y: "100" }, { area_width: 1220, area_height: "918", area_x: 1260, area_y: "100" }],
              height: "1748",
              id: 499,
              img_url: "https://cdn-h.gongfudou.com/epbox/templates/d230300f-b605-4014-a011-58730900118d",
              name: "3-4月",
              preview_url: "https://cdn-h.gongfudou.com/epbox/templates/d230300f-b605-4014-a011-58730900118d?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
              width: "2480",
            }, {
              area_info: [{ area_width: 1220, area_height: "918", area_x: "0", area_y: "100" }, { area_width: 1220, area_height: "918", area_x: 1260, area_y: "100" }],
              height: "1748",
              id: 500,
              img_url: "https://cdn-h.gongfudou.com/epbox/templates/f63e5d27-aa81-4026-add9-ad71497f41a1",
              name: "5-6月",
              preview_url: "https://cdn-h.gongfudou.com/epbox/templates/f63e5d27-aa81-4026-add9-ad71497f41a1?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
              width: "2480",
            }, {
              area_info: [{ area_width: 1220, area_height: "918", area_x: "0", area_y: "100" }, { area_width: 1220, area_height: "918", area_x: 1260, area_y: "100" }],
              height: "1748",
              id: 501,
              img_url: "https://cdn-h.gongfudou.com/epbox/templates/cdd6de6a-7ba7-4c11-bd14-191701e43b21",
              name: "7-8月",
              preview_url: "https://cdn-h.gongfudou.com/epbox/templates/cdd6de6a-7ba7-4c11-bd14-191701e43b21?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
              width: "2480",
            }, {
              area_info: [{ area_width: 1220, area_height: "918", area_x: "0", area_y: "100" }, { area_width: 1220, area_height: "918", area_x: 1260, area_y: "100" }],
              height: "1748",
              id: 502,
              img_url: "https://cdn-h.gongfudou.com/epbox/templates/f1892741-2c94-4855-93ec-3c7f6e5df643",
              name: "9-10月",
              preview_url: "https://cdn-h.gongfudou.com/epbox/templates/f1892741-2c94-4855-93ec-3c7f6e5df643?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
              width: "2480",
            }, {
              area_info: [{ area_width: 1220, area_height: "918", area_x: "0", area_y: "100" }, { area_width: 1220, area_height: "918", area_x: 1260, area_y: "100" }],
              height: "1748",
              id: 503,
              img_url: "https://cdn-h.gongfudou.com/epbox/templates/bf63d6bc-9b8e-4754-8785-56f8b2c64408",
              name: "11-12月",
              preview_url: "https://cdn-h.gongfudou.com/epbox/templates/bf63d6bc-9b8e-4754-8785-56f8b2c64408?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
              width: "2480",
            }, {
              area_info: [{ area_width: 1220, area_height: "918", area_x: "0", area_y: "100" }, { area_width: 1220, area_height: "918", area_x: 1260, area_y: "100" }],
              height: "1748",
              id: 504,
              img_url: "https://cdn-h.gongfudou.com/epbox/templates/5c21d394-d652-4d18-aac3-bcdeee286d1d",
              name: "封面（横）",
              preview_url: "https://cdn-h.gongfudou.com/epbox/templates/5c21d394-d652-4d18-aac3-bcdeee286d1d?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
              width: "2480",
            }]
          }
        ],
        vertical: [{
            "id": 52,
            "name": "节日",
            "templates": [{
                "id": 491,
                "name": "1-2月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/34af29d8-0cf9-4a01-880a-f79fd2c2c7ec",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/34af29d8-0cf9-4a01-880a-f79fd2c2c7ec?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1760",
                "area_height": "1649",
                "area_x": "0",
                "area_y": "99"
              },
              {
                "id": 492,
                "name": "3-4月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/11208c7e-7e80-4c96-83ae-45695a8fd311",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/11208c7e-7e80-4c96-83ae-45695a8fd311?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1760",
                "area_height": "1649",
                "area_x": "0",
                "area_y": "99"
              },
              {
                "id": 493,
                "name": "5-6月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/54036edb-dd56-4f16-a736-4343ca85ea43",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/54036edb-dd56-4f16-a736-4343ca85ea43?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1760",
                "area_height": "1649",
                "area_x": "0",
                "area_y": "99"
              },
              {
                "id": 494,
                "name": "7-8月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/1a8dece9-017e-4807-bccb-51d14cb4d81d",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/1a8dece9-017e-4807-bccb-51d14cb4d81d?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1760",
                "area_height": "1649",
                "area_x": "0",
                "area_y": "99"
              },
              {
                "id": 495,
                "name": "9-10月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/6acf8dc0-e367-43a5-b3bb-78325fd311e3",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/6acf8dc0-e367-43a5-b3bb-78325fd311e3?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1760",
                "area_height": "1649",
                "area_x": "0",
                "area_y": "99"
              },
              {
                "id": 496,
                "name": "11-12月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/319e6410-6aaa-4765-ab63-85da2763a931",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/319e6410-6aaa-4765-ab63-85da2763a931?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1760",
                "area_height": "1649",
                "area_x": "0",
                "area_y": "99"
              },
              {
                "id": 497,
                "name": "封面（竖）",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/33843cca-847d-4d90-ba48-5b947977e624",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/33843cca-847d-4d90-ba48-5b947977e624?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1760",
                "area_height": "1649",
                "area_x": "0",
                "area_y": "99"
              }
            ]
          },
          {
            "id": 53,
            "name": "生肖",
            "templates": [{
                "id": 505,
                "name": "1-2月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/b844f62a-452d-4f7f-ba0b-4e02278c53b5",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/b844f62a-452d-4f7f-ba0b-4e02278c53b5?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1760",
                "area_height": "1649",
                "area_x": "0",
                "area_y": "99"
              },
              {
                "id": 506,
                "name": "3-4月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/cae3624f-6a14-444b-9815-a307a698875a",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/cae3624f-6a14-444b-9815-a307a698875a?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1760",
                "area_height": "1649",
                "area_x": "0",
                "area_y": "99"
              },
              {
                "id": 507,
                "name": "5-6月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/f2cd0f73-7d3e-43d8-ae9a-e7531fe3c991",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/f2cd0f73-7d3e-43d8-ae9a-e7531fe3c991?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1760",
                "area_height": "1649",
                "area_x": "0",
                "area_y": "99"
              },
              {
                "id": 508,
                "name": "7-8月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/f66f11ac-2318-4738-abe3-9a9032f93f4d",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/f66f11ac-2318-4738-abe3-9a9032f93f4d?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1760",
                "area_height": "1649",
                "area_x": "0",
                "area_y": "99"
              },
              {
                "id": 509,
                "name": "9-10月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/977efe5e-2e6a-4501-ae40-86d4c72d2d28",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/977efe5e-2e6a-4501-ae40-86d4c72d2d28?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1760",
                "area_height": "1649",
                "area_x": "0",
                "area_y": "99"
              },
              {
                "id": 510,
                "name": "11-12月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/3f48499b-829b-4b5c-99b2-b31129dd55a6",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/3f48499b-829b-4b5c-99b2-b31129dd55a6?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1760",
                "area_height": "1649",
                "area_x": "0",
                "area_y": "99"
              },
              {
                "id": 511,
                "name": "封面（竖）",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/74035896-fbd9-4e23-93ef-2315b757d387",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/74035896-fbd9-4e23-93ef-2315b757d387?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1760",
                "area_height": "1649",
                "area_x": "0",
                "area_y": "99"
              }
            ]
          }
        ]
      },
      wood: {
        horizontal: [{
            "id": 47,
            "name": "节日",
            "templates": [{
                "id": 453,
                "name": "1-2月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/c5080931-7038-4850-a6c0-f3ee398941c1",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/c5080931-7038-4850-a6c0-f3ee398941c1?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 455,
                "name": "3-4月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/431ecedd-c498-4df9-a84a-91536e46b228",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/431ecedd-c498-4df9-a84a-91536e46b228?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 456,
                "name": "5-6月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/d2e9cb4c-ee6d-4b9f-9119-d6b470dc4ad1",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/d2e9cb4c-ee6d-4b9f-9119-d6b470dc4ad1?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 457,
                "name": "7-8月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/c2918a0d-77c7-4025-9ac4-f66cedef3c30",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/c2918a0d-77c7-4025-9ac4-f66cedef3c30?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 458,
                "name": "9-10月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/81f18965-9935-4723-bd05-3ec06a9f6ca5",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/81f18965-9935-4723-bd05-3ec06a9f6ca5?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 459,
                "name": "11-12月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/981ffbde-1ccc-4df1-89a8-4bf0ddf2105f",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/981ffbde-1ccc-4df1-89a8-4bf0ddf2105f?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 460,
                "name": "封面（横）",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/97ae84ca-e386-4f98-a5b0-78a09728292b",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/97ae84ca-e386-4f98-a5b0-78a09728292b?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              }
            ]
          },
          {
            "id": 48,
            "name": "生肖",
            "templates": [{
                "id": 470,
                "name": "1-2月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/b3506efb-9261-468f-adf2-79972a95e50e",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/b3506efb-9261-468f-adf2-79972a95e50e?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 471,
                "name": "3-4月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/b6aeadbc-c022-4241-b19b-83ed17627567",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/b6aeadbc-c022-4241-b19b-83ed17627567?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 472,
                "name": "5-6月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/4373f1b0-957a-4e3d-9b4a-8e4c7d06dead",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/4373f1b0-957a-4e3d-9b4a-8e4c7d06dead?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 473,
                "name": "7-8月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/aaf0ed85-fc99-4018-9faf-a92a0bc06a20",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/aaf0ed85-fc99-4018-9faf-a92a0bc06a20?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 474,
                "name": "9-10月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/41f0961a-d9ae-4b7b-8173-17171b2286b5",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/41f0961a-d9ae-4b7b-8173-17171b2286b5?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 475,
                "name": "11-12月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/4f9f5e2b-8147-4aa9-aefe-10814f06cd3a",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/4f9f5e2b-8147-4aa9-aefe-10814f06cd3a?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 476,
                "name": "封面（横）",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/1fbece68-0dd7-4c8c-a616-70243acd7a36",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/1fbece68-0dd7-4c8c-a616-70243acd7a36?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              }
            ]
          },
          {
            "id": 57,
            "name": "圣诞",
            "templates": [{
                "id": 512,
                "name": "1-2月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/7746a0bb-ae04-4c3e-b958-d57dfb50dcb3",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/7746a0bb-ae04-4c3e-b958-d57dfb50dcb3?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 513,
                "name": "3-4月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/d0ce4eda-a81b-4c8b-bef8-d3d27966920b",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/d0ce4eda-a81b-4c8b-bef8-d3d27966920b?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 514,
                "name": "5-6月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/c898314f-e267-474b-bfb5-4df0cdd85bda",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/c898314f-e267-474b-bfb5-4df0cdd85bda?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 515,
                "name": "7-8月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/822beab1-8cc0-4c51-a397-2fdfad3407d1",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/822beab1-8cc0-4c51-a397-2fdfad3407d1?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 516,
                "name": "9-10月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/f6b380ce-82d3-4c88-934a-48dea3403d3c",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/f6b380ce-82d3-4c88-934a-48dea3403d3c?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 517,
                "name": "11-12月",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/f04f126c-13c8-4b9c-9e99-bca3a2df01fd",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/f04f126c-13c8-4b9c-9e99-bca3a2df01fd?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 518,
                "name": "封面（横）",
                "width": "2480",
                "height": "1748",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/5b3617d3-effb-4c69-9c59-da7f59e2eccb",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/5b3617d3-effb-4c69-9c59-da7f59e2eccb?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1669",
                "area_height": "1748",
                "area_x": "0",
                "area_y": "0"
              }
            ]
          }
        ],
        vertical: [{
            "id": 47,
            "name": "节日",
            "templates": [{
                "id": 461,
                "name": "1",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/953c1e15-2c0c-4956-b8cc-90e9478730da",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/953c1e15-2c0c-4956-b8cc-90e9478730da?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 462,
                "name": "2",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/7bcc2b9c-a2c2-411a-9210-63569db8a41e",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/7bcc2b9c-a2c2-411a-9210-63569db8a41e?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 463,
                "name": "3",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/73ea567f-0eeb-4a47-854a-83471ccafa48",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/73ea567f-0eeb-4a47-854a-83471ccafa48?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 464,
                "name": "4",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/bae3d46e-0057-405c-a846-e6a4d3426b85",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/bae3d46e-0057-405c-a846-e6a4d3426b85?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 465,
                "name": "5",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/7579d637-f022-418e-97c8-9014a59cfc48",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/7579d637-f022-418e-97c8-9014a59cfc48?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 466,
                "name": "6",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/978065a7-92aa-4672-8f1b-727091ed7ee6",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/978065a7-92aa-4672-8f1b-727091ed7ee6?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 467,
                "name": "7（封面）",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/63e34ca1-470a-4b07-bdd4-4aefead908b4",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/63e34ca1-470a-4b07-bdd4-4aefead908b4?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              }
            ]
          },
          {
            "id": 48,
            "name": "生肖",
            "templates": [{
                "id": 477,
                "name": "1-2月",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/5f6e8983-dce5-442a-80bf-fa144d76a308",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/5f6e8983-dce5-442a-80bf-fa144d76a308?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 478,
                "name": "3-4月",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/ebd04fa8-0354-4c3a-bdf9-4307d838ba3b",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/ebd04fa8-0354-4c3a-bdf9-4307d838ba3b?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 479,
                "name": "5-6月",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/d9687dd8-11ee-4e0e-871a-56aec3a008c7",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/d9687dd8-11ee-4e0e-871a-56aec3a008c7?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 480,
                "name": "7-8月",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/a57ab8fa-354e-4127-bb82-bed1edf0ba3d",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/a57ab8fa-354e-4127-bb82-bed1edf0ba3d?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 481,
                "name": "9-10月",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/53dd928c-c3cb-4105-8fc2-b4afddd7da4d",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/53dd928c-c3cb-4105-8fc2-b4afddd7da4d?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 482,
                "name": "11-12月",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/f5bf1e6d-cda1-4799-822c-61cc3d6d5268",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/f5bf1e6d-cda1-4799-822c-61cc3d6d5268?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 483,
                "name": "封面（竖）",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/ae8e64f2-cc35-4bdd-a345-477941328ad0",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/ae8e64f2-cc35-4bdd-a345-477941328ad0?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              }
            ]
          },
          {
            "id": 57,
            "name": "圣诞",
            "templates": [{
                "id": 519,
                "name": "1-2月",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/a8fc5474-63c0-4535-8aa0-543d48162143",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/a8fc5474-63c0-4535-8aa0-543d48162143?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 520,
                "name": "3-4月",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/d382da70-bb97-4b49-b438-fa28c9fd4854",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/d382da70-bb97-4b49-b438-fa28c9fd4854?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 521,
                "name": "5-6月",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/48ac6870-de28-4144-965b-26b26518f8bc",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/48ac6870-de28-4144-965b-26b26518f8bc?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 522,
                "name": "7-8月",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/5d6899e2-e1a3-4da0-b15c-3a194afe63cc",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/5d6899e2-e1a3-4da0-b15c-3a194afe63cc?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 523,
                "name": "9-10月",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/895d652e-70af-44f9-ba6f-4a223aea51f1",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/895d652e-70af-44f9-ba6f-4a223aea51f1?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 524,
                "name": "11-12月",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/4658f7f1-2a32-45ee-8a1e-8f9522f1e592",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/4658f7f1-2a32-45ee-8a1e-8f9522f1e592?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              },
              {
                "id": 525,
                "name": "封面（竖）",
                "width": "1748",
                "height": "2480",
                "img_url": "https://cdn-h.gongfudou.com/epbox/templates/04b8331e-c87f-4ca6-b30f-c66b88b84d4d",
                "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/04b8331e-c87f-4ca6-b30f-c66b88b84d4d?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
                "area_width": "1748",
                "area_height": "1669",
                "area_x": "0",
                "area_y": "0"
              }
            ]
          }
        ]
      }
    },
    templateInfo: {}, //传入组件的模板信息
    paperSize: {}, //传入组件的纸张信息
    templateList: [], //模板数组
    direction: 'horizontal', //模板方向
    templateIndex: 0, //选择的模板index
    templateTypeIndex: 0, //选择的模板种类index
    type: '',
  },
  name: {
    diy: '制作DIY台历',
    wood: '制作木框台历',
  },
  storageEditData: {
    horizontal: [],
    vertical: [],
  },

  onLoad: function(options) {
    this.setData({
      titleName: this.name[options.type],
      type: options.type
    })
    this.checkdirection('horizontal')
  },

  checkTemplateDirection: function() {
    let templateList = []
    if (_.isEmpty(this.storageEditData[this.data.direction])) {
      templateList = this.data.mainTemplateList[this.data.type][this.data.direction]
      this.storageEditData[this.data.direction] = _.clone(templateList)
    } else {
      templateList = this.storageEditData[this.data.direction]
    }
    this.setData({
      templateList: templateList,
      templateIndex: 0,
      templateTypeIndex: 0,
    })
  },

  setModeData: function() {

    let checkedTemplate = this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex]
    console.log(checkedTemplate)
    let modeSize = []
    if (checkedTemplate.area_info) {
      _.each(checkedTemplate.area_info, function(value, index, list) {
        modeSize.push({
          x: value.area_x,
          y: value.area_y,
          areaWidth: value.area_width,
          areaHeight: value.area_height,
        })
      })
    } else {
      modeSize.push({
        x: checkedTemplate.area_x,
        y: checkedTemplate.area_y,
        areaWidth: checkedTemplate.area_width,
        areaHeight: checkedTemplate.area_height,
      })
    }
    this.setData({
      paperSize: {
        width: Number(checkedTemplate.width),
        height: Number(checkedTemplate.height),
        minLeftHeight: 640,
        sider: 64,
      },
      templateInfo: {
        modeSrc: checkedTemplate.img_url,
        modeSize: modeSize
      }
    })
    this.selectComponent("#mymulti").setData({
      imgArr: []
    })
  },

  checkModeStorage: function() {
    let storage = {}
    storage.storageImgArr = _.deepClone(this.selectComponent("#mymulti").data.imgArr)
    storage.storageAreaSize = _.deepClone(this.selectComponent("#mymulti").data.areaSize)
    storage.storageEditAreaSize = _.deepClone(this.selectComponent("#mymulti").data.editAreaSize)
    storage.storageTemplateSrc = _.deepClone(this.selectComponent("#mymulti").data.TemplateSrc)
    storage.id = this.storageEditData[this.preDirection][this.preTemplateTypeIndex].templates[this.preTemplateIndex].id
    if (_.isNotEmpty(storage.storageImgArr) && _.isNotEmpty(storage.storageAreaSize) && _.isNotEmpty(storage.storageEditAreaSize)) {
      this.storageEditData[this.preDirection][this.preTemplateTypeIndex].templates[this.preTemplateIndex].storage = storage
      this.preDirection = this.data.direction
      this.preTemplateTypeIndex = this.data.templateTypeIndex
      this.preTemplateIndex = this.data.templateIndex
    }
    let checkedStorage = this.storageEditData[this.data.direction][this.data.templateTypeIndex].templates[this.data.templateIndex].storage
    console.log(this.storageEditData)
    if (_.isNotEmpty(checkedStorage)) {
      this.selectComponent("#mymulti").setData({
        imgArr: checkedStorage.storageImgArr,
        areaSize: checkedStorage.storageAreaSize,
        editAreaSize: checkedStorage.storageEditAreaSize,
        TemplateSrc: checkedStorage.storageTemplateSrc
      })
      this.preDirection = this.data.direction
      this.preTemplateTypeIndex = this.data.templateTypeIndex
      this.preTemplateIndex = this.data.templateIndex
    } else {
      this.setModeData()
    }
  },

  checkTemplateType: function(e) {
    let index = e.currentTarget.dataset.index
    this.preTemplateTypeIndex = _.clone(this.data.templateTypeIndex)
    this.setData({
      templateTypeIndex: index,
    })
    this.checkTemplate(0)
  },

  checkTemplate: function(e) {
    let index = e.currentTarget ? e.currentTarget.dataset.index : e
    this.preTemplateIndex = _.clone(this.data.templateIndex)
    this.setData({
      templateIndex: index,
    })

    this.checkModeStorage()
  },

  checkdirection: function(e) {
    let direction = e.currentTarget ? e.currentTarget.dataset.type : e
    this.preDirection = _.clone(this.data.direction)
    this.preTemplateIndex = _.clone(this.data.templateIndex)
    this.preTemplateTypeIndex = _.clone(this.data.templateTypeIndex)
    this.setData({
      direction: direction
    })
    this.checkTemplateDirection()
    this.checkModeStorage()
  },

  confBut: function() {
    let storage = {}
    storage.storageImgArr = _.deepClone(this.selectComponent("#mymulti").data.imgArr)
    storage.storageAreaSize = _.deepClone(this.selectComponent("#mymulti").data.areaSize)
    storage.storageEditAreaSize = _.deepClone(this.selectComponent("#mymulti").data.editAreaSize)
    storage.storageTemplateSrc = _.deepClone(this.selectComponent("#mymulti").data.TemplateSrc)
    storage.id = this.storageEditData[this.preDirection][this.preTemplateTypeIndex].templates[this.preTemplateIndex].id
    if (_.isNotEmpty(storage.storageImgArr) && _.isNotEmpty(storage.storageAreaSize) && _.isNotEmpty(storage.storageEditAreaSize)) {
      this.storageEditData[this.data.direction][this.data.templateTypeIndex].templates[this.data.templateIndex].storage = storage
    }
    let templateArr = _.without(_.pluck(_.flatten(_.pluck(this.storageEditData[this.data.direction], 'templates')), 'storage'), undefined)
    console.log(templateArr)
    let paramData = []
    let that = this
    _.each(templateArr, function(value, index, list) {
      let params = {}
      params.id=value.id
      let pointData=value.storageImgArr
      params.points=that.selectComponent("#mymulti").getImgPoint(pointData,value.storageAreaSize.scale)
      paramData.push(params)
    })
    console.log(paramData)
  }
})
