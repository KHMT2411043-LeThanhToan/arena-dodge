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

`fx` chỉ dùng cho hiệu ứng đã có sẵn trong `game.js`: `hero` (Superman), `moon` (Thủy Thủ Mặt Trăng), `puddle` (Heo Peppa), `cards` (Thủ Lĩnh Thẻ Bài), `beach` (Tiệc Bãi Biển). Hiệu ứng mới hoàn toàn cần viết thêm code trong `skinFx`.

Sprite nào xếp khung khác `pig.png` thì thêm `"anim"` để khai báo số khung (đánh số 1–24 theo hàng, đọc từ trái qua phải), ví dụ `"anim":{"idle":[1,2],"run":[4,5,6],"jump":[14],"apex":[15],"fall":[16],"crouch":[19,20,21],"dash":[22],"hurt":[23],"stun":[24]}`. Khóa nào bỏ trống sẽ dùng bảng mặc định. `apex` là khung lúc nhảy ở đỉnh. Cả 4 skin Thủy Thủ Mặt Trăng, Peppa, Thủ Lĩnh Thẻ Bài và Tiệc Bãi Biển (heo mặc bikini) đều dùng bảng `anim` này vì sprite có 22 khung, để trống ô 17 và 18.

**Câu hỏi.** Sửa `content/questions.json` (mỗi câu: `question`, `options`, `answer` 0–3, `difficulty` 1–3, `explanation`). Trong game cũng có nút nạp/xuất câu hỏi.

**Lõi.** Mỗi lõi trong `cores.json` có `t` (tên), `ic`, `d`, `tier` (`bac` / `vang` / `kim`) và `dur` (`"vinh"`, `"tuc"` hoặc số vòng).
- Sửa mô tả, bậc, thời hạn của lõi có sẵn: chỉ cần sửa JSON.
- Lõi mới chỉ bằng JSON, nếu chỉ là cộng xu hoặc hồi máu:
  `{"t":"Bão Vàng IV","ic":"🌕","d":"Nhận ngay 50 xu.","tier":"kim","dur":"tuc","effect":"coins","amount":50}`
  (`effect`: `coins` hoặc `heal`).
- Lõi có hiệu ứng mới (bay, đổi vật lý, ...) cần thêm code vào mảng `NEW4` (hoặc mảng tương tự) trong `game.js`, sau đó thêm một dòng vào `cores.json` để đặt bậc.

**Map.** Thêm một mục vào `maps.json` (`bg` là ảnh nền tùy chọn) và một mục cùng `id` vào `bosses.json`. Đạn `fav` là đạn hay xuất hiện, `no` là đạn không xuất hiện ở map đó.

**Đạn.** `bullets.json` cho phép chỉnh vòng bắt đầu xuất hiện (`at`), độ hiếm (`wt`), màu (`c`). Loại đạn mới hoàn toàn (kiểu bay mới) cần viết code trong bảng `BT` của `game.js`.

**Map có cơ chế riêng** (`mapTick` + `mapFx` trong `game.js`; ảnh nền ở `img/maps/`):
- `woods` Rừng Tinh Linh: nấm đàn hồi hai bên (`pads` trong `maps.json`) bật cao ~1.7 lần cú nhảy; gió phấn hoa mỗi 12–15 giây (vàng +20% tốc độ, tím −20% độ cao nhảy).
- `cityz` Thành Phố Z: còi báo động, mảnh bê tông/khung xe rơi (vòng cảnh báo 0.8 giây), nằm lại 5–6 giây làm bệ đứng và vật cản.
- `bamboo` Mặc Trúc Lâm: 3 bệ đốt trúc; gió thu mỗi 12 giây đẩy ngang trong 3 giây.

**Boss.** Đổi tên, màu, emoji, nhóm đạn trong `bosses.json`. Boss có cách đánh riêng (như khối lập phương) nằm trong `game.js`.

**Tinh Linh Vương** (boss map Rừng Tinh Linh, `ai: "spirit"`, code `spiritAI` + `drawSpirit`, sprite sheet `img/bosses/woods.png`): hai kỹ năng. Đạn Nguyên Tố đổi theo màu ngọc vương miện (báo trước 0.65s): Băng (quạt/bắn nhanh, tích Sương Giá), Độc (mưa đạn + bào tử làm nhảy thấp), Lửa (đạn cầu vồng nảy sàn), Hư Không (đạn xoắn ốc), Lôi (3 phát nhắm thẳng). Gối đầu từ vòng 2–3, pha 2 (dưới 40% máu) bắn cặp 2 nguyên tố. Rừng Tinh Linh Chúc Phúc: mất ~25% máu thì niệm hồi ~14% máu, bắn dồn đủ ngưỡng để phá vòng (boss choáng 1.5 giây). Chỉ niệm từ vòng 4 (khi người chơi bắn được).

