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
        label="名称"
        prop="path"
      >
        <el-input
          v-model.trim="table.form.name"
          placeholder="名称"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        label="类别"
        prop="category"
      >
        <el-select
          v-model.trim="table.form.category"
          clearable
          placeholder="所属类别"
        >
          <el-option
            key="1"
            label="每一层级只需一人批准"
            :value="1"
          />
          <el-option
            key="2"
            label="每一层级必须全部人批准"
            :value="2"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="提交人确认"
        prop="submitUserConfirm"
      >
        <el-select
          v-model.trim="table.form.submitUserConfirm"
          clearable
          placeholder="提交人确认"
        >
          <el-option
            key="1"
            label="是"
            :value="1"
          />
          <el-option
            key="0"
            label="否"
            :value="0"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="目标类别"
        prop="targetCategory"
      >
        <el-select
          v-model.trim="table.form.targetCategory"
          clearable
          placeholder="所属目标类别"
        >
          <el-option
            key="1"
            label="请假流程"
            :value="1"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="自我审批"
        prop="self"
      >
        <el-select
          v-model.trim="table.form.self"
          clearable
          placeholder="自我审批"
        >
          <el-option
            key="1"
            label="开启"
            :value="1"
          />
          <el-option
            key="0"
            label="关闭"
            :value="0"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="创建人"
        prop="creator"
      >
        <el-input
          v-model.trim="table.form.creator"
          placeholder="创建人"
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
          prop="name"
          label="名称"
          sortable
        />
        <el-table-column
          prop="uuid"
          label="唯一标识"
        />
        <el-table-column
          prop="category"
          label="类别"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.category === 1"
            >
              {{ '一人' }}
            </el-tag>
            <el-tag
              v-else-if="scope.row.category === 2"
            >
              {{ '所有人' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="submitUserConfirm"
          label="提交人确认"
        >
          <template slot-scope="scope">
            <el-switch
              v-model.trim="scope.row.submitUserConfirm"
              :active-value="1"
              :inactive-value="0"
              @change="handleSubmitUserConfirmChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="self"
          label="自我审批"
        >
          <template slot-scope="scope">
            <el-switch
              v-model.trim="scope.row.self"
              :active-value="1"
              :inactive-value="0"
              @change="handleSelfChange(scope.row)"
            />
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
          width="240"
        >
          <template slot-scope="scope">
            <el-button
              type="primary"
              @click="handleLine(scope.row)"
            >
              流水线
            </el-button>
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

    <!-- 更新对话框 -->
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
          label="名称"
          prop="name"
        >
          <el-input
            v-model.trim="updateDialog.form.name"
            placeholder="请输入流程名称"
          />
        </el-form-item>
        <el-form-item
          label="类别"
          prop="category"
        >
          <el-select
            v-model.trim="updateDialog.form.category"
            clearable
            placeholder="请选择流程所属类别"
          >
            <el-option
              key="1"
              label="每一层级只需一人批准"
              :value="1"
            />
            <el-option
              key="2"
              label="每一层级必须全部人批准"
              :value="2"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="目标类别"
          prop="targetCategory"
        >
          <el-select
            v-model.trim="updateDialog.form.targetCategory"
            clearable
            placeholder="请选择流程所属目标类别"
          >
            <el-option
              key="1"
              label="请假流程"
              :value="1"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="提交人确认"
          prop="submitUserConfirm"
        >
          <el-switch
            v-model.trim="updateDialog.form.submitUserConfirm"
            :active-value="1"
            :inactive-value="0"
            active-text="开启"
            inactive-text="关闭"
          />
        </el-form-item>
        <el-form-item
          label="自我审批"
          prop="self"
        >
          <el-switch
            v-model.trim="updateDialog.form.self"
            :active-value="1"
            :inactive-value="0"
            active-text="开启"
            inactive-text="关闭"
          />
        </el-form-item>
        <el-form-item
          label="说明"
          prop="desc"
        >
          <el-input
            v-model.trim="updateDialog.form.desc"
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
          :loading="updateDialog.loading"
          @click="doUpdate"
        >
          确 定
        </el-button>
        <el-button @click="cancelUpdate">
          取 消
        </el-button>
      </div>
    </el-dialog>

    <!-- 流水线对话框 -->
    <el-dialog
      :title="lineDialog.title"
      :visible.sync="lineDialog.visible"
      width="500px"
    >
      <el-form
        v-for="(line, index) in lineDialog.form.lines"
        ref="lineForm"
        :key="index"
        :data-ref="'lineForm' + index"
        class="line-form"
        :rules="lineDialog.rules"
        :model="line"
      >
        <div class="line-form-title">
          <span>第{{ index+1 }}级审批：</span>
          <i
            class="el-icon-delete line-form-delete"
            @click="lineDelete(index)"
          />
        </div>

        <el-form-item
          label="名称"
          prop="name"
        >
          <el-input
            v-model.trim="line.name"
            placeholder="请输入当前审批流水线名称"
            clearable
          />
        </el-form-item>
        <el-form-item
          label="类型"
          prop="roleBase"
        >
          <el-switch
            v-model.trim="line.roleBase"
            :active-value="1"
            :inactive-value="0"
            active-text="指定角色"
            inactive-text="指定用户"
            @change="handleRoleBaseChange(index)"
          />
        </el-form-item>
        <el-form-item
          v-if="line.roleBase == 1"
          label="角色"
          prop="roleId"
        >
          <el-select
            v-model="line.roleId"
            filterable
            default-first-option
            placeholder="请选择审批人所属角色"
          >
            <el-option
              v-for="item in line.roleSelectOptions"
              :key="item.id"
              :label="item.name + '(' + item.desc + ')'"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-else
          label="用户"
          prop="userIds"
        >
          <el-select
            v-model="line.userIds"
            multiple
            filterable
            default-first-option
            placeholder="请选择具体审批人"
          >
            <el-option
              v-for="item in line.userSelectOptions"
              :key="item.id"
              :label="item.nickname + '(用户名: ' + item.username + ', 手机号: ' + item.mobile + ')'"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="编辑权限"
          prop="edit"
        >
          <el-switch
            v-model.trim="line.edit"
            :active-value="1"
            :inactive-value="0"
            active-text="开启"
            inactive-text="关闭"
          />
        </el-form-item>
      </el-form>
      <div class="line-form-plus-box">
        <i
          class="el-icon-circle-plus-outline line-form-plus"
          @click="lineCreate"
        />
      </div>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          :loading="lineDialog.loading"
          @click="doLine"
        >
          确 定
        </el-button>
        <el-button @click="cancelLine">
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
import {
  batchDeleteWorkflow,
  createWorkflow,
  getWorkflowLines,
  getWorkflows,
  updateWorkflow,
  updateWorkflowLine
} from '@/api/system/workflows'
import { diffArrUpdate, diffObjUpdate } from '@/utils/diff'
import { getRoles } from '@/api/system/roles'
import { getUsers } from '@/api/system/users'
import { IdempotenceModule } from '@/store/modules/idempotence'

@Component({
  // 组件名称首字母需大写, 否则会报警告
  name: 'Workflow',
  components: {
    Pagination
  }
})
export default class extends Vue {
  private readonly defaultConfig: any = {
    pageNum: 1,
    pageSize: 5,
    line: {
      roleBase: 1,
      name: '',
      edit: 1,
      roleId: '',
      userIds: []
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
    // 默认数据
    defaultForm: {
      id: 0,
      name: '',
      submitUserConfirm: false,
      self: false,
      category: '',
      targetCategory: '',
      desc: '',
      creator: ''
    },
    // 表单
    form: {},
    oldData: {},
    // 表单校验
    rules: {
      name: [
        { required: true, message: '流程名称不能为空', trigger: 'blur' }
      ],
      method: [
        { required: true, message: '请求方式不能为空', trigger: 'blur' }
      ],
      category: [
        { required: true, message: '类别不能为空', trigger: 'blur' }
      ],
      targetCategory: [
        { required: true, message: '目标类别不能为空', trigger: 'blur' }
      ]
    }
  }

  private lineDialog: any = {
    loading: false,
    // 是否打开
    visible: false,
    // 标题
    title: '流水线配置',
    // 角色选择参数
    roleSelectOptions: [],
    // 用户选择参数
    userSelectOptions: [],
    // 默认数据
    defaultForm: {
      flowId: 0,
      lines: []
    },
    // 表单
    form: {},
    oldData: {},
    // 表单校验
    rules: {
      name: [
        { required: true, message: '流水线名称不能为空(尽量简单通俗易懂)', trigger: 'blur' }
      ],
      roleId: [
        { required: true, message: '审批角色不能为空', trigger: 'blur' }
      ],
      userIds: [
        { required: true, message: '审批用户不能为空', trigger: 'blur' }
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
      name: '',
      submitUserConfirm: '',
      self: '',
      category: '',
      targetCategory: '',
      desc: '',
      creator: ''
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
      if (params.submitUserConfirm === '') {
        delete params.submitUserConfirm
      }
      if (params.self === '') {
        delete params.self
      }
      const { data } = await getWorkflows(params)
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
            await createWorkflow(this.updateDialog.form)
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
              message: '数据没有发生变化, 请重新输入~'
            })
            return
          }
          try {
            this.updateDialog.loading = true
            await updateWorkflow(update.id, update)
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
        this.$notify({
          title: '恭喜',
          message: `${this.updateDialog.type === 0 ? '创建' : '更新'}流程成功`,
          type: 'success',
          duration: 2000
        })
      }
    })
  }

  private async resetUpdateForm() {
    this.$nextTick(() => {
      // 重置校验信息
      const form = this.$refs.updateForm as Form
      if (form) {
        form.clearValidate()
      }
    })
    this.updateDialog.form = JSON.parse(JSON.stringify(this.updateDialog.defaultForm))
  }

  private async resetLineForm() {
    this.$nextTick(() => {
      const len = this.lineDialog.form.lines.length
      for (let i = 0; i < len; i++) {
        const form: any = this.$refs.lineForm
        if (form[i] && form[i].clearValidate) {
          form[i].clearValidate()
        }
      }
    })
    this.lineDialog.form = JSON.parse(JSON.stringify(this.lineDialog.defaultForm))
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
    this.updateDialog.title = '创建新流程'
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async handleUpdate(row: any) {
    // 清理字段
    this.resetUpdateForm()
    // 弹窗表单赋值
    this.updateDialog.form.id = row.id
    this.updateDialog.form.name = row.name
    this.updateDialog.form.submitUserConfirm = row.submitUserConfirm
    this.updateDialog.form.self = row.self
    this.updateDialog.form.category = row.category
    this.updateDialog.form.targetCategory = row.targetCategory
    this.updateDialog.form.creator = row.creator
    this.updateDialog.form.desc = row.desc
    // 记录旧数据
    this.updateDialog.oldData = JSON.parse(JSON.stringify(this.updateDialog.form))
    // 修改类型
    this.updateDialog.type = 1
    // 修改标题
    this.updateDialog.title = '修改流程信息'
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async handleLine(row: any) {
    // 清理字段
    this.resetLineForm()
    try {
      // 读取所有角色
      const { data } = await getRoles({
        noPagination: true
      })
      this.lineDialog.roleSelectOptions = data.list
    } catch (e) {
      this.$message.error('读取系统角色信息失败')
      return
    }
    try {
      // 读取所有用户
      const { data } = await getUsers({
        noPagination: true
      })
      this.lineDialog.userSelectOptions = data.list
    } catch (e) {
      this.$message.error('读取系统用户信息失败')
      return
    }
    try {
      // 读取所有流水线
      const { data } = await getWorkflowLines({
        flowId: row.id,
        noPagination: true
      })
      const lines: any [] = []
      for (let i = 0, len = data.list.length; i < len; i++) {
        const line = data.list[i]
        const newLine = JSON.parse(JSON.stringify(this.defaultConfig.line))
        if (line.roleId > 0) {
          newLine.roleId = line.roleId
        } else {
          newLine.roleBase = false
          // 将用户转为id集合
          const userIds: any[] = []
          for (let j = 0, len2 = line.userIds.length; j < len2; j++) {
            userIds.push(line.userIds[j])
          }
          newLine.userIds = userIds
        }
        newLine.id = line.id
        newLine.name = line.name
        newLine.edit = line.edit
        lines.push({
          ...newLine,
          roleSelectOptions: JSON.parse(JSON.stringify(this.lineDialog.roleSelectOptions)),
          userSelectOptions: JSON.parse(JSON.stringify(this.lineDialog.userSelectOptions))
        })
      }
      this.lineDialog.form.lines = lines
    } catch (e) {
      this.$message.error('读取流水线信息失败')
      return
    }
    // 弹窗表单赋值
    this.lineDialog.form.flowId = row.id
    // 记录旧数据
    this.lineDialog.oldData = JSON.parse(JSON.stringify(this.lineDialog.form))
    // 开启弹窗
    this.lineDialog.visible = true
  }

  // 改变角色/用户类型
  private async handleRoleBaseChange(index: number) {
    const roleBase = this.lineDialog.form.lines[index].roleBase
    if (roleBase) {
      // 选中角色, 清空userIds
      this.lineDialog.form.lines[index].userIds = []
    } else {
      // 选中用户, 清空role
      this.lineDialog.form.lines[index].roleId = ''
    }
  }

  private async lineCreate() {
    // 新增元素
    this.lineDialog.form.lines.push({
      ...this.defaultConfig.line,
      roleSelectOptions: JSON.parse(JSON.stringify(this.lineDialog.roleSelectOptions)),
      userSelectOptions: JSON.parse(JSON.stringify(this.lineDialog.userSelectOptions))
    })
  }

  private async lineDelete(index: number) {
    // 移除元素
    this.lineDialog.form.lines.splice(index, 1)
  }

  private async doLine() {
    const len = this.lineDialog.form.lines.length
    // 校验所有表单, 一个不通过都不提交数据
    let validCount = 0
    for (let i = 0; i < len; i++) {
      const form: any = this.$refs.lineForm
      if (form[i] && form[i].validate) {
        form[i].validate(async(valid: boolean) => {
          if (valid) {
            validCount++
          }
        })
      }
    }
    if (validCount === len) {
      const diff = diffArrUpdate(this.lineDialog.oldData.lines, this.lineDialog.form.lines)
      if (diff.create.length === 0 && diff.update.length === 0 && diff.delete.length === 0) {
        this.$message({
          type: 'warning',
          message: '数据没有发生变化, 请重新输入~'
        })
        return
      }
      // roleId为空时设置为0
      for (let i = 0, l1 = diff.create.length; i < l1; i++) {
        if (diff.create[i].roleId === '') {
          diff.create[i].roleId = 0
        }
      }
      for (let j = 0, l2 = diff.update.length; j < l2; j++) {
        if (diff.update[j].roleId === '') {
          diff.update[j].roleId = 0
        }
      }
      for (let k = 0, l3 = diff.delete.length; k < l3; k++) {
        if (diff.delete[k].roleId === '') {
          diff.delete[k].roleId = 0
        }
      }
      // 构建参数
      const params = {
        flowId: this.lineDialog.form.flowId,
        ...diff
      }
      try {
        this.lineDialog.loading = true
        await updateWorkflowLine(params)
      } finally {
        this.lineDialog.loading = false
      }
      // 关闭弹窗
      this.lineDialog.visible = false
      // 重新查询
      this.getData()
      // 清理字段
      this.resetLineForm()
      this.$notify({
        title: '恭喜',
        message: `${this.lineDialog.type === 0 ? '创建' : '更新'}流程流水线成功`,
        type: 'success',
        duration: 2000
      })
    }
  }

  private async cancelLine() {
    // 关闭弹窗
    this.lineDialog.visible = false
  }

  private handleDelete(row: any) {
    this.batchDelete([row])
  }

  private handleBatchDelete() {
    this.batchDelete(this.table.selection)
  }

  private async batchDelete(rows: any) {
    const ids: number[] = []
    const names: string[] = []
    for (let i = 0, len = rows.length; i < len; i++) {
      const row = rows[i]
      ids.push(row.id)
      names.push(row.name)
    }
    if (ids.length > 0) {
      const msg = `确定要删除流程[${names.join(',')}]吗, 此操作不可逆?`
      this.$confirm(msg, '请谨慎操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await batchDeleteWorkflow(ids.join(','))
          this.getData()
        })
    }
  }

  // 改变
  private async handleSubmitUserConfirmChange(row: any) {
    let msg = `确定要恢复流程[${row.name}][提交人确认]吗?`
    if (row.submitUserConfirm == 0) {
      msg = `确定要禁用流程[${row.name}][提交人确认]吗?`
    }
    this.$confirm(msg, '请谨慎操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async() => {
        await updateWorkflow(row.id, {
          submitUserConfirm: row.submitUserConfirm
        })
        this.getData()
      })
      .catch(() => {
        row.submitUserConfirm = row.submitUserConfirm == 0 ? 1 : 0
      })
  }

  private async handleSelfChange(row: any) {
    let msg = `确定要恢复流程[${row.name}][自我审批]吗?`
    if (row.self == 0) {
      msg = `确定要禁用流程[${row.name}][自我审批]吗?`
    }
    this.$confirm(msg, '请谨慎操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async() => {
        await updateWorkflow(row.id, {
          self: row.self
        })
        this.getData()
      })
      .catch(() => {
        row.self = row.self == 0 ? 1 : 0
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
}
</script>
<style lang="scss" scoped>
  .app-container {
    .el-row {
      margin-bottom: 15px;
    }
    .line-form {
      margin-top: 15px;
      border-radius: 5px;
      border: 1px dashed #efefef;
      .line-form-title {
        margin: 15px 15px 0 15px;
        font-size: 15px;
        font-weight: bold;
        color: #666;
      }
      .el-form-item {
        margin: 10px 20px;
      }
      .line-form-delete {
        float: right;
      }
    }
    .line-form-delete, .line-form-plus {
      cursor: pointer;
    }
    .line-form-plus-box {
      margin-top: 20px;
      font-size: 25px;
      text-align: center;
    }
  }
</style>
