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
        :label="$t('title')"
        prop="title"
      >
        <el-input
          v-model.trim="table.form.title"
          :placeholder="$t('pleaseEnter') + $t('title')"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('content')"
        prop="content"
      >
        <el-input
          v-model.trim="table.form.content"
          :placeholder="$t('pleaseEnter') + $t('content')"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('type')"
        prop="type"
      >
        <el-select
          v-model.trim="table.form.type"
          :placeholder="$t('pleaseEnter') + $t('type')"
          clearable
          @clear="doSearch"
          @change="doSearch"
        >
          <el-option
            v-for="item in defaultConfig.types"
            :key="item.name"
            :label="item.label"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('status')"
        prop="status"
      >
        <el-select
          v-model.trim="table.form.status"
          :placeholder="$t('pleaseEnter') + $t('status')"
          clearable
          @clear="doSearch"
          @change="doSearch"
        >
          <el-option
            v-for="item in defaultConfig.status"
            :key="item.name"
            :label="item.label"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :loading="table.loading"
          @click="doSearch"
        >
          {{ $t('query') }}
        </el-button>
        <el-button @click="resetForm('searchForm')">
          {{ $t('reset') }}
        </el-button>
      </el-form-item>
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-view"
            :disabled="table.batchReadBtnDisabled"
            @click="handleBatchRead"
          >
            {{ $t('batchRead') }}
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            icon="el-icon-delete"
            :disabled="table.batchDeleteBtnDisabled"
            @click="handleBatchDelete"
          >
            {{ $t('batchDel') }}
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            @click="handleAllRead"
          >
            {{ $t('allRead') }}
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            @click="handleAllDelete"
          >
            {{ $t('allDel') }}
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
          prop="title"
          :label="$t('title')"
          sortable
        />
        <el-table-column
          prop="content"
          :label="$t('content')"
        />
        <el-table-column
          prop="type"
          :label="$t('type')"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag>
              {{ getTypeTagLabel(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="fromUsername"
          :label="$t('messagePushPage.fromUsername')"
        />
        <el-table-column
          prop="createdAt"
          :label="$t('createdAt')"
        />
        <el-table-column
          prop="status"
          :label="$t('status')"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag
              :type="getStatusTagType(scope.row.status)"
            >
              {{ getStatusTagLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          :label="$t('operation')"
          align="center"
          width="220"
        >
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.status===0"
              type="primary"
              @click="handleRead(scope.row)"
            >
              {{ $t('read') }}
            </el-button>
            <el-button
              type="danger"
              @click="handleDelete(scope.row)"
            >
              {{ $t('del') }}
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
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import Pagination from '@/components/Pagination/index.vue'
import { Form } from 'element-ui'
import { findMessage } from '@/api/message/message'
import { MessageModule } from '@/store/modules/message'

@Component({
  // 组件名称首字母需大写, 否则会报警告
  name: 'Message',
  components: {
    Pagination
  }
})
export default class extends Vue {
  private readonly defaultConfig: any = {
    pageNum: 1,
    pageSize: 5,
    types: [{
      name: 0,
      label: this.$t('messagePushPage.one2one').toString()
    }, {
      name: 1,
      label: this.$t('messagePushPage.one2more').toString()
    }, {
      name: 2,
      label: this.$t('messagePushPage.one2all').toString()
    }],
    status: [{
      name: 0,
      label: this.$t('messagePushPage.unRead').toString(),
      type: 'danger'
    }, {
      name: 1,
      label: this.$t('messagePushPage.read').toString(),
      type: 'success'
    }]
  }

  private table: any = {
    loading: false,
    batchReadBtnDisabled: true,
    batchDeleteBtnDisabled: true,
    selection: [],
    list: [],
    pageNum: 1,
    pageSize: 5,
    total: 0,
    form: {
      title: '',
      content: '',
      type: '',
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
      if (params.type === '') {
        delete params.type
      }
      const { data } = await findMessage(params)
      this.table.list = data.list
      this.table.pageNum = data.pageNum
      this.table.pageSize = data.pageSize
      this.table.total = data.total
    } finally {
      this.table.loading = false
    }
  }

  private async doSearch() {
    this.getData()
  }

  private handleRead(row: any) {
    this.batchRead([row])
  }

  private handleBatchRead() {
    this.batchRead(this.table.selection)
  }

  private async batchRead(rows: any) {
    const ids: number[] = []
    for (let i = 0, len = rows.length; i < len; i++) {
      const row = rows[i]
      ids.push(row.id)
    }
    if (ids.length > 0) {
      MessageModule.Send({
        type: '1-2-2',
        data: {
          ids: ids.join(',')
        }
      })
    }
  }

  private async handleAllRead() {
    MessageModule.Send({
      type: '1-2-4'
    })
  }

  private handleDelete(row: any) {
    this.batchDelete([row])
  }

  private handleBatchDelete() {
    this.batchDelete(this.table.selection)
  }

  private async batchDelete(rows: any) {
    const ids: number[] = []
    const titles: string[] = []
    for (let i = 0, len = rows.length; i < len; i++) {
      const row = rows[i]
      ids.push(row.id)
      titles.push(row.title)
    }
    if (ids.length > 0) {
      const msg = `${this.$t('sureToDo').toString()}${this.$t('del').toString()}${this.$t('message').toString()}[${titles.join(',')}], ${this.$t('irreversible').toString()}?`
      this.$confirm(msg, this.$t('caution').toString(), {
        confirmButtonText: this.$t('confirm').toString(),
        cancelButtonText: this.$t('cancel').toString(),
        type: 'warning'
      })
        .then(async() => {
          MessageModule.Send({
            type: '1-2-3',
            data: {
              ids: ids.join(',')
            }
          })
          this.refresh()
        })
    }
  }

  private async handleAllDelete() {
    const msg = `${this.$t('sureToDo').toString()}${this.$t('message').toString()}, ${this.$t('irreversible').toString()}?`
    this.$confirm(msg, this.$t('caution').toString(), {
      confirmButtonText: this.$t('confirm').toString(),
      cancelButtonText: this.$t('cancel').toString(),
      type: 'warning'
    })
      .then(async() => {
        MessageModule.Send({
          type: '1-2-5'
        })
        this.refresh()
      })
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
    this.table.batchReadBtnDisabled = rows.length === 0
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

  // 获取消息类型对应的tag label
  private getTypeTagLabel(type: number) {
    for (let i = 0, len = this.defaultConfig.types.length; i < len; i++) {
      const item = this.defaultConfig.types[i]
      if (type === item.name) {
        return item.label
      }
    }
    return ''
  }

  // 获取消息状态对应的tag颜色
  private getStatusTagType(status: number) {
    for (let i = 0, len = this.defaultConfig.status.length; i < len; i++) {
      const item = this.defaultConfig.status[i]
      if (status === item.name) {
        return item.type
      }
    }
    return ''
  }

  // 获取消息类型对应的tag label
  private getStatusTagLabel(status: number) {
    for (let i = 0, len = this.defaultConfig.status.length; i < len; i++) {
      const item = this.defaultConfig.status[i]
      if (status === item.name) {
        return item.label
      }
    }
    return ''
  }

  get unReadCount() {
    return MessageModule.unReadCount
  }

  @Watch('unReadCount')
  private async refresh() {
    setTimeout(() => {
      this.getData()
    }, 500)
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
