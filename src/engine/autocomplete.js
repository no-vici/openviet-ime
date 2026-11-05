/**
 * Vietnamese Auto-Complete, Next-Word Prediction & Gboard-Style Habit Learning Engine
 * Provides intelligent word auto-completion, next-word suggestions (bigram language model),
 * and personalized on-device habit learning similar to Google Gboard.
 *
 * @license Apache-2.0
 */

import { getVietnameseWordSet } from './vietnamese-words.js';
import { userDictionary, COMMON_ENGLISH_WORDS } from './dictionary.js';
import { getEmojiSuggestions, checkEmojiShortcut } from './emoji.js';

/**
 * Remove Vietnamese accents for diacritic-tolerant search
 */
export function stripVietnameseAccents(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * High-frequency Vietnamese compound words & common collocations
 * Curated from Vietnamese linguistic corpora.
 */
export const COMMON_VIETNAMESE_COMPOUNDS = [
  // Công nghệ, máy tính, tin học
  'nghiên cứu', 'công nghệ', 'thông tin', 'trí tuệ nhân tạo', 'lập trình', 'phần mềm', 'phần cứng',
  'ứng dụng', 'trình duyệt', 'tiện ích', 'mở rộng', 'dữ liệu', 'mạng máy tính', 'hệ điều hành',
  'bảo mật', 'an toàn', 'mật khẩu', 'tài khoản', 'đăng nhập', 'đăng ký', 'giao diện', 'trực tuyến',
  'tải xuống', 'cài đặt', 'kết nối', 'máy chủ', 'trang web', 'cơ sở dữ liệu', 'thiết bị', 'điện tử',
  'trực quan', 'tối ưu hóa', 'tự động', 'thuật toán', 'hệ thống', 'phiên bản', 'cập nhật', 'nâng cấp',
  'bộ nhớ', 'tốc độ', 'dung lượng', 'xử lý', 'thực thi', 'kiểm thử', 'khởi động', 'chuyển đổi',

  // Y tế, sức khỏe & cấp cứu
  'cấp cứu', 'bác sĩ', 'bệnh viện', 'y tế', 'sức khỏe', 'khám bệnh', 'chữa bệnh', 'thuốc tây',
  'dược phẩm', 'điều trị', 'chăm sóc', 'bảo hiểm', 'phòng khám', 'y tá', 'dược sĩ', 'hồi sức',
  'cứu hộ', 'cứu nạn', 'cứu thương', 'khẩn cấp', 'sơ cứu', 'chẩn đoán', 'xét nghiệm', 'phục hồi',

  // Đời sống, gia đình, xã hội
  'gia đình', 'bạn bè', 'cha mẹ', 'anh em', 'đồng nghiệp', 'hạnh phúc', 'vui vẻ', 'may mắn',
  'bình an', 'thành công', 'yêu thương', 'cuộc sống', 'con người', 'xã hội', 'văn hóa',
  'truyền thống', 'hiện đại', 'lịch sử', 'đất nước', 'thành phố', 'việt nam', 'quốc tế', 'thế giới',
  'môi trường', 'thiên nhiên', 'thời tiết', 'khí hậu', 'buổi sáng', 'buổi trưa', 'buổi chiều', 'buổi tối',
  'hôm nay', 'ngày mai', 'hôm qua', 'tuần này', 'tháng này', 'năm nay', 'tương lai', 'quá khứ',

  // Công việc, kinh tế, quản lý
  'phát triển', 'quản lý', 'kinh doanh', 'doanh nghiệp', 'công ty', 'khách hàng', 'hợp đồng',
  'kinh tế', 'thương mại', 'dịch vụ', 'sản phẩm', 'thị trường', 'tiêu dùng', 'thương hiệu',
  'uy tín', 'chất lượng', 'hiệu quả', 'tiến độ', 'kế hoạch', 'dự án', 'báo cáo', 'đánh giá',
  'thảo luận', 'hội nghị', 'cuộc họp', 'đề xuất', 'giải pháp', 'ý tưởng', 'sáng tạo', 'đổi mới',
  'thành lập', 'hợp tác', 'đầu tư', 'tài chính', 'ngân hàng', 'chi phí', 'doanh thu', 'lợi nhuận',
  'nhiệm vụ', 'trách nhiệm', 'mục tiêu', 'kết quả', 'thành tựu', 'kinh nghiệm', 'chuyên môn',

  // Giáo dục, học tập, khoa học
  'giáo dục', 'học tập', 'học sinh', 'sinh viên', 'giáo viên', 'thầy cô', 'trường học', 'đại học',
  'kiến thức', 'kỹ năng', 'bài tập', 'kiểm tra', 'kỳ thi', 'tốt nghiệp', 'bằng cấp',
  'khoa học', 'toán học', 'vật lý', 'hóa học', 'sinh học', 'địa lý', 'ngôn ngữ', 'tiếng việt',
  'tiếng anh', 'ngoại ngữ', 'sách báo', 'tài liệu', 'thư viện', 'hội thảo', 'nghiên cứu sinh',

  // Giao tiếp & Hành động thường ngày
  'xin chào', 'cảm ơn', 'xin lỗi', 'tạm biệt', 'hẹn gặp lại', 'chúc mừng', 'làm phiền',
  'giúp đỡ', 'hỗ trợ', 'liên hệ', 'thông báo', 'yêu cầu', 'hướng dẫn', 'sử dụng', 'thực hiện',
  'hoàn thành', 'bắt đầu', 'kết thúc', 'tiếp tục', 'dừng lại', 'quan trọng', 'cần thiết',
  'đặc biệt', 'phổ biến', 'tuyệt vời', 'xuất sắc', 'hài lòng', 'yên tâm', 'tin tưởng',
  'hy vọng', 'quyết định', 'lựa chọn', 'thay đổi', 'cải tiến', 'khắc phục', 'giải quyết'
];

/**
 * Curated Vietnamese Bigram Collocations (Word_A -> [Word_B1, Word_B2, ...])
 * Pre-trained base language model for instant next-word prediction
 */
export const DEFAULT_VIETNAMESE_BIGRAMS = {
  'việt': ['nam', 'trì', 'dã', 'kiều', 'vị', 'hóa', 'cộng'],
  'cộng': ['hòa', 'đồng', 'tác', 'sản', 'sự', 'hưởng'],
  'công': ['nghệ', 'ty', 'việc', 'nhân', 'trình', 'an', 'cộng', 'dân'],
  'thông': ['tin', 'báo', 'minh', 'qua', 'dịch', 'thường', 'thoáng'],
  'trí': ['tuệ', 'nhớ', 'thức', 'não', 'tưởng'],
  'phát': ['triển', 'hiện', 'hành', 'huy', 'sinh', 'động'],
  'xin': ['chào', 'lỗi', 'phép', 'mời', 'hỏi', 'cảm ơn'],
  'cảm': ['ơn', 'thấy', 'giác', 'nghĩ', 'nhận', 'xúc'],
  'học': ['tập', 'sinh', 'hỏi', 'hành', 'viện', 'phí', 'bổng'],
  'sinh': ['viên', 'hoạt', 'sống', 'sản', 'học', 'nhật'],
  'kinh': ['tế', 'doanh', 'nghiệm', 'phí', 'khủng'],
  'nghiên': ['cứu'],
  'cấp': ['cứu', 'bậc', 'cao', 'nhật', 'phép', 'trên'],
  'bảo': ['mật', 'hiểm', 'vệ', 'quản', 'trì', 'hộ'],
  'máy': ['tính', 'chủ', 'bay', 'móc', 'in', 'giặt'],
  'hệ': ['thống', 'điều hành', 'sinh thái', 'số', 'tư tưởng'],
  'trang': ['web', 'bị', 'chủ', 'trí', 'điểm'],
  'dữ': ['liệu', 'dội', 'kiện'],
  'kiểm': ['tra', 'thử', 'soát', 'toán', 'định'],
  'khách': ['hàng', 'sạn', 'quan', 'thể'],
  'thời': ['gian', 'tiết', 'khắc', 'đại', 'kỳ', 'vụ'],
  'hôm': ['nay', 'qua', 'kia'],
  'ngày': ['mai', 'kia', 'tháng', 'đêm', 'sinh', 'công'],
  'gia': ['đình', 'nhập', 'tăng', 'công', 'dụng'],
  'bạn': ['bè', 'thân', 'đọc', 'gái', 'trai', 'hàng'],
  'sức': ['khỏe', 'mạnh', 'lực', 'hút', 'sống', 'ép'],
  'thành': ['phố', 'công', 'viên', 'lập', 'tựu', 'phần'],
  'đất': ['nước', 'đai', 'sét', 'vàng'],
  'chúc': ['mừng', 'ngủ ngon', 'thành công', 'bạn', 'anh', 'chị', 'em'],
  'làm': ['việc', 'phiền', 'ơn', 'quen', 'sao', 'lại', 'gì'],
  'hẹn': ['gặp lại', 'ước', 'ngày', 'giờ'],
  'tuyệt': ['vời', 'đối', 'mật', 'chủng', 'vọng'],
  'quan': ['trọng', 'tâm', 'hệ', 'điểm', 'sát', 'chức'],
  'giải': ['pháp', 'quyết', 'thích', 'trí', 'thưởng', 'tỏa'],
  'tối': ['ưu', 'nay', 'qua', 'đa', 'thiểu', 'mật'],
  'thực': ['hiện', 'tế', 'thi', 'hành', 'tập', 'phẩm', 'chất'],
  'kết': ['quả', 'nối', 'hợp', 'thúc', 'luận', 'cấu', 'tinh'],
  'bắt': ['đầu', 'buộc', 'tay', 'chước', 'kịp'],
  'tiếp': ['tục', 'theo', 'cận', 'nhận', 'thị', 'xúc'],
  'hoàn': ['thành', 'toàn', 'hảo', 'trả', 'vốn', 'lương'],
  'an': ['toàn', 'ninh', 'tâm', 'cư', 'dưỡng'],
  'mật': ['khẩu', 'mã', 'thiết', 'độ', 'vụ'],
  'tài': ['khoản', 'chính', 'năng', 'liệu', 'sản'],
  'đăng': ['nhập', 'ký', 'tải', 'quang', 'cai'],
  'giao': ['diện', 'tiếp', 'dịch', 'thông', 'hàng', 'kết'],
  'trực': ['tuyến', 'quan', 'tiếp', 'thuộc'],
  'tải': ['xuống', 'lên', 'trọng', 'bản'],
  'cài': ['đặt', 'then', 'cắm', 'bẫy'],
  'khởi': ['động', 'sự', 'nghiệp', 'đầu'],
  'bệnh': ['viện', 'nhân', 'tật', 'án'],
  'bác': ['sĩ', 'học', 'ái'],
  'y': ['tế', 'tá', 'khoa', 'học'],
  'hồi': ['sức', 'phục', 'âm', 'đáp', 'hương'],
  'cứu': ['hộ', 'nạn', 'thương', 'tế', 'giúp', 'chữa'],
  'sơ': ['cứu', 'khai', 'đồ', 'đẳng', 'tuyển'],
  'chẩn': ['đoán', 'trị'],
  'xét': ['nghiệm', 'duyệt', 'xử', 'lại'],
  'phòng': ['khám', 'ngừa', 'chống', 'ngủ', 'bệnh', 'ban'],
  'hợp': ['đồng', 'tác', 'nhất', 'pháp', 'lý', 'thời'],
  'doanh': ['nghiệp', 'thu', 'trại'],
  'sản': ['phẩm', 'xuất', 'sinh', 'khoa'],
  'thị': ['trường', 'xã', 'hiếu', 'thực'],
  'chi': ['phí', 'nhánh', 'tiết', 'tiêu', 'viện'],
  'lợi': ['nhuận', 'ích', 'thế', 'dụng'],
  'nhiệm': ['vụ', 'kỳ'],
  'trách': ['nhiệm', 'mắng', 'cứ'],
  'ý': ['tưởng', 'nghĩa', 'kiến', 'thức', 'chí'],
  'đổi': ['mới', 'thay', 'trả', 'gác'],
  'giáo': ['viên', 'dục', 'trình', 'án', 'sư'],
  'thầy': ['cô', 'giáo', 'thuốc', 'u'],
  'trường': ['học', 'đại học', 'hợp', 'ca', 'kỳ'],
  'đại': ['học', 'biểu', 'diện', 'gia', 'đồng'],
  'kỹ': ['năng', 'thuật', 'xảo', 'sư'],
  'ngoại': ['ngữ', 'giao', 'ô', 'tệ', 'thương'],
  'văn': ['hóa', 'bản', 'học', 'phòng', 'minh'],
  'lịch': ['sử', 'trình', 'thiệp', 'sự'],
  'quốc': ['tế', 'gia', 'tịch', 'phòng', 'hội'],
  'thế': ['giới', 'kỷ', 'hệ', 'lực', 'nào'],
  'tôi': ['nghĩ', 'thấy', 'muốn', 'là', 'đang', 'đã', 'sẽ', 'biết'],
  'anh': ['em', 'ấy', 'chị', 'ta', 'trai'],
  'chị': ['em', 'ấy', 'gái'],
  'em': ['gái', 'trai', 'út', 'yêu'],
  'chúng': ['tôi', 'ta', 'nó', 'mình'],
  'mọi': ['người', 'thứ', 'lúc', 'nơi'],
  'rất': ['vui', 'tốt', 'nhiều', 'hay', 'đẹp', 'nhanh'],
  'quá': ['nhiều', 'trình', 'khứ', 'tuyệt', 'nhanh'],
  'nhiều': ['hơn', 'người', 'lần', 'năm', 'thứ'],
  'ít': ['nhất', 'hơn', 'khi'],
  'đi': ['làm', 'học', 'chơi', 'về', 'ngủ', 'đâu'],
  'về': ['nhà', 'đâu', 'việc', 'vấn đề'],
  'đến': ['nơi', 'lúc', 'đây', 'gặp'],
  'ở': ['đâu', 'đây', 'đó', 'nhà', 'trường'],
  'có': ['thể', 'phải', 'không', 'được', 'nhiều'],
  'không': ['có', 'thể', 'phải', 'được', 'sao', 'biết'],
  'được': ['biết', 'chọn', 'xem', 'hưởng'],
  'phải': ['chăng', 'làm', 'đi', 'nói'],
  'muốn': ['nói', 'làm', 'biết', 'đi', 'xem'],
  'biết': ['ơn', 'trước', 'điều', 'gì'],
  'nói': ['chuyện', 'rằng', 'lời', 'thật'],
  'nghe': ['nói', 'thấy', 'nhạc', 'lời'],
  'nhìn': ['thấy', 'lại', 'nhận', 'ngắm'],
  'yêu': ['thương', 'quý', 'thích', 'cầu'],
  'tin': ['tưởng', 'tức', 'nhắn', 'học'],
  'hy': ['vọng'],
  'quyết': ['định', 'tâm', 'liệt'],
  'lựa': ['chọn', 'lọc'],
  'hài': ['lòng', 'hòa', 'hước', 'thiệt'],
  'yên': ['tâm', 'tĩnh', 'lặng', 'ổn'],
  'phúc': ['hậu', 'phần', 'đức', 'đáp']
};

/**
 * Gboard-Style Personalized Habit Learning Model
 * Stores user bigrams (Word_A -> Word_B transition counts) and unigrams (word frequencies)
 * purely on-device (localStorage) with zero telemetry for privacy.
 */
export class GboardLearnedModel {
  constructor() {
    this.storageKey = 'avim_gboard_habit_model';
    this.learningEnabled = true;
    this.userBigrams = {};
    this.userUnigrams = {};
    this.loadFromStorage();
  }

  async loadFromStorage() {
    // 1. Try chrome.storage.local (Shared across all websites and options/popup in extension)
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const stored = await chrome.storage.local.get([this.storageKey]);
        if (stored && stored[this.storageKey]) {
          const parsed = stored[this.storageKey];
          this.userBigrams = parsed.bigrams || {};
          this.userUnigrams = parsed.unigrams || {};
          if (typeof parsed.learningEnabled === 'boolean') {
            this.learningEnabled = parsed.learningEnabled;
          }
          return;
        }
      }
    } catch (e) {
      console.warn('GboardLearnedModel chrome.storage.local load error:', e);
    }

    // 2. Fallback to localStorage (for Web Playground / React SPA)
    try {
      if (typeof localStorage === 'undefined') return;
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.userBigrams = parsed.bigrams || {};
        this.userUnigrams = parsed.unigrams || {};
        if (typeof parsed.learningEnabled === 'boolean') {
          this.learningEnabled = parsed.learningEnabled;
        }
      }
    } catch (e) {
      console.warn('GboardLearnedModel localStorage load error:', e);
    }
  }

  saveToStorage() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
    }
    this._saveTimer = setTimeout(() => {
      this._saveTimer = null;
      this.flushSaveToStorage();
    }, 1200);
  }

  flushSaveToStorage() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }
    const payload = {
      learningEnabled: this.learningEnabled,
      bigrams: this.userBigrams,
      unigrams: this.userUnigrams,
      updatedAt: Date.now()
    };

    // 1. Save to chrome.storage.local for Extension (shared across all web domains and options.html)
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [this.storageKey]: payload }).catch(() => {});
      }
    } catch (e) {
      // Ignore extension storage error
    }

    // 2. Save to localStorage for web app / playground
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(payload));
      }
    } catch (e) {
      console.warn('GboardLearnedModel localStorage save error:', e);
    }
  }

  /**
   * Record a bigram transition (word1 -> word2)
   */
  recordTransition(prevWord, nextWord) {
    if (!this.learningEnabled) return;
    const prev = (prevWord || '').trim().toLowerCase();
    const next = (nextWord || '').trim().toLowerCase();
    if (!prev || !next || prev === next) return;
    if (prev.length > 30 || next.length > 30) return;

    if (!this.userBigrams[prev]) {
      this.userBigrams[prev] = {};
    }
    this.userBigrams[prev][next] = (this.userBigrams[prev][next] || 0) + 1;
    this.userUnigrams[next] = (this.userUnigrams[next] || 0) + 1;
    this.saveToStorage();
  }

  /**
   * Record word acceptance or completion frequency
   */
  recordWordUsage(word) {
    if (!this.learningEnabled) return;
    const w = (word || '').trim().toLowerCase();
    if (!w) return;
    this.userUnigrams[w] = (this.userUnigrams[w] || 0) + 1;
    this.saveToStorage();
  }

  /**
   * Reset all learned habits
   */
  clear() {
    this.userBigrams = {};
    this.userUnigrams = {};
    this.flushSaveToStorage();
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove([this.storageKey]).catch(() => {});
      }
    } catch (e) {}
  }

  /**
   * Seed sample collocations and user habits for demonstration
   */
  seedSampleHabits() {
    const samples = [
      ['nghiên', 'cứu', 6],
      ['công', 'nghệ', 5],
      ['thông', 'tin', 5],
      ['trí', 'tuệ', 4],
      ['học', 'tập', 4],
      ['sinh', 'viên', 4],
      ['phát', 'triển', 4],
      ['cấp', 'cứu', 4],
      ['việt', 'nam', 4]
    ];
    for (const [w1, w2, times] of samples) {
      if (!this.userBigrams[w1]) {
        this.userBigrams[w1] = {};
      }
      this.userBigrams[w1][w2] = (this.userBigrams[w1][w2] || 0) + times;
      this.userUnigrams[w2] = (this.userUnigrams[w2] || 0) + times;
    }
    this.flushSaveToStorage();
    return samples.length;
  }

  /**
   * Retrieve statistical summary of learned habits
   */
  getStats() {
    let totalTransitions = 0;
    const topPairs = [];
    for (const [from, toMap] of Object.entries(this.userBigrams)) {
      for (const [to, count] of Object.entries(toMap)) {
        totalTransitions += count;
        topPairs.push({ from, to, count });
      }
    }
    topPairs.sort((a, b) => b.count - a.count);
    return {
      totalPairs: Object.keys(this.userBigrams).length,
      totalTransitions,
      topPairs: topPairs.slice(0, 30),
      totalWordsLearned: Object.keys(this.userUnigrams).length
    };
  }
}

