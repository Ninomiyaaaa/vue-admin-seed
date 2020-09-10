<template>
  <div class="app-container fullscreen">
    <div class="page-top-container">
      <el-button type="primary" plain icon="el-icon-plus" size="small" @click="redirectToEditor()">新增</el-button>
      <div class="tuh-item">
        <el-popconfirm
          title="确认要批量删除这些数据吗？"
          placement="top"
          transition="el-zoom-in-left"
          @onConfirm="deleteData(multipleSelection)">
          <el-button type="danger" plain size="small" icon="el-icon-delete" slot="reference" :disabled="multipleSelection.length < 1">批量删除</el-button>
        </el-popconfirm>
      </div>
    </div>
    <div class="page-table-container">
      <el-table v-loading="loading" :data="tableData" border height="100%" @sort-change="sortChange" @selection-change="handleSelectionChange">
        <el-table-column type="selection" align="center" width="55"></el-table-column>
        <el-table-column prop="name" label="姓名" min-width="110" align="center"></el-table-column>
        <el-table-column label="创建时间" min-width="110" align="center" sortable>
          <template slot-scope="scope">
            {{ scope.row.time | timeFilter }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="220">
          <template slot-scope="scope">
            <div class="col-operations">
              <el-link icon="el-icon-view">查看</el-link>
              <el-link icon="el-icon-edit" @click="redirectToEditor(scope.row.id)">编辑</el-link>
              <el-popconfirm title="确认要删除这条数据吗？" placement="top" transition="el-zoom-in-left" @onConfirm="deleteData(scope.row.id)">
                <el-link icon="el-icon-delete" slot="reference">删除</el-link>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="page-pagination-container">
      <el-pagination
        background
        :current-page="pagination.current"
        :page-sizes="pagination.sizes"
        :page-size="pagination.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        :pager-count="pagination.pagerCount"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
  import mixin from '@/mixins/mixinPage'

  export default {
    name: 'template-table',
    mixins: [mixin],
    data() {
      return {}
    },
    mounted() {
      this.tableData = [
        { id: '1', name: 'Arashi', time: new Date().getTime() },
      ]
    },
    methods: {
      redirectToEditor(id) {
        this.$router.push({ name: 'templateEditor', query: id ? { id } : null })
      },
    },
  }
</script>

<style lang="scss" scoped>

</style>
