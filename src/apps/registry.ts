/**
 * 独立包应用注册表：`APP_REGISTRY` 的枢纽 id 与主站 NEWme 保持一致，
 * 便于 `HEALING_OPEN_APP_EVENT` 等与疗愈工具箱相关的跨壳事件在两侧语义对齐。
 *
 * 姊妹书脊顺序见 `healing-sibling-apps.ts`；平板内打开的 id 须落在本表或主站同名 id。
 */

import React from 'react';

import { HealingToolboxHubApp } from './healing-toolbox-hub';
import { MindSpaceHubApp } from './mind-space-hub';
import { SelfKnowledgeHubApp } from './self-knowledge-hub';
import { DailyRepairHubApp } from './daily-repair-hub';
import { HealingPlayHubApp } from './healing-play-hub';
import { ResumeApp } from './resume';
import { QingXuShiFangZhanApp } from './qing_xu_shi_fang_zhan';

const PACK = '/assets/icons/app-icons';
const ICO_ABOUT = `${PACK}/about-me.png`;
const ICO_BUDDY = `${PACK}/comfort-buddy.png`;
const ICO_DOC = `${PACK}/document.ico`;
const SVG_JOURNAL = '/assets/icons/healing-journal-app.svg';
const SVG_INTERACTION = '/assets/icons/healing-interactions-app.svg';

export interface OsApp {
  id: string;
  title: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  AppComponent: React.ComponentType;
}

export const APP_REGISTRY: Record<string, OsApp> = {
  healingToolboxHub: {
    id: 'healingToolboxHub',
    title: '疗愈工具箱',
    icon: ICO_ABOUT,
    defaultWidth: 900,
    defaultHeight: 620,
    AppComponent: HealingToolboxHubApp,
  },
  mindSpaceHub: {
    id: 'mindSpaceHub',
    title: '心灵空间',
    icon: ICO_BUDDY,
    defaultWidth: 880,
    defaultHeight: 620,
    AppComponent: MindSpaceHubApp,
  },
  selfKnowledgeHub: {
    id: 'selfKnowledgeHub',
    title: '自我认知',
    icon: ICO_DOC,
    defaultWidth: 900,
    defaultHeight: 640,
    AppComponent: SelfKnowledgeHubApp,
  },
  dailyRepairHub: {
    id: 'dailyRepairHub',
    title: '每日修复',
    icon: SVG_JOURNAL,
    defaultWidth: 900,
    defaultHeight: 640,
    AppComponent: DailyRepairHubApp,
  },
  healingPlayHub: {
    id: 'healingPlayHub',
    title: '疗愈互动与叙事',
    icon: SVG_INTERACTION,
    defaultWidth: 900,
    defaultHeight: 620,
    AppComponent: HealingPlayHubApp,
  },
  siteReadme: {
    id: 'siteReadme',
    title: '项目说明',
    icon: ICO_DOC,
    defaultWidth: 760,
    defaultHeight: 580,
    AppComponent: ResumeApp,
  },
  emotionReleaseStation: {
    id: 'emotionReleaseStation',
    title: '情绪释放站',
    icon: ICO_DOC,
    defaultWidth: 520,
    defaultHeight: 600,
    AppComponent: QingXuShiFangZhanApp,
  },
};
