<template>
  <div id="message-center">
    <router-link
      to="/message/"
    >
      <el-badge
        :hidden="message.unReadCount<=0"
        :value="message.unReadCount"
        :max="99"
        class="item"
      >
        <i class="el-icon-bell" />
      </el-badge>
    </router-link>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { MessageModule } from '@/store/modules/message'

export interface IMessage {
  unReadCount: number
}
const defaultMessage: IMessage = {
  unReadCount: 0
}

@Component({
  name: 'MessageCenter'
})
export default class extends Vue {
  private message = defaultMessage

  get unReadCount() {
    return MessageModule.unReadCount
  }

  created() {
    this.getMessage()
  }

  private getMessage() {
    this.message = {
      unReadCount: this.unReadCount
    }
  }

  @Watch('unReadCount')
  private async unReadCountChange() {
    this.message.unReadCount = this.unReadCount
  }
}
</script>
<style lange="less">
  #message-center .el-badge .el-badge__content {
    top: 15px;
  }
</style>
