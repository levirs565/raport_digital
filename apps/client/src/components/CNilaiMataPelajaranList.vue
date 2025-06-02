<script setup lang="ts">
const { data } = defineProps(['data']) as {
  data: {
    id_siswa: string
    nama: string
    NIS: string
    NISN: string
    nilai: number
  }[]
}

</script>
<template>
  <v-list>
    <template v-for="item in data" :key="item.id_siswa">
      <v-list-item>
        <v-list-item-title>{{ item.nama }}</v-list-item-title>
        <v-list-item-subtitle>NIS. {{ item.NIS }} NISN. {{ item.NISN }}</v-list-item-subtitle>
        <template v-slot:append>
          <p>{{ Number(item.nilai).toFixed(1) }}</p>
        </template>
      </v-list-item>
      <v-divider />
    </template>
  </v-list>
</template>
