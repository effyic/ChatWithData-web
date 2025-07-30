<template>
  <div style="display: flex;
    align-items: center;
    justify-content: center;cursor: pointer;" @click="toggleClick">

    <svg-icon style="margin: 0;" :class="{ 'is-active': isActive }" name="ham" width="20px" height="20px" />
  </div>
</template>

<script setup lang="ts">
defineProps({
  isActive: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['toggleClick']);
const toggleClick = () => {
  emit('toggleClick');
};
</script>

<style scoped>
.is-active {
  transform: rotate(180deg);
}
</style>
