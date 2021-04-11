import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import { Notification } from 'element-ui'
import { voice } from '@/utils/voice'
import { getWsPrefix } from '@/utils/url'
import { UserModule } from '@/store/modules/user'

export interface IMessageState {
  unReadCount: number
  ws: any
}

// 心跳间隔
const heartBeatPeriod = 3
// 短线重连间隔
const reConnectPeriod = 15
// 主动发数据重连间隔
const sendConnectPeriod = 3
// 心跳最大重试次数
const heartBeatMaxRetryCount = 5
let reConnectTimeout: any = null
let heartBeatInterval: any = null

@Module({ dynamic: true, store, name: 'message' })
class Message extends VuexModule implements IMessageState {
  public unReadCount = 0
  public ws: any = null
  public active = false
  public lastActive = 0
  public retryCount = 0

  @Mutation
  private SET_WS(ws: any) {
    this.ws = ws
    this.active = true
  }

  @Action
  public Start(ws: any) {
    this.SET_WS(ws)
  }

  @Mutation
  private SET_UN_READ_COUNT(unReadCount: number) {
    this.unReadCount = unReadCount
  }

  @Action
  public SetUnReadCount(unReadCount: number) {
    this.SET_UN_READ_COUNT(unReadCount)
  }

  @Mutation
  private SET_ACTIVE(active: boolean) {
    this.active = active
  }

  @Action
  public SetActive(active: boolean) {
    this.SET_ACTIVE(active)
  }

  @Mutation
  private SET_LAST_ACTIVE(lastActive: number) {
    this.lastActive = lastActive
  }

  @Action
  public SetLastActive(lastActive: number) {
    this.SET_LAST_ACTIVE(lastActive)
  }

  @Mutation
  private SET_RETRY_COUNT(retryCount: number) {
    this.retryCount = retryCount
  }

  @Action
  private SetRetryCount(retryCount: number) {
    this.SET_RETRY_COUNT(retryCount)
  }

  @Action
  public Close() {
    if (heartBeatInterval) {
      clearInterval(heartBeatInterval)
    }
    if (this.ws) {
      this.ws.close()
      this.SetActive(false)
    }
    this.SET_WS(null)
  }

  @Action
  public ReConnect(period: number) {
    this.Close()
    if (reConnectTimeout) {
      clearTimeout(reConnectTimeout)
    }
    reConnectTimeout = setTimeout(() => {
      start()
    }, period * 1000)
  }

  // 数据接收
  @Action
  public Receive(e: any) {
    this.SetActive(true)
    this.SetLastActive(new Date().getTime())
    this.SetRetryCount(0)
    let data = e.data
    try {
      data = JSON.parse(data)
      switch (data.type) {
        // 心跳
        case '2-1-1':
          if (data.detail && data.detail.code === 201 && typeof data.detail.data === 'number') {
            this.Send({
              type: '1-1-1'
            })
          }
          break
        // 普通消息
        case '2-2-1':
          if (data.detail) {
            if (data.detail.code === 201) {
              Notification({
                title: '提醒',
                message: data.detail.msg,
                type: 'success',
                duration: 2000
              })
            } else {
              Notification({
                title: '抱歉',
                message: data.detail.msg,
                type: 'error',
                duration: 2000
              })
            }
          }
          break
        // 新消息
        case '2-3-1':
          if (data.detail && data.detail.code === 201 && data.detail.data) {
            if (this.unReadCount < data.detail.data.unReadCount) {
              Notification({
                title: '新消息提醒',
                message: '有人给你发了新的消息',
                type: 'success',
                duration: 5000
              })
              // 声音提醒
              voice.playUrl('/media/message.mp3', {}, {})
            }
            this.SetUnReadCount(data.detail.data.unReadCount)
          }
          break
        // 新用户上线
        case '2-4-1':
          if (data.detail && data.detail.code === 201 && data.detail.data) {
            if (data.detail.data.user) {
              const user = data.detail.data.user
              Notification({
                title: '上线提醒',
                message: `用户${user.nickname}(${user.username})刚刚上线啦`,
                type: 'success',
                duration: 2000
              })
            }
          }
          break
      }
    } finally {
      if (data.type !== '2-1-1') {
        this.Send({
          type: '1-1-1'
        })
      }
    }
  }

  // 检查心跳
  @Action
  public Heart() {
    const last = (new Date().getTime() - this.lastActive) / 1000
    if (this.retryCount > heartBeatMaxRetryCount) {
      this.ReConnect(reConnectPeriod)
      return
    }
    if (last > heartBeatPeriod) {
      this.Send({
        type: '1-1-1',
        data: this.retryCount
      })
      this.SetRetryCount(this.retryCount + 1)
    }
  }

  // 数据发送
  @Action
  public Send(data: any) {
    if (!this.active || !this.ws) {
      if (data.type === '1-1-1') {
        console.log(new Date().getTime(), '连接消息中心失败')
      } else {
        Notification({
          title: '抱歉',
          message: '连接消息中心失败, ' + sendConnectPeriod + '秒后主动重连',
          type: 'warning',
          duration: 2000
        })
      }
      this.ReConnect(sendConnectPeriod)
      return
    }
    this.ws.send(JSON.stringify(data))
  }
}

export const MessageModule = getModule(Message)

function start() {
  if (reConnectTimeout) {
    clearTimeout(reConnectTimeout)
  }
  const websocket = new WebSocket(getWsPrefix() + '/message/ws?token=' + UserModule.token)

  // 连接建立之后执行send方法发送数据
  websocket.onopen = (e: any) => {
    console.log('已建立连接: ' + e.currentTarget.url)
    MessageModule.Start(websocket)
  }

  // 连接关闭后执行
  websocket.onclose = (e: any) => {
    console.error('连接已断开: ' + e.currentTarget.url)
    MessageModule.ReConnect(reConnectPeriod)
  }

  // 连接错误
  websocket.onerror = (e: any) => {
    console.error('连接错误: ' + e.currentTarget.url)
    Notification({
      title: '抱歉',
      message: '连接消息中心失败',
      type: 'warning',
      duration: 2000
    })
  }

  // 监听消息接收
  websocket.onmessage = (e: any) => {
    MessageModule.Receive(e)
  }

  // 心跳检测
  heartBeatInterval = setInterval(MessageModule.Heart, heartBeatPeriod * 1000)
}

// 开启websocket
start()
