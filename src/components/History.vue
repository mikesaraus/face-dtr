<template>
  <q-card
    bordered
    class="bg-grey-1 no-shadow"
  >
    <q-card-section class="text-h6 text-grey-7">
      Recent Users <span class="text-body2 text-grey-8 text-weight-thin">({{recent.length}})</span>
      <q-btn
        icon="refresh"
        class="float-right text-grey-3"
        @click="updateClients(history)"
        flat
        dense
      >
        <q-tooltip>Refresh</q-tooltip>
      </q-btn>
    </q-card-section>

    <q-separator inset/>

    <q-card-section>
      <q-scroll-area
        style="height: 500px;"
        id="virstual-scroll-target"
      >
        <q-virtual-scroll
          style="overflow-x: hidden"
          scroll-target="#virstual-scroll-target"
          :items="recent"
        >
          <template v-slot="{ item, index }">
            <q-list
              class="rounded-borders"
              separator
            >
              <q-item
                :key="index"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="item.avatar">
                  </q-avatar>
                </q-item-section>

                <q-item-section @click="doPopup(item)">
                  <q-item-label lines="1">
                    {{item.name }}
                  </q-item-label>
                  <q-item-label
                    caption
                    lines="2"
                  >
                    <span class="text-weight-bold"><span class="text-weight-regular">Date/Time:</span> {{item.time_str}}</span>
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="text-grey-8 q-gutter-xs">
                    <q-icon
                      :title="formatDate(item.time, 'full')"
                      :class="formatDate(item.time, 'am/pm') === 'AM' ? 'text-positive' : 'text-negative' "
                      class="gt-xs"
                      size="xs"
                      :name="formatDate(item.time, 'am/pm') === 'AM' ? 'arrow_back' : 'arrow_forward'"
                      flat
                      dense
                      round
                    />
                    <q-btn
                      title="Show Details"
                      color="green"
                      @click="doPopup(item)"
                      class="gt-xs"
                      size="md"
                      icon="info"
                      flat
                      dense
                      round
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </template>
        </q-virtual-scroll>
      </q-scroll-area>
    </q-card-section>
    <q-dialog v-if="activeUser" v-model="popup" seamless position="bottom">
      <q-card style="width: 375px">
        <q-linear-progress :value="1" color="primary" />

        <q-card-section class="row items-center no-wrap">
          <q-avatar class="q-mr-md">
            <img :src="activeUser.avatar">
          </q-avatar>
          <div>
            <div class="text-weight-bold text-subtitle1">{{ activeUser.name }}</div>
            <div class="text-grey">{{ activeUser.time_str }}</div>
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-separator inset/>
        <q-card-section class="text-center items-center no-wrap">
          <div>
            <div class="text-weight-regular text-uppercase text-grey" style="letter-spacing: 0.2em;">Detections</div>
            <div class="text-grey-7">Age: {{ activeUser.age }} years old</div>
            <div class="text-grey-7">Gender: {{ activeUser.gender.toUpperCase() }} ({{ activeUser.gender_probability }}%) </div>
            <div class="text-grey-7">Expression: {{ activeUser.expression.toUpperCase() }} ({{ activeUser.expression_probability }}%) </div>
          </div>
          <div v-for="prediction in activeUser.predictions" :key="prediction['Mike Saraus']">
            <div>
            {{ prediction }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
import { mapState } from 'vuex'
import { date } from 'quasar'

let fnRun

export default {
  name: 'History',

  data () {
    return {
      popup: false,
      recent: [],
      activeUser: null
    }
  },

  computed: {
    ...mapState('history', ['history'])
  },

  async created () {
    this.updateClients(this.history)
    fnRun = setInterval(() => {
      if (this.history.length) {
        this.updateClients(this.history)
      }
    }, ((this.reload) ? this.reload : 0))
  },

  methods: {
    async doPopup (user) {
      this.activeUser = user
      this.popup = true
    },

    async goTo (lnk) {
      location.replace(lnk)
    },

    formatDate (d = Date.now(), mode = 'now') {
      let val = Date.now()
      switch (mode) {
        case 'am/pm':
          val = date.formatDate(d, 'A')
          break
        case 'sec':
          val = date.formatDate(d, 'ss')
          break
        case 'min':
          val = date.formatDate(d, 'mm')
          break
        case 'hr':
          val = date.formatDate(d, 'hh')
          break
        case 'HR':
          val = date.formatDate(d, 'HH')
          break
        case 'full':
          val = date.formatDate(d, 'h:mm:ss A')
          break
        default:
          break
      }
      return val
    },

    async updateClients (source) {
      try {
        if (source && source instanceof Array) {
          if (JSON.stringify(source) !== JSON.stringify(this.recent)) {
            const data = []
            source.forEach(h => {
              data.push(h)
            })
            this.recent = data.reverse()
          }
          return true
        } else {
          return false
        }
      } catch (error) {
        console.log('Error updating history: ', (error.message) ? error.message : error)
        return false
      }
    }
  },

  beforeDestroy () {
    try {
      clearInterval(fnRun)
    } catch (error) {
      console.log(error)
    }
  }
}
</script>
