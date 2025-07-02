<template>
  <Transition name="modal">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 class="text-xl font-semibold mb-4">{{ isEditMode ? 'Edit Event' : 'Create New Event' }}</h2>

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
                v-model="localStartTime"
                type="datetime-local"
                required
                class="w-full px-3 py-2 border rounded-lg"
              />
              <p class="text-xs text-gray-500 mt-1">
                Your timezone: {{ userTimezone }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">End Time</label>
              <input
                v-model="localEndTime"
                type="datetime-local"
                required
                class="w-full px-3 py-2 border rounded-lg"
              />
              <p class="text-xs text-gray-500 mt-1">
                Your timezone: {{ userTimezone }}
              </p>
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
              v-if="isEditMode"
              type="button"
              @click="handleDelete"
              class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              Delete
            </button>
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
              {{ isEditMode ? 'Update Event' : 'Save Event' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useCalendarStore, type CalendarEvent } from "../stores/calendarStore";
import { useTimezone } from "../composables/useTimezone";

const emit = defineEmits(["close", "save", "update", "delete"]);
const isOpen = ref(false);
const selectedTime = ref<Date | null>(null);
const isEditMode = ref(false);
const editingEventId = ref<string | null>(null);

const event = ref({
  title: "New Event",
  start: "",
  end: "",
  tailwindColor: "blue",
});

const store = useCalendarStore();
const { userTimezone, toUTC, toISOString, toUserTimezone } = useTimezone();

// Local time inputs for the form (in user's timezone)
const localStartTime = ref("");
const localEndTime = ref("");

function openModal(time: Date) {
  selectedTime.value = time;
  isEditMode.value = false;
  editingEventId.value = null;

  // Reset form for new event
  event.value = {
    title: "New Event",
    start: "",
    end: "",
    tailwindColor: "blue",
  };

  // Convert the selected time to user's timezone for display
  const userTime = toUserTimezone(time);
  const endTime = new Date(userTime);
  endTime.setHours(userTime.getHours() + 1);

  // Format for datetime-local input (YYYY-MM-DDTHH:mm)
  localStartTime.value = formatForDateTimeLocal(userTime);
  localEndTime.value = formatForDateTimeLocal(endTime);

  isOpen.value = true;
}

function openEditModal(existingEvent: CalendarEvent) {
  isEditMode.value = true;
  editingEventId.value = existingEvent.id;

  // Populate form with existing event data
  event.value = {
    title: existingEvent.title,
    start: existingEvent.start,
    end: existingEvent.end,
    tailwindColor: existingEvent.tailwindColor || "blue",
  };

  // Convert times to user's timezone for display
  const userStartTime = toUserTimezone(new Date(existingEvent.start));
  const userEndTime = toUserTimezone(new Date(existingEvent.end));

  // Format for datetime-local input
  localStartTime.value = formatForDateTimeLocal(userStartTime);
  localEndTime.value = formatForDateTimeLocal(userEndTime);

  isOpen.value = true;
}

function closeModal() {
  isOpen.value = false;
  emit("close");
}

function handleSubmit() {
  try {
    // Convert local times back to UTC for storage
    const startDate = parseDateTimeLocal(localStartTime.value);
    const endDate = parseDateTimeLocal(localEndTime.value);

    // Convert to UTC and then to ISO string
    const utcStart = toUTC(startDate);
    const utcEnd = toUTC(endDate);

    if (isEditMode.value && editingEventId.value) {
      // Update existing event
      const updatedEvent = {
        id: editingEventId.value,
        title: event.value.title,
        start: toISOString(utcStart),
        end: toISOString(utcEnd),
        tailwindColor: event.value.tailwindColor,
      };
      emit("update", updatedEvent);
    } else {
      // Create new event
      const newEvent = {
        id: crypto.randomUUID(),
        title: event.value.title,
        start: toISOString(utcStart),
        end: toISOString(utcEnd),
        tailwindColor: event.value.tailwindColor,
      };
      emit("save", newEvent);
    }
    
    closeModal();
  } catch (error) {
    console.error("Error saving event:", error);
    alert("Error saving event. Please check your date/time inputs.");
  }
}

function handleDelete() {
  if (isEditMode.value && editingEventId.value) {
    emit("delete", editingEventId.value);
    closeModal();
  }
}

// Helper function to format date for datetime-local input
function formatForDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Helper function to parse datetime-local input
function parseDateTimeLocal(dateTimeString: string): Date {
  if (!dateTimeString) {
    throw new Error("Date/time string is required");
  }

  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date/time format");
  }

  return date;
}

const getTailwindColor = (color: string) => {
  return `bg-${color}-500`;
};

defineExpose({
  openModal,
  openEditModal,
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
