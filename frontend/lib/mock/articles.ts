import type { Article } from '@/lib/datasource/articles.datasource'

export const mockArticles: Article[] = [
  {
    id: '00000000-0000-0000-0000-000000000401',
    title: 'Mùa Hè Xanh 2026: Những nhịp cầu nối bờ vui',
    slug: 'mua-he-xanh-2026-nhung-nhip-cau-noi-bo-vui',
    content: `## Những nhịp cầu nối bờ vui

Trong 30 ngày tại Đồng Tháp, đội hình ĐSVTN phối hợp cùng địa phương sửa sân chơi, mở lớp ôn tập và tổ chức gian hàng gây quỹ nhỏ cho học sinh.

- 120 phần quà học tập được trao tận tay.
- 18 tình nguyện viên trực tiếp tham gia.
- 4 điểm sinh hoạt cộng đồng được dọn dẹp và sơn mới.

<script>alert('blocked')</script>

Điều quan trọng nhất là mọi hoạt động đều được ghi nhận minh bạch để đội có thể cải thiện cách phân công ở những chiến dịch sau.`,
    status: 'PUBLISHED',
    authorId: '00000000-0000-0000-0000-000000000001',
    createdAt: '2026-05-20T08:00:00.000Z',
    updatedAt: '2026-05-20T08:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000402',
    title: 'ĐSVTN mở đợt tuyển thành viên logistics',
    slug: 'dsvtn-mo-dot-tuyen-thanh-vien-logistics',
    content: `## Logistics cần người kỹ tính

Ban logistics phụ trách chuẩn bị vật tư, điều phối giao nhận và theo dõi đơn hàng gây quỹ. Đợt tuyển ưu tiên các bạn có thể tham gia cuối tuần và quen làm việc theo checklist.`,
    status: 'PUBLISHED',
    authorId: '00000000-0000-0000-0000-000000000001',
    createdAt: '2026-05-12T09:30:00.000Z',
    updatedAt: '2026-05-12T09:30:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000403',
    title: 'Gây quỹ áo polo: cập nhật lô hàng đầu tiên',
    slug: 'gay-quy-ao-polo-cap-nhat-lo-hang-dau-tien',
    content: `## Lô hàng đầu tiên đã sẵn sàng

Shop gây quỹ đã xác nhận các đơn thanh toán hợp lệ và chuyển sang khâu giao hàng. Doanh thu sẽ được tổng hợp trong báo cáo gây quỹ công khai.`,
    status: 'PUBLISHED',
    authorId: '00000000-0000-0000-0000-000000000001',
    createdAt: '2026-05-05T10:45:00.000Z',
    updatedAt: '2026-05-05T10:45:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000404',
    title: 'Bản nháp kế hoạch truyền thông tháng 6',
    slug: 'ban-nhap-ke-hoach-truyen-thong-thang-6',
    content: 'Nội dung đang biên tập.',
    status: 'DRAFT',
    authorId: '00000000-0000-0000-0000-000000000001',
    createdAt: '2026-05-01T07:00:00.000Z',
    updatedAt: '2026-05-01T07:00:00.000Z',
  },
]
