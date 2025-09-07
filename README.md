# 📚 知识点管理系统


<p align="center">
  <strong>一个功能完整、界面美观的个人知识管理系统</strong>
</p>

<p align="center">
  支持知识点录入、分类管理、智能搜索、随机测试等功能<br>
  采用纯前端技术，本地存储，无需服务器，开箱即用
</p>

## 🌟 特性

### 📝 知识管理
- **智能录入** - 问题、答案、分类、关键词一站式管理
- **表单验证** - 实时验证，字符长度限制，必填项检查
- **批量操作** - 支持导入导出JSON格式数据
- **数据安全** - 本地存储，自动保存，数据持久化

### 🔍 搜索筛选
- **实时搜索** - 支持问题、答案、关键词、分类全文检索
- **智能分类** - 动态分类标签，一键筛选
- **收藏功能** - 重要知识点收藏管理
- **统计信息** - 实时显示总数和筛选结果

### 🎲 学习测试
- **随机测试** - 从当前筛选结果中随机抽取题目
- **答案比对** - 支持自我答题后查看正确答案
- **连续测试** - 一键进入下一题，高效学习

### 🎨 用户体验
- **响应式设计** - 完美适配桌面端和移动端
- **现代UI** - 简洁优雅的界面设计
- **快捷操作** - 键盘快捷键支持（Ctrl+S保存，Ctrl+E导出）
- **无障碍** - 完整的ARIA标签和键盘导航支持

## 🚀 快速开始

### 本地使用

1. **克隆仓库**
   
   ```bash
   git clone https://github.com/your-username/knowledge-app-custom.git
   cd knowledge-app-custom
   ```
   
2. **启动服务（可选）**
   
   ```bash
   # 使用Python
   python -m http.server 8000
   
   # 或使用Node.js
   npx http-server . -p 8000
   ```
   
3. **打开应用**
   
   - 直接双击 `index.html` 文件
   - 或访问 `http://localhost:8000`（可选）

## 📁 项目结构

```
knowledge-app-custom/
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # 脚本文件
├── data.json           # 示例数据
└── README.md           # 项目文档
```

## 🔧 配置选项

可以在 `script.js` 中修改以下配置：

```javascript
// 配置项
this.MAX_KEYWORDS = 10;        // 最大关键词数量
this.MAX_QUESTION_LENGTH = 200; // 问题最大长度
this.MAX_ANSWER_LENGTH = 2000;  // 答案最大长度
this.MAX_CATEGORY_LENGTH = 50;  // 分类名最大长度
this.MAX_KEYWORD_LENGTH = 30;   // 关键词最大长度
```

---

<div align="center">
  <p>如果这个项目对你有帮助，请给它一个 ⭐️</p>
  <p>Made with ❤️ by <a href="https://github.com/zgxzgx01">zgxzgx01</a></p>
</div>


