<template>
  <Transition name="modal">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 class="text-xl font-semibold mb-4">Create New Event</h2>

        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Title</label>
              <input
                v-model="event.title"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg"
                placeholder="Event title"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Start Time</label>
              <input
                v-model="event.start"
                type="datetime-local"
                required
                class="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">End Time</label>
              <input
                v-model="event.end"
                type="datetime-local"
                required
                class="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Color</label>
              <div class="flex flex-row flex-wrap">
                <button
                  v-for="color in [
                    'bg-red-500',
                    'bg-orange-500',
                    'bg-amber-500',
                    'bg-yellow-500',
                    'bg-lime-500',
                    'bg-green-500',
                    'bg-emerald-500',
                    'bg-teal-500',
                    'bg-cyan-500',
                    'bg-sky-500',
                    'bg-blue-500',
                    'bg-indigo-500',
                    'bg-violet-500',
                    'bg-purple-500',
                    'bg-fuchsia-500',
                    'bg-pink-500',
                    'bg-rose-500',
                    'bg-slate-500',
                    'bg-gray-500',
                    'bg-zinc-500',
                    'bg-neutral-500',
                    'bg-stone-500',
                  ]"
                  :key="color"
                  type="button"
                  @click="event.tailwindColor = color.split('-')[1]"
                  :class="[
                    'm-1 h-8 w-8 rounded-full border-2',
                    `${color}`,
                    getTailwindColor(event.tailwindColor) === color
                      ? 'border-black'
                      : 'border-transparent',
                  ]"
                  :title="color"
                />
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useCalendarStore } from "../stores/calendarStore";

const emit = defineEmits(["close", "save"]);
const isOpen = ref(false);
const selectedTime = ref<Date | null>(null);

const event = ref({
  title: "New Event",
  start: "",
  end: "",
  tailwindColor: "blue",
});

const store = useCalendarStore();

function openModal(time: Date) {
  selectedTime.value = time;
  event.value.start = time.toISOString().slice(0, 16);
  const endTime = new Date(time);
  endTime.setHours(time.getHours() + 1);
  event.value.end = endTime.toISOString().slice(0, 16);
  isOpen.value = true;
}

function closeModal() {
  isOpen.value = false;
  emit("close");
}

function handleSubmit() {
  const newEvent = {
    id: crypto.randomUUID(),
    title: event.value.title,
    start: new Date(event.value.start).toISOString(),
    end: new Date(event.value.end).toISOString(),
    tailwindColor: event.value.tailwindColor,
  };

  emit("save", newEvent);
  closeModal();
}

const getTailwindColor = (color: string) => {
  return `bg-${color}-500`;
};

defineExpose({
  openModal,
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
