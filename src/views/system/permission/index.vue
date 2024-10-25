<template>
  <div class="maincontent">
    <!-- 筛选搜索区域 -->
    <div class="top">
      <el-form ref="formRef" :inline="true" :model="form" class="searchform">
        <el-form-item label="菜单/权限名称：" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单/权限名称" clearable class="!w-[180px]" />
        </el-form-item>
        <el-form-item label="状态：" prop="status">
          <el-select v-model="form.status" placeholder="请选择" clearable class="!w-[180px]">
            <el-option label="已启用" value="1" />
            <el-option label="已禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="useRenderIcon('ri:search-line')" :loading="loading" @click="onSearch"> 搜索 </el-button>
          <el-button :icon="useRenderIcon('ri:refresh-line')" @click="resetForm(formRef)"> 重置 </el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 表格数据区域 -->
    <div ref="tableContainer" class="table">
      <el-table :data="dataList" style="width: 100%; margin-bottom: 20px" row-key="id" lazy :height="tableMaxHeight" :show-overflow-tooltip="true">
        <!-- <el-table-column prop="id" label="菜单/权限ID" align="center" /> -->
        <el-table-column prop="menu_type" label="类型" align="center" width="150px">
          <template #default="{ row }">
            <el-tag v-if="row.menu_type === 0" type="info">直链</el-tag>
            <el-tag v-else-if="row.menu_type === 1" type="primary">菜单</el-tag>
            <el-tag v-else-if="row.menu_type === 2" type="info">权限</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" align="center" min-width="150px">
          <template #default="{ row }">
            <div style="display: flex; justify-content: center; align-items: center">
              <component :is="useRenderIcon(row.meta.icon)" style="min-width: 15px; min-height: 15px" />
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="meta.rank" label="排序" sortable align="center" />
        <el-table-column prop="path" label="路由地址" align="center" />
        <el-table-column prop="component" label="组件地址" align="center" />
        <el-table-column prop="code" label="权限代码" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'">{{ row.status ? "已启用" : "已禁用" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" min-width="150px">
          <template #header>
            <el-button type="primary" size="small" @click="handleCreat()">新增</el-button>
          </template>
          <template #default="{ row }">
            <div class="ellink">
              <el-link :underline="false" type="primary" @click="handleEdit(row)">编辑</el-link>
              <el-link :underline="false" type="primary" @click="handleCreat(row.id)">增加</el-link>
              <el-link v-if="row.menu_type === 1" :underline="false" type="primary" @click="handlePortPsermissionsCreat(row.id)">+权限</el-link>
              <el-link :underline="false" type="danger" @click="handleDelete(row)">删除</el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 菜单/权限新建/编辑弹窗 -->
    <permissiondialog v-model:visible="isDialogVisible" :menu="selectedMenu" :is-edit-mode="isEditMode" :menuTree="dataList" @update:visible="isDialogVisible = $event" @save="handleSave" @cancel="handleCancel" />
    <!-- 菜单增删改查接口权限增加弹窗 -->
    <portpermissionadddialog v-model:visible="isPortDialogVisible" :parent="selectId" @savesuccess="onSearch()" />
  </div>
</template>

<script setup lang="ts">
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from "vue";
import { handleTree } from "@/utils/tree";
import permissiondialog from "./components/permissiondialog.vue";
import portpermissionadddialog from "./components/portpermissionadddialog.vue";
import { getMenuList, postMenu, deleteMenu, patchMenu } from "@/api/system";
import { isAllEmpty } from "@pureadmin/utils";
import { ElMessage, ElMessageBox } from "element-plus";
import { message } from "@/utils/message";

const formRef = ref(null);

defineOptions({
  name: "Menument"
});

// 筛选过滤器数据
const form = reactive({
  name: "",
  status: ""
});
const loading = ref(false);
const dataList = ref([]);
const tableMaxHeight = ref(0); // 表格最大高度
const tableContainer = ref(null); // 表格容器

// 计算表格高度的函数
const calculateTableHeight = () => {
  nextTick(() => {
    if (tableContainer.value) {
      // 获取父容器的高度
      const parentHeight = tableContainer.value.clientHeight;
      tableMaxHeight.value = parentHeight; // 设置表格最大高度
    }
  });
};

