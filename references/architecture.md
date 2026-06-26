# OTN 告警巡检工具 — 架构参考

## 总体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Layer (React)                        │
│  Dashboard  Topology  AlarmAnalysis  Import  Report  Projects│
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Store Layer (Zustand)                       │
│  alarms: AlarmRecord[]  networkElements: NetworkElement[]   │
│  projects: ProjectMeta[]  activeProjectId                   │
│  aggregationViewMode  aggregationWindow                     │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│               Adapter Layer (模块化架构)                      │
│  ┌─ DataSourceRegistry (单例) ──────────────────────────┐   │
│  │  ├─ fibrehomeAdapter (内置)                          │   │
│  │  └─ (其他适配器可注册)                                │   │
│  └──────────────────────────────────────────────────────┘   │
│  CoreAlarm / CoreNE (标准化数据类型)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│               Persistence Layer (IndexedDB)                  │
│  projects / alarms / networkElements / alarmTypeDefinitions  │
│  (按 projectId 索引)                                         │
└─────────────────────────────────────────────────────────────┘
```

## 告警根因聚合算法

### OTN 分层传播模型

```
物理层(PHY) → 光层(OTS/OMS) → 电层(ODU/OTU) → 分组层(PKT) → 设备层(DEV)
```

### 告警码语义规则

| 类别 | 告警码 | 角色 |
|------|--------|------|
| 根因 | RLOS, LOS, FAIL, LASER_TF, POWER_DOWN | 本地设备/光缆故障 |
| 衍生 | AIS, LCK, OCI, BDI, BEI, SSF, FDI | 上下游传播指示 |
| 中间 | LOF, LOM, SD | 可根因可衍生（按层级判断） |

### 聚合流程

```
alarms → 按时间排序 → 滑动窗口分群
  → 群内告警依赖图(isDerivedFrom)
  → 根因候选筛选(isRootCauseCandidate)
  → 拓扑感知打分(getTopologyRootCauseBoost)
  → 传播链构建
  → 输出 AlarmGroup[]
```

## 闪告单盘定位

高频闪告单盘定位功能嵌入在 Dashboard 中，通过以下逻辑聚合：

```
alarms → 按 neName::slotNo::boardName 分组
  → 每组统计：总次数/紧急次数/告警种类数
  → 按总次数降序 → 取TopN展示
```

## 数据流

### 导入流程

```
XLS文件 → FileReader/Uint8Array → XLSX.read()
  → findHeaderRowIndex(智能跳过元数据行)
  → 自动列映射(autoDetectMapping)
  → 用户确认映射
  → parseAlarms / parseNetworkElements
  → setAlarms / setNetworkElements (Zustand)
  → IndexedDB 持久化
```

### 拓扑渲染流程

```
networkElements → 提取省份列表(去重)
  → 匹配 PROVINCE_COORDS → 生成 ReactFlow nodes
  → ProvinceNode(isActive判断)
  → 跨省链路生成
  → ReactFlow 渲染
```

## 关键性能设计

- Dashboard 采用单次遍历计算全部统计指标（避免 8 次独立遍历）
- AlarmStormCard 只取最近 5000 条告警做聚合
- alarmAggregator 支持 _quickMode 跳过拓扑构建
- IndexedDB 批量写入每批 1000 条
- useMemo 缓存所有聚合计算结果