/**
 * Auto-Complete & Next-Word Prediction Manager Class
 */
export class AutoCompleteEngine {
  constructor() {
    this.compounds = [...COMMON_VIETNAMESE_COMPOUNDS];
    this.compoundIndex = this.buildCompoundIndex();
    this.bigrams = { ...DEFAULT_VIETNAMESE_BIGRAMS };
    this.learnedModel = new GboardLearnedModel();
    this.enabled = true;
    this.nextWordEnabled = true;
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;
  }

  setNextWordEnabled(enabled) {
    this.nextWordEnabled = !!enabled;
  }

  setLearningEnabled(enabled) {
    if (this.learnedModel) {
      this.learnedModel.learningEnabled = !!enabled;
    }
  }

  loadFromStorage() {
    if (this.learnedModel && typeof this.learnedModel.loadFromStorage === 'function') {
      this.learnedModel.loadFromStorage();
    }
  }

  saveToStorage() {
    if (this.learnedModel && typeof this.learnedModel.saveToStorage === 'function') {
      this.learnedModel.saveToStorage();
    }
  }

  buildCompoundIndex() {
    return this.compounds.map(word => ({
      word,
      lower: word.toLowerCase(),
      stripped: stripVietnameseAccents(word),
      type: 'compound',
      displayType: 'Cụm từ'
    }));
  }

