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
        label="类型"
        prop="targetCategory"
      >
        <el-select
          v-model.trim="table.form.targetCategory"
          placeholder="请选择当前审批类型"
        >
          <el-option
            v-for="item in defaultConfig.targetCategory"
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
          prop="createdAt"
          label="提交时间"
        />
        <el-table-column
          prop="flowTargetCategoryStr"
          align="center"
          label="类型"
        >
          <template slot-scope="scope">
            <el-tag
              :type="getTargetCategoryTagType(scope.row.flowTargetCategoryStr)"
            >
              {{ scope.row.flowTargetCategoryStr }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="submitDetail"
          label="明细"
        />
        <el-table-column
          fixed="right"
          label="操作"
          align="center"
          width="260"
        >
          <template slot-scope="scope">
            <el-button
              type="primary"
              @click="handleApproval(scope.row, 0)"
            >
              通过
            </el-button>
            <el-button
              type="danger"
              @click="handleApproval(scope.row, 1)"
            >
              拒绝
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
    <!-- 审批对话框 -->
    <el-dialog
      :title="approvalDialog.title"
      :visible.sync="approvalDialog.visible"
      width="500px"
    >
      <el-form
        ref="approvalForm"
        :model="approvalDialog.form"
        :rules="approvalDialog.rules"
        label-width="80px"
      >
        <el-form-item
          v-if="approvalDialog.type===0"
          label="意见"
          prop="approvalOpinion"
        >
          <el-input
            v-model.trim="approvalDialog.form.approvalOpinion"
            type="textarea"
            placeholder="请输入审批意见"
          />
        </el-form-item>
        <el-form-item
          v-else
          label="原因"
          prop="approvalReason"
        >
          <el-input
            v-model.trim="approvalDialog.form.approvalReason"
            type="textarea"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          :loading="approvalDialog.loading"
          @click="doApproval"
        >
          确 定
        </el-button>
        <el-button @click="cancelApproval">
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
import { getWorkflowApprovings, updateWorkflowLogApproval } from '@/api/system/workflows'

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
      label: '提交',
      type: ''
    }, {
      name: 1,
      label: '通过',
      type: 'success'
    }, {
      name: 2,
      label: '拒绝',
      type: 'danger'
    }, {
      name: 3,
      label: '取消',
      type: 'warning'
    }, {
      name: 4,
      label: '重启',
      type: 'info'
    }, {
      name: 5,
      label: '结束',
      type: ''
    }],
    targetCategory: [{
      name: 1,
      label: '请假流程',
      type: ''
    }]
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
      targetCategory: ''
    }
  }

  private approvalDialog: any = {
    loading: false,
    visible: false,
    // 类型(0:通过, 1:拒绝)
    type: 0,
    // 标题
    title: '',
    // 默认数据
    defaultForm: {
      flowId: 0,
      flowTargetCategory: 0,
      targetId: 0,
      approvalOpinion: '',
      approvalReason: ''
    },
    // 表单
    form: {},
    oldData: {},
    // 表单校验
    rules: {
      approvalReason: [
        { required: true, message: '原因不能为空', trigger: 'blur' }
      ]
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
      const { data } = await getWorkflowApprovings(params)
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

  private async handleApproval(row: any, type: number) {
    // 清理字段
    this.resetApprovalForm()
    // 弹窗表单赋值
    this.approvalDialog.form.flowId = row.flowId
    this.approvalDialog.form.flowTargetCategory = row.flowTargetCategory
    this.approvalDialog.form.targetId = row.targetId
    // 修改类型
    this.approvalDialog.type = type
    // 修改标题
    if (type === 0) {
      this.approvalDialog.title = '通过审批'
    } else {
      this.approvalDialog.title = '拒绝审批'
    }
    // 开启弹窗
    this.approvalDialog.visible = true
  }

  private async doApproval() {
    (this.$refs.approvalForm as Form).validate(async(valid) => {
      if (valid) {
        try {
          this.approvalDialog.loading = true
          const approvalStatus = this.approvalDialog.type === 0 ? 1 : 2
          const approvalOpinion = this.approvalDialog.type === 0 ? this.approvalDialog.form.approvalOpinion : this.approvalDialog.form.approvalReason
          await updateWorkflowLogApproval({
            flowId: this.approvalDialog.form.flowId,
            targetCategory: this.approvalDialog.form.flowTargetCategory,
            targetId: this.approvalDialog.form.targetId,
            approvalOpinion,
            approvalStatus
          })
        } finally {
          this.approvalDialog.loading = false
        }
        // 关闭弹窗
        this.approvalDialog.visible = false
        // 重新查询
        this.getData()
        this.$notify({
          title: '恭喜',
          message: '审批成功',
          type: 'success',
          duration: 2000
        })
      }
    })
  }

  private async cancelApproval() {
    // 关闭弹窗
    this.approvalDialog.visible = false
  }

  private async resetApprovalForm() {
    this.$nextTick(() => {
      // 重置校验信息
      const form = this.$refs.approvalForm as Form
      if (form) {
        form.clearValidate()
      }
    })
    this.approvalDialog.form = JSON.parse(JSON.stringify(this.approvalDialog.defaultForm))
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

  // 获取审批类型对应的tag颜色
  private getTargetCategoryTagType(targetCategoryStr: string) {
    for (let i = 0, len = this.defaultConfig.targetCategory.length; i < len; i++) {
      const item = this.defaultConfig.targetCategory[i]
      if (targetCategoryStr === item.label) {
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
    .el-steps {
      width: 50%;
      margin: 0 auto;
    }
  }
</style>
