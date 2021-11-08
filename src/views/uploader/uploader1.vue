<template>
  <div class="app-container">
    <uploader
      :options="options"
      class="uploader-example"
      @file-success="onFileSuccess"
    >
      <uploader-unsupport />
      <uploader-drop>
        <p>{{ $t('uploaderPage.drag') }}</p>
        <uploader-btn>{{ $t('uploaderPage.file') }}</uploader-btn>
        <uploader-btn :attrs="attrs">
          {{ $t('uploaderPage.image') }}
        </uploader-btn>
        <uploader-btn :directory="true">
          {{ $t('uploaderPage.folder') }}
        </uploader-btn>
      </uploader-drop>
      <uploader-list />
    </uploader>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { uploadMerge } from '@/api/upload/upload'
import { UserModule } from '@/store/modules/user'

@Component({
  // 组件名称首字母需大写, 否则会报警告
  name: 'Uploader1'
})
export default class extends Vue {
  private options: any = {
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
  }

  private attrs: any = {
    accept: 'image/*'
  }

  private async onFileSuccess(rootFile: any, file: any, response: any, chunk: any) {
    const resp = JSON.parse(response)
    if (resp.code === 201 && resp.data && resp.data.complete) {
      // 开始合并文件
      await uploadMerge(resp.data)
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
    }
    .uploader-list {
      max-height: 440px;
      overflow: auto;
      overflow-x: hidden;
      overflow-y: auto;
    }
  }
</style>
