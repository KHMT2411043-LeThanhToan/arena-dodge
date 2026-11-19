# Arena Dodge & Quiz Survival

Game né đạn + trả lời câu hỏi. Tách từ bản v8 thành các file nhỏ để thêm nội dung mà không phải đọc code.

## Cấu trúc

```
index.html         khung game (HTML + CSS)
boot.js            nạp content/*.json rồi chạy game.js
game.js            logic game (ít khi phải sửa)
content/
  skins.json       skin trong cửa hàng
  maps.json        map (màu, bục đứng, đạn ưa/không ưa, ảnh nền)
  bosses.json      boss của từng map
  cores.json       lõi: tên, biểu tượng, mô tả, bậc, thời hạn
  bullets.json     chỉnh thông số đạn + mô tả trong phần Trợ giúp
  questions.json   ngân hàng câu hỏi mặc định
img/
  skins/ maps/ bosses/
tools/
  check.js         kiểm tra tự động
  build.js         gộp thành 1 file HTML duy nhất
```

## Thêm nội dung

**Skin mới (chỉ JSON + ảnh).** Bỏ ảnh sprite 6 cột × 4 hàng (23 khung, giống `img/skins/pig.png`) vào `img/skins/`, rồi thêm vào `content/skins.json`:

```json
{"id":"tho_vang","name":"Thỏ Vàng","price":600,"img":"img/skins/tho_vang.png"}
```

`fx` (ví dụ `"fx":"hero"`) chỉ dùng cho hiệu ứng đã có sẵn trong `game.js`. Hiệu ứng mới hoàn toàn cần viết thêm code.

**Câu hỏi.** Sửa `content/questions.json` (mỗi câu: `question`, `options`, `answer` 0–3, `difficulty` 1–3, `explanation`). Trong game cũng có nút nạp/xuất câu hỏi.

**Lõi.** Mỗi lõi trong `cores.json` có `t` (tên), `ic`, `d`, `tier` (`bac` / `vang` / `kim`) và `dur` (`"vinh"`, `"tuc"` hoặc số vòng).
- Sửa mô tả, bậc, thời hạn của lõi có sẵn: chỉ cần sửa JSON.
- Lõi mới chỉ bằng JSON, nếu chỉ là cộng xu hoặc hồi máu:
  `{"t":"Bão Vàng IV","ic":"🌕","d":"Nhận ngay 50 xu.","tier":"kim","dur":"tuc","effect":"coins","amount":50}`
  (`effect`: `coins` hoặc `heal`).
- Lõi có hiệu ứng mới (bay, đổi vật lý, ...) cần thêm code vào mảng `NEW4` (hoặc mảng tương tự) trong `game.js`, sau đó thêm một dòng vào `cores.json` để đặt bậc.

**Map.** Thêm một mục vào `maps.json` (`bg` là ảnh nền tùy chọn) và một mục cùng `id` vào `bosses.json`. Đạn `fav` là đạn hay xuất hiện, `no` là đạn không xuất hiện ở map đó.

**Đạn.** `bullets.json` cho phép chỉnh vòng bắt đầu xuất hiện (`at`), độ hiếm (`wt`), màu (`c`). Loại đạn mới hoàn toàn (kiểu bay mới) cần viết code trong bảng `BT` của `game.js`.

**Boss.** Đổi tên, màu, emoji, nhóm đạn trong `bosses.json`. Boss có cách đánh riêng (như khối lập phương) nằm trong `game.js`.

## Kiểm tra

```
npm install          # một lần, để có jsdom
node tools/check.js  # kiểm tra dữ liệu + chạy thử từng skin, map, đạn, boss, lõi
node tools/check.js --no-smoke   # chỉ kiểm tra dữ liệu (không cần npm install)
```

Lệnh báo rõ file nào, mục nào lỗi (thiếu trường, ảnh không tồn tại, đạn trong `fav` không có trong `bullets.json`...). Thư mục `.github/workflows/check.yml` làm GitHub tự chạy kiểm tra mỗi lần bạn đẩy bản mới.

## Chạy và phát hành

- **Chơi qua GitHub Pages:** bật Pages cho repo (Settings → Pages → Deploy from branch → `main` / root). Link cố định dạng `https://tenban.github.io/ten-repo/`. Skin, xu, thành tựu lưu trong trình duyệt theo địa chỉ này nên vẫn còn khi bạn cập nhật bản mới.
- **Chạy thử trên máy:** `npx serve` rồi mở địa chỉ hiện ra. Không mở trực tiếp `index.html` bằng cách bấm đúp, vì trình duyệt chặn việc đọc file JSON.
- **Gửi 1 file qua Zalo:** `node tools/build.js` tạo `dist/arena-dodge.html` (đủ ảnh và dữ liệu). File này chạy được khi mở từ Zalo, nhưng dữ liệu người chơi gắn với đúng file đó, nên mỗi bản gửi mới là dữ liệu mới.

## Xuất / nhập dữ liệu người chơi

Trong **Cửa hàng skin** có hai nút: **Xuất dữ liệu** (xu, skin đã mua, kỷ lục, cài đặt, ngân hàng câu hỏi, kèm số phiên bản) và **Nhập dữ liệu**. Dùng khi đổi máy, đổi địa chỉ repo, hoặc chuyển từ file Zalo sang link GitHub Pages. File từ phiên bản game mới hơn sẽ bị từ chối để tránh hỏng dữ liệu. Khi đổi cấu trúc dữ liệu, tăng `SAVE_VERSION` trong `game.js` và thêm bước nâng cấp vào `migrateSave`.
