// websocket前缀
const wsPrefixProtocol = location.protocol === 'https:' ? 'wss://' : 'ws://'
let wsPrefix = ''
let baseWs = ''
// oss prefix
let ossPrefix = ''
if (process.env) {
  if (process.env.VUE_APP_BASE_WS) {
    baseWs = process.env.VUE_APP_BASE_WS
  } else if (process.env.VUE_APP_BASE_API) {
    baseWs = process.env.VUE_APP_BASE_API
  }
  if (process.env.OSS_URI) {
    ossPrefix = process.env.OSS_URI
  }
}

if (baseWs.indexOf(wsPrefixProtocol) === 0) {
  wsPrefix = baseWs
} else {
  if (baseWs.indexOf('/') === 0) {
    wsPrefix = wsPrefixProtocol + window.location.hostname + baseWs
  } else {
    wsPrefix = wsPrefixProtocol + window.location.hostname + '/' + baseWs
  }
}

export const getWsPrefix = () => wsPrefix.replace(/\/+$/, '')
export const getOssPrefix = () => ossPrefix.replace(/\/+$/, '')
