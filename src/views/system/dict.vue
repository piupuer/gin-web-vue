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
        :label="$t('name')"
        prop="name"
      >
        <el-input
          v-model.trim="table.form.name"
          :placeholder="$t('pleaseEnter') + $t('name')"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('status')"
        prop="status"
      >
        <el-select
          v-model.trim="table.form.status"
          clearable
          :placeholder="$t('pleaseEnter') + $t('status')"
        >
          <el-option
            key="1"
            :label="$t('available')"
            :value="1"
          />
          <el-option
            key="0"
            :label="$t('disabled')"
            :value="0"
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
            icon="el-icon-plus"
            @click="handleCreate"
          >
            {{ $t('create') }}
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
          prop="name"
          :label="$t('name')"
          sortable
        />
        <el-table-column
          prop="desc"
          :label="$t('desc')"
        />
        <el-table-column
          prop="status"
          :label="$t('status')"
        >
          <template slot-scope="scope">
            <el-switch
              v-model.trim="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          :label="$t('operation')"
          align="center"
          width="300"
        >
          <template slot-scope="scope">
            <el-button
              type="primary"
              @click="handleDictData(scope.row)"
            >
              {{ $t('dictPage.dictData') }}
            </el-button>
            <el-button
              @click="handleUpdate(scope.row)"
            >
              {{ $t('edit') }}
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

    <el-dialog
      :title="updateDialog.title"
      :visible.sync="updateDialog.visible"
      width="500px"
    >
      <el-form
        ref="updateForm"
        :model="updateDialog.form"
        :rules="updateDialog.rules"
        label-width="80px"
      >
        <el-form-item
          :label="$t('name')"
          prop="name"
        >
          <el-input
            v-model.trim="updateDialog.form.name"
            :placeholder="$t('pleaseEnter') + $t('name')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('desc')"
          prop="desc"
        >
          <el-input
            v-model.trim="updateDialog.form.desc"
            :placeholder="$t('pleaseEnter') + $t('desc')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('status')"
          prop="status"
        >
          <el-switch
            v-model.trim="updateDialog.form.status"
            :active-value="1"
            :inactive-value="0"
            :active-text="$t('available')"
            :inactive-text="$t('disabled')"
          />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          :loading="updateDialog.loading"
          @click="doUpdate"
        >
          {{ $t('confirm') }}
        </el-button>
        <el-button @click="cancelUpdate">
          {{ $t('cancel') }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="dictDataDialog.title"
      :visible.sync="dictDataDialog.visible"
      custom-class="dict-dialog"
      width="1200px"
    >
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="handleDataCreate"
          >
            {{ $t('create') }}
          </el-button>
        </el-col>
      </el-row>
      <el-table
        :data="dataTable.list"
        style="width: 100%;margin-bottom: 20px;"
        row-key="id"
        border
        stripe
      >
        <el-table-column
          prop="key"
          :label="$t('key')"
        />
        <el-table-column
          prop="val"
          :label="$t('val')"
        />
        <el-table-column
          prop="addition"
          :label="$t('addition')"
        />
        <el-table-column
          prop="sort"
          :label="$t('sort')"
        />
        <el-table-column
          prop="status"
          :label="$t('status')"
        >
          <template slot-scope="scope">
            <el-switch
              v-model.trim="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleDataStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          :label="$t('operation')"
          align="center"
          width="300"
        >
          <template slot-scope="scope">
            <el-button
              @click="handleDataUpdate(scope.row)"
            >
              {{ $t('edit') }}
            </el-button>
            <el-button
              type="danger"
              @click="handleDataDelete(scope.row)"
            >
              {{ $t('del') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="dataTable.pageNum"
        :page-sizes="[1, 5, 20, 50]"
        :page-size="dataTable.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="dataTable.total"
        background
        @size-change="handleDataPagSizeChange"
        @current-change="handleDataPageNumChange"
      />
    </el-dialog>

    <el-dialog
      :title="dataUpdateDialog.title"
      :visible.sync="dataUpdateDialog.visible"
      width="500px"
    >
      <el-form
        ref="dataUpdateForm"
        :model="dataUpdateDialog.form"
        :rules="dataUpdateDialog.rules"
        label-width="80px"
      >
        <el-form-item
          :label="$t('key')"
          prop="key"
        >
          <el-input
            v-model.trim="dataUpdateDialog.form.key"
            :placeholder="$t('pleaseEnter') + $t('key')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('val')"
          prop="val"
        >
          <el-input
            v-model.trim="dataUpdateDialog.form.val"
            :placeholder="$t('pleaseEnter') + $t('val')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('addition')"
          prop="addition"
        >
          <el-input
            v-model.trim="dataUpdateDialog.form.addition"
            :placeholder="$t('pleaseEnter') + $t('addition')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('sort')"
          prop="sort"
        >
          <el-input
            v-model.trim="dataUpdateDialog.form.sort"
            :placeholder="$t('pleaseEnter') + $t('sort')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('status')"
          prop="status"
        >
          <el-switch
            v-model.trim="dataUpdateDialog.form.status"
            :active-value="1"
            :inactive-value="0"
            :active-text="$t('available')"
            :inactive-text="$t('disabled')"
          />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          :loading="updateDialog.loading"
          @click="doDataUpdate"
        >
          {{ $t('confirm') }}
        </el-button>
        <el-button @click="cancelDataUpdate">
          {{ $t('cancel') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Pagination from '@/components/Pagination/index.vue'
import { Form } from 'element-ui'
import {
  batchDeleteDict, batchDeleteDictData,
  createDict,
  createDictData,
  findDict,
  findDictData,
  updateDict,
  updateDictData
} from '@/api/system/dicts'
import { diffObjUpdate } from '@/utils/diff'
import { IdempotenceModule } from '@/store/modules/idempotence'

@Component({
  name: 'Dict',
  components: {
    Pagination
  }
})
export default class extends Vue {
  private readonly defaultConfig: any = {
    pageNum: 1,
    pageSize: 5
  }

  private updateDialog: any = {
    loading: false,
    // 类型(0:创建, 1更新)
    type: 0,
    // 是否打开
    visible: false,
    // 标题
    title: '',
    // 默认数据
    defaultForm: {
      id: 0,
      name: '',
      desc: '',
      status: 1
    },
    // 表单
    form: {},
    oldData: {},
    // 表单校验
    rules: {
      name: [
        { required: true, message: this.$t('name').toString() + this.$t('required').toString(), trigger: 'blur' }
      ],
      desc: [
        { required: true, message: this.$t('desc').toString() + this.$t('required').toString(), trigger: 'blur' }
      ]
    }
  }

  private dataUpdateDialog: any = {
    loading: false,
    type: 0,
    visible: false,
    title: '',
    defaultForm: {
      id: 0,
      key: '',
      val: '',
      addition: '',
      sort: 0,
      status: 1
    },
    form: {},
    oldData: {},
    rules: {
      key: [
        { required: true, message: this.$t('key').toString() + this.$t('required').toString(), trigger: 'blur' }
      ],
      val: [
        { required: true, message: this.$t('val').toString() + this.$t('required').toString(), trigger: 'blur' }
      ]
    }
  }

  private dictDataDialog: any = {
    loading: false,
    title: this.$t('dictPage.dictDialogTitle').toString(),
    visible: false,
    dictId: 0
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
      name: '',
      desc: '',
      status: ''
    }
  }

  private dataTable: any = {
    loading: false,
    list: [],
    pageNum: 1,
    pageSize: 5,
    total: 0,
    form: {
      dictId: '',
      key: '',
      val: '',
      addition: '',
      sort: ''
    }
  }

  created() {
    this.resetUpdateForm()
    this.resetDataUpdateForm()
    this.getData()
    IdempotenceModule.RefreshIdempotenceToken()
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
      const { data } = await findDict(params)
      this.table.list = data.list
      this.table.pageNum = data.pageNum
      this.table.pageSize = data.pageSize
      this.table.total = data.total
    } finally {
      this.table.loading = false
    }
  }

  private async getDictData() {
    this.dataTable.loading = true
    try {
      const params: any = {
        ...this.dataTable.form,
        pageNum: this.dataTable.pageNum,
        pageSize: this.dataTable.pageSize
      }
      if (params.status === '') {
        delete params.status
      }
      params.dictId = this.dictDataDialog.dictId
      const { data } = await findDictData(params)
      this.dataTable.list = data.list
      this.dataTable.pageNum = data.pageNum
      this.dataTable.pageSize = data.pageSize
      this.dataTable.total = data.total
    } finally {
      this.dataTable.loading = false
    }
  }

  private async doSearch() {
    this.getData()
  }

  private async doUpdate() {
    (this.$refs.updateForm as Form).validate(async(valid) => {
      if (valid) {
        if (this.updateDialog.type === 0) {
          try {
            this.updateDialog.loading = true
            await createDict(this.updateDialog.form)
          } finally {
            this.updateDialog.loading = false
            // 刷新token
            IdempotenceModule.RefreshIdempotenceToken()
          }
        } else {
          const update = diffObjUpdate(this.updateDialog.oldData, this.updateDialog.form)
          // 编号存在则更新, 不存在给出提示
          if (!update.id) {
            this.$message({
              type: 'warning',
              message: this.$t('noDiff').toString()
            })
            return
          }
          try {
            this.updateDialog.loading = true
            await updateDict(update.id, update)
          } finally {
            this.updateDialog.loading = false
          }
        }
        // 关闭弹窗
        this.updateDialog.visible = false
        // 重新查询
        this.getData()
        // 清理字段
        this.resetUpdateForm()
        const message = this.updateDialog.type === 0 ? this.$t('create').toString() : this.$t('update').toString()
        this.$notify({
          title: this.$t('congratulations').toString(),
          message: message + this.$t('success').toString(),
          type: 'success',
          duration: 2000
        })
      }
    })
  }

  private async doDataUpdate() {
    (this.$refs.dataUpdateForm as Form).validate(async(valid) => {
      if (valid) {
        if (this.dataUpdateDialog.type === 0) {
          try {
            this.dataUpdateDialog.loading = true
            await createDictData(this.dataUpdateDialog.form)
          } finally {
            this.dataUpdateDialog.loading = false
            // 刷新token
            IdempotenceModule.RefreshIdempotenceToken()
          }
        } else {
          const update = diffObjUpdate(this.dataUpdateDialog.oldData, this.dataUpdateDialog.form)
          // 编号存在则更新, 不存在给出提示
          if (!update.id) {
            this.$message({
              type: 'warning',
              message: this.$t('noDiff').toString()
            })
            return
          }
          try {
            this.dataUpdateDialog.loading = true
            await updateDictData(update.id, update)
          } finally {
            this.dataUpdateDialog.loading = false
          }
        }
        // 关闭弹窗
        this.dataUpdateDialog.visible = false
        // 重新查询
        this.getDictData()
        // 清理字段
        this.resetDataUpdateForm()
        const message = this.dataUpdateDialog.type === 0 ? this.$t('create').toString() : this.$t('update').toString()
        this.$notify({
          title: this.$t('congratulations').toString(),
          message: message + this.$t('success').toString(),
          type: 'success',
          duration: 2000
        })
      }
    })
  }

  private resetUpdateForm() {
    this.$nextTick(() => {
      // 重置校验信息
      const form = this.$refs.updateForm as Form
      if (form) {
        form.clearValidate()
      }
    })
    this.updateDialog.form = JSON.parse(JSON.stringify(this.updateDialog.defaultForm))
  }

  private resetDataUpdateForm() {
    this.$nextTick(() => {
      // 重置校验信息
      const form = this.$refs.dataUpdateForm as Form
      if (form) {
        form.clearValidate()
      }
    })
    this.dataUpdateDialog.form = JSON.parse(JSON.stringify(this.dataUpdateDialog.defaultForm))
  }

  private async cancelUpdate() {
    // 关闭弹窗
    this.updateDialog.visible = false
  }

  private async cancelDataUpdate() {
    this.dataUpdateDialog.visible = false
  }

  private async handleCreate() {
    // 之前的类型为更新
    if (this.updateDialog.type === 1) {
      // 清理字段
      this.resetUpdateForm()
    }
    // 修改类型
    this.updateDialog.type = 0
    // 修改标题
    this.updateDialog.title = this.$t('create').toString()
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async handleDataCreate() {
    if (this.dataUpdateDialog.type === 1) {
      this.resetDataUpdateForm()
    }
    this.dataUpdateDialog.form.dictId = this.dictDataDialog.dictId
    this.dataUpdateDialog.type = 0
    this.dataUpdateDialog.title = this.$t('create').toString()
    this.dataUpdateDialog.visible = true
  }

  private async handleDictData(row: any) {
    this.dictDataDialog.dictId = row.id
    this.getDictData()
    this.dictDataDialog.visible = true
  }

  private async handleUpdate(row: any) {
    // 清理字段
    this.resetUpdateForm()
    // 弹窗表单赋值
    this.updateDialog.form.id = row.id
    this.updateDialog.form.name = row.name
    this.updateDialog.form.desc = row.desc
    this.updateDialog.form.status = row.status
    // 记录旧数据
    this.updateDialog.oldData = JSON.parse(JSON.stringify(this.updateDialog.form))
    // 修改类型
    this.updateDialog.type = 1
    // 修改标题
    this.updateDialog.title = this.$t('update').toString()
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async handleDataUpdate(row: any) {
    this.resetDataUpdateForm()
    this.dataUpdateDialog.form.id = row.id
    this.dataUpdateDialog.form.dictId = row.dictId
    this.dataUpdateDialog.form.key = row.key
    this.dataUpdateDialog.form.val = row.val
    this.dataUpdateDialog.form.addition = row.addition
    this.dataUpdateDialog.form.sort = row.sort
    this.dataUpdateDialog.form.status = row.status
    this.dataUpdateDialog.oldData = JSON.parse(JSON.stringify(this.dataUpdateDialog.form))
    this.dataUpdateDialog.type = 1
    this.dataUpdateDialog.title = this.$t('update').toString()
    this.dataUpdateDialog.visible = true
  }

  private handleDelete(row: any) {
    this.batchDelete([row])
  }

  private handleDataDelete(row: any) {
    this.batchDataDelete([row])
  }

  private handleBatchDelete() {
    this.batchDelete(this.table.selection)
  }

  private async batchDelete(rows: any) {
    const ids: number[] = []
    const list: string[] = []
    for (let i = 0, len = rows.length; i < len; i++) {
      const row = rows[i]
      ids.push(row.id)
      list.push(row.name)
    }
    if (ids.length > 0) {
      const msg = `${this.$t('sureToDo').toString()}${this.$t('del').toString()}${this.$t('dictPage.dict').toString()}[${list.join(',')}], ${this.$t('irreversible').toString()}?`
      this.$confirm(msg, this.$t('caution').toString(), {
        confirmButtonText: this.$t('confirm').toString(),
        cancelButtonText: this.$t('cancel').toString(),
        type: 'warning'
      })
        .then(async() => {
          await batchDeleteDict(ids.join(','))
          this.getData()
        })
    }
  }

  private async batchDataDelete(rows: any) {
    const ids: number[] = []
    const list: string[] = []
    for (let i = 0, len = rows.length; i < len; i++) {
      const row = rows[i]
      ids.push(row.id)
      list.push(row.key)
    }
    if (ids.length > 0) {
      const msg = `${this.$t('sureToDo').toString()}${this.$t('del').toString()}${this.$t('dictPage.dictData').toString()}[${list.join(',')}], ${this.$t('irreversible').toString()}?`
      this.$confirm(msg, this.$t('caution').toString(), {
        confirmButtonText: this.$t('confirm').toString(),
        cancelButtonText: this.$t('cancel').toString(),
        type: 'warning'
      })
        .then(async() => {
          await batchDeleteDictData(ids.join(','))
          this.getDictData()
        })
    }
  }

  private async handleStatusChange(row: any) {
    let msg = `${this.$t('sureToDo').toString()}${this.$t('recovery').toString()}[${row.name}]?`
    if (row.status === 0) {
      msg = `${this.$t('sureToDo').toString()}${this.$t('disabled').toString()}[${row.name}]?`
    }
    this.$confirm(msg, this.$t('caution').toString(), {
      confirmButtonText: this.$t('confirm').toString(),
      cancelButtonText: this.$t('cancel').toString(),
      type: 'warning'
    })
      .then(async() => {
        await updateDict(row.id, {
          status: row.status
        })
        this.getData()
      })
      .catch(() => {
        row.status = row.status === 0 ? 1 : 0
      })
  }

  private async handleDataStatusChange(row: any) {
    let msg = `${this.$t('sureToDo').toString()}${this.$t('recovery').toString()}[${row.key}]?`
    if (row.status === 0) {
      msg = `${this.$t('sureToDo').toString()}${this.$t('disabled').toString()}[${row.key}]?`
    }
    this.$confirm(msg, this.$t('caution').toString(), {
      confirmButtonText: this.$t('confirm').toString(),
      cancelButtonText: this.$t('cancel').toString(),
      type: 'warning'
    })
      .then(async() => {
        await updateDictData(row.id, {
          status: row.status
        })
        this.getDictData()
      })
      .catch(() => {
        row.status = row.status === 0 ? 1 : 0
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

  private handleDataPagSizeChange(val: number) {
    this.dataTable.pageSize = val
    this.getDictData()
  }

  private handleDataPageNumChange(val: number) {
    this.dataTable.pageNum = val
    this.getDictData()
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
