<template>
  <q-scroll-area class="fit">
    <q-list
      padding
      class="text-grey-8"
    >

      <q-toolbar class="GPL__toolbar">
        <q-toolbar-title class="row items-center text-grey-8">
          <q-icon
            size="1.5em"
            name="camera"
          />
          <span class="q-ml-sm">System Information</span>
        </q-toolbar-title>
      </q-toolbar>

    <q-card class="no-shadow bg-transparent">
      <q-card-section
        id="history"
      >
        <History />
      </q-card-section>
    </q-card>

    <q-card  class="no-shadow bg-transparent">
      <q-card-section
          v-if="!demo"
        class="text-grey-7"
        id="detector-options"
      >
        <q-select
          filled
          v-if="!demo"
          @input="changeOption"
          v-model="selectedOption"
          :options="selectionFaceOption"
          label="Face Dectector"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>

      <q-card-section
        class="text-grey-7"
        id="camera-options"
      >
        <q-select
          filled
          @input="newCamera"
          v-model="selectedCamera"
          :options="videoDevices"
          label="Camera"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
    </q-card>

      <div class="q-mt-md">
        <div class="flex flex-center q-gutter-xs">
          <a
            class="GL__drawer-footer-link"
            href="javascript:void(0)"
            aria-label="Privacy"
          >Privacy</a>
          <span> · </span>
          <a
            class="GL__drawer-footer-link"
            href="javascript:void(0)"
            aria-label="Terms"
          >Terms</a>
          <span> · </span>
          <a
            class="GL__drawer-footer-link"
            href="javascript:void(0)"
            aria-label="About"
          >About ADM</a>
        </div>
      </div>
    </q-list>
  </q-scroll-area>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import History from '../components/History'
let cam

export default {
  name: 'RightDrawer',

  data () {
    return {
      demo: false,
      selectedOption: null,
      selectedCamera: null,
      selectionFaceOption: ['TinyFaceDetectorOptions', 'SsdMobilenetv1Options']
    }
  },

  mounted () {
    this.selectedOption = this.selectedFaceOption
    cam = setInterval(() => {
      this.initCam()
    }, 100)
  },

  computed: {
    ...mapState('devices', ['devices', 'camera', 'selectedFaceOption']),

    videoDevices () {
      return this.devices.video
    },

    audioDevices () {
      return this.devices.audio
    },

    otherDevices () {
      return this.devices.other
    }
  },

  methods: {
    ...mapActions('devices', ['changeFaceOption', 'changeCamera']),

    changeOption (val) {
      this.$root.$emit('resetFaceDetect')
      return this.changeFaceOption(val)
    },

    newCamera (val) {
      console.log(val, 'New Camera')
      this.$root.$emit('newCamera')
      return this.changeCamera(val)
    },

    initCam () {
      if (this.camera !== this.selectedCamera) this.selectedCamera = this.camera
    },

    endCam () {
      try {
        if (cam) clearInterval(cam)
      } catch (error) {
        console.error(error)
      }
    }
  },

  components: {
    History: History
  },

  watch: {
    '$q.fullscreen.isActive' (val) {
      console.log(val ? 'Fullscreen' : 'Exited fullscreen')
    }
  },

  beforeDestroy () {
    this.endCam()
  }
}
</script>

<style lang="sass">
.GL
  &__drawer-footer-link
    color: inherit
    text-decoration: none
    font-weight: 500
    font-size: .75rem
    padding-left: 5px
    padding-right: 5px
    &:hover
      color: #000
</style>
