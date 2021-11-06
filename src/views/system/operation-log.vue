<template>
  <div class="app-container">
    <el-form
      ref="searchForm"
      v-loading="table.loading"
      :inline="true"
      :model="table.form"
      class="demo-form-inline"
    >
      <el-form-item
        label="访问路径"
        prop="path"
      >
        <el-input
          v-model.trim="table.form.path"
          placeholder="访问路径"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        label="请求方式"
        prop="method"
      >
        <el-select
          v-model.trim="table.form.method"
          placeholder="请选择请求方式"
          clearable
          @clear="doSearch"
          @change="doSearch"
        >
          <el-option
            v-for="item in defaultConfig.methods"
            :key="item.name"
            :label="item.label"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="用户名"
        prop="username"
      >
        <el-input
          v-model.trim="table.form.username"
          placeholder="用户名"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        label="IP"
        prop="ip"
      >
        <el-input
          v-model.trim="table.form.ip"
          placeholder="IP地址"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        label="状态码"
        prop="status"
      >
        <el-input
          v-model.trim="table.form.status"
          placeholder="响应状态码"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :loading="table.loading"
          @click="doSearch"
        >
          查询
        </el-button>
        <el-button @click="resetForm('searchForm')">
          重置
        </el-button>
      </el-form-item>
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button
            type="danger"
            icon="el-icon-delete"
            :disabled="table.batchDeleteBtnDisabled"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </el-col>
      </el-row>
      <el-table
        :data="table.list"
        style="width: 100%;margin-bottom: 20px;"
        row-key="id"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          prop="apiDesc"
          label="接口说明"
          width="180"
        />
        <el-table-column
          prop="path"
          label="访问路径"
          width="120"
        />
        <el-table-column
          prop="method"
          label="请求方式"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag
              :type="getMethodTagType(scope.row.method)"
            >
              {{ scope.row.method }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态码"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.status < 300"
              type="success"
            >
              {{ scope.row.status }}
            </el-tag>
            <el-tag
              v-else-if="scope.row.status < 400"
              type="warning"
            >
              {{ scope.row.status }}
            </el-tag>
            <el-tag
              v-else-if="scope.row.status < 500"
              type="info"
            >
              {{ scope.row.status }}
            </el-tag>
            <el-tag
              v-else
              type="danger"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="username"
          label="登录用户"
          align="center"
        />
        <el-table-column
          prop="roleName"
          label="角色"
          align="center"
        />
        <el-table-column
          prop="ip"
          label="IP"
          align="center"
        />
        <el-table-column
          prop="ipLocation"
          label="IP所在地"
          align="center"
        />
        <el-table-column
          prop="latency"
          label="请求耗时(毫秒)"
          align="center"
        >
          <template slot-scope="scope">
            {{ (scope.row.latency / 1000000).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="访问时间"
          align="center"
          width="180"
        />
        <el-table-column
          prop="userAgent"
          label="浏览器标识"
          align="center"
          width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="body"
          label="请求参数"
          align="center"
        >
          <template slot-scope="scope">
            <span
              class="svg-container"
              title="查看详情"
            >
              <svg-icon
                name="eye-on"
                @click="showJson(1, scope.row)"
              />
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="data"
          label="响应数据"
          align="center"
        >
          <template slot-scope="scope">
            <span
              class="svg-container"
              title="查看详情"
            >
              <svg-icon
                name="eye-on"
                @click="showJson(2, scope.row)"
              />
            </span>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          align="center"
          width="180"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="table.pageNum"
        :page-sizes="[1, 5, 20, 50]"
        :page-size="table.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="table.total"
        background
        @size-change="handlePagSizeChange"
        @current-change="handlePageNumChange"
      />
    </el-form>

    <!-- 操作日志json视图对话框 -->
    <el-dialog
      :title="jsonDialog.title"
      :visible.sync="jsonDialog.visible"
      width="500px"
    >
      <json-view :data="jsonDialog.data" />
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          @click="jsonDialog.visible=false"
        >
          确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
// @ts-ignore
import jsonView from 'vue-json-views'
import Pagination from '@/components/Pagination/index.vue'
import { Form } from 'element-ui'
import { batchDeleteOperationLog, findOperationLog } from '@/api/system/operationLogs'

@Component({
  // 组件名称首字母需大写, 否则会报警告
  name: 'OperationLog',
  components: {
    Pagination,
    jsonView
  }
})
export default class extends Vue {
  private readonly defaultConfig: any = {
    pageNum: 1,
    pageSize: 5,
    methods: [{
      name: 'POST',
      label: 'POST[创建资源]',
      type: 'success'
    }, {
      name: 'PUT',
      label: 'PUT[创建/更新资源]',
      type: 'info'
    }, {
      name: 'PATCH',
      label: 'PATCH[创建/更新资源(区别于PUT, 增量更新)]',
      type: 'warning'
    }, {
      name: 'DELETE',
      label: 'DELETE[删除资源]',
      type: 'danger'
    }]
  }

  private validateCategory(rule: any, value: string, callback: Function) {
    if (!/^[a-zA-Z]/.test(value)) {
      callback(new Error('必须以字母开头, 如a12345'))
    } else if (!/^[a-zA-Z]([-_a-zA-Z0-9])+$/.test(value)) {
      callback(new Error('不允许出现汉字或特殊字符, 如a+,sa、a张三'))
    } else {
      callback()
    }
  }

  private jsonDialog: any = {
    loading: false,
    // 是否打开
    visible: false,
    // 标题
    title: '',
    // 数据内容
    data: {}
  }

  private table: any = {
    loading: false,
    batchDeleteBtnDisabled: true,
    selection: [],
    list: [],
    pageNum: 1,
    pageSize: 5,
    total: 0,
    form: {
      path: '',
      method: '',
      username: '',
      ip: '',
      status: ''
    }
  }

  created() {
    this.getData()
  }

  private async getData() {
    this.table.loading = true
    try {
      const params: any = {
        ...this.table.form,
        pageNum: this.table.pageNum,
        pageSize: this.table.pageSize
      }
      if (params.status === '') {
        delete params.status
      }
      const { data } = await findOperationLog(params)
      this.table.list = data.list
      this.table.pageNum = data.pageNum
      this.table.pageSize = data.pageSize
      this.table.total = data.total
    } finally {
      // 不管是否异常自动停止loading
      this.table.loading = false
    }
  }

  private async doSearch() {
    this.getData()
  }

  private handleDelete(row: any) {
    this.batchDelete([row])
  }

  private handleBatchDelete() {
    this.batchDelete(this.table.selection)
  }

  private async batchDelete(rows: any) {
    const ids: number[] = []
    const paths: string[] = []
    for (let i = 0, len = rows.length; i < len; i++) {
      const row = rows[i]
      ids.push(row.id)
      paths.push(row.path)
    }
    if (ids.length > 0) {
      const msg = `确定要删除操作日志[${paths.join(',')}]吗, 此操作不可逆?`
      this.$confirm(msg, '请谨慎操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await batchDeleteOperationLog(ids.join(','))
          this.getData()
        })
    }
  }

  private async showJson(type: number, row: any) {
    if (type === 1) {
      this.jsonDialog.title = '请求参数详细内容'
      this.jsonDialog.data = JSON.parse(row.body)
    } else {
      this.jsonDialog.title = '响应数据详细内容'
      this.jsonDialog.data = JSON.parse(row.data)
    }
    this.jsonDialog.visible = true
  }

  private resetForm(formName: string) {
    // 重置分页
    this.table.pageNum = this.defaultConfig.pageNum
    this.table.pageSize = this.defaultConfig.pageSize
    // 仅对el-form-item设置prop的字段有效
    // 这种写法可能导致无法正确执行: (this.$refs[formName] as Form).resetFields()
    const form = this.$refs[formName] as Form
    form.resetFields()
    // 重新获取数据
    this.getData()
  }

  private async handleSelectionChange(rows: any) {
    this.table.batchDeleteBtnDisabled = rows.length === 0
    this.table.selection = rows
  }

  private handlePagSizeChange(val: number) {
    this.table.pageSize = val
    this.doSearch()
  }

  private handlePageNumChange(val: number) {
    this.table.pageNum = val
    this.doSearch()
  }

  // 获取请求方式对应的tag颜色
  private getMethodTagType(method: string) {
    for (let i = 0, len = this.defaultConfig.methods.length; i < len; i++) {
      const item = this.defaultConfig.methods[i]
      if (method === item.name) {
        return item.type
      }
    }
    return ''
  }
}
</script>
<style lang="scss" scoped>
  .app-container {
    .el-row {
      margin-bottom: 15px;
    }
  }
</style>
