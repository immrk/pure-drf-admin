<template>
  <el-dialog v-model="dialogVisible" :title="props.isEditMode ? '编辑用户' : '创建用户'" :width="deviceDetection() ? '90%' : '50%'" @open="handleOpen" @close="handleCancel">
    <el-form ref="userForm" :rules="isEditMode ? rules_edit : rules_create" :model="userData" label-width="80px" label-position="left">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="userData.username" />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="userData.nickname" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="userData.email" />
      </el-form-item>
      <el-form-item :label="props.isEditMode ? '重设密码' : '设置密码'" prop="password">
        <el-input v-model="userData.password" type="password" />
      </el-form-item>
      <el-form-item label="所属用户" prop="dept">
        <el-cascader v-model="userData.dept" :options="deptData" :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true }" clearable filterable placeholder="无所属用户" />
      </el-form-item>
      <el-form-item label="分配角色" prop="role">
        <el-cascader v-model="userData.role" :options="rolesData" :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true, multiple: true }" clearable filterable placeholder="未分配角色" />
      </el-form-item>
      <el-form-item label="激活状态" prop="status">
        <el-switch v-model="userData.status" :active-value="true" :inactive-value="false" />
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
import { ref, watch, onMounted } from "vue";
import { cloneDeep, deviceDetection } from "@pureadmin/utils";
import { message } from "@/utils/message";
import { getRoleList } from "@/api/system";
import { handleTree } from "@/utils/tree";

// 接收父组件传递的 props
const props = defineProps({
  visible: Boolean,
  user: Object,
  isEditMode: Boolean,
  treeData: Array
});

const emit = defineEmits(["update:visible", "save", "cancel"]);

// 本地状态和引用
const dialogVisible = ref(props.visible);
const userData = ref({}); // 创建一个可变的本地用户数据对象
const deptData = ref([]);
const rolesData = ref([]);
const userForm = ref();

// 打开对话框时，重置用户数据
const handleOpen = () => {
  userData.value = cloneDeep(props.user);
  deptData.value = cloneDeep(props.treeData);
  getRoleList().then(res => {
    rolesData.value = handleTree(res.data, "id", "parent", "children");
  });
};

// 处理确认操作
const handleConfirm = () => {
  userForm.value.validate(valid => {
    emit("save", props.isEditMode ? "update" : "create", userData.value); // 向父组件发送保存事件并传递用户数据
    dialogVisible.value = false; // 关闭对话框
    emit("update:visible", false);
  });
};

// 处理取消操作
const handleCancel = () => {
  userForm.value.resetFields(); // 还原表单并清除错误提示信息
  emit("cancel"); // 向父组件发送取消事件
  dialogVisible.value = false; // 关闭对话框
  emit("update:visible", false);
};

// 表单校验规则
const rules_create = {
  username: [
    { required: true, message: "请输入用户名称", trigger: "blur" },
    { min: 2, max: 10, message: "用户名称长度限制2-10", trigger: "blur" }
  ],
  nickname: [{ min: 2, max: 10, message: "昵称长度限制2-10", trigger: "blur" }],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }
  ]
};

const rules_edit = {
  username: [
    { required: true, message: "请输入用户名称", trigger: "blur" },
    { min: 2, max: 10, message: "用户名称长度限制2-10", trigger: "blur" }
  ],
  nickname: [{ min: 2, max: 10, message: "昵称长度限制2-10", trigger: "blur" }],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }
  ],
  password: [{ min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }]
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
