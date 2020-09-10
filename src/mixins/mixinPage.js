/**
 * mixin 翻页引入 需要重写的变量
 * pageApi => 翻页api
 * search  => 搜索条件
 */
import { parseTime } from '@/utils/index'

export default {
  data() {
    return {
      loading: false, // 加载loading
      // 分页
      pagination: {
        current: 1, // 当前页
        sizes: [10, 20, 30, 50, 100], // 页面条数控制
        size: 10, // 每页条数控制
        total: 0, // 总条数
        totalPage: 0, // 总页数
        pagerCount: 5, // 多少条开始省略翻页
      },
      tableData: [], //表单数据
      multipleSelection: [], // 多选数据
      sortCondition: {
        property: '',
        mode: '',
      },
      /**可替换变量 */
      search: {}, // 搜索条件
      deleteKey: 'ids', // 删除的key
      deleteArrKey: 'id', // 删除对象的id
      listApi: new Promise(() => {
      }), // 分页调用的api
      deleteApi: new Promise(() => {
      }), // 删除分页数据
    }
  },
  filters: {
    timeFilter(timeStamp) {
      return parseTime(timeStamp) || '--'
    },
    priceFilter(val) {
      return (val / 100).toFixed(2) === 'NaN' ? '--' : (val / 100).toFixed(2)
    },
  },
  methods: {
    // 重新获取页面数据
    initList() {
      this.loading = true
      this.pagination.current = 1
      this.getList()
        .then(() => {
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    // 获取页面数据
    getList() {
      return new Promise((resolve, reject) => {
        let params = {
          pageNum: this.pagination.current,
          pageSize: this.pagination.size,
          property: this.sortCondition.property,
          mode: this.sortCondition.mode,
        }
        if (this.sortCondition.property && !params.mode) {
          params.mode = true
        }
        params = Object.assign(params, this.search)
        this.listApi(params)
          .then(res => {
            this.tableData = res.data.list
            this.pagination.total = res.data.totalCount
            this.pagination.totalPage = res.data.totalPage
            resolve(res)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    // 设置每页条数
    handleSizeChange(val) {
      this.pagination.size = val
      this.initList()
    },
    // 设置当前页数
    handleCurrentChange(val) {
      this.pagination.current = val
      this.loading = true
      this.getList()
        .then(() => {
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    // 批量全选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 时间排序
    sortChange(column) {
      this.sortCondition.property = column.prop
      switch (column.order) {
        case 'ascending':
          this.sortCondition.mode = true
          break
        case 'descending':
          this.sortCondition.mode = false
          break
        default:
          this.sortCondition.mode = ''
      }
      this.initList()
    },
    // 删除
    deleteData(arr) {
      let ids = []
      if (typeof arr === 'string') {
        ids = [arr]
      } else {
        if (arr.length < 1) {
          this.$message.warning('至少需要选择一条数据进行删除！')
          return false
        } else {
          ids = arr.map(item => {
            return item[this.deleteArrKey]
          })
        }
      }
      this.loading = true
      const params = {}
      params[this.deleteKey] = ids.join(',')
      this.deleteApi(params)
        .then(() => {
          const pg = this.pagination
          const totalPage = Math.ceil((pg.total - ids.length) / pg.size)
          if (pg.current > totalPage) {
            pg.current = totalPage || 1
          }
          this.getList()
            .then(() => {
              this.$notify({
                title: '消息',
                message: '删除成功',
                type: 'success',
              })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        })
        .catch(() => {
          this.loading = false
        })
    },
  },
}
