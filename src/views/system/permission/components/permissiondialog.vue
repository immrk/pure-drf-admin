<template>
  <el-dialog v-model="dialogVisible" :title="props.isEditMode ? '编辑菜单/权限' : '创建菜单/权限'" :width="deviceDetection() ? '90%' : '50%'" @open="handleOpen" @close="handleCancel">
    <!-- 通用表单 -->
    <el-form ref="menuForm" :model="menuData" :rules="rules" label-width="80px" label-position="left">
      <el-form-item v-if="props.isEditMode" prop="id" label="ID">
        <el-input v-model="menuData.id" disabled />
      </el-form-item>
      <el-form-item prop="menu_type" label="分类">
        <el-radio-group v-model="menuData.menu_type" is-button>
          <el-radio-button label="菜单" :value="1" />
          <el-radio-button label="权限" :value="2" />
          <el-radio-button label="直链" :value="0" />
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="name" label="名称">
        <el-input v-model="menuData.name" />
      </el-form-item>
      <el-form-item v-if="menuData.menu_type == 2" label="权限代码" prop="code">
        <el-input v-model="menuData.code" placeholder="请输入权限唯一标识代码" />
      </el-form-item>
      <el-form-item v-if="menuData.menu_type == 2" prop="path" label="接口地址">
        <el-input v-model="menuData.path" />
      </el-form-item>
      <el-form-item v-if="menuData.menu_type != 2" prop="path" label="路由地址">
        <el-input v-model="menuData.path" />
      </el-form-item>
      <el-form-item v-if="menuData.menu_type != 2" prop="component" label="组件地址">
        <el-input v-model="menuData.component" />
      </el-form-item>
      <el-form-item v-if="menuData.menu_type != 2" prop="redirect" label="重定向">
        <el-input v-model="menuData.redirect" />
      </el-form-item>
      <el-form-item label="父级菜单" prop="parent">
        <el-cascader v-model="menuData.parent" :options="props.menuTree" :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true }" clearable filterable placeholder="无父级菜单" />
      </el-form-item>
      <el-form-item label="激活状态" prop="status">
        <el-switch v-model="menuData.status" :active-value="true" :inactive-value="false" />
      </el-form-item>
    </el-form>
    <!-- meta表单 -->
    <el-form v-if="menuData.menu_type == 1" ref="menuMetaForm" :model="menuMetaData" :rules="rules" label-width="80px" label-position="left">
      <div class="split">
        <p class="title">菜单详情</p>
        <div class="line" />
      </div>
      <el-form-item prop="meta.title" label="菜单标题">
        <el-input v-model="menuMetaData.title" />
      </el-form-item>
      <el-form-item label="显示菜单" prop="showLink">
        <el-switch v-model="menuMetaData.showLink" :active-value="true" :inactive-value="false" />
      </el-form-item>
      <el-form-item label="菜单排序" prop="rank">
        <el-input-number v-model="menuMetaData.rank" :value-on-clear="0" />
      </el-form-item>
      <el-form-item label="菜单图标" prop="icon">
        <IconSelect v-model="menuMetaData.icon" class="w-[200px]" />
      </el-form-item>
      <el-form-item label="显示父级" prop="showParent">
        <el-switch v-model="menuMetaData.showParent" :active-value="true" :inactive-value="false" />
      </el-form-item>
      <el-form-item label="页面缓存" prop="keepAlive">
        <el-switch v-model="menuMetaData.keepAlive" :active-value="true" :inactive-value="false" />
      </el-form-item>
      <el-form-item label="标签隐藏" prop="hiddenTag">
        <el-switch v-model="menuMetaData.hiddenTag" :active-value="true" :inactive-value="false" />
      </el-form-item>
      <el-form-item label="标签固定" prop="fixedTag">
        <el-switch v-model="menuMetaData.fixedTag" :active-value="true" :inactive-value="false" />
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
import { IconSelect } from "@/components/ReIcon";

const menuForm = ref();

// 接收父组件传递的 props
const props = defineProps({
  visible: Boolean,
  menu: Object,
  isEditMode: Boolean,
  menuTree: Array
});

const emit = defineEmits(["update:visible", "save", "cancel"]);

// 本地状态和引用
const dialogVisible = ref(props.visible);
const menuData = ref({}); // 创建一个可变的本地用户数据对象
const menuMetaData = ref({});
// 打开对话框时，重置用户数据
const handleOpen = () => {
  menuData.value = cloneDeep(props.menu);
  menuMetaData.value = menuData.value.meta;
};

// 处理确认操作
const handleConfirm = () => {
  menuForm.value.validate(valid => {
    if (valid) {
      emit("save", props.isEditMode ? "update" : "create", menuData.value); // 向父组件发送保存事件并传递用户数据
      dialogVisible.value = false; // 关闭对话框
      emit("update:visible", false);
    } else {
      message("请按规则填写", { type: "error" });
    }
  });
};

// 处理取消操作
const handleCancel = () => {
  menuForm.value.resetFields(); // 还原表单并清除错误提示信息
  emit("cancel"); // 向父组件发送取消事件
  dialogVisible.value = false; // 关闭对话框
  emit("update:visible", false);
};

// 表单校验规则
const rules = {
  name: [
    { required: true, message: "请输入菜单/权限名称", trigger: "blur" },
    { min: 2, max: 20, message: "菜单/权限名称长度限制2-20", trigger: "blur" }
  ],
  rank: { required: true, message: "请设置菜单/权限排序", trigger: "blur" },
  code: [
    { required: true, message: "请设置权限唯一标识代码", trigger: "blur" },
    { min: 2, max: 50, message: "权限标识限制2-50个字符", trigger: "blur" }
    // { pattern: /^\w+$/, message: "请输入字母/数字/下划线", trigger: "blur" }
  ],
  type: { required: true, message: "请选择菜单/权限类型", trigger: "blur" }
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

.split {
  display: flex;
  align-items: center;
  padding: 5px 0;
}

.split .title {
  white-space: nowrap;
}

.split .line {
  height: 1px;
  width: 100%;
  background-color: #cccccc;
}
</style>
