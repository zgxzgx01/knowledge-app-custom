/**
 * 知识点管理系统 - 完整版本
 */

class KnowledgeApp {
  constructor() {
    this.knowledgePoints = [];
    this.editingId = null;
    this.currentCategory = "全部";
    this.onlyFavorites = false;
    this.currentTestItem = null;
    this.deleteCallback = null;
    
    this.STORAGE_KEY = "knowledge_app_custom_v2";
    this.MAX_KEYWORDS = 10;
    this.MAX_QUESTION_LENGTH = 200;
    this.MAX_ANSWER_LENGTH = 2000;
    this.MAX_CATEGORY_LENGTH = 50;
    this.MAX_KEYWORD_LENGTH = 30;
    
    this.initDOMElements();
    this.init();
  }
  
  el(id) { return document.getElementById(id); }
  
  initDOMElements() {
    // 表单元素
    this.questionInput = this.el("questionInput");
    this.answerInput = this.el("answerInput");
    this.categoryInput = this.el("categoryInput");
    this.keywordInput = this.el("keywordInput");
    this.keywordList = this.el("keywordList");
    this.saveBtn = this.el("saveBtn");
    this.cancelBtn = this.el("cancelBtn");
    this.addKeywordBtn = this.el("addKeywordBtn");
    
    // 显示元素
    this.cardsContainer = this.el("cardsContainer");
    this.categoryTabs = this.el("categoryTabs");
    this.totalCount = this.el("totalCount");
    this.visibleCount = this.el("visibleCount");
    
    // 搜索和筛选
    this.searchInput = this.el("searchInput");
    this.searchBtn = this.el("searchBtn");
    this.clearSearchBtn = this.el("clearSearchBtn");
    this.favoriteToggle = this.el("favoriteToggle");
    
    // 导入导出
    this.exportBtn = this.el("exportBtn");
    this.importBtn = this.el("importBtn");
    this.importFile = this.el("importFile");
    
    // 测试功能
    this.randomTestBtn = this.el("randomTestBtn");
    this.testModal = this.el("testModal");
    this.testQuestion = this.el("testQuestion");
    this.testAnswer = this.el("testAnswer");
    this.showAnswerBtn = this.el("showAnswerBtn");
    this.nextQuestionBtn = this.el("nextQuestionBtn");
    this.closeTestBtn = this.el("closeTestBtn");
    this.closeTestModalBtn = this.el("closeTestModalBtn");
    this.correctAnswer = this.el("correctAnswer");
    
    // 确认删除模态框
    this.confirmModal = this.el("confirmModal");
    this.confirmDeleteBtn = this.el("confirmDeleteBtn");
    this.cancelDeleteBtn = this.el("cancelDeleteBtn");
    this.confirmMessage = this.el("confirmMessage");
    
    // 提示信息
    this.toast = this.el("toast");
    this.questionError = this.el("questionError");
    this.answerError = this.el("answerError");
    
    // 表单和面板
    this.knowledgeForm = this.el("knowledgeForm");
    this.panelTitle = document.querySelector(".panel-title");
    this.categoryDatalist = this.el("categoryDatalist");
  }
  
  init() {
    this.loadData();
    this.bindEvents();
    this.render();
    this.showToast('欢迎使用知识点管理系统！', 'success');
  }
  
