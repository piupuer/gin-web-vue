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
        label="说明"
        prop="desc"
      >
        <el-input
          v-model.trim="table.form.desc"
          placeholder="说明"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      >
        <el-select
          v-model.trim="table.form.status"
          placeholder="请选择当前审批状态"
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
          prop="desc"
          label="说明"
        />
        <el-table-column
          prop="startTime"
          label="开始时间"
        />
        <el-table-column
          prop="endTime"
          label="结束时间"
        />
        <el-table-column
          prop="status"
          label="审批状态"
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
          label="操作"
          align="center"
          width="500"
        >
          <template slot-scope="scope">
            <el-button
              type="primary"
              :loading="table.approvalLoading"
              @click="handleApproval(scope.row)"
            >
              审批日志
            </el-button>
            <el-button
              v-if="scope.row.status === 2"
              size="mini"
              type="success"
              @click="handleResubmit(scope.row)"
            >
              重新提交
            </el-button>
            <el-button
              v-if="scope.row.status === 5"
              size="mini"
              type="success"
              @click="handleConfirm(scope.row)"
            >
              确认
            </el-button>
            <el-button
              v-if="scope.row.status !== 1"
              size="mini"
              @click="handleUpdate(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="scope.row.status !== 1 &&scope.row.status !== 3 && scope.row.status !== 5"
              size="mini"
              type="warning"
              @click="handleCancel(scope.row)"
            >
              取消
            </el-button>
            <el-button
              v-if="scope.row.status !== 1"
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

    <!-- 请假配置对话框 -->
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
          label="说明"
          prop="desc"
        >
          <el-input
            v-model.trim="updateDialog.form.desc"
            type="textarea"
            placeholder="请输入请假说明, 描述清楚更容易审批通过哟~"
          />
        </el-form-item>
        <el-form-item
          label="开始时间"
          prop="startTime"
        >
          <el-date-picker
            v-model="updateDialog.form.startTime"
            type="datetime"
            :picker-options="updateDialog.startTimePickerOptions"
            placeholder="Select start time"
          />
        </el-form-item>
        <el-form-item
          label="结束时间"
          prop="endTime"
        >
          <el-date-picker
            v-model="updateDialog.form.endTime"
            type="datetime"
            :picker-options="updateDialog.endTimePickerOptions"
            placeholder="Select end time"
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
    <!-- 审批日志对话框 -->
    <el-dialog
      :title="approvalDialog.title"
      :visible.sync="approvalDialog.visible"
      width="500px"
    >
      <el-steps
        :active="approvalDialog.stepsActive"
        :align-center="true"
        :space="80"
        direction="vertical"
        finish-status="success"
      >
        <el-step
          v-for="(item, index) in approvalDialog.steps"
          :key="index"
          :title="item.title"
          :status="item.status"
          :description="item.description"
        />
      </el-steps>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          @click="approvalDialog.visible=false"
        >
          确 定
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
  batchDeleteLeave,
  cancelLeave,
  createLeave,
  findLeaveApprovingTrack,
  findLeave,
  updateLeave, confirmLeave, resubmitLeave
} from '@/api/test/leaves'
import { diffObjUpdate } from '@/utils/diff'
import { IdempotenceModule } from '@/store/modules/idempotence'

