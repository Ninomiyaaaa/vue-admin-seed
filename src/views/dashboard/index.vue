<template>
  <div class="dashboard-container">
    <svg-icon class="svg-icon" icon-class="programmer"/>
  </div>
</template>

<script>
  import svgIcon from '@/components/SvgIcon'
  import { mapGetters } from 'vuex'

  export default {
    components: { svgIcon },
    name: 'Dashboard',
    computed: {
      ...mapGetters([
        'name'
      ])
    }
  }
</script>

<style lang="scss" scoped>
  .dashboard {
    &-container {
      height: calc(100vh - 50px);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .svg-icon {
    width: 50vw;
    height: 50vh;
    transform: translateX(15vw) translateY(10vh);
  }
</style>
