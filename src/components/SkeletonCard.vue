<template>
  <div class="skeleton-card">
    <div class="skeleton-poster shimmer-bg"></div>
    <div class="skeleton-text title shimmer-bg"></div>
    <div class="skeleton-text meta shimmer-bg"></div>
  </div>
</template>

<style scoped>
.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.skeleton-poster {
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: var(--radius-lg);
}

.skeleton-text {
  border-radius: var(--radius-sm);
}

.title {
  height: 20px;
  width: 85%;
  margin-top: 10px;
}

.meta {
  height: 14px;
  width: 60%;
}
</style>
