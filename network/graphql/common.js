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
              ...on Course{
                icon: iconUrl
                name
              }
              ...on MemberConfig{
                icon: image
                name
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
          paymentOrders(sn:$sn){
            amountYuan
            createdAt
            payable{
              typename
              ...on Course{
                icon: iconUrl
                name
                paidAmountYuan: priceYuan
              }
              ...on MemberConfig{
                icon: image
                name
                paidAmountYuan: priceY
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

}


export default graphqlApi