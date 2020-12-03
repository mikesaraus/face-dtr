<template>
  <q-page>
    <div
      :key="notif.message"
      :class="`error q-py-xs q-mb-lg text-center text-white text-caption ${(notif.error) ? 'bg-negative' : 'bg-positive'}`"
      id="notification"
      v-if="notif"
    >
      {{ notif.message }}
    </div>

    <q-card class="text-center no-shadow bg-transparent">
      <q-card-section :class="`q-pa-none q-ma-none ${this.$q.screen.gt.xs ? 'q-pt-md' : 'q-pt-xs'}`">
          <span :class="`text-h6 text-grey-7 text-weight-light`" :key="datestamp" :style="`letter-spacing: ${this.$q.screen.gt.xs ? 0.2 : 0.1}em;`">{{ datestamp }}</span>
      </q-card-section>

      <q-card-section :key="today" class="row q-pa-none q-ma-none  items-center text-center justify-center">
        <q-card :style="`width: 100%; max-width: ${this.$q.screen.gt.sm ? 150 : 70}px;`" :class="`text-center bg-grey-2 ${this.$q.screen.gt.sm ? 'q-pa-sm q-ma-sm' : 'q-pa-xs q-ma-xs'}`">
          <span :class="`${getToday('A') === 'AM' ? 'text-blue-9' : 'text-red-9'} text-weight-bold ${this.$q.screen.gt.sm ? 'text-h1' : 'text-h3'}`">{{ getToday('hh') }}</span>
        </q-card>
        <q-card :style="`width: 100%; max-width: ${this.$q.screen.gt.sm ? 150 : 70}px;`" :class="`text-center bg-grey-2 ${this.$q.screen.gt.sm ? 'q-pa-sm q-ma-sm' : 'q-pa-xs q-ma-xs'}`">
          <span :class="`${getToday('A') === 'AM' ? 'text-blue-9' : 'text-red-9'} text-weight-bold ${this.$q.screen.gt.sm ? 'text-h1' : 'text-h3'}`">{{ getToday('mm') }}</span>
        </q-card>
        <q-card :style="`width: 100%; max-width: ${this.$q.screen.gt.sm ? 150 : 70}px;`" :class="`text-center bg-grey-2 ${this.$q.screen.gt.sm ? 'q-pa-sm q-ma-sm' : 'q-pa-xs q-ma-xs'}`">
          <span :class="`blinking text-grey-9 text-weight-bold ${this.$q.screen.gt.sm ? 'text-h1' : 'text-h3'}`">{{ getToday('ss') }}</span>
        </q-card>
        <q-card :style="`width: 100%; max-width: ${this.$q.screen.gt.sm ? 150 : 70}px;`" :class="`hidden text-center ${this.$q.screen.gt.sm ? 'q-pa-sm q-ma-sm' : 'q-pa-xs q-ma-xs'}`">
          <span :class="`text-grey-4 text-weight-bold ${this.$q.screen.gt.sm ? 'text-h1' : 'text-h3'}`">{{ getToday('SS') }}</span>
        </q-card>
      </q-card-section>

      <q-card-section class="q-pa-md q-my-md">
        <div id="videoArea">
          <video
            id="video"
            ref="video"
            :width="$q.platform.is.mobile ? 320 : 720"
            :height="$q.platform.is.mobile ? 0 : 540"
            autoplay
            muted
          ></video>

          <canvas
            id="canvasDetection"
            ref="canvasDetection"
          ></canvas>

          <input type="checkbox" v-model="verified" id="check">
          <label class="check-label" v-if="verifying" for="check">
            <div class="check-icon"></div>
          </label>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import * as faceapi from 'face-api.js'
import { date } from 'quasar'

let faceDetector

