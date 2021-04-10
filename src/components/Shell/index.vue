<template>
  <div
    ref="terminal"
    class="app-container"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { SearchAddon } from 'xterm-addon-search'
import { AttachAddon } from 'xterm-addon-attach'
import 'xterm/css/xterm.css'

@Component({
  name: 'PrShell'
})
export default class extends Vue {
  // 主机地址
  @Prop({
    type: String,
    default: ''
  })
  host!: string

  // 端口
  @Prop({
    type: Number,
    default: ''
  })
  sshPort!: number

  // 登录名
  @Prop({
    type: String,
    default: ''
  })
  loginName!: string

  // 登录密码
  @Prop({
    type: String,
    default: ''
  })
  loginPwd!: string

  private term: any
  private ws: any

  private readonly defaultConfig: any = {
    rows: 30,
    cols: 10,
    theme: {
      foreground: '#ffffff', // 字体
      background: '#1b212f', // 背景色
      cursor: '#ffffff' // 设置光标
    }
  }

  mounted() {
    this.term = new Terminal({
      rendererType: 'canvas', // 渲染类型
      rows: this.defaultConfig.rows,
      // cols: this.defaultConfig.cols,
      convertEol: true, // 启用时，光标将设置为下一行的开头
      // scrollback: 10, // 终端中的回滚量
      disableStdin: false, // 是否应禁用输入
      fontSize: 18,
      cursorBlink: true, // 光标闪烁
      cursorStyle: 'bar', // 光标样式 underline
      bellStyle: 'sound',
      theme: this.defaultConfig.theme
    })
    // this.term.setOption('padding', {
    //   top: 5,
    //   left: 0,
    //   right: 10,
    //   bottom: 5
    // })

    this.ws = new WebSocket('ws://' + window.location.hostname + '/api/v1/machine/shell/ws?host=' + encodeURIComponent(this.host) + '&sshPort=' + this.sshPort + '&loginName=' + encodeURIComponent(this.loginName) + '&loginPwd=' + encodeURIComponent(this.loginPwd))

    const fitAddon = new FitAddon()
    const attachAddon = new AttachAddon(this.ws)
    this.term.loadAddon(fitAddon)
    this.term.loadAddon(new WebLinksAddon())
    this.term.loadAddon(new SearchAddon())
    this.term.loadAddon(attachAddon)

    this.term.open(this.$refs.terminal)

    this.term.focus()
    // 限制和后端交互，只有输入回车键才显示结果
    this.term.prompt = () => {
      this.term.write('\r\n$ ')
    }
    this.term.prompt()

    // 自适应
    fitAddon.fit()
  }
}
</script>

<style lang="scss">
.terminal.xterm{
  .xterm-viewport{
    padding: 20px;
  }
}
</style>
