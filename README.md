# ⭐ Bảng Sao Của Bé

Một web app **đơn giản, nhiều màu sắc** giúp ba mẹ chấm điểm cho bé 6–7 tuổi:

- 👨‍👩‍👧 **Nhiều hồ sơ**: tạo nhiều bé, mỗi bé có điểm & lịch sử riêng, chuyển nhanh bằng cách bấm avatar
- 📷 **Ảnh đại diện**: chọn emoji ngộ nghĩnh **hoặc chụp/đặt ảnh thật** cho bé (ảnh được thu nhỏ, lưu ngay trên máy)
- 🏆 **Hệ thống cấp độ**: mỗi 20 sao lên 1 cấp, có màn ăn mừng "Lên cấp!"
- ✅ **Cộng sao** khi bé làm việc tốt / việc nhà (đánh răng, dọn giường, giúp ba mẹ…)
- ❌ **Trừ sao** khi bé chưa ngoan (cãi lời, mè nheo, nói dối…)
- 🎁 **Đổi phần thưởng** khi tích đủ sao (que kem, xem hoạt hình, đi công viên…)
- 🎉 Hiệu ứng **bắn sao tại chỗ bấm, pháo hoa, linh vật nhảy múa, lời khen** + âm thanh vui
- 🌈 Nền trời chuyển màu động với mây, bóng bay, ngôi sao bay lơ lửng
- 📒 Lưu lịch sử trong ngày, có nút **Hoàn tác**
- 🔒 Khu **Cài đặt** có khoá mật khẩu (mặc định `1234`) để bé không tự sửa

Tất cả dữ liệu lưu **ngay trên máy** (localStorage) — không cần internet sau lần mở đầu,
không cần đăng nhập, không thu thập thông tin.

---

## 📱 Cài trên iPhone 6s (dạng app ngoài màn hình chính)

iPhone 6s chạy được. Cần đưa app lên một địa chỉ web **https** trước, rồi thêm vào màn hình chính.

### Bước 1 — Đưa app lên mạng (chọn 1 cách)

**Cách dễ nhất: GitHub Pages (miễn phí)**
1. Vào repo trên GitHub → **Settings → Pages**
2. Mục *Source* chọn nhánh chứa code (ví dụ `claude/eager-faraday-oc515u`) và thư mục `/ (root)` → **Save**
3. Đợi 1–2 phút, GitHub cho một đường link dạng `https://<tên-bạn>.github.io/new3/`

> Cũng có thể dùng Netlify Drop (kéo-thả thư mục) hoặc bất kỳ hosting tĩnh nào.

### Bước 2 — Thêm vào màn hình chính trên iPhone
1. Mở **Safari** (phải là Safari, không phải Chrome) và vào đường link ở trên
2. Bấm nút **Chia sẻ** (hình ô vuông có mũi tên) ở thanh dưới
3. Chọn **Thêm vào MH chính / Add to Home Screen**
4. Đặt tên rồi bấm **Thêm**

Giờ trên màn hình iPhone sẽ có icon ngôi sao ⭐. Bé bấm vào là mở **toàn màn hình** như một app thật và **xem được khi không có mạng**.

---

## 🖥️ Chạy thử trên máy tính

Service worker cần `http`/`https` nên hãy mở qua một server tĩnh nhỏ:

```bash
# Python (có sẵn trên macOS/Linux)
python3 -m http.server 8000
# rồi mở http://localhost:8000
```

Mở thẳng file `index.html` bằng `file://` vẫn dùng được, chỉ là tính năng "offline" sẽ không bật.

---

## ⚙️ Tuỳ chỉnh

**Bấm avatar (góc trái trên)** — không cần mật khẩu — để:
- Chuyển giữa các bé
- ➕ Thêm bé mới
- ✏️ Sửa hồ sơ: đổi **tên**, chọn **emoji** hoặc **📷 chọn ảnh thật** làm avatar

**Bấm ⚙️ (góc phải, mật khẩu mặc định 1234)** để:
- Thêm/xoá **hồ sơ các bé**
- Thêm/sửa/xoá danh sách **việc tốt, chưa ngoan, phần thưởng** và số điểm
- Đổi **mật khẩu**
- **Đặt lại điểm** của bé đang chọn hoặc **khôi phục danh sách mặc định**

---

## 📂 Cấu trúc

| File | Vai trò |
|------|---------|
| `index.html` | Khung giao diện |
| `styles.css` | Màu sắc, bố cục thân thiện với trẻ |
| `app.js` | Toàn bộ logic (điểm, lịch sử, cài đặt) |
| `manifest.webmanifest` | Cho phép cài như app |
| `sw.js` | Service worker — chạy offline |
| `icons/` | Icon ngôi sao |
| `tools/make_icons.py` | Script tạo lại icon (không bắt buộc chạy) |