  /**
   * Add new compound words or phrases dynamically
   */
  addCustomPhrase(phrase) {
    const clean = (phrase || '').trim();
    if (!clean || this.compounds.includes(clean)) return;
    this.compounds.push(clean);
    this.compoundIndex.push({
      word: clean,
      lower: clean.toLowerCase(),
      stripped: stripVietnameseAccents(clean),
      type: 'compound',
      displayType: 'Cụm từ'
    });
  }

  /**
   * Record word transition when user types or chooses word sequence
   */
  recordWordTransition(prevWord, nextWord) {
    this.learnedModel.recordTransition(prevWord, nextWord);
  }

  /**
   * Record word usage
   */
  recordWordUsage(word) {
    this.learnedModel.recordWordUsage(word);
  }

  /**
   * Retrieve statistics about learned habits
   */
  getLearnedStats() {
    return this.learnedModel.getStats();
  }

  /**
   * Clear learned habits
   */
  clearLearnedHabits() {
    this.learnedModel.clear();
  }

  /**
   * Seed sample collocations and user habits for demonstration
   */
  seedLearnedHabits() {
    return this.learnedModel.seedSampleHabits();
  }

  /**
   * Predict Next Word(s) based on previous word, learning history, and Vietnamese collocations
   * @param {string} previousWord The word preceding the current cursor
   * @param {number} limit Maximum number of candidates to return (default: 4)
   * @returns {Array<{ word: string, displayType: string, type: 'learned' | 'bigram' | 'compound', count?: number }>}
   */
  getNextWordSuggestions(previousWord, limit = 5) {
    if (!this.enabled || !this.nextWordEnabled || !previousWord) return [];

    const raw = previousWord.trim();
    if (!raw) return [];

    const prevLower = raw.toLowerCase();
    const isFirstUpper = raw[0] === raw[0].toUpperCase() && raw[0] !== raw[0].toLowerCase();
    const isAllUpper = raw.length > 1 && raw === raw.toUpperCase();

    const candidates = [];
    const seen = new Set();

    // 1. Check User-Learned Habits (Highest Priority, personalized to this user)
    const userFollowers = this.learnedModel.userBigrams[prevLower];
    if (userFollowers) {
      const sortedUserFollowers = Object.entries(userFollowers).sort((a, b) => b[1] - a[1]);
      for (const [w, count] of sortedUserFollowers) {
        if (!seen.has(w)) {
          candidates.push({
            word: this.formatWordCase(w, isFirstUpper, isAllUpper),
            displayType: 'Thói quen',
            type: 'learned',
            count
          });
          seen.add(w);
        }
        if (candidates.length >= limit) break;
      }
    }

    // 2. Check Curated Base Bigrams
    const baseFollowers = this.bigrams[prevLower];
    if (baseFollowers && candidates.length < limit) {
      for (const w of baseFollowers) {
        const wLower = w.toLowerCase();
        if (!seen.has(wLower)) {
          candidates.push({
            word: this.formatWordCase(w, isFirstUpper, isAllUpper),
            displayType: 'Gợi ý chuẩn',
            type: 'bigram'
          });
          seen.add(wLower);
        }
        if (candidates.length >= limit) break;
      }
    }

    // 3. Check Compound Phrases starting with previous word (e.g. 'nghiên cứu' -> 'cứu')
    if (candidates.length < limit) {
      for (const item of this.compoundIndex) {
        if (item.lower.startsWith(prevLower + ' ')) {
          const remainder = item.word.slice(prevLower.length + 1).trim();
          const remainderLower = remainder.toLowerCase();
          if (remainder && !seen.has(remainderLower)) {
            candidates.push({
              word: this.formatWordCase(remainder, isFirstUpper, isAllUpper),
              displayType: 'Cụm từ',
              type: 'compound'
            });
            seen.add(remainderLower);
          }
        }
        if (candidates.length >= limit) break;
      }
    }

    return candidates.slice(0, limit);
  }

