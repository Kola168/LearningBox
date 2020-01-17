import gql from '../graphql_config'


const graphqlApi = {
   /**
   * 获取购买记录列表
   */
  getPaymentOrders: ()=> {
    return gql.query({
      query: `query getPaymentOrders{
        currentUser{
          paymentOrders{
            amountYuan
            createdAt
            sn
            state
            updatedAt
            payable{
              categoryName:__typename
              ...on Course{
                icon: iconUrl
                name
              }
              ...on CertService{
                icon: singleUrl
              }
            }
          }
        }
      }`
    })
  },
  /**
   * 获取购买记录详情
   * @param {String} 订单sn
   */
  getPaymentOrderDetails: (sn)=> {
    return gql.query({
      query: `query getPaymentOrders($sn:String){
        currentUser{
          paymentOrders(sn: $sn){
            amountYuan
            createdAt
            payable{
              categoryName:__typename
              ... on Course{
                icon: iconUrl
                name
                sn
                paidAmountYuan: priceYuan
              }
              ... on MemberConfig{
                icon: image
                name
                paidAmountYuan: priceY
              }
              ...on CertService{
                isPrint
                icon: singleUrl
                paidAmountYuan: price
              }
            }
            sn
            state
            updatedAt
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },

  //获取收藏列表
  collections:(param)=>{
    return gql.query({
      query: `query($type:CollectionTypeEnum!,$page: Int = 1){
        collections(type:$type,page:$page){
          ... on Content{
            name
            iconUrl

          }
        }
      }`,
      //parentName
      variables: param
    })
  },

  //获取设备厂商及品牌列表
  printerModels:()=>{
    return gql.query({
      query: `query{
        printerModels{
          maker
          printerModels{
            sn
            name
            isSelected
          }
        }
      }`,
    })
  },

  //获取选中设备的问题列表
  instructions:(params)=>{
    return gql.query({
      query: `query($isGuesses:Boolean,$keyword:String,$printerModelSn:String){
         instructions(isGuesses:$isGuesses,keyword:$keyword,printerModelSn:$printerModelSn){
          sn
          title
          content
          printerModelName
          printerModelMaker
        }
      }`,
      variables:params
    })
  },

  /**
   * 获取免费资源库
   * @param { String } key feature_key
   */
  getFreeSources: (key) => {
    return gql.query({
      query: `query ($key: String!){
        feature(key: $key){
          categories{
            ...on ResourceCategory {
              name
              children{
                ...on ResourceCategory {
                  name
                  subTitle
                  image
                  sn
                }
              }
            }
          }
        }
      }`,
      variables: {
        key: key
      }
    })
  },

  /**
   * 免费资源库内容类型
   * @param { string } sn 资源sn
   */
  getFreeSourcesContentType: (sn) => {
    return gql.query({
      query: `query ($sn: String!){
        category(sn: $sn){
          ...on ResourceCategory {
            children{
              ...on ResourceCategory {
                name
                sn
              }
            }
          }
        }
      }`,
      variables: {
        sn: sn
      }
    })
  },

  /**
   * 免费资源库内容
   * @param { string } sn 资源sn
   */
  getFreeSourcesContents: (sn) => {
    return gql.query({
      query: `query ($sn: String!){
        category(sn: $sn){
          ...on ResourceCategory {
            contents {
              ...on ResourceContent {
                iconUrl
                pageCount
                printerOrdersCount
                sn
                name
              } 
            }
          }
        }
      }`,
      variables: {
        sn: sn
      }
    })
  },

  /**
   * 免费资源库详情
   * @param { string } sn 资源sn
   */
  getFreeSourcesDetail: (sn) => {
    return gql.query({
      query: `query ($sn: String!){
        content(sn: $sn){
          ...on ResourceContent {
            contentImages{
              nameUrl
            }
            pageCount
            name
            featureKey
          }
        }
      }`,
      variables: {
        sn: sn
      }
    })
  },

}


export default graphqlApi
