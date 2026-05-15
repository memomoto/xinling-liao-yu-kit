import { HealingDeskPrototype } from '@/demo/HealingDeskPrototype';

type DeskSceneProps = {
  /** 点击桌上物理笔记本电脑：进入外层仿 Mac 系统 */
  onOpenLaptop: () => void;
};

/** 开机前：仅此全屏木纹书桌 + 《My Journal》+ 合上盖的笔电道具 */
export function DeskScene({ onOpenLaptop }: DeskSceneProps) {
  return <HealingDeskPrototype onPhysicalLaptopOpen={onOpenLaptop} />;
}
