Dưới đây là bản vá gọn nhẹ (minimal diff) cho 3 điểm trên, giữ nguyên cấu trúc code và không làm phình thêm logic:

1. src/content/content.js

Chặn sự kiện lan truyền ở shouldAutoCapitalize (tránh lặp chữ đầu câu) và tăng debounce gợi ý lên 80ms (tránh đọc DOM chồng chéo khi gõ nhanh):
diff
--- a/src/content/content.js
+++ b/src/content/content.js
@@ -1011,6 +1011,10 @@
         clearTimeout(this._blockClearTimer);
         this._blockClearTimer = setTimeout(() => { this._blockedInputKey = null; }, 80);
         event.preventDefault();
+        event.stopPropagation();
+        if (typeof event.stopImmediatePropagation === 'function') {
+          event.stopImmediatePropagation();
+        }
         if (isNative) {
           const pos = target.selectionStart ?? target.value.length;
           this.textReplacer.replaceInNativeInput(target, pos, pos, upperChar);
@@ -1084,7 +1088,7 @@
         } else {
           this.hideSuggestions();
         }
-      }, 10);
+      }, 80);
     }
   }
Use code with caution.

2. src/content/text-replacer.js

Bỏ lệnh phát sự kiện beforeinput thừa trước execCommand('insertText') để tránh trình soạn thảo web chèn 2 lần cho cùng một phím:
diff
--- a/src/content/text-replacer.js
+++ b/src/content/text-replacer.js
@@ -183,9 +183,6 @@
         // 3. Standard Rich Editors (TipTap/ProseMirror, Lexical, Slate)
         try {
           sel.removeAllRanges();
           sel.addRange(replaceRange);
-
-          // Dispatch beforeinput with insertReplacementText if supported
-          this.dispatchBeforeInput(root, nfcNewText, replaceRange);
 
           if (document.execCommand('insertText', false, nfcNewText)) {
             const isLexical = root.hasAttribute?.('data-lexical-editor') || root.closest?.('[data-lexical-editor]');
Use code with caution.

3. src/engine/avim.js

Chỉ chặn biến đổi tiếng Việt với các mã kỹ thuật dạng chữ + số (như mp3, h2o, f88, fcitx5), không khóa cứng các chuỗi gõ nhầm số trước nguyên âm trong VNI:
diff
--- a/src/engine/avim.js
+++ b/src/engine/avim.js
@@ -345,7 +345,7 @@
     // If the word already contains any digits (e.g. 'icon6', 'mp3', 'h2o', 'f88'),
     // underscores, @, or path slashes (code / URL / email identifiers),
     // pass key through literally without applying IME diacritics.
-    if (/\d/.test(word) || word.includes('_') || word.includes('@') || word.includes('/')) {
+    if (word.includes('_') || word.includes('@') || word.includes('/') || /^[a-zA-Z]+\d+$/.test(word)) {
       const newWord = word + key;
       this.lastTransformed = newWord;
       return { transformed: false, result: newWord };
Use code with caution.

Lệnh kiểm tra & đóng gói lại

Sau khi áp dụng 3 đoạn trên, bạn chạy:
bash
npm test && npm run build
Use code with caution.
Rồi bấm Reload extension trên trình duyệt là xong.
Bạn muốn mình kiểm tra thêm phần cấu hình mặc định (src/engine/config.js) hay chạy thử tình huống gõ đặc biệt nào khác trước khi bạn đóng gói bản phát hành không?
