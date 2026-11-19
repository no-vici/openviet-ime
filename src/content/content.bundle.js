(() => {
  // src/engine/key-codes.js
  var IME_METHOD = {
    OFF: 0,
    TELEX: 1,
    VNI: 2,
    AUTO: 3
  };
  var TONE_STYLE = {
    MODERN: "modern",
    // hoà, hoá, thuỷ, khoẻ (quy chuẩn mới / BGDĐT: dấu trên âm chính a, e, y)
    CLASSIC: "classic"
    // hòa, hóa, thủy, khỏe (phong cách cũ: dấu trên âm đệm o, u)
  };
  var DELIMITERS = /* @__PURE__ */ new Set([
    " ",
    "	",
    "\n",
    "\r",
    ".",
    ",",
    ";",
    ":",
    "!",
    "?",
    "-",
    "—",
    "_",
    "/",
    "\\",
    "|",
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "<",
    ">",
    '"',
    "'",
    "`",
    "“",
    "”",
    "‘",
    "’"
  ]);
  function isDelimiter(char) {
    if (!char || char.length !== 1) return false;
    return DELIMITERS.has(char);
  }
  function isUrlOrEmailOrCode(textBeforeCaret = "", currentWord = "", nextKey = "") {
    const token = (currentWord || "").trim();
    const fullContext = textBeforeCaret || "";
    const lastChunkMatch = fullContext.match(/[^\s]+$/);
    const currentChunk = lastChunkMatch ? lastChunkMatch[0] : token;
    if (!currentChunk && !token) return false;
    if (/^(https?|ftp|file):\/\//i.test(currentChunk)) {
      return true;
    }
    if (/^(www\.|localhost[\/:]|127\.0\.0\.1)/i.test(currentChunk)) {
      return true;
    }
    if (/\.(com|vn|net|org|io|dev|app|edu|gov|co|me|info|xyz|ai|tech|store|site)(\/|\?|#|$)/i.test(currentChunk)) {
      return true;
    }
    if (/^(\/|~\/|\.\/|\.\.\/)[a-zA-Z0-9_.-]/i.test(currentChunk)) {
      return true;
    }
    if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/i.test(currentChunk)) {
      return true;
    }
    if (currentChunk.includes("@") || token.includes("@")) {
      return true;
    }
    if (/^\d+[a-zA-Z]+$/.test(currentChunk) || /^\d+[a-zA-Z]+$/.test(token)) {
      return true;
    }
    if (/^(?=.*\d)(?=.*[a-f])[0-9a-f]{7,40}$/i.test(currentChunk)) {
      return true;
    }
    if (/^\$\{?[a-zA-Z0-9_]+/i.test(currentChunk) || /^\$\{?[a-zA-Z0-9_]+/i.test(token)) {
      return true;
    }
    if (token.includes("_") || currentChunk.includes("_")) {
      return true;
    }
    if (/[a-zA-Z0-9]-[a-zA-Z0-9]/.test(currentChunk)) {
      return true;
    }
    if (/[a-zA-Z0-9]\.[a-zA-Z0-9]/.test(currentChunk)) {
      return true;
    }
    if (/^(\$|#|--)[a-zA-Z0-9_-]/i.test(currentChunk) || /^(\$|#|--)[a-zA-Z0-9_-]/i.test(token)) {
      return true;
    }
    if (/\.(js|ts|tsx|jsx|json|html|css|scss|py|go|rs|cpp|c|h|java|md|sql|sh|yml|yaml|xml)$/i.test(currentChunk)) {
      return true;
    }
    if (/(\->|=>|::|!=|===?|<=|>=|<\/|\/>)/.test(currentChunk)) {
      return true;
    }
    if (/<[a-zA-Z][a-zA-Z0-9_-]*/.test(currentChunk)) {
      return true;
    }
    const hasAccents = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/iu;
    if (hasAccents.test(currentChunk) && /[A-Z]$/.test(currentChunk) || hasAccents.test(token) && /[A-Z]$/.test(token)) {
      return false;
    }
    if (isCamelOrPascalCase(token) || isCamelOrPascalCase(currentChunk)) {
      return true;
    }
    return false;
  }
  function isCamelOrPascalCase(token = "") {
    if (!token || typeof token !== "string" || token.length < 2) return false;
    const clean = token.replace(/^[^a-zA-Z\p{L}]+/u, "");
    if (clean.length < 2) return false;
    if (/^[\p{Ll}\p{M}]+[A-Z]/u.test(clean)) {
      return true;
    }
    if (/^[\p{Lu}][\p{Ll}\p{M}]+[A-Z]/u.test(clean)) {
      return true;
    }
    return false;
  }
  var DEVELOPER_CHEAT_DOMAINS = /* @__PURE__ */ new Set([
    "github.com",
    "gist.github.com",
    "gitlab.com",
    "leetcode.com",
    "leetcode.cn",
    "vscode.dev",
    "github.dev",
    "stackblitz.com",
    "codesandbox.io",
    "codepen.io",
    "replit.com",
    "jsfiddle.net",
    "kaggle.com",
    "huggingface.co"
  ]);
  function isDeveloperCheatContext(hostname = "", targetElement = null) {
    if (hostname) {
      const host = String(hostname).toLowerCase();
      if (DEVELOPER_CHEAT_DOMAINS.has(host) || Array.from(DEVELOPER_CHEAT_DOMAINS).some((d) => host.endsWith("." + d))) {
        return true;
      }
    }
    if (targetElement && typeof targetElement.closest === "function") {
      if (targetElement.closest(".monaco-editor, .cm-editor, .CodeMirror, .ace_editor, pre, code, [data-mode-id], terminal, .xterm")) {
        return true;
      }
    }
    return false;
  }

  // src/engine/vietnamese-words.js
  var VIETNAMESE_WORDS_STRING = "a abc ai am an ang anh ao ascii au ba bai ban bang banh bao basoi bay be bem ben beng beo bi bia bin binh biên biêng biếc biếm biến biếng biết biếu biền biển biểu biện biệt bo bom bon bong boong boóng bu bua bung buôn buông buýt buốt buồi buồm buồn buồng buổi buộc buột bà bài bàm bàn bàng bành bào bàu bày bá bác bách bái bám bán báng bánh báo bát báu bân bâng bâu bây bã bãi bão bè bèm bèn bèo bé béc bén béng béo bép bét bê bên bênh bêu bì bìa bìm bình bìu bí bía bích bím bính bít bíu bò bòi bòm bòn bòng bó bóc bói bón bóng bóp bót bô bôi bôm bôn bông bõ bõm bõng bù bùa bùi bùm bùn bùng bú búa búi bún búng búp bút băm băn băng bĩ bĩnh bĩu bũm bơ bơi bơm bơn bư bưa bưng bưu bươi bươm bươn bương bươu bước bướm bướng bướp bướu bưởi bượt bạ bạc bạch bại bạn bạnh bạo bạp bạt bạu bả bải bản bảng bảnh bảo bảu bảy bấc bấm bấn bấp bất bấu bấy bầm bần bầng bầu bầy bẩm bẩn bẩy bẫm bẫy bậc bậm bận bập bật bậu bậy bắc bắn bắng bắp bắt bằm bằn bằng bằng bẳn bẵng bặm bặn bặng bặp bặt bẹ bẹn bẹo bẹp bẹt bẻ bẻm bẻo bẽ bẽn bẽo bế bến bếp bết bề bền bềnh bều bể bễ bệ bệch bện bệnh bệt bệu bỉ bỉm bỉnh bỉu bị bịa bịch bịn bịnh bịp bịt bịu bọ bọc bọn bọng bọp bọt bỏ bỏi bỏm bỏng bố bốc bối bốn bống bốp bốt bồ bồi bồm bồn bồng bổ bổi bổn bổng bỗ bỗng bộ bộc bội bộn bộng bộp bột bớ bới bớp bớt bờ bời bờm bờn bở bởi bỡ bỡn bợ bợm bợn bợp bợt bụ bụa bục bụi bụm bụng bụp bụt bủ bủa bủm bủn bủng bứ bức bứng bứt bừa bừng bửa bửng bửu bữa bự bựa bực bựt ca cai cam can canh cao cau cay cha chai chan chang chanh chao chau chay che chem chen cheng cheo chi chia chim chinh chiu chiêm chiên chiêng chiêu chiếc chiếm chiến chiếng chiếp chiết chiếu chiền chiềng chiều chiểu chiện cho choang choi chong choài choàng choá choái choán choáng choãi choèn choé choòng choăn choạc choạng choạp choảng choắt choẹ choẹt chu chua chui chum chun chung chuyên chuyến chuyền chuyển chuyện chuôi chuôm chuông chuẩn chuếch chuệch chuốc chuối chuốt chuồi chuồn chuồng chuỗi chuộc chuội chuộng chuột chuỳ chà chài chàm chàng chành chào chày chá chác chái chán cháng chánh cháo chát cháu cháy châm chân châu chây chã chãi chão chè chèn chèo ché chém chén chéo chép chét chê chêm chênh chì chìa chìm chình chìu chí chích chím chín chính chíp chít chíu chò chòi chòm chòng chó chóa chóc chóe chói chóng chóp chót chôm chôn chông chõ chõm chõng chù chùa chùi chùm chùn chùng chùy chú chúa chúc chúi chúm chúng chút chăm chăn chăng chĩa chĩn chĩnh chũi chũm chũn chơ chơi chơm chơn chư chưa chưn chưng chương chước chướng chườm chường chưởi chưởng chưỡng chược chượp chạ chạc chạch chạm chạn chạng chạnh chạo chạp chạt chạy chả chải chảnh chảo chảu chảy chấm chấn chấp chất chấu chấy chầm chần chầu chầy chẩm chẩn chẫu chậc chậm chận chập chật chậu chắc chắm chắn chắp chắt chằm chằn chằng chẳng chẵn chặc chặm chặn chặng chặp chặt chẹn chẹo chẹp chẹt chẻ chẻm chẻn chẻo chẽ chẽn chế chếch chếnh chết chề chềm chềnh chểnh chễm chễnh chệ chệch chện chệnh chỉ chỉn chỉnh chị chịa chịt chịu chọ chọc chọe chọi chọn chọt chỏ chỏm chỏn chỏng chốc chối chốn chống chốp chốt chồ chồi chồm chồn chồng chổi chổng chỗ chỗm chộ chội chộn chộp chột chớ chới chớm chớp chớt chờ chờm chờn chở chởm chợ chợn chợp chợt chục chụm chụp chụt chủ chủn chủng chứ chứa chức chứng chừ chừa chừng chửa chửi chửi chửng chữ chữa chững chực co coi com con cong coong coóc cu cua cui cum cun cung cuốc cuối cuốn cuống cuồn cuồng cuỗm cuộc cuội cuộn cuộng cà cài càn càng cành cào càu cày cá các cách cái cám cán cáng cánh cáo cáp cát cáu cáy câm cân câng câu cây cãi cò còi còm còn còng có cóc cói cóng cóp cót cô côi côm côn công cõi cõng cù cùi cùm cùn cùng cú cúa cúc cúi cúm cúng cúp cút căm căn căng cũ cũi cũn cũng cơ cơi cơm cơn cư cưa cưng cưu cương cước cưới cướp cười cườm cường cưỡi cưỡng cạ cạc cạch cạm cạn cạnh cạo cạp cạu cạy cả cải cảm cản cảng cảnh cảo cảu cảy cấc cấm cấn cấp cất cấu cấy cầm cần cầu cầy cẩm cẩn cẩu cẩy cẫm cẫn cẫng cận cập cật cậu cậy cắc cắm cắn cắp cắt cằm cằn cẳn cẳng cẵng cặc cặm cặn cặp cặt cọ cọc cọm cọn cọng cọp cọt cỏ cỏi cỏm cỏn cỏng cố cốc cối cốm cốn cống cốp cốt cồ cồm cồn cồng cổ cổi cổn cổng cỗ cỗi cộ cộc cội cộm cộn cộng cộp cột cớ cớm cớn cớt cờ cời cờn cởi cỡ cỡi cỡm cỡn cợn cợt cụ cục cụi cụm cụng cụp cụt củ của củi củn củng cứ cứa cức cứng cứt cứu cừ cừu cử cửa cửi cửng cửu cữ cữu cự cựa cực cựu da dai dam dan dang danh dao day de deo di dim dinh diêm diên diêu diếc diếp diết diếu diềm diều diễm diễn diễu diệc diện diệp diệt diệu do doa doan doanh doi dom don dong doành doá doãi doãn doãng doạ du dua dun dung duy duyên duyệt duềnh duệ duốc duỗi dà dài dàn dàng dành dào dàu dày dá dác dái dám dán dáng dát dáy dâm dân dâng dâu dây dã dãi dãy dè dèn dé dép dê dênh dì dìa dìm dìu dí dích dím dính díp díu dò dòi dòm dòng dó dóa dóc dóm dón dót dô dôi dông dõi dõng dù dùa dùi dùn dùng dúa dúi dúm dún dúng dút dăm dăn dăng dĩ dĩa dĩnh dũ dũi dũng dơ dơi dư dưa dưng dương dưới dướng dường dưỡng dược dượng dượt dạ dạc dại dạm dạn dạng dạo dạt dạy dả dải dảy dấm dấn dấp dấu dấy dầm dần dầu dẩn dẫm dẫn dẫu dẫy dậm dận dập dật dậu dậy dắng dắt dằm dằn dằng dẳng dặc dặm dặn dặng dặt dẹp dẹt dẻ dẻo dẽ dế dề dềnh dể dễ dện dệt dị dịch dịp dịt dịu dọa dọc dọi dọn dọng dọp dỏ dỏm dỏng dốc dối dốt dồi dồn dỗ dỗi dội dộng dột dớ dớp dờ dời dở dởm dỡ dợ dụ dục dụm dụng dứ dứa dức dứt dừ dừa dừng dử dửng dữ dự dự dựa dực dựng e em email en eng eo ga gai gam gan gang ganh gao gau gay gen ghe ghen ghi ghim ghiếc ghiền ghè ghèn ghé ghém ghép ghét ghê ghì ghìm ghẹ ghẹn ghẹo ghẻ ghẽ ghế ghếch ghề ghềnh ghểnh ghệt gi gia giai giam gian giang gianh giao gieo gif gio gioi gion giong gip giu giua giun giuộc già giàn giàng giành giào giàu giày giá giác giám gián giáng giáo giáp giát giâm giâu giây giã giãi giãn giãy gièm gié giéo giê giêng giò giòi giòn gió gióc giói gión gióng giô giôn giông giùi giùm giú giúi giúp giăm giăng giũ giũa giơ giương giướng giường giượng giạ giại giạng giạt giả giải giảm giản giảng giảnh giảo giảu giấc giấm giấp giấu giấy giầm giần giầu giầy giẫm giẫy giậm giận giập giật giậu giắn giắt giằm giằn giằng giặc giặm giặn giặt giẹo giẹp giẻ giếc giếm giếng giết giề giền giềng giễu giọ giọc giọi giọng giọt giỏ giỏi giỏi giỏn giỏng giối giống giốt giồ giồi giồng giổi giỗ giộ giội giộp giới giờ giời giờn giở giỡn giụa giục giụi giủi giừ giữ giữa giữa giựt go gom gon goá goòng gram gu guốc guồi guồng guộc gà gài gàn gàng gành gào gàu gá gác gái gán gánh gáo gáp gáu gáy gâm gân gâu gây gã gãi gãy gì gìm gìn gí gích gíp gò gòn góa góc gói góp gót gô gôm gôn gông gõ gù gùi gùn gùng gút găm găn găng gũi gơ gươm gương gườm gường gưỡng gượm gượng gạ gạc gạch gạn gạnh gạo gạt gả gảy gấc gấm gấp gấu gấy gầm gần gầu gầy gẩm gẫm gẫu gậm gập gật gậy gắm gắn gắng gắp gắt gằm gằn gặc gặm gặn gặng gặp gặt gỉ gọi gọn gọng gọt gỏi gỏng gốc gối gốm gồ gồi gồm gồng gổ gỗ gộ gộc gội gộp gột gớm gờ gờm gờn gở gởi gỡ gợi gợn gợt gụ gục gụi gụt gừ gừng gửi gỵa ha hai ham han hang hanh hao hau hay hcm he hem hen heo hi hia him hiu hiên hiêng hiếm hiến hiếng hiếp hiếu hiềm hiền hiểm hiển hiểu hiện hiệp hiệu hk ho hoa hoan hoang hoay hoe hoen hoi hom hon hong hoà hoài hoàm hoàn hoàng hoành hoá hoác hoán hoáy hoãn hoè hoét hoăm hoăng hoạ hoạch hoại hoạn hoạnh hoạt hoả hoải hoảng hoảnh hoắc hoắm hoắt hoẳn hoẵng hoặc hoặc hoẹ hoẹt hoẻn html hu hua hum hun hung huy huynh huyên huyết huyền huyễn huyện huyệt huân huê huênh huý huých huýt huơ huấn huế huếch huề huệ huống huỳnh huỵch huỷ hy hà hài hàm hàn hàng hành hào hàu há hác hách hái hám hán háng hánh háo hát háu háy hâm hân hâu hây hãi hãm hãn hãng hãnh hão hãy hè hèm hèn hèo hé héc héo hét hê hên hênh hì hình hí hích híp hít hò hòa hòe hòi hòm hòn hòng hóa hóc hói hóm hóng hóp hót hô hôi hôm hôn hông hõm hù hùa hùm hùn hùng hú húc húi húng húp hút húy hăm hăng hđnd hĩm hĩnh hũ hũm hơ hơi hơn hư hưng hưu hương hươu hước hướm hướng hường hưởng hượm hạ hạc hạch hại hạm hạn hạng hạnh hạo hạp hạt hả hải hảm hảng hảo hấn hấng hấp hất hấu hấy hầm hầu hầy hẩm hẩng hẩu hẩy hẫng hẫu hậm hận hập hậu hắc hắn hắng hắt hằm hằn hằng hẳn hẵng hặc hẹ hẹm hẹn hẹp hẻm hẻo hếch hến hết hếu hề hềnh hể hển hểnh hệ hệch hệt hỉ hỉnh hịch họ họa học họe họng họp hỏa hỏi hỏm hỏn hỏng hố hốc hối hống hốt hồ hồi hồn hồng hổ hổi hổm hổn hổng hỗ hỗn hỗng hộ hộc hội hộn hộp hột hớ hớm hớn hớp hớt hờ hời hờn hở hởi hỡi hỡi hợi hợm hợp hợt hục hụi hụm hụp hụt hủ hủi hủn hủy hứa hức hứng hừ hừm hừng hử hửng hữ hững hữu hự hực hựu i im in inh internet intranet iu jpeg ka ke kem ken keng keo kha khai kham khan khang khanh khao khau khay khe khem khen kheo khi khin khinh khiu khiêm khiên khiêng khiêu khiếm khiến khiếp khiết khiếu khiền khiển khiễng kho khoa khoai khoan khoang khoanh khoe khoeo khom khoào khoá khoác khoái khoán khoáng khoát khoáy khoèo khoé khoét khoăm khoăn khoả khoải khoản khoảng khoảnh khoắm khoắn khoắng khoắt khoằm khoẻ khu khua khui khum khung khuy khuya khuynh khuyên khuyến khuyết khuyển khuân khuâng khuây khuê khuôn khuông khuơ khuất khuấy khuẩn khuếch khuỳnh khuỵu khuỷu khà khàn khàng khá khác khách khái khám khán kháng khánh kháo kháp khát kháu kháy khâm khân khâu khè khèn khèo khé khén khéo khép khét khê khênh khêu khì khìn khí khía khích khít khíu khò khòm khòng khó khóa khóc khóe khói khóm khô khôi khôn không khù khùng khú khúc khúm khăm khăn khăng khĩnh khơ khơi khư khươi khươm khươn khương khước khướt khướu khạc khạng khạo khả khải khảm khản khảng khảnh khảo khảy khấc khấm khấn khấp khất khấu khẩn khẩu khẩy khập khật khắc khắm khắng khắp khắt khằng khẳm khẳn khẳng khặc khẹc khẻ khẻo khẽ khế khề khều khểnh khệ khệnh khỉ khỉnh khịa khịt khọm khỏa khỏe khỏi khỏng khố khốc khối khốn khống khổ khổn khổng khớ khớp khờ khởi khụ khục khụt khủ khủng khứ khứa khứng khứu khừ khừng khử khựng ki kia kim kinh kiêm kiên kiêng kiêu kiếm kiến kiếp kiết kiếu kiềm kiền kiềng kiều kiểm kiểng kiểu kiễng kiệm kiện kiệt kiệu kè kèm kèn kèo ké kéc kém kén kéo kép két kê kênh kêu kì kìa kìm kình kí kích kín kính kíp kít ký kĩ kẹ kẹn kẹo kẹp kẹt kẻ kẻng kẻo kẽ kẽm kẽo kế kếch kếp kết kề kềm kền kềnh kều kể kệ kệch kệnh kỉ kỉnh kị kịch kịp kịt kỳ kỵ kỷ kỹ la lai lam lan lang lanh lao lau lay le lem len leng leo lhq li lia lim lin linh liu liêm liên liêng liêu liếc liếm liến liếng liếp liềm liền liều liểng liễm liễn liễu liệm liệng liệp liệt liệu lo loa loan loang loanh loay loe loen loi lom lon long loong loà loài loàn loàng loáng loát loãng loè loé loét loăng loạc loại loạn loạng loạt loảng loắt loằng loẹt lu lua lui lum lung luya luyến luyện luân luôm luôn luông luýnh luấn luẩn luận luận luật luốc luống luốt luồn luồng luỗng luộc luộm luỵ luỹ ly là lài làm làn làng lành lào làu lá lác lách lái lán láng lánh láo láp lát láu láy lâm lân lâng lâu lây lã lãi lãm lãn lãng lãnh lão lè lèm lèn lèo lé léc lém lén léng léo lép lét lê lên lênh lêu lì lìa lìm lình lìu lí lính líp lít líu lò lòa lòe lòi lòm lòn lòng ló lóc lóe lói lóm lóng lóp lót lô lôi lôm lông lõ lõi lõm lõng lù lùa lùi lùm lùn lùng lú lúa lúc lúi lúm lún lúng lúp lút lý lăm lăn lăng lĩnh lũ lũi lũm lũn lũng lũy lơ lơi lơn lư lưng lưu lươm lươn lương lưới lướng lướt lười lườm lườn lường lưỡi lưỡng lược lượm lượn lượng lượt lạ lạc lạch lại lạm lạn lạng lạnh lạo lạp lạt lạu lạy lả lải lảm lảng lảnh lảo lảu lảy lấc lấm lấn lấp lất lấy lầm lần lầu lầy lẩm lẩn lẩu lẩy lẫm lẫn lẫy lậm lận lập lật lậu lắc lắk lắm lắng lắp lắt lằm lằn lằng lẳm lẳn lẳng lẵng lặc lặm lặn lặng lặp lặt lẹ lẹm lẹn lẹo lẹp lẹt lẻ lẻm lẻn lẻng lẻo lẽ lẽn lẽo lếch lết lếu lề lềnh lều lể lểu lễ lễu lệ lệch lệnh lỉm lỉnh lị lịa lịch lịm lịnh lịu lọ lọc lọi lọm lọn lọng lọt lỏi lỏm lỏn lỏng lố lốc lối lốm lốn lốp lốt lồ lồi lồm lồn lồng lổ lổm lổn lổng lỗ lỗi lộ lộc lội lộm lộn lộng lộp lột lớ lới lớn lớp lớt lờ lời lờm lờn lở lởi lởm lởn lỡ lỡm lợ lợi lợm lợn lợp lợt lụ lụa lục lụi lụn lụng lụp lụt lụy lủ lủi lủm lủn lủng lứa lức lứt lừ lừa lừng lử lửa lửng lữ lữa lững lự lựa lực lựng lựu lỵ ma mai man mang manh mao mau may me mem men meo mi mia mim min minh miên miêu miến miếng miết miếu miền miều miễn miễu miện miệng miệt mo moay moi mom mon mong moóc mu mua mui mum mun mung muôi muôn muông muối muốn muống muốt muồi muỗi muỗm muỗng muội muộn mà mài màn màng mành mào màu mày má mác mách mái mán máng mánh máo mát máu máy mâm mân mâng mâu mây mã mãi mãn mãng mãnh mão mè mèm mèn mèng mèo mé mém mén méo mép mét mê mên mênh mì mìn mình mí mía mích mím míp mít míu mò mòi mòm mòn mòng mó móc mói móm món móng móp mót mô môi môm môn mông mõ mõm mù mùa mùi mùn mùng mú múa múc múi múm mún múp mút măm măn măng mĩ mĩm mũ mũi mũm mơ mơi mơn mưa mưu mươi mương mướn mướp mướt mười mường mượn mượt mạ mạc mạch mại mạn mạng mạnh mạo mạp mạt mạy mả mải mảng mảnh mảy mấn mấp mất mấu mấy mầm mần mầng mầu mẩm mẩn mẩy mẫm mẫn mẫu mận mập mật mậu mắc mắm mắn mắng mắt mằn mẳn mặc mặn mặt mặt mẹ mẹo mẹp mẹt mẻ mẻo mẽ mế mếch mến mếu mề mềm mền mễ mệ mệnh mệt mỉ mỉa mỉm mị mịch mịn mịnh mịt mọc mọi mọn mọng mọt mỏ mỏi mỏm mỏng mố mốc mối mống mốt mồ mồi mồm mồn mồng mổ mổng mỗ mỗi mộ mộc mộng một mớ mới mớm mớp mờ mời mờm mở mởn mỡ mợ mụ mục mụi mụn mụp mủ mủi mủm mủn mủng mứa mức mứt mứu mừng mửa mự mựa mực mỹ na nai nam nan nang nanh nao nau nay ne nem nen neo nga ngai ngam ngan ngang ngao ngau ngay nghe nghi nghinh nghiu nghiêm nghiên nghiêng nghiêu nghiến nghiền nghiễm nghiệm nghiện nghiệp nghiệt nghè nghèn nghèo nghé nghén nghét nghê nghênh nghêu nghì nghìn nghí nghít nghĩ nghĩa nghẹn nghẹo nghẹt nghẻ nghẻo nghẽn nghẽo nghếch nghề nghều nghển nghểnh nghễ nghễnh nghễu nghệ nghệch nghện nghỉ nghỉm nghỉn nghỉnh nghỉu nghị nghịch nghịt nghịu ngoa ngoan ngoang ngoao ngoay ngoe ngoi ngon ngong ngoài ngoàm ngoác ngoách ngoái ngoáo ngoáy ngoã ngoãn ngoèo ngoé ngoéo ngoét ngoại ngoạm ngoạn ngoải ngoảng ngoảnh ngoảy ngoắc ngoắt ngoằn ngoằng ngoẵng ngoặc ngoặt ngoẻn ngu nguy nguyên nguyền nguyễn nguyện nguyệt nguýt nguơn nguẩy nguồi nguồn nguội nguỵ nguỷu ngà ngài ngàm ngàn ngàng ngành ngào ngàu ngày ngác ngách ngái ngám ngán ngáng ngáo ngáp ngát ngáu ngáy ngâm ngân ngâu ngây ngã ngãi ngãng ngão ngò ngòi ngòm ngòn ngòng ngó ngóc ngóe ngói ngóm ngón ngóng ngóp ngót ngô ngôi ngôn ngông ngõ ngõa ngõi ngõng ngùi ngùng ngú ngúc ngúng ngút ngăm ngăn ngũ ngơ ngơi ngơm ngơn ngư ngưa ngưng ngưu ngươi ngước người ngường ngưởng ngưỡng ngược ngượng ngạc ngạch ngại ngạn ngạnh ngạo ngạt ngả ngải ngảnh ngấc ngấm ngấn ngấp ngất ngấu ngấy ngầm ngần ngầu ngầy ngẩm ngẩn ngẩng ngẫm ngẫn ngẫu ngậm ngận ngập ngật ngậu ngậy ngắc ngắm ngắn ngắt ngằn ngẳng ngẵng ngặt ngọ ngọc ngọn ngọng ngọt ngỏ ngỏm ngỏn ngỏng ngố ngốc ngốn ngốt ngồi ngồm ngồn ngồng ngổ ngổm ngổn ngỗ ngỗng ngộ ngộc ngộn ngột ngớ ngớn ngớp ngớt ngờ ngời ngờm ngỡ ngợ ngợi ngợm ngợp ngụ ngụa ngục ngụm ngụp ngụy ngủ ngủi ngủn ngứ ngứa ngứt ngừ ngừa ngừng ngửa ngửi ngửng ngữ ngữ ngự ngựa ngực nha nhai nham nhan nhang nhanh nhao nhau nhay nhe nhem nhen nheo nhi nhinh nhiu nhiên nhiêu nhiếc nhiếp nhiều nhiễm nhiễn nhiễu nhiệm nhiệt nho nhoai nhoang nhoay nhoe nhoen nhoi nhom nhong nhoà nhoài nhoàm nhoá nhoáng nhoáy nhoè nhoèn nhoé nhoét nhoạng nhoẹt nhoẻn nhu nhui nhung nhuyễn nhuôm nhuần nhuận nhuế nhuệ nhuốc nhuốm nhuộm nhuỵ nhà nhài nhàm nhàn nhàng nhành nhào nhàu nhày nhá nhác nhách nhái nhám nháng nhánh nháo nháp nhát nháy nhâm nhân nhâng nhâu nhây nhã nhãi nhãn nhãng nhão nhè nhèm nhèo nhé nhén nhéo nhép nhét nhênh nhì nhìn nhí nhía nhích nhím nhín nhíp nhít nhíu nhò nhòa nhòe nhòm nhó nhóa nhóc nhóe nhói nhóm nhón nhóng nhóp nhót nhô nhôi nhôm nhôn nhông nhõ nhõm nhõn nhù nhùi nhùn nhùng nhú nhúa nhúc nhúm nhún nhúng nhút nhăm nhăn nhăng nhĩ nhũ nhũn nhũng nhơ nhơi nhơm nhơn như nhưng nhương nhướng nhường nhưỡng nhược nhượng nhạc nhạn nhạnh nhạo nhạp nhạt nhạy nhả nhải nhảm nhản nhảnh nhảu nhảy nhấc nhấm nhấn nhấp nhất nhầm nhần nhầy nhẩm nhẫn nhẫy nhậm nhậm nhận nhập nhật nhậu nhậy nhắc nhắm nhắn nhắng nhắp nhắt nhằm nhằn nhằng nhẳn nhẳng nhẵn nhẵng nhặm nhặn nhặng nhặt nhẹ nhẹm nhẹn nhẹo nhẹp nhẹt nhẻ nhẻm nhẽ nhẽo nhện nhệu nhỉ nhỉnh nhị nhịn nhịp nhịt nhịu nhọ nhọc nhọn nhọt nhỏ nhỏm nhỏng nhố nhốc nhối nhốn nhốt nhồi nhồm nhồn nhồng nhổ nhổm nhổn nhộn nhộng nhột nhớ nhớm nhớn nhớp nhớt nhờ nhời nhờn nhở nhởn nhỡ nhợ nhợt nhụ nhụa nhục nhụi nhụng nhụt nhụy nhủ nhủi nhủn nhứ nhức nhứt nhừ nhử nhửng những nhự nhựa nhựt ni nia nin ninh niu niêm niên niêu niết niềm niền niềng niễng niệm niệt niệu no noa noi nom non nong noãn nua nung nuôi nuông nuốc nuối nuốm nuốt nuộc nuột nà nài nàn nàng nành nào này ná nác nách nái nám nán náng nánh náo nát náu náy nân nâng nâu nây nã não nãy nè nèo né ném nén néo nép nét nê nêm nên nêu nì nình ních nín nính níp nít níu nò nòi nòng nó nóc nói nón nóng nót nô nôi nôm nôn nông nõ nõn nùi nùn nùng núc núi núm núng núp nút năm năn năng nĩa nũng nơ nơi nơm nư nưa nưng nương nước nướng nườm nường nược nượp nạ nạc nại nạm nạn nạng nạnh nạo nạp nạt nạy nả nải nản nảy nấc nấm nấng nấp nấu nấy nầm nần nầy nẩy nẫng nẫu nậm nậng nập nậu nậy nắc nắm nắn nắng nắp nằm nằn nằng nẵng nặc nặn nặng nẹp nẹt nẻ nẻo nếm nến nếp nết nếu nề nền nể nệ nệm nện nỉ nịch nịnh nịt nịu nọ nọc nọn nọng nọt nỏ nỏi nố nốc nối nống nốt nồ nồi nồm nồng nổ nổi nỗ nỗi nỗng nộ nội nộm nộn nộp nột nớ nới nớp nớt nờ nờm nở nỡ nỡm nợ nợp nụ nục nủa nứa nức nứt nừng nửa nữ nữa nự nực nựng o oa oai oan oang oanh oe oi om ong oà oàm oàng oành oác oách oái oán oát oé oăm oăng oạch oại oạp oải oản oắt oằn oẳn oẳng oặt oẹ oẻ pa palăng pan pao pdf pe pha phai phan phang phanh phao phau phay phe phen pheo phi phim phin phinh phiu phiên phiêu phiếm phiến phiết phiếu phiền phiện phiệt pho phoi phom phong phu phui phun phung phuy phà phàm phàn phàng phành phào phá phác phách phái phán pháo pháp phát phân phây phè phèn phèng phèo phéng phép phét phê phên phì phìa phình phí phía phích phím phính phò phòi phòng phó phóc phóng phót phô phôi phôm phông phù phùn phùng phú phúc phún phúng phút phăm phăn phăng phĩnh phũ phơ phơi phơn phưng phương phước phướn phướng phường phưỡn phượng phượu phạch phạm phạn phạng phạt phả phải phản phảng phảy phấn phấp phất phầm phần phẩm phẩn phẩy phẫn phẫu phận phập phật phắc phắn phắp phắt phẳng phẹt phế phếch phết phề phềnh phều phễn phễu phệ phệnh phệt phỉ phỉnh phị phịa phịch phịt phịu phọng phọt phỏng phố phốc phối phốp phồ phồm phồn phồng phổ phổi phổng phỗng phộng phới phớt phờ phở phỡn phụ phục phụng phụt phủ phủi phứa phức phứt phừng phựa phựt pi pin ping png pom pu pác páp pê pía pô pông pơ qua quai quan quang quanh quao quau quay que quen queo quoàng quoạng quoắt quy quyên quyến quyết quyền quyển quyện quyệt quà quài quàn quàng quành quào quàu quày quá quác quách quái quán quáng quánh quáo quát quáu quân quây quãng què quèn quèo qué quén quéo quét quê quên quít quý quýnh quýt quăm quăn quăng quơ quạ quạc quạch quại quạng quạnh quạt quạu quạy quả quải quản quảng quảy quấc quấn quất quấy quần quầng quầy quẩn quẩng quẩy quẫn quẫy quận quật quậy quắc quắm quắn quắp quắt quằn quẳm quẳng quặc quặm quặn quặng quặp quặt quẹo quẹt quẻ quẽ quế quết quếu quềnh quều quệ quệch quện quệnh quệt quịt quốc quớ quờ quở quởn quỳ quỳnh quỳnh quỵ quỵt quỷ quỷnh quỹ ra rai ram ran rang ranh rao rau ray re ren reng reo ri ria rim rin rinh riu riêng riêu riết riếu riềm riềng riệt ro roa roi rom rong ru rua rum run rung ruốc ruối ruồi ruồng ruổi ruỗng ruộm ruộng ruột rà rài ràn ràng rành rào rày rá rác rách rái rám rán ráng ráo ráp rát ráy râm rân râu rây rã rãi rãnh rão rãy rè rèm rèn rèo ré rén réo rét rê rên rêu rì rìa rình rìu rí rích rít ríu rò ròi ròm ròng ró róc rói róm rón róng rót rô rôm rông rõ rõi rù rùa rùm rùn rùng rú rúc rúi rúm rún rúng rúp rút răm răn răng rĩ rũ rũa rơ rơi rơm rơn rư rưa rưng rươi rươm rương rước rưới rướm rướn rười rườm rườn rường rưởi rưỡi rượi rượn rượt rượu rạ rạc rạch rạn rạng rạo rạp rạt rạy rả rải rảnh rảo rảy rấm rấn rấp rất rầm rần rầu rầy rẩm rẩy rẫm rẫy rậm rận rập rật rắc rắm rắn rắp rắt rằm rằn rằng rặng rặt rẹo rẹt rẻ rẻng rẻo rẽ rế rếch rến rếp rết rề rền rều rể rểnh rễ rệ rệch rện rệp rệt rệu rỉ rỉa rỉnh rịa rịch rịn rịt rọ rọc rọi rọm rọt rỏ rỏm rỏn rốc rối rốn rống rốp rốt rồ rồi rồm rồng rổ rổi rổng rỗ rỗi rỗng rộ rộc rộm rộn rộng rộp rớ rớm rớt rờ rời rờm rờn rở rởm rởn rỡ rỡn rợ rợi rợm rợn rợp rợt rục rụi rụng rụt rủ rủa rủi rủn rủng rứa rức rứt rừng rửa rửng rữa rựa rực sa sai sam san sang sanh sao sau say se sen seo si sim sin sinh siu siêng siêu siết siểm siểng siễn so soa soi son song soong soà soài soái soán soát soóc soạn soạng soạt su sui sum sun sung suy suyển suyễn suê suôn suông suý suýt suất suối suốt suồng suỵt sà sài sàm sàn sàng sành sào sá sác sách sái sám sán sáng sánh sáo sáp sát sáu sâm sân sâu sây sã sãi sè sèo séc sém sét sê sên sênh sêu sì sình sính sít sò sòa sòi sòm sòng sóc sói sóm són sóng sót sô sôi sông sõi sõng sù sùi sùm sùng sú súc sún súng súp sút súy săm săn săng sĩ sũng sơ sơm sơn sư sưa sưng sưu sương sướng sướt sườn sường sưởi sượng sượt sạ sạch sạm sạn sạo sạp sạt sả sải sản sảng sảnh sảo sảy sấm sấn sấp sất sấu sấy sầm sần sầu sầy sẩm sẩn sẩy sẫm sậm sập sật sậu sậy sắc sắm sắn sắng sắp sắt sằng sẵn sặc sặm sặt sẹ sẹm sẹo sẻ sẻn sẽ sến sếp sếu sề sền sể sểnh sễ sệ sệt sỉ sỉa sỉnh sị sịa sịch sịt sọ sọc sọm sọt sỏ sỏi số sốc sống sốp sốt sồ sồi sồn sồng sổ sổi sổng sỗ sộ sộp sột sớ sới sớm sớn sớt sờ sờm sờn sở sởi sởn sỡ sợ sợi sụ sụa sục sụm sụn sụp sụt sủa sủi sủng sứ sứa sức sứt sừn sừng sử sửa sửng sửu sữa sững sự sực sựng sựt ta tai tam tan tang tanh tao tay tcvn te telex tem ten teng teo tha thai tham than thang thanh thao thau thay the then theo thi thia thin thinh thiu thiêm thiên thiêng thiêu thiếc thiến thiếp thiết thiếu thiềm thiền thiềng thiều thiểm thiển thiểu thiện thiệp thiệt thiệu tho thoa thoai thoang thoi thom thon thong thoà thoàn thoá thoái thoán thoáng thoát thoăn thoại thoạt thoả thoải thoảng thoắng thoắt thu thua thui thum thun thung thuyên thuyết thuyền thuê thuôn thuý thuần thuẫn thuận thuật thuế thuể thuốc thuốn thuồn thuồng thuổng thuỗn thuộc thuộm thuở thuỳ thuỵ thuỷ thà thài thàm thành thào thày thá thác thách thái thám thán tháng thánh tháo tháp tháu tháy thâm thân thâu thây thãi thè thèm thèn thèo thé thép thét thê thêm thênh thêu thì thìa thìn thình thìu thí thía thích thím thín thính thíp thít thò thòa thòi thòm thòng thó thóa thóc thói thóp thót thô thôi thôn thông thõng thù thùa thùi thùm thùng thùy thú thúc thúi thúng thút thúy thăm thăn thăng thũng thơ thơi thơm thơn thư thưa thưng thương thước thướt thườn thường thưởng thưỡi thưỡn thược thượng thượt thạc thạch thạnh thạo thạp thả thải thảm thản thảng thảnh thảo thảy thấm thấp thất thấu thấy thầm thần thầu thầy thẩm thẩn thẩu thẫm thẫn thậm thận thập thật thắc thắm thắn thắng thắp thắt thằn thằng thẳm thẳng thặng thẹn thẹo thẹp thẻ thẻo thẽ thế thếch thếp thết thề thềm thều thể thểu thệ thện thỉ thỉnh thỉu thị thịch thịnh thịt thịu thọ thọc thọt thỏ thỏa thỏi thỏm thố thốc thối thốn thống thốt thồ thồi thồm thồn thổ thổi thổn thộc thộn thộp thớ thớt thờ thời thờn thở thợ thợt thụ thục thụi thụng thụp thụt thụy thủ thủa thủi thủm thủng thủy thứ thức thừ thừa thừng thử thửa thững thự thực ti tia tim tin tinh tiu tivi tiêm tiên tiêng tiêu tiếc tiếm tiến tiếng tiếp tiết tiếu tiềm tiền tiều tiểu tiễn tiễu tiệc tiệm tiện tiệp tiệt to toa toan toang toanh toe toen toi tom ton tong toong tout toà toài toàn toàng toác toái toán toáng toát toáy toè toèn toé toét toòng toạ toạc toại toả toản toẹ toẹt toẻ toẽ tp tra trai tram tran trang tranh trao trau tre treo tri trinh triêng triêu triến triết triền triềng triều triển triện triệng triệt triệu tro troi tron trong tru trui trun trung truy truyền truyện truân truông truất truật truồng truột truỵ trà trài tràm tràn tràng trành trào tràu trày trá trác trách trái trám trán tráng tránh tráo tráp trát trâm trân trâng trâu trây trã trãi trè trèm trèn trèo trém tréo trét trê trên trêu trì trình trìu trí trích trít trò tròi tròm tròn tròng tróc trói tróm tróng trót trô trôi trôm trôn trông trõm trõn trù trùi trùm trùn trùng trú trúc trúm trúng trút trăm trăn trăng trĩ trĩnh trĩu trũi trũng trơ trơi trơn trưa trưng trương trước trướng trườn trường trưởng trưỡng trượng trượt trạc trạch trại trạm trạng trạo trạy trả trải trảm trảng trảo trảu trảy trấn trấp trấu trầm trần trầu trầy trẩn trẩu trẩy trẫm trậm trận trập trật trắc trắm trắng trắt trằm trằn trặc trặn trẹ trẹo trẹt trẻ trẻo trẽ trẽn trếch trết trề trễ trệ trệch trệt trệu trỉa trị trịa trịch trịnh trịt trọ trọc trọi trọn trọng trọt trỏ trỏi trỏng trố trốc trối trốn trống trồ trồi trồng trổ trổi trổng trỗ trộ trộc trội trộm trộn trớ trớn trớp trớt trờ trời trờn trở trợ trợn trợt trụ trụa trục trụi trụm trụn trụng trụp trụt trụy trủ trứ trứng trừ trừa trừng trửng trữ trự trực tu tua tui tum tun tung tuy tuyn tuyên tuyến tuyết tuyền tuyển tuyệt tuân tuôn tuông tuý tuấn tuất tuần tuế tuếch tuệ tuệch tuốt tuồn tuồng tuổi tuộc tuột tuỳ tuỵ tuỷ tv tw ty tà tài tàn tàng tành tào tàu tày tá tác tách tái tám tán táng tánh táo táp tát táu táy tâm tân tâng tâu tây tã tãi tè tèm tèn tèo té téc tém tép tét tê têm tên tênh têt têu tì tìm tình tìu tí tía tích tím tín tính típ tít tíu tò tòa tòe tòi tòm tòn tòng tó tóc tóe tói tóm tóp tót tô tôi tôm tôn tông tõe tõm tù tùm tùng tùy tú túc túi túm túng túp tút túy tăm tăn tăng tĩ tĩnh tĩu tũm tơ tơi tư tưa tưng tươi tươm tương tước tưới tướn tướng tướp tướt tườm tường tườu tưởi tưởng tược tượng tượp tượt tạ tạc tạch tại tạm tạng tạnh tạo tạp tạt tả tải tản tảng tảo tấc tấm tấn tấp tất tấu tấy tầm tần tầng tầy tẩm tẩn tẩu tẩu tẩy tận tập tật tậu tắc tắm tắn tắp tắt tằm tằn tằng tẳn tặc tặn tặng tẹo tẹp tẹt tẻ tẻm tẻo tẽ tẽn tế tếch tết tếu tề tềnh tể tểnh tễ tễnh tệ tệp tỉ tỉa tỉm tỉnh tị tịch tịnh tịt tịu tọa tọc tọe tọng tọp tọt tỏ tỏa tỏe tỏi tỏm tỏng tố tốc tối tốn tống tốp tốt tồ tồi tồn tồng tổ tổn tổng tộ tộc tội tột tớ tới tớn tớp tớt tờ tời tởm tợ tợn tợp tụ tục tụi tụm tụng tụt tụy tủ tủa tủi tủm tủn tủy tứ tứa tức từ từng tử tửa tửng tửu tự tựa tựu tỵ tỷ u ubnd um un ung unicode url uy uyên uyển uôm uý uất uẩn uẩy uế uể uốn uống uổng uột uở uỳnh uỵch uỷ v va vai van vang vanh vao vay ve ven veo vi vinh viqr viscii viêm viên viếng viết viền viển viễn việc viện việt vn vni vo voan voi von vong vu vua vui vun vung vuông vuốt vuột và vài vàm vàn vàng vành vào vày vá vác vách vái ván váng vánh váo váp vát váy vâm vân vâng vây vã vãi vãn vãng vãnh vè vèo vé véc vén véo vét vê vên vênh vêu vì ví vía vích vít víu vò vòi vòm vòn vòng vó vóc vói vón vóng vót vô vôi vôn vông võ võng vù vùa vùi vùn vùng vú vúc vút văn văng vĩ vĩnh vũ vũm vũng vơ vơi vưng vưu vươn vương vướng vườn vưởng vược vượn vượng vượt vạ vạc vạch vại vạm vạn vạng vạnh vạp vạt vạy vả vải vảng vảy vấn vấp vất vấu vấy vần vầng vầu vầy vẩn vẩu vẩy vẫn vẫy vậm vận vập vật vậy vắc vắn vắng vắt vằm vằn vằng vẳng vặc vặn vặt vẹm vẹn vẹo vẹt vẻ vẻn vẻo vẽ vế vếch vết vếu về vền vều vểnh vệ vện vệt vỉ vỉa vị vịm vịn vịnh vịt vọ vọc vọi vọng vọp vọt vỏ vỏn vỏng vố vốc vối vốn vống vồ vồi vồn vồng vổ vổng vỗ vội vớ với vớt vờ vời vờn vở vởn vỡ vợ vợi vợt vụ vục vụn vụng vụt vức vứt vừa vừng vửng vữa vững vựa vực vực vựng web xa xam xan xang xanh xao xay xe xem xen xeo xi xia xim xin xinh xit xiêm xiên xiêu xiếc xiết xiềng xiểm xiển xiểng xo xoa xoan xoang xoay xoe xoen xoi xom xon xong xoong xoà xoài xoàm xoàn xoàng xoành xoá xoác xoát xoáy xoã xoè xoèn xoét xoăn xoạc xoạch xoạng xoả xoải xoảng xoắn xoẹ xoẹt xu xua xui xum xung xuy xuya xuynh xuyên xuyến xuyết xuân xuây xuê xuôi xuý xuýt xuất xuẩn xuề xuềnh xuể xuệch xuống xuồng xuổng xuỳ xuỵt xà xài xàm xàng xành xào xàu xá xác xách xái xám xán xáo xáp xát xáy xâm xâu xây xã xè xèn xèng xèo xé xéc xén xéo xép xét xê xên xênh xêu xì xình xìu xí xía xích xính xít xíu xòa xòe xòm xòng xó xóa xóc xói xóm xón xóp xót xô xôi xôm xôn xông xõa xõm xõng xù xùi xùm xùng xùy xú xúc xúi xúm xúng xúp xút xúy xăm xăn xăng xĩnh xũ xơ xơi xơm xơn xưa xưng xương xước xướng xười xưởng xược xạ xạc xạch xạo xạp xạu xả xảm xảnh xảo xảu xảy xấc xấp xấu xầm xẩm xẩn xẩu xẩy xập xắc xắm xắn xắp xằng xẵng xẹc xẹo xẹp xẹt xẻ xẻn xẻng xẻo xẽo xế xếch xếp xềm xềnh xều xể xệ xệch xệp xệu xỉ xỉa xỉn xỉnh xỉu xị xịch xịn xịt xịu xọ xọc xọe xọp xỏ xỏa xỏng xố xốc xối xốn xống xốp xốt xồ xồm xồn xồng xổ xổi xổm xổng xộc xộn xộp xớ xới xớp xớt xờ xờm xở xởi xởn xỡ xợp xợt xụ xục xụi xụp xủng xứ xức xứng xừ xử xử xửa xửng xực y yên yêng yêu yếm yến yết yếu yểm yểng yểu à ào á ác ách ái ám án áng ánh áo áp át áy âm ân âu ã è èo é éc ém én éo ép ét ê êm êu ì ìn ình í ích ín ít ò òa òi òm òng ó óc óe ói óng óp ót ô ôi ôm ôn ông ù ùa ùm ùn ùng ú úa úi úm úng úp út úy ý ăm ăn ăng đa đai đam đan đang đanh đao đau đay đe đem đen đeo đi đin đinh điên điêu điếc điếm điếng điếu điền điều điểm điển điểu điệm điện điệp điệu đo đoan đoi đom đon đong đoài đoàn đoàng đoành đoá đoái đoán đoãng đoạ đoạn đoạt đoản đoảng đu đua đui đum đun đung đuôi đuốc đuối đuổi đuỗn đuột đà đài đàm đàn đàng đành đào đày đá đác đách đái đám đán đáng đánh đáo đáp đát đáy đâm đâu đây đã đãi đãng đãy đè đèm đèn đèo đéc đéo đét đê đêm đên đênh đêu đì đìa đình đìu đía đích đính đít đò đòi đòm đòn đòng đó đóa đóc đói đóm đón đóng đót đô đôi đôm đôn đông đõ đù đùa đùi đùm đùn đùng đú đúc đúm đún đúng đúp đút đăm đăng đĩ đĩa đĩnh đũa đũng đơ đơm đơn đưa đưng đương đước đười đườn đường đưỡn được đượm đạc đạch đại đạm đạn đạo đạp đạt đả đảm đản đảng đảo đảy đấm đấng đất đấu đấy đầm đần đầu đầy đẩu đẩy đẫm đẫn đẫy đậm đận đập đật đậu đậy đắc đắk đắm đắn đắng đắp đắt đằm đằn đằng đẳng đẵm đẵn đẵng đặc đặn đặng đặt đẹn đẹp đẹt đẻ đẽ đẽo đế đếch đếm đến đề đềm đền đềnh đều để đểnh đểu đễ đễnh đệ đệm đệp đỉa đỉnh địa địch định địt địu đọ đọa đọc đọi đọn đọng đọp đọt đỏ đỏi đỏm đố đốc đối đốm đốn đống đốp đốt đồ đồi đồm đồn đồng đổ đổi đổng đỗ đỗi độ độc đội độn động độp đột đớ đới đớn đớp đớt đờ đời đờm đờn đởm đởn đỡ đợ đợi đợp đợt đụ đục đụn đụng đụp đụt đủ đủi đủng đứ đứa đức đứng đứt đừ đừa đừng đử đực đựng ĩ ĩnh ơ ơi ơn ư ưa ưng ưu ươi ươm ươn ương ước ướm ướp ướt ườn ưỡn ạ ạch ạnh ạo ạt ả ải ảm ảng ảnh ảo ấm ấn ấp ất ấu ấy ầm ầy ẩm ẩn ẩu ẩy ậc ậm ập ắc ắng ắp ắt ằng ẳng ẵm ặc ặp ẹ ẹo ẹp ẹt ẻn ẻo ẽo ế ếch ếm ề ềnh ễnh ệ ệch ện ệnh ỉ ỉa ỉm ỉn ỉu ị ịch ịt ọ ọc ọe ọi ọp ọt ỏe ỏi ỏm ỏn ỏng ố ốc ối ốm ốm ống ốp ốt ồ ồm ồn ồng ổ ổi ổn ổng ộ ộc ộn ộp ớ ới ớm ớn ớt ờ ờn ở ỡm ợ ợt ụ ụa ục ụp ụt ủ ủa ủi ủn ủng ủy ứ ứa ức ứng ừ ừng ửng ựa ực ỷ";
  var ALL_VIETNAMESE_SINGLE_VOWELS = [
    "a",
    "á",
    "à",
    "ả",
    "ã",
    "ạ",
    "ă",
    "ắ",
    "ằ",
    "ẳ",
    "ẵ",
    "ặ",
    "â",
    "ấ",
    "ầ",
    "ẩ",
    "ẫ",
    "ậ",
    "e",
    "é",
    "è",
    "ẻ",
    "ẽ",
    "ẹ",
    "ê",
    "ế",
    "ề",
    "ể",
    "ễ",
    "ệ",
    "i",
    "í",
    "ì",
    "ỉ",
    "ĩ",
    "ị",
    "o",
    "ó",
    "ò",
    "ỏ",
    "õ",
    "ọ",
    "ô",
    "ố",
    "ồ",
    "ổ",
    "ỗ",
    "ộ",
    "ơ",
    "ớ",
    "ờ",
    "ở",
    "ỡ",
    "ợ",
    "u",
    "ú",
    "ù",
    "ủ",
    "ũ",
    "ụ",
    "ư",
    "ứ",
    "ừ",
    "ử",
    "ữ",
    "ự",
    "y",
    "ý",
    "ỳ",
    "ỷ",
    "ỹ",
    "ỵ",
    "đ"
  ];
  var RARE_AND_PLACE_SYLLABLES = [
    // Tây Nguyên & Ethnic Toponyms — âm tiết không có trong từ điển chuẩn (bao gồm cả dạng thanh ngang, có dấu và dạng trung gian khi gõ phím ở cuối từ)
    "đắk",
    "đăk",
    "đrak",
    "đrák",
    "đrắk",
    "đrăk",
    "drắk",
    "drăk",
    "drak",
    "drák",
    "lắk",
    "lăk",
    "lak",
    "lák",
    "nông",
    "krông",
    "pắk",
    "păk",
    "pak",
    "pák",
    "búk",
    "buk",
    "păh",
    "pah",
    "páh",
    "prông",
    "ana",
    "ea",
    "h'leo",
    "hleo",
    "kar",
    "súp",
    "m'đrắk",
    "m'đrăk",
    "m'đrak",
    "m'đrák",
    "mdrắk",
    "mdrăk",
    "mdrak",
    "mdrák",
    "mil",
    "glong",
    "đoa",
    "grai",
    "h'drai",
    "hdrai",
    "m'gar",
    "mgar",
    "kuin",
    "r'lấp",
    "r’lấp",
    "rlấp",
    "pleiku",
    "chư",
    "cư",
    "sê",
    "bông",
    "năng",
    "đức",
    "cơ",
    // Rare, Classical & Dialect Vietnamese Syllables
    "pa",
    "pá",
    "pà",
    "pả",
    "pã",
    "pạ",
    "nguầy",
    "nguậy",
    "dzìa",
    "dzí",
    "dzị",
    "dzô",
    "dzậy",
    "dzách",
    "dách",
    "zị",
    "zi",
    "zia",
    "hén",
    "nghen",
    "hổng",
    "hạp",
    "quớt",
    "nư",
    "quỉ",
    "lét",
    "mụi",
    "bẹo",
    "bậu",
    "tỏn",
    "hum",
    "chác",
    "cháo",
    "khồng",
    "khỗng",
    "khộng",
    "ngánh",
    "ngãnh",
    "quỡn",
    "quỡ",
    "huỡ",
    "uồn",
    "toãn",
    "toạn",
    "chớn",
    "chởn",
    "chỡn",
    "chón",
    "chòn",
    "bớn",
    "bởn",
    "mớn",
    "mờn",
    "mỡn",
    "mợn",
    "rớn",
    "xớn",
    "xờn",
    "xợn",
    "tơn",
    "tờn",
    "tởn",
    "tỡn",
    "thớn",
    "thởn",
    "thỡn",
    "thợn",
    "đỡn",
    "đợn",
    "hởn",
    "hỡn",
    "hợn",
    "cởn",
    "lỡn",
    "goong",
    "goòng",
    "goóng",
    "xoong",
    "xoòng",
    "xoóng",
    "xoọng",
    "boong",
    "boòng",
    "boóng",
    "moong",
    "toong"
  ];
  var SOUTHERN_DIALECT_SYLLABLES = [
    // Biến âm dz / z
    "dzà",
    "dzạ",
    "dzái",
    "dzài",
    "dzán",
    "dzàng",
    "dzành",
    "dzào",
    "dzạt",
    "dzày",
    "dzắc",
    "dzăm",
    "dzằn",
    "dzăng",
    "dzắt",
    "dzầm",
    "dzần",
    "dzập",
    "dzật",
    "dzậy",
    "dzẻ",
    "dzẽ",
    "dzẹp",
    "dzề",
    "dzễ",
    "dzế",
    "dzì",
    "dzìa",
    "dzí",
    "dzịn",
    "dzít",
    "dzị",
    "dzịu",
    "dzò",
    "dzòm",
    "dzòn",
    "dzòng",
    "dzọt",
    "dzô",
    "dzội",
    "dzột",
    "dzớ",
    "dzới",
    "dzợt",
    "dzù",
    "dzụ",
    "dzục",
    "dzui",
    "dzùm",
    "dzùng",
    "dzụt",
    "dzừ",
    "dzừa",
    "dzừng",
    "dzứt",
    "dzự",
    "dzựng",
    "zì",
    "zị",
    "zậy",
    "zô",
    // Chánh tả miền Nam & biến âm vần (chánh, sanh, nhứt, thiệt, gởi, quỉ, chưn...)
    "chánh",
    "sanh",
    "tánh",
    "thạnh",
    "huỳnh",
    "kiểng",
    "ngươn",
    "nhứt",
    "nhựt",
    "thiệt",
    "chưn",
    "cưn",
    "hưn",
    "mưn",
    "tưn",
    "xưn",
    "qui",
    "quí",
    "quì",
    "quĩ",
    "quị",
    "quít",
    "quịt",
    "gởi",
    "ngởi",
    "chởi",
    "dởi",
    "mởi",
    "nởi",
    "tởi",
    "xởi",
    "bửng",
    "bựng",
    // Đại từ, trợ từ, thán từ & từ đặc trưng Nam Bộ
    "ảnh",
    "bả",
    "cổ",
    "ổng",
    "trỏng",
    "bển",
    "ngoải",
    "trển",
    "nghen",
    "hen",
    "hông",
    "hổng",
    "mèn",
    "đéc",
    "nư",
    "tỏn",
    "hum",
    "quởn",
    "quỡn",
    "quớt",
    "chét",
    "nhỏng",
    "rịch",
    "xàm",
    "xạo",
    "chằn",
    "lữa",
    "thúi",
    "giựt",
    "ngươi",
    "sẩy",
    "xẩy",
    "mánh",
    "mụi",
    "tém",
    "lết",
    "cù",
    "lét",
    "trớt",
    "dách",
    "dzách"
  ];
  var MODERN_SLANG_AND_COLLOQUIAL_SYLLABLES = [
    "xò",
    "xõ",
    "xộp",
    "xịn",
    "phèn",
    "phẻn",
    "quẩy",
    "quạo",
    "ngáo",
    "trẩu",
    "nhoi",
    "bựa",
    "dỏm",
    "đỏm",
    "chảnh",
    "choảng",
    "mót",
    "quắc",
    "ghẹo"
  ];
  function canon(str) {
    if (!str) return "";
    return str.normalize("NFC").replace(/[\u2018\u2019\u201B\u02BC\u02B9]/g, "'").toLowerCase();
  }
  var _vietnameseWordSet = null;
  function getVietnameseWordSet() {
    if (!_vietnameseWordSet) {
      _vietnameseWordSet = /* @__PURE__ */ new Set();
      const rawTokens = VIETNAMESE_WORDS_STRING.split(" ");
      for (let i = 0; i < rawTokens.length; i++) {
        const c = canon(rawTokens[i]);
        if (c) _vietnameseWordSet.add(c);
      }
      ALL_VIETNAMESE_SINGLE_VOWELS.forEach((v) => _vietnameseWordSet.add(canon(v)));
      RARE_AND_PLACE_SYLLABLES.forEach((s) => _vietnameseWordSet.add(canon(s)));
      SOUTHERN_DIALECT_SYLLABLES.forEach((s) => _vietnameseWordSet.add(canon(s)));
      MODERN_SLANG_AND_COLLOQUIAL_SYLLABLES.forEach((s) => _vietnameseWordSet.add(canon(s)));
    }
    return _vietnameseWordSet;
  }

  // src/engine/syllable-parser.js
  var TONE_MARK = {
    NONE: 0,
    // Thanh ngang
    ACUTE: 1,
    // Sắc (s / 1)
    GRAVE: 2,
    // Huyền (f / 2)
    HOOK_ABOVE: 3,
    // Hỏi (r / 3)
    TILDE: 4,
    // Ngã (x / 4)
    DOT_BELOW: 5
    // Nặng (j / 5)
  };
  var VOWEL_DECOMPOSE_MAP = {
    // a
    "a": { base: "a", tone: 0 },
    "á": { base: "a", tone: 1 },
    "à": { base: "a", tone: 2 },
    "ả": { base: "a", tone: 3 },
    "ã": { base: "a", tone: 4 },
    "ạ": { base: "a", tone: 5 },
    "A": { base: "A", tone: 0 },
    "Á": { base: "A", tone: 1 },
    "À": { base: "A", tone: 2 },
    "Ả": { base: "A", tone: 3 },
    "Ã": { base: "A", tone: 4 },
    "Ạ": { base: "A", tone: 5 },
    // ă
    "ă": { base: "ă", tone: 0 },
    "ắ": { base: "ă", tone: 1 },
    "ằ": { base: "ă", tone: 2 },
    "ẳ": { base: "ă", tone: 3 },
    "ẵ": { base: "ă", tone: 4 },
    "ặ": { base: "ă", tone: 5 },
    "Ă": { base: "Ă", tone: 0 },
    "Ắ": { base: "Ă", tone: 1 },
    "Ằ": { base: "Ă", tone: 2 },
    "Ẳ": { base: "Ă", tone: 3 },
    "Ẵ": { base: "Ă", tone: 4 },
    "Ặ": { base: "Ă", tone: 5 },
    // â
    "â": { base: "â", tone: 0 },
    "ấ": { base: "â", tone: 1 },
    "ầ": { base: "â", tone: 2 },
    "ẩ": { base: "â", tone: 3 },
    "ẫ": { base: "â", tone: 4 },
    "ậ": { base: "â", tone: 5 },
    "Â": { base: "Â", tone: 0 },
    "Ấ": { base: "Â", tone: 1 },
    "Ầ": { base: "Â", tone: 2 },
    "Ẩ": { base: "Â", tone: 3 },
    "Ẫ": { base: "Â", tone: 4 },
    "Ậ": { base: "Â", tone: 5 },
    // e
    "e": { base: "e", tone: 0 },
    "é": { base: "e", tone: 1 },
    "è": { base: "e", tone: 2 },
    "ẻ": { base: "e", tone: 3 },
    "ẽ": { base: "e", tone: 4 },
    "ẹ": { base: "e", tone: 5 },
    "E": { base: "E", tone: 0 },
    "É": { base: "E", tone: 1 },
    "È": { base: "E", tone: 2 },
    "Ẻ": { base: "E", tone: 3 },
    "Ẽ": { base: "E", tone: 4 },
    "Ẹ": { base: "E", tone: 5 },
    // ê
    "ê": { base: "ê", tone: 0 },
    "ế": { base: "ê", tone: 1 },
    "ề": { base: "ê", tone: 2 },
    "ể": { base: "ê", tone: 3 },
    "ễ": { base: "ê", tone: 4 },
    "ệ": { base: "ê", tone: 5 },
    "Ê": { base: "Ê", tone: 0 },
    "Ế": { base: "Ê", tone: 1 },
    "Ề": { base: "Ê", tone: 2 },
    "Ể": { base: "Ê", tone: 3 },
    "Ễ": { base: "Ê", tone: 4 },
    "Ệ": { base: "Ê", tone: 5 },
    // i
    "i": { base: "i", tone: 0 },
    "í": { base: "i", tone: 1 },
    "ì": { base: "i", tone: 2 },
    "ỉ": { base: "i", tone: 3 },
    "ĩ": { base: "i", tone: 4 },
    "ị": { base: "i", tone: 5 },
    "I": { base: "I", tone: 0 },
    "Í": { base: "I", tone: 1 },
    "Ì": { base: "I", tone: 2 },
    "Ỉ": { base: "I", tone: 3 },
    "Ĩ": { base: "I", tone: 4 },
    "Ị": { base: "I", tone: 5 },
    // o
    "o": { base: "o", tone: 0 },
    "ó": { base: "o", tone: 1 },
    "ò": { base: "o", tone: 2 },
    "ỏ": { base: "o", tone: 3 },
    "õ": { base: "o", tone: 4 },
    "ọ": { base: "o", tone: 5 },
    "O": { base: "O", tone: 0 },
    "Ó": { base: "O", tone: 1 },
    "Ò": { base: "O", tone: 2 },
    "Ỏ": { base: "O", tone: 3 },
    "Õ": { base: "O", tone: 4 },
    "Ọ": { base: "O", tone: 5 },
    // ô
    "ô": { base: "ô", tone: 0 },
    "ố": { base: "ô", tone: 1 },
    "ồ": { base: "ô", tone: 2 },
    "ổ": { base: "ô", tone: 3 },
    "ỗ": { base: "ô", tone: 4 },
    "ộ": { base: "ô", tone: 5 },
    "Ô": { base: "Ô", tone: 0 },
    "Ố": { base: "Ô", tone: 1 },
    "Ồ": { base: "Ô", tone: 2 },
    "Ổ": { base: "Ô", tone: 3 },
    "Ỗ": { base: "Ô", tone: 4 },
    "Ộ": { base: "Ô", tone: 5 },
    // ơ
    "ơ": { base: "ơ", tone: 0 },
    "ớ": { base: "ơ", tone: 1 },
    "ờ": { base: "ơ", tone: 2 },
    "ở": { base: "ơ", tone: 3 },
    "ỡ": { base: "ơ", tone: 4 },
    "ợ": { base: "ơ", tone: 5 },
    "Ơ": { base: "Ơ", tone: 0 },
    "Ớ": { base: "Ơ", tone: 1 },
    "Ờ": { base: "Ơ", tone: 2 },
    "Ở": { base: "Ơ", tone: 3 },
    "Ỡ": { base: "Ơ", tone: 4 },
    "Ợ": { base: "Ơ", tone: 5 },
    // u
    "u": { base: "u", tone: 0 },
    "ú": { base: "u", tone: 1 },
    "ù": { base: "u", tone: 2 },
    "ủ": { base: "u", tone: 3 },
    "ũ": { base: "u", tone: 4 },
    "ụ": { base: "u", tone: 5 },
    "U": { base: "U", tone: 0 },
    "Ú": { base: "U", tone: 1 },
    "Ù": { base: "U", tone: 2 },
    "Ủ": { base: "U", tone: 3 },
    "Ũ": { base: "U", tone: 4 },
    "Ụ": { base: "U", tone: 5 },
    // ư
    "ư": { base: "ư", tone: 0 },
    "ứ": { base: "ư", tone: 1 },
    "ừ": { base: "ư", tone: 2 },
    "ử": { base: "ư", tone: 3 },
    "ữ": { base: "ư", tone: 4 },
    "ự": { base: "ư", tone: 5 },
    "Ư": { base: "Ư", tone: 0 },
    "Ứ": { base: "Ư", tone: 1 },
    "Ừ": { base: "Ư", tone: 2 },
    "Ử": { base: "Ư", tone: 3 },
    "Ữ": { base: "Ư", tone: 4 },
    "Ự": { base: "Ư", tone: 5 },
    // y
    "y": { base: "y", tone: 0 },
    "ý": { base: "y", tone: 1 },
    "ỳ": { base: "y", tone: 2 },
    "ỷ": { base: "y", tone: 3 },
    "ỹ": { base: "y", tone: 4 },
    "ỵ": { base: "y", tone: 5 },
    "Y": { base: "Y", tone: 0 },
    "Ý": { base: "Y", tone: 1 },
    "Ỳ": { base: "Y", tone: 2 },
    "Ỷ": { base: "Y", tone: 3 },
    "Ỹ": { base: "Y", tone: 4 },
    "Ỵ": { base: "Y", tone: 5 }
  };
  var VOWEL_COMPOSE_TABLE = {
    "a": ["a", "á", "à", "ả", "ã", "ạ"],
    "A": ["A", "Á", "À", "Ả", "Ã", "Ạ"],
    "ă": ["ă", "ắ", "ằ", "ẳ", "ẵ", "ặ"],
    "Ă": ["Ă", "Ắ", "Ằ", "Ẳ", "Ẵ", "Ặ"],
    "â": ["â", "ấ", "ầ", "ẩ", "ẫ", "ậ"],
    "Â": ["Â", "Ấ", "Ầ", "Ẩ", "Ẫ", "Ậ"],
    "e": ["e", "é", "è", "ẻ", "ẽ", "ẹ"],
    "E": ["E", "É", "È", "Ẻ", "Ẽ", "Ẹ"],
    "ê": ["ê", "ế", "ề", "ể", "ễ", "ệ"],
    "Ê": ["Ê", "Ế", "Ề", "Ể", "Ễ", "Ệ"],
    "i": ["i", "í", "ì", "ỉ", "ĩ", "ị"],
    "I": ["I", "Í", "Ì", "Ỉ", "Ĩ", "Ị"],
    "o": ["o", "ó", "ò", "ỏ", "õ", "ọ"],
    "O": ["O", "Ó", "Ò", "Ỏ", "Õ", "Ọ"],
    "ô": ["ô", "ố", "ồ", "ổ", "ỗ", "ộ"],
    "Ô": ["Ô", "Ố", "Ồ", "Ổ", "Ỗ", "Ộ"],
    "ơ": ["ơ", "ớ", "ờ", "ở", "ỡ", "ợ"],
    "Ơ": ["Ơ", "Ớ", "Ờ", "Ở", "Ỡ", "Ợ"],
    "u": ["u", "ú", "ù", "ủ", "ũ", "ụ"],
    "U": ["U", "Ú", "Ù", "Ủ", "Ũ", "Ụ"],
    "ư": ["ư", "ứ", "ừ", "ử", "ữ", "ự"],
    "Ư": ["Ư", "Ứ", "Ừ", "Ử", "Ữ", "Ự"],
    "y": ["y", "ý", "ỳ", "ỷ", "ỹ", "ỵ"],
    "Y": ["Y", "Ý", "Ỳ", "Ỷ", "Ỹ", "Ỵ"]
  };
  var VALID_ONSETS = [
    // 3-char onsets
    "ngh",
    // 2-char onsets (traditional + ethnic / Central Highlands)
    "ch",
    "gh",
    "gi",
    "kh",
    "nh",
    "ng",
    "ph",
    "th",
    "tr",
    "qu",
    "kr",
    "pr",
    "dr",
    "đr",
    "br",
    "kl",
    "pl",
    "bl",
    "dz",
    // 1-char onsets (traditional + colloquial/slang 'z')
    "b",
    "c",
    "d",
    "đ",
    "g",
    "h",
    "k",
    "l",
    "m",
    "n",
    "p",
    "r",
    "s",
    "t",
    "v",
    "x",
    "z"
  ];
  var ParsedSyllable = class _ParsedSyllable {
    constructor(opts = {}) {
      this.onset = opts.onset || "";
      this.glide = opts.glide || "";
      this.nucleus = opts.nucleus || "";
      this.coda = opts.coda || "";
      this.tone = opts.tone || TONE_MARK.NONE;
      this.hasApostrophe = opts.hasApostrophe || false;
      this.apostrophePrefix = opts.apostrophePrefix || "";
    }
    /**
     * Reconstruct final syllable string according to toneStyle
     * @param {string} toneStyle TONE_STYLE.CLASSIC ('classic') or TONE_STYLE.MODERN ('modern')
     * @returns {string} Reconstructed Vietnamese syllable
     */
    reconstruct(toneStyle = TONE_STYLE.CLASSIC) {
      if (!this.nucleus) {
        return (this.apostrophePrefix || "") + this.onset + this.glide + this.coda;
      }
      const n = this.nucleus;
      const nLen = n.length;
      const hasCoda = this.coda.length > 0;
      const hasGlide = this.glide.length > 0;
      let targetIdx = 0;
      const isQu = this.onset.toLowerCase() === "q" && this.glide.toLowerCase() === "u";
      if (hasGlide && !hasCoda && nLen === 1 && !isQu) {
        if (toneStyle === TONE_STYLE.CLASSIC) {
          const glideChar = this.glide;
          const row = VOWEL_COMPOSE_TABLE[glideChar];
          const accentedGlide = this.tone > 0 && row ? row[this.tone] : glideChar;
          return (this.apostrophePrefix || "") + this.onset + accentedGlide + this.nucleus + this.coda;
        } else {
          targetIdx = 0;
        }
      } else if (nLen === 1) {
        targetIdx = 0;
      } else if (nLen === 2) {
        const lowerN = n.toLowerCase();
        if (lowerN === "ươ" || lowerN === "iê" || lowerN === "uô" || lowerN === "yê" || lowerN === "oo") {
          targetIdx = 1;
        } else if (lowerN === "ưa" || lowerN === "ia" || lowerN === "ua") {
          targetIdx = hasCoda ? 1 : 0;
        } else if (["ai", "ao", "au", "ay", "âu", "ây", "eo", "êu", "oi", "ôi", "ơi", "ui", "yu"].includes(lowerN)) {
          targetIdx = 0;
        } else {
          if (hasCoda) {
            targetIdx = 1;
          } else {
            targetIdx = toneStyle === TONE_STYLE.CLASSIC ? 0 : 1;
          }
        }
      } else if (nLen >= 3) {
        targetIdx = 1;
      }
      let reconstructedNucleus = "";
      for (let i = 0; i < n.length; i++) {
        const ch = n[i];
        if (i === targetIdx && this.tone > 0) {
          const row = VOWEL_COMPOSE_TABLE[ch];
          reconstructedNucleus += row ? row[this.tone] : ch;
        } else {
          reconstructedNucleus += ch;
        }
      }
      return (this.apostrophePrefix || "") + this.onset + this.glide + reconstructedNucleus + this.coda;
    }
    /**
     * Clone with modified tone mark
     * @param {number} tone 
     * @returns {ParsedSyllable}
     */
    withTone(tone) {
      return new _ParsedSyllable({
        onset: this.onset,
        glide: this.glide,
        nucleus: this.nucleus,
        coda: this.coda,
        tone,
        hasApostrophe: this.hasApostrophe,
        apostrophePrefix: this.apostrophePrefix
      });
    }
    /**
     * Check if syllable conforms to Vietnamese orthography / phonology:
     * 1. Must have a valid vowel nucleus (cannot be consonant-only like 'fcitx', 'tmux').
     * 2. If word has letters before nucleus but no valid onset, it's a foreign cluster (e.g. 'fcitx').
     * 3. Coda must be a legitimate Vietnamese consonant coda (c, ch, m, n, ng, nh, p, t, k, l, r).
     * 4. Stop finals (-c, -ch, -p, -t, -k) can only take Tone 0, Tone 1 (sắc) or Tone 5 (nặng).
     * 5. Short vowels (ă, â) require a coda consonant (when not in-progress).
     * @param {Object} [options]
     * @param {boolean} [options.inProgress=false] When typing mid-word, short vowels ă/â without coda are valid as incomplete syllables.
     */
    isValid({ inProgress = false } = {}) {
      if (!this.nucleus) {
        return false;
      }
      const lowerVowels = (this.glide + this.nucleus).toLowerCase();
      if (/ơ[eaouêăâ]/i.test(lowerVowels)) {
        return false;
      }
      if (/ă[aeiouyăâêôơư]/i.test(lowerVowels)) {
        return false;
      }
      const lowerCoda = this.coda.toLowerCase();
      const STANDARD_CODAS = /* @__PURE__ */ new Set(["", "c", "ch", "m", "n", "ng", "nh", "p", "t"]);
      const ETHNIC_CODAS = /* @__PURE__ */ new Set(["k", "l", "r", "h"]);
      if (!STANDARD_CODAS.has(lowerCoda)) {
        if (ETHNIC_CODAS.has(lowerCoda)) {
          const baseSyllable = this.withTone(TONE_MARK.NONE).reconstruct().toLowerCase();
          const fullSyllable = this.reconstruct().toLowerCase();
          const VALID_ETHNIC_BASES = /* @__PURE__ */ new Set([
            "đắk",
            "đăk",
            "đrak",
            "đrák",
            "đrắk",
            "đrăk",
            "drắk",
            "drăk",
            "drak",
            "drák",
            "lắk",
            "lăk",
            "lak",
            "lák",
            "pắk",
            "păk",
            "pak",
            "pák",
            "buk",
            "búk",
            "păh",
            "pah",
            "páh",
            "kar",
            "mil",
            "m'đrắk",
            "m'đrăk",
            "m'đrak",
            "m'đrák",
            "mdrắk",
            "mdrăk",
            "mdrak",
            "mdrák",
            "m'gar",
            "mgar",
            "r'lấp",
            "rlấp"
          ]);
          if (!VALID_ETHNIC_BASES.has(baseSyllable) && !VALID_ETHNIC_BASES.has(fullSyllable)) {
            return false;
          }
        } else {
          return false;
        }
      }
      if (["c", "ch", "p", "t", "k"].includes(lowerCoda)) {
        if (this.tone !== TONE_MARK.NONE && this.tone !== TONE_MARK.ACUTE && this.tone !== TONE_MARK.DOT_BELOW) {
          return false;
        }
      }
      const lowerN = this.nucleus.toLowerCase();
      if (["ia", "ya", "ua", "ưa"].includes(lowerN) && lowerCoda.length > 0) {
        return false;
      }
      if (!inProgress && this.tone !== TONE_MARK.NONE && lowerCoda.length > 0 && ["uo", "ie", "ye"].includes(lowerN)) {
        return false;
      }
      if (!inProgress) {
        if ((lowerN === "ă" || lowerN === "â") && this.coda.length === 0) {
          return false;
        }
      }
      return true;
    }
  };
  function parseSyllable(rawWord) {
    if (!rawWord || typeof rawWord !== "string") return null;
    let word = rawWord.normalize("NFC");
    let apostrophePrefix = "";
    const apoMatch = word.match(/^([A-Za-z]['’])/);
    if (apoMatch) {
      apostrophePrefix = apoMatch[1];
      word = word.slice(apoMatch[1].length);
    }
    let foundTone = TONE_MARK.NONE;
    let baseWord = "";
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const dec = VOWEL_DECOMPOSE_MAP[ch];
      if (dec) {
        baseWord += dec.base;
        if (dec.tone > 0 && foundTone === TONE_MARK.NONE) {
          foundTone = dec.tone;
        }
      } else {
        baseWord += ch;
      }
    }
    const lowerBase = baseWord.toLowerCase();
    let onset = "";
    let rest = baseWord;
    let lowerRest = lowerBase;
    if (lowerRest.startsWith("qu")) {
      onset = baseWord.slice(0, 1);
      rest = baseWord.slice(1);
      lowerRest = lowerBase.slice(1);
    } else if (lowerRest.startsWith("gi")) {
      if (lowerRest.length > 2 && VOWEL_DECOMPOSE_MAP[lowerRest[2]]) {
        onset = baseWord.slice(0, 2);
        rest = baseWord.slice(2);
        lowerRest = lowerBase.slice(2);
      } else {
        onset = baseWord.slice(0, 1);
        rest = baseWord.slice(1);
        lowerRest = lowerBase.slice(1);
      }
    } else {
      for (const testOnset of VALID_ONSETS) {
        if (lowerRest.startsWith(testOnset)) {
          onset = baseWord.slice(0, testOnset.length);
          rest = baseWord.slice(testOnset.length);
          lowerRest = lowerBase.slice(testOnset.length);
          break;
        }
      }
    }
    let vowelCluster = "";
    let coda = "";
    let foundVowel = false;
    for (let i = 0; i < rest.length; i++) {
      const ch = rest[i];
      const isV = Boolean(VOWEL_DECOMPOSE_MAP[ch]);
      if (isV && coda.length === 0) {
        vowelCluster += ch;
        foundVowel = true;
      } else {
        coda += ch;
      }
    }
    let glide = "";
    let nucleus = vowelCluster;
    const lowerVowels = vowelCluster.toLowerCase();
    if (vowelCluster.length >= 2) {
      const firstV = lowerVowels[0];
      const secondV = lowerVowels[1];
      if (firstV === "o" && (secondV === "a" || secondV === "e" || secondV === "ă")) {
        glide = vowelCluster[0];
        nucleus = vowelCluster.slice(1);
      } else if (firstV === "u") {
        if (secondV === "â" || secondV === "ê" || secondV === "ơ" || secondV === "y") {
          glide = vowelCluster[0];
          nucleus = vowelCluster.slice(1);
        } else if (secondV === "a" && coda.length > 0) {
          glide = vowelCluster[0];
          nucleus = vowelCluster.slice(1);
        }
      }
    }
    return new ParsedSyllable({
      onset,
      glide,
      nucleus,
      coda,
      tone: foundTone,
      hasApostrophe: Boolean(apostrophePrefix),
      apostrophePrefix
    });
  }

  // src/engine/casing.js
  function harmonizeSyllableCase(word, options = {}) {
    if (!word || typeof word !== "string" || word.length <= 1) {
      return word;
    }
    if (options.isCodeContext || isCamelOrPascalCase(word)) {
      return word;
    }
    if (/[\d_$/#-]/.test(word)) {
      return word;
    }
    const isAllUpper = word === word.toUpperCase() && word !== word.toLowerCase();
    if (isAllUpper) {
      return word;
    }
    const isAllLower = word === word.toLowerCase() && word !== word.toUpperCase();
    if (isAllLower) {
      return word;
    }
    const firstChar = word.charAt(0);
    const isFirstUpper = firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
    if (isFirstUpper) {
      return firstChar + word.slice(1).toLowerCase();
    } else {
      return word.toLowerCase();
    }
  }

  // src/engine/dictionary.js
  var FOREIGN_INITIAL_CLUSTERS = /* @__PURE__ */ new Set([
    "pl",
    "fl",
    "cl",
    "gl",
    "bl",
    "sl",
    "pr",
    "dr",
    "cr",
    "br",
    "gr",
    "fr",
    "wr",
    "sp",
    "st",
    "sk",
    "sm",
    "sn",
    "sw",
    "tw",
    "dw",
    "spl",
    "spr",
    "str",
    "scr",
    "shr",
    "squ",
    "kn",
    "ps",
    "rh",
    "phl",
    "chr",
    "sch"
  ]);
  var COMMON_ENGLISH_WORDS = /* @__PURE__ */ new Set([
    // Telex trap: words ending with 's' (sắc)
    "as",
    "is",
    "us",
    "this",
    "yes",
    "bus",
    "plus",
    "has",
    "was",
    "its",
    "his",
    "less",
    "miss",
    "pass",
    "boss",
    "loss",
    "mass",
    "class",
    "glass",
    "press",
    "cross",
    "dress",
    "guess",
    "basis",
    "status",
    "focus",
    "virus",
    "bonus",
    "canvas",
    "chaos",
    "oasis",
    "crisis",
    "texas",
    "paris",
    "series",
    "species",
    "famous",
    "fcitx",
    "fcitx5",
    "versus",
    "alias",
    "radius",
    "minus",
    "genius",
    "census",
    "campus",
    "circus",
    "lotus",
    "chorus",
    "walrus",
    "corpus",
    "hiatus",
    "nexus",
    "news",
    "always",
    "sometimes",
    "perhaps",
    "business",
    "process",
    "access",
    "success",
    "address",
    "docs",
    "doc",
    // Telex trap: words with 'x' (ngã)
    "text",
    "next",
    "context",
    "exit",
    "taxi",
    "linux",
    "unix",
    "ajax",
    "max",
    "mix",
    "box",
    "fix",
    "tax",
    "six",
    "fax",
    "sex",
    "complex",
    "index",
    "matrix",
    "syntax",
    "luxury",
    "reflex",
    "prefix",
    "suffix",
    "annex",
    "latex",
    "duplex",
    "vertex",
    "convex",
    "cortex",
    "pixel",
    "toxic",
    "oxide",
    "oxygen",
    "galaxy",
    "maximum",
    "expert",
    "expect",
    "express",
    "explain",
    "explore",
    "export",
    "extent",
    "extra",
    "extreme",
    "exact",
    "exam",
    "example",
    "exist",
    "execute",
    "exercise",
    "exceed",
    "except",
    "excess",
    "exchange",
    "excite",
    "exclude",
    "excuse",
    "expand",
    "expend",
    "expense",
    "expire",
    // Telex trap: words with 'r' (hỏi) & double 'r' cancellation traps (rr -> r)
    "for",
    "or",
    "our",
    "your",
    "her",
    "their",
    "other",
    "after",
    "under",
    "over",
    "never",
    "ever",
    "water",
    "paper",
    "order",
    "power",
    "user",
    "super",
    "server",
    "number",
    "member",
    "driver",
    "render",
    "router",
    "player",
    "master",
    "worker",
    "filter",
    "center",
    "letter",
    "matter",
    "better",
    "doctor",
    "factor",
    "sector",
    "vector",
    "senior",
    "junior",
    "error",
    "horror",
    "mirror",
    "sensor",
    "cursor",
    "armor",
    "harbor",
    "color",
    "flavor",
    "labor",
    "mayor",
    "prior",
    "vigor",
    "vapor",
    "favor",
    "clear",
    "near",
    "dear",
    "fear",
    "hear",
    "bear",
    "wear",
    "tear",
    "year",
    "gear",
    "rear",
    "pear",
    "sorry",
    "array",
    "carrier",
    "barrel",
    "correct",
    "corrupt",
    "borrow",
    "arrow",
    "narrow",
    "marry",
    "carry",
    "worry",
    "current",
    "currency",
    "occur",
    "occurred",
    "refer",
    "referred",
    "prefer",
    "preferred",
    // Telex trap: words with 'w' (horn/breve: ơ, ư, ă)
    "we",
    "with",
    "work",
    "word",
    "world",
    "week",
    "write",
    "wrong",
    "window",
    "windows",
    "white",
    "what",
    "when",
    "where",
    "which",
    "while",
    "who",
    "why",
    "web",
    "way",
    "wait",
    "want",
    "well",
    "will",
    "would",
    "without",
    "within",
    "website",
    "wifi",
    "watch",
    "warm",
    "wall",
    "wave",
    "wide",
    "wife",
    "wild",
    "wind",
    "wine",
    "wing",
    "wire",
    "wise",
    "wish",
    "wood",
    "wool",
    "wrap",
    "warn",
    "wash",
    "waste",
    "west",
    "worth",
    "worthy",
    "wheel",
    "whale",
    "wheat",
    "whip",
    "whisper",
    // Telex trap: words with 'f' (huyền)
    "of",
    "if",
    "off",
    "life",
    "safe",
    "file",
    "find",
    "first",
    "from",
    "form",
    "fast",
    "fact",
    "face",
    "fail",
    "fair",
    "fall",
    "false",
    "farm",
    "feat",
    "feed",
    "feel",
    "feet",
    "fell",
    "felt",
    "few",
    "fill",
    "film",
    "fine",
    "fire",
    "firm",
    "fish",
    "fit",
    "five",
    "flat",
    "flight",
    "floor",
    "flow",
    "fly",
    "folk",
    "food",
    "foot",
    "force",
    "fork",
    "free",
    "friend",
    "front",
    "fruit",
    "full",
    "fund",
    "funny",
    "future",
    // Telex trap: words with 'j' (nặng)
    "job",
    "join",
    "joy",
    "jump",
    "just",
    "judge",
    "juice",
    "jury",
    "jail",
    "jar",
    "jaw",
    "jean",
    "jeep",
    "jelly",
    "jest",
    "jet",
    "jewel",
    "jig",
    "jinx",
    "jockey",
    "jog",
    "joke",
    "jolly",
    "jolt",
    "journal",
    "journey",
    "judo",
    "jug",
    "juggler",
    "juggle",
    "jumbo",
    "jumper",
    "junction",
    "jungle",
    "junior",
    "junk",
    "junkie",
    "jupiter",
    "juror",
    "justice",
    "justify",
    // Tech, Developer & Common Modern Words
    "api",
    "app",
    "blog",
    "browser",
    "bug",
    "build",
    "chat",
    "chrome",
    "click",
    "client",
    "cloud",
    "code",
    "commit",
    "component",
    "config",
    "console",
    "css",
    "data",
    "dev",
    "developer",
    "div",
    "docker",
    "dom",
    "download",
    "edge",
    "email",
    "export",
    "extension",
    "facebook",
    "figma",
    "firefox",
    "font",
    "form",
    "frontend",
    "git",
    "github",
    "gmail",
    "google",
    "host",
    "html",
    "http",
    "https",
    "icon",
    "id",
    "iframe",
    "image",
    "import",
    "input",
    "install",
    "internet",
    "issue",
    "javascript",
    "json",
    "key",
    "link",
    "linux",
    "load",
    "log",
    "macos",
    "meta",
    "modal",
    "module",
    "net",
    "network",
    "node",
    "npm",
    "offline",
    "online",
    "open",
    "package",
    "page",
    "password",
    "patch",
    "ping",
    "plugin",
    "post",
    "pull",
    "push",
    "python",
    "react",
    "repo",
    "request",
    "response",
    "router",
    "run",
    "safari",
    "save",
    "script",
    "server",
    "service",
    "setup",
    "site",
    "span",
    "sql",
    "ssh",
    "status",
    "style",
    "sync",
    "tab",
    "tag",
    "task",
    "test",
    "time",
    "token",
    "tool",
    "true",
    "false",
    "null",
    "undefined",
    "ui",
    "update",
    "upload",
    "url",
    "user",
    "version",
    "video",
    "view",
    "vite",
    "vscode",
    "webpack",
    "website",
    "zip",
    "tesla",
    "saas",
    "sax",
    "core",
    "care",
    "case",
    "cost",
    "hard",
    "screen",
    "system",
    "branch",
    "merge",
    "rebase",
    "clone",
    "fetch",
    "diff",
    "stash",
    "release",
    "deploy",
    "debug",
    "lint",
    "bundle",
    "minify",
    "source",
    "assets",
    "public",
    "dist",
    "node_modules",
    "license",
    "readme",
    "env",
    "yaml",
    "toml",
    "xml",
    "scss",
    "less",
    "ts",
    "jsx",
    "tsx",
    "sh",
    "kubernetes",
    "k8s",
    "tailwind",
    "typescript",
    "postgres",
    "postgresql",
    "redis",
    "graphql",
    "webhook",
    "endpoint",
    "devops",
    "staging",
    "production",
    "frontend",
    "backend",
    "microservice",
    "payload",
    "auth",
    "oauth",
    "middleware",
    "handler",
    "schema",
    "query",
    "mutation",
    "resolver",
    "prisma",
    "supabase",
    "nextjs",
    "nuxt",
    "vue",
    "angular",
    "svelte",
    "electron",
    "tauri",
    "rust",
    "cargo",
    "golang",
    "pnpm",
    "yarn",
    "bun",
    "deno",
    "eslint",
    "prettier",
    "vitest",
    "jest",
    "modern",
    "variable",
    "mixed",
    "lowercase",
    "uppercase",
    "lower",
    "upper",
    "power",
    "tower",
    "shower",
    "slower",
    "flower",
    "low",
    "flow",
    "show",
    "slow",
    "blow",
    "grow",
    "draw",
    "raw",
    "law",
    "saw",
    "few",
    "view",
    "tick",
    "backtick",
    "reset",
    "restore",
    "refactor",
    "list",
    "host",
    "suggest",
    "axis",
    "regex",
    "music",
    "amazon",
    "cause",
    "profile",
    "upstream",
    "settings",
    // Common -st and frequent short English words
    "cast",
    "best",
    "last",
    "past",
    "rest",
    "most",
    "must",
    "just",
    "dust",
    "rust",
    "disk",
    "desk",
    "risk",
    "task",
    "mask",
    "cost",
    "lost",
    "fast",
    "post",
    "host",
    // Common dev actions & keywords frequently trapped in Telex
    "casing",
    "parse",
    "parsing",
    "parser",
    "scale",
    "scaling",
    "scaled",
    "scaler",
    "close",
    "closing",
    "closed",
    "closer",
    "raise",
    "raising",
    "raised",
    "lose",
    "losing",
    "lost",
    "loser",
    "browse",
    "browsing",
    "browsed",
    "increase",
    "decrease",
    "pause",
    "phrase",
    "please",
    "refuse",
    "reuse",
    "chase",
    "base",
    "basic",
    "route",
    "routing",
    "serve",
    "serving",
    "served",
    "match",
    "matching",
    "matched",
    "switch",
    "switching",
    "switched",
    "search",
    "searching",
    "searched",
    "track",
    "tracking",
    "tracked",
    "stack",
    "stacking",
    "stacked",
    "block",
    "blocking",
    "blocked",
    "lock",
    "locking",
    "locked",
    "start",
    "starting",
    "started",
    "stop",
    "stopping",
    "stopped",
    "bypass",
    "bypassing",
    "bypassed",
    "format",
    "formatting",
    "formatted",
    "map",
    "mapping",
    "mapped",
    "mask",
    "masking",
    "masked",
    "ask",
    "asking",
    "asked",
    "cache",
    "caching",
    "cached",
    "crash",
    "crashing",
    "crashed",
    "flash",
    "flashing",
    "flashed",
    "hash",
    "hashing",
    "hashed",
    "sort",
    "sorting",
    "sorted",
    "send",
    "sending",
    "sent",
    "read",
    "reading",
    "edit",
    "editing",
    "edited",
    "delete",
    "deleting",
    "deleted",
    "create",
    "creating",
    "created",
    "select",
    "selecting",
    "selected",
    "insert",
    "inserting",
    "inserted",
    "bind",
    "binding",
    "bound",
    "mount",
    "mounting",
    "mounted",
    "attach",
    "attaching",
    "attached",
    "detach",
    "detaching",
    "detached",
    "encode",
    "encoding",
    "encoded",
    "decode",
    "decoding",
    "decoded",
    "encrypt",
    "decrypt",
    "compress",
    "decompress",
    "listen",
    "listening",
    "connect",
    "connecting",
    "connected",
    "disconnect",
    "emit",
    "emitting",
    "dispatch",
    "resolve",
    "resolving",
    "resolved",
    "reject",
    "rejecting",
    "throw",
    "handle",
    "handling",
    "handled",
    "mutate",
    "mutating",
    "validate",
    "validating",
    "validated",
    "sanitize",
    "compile",
    "compiling",
    "invoke",
    "invoking",
    "invoked",
    "trigger",
    "triggering",
    "triggered",
    "cleanup",
    "flush",
    "flushing",
    "flushed",
    "drain",
    "poll",
    "polling",
    "stream",
    "streaming",
    "streamed",
    "buffer",
    "buffering",
    "buffered",
    "queue",
    "queuing",
    "queued",
    "shift",
    "shifting",
    "shifted",
    "slice",
    "slicing",
    "sliced",
    "splice",
    "splicing",
    "spliced",
    "split",
    "splitting",
    "copy",
    "copying",
    "copied",
    "paste",
    "pasting",
    "pasted",
    "undo",
    "redo",
    "print",
    "printing",
    "printed",
    "stage",
    "staging",
    "staged",
    "publish",
    "publishing",
    "published",
    "draft",
    "drafting",
    "drafted",
    "archive",
    "archiving",
    "archived",
    "recover",
    "recovering",
    "recovered",
    "repair",
    "rebuilding",
    "rebuilt",
    "restart",
    "restarting",
    "restarted",
    "reload",
    "reloading",
    "reloaded",
    "refresh",
    "refreshing",
    "refreshed",
    "revert",
    "reverting",
    "reverted",
    "clear",
    "clearing",
    "cleared",
    "clean",
    "cleaning",
    "cleaned",
    "wipe",
    "wiping",
    "wiped",
    "erase",
    "erasing",
    "erased",
    "trim",
    "trimming",
    "trimmed",
    "pad",
    "padding",
    "padded",
    "wrap",
    "wrapping",
    "wrapped",
    "escape",
    "escaping",
    "escaped",
    "assign",
    "assigning",
    "assigned",
    "define",
    "defining",
    "defined",
    "declare",
    "declaring",
    "declared",
    "compute",
    "computing",
    "computed",
    "count",
    "counting",
    "counted",
    "locate",
    "locating",
    "located",
    "inspect",
    "inspecting",
    "inspected",
    "audit",
    "auditing",
    "audited",
    "check",
    "checking",
    "checked",
    "assert",
    "asserting",
    "asserted",
    "verify",
    "verifying",
    "verified",
    "mock",
    "mocking",
    "mocked",
    "stub",
    "benchmark",
    "measure",
    "trace",
    "tracing",
    "traced",
    "warn",
    "warning",
    "warned",
    "notify",
    "alert",
    "alerting",
    "alerted",
    "toast",
    "prompt",
    "confirm",
    "confirming",
    "confirmed",
    "toggle",
    "toggling",
    "toggled",
    "collapse",
    "collapsing",
    "collapsed",
    "scroll",
    "scrolling",
    "scrolled",
    "zoom",
    "zooming",
    "zoomed",
    "drag",
    "dragging",
    "dragged",
    "hover",
    "hovering",
    "press",
    "pressing",
    "pressed",
    "tap",
    "tapping",
    "tapped",
    "forward",
    "forwarding",
    "forwarded",
    "redirect",
    "redirecting",
    "redirected",
    // General high frequency English words
    "the",
    "be",
    "to",
    "and",
    "a",
    "in",
    "that",
    "have",
    "i",
    "it",
    "not",
    "on",
    "he",
    "you",
    "do",
    "at",
    "but",
    "by",
    "they",
    "say",
    "she",
    "an",
    "my",
    "one",
    "all",
    "there",
    "so",
    "up",
    "out",
    "about",
    "get",
    "which",
    "go",
    "me",
    "when",
    "make",
    "can",
    "like",
    "no",
    "him",
    "know",
    "take",
    "people",
    "into",
    "good",
    "some",
    "could",
    "them",
    "see",
    "than",
    "then",
    "now",
    "look",
    "only",
    "come",
    "think",
    "also",
    "back",
    "use",
    "two",
    "how",
    "even",
    "new",
    "because",
    "any",
    "these",
    "give",
    "day",
    "most",
    "city",
    "center",
    "cell",
    "circle",
    "gift",
    "game",
    "great",
    "going",
    "gone",
    "group",
    "guide",
    "guest",
    "guard",
    "guy"
  ]);
  var DEFAULT_USER_WORDS = Array.from(COMMON_ENGLISH_WORDS).sort();
  function hasCkPhonologyViolation(word) {
    if (!word || word.length < 2) return false;
    const clean = word.toLowerCase();
    if (/^c[eèéẻẽẹêếềểễệiíìỉĩịyýỳỷỹỵ]/i.test(clean)) {
      return true;
    }
    return false;
  }
  function hasGghPhonologyViolation(word) {
    if (!word || word.length < 2) return false;
    const clean = word.toLowerCase();
    if (/(^|[^a-z0-9])g[eèéẻẽẹêếềểễệ]/i.test(clean)) {
      return true;
    }
    return false;
  }
  function hasNgPhonologyViolation(word) {
    if (!word || word.length < 3) return false;
    const clean = word.toLowerCase();
    if (/(^|[^a-z0-9])ng[eèéẻẽẹêếềểễệiíìỉĩị]/i.test(clean)) {
      return true;
    }
    return false;
  }
  function isCheckedToneViolation(word, targetTone) {
    if (!word || targetTone === void 0 || targetTone === null) return false;
    if (targetTone === 1 || targetTone === 5 || targetTone === 0) {
      return false;
    }
    const clean = word.toLowerCase();
    if (/(c|ch|p|t)$/i.test(clean)) {
      return true;
    }
    return false;
  }
  function hasPhonologyViolation(word) {
    if (!word) return false;
    return hasCkPhonologyViolation(word) || hasGghPhonologyViolation(word) || hasNgPhonologyViolation(word);
  }
  var ACCENT_TO_RAW_TELEX = {
    // Sắc (s)
    "á": "as",
    "ắ": "aws",
    "ấ": "aas",
    "é": "es",
    "ế": "ees",
    "í": "is",
    "ó": "os",
    "ố": "oos",
    "ớ": "ows",
    "ú": "us",
    "ứ": "uws",
    "ý": "ys",
    "Á": "As",
    "Ắ": "Aws",
    "Ấ": "Aas",
    "É": "Es",
    "Ế": "Ees",
    "Í": "Is",
    "Ó": "Os",
    "Ố": "Oos",
    "Ớ": "Ows",
    "Ú": "Us",
    "Ứ": "Uws",
    "Ý": "Ys",
    // Huyền (f)
    "à": "af",
    "ằ": "awf",
    "ầ": "aaf",
    "è": "ef",
    "ề": "eef",
    "ì": "if",
    "ò": "of",
    "ồ": "oof",
    "ờ": "owf",
    "ù": "uf",
    "ừ": "uwf",
    "ỳ": "yf",
    "À": "Af",
    "Ằ": "Awf",
    "Ầ": "Aaf",
    "È": "Ef",
    "Ề": "Eef",
    "Ì": "If",
    "Ò": "Of",
    "Ồ": "Oof",
    "Ờ": "Owf",
    "Ù": "Uf",
    "Ừ": "Uwf",
    "Ỳ": "Yf",
    // Hỏi (r)
    "ả": "ar",
    "ẳ": "awr",
    "ẩ": "aar",
    "ẻ": "er",
    "ể": "eer",
    "ỉ": "ir",
    "ỏ": "or",
    "ổ": "oor",
    "ở": "owr",
    "ủ": "ur",
    "ử": "uwr",
    "ỷ": "yr",
    "Ả": "Ar",
    "Ẳ": "Awr",
    "Ẩ": "Aar",
    "Ẻ": "Er",
    "Ể": "Eer",
    "Ỉ": "Ir",
    "Ỏ": "Or",
    "Ổ": "Oor",
    "Ở": "Owr",
    "Ủ": "Ur",
    "Ử": "Uwr",
    "Ỷ": "Yr",
    // Ngã (x)
    "ã": "ax",
    "ẵ": "awx",
    "ẫ": "aax",
    "ẽ": "ex",
    "ễ": "eex",
    "ĩ": "ix",
    "õ": "ox",
    "ỗ": "oox",
    "ỡ": "owx",
    "ũ": "ux",
    "ữ": "uwx",
    "ỹ": "yx",
    "Ã": "Ax",
    "Ẵ": "Awx",
    "Ẫ": "Aax",
    "Ẽ": "Ex",
    "Ễ": "Eex",
    "Ĩ": "Ix",
    "Õ": "Ox",
    "Ỗ": "Oox",
    "Ỡ": "Owx",
    "Ũ": "Ux",
    "Ữ": "Uwx",
    "Ỹ": "Yx",
    // Nặng (j)
    "ạ": "aj",
    "ặ": "awj",
    "ậ": "aaj",
    "ẹ": "ej",
    "ệ": "eej",
    "ị": "ij",
    "ọ": "oj",
    "ộ": "ooj",
    "ợ": "owj",
    "ụ": "uj",
    "ự": "uwj",
    "ỵ": "yj",
    "Ạ": "Aj",
    "Ặ": "Awj",
    "Ậ": "Aaj",
    "Ẹ": "Ej",
    "Ệ": "Eej",
    "Ị": "Ij",
    "Ọ": "Oj",
    "Ộ": "Ooj",
    "Ợ": "Owj",
    "Ụ": "Uj",
    "Ự": "Uwj",
    "Ỵ": "Yj",
    // Shapes without tone
    "â": "aa",
    "Â": "Aa",
    "ă": "aw",
    "Ă": "Aw",
    "ê": "ee",
    "Ê": "Ee",
    "ô": "oo",
    "Ô": "Oo",
    "ơ": "ow",
    "Ơ": "Ow",
    "ư": "uw",
    "Ư": "Uw",
    "đ": "dd",
    "Đ": "Dd"
  };
  function matchCasing(source, target) {
    if (!source || !target) return target || "";
    const isAllUpper = source.length > 1 && source === source.toUpperCase() && source !== source.toLowerCase();
    if (isAllUpper) {
      return target.toUpperCase();
    }
    if (source.length === target.length && /[a-z]/.test(source) && /[A-Z]/.test(source.slice(1))) {
      return target.split("").map((ch, i) => {
        const s = source.charAt(i);
        return s === s.toUpperCase() && s !== s.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase();
      }).join("");
    }
    const firstChar = source.charAt(0);
    const isFirstUpper = firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
    if (isFirstUpper) {
      return target.charAt(0).toUpperCase() + target.slice(1);
    }
    if (/[a-z][A-Z]/.test(target) || /[a-z][A-Z]/.test(source)) {
      return target;
    }
    return target.toLowerCase();
  }
  function reverseVietnameseWord(word) {
    if (!word) return "";
    const clean = word.toLowerCase();
    const DIRECT_REVERSE_TRAPS = {
      "aets": "assets",
      "amo": "armor",
      "ađress": "address",
      "blơ": "blow",
      "brơser": "browser",
      "buines": "business",
      "caúe": "cause",
      "cháo": "chaos",
      "chỏus": "chorus",
      "càe": "care",
      "cáe": "case",
      "còe": "core",
      "cònig": "config",
      "cúor": "cursor",
      "cảe": "care",
      "cảgo": "cargo",
      "cỏe": "core",
      "cỏpus": "corpus",
      "cỏtex": "cortex",
      "dít": "dist",
      "dóc": "docs",
      "dônlad": "download",
      "đră": "draw",
      "eãm": "exam",
      "eãmple": "example",
      "facebôk": "facebook",
      "flôr": "floor",
      "flơ": "flow",
      "flởe": "flower",
      "frê": "free",
      "fê": "few",
      "fêd": "feed",
      "fêl": "feel",
      "fêt": "feet",
      "fôd": "food",
      "fôt": "foot",
      "gìt": "gift",
      "gôd": "good",
      "gôgle": "google",
      "grơ": "grow",
      "habo": "harbor",
      "hảd": "hard",
      "hơ": "how",
      "iue": "issue",
      "iảme": "iframe",
      "jêp": "jeep",
      "jă": "jaw",
      "knơ": "know",
      "lìe": "life",
      "lít": "list",
      "lôk": "look",
      "lơ": "low",
      "lởe": "lower",
      "lơer": "lower",
      "lởecase": "lowercase",
      "lơercase": "lowercase",
      "lă": "law",
      "lũury": "luxury",
      "lủuy": "luxury",
      "mior": "mirror",
      "miđleware": "middleware",
      "modẻn": "modern",
      "máter": "master",
      "mãimum": "maximum",
      "múic": "music",
      "mẻge": "merge",
      "mĩed": "mixed",
      "nê": "new",
      "nơ": "now",
      "ode": "order",
      "oline": "offline",
      "ỏ": "or",
      "púh": "push",
      "păssord": "password",
      "pơer": "power",
      "pởe": "power",
      "pởer": "power",
      "pởeful": "powerful",
      "pẻpct": "perfect",
      "quẻy": "query",
      "repone": "response",
      "rèactor": "refactor",
      "rèlex": "reflex",
      "réolver": "resolver",
      "rétore": "restore",
      // 'rết': 'reset',
      "ră": "raw",
      "scrên": "screen",
      "seve": "server",
      "seỉes": "series",
      "shơ": "show",
      "shởe": "shower",
      "slơ": "slow",
      "slởe": "slower",
      "suix": "suffix",
      "sà": "saas",
      "sàe": "safe",
      "sâs": "saas",
      "sã": "sax",
      "să": "saw",
      "sầri": "safari",
      "sẻach": "search",
      "sẻvice": "service",
      "ták": "task",
      "téla": "tesla",
      // 'tét': 'test',
      "têt": "text",
      "tôl": "tool",
      "tăilind": "tailwind",
      "tơer": "tower",
      "tởe": "tower",
      "tưo": "two",
      "tẻla": "tesla",
      "tẽas": "texas",
      "tẽt": "text",
      "uér": "user",
      "uétate": "usestate",
      "uppẻ": "upper",
      "uppẻcase": "uppercase",
      "vaỉable": "variable",
      "vảiable": "variable",
      "veu": "versus",
      "veíon": "version",
      "vẻtex": "vertex",
      "viê": "view",
      "webhôk": "webhook",
      "whêl": "wheel",
      "windơ": "window",
      "windơs": "windows",
      "wêk": "week",
      "wôd": "wood",
      "wôl": "wool",
      "àter": "after",
      "ái": "axis",
      "âlys": "always",
      "âmzon": "amazon",
      "élint": "eslint",
      "êpct": "expect",
      "íntall": "install",
      "õide": "oxide",
      "õygen": "oxygen",
      "úe": "use",
      "úer": "user",
      "uẻ": "user",
      "úptream": "upstream",
      "úẻ": "user",
      "ưindoư": "window",
      "ưork": "work",
      "ậx": "ajax",
      "ẽact": "exact",
      "ẽcept": "except",
      "ẽcess": "excess",
      "ẽchange": "exchange",
      "ẽcite": "excite",
      "ẽclude": "exclude",
      "ẽcuse": "excuse",
      "ẽcêd": "exceed",
      "ẽist": "exist",
      "ẽit": "exit",
      "ẽpand": "expand",
      "ẽpect": "expect",
      "ẽpend": "expend",
      "ẽpense": "expense",
      "ẽpert": "expert",
      "ẽpire": "expire",
      "ẽplain": "explain",
      "ẽplore": "explore",
      "ẽport": "export",
      "ẽpress": "express",
      "ẽtension": "extension",
      "ẽtnsion": "extension",
      "ễtension": "extension",
      "ễtnsion": "extension",
      "ẽtend": "extend",
      "ẽtnd": "extend",
      "ễtend": "extend",
      "ễtnd": "extend",
      "ẽternal": "external",
      "ẽtrnal": "external",
      "ễternal": "external",
      "ễtrnal": "external",
      "ẽtent": "extent",
      "ẽtra": "extra",
      "ẽtreme": "extreme",
      "ểcise": "exercise",
      "ễcute": "execute",
      "ủl": "url"
    };
    if (DIRECT_REVERSE_TRAPS[clean]) {
      const mapped = DIRECT_REVERSE_TRAPS[clean];
      return matchCasing(word, mapped);
    }
    let workingWord = word;
    if (/[ơởớờỡợ]e/i.test(workingWord)) {
      workingWord = workingWord.replace(/ởe/g, "ower").replace(/ớe/g, "owes").replace(/ờe/g, "owef").replace(/ỡe/g, "owex").replace(/ợe/g, "owej").replace(/ơe/g, "owe").replace(/Ởe/g, "Ower").replace(/Ớe/g, "Owes").replace(/Ờe/g, "Owef").replace(/Ỡe/g, "Owex").replace(/Ợe/g, "Owej").replace(/Ơe/g, "Owe");
    }
    if (!/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(workingWord)) {
      return matchCasing(word, workingWord);
    }
    let result = "";
    for (let i = 0; i < workingWord.length; i++) {
      const ch = workingWord[i];
      if (ACCENT_TO_RAW_TELEX[ch]) {
        result += ACCENT_TO_RAW_TELEX[ch];
      } else {
        result += ch;
      }
    }
    return result;
  }
  var ENGLISH_TELEX_TRAPS = /* @__PURE__ */ new Set([
    "text",
    "next",
    "context",
    "exit",
    "user",
    "super",
    "server",
    "router",
    "player",
    "master",
    "worker",
    "filter",
    "center",
    "letter",
    "matter",
    "better",
    "doctor",
    "factor",
    "sector",
    "vector",
    "error",
    "horror",
    "mirror",
    "sensor",
    "cursor",
    "sorry",
    "array",
    "carrier",
    "barrel",
    "correct",
    "corrupt",
    "borrow",
    "arrow",
    "narrow",
    "marry",
    "carry",
    "worry",
    "current",
    "currency",
    "occur",
    "occurred",
    "refer",
    "referred",
    "prefer",
    "preferred",
    "push",
    "expect",
    "luxury",
    "window",
    "windows",
    "work",
    "word",
    "world",
    "tesla",
    "screen",
    "saas",
    "ajax",
    "duplex",
    "complex",
    "index",
    "matrix",
    "syntax",
    "prefix",
    "suffix",
    "annex",
    "latex",
    "reflex",
    "pixel",
    "toxic",
    "oxide",
    "oxygen",
    "galaxy",
    "expert",
    "express",
    "explain",
    "explore",
    "export",
    "extra",
    "extreme",
    "exact",
    "exam",
    "example",
    "exist",
    "execute",
    "exercise",
    "except",
    "excess",
    "exchange",
    "expand",
    "expense",
    "perfect",
    "docs",
    "modern",
    "variable",
    "backtick",
    "restore",
    "refactor",
    "query",
    "mixed",
    "lowercase",
    "uppercase",
    "lower",
    "upper",
    "power",
    "tower",
    "flower",
    "shower",
    "slower",
    "flow",
    "show",
    "slow",
    "blow",
    "grow",
    "draw",
    "raw",
    "law",
    "saw",
    "few",
    "view",
    "virus",
    "chaos",
    "status",
    "focus",
    "radius"
  ]);
  var ENGLISH_PREFER_VIETNAMESE = /* @__PURE__ */ new Set([
    "as",
    "is",
    "os",
    "us",
    "of",
    "if",
    "or",
    "conf",
    "must",
    "rust",
    "rest",
    "test",
    "cast",
    "past",
    "cost",
    "post",
    "host",
    "lost",
    "fast",
    "dust",
    "best",
    "this",
    "these",
    "bits",
    "hits",
    "fits",
    "sit",
    "fits",
    "case",
    "care",
    "base",
    "dose",
    "rose",
    "fuse",
    "nose"
  ]);
  function isLikelyEnglishWord(w) {
    if (!w || typeof w !== "string") return false;
    const word = w.toLowerCase().trim();
    if (word.length < 3) return false;
    if (COMMON_ENGLISH_WORDS.has(word) || userDictionary.has(word)) return true;
    if (word.endsWith("ing") && word.length >= 4) {
      const stem = word.slice(0, -3);
      if (COMMON_ENGLISH_WORDS.has(stem) || COMMON_ENGLISH_WORDS.has(stem + "e")) return true;
      if (stem.length >= 3 && stem[stem.length - 1] === stem[stem.length - 2]) {
        if (COMMON_ENGLISH_WORDS.has(stem.slice(0, -1))) return true;
      }
    }
    if (word.endsWith("ed") && word.length >= 4) {
      const stem = word.slice(0, -2);
      if (COMMON_ENGLISH_WORDS.has(stem) || COMMON_ENGLISH_WORDS.has(stem + "e")) return true;
      if (stem.length >= 3 && stem[stem.length - 1] === stem[stem.length - 2]) {
        if (COMMON_ENGLISH_WORDS.has(stem.slice(0, -1))) return true;
      }
    }
    if ((word.endsWith("er") || word.endsWith("or")) && word.length >= 4) {
      const stem = word.slice(0, -2);
      if (COMMON_ENGLISH_WORDS.has(stem) || COMMON_ENGLISH_WORDS.has(stem + "e")) return true;
      if (stem.length >= 3 && stem[stem.length - 1] === stem[stem.length - 2]) {
        if (COMMON_ENGLISH_WORDS.has(stem.slice(0, -1))) return true;
      }
    }
    if (word.endsWith("s") && word.length >= 3) {
      const stem = word.slice(0, -1);
      if (COMMON_ENGLISH_WORDS.has(stem)) return true;
      if (word.endsWith("es") && word.length >= 4) {
        const stemEs = word.slice(0, -2);
        if (COMMON_ENGLISH_WORDS.has(stemEs) || COMMON_ENGLISH_WORDS.has(stemEs + "e")) return true;
      }
    }
    if (word.endsWith("ly") && word.length >= 4) {
      const stem = word.slice(0, -2);
      if (COMMON_ENGLISH_WORDS.has(stem) || COMMON_ENGLISH_WORDS.has(stem + "e")) return true;
    }
    return false;
  }
  function hasEnglishPhonotactics(rawWord) {
    if (!rawWord || rawWord.length < 3) return false;
    const w = canon(rawWord);
    const vnSet = getVietnameseWordSet();
    if (vnSet.has(w)) {
      return false;
    }
    if (/^[a-z]['’][a-zàáảãạăắằẳẵặâấầẩẫậđ]/i.test(w)) {
      return false;
    }
    if (/(rv|lv|nv|st|sp|sc|sk|ct|pt|ft|lt|nt|nd|rd|ld|rk|lk|mp|nk|nch|tch)/.test(w)) {
      return true;
    }
    if (/[bdfjklqrsvwxz]$/.test(w)) {
      return true;
    }
    if (/(oo|ee|ea|ou|ow|ew)/.test(w) && w.length >= 4) {
      return true;
    }
    return false;
  }
  function shouldAutoRestoreEnglish(rawWord, currentWord) {
    if (!rawWord && !currentWord) return false;
    const curClean = (currentWord || "").trim().toLowerCase();
    let rawClean = (rawWord || "").trim().toLowerCase();
    if ((!rawClean || rawClean.length < curClean.length) && currentWord) {
      const reversed2 = reverseVietnameseWord(currentWord);
      if (reversed2) {
        rawClean = reversed2.toLowerCase();
      }
    }
    if (rawClean === curClean) {
      return false;
    }
    if (/^[a-zA-Z]+$/.test(curClean) && isLikelyEnglishWord(curClean) && !ENGLISH_TELEX_TRAPS.has(rawClean)) {
      return false;
    }
    if (/\d/.test(rawClean)) {
      return false;
    }
    if (curClean.length <= 1 || rawClean.length < 3) {
      return false;
    }
    const vnSet = getVietnameseWordSet();
    if (vnSet.has(curClean)) {
      if (rawClean && ENGLISH_TELEX_TRAPS.has(rawClean) && !ENGLISH_PREFER_VIETNAMESE.has(rawClean)) {
        return true;
      }
      return false;
    }
    if (rawClean && isLikelyEnglishWord(rawClean)) {
      return true;
    }
    const reversed = reverseVietnameseWord(currentWord).toLowerCase();
    if (reversed && reversed.length >= 3 && isLikelyEnglishWord(reversed) && !/\d/.test(reversed)) {
      return true;
    }
    if (rawClean && hasEnglishPhonotactics(rawClean)) {
      return true;
    }
    if (reversed && reversed.length >= 3 && hasEnglishPhonotactics(reversed) && !/\d/.test(reversed)) {
      return true;
    }
    return false;
  }
  function hasForeignOnset(word) {
    if (!word || word.length < 2) return false;
    const clean = word.toLowerCase();
    if (clean.length >= 3) {
      const c3 = clean.slice(0, 3);
      if (FOREIGN_INITIAL_CLUSTERS.has(c3)) return true;
    }
    const c2 = clean.slice(0, 2);
    if (FOREIGN_INITIAL_CLUSTERS.has(c2)) return true;
    return false;
  }
  var UserDictionary = class {
    constructor(initialWords = DEFAULT_USER_WORDS) {
      this.words = /* @__PURE__ */ new Set();
      this.customWords = /* @__PURE__ */ new Set();
      this.cachedIndex = null;
      this.loadWords(initialWords);
    }
    loadWords(wordsList) {
      if (Array.isArray(wordsList)) {
        const defaultSet = new Set(DEFAULT_USER_WORDS.map((w) => canon(w)));
        wordsList.forEach((w) => {
          const clean = canon(w);
          if (clean) {
            this.words.add(clean);
            if (!defaultSet.has(clean)) {
              this.customWords.add(clean);
            }
          }
        });
        this.cachedIndex = null;
      }
    }
    getIndex() {
      if (!this.cachedIndex) {
        this.cachedIndex = Array.from(this.words).map((w) => ({
          word: w,
          lower: w.toLowerCase(),
          stripped: w.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase()
        }));
      }
      return this.cachedIndex;
    }
    has(word) {
      if (!word) return false;
      return this.words.has(canon(word));
    }
    /**
     * Check if the raw keystroke sequence matches any custom/learned user word prefix.
     * Prevents premature Vietnamese diacritic placement on words the user intentionally customized.
     * Special rule: If a learned word contains numbers (e.g. VNI tone triggers like 'da5'),
     * it must only match when rawSeq itself reaches or includes the number key, so typing 'da'
     * is not blocked from taking standard accents.
     */
    isCustomUserWordPrefix(rawSeq) {
      if (!rawSeq || rawSeq.length < 2) return false;
      const lower = rawSeq.toLowerCase();
      for (const w of this.customWords) {
        if (/\d/.test(w) && !/\d/.test(lower)) {
          continue;
        }
        if (w.startsWith(lower)) return true;
      }
      return false;
    }
    getCustomWords() {
      return Array.from(this.customWords).sort();
    }
    add(word) {
      const clean = canon(word);
      if (!clean) return false;
      this.words.add(clean);
      this.customWords.add(clean);
      this.cachedIndex = null;
      this.saveToStorage();
      return true;
    }
    remove(word) {
      const clean = canon(word);
      if (!clean) return false;
      this.customWords.delete(clean);
      const deleted = this.words.delete(clean);
      if (deleted) {
        this.cachedIndex = null;
        this.saveToStorage();
      }
      return deleted;
    }
    clear() {
      this.words.clear();
      this.customWords.clear();
      this.cachedIndex = null;
      this.saveToStorage();
    }
    getWords() {
      return Array.from(this.words).sort();
    }
    count() {
      return this.words.size;
    }
    /**
     * Import from text (line by line or comma-separated or JSON)
     */
    importText(text) {
      if (!text || typeof text !== "string") return 0;
      let addedCount = 0;
      const raw = text.trim();
      if (raw.startsWith("[") || raw.startsWith("{")) {
        try {
          const parsed = JSON.parse(raw);
          const list = Array.isArray(parsed) ? parsed : Object.keys(parsed);
          list.forEach((w) => {
            if (this.add(String(w))) addedCount++;
          });
          return addedCount;
        } catch {
        }
      }
      const lines = raw.split(/[\r\n,;]+/);
      lines.forEach((l) => {
        const w = l.trim().toLowerCase();
        if (w && !this.words.has(w)) {
          this.words.add(w);
          this.customWords.add(w);
          addedCount++;
        }
      });
      if (addedCount > 0) {
        this.cachedIndex = null;
        this.saveToStorage();
      }
      return addedCount;
    }
    /**
     * Export to plain text or JSON
     */
    exportText(format = "txt") {
      const list = this.getWords();
      if (format === "json") {
        return JSON.stringify(list, null, 2);
      }
      return list.join("\n");
    }
    /**
     * Persistence with chrome.storage.local (to prevent 8KB quota exhaustion on sync)
     * Falls back to chrome.storage.sync (for legacy migrations) and localStorage.
     */
    async saveToStorage() {
      const list = this.getWords();
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("avim_user_dictionary", JSON.stringify(list));
        }
        const storageLocal = typeof browser !== "undefined" && browser.storage && browser.storage.local ? browser.storage.local : typeof chrome !== "undefined" && chrome.storage && chrome.storage.local ? chrome.storage.local : null;
        if (storageLocal) {
          await new Promise((resolve) => {
            try {
              const p = storageLocal.set({ avim_user_dictionary: list }, () => resolve());
              if (p && typeof p.then === "function") p.then(resolve).catch(resolve);
            } catch {
              resolve();
            }
          });
        }
      } catch (err) {
        console.warn("Could not save user dictionary:", err);
      }
    }
    async loadFromStorage() {
      try {
        const storageLocal = typeof browser !== "undefined" && browser.storage && browser.storage.local ? browser.storage.local : typeof chrome !== "undefined" && chrome.storage && chrome.storage.local ? chrome.storage.local : null;
        if (storageLocal) {
          const res = await new Promise((resolve) => {
            try {
              const p = storageLocal.get(["avim_user_dictionary"], (r) => resolve(r || {}));
              if (p && typeof p.then === "function") p.then(resolve).catch(() => resolve({}));
            } catch {
              resolve({});
            }
          });
          if (Array.isArray(res.avim_user_dictionary) && res.avim_user_dictionary.length > 0) {
            this.loadWords(res.avim_user_dictionary);
            return;
          }
        }
        const storageSync = typeof browser !== "undefined" && browser.storage && browser.storage.sync ? browser.storage.sync : typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync ? chrome.storage.sync : null;
        if (storageSync) {
          const syncRes = await new Promise((resolve) => {
            try {
              const p = storageSync.get(["avim_user_dictionary"], (r) => resolve(r || {}));
              if (p && typeof p.then === "function") p.then(resolve).catch(() => resolve({}));
            } catch {
              resolve({});
            }
          });
          if (Array.isArray(syncRes.avim_user_dictionary) && syncRes.avim_user_dictionary.length > 0) {
            this.loadWords(syncRes.avim_user_dictionary);
            this.saveToStorage();
            return;
          }
        }
        if (typeof localStorage !== "undefined") {
          const saved = localStorage.getItem("avim_user_dictionary");
          if (saved) {
            const list = JSON.parse(saved);
            if (Array.isArray(list)) {
              this.loadWords(list);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load user dictionary:", err);
      }
    }
  };
  var userDictionary = new UserDictionary();
  function checkWordSpelling(word) {
    if (!word) return true;
    const clean = canon(word.trim());
    if (userDictionary.has(clean)) {
      return true;
    }
    if (word.length >= 2 && word === word.toUpperCase() && /[Đđ]/.test(word)) {
      return true;
    }
    const vnSet = getVietnameseWordSet();
    if (vnSet.has(clean)) {
      return true;
    }
    if (/^[a-z0-9']+$/i.test(clean)) {
      return true;
    }
    return false;
  }

  // src/engine/avim.js
  var VOWEL_TABLE = {
    // Plain
    "a": ["a", "á", "à", "ả", "ã", "ạ"],
    "ă": ["ă", "ắ", "ằ", "ẳ", "ẵ", "ặ"],
    "â": ["â", "ấ", "ầ", "ẩ", "ẫ", "ậ"],
    "e": ["e", "é", "è", "ẻ", "ẽ", "ẹ"],
    "ê": ["ê", "ế", "ề", "ể", "ễ", "ệ"],
    "i": ["i", "í", "ì", "ỉ", "ĩ", "ị"],
    "o": ["o", "ó", "ò", "ỏ", "õ", "ọ"],
    "ô": ["ô", "ố", "ồ", "ổ", "ỗ", "ộ"],
    "ơ": ["ơ", "ớ", "ờ", "ở", "ỡ", "ợ"],
    "u": ["u", "ú", "ù", "ủ", "ũ", "ụ"],
    "ư": ["ư", "ứ", "ừ", "ử", "ữ", "ự"],
    "y": ["y", "ý", "ỳ", "ỷ", "ỹ", "ỵ"],
    // Uppercase
    "A": ["A", "Á", "À", "Ả", "Ã", "Ạ"],
    "Ă": ["Ă", "Ắ", "Ằ", "Ẳ", "Ẵ", "Ặ"],
    "Â": ["Â", "Ấ", "Ầ", "Ẩ", "Ẫ", "Ậ"],
    "E": ["E", "É", "È", "Ẻ", "Ẽ", "Ẹ"],
    "Ê": ["Ê", "Ế", "Ề", "Ể", "Ễ", "Ệ"],
    "I": ["I", "Í", "Ì", "Ỉ", "Ĩ", "Ị"],
    "O": ["O", "Ó", "Ò", "Ỏ", "Õ", "Ọ"],
    "Ô": ["Ô", "Ố", "Ồ", "Ổ", "Ỗ", "Ộ"],
    "Ơ": ["Ơ", "Ớ", "Ờ", "Ở", "Ỡ", "Ợ"],
    "U": ["U", "Ú", "Ù", "Ủ", "Ũ", "Ụ"],
    "Ư": ["Ư", "Ứ", "Ừ", "Ử", "Ữ", "Ự"],
    "Y": ["Y", "Ý", "Ỳ", "Ỷ", "Ỹ", "Ỵ"]
  };
  var CHAR_TO_BASE_AND_TONE = {};
  Object.entries(VOWEL_TABLE).forEach(([base, tones]) => {
    tones.forEach((char, toneIdx) => {
      CHAR_TO_BASE_AND_TONE[char] = { base, tone: toneIdx };
    });
  });
  var SHAPE_MAP = {
    // Base -> [circumflex, horn/breve]
    "a": { circumflex: "â", breve: "ă" },
    "A": { circumflex: "Â", breve: "Ă" },
    "â": { circumflex: "a", breve: "ă" },
    "Â": { circumflex: "A", breve: "Ă" },
    "ă": { circumflex: "â", breve: "a" },
    "Ă": { circumflex: "Â", breve: "a" },
    "e": { circumflex: "ê" },
    "E": { circumflex: "Ê" },
    "ê": { circumflex: "e" },
    "Ê": { circumflex: "E" },
    "o": { circumflex: "ô", horn: "ơ" },
    "O": { circumflex: "Ô", horn: "Ơ" },
    "ô": { circumflex: "o", horn: "ơ" },
    "Ô": { circumflex: "O", horn: "Ơ" },
    "ơ": { circumflex: "ô", horn: "o" },
    "Ơ": { circumflex: "Ô", horn: "O" },
    "u": { horn: "ư" },
    "U": { horn: "Ư" },
    "ư": { horn: "u" },
    "Ư": { horn: "U" }
  };
  var AvimEngine = class {
    constructor(options = {}) {
      this.method = options.method ?? IME_METHOD.VNI;
      this.toneStyle = options.toneStyle ?? TONE_STYLE.CLASSIC;
      this.spellCheck = options.spellCheck ?? true;
      this.autoRestore = options.autoRestore ?? true;
      this.quickConsonants = options.quickConsonants ?? false;
      this.quickTelex = options.quickTelex ?? true;
      this.autoRestoreEnglish = options.autoRestoreEnglish ?? true;
      this.escRevert = options.escRevert ?? true;
      this.phonologyRules = options.phonologyRules ?? true;
      this.autoHarmonizeCase = options.autoHarmonizeCase ?? false;
      this.typeW2U = options.typeW2U ?? true;
      this.smartHorn = options.smartHorn ?? true;
      this.currentWordRaw = "";
      this.lastTransformed = "";
      this.lastToneToggledWord = null;
      this.toneCancelled = false;
      this.prevWordWasEnglish = false;
    }
    setMethod(method) {
      this.method = method;
    }
    setToneStyle(toneStyle) {
      this.toneStyle = toneStyle;
    }
    setSpellCheck(enabled) {
      this.spellCheck = enabled;
    }
    setQuickConsonants(enabled) {
      this.quickConsonants = Boolean(enabled);
    }
    setQuickTelex(enabled) {
      this.quickTelex = Boolean(enabled);
    }
    setAutoRestoreEnglish(enabled) {
      this.autoRestoreEnglish = Boolean(enabled);
    }
    setEscRevert(enabled) {
      this.escRevert = Boolean(enabled);
    }
    setPhonologyRules(enabled) {
      this.phonologyRules = Boolean(enabled);
    }
    setAutoHarmonizeCase(enabled) {
      this.autoHarmonizeCase = Boolean(enabled);
    }
    setTypeW2U(enabled) {
      this.typeW2U = Boolean(enabled);
    }
    setSmartHorn(enabled) {
      this.smartHorn = Boolean(enabled);
    }
    trackRawKey(key) {
      if (key && key.length === 1) {
        this.currentWordRaw += key;
      }
    }
    /**
     * Live Inspector: returns a snapshot of the current engine state for debugging/testing.
     */
    inspectState() {
      return {
        method: this.method,
        toneStyle: this.toneStyle,
        currentWordRaw: this.currentWordRaw,
        lastTransformed: this.lastTransformed,
        toneCancelled: this.toneCancelled,
        prevWordWasEnglish: this.prevWordWasEnglish
      };
    }
    resetWordSession() {
      this.currentWordRaw = "";
      this.lastTransformed = "";
      this.lastToneToggledWord = null;
      this.toneCancelled = false;
      this.prevWordWasEnglish = false;
    }
    /**
     * Revert current word buffer back to raw keystrokes (Instant ESC Revert - GoNhanh)
     * @param {string} currentWord
     * @returns {{ reverted: boolean, result: string }}
     */
    revertCurrentWord(currentWord) {
      if (!this.escRevert) {
        return { reverted: false, result: currentWord || "" };
      }
      if (!currentWord && !this.currentWordRaw) {
        return { reverted: false, result: currentWord || "" };
      }
      const raw = this.currentWordRaw || reverseVietnameseWord(currentWord);
      if (raw && raw !== currentWord) {
        this.resetWordSession();
        return { reverted: true, result: matchCasing(currentWord, raw) };
      }
      const reversed = reverseVietnameseWord(currentWord);
      if (reversed && reversed !== currentWord) {
        this.resetWordSession();
        return { reverted: true, result: matchCasing(currentWord, reversed) };
      }
      return { reverted: false, result: currentWord };
    }
    /**
     * Check if current word should be auto-restored to English (GoNhanh Auto-Restore)
     * on Space, Enter, or word delimiter
     * @param {string} currentWord
     * @returns {{ restore: boolean, result: string }}
     */
    checkAutoRestore(currentWord) {
      if (!this.autoRestoreEnglish) {
        return { restore: false, result: currentWord };
      }
      if (!currentWord || currentWord.length <= 1) {
        this.prevWordWasEnglish = false;
        this.resetWordSession();
        return { restore: false, result: currentWord };
      }
      const rawCandidate = this.currentWordRaw || "";
      if (rawCandidate && rawCandidate !== currentWord) {
        const isAllCapsAcronym = /^[A-Z]{2,5}$/.test(rawCandidate);
        const isShortEnglishAfterEnglish = this.prevWordWasEnglish && /^(is|as|this|has|see|us|its|was)$/i.test(rawCandidate);
        if ((isAllCapsAcronym || isShortEnglishAfterEnglish) && !userDictionary.has(currentWord.toLowerCase())) {
          this.prevWordWasEnglish = true;
          this.resetWordSession();
          return { restore: true, result: rawCandidate };
        }
      }
      if (this.phonologyRules) {
        const hasDiacritics = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(currentWord);
        if (hasDiacritics && !userDictionary.has(currentWord.toLowerCase())) {
          const parsed = parseSyllable(currentWord);
          if (parsed && !parsed.isValid({ inProgress: false })) {
            const lowerN = parsed.nucleus.toLowerCase();
            const lowerCoda = parsed.coda.toLowerCase();
            const STANDARD_CODAS = /* @__PURE__ */ new Set(["", "c", "ch", "m", "n", "ng", "nh", "p", "t", "k", "l", "r", "h"]);
            const isShortVowelMissingCoda = (lowerN === "ă" || lowerN === "â") && lowerCoda.length === 0;
            const isClosedDiphWithStandardCodaAndTone = parsed.tone > 0 && STANDARD_CODAS.has(lowerCoda) && lowerCoda.length > 0 && ["uo", "ie", "ye"].includes(lowerN);
            const isOpenDiphWithCoda = ["ia", "ya", "ua", "ưa"].includes(lowerN) && lowerCoda.length > 0;
            if (isShortVowelMissingCoda || isClosedDiphWithStandardCodaAndTone || isOpenDiphWithCoda) {
              let rawSeq = this.currentWordRaw;
              if (!rawSeq) {
                if (isClosedDiphWithStandardCodaAndTone) {
                  const untoned = parsed.withTone(0).reconstruct();
                  const isVni = this.method === IME_METHOD.VNI;
                  const toneMapTelex = { 1: "s", 2: "f", 3: "r", 4: "x", 5: "j" };
                  const toneMapVni = { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5" };
                  rawSeq = untoned + (isVni ? toneMapVni[parsed.tone] || "" : toneMapTelex[parsed.tone] || "");
                } else {
                  rawSeq = reverseVietnameseWord(currentWord) || currentWord;
                }
              }
              this.resetWordSession();
              return { restore: true, result: matchCasing(currentWord, rawSeq) };
            }
          }
        }
      }
      if (this.method === IME_METHOD.VNI) {
        this.resetWordSession();
        return { restore: false, result: currentWord };
      }
      const raw = this.currentWordRaw;
      if (this.toneCancelled && raw && raw.length >= 4) {
        const dedupedRaw = raw.replace(/([sfrxj])\1/i, "$1");
        if (dedupedRaw !== raw && (COMMON_ENGLISH_WORDS.has(dedupedRaw.toLowerCase()) || isLikelyEnglishWord(dedupedRaw))) {
          this.resetWordSession();
          return { restore: true, result: matchCasing(currentWord, dedupedRaw) };
        }
      }
      const curLower = currentWord.toLowerCase();
      if (/^[a-zA-Z]+$/.test(currentWord) && (COMMON_ENGLISH_WORDS.has(curLower) || userDictionary.has(curLower))) {
        this.resetWordSession();
        return { restore: false, result: currentWord };
      }
      if (raw && /\d/.test(raw)) {
        this.resetWordSession();
        return { restore: false, result: currentWord };
      }
      if (shouldAutoRestoreEnglish(raw, currentWord)) {
        const rawLower = (raw || "").toLowerCase();
        let restored2 = "";
        if (raw && !/\d/.test(raw)) {
          restored2 = raw;
        } else {
          restored2 = reverseVietnameseWord(currentWord) || raw || currentWord;
        }
        restored2 = matchCasing(currentWord, restored2);
        this.resetWordSession();
        return { restore: true, result: restored2 };
      }
      if (currentWord.length >= 2 && !getVietnameseWordSet().has(currentWord.toLowerCase())) {
        let reversed = reverseVietnameseWord(currentWord);
        if (reversed && reversed.length >= 3 && !/\d/.test(reversed) && reversed.toLowerCase() !== currentWord.toLowerCase() && isLikelyEnglishWord(reversed.toLowerCase())) {
          reversed = matchCasing(currentWord, reversed);
          this.resetWordSession();
          return { restore: true, result: restored };
        }
      }
      return { restore: false, result: currentWord };
    }
    /**
     * Adaptive input method (from XKey vAdaptiveEnabled):
     * When AUTO is selected, digits route to VNI, and letter keys route to Telex.
     */
    getEffectiveMethod(key) {
      if (this.method === IME_METHOD.AUTO) {
        return /^[0-9]$/.test(key) ? IME_METHOD.VNI : IME_METHOD.TELEX;
      }
      return this.method;
    }
    /**
     * Process a key event in the context of the current word
     * @param {string} word Current word buffer before the key
     * @param {string} key Incoming key pressed (e.g. 's', 'w', '1')
     * @returns {{ transformed: boolean, result: string, originalWord?: string }}
     */
    processKey(word, key) {
      if (this.method === IME_METHOD.OFF) {
        return { transformed: false, result: word + key };
      }
      if (!key || key.length !== 1) {
        return { transformed: false, result: word + key };
      }
      if (word && !/^[A-Za-z][\x27\u2019]/.test(word)) {
        const pMatch = word.match(/^([\x22\x27\u2018\u2019\u201C\u201D\u00AB\u00BB\u2039\u203A\u201E\u201A]+)/);
        const sMatch = word.match(/([\x22\x27\u2018\u2019\u201C\u201D\u00AB\u00BB\u2039\u203A\u201E\u201A]+)$/);
        if (pMatch || sMatch) {
          let quotePrefix = pMatch ? pMatch[1] : "";
          let cleanWord = quotePrefix ? word.slice(quotePrefix.length) : word;
          let quoteSuffix = "";
          if (sMatch && cleanWord.length > 0) {
            const sMatch2 = cleanWord.match(/([\x22\x27\u2018\u2019\u201C\u201D\u00AB\u00BB\u2039\u203A\u201E\u201A]+)$/);
            if (sMatch2) {
              quoteSuffix = sMatch2[1];
              cleanWord = cleanWord.slice(0, -quoteSuffix.length);
            }
          }
          const innerRes = this.processKey(cleanWord, key);
          const wrappedResult = (quotePrefix + innerRes.result + quoteSuffix).normalize("NFC");
          this.lastTransformed = wrappedResult;
          return {
            transformed: innerRes.transformed,
            result: wrappedResult
          };
        }
      }
      if (/\d/.test(word) || word.includes("_") || word.includes("@") || word.includes("/")) {
        const newWord2 = word + key;
        this.lastTransformed = newWord2;
        return { transformed: false, result: newWord2 };
      }
      const isUpperKey = key === key.toUpperCase() && key !== key.toLowerCase();
      if (word.length >= 1 && isUpperKey) {
        if (isCamelOrPascalCase(word + key)) {
          const cleanPrefix = reverseVietnameseWord(word) || word;
          if (/^[a-zA-Z]+$/.test(cleanPrefix)) {
            const newWord2 = cleanPrefix + key;
            this.lastTransformed = newWord2;
            this.currentWordRaw = newWord2;
            return { transformed: true, result: newWord2 };
          }
        }
      }
      if (isCamelOrPascalCase(word) || isCamelOrPascalCase(word + key)) {
        const newWord2 = word + key;
        this.lastTransformed = newWord2;
        this.currentWordRaw = (this.currentWordRaw || word) + key;
        return { transformed: false, result: newWord2 };
      }
      if (this.phonologyRules && hasPhonologyViolation(word)) {
        return { transformed: false, result: word + key };
      }
      if (this.phonologyRules && hasForeignOnset(word)) {
        const vnSet = getVietnameseWordSet();
        const cWord = canon(word);
        const isKnown = vnSet.has(cWord);
        const stripAcc = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").toLowerCase();
        const sWord = stripAcc(cWord);
        const isPotentialPrefix = !isKnown && ["prông", "glong", "grai", "pleiku", "gram", "krông", "đrắk", "đrăk", "đrak", "m'đrắk"].some((w) => stripAcc(w).startsWith(sWord));
        if (!isKnown && !isPotentialPrefix) {
          return { transformed: false, result: word + key };
        }
      }
      let rawCandidate = "";
      if (this.currentWordRaw) {
        if (this.currentWordRaw.endsWith(key)) {
          rawCandidate = this.currentWordRaw;
        } else {
          rawCandidate = this.currentWordRaw + key;
        }
      } else {
        rawCandidate = (reverseVietnameseWord(word) || word) + key;
      }
      if (userDictionary && typeof userDictionary.isCustomUserWordPrefix === "function") {
        if (userDictionary.isCustomUserWordPrefix(rawCandidate)) {
          const newWord2 = word + key;
          this.lastTransformed = newWord2;
          return { transformed: false, result: newWord2 };
        }
      }
      if (word && word.endsWith("\\")) {
        const res = { transformed: true, result: word.slice(0, -1) + key };
        this.lastTransformed = res.result;
        return res;
      }
      if (this.quickConsonants) {
        const qcResult = this.checkQuickConsonants(word, key);
        if (qcResult.transformed) {
          this.lastTransformed = qcResult.result;
          return qcResult;
        }
      }
      if (this.quickTelex && this.getEffectiveMethod(key) === IME_METHOD.TELEX) {
        const qtResult = this.checkQuickTelex(word, key);
        if (qtResult.transformed) {
          this.lastTransformed = qtResult.result;
          return qtResult;
        }
      }
      const consResult = this.checkConsonant(word, key);
      if (consResult.transformed) {
        consResult.result = (consResult.result || "").normalize("NFC");
        this.lastTransformed = consResult.result;
        return consResult;
      }
      const shapeResult = this.checkVowelShape(word, key);
      if (shapeResult.transformed) {
        shapeResult.result = (shapeResult.result || "").normalize("NFC");
        this.lastTransformed = shapeResult.result;
        return shapeResult;
      }
      const swapResult = this.checkShapeModifierSwapping(word, key);
      if (swapResult.transformed) {
        swapResult.result = (swapResult.result || "").normalize("NFC");
        this.lastTransformed = swapResult.result;
        return swapResult;
      }
      const toneResult = this.checkTone(word, key);
      if (toneResult.transformed) {
        toneResult.result = (toneResult.result || "").normalize("NFC");
        this.lastTransformed = toneResult.result;
        return toneResult;
      }
      const dynamicResult = this.checkDynamicToneShift(word, key);
      if (dynamicResult.transformed) {
        dynamicResult.result = (dynamicResult.result || "").normalize("NFC");
        this.lastTransformed = dynamicResult.result;
        return dynamicResult;
      }
      const newWord = word + key;
      const finalWord = ((this.autoHarmonizeCase ? harmonizeSyllableCase(newWord) : newWord) || "").normalize("NFC");
      this.lastTransformed = finalWord;
      return { transformed: finalWord !== newWord, result: finalWord };
    }
    /**
     * Dynamic Tone Shifting:
     * Relocates tone when appending vowels or coda consonants to a syllable that already carries a tone mark.
     * e.g.:
     *   'tó' + 'a' -> 'tóa' (or 'toá' if modern)
     *   'tóa' + 'n' -> 'toán' (relocating tone from glide 'o' to nucleus 'a')
     *   'hó' + 'a' -> 'hóa' / 'hoá'
     *   'hoá' + 'n' -> 'hoán'
     */
    checkDynamicToneShift(word, key) {
      if (!word || !key || key.length !== 1) {
        return { transformed: false, result: word + key };
      }
      let hasAccentedVowel = false;
      for (let i = 0; i < word.length; i++) {
        const tone = CHAR_TO_BASE_AND_TONE[word[i]]?.tone;
        if (tone && tone > 0) {
          hasAccentedVowel = true;
          break;
        }
      }
      if (!hasAccentedVowel) {
        return { transformed: false, result: word + key };
      }
      const lowerKey = key.toLowerCase();
      const isVowelKey = ["a", "e", "i", "o", "u", "y"].includes(lowerKey);
      const isCodaKey = ["c", "h", "m", "n", "p", "t", "g"].includes(lowerKey);
      if (!isVowelKey && !isCodaKey) {
        return { transformed: false, result: word + key };
      }
      const candidate = word + key;
      const parsed = parseSyllable(candidate);
      if (!parsed || parsed.tone === TONE_MARK.NONE || !parsed.nucleus) {
        return { transformed: false, result: candidate };
      }
      if (!parsed.isValid()) {
        return { transformed: false, result: candidate };
      }
      let reconstructed = parsed.reconstruct(this.toneStyle);
      if (this.autoHarmonizeCase) {
        reconstructed = harmonizeSyllableCase(reconstructed);
      }
      if (reconstructed && reconstructed !== candidate) {
        return { transformed: true, result: reconstructed };
      }
      return { transformed: false, result: candidate };
    }
    /**
     * Shape Modifier Swapping (VietC / Bamboo innovation):
     * Allows users to swap between circumflex, horn, and breve while preserving existing tone marks:
     * Telex:
     *   â + w -> ă (ấm + w -> ắm, cân + w -> căn, tập + w -> tặp)
     *   ă + a -> â (ắm + a -> ấm, căn + a -> cân, tặp + a -> tập)
     *   ô + w -> ơ (bốn + w -> bớn, hộp + w -> hợp, cột + w -> cợt)
     *   ơ + o -> ô (bớn + o -> bốn, hợp + o -> hộp, cợt + o -> cột)
     * VNI:
     *   '8' (breve) on 'â' -> 'ă' (tấ + 8 -> tắ)
     *   '6' (circumflex) on 'ă' -> 'â' (tắ + 6 -> tấ)
     *   '7' (horn) on 'ô' -> 'ơ' (bốn + 7 -> bớn, giồ + 7 -> giờ)
     *   '6' (circumflex) on 'ơ' -> 'ô' (bớn + 6 -> bốn, giờ + 6 -> giồ)
     */
    checkShapeModifierSwapping(word, key) {
      if (!word || !key || key.length !== 1) {
        return { transformed: false, result: word + key };
      }
      const method = this.getEffectiveMethod(key);
      const lowerKey = key.toLowerCase();
      const parsed = parseSyllable(word);
      if (!parsed || !parsed.nucleus) {
        return { transformed: false, result: word + key };
      }
      const lowerNucleus = parsed.nucleus.toLowerCase();
      const isUpper = parsed.nucleus === parsed.nucleus.toUpperCase();
      let newNucleusBase = null;
      if (method === IME_METHOD.TELEX) {
        if (lowerKey === "w" && lowerNucleus === "â") {
          newNucleusBase = isUpper ? "Ă" : "ă";
        } else if (lowerKey === "a" && lowerNucleus === "ă") {
          newNucleusBase = isUpper ? "Â" : "â";
        } else if (lowerKey === "w" && lowerNucleus === "ô") {
          newNucleusBase = isUpper ? "Ơ" : "ơ";
        } else if (lowerKey === "o" && lowerNucleus === "ơ") {
          newNucleusBase = isUpper ? "Ô" : "ô";
        }
      } else if (method === IME_METHOD.VNI) {
        if (key === "8" && lowerNucleus === "â") {
          newNucleusBase = isUpper ? "Ă" : "ă";
        } else if (key === "6" && lowerNucleus === "ă") {
          newNucleusBase = isUpper ? "Â" : "â";
        } else if (key === "7" && lowerNucleus === "ô") {
          newNucleusBase = isUpper ? "Ơ" : "ơ";
        } else if (key === "6" && lowerNucleus === "ơ") {
          newNucleusBase = isUpper ? "Ô" : "ô";
        }
      }
      if (newNucleusBase) {
        parsed.nucleus = newNucleusBase;
        const reconstructed = parsed.reconstruct(this.toneStyle);
        return { transformed: true, result: reconstructed };
      }
      return { transformed: false, result: word + key };
    }
    /**
     * Quick Consonant transformations (XKey engine feature):
     * - Start: f -> ph, j -> gi, w -> qu (when at word start)
     * - End: vowel + g -> ng, vowel + h -> nh, vowel + k -> ch
     */
    checkQuickConsonants(word, key) {
      if (!this.quickConsonants) return { transformed: false, result: word + key };
      const lowerKey = key.toLowerCase();
      if (word.length === 0) {
        if (lowerKey === "f") {
          const rep = key === "F" ? "PH" : "ph";
          return { transformed: true, result: rep };
        }
        if (lowerKey === "j") {
          const rep = key === "J" ? "GI" : "gi";
          return { transformed: true, result: rep };
        }
        if (lowerKey === "w") {
          const rep = key === "W" ? "QU" : "qu";
          return { transformed: true, result: rep };
        }
      }
      if (word.length > 0) {
        if (hasForeignOnset(word) || userDictionary.has(word) || userDictionary.has(word + key)) {
          return { transformed: false, result: word + key };
        }
        const lastChar = word.slice(-1);
        const isVowel = Boolean(CHAR_TO_BASE_AND_TONE[lastChar]);
        if (isVowel) {
          if (lowerKey === "g") {
            const rep = key === "G" ? "NG" : "ng";
            return { transformed: true, result: word + rep };
          }
          if (lowerKey === "h") {
            const rep = key === "H" ? "NH" : "nh";
            return { transformed: true, result: word + rep };
          }
          if (lowerKey === "k") {
            const rep = key === "K" ? "CH" : "ch";
            return { transformed: true, result: word + rep };
          }
        }
      }
      return { transformed: false, result: word + key };
    }
    /**
     * Quick Telex transformations (OpenKey feature):
     * - cc -> ch, gg -> gi, kk -> kh, nn -> ng, pp -> ph, tt -> th
     * - Case preservation: cc -> ch, Cc -> Ch, CC -> CH
     * - Typing key a 3rd time reverts to triple consonant (e.g. 'ch' + 'c' -> 'ccc')
     */
    checkQuickTelex(word, key) {
      if (!word) return { transformed: false, result: word + key };
      const lowerKey = key.toLowerCase();
      if (word.length === 2) {
        const lowerWord = word.toLowerCase();
        const isQuickPair = lowerWord === "ch" && lowerKey === "c" || lowerWord === "gi" && lowerKey === "g" || lowerWord === "kh" && lowerKey === "k" || lowerWord === "ng" && lowerKey === "n" || lowerWord === "ph" && lowerKey === "p" || lowerWord === "th" && lowerKey === "t";
        if (isQuickPair) {
          const isUpper = word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase();
          const base = isUpper ? key.toUpperCase() : lowerKey;
          return { transformed: true, result: base + base + base };
        }
      }
      if (word.length !== 1) return { transformed: false, result: word + key };
      const firstChar = word[0];
      const lowerFirst = firstChar.toLowerCase();
      if (lowerFirst !== lowerKey) return { transformed: false, result: word + key };
      const quickMap = {
        "c": "h",
        "g": "i",
        "k": "h",
        "n": "g",
        "p": "h",
        "t": "h"
      };
      const mappedSecond = quickMap[lowerFirst];
      if (!mappedSecond) return { transformed: false, result: word + key };
      if (userDictionary.has(word + key)) {
        return { transformed: false, result: word + key };
      }
      const isFirstUpper = firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
      const isKeyUpper = key === key.toUpperCase() && key !== key.toLowerCase();
      let result = "";
      if (isFirstUpper && isKeyUpper) {
        result = firstChar + mappedSecond.toUpperCase();
      } else if (isFirstUpper) {
        result = firstChar + mappedSecond.toLowerCase();
      } else {
        result = firstChar + mappedSecond.toLowerCase();
      }
      return { transformed: true, result };
    }
    /**
     * Consonant modifications (Telex dd -> đ, VNI d + 9 -> đ, etc.)
     */
    checkConsonant(word, key) {
      if (!word) return { transformed: false, result: word + key };
      const method = this.getEffectiveMethod(key);
      const lowerKey = key.toLowerCase();
      const lastChar = word.slice(-1);
      const lowerLast = lastChar.toLowerCase();
      if (method === IME_METHOD.TELEX && lowerKey === "d") {
        if (lowerLast === "d") {
          const isUpper = lastChar === "D";
          const replacement = isUpper ? key === "D" ? "Đ" : "Đ" : "đ";
          return { transformed: true, result: word.slice(0, -1) + replacement };
        }
        if (lowerLast === "đ") {
          const isUpper = lastChar === "Đ";
          const replacement = isUpper ? "DD" : "dd";
          return { transformed: true, result: word.slice(0, -1) + replacement };
        }
        const hasVowel = Array.from(word).some((ch) => Boolean(CHAR_TO_BASE_AND_TONE[ch]));
        if (hasVowel) {
          const dIndex = word.toLowerCase().indexOf("d");
          const dbarIndex = word.toLowerCase().indexOf("đ");
          if (dbarIndex !== -1) {
            const char = word[dbarIndex];
            const rep = char === "Đ" ? "D" : "d";
            return {
              transformed: true,
              result: word.slice(0, dbarIndex) + rep + word.slice(dbarIndex + 1) + key
            };
          } else if (dIndex !== -1) {
            const char = word[dIndex];
            const rep = char === "D" ? "Đ" : "đ";
            return {
              transformed: true,
              result: word.slice(0, dIndex) + rep + word.slice(dIndex + 1)
            };
          }
        }
      }
      if (method === IME_METHOD.VNI && key === "9") {
        const dIndex = word.toLowerCase().lastIndexOf("d");
        const dbarIndex = word.toLowerCase().lastIndexOf("đ");
        if (dbarIndex !== -1) {
          const char = word[dbarIndex];
          const rep = char === "Đ" ? "D" : "d";
          return {
            transformed: true,
            result: word.slice(0, dbarIndex) + rep + word.slice(dbarIndex + 1) + "9"
          };
        } else if (dIndex !== -1) {
          const char = word[dIndex];
          const rep = char === "D" ? "Đ" : "đ";
          return {
            transformed: true,
            result: word.slice(0, dIndex) + rep + word.slice(dIndex + 1)
          };
        }
      }
      return { transformed: false, result: word + key };
    }
    /**
     * Vowel shape modification:
     * Telex:
     *   aa -> â, ee -> ê, oo -> ô
     *   ow -> ơ, uw -> ư, aw -> ă
     *   w at start or after u/o:
     *     uo + w -> ươ
     *     u + w -> ư
     *     w alone -> w (or ư)
     * VNI:
     *   6 -> â, ê, ô
     *   7 -> ơ, ư
     *   8 -> ă
     */
    checkVowelShape(word, key) {
      if (!word) {
        if (this.typeW2U === false && key.toLowerCase() === "w") {
          const method2 = this.getEffectiveMethod(key);
          if (method2 === IME_METHOD.TELEX) {
            return { transformed: true, result: key === "W" ? "Ư" : "ư" };
          }
        }
        return { transformed: false, result: word + key };
      }
      const method = this.getEffectiveMethod(key);
      const lowerKey = key.toLowerCase();
      if (method === IME_METHOD.TELEX) {
        if (["a", "e", "o"].includes(lowerKey)) {
          const circumflexTarget = lowerKey === "a" ? "â" : lowerKey === "e" ? "ê" : "ô";
          const lastChar = word.slice(-1);
          const lastBaseInfo = CHAR_TO_BASE_AND_TONE[lastChar];
          if (lastBaseInfo) {
            const lastBase = lastBaseInfo.base.toLowerCase();
            if (lastBase === lowerKey) {
              const target = SHAPE_MAP[lastBaseInfo.base]?.circumflex;
              if (target) {
                const isUpper = lastChar === lastChar.toUpperCase() && lastChar !== lastChar.toLowerCase();
                const tone = lastBaseInfo.tone;
                const newBase = isUpper ? target.toUpperCase() : target.toLowerCase();
                const newChar = VOWEL_TABLE[newBase][tone];
                return { transformed: true, result: word.slice(0, -1) + newChar };
              }
            } else if (lastBase === circumflexTarget) {
              const target = SHAPE_MAP[lastBaseInfo.base]?.circumflex;
              if (target) {
                const isUpper = lastChar === lastChar.toUpperCase() && lastChar !== lastChar.toLowerCase();
                const tone = lastBaseInfo.tone;
                const newBase = isUpper ? target.toUpperCase() : target.toLowerCase();
                const newChar = VOWEL_TABLE[newBase][tone];
                return { transformed: true, result: word.slice(0, -1) + newChar + key };
              }
            }
          }
          const vowelIndices = [];
          for (let i = 0; i < word.length; i++) {
            if (CHAR_TO_BASE_AND_TONE[word[i]]) {
              vowelIndices.push(i);
            }
          }
          if (vowelIndices.length > 0) {
            let isContiguous = true;
            for (let k = 0; k < vowelIndices.length - 1; k++) {
              if (vowelIndices[k + 1] - vowelIndices[k] !== 1) {
                isContiguous = false;
                break;
              }
            }
            if (isContiguous) {
              for (let idx = vowelIndices.length - 1; idx >= 0; idx--) {
                const charIndex = vowelIndices[idx];
                const char = word[charIndex];
                const baseInfo = CHAR_TO_BASE_AND_TONE[char];
                if (!baseInfo) continue;
                const charBase = baseInfo.base.toLowerCase();
                if (charBase === lowerKey) {
                  const target = SHAPE_MAP[baseInfo.base]?.circumflex;
                  if (target) {
                    const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
                    const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
                    const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
                    const newWord = word.slice(0, charIndex) + newChar + word.slice(charIndex + 1);
                    if (this.phonologyRules) {
                      if (isCheckedToneViolation(newWord, baseInfo.tone)) {
                        continue;
                      }
                      const parsed = parseSyllable(newWord);
                      if (parsed && !parsed.isValid()) {
                        continue;
                      }
                    }
                    if (!this.spellCheck || this.isValidVietnameseWord(newWord)) {
                      return { transformed: true, result: newWord };
                    }
                  }
                }
                if (charBase === circumflexTarget) {
                  if (lowerKey === "o" && word.toLowerCase().endsWith("ng")) {
                    const endsWithNg = word.toLowerCase().endsWith("ng");
                    const target2 = SHAPE_MAP[baseInfo.base]?.circumflex;
                    if (target2 && endsWithNg) {
                      const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
                      const tone = baseInfo.tone;
                      const o1 = isUpper ? "O" : "o";
                      const o2Base = isUpper ? "O" : "o";
                      const o2Accented = VOWEL_TABLE[o2Base][tone];
                      const doubleO = o1 + o2Accented;
                      const newWord = word.slice(0, charIndex) + doubleO + word.slice(charIndex + 1);
                      return { transformed: true, result: newWord };
                    }
                  }
                  const target = SHAPE_MAP[baseInfo.base]?.circumflex;
                  if (target) {
                    const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
                    const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
                    const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
                    const newWord = word.slice(0, charIndex) + newChar + word.slice(charIndex + 1) + key;
                    return { transformed: true, result: newWord };
                  }
                }
              }
            }
          }
        }
        if (lowerKey === "w") {
          return this.applyTelexW(word);
        }
      }
      if (method === IME_METHOD.VNI) {
        if (key === "6") {
          return this.applyVniModifier(word, "circumflex");
        }
        if (key === "7") {
          return this.applyVniModifier(word, "horn");
        }
        if (key === "8") {
          return this.applyVniModifier(word, "breve");
        }
      }
      return { transformed: false, result: word + key };
    }
    /**
     * Helper to locate an adjacent 'uo' pair (or already horned 'ươ' / 'uơ' / 'ưo')
     * in the word buffer.
     * Returns { index, c1, c2, info1, info2, b1, b2, isHorned } or null.
     */
    findUoPair(word) {
      if (!word || word.length < 2) return null;
      for (let i = 0; i < word.length - 1; i++) {
        const c1 = word[i];
        const c2 = word[i + 1];
        const info1 = CHAR_TO_BASE_AND_TONE[c1];
        const info2 = CHAR_TO_BASE_AND_TONE[c2];
        if (info1 && info2) {
          const b1 = info1.base.toLowerCase();
          const b2 = info2.base.toLowerCase();
          if ((b1 === "u" || b1 === "ư") && (b2 === "o" || b2 === "ơ" || b2 === "ô")) {
            const isHorned = b1 === "ư" && b2 === "ơ";
            return {
              index: i,
              c1,
              c2,
              info1,
              info2,
              b1,
              b2,
              isHorned
            };
          }
        }
      }
      return null;
    }
    /**
     * Transform 'uo' / 'ươ' pair with horn modifier (VNI 7 or Telex w)
     * - If already 'ươ', toggles back to 'uo' (preserving tone on second vowel)
     * - Otherwise transforms both to 'ươ' (placing any existing tone on 'ơ')
     */
    applyUoHorn(word, pair) {
      const { index, c1, c2, info1, info2, isHorned } = pair;
      const isUpper1 = c1 === c1.toUpperCase() && c1 !== c1.toLowerCase();
      const isUpper2 = c2 === c2.toUpperCase() && c2 !== c2.toLowerCase();
      const tone = Math.max(info1.tone, info2.tone);
      const endsWord = index + 2 === word.length;
      const hasCodaN = index + 3 === word.length && word[index + 2].toLowerCase() === "n";
      let isTrioException = false;
      if (index >= 1) {
        const charBefore = word[index - 1].toLowerCase();
        if (charBefore === "q" && (endsWord || hasCodaN)) {
          isTrioException = true;
        } else if (charBefore === "h" && endsWord) {
          isTrioException = true;
        } else if (index >= 2 && word.slice(index - 2, index).toLowerCase() === "th" && endsWord) {
          isTrioException = true;
        }
      }
      if (isTrioException) {
        if (info2.base.toLowerCase() === "ơ" || isHorned) {
          const base1 = isUpper1 ? "U" : "u";
          const base2 = isUpper2 ? "O" : "o";
          const char1 = VOWEL_TABLE[base1][0];
          const char2 = VOWEL_TABLE[base2][tone];
          return {
            transformed: true,
            result: word.slice(0, index) + char1 + char2 + word.slice(index + 2)
          };
        } else {
          const base1 = isUpper1 ? "U" : "u";
          const base2 = isUpper2 ? "Ơ" : "ơ";
          const char1 = VOWEL_TABLE[base1][0];
          const char2 = VOWEL_TABLE[base2][tone];
          return {
            transformed: true,
            result: word.slice(0, index) + char1 + char2 + word.slice(index + 2)
          };
        }
      }
      if (isHorned) {
        const base1 = isUpper1 ? "U" : "u";
        const base2 = isUpper2 ? "O" : "o";
        const char1 = VOWEL_TABLE[base1][0];
        const char2 = VOWEL_TABLE[base2][tone];
        return {
          transformed: true,
          result: word.slice(0, index) + char1 + char2 + word.slice(index + 2) + "w"
        };
      } else {
        const base1 = isUpper1 ? "Ư" : "ư";
        const base2 = isUpper2 ? "Ơ" : "ơ";
        const char1 = VOWEL_TABLE[base1][0];
        const char2 = VOWEL_TABLE[base2][tone];
        return {
          transformed: true,
          result: word.slice(0, index) + char1 + char2 + word.slice(index + 2)
        };
      }
    }
    /**
     * Helper to locate an adjacent 'uu' pair (or already horned 'ưu' / 'uư')
     * in the word buffer (e.g. 'cuu', 'cưu', 'luu', 'muu', 'huu', 'tuu').
     * In Vietnamese orthography, 'uu' + horn MUST horn the FIRST 'u' to form 'ưu' (never 'uư').
     * Returns { index, c1, c2, info1, info2, b1, b2, isHorned } or null.
     */
    findUuPair(word) {
      if (!word || word.length < 2) return null;
      for (let i = 0; i < word.length - 1; i++) {
        const c1 = word[i];
        const c2 = word[i + 1];
        const info1 = CHAR_TO_BASE_AND_TONE[c1];
        const info2 = CHAR_TO_BASE_AND_TONE[c2];
        if (info1 && info2) {
          const b1 = info1.base.toLowerCase();
          const b2 = info2.base.toLowerCase();
          if ((b1 === "u" || b1 === "ư") && (b2 === "u" || b2 === "ư")) {
            const isHorned = b1 === "ư" && b2 === "u";
            return {
              index: i,
              c1,
              c2,
              info1,
              info2,
              b1,
              b2,
              isHorned
            };
          }
        }
      }
      return null;
    }
    /**
     * Transform 'uu' / 'ưu' pair with horn modifier (VNI 7 or Telex w)
     * - If already 'ưu', toggles back to plain 'uu'
     * - Otherwise transforms to 'ưu' (horn placed on the first 'u')
     * - Preserves any existing tone, placing it on the 'ư' (the nucleus)
     */
    applyUuHorn(word, pair) {
      const { index, c1, c2, info1, info2, isHorned } = pair;
      const isUpper1 = c1 === c1.toUpperCase() && c1 !== c1.toLowerCase();
      const isUpper2 = c2 === c2.toUpperCase() && c2 !== c2.toLowerCase();
      const tone = Math.max(info1.tone, info2.tone);
      if (isHorned) {
        const base1 = isUpper1 ? "U" : "u";
        const base2 = isUpper2 ? "U" : "u";
        const char1 = VOWEL_TABLE[base1][tone];
        const char2 = VOWEL_TABLE[base2][0];
        return {
          transformed: true,
          result: word.slice(0, index) + char1 + char2 + word.slice(index + 2) + "w"
        };
      } else {
        const base1 = isUpper1 ? "Ư" : "ư";
        const base2 = isUpper2 ? isUpper1 && isUpper2 ? "U" : "u" : "u";
        const char1 = VOWEL_TABLE[base1][tone];
        const char2 = VOWEL_TABLE[base2][0];
        return {
          transformed: true,
          result: word.slice(0, index) + char1 + char2 + word.slice(index + 2)
        };
      }
    }
    /**
     * Apply Telex 'w' transformation
     * Handles:
     * - uo + w / uow / duoc + w -> ươ (both vowels horned: được, nước, ước)
     * - ươ + w -> toggles back to uo
     * - uu + w / cuu + w -> ưu (first vowel horned: cưu, cứu, cừu)
     * - ưu + w -> toggles back to uu
     * - ow -> ơ, uw -> ư, aw -> ă
     * - Toggle: ơ + w -> o, ư + w -> u, ă + w -> a
     * - w at beginning or after consonant: produces ư
     * - ư + w -> toggles back to w
     */
    applyTelexW(word) {
      if (word.endsWith("w") || word.endsWith("W")) {
        return { transformed: false, result: word + "w" };
      }
      if (this.smartHorn !== false) {
        const uoPair = this.findUoPair(word);
        if (uoPair) {
          return this.applyUoHorn(word, uoPair);
        }
        const uuPair = this.findUuPair(word);
        if (uuPair) {
          return this.applyUuHorn(word, uuPair);
        }
      }
      if (word === "ư") return { transformed: true, result: "w" };
      if (word === "Ư") return { transformed: true, result: "W" };
      for (let i = word.length - 1; i >= 0; i--) {
        const char = word[i];
        const baseInfo = CHAR_TO_BASE_AND_TONE[char];
        if (baseInfo) {
          const lowerBase = baseInfo.base.toLowerCase();
          if (["a", "o", "u", "ă", "ơ", "ư"].includes(lowerBase)) {
            let target = SHAPE_MAP[baseInfo.base]?.horn;
            if (!target && ["a", "ă"].includes(lowerBase)) {
              target = SHAPE_MAP[baseInfo.base]?.breve;
            }
            if (target) {
              const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
              const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
              const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
              const appendLetter = ["ă", "ơ", "ư"].includes(lowerBase) ? "w" : "";
              const newWord = word.slice(0, i) + newChar + word.slice(i + 1) + appendLetter;
              if (this.phonologyRules && !appendLetter) {
                const parsedNew = parseSyllable(newWord);
                if (parsedNew && !parsedNew.isValid({ inProgress: true })) {
                  return { transformed: false, result: word + "w" };
                }
              }
              return {
                transformed: true,
                result: newWord
              };
            }
          }
        }
      }
      if (word.length === 0) {
        if (this.typeW2U !== false) {
          return { transformed: false, result: "w" };
        }
        return { transformed: true, result: "ư" };
      }
      const lastChar = word.slice(-1);
      const parsedWord = parseSyllable(word);
      const hasVowelNucleus = Boolean(parsedWord && parsedWord.nucleus);
      if (!hasVowelNucleus && /^[a-zA-ZđĐ]$/.test(lastChar) && !CHAR_TO_BASE_AND_TONE[lastChar] && lastChar.toLowerCase() !== "w") {
        const isUpper = lastChar === lastChar.toUpperCase();
        return {
          transformed: true,
          result: word + (isUpper ? "Ư" : "ư")
        };
      }
      return { transformed: false, result: word + "w" };
    }
    /**
     * Apply VNI shape modifier (6 = circumflex, 7 = horn, 8 = breve)
     */
    applyVniModifier(word, modifierType) {
      if (modifierType === "horn") {
        if (this.smartHorn !== false) {
          const uoPair = this.findUoPair(word);
          if (uoPair) {
            return this.applyUoHorn(word, uoPair);
          }
          const uuPair = this.findUuPair(word);
          if (uuPair) {
            return this.applyUuHorn(word, uuPair);
          }
        }
        for (let i = word.length - 1; i >= 0; i--) {
          const char = word[i];
          const baseInfo = CHAR_TO_BASE_AND_TONE[char];
          if (baseInfo) {
            const lowerBase = baseInfo.base.toLowerCase();
            if (["u", "ư", "o", "ơ"].includes(lowerBase)) {
              const target = SHAPE_MAP[baseInfo.base]?.horn;
              if (target) {
                const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
                const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
                const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
                if (["ư", "ơ"].includes(lowerBase)) {
                  return {
                    transformed: true,
                    result: word.slice(0, i) + newChar + word.slice(i + 1) + "7"
                  };
                }
                return {
                  transformed: true,
                  result: word.slice(0, i) + newChar + word.slice(i + 1)
                };
              }
            }
          }
        }
        return { transformed: false, result: word };
      }
      if (modifierType === "breve") {
        for (let i = word.length - 1; i >= 0; i--) {
          const char = word[i];
          const baseInfo = CHAR_TO_BASE_AND_TONE[char];
          if (baseInfo) {
            const lowerBase = baseInfo.base.toLowerCase();
            if (["a", "ă"].includes(lowerBase)) {
              const target = SHAPE_MAP[baseInfo.base]?.breve;
              if (target) {
                const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
                const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
                const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
                if (lowerBase === "ă") {
                  return {
                    transformed: true,
                    result: word.slice(0, i) + newChar + word.slice(i + 1) + "8"
                  };
                }
                return {
                  transformed: true,
                  result: word.slice(0, i) + newChar + word.slice(i + 1)
                };
              }
            }
          }
        }
        return { transformed: false, result: word };
      }
      if (modifierType === "circumflex") {
        for (let i = word.length - 1; i >= 0; i--) {
          const char = word[i];
          const baseInfo = CHAR_TO_BASE_AND_TONE[char];
          if (baseInfo) {
            const lowerBase = baseInfo.base.toLowerCase();
            const target = SHAPE_MAP[baseInfo.base]?.circumflex;
            if (target) {
              const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
              const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
              const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
              if (["â", "ê", "ô"].includes(lowerBase)) {
                return {
                  transformed: true,
                  result: word.slice(0, i) + newChar + word.slice(i + 1) + "6"
                };
              }
              return {
                transformed: true,
                result: word.slice(0, i) + newChar + word.slice(i + 1)
              };
            }
          }
        }
        return { transformed: false, result: word };
      }
      return { transformed: false, result: word };
    }
    /**
     * Tone transformation (Acute, Grave, Hook, Tilde, Dot, Remove)
     */
    checkTone(word, key) {
      if (!word) return { transformed: false, result: word + key };
      const lowerKey = key.toLowerCase();
      const toneMap = this.getToneForKey(key);
      if (toneMap === null) {
        return { transformed: false, result: word + key };
      }
      const vowelIndices = [];
      for (let i = 0; i < word.length; i++) {
        if (CHAR_TO_BASE_AND_TONE[word[i]]) {
          vowelIndices.push(i);
        }
      }
      if (vowelIndices.length === 0) {
        return { transformed: false, result: word + key };
      }
      let currentTone = 0;
      let currentToneIdx = -1;
      vowelIndices.forEach((idx) => {
        const tone = CHAR_TO_BASE_AND_TONE[word[idx]].tone;
        if (tone > 0) {
          currentTone = tone;
          currentToneIdx = idx;
        }
      });
      if (toneMap === 0) {
        if (currentTone > 0) {
          const cleaned = this.stripToneFromWord(word, vowelIndices);
          return { transformed: true, result: cleaned };
        }
        return { transformed: false, result: word + key };
      }
      if (this.phonologyRules && isCheckedToneViolation(word, toneMap)) {
        return { transformed: false, result: word + key };
      }
      if (this.phonologyRules && hasPhonologyViolation(word)) {
        return { transformed: false, result: word + key };
      }
      const targetVowelIdx = this.getTargetVowelIndex(word, vowelIndices);
      if (currentTone === toneMap) {
        const cleaned = this.stripToneFromWord(word, vowelIndices);
        const appendKey = key;
        const result = cleaned + appendKey;
        this.lastToneToggledWord = { base: result, key: lowerKey };
        this.toneCancelled = true;
        return { transformed: true, result };
      }
      if (this.lastToneToggledWord && this.lastToneToggledWord.base === word && this.lastToneToggledWord.key === lowerKey) {
        this.lastToneToggledWord = null;
        return { transformed: false, result: word + key };
      }
      this.lastToneToggledWord = null;
      const baseWord = this.stripToneFromWord(word, vowelIndices);
      const targetChar = baseWord[targetVowelIdx];
      const baseInfo = CHAR_TO_BASE_AND_TONE[targetChar];
      if (!baseInfo) return { transformed: false, result: word + key };
      let targetBase = baseInfo.base;
      const lastVowelIdx = vowelIndices[vowelIndices.length - 1];
      const hasFinalConsonant = lastVowelIdx < word.length - 1;
      if (targetBase.toLowerCase() === "e" && hasFinalConsonant && targetVowelIdx >= 2) {
        const preceding = baseWord.slice(targetVowelIdx - 2, targetVowelIdx).toLowerCase();
        if (preceding === "uy") {
          const isUpper = targetChar === targetChar.toUpperCase() && targetChar !== targetChar.toLowerCase();
          targetBase = isUpper ? "Ê" : "ê";
        }
      }
      const newChar = VOWEL_TABLE[targetBase][toneMap];
      const newWord = baseWord.slice(0, targetVowelIdx) + newChar + baseWord.slice(targetVowelIdx + 1);
      if (this.phonologyRules) {
        const parsedNew = parseSyllable(newWord);
        if (parsedNew && !parsedNew.isValid({ inProgress: true })) {
          return { transformed: false, result: word + key };
        }
      }
      if (this.spellCheck && !this.isValidVietnameseWord(newWord)) {
        const parsedNew = parseSyllable(newWord);
        const lowerN = parsedNew?.nucleus?.toLowerCase() || "";
        const lowerGV = ((parsedNew?.glide || "") + (parsedNew?.nucleus || "")).toLowerCase();
        const isIncompleteSyllable = parsedNew && (parsedNew.coda.length === 0 && (lowerN === "ă" || lowerN === "â" || lowerN === "oo" || lowerN === "uô" || lowerN === "iê" || lowerN === "ươ" || lowerN === "yê" || ["oa", "oe", "uy"].includes(lowerGV)) || parsedNew.coda.length > 0 && ["uo", "ie", "ye"].includes(lowerN));
        if (!isIncompleteSyllable) {
          return { transformed: false, result: word + key };
        }
      }
      return { transformed: true, result: newWord };
    }
    getToneForKey(key) {
      const method = this.getEffectiveMethod(key);
      const lowerKey = key.toLowerCase();
      if (method === IME_METHOD.TELEX) {
        switch (lowerKey) {
          case "s":
            return 1;
          // sắc
          case "f":
            return 2;
          // huyền
          case "r":
            return 3;
          // hỏi
          case "x":
            return 4;
          // ngã
          case "j":
            return 5;
          // nặng
          case "z":
            return 0;
          // xóa dấu
          default:
            return null;
        }
      }
      if (method === IME_METHOD.VNI) {
        switch (key) {
          case "1":
            return 1;
          case "2":
            return 2;
          case "3":
            return 3;
          case "4":
            return 4;
          case "5":
            return 5;
          case "0":
            return 0;
          default:
            return null;
        }
      }
      return null;
    }
    /**
     * Determine exact vowel index to receive tone
     * Modern vs Classic tone rules:
     * - Modern: hòa, thủy, khỏe, thỏa
     * - Classic: hoà, thuỷ, khoẻ, thoả
     */
    getTargetVowelIndex(word, vowelIndices) {
      if (vowelIndices.length === 1) {
        return vowelIndices[0];
      }
      let effectiveIndices = [...vowelIndices];
      const firstIdx = effectiveIndices[0];
      if (firstIdx > 0 && word.slice(firstIdx - 1, firstIdx + 1).toLowerCase() === "qu") {
        if (effectiveIndices.length > 1) {
          effectiveIndices = effectiveIndices.slice(1);
        }
      } else if (firstIdx > 0 && word.slice(firstIdx - 1, firstIdx + 1).toLowerCase() === "gi") {
        if (effectiveIndices.length > 1) {
          effectiveIndices = effectiveIndices.slice(1);
        }
      }
      if (effectiveIndices.length === 1) {
        return effectiveIndices[0];
      }
      const lastVowelIdx = effectiveIndices[effectiveIndices.length - 1];
      const hasFinalConsonant = lastVowelIdx < word.length - 1;
      if (hasFinalConsonant) {
        for (const idx of effectiveIndices) {
          const char = word[idx];
          const base = CHAR_TO_BASE_AND_TONE[char]?.base.toLowerCase();
          if (["ơ", "ê", "ô", "â", "ă"].includes(base)) {
            return idx;
          }
        }
        return effectiveIndices[effectiveIndices.length - 1];
      }
      if (effectiveIndices.length >= 3) {
        return effectiveIndices[1];
      }
      const v1 = CHAR_TO_BASE_AND_TONE[word[effectiveIndices[0]]]?.base.toLowerCase();
      const v2 = CHAR_TO_BASE_AND_TONE[word[effectiveIndices[1]]]?.base.toLowerCase();
      const cluster = v1 + v2;
      if (["uê", "uơ", "ue", "ươ", "oo"].includes(cluster)) {
        return effectiveIndices[1];
      }
      if (["ưa", "ưu", "ia", "ya", "ua"].includes(cluster)) {
        return effectiveIndices[0];
      }
      if (["oa", "oe", "uy"].includes(cluster)) {
        return this.toneStyle === TONE_STYLE.MODERN ? effectiveIndices[1] : effectiveIndices[0];
      }
      return effectiveIndices[0];
    }
    stripToneFromWord(word, vowelIndices) {
      const chars = word.split("");
      vowelIndices.forEach((idx) => {
        const baseInfo = CHAR_TO_BASE_AND_TONE[chars[idx]];
        if (baseInfo) {
          chars[idx] = VOWEL_TABLE[baseInfo.base][0];
        }
      });
      return chars.join("");
    }
    extractWordTone(vowelStr) {
      for (const char of vowelStr) {
        const tone = CHAR_TO_BASE_AND_TONE[char]?.tone;
        if (tone > 0) return tone;
      }
      return 0;
    }
    replaceWordVowels(vowelStr, newVowels, tone) {
      if (tone === 0) return newVowels;
      const baseFirst = newVowels[0];
      const rep = VOWEL_TABLE[baseFirst][tone] + newVowels.slice(1);
      return rep;
    }
    /**
     * Syllable spell check validator
     * Validates against built-in Hunspell Vietnamese dictionary (~6,700 words)
     * and user custom dictionary.
     */
    isValidVietnameseWord(word) {
      if (!word) return true;
      return checkWordSpelling(word);
    }
    /**
     * Word Rescue: Retroactively converts a raw keystroke word into its accented Vietnamese equivalent
     * (Ngó Sen / vnchKey innovation).
     * E.g. "tieengs" -> "tiếng", "vieetj" -> "việt", "nef" -> "nè", "Chaof" -> "Chào"
     * Preserves English words and user dictionary entries (linux, server, browser...).
     * @param {string} rawWord
     * @returns {string} Rescued Vietnamese word or original word if unchanged/foreign
     */
    rescueWord(rawWord) {
      if (!rawWord || typeof rawWord !== "string") return rawWord;
      const lower = rawWord.toLowerCase();
      if (COMMON_ENGLISH_WORDS.has(lower) || userDictionary.has(lower)) {
        return rawWord;
      }
      let acc = "";
      for (const ch of rawWord) {
        const res = this.processKey(acc, ch);
        acc = res.transformed ? res.result : acc + ch;
      }
      if (acc === rawWord) return rawWord;
      const hasVnDiacritics = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(acc);
      if (hasVnDiacritics || getVietnameseWordSet().has(acc.toLowerCase())) {
        return acc;
      }
      return rawWord;
    }
    /**
     * Text Rescue: Converts a sentence or phrase of raw words into accented Vietnamese
     * while preserving whitespace, punctuation, and English words.
     * E.g. "Chaof banj, tieengs vieetj nef" -> "Chào bạn, tiếng việt nè"
     * @param {string} text
     * @returns {string} Rescued text
     */
    rescueText(text) {
      if (!text || typeof text !== "string") return text;
      const tokens = text.split(/([\s\p{P}]+)/u);
      return tokens.map((tok) => {
        if (!tok || /^[\s\p{P}]+$/u.test(tok)) return tok;
        return this.rescueWord(tok);
      }).join("");
    }
    /**
     * Selection Accent Rescue:
     * Modifies, adds, or removes tone accents on an existing word or selected syllable.
     * (Ngó Sen / vnchKey innovation).
     * E.g.:
     *   "nhanh" + "s" -> "nhánh"
     *   "nhánh" + "f" -> "nhành"
     *   "nhánh" + "z" -> "nhanh" (remove tone)
     *   "hoa" + "r" -> "hoả" (or "hỏa" classic)
     *   "tieng" + "s" -> "tiếng"
     *   "nhanh" + "1" -> "nhánh"
     *   "nước" + "0" -> "nươc"
     * @param {string} word Current selected word
     * @param {string} key Incoming tone key ('s','f','r','x','j','z' in Telex, '1'-'5','0' in VNI)
     * @returns {string|null} Rescued word with updated tone, or null if key is not a tone modifier
     */
    applyAccentToSelection(word, key) {
      if (!word || !key || key.length !== 1) return null;
      const TONE_KEYS = {
        "s": TONE_MARK.ACUTE,
        "1": TONE_MARK.ACUTE,
        "f": TONE_MARK.GRAVE,
        "2": TONE_MARK.GRAVE,
        "r": TONE_MARK.HOOK_ABOVE,
        "3": TONE_MARK.HOOK_ABOVE,
        "x": TONE_MARK.TILDE,
        "4": TONE_MARK.TILDE,
        "j": TONE_MARK.DOT_BELOW,
        "5": TONE_MARK.DOT_BELOW,
        "z": TONE_MARK.NONE,
        "0": TONE_MARK.NONE
      };
      const lowerKey = key.toLowerCase();
      if (!(lowerKey in TONE_KEYS)) return null;
      const targetTone = TONE_KEYS[lowerKey];
      const parsed = parseSyllable(word);
      if (!parsed || !parsed.nucleus && !parsed.glide) return null;
      const lowerOnset = parsed.onset.toLowerCase();
      const lowerN = parsed.nucleus.toLowerCase();
      if (lowerOnset === "th" && lowerN === "uo" && !parsed.coda) {
        parsed.glide = "u";
        parsed.nucleus = "ơ";
      } else if (lowerOnset === "q" && lowerN === "uo" && parsed.coda.toLowerCase() === "n") {
        parsed.glide = "u";
        parsed.nucleus = "ơ";
      } else if (lowerOnset === "q" && (lowerN === "o" || lowerN === "uo") && !parsed.coda) {
        parsed.glide = "u";
        parsed.nucleus = "ơ";
      } else if (lowerOnset === "h" && lowerN === "uo" && !parsed.coda) {
        parsed.glide = "u";
        parsed.nucleus = "ơ";
      } else if (lowerN === "ie" && parsed.coda) {
        const isUpper = parsed.nucleus[1] === parsed.nucleus[1].toUpperCase();
        parsed.nucleus = parsed.nucleus[0] + (isUpper ? "Ê" : "ê");
      } else if (lowerN === "uo" && parsed.coda) {
        const isUpper0 = parsed.nucleus[0] === parsed.nucleus[0].toUpperCase();
        const isUpper1 = parsed.nucleus[1] === parsed.nucleus[1].toUpperCase();
        parsed.nucleus = (isUpper0 ? "Ư" : "ư") + (isUpper1 ? "Ơ" : "ơ");
      }
      return parsed.withTone(targetTone).reconstruct(this.toneStyle);
    }
  };

  // src/engine/macro.js
  var DEFAULT_MACROS = [
    { trigger: "tv", value: "Tiếng Việt", enabled: true },
    { trigger: "vn", value: "Việt Nam", enabled: true },
    { trigger: "hn", value: "Hà Nội", enabled: true },
    { trigger: "sg", value: "Sài Gòn", enabled: true },
    { trigger: "dc", value: "được", enabled: true },
    { trigger: "ko", value: "không", enabled: true },
    { trigger: "k", value: "không", enabled: false },
    // Disabled by default to prevent false positives on standalone 'K' (e.g. Vitamin K)
    { trigger: "ntn", value: "như thế nào", enabled: true },
    { trigger: "vs", value: "với", enabled: true },
    { trigger: "bt", value: "biết", enabled: true },
    { trigger: "cb", value: "chuẩn bị", enabled: true },
    { trigger: "dy", value: "đồng ý", enabled: true },
    { trigger: "tks", value: "cảm ơn", enabled: true },
    { trigger: "mst", value: "mã số thuế", enabled: true },
    { trigger: "sdt", value: "số điện thoại", enabled: true },
    { trigger: "zia", value: "dzìa", enabled: true },
    { trigger: "zi", value: "dzí", enabled: true },
    { trigger: "zo", value: "dzô", enabled: true },
    { trigger: "dm", value: "đụ má", enabled: true },
    { trigger: "dmm", value: "đụ má mày", enabled: true },
    { trigger: "ck", value: "chồng", enabled: true },
    { trigger: "cx", value: "cũng", enabled: true },
    { trigger: "idk", value: "tao hông biết", enabled: true },
    { trigger: "+today", value: "$DATE", enabled: true },
    { trigger: "+now", value: "$DATETIME", enabled: true },
    { trigger: "+cb", value: "$CLIPBOARD", enabled: true }
  ];
  var MacroEngine = class {
    constructor(macros = DEFAULT_MACROS, options = {}) {
      this.macros = /* @__PURE__ */ new Map();
      this.enabled = options.enabled ?? true;
      this.autoUndo = options.autoUndo ?? true;
      this.lastExpansion = null;
      this.suppressedTrigger = null;
      this.loadMacros(macros);
    }
    loadMacros(list) {
      this.macros.clear();
      if (Array.isArray(list)) {
        list.forEach((item) => {
          if (item && item.trigger) {
            this.macros.set(item.trigger.toLowerCase(), {
              trigger: item.trigger,
              value: item.value || "",
              enabled: item.enabled !== false
            });
          }
        });
      }
    }
    getMacros() {
      return Array.from(this.macros.values());
    }
    setMacro(trigger, value, enabled = true) {
      if (!trigger) return;
      this.macros.set(trigger.toLowerCase(), {
        trigger,
        value,
        enabled
      });
    }
    removeMacro(trigger) {
      if (!trigger) return;
      this.macros.delete(trigger.toLowerCase());
    }
    toggleMacro(trigger) {
      const existing = this.macros.get(trigger.toLowerCase());
      if (existing) {
        existing.enabled = !existing.enabled;
      }
    }
    /**
     * Check if a trigger word can expand upon encountering delimiter
     * @param {string} rawWord The typed word before delimiter (e.g. 'vn', 'VN', 'Vn')
     * @param {string} delimiter The character triggering expansion (e.g. ' ', '\n', '.')
     * @returns {{ match: boolean, expandedText?: string, rawTrigger?: string, delimiter?: string }}
     */
    checkExpansion(rawWord, delimiter, context = {}) {
      if (!this.enabled || !rawWord || !isDelimiter(delimiter)) {
        return { match: false };
      }
      const key = rawWord.toLowerCase();
      if (this.suppressedTrigger && this.suppressedTrigger.toLowerCase() === key) {
        this.suppressedTrigger = null;
        return { match: false, suppressed: true };
      }
      this.suppressedTrigger = null;
      const entry = this.macros.get(key);
      if (!entry || !entry.enabled) {
        return { match: false };
      }
      const needsClipboard = /\$CLIPBOARD\b/i.test(entry.value) && context.clipboardText === void 0;
      if (needsClipboard) {
        return {
          match: true,
          requiresClipboard: true,
          expandedText: entry.value,
          rawTrigger: rawWord,
          delimiter
        };
      }
      const expandedText = this._expandValue(rawWord, entry.value, context);
      this.lastExpansion = {
        rawTrigger: rawWord,
        expandedText,
        delimiter,
        step: 1,
        // Step 1: Trailing delimiter attached; Step 2: Trailing delimiter removed
        timestamp: Date.now()
      };
      return {
        match: true,
        expandedText,
        rawTrigger: rawWord,
        delimiter
      };
    }
    /**
     * Finalize an expansion that required asynchronous clipboard reading.
     * @param {{ rawTrigger: string, expandedText: string, delimiter: string }} expansion
     * @param {string} clipboardText
     * @returns {string}
     */
    finalizeClipboardExpansion(expansion, clipboardText = "") {
      const expandedText = this._expandValue(expansion.rawTrigger, expansion.expandedText, {
        clipboardText: clipboardText ?? ""
      });
      this.lastExpansion = {
        rawTrigger: expansion.rawTrigger,
        expandedText,
        delimiter: expansion.delimiter,
        step: 1,
        timestamp: Date.now()
      };
      return expandedText;
    }
    _expandValue(rawWord, templateValue, context = {}) {
      const hasClipboard = /\$CLIPBOARD\b/i.test(templateValue);
      if (!hasClipboard) {
        return this.preserveCase(rawWord, this.resolveDynamicVariables(templateValue, context));
      }
      const parts = templateValue.split(/(\$CLIPBOARD\b)/i);
      const clipboardText = context.clipboardText ?? "";
      return parts.map((part) => {
        if (/^\$CLIPBOARD$/i.test(part)) {
          return clipboardText;
        }
        return this.preserveCase(rawWord, this.resolveDynamicVariables(part, context));
      }).join("");
    }
    /**
     * Backtracking / 2-Step Undo:
     * When user presses Backspace following an expansion:
     * - Step 1 (first Backspace): Only delete the trailing space/delimiter, leaving caret at the end
     *   of expandedText (e.g. "Việt Nam " -> "Việt Nam|") so user can type punctuation or continue sentence.
     * - Step 2 (second consecutive Backspace): Revert the expanded word completely back to rawTrigger
     *   (e.g. "Việt Nam" -> "vn|"), and activate suppression so typing space next will keep rawTrigger intact!
     */
    checkUndo(recentText) {
      if (!this.autoUndo || !this.lastExpansion) {
        return { undo: false };
      }
      const { rawTrigger, expandedText, delimiter, step, timestamp } = this.lastExpansion;
      if (Date.now() - timestamp > 1e4) {
        this.lastExpansion = null;
        return { undo: false };
      }
      if (step === 1) {
        const expectedSuffix = expandedText + delimiter;
        if (recentText && recentText.endsWith(expectedSuffix)) {
          this.lastExpansion = {
            rawTrigger,
            expandedText,
            delimiter,
            step: 2,
            timestamp: Date.now()
          };
          return {
            undo: true,
            step: 1,
            rawTrigger,
            revertText: expandedText,
            removeLength: delimiter.length
            // Remove only the trailing delimiter
          };
        }
      }
      if (step === 2) {
        if (recentText && recentText.endsWith(expandedText)) {
          this.lastExpansion = null;
          this.suppressedTrigger = rawTrigger;
          return {
            undo: true,
            step: 2,
            rawTrigger,
            revertText: rawTrigger,
            removeLength: expandedText.length
          };
        }
      }
      return { undo: false };
    }
    /**
     * Smart Punctuation Snapping:
     * When macro just expanded with space (e.g. "Việt Nam "), if next key is a punctuation mark
     * (such as , . ; : ! ? ) ] } >), snap the punctuation directly to the end of expandedText
     * eliminating the unnatural trailing space (e.g. "Việt Nam, " or "Việt Nam.").
     * @param {string} nextKey Next key pressed by user
     * @param {string} recentText Text immediately before caret
     * @returns {{ snap: boolean, snappedText?: string, deleteLength?: number }}
     */
    checkPunctuationSnap(nextKey, recentText) {
      if (!this.lastExpansion || this.lastExpansion.step !== 1) {
        return { snap: false };
      }
      const { expandedText, delimiter, timestamp } = this.lastExpansion;
      if (Date.now() - timestamp > 8e3) {
        this.lastExpansion = null;
        return { snap: false };
      }
      if (delimiter !== " ") {
        return { snap: false };
      }
      const SNAPPABLE_PUNCTUATION = /* @__PURE__ */ new Set([",", ".", ";", ":", "!", "?", ")", "]", "}", ">"]);
      if (!SNAPPABLE_PUNCTUATION.has(nextKey)) {
        return { snap: false };
      }
      const expectedSuffix = expandedText + " ";
      if (recentText && recentText.endsWith(expectedSuffix)) {
        this.lastExpansion = null;
        return {
          snap: true,
          deleteLength: 1,
          // Remove the single trailing space
          snappedChar: nextKey
        };
      }
      return { snap: false };
    }
    /**
     * Resolve Dynamic Date, Time, and Clipboard variables in macro expansion
     * $DATE -> DD/MM/YYYY (e.g. 08/11/2026)
     * $TIME -> HH:mm (e.g. 08:45)
     * $DATETIME -> DD/MM/YYYY HH:mm
     * $YEAR -> YYYY
     * $CLIPBOARD -> current clipboard text (if provided in context)
     */
    resolveDynamicVariables(value, context = {}) {
      if (!value || typeof value !== "string" || !value.includes("$")) {
        return value;
      }
      const now = /* @__PURE__ */ new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const day = pad(now.getDate());
      const month = pad(now.getMonth() + 1);
      const year = String(now.getFullYear());
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());
      const dateStr = `${day}/${month}/${year}`;
      const vnDateStr = `${day}-${month}-${year}`;
      const isoDateStr = `${year}-${month}-${day}`;
      const weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
      const weekdayStr = weekdays[now.getDay()];
      const timeStr = `${hours}:${minutes}`;
      const dateTimeStr = `${dateStr} ${timeStr}`;
      let result = value.replace(/\$DATETIME\b/g, dateTimeStr).replace(/\$VN_DATE\b/g, vnDateStr).replace(/\$ISO_DATE\b/g, isoDateStr).replace(/\$WEEKDAY\b/g, weekdayStr).replace(/\$DATE\b/g, dateStr).replace(/\$TIME\b/g, timeStr).replace(/\$YEAR\b/g, year);
      if (context.clipboardText !== void 0) {
        result = result.replace(/\$CLIPBOARD\b/gi, context.clipboardText);
      }
      return result;
    }
    clearUndo() {
      this.lastExpansion = null;
      this.suppressedTrigger = null;
    }
    /**
     * Case preservation rules:
     * 1. all lowercase (vn) -> use value (Việt Nam or lowercase)
     * 2. ALL UPPERCASE (VN) -> transform value to UPPERCASE (VIỆT NAM)
     * 3. Capitalized first letter (Vn) -> capitalize first letter of value (Việt Nam)
     */
    preserveCase(rawWord, value) {
      if (!value || !rawWord) return value;
      const isAllUpper = rawWord === rawWord.toUpperCase() && rawWord !== rawWord.toLowerCase();
      if (isAllUpper) {
        return value.toUpperCase();
      }
      const isCapitalized = rawWord[0] === rawWord[0].toUpperCase() && rawWord[0] !== rawWord[0].toLowerCase();
      if (isCapitalized) {
        return value.charAt(0).toUpperCase() + value.slice(1);
      }
      return value;
    }
    /**
     * Export macros as JSON string
     */
    exportJSON() {
      return JSON.stringify(this.getMacros(), null, 2);
    }
    /**
     * Import macros from JSON string
     */
    importJSON(jsonString) {
      try {
        const data = JSON.parse(jsonString);
        if (Array.isArray(data)) {
          this.loadMacros(data);
          return { success: true, count: data.length };
        }
        return { success: false, error: "JSON root must be an array of macro objects." };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
    /**
     * Export macros as CSV string
     */
    exportCSV() {
      const rows = ["trigger,value,enabled"];
      for (const macro of this.getMacros()) {
        const escValue = `"${macro.value.replace(/"/g, '""')}"`;
        rows.push(`${macro.trigger},${escValue},${macro.enabled ? 1 : 0}`);
      }
      return rows.join("\n");
    }
    /**
     * Import macros from CSV string
     */
    importCSV(csvString) {
      try {
        const lines = csvString.trim().split(/\r?\n/);
        if (lines.length === 0) return { success: false, error: "Empty CSV file" };
        const newMacros = [];
        const startIndex = lines[0].toLowerCase().includes("trigger") ? 1 : 0;
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const parts = [];
          let inQuotes = false;
          let current = "";
          for (let c = 0; c < line.length; c++) {
            const char = line[c];
            if (char === '"') {
              if (inQuotes && line[c + 1] === '"') {
                current += '"';
                c++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === "," && !inQuotes) {
              parts.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          parts.push(current.trim());
          if (parts.length >= 2) {
            const trigger = parts[0];
            const value = parts[1];
            const enabled = parts.length > 2 ? parts[2] !== "0" && parts[2].toLowerCase() !== "false" : true;
            if (trigger) {
              newMacros.push({ trigger, value, enabled });
            }
          }
        }
        this.loadMacros(newMacros);
        return { success: true, count: newMacros.length };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
  };

  // src/engine/config.js
  var DEFAULT_SETTINGS = {
    method: 3,
    // 1: TELEX, 2: VNI, 3: AUTO, 0: OFF
    lastMethod: 3,
    // Memory of last non-off method (for toggle restore)
    toneStyle: "classic",
    // Kiểu truyền thống / cổ điển: hòa, hóa, thủy, khỏe
    macroEnabled: true,
    spellCheck: true,
    // Standardized default across all components
    autoUndo: true,
    ctrlToggleEnabled: true,
    quickConsonants: false,
    quickTelex: true,
    typeW2U: true,
    // vnchKey TypeW2U (Non-Start): 'w' acts as 'ư' after consonants / 'uw' / 'uow', but standalone initial 'w' stays English
    smartHorn: true,
    // vnchKey SmartHorn: intelligent horn placement on uo/uu/trio exception pairs
    emojiShortcuts: true,
    autoCapitalize: true,
    perDomainMemory: true,
    domainMethods: {},
    autoRestoreEnglish: true,
    escRevert: true,
    phonologyRules: true,
    wordRescue: true,
    autoCompleteEnabled: true,
    nextWordEnabled: true,
    suggestionStyle: "ribbon",
    // 'ribbon' | 'ghost_text'
    gboardLearningEnabled: true,
    autoHarmonizeCase: false,
    // Harmonize mixed Shift/CapsLock casing (ĐƯợc -> Được) (Default: false)
    eraseHabitLearning: true,
    // Auto-learn words to user dictionary after erasing accented words >= threshold times
    eraseHabitThreshold: 3,
    // Number of whole-word erasures before learning (configurable: 2 to 10, default: 3)
    debugTypingLog: false,
    blacklistedDomains: []
  };

  // src/content/dom-observer.js
  var DomObserver = class {
    constructor(options = {}) {
      this.blacklistedDomains = new Set(options.blacklistedDomains || []);
      this.disabledOnPassword = options.disabledOnPassword ?? true;
      this.disabledOnDataNoIme = options.disabledOnDataNoIme ?? true;
    }
    setBlacklistedDomains(domains) {
      this.blacklistedDomains = new Set(domains);
    }
    isCurrentDomainBlacklisted() {
      if (typeof window === "undefined" || !window.location) return false;
      const hostname = window.location.hostname.toLowerCase();
      const canvasHosts = [
        "docs.google.com",
        "sheets.google.com",
        "slides.google.com",
        "figma.com",
        "canva.com",
        "miro.com"
      ];
      for (const host of canvasHosts) {
        if (hostname === host || hostname.endsWith("." + host)) {
          return true;
        }
      }
      for (const domain of this.blacklistedDomains) {
        if (domain && (hostname === domain || hostname.endsWith("." + domain))) {
          return true;
        }
      }
      return false;
    }
    /**
     * Deeply resolve active focused element through Shadow DOM roots
     */
    getActiveElement(root = document) {
      let active = root.activeElement;
      while (active && active.shadowRoot && active.shadowRoot.activeElement) {
        active = active.shadowRoot.activeElement;
      }
      return active;
    }
    /**
     * Determine if the element is an editable target for Vietnamese IME & Macro
     */
    isEligibleTarget(element) {
      if (!element || !(element instanceof HTMLElement)) {
        return false;
      }
      if (this.isCurrentDomainBlacklisted()) {
        return false;
      }
      if (this.disabledOnDataNoIme && element.closest("[data-no-ime], [data-no-avim], .no-ime, .no-avim, .xterm-helper-textarea, .terminal-cursor")) {
        return false;
      }
      if (element.classList && (element.classList.contains("xterm-helper-textarea") || element.classList.contains("terminal-cursor"))) {
        return false;
      }
      if (element.hasAttribute("disabled") || element.hasAttribute("readonly")) {
        return false;
      }
      if (element instanceof HTMLInputElement) {
        const type = (element.type || "text").toLowerCase();
        const excludedTypes = ["password", "number", "email", "tel", "checkbox", "radio", "file", "button", "submit", "reset", "color", "date", "range"];
        if (excludedTypes.includes(type)) {
          return false;
        }
        return true;
      }
      if (element instanceof HTMLTextAreaElement) {
        return true;
      }
      if (element.isContentEditable || element.getAttribute("contenteditable") === "true" || element.getAttribute("role") === "textbox") {
        return true;
      }
      return false;
    }
  };

  // src/content/text-replacer.js
  var TextReplacer = class {
    /**
     * Detect if the current page/editor is Microsoft Teams Web (RoosterJS / CKEditor)
     * which requires ClipboardEvent('paste') to safely update its internal Content Model.
     */
    isTeamsEditor(root) {
      if (typeof window !== "undefined" && window.location) {
        const host = (window.location.hostname || "").toLowerCase();
        if (host === "teams.microsoft.com" || host.endsWith(".teams.microsoft.com") || host === "teams.live.com" || host.endsWith(".teams.live.com") || host === "teams.cloud.microsoft" || host.endsWith(".teams.cloud.microsoft")) {
          return true;
        }
      }
      if (root && typeof root.closest === "function") {
        if (root.closest('[data-tid*="ckeditor"], [data-tid*="message-pane-input"], .rooster-editor, .ck-editor__editable')) {
          return true;
        }
      }
      return false;
    }
    /**
     * Replace text in a native HTMLInputElement or HTMLTextAreaElement
     * @param {HTMLInputElement|HTMLTextAreaElement} el
     * @param {number} startIndex Start index of text to replace
     * @param {number} endIndex End index of text to replace
     * @param {string} replacement New replacement text
     */
    replaceInNativeInput(el, startIndex, endIndex, replacement) {
      const nfcReplacement = (replacement || "").normalize("NFC");
      const originalValue = el.value;
      const before = originalValue.slice(0, startIndex);
      const after = originalValue.slice(endIndex);
      const newValue = before + nfcReplacement + after;
      const newCaretPos = startIndex + nfcReplacement.length;
      if (typeof el.setRangeText === "function") {
        el.setRangeText(nfcReplacement, startIndex, endIndex, "end");
      } else {
        el.value = newValue;
        el.setSelectionRange(newCaretPos, newCaretPos);
      }
      el.selectionStart = newCaretPos;
      el.selectionEnd = newCaretPos;
      this.dispatchSyntheticInput(el, nfcReplacement);
    }
    /**
     * Replace text in a ContentEditable container (handles regular editors, ProseMirror, Lexical, and Teams RoosterJS)
     * @param {HTMLElement} root ContentEditable root
     * @param {string} oldText String to replace
     * @param {string} newText Replacement string
     */
    replaceInContentEditable(root, oldText, newText) {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const nfcNewText = (newText || "").normalize("NFC");
      const nfcOldText = (oldText || "").normalize("NFC");
      const isTeams = this.isTeamsEditor(root);
      if (!nfcOldText) {
        if (isTeams) {
          try {
            const host = root.closest?.('.ck-editor__editable, [data-tid*="ckeditor"], .rooster-editor') || root;
            const currentRange = sel.getRangeAt(0);
            let staticTarget;
            try {
              staticTarget = new StaticRange({
                startContainer: currentRange.startContainer,
                startOffset: currentRange.startOffset,
                endContainer: currentRange.endContainer,
                endOffset: currentRange.endOffset
              });
            } catch {
            }
            const beforeInputEv = new InputEvent("beforeinput", {
              inputType: "insertText",
              data: nfcNewText,
              bubbles: true,
              cancelable: true,
              composed: true,
              targetRanges: staticTarget ? [staticTarget] : []
            });
            if (!host.dispatchEvent(beforeInputEv)) {
              return;
            }
          } catch {
          }
        }
        try {
          if (document.execCommand("insertText", false, nfcNewText)) {
            const isLexical = root.hasAttribute?.("data-lexical-editor") || root.closest?.("[data-lexical-editor]");
            if (!isLexical && !isTeams) {
              this.dispatchSyntheticInput(root, nfcNewText);
            }
            return;
          }
        } catch {
        }
      }
      const range = sel.getRangeAt(0);
      let node = range.startContainer;
      let offset = range.startOffset;
      if (node.nodeType === Node.ELEMENT_NODE && node.childNodes.length > 0) {
        if (offset > 0 && node.childNodes[offset - 1]) {
          const prev = node.childNodes[offset - 1];
          if (prev.nodeType === Node.TEXT_NODE) {
            node = prev;
            offset = prev.textContent.length;
          } else if (prev.lastChild && prev.lastChild.nodeType === Node.TEXT_NODE) {
            node = prev.lastChild;
            offset = node.textContent.length;
          }
        } else if (node.childNodes[offset] && node.childNodes[offset].nodeType === Node.TEXT_NODE) {
          node = node.childNodes[offset];
          offset = 0;
        }
      }
      if (node && node.nodeType === Node.TEXT_NODE) {
        const rawText = node.textContent || "";
        const text = rawText.normalize("NFC");
        const textBeforeCursor = text.slice(0, offset);
        if (textBeforeCursor.endsWith(nfcOldText)) {
          const replaceStart = offset - nfcOldText.length;
          const newContent = text.slice(0, replaceStart) + nfcNewText + text.slice(offset);
          const replaceRange = document.createRange();
          replaceRange.setStart(node, replaceStart);
          replaceRange.setEnd(node, offset);
          if (isTeams) {
            try {
              const host = root.closest?.('.ck-editor__editable, [data-tid*="ckeditor"], .rooster-editor') || root;
              let head = 0;
              while (head < nfcOldText.length && head < nfcNewText.length && nfcOldText.charAt(head) === nfcNewText.charAt(head)) {
                head++;
              }
              const tailStart = replaceStart + head;
              const replacement = nfcNewText.slice(head);
              let staticTarget;
              try {
                staticTarget = new StaticRange({
                  startContainer: node,
                  startOffset: tailStart,
                  endContainer: node,
                  endOffset: offset
                });
              } catch {
              }
              const beforeInputEv = new InputEvent("beforeinput", {
                inputType: "insertText",
                data: replacement,
                bubbles: true,
                cancelable: true,
                composed: true,
                targetRanges: staticTarget ? [staticTarget] : []
              });
              const claimedByEditor = !host.dispatchEvent(beforeInputEv);
              if (claimedByEditor) {
                return;
              }
              sel.removeAllRanges();
              sel.addRange(replaceRange);
              if (document.execCommand("insertText", false, nfcNewText)) {
                return;
              }
            } catch {
            }
          }
          try {
            sel.removeAllRanges();
            sel.addRange(replaceRange);
            this.dispatchBeforeInput(root, nfcNewText, replaceRange);
            if (document.execCommand("insertText", false, nfcNewText)) {
              const isLexical = root.hasAttribute?.("data-lexical-editor") || root.closest?.("[data-lexical-editor]");
              if (!isLexical && !isTeams) {
                this.dispatchSyntheticInput(root, nfcNewText);
              }
              return;
            }
          } catch {
          }
          node.textContent = newContent;
          const newOffset = replaceStart + nfcNewText.length;
          const newRange2 = document.createRange();
          newRange2.setStart(node, Math.min(newOffset, newContent.length));
          newRange2.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange2);
          this.dispatchSyntheticInput(root, nfcNewText);
          return;
        }
      }
      const textNode = document.createTextNode(nfcNewText);
      range.deleteContents();
      range.insertNode(textNode);
      const newRange = document.createRange();
      newRange.setStart(textNode, textNode.length);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      this.dispatchSyntheticInput(root, nfcNewText);
    }
    /**
     * Dispatch synthetic beforeinput event for modern rich editors (TipTap / ProseMirror)
     */
    dispatchBeforeInput(element, insertedText, targetRange) {
      if (typeof InputEvent !== "function") return;
      try {
        const init = {
          bubbles: true,
          cancelable: true,
          inputType: "insertReplacementText",
          data: insertedText
        };
        if (targetRange && typeof InputEvent.prototype.getTargetRanges === "function") {
          init.targetRanges = [targetRange];
        }
        const beforeInputEvent = new InputEvent("beforeinput", init);
        element.dispatchEvent(beforeInputEvent);
      } catch {
      }
    }
    /**
     * Dispatch synthetic InputEvent and Event('change')
     */
    dispatchSyntheticInput(element, insertedText) {
      let inputEvent;
      try {
        inputEvent = new InputEvent("input", {
          bubbles: true,
          cancelable: true,
          inputType: "insertText",
          data: insertedText
        });
      } catch {
        inputEvent = document.createEvent("Event");
        inputEvent.initEvent("input", true, true);
      }
      element.dispatchEvent(inputEvent);
    }
    /**
     * Extract recent word buffer before caret from native input
     */
    extractNativeWordBuffer(el) {
      const pos = el.selectionStart ?? el.value.length;
      const value = el.value || "";
      const textBefore = value.slice(0, pos);
      const match = textBefore.match(/([\p{L}\p{N}'’]+)$/u);
      if (match) {
        let word = match[1];
        let startIndex = pos - word.length;
        if (/^['’]/.test(word) && !/^[A-Za-z]['’]/.test(word)) {
          word = word.slice(1);
          startIndex += 1;
        }
        return {
          word,
          startIndex,
          endIndex: pos
        };
      }
      return { word: "", startIndex: pos, endIndex: pos };
    }
    /**
     * Extract recent word buffer before caret from ContentEditable
     * Supports TEXT_NODE as well as ELEMENT_NODE containers (ProseMirror / TipTap)
     */
    extractContentEditableWordBuffer() {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return { word: "" };
      const range = sel.getRangeAt(0);
      let node = range.startContainer;
      let offset = range.startOffset;
      if (node.nodeType === Node.ELEMENT_NODE && node.childNodes.length > 0) {
        if (offset > 0 && node.childNodes[offset - 1]) {
          const prev = node.childNodes[offset - 1];
          if (prev.nodeType === Node.TEXT_NODE) {
            node = prev;
            offset = prev.textContent.length;
          } else if (prev.lastChild && prev.lastChild.nodeType === Node.TEXT_NODE) {
            node = prev.lastChild;
            offset = node.textContent.length;
          }
        } else if (node.childNodes[offset] && node.childNodes[offset].nodeType === Node.TEXT_NODE) {
          node = node.childNodes[offset];
          offset = 0;
        }
      }
      if (node && node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        const textBefore = text.slice(0, offset);
        const match = textBefore.match(/([\p{L}\p{N}'’]+)$/u);
        if (match) {
          let word = match[1];
          let startIndex = offset - word.length;
          if (/^['’]/.test(word) && !/^[A-Za-z]['’]/.test(word)) {
            word = word.slice(1);
            startIndex += 1;
          }
          return {
            word,
            textNode: node,
            startIndex,
            endIndex: offset
          };
        }
      }
      return { word: "" };
    }
  };

  // src/engine/emoji.js
  var EMOJI_MAP = {
    // Biểu cảm khuôn mặt / Feelings
    "tim": "❤️",
    "heart": "❤️",
    "traitim": "❤️",
    "yeu": "❤️",
    "cuoi": "😄",
    "smile": "😄",
    "happy": "😊",
    "matcuoi": "😊",
    "haha": "😆",
    "lol": "😂",
    "roinuocmat": "😂",
    "kaka": "🤣",
    "buon": "😢",
    "sad": "😢",
    "khoc": "😭",
    "cry": "😭",
    "ngau": "😎",
    "cool": "😎",
    "kinhram": "😎",
    "hon": "😘",
    "kiss": "😘",
    "yeuthuong": "🥰",
    "suynghi": "🤔",
    "think": "🤔",
    "ngaunhien": "🤯",
    "wow": "😮",
    "tucgian": "😡",
    "angry": "😡",
    "ngu": "😴",
    "sleep": "😴",
    "nhaymat": "😉",
    "wink": "😉",
    // Cử chỉ tay / Gestures
    "like": "👍",
    "1": "👍",
    "thich": "👍",
    "up": "👍",
    "dislike": "👎",
    "che": "👎",
    "down": "👎",
    "ok": "👌",
    "tot": "👌",
    "votay": "👏",
    "clap": "👏",
    "cau": "🙏",
    "pray": "🙏",
    "xin": "🙏",
    "camon": "🙏",
    "vui": "✌️",
    "peace": "✌️",
    "namdam": "👊",
    "fist": "👊",
    "chao": "👋",
    "wave": "👋",
    "co": "💪",
    "strong": "💪",
    "chiton": "👉",
    "point": "👉",
    // Biểu tượng & Đồ vật / Symbols & Objects
    "lua": "🔥",
    "fire": "🔥",
    "hot": "🔥",
    "sao": "⭐",
    "star": "⭐",
    "100": "💯",
    "diem100": "💯",
    "check": "✅",
    "tich": "✅",
    "done": "✅",
    "x": "❌",
    "cross": "❌",
    "sai": "❌",
    "party": "🎉",
    "tiec": "🎉",
    "chucmung": "🎉",
    "mattrang": "🌙",
    "moon": "🌙",
    "mattroi": "☀️",
    "sun": "☀️",
    "set": "⚡",
    "flash": "⚡",
    "quatang": "🎁",
    "gift": "🎁",
    "tien": "💵",
    "money": "💵",
    "bongda": "⚽",
    "football": "⚽",
    "caidat": "⚙️",
    "gear": "⚙️",
    "khoa": "🔒",
    "lock": "🔒",
    "chuong": "🔔",
    "bell": "🔔",
    "canhbao": "⚠️",
    "warning": "⚠️",
    "coffee": "☕",
    "cafe": "☕",
    "bia": "🍺",
    "beer": "🍺",
    "vietnam": "🇻🇳",
    "vn": "🇻🇳",
    "covietnam": "🇻🇳"
  };
  function checkEmojiShortcut(token) {
    if (!token || typeof token !== "string") return { match: false };
    const clean = token.trim();
    if (clean.length >= 3 && clean.startsWith(":") && clean.endsWith(":")) {
      const code = clean.slice(1, -1).toLowerCase();
      if (EMOJI_MAP[code]) {
        return { match: true, emoji: EMOJI_MAP[code], code };
      }
    }
    return { match: false };
  }
  function getEmojiSuggestions(query, limit = 4) {
    if (!query || !query.startsWith(":")) return [];
    const prefix = query.slice(1).toLowerCase();
    const results = [];
    const seenEmojis = /* @__PURE__ */ new Set();
    for (const [code, emoji] of Object.entries(EMOJI_MAP)) {
      if (seenEmojis.has(emoji)) continue;
      if (code.startsWith(prefix) || prefix.length === 0) {
        results.push({
          word: emoji,
          code: `:${code}:`,
          displayType: `:${code}:`,
          type: "emoji",
          emoji
        });
        seenEmojis.add(emoji);
        if (results.length >= limit) break;
      }
    }
    return results;
  }

  // src/engine/autocomplete.js
  function stripVietnameseAccents(str) {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  }
  var COMMON_VIETNAMESE_COMPOUNDS = [
    // Công nghệ, máy tính, tin học
    "nghiên cứu",
    "công nghệ",
    "thông tin",
    "trí tuệ nhân tạo",
    "lập trình",
    "phần mềm",
    "phần cứng",
    "ứng dụng",
    "trình duyệt",
    "tiện ích",
    "mở rộng",
    "dữ liệu",
    "mạng máy tính",
    "hệ điều hành",
    "bảo mật",
    "an toàn",
    "mật khẩu",
    "tài khoản",
    "đăng nhập",
    "đăng ký",
    "giao diện",
    "trực tuyến",
    "tải xuống",
    "cài đặt",
    "kết nối",
    "máy chủ",
    "trang web",
    "cơ sở dữ liệu",
    "thiết bị",
    "điện tử",
    "trực quan",
    "tối ưu hóa",
    "tự động",
    "thuật toán",
    "hệ thống",
    "phiên bản",
    "cập nhật",
    "nâng cấp",
    "bộ nhớ",
    "tốc độ",
    "dung lượng",
    "xử lý",
    "thực thi",
    "kiểm thử",
    "khởi động",
    "chuyển đổi",
    // Y tế, sức khỏe & cấp cứu
    "cấp cứu",
    "bác sĩ",
    "bệnh viện",
    "y tế",
    "sức khỏe",
    "khám bệnh",
    "chữa bệnh",
    "thuốc tây",
    "dược phẩm",
    "điều trị",
    "chăm sóc",
    "bảo hiểm",
    "phòng khám",
    "y tá",
    "dược sĩ",
    "hồi sức",
    "cứu hộ",
    "cứu nạn",
    "cứu thương",
    "khẩn cấp",
    "sơ cứu",
    "chẩn đoán",
    "xét nghiệm",
    "phục hồi",
    // Đời sống, gia đình, xã hội
    "gia đình",
    "bạn bè",
    "cha mẹ",
    "anh em",
    "đồng nghiệp",
    "hạnh phúc",
    "vui vẻ",
    "may mắn",
    "bình an",
    "thành công",
    "yêu thương",
    "cuộc sống",
    "con người",
    "xã hội",
    "văn hóa",
    "truyền thống",
    "hiện đại",
    "lịch sử",
    "đất nước",
    "thành phố",
    "việt nam",
    "quốc tế",
    "thế giới",
    "môi trường",
    "thiên nhiên",
    "thời tiết",
    "khí hậu",
    "buổi sáng",
    "buổi trưa",
    "buổi chiều",
    "buổi tối",
    "hôm nay",
    "ngày mai",
    "hôm qua",
    "tuần này",
    "tháng này",
    "năm nay",
    "tương lai",
    "quá khứ",
    // Công việc, kinh tế, quản lý
    "phát triển",
    "quản lý",
    "kinh doanh",
    "doanh nghiệp",
    "công ty",
    "khách hàng",
    "hợp đồng",
    "kinh tế",
    "thương mại",
    "dịch vụ",
    "sản phẩm",
    "thị trường",
    "tiêu dùng",
    "thương hiệu",
    "uy tín",
    "chất lượng",
    "hiệu quả",
    "tiến độ",
    "kế hoạch",
    "dự án",
    "báo cáo",
    "đánh giá",
    "thảo luận",
    "hội nghị",
    "cuộc họp",
    "đề xuất",
    "giải pháp",
    "ý tưởng",
    "sáng tạo",
    "đổi mới",
    "thành lập",
    "hợp tác",
    "đầu tư",
    "tài chính",
    "ngân hàng",
    "chi phí",
    "doanh thu",
    "lợi nhuận",
    "nhiệm vụ",
    "trách nhiệm",
    "mục tiêu",
    "kết quả",
    "thành tựu",
    "kinh nghiệm",
    "chuyên môn",
    // Giáo dục, học tập, khoa học
    "giáo dục",
    "học tập",
    "học sinh",
    "sinh viên",
    "giáo viên",
    "thầy cô",
    "trường học",
    "đại học",
    "kiến thức",
    "kỹ năng",
    "bài tập",
    "kiểm tra",
    "kỳ thi",
    "tốt nghiệp",
    "bằng cấp",
    "khoa học",
    "toán học",
    "vật lý",
    "hóa học",
    "sinh học",
    "địa lý",
    "ngôn ngữ",
    "tiếng việt",
    "tiếng anh",
    "ngoại ngữ",
    "sách báo",
    "tài liệu",
    "thư viện",
    "hội thảo",
    "nghiên cứu sinh",
    // Giao tiếp & Hành động thường ngày
    "xin chào",
    "cảm ơn",
    "xin lỗi",
    "tạm biệt",
    "hẹn gặp lại",
    "chúc mừng",
    "làm phiền",
    "giúp đỡ",
    "hỗ trợ",
    "liên hệ",
    "thông báo",
    "yêu cầu",
    "hướng dẫn",
    "sử dụng",
    "thực hiện",
    "hoàn thành",
    "bắt đầu",
    "kết thúc",
    "tiếp tục",
    "dừng lại",
    "quan trọng",
    "cần thiết",
    "đặc biệt",
    "phổ biến",
    "tuyệt vời",
    "xuất sắc",
    "hài lòng",
    "yên tâm",
    "tin tưởng",
    "hy vọng",
    "quyết định",
    "lựa chọn",
    "thay đổi",
    "cải tiến",
    "khắc phục",
    "giải quyết",
    // Địa danh Tây Nguyên & Dân tộc thiểu số
    "Đắk Lắk",
    "Đắk Nông",
    "Kon Tum",
    "Gia Lai",
    "Lâm Đồng",
    "Buôn Ma Thuột",
    "Pleiku",
    "Bảo Lộc",
    "Đà Lạt",
    "A Yun Pa",
    "Krông Nô",
    "Krông Búk",
    "Krông Pắk",
    "Krông Ana",
    "Krông Bông",
    "Krông Năng",
    "Krông A",
    "Cư M'gar",
    "Cư Kuin",
    "Ea H'leo",
    "Ea Kar",
    "Ea Súp",
    "M'Đrắk",
    "Đắk Mil",
    "Đắk Song",
    "Đắk Glong",
    "Đắk Tô",
    "Đắk Hà",
    "Đắk Đoa",
    "Chư Sê",
    "Chư Prông",
    "Chư Păh",
    "Đức Cơ",
    "Ia Grai",
    "Ia H'Drai",
    "Sa Thầy",
    "Ngọc Hồi",
    "Tu Mơ Rông",
    "Đơn Dương",
    "Đam Rông",
    "Lạc Dương",
    "Di Linh",
    "Bảo Lâm",
    "Cát Tiên",
    "Đắk R'lấp",
    "Tà Nung",
    "Ô Loan",
    // Địa danh Bắc - Trung - Nam phổ biến
    "Hà Nội",
    "Hải Phòng",
    "Quảng Ninh",
    "Hạ Long",
    "Sa Pa",
    "Mộc Châu",
    "Huế",
    "Đà Nẵng",
    "Hội An",
    "Quy Nhơn",
    "Nha Trang",
    "Phan Thiết",
    "Quảng Ngãi",
    "Tam Kỳ",
    "Đông Hà",
    "Vinh",
    "Sài Gòn",
    "Chợ Lớn",
    "Gia Định",
    "Đa Kao",
    "Tân Định",
    "Bến Thành",
    "Bình Thạnh",
    "Phú Nhuận",
    "Gò Vấp",
    "Thủ Đức",
    "Thủ Thiêm",
    "Cần Thơ",
    "Vũng Tàu",
    "Biên Hòa",
    "Mỹ Tho",
    "Tân An",
    "Gò Công",
    "Bến Tre",
    "Vĩnh Long",
    "Sa Đéc",
    "Long Xuyên",
    "Châu Đốc",
    "Rạch Giá",
    "Hà Tiên",
    "Cà Mau",
    "Bạc Liêu",
    "Sóc Trăng",
    "Trà Vinh",
    "Vị Thanh",
    // Cụm từ Hán-Việt & từ hiếm
    "khuếch tán",
    "khuynh hướng",
    "ngoắt ngoéo",
    "khuấy động",
    // ── Thành ngữ, tiếng lóng & từ ngữ Sài Gòn xưa / Nam Bộ (Nguyễn Cao Trường) ──
    "bá cháy bù chét",
    "bá láp bá xàm",
    "ba la ba xạo",
    "ba xạo ba kép",
    "bà chằn lửa",
    "bảnh tỏn",
    "bật ngửa",
    "bình thủy",
    "bùng binh",
    "buồn xo",
    "cà chớn",
    "cà cháo",
    "cà chác",
    "cà chớn cà cháo",
    "cà chớn cà chác",
    "cà rịch cà tang",
    "cà nhỏng cà nhỏng",
    "cà tàng",
    "cà giựt",
    "cà kheo",
    "chùm hum",
    "cù lần",
    "cù lần lữa",
    "cứng đầu cứng cổ",
    "dằn mặt",
    "dễ ngươi",
    "đò Thủ Thiêm",
    "hạp gu",
    "hết bài",
    "hết biết",
    "hết sẩy",
    "hết xẩy",
    "hết xí quách",
    "hết ga hết số",
    "hổng chừng",
    "hổng có chi",
    "hổng dám đâu",
    "hút gió",
    "làm nư",
    "láng cháng",
    "lết bánh",
    "mèn ơi",
    "mèn đéc ơi",
    "mưa thúi đất",
    "ngon lành cành đào",
    "quá mạng",
    "quá xá",
    "quỉ tha ma bắt",
    "rề rà",
    "rần rần",
    "sang cả",
    "say xỉn",
    "số dzách",
    "sương sương",
    "sức mấy",
    "táng mạng",
    "tào lao mía lao",
    "tào lao chi địa",
    "té re",
    "tém tém",
    "thầy Hai",
    "thầy thợ",
    "thọc cù lét",
    "thọc lét",
    "thềm ba",
    "tía má",
    "tía lia",
    "trắng xác",
    "trời đánh thánh đâm",
    "trời thần ơi",
    "trớt quớt",
    "trùm sò",
    "trúng mánh",
    "trúng mối",
    "trúng tủ",
    "vắt giò lên cổ",
    "vô phương",
    "xá xị",
    "xe lam",
    "xe thổ mộ",
    "xe đò",
    "xe lôi",
    "xập xám",
    "xề xòa",
    "xì dầu",
    "xí gạt",
    "xí mụi",
    // ── Từ vựng đời sống & phương ngữ Nam Bộ thân thương ──
    "bữa nay",
    "hổm rày",
    "hồi nãy",
    "chút xíu",
    "bao đồng",
    "chánh trực",
    "thiệt tình",
    "bảnh bao",
    "ngộ nghĩnh",
    "tài lanh",
    "lanh chanh",
    "xởi lởi",
    "điệu đàng",
    "coi bộ",
    "ngộ á nghen",
    "ngon ơ",
    "ngọt xớt",
    "bạc mạng",
    "bảnh chọe",
    "bạc đãi",
    "chơn chất",
    "chắc mẻm",
    "cưng xỉu",
    "dễ thương",
    "đàng hoàng",
    "đứng bóng",
    "hết trơn",
    "hết trọi",
    "lẹ làng",
    "lẹ lẹ",
    "lóng rày",
    "mau lẹ",
    "mần ăn",
    "miệt vườn",
    "nắng nôi",
    "ngộ nghê",
    "nhứt xứ",
    "nhàn tản",
    "phẻ re",
    "rảnh rang",
    "rôm rả",
    "sốt sắng",
    "thong thả",
    "thảnh thơi",
    "thơm tho",
    "tề chỉnh",
    "tươi rói",
    "vui vẻ",
    "xởi lởi",
    "xôm tụ",
    // ── Từ vựng giao tiếp công việc & nghề nghiệp lịch thiệp ──
    "kính gởi",
    "kính gửi",
    "trân trọng",
    "cảm phiền",
    "nhờ bạn",
    "gửi bạn",
    "gởi bạn",
    "biên bản",
    "thống nhất",
    "tiến độ",
    "thời hạn",
    "đính kèm",
    "hợp tác",
    "trao đổi",
    "báo cáo",
    "phản hồi"
  ];
  var RAW_VIETNAMESE_BIGRAMS = {
    // ── Quốc gia / dân tộc / địa danh ──
    "việt": ["nam", "cộng", "kiều", "trì", "dã", "vị", "hóa"],
    "cộng": ["hòa", "sản", "đồng", "tác", "sự", "hưởng"],
    "quốc": ["tế", "gia", "tịch", "phòng", "hội"],
    "thế": ["giới", "kỷ", "hệ", "lực", "nào"],
    "đất": ["nước", "đai", "sét", "vàng"],
    "đắk": ["lắk", "nông", "mil", "song", "glong", "tô", "hà", "đoa", "r'lấp"],
    "buôn": ["ma thuột", "mê thuột", "làng", "bán"],
    "krông": ["nô", "búk", "pắk", "ana", "bông", "năng", "a"],
    "kon": ["tum", "plông"],
    "gia": ["lai", "đình", "nhập", "tăng", "công", "dụng"],
    "lâm": ["đồng", "nghiệp", "thao", "chung"],
    "đà": ["lạt", "nẵng"],
    "bảo": ["lộc", "lâm", "mật", "hiểm", "vệ", "quản", "trì", "hộ", "an"],
    "hà": ["nội", "tĩnh", "nam", "giang", "tiên"],
    "hải": ["phòng", "dương", "sản", "quân", "ngoại"],
    "sài": ["gòn"],
    "hạ": ["long", "tầng", "cánh", "bệ"],
    "nha": ["trang", "khoa", "học"],
    "phan": ["thiết", "rang"],
    "bến": ["tre", "xe", "tàu", "đỗ", "ninh kiều", "nghé"],
    "rạch": ["giá"],
    "cà": ["mau", "phê", "chua", "pháo", "chớn", "rịch", "nhổng", "tàng", "giựt", "kheo", "cháo", "chác"],
    "bạc": ["liêu", "trắng", "bẽo", "đầu"],
    "sóc": ["trăng", "sơn"],
    "chư": ["sê", "prông", "păh"],
    "ea": ["h'leo", "kar", "súp"],
    "cư": ["m'gar", "kuin", "trú", "dân", "xử"],
    "ia": ["grai", "h'drai"],
    "khuếch": ["tán", "đại"],
    "khuynh": ["hướng", "đảo"],
    // ── Công nghệ / công việc / kinh doanh ──
    "công": ["nghệ", "ty", "việc", "nhân", "trình", "an", "cộng", "dân"],
    "thông": ["tin", "báo", "minh", "qua", "dịch", "thường", "thoáng"],
    "trí": ["tuệ", "nhớ", "thức", "não", "tưởng"],
    "phát": ["triển", "hiện", "hành", "huy", "sinh", "động"],
    "kinh": ["tế", "doanh", "nghiệm", "phí", "khủng"],
    "doanh": ["nghiệp", "thu", "trại"],
    "sản": ["phẩm", "xuất", "sinh", "khoa"],
    "thị": ["trường", "xã", "hiếu", "thực"],
    "chi": ["phí", "nhánh", "tiết", "tiêu", "viện"],
    "lợi": ["nhuận", "ích", "thế", "dụng"],
    "nhiệm": ["vụ", "kỳ"],
    "trách": ["nhiệm", "mắng", "cứ"],
    "hợp": ["đồng", "tác", "nhất", "pháp", "lý", "thời"],
    "máy": ["tính", "chủ", "bay", "móc", "in", "giặt"],
    "hệ": ["thống", "điều hành", "sinh thái", "số", "tư tưởng"],
    "trang": ["web", "bị", "chủ", "trí", "điểm"],
    "dữ": ["liệu", "dội", "kiện"],
    "kiểm": ["tra", "thử", "soát", "toán", "định"],
    "khách": ["hàng", "sạn", "quan", "thể"],
    "mật": ["khẩu", "mã", "thiết", "độ", "vụ"],
    "tài": ["khoản", "chính", "năng", "lanh", "liệu", "sản", "xế"],
    "đăng": ["nhập", "ký", "tải", "quang", "cai", "xuất"],
    "giao": ["diện", "tiếp", "dịch", "thông", "hàng", "kết"],
    "trực": ["tuyến", "quan", "tiếp", "thuộc"],
    "tải": ["xuống", "lên", "trọng", "bản"],
    "cài": ["đặt", "then", "cắm", "bẫy"],
    "khởi": ["động", "sự", "nghiệp", "đầu"],
    "kết": ["quả", "nối", "hợp", "thúc", "luận", "cấu", "tinh"],
    "thực": ["hiện", "tế", "thi", "hành", "tập", "phẩm", "chất"],
    "giải": ["pháp", "quyết", "thích", "trí", "thưởng", "tỏa"],
    "quan": ["trọng", "tâm", "hệ", "điểm", "sát", "chức"],
    "tối": ["ưu", "nay", "qua", "đa", "thiểu", "mật"],
    // ── Thời gian ──
    "thời": ["gian", "tiết", "khắc", "đại", "kỳ", "vụ"],
    "hôm": ["nay", "qua", "kia", "trước"],
    "ngày": ["mai", "kia", "tháng", "đêm", "sinh", "công", "hôm", "nay"],
    "tuần": ["này", "sau", "trước", "tới"],
    "tháng": ["này", "sau", "trước", "tới", "mười"],
    "năm": ["nay", "sau", "ngoái", "trước"],
    "giờ": ["này", "đây", "rồi", "chưa"],
    "phút": ["trước", "sau", "nữa"],
    "giây": ["nữa", "trước"],
    // ── Gia đình / quan hệ xã hội ──
    "bạn": ["bè", "thân", "đọc", "gái", "trai", "hàng"],
    "tôi": ["nghĩ", "thấy", "muốn", "là", "đang", "đã", "sẽ", "biết"],
    "anh": ["em", "ấy", "chị", "ta", "trai", "yêu", "hai", "ba", "tư"],
    "chị": ["em", "ấy", "gái"],
    "em": ["gái", "trai", "út", "yêu"],
    "chúng": ["tôi", "ta", "nó", "mình"],
    "mọi": ["người", "thứ", "lúc", "nơi"],
    // ── Y tế / sức khỏe ──
    "bệnh": ["viện", "nhân", "tật", "án"],
    "bác": ["sĩ", "học", "ái"],
    "y": ["tế", "tá", "khoa", "học"],
    "hồi": ["sức", "phục", "nãy", "đó", "xưa", "chuông", "âm", "đáp", "hương"],
    "cứu": ["hộ", "nạn", "thương", "tế", "giúp", "chữa"],
    "sơ": ["cứu", "khai", "đồ", "đẳng", "tuyển"],
    "chẩn": ["đoán", "trị"],
    "xét": ["nghiệm", "duyệt", "xử", "lại"],
    "phòng": ["khám", "ngừa", "chống", "ngủ", "bệnh", "ban"],
    "sức": ["mấy", "khỏe", "mạnh", "lực", "hút", "sống", "ép"],
    // ── Giáo dục / trường học ──
    "học": ["tập", "sinh", "hỏi", "hành", "viện", "phí", "bổng"],
    "sinh": ["viên", "hoạt", "sống", "sản", "học", "nhật"],
    "nghiên": ["cứu"],
    "cấp": ["cứu", "bậc", "cao", "nhật", "phép", "trên"],
    "giáo": ["viên", "dục", "trình", "án", "sư"],
    "trường": ["học", "đại học", "hợp", "ca", "kỳ"],
    "đại": ["học", "biểu", "diện", "gia", "đồng"],
    "kỹ": ["năng", "thuật", "xảo", "sư"],
    "ngoại": ["ngữ", "giao", "ô", "tệ", "thương"],
    "văn": ["hóa", "bản", "học", "phòng", "minh"],
    "lịch": ["sử", "trình", "thiệp", "sự"],
    "bắt": ["đầu", "buộc", "tay", "chước", "kịp"],
    "tiếp": ["tục", "theo", "cận", "nhận", "thị", "xúc"],
    "hoàn": ["thành", "toàn", "hảo", "trả", "vốn", "lương"],
    "an": ["toàn", "ninh", "tâm", "cư", "dưỡng"],
    // ── Giao tiếp / chat / xã giao ──
    "xin": ["chào", "lỗi", "phép", "mời", "hỏi", "cảm ơn"],
    "cảm": ["ơn", "phiền", "thấy", "giác", "nghĩ", "nhận", "xúc", "kích"],
    "chúc": ["mừng", "ngủ ngon", "thành công", "bạn", "anh", "chị", "em"],
    "hẹn": ["gặp lại", "ước", "ngày", "giờ", "gặp"],
    "tạm": ["biệt", "thời", "ngưng"],
    "làm": ["việc", "phiền", "nư", "ơn", "quen", "sao", "lại", "gì", "xong", "bài", "hư"],
    "tuyệt": ["vời", "đối", "mật", "chủng", "vọng"],
    "thành": ["phố", "công", "viên", "lập", "tựu", "phần"],
    "ý": ["tưởng", "nghĩa", "kiến", "thức", "chí"],
    "đổi": ["mới", "thay", "trả", "gác"],
    // ── Động từ / hành động thường dùng ──
    "đi": ["làm", "học", "chơi", "về", "ngủ", "đâu"],
    "về": ["nhà", "đâu", "việc", "vấn đề"],
    "đến": ["nơi", "lúc", "đây", "gặp"],
    "ở": ["đâu", "đây", "đó", "nhà", "trường", "chỗ làm"],
    "có": ["thể", "phải", "không", "được", "nhiều"],
    "không": ["có", "thể", "phải", "được", "sao", "biết"],
    "được": ["biết", "chọn", "xem", "hưởng", "rồi", "không", "lắm", "chứ"],
    "phải": ["chăng", "làm", "đi", "nói"],
    "muốn": ["nói", "làm", "biết", "đi", "xem"],
    "biết": ["ơn", "trước", "điều", "gì"],
    "nói": ["chuyện", "rằng", "lời", "thật"],
    "nghe": ["nói", "thấy", "nhạc", "lời"],
    "nhìn": ["thấy", "lại", "nhận", "ngắm"],
    "yêu": ["thương", "quý", "thích", "cầu"],
    "tin": ["tưởng", "tức", "nhắn", "học", "người", "ai"],
    "hy": ["vọng"],
    "quyết": ["định", "đoán", "tâm", "liệt"],
    "lựa": ["chọn", "lọc"],
    "hài": ["lòng", "hòa", "hước", "thiệt"],
    "yên": ["tâm", "tĩnh", "lặng", "ổn"],
    "phúc": ["hậu", "phần", "đức", "đáp"],
    "ăn": ["uống", "nhậu", "sáng", "trưa", "chiều", "tối", "khuya", "sang", "dơ", "tạp", "dày", "bẩn"],
    // ── Văn phòng / Email / Giao tiếp công sở ──
    "kính": ["gửi", "gởi", "chào", "mong", "báo"],
    "trân": ["trọng", "quý"],
    "đính": ["kèm", "chính", "vào"],
    "thân": ["gửi", "mến", "thiện", "ái"],
    "phản": ["hồi", "ánh", "chiếu", "tác dụng"],
    "tiến": ["độ", "hành", "bộ", "triển"],
    "báo": ["cáo", "chí", "động", "thức"],
    "biên": ["bản", "tập", "soạn", "chế"],
    "thống": ["nhất", "kê", "trị", "soái"],
    "trao": ["đổi", "tay", "tặng", "giải"],
    // ── Từ nối / đại từ / trợ động từ (bổ sung mới) ──
    "của": ["tôi", "bạn", "chúng", "nó", "những", "các"],
    "là": ["gì", "một", "người", "cái", "sự"],
    "cho": ["tôi", "bạn", "phép", "nên", "với"],
    "với": ["tôi", "bạn", "nhau", "các", "họ"],
    "như": ["thế", "vậy", "là"],
    "để": ["làm", "xem", "biết", "học"],
    "đang": ["làm", "học", "ở", "xem"],
    "đã": ["xong", "làm", "biết", "có"],
    "sẽ": ["làm", "được", "xảy ra", "phải"],
    // ── Cảm xúc / đánh giá (bổ sung mới) ──
    "rất": ["vui", "tốt", "nhiều", "hay", "đẹp", "nhanh"],
    "nhiều": ["hơn", "người", "lần", "năm", "thứ"],
    "ít": ["nhất", "hơn", "khi"],
    "vui": ["vẻ", "lòng", "nhộn"],
    "tốt": ["đẹp", "hơn", "nhất"],
    "đẹp": ["trai", "lòng", "đôi"],
    "thật": ["sự", "lòng", "ra", "đấy"],
    "chắc": ["chắn", "là", "rồi"],
    // ── Học tập / đọc viết (bổ sung mới) ──
    "viết": ["bài", "thư", "code", "báo cáo"],
    "đọc": ["sách", "báo", "tin", "hiểu"],
    "xem": ["phim", "báo", "tin", "lại", "xét", "bói", "tử vi"],
    "coi": ["phim", "báo", "tin", "bộ", "chừng", "hát", "sách", "lại", "thường", "bói", "tử vi"],
    // ── Từ ngữ & tiếng lóng Sài Gòn xưa / Nam Bộ (Nguyễn Cao Trường) ──
    "bá": ["cháy", "láp", "chấy"],
    "bà": ["chằn", "nội", "ngoại", "bà"],
    "bảnh": ["tỏn", "bao", "trai"],
    "bình": ["thủy", "định", "dương", "yên", "tĩnh"],
    "bùng": ["binh", "nổ", "phát"],
    "buồn": ["xo", "ngủ", "bã", "cười"],
    "chùm": ["hum", "ngây", "ruột"],
    "cù": ["lần", "lét"],
    "cứng": ["đầu", "cáp", "rắn"],
    "dằn": ["mặt", "vặt", "xé"],
    "dễ": ["ngươi", "thương", "dàng", "chịu"],
    "đò": ["thủ thiêm", "dọc", "ngang"],
    "hạp": ["gu", "tuổi", "ý"],
    "hết": ["sẩy", "xẩy", "biết", "xí quách", "bài", "ga", "tiền", "cỡ"],
    "hổng": ["chừng", "có chi", "dám đâu", "biết", "chịu", "thấy"],
    "hút": ["gió", "thuốc", "bụi", "hồn"],
    "láng": ["cháng", "mịn", "giềng"],
    "lết": ["bánh"],
    "mèn": ["ơi", "đéc ơi"],
    "mưa": ["thúi đất", "rào", "phùn", "dầm"],
    "ngon": ["lành", "ơ", "miệng", "ngọt", "cơm"],
    "quá": ["mạng", "xá", "nhiều", "trình", "khứ", "tuyệt", "nhanh"],
    "quỉ": ["tha ma bắt", "quái", "sứ"],
    "rề": ["rà"],
    "rần": ["rần"],
    "sang": ["cả", "trọng", "giàu"],
    "say": ["xỉn", "mê", "đắm", "sưa"],
    "số": ["dzách", "dách", "một", "mệnh", "học"],
    "sương": ["sương", "mù", "khói"],
    "táng": ["mạng", "tận"],
    "tào": ["lao", "tháo"],
    "té": ["re", "ngửa", "nhào", "giếng"],
    "tém": ["tém"],
    "thầy": ["hai", "thợ", "cô", "giáo", "thuốc", "u"],
    "thọc": ["cù lét", "lét", "mạch", "gậy"],
    "thềm": ["ba", "nhà"],
    "tía": ["má", "lia"],
    "trắng": ["xác", "tinh", "tay", "bạch"],
    "trời": ["thần ơi", "đánh", "ơi", "đất", "sanh"],
    "trớt": ["quớt"],
    "trùm": ["sò", "mền", "khăn"],
    "trúng": ["mánh", "mối", "tủ", "quả", "thưởng", "độc đắc"],
    "vắt": ["giò lên cổ", "chanh", "sữa"],
    "vô": ["phương", "ích", "duyên", "tư", "lý"],
    "xá": ["xị", "tội", "lợi"],
    "xe": ["lam", "thổ mộ", "đò", "lôi", "cấp cứu", "máy", "đạp", "hơi"],
    "xập": ["xám"],
    "xề": ["xòa"],
    "xì": ["dầu", "trét", "lốp"],
    "xí": ["gạt", "mụi", "muội", "xóa"],
    // ── Từ vựng đời sống & phương ngữ Nam Bộ thân thương bổ sung ──
    "bữa": ["nay", "kịp", "cơm", "tiệc"],
    "hổm": ["rày", "nay"],
    "chút": ["xíu", "nữa", "thôi", "đỉnh"],
    "thiệt": ["tình", "thòi", "sự", "hại", "lòng"],
    "chánh": ["trực", "kiến", "nghĩa", "phủ", "tông"],
    "lanh": ["chanh", "lợi", "lẹ"],
    "ngọt": ["xớt", "ngào", "bùi"],
    "chơn": ["chất", "thật"],
    "cưng": ["xỉu", "chiều"],
    "đàng": ["hoàng", "trong", "ngoài"],
    "lẹ": ["làng", "lẹ", "tay", "chân"],
    "lóng": ["rày", "ngóng"],
    "mần": ["ăn", "răng"],
    "miệt": ["vườn", "thứ", "dưới"],
    "nhứt": ["xứ", "định", "hạng", "quán"],
    "phẻ": ["re"],
    "rảnh": ["rang", "rỗi", "tay"],
    "thong": ["thả", "dong"],
    "thảnh": ["thơi"],
    // ── Mở rộng từ ngữ thông dụng (Ngữ liệu Quốc gia & NLP Corpus) ──
    "ba": ["ba", "bảy", "bị"],
    "ban": ["bố", "cấp", "chiều"],
    "bao": ["bì", "biếm", "biện"],
    "bi": ["ai", "bô", "ca"],
    "binh": ["bị", "biến", "bộ"],
    "biến": ["áp", "âm", "báo"],
    "biểu": ["bì", "cảm", "chương"],
    "biệt": ["cư", "danh", "dược"],
    "bài": ["bác", "bạc", "bản"],
    "bàn": ["ăn", "bạc", "cãi"],
    "bào": ["ảnh", "chế", "chữa"],
    "bách": ["bổ", "bộ", "chiến"],
    "bán": ["ảnh", "buôn", "cấp"],
    "bánh": ["bàng", "bao", "bẻ"],
    "bát": ["âm", "bội", "bửu"],
    "bãi": ["biển", "binh", "bỏ"],
    "bí": ["ẩn", "beng", "bét"],
    "bóng": ["bàn", "bay", "bẩy"],
    "bóp": ["bẹp", "bụng", "chắt"],
    "bút": ["bi", "chì", "chiến"],
    "băng": ["âm", "băng", "bó"],
    "bạch": ["bì", "biến", "cầu"],
    "bạo": ["bệnh", "chính", "chúa"],
    "bản": ["án", "bộ", "chất"],
    "bất": ["an", "bằng", "biến"],
    "bần": ["bạc", "bách", "bạch"],
    "bằng": ["an", "bặn", "cấp"],
    "bề": ["bề", "bộn", "cao"],
    "bọ": ["bạc", "cạp", "chét"],
    "bỏ": ["ăn", "bà", "bả"],
    "bố": ["cái", "cáo", "chánh"],
    "bồ": ["bịch", "các", "cào"],
    "bồi": ["bếp", "bổ", "bút"],
    "bổ": ["bán", "chính", "chửng"],
    "bộ": ["ba", "bảy", "binh"],
    "bội": ["bạc", "chi", "chỉnh"],
    "ca": ["cẩm", "dao", "hát"],
    "canh": ["cách", "cải", "cánh"],
    "cao": ["áp", "cả", "cấp"],
    "chia": ["bài", "buồn", "cắt"],
    "chim": ["bằng", "cắt", "chích"],
    "chiến": ["bại", "bào", "binh"],
    "chiếu": ["án", "biểu", "bóng"],
    "chung": ["chạ", "chung", "cục"],
    "chuyên": ["biệt", "cần", "chế"],
    "chuyển": ["bánh", "biên", "biến"],
    "chân": ["bì", "bụng", "chạy"],
    "chí": ["ác", "cao", "chát"],
    "chó": ["biển", "bông", "chết"],
    "chú": ["bé", "chích", "dẫn"],
    "chơi": ["ác", "bời", "chòi"],
    "chạy": ["ăn", "bữa", "chọt"],
    "chấm": ["câu", "chấm", "công"],
    "chấp": ["bút", "chiếm", "chính"],
    "chất": ["béo", "bột", "cháy"],
    "chẳng": ["ai", "bằng", "bõ"],
    "chế": ["biến", "dục", "định"],
    "chết": ["chém", "chẹt", "chìm"],
    "chỉ": ["bảo", "báo", "cần"],
    "chịu": ["chết", "chuyện", "cực"],
    "chống": ["càn", "chế", "chọi"],
    "chủ": ["âm", "bài", "biên"],
    "chứng": ["bệnh", "chỉ", "cớ"],
    "chữ": ["bát", "cái", "chân"],
    "co": ["bóp", "cỏm", "cụm"],
    "con": ["bạc", "bài", "bé"],
    "cung": ["bậc", "cách", "cấm"],
    "cuồng": ["ẩm", "bạo", "cẳng"],
    "cá": ["biệt", "bống", "bột"],
    "cách": ["biệt", "bức", "chức"],
    "cánh": ["bèo", "buồm", "cam"],
    "cáo": ["bạch", "biệt", "cấp"],
    "cân": ["bàn", "bằng", "cấn"],
    "câu": ["chắp", "chấp", "chuyện"],
    "cây": ["bài", "bông", "bụi"],
    "cô": ["ả", "bé", "chiêu"],
    "cùng": ["bên", "chung", "cực"],
    "căn": ["bản", "bệnh", "cắt"],
    "cơ": ["bản", "bần", "biến"],
    "cơm": ["áo", "bữa", "cháo"],
    "cương": ["cường", "dũng", "giới"],
    "cười": ["bò", "chê", "cợt"],
    "cường": ["bạo", "dương", "đạo"],
    "cải": ["bắp", "bẹ", "biên"],
    "cảnh": ["báo", "bị", "binh"],
    "cất": ["binh", "bút", "bước"],
    "cầm": ["bằng", "bút", "ca"],
    "cần": ["cấp", "câu", "cẩu"],
    "cầu": ["an", "ao", "bến"],
    "cắt": ["băng", "bỏ", "bom"],
    "cỏ": ["ban", "cây", "chét"],
    "cố": ["chấp", "chết", "chí"],
    "cổ": ["bẻ", "bồng", "cánh"],
    "cột": ["buồm", "cái", "chống"],
    "củ": ["ấu", "cải", "cái"],
    "cửa": ["ải", "bể", "bên"],
    "cực": ["bắc", "cầu", "dương"],
    "da": ["bát", "bê", "cam"],
    "danh": ["bạ", "ca", "cách"],
    "dao": ["ăn", "bài", "bào"],
    "di": ["bút", "cảo", "căn"],
    "diễn": ["âm", "biến", "binh"],
    "du": ["canh", "côn", "cư"],
    "dung": ["bào", "dăng", "dị"],
    "duy": ["cảm", "danh", "kỉ"],
    "dân": ["bẹp", "biểu", "binh"],
    "dây": ["bọc", "buộc", "cáp"],
    "dưỡng": ["bệnh", "chí", "dục"],
    "dấu": ["ấn", "chấm", "giáng"],
    "dầu": ["ăn", "cá", "cao"],
    "dẫn": ["bảo", "chuyện", "chứng"],
    "dị": ["bản", "bào", "bội"],
    "dịch": ["âm", "bản", "giả"],
    "dự": ["án", "báo", "bị"],
    "gian": ["ác", "bào", "băng"],
    "giun": ["cát", "chỉ", "đất"],
    "già": ["cả", "cấc", "câng"],
    "giá": ["áo", "bán", "biển"],
    "giám": ["biên", "binh", "định"],
    "gió": ["bão", "bấc", "bụi"],
    "giả": ["bộ", "bữa", "cách"],
    "giảm": ["án", "áp", "bớt"],
    "giấy": ["ảnh", "bạc", "báo"],
    "giữ": ["giá", "giàng", "gìn"],
    "gà": ["ác", "cát", "chọi"],
    "gây": ["bệnh", "chiến", "chuyện"],
    "hiếu": ["chiến", "chủ", "danh"],
    "hiền": ["đệ", "đức", "hậu"],
    "hiện": ["bộ", "dịch", "diện"],
    "hiệu": ["buôn", "chỉnh", "chính"],
    "huyết": ["áp", "bạch", "bào"],
    "hàn": ["điện", "đới", "gắn"],
    "hàng": ["ăn", "binh", "đầu"],
    "hành": ["binh", "búi", "cách"],
    "hào": ["chỉ", "hiệp", "hoa"],
    "hình": ["bao", "dáng", "dạng"],
    "hư": ["ảo", "báo", "cấu"],
    "hương": ["án", "ẩm", "bạ"],
    "hướng": ["cách", "dẫn", "dương"],
    "hậu": ["báo", "bị", "binh"],
    "hồ": ["cầm", "chi", "dễ"],
    "hồng": ["bạch", "bì", "cầu"],
    "hổ": ["biến", "cốt", "cứ"],
    "hỗn": ["ẩu", "chiến", "dịch"],
    "hộ": ["bộ", "chiếu", "đê"],
    "hội": ["ẩm", "báo", "buôn"],
    "hữu": ["ái", "biên", "chí"],
    "khai": ["ấn", "báo", "bút"],
    "khinh": ["bạc", "bỉ", "binh"],
    "khác": ["âm", "biệt", "chi"],
    "kháng": ["án", "âm", "cáo"],
    "khí": ["áp", "bẩm", "cầu"],
    "khó": ["bảo", "chịu", "chơi"],
    "khổ": ["ải", "chiến", "chủ"],
    "kim": ["anh", "băng", "cải"],
    "kiến": ["cánh", "đen", "đỏ"],
    "kì": ["an", "bo", "bộ"],
    "kế": ["cận", "chân", "chí"],
    "lai": ["cảo", "căng", "giống"],
    "lao": ["cải", "công", "dịch"],
    "liên": ["á", "bang", "bộ"],
    "long": ["án", "bào", "cổn"],
    "loạn": ["dâm", "khứu", "lạc"],
    "lá": ["áo", "bài", "bắc"],
    "lão": ["bà", "bộc", "dê"],
    "lên": ["án", "bậc", "bộ"],
    "lòng": ["chảo", "dạ", "dân"],
    "lông": ["bông", "buồn", "cánh"],
    "lưu": ["ban", "cầu", "chiểu"],
    "lưỡng": ["bội", "chất", "chiết"],
    "lạc": ["bước", "chỗ", "đà"],
    "lấy": ["cắp", "chồng", "công"],
    "lập": ["ấp", "cập", "chí"],
    "lễ": ["bái", "bộ", "ca"],
    "lỗ": ["bi", "bì", "chẩm"],
    "lục": ["bảo", "bát", "bì"],
    "ma": ["chay", "da", "đạo"],
    "mai": ["danh", "đây", "gầm"],
    "minh": ["bạch", "châu", "chủ"],
    "miễn": ["chấp", "chức", "cưỡng"],
    "màng": ["bào", "bụng", "cứng"],
    "mái": ["ấp", "bằng", "che"],
    "mê": ["ám", "cung", "cuồng"],
    "mưu": ["cầu", "chước", "cơ"],
    "mất": ["ăn", "cắp", "công"],
    "mắc": ["áo", "bận", "bẫy"],
    "mặt": ["bằng", "cắt", "cân"],
    "một": ["chạp", "chiều", "chốc"],
    "mở": ["cờ", "cửa", "đầu"],
    "nam": ["ai", "bằng", "bộ"],
    "ngang": ["bướng", "chướng", "dạ"],
    "nghi": ["án", "binh", "dụ"],
    "nghiêm": ["cách", "cấm", "cẩn"],
    "nguyên": ["âm", "bản", "canh"],
    "ngũ": ["âm", "bội", "cốc"],
    "người": ["bệnh", "chứng", "dưng"],
    "ngọc": ["am", "bích", "bội"],
    "nhiệt": ["biểu", "cơ", "dung"],
    "nhà": ["ăn", "báo", "bạt"],
    "nhân": ["nhượng", "ái", "bản"],
    "nhảy": ["bổ", "cái", "cao"],
    "nhất": ["đán", "đẳng", "định"],
    "nhận": ["biết", "cảm", "chân"],
    "nhập": ["bọn", "cảng", "cảnh"],
    "nhật": ["ấn", "báo", "dạ"],
    "nhỏ": ["bé", "con", "dãi"],
    "nóng": ["bỏng", "bức", "chảy"],
    "nông": ["cạn", "chính", "choèn"],
    "nước": ["ăn", "bài", "bí"],
    "nằm": ["bẹp", "bếp", "co"],
    "nặng": ["bụng", "căn", "cân"],
    "nổi": ["bật", "bọt", "cáu"],
    "nội": ["ban", "bào", "biến"],
    "nữ": ["binh", "cao", "chúa"],
    "phi": ["báo", "cảng", "công"],
    "phong": ["ấn", "ấp", "ba"],
    "phá": ["án", "bĩnh", "bỏ"],
    "pháo": ["binh", "bông", "cối"],
    "pháp": ["bảo", "chế", "danh"],
    "phân": ["ban", "bắc", "bậc"],
    "phép": ["chia", "cộng", "cưới"],
    "phóng": ["bút", "đại", "đãng"],
    "phù": ["dâu", "du", "dung"],
    "phương": ["án", "cách", "châm"],
    "phần": ["cảm", "đông", "góp"],
    "phế": ["binh", "bỏ", "đế"],
    "phụ": ["âm", "bạc", "bản"],
    "phục": ["binh", "chế", "chức"],
    "quang": ["âm", "cảnh", "cầu"],
    "quay": ["chuyển", "cóp", "cuồng"],
    "quân": ["báo", "bị", "bình"],
    "quả": ["bàng", "báo", "bế"],
    "quản": ["bao", "bào", "bút"],
    "quần": ["áo", "bò", "chúng"],
    "ra": ["bộ", "chiều", "công"],
    "ruột": ["chay", "gà", "gan"],
    "sa": ["bàn", "bồi", "chân"],
    "sai": ["áp", "bảo", "biệt"],
    "sao": ["bản", "băng", "bằng"],
    "siêu": ["âm", "bội", "cường"],
    "song": ["ẩm", "biến", "ca"],
    "suy": ["bại", "bì", "biến"],
    "sáng": ["bạch", "bóng", "chế"],
    "sâu": ["bệnh", "bọ", "bột"],
    "sơn": ["ca", "cẩu", "cước"],
    "sư": ["bà", "bác", "cô"],
    "sắc": ["bén", "cạnh", "chỉ"],
    "sống": ["chết", "còn", "dai"],
    "sổ": ["cái", "chi", "đen"],
    "sở": ["cầu", "cậy", "cứ"],
    "sự": ["biến", "chủ", "cố"],
    "tai": ["ác", "ách", "bèo"],
    "tam": ["bản", "bành", "bảo"],
    "tha": ["bổng", "chết", "giác"],
    "tham": ["bác", "bạo", "biến"],
    "than": ["bánh", "béo", "bụi"],
    "thanh": ["âm", "bạch", "bần"],
    "thi": ["ân", "bá", "ca"],
    "thiên": ["bẩm", "binh", "cảm"],
    "thiết": ["bì", "bị", "chế"],
    "thiếu": ["điều", "gì", "hụt"],
    "thu": ["ba", "binh", "chi"],
    "thuyền": ["bè", "bồng", "buồm"],
    "thuốc": ["bắc", "bỏng", "bổ"],
    "thái": ["âm", "ấp", "ất"],
    "thánh": ["ca", "chỉ", "chúa"],
    "thâm": ["ảo", "canh", "cung"],
    "thù": ["ân", "du", "đáp"],
    "thư": ["án", "cục", "duỗi"],
    "thương": ["binh", "cảm", "cảng"],
    "thường": ["biến", "dân", "dùng"],
    "thượng": ["cấp", "cổ", "công"],
    "thất": ["bại", "bảo", "bát"],
    "thần": ["bí", "chết", "chủ"],
    "thập": ["ác", "can", "cẩm"],
    "thể": ["cách", "chất", "chế"],
    "thổ": ["âm", "canh", "cẩm"],
    "thợ": ["bạc", "bạn", "cả"],
    "thụ": ["ân", "bệnh", "bì"],
    "thủ": ["bạ", "bản", "bút"],
    "thứ": ["ba", "bảy", "bậc"],
    "thừa": ["ân", "cơ", "dịp"],
    "tinh": ["anh", "bào", "binh"],
    "tiên": ["cảnh", "chỉ", "cô"],
    "tiêu": ["âm", "bản", "biến"],
    "tiếng": ["dội", "dữ", "địch"],
    "tiết": ["canh", "chế", "dê"],
    "tiền": ["án", "bạc", "bối"],
    "tiểu": ["bài", "ban", "bang"],
    "toàn": ["bị", "bích", "bộ"],
    "tranh": ["ảnh", "ăn", "biện"],
    "tri": ["âm", "ân", "châu"],
    "trung": ["bì", "bình", "bộ"],
    "truy": ["bức", "cứu", "điệu"],
    "truyền": ["bá", "bảo", "cảm"],
    "trái": ["cân", "chủ", "chứng"],
    "trùng": ["chuông", "cỏ", "cửu"],
    "trưởng": ["ban", "đoàn", "đồn"],
    "trả": ["ân", "bữa", "công"],
    "trầm": ["bổng", "cảm", "hà"],
    "trần": ["ai", "bì", "cầu"],
    "trọng": ["án", "âm", "bệnh"],
    "trống": ["bỏi", "cái", "canh"],
    "trở": ["chua", "chứng", "dạ"],
    "trợ": ["bào", "bút", "cấp"],
    "trừ": ["bì", "bị", "bỏ"],
    "tu": ["bổ", "chí", "chỉnh"],
    "tà": ["dâm", "dương", "đạo"],
    "tàn": ["ác", "bạo", "binh"],
    "tác": ["chiến", "dụng", "động"],
    "tái": ["bản", "bút", "cử"],
    "tâm": ["bệnh", "bì", "can"],
    "tân": ["bằng", "binh", "chủ"],
    "tên": ["bịp", "chữ", "đạn"],
    "tình": ["ái", "bạn", "báo"],
    "tính": ["cách", "chất", "chuyện"],
    "tôn": ["chỉ", "chủ", "giáo"],
    "tù": ["binh", "cẳng", "đày"],
    "tăng": ["bội", "chúng", "cường"],
    "tơ": ["cảm", "duyên", "đào"],
    "tư": ["bản", "bẩm", "biện"],
    "tương": ["ái", "bào", "cách"],
    "tất": ["bật", "cả", "dài"],
    "tầm": ["âm", "bậy", "bóp"],
    "tận": ["cùng", "dụng", "hiếu"],
    "tập": ["ấm", "con", "công"],
    "tỉ": ["dụ", "đối", "giá"],
    "tỉnh": ["bộ", "bơ", "dậy"],
    "tổ": ["ấm", "bố", "chấy"],
    "tổng": ["bao", "binh", "bộ"],
    "tứ": ["bàng", "bảo", "bề"],
    "tức": ["bực", "cảnh", "cười"],
    "từ": ["ái", "bi", "biệt"],
    "tử": ["biệt", "chiến", "cung"],
    "tự": ["ải", "ái", "biên"],
    "u": ["ám", "ẩn", "buồn"],
    "vi": ["ảnh", "ba", "chấn"],
    "viễn": ["ảnh", "cảnh", "chí"],
    "vàng": ["anh", "ạnh", "bạc"],
    "vòng": ["bi", "cổ", "đai"],
    "võ": ["bị", "biền", "công"],
    "vũ": ["bão", "bị", "công"],
    "vạn": ["an", "bảo", "bội"],
    "vận": ["chuyển", "dụng", "động"],
    "vật": ["chất", "chủ", "dục"],
    "vị": ["chi", "danh", "dịch"],
    "vỡ": ["bụng", "chợ", "chum"],
    "vừa": ["đôi", "khéo", "khi"],
    "xa": ["cách", "cảng", "gần"],
    "xuất": ["bản", "biên", "binh"],
    "xương": ["bò", "búa", "bướm"],
    "xấu": ["bụng", "chơi", "dạ"],
    "xử": ["án", "bắn", "đoán"],
    "ác": ["bá", "cảm", "chiến"],
    "áo": ["bào", "bông", "cánh"],
    "áp": ["bách", "bức", "chảo"],
    "âm": ["ẩm", "ấm", "bản"],
    "ân": ["ái", "cần", "điển"],
    "ô": ["danh", "đầu", "hay"],
    "ông": ["anh", "bà", "bầu"],
    "đa": ["bào", "bệnh", "bội"],
    "đau": ["bão", "bụng", "buồn"],
    "đàn": ["anh", "áp", "bà"],
    "đào": ["binh", "bới", "hát"],
    "đá": ["bảng", "bọt", "cối"],
    "đáng": ["bậc", "buồn", "chết"],
    "đánh": ["bả", "bạc", "bài"],
    "đèn": ["bão", "báo", "bấm"],
    "đóng": ["bao", "băng", "bộ"],
    "đơn": ["âm", "bạc", "bào"],
    "đưa": ["cay", "chân", "dâu"],
    "đương": ["cai", "chức", "cục"],
    "đường": ["bánh", "bao", "bay"],
    "đạo": ["binh", "chích", "cô"],
    "đấu": ["ẩu", "bò", "bóng"],
    "đầu": ["bài", "bếp", "bò"],
    "đầy": ["ắp", "ặp", "bụng"],
    "đậu": ["chiều", "đũa", "hũ"],
    "đẳng": ["áp", "bội", "cao"],
    "đặc": ["ân", "biệt", "cách"],
    "đề": ["án", "bài", "bạt"],
    "địa": ["bạ", "bàn", "bộ"],
    "định": ["âm", "biên", "bụng"],
    "đỏ": ["au", "bừng", "chóe"],
    "đối": ["bào", "cách", "cảm"],
    "đồ": ["án", "ăn", "bạc"],
    "đồng": ["âm", "bạc", "bạch"],
    "đổ": ["bác", "bể", "bệnh"],
    "độ": ["cao", "chuẩn", "chừng"],
    "độc": ["âm", "bạch", "bản"],
    "động": ["biển", "binh", "cấn"],
    "ưu": ["ái", "binh", "đãi"],
    "ước": ["ao", "chung", "chừng"],
    "ẩn": ["cư", "danh", "dật"],
    "ống": ["bơm", "dẫn", "dòm"],
    "ứng": ["biến", "chiến", "cử"]
  };
  var DEVELOPER_WHITELIST_BIGRAMS = {
    // Version Control & Containerization
    "git": ["push", "commit", "pull", "status", "checkout", "branch", "merge", "rebase", "clone", "fetch", "stash"],
    "docker": ["run", "compose", "build", "images", "ps", "exec", "logs", "stop", "volume", "network"],
    // Package Managers
    "npm": ["install", "run", "start", "test", "publish", "update", "uninstall", "ci", "init"],
    "yarn": ["install", "add", "remove", "run", "start", "build", "why"],
    "pnpm": ["add", "install", "run", "store", "update", "remove"],
    "cargo": ["build", "run", "test", "check", "clippy", "fmt", "update", "publish", "doc"],
    "pip": ["install", "uninstall", "freeze", "list", "show"],
    "bun": ["run", "install", "add", "test", "build"],
    // Programming Languages & Tooling Scripts
    "python": ["run", "manage.py", "main.py", "-m", "venv"],
    "node": ["index.js", "server.js", "dist/main.js", "--watch", "--version"],
    "go": ["run", "build", "test", "mod", "fmt", "vet"],
    "rustc": ["--version", "-O"],
    "deno": ["run", "task", "test", "compile", "fmt", "lint"],
    "npx": ["playwright", "esbuild", "prettier", "eslint", "tsc", "web-ext"],
    // Cloud Infrastructure & Web Engines
    "kubectl": ["get", "apply", "delete", "describe", "logs", "exec", "rollout"],
    "aws": ["configure", "s3", "ec2", "lambda", "iam"],
    "supabase": ["init", "start", "stop", "db", "functions", "login"],
    "firebase": ["login", "init", "deploy", "serve", "emulators"],
    "pull": ["request", "origin"],
    "merge": ["request", "conflict", "branch"]
  };
  function injectDeveloperBigrams(baseBigrams) {
    if (!baseBigrams || typeof baseBigrams !== "object") return baseBigrams;
    const merged = { ...baseBigrams };
    for (const [key, candidates] of Object.entries(DEVELOPER_WHITELIST_BIGRAMS)) {
      if (!merged[key]) {
        merged[key] = candidates;
      } else {
        merged[key] = Array.from(/* @__PURE__ */ new Set([...candidates, ...merged[key]])).slice(0, 4);
      }
    }
    return merged;
  }
  var DEFAULT_VIETNAMESE_BIGRAMS = injectDeveloperBigrams(RAW_VIETNAMESE_BIGRAMS);
  var DEFAULT_VIETNAMESE_TRIGRAMS = {
    // Phương ngữ Sài Gòn xưa & Nam Bộ dân gian
    "sài gòn": ["xưa", "đẹp lắm", "hoa lệ"],
    "bá cháy": ["bù chét"],
    "bá chấy": ["bù chét"],
    "bá láp": ["bá xàm"],
    "ba la": ["ba xạo"],
    "ba xạo": ["ba kép"],
    "bà chằn": ["lửa"],
    "cà rịch": ["cà tang"],
    "cà chớn": ["cà chác", "cà cháo"],
    "cà nhỏng": ["cà nhỏng"],
    "cù lần": ["lữa"],
    "cứng đầu": ["cứng cổ"],
    "đò thủ": ["thiêm"],
    "hết ga": ["hết số"],
    "hết xí": ["quách"],
    "hổng dám": ["đâu"],
    "hổng có": ["chi"],
    "mèn đéc": ["ơi"],
    "mèn ơi": ["trời đất", "nghen"],
    "hết nước": ["chấm", "miếng"],
    "ngon lành": ["cành đào"],
    "ăn ngay": ["nói thật"],
    "ăn coi": ["nồi"],
    "ngồi coi": ["hướng"],
    "mưa thúi": ["đất"],
    "quỉ tha": ["ma bắt"],
    "tào lao": ["mía lao", "chi địa"],
    "thọc cù": ["lét"],
    "thềm ba": ["nhà"],
    "trời đánh": ["thánh đâm"],
    "trời thần": ["ơi"],
    "vắt giò": ["lên cổ"],
    "hết sẩy": ["con bà bảy"],
    "ngộ á": ["nghen"],
    "coi bộ": ["được nghen", "ngon"],
    "thiệt tình": ["á", "hết sức"],
    // Y tế / Bệnh viện
    "xe cấp": ["cứu"],
    "phòng cấp": ["cứu"],
    "bệnh viện": ["chợ rẫy", "nhi đồng", "từ dũ", "bình dân"],
    "bác sĩ": ["gia đình", "trưởng khoa", "chuyên khoa"],
    // Đời sống, thương mại, tài chính
    "tiền phụ": ["cấp"],
    "chuyển khoản": ["ngân hàng", "thành công", "ngay"],
    "tài khoản": ["ngân hàng", "tiết kiệm"],
    "hãng xe": ["đò", "lôi", "lam"],
    // Địa danh miền Nam & Sài Gòn
    "thành phố": ["sài gòn", "đà lạt", "cần thơ", "mỹ tho", "vũng tàu", "nha trang", "huế", "đà nẵng"],
    "chợ bến": ["thành"],
    "bến ninh": ["kiều"],
    "sông bến": ["nghé"],
    "cầu sài": ["gòn"],
    "việt nam": ["cộng hòa"],
    // Công nghệ / Lập trình
    "trí tuệ": ["nhân tạo"],
    "mạng máy": ["tính"],
    "cơ sở": ["dữ liệu"],
    "hệ điều": ["hành"],
    "mã nguồn": ["mở"],
    "phần mềm": ["mã nguồn mở", "tiện ích"],
    // Giao tiếp / Xã giao
    "chúc mừng": ["sinh nhật", "năm mới", "thành công", "bạn"],
    "cảm ơn": ["bạn", "rất nhiều", "anh", "chị", "em"],
    "hẹn gặp": ["lại", "nhau"],
    "rất vui": ["được gặp bạn", "được làm quen"],
    "chúc ngủ": ["ngon"],
    "xin chân": ["thành"],
    "chân thành": ["cảm ơn"]
  };
  var GboardLearnedModel = class {
    constructor() {
      this.storageKey = "avim_gboard_habit_model";
      this.learningEnabled = true;
      this.userTrigrams = {};
      this.userBigrams = {};
      this.userUnigrams = {};
      this.lastUpdatedAt = 0;
      this.loadFromStorage();
    }
    /**
     * Calculate score incorporating Recency and Frequency with Domain-Isolation Weight Lock:
     * Score = count * exp(-lambda * delta_hours)
     * Half-life ~ 14 days (lambda = 0.002 per hour for general words)
     * If isDevDomain is true:
     *   - Freezes decay (lambda = 0.0001, effectively zero decay)
     *   - Grants a robust base anchor bonus (+5.0) so technical tokens and commands
     *     are never eclipsed by fast conversational chat volume.
     */
    calculateRecencyFrequencyScore(entry, now = Date.now(), isDevDomain = false) {
      if (!entry) return 0;
      if (typeof entry === "number") {
        return isDevDomain ? entry + 5 : entry;
      }
      const count = entry.count || 1;
      const lastUsed = entry.lastUsed || now;
      const hoursElapsed = Math.max(0, (now - lastUsed) / (1e3 * 60 * 60));
      const lambda = isDevDomain ? 1e-4 : 2e-3;
      const decay = Math.exp(-lambda * hoursElapsed);
      const score = count * decay;
      return isDevDomain ? score + 5 : score;
    }
    async loadFromStorage() {
      const storageLocal = typeof browser !== "undefined" && browser.storage && browser.storage.local ? browser.storage.local : typeof chrome !== "undefined" && chrome.storage && chrome.storage.local ? chrome.storage.local : null;
      try {
        if (storageLocal) {
          const stored = await new Promise((resolve) => {
            try {
              const p = storageLocal.get([this.storageKey], (res) => resolve(res || {}));
              if (p && typeof p.then === "function") p.then(resolve).catch(() => resolve({}));
            } catch {
              resolve({});
            }
          });
          if (stored && stored[this.storageKey]) {
            const parsed = stored[this.storageKey];
            const incomingUpdatedAt = parsed.updatedAt || 0;
            if (incomingUpdatedAt < this.lastUpdatedAt) {
              return;
            }
            this.userTrigrams = parsed.trigrams || {};
            this.userBigrams = parsed.bigrams || {};
            this.userUnigrams = parsed.unigrams || {};
            this.lastUpdatedAt = incomingUpdatedAt;
            if (typeof parsed.learningEnabled === "boolean") {
              this.learningEnabled = parsed.learningEnabled;
            }
            return;
          }
        }
      } catch (e) {
        console.warn("GboardLearnedModel extension storage.local load error:", e);
      }
      try {
        if (typeof localStorage === "undefined") return;
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          const incomingUpdatedAt = parsed.updatedAt || 0;
          if (incomingUpdatedAt < this.lastUpdatedAt) {
            return;
          }
          this.userTrigrams = parsed.trigrams || {};
          this.userBigrams = parsed.bigrams || {};
          this.userUnigrams = parsed.unigrams || {};
          this.lastUpdatedAt = incomingUpdatedAt;
          if (typeof parsed.learningEnabled === "boolean") {
            this.learningEnabled = parsed.learningEnabled;
          }
        }
      } catch (e) {
        console.warn("GboardLearnedModel localStorage load error:", e);
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
    async flushSaveToStorage() {
      if (this._saveTimer) {
        clearTimeout(this._saveTimer);
        this._saveTimer = null;
      }
      const now = Date.now();
      this.lastUpdatedAt = now;
      const payload = {
        learningEnabled: this.learningEnabled,
        trigrams: this.userTrigrams,
        bigrams: this.userBigrams,
        unigrams: this.userUnigrams,
        updatedAt: now
      };
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(this.storageKey, JSON.stringify(payload));
        }
      } catch (e) {
        console.warn("GboardLearnedModel localStorage save error:", e);
      }
      try {
        const storageLocal = typeof browser !== "undefined" && browser.storage && browser.storage.local ? browser.storage.local : typeof chrome !== "undefined" && chrome.storage && chrome.storage.local ? chrome.storage.local : null;
        if (storageLocal) {
          await new Promise((resolve) => {
            try {
              const p = storageLocal.set({ [this.storageKey]: payload }, () => resolve());
              if (p && typeof p.then === "function") p.then(resolve).catch(resolve);
            } catch {
              resolve();
            }
          });
        }
      } catch (e) {
      }
    }
    /**
     * Record a trigram transition (word1 + word2 -> word3)
     */
    recordTrigramTransition(w1, w2, w3) {
      if (!this.learningEnabled) return;
      const word1 = (w1 || "").trim().toLowerCase();
      const word2 = (w2 || "").trim().toLowerCase();
      const word3 = (w3 || "").trim().toLowerCase();
      if (!word1 || !word2 || !word3) return;
      if (word1.length > 30 || word2.length > 30 || word3.length > 30) return;
      const trigramKey = `${word1} ${word2}`;
      if (!this.userTrigrams[trigramKey]) {
        this.userTrigrams[trigramKey] = {};
      }
      const current = this.userTrigrams[trigramKey][word3];
      const prevCount = typeof current === "number" ? current : current?.count || 0;
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
      const prev = (prevWord || "").trim().toLowerCase();
      const next = (nextWord || "").trim().toLowerCase();
      if (!prev || !next || prev === next) return;
      if (prev.length > 30 || next.length > 30) return;
      if (!this.userBigrams[prev]) {
        this.userBigrams[prev] = {};
      }
      const current = this.userBigrams[prev][next];
      const prevCount = typeof current === "number" ? current : current?.count || 0;
      this.userBigrams[prev][next] = {
        count: prevCount + 1,
        lastUsed: Date.now()
      };
      const curUnigram = this.userUnigrams[next];
      const unigramCount = typeof curUnigram === "number" ? curUnigram : curUnigram?.count || 0;
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
      const w = (word || "").trim().toLowerCase();
      if (!w) return;
      const curUnigram = this.userUnigrams[w];
      const unigramCount = typeof curUnigram === "number" ? curUnigram : curUnigram?.count || 0;
      this.userUnigrams[w] = {
        count: unigramCount + 1,
        lastUsed: Date.now()
      };
      this.saveToStorage();
    }
    /**
     * Remove a specific bigram pair from learned habits
     * @param {string} from Starting word
     * @param {string} to Next predicted word
     */
    removeBigram(from, to) {
      const f = (from || "").trim().toLowerCase();
      const t = (to || "").trim().toLowerCase();
      if (!f || !t || !this.userBigrams[f]) return false;
      if (this.userBigrams[f][t]) {
        delete this.userBigrams[f][t];
        if (Object.keys(this.userBigrams[f]).length === 0) {
          delete this.userBigrams[f];
        }
        this.flushSaveToStorage();
        return true;
      }
      return false;
    }
    /**
     * Update or edit an existing learned bigram pair
     * @param {string} oldFrom Previous starting word
     * @param {string} oldTo Previous target word
     * @param {string} newFrom New starting word
     * @param {string} newTo New target word
     * @param {number} newCount Optional new count
     */
    updateBigram(oldFrom, oldTo, newFrom, newTo, newCount) {
      const of = (oldFrom || "").trim().toLowerCase();
      const ot = (oldTo || "").trim().toLowerCase();
      const nf = (newFrom || "").trim().toLowerCase();
      const nt = (newTo || "").trim().toLowerCase();
      if (!of || !ot || !nf || !nt) return false;
      let existingCount = 1;
      let existingLastUsed = Date.now();
      if (this.userBigrams[of] && this.userBigrams[of][ot]) {
        const cur = this.userBigrams[of][ot];
        existingCount = typeof cur === "number" ? cur : cur?.count || 1;
        existingLastUsed = cur?.lastUsed || Date.now();
        delete this.userBigrams[of][ot];
        if (Object.keys(this.userBigrams[of]).length === 0) {
          delete this.userBigrams[of];
        }
      }
      const finalCount = typeof newCount === "number" && newCount > 0 ? newCount : existingCount;
      if (!this.userBigrams[nf]) {
        this.userBigrams[nf] = {};
      }
      this.userBigrams[nf][nt] = {
        count: finalCount,
        lastUsed: existingLastUsed
      };
      if (!this.userUnigrams[nt]) {
        this.userUnigrams[nt] = { count: finalCount, lastUsed: existingLastUsed };
      }
      this.flushSaveToStorage();
      return true;
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
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.remove([this.storageKey]).catch(() => {
          });
        }
      } catch (e) {
      }
    }
    /**
     * Seed sample collocations and user habits for demonstration
     */
    seedSampleHabits() {
      const samples = [
        ["nghiên", "cứu", 6],
        ["công", "nghệ", 5],
        ["thông", "tin", 5],
        ["trí", "tuệ", 4],
        ["học", "tập", 4],
        ["sinh", "viên", 4],
        ["phát", "triển", 4],
        ["cấp", "cứu", 4],
        ["việt", "nam", 4]
      ];
      const now = Date.now();
      for (const [w1, w2, times] of samples) {
        if (!this.userBigrams[w1]) {
          this.userBigrams[w1] = {};
        }
        this.userBigrams[w1][w2] = { count: times, lastUsed: now };
        this.userUnigrams[w2] = { count: times, lastUsed: now };
      }
      const sampleTrigrams = [
        ["xe", "cấp", "cứu", 5],
        ["hồ", "chí", "minh", 5],
        ["bộ", "giao", "thông", 4],
        ["trí", "tuệ", "nhân tạo", 4]
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
          const count = typeof entry === "number" ? entry : entry?.count || 0;
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
        version: "2.0",
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
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
      const rows = ["Tu_bat_dau,Tu_ke_tiep,So_lan_go"];
      for (const [w1, toMap] of Object.entries(this.userBigrams)) {
        for (const [w2, entry] of Object.entries(toMap)) {
          const count = typeof entry === "number" ? entry : entry?.count || 0;
          rows.push(`"${w1.replace(/"/g, '""')}","${w2.replace(/"/g, '""')}",${count}`);
        }
      }
      return rows.join("\n");
    }
    /**
     * Import learned habits from JSON or CSV string
     * @param {string} rawText Input string
     * @param {boolean} merge If true, increment/combine counts; if false, overwrite
     * @returns {{ success: boolean, count: number, error?: string }}
     */
    importData(rawText, merge = true) {
      if (!rawText || typeof rawText !== "string") {
        return { success: false, count: 0, error: "Dữ liệu nhập rỗng hoặc không hợp lệ." };
      }
      const trimmed = rawText.trim();
      if (!trimmed) {
        return { success: false, count: 0, error: "Nội dung nhập rỗng." };
      }
      let importedBigrams = {};
      let importedUnigrams = {};
      let pairCount = 0;
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          const parsed = JSON.parse(trimmed);
          const bigramsSrc = parsed.bigrams || parsed.userBigrams || (typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null);
          const trigramsSrc = parsed.trigrams || parsed.userTrigrams || {};
          const unigramsSrc = parsed.unigrams || parsed.userUnigrams || {};
          if (!bigramsSrc || typeof bigramsSrc !== "object") {
            return { success: false, count: 0, error: "Cấu trúc JSON không chứa thuộc tính bigrams hợp lệ." };
          }
          const now = Date.now();
          for (const [w1, toMap] of Object.entries(bigramsSrc)) {
            if (toMap && typeof toMap === "object") {
              for (const [w2, entry] of Object.entries(toMap)) {
                const num = typeof entry === "number" ? entry : parseInt(entry?.count, 10);
                const lastUsed = typeof entry === "object" && entry?.lastUsed ? entry.lastUsed : now;
                if (!isNaN(num) && num > 0) {
                  const k1 = w1.trim().toLowerCase();
                  const k2 = w2.trim().toLowerCase();
                  if (k1 && k2) {
                    if (!importedBigrams[k1]) importedBigrams[k1] = {};
                    importedBigrams[k1][k2] = { count: num, lastUsed };
                    importedUnigrams[k2] = { count: (importedUnigrams[k2]?.count || 0) + num, lastUsed };
                    pairCount++;
                  }
                }
              }
            }
          }
          if (trigramsSrc && typeof trigramsSrc === "object") {
            if (!this.userTrigrams) this.userTrigrams = {};
            for (const [tKey, toMap] of Object.entries(trigramsSrc)) {
              if (toMap && typeof toMap === "object") {
                if (!this.userTrigrams[tKey]) this.userTrigrams[tKey] = {};
                for (const [w3, entry] of Object.entries(toMap)) {
                  const num = typeof entry === "number" ? entry : parseInt(entry?.count, 10);
                  const lastUsed = typeof entry === "object" && entry?.lastUsed ? entry.lastUsed : now;
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
        const lines = trimmed.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          if (i === 0 && (line.toLowerCase().includes("tu_bat_dau") || line.toLowerCase().includes("word1"))) {
            continue;
          }
          let parts = [];
          if (line.includes(",")) {
            parts = line.split(",");
          } else if (line.includes("	")) {
            parts = line.split("	");
          } else if (line.includes(";")) {
            parts = line.split(";");
          }
          if (parts.length >= 2) {
            const w1 = parts[0].replace(/^["']|["']$/g, "").trim().toLowerCase();
            const w2 = parts[1].replace(/^["']|["']$/g, "").trim().toLowerCase();
            const count = parts[2] ? parseInt(parts[2].replace(/^["']|["']$/g, "").trim(), 10) : 1;
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
        return { success: false, count: 0, error: "Không tìm thấy cặp từ hợp lệ trong dữ liệu." };
      }
      if (!merge) {
        this.userBigrams = importedBigrams;
        this.userUnigrams = importedUnigrams;
      } else {
        const now = Date.now();
        for (const [w1, toMap] of Object.entries(importedBigrams)) {
          if (!this.userBigrams[w1]) this.userBigrams[w1] = {};
          for (const [w2, entry] of Object.entries(toMap)) {
            const addCount = typeof entry === "number" ? entry : entry?.count || 1;
            const cur = this.userBigrams[w1][w2];
            const curCount = typeof cur === "number" ? cur : cur?.count || 0;
            this.userBigrams[w1][w2] = { count: curCount + addCount, lastUsed: now };
          }
        }
        for (const [w, entry] of Object.entries(importedUnigrams)) {
          const addCount = typeof entry === "number" ? entry : entry?.count || 1;
          const cur = this.userUnigrams[w];
          const curCount = typeof cur === "number" ? cur : cur?.count || 0;
          this.userUnigrams[w] = { count: curCount + addCount, lastUsed: now };
        }
      }
      this.flushSaveToStorage();
      return { success: true, count: pairCount };
    }
  };
  var AutoCompleteEngine = class {
    constructor() {
      this.compounds = [...COMMON_VIETNAMESE_COMPOUNDS];
      this.compoundIndex = this.buildCompoundIndex();
      this.syllableIndex = this.buildSyllableIndex();
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
    async loadFromStorage() {
      if (this.learnedModel && typeof this.learnedModel.loadFromStorage === "function") {
        return await this.learnedModel.loadFromStorage();
      }
    }
    saveToStorage() {
      if (this.learnedModel && typeof this.learnedModel.saveToStorage === "function") {
        this.learnedModel.saveToStorage();
      }
    }
    buildCompoundIndex() {
      return this.compounds.map((word) => ({
        word,
        lower: word.toLowerCase(),
        stripped: stripVietnameseAccents(word),
        type: "compound",
        displayType: "Cụm từ"
      }));
    }
    buildSyllableIndex() {
      const vnSet = getVietnameseWordSet();
      const index = [];
      for (const word of vnSet) {
        index.push({
          word,
          lower: word.toLowerCase(),
          stripped: stripVietnameseAccents(word),
          type: "syllable",
          displayType: "Từ đơn"
        });
      }
      return index;
    }
    /**
     * Add new compound words or phrases dynamically
     */
    addCustomPhrase(phrase) {
      const clean = (phrase || "").trim();
      if (!clean || this.compounds.includes(clean)) return;
      this.compounds.push(clean);
      this.compoundIndex.push({
        word: clean,
        lower: clean.toLowerCase(),
        stripped: stripVietnameseAccents(clean),
        type: "compound",
        displayType: "Cụm từ"
      });
    }
    /**
     * Record word transition when user types or chooses word sequence
     * Supports both bigram (w1 -> w2) and trigram (w0 -> w1 -> w2) learning
     */
    recordWordTransition(prevWord, nextWord, priorWord = "") {
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
     * Remove a specific bigram pair from learned habits
     */
    removeLearnedHabit(from, to) {
      return this.learnedModel.removeBigram(from, to);
    }
    /**
     * Update or edit an existing learned bigram pair
     */
    updateLearnedHabit(oldFrom, oldTo, newFrom, newTo, newCount) {
      return this.learnedModel.updateBigram(oldFrom, oldTo, newFrom, newTo, newCount);
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
    getNextWordSuggestions(previousWord, limit = 5, priorWord = "") {
      if (!this.enabled || !this.nextWordEnabled || !previousWord) return [];
      const raw = previousWord.trim();
      if (!raw) return [];
      const prevLower = raw.toLowerCase();
      const priorLower = (priorWord || "").trim().toLowerCase();
      const isFirstUpper = raw[0] === raw[0].toUpperCase() && raw[0] !== raw[0].toLowerCase();
      const isAllUpper = raw.length > 1 && raw === raw.toUpperCase();
      const candidates = [];
      const seen = /* @__PURE__ */ new Set();
      const now = Date.now();
      const isDevDomain = Boolean(DEVELOPER_WHITELIST_BIGRAMS[prevLower]);
      if (priorLower) {
        const trigramKey = `${priorLower} ${prevLower}`;
        const userTrigramFollowers = this.learnedModel.userTrigrams[trigramKey];
        if (userTrigramFollowers) {
          const sortedTrigrams = Object.entries(userTrigramFollowers).map(([w, entry]) => ({
            w,
            score: this.learnedModel.calculateRecencyFrequencyScore(entry, now, isDevDomain),
            rawCount: typeof entry === "number" ? entry : entry?.count || 1
          })).sort((a, b) => b.score - a.score);
          for (const { w, rawCount, score } of sortedTrigrams) {
            if (!seen.has(w)) {
              candidates.push({
                word: this.formatWordCase(w, isFirstUpper, isAllUpper),
                displayType: "Thói quen sâu",
                type: "learned",
                count: rawCount,
                score
              });
              seen.add(w);
            }
            if (candidates.length >= limit) break;
          }
        }
        const baseTrigramFollowers = this.trigrams[trigramKey];
        if (baseTrigramFollowers && candidates.length < limit) {
          for (const w of baseTrigramFollowers) {
            const wLower = w.toLowerCase();
            if (!seen.has(wLower)) {
              candidates.push({
                word: this.formatWordCase(w, isFirstUpper, isAllUpper),
                displayType: "Ngữ cảnh sâu",
                type: "trigram"
              });
              seen.add(wLower);
            }
            if (candidates.length >= limit) break;
          }
        }
      }
      const userFollowers = this.learnedModel.userBigrams[prevLower];
      if (userFollowers && candidates.length < limit) {
        const sortedUserFollowers = Object.entries(userFollowers).map(([w, entry]) => ({
          w,
          score: this.learnedModel.calculateRecencyFrequencyScore(entry, now, isDevDomain),
          rawCount: typeof entry === "number" ? entry : entry?.count || 1
        })).sort((a, b) => b.score - a.score);
        for (const { w, rawCount, score } of sortedUserFollowers) {
          if (!seen.has(w)) {
            candidates.push({
              word: this.formatWordCase(w, isFirstUpper, isAllUpper),
              displayType: "Thói quen",
              type: "learned",
              count: rawCount,
              score
            });
            seen.add(w);
          }
          if (candidates.length >= limit) break;
        }
      }
      const baseFollowers = this.bigrams[prevLower];
      if (baseFollowers && candidates.length < limit) {
        for (const w of baseFollowers) {
          const wLower = w.toLowerCase();
          if (!seen.has(wLower)) {
            candidates.push({
              word: this.formatWordCase(w, isFirstUpper, isAllUpper),
              displayType: "Gợi ý chuẩn",
              type: "bigram"
            });
            seen.add(wLower);
          }
          if (candidates.length >= limit) break;
        }
      }
      if (candidates.length < limit) {
        for (const item of this.compoundIndex) {
          if (item.lower.startsWith(prevLower + " ")) {
            const remainder = item.word.slice(prevLower.length + 1).trim();
            const remainderLower = remainder.toLowerCase();
            if (remainder && !seen.has(remainderLower)) {
              candidates.push({
                word: this.formatWordCase(remainder, isFirstUpper, isAllUpper),
                displayType: "Cụm từ",
                type: "compound"
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
      if (prefix.startsWith(":")) {
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
      const seenWords = /* @__PURE__ */ new Set();
      const userIndex = userDictionary.getIndex();
      const now = Date.now();
      for (const item of userIndex) {
        const learnedEntry = this.learnedModel.userUnigrams[item.lower];
        const learnedScore = this.learnedModel.calculateRecencyFrequencyScore(learnedEntry, now);
        const learnedBoost = Math.min(learnedScore * 4, 30);
        if (item.lower.startsWith(prefixLower)) {
          results.push({
            word: this.formatWordCase(item.word, isFirstUpper, isAllUpper),
            type: "user",
            displayType: "Từ riêng",
            matchScore: 100 - (item.word.length - prefix.length) + learnedBoost
          });
          seenWords.add(item.lower);
        } else if (item.stripped.startsWith(prefixStripped)) {
          results.push({
            word: this.formatWordCase(item.word, isFirstUpper, isAllUpper),
            type: "user",
            displayType: "Từ riêng",
            matchScore: 80 - (item.word.length - prefix.length) + learnedBoost
          });
          seenWords.add(item.lower);
        }
        if (results.length >= limit * 2) break;
      }
      for (const item of this.compoundIndex) {
        if (seenWords.has(item.lower)) continue;
        const learnedEntry = this.learnedModel.userUnigrams[item.lower];
        const learnedScore = this.learnedModel.calculateRecencyFrequencyScore(learnedEntry, now);
        const learnedBoost = Math.min(learnedScore * 4, 30);
        if (item.lower.startsWith(prefixLower)) {
          results.push({
            word: this.formatWordCase(item.word, isFirstUpper, isAllUpper),
            type: item.type,
            displayType: item.displayType,
            matchScore: 90 - (item.word.length - prefix.length) * 0.5 + learnedBoost
          });
          seenWords.add(item.lower);
        } else if (item.stripped.startsWith(prefixStripped)) {
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
      if (results.length < limit) {
        for (const item of this.syllableIndex) {
          if (item.word.length <= prefix.length && item.lower === prefixLower) continue;
          if (seenWords.has(item.lower)) continue;
          const learnedEntry = this.learnedModel.userUnigrams[item.lower];
          const learnedScore = this.learnedModel.calculateRecencyFrequencyScore(learnedEntry, now);
          const learnedBoost = Math.min(learnedScore * 4, 30);
          if (item.lower.startsWith(prefixLower)) {
            results.push({
              word: this.formatWordCase(item.word, isFirstUpper, isAllUpper),
              type: item.type,
              displayType: item.displayType,
              matchScore: 60 - (item.word.length - prefix.length) + learnedBoost
            });
            seenWords.add(item.lower);
          } else if (item.stripped.startsWith(prefixStripped)) {
            results.push({
              word: this.formatWordCase(item.word, isFirstUpper, isAllUpper),
              type: item.type,
              displayType: item.displayType,
              matchScore: 40 - (item.word.length - prefix.length) + learnedBoost
            });
            seenWords.add(item.lower);
          }
          if (results.length >= limit * 2) break;
        }
      }
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
              type: "tech",
              displayType: "Tiếng Anh",
              matchScore: 50 - (eWord.length - prefix.length) + learnedBoost
            });
            seenWords.add(eLower);
          }
          if (results.length >= limit * 2) break;
        }
      }
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
      if (!word) return "";
      if (isAllUpper) {
        return word.toUpperCase();
      }
      if (isFirstUpper) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    }
  };
  var autoCompleteEngine = new AutoCompleteEngine();

  // src/content/content.js
  var AvimContentScript = class {
    constructor() {
      this.domObserver = new DomObserver();
      this.textReplacer = new TextReplacer();
      this.settings = {
        ...DEFAULT_SETTINGS,
        method: IME_METHOD.AUTO,
        toneStyle: TONE_STYLE.CLASSIC,
        macros: DEFAULT_MACROS
      };
      this.lastCtrlTime = 0;
      this.previousMethod = IME_METHOD.AUTO;
      this.activeSuggestions = [];
      this.selectedSuggestionIndex = 0;
      this.activeSuggestionType = "autocomplete";
      this.activeWordPrefix = "";
      this.lastWordBeforeDelimiter = "";
      this.secondLastWordBeforeDelimiter = "";
      this.currentTarget = null;
      this.suggestionHost = null;
      this.suggestionShadow = null;
      this.suggestionBar = null;
      this.ghostTextEl = null;
      this.caretMirror = null;
      this.caretMarker = null;
      this.suggestionInactivityTimeout = null;
      this.suggestionInactivityMs = 2800;
      this.erasedWordHabits = /* @__PURE__ */ new Map();
      this.avimEngine = new AvimEngine({
        method: this.settings.method,
        toneStyle: this.settings.toneStyle,
        spellCheck: this.settings.spellCheck,
        quickConsonants: this.settings.quickConsonants,
        autoRestoreEnglish: this.settings.autoRestoreEnglish,
        escRevert: this.settings.escRevert,
        phonologyRules: this.settings.phonologyRules,
        typeW2U: this.settings.typeW2U !== false,
        smartHorn: this.settings.smartHorn !== false
      });
      this.macroEngine = new MacroEngine(this.settings.macros, {
        enabled: this.settings.macroEnabled,
        autoUndo: this.settings.autoUndo
      });
      this.init();
    }
    init() {
      this.bindEvents();
      this.listenMessages();
      this.loadSettings();
      if (typeof document !== "undefined" && typeof window !== "undefined" && window.location) {
        const host = (window.location.hostname || "").toLowerCase();
        const isTeams = host === "teams.microsoft.com" || host.endsWith(".teams.microsoft.com") || host === "teams.live.com" || host.endsWith(".teams.live.com") || host === "teams.cloud.microsoft" || host.endsWith(".teams.cloud.microsoft");
        if (!isTeams) {
          if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => this.initSuggestionHost(), { once: true });
          } else {
            this.initSuggestionHost();
          }
        }
      }
    }
    async loadSettings() {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
        try {
          const stored = await chrome.storage.sync.get(["avim_settings", "avim_macros", "avim_domain_methods"]);
          if (stored.avim_settings) {
            Object.assign(this.settings, stored.avim_settings);
          }
          if (stored.avim_domain_methods) {
            this.settings.domainMethods = stored.avim_domain_methods;
          }
          if (stored.avim_macros) {
            this.settings.macros = stored.avim_macros;
          }
        } catch {
        }
      }
      if (this.settings.perDomainMemory !== false && typeof window !== "undefined" && window.location) {
        const hostname = window.location.hostname.toLowerCase();
        if (this.settings.domainMethods && typeof this.settings.domainMethods[hostname] === "number") {
          this.settings.method = this.settings.domainMethods[hostname];
        }
      }
      try {
        await Promise.all([
          autoCompleteEngine.loadFromStorage(),
          userDictionary.loadFromStorage(),
          this.loadHabitCountsFromStorage()
        ]);
      } catch {
      }
      this.applySettings();
    }
    applySettings() {
      this.avimEngine.setMethod(this.settings.method);
      this.avimEngine.setToneStyle(this.settings.toneStyle);
      this.avimEngine.setSpellCheck(this.settings.spellCheck);
      this.avimEngine.setQuickConsonants(this.settings.quickConsonants);
      this.avimEngine.setQuickTelex(this.settings.quickTelex !== false);
      this.avimEngine.setAutoRestoreEnglish(this.settings.autoRestoreEnglish !== false);
      this.avimEngine.setEscRevert(this.settings.escRevert !== false);
      this.avimEngine.setPhonologyRules(this.settings.phonologyRules !== false);
      this.avimEngine.setAutoHarmonizeCase(this.settings.autoHarmonizeCase === true);
      this.avimEngine.setTypeW2U(this.settings.typeW2U !== false);
      this.avimEngine.setSmartHorn(this.settings.smartHorn !== false);
      this.macroEngine.enabled = this.settings.macroEnabled;
      this.macroEngine.autoUndo = this.settings.autoUndo;
      if (this.settings.macros) {
        this.macroEngine.loadMacros(this.settings.macros);
      }
      if (typeof autoCompleteEngine.setEnabled === "function") {
        autoCompleteEngine.setEnabled(this.settings.autoCompleteEnabled !== false);
      } else {
        autoCompleteEngine.enabled = this.settings.autoCompleteEnabled !== false;
      }
      if (typeof autoCompleteEngine.setNextWordEnabled === "function") {
        autoCompleteEngine.setNextWordEnabled(this.settings.nextWordEnabled !== false);
      } else {
        autoCompleteEngine.nextWordEnabled = this.settings.nextWordEnabled !== false;
      }
      if (typeof autoCompleteEngine.setLearningEnabled === "function") {
        autoCompleteEngine.setLearningEnabled(this.settings.gboardLearningEnabled !== false);
      } else if (autoCompleteEngine.learnedModel) {
        autoCompleteEngine.learnedModel.learningEnabled = this.settings.gboardLearningEnabled !== false;
      }
      this.domObserver.setBlacklistedDomains(this.settings.blacklistedDomains || []);
    }
    listenMessages() {
      const runtime = typeof browser !== "undefined" && browser.runtime ? browser.runtime : typeof chrome !== "undefined" && chrome.runtime ? chrome.runtime : null;
      if (runtime && runtime.onMessage) {
        runtime.onMessage.addListener((message, sender, sendResponse) => {
          if (message.type === "SETTINGS_UPDATED") {
            const oldMethod = this.settings.method;
            if (message.settings) Object.assign(this.settings, message.settings);
            if (message.domainMethods && typeof message.domainMethods === "object") {
              this.settings.domainMethods = message.domainMethods;
              const host = typeof window !== "undefined" && window.location ? window.location.hostname : "";
              if (host && message.domainMethods[host] !== void 0) {
                this.settings.method = message.domainMethods[host];
              }
            }
            if (message.macros) this.settings.macros = message.macros;
            if (message.userDictionary && Array.isArray(message.userDictionary)) {
              userDictionary.loadWords(message.userDictionary);
            }
            if (message.settings || message.macros || message.userDictionary || message.domainMethods) {
              this.applySettings();
            }
            if (oldMethod === IME_METHOD.OFF && this.settings.method !== IME_METHOD.OFF) {
              this.performOnActivationWordRescue();
            }
            sendResponse({ success: true });
          }
          if (message.type === "USER_DICT_UPDATED") {
            if (Array.isArray(message.words)) {
              userDictionary.loadWords(message.words);
            } else {
              userDictionary.loadFromStorage();
            }
            sendResponse({ success: true });
          }
          if (message.type === "GET_STATUS") {
            sendResponse({
              method: this.settings.method,
              macroEnabled: this.settings.macroEnabled
            });
          }
        });
      }
      const storageApi = typeof browser !== "undefined" && browser.storage ? browser.storage : typeof chrome !== "undefined" && chrome.storage ? chrome.storage : null;
      if (storageApi && storageApi.onChanged) {
        storageApi.onChanged.addListener((changes, areaName) => {
          if (changes.avim_user_dictionary) {
            const newWords = changes.avim_user_dictionary.newValue;
            if (Array.isArray(newWords)) {
              userDictionary.loadWords(newWords);
            }
          }
        });
      }
    }
    bindEvents() {
      document.addEventListener("keydown", this.handleKeyDown.bind(this), true);
      document.addEventListener("beforeinput", (event) => {
        if (this._blockedInputKey && (event.data === this._blockedInputKey || event.inputType === "insertText" && event.data === this._blockedInputKey)) {
          event.preventDefault();
          event.stopPropagation();
          if (typeof event.stopImmediatePropagation === "function") {
            event.stopImmediatePropagation();
          }
          this._blockedInputKey = null;
        }
      }, true);
      document.addEventListener("click", (e) => {
        if (this.suggestionHost && !this.suggestionHost.contains(e.target)) {
          this.hideSuggestions();
        }
      }, true);
      document.addEventListener("focusout", (e) => {
        const target = e.target;
        if (!target || !this.domObserver.isEligibleTarget(target)) return;
        const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
        const wordInfo = isNative ? this.textReplacer.extractNativeWordBuffer(target) : this.textReplacer.extractContentEditableWordBuffer();
        if (wordInfo && wordInfo.word) {
          if (this.lastWordBeforeDelimiter && this.lastWordBeforeDelimiter !== wordInfo.word) {
            autoCompleteEngine.recordWordTransition(this.lastWordBeforeDelimiter, wordInfo.word);
          }
          autoCompleteEngine.recordWordUsage(wordInfo.word);
        }
      }, true);
      if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
        window.addEventListener("blur", () => this.hideSuggestions());
      }
    }
    /* ========================================================================
     * Gboard Floating Suggestion Bar (Shadow DOM Encapsulated)
     * ======================================================================== */
    initSuggestionHost() {
      const mount = document.body || document.documentElement;
      if (this.suggestionHost) {
        if (!this.suggestionHost.isConnected && mount) {
          mount.appendChild(this.suggestionHost);
        }
        return;
      }
      if (!mount) {
        if (typeof document !== "undefined" && document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () => this.initSuggestionHost(), { once: true });
        }
        return;
      }
      this.suggestionHost = document.createElement("div");
      this.suggestionHost.id = "__avim_gboard_host__";
      Object.assign(this.suggestionHost.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "0",
        overflow: "visible",
        zIndex: "2147483647",
        pointerEvents: "none"
      });
      this.suggestionShadow = this.suggestionHost.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = `
      .gboard-bar {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 5px 8px;
        border-radius: 20px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(56, 189, 248, 0.4);
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        pointer-events: auto;
        user-select: none;
        transition: opacity 0.15s ease, transform 0.15s ease;
        max-width: 90vw;
        overflow-x: auto;
      }
      .gboard-bar.hidden {
        display: none;
      }
      .gboard-title {
        color: #94a3b8;
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 4px;
        padding-left: 4px;
        padding-right: 2px;
        font-weight: 500;
        white-space: nowrap;
      }
      .gboard-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 12px;
        background: rgba(30, 41, 59, 0.85);
        border: 1px solid rgba(71, 85, 105, 0.5);
        color: #f8fafc;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.12s ease;
        white-space: nowrap;
      }
      .gboard-chip:hover, .gboard-chip.selected {
        background: #0284c7;
        border-color: #38bdf8;
        color: #ffffff;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
      }
      .gboard-chip.is-learned {
        border-color: rgba(16, 185, 129, 0.5);
        background: rgba(6, 78, 59, 0.4);
        color: #6ee7b7;
      }
      .gboard-chip.is-learned:hover {
        background: #059669;
        border-color: #10b981;
        color: #ffffff;
      }
      .gboard-badge {
        font-size: 9px;
        padding: 1px 4px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.12);
        color: #cbd5e1;
        font-weight: 600;
      }
      .gboard-hint {
        font-size: 9px;
        font-family: monospace;
        font-weight: bold;
        background: rgba(56, 189, 248, 0.2);
        color: #38bdf8;
        padding: 1px 4px;
        border-radius: 3px;
        border: 1px solid rgba(56, 189, 248, 0.35);
      }
      .gboard-chip:hover .gboard-hint {
        background: rgba(255, 255, 255, 0.3);
        color: #ffffff;
        border-color: #ffffff;
      }
      .openviet-ghost-text {
        position: fixed;
        pointer-events: none;
        z-index: 2147483647;
        color: #94a3b8;
        opacity: 0.58;
        white-space: pre;
        line-height: inherit;
        font-family: inherit;
        font-size: inherit;
        user-select: none;
        -webkit-user-select: none;
        transition: opacity 0.1s ease;
      }
      .openviet-ghost-text.hidden {
        display: none;
      }
      .openviet-ghost-text .ghost-badge {
        display: inline-block;
        margin-left: 6px;
        font-size: 10px;
        padding: 1px 4px;
        border-radius: 3px;
        background: rgba(148, 163, 184, 0.25);
        color: #cbd5e1;
        font-family: monospace;
        vertical-align: middle;
      }
    `;
      this.suggestionBar = document.createElement("div");
      this.suggestionBar.className = "gboard-bar hidden";
      this.ghostTextEl = document.createElement("div");
      this.ghostTextEl.className = "openviet-ghost-text hidden";
      this.caretMirror = document.createElement("div");
      this.caretMirror.className = "openviet-caret-mirror";
      this.caretMirror.style.position = "fixed";
      this.caretMirror.style.visibility = "hidden";
      this.caretMirror.style.top = "0px";
      this.caretMirror.style.left = "0px";
      this.caretMirror.style.pointerEvents = "none";
      this.caretMirror.style.zIndex = "-99999";
      this.caretMarker = document.createElement("span");
      this.caretMarker.textContent = "|";
      this.suggestionBar.addEventListener("mouseenter", () => {
        if (this.suggestionInactivityTimeout) {
          clearTimeout(this.suggestionInactivityTimeout);
          this.suggestionInactivityTimeout = null;
        }
      });
      this.suggestionBar.addEventListener("mouseleave", () => {
        this.resetSuggestionInactivityTimer();
      });
      this.suggestionShadow.appendChild(style);
      this.suggestionShadow.appendChild(this.suggestionBar);
      this.suggestionShadow.appendChild(this.ghostTextEl);
      this.suggestionShadow.appendChild(this.caretMirror);
      mount.appendChild(this.suggestionHost);
    }
    resetSuggestionInactivityTimer() {
      if (this.suggestionInactivityTimeout) {
        clearTimeout(this.suggestionInactivityTimeout);
        this.suggestionInactivityTimeout = null;
      }
      if (this.isSuggestionsVisible()) {
        this.suggestionInactivityTimeout = setTimeout(() => {
          this.hideSuggestions();
        }, this.suggestionInactivityMs);
      }
    }
    getCaretCoordinates(target) {
      if (!target) return null;
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      if (isNative) {
        try {
          const pos = target.selectionStart ?? target.value.length;
          const rect = target.getBoundingClientRect();
          const style = window.getComputedStyle(target);
          if (!this.caretMirror) {
            this.initSuggestionHost();
          }
          const mirror = this.caretMirror;
          if (!mirror) return { left: rect.left, top: rect.top, height: rect.height || 20 };
          mirror.style.whiteSpace = target instanceof HTMLTextAreaElement ? "pre-wrap" : "pre";
          mirror.style.wordWrap = "break-word";
          mirror.style.font = style.font;
          mirror.style.fontSize = style.fontSize;
          mirror.style.fontFamily = style.fontFamily;
          mirror.style.fontWeight = style.fontWeight;
          mirror.style.letterSpacing = style.letterSpacing;
          mirror.style.lineHeight = style.lineHeight;
          mirror.style.padding = style.padding;
          mirror.style.border = style.border;
          mirror.style.boxSizing = style.boxSizing;
          mirror.style.width = `${target.clientWidth}px`;
          const textBefore = target.value.slice(0, pos);
          mirror.textContent = textBefore;
          if (!this.caretMarker) {
            this.caretMarker = document.createElement("span");
            this.caretMarker.textContent = "|";
          }
          mirror.appendChild(this.caretMarker);
          const markerRect = this.caretMarker.getBoundingClientRect();
          const mirrorRect = mirror.getBoundingClientRect();
          mirror.textContent = "";
          const scrollLeft = target.scrollLeft || 0;
          const scrollTop = target.scrollTop || 0;
          const left = rect.left + (markerRect.left - mirrorRect.left) - scrollLeft;
          const top = rect.top + (markerRect.top - mirrorRect.top) - scrollTop;
          const height = markerRect.height || parseInt(style.fontSize, 10) || 16;
          return { left, top, height };
        } catch {
          const rect = target.getBoundingClientRect();
          return { left: rect.left, top: rect.top, height: rect.height || 20 };
        }
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          let rect2 = range.getBoundingClientRect();
          if (!rect2 || rect2.width === 0 && rect2.height === 0) {
            const parentEl = range.startContainer.nodeType === Node.ELEMENT_NODE ? range.startContainer : range.startContainer.parentElement;
            if (parentEl) {
              rect2 = parentEl.getBoundingClientRect();
            }
          }
          if (rect2 && rect2.top > 0) {
            return { left: rect2.left, top: rect2.top, height: rect2.height || 20 };
          }
        }
        const rect = target.getBoundingClientRect();
        return { left: rect.left, top: rect.top, height: rect.height || 20 };
      }
      return null;
    }
    showGhostText(target, candidate, type, query = "") {
      if (!candidate || !this.ghostTextEl) return;
      const currentWord = query || "";
      let ghostSuffix = "";
      if (type === "autocomplete") {
        if (candidate.toLowerCase().startsWith(currentWord.toLowerCase())) {
          ghostSuffix = candidate.slice(currentWord.length);
        } else {
          ghostSuffix = " " + candidate;
        }
      } else {
        ghostSuffix = (currentWord.endsWith(" ") ? "" : " ") + candidate;
      }
      if (!ghostSuffix) {
        this.hideSuggestions();
        return;
      }
      const coords = this.getCaretCoordinates(target);
      if (!coords) {
        this.hideSuggestions();
        return;
      }
      this.ghostTextEl.textContent = "";
      const textNode = document.createTextNode(ghostSuffix);
      this.ghostTextEl.appendChild(textNode);
      const badge = document.createElement("span");
      badge.className = "ghost-badge";
      badge.textContent = "Tab ⇥";
      this.ghostTextEl.appendChild(badge);
      try {
        const style = window.getComputedStyle(target);
        this.ghostTextEl.style.fontFamily = style.fontFamily;
        this.ghostTextEl.style.fontSize = style.fontSize;
        this.ghostTextEl.style.fontWeight = style.fontWeight;
        this.ghostTextEl.style.letterSpacing = style.letterSpacing;
        this.ghostTextEl.style.lineHeight = style.lineHeight;
      } catch (_) {
      }
      this.ghostTextEl.style.top = `${coords.top}px`;
      this.ghostTextEl.style.left = `${coords.left}px`;
      this.ghostTextEl.classList.remove("hidden");
      this.resetSuggestionInactivityTimer();
    }
    showSuggestions(target, items, type, query = "") {
      if (!items || items.length === 0) {
        this.hideSuggestions();
        return;
      }
      const visibleItems = items.slice(0, 5);
      this.activeSuggestions = visibleItems;
      this.selectedSuggestionIndex = 0;
      this.activeSuggestionType = type;
      this.activeWordPrefix = query;
      this.currentTarget = target;
      if (!this.suggestionBar) this.initSuggestionHost();
      if (!this.suggestionBar) return;
      if (this.settings.suggestionStyle === "ghost_text") {
        if (this.suggestionBar) this.suggestionBar.classList.add("hidden");
        const topCandidate = visibleItems[0]?.word;
        this.showGhostText(target, topCandidate, type, query);
        return;
      }
      if (this.ghostTextEl) {
        this.ghostTextEl.classList.add("hidden");
        this.ghostTextEl.textContent = "";
      }
      this.suggestionBar.textContent = "";
      const titleEl = document.createElement("div");
      titleEl.className = "gboard-title";
      const mainSpan = document.createElement("span");
      mainSpan.textContent = type === "nextword" ? "✨ Kế tiếp:" : "✦ Gợi ý:";
      const hintSpan = document.createElement("span");
      hintSpan.className = "gboard-nav-hint";
      hintSpan.style.color = "#94a3b8";
      hintSpan.style.fontSize = "10px";
      hintSpan.style.fontWeight = "normal";
      hintSpan.style.marginLeft = "4px";
      hintSpan.textContent = " [↓/↑ hoặc Tab: duyệt • Enter: chọn • Esc: ẩn]";
      titleEl.appendChild(mainSpan);
      titleEl.appendChild(hintSpan);
      this.suggestionBar.appendChild(titleEl);
      visibleItems.forEach((item, idx) => {
        const chip = document.createElement("div");
        chip.className = `gboard-chip ${item.type === "learned" ? "is-learned" : ""} ${idx === this.selectedSuggestionIndex ? "selected" : ""}`;
        chip.setAttribute("role", "button");
        chip.setAttribute("aria-selected", idx === this.selectedSuggestionIndex ? "true" : "false");
        const text = document.createElement("span");
        text.textContent = item.word;
        chip.appendChild(text);
        if (item.displayType && item.displayType !== "Từ đơn") {
          const badge = document.createElement("span");
          badge.className = "gboard-badge";
          badge.textContent = item.displayType;
          chip.appendChild(badge);
        }
        if (idx === this.selectedSuggestionIndex) {
          const hint = document.createElement("span");
          hint.className = "gboard-hint";
          hint.textContent = "Enter ↵";
          chip.appendChild(hint);
        }
        chip.addEventListener("mousedown", (e) => e.preventDefault());
        chip.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.applySuggestion(item.word);
        });
        this.suggestionBar.appendChild(chip);
      });
      try {
        const rect = target.getBoundingClientRect();
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        const ribbonWidth = this.suggestionBar.offsetWidth || 340;
        const ribbonHeight = this.suggestionBar.offsetHeight || 38;
        let top = rect.bottom + scrollY + 4;
        let left = rect.left + scrollX;
        if (rect.bottom + ribbonHeight + 8 > window.innerHeight && rect.top > ribbonHeight + 8) {
          top = rect.top + scrollY - ribbonHeight - 4;
        }
        const maxLeft = (window.scrollX || 0) + window.innerWidth - ribbonWidth - 12;
        const minLeft = (window.scrollX || 0) + 12;
        left = Math.max(minLeft, Math.min(left, maxLeft));
        this.suggestionBar.style.top = `${top}px`;
        this.suggestionBar.style.left = `${left}px`;
        this.suggestionBar.classList.remove("hidden");
      } catch {
        this.suggestionBar.classList.remove("hidden");
      }
      this.resetSuggestionInactivityTimer();
    }
    updateSuggestionHighlight() {
      if (!this.suggestionBar) return;
      const chips = this.suggestionBar.querySelectorAll(".gboard-chip");
      chips.forEach((chip, idx) => {
        const isSelected = idx === this.selectedSuggestionIndex;
        if (isSelected) {
          chip.classList.add("selected");
          chip.setAttribute("aria-selected", "true");
          let hint = chip.querySelector(".gboard-hint");
          if (!hint) {
            hint = document.createElement("span");
            hint.className = "gboard-hint";
            chip.appendChild(hint);
          }
          hint.textContent = "Enter ↵";
        } else {
          chip.classList.remove("selected");
          chip.setAttribute("aria-selected", "false");
          const hint = chip.querySelector(".gboard-hint");
          if (hint) {
            hint.remove();
          }
        }
      });
      const selectedChip = chips[this.selectedSuggestionIndex];
      if (selectedChip && typeof selectedChip.scrollIntoView === "function") {
        selectedChip.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
      this.resetSuggestionInactivityTimer();
    }
    hideSuggestions() {
      if (this.suggestionInactivityTimeout) {
        clearTimeout(this.suggestionInactivityTimeout);
        this.suggestionInactivityTimeout = null;
      }
      if (this.suggestionBar) {
        this.suggestionBar.classList.add("hidden");
      }
      if (this.ghostTextEl) {
        this.ghostTextEl.classList.add("hidden");
        this.ghostTextEl.textContent = "";
      }
      this.activeSuggestions = [];
      this.selectedSuggestionIndex = 0;
    }
    isSuggestionsVisible() {
      const isRibbonVisible = this.suggestionBar && !this.suggestionBar.classList.contains("hidden");
      const isGhostVisible = this.ghostTextEl && !this.ghostTextEl.classList.contains("hidden");
      return (isRibbonVisible || isGhostVisible) && this.activeSuggestions.length > 0;
    }
    applySuggestion(chosenWord) {
      if (!this.currentTarget || !chosenWord) return;
      const target = this.currentTarget;
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      if (this.activeSuggestionType === "autocomplete") {
        const wordInfo = isNative ? this.textReplacer.extractNativeWordBuffer(target) : this.textReplacer.extractContentEditableWordBuffer();
        const textToInsert = chosenWord + " ";
        if (isNative && wordInfo) {
          this.textReplacer.replaceInNativeInput(
            target,
            wordInfo.startIndex,
            wordInfo.endIndex,
            textToInsert
          );
        } else if (wordInfo) {
          this.textReplacer.replaceInContentEditable(
            target,
            wordInfo.word,
            textToInsert
          );
        }
        autoCompleteEngine.recordWordUsage(chosenWord);
        this.secondLastWordBeforeDelimiter = this.lastWordBeforeDelimiter;
        this.lastWordBeforeDelimiter = chosenWord;
        if (this.settings.nextWordEnabled !== false) {
          const nextWords = autoCompleteEngine.getNextWordSuggestions(chosenWord, 4, this.secondLastWordBeforeDelimiter);
          if (nextWords.length > 0) {
            this.showSuggestions(target, nextWords, "nextword");
            return;
          }
        }
        this.hideSuggestions();
      } else {
        let needsLeadingSpace = false;
        if (isNative) {
          const pos = target.selectionStart ?? target.value.length;
          const before = target.value.slice(0, pos);
          needsLeadingSpace = before.length > 0 && !before.endsWith(" ") && !before.endsWith("\n");
        } else {
          const sel = window.getSelection();
          if (sel && sel.rangeCount) {
            const range = sel.getRangeAt(0);
            const node = range.startContainer;
            if (node.nodeType === Node.TEXT_NODE) {
              const before = (node.textContent || "").slice(0, range.startOffset);
              needsLeadingSpace = before.length > 0 && !before.endsWith(" ") && !before.endsWith("\n");
            }
          }
        }
        const textToInsert = (needsLeadingSpace ? " " : "") + chosenWord + " ";
        if (isNative) {
          const pos = target.selectionStart ?? target.value.length;
          this.textReplacer.replaceInNativeInput(target, pos, pos, textToInsert);
        } else {
          this.textReplacer.replaceInContentEditable(target, "", textToInsert);
        }
        if (this.lastWordBeforeDelimiter) {
          autoCompleteEngine.recordWordTransition(this.lastWordBeforeDelimiter, chosenWord, this.secondLastWordBeforeDelimiter);
        }
        autoCompleteEngine.recordWordUsage(chosenWord);
        this.secondLastWordBeforeDelimiter = this.lastWordBeforeDelimiter;
        this.lastWordBeforeDelimiter = chosenWord;
        if (this.settings.nextWordEnabled !== false) {
          const nextWords = autoCompleteEngine.getNextWordSuggestions(chosenWord, 4, this.secondLastWordBeforeDelimiter);
          if (nextWords.length > 0) {
            this.showSuggestions(target, nextWords, "nextword");
            return;
          }
        }
        this.hideSuggestions();
      }
    }
    /* ========================================================================
     * Key Event Dispatcher
     * ======================================================================== */
    handleKeyDown(event) {
      if (event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey && (event.key === "u" || event.key === "U")) {
        const target2 = this.domObserver.getActiveElement();
        if (this.domObserver.isEligibleTarget(target2)) {
          const isNative = target2 instanceof HTMLInputElement || target2 instanceof HTMLTextAreaElement;
          const wordInfo = isNative ? this.textReplacer.extractNativeWordBuffer(target2) : this.textReplacer.extractContentEditableWordBuffer();
          if (wordInfo && wordInfo.word) {
            event.preventDefault();
            event.stopPropagation();
            const w = wordInfo.word;
            const lower = w.toLowerCase();
            const upper = w.toUpperCase();
            const title = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
            const nextCase = w === lower ? upper : w === upper ? title : lower;
            if (isNative) {
              this.textReplacer.replaceInNativeInput(target2, wordInfo.startIndex, wordInfo.endIndex, nextCase);
            } else {
              this.textReplacer.replaceInContentEditable(target2, w, nextCase);
            }
            this.avimEngine.lastTransformed = nextCase;
            return;
          }
        }
      }
      if (event.key === "Control") {
        if (event.repeat) return;
        if (this.settings.ctrlToggleEnabled !== false) {
          const now = Date.now();
          if (now - this.lastCtrlTime < 400) {
            this.toggleMethod();
            this.lastCtrlTime = 0;
          } else {
            this.lastCtrlTime = now;
          }
        }
        return;
      } else {
        this.lastCtrlTime = 0;
      }
      if (this.settings.method === IME_METHOD.OFF) {
        return;
      }
      if ((event.key === "ArrowDown" || event.key === "ArrowUp") && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey && this.isSuggestionsVisible() && this.settings.suggestionStyle !== "ghost_text") {
        const count = this.activeSuggestions.length;
        if (count > 0) {
          event.preventDefault();
          event.stopPropagation();
          if (event.key === "ArrowUp") {
            this.selectedSuggestionIndex = (this.selectedSuggestionIndex - 1 + count) % count;
          } else {
            this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % count;
          }
          this.updateSuggestionHighlight();
          return;
        }
      }
      if ((event.altKey || event.ctrlKey) && ["1", "2", "3", "4", "5"].includes(event.key) && this.isSuggestionsVisible() && this.settings.suggestionStyle !== "ghost_text") {
        const idx = parseInt(event.key, 10) - 1;
        if (this.activeSuggestions[idx]) {
          event.preventDefault();
          event.stopPropagation();
          this.applySuggestion(this.activeSuggestions[idx].word);
          return;
        }
      }
      if (event.key === "Tab" && this.isSuggestionsVisible()) {
        event.preventDefault();
        event.stopPropagation();
        if (this.settings.suggestionStyle === "ghost_text") {
          const candidate = this.activeSuggestions[0]?.word;
          if (candidate) {
            this.applySuggestion(candidate);
          }
          return;
        }
        const count = this.activeSuggestions.length;
        if (count > 0) {
          if (event.shiftKey) {
            this.selectedSuggestionIndex = (this.selectedSuggestionIndex - 1 + count) % count;
          } else {
            this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % count;
          }
          this.updateSuggestionHighlight();
        }
        return;
      }
      if (event.key === "ArrowRight" && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey && this.isSuggestionsVisible() && this.settings.suggestionStyle === "ghost_text") {
        const candidate = this.activeSuggestions[0]?.word;
        if (candidate) {
          event.preventDefault();
          event.stopPropagation();
          this.applySuggestion(candidate);
          return;
        }
      }
      if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey && this.isSuggestionsVisible()) {
        if (this.activeSuggestionType === "nextword") {
          this.hideSuggestions();
          this.lastWordBeforeDelimiter = "";
          this.secondLastWordBeforeDelimiter = "";
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        const candidate = this.activeSuggestions[this.selectedSuggestionIndex]?.word;
        if (candidate) {
          this.applySuggestion(candidate);
        }
        return;
      }
      if (event.key === "Enter") {
        this.hideSuggestions();
        this.lastWordBeforeDelimiter = "";
        this.secondLastWordBeforeDelimiter = "";
        const activeTarget = this.domObserver.getActiveElement();
        if (this.domObserver.isEligibleTarget(activeTarget)) {
          const isNative = activeTarget instanceof HTMLInputElement || activeTarget instanceof HTMLTextAreaElement;
          const wordInfo = isNative ? this.textReplacer.extractNativeWordBuffer(activeTarget) : this.textReplacer.extractContentEditableWordBuffer();
          if (wordInfo && wordInfo.word) {
            const currentWord = wordInfo.word;
            autoCompleteEngine.recordWordUsage(currentWord);
          }
        }
      }
      if (event.key === "Escape" && this.isSuggestionsVisible()) {
        event.preventDefault();
        event.stopPropagation();
        this.hideSuggestions();
        return;
      }
      if (event.ctrlKey && event.key === "Backspace" && !event.shiftKey && !event.altKey && !event.metaKey) {
        const target2 = this.domObserver.getActiveElement();
        if (this.domObserver.isEligibleTarget(target2)) {
          if (this.handleWholeWordErase(target2, event)) {
            return;
          }
        }
      }
      if (this.settings.wordRescue !== false && (event.ctrlKey && event.shiftKey && (event.key === "r" || event.key === "R") || event.altKey && !event.ctrlKey && !event.metaKey && (event.key === "r" || event.key === "R"))) {
        const target2 = this.domObserver.getActiveElement();
        if (this.domObserver.isEligibleTarget(target2)) {
          if (this.handleInstantRetroRescue(target2, event)) {
            return;
          }
        }
      }
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }
      const target = this.domObserver.getActiveElement();
      if (!this.domObserver.isEligibleTarget(target)) {
        return;
      }
      const key = event.key;
      if (key === "Escape") {
        if (this.handleEscapeRevert(target, event)) {
          return;
        }
      }
      if (this.settings.wordRescue !== false && this.settings.method !== IME_METHOD.OFF && key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        if (this.handleSelectionAccentRescue(target, key, event)) {
          return;
        }
      }
      if (key === "Backspace") {
        this.hideSuggestions();
        this._consecutiveBackspaces = (this._consecutiveBackspaces || 0) + 1;
        if (!this._backspaceSession) {
          this._backspaceSession = {
            raw: this.avimEngine.currentWordRaw || "",
            transformed: this.avimEngine.lastTransformed || "",
            initialLength: (this.avimEngine.lastTransformed || "").length,
            count: 0
          };
        }
        this._backspaceSession.count += 1;
        if (this.settings.debugTypingLog && this._consecutiveBackspaces >= 2) {
          if (this.avimEngine.lastTransformed && this.avimEngine.currentWordRaw) {
            this.recordTypingLog("backspace_delete", this.avimEngine.currentWordRaw, this.avimEngine.lastTransformed);
          }
        }
        if (this.handleBackspaceUndo(target, event)) {
          return;
        }
        if (this.avimEngine.currentWordRaw) {
          this.avimEngine.currentWordRaw = this.avimEngine.currentWordRaw.slice(0, -1);
        }
        if (this._backspaceSession && this._backspaceSession.raw && this._backspaceSession.transformed && this._backspaceSession.initialLength > 0 && this._backspaceSession.count >= this._backspaceSession.initialLength && (!this.avimEngine.currentWordRaw || this.avimEngine.currentWordRaw.length === 0)) {
          this.recordWordErase(this._backspaceSession.raw, this._backspaceSession.transformed);
          this._backspaceSession = null;
        }
        this.adoptWordBeforeBackspace(target, event);
      }
      if (key.length === 1) {
        this._consecutiveBackspaces = 0;
        this._backspaceSession = null;
        this.handleCharacterInput(target, key, event);
      }
    }
    handleWholeWordErase(target, event) {
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      const rawBefore = this.avimEngine.currentWordRaw || "";
      const transformedBefore = this.avimEngine.lastTransformed || "";
      if (isNative) {
        const pos = target.selectionStart ?? target.value.length;
        const textBefore = target.value.slice(0, pos);
        if (!textBefore) return false;
        const match = textBefore.match(/(\s*[\p{L}\p{N}_.:-]+|\s+|[^\s\p{L}\p{N}]+)$/u);
        if (match) {
          event.preventDefault();
          const deleteLen = match[0].length;
          const startReplace = pos - deleteLen;
          this.textReplacer.replaceInNativeInput(target, startReplace, pos, "");
          if (rawBefore && transformedBefore) {
            this.recordWordErase(rawBefore, transformedBefore);
          }
          this.avimEngine.resetWordSession();
          this.lastWordBeforeDelimiter = "";
          this.secondLastWordBeforeDelimiter = "";
          this.hideSuggestions();
          return true;
        }
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          const node = range.startContainer;
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || "";
            const pos = range.startOffset;
            const textBefore = text.slice(0, pos);
            const match = textBefore.match(/(\s*[\p{L}\p{N}_.:-]+|\s+|[^\s\p{L}\p{N}]+)$/u);
            if (match) {
              event.preventDefault();
              const deleteLen = match[0].length;
              const startReplace = pos - deleteLen;
              const newText = text.slice(0, startReplace) + text.slice(pos);
              node.textContent = newText;
              const newRange = document.createRange();
              newRange.setStart(node, startReplace);
              newRange.collapse(true);
              sel.removeAllRanges();
              sel.addRange(newRange);
              this.textReplacer.dispatchSyntheticInput(target, "");
              if (rawBefore && transformedBefore) {
                this.recordWordErase(rawBefore, transformedBefore);
              }
              this.avimEngine.resetWordSession();
              this.lastWordBeforeDelimiter = "";
              this.secondLastWordBeforeDelimiter = "";
              this.hideSuggestions();
              return true;
            }
          }
        }
      }
      return false;
    }
    shouldAutoCapitalize(target) {
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      let textBefore = "";
      if (isNative) {
        const pos = target.selectionStart ?? 0;
        textBefore = target.value.slice(0, pos);
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          try {
            let container = range.commonAncestorContainer;
            if (container.nodeType === Node.TEXT_NODE) {
              container = container.parentNode;
            }
            while (container && container !== target && !/^(P|DIV|LI|H[1-6]|BLOCKQUOTE|PRE|SECTION|ARTICLE)$/i.test(container.nodeName)) {
              container = container.parentNode;
            }
            const block = container || target;
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(block);
            preCaretRange.setEnd(range.startContainer, range.startOffset);
            textBefore = preCaretRange.toString();
          } catch (_) {
            let node = range.startContainer;
            let offset = range.startOffset;
            if (node.nodeType === Node.TEXT_NODE) {
              let text = (node.textContent || "").slice(0, offset);
              let prev = node.previousSibling;
              while (prev) {
                text = (prev.textContent || "") + text;
                prev = prev.previousSibling;
              }
              textBefore = text;
            }
          }
        }
      }
      if (/`/.test(textBefore)) {
        if (/`\s*$/.test(textBefore)) return false;
        const strippedClosed = textBefore.replace(/`[^`\n\r]*`/g, "");
        if (strippedClosed.includes("`")) return false;
        if (/`[^`\n\r]*`\s*$/.test(textBefore)) return false;
      }
      if (/([\/\\#@\$~+]|\-\-)$/.test(textBefore)) {
        return false;
      }
      if (/(?:Ctrl|Crtl|Shift|Alt|Cmd|Option|Command|Win|Super)\+[^\s.]+\s*$/i.test(textBefore)) {
        return false;
      }
      let context = textBefore;
      const quoteMatch = context.match(/([\x22\x27\u2018\u201C\u00AB\u2039\u201E\u201A]+)$/);
      if (quoteMatch) {
        context = context.slice(0, -quoteMatch[1].length);
        if (/:(\s*)$/.test(context)) return true;
      }
      if (!context || context.trim().length === 0) return true;
      if (/[\n\r]\s*$/.test(context)) return true;
      const match = context.match(/([.!?])(\s+)$/);
      if (match) {
        const trimmed = context.slice(0, -match[0].length).trim().toLowerCase();
        const lastWordMatch = trimmed.match(/([\p{L}\p{N}_.]+)$/iu);
        if (lastWordMatch) {
          const lastWord = lastWordMatch[1];
          const ABBRS = /* @__PURE__ */ new Set([
            "v.v",
            "tp",
            "ts",
            "ths",
            "gs",
            "mr",
            "mrs",
            "ms",
            "dr",
            "e.g",
            "i.e",
            "etc",
            "bs",
            "th",
            "vs",
            "co",
            "ltd",
            "inc",
            "corp",
            "no",
            "op",
            "cit"
          ]);
          if (ABBRS.has(lastWord)) return false;
        }
        return true;
      }
      return false;
    }
    handleEscapeRevert(target, event) {
      if (this._lastRescueState && this._lastRescueState.target === target) {
        const state = this._lastRescueState;
        this._lastRescueState = null;
        event.preventDefault();
        const isNative2 = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
        if (isNative2) {
          this.textReplacer.replaceInNativeInput(target, state.start, state.end, state.rawText);
        } else if (target.isContentEditable) {
          this.textReplacer.replaceInContentEditable(target, state.rescuedText, state.rawText);
        }
        this.hideSuggestions();
        this.showHudToast(`Hoàn tác: ${state.rawText}`, true);
        return true;
      }
      if (this.settings.escRevert === false) return false;
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      const wordInfo = isNative ? this.textReplacer.extractNativeWordBuffer(target) : this.textReplacer.extractContentEditableWordBuffer();
      if (wordInfo && wordInfo.word) {
        const currentWord = wordInfo.word;
        const rawBefore = this.avimEngine.currentWordRaw || currentWord;
        const revert = this.avimEngine.revertCurrentWord(wordInfo.word);
        if (revert.reverted) {
          event.preventDefault();
          if (isNative) {
            this.textReplacer.replaceInNativeInput(
              target,
              wordInfo.startIndex,
              wordInfo.endIndex,
              revert.result
            );
          } else {
            this.textReplacer.replaceInContentEditable(
              target,
              wordInfo.word,
              revert.result
            );
          }
          this.hideSuggestions();
          this.showHudToast(`Hoàn tác: ${revert.result}`, true);
          this.recordWordErase(rawBefore, currentWord);
          if (this.settings.debugTypingLog) {
            this.recordTypingLog("escape_revert", this.avimEngine.currentWordRaw || wordInfo.word, wordInfo.word, revert.result);
          }
          return true;
        }
      }
      return false;
    }
    /**
     * Automatic Habit Learning:
     * When a user completely deletes a word that had received Vietnamese diacritics
     * (via Backspacing the whole word, Ctrl+Backspace, or ESC revert) N or more times (configured by eraseHabitThreshold, default 3),
     * automatically learns and adds the word to userDictionary so it won't receive accents next time.
     * Can be toggled on/off via settings.eraseHabitLearning (default: true).
     */
    recordWordErase(rawCandidate, transformedWord) {
      if (this.settings.eraseHabitLearning === false) return false;
      if (!rawCandidate || !transformedWord) return false;
      const cleanTransformed = transformedWord.trim().toLowerCase();
      const hasDiacritics = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(cleanTransformed);
      if (!hasDiacritics) return false;
      if (getVietnameseWordSet().has(cleanTransformed)) {
        return false;
      }
      const raw = String(rawCandidate).trim().toLowerCase();
      if (raw.length < 2) return false;
      const currentCount = (this.erasedWordHabits.get(raw) || 0) + 1;
      this.erasedWordHabits.set(raw, currentCount);
      if (this.erasedWordHabits.size > 500) {
        const oldestKey = this.erasedWordHabits.keys().next().value;
        this.erasedWordHabits.delete(oldestKey);
      }
      this.saveHabitCountsToStorage();
      const threshold = Math.max(2, parseInt(this.settings.eraseHabitThreshold, 10) || 3);
      if (currentCount >= threshold) {
        if (userDictionary && typeof userDictionary.add === "function") {
          if (!userDictionary.has(raw)) {
            userDictionary.add(raw);
            this.showHudToast(`Đã tự học từ điển: "${raw}" (không bỏ dấu)`, true);
            return true;
          }
        }
      }
      return false;
    }
    async loadHabitCountsFromStorage() {
      try {
        const storage = typeof chrome !== "undefined" && chrome.storage && chrome.storage.local ? chrome.storage.local : typeof browser !== "undefined" && browser.storage && browser.storage.local ? browser.storage.local : null;
        if (storage) {
          const data = await storage.get(["avim_erased_word_habits"]);
          if (data && data.avim_erased_word_habits && typeof data.avim_erased_word_habits === "object") {
            for (const [k, v] of Object.entries(data.avim_erased_word_habits)) {
              if (typeof v === "number") {
                this.erasedWordHabits.set(k, v);
              }
            }
          }
        }
      } catch {
      }
    }
    async saveHabitCountsToStorage() {
      try {
        const storage = typeof chrome !== "undefined" && chrome.storage && chrome.storage.local ? chrome.storage.local : typeof browser !== "undefined" && browser.storage && browser.storage.local ? browser.storage.local : null;
        if (storage) {
          const obj = {};
          for (const [k, v] of this.erasedWordHabits.entries()) {
            obj[k] = v;
          }
          await storage.set({ avim_erased_word_habits: obj });
        }
      } catch {
      }
    }
    /**
     * Anonymous Debug Typing Log: records typing sessions where user Backspaced or Escaped
     * suspected diacritic mismatches to identify edge cases without intruding on privacy.
     */
    async recordTypingLog(action, raw, transformed, reverted = "") {
      if (!this.settings?.debugTypingLog) return;
      if (!raw && !transformed) return;
      try {
        const entry = {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          action,
          raw: String(raw || ""),
          transformed: String(transformed || ""),
          reverted: String(reverted || ""),
          host: typeof window !== "undefined" ? window.location?.hostname || "unknown" : "unknown"
        };
        const storage = typeof chrome !== "undefined" && chrome.storage && chrome.storage.local ? chrome.storage.local : typeof browser !== "undefined" && browser.storage && browser.storage.local ? browser.storage.local : null;
        if (storage) {
          const data = await storage.get(["openviet_typing_logs"]);
          const logs = Array.isArray(data.openviet_typing_logs) ? data.openviet_typing_logs : [];
          logs.push(entry);
          if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
          }
          await storage.set({ openviet_typing_logs: logs });
        }
      } catch {
      }
    }
    /**
     * Instant Retro-Rescue Hotkey Handler (Ctrl+Shift+R or Alt+R):
     * When user is typing and realizes they typed in raw Latin (or want to revert a word),
     * instantly converts the word immediately before the caret (or selected text) to accented Vietnamese,
     * or reverts an accented word back to raw keystrokes.
     */
    handleInstantRetroRescue(target, event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      let selectedText = "";
      let selStart = 0;
      let selEnd = 0;
      if (isNative) {
        selStart = target.selectionStart ?? 0;
        selEnd = target.selectionEnd ?? 0;
        if (selStart < selEnd) {
          selectedText = target.value.slice(selStart, selEnd);
        }
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount && !sel.isCollapsed) {
          selectedText = sel.toString();
        }
      }
      if (selectedText && selectedText.trim().length > 0) {
        const trimmed = selectedText.trim();
        const hasVnDiacritics = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(trimmed);
        let transformed = "";
        if (hasVnDiacritics) {
          const revert = this.avimEngine.revertCurrentWord(trimmed);
          transformed = revert.reverted ? revert.result : trimmed;
        } else {
          transformed = this.avimEngine.rescueWord(trimmed);
        }
        if (transformed && transformed !== trimmed) {
          const leadingSpace = selectedText.match(/^\s*/)[0];
          const trailingSpace = selectedText.match(/\s*$/)[0];
          const replacement = leadingSpace + transformed + trailingSpace;
          if (isNative) {
            this.textReplacer.replaceInNativeInput(target, selStart, selEnd, replacement);
            target.setSelectionRange(selStart + leadingSpace.length, selStart + leadingSpace.length + transformed.length);
          } else if (target.isContentEditable) {
            this.textReplacer.replaceInContentEditable(target, selectedText, replacement);
          }
          this.showHudToast(`Cứu chữ: ${transformed}`, true);
          return true;
        }
        return false;
      }
      const wordInfo = isNative ? this.textReplacer.extractNativeWordBuffer(target) : this.textReplacer.extractContentEditableWordBuffer();
      if (wordInfo && wordInfo.word) {
        const currentWord = wordInfo.word;
        const hasVnDiacritics = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(currentWord);
        let replacement = "";
        if (hasVnDiacritics) {
          const revert = this.avimEngine.revertCurrentWord(currentWord);
          replacement = revert.reverted ? revert.result : currentWord;
        } else {
          replacement = this.avimEngine.rescueWord(currentWord);
        }
        if (replacement && replacement !== currentWord) {
          if (isNative) {
            this.textReplacer.replaceInNativeInput(
              target,
              wordInfo.startIndex,
              wordInfo.endIndex,
              replacement
            );
          } else {
            this.textReplacer.replaceInContentEditable(
              target,
              currentWord,
              replacement
            );
          }
          this.hideSuggestions();
          this.showHudToast(`Cứu chữ: ${replacement}`, true);
          return true;
        }
      }
      return false;
    }
    /**
     * Selection Accent Rescue (Ngó Sen / vnchKey innovation):
     * When user selects a word (e.g. 'nhanh', 'hoa', 'tieng') and presses a tone key
     * (e.g. 's', 'f', 'r', 'x', 'j', 'z' or '1'-'5', '0'), modifies the diacritic tone
     * directly on the selection instead of replacing it with raw letter.
     */
    handleSelectionAccentRescue(target, key, event) {
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      let selectedText = "";
      let start = 0;
      let end = 0;
      if (isNative) {
        start = target.selectionStart ?? 0;
        end = target.selectionEnd ?? 0;
        if (start < end) {
          selectedText = target.value.slice(start, end);
        }
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount && !sel.isCollapsed) {
          selectedText = sel.toString();
        }
      }
      if (!selectedText || !/^[\p{L}\p{M}]+$/u.test(selectedText.trim())) {
        return false;
      }
      const trimmed = selectedText.trim();
      const rescued = this.avimEngine.applyAccentToSelection(trimmed, key);
      if (rescued && rescued !== trimmed) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === "function") {
          event.stopImmediatePropagation();
        }
        const leadingSpace = selectedText.match(/^\s*/)[0];
        const trailingSpace = selectedText.match(/\s*$/)[0];
        const replacement = leadingSpace + rescued + trailingSpace;
        if (isNative) {
          this.textReplacer.replaceInNativeInput(target, start, end, replacement);
          target.setSelectionRange(start + leadingSpace.length, start + leadingSpace.length + rescued.length);
        } else if (target.isContentEditable) {
          this.textReplacer.replaceInContentEditable(target, selectedText, replacement);
        }
        this.showHudToast(`Cứu dấu: ${rescued}`, true);
        return true;
      }
      return false;
    }
    /**
     * On-Activation Retroactive Word Rescue (Ngó Sen / vnchKey innovation):
     * When IME is switched from OFF to an active Vietnamese mode (Auto/Telex/VNI),
     * reads the surrounding unaccented text typed immediately before the caret
     * (e.g. 'Chaof banj, tieengs vieetj nef'), converts into accented Vietnamese
     * ('Chào bạn, tiếng việt nè'), and saves undo state for instant ESC revert.
     */
    performOnActivationWordRescue() {
      if (this.settings.wordRescue === false || this.settings.method === IME_METHOD.OFF) {
        return;
      }
      const target = this.domObserver.getActiveElement();
      if (!target || !this.domObserver.isEligibleTarget(target)) {
        return;
      }
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      let textBeforeCaret = "";
      let startIdx = 0;
      let endIdx = 0;
      if (isNative) {
        endIdx = target.selectionStart ?? target.value.length;
        const val = target.value || "";
        textBeforeCaret = val.slice(0, endIdx);
        const match = textBeforeCaret.match(/([^\n\r]{1,150})$/);
        if (match) {
          textBeforeCaret = match[1];
          startIdx = endIdx - match[1].length;
        }
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          let node = range.startContainer;
          let offset = range.startOffset;
          if (node.nodeType === Node.TEXT_NODE) {
            const val = node.textContent || "";
            textBeforeCaret = val.slice(0, offset);
            const match = textBeforeCaret.match(/([^\n\r]{1,150})$/);
            if (match) {
              textBeforeCaret = match[1];
              startIdx = offset - match[1].length;
              endIdx = offset;
            }
          }
        }
      }
      if (!textBeforeCaret || !textBeforeCaret.trim()) {
        return;
      }
      const rescued = this.avimEngine.rescueText(textBeforeCaret);
      if (rescued && rescued !== textBeforeCaret) {
        if (isNative) {
          this.textReplacer.replaceInNativeInput(target, startIdx, endIdx, rescued);
        } else if (target.isContentEditable) {
          this.textReplacer.replaceInContentEditable(target, textBeforeCaret, rescued);
        }
        this._lastRescueState = {
          target,
          start: startIdx,
          end: startIdx + rescued.length,
          rawText: textBeforeCaret,
          rescuedText: rescued
        };
        this.showHudToast(`Đã cứu chữ: ${rescued}`, true);
      }
    }
    handleBackspaceUndo(target, event) {
      if (!this.macroEngine.enabled || !this.macroEngine.autoUndo) return false;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        const pos = target.selectionStart ?? 0;
        const textBefore = target.value.slice(0, pos);
        const undoInfo = this.macroEngine.checkUndo(textBefore);
        if (undoInfo.undo) {
          event.preventDefault();
          const startReplace = pos - undoInfo.removeLength;
          const replacement = undoInfo.step === 1 ? "" : undoInfo.rawTrigger;
          this.textReplacer.replaceInNativeInput(target, startReplace, pos, replacement);
          return true;
        }
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          const node = range.startContainer;
          if (node.nodeType === Node.TEXT_NODE) {
            const textBefore = (node.textContent || "").slice(0, range.startOffset);
            const undoInfo = this.macroEngine.checkUndo(textBefore);
            if (undoInfo.undo) {
              event.preventDefault();
              const targetSlice = textBefore.slice(-undoInfo.removeLength);
              const replacement = undoInfo.step === 1 ? "" : undoInfo.rawTrigger;
              this.textReplacer.replaceInContentEditable(target, targetSlice, replacement);
              return true;
            }
          }
        }
      }
      return false;
    }
    /**
     * Adopt preceding word when Backspace erases a space delimiter.
     * e.g.: user types 'toan ' then hits Backspace -> caret is now right after 'toan'.
     * Re-adopting 'toan' allows the very next keystroke (like 's') to immediately modify
     * the word into 'toán' without needing to re-type the whole word.
     */
    adoptWordBeforeBackspace(target, event) {
      let textBefore = "";
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      if (isNative) {
        const pos = target.selectionStart ?? 0;
        textBefore = target.value.slice(0, pos);
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          const node = range.startContainer;
          if (node.nodeType === Node.TEXT_NODE) {
            textBefore = (node.textContent || "").slice(0, range.startOffset);
          }
        }
      }
      if (textBefore && textBefore.endsWith(" ")) {
        const trimmed = textBefore.slice(0, -1);
        const match = trimmed.match(/([\p{L}\p{M}]+)$/u);
        if (match) {
          const adopted = match[1];
          this.avimEngine.currentWordRaw = reverseVietnameseWord(adopted) || adopted;
          this.avimEngine.lastTransformed = adopted;
          this.lastWordBeforeDelimiter = "";
          this.secondLastWordBeforeDelimiter = "";
        }
      }
    }
    handleCharacterInput(target, key, event) {
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      let textBeforeCaret = "";
      if (isNative) {
        const pos = target.selectionStart ?? target.value.length;
        textBeforeCaret = target.value.slice(0, pos);
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          let node = range.startContainer;
          let offset = range.startOffset;
          if (node.nodeType === Node.TEXT_NODE) {
            textBeforeCaret = (node.textContent || "").slice(0, offset);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            let text = "";
            for (let i = 0; i < offset && i < node.childNodes.length; i++) {
              text += node.childNodes[i].textContent || "";
            }
            textBeforeCaret = text;
          }
        }
      }
      const wordInfo = isNative ? this.textReplacer.extractNativeWordBuffer(target) : this.textReplacer.extractContentEditableWordBuffer();
      const currentWord = wordInfo?.word || "";
      const isDevCheat = typeof window !== "undefined" && window.location ? isDeveloperCheatContext(window.location.hostname, target) : false;
      if (isDevCheat && /^[a-zA-Z0-9_.-]+$/.test(currentWord + key)) {
        const candidate = (currentWord + key).toLowerCase();
        const codeKeywords = /* @__PURE__ */ new Set([
          "user",
          "test",
          "error",
          "filter",
          "state",
          "props",
          "class",
          "function",
          "cost",
          "fast",
          "case",
          "core",
          "push",
          "data",
          "text",
          "next",
          "exit",
          "post"
        ]);
        if (codeKeywords.has(candidate)) {
          this.hideSuggestions();
          this.avimEngine.resetWordSession();
          return;
        }
      }
      if (isUrlOrEmailOrCode(textBeforeCaret, currentWord, key)) {
        this.hideSuggestions();
        this.avimEngine.resetWordSession();
        return;
      }
      if (this.macroEngine.enabled) {
        const snap = this.macroEngine.checkPunctuationSnap(key, textBeforeCaret);
        if (snap.snap) {
          event.preventDefault();
          if (isNative) {
            const pos = target.selectionStart ?? target.value.length;
            const startReplace = pos - snap.deleteLength;
            this.textReplacer.replaceInNativeInput(target, startReplace, pos, snap.snappedChar + " ");
          } else if (target.isContentEditable) {
            const sel = window.getSelection();
            if (sel && sel.rangeCount) {
              const range = sel.getRangeAt(0);
              const node = range.startContainer;
              if (node.nodeType === Node.TEXT_NODE) {
                this.textReplacer.replaceInContentEditable(target, " ", snap.snappedChar + " ");
              }
            }
          }
          this.avimEngine.resetWordSession();
          return;
        }
      }
      if (isDelimiter(key)) {
        if (wordInfo && wordInfo.word) {
          if (this.settings.emojiShortcuts !== false && currentWord.startsWith(":")) {
            const queryToken = currentWord.endsWith(":") ? currentWord : `${currentWord}:`;
            const emojiRes = checkEmojiShortcut(queryToken);
            if (emojiRes && emojiRes.match && emojiRes.emoji) {
              event.preventDefault();
              const fullReplacement = emojiRes.emoji + (key === " " ? " " : key);
              if (isNative) {
                this.textReplacer.replaceInNativeInput(
                  target,
                  wordInfo.startIndex,
                  wordInfo.endIndex,
                  fullReplacement
                );
              } else {
                this.textReplacer.replaceInContentEditable(
                  target,
                  currentWord,
                  fullReplacement
                );
              }
              this.hideSuggestions();
              this.avimEngine.resetWordSession();
              return;
            }
          }
          if (this.lastWordBeforeDelimiter) {
            autoCompleteEngine.recordWordTransition(this.lastWordBeforeDelimiter, currentWord, this.secondLastWordBeforeDelimiter);
          }
          autoCompleteEngine.recordWordUsage(currentWord);
          this.secondLastWordBeforeDelimiter = this.lastWordBeforeDelimiter;
          this.lastWordBeforeDelimiter = currentWord;
          const isSentenceTerminator = [".", "?", "!", "\n", "\r"].includes(key);
          const isAfterSentenceEnd = isSentenceTerminator || textBeforeCaret && /[.!?]\s*$/.test(textBeforeCaret);
          if (isAfterSentenceEnd) {
            this.hideSuggestions();
            this.lastWordBeforeDelimiter = "";
            this.secondLastWordBeforeDelimiter = "";
          } else if (this.settings.nextWordEnabled !== false) {
            setTimeout(() => {
              const nextList = autoCompleteEngine.getNextWordSuggestions(currentWord, 4, this.secondLastWordBeforeDelimiter);
              if (nextList && nextList.length > 0) {
                this.showSuggestions(target, nextList, "nextword");
              } else {
                this.hideSuggestions();
              }
            }, 10);
          }
          if (this.settings.autoRestoreEnglish !== false) {
            const restore = this.avimEngine.checkAutoRestore(currentWord);
            if (restore.restore) {
              event.preventDefault();
              const fullReplacement = restore.result + key;
              if (isNative) {
                this.textReplacer.replaceInNativeInput(
                  target,
                  wordInfo.startIndex,
                  wordInfo.endIndex,
                  fullReplacement
                );
              } else {
                this.textReplacer.replaceInContentEditable(
                  target,
                  currentWord,
                  fullReplacement
                );
              }
              this.avimEngine.resetWordSession();
              return;
            }
          }
          if (this.macroEngine.enabled) {
            const expansion = this.macroEngine.checkExpansion(currentWord, key);
            if (expansion.match) {
              event.preventDefault();
              if (expansion.requiresClipboard) {
                this.avimEngine.resetWordSession();
                this._expandClipboardMacro(target, isNative, wordInfo, currentWord, expansion, key);
                return;
              }
              const fullReplacement = expansion.expandedText + key;
              if (isNative) {
                this.textReplacer.replaceInNativeInput(
                  target,
                  wordInfo.startIndex,
                  wordInfo.endIndex,
                  fullReplacement
                );
              } else {
                this.textReplacer.replaceInContentEditable(
                  target,
                  currentWord,
                  fullReplacement
                );
              }
              this.avimEngine.resetWordSession();
              return;
            } else if (expansion.suppressed) {
              this.avimEngine.resetWordSession();
              return;
            }
          }
        }
        this.macroEngine.clearUndo();
        this.avimEngine.resetWordSession();
        return;
      }
      if (this.settings.emojiShortcuts !== false && key === ":") {
        let textBefore = "";
        if (isNative) {
          const pos = target.selectionStart ?? target.value.length;
          textBefore = target.value.slice(0, pos);
        } else if (target.isContentEditable) {
          const sel = window.getSelection();
          if (sel && sel.rangeCount) {
            const range = sel.getRangeAt(0);
            const node = range.startContainer;
            if (node.nodeType === Node.TEXT_NODE) {
              textBefore = (node.textContent || "").slice(0, range.startOffset);
            }
          }
        }
        const match = textBefore.match(/(:[a-zA-Z0-9_+-]+)$/);
        if (match) {
          const queryWithColon = match[1] + ":";
          const emojiRes = checkEmojiShortcut(queryWithColon);
          if (emojiRes && emojiRes.match && emojiRes.emoji) {
            const emoji = emojiRes.emoji;
            event.preventDefault();
            const matchStart = isNative ? (target.selectionStart ?? target.value.length) - match[1].length : 0;
            if (isNative) {
              this.textReplacer.replaceInNativeInput(
                target,
                matchStart,
                target.selectionStart ?? target.value.length,
                emoji + " "
              );
            } else {
              this.textReplacer.replaceInContentEditable(
                target,
                match[1],
                emoji + " "
              );
            }
            this.hideSuggestions();
            this.avimEngine.resetWordSession();
            return;
          }
        }
      }
      if (this.settings.method !== IME_METHOD.OFF && this.settings.autoCapitalize !== false && key.length === 1 && key >= "a" && key <= "z") {
        if (this.shouldAutoCapitalize(target)) {
          const upperChar = key.toUpperCase();
          this._blockedInputKey = key;
          setTimeout(() => {
            if (this._blockedInputKey === key) this._blockedInputKey = null;
          }, 50);
          event.preventDefault();
          if (isNative) {
            const pos = target.selectionStart ?? target.value.length;
            this.textReplacer.replaceInNativeInput(target, pos, pos, upperChar);
          } else {
            this.textReplacer.replaceInContentEditable(target, "", upperChar);
          }
          this.avimEngine.trackRawKey(upperChar);
          if (this.settings.autoCompleteEnabled !== false) {
            setTimeout(() => {
              const wInfo = isNative ? this.textReplacer.extractNativeWordBuffer(target) : this.textReplacer.extractContentEditableWordBuffer();
              if (wInfo && wInfo.word && wInfo.word.length >= 1) {
                const list = autoCompleteEngine.getSuggestions(wInfo.word, 4);
                if (list && list.length > 0) {
                  this.showSuggestions(target, list, "autocomplete", wInfo.word);
                } else {
                  this.hideSuggestions();
                }
              }
            }, 10);
          }
          return;
        }
      }
      if (this.settings.method !== IME_METHOD.OFF) {
        const wordInfo2 = isNative ? this.textReplacer.extractNativeWordBuffer(target) : this.textReplacer.extractContentEditableWordBuffer();
        if (wordInfo2) {
          const currentWord2 = wordInfo2.word || "";
          this.avimEngine.trackRawKey(key);
          const result = this.avimEngine.processKey(currentWord2, key);
          if (result.transformed) {
            this._blockedInputKey = key;
            setTimeout(() => {
              if (this._blockedInputKey === key) this._blockedInputKey = null;
            }, 50);
            event.preventDefault();
            event.stopPropagation();
            if (typeof event.stopImmediatePropagation === "function") {
              event.stopImmediatePropagation();
            }
            if (isNative) {
              this.textReplacer.replaceInNativeInput(
                target,
                wordInfo2.startIndex,
                wordInfo2.endIndex,
                result.result
              );
            } else {
              this.textReplacer.replaceInContentEditable(
                target,
                currentWord2,
                result.result
              );
            }
          }
        }
      }
      if (this.settings.autoCompleteEnabled !== false) {
        setTimeout(() => {
          const wInfo = isNative ? this.textReplacer.extractNativeWordBuffer(target) : this.textReplacer.extractContentEditableWordBuffer();
          if (wInfo && wInfo.word && wInfo.word.length >= 1) {
            const list = autoCompleteEngine.getSuggestions(wInfo.word, 4);
            if (list && list.length > 0) {
              this.showSuggestions(target, list, "autocomplete", wInfo.word);
            } else {
              this.hideSuggestions();
            }
          } else {
            this.hideSuggestions();
          }
        }, 10);
      }
    }
    toggleMethod() {
      const isCurrentlyOff = this.settings.method === IME_METHOD.OFF;
      if (isCurrentlyOff) {
        this.settings.method = this.previousMethod || IME_METHOD.AUTO;
      } else {
        this.previousMethod = this.settings.method;
        this.settings.method = IME_METHOD.OFF;
      }
      if (this.settings.perDomainMemory !== false && typeof window !== "undefined" && window.location) {
        const hostname = window.location.hostname.toLowerCase();
        if (hostname) {
          if (!this.settings.domainMethods) {
            this.settings.domainMethods = {};
          }
          this.settings.domainMethods[hostname] = this.settings.method;
          if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.set({ avim_domain_methods: this.settings.domainMethods }).catch(() => {
            });
          }
        }
      }
      this.applySettings();
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ avim_settings: this.settings }).catch(() => {
        });
      }
      const methodName = this.settings.method === IME_METHOD.VNI ? "VNI" : this.settings.method === IME_METHOD.TELEX ? "Telex" : this.settings.method === IME_METHOD.AUTO ? "Tự động" : "TẮT";
      const text = this.settings.method !== IME_METHOD.OFF ? `AVIM: BẬT (${methodName})` : "AVIM: TẮT (Tiếng Anh)";
      this.showHudToast(text, this.settings.method !== IME_METHOD.OFF);
      if (isCurrentlyOff && this.settings.method !== IME_METHOD.OFF) {
        this.performOnActivationWordRescue();
      }
    }
    showHudToast(text, isOn) {
      let toast = document.getElementById("__avim_hud_toast__");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "__avim_hud_toast__";
        Object.assign(toast.style, {
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: "2147483647",
          padding: "8px 14px",
          borderRadius: "8px",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: "13px",
          fontWeight: "600",
          lineHeight: "1.4",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#ffffff"
        });
        document.documentElement.appendChild(toast);
      }
      if (isOn) {
        toast.style.backgroundColor = "#047857";
        toast.style.border = "1px solid #10b981";
      } else {
        toast.style.backgroundColor = "#1e293b";
        toast.style.border = "1px solid #475569";
      }
      toast.textContent = "";
      const dot = document.createElement("span");
      Object.assign(dot.style, {
        display: "inline-block",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: isOn ? "#34d399" : "#94a3b8",
        boxShadow: isOn ? "0 0 6px #34d399" : "none"
      });
      const label = document.createElement("span");
      label.textContent = text;
      toast.appendChild(dot);
      toast.appendChild(label);
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
      clearTimeout(this._hudTimeout);
      this._hudTimeout = setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(6px)";
      }, 1500);
    }
    async _expandClipboardMacro(target, isNative, wordInfo, currentWord, expansion, key) {
      let clipboardText = "";
      try {
        if (navigator?.clipboard?.readText) {
          clipboardText = await navigator.clipboard.readText();
        }
      } catch {
        clipboardText = "";
      }
      const expandedText = this.macroEngine.finalizeClipboardExpansion(expansion, clipboardText);
      const fullReplacement = expandedText + key;
      if (isNative) {
        this.textReplacer.replaceInNativeInput(
          target,
          wordInfo.startIndex,
          wordInfo.endIndex,
          fullReplacement
        );
      } else {
        this.textReplacer.replaceInContentEditable(
          target,
          currentWord,
          fullReplacement
        );
      }
    }
  };
  if (typeof window !== "undefined") {
    window.__AVIM_XKEY__ = new AvimContentScript();
  }
})();
/**
 * Vietnamese Syllable Parser & Phonological Reconstructor
 * Ported and adapted from the Bamboo / vnchKey 5-component linguistic model:
 * Syllable = Onset + Glide + Nucleus + Coda + Tone
 *
 * @license Apache-2.0
 */
/**
 * Syllable Casing Harmonization & Unique Syllable Auto-Completion Engine
 * Inspired by modern Rust/C IME architectures (casing.rs & engine.rs).
 *
 * @license Apache-2.0
 */
/**
 * Vietnamese Dictionary & User Custom Dictionary Manager
 * Integrated from Hunspell Vietnamese (OpenOffice / Hồ Ngọc Đức / xKey)
 * Supports ~6,700 standard Vietnamese syllables, personal user dictionary,
 * English onset detection, and spell checking auto-restore.
 *
 * @license GPL / MIT
 */
/**
 * AVIM Engine Modernized (AVIM xKey Core)
 * Pure, zero-dependency Vietnamese diacritic state machine & vowel transformation.
 * Adapted from chung1905/avim-firefox and modernized for MV3 & WebExtensions.
 *
 * @license LGPL / Apache-2.0
 */
/**
 * Macro / Text Expansion Engine (Inspired by xmannv/xkey)
 * Handles macro lookup, casing preservation, word-boundary triggers, and Backspace undo.
 *
 * @license Apache-2.0
 */
/**
 * OpenViet IME Shared Configuration & Default Settings
 * Shared across Service Worker, Content Scripts, Options, and Popup.
 *
 * @license Apache-2.0
 */
/**
 * DOM Observer and Input Target Validator
 * Tracks focused elements, traverses open Shadow DOM roots, and filters out excluded inputs.
 *
 * @license Apache-2.0
 */
/**
 * Text Replacer and Caret / Selection Manager
 * Intercepts and replaces text in native inputs and contenteditable editors
 * with synthetic InputEvents and a ClipboardEvent('paste') adapter for Microsoft Teams Web (RoosterJS).
 *
 * @license Apache-2.0
 */
/**
 * Smart Emoji Shorthand Engine
 * Supports Vietnamese and English slack-style emoji triggers (:tim: -> ❤️, :cuoi: -> 😄)
 *
 * @license Apache-2.0
 */
/**
 * Vietnamese Auto-Complete, Next-Word Prediction & Gboard-Style Habit Learning Engine
 * Provides intelligent word auto-completion, next-word suggestions (bigram language model),
 * and personalized on-device habit learning similar to Google Gboard.
 *
 * @license Apache-2.0
 */
/**
 * AVIM xKey Content Script Entry Point
 * Listens for key events, coordinates IME diacritic transformation, macro expansion,
 * and on-page floating Gboard-style Next-Word Prediction & Auto-Complete suggestions.
 *
 * @license Apache-2.0
 */
