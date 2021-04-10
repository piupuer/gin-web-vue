// websocket前缀
const wsPrefixProtocol = location.protocol === 'https:' ? 'wss://' : 'ws://'
let wsPrefix = ''
let baseWs = window.location.hostname + '/api/v1/message/ws'
if (process.env) {
  if (process.env.VUE_APP_BASE_WS) {
    baseWs = process.env.VUE_APP_BASE_WS
  } else if (process.env.VUE_APP_BASE_API) {
    baseWs = process.env.VUE_APP_BASE_API
  }
}

if (baseWs.indexOf(wsPrefixProtocol) == 0) {
  wsPrefix = baseWs
} else {
  wsPrefix = wsPrefixProtocol + process.env.VUE_APP_BASE_WS
}

// 获取websocket前缀
export const getWsPrefix = () => wsPrefix
