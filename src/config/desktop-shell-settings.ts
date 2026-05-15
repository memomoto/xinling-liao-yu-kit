/**
 * 独立前端无站点数据库时：壁纸、Dock 徽标、菜单栏状态区图标的静态默认值。
 * 可将 `wallpaper url` 换成 `public/` 下任意图片路径。
 */
const DEFAULT_WALLPAPER =
  'linear-gradient(165deg, #1a2840 0%, #2d3a5c 35%, #4a6fa5 70%, #8fb8e8 100%)';

export type DesktopShellSettings = {
  /** 若不以 `linear-gradient` / `url(` 开头，会当作图片 URL 包进 url("…") */
  wallpaper: string;
  logoUrl: string;
  systemTrayIcons: string[];
};

function cssBackgroundValue(raw: string): string {
  const t = raw.trim();
  if (t.startsWith('linear-gradient') || t.startsWith('radial-gradient') || t.startsWith('url(')) {
    return t;
  }
  return `url("${t}")`;
}

export function getDesktopShellSettings(): DesktopShellSettings {
  return {
    wallpaper: cssBackgroundValue(DEFAULT_WALLPAPER),
    logoUrl: '/assets/icons/app-icons/about-me.png',
    systemTrayIcons: [],
  };
}
