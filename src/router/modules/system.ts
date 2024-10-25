export default {
  path: "/system",
  meta: {
    icon: "ri:mac-line",
    title: "系统管理",
    rank: 1
  },
  children: [
    {
      path: "/system/usermanage",
      name: "usermanage",
      component: () => import("@/views/system/user/index.vue"),
      meta: {
        title: "用户管理",
        keepAlive: false
      }
    },
    {
      path: "/system/deptmanage",
      name: "deptmanage",
      component: () => import("@/views/system/department/index.vue"),
      meta: {
        title: "部门管理",
        keepAlive: false
      }
    },
    {
      path: "/system/rolemanage",
      name: "rolemanage",
      component: () => import("@/views/system/role/index.vue"),
      meta: {
        title: "角色管理",
        keepAlive: false
      }
    },
    {
      path: "/system/permissionManage",
      name: "permissionManage",
      component: () => import("@/views/system/permission/index.vue"),
      meta: {
        title: "菜单权限",
        keepAlive: false
      }
    }
  ]
} satisfies RouteConfigsTable;
