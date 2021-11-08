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
        :label="$t('apiPage.path')"
        prop="path"
      >
        <el-input
          v-model.trim="table.form.path"
          :placeholder="$t('pleaseEnter') + $t('apiPage.path')"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('apiPage.method')"
        prop="method"
      >
        <el-select
          v-model.trim="table.form.method"
          :placeholder="$t('pleaseEnter') + $t('apiPage.method')"
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
        :label="$t('category')"
        prop="category"
      >
        <el-input
          v-model.trim="table.form.category"
          :placeholder="$t('pleaseEnter') + $t('category')"
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
          prop="path"
          :label="$t('apiPage.path')"
          sortable
        />
        <el-table-column
          prop="category"
          :label="$t('category')"
          sortable
        />
        <el-table-column
          prop="method"
          :label="$t('apiPage.method')"
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
          prop="desc"
          :label="$t('desc')"
        />
        <el-table-column
          fixed="right"
          :label="$t('operation')"
          align="center"
          width="180"
        >
          <template slot-scope="scope">
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

    <!-- 接口配置对话框 -->
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
          :label="$t('apiPage.path')"
          prop="path"
        >
          <el-input
            v-model.trim="updateDialog.form.path"
            :placeholder="$t('pleaseEnter') + $t('apiPage.path')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('category')"
          prop="category"
        >
          <el-input
            v-model.trim="updateDialog.form.category"
            :placeholder="$t('pleaseEnter') + $t('category')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('apiPage.method')"
          prop="method"
        >
          <el-select
            v-model.trim="updateDialog.form.method"
            :placeholder="$t('pleaseEnter') + $t('apiPage.method')"
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
          v-if="updateDialog.type===0"
          :label="$t('apiPage.showRoleSelect')"
          prop="showRoleSelect"
        >
          <el-switch
            v-model.trim="updateDialog.form.showRoleSelect"
          />
          <el-tag>{{ $t('apiPage.showRoleTips') }}</el-tag>
        </el-form-item>
        <el-form-item
          v-if="updateDialog.form.showRoleSelect"
          :label="$t('role')"
          prop="roleIds"
        >
          <el-select
            v-model.trim="updateDialog.form.roleIds"
            clearable
            filterable
            multiple
            :placeholder="$t('pleaseEnter') + $t('role')"
          >
            <el-option
              v-for="item in updateDialog.roleSelectOptions"
              :key="item.id"
              :label="item.name + '(' + item.desc + ')'"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('desc')"
          prop="desc"
        >
          <el-input
            v-model.trim="updateDialog.form.desc"
            type="textarea"
            :placeholder="$t('pleaseEnter') + $t('desc')"
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
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import Pagination from '@/components/Pagination/index.vue'
import { Form } from 'element-ui'
import { batchDeleteApi, createApi, findApi, updateApi } from '@/api/system/apis'
import { diffObjUpdate } from '@/utils/diff'
import { findRole } from '@/api/system/roles'
import { IdempotenceModule } from '@/store/modules/idempotence'

@Component({
  // 组件名称首字母需大写, 否则会报警告
  name: 'Api',
  components: {
    Pagination
  }
})
export default class extends Vue {
  private readonly defaultConfig: any = {
    pageNum: 1,
    pageSize: 5,
    methods: [{
      name: 'GET',
      label: `GET[${this.$t('apiPage.get').toString()}]`,
      type: ''
    }, {
      name: 'POST',
      label: `POST[${this.$t('apiPage.post').toString()}]`,
      type: 'success'
    }, {
      name: 'PUT',
      label: `PUT[${this.$t('apiPage.put').toString()}]`,
      type: 'info'
    }, {
      name: 'PATCH',
      label: `PATCH[${this.$t('apiPage.patch').toString()}]`,
      type: 'warning'
    }, {
      name: 'DELETE',
      label: `DELETE[${this.$t('apiPage.delete').toString()}]`,
      type: 'danger'
    }]
  }

  private validateCategory(rule: any, value: string, callback: Function) {
    if (!/^[a-zA-Z]/.test(value)) {
      callback(new Error(this.$t('userPage.validate[0]').toString()))
    } else if (!/^[a-zA-Z]([-_a-zA-Z0-9])+$/.test(value)) {
      callback(new Error(this.$t('userPage.validate[1]').toString()))
    } else {
      callback()
    }
  }

  private updateDialog: any = {
    loading: false,
    // 类型(0:创建, 1更新)
    type: 0,
    // 是否打开
    visible: false,
    // 标题
    title: '',
    // 角色选择参数
    roleSelectOptions: [],
    // 默认数据
    defaultForm: {
      id: 0,
      path: '',
      method: '',
      category: '',
      desc: '',
      showRoleSelect: false,
      roleIds: []
    },
    // 表单
    form: {},
    oldData: {},
    // 表单校验
    rules: {
      path: [
        { required: true, message: this.$t('apiPage.path').toString() + this.$t('required').toString(), trigger: 'blur' }
      ],
      method: [
        { required: true, message: this.$t('method').toString() + this.$t('required').toString(), trigger: 'blur' }
      ],
      category: [
        { required: true, message: this.$t('category').toString() + this.$t('required').toString(), trigger: 'blur' },
        { validator: this.validateCategory, trigger: 'blur' }
      ]
    }
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
      category: '',
      desc: ''
    }
  }

  created() {
    this.resetUpdateForm()
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
      const { data } = await findApi(params)
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

  private async doUpdate() {
    (this.$refs.updateForm as Form).validate(async(valid) => {
      if (valid) {
        if (this.updateDialog.type === 0) {
          try {
            this.updateDialog.loading = true
            await createApi(this.updateDialog.form)
          } finally {
            this.updateDialog.loading = false
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
            await updateApi(update.id, update)
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

  private async cancelUpdate() {
    // 关闭弹窗
    this.updateDialog.visible = false
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

  @Watch('updateDialog.form.showRoleSelect')
  private async showRoleSelectChange() {
    if (this.updateDialog.form.showRoleSelect) {
      try {
        // 读取当前角色
        const { data } = await findRole({
          noPagination: true
        })
        this.updateDialog.roleSelectOptions = data.list
      } catch (e) {
        this.$message.error(this.$t('readDataFail').toString())
      }
    }
  }

  private async handleUpdate(row: any) {
    // 清理字段
    this.resetUpdateForm()
    // 弹窗表单赋值
    this.updateDialog.form.id = row.id
    this.updateDialog.form.path = row.path
    this.updateDialog.form.method = row.method
    this.updateDialog.form.category = row.category
    this.updateDialog.form.creator = row.creator
    this.updateDialog.form.desc = row.desc
    // 记录旧数据
    this.updateDialog.oldData = JSON.parse(JSON.stringify(this.updateDialog.form))
    // 修改类型
    this.updateDialog.type = 1
    // 修改标题
    this.updateDialog.title = this.$t('update').toString()
    // 开启弹窗
    this.updateDialog.visible = true
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
      const msg = `${this.$t('sureToDo').toString()}${this.$t('del').toString()}${this.$t('api').toString()}[${paths.join(',')}], ${this.$t('irreversible').toString()}?`
      this.$confirm(msg, this.$t('caution').toString(), {
        confirmButtonText: this.$t('confirm').toString(),
        cancelButtonText: this.$t('cancel').toString(),
        type: 'warning'
      })
        .then(async() => {
          await batchDeleteApi(ids.join(','))
          this.getData()
        })
    }
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
