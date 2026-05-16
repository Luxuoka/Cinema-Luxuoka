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
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-text {
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
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
