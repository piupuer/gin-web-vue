import { VuexModule, Module, Mutation, getModule, Action } from 'vuex-module-decorators'
import store from '@/store'
import { getUnReadMessageCount } from '@/api/message/message'

export interface IMessageState {
  unReadCount: number
}

@Module({ dynamic: true, store, name: 'message' })
class Message extends VuexModule implements IMessageState {
  public unReadCount = 0

  @Mutation
  private SET_UN_READ_COUNT(unReadCount: number) {
    this.unReadCount = unReadCount
  }

  // 刷新未读条数
  @Action
  public async RefreshUnReadCount() {
    const { data } = await getUnReadMessageCount()
    this.SET_UN_READ_COUNT(data)
  }
}

export const MessageModule = getModule(Message)
