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
  'hy vọng', 'quyết định', 'lựa chọn', 'thay đổi', 'cải tiến', 'khắc phục', 'giải quyết',

  // Địa danh Tây Nguyên & Dân tộc thiểu số
  'Đắk Lắk', 'Đắk Nông', 'Kon Tum', 'Gia Lai', 'Lâm Đồng',
  'Buôn Ma Thuột', 'Pleiku', 'Bảo Lộc', 'Đà Lạt', 'A Yun Pa',
  'Krông Nô', 'Krông Búk', 'Krông Pắk', 'Krông Ana', 'Krông Bông',
  'Krông Năng', 'Krông A', "Cư M'gar", 'Cư Kuin', "Ea H'leo", 'Ea Kar',
  'Ea Súp', "M'Đrắk", 'Đắk Mil', 'Đắk Song', 'Đắk Glong', 'Đắk Tô',
  'Đắk Hà', 'Đắk Đoa', 'Chư Sê', 'Chư Prông', 'Chư Păh', 'Đức Cơ',
  'Ia Grai', "Ia H'Drai", 'Sa Thầy', 'Ngọc Hồi', 'Tu Mơ Rông',
  'Đơn Dương', 'Đam Rông', 'Lạc Dương', 'Di Linh', 'Bảo Lâm', 'Cát Tiên',
  "Đắk R'lấp", 'Tà Nung', 'Ô Loan',

  // Địa danh Bắc - Trung - Nam phổ biến
  'Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Hạ Long', 'Sa Pa', 'Mộc Châu',
  'Điện Biên Phủ', 'Lai Châu', 'Sơn La', 'Cao Bằng', 'Lạng Sơn',
  'Huế', 'Đà Nẵng', 'Hội An', 'Quy Nhơn', 'Nha Trang',
  'Phan Thiết', 'Quảng Ngãi', 'Tam Kỳ', 'Đông Hà', 'Vinh',
  'Sài Gòn', 'TP.HCM', 'Cần Thơ', 'Vũng Tàu', 'Biên Hòa', 'Mỹ Tho',
  'Bến Tre', 'Long Xuyên', 'Rạch Giá', 'Cà Mau', 'Bạc Liêu', 'Sóc Trăng',

  // Cụm từ Hán-Việt & từ hiếm
  'khuếch tán', 'khuynh hướng', 'ngoắt ngoéo', 'khuấy động', 'hết sẩy', 'trời ơi'
];

/**
 * Curated Vietnamese Bigram Collocations (Word_A -> [Word_B1, Word_B2, ...])
 * Pre-trained base language model for instant next-word prediction
 */