export default {
  name: 'PageIndex',

  data () {
    return {
      today: Date.now(),
      cameraAccess: false,
      facesData: {
        users: ['Mike Saraus', 'Bill Gates', 'JJ'],
        descriptors: []
      },
      video: {},
      canvas: {},
      videoSize: {},
      constrains: {
        audio: false,
        video: {
          width: null,
          height: null
          // facingMode: {
          //   exact: 'user'
          // }
        }
      },
      notif: { error: false, message: 'Loading...' },
      scanIds: [],
      predictions: [],
      doAdd: null,
      verified: false,
      verifying: false
    }
  },

  computed: {
    ...mapState('devices', ['devices', 'camera', 'selectedFaceOption']),
    ...mapState('setting', ['minFaceMatch', 'maxTestImages', 'predictionInterval']),

    datestamp () {
      return date.formatDate(this.today, 'Do MMMM, YYYY')
    },

    faceapiOptions () {
      return (this.selectedFaceOption && this.selectedFaceOption === 'TinyFaceDetectorOptions') ? new faceapi.TinyFaceDetectorOptions() : new faceapi.SsdMobilenetv1Options()
    }
  },

  async mounted () {
    this.initializeApp()
  },

  async created () {
    this.$root.$on('newCamera', this.switchCamera)
    this.$root.$on('resetFaceDetect', this.resetFaceDetect)
    setInterval(() => {
      this.getToday()
    })
  },

  methods: {
    ...mapActions('history', ['addNewRecord']),
    ...mapActions('devices', ['updateVideoDevices', 'updateAudioDevices', 'updateOtherDevices', 'changeCamera']),

    doLog (logs) {
      console.log(logs)
    },

    getToday (format = 'h:mm:ss A') {
      this.today = Date.now()
      return date.formatDate(this.today, format)
    },

    async addRecord () {
      const confirm = await this.addNewRecord(this.doAdd)
      this.doAdd = null
      if (confirm === true) {
        this.completeVerify()
      }
      // this.resetFaceDetect()
    },

    async initializeDetector () {
      this.notif = { error: false, message: 'Initializing models...' }
      this.facesData.descriptors = await this.faceIdentity()
      this.notif = { error: false, message: 'Everything is ready!' }
      await this.facesData.descriptors.forEach((user, i) => {
        if (!user.descriptors.length) {
          this.facesData.descriptors = [...this.facesData.descriptors.slice(0, i), ...this.facesData.descriptors.slice(i + 1)]
        }
      })
      this.notif = (this.camera && this.camera.error) ? { error: true, message: `${this.camera.error}!` } : null
      await this.faceDetect()
      if (this.cameraAccess !== true) {
        if (this.cameraAccess !== false) {
          console.error('Failed to access camera!')
          this.notif = this.cameraAccess
        }
      }
    },

    async initializeApp () {
      this.startVideo()
      this.notif = { error: false, message: 'Initializing detector...' }
      Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/data/models'),
        faceapi.nets.tinyFaceDetector.loadFromUri('/data/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/data/models'),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri('/data/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/data/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/data/models'),
        faceapi.nets.ageGenderNet.loadFromUri('/data/models'),
        faceapi.loadFaceExpressionModel('/data/models')
      ]).then(async () => { this.initializeDetector() })
    },

    async startVideo () {
      this.notif = { error: false, message: 'Checking camera access...' }
      if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices && 'enumerateDevices' in navigator.mediaDevices) {
        this.notif = null
        this.video = this.$refs.video
        this.canvas = this.$refs.canvasDetection
        this.constrains.video = {
          width: this.video.width,
          height: this.video.height
        }
        if (this.camera && typeof this.camera === 'object' && !this.camera.error) this.constrains.video.deviceId = { exact: this.camera.deviceId }
        navigator.mediaDevices.getUserMedia({
          ...this.constrains
        }).then(async (stream) => {
          window.stream = stream
          this.video.srcObject = stream
          await this.video.play()
          this.video.height = this.video.videoHeight / (this.video.videoWidth / this.video.width)
          this.videoSize = { width: this.video.width, height: this.video.height }
          faceapi.matchDimensions(this.canvas, this.videoSize, true)
          this.cameraAccess = true
          await navigator.mediaDevices.enumerateDevices().then(devices => {
            this.updateVideoDevices(devices.filter(device => device.kind === 'videoinput'))
            this.updateAudioDevices(devices.filter(device => device.kind === 'audioinput'))
            this.updateOtherDevices(devices.filter(device => device.kind !== 'audioinput' && device.kind !== 'videoinput'))
            // console.log(devices)
            if (!this.camera || typeof this.camera !== 'object' || this.camera.error) this.changeCamera(this.devices.video.length ? this.devices.video[0] : { error: 'No video input device detected' })
          })
        }).catch(error => {
          const e = { error: true, message: 'Could not access camera!', dev: error }
          this.notif = e
          this.cameraAccess = e
        })
      } else {
        const e = { error: true, message: 'Could not access camera!' }
        this.notif = e
        this.cameraAccess = e
      }
    },

    async faceDetect () {
      console.log('Detection Started')
      if (this.facesData.descriptors.length) {
        faceDetector = setInterval(async () => {
          const detections = await faceapi.detectAllFaces(this.video, this.faceapiOptions).withFaceLandmarks().withFaceExpressions().withAgeAndGender().withFaceDescriptors()
          this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height)
          if (detections && detections.length) {
            const faceMatcher = new faceapi.FaceMatcher(this.facesData.descriptors, this.minFaceMatch)
            const resizedDetections = await faceapi.resizeResults(detections, this.videoSize)
            const matched = await resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
            if (!this.verifying) faceapi.draw.drawFaceLandmarks(this.canvas, resizedDetections)
            await matched.forEach(async (face, i) => {
              const box = resizedDetections[i].detection.box
              new faceapi.draw.DrawBox(box, { label: `${face.label} (${faceapi.utils.round((1 - face.distance) * 100, 0)}%)`, lineWidth: 2, boxColor: 'green' })
                .draw(this.canvas)
              if (face && face.label && face.label.toLowerCase() !== 'unknown') {
                const indentity = await this.interpolatePredictions(face.label)
                if (this.scanIds.length >= this.maxTestImages && face.distance <= 0.5) {
                  this.scanIds = []
                  this.doAdd = await {
                    name: indentity,
                    time: Date.now(),
                    time_str: date.formatDate(Date.now(), 'Do MMM h:mm:ss A'),
                    avatar: `/data/users/${indentity}/1.jpg`,
                    predictions: this.predictions,
                    interval: this.predictionInterval
                  }
                }
              }
            })
            await resizedDetections.forEach(async (result) => {
              const { age, gender, genderProbability, expressions } = result
              const expressionValues = await Object.values(expressions)
              const expressionList = await Object.keys(expressions)
              let mode = null
              let modeVal = 0
              await expressionValues.forEach((val, id) => {
                if (faceapi.utils.round(val) > modeVal) {
                  modeVal = faceapi.utils.round(val)
                  mode = expressionList[id]
                }
              })
              if (this.doAdd) {
                this.doAdd = await {
                  ...this.doAdd,
                  age: faceapi.utils.round(age, 0),
                  gender: gender,
                  gender_probability: faceapi.utils.round(genderProbability * 100, 0),
                  expression: mode,
                  expression_probability: faceapi.utils.round(modeVal * 100, 0),
                  face: await this.snapShotVideo()
                }
                await this.addRecord()
              }
              new faceapi.draw.DrawTextField(
                [
                  `${faceapi.utils.round(age, 0)} years old`,
                  `${gender} (${faceapi.utils.round(genderProbability * 100, 0)}%)`,
                  `${mode} (${faceapi.utils.round(modeVal * 100, 0)}%)`
                ],
                result.detection.box.bottomLeft,
                {
                  fontStyle: 'Arial',
                  padding: 8
                }
              ).draw(this.canvas)
            })
          }
        }, 1)
      } else {
        console.log('Waiting for the models to finish initialization before the detection method start.')
      }
    },

    resetFaceDetect (restart = true, timer = 2500) {
      try {
        if (faceDetector) clearInterval(faceDetector)
        if (restart) {
          setTimeout(() => {
            this.faceDetect()
          }, timer)
        }
        console.log('Detection Stopped!')
      } catch (error) {
        console.error(error)
      }
    },

    faceIdentity () {
      return Promise.all(
        this.facesData.users.map(async (user) => {
          const descriptions = []
          const errors = []
          for (let i = 1; i <= this.maxTestImages; i++) {
            try {
              const img = await faceapi.fetchImage(`/data/users/${user}/${i}.jpg`)
              const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
              descriptions.push(detections.descriptor)
            } catch (ex) {
              errors.push((ex && ex.message) ? ex.message : ex)
            }
          }
          if (errors.length) console.error('Errors', errors)
          const result = new faceapi.LabeledFaceDescriptors(user, descriptions)
          return result
        })
      )
    },

    interpolatePredictions (value) {
      this.scanIds = [value].concat(this.scanIds).slice(0, this.maxTestImages)
      this.predictions = this.scanIds.reduce((counts, word) => { counts[word] = ++counts[word] || 1; return counts }, [])
      let Predicted = value
      let Posibility = 0
      const PredictionsKey = Object.keys(this.predictions)
      PredictionsKey.forEach((val, key) => {
        if (this.predictions[val] > Posibility) {
          Posibility = this.predictions[val]
          Predicted = val
        }
      })
      // if (this.scanIds.length === this.maxTestImages) console.log('Predictions', this.predictions)
      // console.log('Data', this.scanIds)
      // console.log('Keys', Object.keys(this.predictions))
      // console.log('Predictions', this.predictions)
      // console.log('Predicted', Predicted)
      return Predicted
    },

    completeVerify () {
      this.verifying = true
      setTimeout(() => {
        this.verified = true
        setTimeout(() => {
          this.verifying = false
          this.verified = false
        }, 1500)
      }, 1500)
    },

    snapShotVideo () {
      const canvas = document.createElement('canvas')
      const source = this.video
      faceapi.matchDimensions(canvas, source, true)
      canvas.getContext('2d').drawImage(source, 0, 0)
      // Other browsers will fall back to image/webp
      const img = canvas.toDataURL('image/png')
      return img
    },

    switchCamera () {
      console.log('Selected Camera', this.camera)
      this.startVideo()
    },

    beforeDestroy () {
      this.resetFaceDetect(false)
    }
  }
}
</script>

