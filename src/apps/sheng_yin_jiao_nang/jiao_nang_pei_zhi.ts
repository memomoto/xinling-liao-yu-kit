/**
 * 声音胶囊：每条对应一句温柔话。未配置 mp3 时使用本机中文语音合成。
 */

export interface ShengYinJiaoNangTiao {
  id: string;
  jian_yu: string;
  lang_du_wen: string;
  /** 人声文件 URL；不填则仅用合成音 */
  yin_pin?: string | null;
}

export const JIAO_NANG_LIE: readonly ShengYinJiaoNangTiao[] = [
  { id: 'jn001', jian_yu: '你今天辛苦了。', lang_du_wen: '你今天辛苦了。' },
  { id: 'jn002', jian_yu: '错的不是你。', lang_du_wen: '错的不是你。' },
  { id: 'jn003', jian_yu: '我在陪着你。', lang_du_wen: '我在陪着你。不用着急好起来。' },
  { id: 'jn004', jian_yu: '慢一点，也没关系。', lang_du_wen: '慢一点也没有关系。' },
  { id: 'jn005', jian_yu: '你的感受，本身就很重要。', lang_du_wen: '你的感受本身就很重要。' },
  { id: 'jn006', jian_yu: '这一刻，请先对自己温柔一点。', lang_du_wen: '这一刻，请先对自己温柔一点。' },
] as const;