// 重置表单函数
const resetForm = formEl => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

// 搜索数据函数
async function onSearch() {
  loading.value = true;
  // 获取菜单/权限数据
  await getMenuList(form).then(res => {
    dataList.value = handleTree(res.data, "id", "parent", "children"); // 处理列表成树形数据
    loading.value = false;
  });
}

// 编辑用户点击事件函数
function handleEdit(row) {
  console.log("编辑菜单/权限", row);
  selectedMenu.value = row;
  isEditMode.value = true;
  isDialogVisible.value = true;
}

// 新增用户点击事件函数
function handleCreat(parent = null) {
  const parentMenu = parent ? parent : "";
  console.log("新增菜单/权限");
  // 新增菜单/权限默认值
  selectedMenu.value = {
    name: "",
    code: "",
    menu_type: 1,
    status: true,
    parent: parentMenu,
    meta: {
      title: null,
      icon: null,
      showLink: true,
      showParent: true,
      keepAlive: false,
      hiddenTag: false,
      fixedTag: false,
      rank: 9999
    }
  };
  isEditMode.value = false;
  isDialogVisible.value = true;
}

// 删除用户点击事件函数
function handleDelete(row) {
  ElMessageBox.confirm("菜单/权限：" + row.name + " 将被永久删除，请谨慎操作！", "警告", {
    confirmButtonText: "确认删除",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      console.log("删除菜单/权限", row);
      deleteMenu(row.id)
        .then(res => {
          onSearch();
          message(res.msg, { type: "success" });
        })
        .catch(res => {
          message(JSON.stringify(res.response.data.msg), { type: "error" });
        });
    })
    .catch(() => {
      console.log("删除菜单/权限", "已取消");
    });
}

// 弹窗相关
const isDialogVisible = ref(false);
const isEditMode = ref(false);
const selectedMenu = ref({});

const isPortDialogVisible = ref(false);
const selectId = ref("");

// 编辑/新增 菜单/权限 数据过滤函数
function menuFilter(data) {
  delete data.id;
  delete data.children;
  delete data.meta.id;
  if (data.menu_type !== 1) {
    delete data.meta;
  }
  // 上传时将各种类型空值转化成NaN
  data = Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      return [key, isAllEmpty(value) ? NaN : value];
    })
  );
  // 若存在parent，则提取最后一个元素(element组件会默认携带列表)
  if (data.parent && Array.isArray(data.parent)) {
    data.parent = data.parent[data.parent.length - 1];
  }
  return data;
}

function handleSave(type, data) {
  if (type == "update") {
    const id = data.id;
    const newdata = menuFilter(data);
    console.log(newdata);
    patchMenu(id, newdata)
      .then(res => {
        onSearch();
        message(res.msg, { type: "success" });
      })
      .catch(res => {
        message(res.response.data.msg, { type: "error" });
      });
  } else if (type == "create") {
    const newdata = menuFilter(data);
    console.log(newdata);
    postMenu(newdata)
      .then(res => {
        onSearch();
        message(res.msg, { type: "success" });
      })
      .catch(res => {
        console.log(res);
        message(res.response.data.msg, { type: "error" });
      });
  }
}

function handleCancel() {}

function handlePortPsermissionsCreat(parent) {
  selectId.value = parent;
  isPortDialogVisible.value = true;
}

onMounted(() => {
  // 计算表格高度的函数并挂载监听事件
  calculateTableHeight();
  window.addEventListener("resize", calculateTableHeight);
  // 初始化表格数据
  onSearch();
});

// 在组件卸载前移除监听器
onBeforeUnmount(() => {
  window.removeEventListener("resize", calculateTableHeight);
});
</script>

<style lang="scss" scoped>
.main-content {
  margin: 24px 24px 0 !important;
}

.maincontent {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 141px);
}

.searchform {
  background-color: var(--el-bg-color);
  /* padding: 10px; */
  .el-form-item {
    margin: 10px;
  }
}

.table {
  flex: 1;
  margin-top: 10px;
  background-color: var(--el-bg-color);
  height: 100%;
  /* 解决element表格在flex布局下无法自适应窗口宽度缩小的问题 */
  position: relative;
  .el-table {
    position: absolute;
  }
}

.ellink {
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>
