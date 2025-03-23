<script setup lang="ts">
import { ref } from 'vue'

const selectedDate = ref<Date | null>(null)
const currentMonth = ref(new Date())

const daysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

const firstDayOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
}

const days = Array.from({ length: daysInMonth(currentMonth.value) }, (_, i) => i + 1)
const blankDays = Array.from({ length: firstDayOfMonth(currentMonth.value) })
</script>

<template>
  <div class="max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <div class="mb-4 flex items-center justify-between">
      <button
        class="rounded-full p-2 hover:bg-gray-100"
        @click="currentMonth = new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))"
      >
        <
      </button>
      <span class="font-medium">
        {{ currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' }) }}
      </span>
      <button
        class="rounded-full p-2 hover:bg-gray-100"
        @click="currentMonth = new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))"
      >
        >
      </button>
    </div>

    <div class="grid grid-cols-7 gap-2">
      <div
        v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
        :key="day"
        class="text-center text-sm font-medium text-gray-500"
      >
        {{ day }}
      </div>

      <div v-for="blank in blankDays" :key="`blank-${blank}`"></div>

      <button
        v-for="day in days"
        :key="day"
        class="rounded-full p-2 text-center hover:bg-gray-100"
        :class="{
          'bg-primary-500 text-white hover:bg-primary-600':
            selectedDate?.getDate() === day &&
            selectedDate.getMonth() === currentMonth.getMonth() &&
            selectedDate.getFullYear() === currentMonth.getFullYear()
        }"
        @click="selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)"
      >
        {{ day }}
      </button>
    </div>
  </div>
</template>
