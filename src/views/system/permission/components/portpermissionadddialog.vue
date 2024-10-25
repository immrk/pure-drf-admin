<template>
  <el-dialog v-model="dialogVisible" title="创建接口权限" @open="handelOpen()" @close="handleClose()">
    <div>
      <p>接口地址：</p>
      <el-input v-model="url" placeholder="例:/api/test/permission/ 请输入需要创建权限的接口地址" />
      <span>该操作将一键为指定接口创建增删改查四个接口权限；<br />角色若未被分配对应权限将无法调用对应接口</span>
    </div>
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
import { message } from "@/utils/message";
import { postMenu } from "@/api/system";
import { cloneDeep } from "@pureadmin/utils";

// 接收父组件传递的 props
const props = defineProps({
  visible: Boolean,
  parent: String
});

const emit = defineEmits(["update:visible", "savesuccess"]);
const url = ref("");

const dialogVisible = ref(props.visible);
const parent = ref(props.parent);

const addlist = ref([]);
const addlistInitData = [
  {
    name: "查看",
    code: ":read",
    menu_type: 2,
    path: "",
    status: true,
    parent: "",
    meta: {
      showLink: true,
      showParent: true,
      keepAlive: false,
      hiddenTag: false,
      fixedTag: false,
      rank: 9995
    }
  },
  {
    name: "新增",
    code: ":add",
    menu_type: 2,
    path: "",
    status: true,
    parent: "",
    meta: {
      showLink: true,
      showParent: true,
      keepAlive: false,
      hiddenTag: false,
      fixedTag: false,
      rank: 9996
    }
  },
  {
    name: "修改",
    code: ":change",
    menu_type: 2,
    path: "",
    status: true,
    parent: "",
    meta: {
      showLink: true,
      showParent: true,
      keepAlive: false,
      hiddenTag: false,
      fixedTag: false,
      rank: 9997
    }
  },
  {
    name: "删除",
    code: ":delete",
    menu_type: 2,
    path: "",
    status: true,
    parent: "",
    meta: {
      showLink: true,
      showParent: true,
      keepAlive: false,
      hiddenTag: false,
      fixedTag: false,
      rank: 9998
    }
  }
];

// 处理确认操作
const handleConfirm = () => {
  if (url.value === "") {
    message("请输入接口地址", { type: "error" });
    return;
  }
  // 确保每次确认时都使用初始数据
  addlist.value = addlistInitData.map(item => {
    return {
      ...item, // 复制初始数据的所有属性
      parent: parent.value,
      path: url.value,
      code: url.value + item.code // 只拼接一次url
    };
  });
  postMenu(addlist.value)
    .then(res => {
      emit("savesuccess");
      emit("update:visible", false);
      message(res.msg, { type: "success" });
    })
    .catch(res => {
      // 数据重置
      addlist.value = cloneDeep(addlistInitData);
      message(res.response.data.msg, { type: "error" });
    });
};

// 处理取消操作
const handleCancel = () => {
  emit("update:visible", false);
};

// 打开弹窗时初始化数据
const handelOpen = () => {
  url.value = "";
};

// 关闭弹窗时清空数据
const handleClose = () => {
  url.value = "";
  emit("update:visible", false);
};

watch(
  () => props.visible,
  newVal => {
    dialogVisible.value = newVal;
  }
);

watch(
  () => props.parent,
  newVal => {
    parent.value = newVal;
  }
);
</script>

<style lang="scss" scoped></style>
