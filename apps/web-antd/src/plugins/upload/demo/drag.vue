<template>
  <div>
    <el-divider content-position="left"> 拖拽排序 </el-divider>
    <cl-upload draggable multiple />
  </div>

  <div>
    <el-divider content-position="left"> 拖拽上传 </el-divider>
    <cl-upload :size="[160, 300]" drag />
  </div>
</template>
