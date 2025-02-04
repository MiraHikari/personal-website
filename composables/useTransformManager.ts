import { ref, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import type { Ref } from 'vue';

// Movement Interface
export interface Movement {
  deltaX: number;
  deltaY: number;
}

interface ElementState {
  x: number;
  y: number;
  isVisible: boolean;
}

export function useTransformManager(
  scrollX: Ref<number>,
  scrollY: Ref<number>,
  updateScrollPosition: (deltaX: number, deltaY: number) => void
) {
  const elements = ref(new Map<HTMLElement, ElementState>());

  function updateElementPosition(element: HTMLElement, x: number, y: number) {
    const state = elements.value.get(element);
    if (!state) return;

    // Kill any existing animations
    gsap.killTweensOf(element);

    // Update state
    state.x = x;
    state.y = y;

    // Animate with GSAP
    gsap.to(element, {
      x,
      y,
      duration: 0.6,
      ease: 'power2.out'
    });
  }

  function handleMovement(movement: Movement) {
    const { deltaX, deltaY } = movement;

    // Batch DOM updates
    requestAnimationFrame(() => {
      elements.value.forEach((state, element) => {
        updateElementPosition(element, state.x + deltaX, state.y + deltaY);
      });

      // Update scroll position
      updateScrollPosition(deltaX, deltaY);
    });
  }

  onUnmounted(() => {
    elements.value.forEach((_, element) => {
      gsap.killTweensOf(element);
    });
    elements.value.clear();
  });

  return {
    registerElement: (element: HTMLElement, initialX: number, initialY: number) => {
      elements.value.set(element, { x: initialX, y: initialY, isVisible: false });
      gsap.set(element, { x: initialX, y: initialY });
    },
    unregisterElement: (element: HTMLElement) => {
      gsap.killTweensOf(element);
      elements.value.delete(element);
    },
    updateTransform: handleMovement,
    setElementVisibility: (element: HTMLElement, isVisible: boolean) => {
      const state = elements.value.get(element);
      if (state) {
        state.isVisible = isVisible;
      }
    }
  };
}
