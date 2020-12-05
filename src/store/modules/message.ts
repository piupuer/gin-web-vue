import { VuexModule, Module, Mutation, getModule, Action } from 'vuex-module-decorators'
import store from '@/store'
import { Notification } from 'element-ui'
import { voice } from '@/utils/voice'

export interface IMessageState {
  unReadCount: number
  ws: any
  init: boolean
}

const websocket = new WebSocket('ws://' + window.location.hostname + '/api/v1/message/ws')

@Module({ dynamic: true, store, name: 'message' })
class Message extends VuexModule implements IMessageState {
  public unReadCount = 0
  public ws = websocket
  public init = false

  @Mutation
  private SET_UN_READ_COUNT(unReadCount: number) {
    this.unReadCount = unReadCount
  }

  @Mutation
  private SET_INIT(init: boolean) {
    this.init = init
  }

  @Action
  public SetUnReadCount(unReadCount: number) {
    this.SET_UN_READ_COUNT(unReadCount)
  }

  // 数据接收
  @Action
  public Receive(e: any) {
    let data = e.data
    try {
      data = JSON.parse(data)
      switch (data.type) {
        // 心跳
        case '1-2-1':
          if (data.detail && data.detail.code === 201) {
            this.Send({
              type: '1-1-1',
              data: data.detail.data
            })
          }
          break
        // 新消息
        case '2-3-1':
          if (data.detail && data.detail.code === 201 && data.detail.data) {
            if (this.init && this.unReadCount < data.detail.data.unReadCount) {
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
            this.SET_INIT(true)
            // 回复心跳
            this.Send({
              type: '1-1-1'
            })
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
            // 回复心跳
            this.Send({
              type: '1-1-1'
            })
          }
          break
      }
    } catch (e) {
      // 回复心跳
      this.Send({
        type: '1-1-1',
        data
      })
    }
  }

  // 数据发送
  @Action
  public Send(data: any) {
    this.ws.send(JSON.stringify(data))
  }
}

export const MessageModule = getModule(Message)

// 连接建立之后执行send方法发送数据
websocket.onopen = (e: any) => {
  console.log('已建立连接', e)
}

// 连接关闭后执行
websocket.onclose = (e: any) => {
  console.log('连接已断开', e)
}

// 监听消息接收
websocket.onmessage = (e: any) => {
  MessageModule.Receive(e)
}
