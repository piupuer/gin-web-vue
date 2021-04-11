import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import { idempotenceToken } from '@/api/system/bases'
import { setIdempotenceToken } from '@/utils/cookies'

export interface IIdempotenceState {
  idempotenceToken: string
  idempotenceTokenName: string
}

@Module({ dynamic: true, store, name: 'idempotence' })
class Idempotence extends VuexModule implements IIdempotenceState {
  public idempotenceToken = ''
  public idempotenceTokenName = 'api-idempotence-token'

  @Mutation
  private SET_IDEMPOTENCE_TOKEN(token: string) {
    this.idempotenceToken = token
  }

  @Action
  public async RefreshIdempotenceToken() {
    // 刷新token
    try {
      const { data } = await idempotenceToken()
      setIdempotenceToken(data)
      this.SET_IDEMPOTENCE_TOKEN(data)
    } catch (e) {
      console.log('刷新token失败', e)
    }
  }
}

export const IdempotenceModule = getModule(Idempotence)
