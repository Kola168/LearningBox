// pages/package_feature/print_postcard/edit.js
import wxNav from '../../../utils/nav.js'
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')
const imginit = require('../../../utils/imginit')

const showModal = util.promisify(wx.showModal)
Page({

  data: {
    templateList: [
      {
        "id": 11,
        "name": "调皮",
        "templates": [{
            "id": 124,
            "name": "调皮1",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/578f8acf-21fe-4e9c-afca-2be6db48e9ac",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/578f8acf-21fe-4e9c-afca-2be6db48e9ac?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1122",
            "area_height": "1577",
            "area_x": "29",
            "area_y": "85"
          },
          {
            "id": 125,
            "name": "调皮2",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/839d9b82-cd4c-4892-8b7f-7a6d837a069d",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/839d9b82-cd4c-4892-8b7f-7a6d837a069d?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "967",
            "area_height": "1429",
            "area_x": "109",
            "area_y": "81"
          },
          {
            "id": 126,
            "name": "调皮3",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/43b728f5-9c7e-4899-9e6a-515413e78737",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/43b728f5-9c7e-4899-9e6a-515413e78737?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 127,
            "name": "调皮4",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/7931aaee-349d-4031-9898-535898a0cb52",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/7931aaee-349d-4031-9898-535898a0cb52?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1465",
            "area_x": "0",
            "area_y": "161"
          },
          {
            "id": 128,
            "name": "调皮5",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/637c667f-92b8-4daf-ab9f-cceda82ca25b",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/637c667f-92b8-4daf-ab9f-cceda82ca25b?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1137",
            "area_height": "1748",
            "area_x": "44",
            "area_y": "0"
          },
          {
            "id": 129,
            "name": "调皮6",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/d61fcf32-07f9-4737-8d36-5b249266ea9d",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/d61fcf32-07f9-4737-8d36-5b249266ea9d?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1047",
            "area_height": "1526",
            "area_x": "73",
            "area_y": "64"
          },
          {
            "id": 130,
            "name": "调皮7",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/59a1dae9-c7a5-43fa-b6c8-b9b5fe7f463b",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/59a1dae9-c7a5-43fa-b6c8-b9b5fe7f463b?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "999",
            "area_height": "1069",
            "area_x": "83",
            "area_y": "209"
          },
          {
            "id": 131,
            "name": "调皮8",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/6e7e3732-b4e7-4993-81bd-a8aa877ca8ae",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/6e7e3732-b4e7-4993-81bd-a8aa877ca8ae?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "967",
            "area_height": "1434",
            "area_x": "111",
            "area_y": "80"
          },
          {
            "id": 132,
            "name": "调皮9",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/2e2fb2f4-de59-4c2e-bd94-efe73c359e9b",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/2e2fb2f4-de59-4c2e-bd94-efe73c359e9b?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "965",
            "area_height": "1425",
            "area_x": "111",
            "area_y": "81"
          },
          {
            "id": 133,
            "name": "调皮10",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/0b585368-f5ec-48d6-a0ee-2b08b6bf84d2",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/0b585368-f5ec-48d6-a0ee-2b08b6bf84d2?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1080",
            "area_height": "1160",
            "area_x": "53",
            "area_y": "112"
          }
        ]
      },
      {
        "id": 12,
        "name": "告白",
        "templates": [{
            "id": 134,
            "name": "告白1",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/3346320d-6cad-4391-b93a-8b9f286b79d5",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/3346320d-6cad-4391-b93a-8b9f286b79d5?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1113",
            "area_height": "1545",
            "area_x": "34",
            "area_y": "31"
          },
          {
            "id": 135,
            "name": "告白2",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/1df7a5f9-bb53-4de4-9835-5abeac677690",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/1df7a5f9-bb53-4de4-9835-5abeac677690?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 136,
            "name": "告白3",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/61951b89-3976-4f1a-a23a-381b3d654397",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/61951b89-3976-4f1a-a23a-381b3d654397?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 137,
            "name": "告白4",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/f43e4abf-9913-484d-8eab-08927d5cf8a5",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/f43e4abf-9913-484d-8eab-08927d5cf8a5?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1068",
            "area_height": "1559",
            "area_x": "56",
            "area_y": "46"
          },
          {
            "id": 138,
            "name": "告白5",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/826bc0fa-e33b-4859-943f-a9293ea94ac2",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/826bc0fa-e33b-4859-943f-a9293ea94ac2?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1079",
            "area_height": "1180",
            "area_x": "51",
            "area_y": "58"
          },
          {
            "id": 139,
            "name": "告白6",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/a59436f2-6564-4bf5-a670-9e3c05542d80",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/a59436f2-6564-4bf5-a670-9e3c05542d80?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1046",
            "area_height": "1127",
            "area_x": "64",
            "area_y": "77"
          },
          {
            "id": 140,
            "name": "告白7",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/4592d644-1289-4b63-9de0-825ff93d38a7",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/4592d644-1289-4b63-9de0-825ff93d38a7?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1237",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 141,
            "name": "告白8",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/0dd05b50-6f7e-4e1b-81e4-89a31dfb3d77",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/0dd05b50-6f7e-4e1b-81e4-89a31dfb3d77?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1345",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 142,
            "name": "告白9",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/e7b94388-989b-40c1-ac13-24a482958584",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/e7b94388-989b-40c1-ac13-24a482958584?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1140",
            "area_height": "1248",
            "area_x": "19",
            "area_y": "25"
          },
          {
            "id": 143,
            "name": "告白10",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/44674ad8-a055-4b56-a34f-73876a6c925a",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/44674ad8-a055-4b56-a34f-73876a6c925a?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1051",
            "area_height": "1037",
            "area_x": "42",
            "area_y": "376"
          },
          {
            "id": 144,
            "name": "告白11",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/2179f371-dc32-4f63-9489-6062eb60251b",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/2179f371-dc32-4f63-9489-6062eb60251b?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1167",
            "area_height": "1739",
            "area_x": "8",
            "area_y": "4"
          },
          {
            "id": 145,
            "name": "告白12",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/f650d31c-ae29-4a95-8ba7-53648788dd51",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/f650d31c-ae29-4a95-8ba7-53648788dd51?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1123",
            "area_height": "1353",
            "area_x": "29",
            "area_y": "160"
          },
          {
            "id": 146,
            "name": "告白13",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/55fbcaf1-e956-4a49-8d63-c61903245010",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/55fbcaf1-e956-4a49-8d63-c61903245010?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1129",
            "area_height": "1092",
            "area_x": "27",
            "area_y": "420"
          },
          {
            "id": 147,
            "name": "告白14",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/c57a9a4f-3f00-4988-bded-5fedee272020",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/c57a9a4f-3f00-4988-bded-5fedee272020?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 148,
            "name": "告白15",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/cfa2fbef-99ae-49b5-b42b-535a5cb43316",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/cfa2fbef-99ae-49b5-b42b-535a5cb43316?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1137",
            "area_height": "1675",
            "area_x": "22",
            "area_y": "18"
          },
          {
            "id": 149,
            "name": "告白16",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/40d5e266-e91f-4233-a4c4-e5d4683b15f8",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/40d5e266-e91f-4233-a4c4-e5d4683b15f8?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          }
        ]
      },
      {
        "id": 13,
        "name": "家庭",
        "templates": [{
            "id": 150,
            "name": "家庭1",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/a6e72b58-57f2-43d8-9fb9-abdbaf7c2ce1",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/a6e72b58-57f2-43d8-9fb9-abdbaf7c2ce1?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1158",
            "area_height": "1389",
            "area_x": "11",
            "area_y": "68"
          },
          {
            "id": 151,
            "name": "家庭2",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/f512573d-f589-4414-b77a-8fc8b149a6f7",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/f512573d-f589-4414-b77a-8fc8b149a6f7?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1382",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 152,
            "name": "家庭3",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/0231e43d-a2c4-42f2-973a-5b985806b6fd",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/0231e43d-a2c4-42f2-973a-5b985806b6fd?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 153,
            "name": "家庭4",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/d33cb283-a702-41f1-b0e2-4fb900ebafa2",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/d33cb283-a702-41f1-b0e2-4fb900ebafa2?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 154,
            "name": "家庭5",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/91dd0213-51d1-4c18-9330-5ffb55889ab0",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/91dd0213-51d1-4c18-9330-5ffb55889ab0?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1168",
            "area_height": "1702",
            "area_x": "13",
            "area_y": "29"
          },
          {
            "id": 155,
            "name": "家庭6",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/8ba3ef26-51c1-40bd-9949-ef1760ceb103",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/8ba3ef26-51c1-40bd-9949-ef1760ceb103?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1049",
            "area_height": "1552",
            "area_x": "132",
            "area_y": "0"
          },
          {
            "id": 156,
            "name": "家庭7",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/8dc8cb79-0a5a-4640-a089-26a235f9a63c",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/8dc8cb79-0a5a-4640-a089-26a235f9a63c?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1024",
            "area_height": "1191",
            "area_x": "87",
            "area_y": "118"
          },
          {
            "id": 157,
            "name": "家庭8",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/f06bbb1c-7258-4024-b784-7faafd264068",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/f06bbb1c-7258-4024-b784-7faafd264068?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1334",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 158,
            "name": "家庭9",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/79256e0a-d1e3-4839-a708-aff9c0ce48d2",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/79256e0a-d1e3-4839-a708-aff9c0ce48d2?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 159,
            "name": "家庭10",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/41626358-155b-4f7a-abd8-86777abfcaab",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/41626358-155b-4f7a-abd8-86777abfcaab?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 160,
            "name": "家庭11",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/fccc5984-9564-46f4-bd28-7d2689c0b4c0",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/fccc5984-9564-46f4-bd28-7d2689c0b4c0?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 161,
            "name": "家庭12",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/04cccadc-0ef4-43e4-b206-cfa73b6f9cce",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/04cccadc-0ef4-43e4-b206-cfa73b6f9cce?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          }
        ]
      },
      {
        "id": 14,
        "name": "旅行",
        "templates": [{
            "id": 162,
            "name": "旅行1",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/b8888314-ee46-4912-ba3e-c3a384d5955c",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/b8888314-ee46-4912-ba3e-c3a384d5955c?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1141",
            "area_height": "1697",
            "area_x": "20",
            "area_y": "18"
          },
          {
            "id": 163,
            "name": "旅行2",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/cbd64734-1ec2-466c-9b5a-4cc74b5e8c67",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/cbd64734-1ec2-466c-9b5a-4cc74b5e8c67?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1139",
            "area_height": "1589",
            "area_x": "20",
            "area_y": "71"
          },
          {
            "id": 164,
            "name": "旅行3",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/be5276a0-8921-4866-9e14-12bc0d702614",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/be5276a0-8921-4866-9e14-12bc0d702614?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "972",
            "area_height": "1272",
            "area_x": "105",
            "area_y": "294"
          },
          {
            "id": 165,
            "name": "旅行4",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/4dc9ce97-a566-499e-9f8b-c849cc158b2c",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/4dc9ce97-a566-499e-9f8b-c849cc158b2c?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1026",
            "area_height": "1378",
            "area_x": "89",
            "area_y": "154"
          },
          {
            "id": 166,
            "name": "旅行5",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/22cd2245-7863-4e63-b736-6a683e1dc775",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/22cd2245-7863-4e63-b736-6a683e1dc775?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1248",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 167,
            "name": "旅行6",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/ba8decda-ae55-4a96-a253-9666f919020c",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/ba8decda-ae55-4a96-a253-9666f919020c?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 168,
            "name": "旅行7",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/a4ca785c-c5e1-474b-8a5b-b07bcfa76744",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/a4ca785c-c5e1-474b-8a5b-b07bcfa76744?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1366",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 169,
            "name": "旅行8",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/91e8d762-5cfe-496a-912a-45a7a69ceddf",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/91e8d762-5cfe-496a-912a-45a7a69ceddf?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "985",
            "area_height": "1409",
            "area_x": "48",
            "area_y": "192"
          },
          {
            "id": 170,
            "name": "旅行9",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/bbdf990e-1ebd-4c79-98db-d1de68f9484f",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/bbdf990e-1ebd-4c79-98db-d1de68f9484f?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1356",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 171,
            "name": "旅行10",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/67ec824a-936e-480b-9c45-683d42c629fa",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/67ec824a-936e-480b-9c45-683d42c629fa?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1105",
            "area_height": "1651",
            "area_x": "37",
            "area_y": "46"
          },
          {
            "id": 173,
            "name": "旅行12",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/b07e840f-13d2-4a3b-bf03-d53ee7f2d159",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/b07e840f-13d2-4a3b-bf03-d53ee7f2d159?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1004",
            "area_height": "1027",
            "area_x": "92",
            "area_y": "292"
          },
          {
            "id": 174,
            "name": "旅行13",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/4160d1b5-da3b-4243-99d2-5a667302cbbc",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/4160d1b5-da3b-4243-99d2-5a667302cbbc?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1030",
            "area_height": "1443",
            "area_x": "70",
            "area_y": "88"
          }
        ]
      },
      {
        "id": 15,
        "name": "女生",
        "templates": [{
            "id": 175,
            "name": "女生1",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/74a3f3a1-12da-4205-afc6-98228a32f20b",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/74a3f3a1-12da-4205-afc6-98228a32f20b?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 176,
            "name": "女生2",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/0b0adc7c-edf2-4ae5-8bdc-bd181780379d",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/0b0adc7c-edf2-4ae5-8bdc-bd181780379d?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "644",
            "area_height": "975",
            "area_x": "254",
            "area_y": "458"
          },
          {
            "id": 177,
            "name": "女生3",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/f3b90c75-507b-4c27-8aa6-797b967e5d13",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/f3b90c75-507b-4c27-8aa6-797b967e5d13?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1095",
            "area_height": "1545",
            "area_x": "44",
            "area_y": "100"
          },
          {
            "id": 178,
            "name": "女生4",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/544ee49b-f875-4c61-ad5b-30117985acd1",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/544ee49b-f875-4c61-ad5b-30117985acd1?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1148",
            "area_height": "1171",
            "area_x": "15",
            "area_y": "558"
          },
          {
            "id": 179,
            "name": "女生5",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/e0d0cb2c-e571-4700-9fd5-1f5cea329bef",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/e0d0cb2c-e571-4700-9fd5-1f5cea329bef?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1042",
            "area_height": "1116",
            "area_x": "69",
            "area_y": "75"
          },
          {
            "id": 180,
            "name": "女生6",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/402911f6-0760-45e2-bb14-895412b06de4",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/402911f6-0760-45e2-bb14-895412b06de4?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 181,
            "name": "女生7",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/c0f63c0f-f28f-4eb1-80a3-434b0cdf04c5",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/c0f63c0f-f28f-4eb1-80a3-434b0cdf04c5?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 182,
            "name": "女生8",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/6e529312-345d-47ba-b4e3-e3d0d2a53164",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/6e529312-345d-47ba-b4e3-e3d0d2a53164?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 183,
            "name": "女生9",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/d982102c-48cf-43a6-b106-c6191082b603",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/d982102c-48cf-43a6-b106-c6191082b603?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1652",
            "area_x": "0",
            "area_y": "50"
          }
        ]
      },
      {
        "id": 17,
        "name": "圣诞",
        "templates": [{
            "id": 197,
            "name": "圣诞1",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/78e2468c-f886-4d3c-877c-2f5739a7cbff",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/78e2468c-f886-4d3c-877c-2f5739a7cbff?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1047",
            "area_height": "1186",
            "area_x": "67",
            "area_y": "352"
          },
          {
            "id": 198,
            "name": "圣诞2",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/0c37bfb9-c83f-4b13-a5e2-00c672c893e8",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/0c37bfb9-c83f-4b13-a5e2-00c672c893e8?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 199,
            "name": "圣诞3",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/c37ebc69-3f22-456b-9f58-9f55124ef302",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/c37ebc69-3f22-456b-9f58-9f55124ef302?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "903",
            "area_height": "885",
            "area_x": "139",
            "area_y": "425"
          },
          {
            "id": 200,
            "name": "圣诞4",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/2ccedb4d-d5b1-4fb8-bff0-a75107f465b7",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/2ccedb4d-d5b1-4fb8-bff0-a75107f465b7?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1029",
            "area_height": "1081",
            "area_x": "108",
            "area_y": "128"
          },
          {
            "id": 201,
            "name": "圣诞5",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/4ad36c00-870a-4eca-9d3b-722e85a279c8",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/4ad36c00-870a-4eca-9d3b-722e85a279c8?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1156",
            "area_height": "1697",
            "area_x": "12",
            "area_y": "24"
          },
          {
            "id": 202,
            "name": "圣诞6",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/e952016b-4fdf-4515-9e97-bfd6503b8e10",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/e952016b-4fdf-4515-9e97-bfd6503b8e10?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1159",
            "area_height": "996",
            "area_x": "11",
            "area_y": "149"
          },
          {
            "id": 203,
            "name": "圣诞7",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/2f97fab5-b06c-4f76-b48e-52ead44d9018",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/2f97fab5-b06c-4f76-b48e-52ead44d9018?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1420",
            "area_x": "0",
            "area_y": "264"
          },
          {
            "id": 204,
            "name": "圣诞8",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/39b3dabb-ffc7-4eac-bbe1-bdc18e4bc426",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/39b3dabb-ffc7-4eac-bbe1-bdc18e4bc426?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "928",
            "area_height": "819",
            "area_x": "104",
            "area_y": "772"
          },
          {
            "id": 205,
            "name": "圣诞9",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/65c924cc-34fd-47ec-b976-c4b0625ec4c7",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/65c924cc-34fd-47ec-b976-c4b0625ec4c7?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "921",
            "area_height": "909",
            "area_x": "128",
            "area_y": "386"
          },
          {
            "id": 206,
            "name": "圣诞11",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/31f80b64-b837-4190-aeb2-f71d3e1b1b75",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/31f80b64-b837-4190-aeb2-f71d3e1b1b75?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "941",
            "area_height": "1358",
            "area_x": "0",
            "area_y": "390"
          },
          {
            "id": 207,
            "name": "圣诞12",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/f9f47a0f-0be1-4685-90f7-bdd354c11701",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/f9f47a0f-0be1-4685-90f7-bdd354c11701?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "899",
            "area_height": "1113",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 208,
            "name": "圣诞13",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/dba3aa52-3d0f-462f-82bc-b2803ecd63c1",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/dba3aa52-3d0f-462f-82bc-b2803ecd63c1?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "706",
            "area_height": "1066",
            "area_x": "406",
            "area_y": "543"
          },
          {
            "id": 209,
            "name": "圣诞14",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/474270b7-c472-489c-8abe-cf2e914c6d51",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/474270b7-c472-489c-8abe-cf2e914c6d51?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "903",
            "area_height": "902",
            "area_x": "82",
            "area_y": "424"
          },
          {
            "id": 210,
            "name": "圣诞15",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/5e139e98-0787-49c5-bcb6-b78ad5794610",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/5e139e98-0787-49c5-bcb6-b78ad5794610?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1729",
            "area_x": "0",
            "area_y": "9"
          },
          {
            "id": 211,
            "name": "圣诞16",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/28f03e0d-8847-47b4-a1f5-483107f1ff89",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/28f03e0d-8847-47b4-a1f5-483107f1ff89?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1023",
            "area_height": "1138",
            "area_x": "77",
            "area_y": "526"
          }
        ]
      },
      {
        "id": 18,
        "name": "文艺",
        "templates": [{
            "id": 212,
            "name": "文艺1",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/8044bad9-0bcc-4c98-86a0-b4b7610f4086",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/8044bad9-0bcc-4c98-86a0-b4b7610f4086?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1428",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 213,
            "name": "文艺2",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/cc96a911-f3fe-4622-8b49-48d232cbefe2",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/cc96a911-f3fe-4622-8b49-48d232cbefe2?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "861",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 214,
            "name": "文艺3",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/3858cf1d-ae3e-4a56-80fc-b1572bd4f0d5",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/3858cf1d-ae3e-4a56-80fc-b1572bd4f0d5?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "860",
            "area_height": "1418",
            "area_x": "257",
            "area_y": "149"
          },
          {
            "id": 215,
            "name": "文艺4",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/52ae4e01-25d5-44f4-807c-87ff1dbe8a49",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/52ae4e01-25d5-44f4-807c-87ff1dbe8a49?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1173",
            "area_x": "0",
            "area_y": "287"
          },
          {
            "id": 216,
            "name": "文艺5",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/1a0a397e-af53-43e5-9081-5e44b34d8bf4",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/1a0a397e-af53-43e5-9081-5e44b34d8bf4?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1376",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 217,
            "name": "文艺6",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/f5ffe008-acff-42e2-8bbc-883cf1067581",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/f5ffe008-acff-42e2-8bbc-883cf1067581?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1129",
            "area_height": "1318",
            "area_x": "26",
            "area_y": "19"
          },
          {
            "id": 218,
            "name": "文艺7",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/2fc14967-df9f-4829-be12-10502a40a85e",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/2fc14967-df9f-4829-be12-10502a40a85e?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1130",
            "area_height": "1342",
            "area_x": "25",
            "area_y": "19"
          },
          {
            "id": 219,
            "name": "文艺8",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/5f6fd3eb-1934-4541-8bb6-8a44a5cbdda8",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/5f6fd3eb-1934-4541-8bb6-8a44a5cbdda8?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1131",
            "area_height": "1343",
            "area_x": "24",
            "area_y": "19"
          },
          {
            "id": 220,
            "name": "文艺9",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/715ee5fe-9310-4e7f-9944-0458f380a9aa",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/715ee5fe-9310-4e7f-9944-0458f380a9aa?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1131",
            "area_height": "1343",
            "area_x": "24",
            "area_y": "19"
          },
          {
            "id": 221,
            "name": "文艺10",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/637f7929-2b2a-4a54-91a5-186df306fe79",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/637f7929-2b2a-4a54-91a5-186df306fe79?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1300",
            "area_x": "0",
            "area_y": "24"
          }
        ]
      },
      {
        "id": 19,
        "name": "新年",
        "templates": [{
            "id": 222,
            "name": "新年1",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/746a9384-e334-44ec-a983-8e967491306a",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/746a9384-e334-44ec-a983-8e967491306a?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1133",
            "area_height": "1222",
            "area_x": "22",
            "area_y": "26"
          },
          {
            "id": 223,
            "name": "新年2",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/44ed4151-017f-4b80-ae66-b72aaf676fd5",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/44ed4151-017f-4b80-ae66-b72aaf676fd5?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1002",
            "area_height": "1238",
            "area_x": "93",
            "area_y": "296"
          },
          {
            "id": 224,
            "name": "新年3",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/eb46c44e-9bde-49d8-9c2d-f8ee75b132b1",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/eb46c44e-9bde-49d8-9c2d-f8ee75b132b1?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "899",
            "area_height": "1385",
            "area_x": "151",
            "area_y": "181"
          },
          {
            "id": 225,
            "name": "新年4",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/bfd6d81a-b382-49be-a2f9-d14d0a5e48a6",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/bfd6d81a-b382-49be-a2f9-d14d0a5e48a6?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "952",
            "area_height": "926",
            "area_x": "73",
            "area_y": "471"
          },
          {
            "id": 226,
            "name": "新年5",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/ffd83ba0-fb3f-47d6-97a2-2698bfffa9a8",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/ffd83ba0-fb3f-47d6-97a2-2698bfffa9a8?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1110",
            "area_height": "1286",
            "area_x": "35",
            "area_y": "34"
          },
          {
            "id": 227,
            "name": "新年6",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/10abae6a-cf11-4fcd-b5d5-85bb22785c80",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/10abae6a-cf11-4fcd-b5d5-85bb22785c80?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1132",
            "area_height": "1141",
            "area_x": "24",
            "area_y": "223"
          },
          {
            "id": 228,
            "name": "新年7",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/1e60d184-d36a-4c24-9554-a83f9803fae4",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/1e60d184-d36a-4c24-9554-a83f9803fae4?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1110",
            "area_height": "1244",
            "area_x": "35",
            "area_y": "29"
          },
          {
            "id": 229,
            "name": "新年8",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/6b336bfb-4516-4b60-acb4-03c6f60ec453",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/6b336bfb-4516-4b60-acb4-03c6f60ec453?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1181",
            "area_height": "1748",
            "area_x": "0",
            "area_y": "0"
          },
          {
            "id": 230,
            "name": "新年9",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/e1188ca1-21cd-4e77-ba68-70aabd4e4fb6",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/e1188ca1-21cd-4e77-ba68-70aabd4e4fb6?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1096",
            "area_height": "1213",
            "area_x": "39",
            "area_y": "535"
          },
          {
            "id": 231,
            "name": "新年10",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/4fa63b3b-44be-4458-a824-2ead27b6c10f",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/4fa63b3b-44be-4458-a824-2ead27b6c10f?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1128",
            "area_height": "1115",
            "area_x": "26",
            "area_y": "176"
          },
          {
            "id": 232,
            "name": "新年11",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/653f4e4a-69d9-4913-a03e-cc4892dcc86b",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/653f4e4a-69d9-4913-a03e-cc4892dcc86b?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1051",
            "area_height": "1290",
            "area_x": "65",
            "area_y": "60"
          },
          {
            "id": 233,
            "name": "新年12",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/3ced588d-fd6f-45f6-97da-c9b188a3d17a",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/3ced588d-fd6f-45f6-97da-c9b188a3d17a?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "1068",
            "area_height": "1292",
            "area_x": "56",
            "area_y": "398"
          },
          {
            "id": 234,
            "name": "新年13",
            "width": "1181",
            "height": "1748",
            "img_url": "https://cdn-h.gongfudou.com/epbox/templates/919923b5-fcda-4eb3-a2c7-296bd9a65442",
            "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/919923b5-fcda-4eb3-a2c7-296bd9a65442?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
            "area_width": "802",
            "area_height": "793",
            "area_x": "175",
            "area_y": "336"
          }
        ]
      },
      {
        "id": 20,
        "name": "透明",
        "templates": [{
          "id": 235,
          "name": "透明模板",
          "width": "1181",
          "height": "1748",
          "img_url": "https://cdn-h.gongfudou.com/epbox/templates/65d3539a-5a46-4021-87a2-c1825ffdef19",
          "preview_url": "https://cdn-h.gongfudou.com/epbox/templates/65d3539a-5a46-4021-87a2-c1825ffdef19?x-image-process=image/resize,w_1000/auto-orient,1/format,jpg",
          "area_width": "1181",
          "area_height": "1748",
          "area_x": "0",
          "area_y": "0"
        }]
      }
    ],
    templateInfo: {}, //传入组件的模板信息
    paperSize: {
      width: 1181,
      height: 1748,
      minLeftHeight: 610,
      sider: 46,
    }, //传入组件的纸张信息
    templateIndex: 0, //选择的模板index
    templateTypeIndex: 0, //选择的模板种类index
  },

  onLoad: function(options) {
    this.checkTemplateType(0)
  },
  setComponentData: function() {
    let templateInfo = this.data.templateList[this.data.templateTypeIndex].templates[this.data.templateIndex]
    let modeSize = {
      x: templateInfo.area_x,
      y: templateInfo.area_y,
      areaWidth: templateInfo.area_width,
      areaHeight: templateInfo.area_height,
    }
    this.setData({
      paperSize: {
        width: Number(templateInfo.width),
        height: Number(templateInfo.height),
        minLeftHeight: 610,
        sider: 46,
      },
      templateInfo: {
        modeSrc: templateInfo.img_url,
        modeSize: modeSize
      }
    })
  },
  checkTemplateType: function(e) {
    let index = e.currentTarget ? e.currentTarget.dataset.index : e
    this.setData({
      templateTypeIndex: index
    })
    this.checkTemplate(0)
  },

  checkTemplate: function(e) {
    let index = e.currentTarget ? e.currentTarget.dataset.index : e
    this.setData({
      templateIndex: index
    })
    this.setComponentData()
  },
})
