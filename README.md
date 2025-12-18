# 🎲 Tools Đổ Rác - Lắc Xí Ngầu Real-time

Ứng dụng quay random để chọn người đổ rác, có tính năng đăng nhập và real-time synchronization qua WebSocket.

## ✨ Tính năng

- ✅ **Đăng nhập bắt buộc**: Người xem phải nhập tên trước khi vào
- ✅ **Loại trừ viewer**: Người đang xem sẽ KHÔNG bị quay trúng
- ✅ **Real-time sync**: Tất cả người xem thấy quá trình quay cùng lúc qua WebSocket
- ✅ **Hiển thị online users**: Xem ai đang online
- ✅ **Lịch sử đổ rác**: Theo dõi ai đã đổ bao nhiêu lần
- ✅ **Nhắc nhở tự động**: Gửi webhook đến Lark khi cần nhắc
- ✅ **Responsive UI**: Giao diện đẹp, hoạt động tốt trên mobile

## 🚀 Cài đặt

```bash
# Clone repo
git clone <repo-url>
cd tools_do_rac

# Cài đặt dependencies
npm install

# Chạy server
npm start
# hoặc
node server.js
```

## 📖 Hướng dẫn sử dụng

1. **Truy cập ứng dụng**:
   - Máy local: http://localhost:5000
   - Máy khác trong mạng: http://<IP>:5000

2. **Đăng nhập**:
   - Nhập tên của bạn
   - Tên này sẽ được loại khỏi danh sách quay
   - Bạn sẽ thấy ai đang online

3. **Quay đổ rác**:
   - Bấm nút "LẮC XÍ NGẦU"
   - Tất cả người online sẽ thấy animation cùng lúc
   - Kết quả sẽ loại trừ tất cả người đang xem

4. **Nhắc nhở**:
   - Bấm "Nhắc nhở" để gửi thông báo qua Lark webhook
   - Số lần nhắc sẽ được ghi nhận

5. **Xác nhận hoàn thành**:
   - Người được chọn bấm "Xác nhận đã đổ"
   - Lịch sử sẽ được lưu lại

## 🔧 Cấu hình

### Webhook URL
Sửa URL webhook trong file `server.js`:

```javascript
const WEBHOOK_URL = 'https://open.larksuite.com/open-apis/bot/v2/hook/YOUR_WEBHOOK_ID';
```

### Port
Thay đổi port trong file `server.js`:

```javascript
const PORT = 5000; // Đổi sang port khác nếu cần
```

## 📁 Cấu trúc project

```
tools_do_rac/
├── server.js              # Backend server với WebSocket
├── package.json           # Dependencies
├── README.md             # File này
├── data/
│   └── do_rac_data.json  # Lưu trữ data
└── public/
    ├── index.html        # Trang chính
    └── login.html        # Trang đăng nhập
```

## 🌐 API Endpoints

- `GET /api/data` - Lấy toàn bộ data
- `POST /api/data` - Cập nhật data
- `POST /api/roll` - Quay chọn người (loại trừ viewer)
- `POST /api/remind` - Gửi nhắc nhở
- `POST /api/confirm` - Xác nhận đã đổ rác
- `POST /api/reset` - Reset toàn bộ

## 🔌 WebSocket Events

### Client → Server
- `login` - Đăng nhập với username

### Server → Client
- `init` - Data khởi tạo
- `dataUpdate` - Data được cập nhật
- `onlineUsers` - Danh sách online users
- `rolling` - Bắt đầu animation quay
- `rollResult` - Kết quả quay
- `completed` - Hoàn thành đổ rác

## 💡 Tips

- Mọi người có thể đăng nhập cùng tên và tất cả sẽ được loại khỏi danh sách quay
- Data được lưu tự động vào file `data/do_rac_data.json`
- Khi mất kết nối, WebSocket sẽ tự động reconnect sau 3 giây
- Chỉ người đầu tiên bấm "Lắc xí ngầu" mới kích hoạt được animation

## 🎨 Screenshots

### Trang đăng nhập
- Nhập tên để vào xem quay

### Trang chính
- Hiển thị online users
- Animation quay xí ngầu real-time
- Lịch sử đổ rác
- Quản lý thành viên

## 📝 License

MIT