<style>
#videoArea {
  margin: 0;
  padding: 0;
  display: flex;
  text-align: center;
  justify-content: center;
}

#canvasDetection {
  position: absolute;
}

.blinking {
  transform-origin: center top;
  animation-fill-mode: both;
  animation: blinkingText 1s infinite;
}

@keyframes blinkingText{
  from{opacity: 1;}
  to{opacity: 0.5;}
}

.check-label {
  position: absolute;
  top: 40%;
  height: 125px;
  width: 125px;
  display: inline-block;
  border: 5px solid rgba(255,255,255,0.2);
  border-radius: 50%;
  border-left-color: #5cb85c;
  animation: rotate 1.2s linear infinite;
}
@keyframes rotate {
  50%{
    border-left-color: #9b59b6;
  }
  75%{
    border-left-color: #e67e22;
  }
  100%{
    transform: rotate(360deg);
  }
}

.check-label .check-icon{
  display: none;
}

.check-label .check-icon:after{
  position: absolute;
  content: "";
  top: 50%;
  left: 28px;
  transform: scaleX(-1) rotate(135deg);
  height: 56px;
  width: 28px;
  border-top: 4px solid #5cb85c;
  border-right: 4px solid #5cb85c;
  transform-origin: left top;
  animation: check-icon 0.8s ease;
}
@keyframes check-icon {
  0%{
    height: 0;
    width: 0;
    opacity: 1;
  }
  20%{
    height: 0;
    width: 28px;
    opacity: 1;
  }
  40%{
    height: 56px;
    width: 28px;
    opacity: 1;
  }
  100%{
    height: 56px;
    width: 28px;
    opacity: 1;
  }
}

input#check {
  display: none;
}

input#check:checked ~ .check-label .check-icon{
  display: block;
}

input#check:checked ~ .check-label{
  animation: none;
  border-color: #5cb85c;
  transition: border 0.5s ease-out;
}

</style>
