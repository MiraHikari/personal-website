import { ref, computed, onUnmounted } from 'vue';
import { useResizeObserver } from '@vueuse/core';
import { gsap } from 'gsap';
import type { Ref } from 'vue';

interface ElementState {
  element: HTMLElement;
  x: number;
  y: number;
  isVisible: boolean;
  intersectionRatio: number;
}

export function useContentManager(
  contentContainer: Ref<HTMLElement | null>,
  scrollContainer: Ref<HTMLElement | null>,
  transformManager: {
    registerElement: (element: HTMLElement, x: number, y: number) => void;
    unregisterElement: (element: HTMLElement) => void;
    setElementVisibility: (element: HTMLElement, isVisible: boolean) => void;
  }
) {
  const elements = ref<Map<HTMLElement, ElementState>>(new Map());
  const visibleElements = ref<Set<HTMLElement>>(new Set());
  const isArranged = ref(false);
  const observer = ref<IntersectionObserver | null>(null);

  // Create a single Intersection Observer instance
  function createObserver() {
    if (observer.value) return;

    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.target instanceof HTMLElement) {
            const isVisible = entry.isIntersecting && entry.intersectionRatio > 0;
            const state = elements.value.get(entry.target);

            if (state) {
              state.isVisible = isVisible;
              state.intersectionRatio = entry.intersectionRatio;
            }

            if (isVisible) {
              visibleElements.value.add(entry.target);
            } else {
              visibleElements.value.delete(entry.target);
            }

            // Update visibility in transform manager
            transformManager.setElementVisibility(entry.target, isVisible);

            entry.target.style.opacity = isVisible ? '1' : '0';
          }
        });
      },
      {
        root: scrollContainer.value,
      }
    );
  }

  // Monitor container size changes
  const { stop: stopResizeObserver } = useResizeObserver(contentContainer, () => {
    if (contentContainer.value && !isArranged.value) {
      requestAnimationFrame(arrangeContent);
    }
  });

  function arrangeContent(): void {
    if (!contentContainer.value || isArranged.value) return;

    // Create observer if not exists
    createObserver();

    const children = Array.from(contentContainer.value.children).filter(
      (child): child is HTMLElement => child.hasAttribute('data-x') && child.hasAttribute('data-y')
    );

    // Clear existing elements and observers
    elements.value.forEach((state) => {
      gsap.killTweensOf(state.element);
      observer.value?.unobserve(state.element);
      transformManager.unregisterElement(state.element);
    });
    elements.value.clear();
    visibleElements.value.clear();

    // Set initial state for all elements
    children.forEach((child) => {
      const x = parseFloat(child.getAttribute('data-x') || '0');
      const y = parseFloat(child.getAttribute('data-y') || '0');
      // Register with transform manager
      transformManager.registerElement(child, x, y);

      // Track element state
      elements.value.set(child, {
        element: child,
        x,
        y,
        isVisible: false,
        intersectionRatio: 0
      });

      // Start observing this element
      observer.value?.observe(child);
      child.style.opacity = '1';
    });

    isArranged.value = true;
  }

  // Enhanced visibility check using Intersection Observer results
  const hasVisibleContent = computed(() => {
    // Only consider area empty if we have elements but none are visible
    if (elements.value.size === 0) return false;

    // Check if any element is visible in the viewport
    return Array.from(elements.value.values()).some(
      state => state.isVisible && state.intersectionRatio > 0
    );
  });

  // Cleanup
  onUnmounted(() => {
    if (observer.value) {
      elements.value.forEach((state) => {
        observer.value?.unobserve(state.element);
      });
      observer.value.disconnect();
      observer.value = null;
    }
    stopResizeObserver();
    elements.value.forEach(state => {
      gsap.killTweensOf(state.element);
    });
    elements.value.clear();
    visibleElements.value.clear();
  });

  return {
    arrangeContent,
    hasVisibleContent,
    elements: elements.value,
    isArranged: computed(() => isArranged.value)
  };
}
