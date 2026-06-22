---
name: otn-alarm-inspection
description: 烽火通信OTN WDM设备历史告警可视化巡检工具。当用户需要导入/分析/可视化OTN网络告警数据、查看拓扑图、生成告警报表、进行根因分析时使用此技能。适用于网络运维人员对移动一干400G等OTN网络的日常巡检、故障定位和报告生成。
agent_created: true
---

# OTN 历史告警可视化巡检技能

## 技能概述

基于 Vite + React + MUI + Tailwind CSS 构建的单页面应用，用于烽火通信 FONST 系列 OTN WDM 设备的告警数据导入、分析、可视化和报告生成。

**技术栈**: Vite 5 + React 18 + MUI 5（暗色主题）+ Tailwind CSS + Recharts + ReactFlow + xlsx + Zustand + dayjs

## 何时使用此技能

当用户提出以下需求时，应使用此技能：

- 导入/分析烽火网管导出的 XLS 告警报表或网元报表
- 查看 OTN 网络的拓扑图（省级总览/站点详情两级下钻）
- 进行告警根因分析（基于时间窗口+OTN分层传播模型）
- 查看高频闪告单盘统计
- 生成巡检报告/告警汇总报表
- 管理多套告警数据集（项目CRUD）
- 需要全国省级拓扑地图展示告警分布

## 项目结构

```
otn-alarm-tool/
├── src/
│   ├── core/                    # 核心抽象层（模块化架构）
│   │   ├── types.ts             # CoreAlarm / CoreNE 类型定义
│   │   ├── adapter.ts           # DataSourceAdapter 接口
│   │   └── registry.ts          # 数据源注册表单例
│   ├── adapters/
│   │   └── fibrehome-adapter.ts # 烽火适配器（字段映射+坐标+NE映射）
│   ├── types/index.ts           # 原有类型定义（含 @deprecated 标记）
│   ├── store/useAppStore.ts     # Zustand 全局状态管理
│   ├── db/index.ts              # IndexedDB 持久化封装
│   ├── pages/
│   │   ├── Dashboard.tsx        # 仪表盘
│   │   ├── Topology.tsx         # 拓扑视图（34省）
│   │   ├── AlarmAnalysis.tsx    # 告警分析（聚合/明细）
│   │   ├── Import.tsx           # 数据导入（告警/网元双模式）
│   │   ├── Report.tsx           # 报表
│   │   └── Projects.tsx         # 项目管理
│   ├── components/
│   │   ├── AlarmStormCard.tsx   # 告警风暴Top10
│   │   ├── AlarmTimeline.tsx    # 根因时间线
│   │   └── BoardFlashCard.tsx   # 高频闪告单盘
│   ├── utils/
│   │   ├── alarmAggregator.ts   # 根因聚合算法（OTN分层传播模型）
│   │   └── boardAggregator.ts   # 单盘闪告聚合算法
│   └── data/
│       ├── mockData.ts          # 预置演示数据
│       ├── neProvinceMap.ts     # 2469条NE→省份映射
│       └── neSystemMap.ts       # 905条NE→传输系统映射
├── electron/
│   ├── main.cjs                # Electron 主进程
│   └── preload.cjs             # IPC 桥接
├── scripts/
│   ├── fix-build.js            # file://协议兼容处理
│   ├── server.js               # 零依赖 HTTP 服务器
│   └── verify-build.js         # 构建自动验证
├── docs/
│   ├── system_design.md        # 系统设计文档
│   └── module-arch-design.md   # 模块化架构设计
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 构建与运行

### 开发模式

```bash
cd otn-alarm-tool
npm run dev
# → 浏览器访问 http://localhost:5173
```

### 生产构建

```bash
npm run build
# → 输出 dist/index.html（单文件，内联所有资源）
# → 构建后自动运行 fix-build（file://兼容）+ verify-build（校验）
```

### 快捷键

```bash
# 浏览器方式（本地服务器）
npm run start          # 启动 HTTP 服务器+自动弹浏览器

# Electron 桌面方式
npm run electron:dev   # 开发模式（热更新）
npm run electron:build # 打包为 EXE 安装包

# 项目内快捷脚本
双击 start.bat         # 启动服务器+弹浏览器
双击 stop.bat          # 停止服务器+释放端口
```

## 核心功能详解

### 1. 数据导入（双模式）

导入页面支持两种模式切换：

- **导入告警数据**: 解析烽火告警查询报表 XLS，自动字段映射（26 个字段），智能跳过元数据行
- **导入网元信息**: 解析烽火网元查询报表 XLS，从"所属区域"字段自动解析省份/城市
- 支持拖拽上传 + Electron 原生文件对话框
- 导入后自动持久化到 IndexedDB（随项目存储）

### 2. 全国省份拓扑图

- 预置 34 个省级行政区坐标（中国地图布局）
- 有网元的省份自动点亮（彩色高亮+告警统计Chip）
- 无网元的省份显示灰色虚线
- 点击活跃省份下钻到站点级详情
- 跨省链路以橙色虚线标注

### 3. 告警根因分析

基于知识库中的 OTN 分层传播模型：

```
物理层(光缆) → 光层(OTS/OMS) → 电层(ODU/OTU) → 业务层
```

- 滑动窗口分群（5/15/30/60 分钟可调）
- 告警码语义识别：RLOS/LOS/FAIL 为根因候选，AIS/BDI/SD 为衍生
- 拓扑感知提升：同一传输系统多站同时 LOS → 共享光段故障根因加分
- 传播链可视化：`输入光丢失(紧急) → 帧丢失(紧急) → ODU告警指示(紧急)`

### 4. 高频闪告单盘定位

- 按 `neName::slotNo::boardName` 聚合
- 统计闪告频次、紧急/主要数、告警种类数、平均间隔
- Top10 排名展示

### 5. 报表

- 汇总报表（级别分布、省份分布、Top网元）
- 一键导出 Excel
- 可扩展为 PDF 报告（print API）

### 6. 项目管理

- 多项目 CRUD：新建、切换、重命名、删除
- JSON 导出/导入备份
- IndexedDB 自动持久化

## 模块化架构（Adapter 模式）

新增厂商/数据源只需实现 DataSourceAdapter 接口：

```typescript
interface DataSourceAdapter {
  vendor: string;
  name: string;
  version: string;
  parseAlarms(rows: string[][], mapping: FieldMapping[]): ImportResult<CoreAlarm>;
  parseNetworkElements(rows: string[][], mapping: FieldMapping[]): ImportResult<CoreNE>;
  autoDetectMapping(headers: string[], type: 'alarm' | 'ne'): FieldMapping[];
  getProvinces(): ProvinceCoord[];
  resolveProvince?(neName: string): string | undefined;
}
```

注册适配器：

```typescript
import { DataSourceRegistry } from './core/registry';
DataSourceRegistry.getInstance().register(myAdapter);
```

## 源代码打包

完整源代码位于 `assets/otn-alarm-tool-source.zip`，包含全部 TypeScript 源文件、配置文件、构建脚本和文档。解压后即可按上述说明进行开发和构建。
