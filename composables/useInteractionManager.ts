import { ref, computed } from 'vue';
import type { Ref } from 'vue';

interface Touch {
  x: number;
  y: number;
}

export function useInteractionManager(
  scrollX: Ref<number>,
  scrollY: Ref<number>,
  viewportWidth: Ref<number>,
  viewportHeight: Ref<number>,
  isMobile: Ref<boolean>,
  updatePosition: (deltaX: number, deltaY: number) => void
) {
  // Interaction State
  const isDragging = ref(false);
  const lastTouch = ref<Touch | null>(null);
  const initialTouchDistance = ref<number>(0);
  const isMultiTouch = ref<boolean>(false);
  const touchVelocity = ref<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchTime = ref<number>(0);

  // Drag State
  let lastX = 0;
  let lastY = 0;

  // UI State
  const operationTooltip = computed(() =>
    isDragging.value
      ? '正在拖动...'
      : isMobile.value
        ? '单指拖动移动画布'
        : '拖动以平移画布，滚轮滚动向下/上移动'
  );

  // Navigation Methods
  function handleNavigation(action: 'home' | 'jump' | 'custom', coordinates?: { x: number; y: number }) {
    let deltaX: number, deltaY: number;

    switch (action) {
      case 'home':
        deltaX = -scrollX.value;
        deltaY = -scrollY.value;
        break;
      case 'jump':
        if (!coordinates) return;
        deltaX = -(coordinates.x - viewportWidth.value / 2) - scrollX.value;
        deltaY = -(coordinates.y - viewportHeight.value / 2) - scrollY.value;
        break;
      case 'custom':
        if (!coordinates) return;
        deltaX = coordinates.x - scrollX.value;
        deltaY = coordinates.y - scrollY.value;
        break;
      default:
        return;
    }

    updatePosition(deltaX, deltaY);
  }

  // Mouse Event Handlers
  function handleMouseDown(event: MouseEvent): void {
    isDragging.value = true;
    lastX = event.clientX;
    lastY = event.clientY;
  }

  function handleMouseMove(event: MouseEvent): void {
    if (!isDragging.value) return;
    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;

    if (deltaX !== 0 || deltaY !== 0) {
      updatePosition(deltaX, deltaY);
      lastX = event.clientX;
      lastY = event.clientY;
    }
  }

  function handleMouseUp(): void {
    isDragging.value = false;
  }

  // Touch Event Handlers
  function handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      lastTouch.value = {
        x: touch.clientX,
        y: touch.clientY
      };
      lastTouchTime.value = Date.now();
      touchVelocity.value = { x: 0, y: 0 };
      isMultiTouch.value = false;
    } else if (event.touches.length === 2) {
      isMultiTouch.value = true;
      const [touch1, touch2] = event.touches;
      initialTouchDistance.value = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    }
  }

  function handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (!lastTouch.value) return;

    if (event.touches.length === 1 && !isMultiTouch.value) {
      const touch = event.touches[0];
      const deltaX = touch.clientX - lastTouch.value.x;
      const deltaY = touch.clientY - lastTouch.value.y;

      if (deltaX !== 0 || deltaY !== 0) {
        const currentTime = Date.now();
        const timeDelta = currentTime - lastTouchTime.value;
        if (timeDelta > 0) {
          touchVelocity.value = {
            x: deltaX / timeDelta,
            y: deltaY / timeDelta
          };
        }

        updatePosition(deltaX, deltaY);
        lastTouch.value = {
          x: touch.clientX,
          y: touch.clientY
        };
        lastTouchTime.value = currentTime;
      }
    }
  }

  function handleTouchEnd(): void {
    if (!isMultiTouch.value && touchVelocity.value) {
      const velocityX = touchVelocity.value.x * 100;
      const velocityY = touchVelocity.value.y * 100;

      if (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
        updatePosition(velocityX, velocityY);
      }
    }

    lastTouch.value = null;
    isMultiTouch.value = false;
    touchVelocity.value = { x: 0, y: 0 };
  }

  // Wheel Handler
  function handleWheel(event: WheelEvent): void {
    event.preventDefault();
    updatePosition(0, event.deltaY);
  }

  // Keyboard Controls
  const keyActions = {
    ArrowLeft: () => updatePosition(50, 0),
    ArrowRight: () => updatePosition(-50, 0),
    ArrowUp: () => updatePosition(0, 50),
    ArrowDown: () => updatePosition(0, -50)
  };

  return {
    isDragging,
    operationTooltip,
    handleNavigation,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
    keyActions
  };
}
