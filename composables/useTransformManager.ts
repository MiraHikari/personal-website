import { gsap } from 'gsap';

// Movement Interface
export interface Movement {
  deltaX: number;
  deltaY: number;
}

interface ElementState {
  x: number;
  y: number;
}

export function useTransformManager(
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
      duration: 0.8,
      ease: 'power3.out'
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
      elements.value.set(element, { x: initialX, y: initialY });
      gsap.set(element, { x: initialX, y: initialY });
    },
    unregisterElement: (element: HTMLElement) => {
      gsap.killTweensOf(element);
      elements.value.delete(element);
    },
    updateTransform: handleMovement
  };
}