export const DEFAULT_VIETNAMESE_BIGRAMS = {
  // ── Quốc gia / dân tộc / địa danh ──
  'việt': ['nam', 'trì', 'dã', 'kiều', 'vị', 'hóa', 'cộng'],
  'cộng': ['hòa', 'đồng', 'tác', 'sản', 'sự', 'hưởng'],
  'quốc': ['tế', 'gia', 'tịch', 'phòng', 'hội'],
  'thế': ['giới', 'kỷ', 'hệ', 'lực', 'nào'],
  'đất': ['nước', 'đai', 'sét', 'vàng'],
  'đắk': ['lắk', 'nông', 'mil', 'song', 'glong', 'tô', 'hà', 'đoa', "r'lấp"],
  'buôn': ['ma thuột', 'mê thuột', 'làng', 'bán'],
  'krông': ['nô', 'búk', 'pắk', 'ana', 'bông', 'năng', 'a'],
  'kon': ['tum', 'plông'],
  'gia': ['lai', 'đình', 'nhập', 'tăng', 'công', 'dụng'],
  'lâm': ['đồng', 'nghiệp', 'thao', 'chung'],
  'đà': ['lạt', 'nẵng'],
  'bảo': ['lộc', 'lâm', 'mật', 'hiểm', 'vệ', 'quản', 'trì', 'hộ', 'an'],
  'hà': ['nội', 'tĩnh', 'nam', 'giang', 'tiên'],
  'hải': ['phòng', 'dương', 'sản', 'quân', 'ngoại'],
  'sài': ['gòn'],
  'hạ': ['long', 'tầng', 'cánh', 'bệ'],
  'nha': ['trang', 'khoa', 'học'],
  'phan': ['thiết', 'rang'],
  'bến': ['tre', 'xe', 'tàu', 'đỗ'],
  'rạch': ['giá'],
  'cà': ['mau', 'phê', 'chua', 'pháo'],
  'bạc': ['liêu', 'trắng', 'bẽo', 'đầu'],
  'sóc': ['trăng', 'sơn'],
  'chư': ['sê', 'prông', 'păh'],
  'ea': ["h'leo", 'kar', 'súp'],
  'cư': ["m'gar", 'kuin', 'trú', 'dân', 'xử'],
  'ia': ['grai', "h'drai"],
  'khuếch': ['tán', 'đại'],
  'khuynh': ['hướng', 'đảo'],

  // ── Công nghệ / công việc / kinh doanh ──
  'công': ['nghệ', 'ty', 'việc', 'nhân', 'trình', 'an', 'cộng', 'dân'],
  'thông': ['tin', 'báo', 'minh', 'qua', 'dịch', 'thường', 'thoáng'],
  'trí': ['tuệ', 'nhớ', 'thức', 'não', 'tưởng'],
  'phát': ['triển', 'hiện', 'hành', 'huy', 'sinh', 'động'],
  'kinh': ['tế', 'doanh', 'nghiệm', 'phí', 'khủng'],
  'doanh': ['nghiệp', 'thu', 'trại'],
  'sản': ['phẩm', 'xuất', 'sinh', 'khoa'],
  'thị': ['trường', 'xã', 'hiếu', 'thực'],
  'chi': ['phí', 'nhánh', 'tiết', 'tiêu', 'viện'],
  'lợi': ['nhuận', 'ích', 'thế', 'dụng'],
  'nhiệm': ['vụ', 'kỳ'],
  'trách': ['nhiệm', 'mắng', 'cứ'],
  'hợp': ['đồng', 'tác', 'nhất', 'pháp', 'lý', 'thời'],
  'máy': ['tính', 'chủ', 'bay', 'móc', 'in', 'giặt'],
  'hệ': ['thống', 'điều hành', 'sinh thái', 'số', 'tư tưởng'],
  'trang': ['web', 'bị', 'chủ', 'trí', 'điểm'],
  'dữ': ['liệu', 'dội', 'kiện'],
  'kiểm': ['tra', 'thử', 'soát', 'toán', 'định'],
  'khách': ['hàng', 'sạn', 'quan', 'thể'],
  'mật': ['khẩu', 'mã', 'thiết', 'độ', 'vụ'],
  'tài': ['khoản', 'chính', 'năng', 'liệu', 'sản'],
  'đăng': ['nhập', 'ký', 'tải', 'quang', 'cai', 'xuất'],
  'giao': ['diện', 'tiếp', 'dịch', 'thông', 'hàng', 'kết'],
  'trực': ['tuyến', 'quan', 'tiếp', 'thuộc'],
  'tải': ['xuống', 'lên', 'trọng', 'bản'],
  'cài': ['đặt', 'then', 'cắm', 'bẫy'],
  'khởi': ['động', 'sự', 'nghiệp', 'đầu'],
  'kết': ['quả', 'nối', 'hợp', 'thúc', 'luận', 'cấu', 'tinh'],
  'thực': ['hiện', 'tế', 'thi', 'hành', 'tập', 'phẩm', 'chất'],
  'giải': ['pháp', 'quyết', 'thích', 'trí', 'thưởng', 'tỏa'],
  'quan': ['trọng', 'tâm', 'hệ', 'điểm', 'sát', 'chức'],
  'tối': ['ưu', 'nay', 'qua', 'đa', 'thiểu', 'mật'],

  // ── Thời gian ──
  'thời': ['gian', 'tiết', 'khắc', 'đại', 'kỳ', 'vụ'],
  'hôm': ['nay', 'qua', 'kia', 'trước'],
  'ngày': ['mai', 'kia', 'tháng', 'đêm', 'sinh', 'công', 'hôm', 'nay'],
  'tuần': ['này', 'sau', 'trước', 'tới'],
  'tháng': ['này', 'sau', 'trước', 'tới', 'mười'],
  'năm': ['nay', 'sau', 'ngoái', 'trước'],
  'giờ': ['này', 'đây', 'rồi', 'chưa'],
  'phút': ['trước', 'sau', 'nữa'],
  'giây': ['nữa', 'trước'],

  // ── Gia đình / quan hệ xã hội ──
  'bạn': ['bè', 'thân', 'đọc', 'gái', 'trai', 'hàng'],
  'tôi': ['nghĩ', 'thấy', 'muốn', 'là', 'đang', 'đã', 'sẽ', 'biết'],
  'anh': ['em', 'ấy', 'chị', 'ta', 'trai', 'yêu', 'hai', 'ba', 'tư'],
  'chị': ['em', 'ấy', 'gái'],
  'em': ['gái', 'trai', 'út', 'yêu'],
  'chúng': ['tôi', 'ta', 'nó', 'mình'],
  'mọi': ['người', 'thứ', 'lúc', 'nơi'],

  // ── Y tế / sức khỏe ──
  'bệnh': ['viện', 'nhân', 'tật', 'án'],
  'bác': ['sĩ', 'học', 'ái'],
  'y': ['tế', 'tá', 'khoa', 'học'],
  'hồi': ['sức', 'phục', 'âm', 'đáp', 'hương'],
  'cứu': ['hộ', 'nạn', 'thương', 'tế', 'giúp', 'chữa'],
  'sơ': ['cứu', 'khai', 'đồ', 'đẳng', 'tuyển'],
  'chẩn': ['đoán', 'trị'],
  'xét': ['nghiệm', 'duyệt', 'xử', 'lại'],
  'phòng': ['khám', 'ngừa', 'chống', 'ngủ', 'bệnh', 'ban'],
  'sức': ['khỏe', 'mạnh', 'lực', 'hút', 'sống', 'ép'],

  // ── Giáo dục / trường học ──
  'học': ['tập', 'sinh', 'hỏi', 'hành', 'viện', 'phí', 'bổng'],
  'sinh': ['viên', 'hoạt', 'sống', 'sản', 'học', 'nhật'],
  'nghiên': ['cứu'],
  'cấp': ['cứu', 'bậc', 'cao', 'nhật', 'phép', 'trên'],
  'giáo': ['viên', 'dục', 'trình', 'án', 'sư'],
  'thầy': ['cô', 'giáo', 'thuốc', 'u'],
  'trường': ['học', 'đại học', 'hợp', 'ca', 'kỳ'],
  'đại': ['học', 'biểu', 'diện', 'gia', 'đồng'],
  'kỹ': ['năng', 'thuật', 'xảo', 'sư'],
  'ngoại': ['ngữ', 'giao', 'ô', 'tệ', 'thương'],
  'văn': ['hóa', 'bản', 'học', 'phòng', 'minh'],
  'lịch': ['sử', 'trình', 'thiệp', 'sự'],
  'bắt': ['đầu', 'buộc', 'tay', 'chước', 'kịp'],
  'tiếp': ['tục', 'theo', 'cận', 'nhận', 'thị', 'xúc'],
  'hoàn': ['thành', 'toàn', 'hảo', 'trả', 'vốn', 'lương'],
  'an': ['toàn', 'ninh', 'tâm', 'cư', 'dưỡng'],

  // ── Giao tiếp / chat / xã giao ──
  'xin': ['chào', 'lỗi', 'phép', 'mời', 'hỏi', 'cảm ơn'],
  'cảm': ['ơn', 'thấy', 'giác', 'nghĩ', 'nhận', 'xúc', 'kích'],
  'chúc': ['mừng', 'ngủ ngon', 'thành công', 'bạn', 'anh', 'chị', 'em'],
  'hẹn': ['gặp lại', 'ước', 'ngày', 'giờ', 'gặp'],
  'tạm': ['biệt', 'thời', 'ngưng'],
  'làm': ['việc', 'phiền', 'ơn', 'quen', 'sao', 'lại', 'gì', 'xong', 'bài', 'hư'],
  'tuyệt': ['vời', 'đối', 'mật', 'chủng', 'vọng'],
  'thành': ['phố', 'công', 'viên', 'lập', 'tựu', 'phần'],
  'ý': ['tưởng', 'nghĩa', 'kiến', 'thức', 'chí'],
  'đổi': ['mới', 'thay', 'trả', 'gác'],

  // ── Động từ / hành động thường dùng ──
  'đi': ['làm', 'học', 'chơi', 'về', 'ngủ', 'đâu'],
  'về': ['nhà', 'đâu', 'việc', 'vấn đề'],
  'đến': ['nơi', 'lúc', 'đây', 'gặp'],
  'ở': ['đâu', 'đây', 'đó', 'nhà', 'trường', 'chỗ làm'],
  'có': ['thể', 'phải', 'không', 'được', 'nhiều'],
  'không': ['có', 'thể', 'phải', 'được', 'sao', 'biết'],
  'được': ['biết', 'chọn', 'xem', 'hưởng', 'rồi', 'không', 'lắm', 'chứ'],
  'phải': ['chăng', 'làm', 'đi', 'nói'],
  'muốn': ['nói', 'làm', 'biết', 'đi', 'xem'],
  'biết': ['ơn', 'trước', 'điều', 'gì'],
  'nói': ['chuyện', 'rằng', 'lời', 'thật'],
  'nghe': ['nói', 'thấy', 'nhạc', 'lời'],
  'nhìn': ['thấy', 'lại', 'nhận', 'ngắm'],
  'yêu': ['thương', 'quý', 'thích', 'cầu'],
  'tin': ['tưởng', 'tức', 'nhắn', 'học', 'người', 'ai'],
  'hy': ['vọng'],
  'quyết': ['định', 'đoán', 'tâm', 'liệt'],
  'lựa': ['chọn', 'lọc'],
  'hài': ['lòng', 'hòa', 'hước', 'thiệt'],
  'yên': ['tâm', 'tĩnh', 'lặng', 'ổn'],
  'phúc': ['hậu', 'phần', 'đức', 'đáp'],
  'ăn': ['uống', 'nhậu', 'sáng', 'trưa', 'chiều', 'tối', 'khuya', 'sang', 'dơ', 'tạp', 'dày', 'bẩn'],

  // ── Từ nối / đại từ / trợ động từ (bổ sung mới) ──
  'và': ['các', 'những', 'có', 'được', 'là', 'sẽ'],
  'của': ['tôi', 'bạn', 'chúng', 'nó', 'những', 'các'],
  'là': ['gì', 'một', 'người', 'cái', 'sự'],
  'cho': ['tôi', 'bạn', 'phép', 'nên', 'với'],
  'với': ['tôi', 'bạn', 'nhau', 'các', 'họ'],
  'như': ['thế', 'vậy', 'là'],
  'để': ['làm', 'xem', 'biết', 'học'],
  'đang': ['làm', 'học', 'ở', 'xem'],
  'đã': ['xong', 'làm', 'biết', 'có'],
  'sẽ': ['làm', 'được', 'xảy ra', 'phải'],

  // ── Cảm xúc / đánh giá (bổ sung mới) ──
  'rất': ['vui', 'tốt', 'nhiều', 'hay', 'đẹp', 'nhanh'],
  'quá': ['nhiều', 'trình', 'khứ', 'tuyệt', 'nhanh'],
  'nhiều': ['hơn', 'người', 'lần', 'năm', 'thứ'],
  'ít': ['nhất', 'hơn', 'khi'],
  'vui': ['vẻ', 'lòng', 'nhộn'],
  'tốt': ['đẹp', 'hơn', 'nhất'],
  'đẹp': ['trai', 'lòng', 'đôi'],
  'thật': ['sự', 'lòng', 'ra', 'đấy'],
  'chắc': ['chắn', 'là', 'rồi'],

  // ── Học tập / đọc viết (bổ sung mới) ──
  'viết': ['bài', 'thư', 'code', 'báo cáo'],
  'đọc': ['sách', 'báo', 'tin', 'hiểu'],
  'xem': ['phim', 'báo', 'tin', 'lại', 'xét', 'bói', 'tử vi'],
  'coi': ['phim', 'báo', 'tin', 'lại', 'bói', 'tử vi'],
};

