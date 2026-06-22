/**
 * 数据源适配器模板 — 用于接入新厂商/新格式的 OTN 网管数据
 *
 * 实现 DataSourceAdapter 接口后，注册到 DataSourceRegistry 即可使用。
 * 无需修改任何页面代码。
 *
 * @see src/core/adapter.ts 接口定义
 * @see src/adapters/fibrehome-adapter.ts 完整实现示例
 */

import type { DataSourceAdapter, FieldMapping, ImportResult } from '../core/adapter';
import type { CoreAlarm, CoreNE, ProvinceCoord } from '../core/types';

/**
 * ===== 字段映射表 =====
 *
 * 定义源列名（XLS/CSV 表头）→ 目标 Core 字段的自动匹配规则。
 * 每个字段可设置多个关键词，匹配时使用 `header.includes(keyword)`。
 */
const ALARM_FIELD_MAP: Record<string, string[]> = {
  // 示例（替换为实际列名）：
  alarmName: ['告警名称', 'Alarm Name', '告警标题'],
  neName: ['网元名称', 'NE Name', '网元'],
  severity: ['告警级别', 'Severity', '级别'],
  firstOccurTime: ['首次发生时间', '发生时间', 'First Occur Time'],
  // ... 补充其他字段
};

const NE_FIELD_MAP: Record<string, string[]> = {
  neName: ['网元名称', 'NE Name', '网元'],
  neType: ['网元类型', 'NE Type', '设备型号'],
  region: ['所属区域', 'Region'],
  // ... 补充其他字段
};

// ===== 级别映射 =====
const SEVERITY_MAP: Record<string, CoreAlarm['severity']> = {
  '紧急': 'critical',
  '主要': 'major',
  '次要': 'minor',
  '提示': 'warning',
};

// ===== 省份坐标 =====
// 返回该网络覆盖的省份/地域坐标，用于拓扑图展示
function getProvinces(): ProvinceCoord[] {
  return [
    // { name: '省份名', shortCode: 'CODE', coordX: 100, coordY: 100 },
  ];
}

// ========== 适配器实现 ==========

export const myAdapter: DataSourceAdapter = {
  vendor: 'my-vendor',       // 唯一供应商ID
  name: '我的供应商名称',
  version: '1.0',

  autoDetectMapping(headers: string[], type: 'alarm' | 'ne'): FieldMapping[] {
    const fieldMap = type === 'ne' ? NE_FIELD_MAP : ALARM_FIELD_MAP;
    return headers.map((header) => {
      for (const [field, keywords] of Object.entries(fieldMap)) {
        if (keywords.some((kw) => header.includes(kw))) {
          return { sourceColumn: header, targetField: field };
        }
      }
      return { sourceColumn: header, targetField: '' };
    });
  },

  parseAlarms(rows: string[][], mapping: FieldMapping[]): ImportResult<CoreAlarm> {
    // 参考 fibrehome-adapter.ts 的 parseAlarms 实现
    // 核心逻辑：建立 fieldToIndex 映射 → 遍历 rows → 构建 CoreAlarm 对象
    return { records: [], errors: [], stats: { total: 0, success: 0, failed: 0 } };
  },

  parseNetworkElements(rows: string[][], mapping: FieldMapping[]): ImportResult<CoreNE> {
    // 参考 fibrehome-adapter.ts 的 parseNetworkElements 实现
    return { records: [], errors: [], stats: { total: 0, success: 0, failed: 0 } };
  },

  getProvinces,

  resolveProvince(neName: string): string | undefined {
    // 根据网元名称规则解析省份
    return undefined;
  },

  resolveTransportSystems(neName: string): string[] | undefined {
    // 根据网元名称解析所属传输系统
    return undefined;
  },
};
