<template>
  <div class="app-upload-img">
    <!-- 类型 -->
    <div class="type-upload" v-if="type === 'list'">
      <div class="list">
        <div class="list-part" v-for="(item, index) in imgList" :key="item.name">
          <el-progress type="circle" :percentage="item.progress" v-show="item.status === 'load'" :width="100"></el-progress>
          <el-image :src="item.url" v-if="item.status === 'success'"/>
          <label class="el-upload-list__item-status-label" v-if="item.status === 'success'">
            <i class="el-icon-check"></i>
          </label>
          <div class="mask">
            <i class="el-icon-zoom-in" @click="onPreview(item.url)" v-show="item.status === 'success'"></i>
            <i class="el-icon-delete" @click="onRemove(index)"></i>
          </div>
        </div>
        <el-upload
          ref="app-upload"
          :action="ossData.host"
          :data="ossData"
          :auto-upload="!this.crop"
          :multiple="!this.crop && multiple"
          :before-upload="beforeHandle"
          :on-success="successHandel"
          :on-error="errorHandel"
          :on-progress="progressImg"
          :on-change="changeHandle"
          :disabled="uploadDisable"
          :show-file-list="false"
          :fileList="uploadList"
          :limit="limit"
          :on-exceed="handleExceed"
          v-show="!(overflow && uploadDisable)"
        >
          <div class="list-part list-icon" :class="uploadDisable ? 'list-disable' : ''">
            <i class="el-icon-plus"></i>
          </div>
        </el-upload>
      </div>
    </div>
    <!-- 类型 end -->
    <!-- 默认类型 -->
    <el-upload
      v-else
      ref="app-upload"
      :action="ossData.host"
      :data="ossData"
      :auto-upload="!this.crop"
      :multiple="!this.crop && multiple"
      :before-upload="beforeHandle"
      :on-success="successHandel"
      :on-error="errorHandel"
      :on-progress="progressImg"
      :on-change="changeHandle"
      :disabled="disabled"
      :show-file-list="false"
    >
      <slot/>
    </el-upload>
    <!-- 默认类型 end -->
    <!-- 裁剪 -->
    <cropper :crop-dialog.sync="cropDialog" :size="dimension" :img="cropImg" :uid="cropUid" @confirm="onCropperConfirm" @close="cropperClose"></cropper>
    <!-- 裁剪 结束 -->
    <!-- 预览图片的弹窗 -->
    <el-dialog :visible.sync="previewShow" class="preview" append-to-body>
      <img :src="previewImg" class="amplimg"/>
    </el-dialog>
    <!-- 预览图片的弹窗 end -->
  </div>
</template>

<script>
  import uuid from '@/utils/uuid'
  import cropper from '@/components/Cropper'

  export default {
    name: 'componentsUploadImg',
    components: {
      cropper,
    },
    props: {
      crop: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      dimension: Array,
      limit: Number,
      type: {
        type: String,
        default: 'plain',
      },
      fileList: {
        type: Array,
        default: () => {
          return []
        },
      },
      overflow: Boolean,
      multiple: Boolean,
    },
    data() {
      return {
        cropImg: '',
        cropDialog: false,
        cropUid: 0,
        imgList: [],
        previewImg: '',
        previewShow: false,
        uploadList: [],
      }
    },
    computed: {
      ossData() {
        return this.$store.getters['app/getOss'] || {}
      },
      uploadDisable() {
        return this.disabled || this.imgList.length === this.limit
      },
    },
    watch: {
      fileList: {
        handler: function(val) {
          this.uploadList = []
          this.imgList = val.map((item, index) => {
            this.uploadList.push({ name: index, url: item })
            return { url: item, progress: 0, status: 'success' }
          })
        },
        deep: true,
      },
    },
    mounted() {
      this.imgList = this.fileList.map((item, index) => {
        this.uploadList.push({ name: index, url: item })
        return { url: item, progress: 0, status: 'success' }
      })
    },
    methods: {
      beforeHandle(file) {
        const isJPGorPNG =
          file.type === 'image/jpeg' ||
          file.type === 'image/png' ||
          file.type === 'image/gif'
        const isLt2M = file.size / 1024 / 1024 < 2
        if (!isJPGorPNG) {
          this.$message.error('上传图片只能是JPG/PNG/GIF格式!')
          return false
        }
        if (!isLt2M) {
          this.$message.error('上传图片大小不能超过 2MB!')
          return false
        }
        const nowDate = new Date().getTime()
        if (nowDate >= this.ossData.finalExpireTimeMillis) {
          return this.$store.dispatch('app/setOssDate').then(() => {
            return this.setImgInfo(file)
          }).catch(() => {
            return false
          })
        } else {
          return this.setImgInfo(file)
        }
      },
      setImgInfo(file) {
        if (this.crop) {
          return true
        }
        return this.getImgWh(file).then(img => {
          const format = file.name.substr(file.name.lastIndexOf('.'))
          this.ossData.key = this.ossData.copyKey + uuid() + `-w${img.width}-h${img.height}${format}`
          this.imgList.push({
            uid: file.uid,
            url: this.ossData.host + '/' + this.ossData.key,
            status: 'load',
            progress: 0,
          })
          return true
        }).catch(() => {
          return false
        })
      },
      // 上传图片 - 上传中
      progressImg(event, file) {
        for (const item of this.imgList) {
          if (item.uid === file.uid) {
            item.progress = Math.ceil(file.percentage)
            break
          }
        }
      },
      // 上传图片 - 上传成功
      successHandel(response, file) {
        for (const item of this.imgList) {
          if (item.uid === file.uid) {
            item.progress = 100
            this.$emit('success', item.url, this.imgList)
            setTimeout(() => {
              item.status = 'success'
            }, 200)
            break
          }
        }
      },
      // 如果裁剪
      changeHandle(file) {
        if (!this.ossData.host) {
          this.$message.warning('未检测到OSS参数,无法开启此功能')
          return false
        }
        if (this.crop) {
          if (this.beforeHandle(file.raw)) {
            this.cropUid = file.uid
            this.cropImg = URL.createObjectURL(file.raw)
            this.cropDialog = true
          }
        }
      },
      // 裁剪回调
      onCropperConfirm(val) {
        this.imgList.push({
          uid: val.name,
          url: val.url,
          status: 'success',
          progress: 0,
        })
        this.$emit('success', val.url, this.imgList)
      },
      // 裁剪关闭回调
      cropperClose(uid) {
        if (uid) {
          const files = this.$refs['app-upload'].uploadFiles
          for (let i = 0; i < files.length; i++) {
            if (files[i].uid === uid) {
              files.splice(i, 1)
              break
            }
          }
        }
      },
      // remove掉图片
      onRemove(index) {
        const data = this.imgList.splice(index, 1)[0]
        this.$emit('remove', data, this.imgList)
        const files = this.$refs['app-upload'].uploadFiles
        const key = data.uid ? 'uid' : 'url'
        for (let i = 0; i < files.length; i++) {
          if (files[i][key] === data[key]) {
            files.splice(i, 1)
            break
          }
        }
      },
      errorHandel(event, file, fileList) {
        console.error(event, file, fileList)
      },
      // 获取图片宽高
      getImgWh(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = function() {
            const img = new Image()
            img.src = reader.result
            img.onload = function() {
              resolve({ width: img.width, height: img.height })
            }
            img.οnerrοr = function(error) {
              reject(error)
            }
          }
        })
      },
      handleExceed() {
        this.$message.warning(`只允许上传${this.limit}张图片`)
      },
      // 预览图片
      onPreview(url) {
        this.previewImg = url
        this.previewShow = true
      },
    },
  }
</script>
