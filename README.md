# CityPulse —— 城市旧区改造模拟器（Urban Renewal Simulator）

CityPulse 是一个面向 AIED 的项目式学习（PBL）环境：你扮演“城市规划咨询师”，在预算与回合限制内改造“老榕树街区”，并与多方角色进行证据驱动的协商。

## Features

- 多角色协商：张大妈（居民）、李总（开发商）、陈博士（专家）、王科长（政府审批）
- 证据文件：每个角色可提供可引用的证据材料，用于提案与审批
- 可复现仿真：指标变化由确定性的模拟器计算（LLM 可选，仅用于解释）
- 数据反馈：雷达图展示满意度 / 经济 / 环境，News Feed 展示舆情与事件

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Visualization**: Recharts

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository (or navigate to this folder).
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Project

Start the development server:

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

## API Key

- 当前版本默认使用“本地规则引擎”生成角色回复与审批结果，不需要配置任何 API 密钥。
- 如果你后续希望接入真实 LLM（OpenAI/Gemini 等），再新增 `.env` 并在前端服务层读取 `VITE_...` 环境变量即可。

## How to Play

1. 调研：与角色对话，查看立场/偏好与证据
2. 提案：编辑网格地图，撰写策略陈述（可引用证据）
3. 审批：与王科长沟通，补齐合规、预算与扰民控制要点
4. 模拟：系统根据网格变更与策略进行指标仿真，并生成事件反馈
5. 迭代：根据反馈继续下一回合