/**
 * Curated Vietnamese Trigram Collocations (Word_A + " " + Word_B -> [Word_C1, Word_C2, ...])
 * 2-word prior context for deep next-word prediction (Gboard style)
 */
export const DEFAULT_VIETNAMESE_TRIGRAMS = {
  // Y tế / Cấp cứu / Bệnh viện
  'xe cấp': ['cứu'],
  'phòng cấp': ['cứu'],
  'đội cấp': ['cứu'],
  'bệnh viện': ['đa khoa', 'bạch mai', 'chợ rẫy', 'nhi đồng', 'huyết học', 'ung bướu'],
  'bác sĩ': ['chuyên khoa', 'gia đình', 'trưởng khoa'],

  // Lao động / Tài chính / Kinh doanh
  'phụ cấp': ['thâm niên', 'ăn trưa', 'trách nhiệm', 'đặc biệt', 'khu vực'],
  'tiền phụ': ['cấp'],
  'công ty': ['tnhh', 'cổ phần', 'trách nhiệm hữu hạn', 'công nghệ'],
  'tài khoản': ['ngân hàng', 'cá nhân', 'doanh nghiệp'],
  'chuyển khoản': ['ngân hàng', 'thành công', 'ngay'],

  // Địa danh / Quốc gia / Hành chính
  'bộ giao': ['thông'],
  'giao thông': ['vận tải', 'đường bộ', 'hào hiệp'],
  'bộ giáo': ['dục'],
  'giáo dục': ['và đào tạo', 'đại học', 'phổ thông'],
  'bộ tài': ['chính'],
  'bộ y': ['tế'],
  'bộ công': ['an', 'thương'],
  'hồ chí': ['minh'],
  'thành phố': ['hồ chí minh', 'hà nội', 'đà nẵng', 'cần thơ', 'hải phòng'],
  'cộng hòa': ['xã hội chủ nghĩa việt nam'],
  'việt nam': ['cộng hòa', 'vô địch'],

  // Công nghệ / Lập trình
  'trí tuệ': ['nhân tạo'],
  'mạng máy': ['tính'],
  'cơ sở': ['dữ liệu'],
  'hệ điều': ['hành'],
  'mã nguồn': ['mở'],
  'phần mềm': ['mã nguồn mở', 'độc hại', 'tiện ích'],

  // Giao tiếp / Xã giao
  'chúc mừng': ['sinh nhật', 'năm mới', 'thành công', 'bạn'],
  'cảm ơn': ['bạn', 'rất nhiều', 'anh', 'chị', 'em'],
  'hẹn gặp': ['lại', 'nhau'],
  'rất vui': ['được gặp bạn', 'được làm quen'],
  'chúc ngủ': ['ngon'],
  'xin chân': ['thành'],
  'chân thành': ['cảm ơn']
};

