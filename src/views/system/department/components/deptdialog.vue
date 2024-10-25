<template>
  <el-dialog v-model="dialogVisible" :title="props.isEditMode ? '编辑部门' : '创建部门'" :width="deviceDetection() ? '90%' : '50%'" @open="handleOpen" @close="handleCancel">
    <el-form ref="deptForm" :model="deptData" :rules="rules" label-width="80px" label-position="left">
      <el-form-item v-if="props.isEditMode" prop="id" label="部门ID">
        <el-input v-model="deptData.id" disabled />
      </el-form-item>
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="deptData.name" placeholder="请输入部门名称" />
      </el-form-item>
      <el-form-item label="部门排序" prop="rank">
        <el-input-number v-model="deptData.rank" :value-on-clear="0" />
      </el-form-item>
      <el-form-item label="部门代码" prop="code">
        <el-input v-model="deptData.code" placeholder="请输入部门唯一标识代码" />
      </el-form-item>
      <el-form-item label="部门类型" prop="type">
        <el-select v-model="deptData.type" placeholder="请选择" clearable>
          <el-option label="公司" :value="1" />
          <el-option label="分公司" :value="2" />
          <el-option label="部门" :value="3" />
          <el-option label="其他" :value="4" />
        </el-select>
      </el-form-item>
      <!-- 父级部门 -->
      <el-form-item label="父级部门" prop="parent">
        <el-cascader v-model="deptData.parent" :options="props.deptTree" :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true }" clearable filterable placeholder="无父级部门" />
      </el-form-item>
      <el-form-item label="激活状态" prop="status">
        <el-switch v-model="deptData.status" :active-value="true" :inactive-value="false" />
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

const deptForm = ref();

// 接收父组件传递的 props
const props = defineProps({
  visible: Boolean,
  dept: Object,
  isEditMode: Boolean,
  deptTree: Array
});

const emit = defineEmits(["update:visible", "save", "cancel"]);

// 本地状态和引用
const dialogVisible = ref(props.visible);
const deptData = ref({}); // 创建一个可变的本地用户数据对象

// 打开对话框时，重置用户数据
const handleOpen = () => {
  deptData.value = cloneDeep(props.dept);
};

// 处理确认操作
const handleConfirm = () => {
  deptForm.value.validate(valid => {
    if (valid) {
      emit("save", props.isEditMode ? "update" : "create", deptData.value); // 向父组件发送保存事件并传递用户数据
      dialogVisible.value = false; // 关闭对话框
      emit("update:visible", false);
    } else {
      message("请按规则填写", { type: "error" });
    }
  });
};

// 处理取消操作
const handleCancel = () => {
  deptForm.value.resetFields(); // 还原表单并清除错误提示信息
  emit("cancel"); // 向父组件发送取消事件
  dialogVisible.value = false; // 关闭对话框
  emit("update:visible", false);
};

// 表单校验规则
const rules = {
  name: [
    { required: true, message: "请输入部门名称", trigger: "blur" },
    { min: 2, max: 10, message: "部门名称长度限制2-10", trigger: "blur" }
  ],
  rank: { required: true, message: "请设置部门排序", trigger: "blur" },
  code: [
    { required: true, message: "请设置部门唯一标识代码", trigger: "blur" },
    { min: 2, max: 50, message: "部门名称限制2-50", trigger: "blur" },
    { pattern: /^\w+$/, message: "请输入字母/数字/下划线", trigger: "blur" }
  ],
  type: { required: true, message: "请选择部门类型", trigger: "blur" }
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
