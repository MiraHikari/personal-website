import { ref, onMounted, onUnmounted } from 'vue';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const isMobile = ref(false);

  onMounted(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
    };

    // 监听媒体查询变化
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
    } else {
      // 兼容旧版浏览器
      mql.addListener(onChange);
    }

    // 初始化时执行一次
    onChange();

    // 清理函数
    onUnmounted(() => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', onChange);
      } else {
        // 兼容旧版浏览器
        mql.removeListener(onChange);
      }
    });
  });

  return {
    isMobile,
    MOBILE_BREAKPOINT
  };
}
