<template>
  <div class="app-container">
    <el-form
      ref="searchForm"
      v-loading="table.loading"
      :inline="true"
      class="demo-form-inline"
    >
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
      </el-row>
      <el-table
        :data="table.list"
        style="width: 100%;margin-bottom: 20px;"
        row-key="id"
        border
        stripe
      >
        <el-table-column
          prop="name"
          label="英文名称"
          width="180"
        />
        <el-table-column
          prop="title"
          label="标题"
          width="180"
        />
        <svg-icon icon-class="bug" />
        <el-table-column
          prop="icon"
          label="图标"
          align="center"
          width="100"
        >
          <template slot-scope="scope">
            <svg-icon :name="scope.row.icon" />
          </template>
        </el-table-column>
        <el-table-column
          prop="sort"
          label="同级排序"
          align="center"
        />
        <el-table-column
          prop="path"
          label="URL路径"
          width="180"
        />
        <el-table-column
          prop="component"
          label="组件路径"
          width="180"
        />
        <el-table-column
          prop="redirect"
          label="重定向地址"
          width="120"
        />
        <el-table-column
          prop="visible"
          label="侧边栏导航"
          width="120"
          align="center"
        >
          <template slot-scope="scope">
            <el-switch
              v-model.trim="scope.row.visible"
              @change="handleVisibleChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="breadcrumb"
          label="面包屑导航"
          width="120"
          align="center"
        >
          <template slot-scope="scope">
            <el-switch
              v-model.trim="scope.row.breadcrumb"
              @change="handleBreadcrumbChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="120"
          align="center"
        >
          <template slot-scope="scope">
            <el-switch
              v-model.trim="scope.row.status"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="creator"
          label="创建人"
          align="center"
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
    </el-form>

    <!-- 菜单配置对话框 -->
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
          label="上级目录"
          prop="parentId"
        >
          <el-cascader
            v-model.trim="updateDialog.form.parentIdStr"
            :options="updateDialog.menuTreeOptions"
            :show-all-levels="false"
            :props="{checkStrictly: true,label: 'title',value: 'id',emitPath: false}"
            filterable
            clearable
            @change="handleMenuTreeChange"
          />
        </el-form-item>
        <el-form-item
          label="英文名称"
          prop="name"
        >
          <el-input
            v-model.trim="updateDialog.form.name"
            placeholder="请输入英文名称"
          />
        </el-form-item>
        <el-form-item
          label="标题"
          prop="title"
        >
          <el-input
            v-model.trim="updateDialog.form.title"
            placeholder="请输入标题"
          />
        </el-form-item>
        <el-form-item
          label="图标"
          prop="icon"
        >
          <el-input
            v-model.trim="updateDialog.form.icon"
            placeholder="请输入图标"
          />
        </el-form-item>
        <el-form-item
          label="排序"
          prop="sort"
        >
          <el-input-number
            v-model.trim="updateDialog.form.sort"
            :min="0"
            :max="99"
            label="同级菜单排序序号"
          />
        </el-form-item>
        <el-form-item
          label="根路径"
          prop="rootPath"
        >
          <el-input
            v-model.trim="updateDialog.form.rootPath"
            :disabled="!updateDialog.form.root"
            placeholder="请输入URL根路径"
          />
        </el-form-item>
        <el-form-item
          v-if="!updateDialog.form.root"
          label="子路径"
          prop="path"
        >
          <el-input
            v-model.trim="updateDialog.form.path"
            placeholder="请输入URL子路径"
          />
        </el-form-item>
        <el-form-item
          label="完整路径"
          prop="fullPath"
        >
          <el-input
            v-model.trim="updateDialog.form.fullPath"
            :disabled="true"
          />
        </el-form-item>
        <el-form-item
          v-if="!updateDialog.form.root"
          label="组件路径"
          prop="component"
        >
          <el-input
            v-model.trim="updateDialog.form.component"
            placeholder="请输入组件路径(默认在views目录)"
          />
        </el-form-item>
        <el-form-item
          label="重定向"
          prop="redirect"
        >
          <el-input
            v-model.trim="updateDialog.form.redirect"
            placeholder="请输入重定向地址"
          />
        </el-form-item>
        <el-form-item
          label="侧边栏导航"
          prop="visible"
        >
          <el-switch
            v-model.trim="updateDialog.form.visible"
            active-text="可见"
            inactive-text="隐藏"
          />
        </el-form-item>
        <el-form-item
          label="面包屑导航"
          prop="breadcrumb"
        >
          <el-switch
            v-model.trim="updateDialog.form.breadcrumb"
            active-text="可见"
            inactive-text="隐藏"
          />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-switch
            v-model.trim="updateDialog.form.status"
            active-text="正常"
            inactive-text="禁用"
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
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { batchDeleteMenu, createMenu, getMenus, updateMenu } from '@/api/system/menus'
import { Form } from 'element-ui'
import i18n from '@/lang'
import { diffObjUpdate } from '@/utils/diff'

