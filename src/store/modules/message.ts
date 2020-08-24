import { VuexModule, Module, Mutation, getModule, Action } from 'vuex-module-decorators'
import store from '@/store'
import { Notification } from 'element-ui';
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
        case 0:
          if (data.detail && data.detail.code === 201) {
            MessageModule.Send({
              type: 0,
              data: data.detail.data,
            })
          }
          break
        case 3:
          console.log(data.detail)
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
          }
          break
        default:
          console.log('类型错误')
      }
    } catch (e) {
      console.log('非json数据, 按字符串处理')
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
  console.log('已建立连接')
}


// 监听消息接收
websocket.onmessage = (e: any) => {
  MessageModule.Receive(e)
}
