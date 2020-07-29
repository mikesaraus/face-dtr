<template>
  <q-card
    bordered
    class="bg-grey-1 no-shadow"
  >
    <q-card-section class="text-h6 text-grey-7 q-mb-none q-pb-none">
      Recent Users <span class="text-body2 text-grey-8 text-weight-thin">({{recent.length}})</span>
      <q-btn
        icon="refresh"
        class="float-right text-grey-3"
        @click="getTransactionsRecent()"
        flat
        dense
      >
        <q-tooltip>Refresh</q-tooltip>
      </q-btn>
    </q-card-section>

    <q-separator inset></q-separator>

    <q-card-section>
      <q-scroll-area
        style="height: 400px"
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
                    <img src="/icons/favicon-32x32.png">
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label lines="1">
                    {{item.name }}
                  </q-item-label>
                  <q-item-label
                    caption
                    lines="2"
                  >
                    <span class="text-weight-bold"><span class="text-weight-regular">Date/Time:</span> {{item.time}}</span>
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="text-grey-8 q-gutter-xs">
                    <q-btn
                      title="Show Details"
                      @click="doPopup()"
                      class="gt-xs"
                      size="md"
                      color="green"
                      icon="receipt"
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
    <q-dialog v-model="popup">
      This is a test!
    </q-dialog>
  </q-card>
</template>

<script>
import { mapState } from 'vuex'
import { date } from 'quasar'

let fnRun = null

export default {
  name: 'History',

  data () {
    return {
      popup: false,
      recent: []
    }
  },

  computed: {
    ...mapState('history', ['history'])
  },

  async created () {
    fnRun = setInterval(() => {
      if (this.history.length) {
        this.updateClients(this.history)
      }
    }, ((this.reload) ? this.reload : 1000))
  },

  methods: {
    async doPopup () {
      this.popUpDetails = true
    },

    async goTo (lnk) {
      location.replace(lnk)
    },

    async updateClients (source) {
      try {
        if (source && source instanceof Array) {
          const data = []
          source.forEach(h => {
            data.push({
              name: h.name,
              time: date.formatDate(h.time, 'Do MMM hh:mm A')
            })
          })
          this.recent = data.reverse()
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