@Component({
  // 组件名称首字母需大写, 否则会报警告
  name: 'Menu'
})
export default class extends Vue {
  private updateDialog: any = {
    loading: false,
    // 类型(0:创建, 1更新)
    type: 0,
    // 是否打开
    visible: false,
    // 标题
    title: '',
    // 菜单树参数
    menuTreeOptions: [],
    // 默认数据
    defaultForm: {
      id: 0,
      root: true,
      parentId: 0,
      name: '',
      title: '',
      icon: '',
      sort: 0,
      path: '',
      component: '',
      redirect: '',
      visible: true,
      breadcrumb: true,
      status: true,
      // 表单辅助参数, 不参与提交
      parentIdStr: '0',
      rootPath: '',
      fullPath: '/'
    },
    // 表单数据
    form: {},
    // 旧数据
    oldData: {},
    // 表单校验
    rules: {
      name: [
        { required: true, message: '菜单英文名称不能为空', trigger: 'blur' }
      ],
      childPath: [
        { required: true, message: '子路径不能为空', trigger: 'blur' }
      ],
      component: [
        { required: true, message: '组件路径不能为空', trigger: 'blur' }
      ]
    }
  }

  private table: any = {
    loading: false,
    list: []
  }

  created() {
    this.resetUpdateForm()
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
      const { data } = await getMenus(params)
      this.table.list = data
    } finally {
      this.table.loading = false
    }
  }

  // 重置下拉选择框
  private async refreshMenuTreeOptions() {
    this.updateDialog.menuTreeOptions = []
    // 包裹根菜单
    const menu = { id: '0', title: '顶级目录', children: this.getMenuOptions(this.table.list) }
    this.updateDialog.menuTreeOptions.push(menu)
  }

  private getMenuOptions(data: any) {
    const menus: any[] = []
    for (let i = 0, len = data.length; i < len; i++) {
      const item = data[i]
      let title = item.title
      if (i18n.t('route.' + item.name) !== 'route.' + item.name) {
        // 可以国际化
        title = i18n.t('route.' + item.name)
      }
      let menu: any = {
        // 必须是string, 否则会导致不能设置默认值
        id: String(item.id),
        title
      }
      if (item.children.length > 0) {
        menu = {
          ...menu,
          children: this.getMenuOptions(item.children)
        }
      }
      if (this.updateDialog.type === 1) {
        // 更新数据需要禁用部分子菜单
        if (this.isChildMenu(this.updateDialog.form.parentId, item.id, this.table.list)) {
        // 子菜单不允许被选中
          menu.disabled = true
        }
      }
      menus.push(menu)
    }
    return menus
  }

  private async doUpdate() {
    (this.$refs.updateForm as Form).validate(async(valid) => {
      if (valid) {
        let params = this.updateDialog.form
        if (this.updateDialog.form.root) {
          // 根目录需要传全路径
          params = {
            ...this.updateDialog.form,
            path: this.updateDialog.form.fullPath
          }
        }
        // 以下参数不提交
        delete params.parentIdStr
        delete params.rootPath
        delete params.fullPath
        if (this.updateDialog.type === 0) {
          try {
            this.updateDialog.loading = true
            await createMenu(params)
          } finally {
            this.updateDialog.loading = false
          }
        } else {
          const update = diffObjUpdate(this.updateDialog.oldData, params)
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
            await updateMenu(update.id, update)
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
          message: `${this.updateDialog.type === 0 ? '创建' : '更新'}菜单成功`,
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
    // 刷新菜单参数
    this.refreshMenuTreeOptions()
    // 修改标题
    this.updateDialog.title = '创建新菜单'
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async handleUpdate(row: any) {
    // 弹窗表单赋值
    this.updateDialog.form.id = row.id
    this.updateDialog.form.parentId = row.parentId
    this.updateDialog.form.parentIdStr = String(row.parentId)
    this.updateDialog.form.name = row.name
    this.updateDialog.form.title = row.title
    this.updateDialog.form.icon = row.icon
    this.updateDialog.form.sort = row.sort
    this.updateDialog.form.component = row.component
    this.updateDialog.form.visible = row.visible
    this.updateDialog.form.breadcrumb = row.breadcrumb
    this.updateDialog.form.status = row.status
    // 根目录
    this.updateDialog.form.root = this.updateDialog.form.parentId === 0
    if (this.updateDialog.form.root) {
      if (row.path.indexOf('/') === 0) {
        this.updateDialog.form.rootPath = row.path.substring(1)
      } else {
        this.updateDialog.form.rootPath = row.path
      }
    } else {
      this.updateDialog.form.rootPath = this.getMenuFullPath(row.parentId)
    }
    this.updateDialog.form.path = row.path
    this.updateDialog.form.redirect = row.redirect
    // 记录旧数据
    this.updateDialog.oldData = JSON.parse(JSON.stringify(this.updateDialog.form))
    // 修改类型
    this.updateDialog.type = 1
    // 刷新菜单参数
    this.refreshMenuTreeOptions()
    // 修改标题
    this.updateDialog.title = '修改菜单信息'
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private handleDelete(row: any) {
    this.batchDelete([row])
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
      const msg = `确定要删除菜单[${names.join(',')}]吗, 此操作不可逆?`
      this.$confirm(msg, '请谨慎操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await batchDeleteMenu(ids.join(','))
          this.getData()
        })
    }
  }

  // 改变侧边栏状态
  private async handleVisibleChange(row: any) {
    await updateMenu(row.id, {
      visible: row.visible
    })
    this.getData()
  }

  // 改变面包屑状态
  private async handleBreadcrumbChange(row: any) {
    await updateMenu(row.id, {
      breadcrumb: row.breadcrumb
    })
    this.getData()
  }

  // 改变菜单状态
  private async handleStatusChange(row: any) {
    await updateMenu(row.id, {
      status: row.status
    })
    this.getData()
  }

  // 改变菜单树
  private async handleMenuTreeChange() {
    this.updateDialog.form.parentId = Number(this.updateDialog.form.parentIdStr)
    this.updateDialog.form.root = this.updateDialog.form.parentId === 0
    if (this.updateDialog.form.parentId === this.updateDialog.oldData.parentId) {
      // 恢复路径
      this.updateDialog.form.path = this.updateDialog.oldData.path
      this.updateDialog.form.rootPath = this.updateDialog.oldData.rootPath
      this.updateDialog.form.component = this.updateDialog.oldData.component
    } else {
      // 清空路径
      this.updateDialog.form.path = ''
      this.updateDialog.form.rootPath = ''
      this.updateDialog.form.component = ''
    }
    if (!this.updateDialog.form.root) {
      this.updateDialog.form.rootPath = this.getMenuFullPath(this.updateDialog.form.parentId)
    }
  }

  // 根据编号获取菜单全路径
  private getMenuFullPath(id: number) {
    let path = ''
    if (id > 0) {
      const leaf = this.getMenuTreeLeaf(id, this.table.list)
      if (leaf.parentId > 0) {
        path = this.getMenuFullPath(leaf.parentId) + '/' + leaf.path
      } else {
        path = leaf.path
      }
    }
    return path
  }

  // 根据编号获取菜单树的叶子节点
  private getMenuTreeLeaf(id: number, menus: any) {
    let res: any
    for (let i = 0, len = menus.length; i < len; i++) {
      const row = menus[i]
      if (row.id === id) {
        res = row
        break
      }
      if (row.children.length > 0) {
        const child = this.getMenuTreeLeaf(id, row.children)
        if (child) {
          res = child
          break
        }
      }
    }
    return res
  }

  // 根据编号判断childId是否id的子节点
  private isChildMenu(id: number, childId: number, menus: any): boolean {
    if (childId === 0) {
      return false
    }
    // 获取父菜单编号
    const parentId = this.getParentMenu(childId, menus)
    // 要么等于找到父菜单, 要么继续向上找
    return id === parentId || this.isChildMenu(id, parentId, menus)
  }

  // 获取父级菜单
  private getParentMenu(id: number, menus: any) {
    const leaf = this.getMenuTreeLeaf(id, menus)
    return leaf.parentId
  }

  @Watch('updateDialog.form.rootPath')
  @Watch('updateDialog.form.path')
  private onMenuPathChange() {
    if (this.updateDialog.form.root) {
      this.updateDialog.form.path = this.updateDialog.form.rootPath
      this.updateDialog.form.fullPath = '/' + this.updateDialog.form.rootPath
    } else {
      if (this.updateDialog.form.path === '') {
        this.updateDialog.form.fullPath = this.updateDialog.form.rootPath
      } else {
        this.updateDialog.form.fullPath = this.updateDialog.form.rootPath + '/' + this.updateDialog.form.path
      }
    }
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