  /**
   * Find suggestions matching the current query prefix
   * @param {string} rawPrefix The word or prefix currently typed by user
   * @param {number} limit Maximum number of suggestions to return (default: 7)
   * @returns {Array<{ word: string, displayType: string, type: string, matchScore: number }>}
   */
  getSuggestions(rawPrefix, limit = 7) {
    if (!this.enabled || !rawPrefix) return [];

    const prefix = rawPrefix.trim();
    if (prefix.length < 1) return [];

    // 0. Check Emoji Query (e.g. :tim, :cuoi, :lua, :like)
    if (prefix.startsWith(':')) {
      const emojiList = getEmojiSuggestions(prefix, limit);
      if (emojiList.length > 0) {
        return emojiList;
      }
    }

    const prefixLower = prefix.toLowerCase();
    const prefixStripped = stripVietnameseAccents(prefix);
    const isFirstUpper = prefix[0] === prefix[0].toUpperCase() && prefix[0] !== prefix[0].toLowerCase();
    const isAllUpper = prefix.length > 1 && prefix === prefix.toUpperCase();

    const results = [];
    const seenWords = new Set();

    // 1. Check User Dictionary (Highest priority)
    const userWords = userDictionary.getWords();
    for (const uWord of userWords) {
      const uLower = uWord.toLowerCase();
      const uStripped = stripVietnameseAccents(uWord);
      const learnedBoost = Math.min((this.learnedModel.userUnigrams[uLower] || 0) * 4, 30);

      if (uLower.startsWith(prefixLower)) {
        results.push({
          word: this.formatWordCase(uWord, isFirstUpper, isAllUpper),
          type: 'user',
          displayType: 'Từ riêng',
          matchScore: 100 - (uWord.length - prefix.length) + learnedBoost
        });
        seenWords.add(uLower);
      } else if (uStripped.startsWith(prefixStripped)) {
        results.push({
          word: this.formatWordCase(uWord, isFirstUpper, isAllUpper),
          type: 'user',
          displayType: 'Từ riêng',
          matchScore: 80 - (uWord.length - prefix.length) + learnedBoost
        });
        seenWords.add(uLower);
      }
      if (results.length >= limit * 2) break;
    }

    // 2. Check Vietnamese Compound Words
    for (const item of this.compoundIndex) {
      if (seenWords.has(item.lower)) continue;
      const learnedBoost = Math.min((this.learnedModel.userUnigrams[item.lower] || 0) * 4, 30);

      // Exact diacritic prefix match
      if (item.lower.startsWith(prefixLower)) {
        results.push({
          word: this.formatWordCase(item.word, isFirstUpper, isAllUpper),
          type: item.type,
          displayType: item.displayType,
          matchScore: 90 - (item.word.length - prefix.length) * 0.5 + learnedBoost
        });
        seenWords.add(item.lower);
      }
      // Unaccented prefix match (e.g. typing 'nghien' matches 'nghiên cứu', 'cap' matches 'cấp cứu')
      else if (item.stripped.startsWith(prefixStripped)) {
        results.push({
          word: this.formatWordCase(item.word, isFirstUpper, isAllUpper),
          type: item.type,
          displayType: item.displayType,
          matchScore: 70 - (item.word.length - prefix.length) * 0.5 + learnedBoost
        });
        seenWords.add(item.lower);
      }

      if (results.length >= limit * 3) break;
    }

    // 3. Check Built-in Vietnamese Single Syllables (~6,700 words)
    if (results.length < limit) {
      const vnSet = getVietnameseWordSet();
      for (const sWord of vnSet) {
        if (sWord.length <= prefix.length && sWord.toLowerCase() === prefixLower) continue;
        const sLower = sWord.toLowerCase();
        if (seenWords.has(sLower)) continue;

        const learnedBoost = Math.min((this.learnedModel.userUnigrams[sLower] || 0) * 4, 30);
        const sStripped = stripVietnameseAccents(sWord);
        if (sLower.startsWith(prefixLower)) {
          results.push({
            word: this.formatWordCase(sWord, isFirstUpper, isAllUpper),
            type: 'syllable',
            displayType: 'Từ đơn',
            matchScore: 60 - (sWord.length - prefix.length) + learnedBoost
          });
          seenWords.add(sLower);
        } else if (sStripped.startsWith(prefixStripped)) {
          results.push({
            word: this.formatWordCase(sWord, isFirstUpper, isAllUpper),
            type: 'syllable',
            displayType: 'Từ đơn',
            matchScore: 40 - (sWord.length - prefix.length) + learnedBoost
          });
          seenWords.add(sLower);
        }

        if (results.length >= limit * 2) break;
      }
    }

    // 4. Check Common English & Developer Terms
    if (results.length < limit && /^[a-zA-Z]+$/.test(prefix)) {
      for (const eWord of COMMON_ENGLISH_WORDS) {
        const eLower = eWord.toLowerCase();
        if (seenWords.has(eLower)) continue;
        const learnedBoost = Math.min((this.learnedModel.userUnigrams[eLower] || 0) * 4, 30);
        if (eLower.startsWith(prefixLower)) {
          results.push({
            word: this.formatWordCase(eWord, isFirstUpper, isAllUpper),
            type: 'tech',
            displayType: 'Tiếng Anh',
            matchScore: 50 - (eWord.length - prefix.length) + learnedBoost
          });
          seenWords.add(eLower);
        }
        if (results.length >= limit * 2) break;
      }
    }

    // Sort by matchScore descending, then word length ascending
    results.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return a.word.length - b.word.length;
    });

    return results.slice(0, limit);
  }

  /**
   * Format suggestion capitalization to match user input case
   */
  formatWordCase(word, isFirstUpper, isAllUpper) {
    if (!word) return '';
    if (isAllUpper) {
      return word.toUpperCase();
    }
    if (isFirstUpper) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word;
  }
}

// Global auto-complete singleton
export const autoCompleteEngine = new AutoCompleteEngine();