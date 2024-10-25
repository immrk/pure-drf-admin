<template>
  <el-dialog v-model="dialogVisible" :title="props.isEditMode ? '编辑角色' : '创建角色'" :width="deviceDetection() ? '90%' : '50%'" @open="handleOpen" @close="handleCancel">
    <el-form ref="roleForm" :model="roleData" :rules="rules" label-width="80px" label-position="left">
      <el-form-item v-if="props.isEditMode" prop="id" label="角色ID">
        <el-input v-model="roleData.id" disabled />
      </el-form-item>
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="roleData.name" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="角色代码" prop="code">
        <el-input v-model="roleData.code" placeholder="请输入角色唯一标识代码" />
      </el-form-item>
      <!-- 父级角色 -->
      <el-form-item label="父级角色" prop="parent">
        <el-cascader v-model="roleData.parent" :options="props.roleTree" :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true }" clearable filterable placeholder="无父级角色" />
      </el-form-item>
      <el-form-item label="激活状态" prop="status">
        <el-switch v-model="roleData.status" :active-value="true" :inactive-value="false" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { cloneDeep, deviceDetection } from "@pureadmin/utils";
import { message } from "@/utils/message";

const roleForm = ref();

// 接收父组件传递的 props
const props = defineProps({
  visible: Boolean,
  role: Object,
  isEditMode: Boolean,
  roleTree: Array
});

const emit = defineEmits(["update:visible", "save", "cancel"]);

// 本地状态和引用
const dialogVisible = ref(props.visible);
const roleData = ref({}); // 创建一个可变的本地用户数据对象

// 打开对话框时，重置用户数据
const handleOpen = () => {
  roleData.value = cloneDeep(props.role);
};

// 处理确认操作
const handleConfirm = () => {
  roleForm.value.validate(valid => {
    if (valid) {
      emit("save", props.isEditMode ? "update" : "create", roleData.value); // 向父组件发送保存事件并传递用户数据
      dialogVisible.value = false; // 关闭对话框
      emit("update:visible", false);
    } else {
      message("请按规则填写", { type: "error" });
    }
  });
};

// 处理取消操作
const handleCancel = () => {
  roleForm.value.resetFields(); // 还原表单并清除错误提示信息
  emit("cancel"); // 向父组件发送取消事件
  dialogVisible.value = false; // 关闭对话框
  emit("update:visible", false);
};

// 表单校验规则
const rules = {
  name: [
    { required: true, message: "请输入角色名称", trigger: "blur" },
    { min: 2, max: 10, message: "角色名称长度限制2-10", trigger: "blur" }
  ],
  code: [
    { required: true, message: "请设置角色唯一标识代码", trigger: "blur" },
    { min: 2, max: 15, message: "角色代码限制2-15个字符", trigger: "blur" },
    { pattern: /^\w+$/, message: "请输入字母/数字/下划线", trigger: "blur" }
  ]
};

watch(
  () => props.visible,
  newVal => {
    dialogVisible.value = newVal;
  }
);
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
}
</style>
