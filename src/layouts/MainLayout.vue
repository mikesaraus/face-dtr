<template>
  <q-layout class="bg-grey-2" view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>

        <q-btn
          round
          dense
          flat
          :ripple="false"
          icon="camera"
          size="19px"
          color="grey"
          no-caps
          @click="rightDrawerOpen = !rightDrawerOpen"
        />

        <q-toolbar-title>
          Facial Recognition {{this.$q.screen.gt.xs ? 'System' : ''}}
        </q-toolbar-title>

        <div v-if="$q.screen.gt.xs">v{{ $q.version }}</div>

        <q-btn
          flat
          round
          dense
          ref="fullscreen"
          class="text-grey"
          @click="$q.fullscreen.toggle()"
          :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
        >
          <q-tooltip>{{$q.fullscreen.isActive ? 'Exit fullscreen' : 'Fullscreen'}}</q-tooltip>
        </q-btn>

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="rightDrawerOpen"
      side="right"
      show-if-above
      bordered
      content-class="bg-grey-2"
      :width="$q.screen.gt.xs ? 450 : 300"
    >
      <RightDrawer :rightDrawerOpen="rightDrawerOpen"></RightDrawer>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import RightDrawer from '../components/RightDrawer'

export default {
  name: 'MainLayout',

  components: {
    RightDrawer: RightDrawer
  },

  async created () {
    this.$root.$on('openRightDrawer', this.openRightDrawerCallback)
  },

  data () {
    return {
      rightDrawerOpen: this.$q.screen.gt.sm
    }
  },

  methods: {
    openRightDrawerCallback () {
      this.rightDrawerOpen = !this.rightDrawerOpen
    }
  }
}
</script>
