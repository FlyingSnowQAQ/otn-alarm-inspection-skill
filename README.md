# OTN 历史告警可视化巡检工具 — WorkBuddy Skill 组件

烽火通信 FONST 系列 OTN WDM 设备的告警数据导入、分析、可视化和报告生成 Skill。

## 目录结构

```
├── SKILL.md                    ← 技能主清单（WorkBuddy 入口）
├── references/
│   ├── quickstart.md           ← 快速入门指南
│   └── architecture.md         ← 架构参考文档
└── assets/
    ├── otn-alarm-tool-source.tar.gz  ← 完整源代码包
    └── adapter-template.ts     ← 新厂商适配器开发模板
```

## 使用方式

在 WorkBuddy 中加载此 Skill 后：

1. 向 WorkBuddy 说："帮我导入烽火告警报表 XLS"
2. WorkBuddy 会自动读取 SKILL.md 中的流程指引
3. 如需扩展新厂商，参考 `assets/adapter-template.ts` 实现
