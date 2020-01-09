// 会员和家庭接口

import gql from '../graphql_config'
const graphqlApi = {
  /**
   * 获取会员支付信息
   * @param { string } sn
   *
   */
  getMemberPaymentOrder: (sn) => {
    return gql.query({
      query: `query ($sn: String!){
        currentUser{
          selectedKid{
            avatar
            name
            stage{
              name
              rootName
            }
          }
          paymentOrders(sn: $sn){
            payable{
              ...on MemberConfig{
                displayPriceY
                priceY
                afterRechargeDate
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
   *
   * 查看用户打印机
   * @returns
   */
  getDevice: () => {
    return gql.query({
      query: `query{
        currentUser{
          sn
          selectedDevice{
            sn
            name
            model
            onlineState
          }
        }
      }`
    })
  },
}

export default graphqlApi