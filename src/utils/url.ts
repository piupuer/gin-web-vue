// websocket前缀
const wsPrefixProtocol = location.protocol === 'https:' ? 'wss://' : 'ws://'
let wsPrefix = ''
let baseWs = ''
if (process.env) {
  if (process.env.VUE_APP_BASE_WS) {
    baseWs = process.env.VUE_APP_BASE_WS
  } else if (process.env.VUE_APP_BASE_API) {
    baseWs = process.env.VUE_APP_BASE_API
  }
}

console.log('baseWs', baseWs)
if (baseWs.indexOf(wsPrefixProtocol) === 0) {
  wsPrefix = baseWs
} else {
  if (baseWs.indexOf('/') === 0) {
    wsPrefix = wsPrefixProtocol + window.location.hostname + baseWs
  } else {
    wsPrefix = wsPrefixProtocol + window.location.hostname + '/' + baseWs
  }
}

// 获取websocket前缀
export const getWsPrefix = () => wsPrefix
