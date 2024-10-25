<template>
  <div class="maincontent">
    <!-- 筛选搜索区域 -->
    <div class="top">
      <el-form ref="formRef" :inline="true" :model="form" class="searchform">
        <el-form-item label="角色名称：" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" clearable class="!w-[180px]" />
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
      <el-table :data="dataList" style="width: 100%; margin-bottom: 20px" row-key="id" lazy :height="tableMaxHeight" default-expand-all>
        <el-table-column prop="id" label="角色ID" align="center" />
        <el-table-column prop="name" label="名称" align="center" />
        <el-table-column prop="code" label="代码" align="center" />
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
              <el-link :underline="false" type="primary" @click="openDrawer(row)">权限</el-link>
              <el-link :underline="false" type="danger" @click="handleDelete(row)">删除</el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 部门新建/编辑弹窗 -->
    <roledialog v-model:visible="isDialogVisible" :role="selectedRole" :is-edit-mode="isEditMode" :roleTree="dataList" @update:visible="isDialogVisible = $event" @save="handleSave" @cancel="handleCancel" />
    <!-- 权限编辑抽屉 -->
    <permissiondrawer :isVisible="isDrawerVisible" :role="selectedRole" @update:isVisible="isDrawerVisible = $event" @confirm="handleDrawerConfirm" />
  </div>
</template>

<script setup lang="ts">
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from "vue";
import { handleTree } from "@/utils/tree";
import roledialog from "./components/roledialog.vue";
import permissiondrawer from "./components/permissiondrawer.vue";
import { getRoleList, postRole, deleteRole, patchRole } from "@/api/system";
import { isAllEmpty } from "@pureadmin/utils";
import { ElMessage, ElMessageBox } from "element-plus";
import { message } from "@/utils/message";

const formRef = ref(null);

defineOptions({
  name: "role"
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
  // 获取部门数据
  await getRoleList(form).then(res => {
    dataList.value = handleTree(res.data, "id", "parent", "children"); // 处理列表成树形数据
    loading.value = false;
  });
}

// 编辑用户点击事件函数
function handleEdit(row) {
  console.log("编辑部门", row);
  selectedRole.value = row;
  isEditMode.value = true;
  isDialogVisible.value = true;
}

// 新增用户点击事件函数
function handleCreat(parent = null) {
  const parentId = parent ? parent : "";
  console.log("新增部门");
  // 新增部门默认值
  selectedRole.value = {
    name: "",
    code: "",
    status: true,
    parent: parentId
  };
  isEditMode.value = false;
  isDialogVisible.value = true;
}

// 删除用户点击事件函数
function handleDelete(row) {
  ElMessageBox.confirm("角色：" + row.name + " 将被永久删除，请谨慎操作！", "警告", {
    confirmButtonText: "确认删除",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      console.log("删除角色", row);
      deleteRole(row.id)
        .then(res => {
          onSearch();
          message(res.msg, { type: "success" });
        })
        .catch(res => {
          message(JSON.stringify(res.response.data.msg), { type: "error" });
        });
    })
    .catch(() => {
      console.log("删除角色", "已取消");
    });
}

// 弹窗相关
const isDialogVisible = ref(false);
const isEditMode = ref(false);
const selectedRole = ref({});

// 编辑/新增 部门 数据过滤函数
function roleFilter(data) {
  delete data.id;
  delete data.children;
  // 上传时将各种类型空值转化成NaN
  data = Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      return [key, isAllEmpty(value) ? NaN : value];
    })
  );
  // 若menu为空，则删除menu
  if (!data.menu) {
    delete data.menu;
  }
  // 若存在parent，则提取最后一个元素(element组件会默认携带列表)
  if (data.parent && Array.isArray(data.parent)) {
    data.parent = data.parent[data.parent.length - 1];
  }
  return data;
}

function handleSave(type, data) {
  if (type == "update") {
    const id = data.id;
    const newdata = roleFilter(data);
    console.log(newdata);
    patchRole(id, newdata)
      .then(res => {
        onSearch();
        message(res.msg, { type: "success" });
      })
      .catch(res => {
        message(JSON.stringify(res.response.data.msg), { type: "error" });
      });
  } else if (type == "create") {
    const newdata = roleFilter(data);
    console.log(newdata);
    postRole(newdata)
      .then(res => {
        onSearch();
        message(res.msg, { type: "success" });
      })
      .catch(res => {
        message(JSON.stringify(res.response.data.msg), { type: "error" });
      });
  }
}

function handleCancel() {
  console.log("取消");
}

// 权限抽屉相关
const isDrawerVisible = ref(false);

function openDrawer(row) {
  selectedRole.value = row;
  isDrawerVisible.value = true;
}

function handleDrawerConfirm(id, updateData) {
  console.log("更新角色权限:", id, updateData);
  // 提交接口更新角色权限
  patchRole(id, updateData)
    .then(res => {
      onSearch();
      message(res.msg, { type: "success" });
    })
    .catch(res => {
      message(JSON.stringify(res.response.data.msg), { type: "error" });
    });
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
::v-deep(.el-table .cell) {
  overflow: hidden; // 溢出隐藏
  text-overflow: ellipsis; // 溢出用省略号显示
  white-space: nowrap; // 规定段落中的文本不进行换行
}

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