/**
 * Gboard-Style Personalized Habit Learning Model
 * Stores user trigrams, bigrams, and unigrams with exponential recency-frequency decay.
 * Purely on-device (chrome.storage.local / localStorage) with zero telemetry for 100% privacy.
 */
export class GboardLearnedModel {
  constructor() {
    this.storageKey = 'avim_gboard_habit_model';
    this.learningEnabled = true;
    this.userTrigrams = {}; // "w1 w2" -> { w3: { count: number, lastUsed: number } }
    this.userBigrams = {};  // w1 -> { w2: { count: number, lastUsed: number } }
    this.userUnigrams = {}; // w -> { count: number, lastUsed: number }
    this.loadFromStorage();
  }

  /**
   * Calculate score incorporating Recency and Frequency (Exponential Decay):
   * Score = count * exp(-lambda * delta_hours)
   * Half-life ~ 14 days (lambda = 0.002 per hour)
   */
  calculateRecencyFrequencyScore(entry, now = Date.now()) {
    if (!entry) return 0;
    if (typeof entry === 'number') {
      return entry; // Legacy format fallback
    }
    const count = entry.count || 1;
    const lastUsed = entry.lastUsed || now;
    const hoursElapsed = Math.max(0, (now - lastUsed) / (1000 * 60 * 60));
    // lambda ~ 0.002 gives a gentle half-life around 2 weeks
    const decay = Math.exp(-0.002 * hoursElapsed);
    return count * decay;
  }

