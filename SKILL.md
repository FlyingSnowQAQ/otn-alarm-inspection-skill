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
│   │   ├── fibrehome-adapter.ts # 烽火适配器（字段映射+坐标+NE映射）
│   │   └── index.ts             # 适配器导出
│   ├── types/index.ts           # 原有类型定义（含 @deprecated 标记）
│   ├── theme.ts                 # MUI 暗色主题配置
│   ├── store/useAppStore.ts     # Zustand 全局状态管理
│   ├── db/index.ts              # IndexedDB 持久化封装
│   ├── pages/
│   │   ├── Dashboard.tsx        # 仪表盘（含告警风暴Top10、省份统计）
│   │   ├── Topology.tsx         # 拓扑视图（34省省份→城市→网元三级下钻）
│   │   ├── AlarmAnalysis.tsx    # 告警分析（聚合/明细+根因时间线）
│   │   ├── Import.tsx           # 数据导入（告警/网元双模式切换）
│   │   ├── Report.tsx           # 报表（汇总+巡检+Excel导出）
│   │   └── Projects.tsx         # 项目管理
│   ├── components/
│   │   ├── AlarmStormCard.tsx   # 告警风暴Top10（最近5000条聚合）
│   │   ├── AlarmTimeline.tsx    # 根因传播链时间线可视化
│   │   └── Layout.tsx           # 全局布局+导航栏
│   ├── utils/
│   │   └── alarmAggregator.ts   # 根因聚合算法（OTN分层传播模型+_quickMode）
│   └── data/
│       ├── mockData.ts          # 预置演示数据（50条告警+32网元+10省）
│       ├── neProvinceMap.ts     # 2469条NE→省份映射
│       ├── neSystemMap.ts       # 905条NE→传输系统映射
│       └── prefectureCities.ts  # 全国34省~290地市预定义列表
├── electron/
│   ├── main.cjs                # Electron 主进程
│   └── preload.cjs             # IPC 桥接
├── scripts/
│   ├── fix-build.js            # file://协议兼容处理
│   ├── genSystemMap.cjs        # 传输系统映射生成脚本
│   ├── server.js               # 零依赖 HTTP 服务器
│   └── verify-build.js         # 构建自动验证
├── docs/
│   ├── system_design.md        # 系统设计文档
│   ├── module-arch-design.md   # 模块化架构设计
│   ├── 用户操作手册.md          # 用户操作手册
│   ├── 详细设计文档.md          # 详细设计文档
│   ├── class-diagram.mermaid   # 类型图（Mermaid）
│   └── sequence-diagram.mermaid# 时序图（Mermaid）
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── tailwind.config.ts
└── postcss.config.js
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

### 2. 全国省份拓扑图（三级下钻）

- 预置 34 个省级行政区坐标（中国地图布局）
- 有网元的省份自动点亮（彩色高亮+告警统计Chip）
- 无网元的省份显示灰色虚线
- 跨省链路以橙色虚线标注
- **三级下钻**：省份总览 → 城市级别 → 网元级别
  - **一级（省级总览）**：显示34省节点，活跃省份带告警统计芯片
  - **二级（城市级别）**：点击省份进入省内城市视图，展示该省份所有地市（~290个预定义城市），有网元的城市点亮+告警芯片，无网元灰选，城市间连线从NE级链路聚合生成
  - **三级（网元级别）**：点击城市进入该城市内具体网元节点列表，每个网元显示名称、类型和告警统计
- **面包屑导航**：省级总览 → 某省 → 某市 三级联动
- **城市名称归一化**：自动处理"大理市"→"大理白族自治州"、"宜良"→"昆明市"等名称差异
- **省份节点优化**：紧凑化渲染（内边距8x14，minWidth 110），减少省级总览重叠
- **ReactFlow 状态同步**：通过 useEffect 在省份/城市切换时同步 useNodesState，避免黑屏

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

- 基于 Dashboard 聚合统计，按 `neName::slotNo::boardName` 分组
- 统计闪告频次、紧急/主要数、告警种类数
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
// src/core/adapter.ts
interface DataSourceAdapter {
  vendor: string;
  name: string;
  version: string;
  parseAlarms(rows: string[][], mapping: FieldMapping[]): ImportResult<CoreAlarm>;
  parseNetworkElements(rows: string[][], mapping: FieldMapping[]): ImportResult<CoreNE>;
  autoDetectMapping(headers: string[], type: 'alarm' | 'ne'): FieldMapping[];
  getProvinces(): ProvinceCoord[];
  resolveProvince?(neName: string): string | undefined;
  resolveTransportSystems?(neName: string): string[] | undefined;
}
```

注册适配器：

```typescript
import { DataSourceRegistry } from './core/registry';
DataSourceRegistry.getInstance().register(myAdapter);
```

## 源代码打包

完整源代码位于 `assets/otn-alarm-tool-source.tar.gz`，包含全部 TypeScript 源文件、配置文件、构建脚本和文档。解压后即可按上述说明进行开发和构建。

## 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.1.3 | 2026-07-03 | 拓扑三级下钻（省份→城市→网元）、地市数据文件、ReactFlow状态同步修复、黑屏修复、省份节点紧凑化 |
| v1.1.2 | 2026-06-26 | 文档修复、架构描述更新 |
| v1.1.1 | 2026-06-22 | 首次 GitHub 同步 |
