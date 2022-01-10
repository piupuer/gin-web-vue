import { getModule, Module, VuexModule } from 'vuex-module-decorators'
import store from '@/store'

export interface IConstantState {
  headerSignToken: string
}

@Module({ dynamic: true, store, name: 'constant' })
class Constant extends VuexModule implements IConstantState {
  public headerSignToken = 'X-Sign-Token'
  public signId = 'gin-web'
  public signSecret = 'gin-web'
}

export const ConstantModule = getModule(Constant)
