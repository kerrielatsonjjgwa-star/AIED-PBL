import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// 处理 ES Module 下的 __dirname 问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Koyeb 会自动分配端口到环境变量 PORT，本地则用 3000
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ================= API 路由部分 =================

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, temperature, response_format } = req.body;
    
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error: API Key missing' });
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: temperature || 0.7,
        response_format,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API Error:', response.status, errorText);
      return res.status(response.status).json({ error: `Provider error: ${response.status}` });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ================= 前端静态文件托管部分 =================

// 1. 定义构建后的静态文件目录 (Vite 生成的 dist 文件夹)
const distPath = path.join(__dirname, '../dist');

// 2. 告诉 Express 使用这个目录下的静态文件 (JS, CSS, 图片等)
app.use(express.static(distPath));

// 3. 处理所有未被上面 API 捕获的请求，都返回网页首页 (index.html)
// 这样即使刷新页面，React 路由也能正常工作
app.get('*', (req, res) => {
  // 如果请求的是 API 但没匹配到，返回 404，而不是 HTML
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API Not Found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// ================= 启动服务器 =================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});