  async loadFromStorage() {
    // 1. Try chrome.storage.local (Shared across all websites and options/popup in extension)
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const stored = await chrome.storage.local.get([this.storageKey]);
        if (stored && stored[this.storageKey]) {
          const parsed = stored[this.storageKey];
          this.userTrigrams = parsed.trigrams || {};
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
        this.userTrigrams = parsed.trigrams || {};
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
      trigrams: this.userTrigrams,
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
   * Record a trigram transition (word1 + word2 -> word3)
   */
  recordTrigramTransition(w1, w2, w3) {
    if (!this.learningEnabled) return;
    const word1 = (w1 || '').trim().toLowerCase();
    const word2 = (w2 || '').trim().toLowerCase();
    const word3 = (w3 || '').trim().toLowerCase();
    if (!word1 || !word2 || !word3) return;
    if (word1.length > 30 || word2.length > 30 || word3.length > 30) return;

    const trigramKey = `${word1} ${word2}`;
    if (!this.userTrigrams[trigramKey]) {
      this.userTrigrams[trigramKey] = {};
    }
    const current = this.userTrigrams[trigramKey][word3];
    const prevCount = typeof current === 'number' ? current : (current?.count || 0);
    this.userTrigrams[trigramKey][word3] = {
      count: prevCount + 1,
      lastUsed: Date.now()
    };
    this.saveToStorage();
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
    const current = this.userBigrams[prev][next];
    const prevCount = typeof current === 'number' ? current : (current?.count || 0);
    this.userBigrams[prev][next] = {
      count: prevCount + 1,
      lastUsed: Date.now()
    };

    const curUnigram = this.userUnigrams[next];
    const unigramCount = typeof curUnigram === 'number' ? curUnigram : (curUnigram?.count || 0);
    this.userUnigrams[next] = {
      count: unigramCount + 1,
      lastUsed: Date.now()
    };
    this.saveToStorage();
  }

  /**
   * Record word acceptance or completion frequency
   */
  recordWordUsage(word) {
    if (!this.learningEnabled) return;
    const w = (word || '').trim().toLowerCase();
    if (!w) return;
    const curUnigram = this.userUnigrams[w];
    const unigramCount = typeof curUnigram === 'number' ? curUnigram : (curUnigram?.count || 0);
    this.userUnigrams[w] = {
      count: unigramCount + 1,
      lastUsed: Date.now()
    };
    this.saveToStorage();
  }

  /**
   * Reset all learned habits
   */
  clear() {
    this.userTrigrams = {};
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
    const now = Date.now();
    for (const [w1, w2, times] of samples) {
      if (!this.userBigrams[w1]) {
        this.userBigrams[w1] = {};
      }
      this.userBigrams[w1][w2] = { count: times, lastUsed: now };
      this.userUnigrams[w2] = { count: times, lastUsed: now };
    }

    // Seed sample trigrams
    const sampleTrigrams = [
      ['xe', 'cấp', 'cứu', 5],
      ['hồ', 'chí', 'minh', 5],
      ['bộ', 'giao', 'thông', 4],
      ['trí', 'tuệ', 'nhân tạo', 4]
    ];
    for (const [w1, w2, w3, times] of sampleTrigrams) {
      const k = `${w1} ${w2}`;
      if (!this.userTrigrams[k]) this.userTrigrams[k] = {};
      this.userTrigrams[k][w3] = { count: times, lastUsed: now };
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
      for (const [to, entry] of Object.entries(toMap)) {
        const count = typeof entry === 'number' ? entry : (entry?.count || 0);
        totalTransitions += count;
        topPairs.push({ from, to, count });
      }
    }
    topPairs.sort((a, b) => b.count - a.count);
    return {
      totalPairs: Object.keys(this.userBigrams).length,
      totalTrigrams: Object.keys(this.userTrigrams).length,
      totalTransitions,
      topPairs: topPairs.slice(0, 30),
      totalWordsLearned: Object.keys(this.userUnigrams).length
    };
  }

  /**
   * Export all learned habits data as JSON string
   * @returns {string} Formatted JSON
   */
  exportJSON() {
    const payload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      trigrams: this.userTrigrams,
      bigrams: this.userBigrams,
      unigrams: this.userUnigrams
    };
    return JSON.stringify(payload, null, 2);
  }

  /**
   * Export bigram habits as CSV string
   * Format: "word1,word2,count"
   * @returns {string} CSV text
   */
  exportCSV() {
    const rows = ['Tu_bat_dau,Tu_ke_tiep,So_lan_go'];
    for (const [w1, toMap] of Object.entries(this.userBigrams)) {
      for (const [w2, entry] of Object.entries(toMap)) {
        const count = typeof entry === 'number' ? entry : (entry?.count || 0);
        rows.push(`"${w1.replace(/"/g, '""')}","${w2.replace(/"/g, '""')}",${count}`);
      }
    }
    return rows.join('\n');
  }

  /**
   * Import learned habits from JSON or CSV string
   * @param {string} rawText Input string
   * @param {boolean} merge If true, increment/combine counts; if false, overwrite
   * @returns {{ success: boolean, count: number, error?: string }}
   */
  importData(rawText, merge = true) {
    if (!rawText || typeof rawText !== 'string') {
      return { success: false, count: 0, error: 'Dữ liệu nhập rỗng hoặc không hợp lệ.' };
    }
    const trimmed = rawText.trim();
    if (!trimmed) {
      return { success: false, count: 0, error: 'Nội dung nhập rỗng.' };
    }

    let importedBigrams = {};
    let importedUnigrams = {};
    let pairCount = 0;

    // Try parsing as JSON first
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        const bigramsSrc = parsed.bigrams || parsed.userBigrams || (typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null);
        const trigramsSrc = parsed.trigrams || parsed.userTrigrams || {};
        const unigramsSrc = parsed.unigrams || parsed.userUnigrams || {};

        if (!bigramsSrc || typeof bigramsSrc !== 'object') {
          return { success: false, count: 0, error: 'Cấu trúc JSON không chứa thuộc tính bigrams hợp lệ.' };
        }

        const now = Date.now();
        for (const [w1, toMap] of Object.entries(bigramsSrc)) {
          if (toMap && typeof toMap === 'object') {
            for (const [w2, entry] of Object.entries(toMap)) {
              const num = typeof entry === 'number' ? entry : parseInt(entry?.count, 10);
              const lastUsed = typeof entry === 'object' && entry?.lastUsed ? entry.lastUsed : now;
              if (!isNaN(num) && num > 0) {
                const k1 = w1.trim().toLowerCase();
                const k2 = w2.trim().toLowerCase();
                if (k1 && k2) {
                  if (!importedBigrams[k1]) importedBigrams[k1] = {};
                  importedBigrams[k1][k2] = { count: num, lastUsed };
                  importedUnigrams[k2] = { count: ((importedUnigrams[k2]?.count || 0) + num), lastUsed };
                  pairCount++;
                }
              }
            }
          }
        }

        // Import trigrams if present in JSON
        if (trigramsSrc && typeof trigramsSrc === 'object') {
          if (!this.userTrigrams) this.userTrigrams = {};
          for (const [tKey, toMap] of Object.entries(trigramsSrc)) {
            if (toMap && typeof toMap === 'object') {
              if (!this.userTrigrams[tKey]) this.userTrigrams[tKey] = {};
              for (const [w3, entry] of Object.entries(toMap)) {
                const num = typeof entry === 'number' ? entry : parseInt(entry?.count, 10);
                const lastUsed = typeof entry === 'object' && entry?.lastUsed ? entry.lastUsed : now;
                if (!isNaN(num) && num > 0) {
                  this.userTrigrams[tKey][w3.trim().toLowerCase()] = { count: num, lastUsed };
                }
              }
            }
          }
        }
      } catch (err) {
        return { success: false, count: 0, error: `Lỗi đọc JSON: ${err.message}` };
      }
    } else {
      // Parse as CSV: w1,w2,count
      const lines = trimmed.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Skip header if matches
        if (i === 0 && (line.toLowerCase().includes('tu_bat_dau') || line.toLowerCase().includes('word1'))) {
          continue;
        }

        let parts = [];
        if (line.includes(',')) {
          parts = line.split(',');
        } else if (line.includes('\t')) {
          parts = line.split('\t');
        } else if (line.includes(';')) {
          parts = line.split(';');
        }

        if (parts.length >= 2) {
          const w1 = parts[0].replace(/^["']|["']$/g, '').trim().toLowerCase();
          const w2 = parts[1].replace(/^["']|["']$/g, '').trim().toLowerCase();
          const count = parts[2] ? parseInt(parts[2].replace(/^["']|["']$/g, '').trim(), 10) : 1;
          const validCount = isNaN(count) || count <= 0 ? 1 : count;

          if (w1 && w2) {
            const now = Date.now();
            if (!importedBigrams[w1]) importedBigrams[w1] = {};
            importedBigrams[w1][w2] = { count: validCount, lastUsed: now };
            importedUnigrams[w2] = { count: validCount, lastUsed: now };
            pairCount++;
          }
        }
      }
    }

    if (pairCount === 0) {
      return { success: false, count: 0, error: 'Không tìm thấy cặp từ hợp lệ trong dữ liệu.' };
    }

    if (!merge) {
      this.userBigrams = importedBigrams;
      this.userUnigrams = importedUnigrams;
    } else {
      const now = Date.now();
      for (const [w1, toMap] of Object.entries(importedBigrams)) {
        if (!this.userBigrams[w1]) this.userBigrams[w1] = {};
        for (const [w2, entry] of Object.entries(toMap)) {
          const addCount = typeof entry === 'number' ? entry : (entry?.count || 1);
          const cur = this.userBigrams[w1][w2];
          const curCount = typeof cur === 'number' ? cur : (cur?.count || 0);
          this.userBigrams[w1][w2] = { count: curCount + addCount, lastUsed: now };
        }
      }
      for (const [w, entry] of Object.entries(importedUnigrams)) {
        const addCount = typeof entry === 'number' ? entry : (entry?.count || 1);
        const cur = this.userUnigrams[w];
        const curCount = typeof cur === 'number' ? cur : (cur?.count || 0);
        this.userUnigrams[w] = { count: curCount + addCount, lastUsed: now };
      }
    }

    this.flushSaveToStorage();
    return { success: true, count: pairCount };
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
    this.trigrams = { ...DEFAULT_VIETNAMESE_TRIGRAMS };
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
   * Supports both bigram (w1 -> w2) and trigram (w0 -> w1 -> w2) learning
   */
  recordWordTransition(prevWord, nextWord, priorWord = '') {
    this.learnedModel.recordTransition(prevWord, nextWord);
    if (priorWord) {
      this.learnedModel.recordTrigramTransition(priorWord, prevWord, nextWord);
    }
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
   * Export learned habits to JSON
   */
  exportLearnedJSON() {
    return this.learnedModel.exportJSON();
  }

  /**
   * Export learned habits to CSV
   */
  exportLearnedCSV() {
    return this.learnedModel.exportCSV();
  }

  /**
   * Import learned habits from text
   */
  importLearnedData(rawText, merge = true) {
    return this.learnedModel.importData(rawText, merge);
  }

  /**
   * Predict Next Word(s) based on 2-word prior context (Trigram), 1-word prior context (Bigram),
   * exponential recency-frequency decay, and Vietnamese compound collocations (Gboard style).
   *
   * @param {string} previousWord The immediate word preceding the cursor (W_n-1)
   * @param {number} limit Maximum number of candidates to return (default: 5)
   * @param {string} priorWord Optional 2nd word preceding the cursor (W_n-2) for Trigram inference
   * @returns {Array<{ word: string, displayType: string, type: 'learned' | 'trigram' | 'bigram' | 'compound', count?: number, score?: number }>}
   */
  getNextWordSuggestions(previousWord, limit = 5, priorWord = '') {
    if (!this.enabled || !this.nextWordEnabled || !previousWord) return [];

    const raw = previousWord.trim();
    if (!raw) return [];

    const prevLower = raw.toLowerCase();
    const priorLower = (priorWord || '').trim().toLowerCase();
    const isFirstUpper = raw[0] === raw[0].toUpperCase() && raw[0] !== raw[0].toLowerCase();
    const isAllUpper = raw.length > 1 && raw === raw.toUpperCase();

    const candidates = [];
    const seen = new Set();
    const now = Date.now();

    // ── TẦNG 1: Trigram Inference (W_n-2 + W_n-1 -> W_n) ──
    if (priorLower) {
      const trigramKey = `${priorLower} ${prevLower}`;

      // 1a. User-Learned Trigrams (Highest specificity & personalization)
      const userTrigramFollowers = this.learnedModel.userTrigrams[trigramKey];
      if (userTrigramFollowers) {
        const sortedTrigrams = Object.entries(userTrigramFollowers)
          .map(([w, entry]) => ({
            w,
            score: this.learnedModel.calculateRecencyFrequencyScore(entry, now),
            rawCount: typeof entry === 'number' ? entry : (entry?.count || 1)
          }))
          .sort((a, b) => b.score - a.score);

        for (const { w, rawCount, score } of sortedTrigrams) {
          if (!seen.has(w)) {
            candidates.push({
              word: this.formatWordCase(w, isFirstUpper, isAllUpper),
              displayType: 'Thói quen sâu',
              type: 'learned',
              count: rawCount,
              score
            });
            seen.add(w);
          }
          if (candidates.length >= limit) break;
        }
      }

      // 1b. Curated Base Trigrams (xe cấp -> cứu, hồ chí -> minh, bộ giao -> thông)
      const baseTrigramFollowers = this.trigrams[trigramKey];
      if (baseTrigramFollowers && candidates.length < limit) {
        for (const w of baseTrigramFollowers) {
          const wLower = w.toLowerCase();
          if (!seen.has(wLower)) {
            candidates.push({
              word: this.formatWordCase(w, isFirstUpper, isAllUpper),
              displayType: 'Ngữ cảnh sâu',
              type: 'trigram'
            });
            seen.add(wLower);
          }
          if (candidates.length >= limit) break;
        }
      }
    }

    // ── TẦNG 2: User-Learned Bigrams (với Recency & Frequency Decay Ranking) ──
    const userFollowers = this.learnedModel.userBigrams[prevLower];
    if (userFollowers && candidates.length < limit) {
      const sortedUserFollowers = Object.entries(userFollowers)
        .map(([w, entry]) => ({
          w,
          score: this.learnedModel.calculateRecencyFrequencyScore(entry, now),
          rawCount: typeof entry === 'number' ? entry : (entry?.count || 1)
        }))
        .sort((a, b) => b.score - a.score);

      for (const { w, rawCount, score } of sortedUserFollowers) {
        if (!seen.has(w)) {
          candidates.push({
            word: this.formatWordCase(w, isFirstUpper, isAllUpper),
            displayType: 'Thói quen',
            type: 'learned',
            count: rawCount,
            score
          });
          seen.add(w);
        }
        if (candidates.length >= limit) break;
      }
    }

    // ── TẦNG 3: Curated Base Bigrams ──
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

    // ── TẦNG 4: Compound Phrases starting with previous word (e.g. 'nghiên cứu' -> 'cứu') ──
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
    const now = Date.now();
    for (const uWord of userWords) {
      const uLower = uWord.toLowerCase();
      const uStripped = stripVietnameseAccents(uWord);
      const learnedEntry = this.learnedModel.userUnigrams[uLower];
      const learnedScore = this.learnedModel.calculateRecencyFrequencyScore(learnedEntry, now);
      const learnedBoost = Math.min(learnedScore * 4, 30);

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
      const learnedEntry = this.learnedModel.userUnigrams[item.lower];
      const learnedScore = this.learnedModel.calculateRecencyFrequencyScore(learnedEntry, now);
      const learnedBoost = Math.min(learnedScore * 4, 30);

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

        const learnedEntry = this.learnedModel.userUnigrams[sLower];
        const learnedScore = this.learnedModel.calculateRecencyFrequencyScore(learnedEntry, now);
        const learnedBoost = Math.min(learnedScore * 4, 30);
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
        const learnedEntry = this.learnedModel.userUnigrams[eLower];
        const learnedScore = this.learnedModel.calculateRecencyFrequencyScore(learnedEntry, now);
        const learnedBoost = Math.min(learnedScore * 4, 30);
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
