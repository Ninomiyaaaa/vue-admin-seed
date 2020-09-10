<template>
  <div class="app-container">
    <div class="page-main-container">
      <el-form ref="form" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Activity name" prop="name">
          <el-input v-model="form.name"/>
        </el-form-item>
        <el-form-item label="Activity zone">
          <el-select v-model="form.region" placeholder="please select your zone">
            <el-option label="Zone one" value="shanghai"/>
            <el-option label="Zone two" value="beijing"/>
          </el-select>
        </el-form-item>
        <el-form-item label="Activity time">
          <el-date-picker v-model="form.date" type="date" placeholder="Pick a date"/>
        </el-form-item>
        <el-form-item label="Instant delivery">
          <el-switch v-model="form.delivery"/>
        </el-form-item>
        <el-form-item label="Activity type">
          <el-checkbox-group v-model="form.type">
            <el-checkbox label="Online activities" name="type"/>
            <el-checkbox label="Promotion activities" name="type"/>
            <el-checkbox label="Offline activities" name="type"/>
            <el-checkbox label="Simple brand exposure" name="type"/>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="Resources">
          <el-radio-group v-model="form.resource">
            <el-radio label="Sponsor"/>
            <el-radio label="Venue"/>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Activity form">
          <el-input v-model="form.desc" type="textarea" :rows="5" maxlength="128" show-word-limit/>
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
  export default {
    data() {
      return {
        loading: false,
        form: {
          name: '',
          region: '',
          date: '',
          delivery: false,
          type: [],
          resource: '',
          desc: '',
        },
        rules: {
          name: [
            { required: true, message: '请输入姓名', trigger: 'blur' },
          ],
        },
        isAdd: false,
      }
    },
    methods: {
      onConfirm() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            this.loading = true
            this.isAdd ? this.submitAdd() : this.submitEditor()
          }
        })
      },
      onCancel() {
        this.$router.go(-1)
      },
      submitAdd() {
        const params = { ...this.form }
        delete params.id
        /*apiAdd(params).then(() => {
          this.handleSuccess()
        }).catch(() => {
          this.loading = false
        })*/
      },
      submitEditor() {
        const params = { ...this.formData }
        /*apiUpdate(params).then(() => {
          this.handleSuccess()
        }).catch(() => {
          this.loading = false
        })*/
      },
      handleSuccess() {
        this.loading = false
        this.$notify({ title: '消息', message: '操作成功', type: 'success' })
        this.$router.go(-1)
      },
    },
  }
</script>

<style scoped>

</style>

