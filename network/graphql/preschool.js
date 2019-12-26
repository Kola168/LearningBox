// 学前接口

import gql from '../graphql_config'
const graphqlApi = {
  /**
   * 获取当前用户信息
   *
   * @returns
   */
  getUser: () => {
    return gql.query({
      query: `query{
        currentUser{
          phone
          sn
          selectedDevice{
            sn
            name
            model
            onlineState
          }
          selectedKid{
            gender
            name
            birthday
            avatar
            sn
            stageRoot{
              name
              rootName
              sn
            }
            stage{
              name
              rootName
              sn
            }
            province{
              name
            }
            district{
              name
            }
            city{
              name
            }
          }
        }
      }`
    })
  },
}

export default graphqlApi