**Truy Phong Đao Khách** (boss map Mặc Trúc Lâm, `ai: "blade"`, code `bladeAI` + `drawBlade`, sprite sheet 12 khung `img/bosses/bamboo.png`): đánh cả tầm xa lẫn cận chiến. Phong Kính Trảm (đao khí cao ép cúi, thấp ép nhảy), Truy Phong Đoạt Mệnh (tụ lực, lướt vồ, chém chéo rồi quét 360°), Mặc Trúc Loạn Đao (mưa đao khí + bão lá trúc), Ngự Đao Trảm Trúc (nhảy lên bệ trúc rồi bổ xuống nếu người chơi bám bệ quá lâu). Có combo ghép chiêu từ vòng 2 và Cuồng Phong Mặc Đao khi dưới 40% máu. Sau đòn nặng boss có 1 giây sơ hở.

**Lõi Trí Tuệ Quá Tải** (boss map Phòng Thí Nghiệm, `ai: "overload"`, code `overloadAI` + `drawOverload`) treo trên ray trần, đánh theo 3 chu kỳ: nhịp nhẹ (đạn gia tốc nối tiếp + laser tầm cao), nhịp dồn (laser tầm thấp, cầu điện từ, đạn bám trục X), quá tải (lõi đỏ, laser chéo/kép, mưa plasma). Trúng đòn gây nhiễu sóng (glitch). Vòng càng cao thì thời gian báo càng ngắn, sát thương càng lớn.

**Thiên Kiếp Thượng Nhân** (boss map Độ Kiếp Trận Pháp, `ai: "thunder"`, code `thunderAI` + `drawThunder` trong `game.js`) đánh theo chu kỳ 3 → 6 → 9 đạo sét, nghỉ 1.5–2 giây giữa các đợt. Không có chữ cảnh báo: 3 Lôi Cầu đổi màu và tốc độ xoay để báo đợt (xanh lam Khởi Kiếp, tím Chuyển Kiếp, vàng Tuyệt Kiếp). Vòng càng cao tia định vị càng ngắn và sét càng đau. Chạm tia lửa điện sẽ bị Tê Liệt ngắn (trừ khi có kháng điện).

**Thực Thể Dị Dạng** (boss map Hố Đen Kỳ Dị, `ai: "void"`, code `voidAI` + `drawVoid` trong `game.js`, sprite `img/bosses/void.png`: lưới 6 cột × 2 hàng, ô 192px, 12 khung) dịch chuyển qua Cổng Không Gian rồi tung 1 chiêu (vòng 1–2), combo 2 chiêu (vòng 3–7) hoặc combo 3 chiêu (vòng 8+), nghỉ 1.6–2.8 giây giữa các lần. Chiêu: **Mìn không gian** (hiện rõ 0.7 giây, mờ gần tàng hình, lóe 0.3 giây cuối rồi tan), **Hố đen mini** (hút hoặc đẩy, không gây sát thương), **Đạn xuyên cổng** (chui qua mép màn hình, bay sát sàn), **Vết cắt không gian** (báo trước 1–1.7 giây rồi bùng nổ), **Đảo trọng lực** (từ vòng 5: báo trước 1 giây, rơi lên trần 3.2–3.6 giây, nhảy để rơi xuống) và **Trọng lực yếu**. Khi đánh boss này, map không tự bật sự kiện trọng lực để boss điều khiển. Các loại đạn riêng `vmine`, `vwarp`, `vwell`, `vslit` nằm trong bảng `BT`, chỉ boss gọi ra.

