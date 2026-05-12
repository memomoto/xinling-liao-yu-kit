/**
 * @file registry.ts
 * @description 心理创伤疗愈向应用注册表。侧栏以「枢纽」聚合工具，零散入口保留情绪释放说明。
 */

import React from 'react';

import { ResumeApp } from './resume';

import { HealingToolboxHubApp } from './healing-toolbox-hub';
import { MindSpaceHubApp } from './mind-space-hub';
import { SelfKnowledgeHubApp } from './self-knowledge-hub';
import { DailyRepairHubApp } from './daily-repair-hub';
import { HealingPlayHubApp } from './healing-play-hub';
import { QingXuShiFangZhanApp } from './qing_xu_shi_fang_zhan';

const PACK = '/assets/icons/app-icons';

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
    icon: `${PACK}/about-me.png`,
    defaultWidth: 900,
    defaultHeight: 620,
    AppComponent: HealingToolboxHubApp,
  },
  mindSpaceHub: {
    id: 'mindSpaceHub',
    title: '心灵空间',
    icon: `${PACK}/comfort-buddy.png`,
    defaultWidth: 880,
    defaultHeight: 620,
    AppComponent: MindSpaceHubApp,
  },
  selfKnowledgeHub: {
    id: 'selfKnowledgeHub',
    title: '自我认知',
    icon: `${PACK}/document.ico`,
    defaultWidth: 900,
    defaultHeight: 640,
    AppComponent: SelfKnowledgeHubApp,
  },
  dailyRepairHub: {
    id: 'dailyRepairHub',
    title: '每日修复',
    icon: '/assets/icons/healing-journal-app.svg',
    defaultWidth: 900,
    defaultHeight: 640,
    AppComponent: DailyRepairHubApp,
  },
  healingPlayHub: {
    id: 'healingPlayHub',
    title: '疗愈互动与叙事',
    icon: '/assets/icons/healing-interactions-app.svg',
    defaultWidth: 920,
    defaultHeight: 640,
    AppComponent: HealingPlayHubApp,
  },
  siteReadme: {
    id: 'siteReadme',
    title: '项目说明',
    icon: `${PACK}/document.ico`,
    defaultWidth: 760,
    defaultHeight: 580,
    AppComponent: ResumeApp,
  },
  emotionReleaseStation: {
    id: 'emotionReleaseStation',
    title: '情绪释放站',
    icon: `${PACK}/document.ico`,
    defaultWidth: 520,
    defaultHeight: 600,
    AppComponent: QingXuShiFangZhanApp,
  },
};
