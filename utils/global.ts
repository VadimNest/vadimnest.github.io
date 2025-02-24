import { useFullscreen } from '@vueuse/core'

export const toggleFullScreen = (canvas: Ref<HTMLCanvasElement | undefined>) => {
  const { toggle } = useFullscreen(canvas);
  if (canvas) {
    toggle().then();
  }
};

export const handleMousemove = (e: MouseEvent) => {
  const cursor = {
    x: ref(0),
    y: ref(0),
  };

  cursor.x.value = e.clientX / useSizes().width.value - 0.5;
  cursor.y.value = -(e.clientY / useSizes().height.value - 0.5);
};
