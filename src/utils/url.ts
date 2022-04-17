import { ConstantModule } from '@/store/modules/constant'
import * as crypto from 'crypto-js'
import qs from 'qs'
// @ts-ignore
import stringify from 'json-stable-stringify'

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
export const signToken = (cfg: {
  base?: string
  url?: string
  method?: string
  params?: any
  data?: any
}) => {
  let uri = '/' + cfg.base + cfg.url
  try {
    const url = new URL(cfg.base)
    uri = url.pathname + cfg.url
  } catch (e) {

  }

  if (cfg.params) {
    const s = qs.stringify(cfg.params)
    if (s !== '') {
      uri += '?' + s
    }
  }
  let body = {}
  if (cfg.data) {
    body = cfg.data
  }
  if (typeof cfg.method === 'undefined') {
    cfg.method = 'get'
  }
  const m = cfg.method.toLocaleUpperCase()
  const timestamp = new Date().getTime()
  const str = m + '|' + uri + '|' + timestamp + '|' + stringify(body)
  return [
    `appid="${ConstantModule.signId}"`,
    `timestamp="${timestamp}"`,
    `signature="${crypto.enc.Base64.stringify(crypto.HmacSHA256(str, ConstantModule.signSecret))}"`
  ].join(',')
}
