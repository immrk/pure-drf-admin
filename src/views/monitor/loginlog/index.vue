<template>
  <div class="maincontent">
    <!-- 筛选搜索区域 -->
    <el-form ref="formRef" :inline="true" :model="form" class="searchform">
      <el-form-item label="用户名称：" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名称" clearable class="!w-[180px]" />
      </el-form-item>
      <el-form-item label="登录状态：" prop="status">
        <el-select v-model="form.status" placeholder="请选择" clearable class="!w-[180px]">
          <el-option label="成功" value="1" />
          <el-option label="失败" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon('ri:search-line')" :loading="loading" @click="onSearch"> 搜索 </el-button>
        <el-button :icon="useRenderIcon('ri:refresh-line')" @click="resetForm(formRef)"> 重置 </el-button>
        <el-button :icon="useRenderIcon('ri:delete-bin-2-line')" type="danger" @click="clearall()"> 清空日志 </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格数据区域 -->
    <div ref="tableContainer" class="table">
      <el-table :data="dataList" class="el-table" :height="tableMaxHeight" :show-overflow-tooltip="true">
        <el-table-column prop="id" label="ID" align="center" />
        <el-table-column prop="username" label="登录用户名/邮箱" align="center" min-width="120px" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'">{{ row.status ? "成功" : "失败" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="登陆时间" align="center" min-width="150px" />
        <el-table-column prop="ip" label="IP地址" align="center" />
        <el-table-column prop="location" label="地理位置" align="center" />
        <el-table-column prop="agent" label="设备" align="center" />
        <el-table-column prop="browser" label="浏览器" align="center" />
        <el-table-column prop="os" label="操作系统" align="center" />
        <el-table-column prop="login_type" label="登录方式" align="center" />
      </el-table>
      <el-pagination v-model:current-page="form.page" v-model:page-size="form.size" :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { getLoginlog, deleteAllLoginlog } from "@/api/monitor";
import { message } from "@/utils/message";
import { ElMessage, ElMessageBox } from "element-plus";

defineOptions({
  name: "usermanage"
});

const formRef = ref(null);

// 筛选过滤器数据
const form = reactive({
  username: "",
  status: "",
  page: 1,
  size: 10
});
const total = ref(0);

function handleSizeChange(size) {
  form.size = size;
  onSearch();
}

function handleCurrentChange(page) {
  form.page = page;
  onSearch();
}

// 表格数据
const dataList = ref([]);
const tableMaxHeight = ref(0); // 表格最大高度
const tableContainer = ref(null); // 通过ref获取DOM元素
const loading = ref(false);

// 搜索数据函数
async function onSearch() {
  loading.value = true;
  // 获取日志数据，赋值dataList和分页
  await getLoginlog(form).then(res => {
    dataList.value = res.data;
    total.value = res.total;
    form.page = res.page;
    form.size = res.limit;
    loading.value = false;
  });
}

// 重置表单函数
const resetForm = formEl => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

// 清空日志
const clearall = () => {
  ElMessageBox.confirm("此操作将清空所有登录日志, 不可恢复！ 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteAllLoginlog().then(res => {
      onSearch();
      message(res.msg, { type: "success" });
    });
  });
};

// 计算表格高度的函数
const calculateTableHeight = () => {
  nextTick(() => {
    if (tableContainer.value) {
      // 获取父容器的高度
      const parentHeight = tableContainer.value.clientHeight;
      tableMaxHeight.value = parentHeight - 50; // 设置表格最大高度
    }
  });
};

onMounted(async () => {
  // 计算表格高度的函数并挂载监听事件
  calculateTableHeight();
  window.addEventListener("resize", calculateTableHeight);
  // 搜索数据
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
  .el-pagination {
    width: 100%;
    position: absolute;
    display: flex;
    justify-content: center;
    bottom: 0;
    height: 50px;
  }
}

.ellink {
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>