  bindEvents() {
    // 表单事件
    this.knowledgeForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSave();
    });
    
    // 关键词输入
    this.keywordInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addKeywordFromInput();
      }
    });
    
    this.addKeywordBtn?.addEventListener('click', () => {
      this.addKeywordFromInput();
    });
    
    // 按钮事件
    this.saveBtn?.addEventListener('click', this.handleSave.bind(this));
    this.cancelBtn?.addEventListener('click', this.resetForm.bind(this));
    
    // 搜索功能
    this.searchInput?.addEventListener('input', this.debounce(this.renderCards.bind(this), 300));
    this.searchBtn?.addEventListener('click', this.renderCards.bind(this));
    this.clearSearchBtn?.addEventListener('click', () => {
      this.searchInput.value = '';
      this.clearSearchBtn.classList.add('hidden');
      this.renderCards();
    });
    
    this.searchInput?.addEventListener('input', () => {
      const hasValue = this.searchInput.value.trim().length > 0;
      this.clearSearchBtn?.classList.toggle('hidden', !hasValue);
    });
    
    // 筛选功能
    this.favoriteToggle?.addEventListener('click', () => {
      this.onlyFavorites = !this.onlyFavorites;
      this.favoriteToggle.textContent = this.onlyFavorites ? '显示全部' : '只看收藏';
      this.renderCards();
    });
    
    // 导入导出
    this.exportBtn?.addEventListener('click', this.exportJSON.bind(this));
    this.importBtn?.addEventListener('click', () => this.importFile?.click());
    this.importFile?.addEventListener('change', this.importJSON.bind(this));
    
    // 测试功能
    this.randomTestBtn?.addEventListener('click', this.startRandomTest.bind(this));
    this.showAnswerBtn?.addEventListener('click', this.showTestAnswer.bind(this));
    this.nextQuestionBtn?.addEventListener('click', this.nextTestQuestion.bind(this));
    this.closeTestBtn?.addEventListener('click', this.closeTest.bind(this));
    this.closeTestModalBtn?.addEventListener('click', this.closeTest.bind(this));
    
    // 确认删除模态框
    this.confirmDeleteBtn?.addEventListener('click', this.confirmDelete.bind(this));
    this.cancelDeleteBtn?.addEventListener('click', this.closeConfirmModal.bind(this));
    
    // 模态框背景点击关闭
    this.testModal?.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.closeTest();
      }
    });
    
    this.confirmModal?.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.closeConfirmModal();
      }
    });
    
    // 全局键盘事件
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!this.testModal?.classList.contains('hidden')) this.closeTest();
        if (!this.confirmModal?.classList.contains('hidden')) this.closeConfirmModal();
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this.handleSave();
      }
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        this.exportJSON();
      }
    });
    
    // 实时输入验证
    this.questionInput?.addEventListener('input', () => this.validateField('question'));
    this.answerInput?.addEventListener('input', () => this.validateField('answer'));
    
    // 分类输入自动完成
    this.categoryInput?.addEventListener('input', this.updateCategoryDatalist.bind(this));
  }
  
  // 数据管理
  loadData() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this.knowledgePoints = this.validateAndCleanData(data);
      } else {
        this.knowledgePoints = [];
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      this.knowledgePoints = [];
      this.showToast('数据加载失败，已重置为空', 'error');
    }
  }
  
  saveData() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.knowledgePoints));
      return true;
    } catch (error) {
      console.error('保存数据失败:', error);
      this.showToast('保存失败，请检查存储空间', 'error');
      return false;
    }
  }
  
  validateAndCleanData(data) {
    if (!Array.isArray(data)) return [];
    
    return data.filter(item => {
      return item && typeof item === 'object' &&
             typeof item.question === 'string' &&
             typeof item.answer === 'string' &&
             item.question.trim() && item.answer.trim();
    }).map(item => ({
      id: item.id || this.generateId(),
      question: this.sanitizeText(item.question, this.MAX_QUESTION_LENGTH),
      answer: this.sanitizeText(item.answer, this.MAX_ANSWER_LENGTH),
      category: this.sanitizeText(item.category || '其他', this.MAX_CATEGORY_LENGTH),
      keywords: Array.isArray(item.keywords) ?
        item.keywords.slice(0, this.MAX_KEYWORDS)
          .filter(k => typeof k === 'string' && k.trim())
          .map(k => this.sanitizeText(k, this.MAX_KEYWORD_LENGTH)) : [],
      favorite: Boolean(item.favorite),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }
  
  sanitizeText(text, maxLength) {
    if (typeof text !== 'string') return '';
    return text.trim().substring(0, maxLength);
  }
  
  generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  }
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // 表单验证
  validateField(fieldName) {
    let isValid = true;
    
    if (fieldName === 'question') {
      const value = this.questionInput?.value?.trim() || '';
      const errorEl = this.questionError;
      
      if (!value) {
        this.showFieldError(errorEl, '问题不能为空');
        isValid = false;
      } else if (value.length > this.MAX_QUESTION_LENGTH) {
        this.showFieldError(errorEl, `问题长度不能超过${this.MAX_QUESTION_LENGTH}个字符`);
        isValid = false;
      } else {
        this.clearFieldError(errorEl);
      }
    }
    
    if (fieldName === 'answer') {
      const value = this.answerInput?.value?.trim() || '';
      const errorEl = this.answerError;
      
      if (!value) {
        this.showFieldError(errorEl, '答案不能为空');
        isValid = false;
      } else if (value.length > this.MAX_ANSWER_LENGTH) {
        this.showFieldError(errorEl, `答案长度不能超过${this.MAX_ANSWER_LENGTH}个字符`);
        isValid = false;
      } else {
        this.clearFieldError(errorEl);
      }
    }
    
    return isValid;
  }
  
  validateForm() {
    const questionValid = this.validateField('question');
    const answerValid = this.validateField('answer');
    return questionValid && answerValid;
  }
  
  showFieldError(errorEl, message) {
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }
  
  clearFieldError(errorEl) {
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }
  
  // 关键词管理
  addKeywordFromInput() {
    const value = this.keywordInput?.value?.trim();
    if (!value) return;
    
    if (value.length > this.MAX_KEYWORD_LENGTH) {
      this.showToast(`关键词长度不能超过${this.MAX_KEYWORD_LENGTH}个字符`, 'error');
      return;
    }
    
    const existingChips = Array.from(this.keywordList?.children || []);
    if (existingChips.some(chip => chip.textContent === value)) {
      this.showToast('该关键词已存在', 'warning');
      this.keywordInput.value = '';
      return;
    }
    
    if (existingChips.length >= this.MAX_KEYWORDS) {
      this.showToast(`关键词数量不能超过${this.MAX_KEYWORDS}个`, 'error');
      return;
    }
    
    const chip = this.createKeywordChip(value);
    this.keywordList?.appendChild(chip);
    this.keywordInput.value = '';
  }
  
  createKeywordChip(text) {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = text;
    chip.setAttribute('role', 'listitem');
    chip.setAttribute('aria-label', `关键词: ${text}`);
    
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
    });
    
    chip.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showConfirmModal(`确定要删除关键词 "${text}" 吗？`, () => {
        chip.remove();
      });
    });
    
    return chip;
  }
  
  getKeywordsFromList() {
    return Array.from(this.keywordList?.querySelectorAll('.chip') || [])
      .map(chip => chip.textContent.trim())
      .filter(text => text);
  }
  
  // 表单重置
  resetForm() {
    this.editingId = null;
    
    if (this.questionInput) this.questionInput.value = '';
    if (this.answerInput) this.answerInput.value = '';
    if (this.categoryInput) this.categoryInput.value = '';
    if (this.keywordInput) this.keywordInput.value = '';
    if (this.keywordList) this.keywordList.innerHTML = '';
    
    this.clearFieldError(this.questionError);
    this.clearFieldError(this.answerError);
    
    this.cancelBtn?.classList.add('hidden');
    if (this.panelTitle) {
      this.panelTitle.textContent = '➕ 添加知识点';
    }
    
    this.questionInput?.focus();
  }
  
  // 填充表单
  populateForm(knowledgePoint) {
    this.editingId = knowledgePoint.id;
    
    if (this.questionInput) this.questionInput.value = knowledgePoint.question;
    if (this.answerInput) this.answerInput.value = knowledgePoint.answer;
    if (this.categoryInput) this.categoryInput.value = knowledgePoint.category || '';
    
    if (this.keywordList) this.keywordList.innerHTML = '';
    (knowledgePoint.keywords || []).forEach(keyword => {
      const chip = this.createKeywordChip(keyword);
      chip.classList.add('active');
      this.keywordList.appendChild(chip);
    });
    
    this.clearFieldError(this.questionError);
    this.clearFieldError(this.answerError);
    
    this.cancelBtn?.classList.remove('hidden');
    if (this.panelTitle) {
      this.panelTitle.textContent = '✏️ 编辑知识点';
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // 保存处理
  handleSave() {
    if (!this.validateForm()) {
      this.showToast('请修复表单错误', 'error');
      return;
    }
    
    const question = this.questionInput?.value?.trim();
    const answer = this.answerInput?.value?.trim();
    const category = this.categoryInput?.value?.trim() || '其他';
    const keywords = this.getKeywordsFromList();
    
    const knowledgePoint = {
      id: this.editingId || this.generateId(),
      question,
      answer,
      category,
      keywords,
      favorite: false,
      createdAt: this.editingId ?
        this.knowledgePoints.find(kp => kp.id === this.editingId)?.createdAt || new Date().toISOString() :
        new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (this.editingId) {
      const index = this.knowledgePoints.findIndex(kp => kp.id === this.editingId);
      if (index !== -1) {
        knowledgePoint.favorite = this.knowledgePoints[index].favorite;
        this.knowledgePoints[index] = knowledgePoint;
        this.showToast('知识点更新成功！', 'success');
      }
    } else {
      this.knowledgePoints.unshift(knowledgePoint);
      this.showToast('知识点添加成功！', 'success');
    }
    
    if (this.saveData()) {
      this.resetForm();
      this.render();
    }
  }
  
  // 导出JSON
  exportJSON() {
    try {
      const dataToExport = {
        version: '2.0',
        exportTime: new Date().toISOString(),
        totalCount: this.knowledgePoints.length,
        data: this.knowledgePoints
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `knowledge-points-${new Date().toISOString().split('T')[0]}.json`;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      this.showToast('数据导出成功！', 'success');
    } catch (error) {
      console.error('导出失败:', error);
      this.showToast('导出失败，请重试', 'error');
    }
  }
  
  // 导入JSON
  importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        let importData;
        
        if (Array.isArray(jsonData)) {
          importData = jsonData;
        } else if (jsonData.data && Array.isArray(jsonData.data)) {
          importData = jsonData.data;
        } else {
          throw new Error('无效的数据格式');
        }
        
        const cleanedData = this.validateAndCleanData(importData);
        
        if (cleanedData.length === 0) {
          throw new Error('没有可用的数据');
        }
        
        const message = `即将导入 ${cleanedData.length} 条知识点，这将覆盖当前所有数据。是否继续？`;
        
        this.showConfirmModal(message, () => {
          this.knowledgePoints = cleanedData;
          if (this.saveData()) {
            this.resetForm();
            this.render();
            this.showToast(`导入成功！共 ${cleanedData.length} 条知识点`, 'success');
          }
        });
        
      } catch (error) {
        console.error('导入失败:', error);
        this.showToast(`导入失败: ${error.message}`, 'error');
      } finally {
        event.target.value = '';
      }
    };
    
    reader.onerror = () => {
      this.showToast('文件读取失败', 'error');
    };
    
    reader.readAsText(file);
  }
  
  // 渲染主函数
  render() {
    this.renderTabs();
    this.renderCards();
    this.updateCategoryDatalist();
    this.updateStats();
  }
  
  // 渲染分类标签
  renderTabs() {
    if (!this.categoryTabs) return;
    
    const categories = new Set(['全部', '收藏']);
    this.knowledgePoints.forEach(kp => {
      if (kp.category) {
        categories.add(kp.category);
      }
    });
    
    this.categoryTabs.innerHTML = '';
    
    Array.from(categories).forEach(category => {
      const tab = document.createElement('div');
      tab.className = `tab${this.currentCategory === category ? ' active' : ''}`;
      tab.textContent = category;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', this.currentCategory === category);
      
      tab.addEventListener('click', () => {
        this.currentCategory = category;
        this.onlyFavorites = (category === '收藏');
        
        if (this.favoriteToggle) {
          this.favoriteToggle.textContent = this.onlyFavorites ? '显示全部' : '只看收藏';
        }
        
        this.renderTabs();
        this.renderCards();
      });
      
      this.categoryTabs.appendChild(tab);
    });
  }
  
  // 获取过滤后的知识点
  getFilteredKnowledgePoints(categoryFilter = null, applySearch = true) {
    let filtered = this.knowledgePoints.slice();
    
    if (applySearch) {
      const searchQuery = this.searchInput?.value?.trim().toLowerCase() || '';
      if (searchQuery) {
        filtered = filtered.filter(kp => {
          return kp.question.toLowerCase().includes(searchQuery) ||
                 kp.answer.toLowerCase().includes(searchQuery) ||
                 (kp.keywords || []).some(keyword => keyword.toLowerCase().includes(searchQuery)) ||
                 (kp.category || '').toLowerCase().includes(searchQuery);
        });
      }
    }
    
    const category = categoryFilter || this.currentCategory;
    if (category && category !== '全部') {
      if (category === '收藏') {
        filtered = filtered.filter(kp => kp.favorite);
      } else {
        filtered = filtered.filter(kp => (kp.category || '其他') === category);
      }
    }
    
    if (this.onlyFavorites) {
      filtered = filtered.filter(kp => kp.favorite);
    }
    
    return filtered;
  }
  
  // 渲染卡片
  renderCards() {
    if (!this.cardsContainer) return;
    
    const filteredKnowledgePoints = this.getFilteredKnowledgePoints();
    
    this.cardsContainer.innerHTML = '';
    
    if (filteredKnowledgePoints.length === 0) {
      this.renderEmptyState();
      return;
    }
    
    filteredKnowledgePoints.forEach(kp => {
      const card = this.createKnowledgeCard(kp);
      this.cardsContainer.appendChild(card);
    });
    
    this.updateStats();
  }
  
  // 渲染空状态
  renderEmptyState() {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.innerHTML = `
      <div class="empty-icon">📄</div>
      <h3>暂无知识点</h3>
      <p>开始添加你的第一个知识点吧！</p>
    `;
    emptyDiv.style.cssText = `
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted);
    `;
    this.cardsContainer.appendChild(emptyDiv);
  }
  
  // 创建知识点卡片
  createKnowledgeCard(kp) {
    const card = document.createElement('article');
    card.className = 'card collapsed';
    card.setAttribute('aria-label', `知识点: ${kp.question}`);
    
    // 卡片头部
    const head = document.createElement('div');
    head.className = 'card-head';
    
    const title = document.createElement('h3');
    title.className = 'title';
    title.textContent = kp.question;
    
    const star = document.createElement('span');
    star.className = 'star';
    star.textContent = kp.favorite ? '⭐' : '☆';
    star.title = kp.favorite ? '已收藏' : '收藏';
    star.setAttribute('aria-label', kp.favorite ? '取消收藏' : '添加收藏');
    star.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleFavorite(kp.id);
    });
    
    head.appendChild(title);
    head.appendChild(star);
    
    // 卡片主体
    const body = document.createElement('div');
    body.className = 'card-body';
    
    // 关键词标签
    const tags = document.createElement('div');
    tags.className = 'tags';
    (kp.keywords || []).forEach(keyword => {
      const tag = document.createElement('span');
      tag.className = 'chip';
      tag.textContent = keyword;
      tags.appendChild(tag);
    });
    
    // 元信息
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `
      <span>分类: ${kp.category || '其他'}</span>
      ${kp.createdAt ? `<span>创建: ${new Date(kp.createdAt).toLocaleDateString()}</span>` : ''}
    `;
    
    // 答案内容
    const answer = document.createElement('div');
    answer.className = 'answer';
    answer.textContent = kp.answer;
    
    // 操作按钮
    const actions = document.createElement('div');
    actions.className = 'actions';
    
    const showBtn = document.createElement('button');
    showBtn.textContent = '显示答案';
    showBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      card.classList.toggle('collapsed');
      showBtn.textContent = card.classList.contains('collapsed') ? '显示答案' : '收起答案';
    });
    
    const editBtn = document.createElement('button');
    editBtn.textContent = '编辑';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.populateForm(kp);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '删除';
    deleteBtn.className = 'danger';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showConfirmModal(
        `确定要删除知识点“${kp.question}”吗？此操作无法撤销。`,
        () => this.deleteKnowledgePoint(kp.id)
      );
    });
    
    actions.appendChild(showBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    
    // 组装卡片
    body.appendChild(tags);
    body.appendChild(meta);
    body.appendChild(answer);
    body.appendChild(actions);
    
    card.appendChild(head);
    card.appendChild(body);
    
    return card;
  }
  
  // 切换收藏状态
  toggleFavorite(id) {
    const kp = this.knowledgePoints.find(item => item.id === id);
    if (kp) {
      kp.favorite = !kp.favorite;
      kp.updatedAt = new Date().toISOString();
      this.saveData();
      this.renderCards();
      this.showToast(kp.favorite ? '已添加到收藏' : '已取消收藏', 'success');
    }
  }
  
  // 删除知识点
  deleteKnowledgePoint(id) {
    this.knowledgePoints = this.knowledgePoints.filter(kp => kp.id !== id);
    this.saveData();
    this.render();
    this.showToast('知识点已删除', 'success');
    this.closeConfirmModal();
  }
  
  // 更新统计信息
  updateStats() {
    if (this.totalCount) {
      this.totalCount.textContent = `总计: ${this.knowledgePoints.length}`;
    }
    if (this.visibleCount) {
      const visible = this.getFilteredKnowledgePoints().length;
      this.visibleCount.textContent = `显示: ${visible}`;
    }
  }
  
  // 更新分类数据列表
  updateCategoryDatalist() {
    if (!this.categoryDatalist) return;
    
    const categories = new Set();
    this.knowledgePoints.forEach(kp => {
      if (kp.category && kp.category !== '其他') {
        categories.add(kp.category);
      }
    });
    
    this.categoryDatalist.innerHTML = '';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      this.categoryDatalist.appendChild(option);
    });
  }
  
  // 随机测试
  startRandomTest() {
    const candidates = this.getFilteredKnowledgePoints();
    
    if (candidates.length === 0) {
      this.showToast('当前没有可用于测试的题目', 'warning');
      return;
    }
    
    this.currentTestItem = candidates[Math.floor(Math.random() * candidates.length)];
    
    if (this.testQuestion) {
      this.testQuestion.textContent = this.currentTestItem.question;
    }
    
    if (this.testAnswer) {
      this.testAnswer.value = '';
    }
    
    if (this.correctAnswer) {
      this.correctAnswer.classList.add('hidden');
      const answerContent = this.correctAnswer.querySelector('.answer-content');
      if (answerContent) {
        answerContent.textContent = this.currentTestItem.answer;
      }
    }
    
    if (this.showAnswerBtn) {
      this.showAnswerBtn.style.display = 'inline-flex';
      this.showAnswerBtn.textContent = '显示答案';
    }
    
    if (this.nextQuestionBtn) {
      this.nextQuestionBtn.classList.add('hidden');
    }
    
    this.testModal?.classList.remove('hidden');
  }
  
  showTestAnswer() {
    if (this.correctAnswer) {
      this.correctAnswer.classList.remove('hidden');
    }
    
    if (this.showAnswerBtn) {
      this.showAnswerBtn.style.display = 'none';
    }
    
    if (this.nextQuestionBtn) {
      this.nextQuestionBtn.classList.remove('hidden');
    }
  }
  
  nextTestQuestion() {
    this.startRandomTest();
  }
  
  closeTest() {
    this.testModal?.classList.add('hidden');
    this.currentTestItem = null;
  }
  
  // 显示确认模态框
  showConfirmModal(message, callback) {
    if (this.confirmMessage) {
      this.confirmMessage.textContent = message;
    }
    
    this.deleteCallback = callback;
    this.confirmModal?.classList.remove('hidden');
  }
  
  confirmDelete() {
    if (this.deleteCallback) {
      this.deleteCallback();
      this.deleteCallback = null;
    }
  }
  
  closeConfirmModal() {
    this.confirmModal?.classList.add('hidden');
    this.deleteCallback = null;
  }
  
  // 显示提示信息
  showToast(message, type = 'info') {
    if (!this.toast) return;
    
    this.toast.textContent = message;
    this.toast.className = `toast ${type}`;
    this.toast.classList.remove('hidden');
    
    setTimeout(() => {
      this.toast?.classList.add('hidden');
    }, 3000);
  }
}

// 启动应用
window.addEventListener('DOMContentLoaded', () => {
  window.app = new KnowledgeApp();
});