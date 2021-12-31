import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import { Notification } from 'element-ui'
import { voice } from '@/utils/voice'
import { getOssPrefix, getWsPrefix } from '@/utils/url'
import { UserModule } from '@/store/modules/user'
import i18n from '@/lang'

export interface IMessageState {
  unReadCount: number
  ws: any
}

// 心跳间隔
const heartBeatPeriod = 3
// 断线重连间隔
const reConnectPeriod = 15
// 主动发数据重连间隔
const sendConnectPeriod = 3
let reConnectTimeout: any = null
let heartBeatInterval: any = null

@Module({ dynamic: true, store, name: 'message' })
class Message extends VuexModule implements IMessageState {
  public ws: any = null
  public active = false
  public lastActive = 0
  public shutdown = false
  public unReadCount = 0
  public retryCount = 0

  @Mutation
  private SET_WS(ws: any) {
    this.ws = ws
  }

  @Mutation
  private SET_ACTIVE(active: boolean) {
    this.active = active
  }

  @Mutation
  private SET_LAST_ACTIVE(lastActive: number) {
    this.lastActive = lastActive
  }

  @Mutation
  private SET_SHUTDOWN(shutdown: boolean) {
    this.shutdown = shutdown
  }

  @Mutation
  private SET_UN_READ_COUNT(unReadCount: number) {
    this.unReadCount = unReadCount
  }

  @Mutation
  private SET_RETRY_COUNT(retryCount: number) {
    this.retryCount = retryCount
  }

  @Action
  public ReConnect(period: number) {
    let message = i18n.t('messagePushPage.lost').toString()
    if (!this.shutdown) {
      this.close()
      reConnectTimeout = setTimeout(() => {
        this.connect()
        this.SET_RETRY_COUNT(this.retryCount + 1)
      }, (this.retryCount + 1) * period * 1000)
      message = i18n.t('messagePushPage.lostReconnect').toString().replace('%s', ((this.retryCount + 1) * period).toString())
    }
    Notification({
      title: i18n.t('sorry').toString(),
      message,
      type: 'warning',
      duration: 2000
    })
  }

  // 数据接收
  @Action
  public Receive(e: any) {
    this.SET_ACTIVE(true)
    this.SET_LAST_ACTIVE(new Date().getTime())
    this.SET_RETRY_COUNT(0)
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
                title: i18n.t('congratulations').toString(),
                message: data.detail.msg,
                type: 'success',
                duration: 2000
              })
            } else {
              Notification({
                title: i18n.t('sorry').toString(),
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
                title: i18n.t('messagePushPage.newMessage').toString(),
                message: i18n.t('messagePushPage.newMessageDetail').toString(),
                type: 'success',
                duration: 5000
              })
              // 声音提醒
              voice.playUrl(getOssPrefix() + '/media/message.mp3', {}, {})
            }
            this.SET_UN_READ_COUNT(data.detail.data.unReadCount)
          }
          break
        // 新用户上线
        case '2-4-1':
          if (data.detail && data.detail.code === 201 && data.detail.data) {
            if (data.detail.data.user) {
              const user = data.detail.data.user
              Notification({
                title: i18n.t('messagePushPage.online').toString(),
                message: i18n.t('messagePushPage.onlineDetail').toString().replace('%s', user.nickname + `(${user.username})`),
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
    if (last > heartBeatPeriod) {
      this.Send({
        type: '1-1-1',
        data: this.retryCount
      })
    }
  }

  // 数据发送
  @Action
  public Send(data: any) {
    if (!this.active || !this.ws) {
      // 心跳数据不提示弹窗
      if (data.type !== '1-1-1') {
        Notification({
          title: i18n.t('sorry').toString(),
          message: i18n.t('messagePushPage.lostRetry').toString().replace('%s', sendConnectPeriod.toString()),
          type: 'warning',
          duration: 2000
        })
      }
      this.ReConnect(sendConnectPeriod)
      return
    }
    this.ws.send(JSON.stringify(data))
  }

  @Action
  public connect() {
    this.close()
    const websocket = new WebSocket(getWsPrefix() + '/message/ws?token=' + UserModule.token)
    // 连接建立之后执行send方法发送数据
    websocket.onopen = (e: any) => {
      Notification({
        title: i18n.t('congratulations').toString(),
        message: i18n.t('messagePushPage.connected').toString(),
        type: 'success',
        duration: 2000
      })
    }

    // 连接关闭后执行
    websocket.onclose = (e: any) => {
      this.ReConnect(reConnectPeriod)
    }

    // 连接错误
    websocket.onerror = (e: any) => {
      Notification({
        title: i18n.t('sorry').toString(),
        message: i18n.t('messagePushPage.cannotConnect').toString(),
        type: 'warning',
        duration: 2000
      })
    }

    // 监听消息接收
    websocket.onmessage = (e: any) => {
      this.Receive(e)
    }

    // 心跳检测
    heartBeatInterval = setInterval(this.Heart, heartBeatPeriod * 1000)
    this.SET_WS(websocket)
    this.SET_ACTIVE(true)
  }

  @Action
  public close() {
    if (reConnectTimeout) {
      clearTimeout(reConnectTimeout)
    }
    if (heartBeatInterval) {
      clearInterval(heartBeatInterval)
    }
    if (this.ws) {
      this.ws.close()
    }
    this.SET_ACTIVE(false)
    this.SET_WS(null)
  }

  @Action
  public Start() {
    this.SET_SHUTDOWN(false)
    if (!this.active) {
      this.connect()
    }
  }

  @Action
  public Stop() {
    this.SET_SHUTDOWN(true)
    this.close()
  }
}

export const MessageModule = getModule(Message)