**Thất Diện Quỷ Vương** (boss map Hầm Ngục Tối, `ai: "sins"`, code `sinAI` + `SK` + `drawSin` trong `game.js`, sprite `img/bosses/dungeon.png`: lưới 6 cột × 2 hàng, ô 192px). 7 mặt nạ = 7 kỹ năng, báo bằng vòng sáng + tên đúng màu mặt nạ ~1 giây trước khi ra đòn: **Kiêu Ngạo** (vệt sáng quét tầm đầu → phải cúi; nhảy bị cột sáng giáng), **Phẫn Nộ** (chuỗi cột lửa chạy ra hai phía, có khe hở), **Tham Lam** (xiềng xích kéo về phía boss, lướt để thoát + mưa tinh thể), **Đố Kỵ** (độn ra sau lưng, gai bóng tối ngắm thẳng + bóng ma lặp lại đường đi cũ), **Dục Vọng** (cầu lửa xoắn ốc nhiều lớp), **Phàm Ăn** (miệng quỷ cắn rồi để lại vũng axit 3.4 giây), **Lười Biếng** (vùng sóng âm làm chậm nửa phòng + cầu hắc ám trôi chậm). Vòng 1–5 mỗi lượt 1 mặt nạ; từ vòng 6 hợp kích 2 mặt nạ (`SIN_PAIRS`). Giữa các lượt boss đổi chỗ bằng độn thổ hoặc lướt chém (từ vòng 3). Các đạn `sinfire`, `sinspike`, `sinshard`, `sinorb`, `sinshade` chỉ boss gọi ra.

**Vòng có boss không sinh đạn thường và không có sự kiện map**: chỉ còn đạn/chiêu của boss (`spawnTick` và `evTick` dừng khi `G.boss` còn sống).

**Tuyết Nữ** (boss map Bão Tuyết Đỉnh Băng, `ai: "yuki"`, code `yukiAI` + `YK` + `drawYuki` trong `game.js`, sprite `img/bosses/ice.png`: lưới 6 cột × 2 hàng, ô 192px). Boss yếu nhất, ít chiêu nhất, thiên về khống chế. **Sương Giá** (0→5 tầng): mỗi đòn lạnh +1 tầng, mỗi tầng -6% tốc độ chạy, đủ 5 tầng thì đóng băng 1.8 giây (bấm nhảy/lướt liên tục để phá sớm) và Tuyết Nữ lập tức tung Nhũ Băng trừng phạt; né sạch 3.8 giây thì tan dần -1 tầng/giây (kháng băng `imm.ice` miễn tích tầng). **Gió bão tuyết** 10–12 giây/lần (báo trước 1.6 giây bằng tuyết bay xiên): đẩy người chơi, trên không bị đẩy mạnh hơn dưới sàn, hoa tuyết trôi theo gió. 3 chiêu: **Hơi Thở Hàn Sương** (quét tầm cao → cúi, tầm thấp → nhảy; đứng lì trong luồng +2 tầng), **Hoa Tuyết Trôi Gió** (2–3 bông, vòng 5+ thêm 1), **Nhũ Băng Vỡ Mảnh** (rơi từ trần, vỡ thành 2 mảnh trượt trên sàn; đòn đau nhất của boss này). Các đạn `yukibloom`, `yukiicicle`, `yukishard` chỉ boss gọi ra. Sát thương: chiêu khống chế = nửa sát thương đạn thường, nhũ băng = sát thương đạn thường trừ 1 (+1 nếu đang bị đóng băng).

**Sinh Vật 000** (boss map Trạm Vũ Trụ, `ai: "sv0"`, code `sv0AI` + `SV` + `drawSv0` trong `game.js`, sprite `img/bosses/space.png`: 6 cột × 2 hàng, ô 192px; thay boss demo "Kẻ Du Hành Hư Không"). Trọng lực thấp 80% trong suốt trận. 4 chiêu, nghỉ 1.1–2.3 giây giữa các lần: **Cầu Axit Nảy** (2–3 cầu nảy 2–3 nhịp giữa sàn), **Khóa Laser Trần** (tia đỏ đuổi theo 0.6–0.75 giây, khóa 0.2 giây, lao chéo rồi chém đuôi sát sàn báo trước 0.4 giây), **Kén Ký Sinh** (2 kén vô hại, sau 2 giây nứt thả ấu trùng chạy sát sàn), **Xung Điện Đột Biến** (từ vòng 3: còi báo động 1 giây, 2–3 vòng sóng có khe hở, kích nổ sớm kén). Combo từ vòng 5 (Axit→Laser, Kén→Axit), vòng 8+ thêm Kén→Xung Điện. Đạn `svacid`, `svpod`, `svlarva`, `svring` chỉ boss gọi ra; sát thương = đạn thường (kén vô hại).

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
