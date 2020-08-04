<template>
    <q-card>
        <q-card-section>
            <div class="text-h6">How to Use the System?</div>
        </q-card-section>

        <q-separator />

        <q-card-section
            style="max-height: 50vh"
            class="scroll"
        >
            <p>Using Face Recognition System for DTR</p>
            <p
            v-for="n in 5"
            :key="n"
            >Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum repellendus sit voluptate voluptas eveniet porro. Rerum blanditiis perferendis totam, ea at omnis vel numquam exercitationem aut, natus minima, porro labore.</p>
        </q-card-section>
    </q-card>
</template>

<script>

export default {
  name: 'Help',

  data () {
    return {
    }
  }
}

</script>
