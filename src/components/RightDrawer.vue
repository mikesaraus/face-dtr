<template>
    <q-scroll-area class="fit">
      <q-list
        padding
        class="text-grey-8"
      >

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
            @input="changeDetector"
            v-model="selectedOption"
            :options="selectionFaceOption"
            label="Dectector"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No detector available
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
                  No camera available
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
              aria-label="Privacy"
              href="javascript:void(0)"
              @click="whatAboutPrivacy = true"
            >Terms</a>
            <span> · </span>
            <a
              class="GL__drawer-footer-link"
              aria-label="Terms"
              href="javascript:void(0)"
              @click="getHelp = true"
            >Help</a>
            <span> · </span>
            <a
              class="GL__drawer-footer-link"
              aria-label="About"
              href="javascript:void(0)"
              @click="whatAboutADM = true"
            >About ADM</a>
          </div>
        </div>
      </q-list>
      <q-dialog v-model="whatAboutADM">
        <AboutADM/>
      </q-dialog>
      <q-dialog v-model="whatAboutPrivacy">
        <LicenseTermsPrivacy/>
      </q-dialog>
      <q-dialog v-model="getHelp">
        <Help/>
      </q-dialog>
    </q-scroll-area>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import History from '../components/History'
import AboutADM from '../components/About-ADM'
import LicenseTermsPrivacy from '../components/License-Terms-Privacy'
import Help from '../components/Help'

let cam

export default {
  name: 'RightDrawer',

  data () {
    return {
      demo: false,
      whatAboutADM: false,
      getHelp: false,
      whatAboutPrivacy: false,
      selectedOption: null,
      selectedCamera: null,
      selectionFaceOption: ['TinyFaceDetectorOptions', 'SsdMobilenetv1Options']
    }
  },

  mounted () {
    this.selectedOption = this.selectedFaceOption
    cam = setInterval(() => {
      this.initialize()
    }, 100)
  },

  computed: {
    ...mapState('devices', ['devices', 'camera', 'selectedFaceOption']),
    ...mapState('setting', ['minFaceMatch', 'maxTestImages', 'predictionInterval']),

    maxTest () {
      return this.maxTestImages
    },

    preIntervak () {
      return this.predictionInterval
    },

    videoDevices () {
      // return this.devices.video
      const cams = []
      if (this.devices.video) {
        this.devices.video.forEach((v, i) => {
          if (v.label) cams.push({ label: v.label, value: i.toString() })
        })
      }
      return cams
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
    ...mapActions('setting', ['updateMinFaceMatch', 'updateMaxTestImages', 'updatePredictionInterval']),

    changeDetector (val) {
      this.$root.$emit('resetFaceDetect')
      return this.changeFaceOption(val)
    },

    async newCamera (selected) {
      const val = Number(selected.value)
      const cam = await this.changeCamera(this.devices.video[val])
      this.$root.$emit('newCamera')
      return cam
    },

    initialize () {
      if (this.camera !== this.selectedCamera) {
        this.selectedCamera = this.camera
        if (this.camera && typeof this.camera === 'object') {
          if (cam) clearInterval(cam)
        }
      }
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
    History: History,
    Help: Help,
    AboutADM: AboutADM,
    LicenseTermsPrivacy: LicenseTermsPrivacy
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
