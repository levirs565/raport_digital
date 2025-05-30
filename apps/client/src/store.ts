
import { defineStore } from "pinia";

export const usePeriodeStore = defineStore('periode', {
  state: () => ({
    selectedPeriode: undefined
  } satisfies {
    selectedPeriode?: string
  }),

})
