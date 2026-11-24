<template>
  <div class="skeleton-card" :class="{ 'skeleton-banner': type === 'banner' }">
    <div class="skeleton-image"></div>
    <div class="skeleton-info">
      <div class="skeleton-line title"></div>
      <div class="skeleton-line meta"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'card' // 'card' or 'banner'
  }
})
</script>

<style scoped>
.skeleton-card {
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: var(--radius-lg);
  background: var(--bg-tertiary);
  overflow: hidden;
  position: relative;
}

.skeleton-banner {
  aspect-ratio: 16/9;
}

.skeleton-image {
  width: 100%;
  height: 80%;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--border-color) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-info {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 12px;
  background: var(--border-color);
  border-radius: 4px;
}

.skeleton-line.title {
  width: 80%;
}

.skeleton-line.meta {
  width: 40%;
  height: 8px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
