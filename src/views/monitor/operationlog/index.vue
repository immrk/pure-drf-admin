<template>
  <div class="maincontent">
    <!-- 筛选搜索区域 -->
    <el-form ref="formRef" :inline="true" :model="form" class="searchform">
      <el-form-item label="操作用户名：" prop="creator">
        <el-input v-model="form.creator" placeholder="请输入用户名称" clearable class="!w-[180px]" />
      </el-form-item>
      <el-form-item label="操作状态：" prop="status">
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
        <el-table-column prop="creator" label="操作用户" align="center" />
        <el-table-column prop="request_ip" label="IP" align="center" />
        <el-table-column prop="request_method" label="请求方法" align="center" />
        <el-table-column prop="request_modular" label="请求模块" align="center" />
        <el-table-column prop="request_path" label="请求路径" align="center" min-width="100px" />
        <el-table-column prop="request_os" label="系统" align="center" />
        <el-table-column prop="request_browser" label="浏览器" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'">{{ row.status ? "成功" : "失败" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="response_code" label="响应代码" align="center" />
        <el-table-column prop="create_time" label="操作时间" align="center" min-width="150px" />
        <el-table-column fixed="right" label="操作" align="center">
          <template #default="scope">
            <el-link type="primary" @click="showdetail(scope.row)">详情</el-link>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="form.page" v-model:page-size="form.size" :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="操作日志详情" width="50%" center>
      <!-- 绘制一个左右两列的表格样式，显示请求数据 -->
      <el-row>
        <el-col :span="12">
          <el-form label-width="100px">
            <el-form-item label="操作用户：" :label-width="null">
              <el-input v-model="rowdetail.creator" disabled />
            </el-form-item>
            <el-form-item label="IP地址：" :label-width="null">
              <el-input v-model="rowdetail.request_ip" disabled />
            </el-form-item>
            <el-form-item label="请求方法：" :label-width="null">
              <el-input v-model="rowdetail.request_method" disabled />
            </el-form-item>
            <el-form-item label="请求模块：" :label-width="null">
              <el-input v-model="rowdetail.request_modular" disabled />
            </el-form-item>
            <el-form-item label="请求路径：" :label-width="null">
              <el-input v-model="rowdetail.request_path" disabled />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form label-width="100px">
            <el-form-item label="系统：" :label-width="null">
              <el-input v-model="rowdetail.request_os" disabled />
            </el-form-item>
            <el-form-item label="浏览器：" :label-width="null">
              <el-input v-model="rowdetail.request_browser" disabled />
            </el-form-item>
            <el-form-item label="状态：" :label-width="null">
              <!-- <el-input v-model="rowdetail.status" disabled /> -->
              <el-tag :type="rowdetail.status ? 'success' : 'danger'">{{ rowdetail.status ? "成功" : "失败" }}</el-tag>
            </el-form-item>
            <el-form-item label="响应代码：" :label-width="null">
              <el-input v-model="rowdetail.response_code" disabled />
            </el-form-item>
            <el-form-item label="操作时间：" :label-width="null">
              <el-input v-model="rowdetail.create_time" disabled />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <!-- 绘制横向布局的两个json显示框，分别显示请求内容和响应内容 -->
      <el-row>
        <el-col :span="12">
          <el-form label-width="100px">
            <el-form-item label="请求内容：" :label-width="null">
              <vue-json-pretty showLineNumber :deep="1" :data="rowdetail.request_body" class="jsoncontainer" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form label-width="100px">
            <el-form-item label="响应内容：" :label-width="null">
              <vue-json-pretty showLineNumber :deep="1" :data="rowdetail.json_result" class="jsoncontainer" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { getOperationlog, deleteAllOperationlog } from "@/api/monitor";
import { message } from "@/utils/message";
import { ElMessage, ElMessageBox } from "element-plus";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

defineOptions({
  name: "usermanage"
});

const formRef = ref(null);
const detailVisible = ref(false);
const rowdetail = ref(null);

// 筛选过滤器数据
const form = reactive({
  creator: "",
  status: "",
  page: 1,
  size: 20
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
  await getOperationlog(form).then(res => {
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
    deleteAllOperationlog().then(res => {
      onSearch();
      message(res.msg, { type: "success" });
    });
  });
};

// 显示详情
const showdetail = row => {
  rowdetail.value = row;
  detailVisible.value = true;
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

.jsoncontainer {
  max-height: 300px;
  width: 100%;
  overflow: auto;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f5f7fa;
  margin: 10px;
  .json-pretty {
    font-size: 12px;
  }
}
</style>
