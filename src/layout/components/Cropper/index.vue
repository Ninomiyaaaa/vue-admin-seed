<template>
  <div class="cropper">
    <el-dialog
      title="图片裁剪"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="890px"
      @open="open"
      @closed="closed"
      append-to-body
    >
      <div class="temp-universal-dialog temp-universal-operate" v-loading="loading">
        <div class="container">
          <vue-cropper
            class="app-cropper"
            ref="cropper"
            :img="img"
            :outputSize="option.outputSize"
            :outputType="option.outputType"
            :info="option.info"
            :canScale="option.canScale"
            :autoCrop="option.autoCrop"
            :autoCropWidth="option.autoCropWidth"
            :autoCropHeight="option.autoCropHeight"
            :fixedNumber="option.fixedNumber"
            :fixed="option.fixed"
            :full="option.full"
            :fixedBox="option.fixedBox"
            :canMove="option.canMove"
            :canMoveBox="option.canMoveBox"
            :centerBox="option.centerBox"
          />
          <div class="info">
            <!-- features -->
            <div class="features">
              <div class="label">图片宽度 :</div>
              <el-input
                class="wh"
                placeholder="宽"
                v-model.number="option.fixedNumber[0]"
                @input="changeInput($event, 'autoCropWidth')"
              ></el-input>
              <div class="label ml30">图片高度 :</div>
              <el-input
                class="wh"
                placeholder="高"
                v-model.number="option.fixedNumber[1]"
                @input="changeInput($event, 'autoCropHeight')"
              ></el-input>
              <el-button
                class="ml30"
                icon="el-icon-refresh-left"
                type="primary"
                @click="rotateLeft"
              >向左旋转90度</el-button>
              <el-button icon="el-icon-refresh-right" type="primary" @click="rotateRight">向右旋转90度</el-button>
            </div>
            <!-- features 结束 -->
            <!-- features -->
            <div class="features">
              <el-checkbox v-model="option.fixed">截图固定比例</el-checkbox>
              <el-checkbox v-model="option.centerBox">截图是否限制在图片里</el-checkbox>
              <el-checkbox v-model="option.canScale">图片缩放</el-checkbox>
              <el-checkbox v-model="option.canMove">图片拖动</el-checkbox>
            </div>
            <!-- features 结束 -->
          </div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="onClose">取 消</el-button>
          <el-button type="primary" @click="onConfirm">确 定</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { VueCropper } from 'vue-cropper'
import uuid from '@/utils/uuid'
import $http from '@/utils/http'

export default {
  name: 'componentsCropper',
  components: {
    VueCropper
  },
  props: {
    cropDialog: {
      type: Boolean,
      default: false
    },
    img: {
      type: String,
      default: ''
    },
    size: {
      type: Array,
      default: function() {
        return [300, 300]
      }
    },
    uid: Number
  },
  data() {
    return {
      dialogVisible: false,
      option: {
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'png', // 裁剪生成图片的格式
        info: true, // 裁剪框的大小信息
        canScale: false, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: '', // 默认生成截图框宽度
        autoCropHeight: '', // 默认生成截图框高度
        fixedNumber: [], // 截图框的宽高比例
        fixed: true, // 是否开启截图框宽高固定比例
        full: true, // 是否输出原图比例的截图
        fixedBox: false, // 不允许改变宽高
        canMove: false, // 上传图片是否可以移动
        canMoveBox: true, // 截图框能否拖动
        centerBox: true // 截图框是否被限制在图片里面
      },
      loading: false,
      isConfirm: false
    }
  },
  computed: {
    ossData() {
      return this.$store.getters['app/getOss'] || {}
    }
  },
  watch: {
    cropDialog(val) {
      this.dialogVisible = val
    },
    size(arr) {
      this.option.fixedNumber = [].concat(arr)
    }
  },
  mounted() {
    this.dialogVisible = this.cropDialog
    this.resetData()
  },
  methods: {
    // 关闭dialog
    closed() {
      this.resetData()
      this.$emit('update:cropDialog', false)
      this.$emit('close', this.isConfirm ? '' : this.uid)
    },
    // 打开时
    open() {
      this.isConfirm = false
    },
    resetData() {
      this.option.fixedNumber = [].concat(this.size)
      this.option.autoCropWidth = this.size[0]
      this.option.autoCropHeight = this.size[1]
    },
    onClose() {
      this.dialogVisible = false
    },
    onConfirm() {
      this.loading = true
      this.$refs.cropper.getCropBlob(data => {
        const file = this.blobToFile(data, new Date().getTime())
        const format = this.option.outputType === 'png' ? '.png' : '.jpg'
        this.ossData.key =
          this.ossData.copyKey +
          uuid() +
          `-w${Math.round(this.$refs.cropper.cropW)}-h${Math.round(
            this.$refs.cropper.cropH
          )}` +
          format
        let params = new FormData()
        params.append('OSSAccessKeyId', this.ossData.OSSAccessKeyId)
        params.append('policy', this.ossData.policy)
        params.append('signature', this.ossData.signature)
        params.append('key', this.ossData.key)
        params.append('file', file)

        $http
          .NATIVE(this.ossData.host, params)
          .then(() => {
            this.isConfirm = true
            this.loading = false
            this.$emit('confirm', {
              name: this.uid,
              url: this.ossData.host + '/' + this.ossData.key
            })
            this.onClose()
          })
          .catch(() => {
            this.loading = false
          })
      })
    },
    // 将blob转换为file
    blobToFile(theBlob, fileName) {
      theBlob.lastModifiedDate = new Date()
      theBlob.name = fileName
      return theBlob
    },
    rotateLeft() {
      this.$refs.cropper.rotateLeft()
    },
    rotateRight() {
      this.$refs.cropper.rotateRight()
    },
    changeInput(e, key) {
      this.option[key] = e
    }
  }
}
</script>

<style lang="scss" scoped>
.temp-universal-dialog {
  .app-cropper {
    width: 100%;
    height: 80%;
  }
  .info {
    overflow: hidden;
    height: 20%;
    padding-top: 10px;

    .features {
      display: flex;
      margin-top: 10px;
      line-height: 32px;

      .label {
        width: 80px;
      }
      .wh {
        width: 100px;
      }
      .ml30 {
        margin-left: 30px;
      }
    }
  }
}
</style>