@Component({
  // 组件名称首字母需大写, 否则会报警告
  name: 'Leave',
  components: {
    Pagination
  }
})
export default class extends Vue {
  private readonly defaultConfig: any = {
    pageNum: 1,
    pageSize: 5,
    status: [{
      name: 0,
      label: '已提交',
      type: 'info'
    }, {
      name: 1,
      label: '通过',
      type: 'success'
    }, {
      name: 2,
      label: '拒绝, 需重新提交',
      type: 'danger'
    }, {
      name: 3,
      label: '手动取消',
      type: 'warning'
    }, {
      name: 4,
      label: '审批中',
      type: ''
    }, {
      name: 5,
      label: '已通过, 需确认',
      type: ''
    }]
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
      status: '',
      desc: '',
      startTime: '',
      endTime: ''
    },
    // 表单
    form: {},
    oldData: {},
    // 表单校验
    rules: {
      desc: [
        { required: true, message: '说明不能为空', trigger: 'blur' }
      ]
    },
    startTimePickerOptions: {
      disabledDate(time: any) {
        return time.getTime() < Date.now()
      }
    },
    endTimePickerOptions: {
      disabledDate(time: any) {
        return time.getTime() < Date.now()
      }
    }
  }

  private approvalDialog: any = {
    // 是否打开
    visible: false,
    // 标题
    title: '审批日志',
    // 历史步骤
    stepsActive: 0,
    steps: []
  }

  private table: any = {
    loading: false,
    approvalLoading: false,
    batchDeleteBtnDisabled: true,
    selection: [],
    list: [],
    pageNum: 1,
    pageSize: 5,
    total: 0,
    form: {
      status: '',
      desc: '',
      startTime: '',
      endTime: ''
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
      const { data } = await findLeave(params)
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
        if (this.updateDialog.form.startTime !== '' && this.updateDialog.form.endTime !== '' && this.updateDialog.form.startTime.getTime() > this.updateDialog.form.endTime.getTime()) {
          this.$message({
            type: 'warning',
            message: '开始时间不能大于结束时间, 请重新输入~'
          })
          return
        }
        const newData = JSON.parse(JSON.stringify(this.updateDialog.form))
        newData.startTime = this.date2Str(this.updateDialog.form.startTime)
        newData.endTime = this.date2Str(this.updateDialog.form.endTime)
        if (this.updateDialog.type === 0) {
          try {
            this.updateDialog.loading = true
            await createLeave(newData)
          } finally {
            this.updateDialog.loading = false
            IdempotenceModule.RefreshIdempotenceToken()
          }
        } else {
          const update = diffObjUpdate(this.updateDialog.oldData, newData)
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
            await updateLeave(update.id, update)
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
          message: `${this.updateDialog.type === 0 ? '创建' : '更新'}请假成功`,
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
    this.updateDialog.title = '创建新请假'
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async handleApproval(row: any) {
    this.table.approvalLoading = true
    this.approvalDialog.title = ''
    try {
      const { data } = await findLeaveApprovingTrack(row.id)
      this.approvalDialog.stepsActive = data.length - 1
      const logs: any [] = []
      for (let i = 0, len = data.length; i < len; i++) {
        const item = data[i]
        if (i === 0) {
          logs.push({
            title: item.name,
            description: item.createdAt,
            status: 'success'
          })
        } else if (i < len - 1 || item.status > 0) {
          let status = 'success'
          let description = item.updatedAt
          if (item.status === 2) {
            status = 'error'
            if (item.opinion !== '') {
              description = item.updatedAt
            }
          } else if (item.status === 3) {
            status = 'error'
          } else if (item.status === 4) {
            status = 'finish'
          }
          logs.push({
            title: item.name,
            description,
            status
          })
        } else {
          if (item.resubmit) {
            logs.push({
              title: '待重新提交',
              description: '请编辑后重新提交~',
              status: 'wait'
            })
          } else if (item.confirm) {
            logs.push({
              title: '待确认',
              description: '请点击确认~',
              status: 'wait'
            })
          } else {
            logs.push({
              title: '待审批',
              description: '请耐心等待~',
              status: 'wait'
            })
          }
        }
      }
      this.approvalDialog.steps = logs
      this.approvalDialog.visible = true
    } catch (e) {
      this.$message.error('读取审批日志失败')
    } finally {
      this.table.approvalLoading = false
    }
  }

  private async handleUpdate(row: any) {
    // 清理字段
    this.resetUpdateForm()
    // 弹窗表单赋值
    this.updateDialog.form.id = row.id
    this.updateDialog.form.desc = row.desc
    // 记录旧数据
    this.updateDialog.oldData = JSON.parse(JSON.stringify(this.updateDialog.form))
    // 修改类型
    this.updateDialog.type = 1
    // 修改标题
    this.updateDialog.title = '修改请假信息'
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async handleConfirm(row: any) {
    const msg = `确定要确认请假[${row.desc}]吗?`
    this.$confirm(msg, '请谨慎操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async() => {
        await confirmLeave(row.id)
        this.getData()
      })
  }

  private async handleResubmit(row: any) {
    await resubmitLeave(row.id)
    this.getData()
  }

  private async handleCancel(row: any) {
    const msg = `确定要取消请假[${row.desc}]吗?`
    this.$confirm(msg, '请谨慎操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async() => {
        await cancelLeave(row.id)
        this.getData()
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
    const descs: string[] = []
    for (let i = 0, len = rows.length; i < len; i++) {
      const row = rows[i]
      ids.push(row.id)
      descs.push(row.desc)
    }
    if (ids.length > 0) {
      const msg = `确定要删除请假[${descs.join(',')}]吗, 此操作不可逆?`
      this.$confirm(msg, '请谨慎操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await batchDeleteLeave(ids.join(','))
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

  // 获取审批状态对应的tag颜色
  private getStatusTagType(status: number) {
    for (let i = 0, len = this.defaultConfig.status.length; i < len; i++) {
      const item = this.defaultConfig.status[i]
      if (status === item.name) {
        return item.type
      }
    }
    return ''
  }

  // 获取审批状态对应的tag label
  private getStatusTagLabel(status: number) {
    for (let i = 0, len = this.defaultConfig.status.length; i < len; i++) {
      const item = this.defaultConfig.status[i]
      if (status === item.name) {
        return item.label
      }
    }
    return ''
  }

  private date2Str(date: any) {
    if (date !== '') {
      const Y = date.getFullYear() + '-'
      const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
      const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
      const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
      const m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
      const s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
      return Y + M + D + h + m + s
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
    .el-steps {
      width: 50%;
      margin: 0 auto;
    }
  }
</style>
