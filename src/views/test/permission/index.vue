<template>
  <div class="maincontent">
    <!-- 路由权限 -->
    <!-- 组件方法：权限 -->
    <Auth value="/api/test/permission/:read">
      <el-card shadow="never">
        <p>组件方法：当前页面拥有权限 /api/test/permission/:read 可见</p>
        <p>Auth value="/api/test/permission/:read"</p>
      </el-card>
    </Auth>
    <div style="height: 10px" />
    <!-- 函数方法 -->
    <el-card v-if="hasAuth('/api/test/permission/:read')" shadow="never">
      <p>函数方法：当前页面拥有权限 /api/test/permission/:read 可见</p>
      <p>v-if="hasAuth('/api/test/permission/:read')"</p>
    </el-card>
    <div style="height: 10px" />
    <!-- 指令方法 -->
    <el-card v-auth="'/api/test/permission/:read'" shadow="never">
      <p>指令方法：当前页面拥有权限 /api/test/permission/:read 可见</p>
      <p>v-auth="'/api/test/permission/:read'"</p>
    </el-card>
    <div style="height: 10px" />
    <!-- 后端接口权限测试 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>后端接口权限测试</span>
        </div>
      </template>
      <div class="button-content">
        <p>装饰器方法：拥有/api/test/permission/:read可成功回调</p>
        <el-button type="primary" @click="getData">/api/test/permission/:read</el-button>
      </div>
      <div class="button-content">
        <p>permission_classes方法：拥有/api/test/permission2/:read可成功回调</p>
        <el-button type="primary" @click="getData2">/api/test/permission2/:read</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { hasAuth, getAuths } from "@/router/utils";
import { getTestPermission, getTestPermission2 } from "@/api/test";
import { message } from "@/utils/message";
import { ref } from "vue";

const getData = () => {
  getTestPermission()
    .then(res => {
      message(res.msg, { type: "success" });
    })
    .catch(err => {
      message(err.response.data.msg, { type: "error" });
    });
};

const getData2 = () => {
  getTestPermission2()
    .then(res => {
      message(res.msg, { type: "success" });
    })
    .catch(err => {
      message(err.response.data.msg, { type: "error" });
    });
};
</script>

<style scoped></style>
