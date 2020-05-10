<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">
        <el-col
          :span="6"
          :xs="24"
        >
          <user-card :user="user" />
        </el-col>
        <el-col
          :span="18"
          :xs="24"
        >
          <el-card>
            <el-tabs v-model="activeTab">
              <el-tab-pane
                :label="$t('profile.accountLabel')"
                name="account"
              >
                <account :user="user" />
              </el-tab-pane>
              <el-tab-pane
                :label="$t('profile.passwordLabel')"
                name="password"
              >
                <password />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { UserModule } from '@/store/modules/user'
import Account from './components/Account.vue'
import Password from './components/Password.vue'
import UserCard from './components/UserCard.vue'

export interface IProfile {
  id: number
  username: string
  nickname: string
  mobile: string
  introduction: string
  email: string
  avatar: string
  roles: string
}

const defaultProfile: IProfile = {
  id: 0,
  username: 'Loading...',
  nickname: 'Loading...',
  mobile: 'Loading...',
  introduction: 'Loading...',
  email: 'Loading...',
  avatar: 'Loading...',
  roles: 'Loading...'
}

@Component({
  name: 'Profile',
  components: {
    Account,
    Password,
    UserCard
  }
})
export default class extends Vue {
  private user = defaultProfile
  private activeTab = 'account'

  get id() {
    return UserModule.id
  }

  get username() {
    return UserModule.username
  }

  get nickname() {
    return UserModule.nickname
  }

  get mobile() {
    return UserModule.mobile
  }

  get introduction() {
    return UserModule.introduction
  }

  get email() {
    return UserModule.email
  }

  get avatar() {
    return UserModule.avatar
  }

  get roles() {
    return UserModule.roles
  }

  created() {
    this.getUser()
  }

  private getUser() {
    this.user = {
      id: this.id,
      username: this.username,
      nickname: this.nickname,
      mobile: this.mobile,
      introduction: this.introduction,
      email: this.email,
      avatar: this.avatar,
      roles: this.roles.join(' | ')
    }
  }
}
</script>
