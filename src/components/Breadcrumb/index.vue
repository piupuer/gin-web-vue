<template>
  <el-breadcrumb
    class="app-breadcrumb"
    separator="/"
  >
    <transition-group name="breadcrumb">
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbs"
        :key="item.path"
      >
        <span
          v-if="item.redirect === 'noredirect' || index === breadcrumbs.length-1"
          class="no-redirect"
        >{{ $t('menuRoute.' + item.meta.name) === 'menuRoute.' + item.meta.name ? item.meta.title : $t('menuRoute.' + item.meta.name) }}</span>
        <a
          v-else
          @click.prevent="handleLink(item)"
        >{{ $t('menuRoute.' + item.meta.name) === 'menuRoute.' + item.meta.name ? item.meta.title : $t('menuRoute.' + item.meta.name) }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script lang="ts">
import { compile } from 'path-to-regexp'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { RouteRecord, Route } from 'vue-router'

@Component({
  name: 'Breadcrumb'
})
export default class extends Vue {
  private breadcrumbs: RouteRecord[] = []

  @Watch('$route')
  private onRouteChange(route: Route) {
    // if you go to the redirect page, do not update the breadcrumbs
    if (route.path.startsWith('/redirect/')) {
      return
    }
    this.getBreadcrumb()
  }

  created() {
    this.getBreadcrumb()
  }

  private getBreadcrumb() {
    const matched = this.$route.matched.filter((item) => item.meta && item.meta.title)
    this.breadcrumbs = matched.filter((item) => {
      return item.meta && item.meta.title && item.meta.breadcrumb !== 0
    })
  }

  private pathCompile(path: string) {
    // To solve this problem https://github.com/PanJiaChen/vue-element-admin/issues/561
    const { params } = this.$route
    const toPath = compile(path)
    return toPath(params)
  }

  private handleLink(item: any) {
    const { redirect, path } = item
    if (redirect) {
      this.$router.push(redirect).catch(err => {
        // Throw Error "NavigationDuplicated"
        // https://github.com/vuejs/vue-router/issues/2872#issuecomment-522341874
        console.log(err)
      })
      return
    }
    this.$router.push(this.pathCompile(path)).catch(err => {
      // Throw Error "NavigationDuplicated"
      // https://github.com/vuejs/vue-router/issues/2872#issuecomment-522341874
      console.log(err)
    })
  }
}
</script>

<style lang="scss" scoped>
.el-breadcrumb__inner,
.el-breadcrumb__inner a {
  font-weight: 400 !important;
}

.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>
