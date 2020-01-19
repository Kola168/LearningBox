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
						amountYuan
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
            name
            lmAvailableMember{
              goodsName
              time
              unit
            }
          }
          selectedKid{
            name
            stage{
              name
              rootName
            }
          }
        }
      }`
    })
  },
  /**
   * 当前会员状态
   *
   * @returns
   */
  hasMember: (format) => {
    return gql.query({
      query: `query($format:DatetimeFormatEnum){
        currentUser{
          sn
          selectedKid{
            preschoolMember{
              expiresAt(format:$format)
              upgradeableAmount
              upgradeablePrice
            }
            schoolAgeMember{
              expiresAt(format:$format)
            }
          }
        }
      }`,
      variables: {
        format
      }
    })
  },
}

export default graphqlApi