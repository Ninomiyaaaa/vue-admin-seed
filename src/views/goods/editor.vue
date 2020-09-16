<template>
  <div class="app-container" v-loading="loading">
    <div class="page-main-container">
      <el-form ref="form" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="商品名" prop="name">
          <el-input v-model="form.name" maxlength="32" placeholder="请输入商品名"/>
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :precision="0" :min="0" :max="9999"/>
        </el-form-item>
        <el-form-item label="单价" prop="price">
          <el-input-number v-model="form.price" :precision="2" :min="0.01" :max="999999.99" :controls="false"/>
        </el-form-item>
      </el-form>
    </div>

    <div class="page-bottom-container">
      <el-button type="primary" @click="onConfirm">确 定</el-button>
      <el-button @click="onCancel">取 消</el-button>
    </div>
  </div>
</template>

<script>
  import { goodsAdd, goodsUpdate, goodsQuery } from '@/api/apiGoods'

  export default {
    data() {
      return {
        loading: false,
        form: {
          name: '',
          stock: 0,
          price: 0,
        },
        rules: {
          name: [
            { required: true, message: '请输入商品名', trigger: 'blur' },
          ],
          stock: [
            { required: true, message: '请输入库存', trigger: 'blur' },
          ],
          price: [
            { required: true, message: '请输入单价', trigger: 'blur' },
          ],
        },
        isAdd: false,
      }
    },
    mounted() {
      this.isAdd = !this.$route.query.id
      if (!this.isAdd) {
        this.getDetail()
      }
    },
    methods: {
      onConfirm() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            this.loading = true
            const params = { ...this.form }
            params.price = params.price * 100
            this.isAdd ? this.submitAdd(params) : this.submitEditor(params)
          }
        })
      },
      onCancel() {
        this.$router.go(-1)
      },
      submitAdd(params) {
        delete params.id
        goodsAdd(params).then(() => {
          this.handleSuccess()
        }).catch(() => {
          this.loading = false
        })
      },
      submitEditor(params) {
        goodsUpdate(params).then(() => {
          this.handleSuccess()
        }).catch(() => {
          this.loading = false
        })
      },
      handleSuccess() {
        this.loading = false
        this.$notify({ title: '消息', message: '操作成功', type: 'success' })
        this.$router.go(-1)
      },
      getDetail() {
        this.loading = true
        goodsQuery({ id: this.$route.query.id }).then(res => {
          this.loading = false
          res.data.price = (res.data.price / 100).toFixed(2)
          this.form = {
            ...res.data,
            id: this.$route.query.id,
          }
        }).catch(() => {
          this.loading = false
        })
      },
    },
  }
</script>

<style scoped>

</style>

