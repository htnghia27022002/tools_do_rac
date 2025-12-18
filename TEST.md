# 🧪 Test Cases - Tools Đổ Rác

## Kiểm tra tính năng

### 1. ✅ Đăng nhập
- [ ] Truy cập http://localhost:5000 → tự động redirect sang /login.html
- [ ] Không thể submit form nếu tên trống
- [ ] Không thể submit nếu tên < 2 ký tự
- [ ] Không thể submit nếu tên > 50 ký tự
- [ ] Sau khi đăng nhập thành công → redirect về /
- [ ] Tên hiển thị ở góc trên bên trái
- [ ] Refresh trang vẫn giữ phiên đăng nhập

### 2. ✅ WebSocket Real-time
- [ ] Khi đăng nhập, kết nối WebSocket thành công
- [ ] Status bar hiển thị "Đã kết nối WebSocket ✓"
- [ ] Khi mất kết nối, hiển thị "Mất kết nối! Đang kết nối lại..."
- [ ] Tự động reconnect sau 3 giây

### 3. ✅ Online Users
- [ ] Hiển thị số người online
- [ ] Hiển thị danh sách người online với badge
- [ ] Người đang xem có badge màu xanh primary và text "(Bạn)"
- [ ] Khi có người mới vào, danh sách tự động update (không cần refresh)
- [ ] Khi có người rời đi, danh sách tự động update

### 4. ✅ Quay đổ rác (Loại trừ viewer)
**Setup**: Có 5 thành viên: A, B, C, D, E

**Test 1**: Một người xem
- [ ] User "A" đăng nhập
- [ ] Bấm "LẮC XÍ NGẦU"
- [ ] Kết quả KHÔNG BAO GIỜ là "A"
- [ ] Chỉ có thể ra: B, C, D, hoặc E

**Test 2**: Nhiều người xem cùng lúc (QUAN TRỌNG!)
- [ ] User "A" đăng nhập trên tab 1
- [ ] User "B" đăng nhập trên tab 2
- [ ] User "C" đăng nhập trên tab 3
- [ ] Bất kỳ ai bấm "LẮC XÍ NGẦU"
- [ ] **TẤT CẢ 3 TAB đều thấy animation cùng lúc**
- [ ] Kết quả KHÔNG BAO GIỜ là A, B, hoặc C
- [ ] Chỉ có thể ra: D hoặc E

**Test 3**: Tất cả mọi người đều xem
- [ ] 5 user đăng nhập (A, B, C, D, E)
- [ ] Bấm "LẮC XÍ NGẦU"
- [ ] Hiển thị lỗi: "Không có thành viên nào khác để quay"

**Test 4**: Double click prevention
- [ ] Bấm "LẮC XÍ NGẦU" 2 lần nhanh
- [ ] Chỉ quay 1 lần
- [ ] Button bị disable trong quá trình quay

### 5. ✅ Animation Real-time
- [ ] Khi bấm quay, slot machine hiển thị
- [ ] Xí ngầu thay đổi emoji liên tục
- [ ] Slot names cuộn dần chậm lại (easing)
- [ ] Sau 3 giây, hiển thị kết quả với animation bounceIn
- [ ] **Tất cả người xem thấy cùng animation và kết quả giống nhau**

### 6. ✅ Nhắc nhở
- [ ] Sau khi quay xong, hiển thị button "Nhắc nhở"
- [ ] Bấm nhắc lần 1 → badge màu xám
- [ ] Bấm nhắc lần 2 → badge màu vàng warning
- [ ] Bấm nhắc lần 3+ → badge màu đỏ với animation pulse
- [ ] Webhook được gửi với message tương ứng số lần nhắc
- [ ] Tất cả người xem thấy cập nhật số lần nhắc real-time

### 7. ✅ Xác nhận hoàn thành
- [ ] Bấm "Xác nhận đã đổ"
- [ ] Toast hiển thị: "✅ [Tên] đã đổ rác xong!"
- [ ] Lịch sử được cập nhật
- [ ] UI reset về trạng thái ban đầu
- [ ] Button "LẮC XÍ NGẦU" hiển thị lại
- [ ] **Tất cả người xem thấy cập nhật cùng lúc**

### 8. ✅ Quản lý thành viên
- [ ] Thêm thành viên mới
- [ ] Tất cả người xem thấy thành viên mới
- [ ] Xóa thành viên
- [ ] Tất cả người xem thấy danh sách cập nhật

### 9. ✅ Lịch sử
- [ ] Hiển thị đúng người đổ
- [ ] Hiển thị đúng vòng
- [ ] Hiển thị đúng số lần nhắc với màu tương ứng
- [ ] Hiển thị thời gian đúng format

### 10. ✅ Reset
- [ ] Bấm Reset
- [ ] Confirm dialog hiển thị
- [ ] Sau confirm, toàn bộ history bị xóa
- [ ] Vòng reset về 1
- [ ] Tất cả người xem thấy reset cùng lúc

### 11. ✅ Logout
- [ ] Bấm "Đăng xuất"
- [ ] Confirm dialog hiển thị
- [ ] Sau confirm, redirect về /login.html
- [ ] WebSocket đóng kết nối
- [ ] Danh sách online users cập nhật (bỏ người vừa logout)

## 🎯 Test Scenario chính

### Scenario: 3 người xem, 5 thành viên

1. **Setup**:
   - Thành viên: Alice, Bob, Charlie, David, Emma
   - Viewer 1: Alice (tab 1)
   - Viewer 2: Bob (tab 2)
   - Viewer 3: Charlie (tab 3)

2. **Expected**:
   - Online users: 3 người (Alice, Bob, Charlie)
   - Mỗi tab thấy tên mình có badge xanh "(Bạn)"
   - Khi quay chỉ có thể ra: David hoặc Emma

3. **Process**:
   - Alice bấm "LẮC XÍ NGẦU"
   - **TAB 1, TAB 2, TAB 3 đều thấy animation cùng lúc**
   - Kết quả: David
   - **Tất cả 3 tab đều hiển thị "David"**
   - Bob bấm "Nhắc nhở" trên tab 2
   - **Tất cả 3 tab đều thấy badge "Đã nhắc: 1 lần"**
   - Charlie bấm "Xác nhận đã đổ" trên tab 3
   - **Tất cả 3 tab đều reset về trạng thái ban đầu**

## 🔍 Debug checklist

Nếu có lỗi, kiểm tra:

1. **WebSocket không kết nối**:
   - Mở Console (F12)
   - Kiểm tra "WebSocket connected"
   - Nếu không, check server đang chạy không

2. **Không real-time**:
   - Kiểm tra WebSocket connection status
   - Xem có error trong console không
   - Check server logs

3. **Quay vẫn trúng người đang xem**:
   - Check currentUsername có đúng không
   - Check API /api/roll có nhận viewer parameter không
   - Check server logs xem eligible members

4. **Animation không đồng bộ**:
   - Check tất cả clients đều nhận được message `rolling`
   - Check timestamp của messages
   - Verify không có local animation conflicts

## ✅ Acceptance Criteria

Tính năng được chấp nhận khi:
- ✅ Bắt buộc đăng nhập
- ✅ Người xem KHÔNG BAO GIỜ bị quay trúng
- ✅ Tất cả người online thấy quay cùng lúc
- ✅ Tất cả cập nhật đều real-time
- ✅ UI responsive và smooth
- ✅ Không có race condition khi nhiều người cùng thao tác

