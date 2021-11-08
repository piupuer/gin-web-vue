<template>
  <div class="app-container">
    <uploader
      :options="uploader.options"
      :file-status-text="uploader.statusText"
      class="uploader-example"
      @file-added="onFileAdded"
      @file-success="onFileSuccess"
    >
      <uploader-unsupport />
      <uploader-btn :attrs="uploader.attrs">
        {{ $t('uploaderPage.zip') }}
      </uploader-btn>
      <el-button
        type="primary"
        :loading="uploader.unzipLoading"
        @click="doUnzip"
      >
        {{ $t('uploaderPage.startDecompress') }}<span>({{ $t('uploaderPage.uploaded') }}{{ uploader.merged.length }}, {{ $t('uploaderPage.decompressed') }}{{ uploader.unziped.length }})</span>
      </el-button>
      <uploader-list />
    </uploader>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { uploadMerge, uploadUnzip } from '@/api/upload/upload'
import { UserModule } from '@/store/modules/user'

@Component({
  // 组件名称首字母需大写, 否则会报警告
  name: 'Uploader2'
})
export default class extends Vue {
  private uploader: any = {
    options: {
      // 上传url
      target: process.env.VUE_APP_BASE_API + '/upload/file',
      // 上传文件时文件的参数名，默认file
      fileParameterName: 'file',
      // 是否开启服务器chunk校验
      testChunks: true,
      // 服务器分片校验自定义处理
      checkChunkUploadedByResponse: function(chunk: any, response: any) {
        const resp = JSON.parse(response)
        // 分片存在无需再次上传
        return resp.code === 201 && resp.data && (resp.data.complete || (resp.data.uploaded || []).indexOf(chunk.offset + 1) >= 0)
      },
      headers: {
        // 在header中添加的jwt token
        Authorization: 'Bearer ' + UserModule.token
      }
    },
    statusText: {
      success: this.$t('upload').toString() + this.$t('success').toString(),
      error: this.$t('upload').toString() + this.$t('fail').toString(),
      uploading: this.$t('uploading').toString(),
      paused: this.$t('paused').toString(),
      waiting: this.$t('waiting').toString()
    },
    // 记录所有文件
    files: [],
    // 只接受zip文件
    attrs: {
      accept: 'application/zip'
    },
    // 已经合并的文件列表
    merged: [],
    // 已解压文件列表
    unziped: [],
    unzipLoading: false
  }

  // 开始解压缩
  private async doUnzip() {
    if (this.uploader.merged.length === 0) {
      this.$message({
        type: 'warning',
        message: this.$t('uploaderPage.validate[0]').toString()
      })
      return
    }
    this.uploader.unzipLoading = true
    for (let i = 0, len = this.uploader.merged.length; i < len; i++) {
      const filename = this.uploader.merged[i]
      try {
        // 开始解压文件
        const { data } = await uploadUnzip({
          filename
        })
        this.uploader.unziped.push(filename)
        this.$notify({
          title: this.$t('congratulations').toString(),
          message: filename + this.$t('decompress').toString() + this.$t('success').toString(),
          type: 'success',
          duration: 2000
        })
      } catch (e) {
        this.$notify({
          title: this.$t('sorry').toString(),
          message: filename + this.$t('decompress').toString() + this.$t('fail').toString(),
          type: 'error',
          duration: 2000
        })
      } finally {
        this.uploader.unzipLoading = false
      }
    }
    // 清空
    this.uploader.merged = []
  }

  // 文件新增成功
  private async onFileAdded(file: any) {
    let exists = false
    for (let i = 0, len = this.uploader.files.length; i < len; i++) {
      if (this.uploader.files[i].name === file.name) {
        // 找到同名文件
        exists = true
        break
      }
    }
    if (!exists) {
      this.uploader.files.push(file)
    }
  }

  private async onFileSuccess(rootFile: any, file: any, response: any, chunk: any) {
    const resp = JSON.parse(response)
    if (resp.code === 201 && resp.data && resp.data.complete) {
      try {
        // 开始合并文件
        const { data } = await uploadMerge(resp.data)
        this.uploader.merged.push(data.filename)
        this.$notify({
          title: this.$t('congratulations').toString(),
          message: file.name + this.$t('merged').toString() + this.$t('success').toString(),
          type: 'success',
          duration: 2000
        })
      } catch (e) {
        this.$notify({
          title: this.$t('sorry').toString(),
          message: file.name + this.$t('merged').toString() + this.$t('fail').toString(),
          type: 'error',
          duration: 2000
        })
      }
    }
  }

  // 页面销毁前
  private async beforeDestroy() {
    for (let i = 0, len = this.uploader.files.length; i < len; i++) {
      // 取消未上传完成的文件
      if (!this.uploader.files[i].completed) {
        this.uploader.files[i].cancel()
      }
    }
  }
}

</script>

<style lang="scss">
  .uploader-example {
    width: 880px;
    padding: 15px;
    margin: 40px auto 0;
    font-size: 12px;
    box-shadow: 0 0 10px rgba(0, 0, 0, .4);

    .uploader-btn {
      margin-right: 4px;
      margin-bottom: 10px;
    }
    .uploader-list {
      max-height: 440px;
      overflow: auto;
      overflow-x: hidden;
    }
  }
</style>
