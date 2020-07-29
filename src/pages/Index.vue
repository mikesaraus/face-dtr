<template>
  <q-page>
    <div
      :key="notif.message"
      :class="`error q-py-xs q-mb-lg text-center text-white text-caption ${(notif.error) ? 'bg-negative' : 'bg-positive'}`"
      v-if="notif"
    >
      {{ notif.message }}
    </div>
    <div id="videoArea">
      <video
        id="video"
        ref="video"
        width="720"
        height="560"
        autoplay
        muted
      ></video>
      <canvas
        id="canvasDetection"
        ref="canvasDetection"
      ></canvas>
    </div>

    <q-card class="bg-grey-1 no-shadow q-ma-sm">
      <q-card-section
        class="text-h6 text-grey-7"
        id="video-options"
      >
        <q-select
          filled
          @input="resetFaceDetect(true)"
          v-model="selectedFaceOption"
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
        class="text-h6 text-grey-7"
        id="video-options"
      >
        <q-select
          filled
          @input="changeCamera"
          v-model="camera"
          :options="videoDevices"
          label="Select Camera"
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
        class="text-h6 text-grey-7"
        id="history"
      >
        <History />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { mapActions } from 'vuex'
import * as faceapi from 'face-api.js'
import History from '../components/History'

let faceDetector

export default {
  name: 'PageIndex',

  components: {
    History: History
  },

  data () {
    return {
      minFaceMatch: 0.6,
      maxTestImages: 10,
      selectedFaceOption: 'TinyFaceDetectorOptions',
      selectionFaceOption: ['TinyFaceDetectorOptions', 'SsdMobilenetv1Options'],
      facesData: {
        users: ['Mike Saraus', 'Bruce Lee', 'Bill Gates', 'Jomar Ebus', 'Sidney Diente'],
        descriptors: []
      },
      camera: null,
      video: {},
      canvas: {},
      videoSize: {},
      videoDevices: [],
      audioDevices: [],
      otherDevices: [],
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
      predictionCount: 10
    }
  },

  computed: {
    faceapiOptions () {
      return (this.selectedFaceOption && this.selectedFaceOption === 'TinyFaceDetectorOptions') ? new faceapi.TinyFaceDetectorOptions() : new faceapi.SsdMobilenetv1Options()
    }
  },

  async mounted () {
    this.initializeApp()
  },

  methods: {
    ...mapActions('history', ['addNewRecord']),

    doLog (logs) {
      console.log(logs)
    },

    async addRecord (data) {
      this.addNewRecord(data)
      this.scanIds = []
      // this.resetFaceDetect(true)
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
        this.video = this.$refs.video
        this.canvas = this.$refs.canvasDetection
        this.videoSize = { width: this.video.width, height: this.video.height }
        faceapi.matchDimensions(this.canvas, this.videoSize, true)
        this.constrains.video = {
          width: this.video.width,
          height: this.video.height
        }
        if (this.camera && !this.camera.error) this.constrains.video.deviceId = { exact: this.camera.deviceId }
        navigator.mediaDevices.getUserMedia({
          ...this.constrains
        }).then(async (stream) => {
          this.video.srcObject = stream
          this.video.play()
          await navigator.mediaDevices.enumerateDevices().then(devices => {
            this.videoDevices = devices.filter(device => device.kind === 'videoinput')
            this.audioDevices = devices.filter(device => device.kind === 'audioinput')
            this.otherDevices = devices.filter(device => device.kind !== 'audioinput' && device.kind !== 'videoinput')
            // console.log(devices)
            this.camera = this.videoDevices.length ? this.videoDevices[0] : { error: 'No video input device detected' }
          })
        }).catch(error => {
          this.notif = { error: true, message: 'Could not access camera!' }
          console.error(error)
        })
      } else {
        this.notif = { error: true, message: 'Failed to access camera!' }
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
            const matched = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
            faceapi.draw.drawFaceLandmarks(this.canvas, resizedDetections)
            matched.forEach(async (face, i) => {
              const box = resizedDetections[i].detection.box
              new faceapi.draw.DrawBox(box, { label: `${face.label} (${faceapi.utils.round(face.distance * 100, 0)}%)`, lineWidth: 2, boxColor: 'green' })
                .draw(this.canvas)
              if (face && face.label && face.label.toLowerCase() !== 'unknown') {
                const indentity = await this.interpolatePredictions(face.label)
                if (this.scanIds.length >= this.predictionCount) {
                  await this.addRecord({ name: indentity, time: Date.now(), interval: this.predictionCount })
                }
              }
            })
            resizedDetections.forEach(async (result) => {
              const { age, gender, genderProbability, expressions } = result
              const expressionValues = Object.values(expressions)
              const expressionList = Object.keys(expressions)
              let mode = null
              let modeVal = 0
              expressionValues.forEach((val, id) => {
                if (faceapi.utils.round(val) > modeVal) {
                  modeVal = faceapi.utils.round(val)
                  mode = expressionList[id]
                }
              })
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

    resetFaceDetect (restart = false, timer = 2500) {
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
      this.scanIds = [value].concat(this.scanIds).slice(0, this.predictionCount)
      const Predictions = this.scanIds.reduce((counts, word) => { counts[word] = ++counts[word] || 1; return counts }, [])
      let Predicted = value
      let Posibility = 0
      const PredictionsKey = Object.keys(Predictions)
      PredictionsKey.forEach((val, key) => {
        if (Predictions[val] > Posibility) {
          Posibility = Predictions[val]
          Predicted = val
        }
      })
      // console.log('Data', this.scanIds)
      // console.log('Keys', Object.keys(Predictions))
      console.log('Predictions', Predictions)
      console.log('Predicted', Predicted)
      return Predicted
    },

    snapShotVideo () {
      this.canvas.getContext('2d').drawImage(this.video, 0, 0)
      // Other browsers will fall back to image/png
      return this.canvas.toDataURL('image/webp')
    },

    changeCamera () {
      console.log('Selected Camera', this.camera)
      this.startVideo()
    },

    beforeDestroy () {
      this.resetFaceDetect()
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
</style>
