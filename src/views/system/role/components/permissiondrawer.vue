<!-- eslint-disable vue/no-mutating-props -->
<!-- MyDrawer.vue -->
<template>
  <el-drawer v-model="isVisible" direction="rtl" :before-close="handleClose" @open="handleOpen">
    <template #header>
      <h4>分配权限</h4>
    </template>
    <template #default>
      <el-tree ref="treeRef" :props="{ children: 'children', label: 'name' }" :data="treedata" node-key="id" :check-strictly="true" show-checkbox @check-change="handleCheckChange">
        <template #default="{ node, data }">
          <component :is="useRenderIcon('IF-team-iconlogo')" />
          <span class="custom-tree-node">
            <span
              ><el-tag v-if="data.menu_type === 0" type="info">直链</el-tag>
              <el-tag v-else-if="data.menu_type === 1">菜单</el-tag>
              <el-tag v-else-if="data.menu_type === 2" type="info">权限</el-tag></span
            >
            <span>{{ node.label }}</span>
          </span>
        </template>
      </el-tree>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick">取消</el-button>
        <el-button type="primary" @click="confirmClick">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessageBox } from "element-plus";
import { getMenuList } from "@/api/system";
import { handleTree } from "@/utils/tree";
import { cloneDeep, deviceDetection } from "@pureadmin/utils";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { log } from "console";

// 定义父组件传入的 props
const props = defineProps({
  isVisible: Boolean, // 控制抽屉的显示与隐藏
  role: Object
});

// 定义父组件使用的事件
const emit = defineEmits(["update:isVisible", "confirm"]);
const isVisible = ref(props.isVisible);
const treeRef = ref();

const radio1 = ref("Option 1");

const treedata = ref([]);

const selectedId = ref();

const roleData = ref({
  id: "",
  name: "",
  code: "",
  menu: []
}); // 创建一个可变的本地用户数据对象

// 发送更新请求时所需数据
const id = ref("");
const updateData = ref({
  name: "",
  code: "",
  menu: []
});

const handleClose = (done: () => void) => {
  emit("update:isVisible", false); // 通知父组件关闭抽屉
};

function cancelClick() {
  emit("update:isVisible", false); // 通知父组件关闭抽屉
}

function confirmClick() {
  ElMessageBox.confirm(`确认修改该角色权限吗?`)
    .then(() => {
      emit("confirm", id.value, updateData.value); // 通知父组件确认操作
      emit("update:isVisible", false); // 关闭抽屉
    })
    .catch(() => {
      // catch error
    });
}

function setCheckedKeys(list) {
  treeRef.value!.setCheckedKeys(list, false);
}
function getCheckedKeys() {
  return treeRef.value!.getCheckedKeys(false);
}

function handleCheckChange() {
  updateData.value.menu = getCheckedKeys();
  console.log(updateData.value);
}

function handleOpen() {
  // 设置用户已有权限
  roleData.value = cloneDeep(props.role);
  id.value = roleData.value.id;
  updateData.value.code = roleData.value.code;
  updateData.value.name = roleData.value.name;
  updateData.value.menu = roleData.value.menu;
  setCheckedKeys(updateData.value.menu);
  // 获取权限数据
  getMenuList().then(res => {
    treedata.value = handleTree(res.data, "id", "parent", "children"); // 处理列表成树形数据
  });
}

watch(
  () => props.isVisible,
  newVal => {
    isVisible.value = newVal;
  }
);
</script>

<style lang="scss" scoped>
// 穿透el-drawer__header样式
:deep(.el-drawer__header) {
  margin-bottom: 0 !important;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  // justify-content: space-between;
  width: 100%;
  gap: 5px;
}
</style>
