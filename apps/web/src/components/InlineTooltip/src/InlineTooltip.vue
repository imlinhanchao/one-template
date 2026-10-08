<script setup lang="ts">
import { nextTick, ref } from "vue";

defineProps<{ text: string }>();

const show = ref(false);
const style = ref({ top: "0px", left: "0px" });
const tooltipEl = ref<HTMLDivElement | null>(null);

async function onMouseEnter(e: MouseEvent) {
  const rect = (e.target as HTMLElement).getBoundingClientRect();
  show.value = true;
  await nextTick();

  const tt = tooltipEl.value as HTMLDivElement | null;
  const tooltipWidth = tt ? tt.offsetWidth : 280;

  const minMargin = 10;
  const desiredCenter = rect.left + rect.width / 2 - tooltipWidth * 0.2;
  const maxLeft = Math.max(
    window.innerWidth - tooltipWidth - minMargin,
    minMargin,
  );
  const leftPx = Math.min(Math.max(desiredCenter, minMargin), maxLeft);

  style.value = {
    top: `${rect.bottom + 6}px`,
    left: `${leftPx}px`,
  };
}

function onMouseLeave() {
  show.value = false;
}
</script>

<template>
  <span
    class="inline-tooltip-trigger"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <slot />
    <Teleport to="body">
      <div
        v-if="show"
        ref="tooltipEl"
        class="fixed-tooltip bg-base-100 text-base-content/60"
        :style="style"
      >
        <slot name="text">{{ text }}</slot>
      </div>
    </Teleport>
  </span>
</template>

<style scoped>
.inline-tooltip-trigger {
  display: inline;
  cursor: pointer;
}
.fixed-tooltip {
  position: fixed;
  z-index: 99999;
  font-size: 12px;
  line-height: 1.5;
  padding: 6px 10px;
  border-radius: 6px;
  white-space: normal;
  word-break: break-word;
  max-width: 280px;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.fixed-tooltip::before {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 10%;
  border: 5px solid transparent;
  border-bottom-color: var(--color-base-100);
}
</style>
