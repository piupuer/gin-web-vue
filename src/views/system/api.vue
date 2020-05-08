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
          v-model="table.form.path"
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
          v-model="table.form.method"
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
        label="所属类别"
        prop="category"
      >
        <el-input
          v-model="table.form.category"
          placeholder="所属类别"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        label="创建人"
        prop="creator"
      >
        <el-input
          v-model="table.form.creator"
          placeholder="创建人"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
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
            type="primary"
            icon="el-icon-plus"
            @click="handleCreate"
          >
            新增
          </el-button>
        </el-col>
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
          prop="path"
          label="访问路径"
          sortable
        />
        <el-table-column
          prop="category"
          label="所属类别"
          sortable
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
          prop="desc"
          label="说明"
        />
        <el-table-column
          prop="creator"
          label="创建人"
        />
        <el-table-column
          fixed="right"
          label="操作"
          align="center"
          width="180"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleUpdate(scope.row)"
            >
              编辑
            </el-button>
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
          label="访问路径"
          prop="path"
        >
          <el-input
            v-model="updateDialog.form.path"
            placeholder="请输入接口访问路径"
          />
        </el-form-item>
        <el-form-item
          label="所属类别"
          prop="category"
        >
          <el-input
            v-model="updateDialog.form.category"
            placeholder="请输入接口所属类别"
          />
        </el-form-item>
        <el-form-item
          label="请求方式"
          prop="method"
        >
          <el-select
            v-model="updateDialog.form.method"
            placeholder="请选择请求方式"
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
          label="说明"
          prop="desc"
        >
          <el-input
            v-model="updateDialog.form.desc"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          @click="doUpdate"
        >
          确 定
        </el-button>
        <el-button @click="cancelUpdate">
          取 消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Pagination from '@/components/Pagination/index.vue'
import { Form } from 'element-ui'
import { batchDeleteApi, createApi, getApis, updateApi } from '@/api/system/apis'
import { diffObjUpdate } from '@/utils/diff'

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
      label: 'GET[获取资源]',
      type: ''
    }, {
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

  private updateDialog: any = {
    // 类型(0:创建, 1更新)
    type: 0,
    // 是否打开
    visible: false,
    // 标题
    title: '',
    // 默认数据
    defaultForm: {
      id: 0,
      path: '',
      method: '',
      category: '',
      desc: ''
    },
    // 表单
    form: {},
    oldData: {},
    // 表单校验
    rules: {
      path: [
        { required: true, message: '访问路径不能为空', trigger: 'blur' }
      ],
      method: [
        { required: true, message: '请求方式不能为空', trigger: 'blur' }
      ],
      category: [
        { required: true, message: '所属类别不能为空', trigger: 'blur' }
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
  }

  private async getData() {
    this.table.loading = true
    const params: any = {
      ...this.table.form,
      pageNum: this.table.pageNum,
      pageSize: this.table.pageSize
    }
    if (params.status === '') {
      delete params.status
    }
    const { data } = await getApis(params)
    this.table.list = data.list
    this.table.pageNum = data.pageNum
    this.table.pageSize = data.pageSize
    this.table.total = data.total
    this.table.loading = false
  }

  private async doSearch() {
    this.getData()
  }

  private async doUpdate() {
    (this.$refs.updateForm as Form).validate(async(valid) => {
      if (valid) {
        if (this.updateDialog.type === 0) {
          await createApi(this.updateDialog.form)
        } else {
          const update = diffObjUpdate(this.updateDialog.oldData, this.updateDialog.form)
          // 编号存在则更新, 不存在给出提示
          if (!update.id) {
            this.$message({
              type: 'warning',
              message: '数据没有发生变化, 请重新输入~'
            })
            return
          }
          await updateApi(update.id, update)
        }
        // 关闭弹窗
        this.updateDialog.visible = false
        // 重新查询
        this.getData()
        // 清理字段
        this.resetUpdateForm()
        this.$notify({
          title: '恭喜',
          message: `${this.updateDialog.type === 0 ? '创建' : '更新'}接口成功`,
          type: 'success',
          duration: 2000
        })
      }
    })
  }

  private async resetUpdateForm() {
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
    this.updateDialog.title = '创建新接口'
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async handleUpdate(row: any) {
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
    this.updateDialog.title = '修改接口信息'
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
      const msg = `确定要删除接口[${paths.join(',')}]吗, 此操作不可逆?`
      this.$confirm(msg, '请谨慎操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
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
