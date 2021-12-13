<template>
  <div class="login-container">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      autocomplete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">
          {{ $t('loginPage.title') }}
        </h3>
        <lang-select class="set-language" />
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon name="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          :placeholder="$t('pleaseEnter') + $t('username')"
          name="username"
          type="text"
          tabindex="1"
          autocomplete="on"
          @focus="saveOldUsername"
          @blur="getUserStatus"
        />
      </el-form-item>

      <el-tooltip
        v-model="capsTooltip"
        content="Caps lock is On"
        placement="right"
        manual
      >
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon name="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            :placeholder="$t('pleaseEnter') + $t('password')"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleLogin"
          />
          <span
            class="show-pwd"
            @click="showPwd"
          >
            <svg-icon :name="passwordType === 'password' ? 'eye-off' : 'eye-on'" />
          </span>
        </el-form-item>
      </el-tooltip>
      <el-form-item
        v-if="loginForm.captchaId !== ''"
        prop="captchaAnswer"
        class="captcha"
      >
        <span class="svg-container">
          <i class="el-icon-umbrella" />
        </span>
        <el-input
          ref="captchaAnswer"
          v-model="loginForm.captchaAnswer"
          class="captcha-input"
          type="text"
          :placeholder="$t('pleaseEnter') + $t('loginPage.captcha')"
          name="text"
          tabindex="3"
          @keyup.enter.native="handleLogin"
        />
        <span
          v-if="loginForm.captchaImg!==''"
          class="captcha-image"
        >
          <el-image
            :src="loginForm.captchaImg"
            @click.prevent="refreshCaptcha"
          >
            <div
              slot="error"
              class="image-slot"
            >
              <i class="el-icon-picture-outline" />
            </div>
          </el-image>
        </span>
      </el-form-item>
      <el-button
        :loading="loading"
        type="primary"
        style="width:100%; margin-bottom:30px;"
        @click.native.prevent="handleLogin"
      >
        {{ $t('login') }}
      </el-button>

      <div style="position:relative">
        <div class="tips">
          <span>{{ $t('loginPage.users[0]') }} : super </span>
          <span>{{ $t('password') }} : 123456 </span>
        </div>
        <div class="tips">
          <span>{{ $t('loginPage.users[1]') }} : guest </span>
          <span>{{ $t('password') }} : 123456 </span>
        </div>
        <div class="tips">
          <span>{{ $t('loginPage.users[2]') }} : leave </span>
          <span>{{ $t('password') }} : 123456 </span>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Route } from 'vue-router'
import { Dictionary } from 'vue-router/types/router'
import { Form as ElForm, Input } from 'element-ui'
import { UserModule } from '@/store/modules/user'
import LangSelect from '@/components/LangSelect/index.vue'
import SocialSign from './components/SocialSignin.vue'
import { captcha, userStatus } from '@/api/system/bases'

@Component({
  name: 'Login',
  components: {
    LangSelect,
    SocialSign
  }
})
export default class extends Vue {
  private loginRules = {
    username: [
      { required: true, message: this.$t('username').toString() + this.$t('required').toString(), trigger: 'blur' }
    ],
    password: [
      { required: true, message: this.$t('password').toString() + this.$t('required').toString(), trigger: 'blur' }
    ],
    captchaAnswer: [
      { required: true, message: this.$t('loginPage.captcha').toString() + this.$t('required').toString(), trigger: 'blur' }
    ]
  }

  private loginForm = {
    username: 'super',
    password: '123456',
    captchaId: '',
    captchaImg: '',
    captchaAnswer: ''
  }

  private passwordType = 'password'
  private loading = false
  private oldUsername = ''
  private capsTooltip = false
  private redirect?: string
  private otherQuery: Dictionary<string> = {}

  @Watch('$route', { immediate: true })
  private onRouteChange(route: Route) {
    // TODO: remove the "as Dictionary<string>" hack after v4 release for vue-router
    // See https://github.com/vuejs/vue-router/pull/2050 for details
    const query = route.query as Dictionary<string>
    if (query) {
      this.redirect = query.redirect
      this.otherQuery = this.getOtherQuery(query)
    }
  }

  mounted() {
    if (this.loginForm.username === '') {
      (this.$refs.username as Input).focus()
    } else if (this.loginForm.password === '') {
      (this.$refs.password as Input).focus()
    }
  }

  private checkCapslock(e: KeyboardEvent) {
    const { key } = e
    this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
  }

  private showPwd() {
    if (this.passwordType === 'password') {
      this.passwordType = ''
    } else {
      this.passwordType = 'password'
    }
    this.$nextTick(() => {
      (this.$refs.password as Input).focus()
    })
  }

  private async saveOldUsername() {
    this.oldUsername = this.loginForm.username
  }

  private async getUserStatus() {
    if (this.oldUsername === this.loginForm.username) {
      return
    }
    try {
      const { data } = await userStatus({
        username: this.loginForm.username
      })
      if (data.captcha) {
        this.loginForm.captchaId = data.captcha.id
        this.loginForm.captchaImg = data.captcha.img
      }
    } finally {
    }
  }

  private async refreshCaptcha() {
    try {
      const { data } = await captcha()
      if (data) {
        this.loginForm.captchaId = data.id
        this.loginForm.captchaImg = data.img
      }
    } finally {
    }
  }

  private async handleLogin() {
    if (this.loginForm.captchaId !== '' && this.loginForm.captchaAnswer === '') {
      return
    }
    (this.$refs.loginForm as ElForm).validate(async(valid: boolean) => {
      if (valid) {
        this.loading = true
        try {
          await UserModule.Login(this.loginForm)
          this.$router.push({
            path: this.redirect || '/',
            query: this.otherQuery
          })
        } catch (e) {
          if (e.message.indexOf('the verification code is invalid or expired') > 0) {
            this.oldUsername = ''
          }
          await this.getUserStatus()
        } finally {
          // 不管是否异常自动停止loading
          this.loading = false
        }
      } else {
        return false
      }
    })
  }

  private getOtherQuery(query: Dictionary<string>) {
    return Object.keys(query).reduce((acc, cur) => {
      if (cur !== 'redirect') {
        acc[cur] = query[cur]
      }
      return acc
    }, {} as Dictionary<string>)
  }
}
</script>

<style lang="scss">
// References: https://www.zhangxinxu.com/wordpress/2018/01/css-caret-color-first-line/
@supports (-webkit-mask: none) and (not (cater-color: $loginCursorColor)) {
  .login-container .el-input {
    input { color: $loginCursorColor; }
    input::first-line { color: $lightGray; }
  }
}

.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      height: 47px;
      background: transparent;
      border: 0px;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $lightGray;
      caret-color: $loginCursorColor;
      -webkit-appearance: none;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $loginBg inset !important;
        -webkit-text-fill-color: #fff !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
.login-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: $loginBg;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
    .captcha {
      .captcha-input, .captcha-image, .el-image {
        display: inline-block;
        vertical-align: middle;
      }
      .captcha-input {
        width: 60%;
      }
      .captcha-image {
        width: 30%;
        background-color: #dddddd;
        &:hover {
          cursor: pointer;
        }
      }
    }
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $darkGray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $lightGray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }

    .set-language {
      color: #fff;
      position: absolute;
      top: 3px;
      font-size: 18px;
      right: 0px;
      cursor: pointer;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $darkGray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
