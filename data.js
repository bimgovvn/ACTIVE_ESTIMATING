/**
 * Active Estimating Demo - Data Layer
 * Contains MasterFormat/UniFormat classifications, specification descriptions,
 * unit rates, measurement rules, and initial configuration parameters.
 */

const CLASSIFICATION_DB = {
  // Civil / Housing (NOXH Taseco)
  CIVIL: {
    "03 30 00": {
      code: "03 30 00",
      name: "Bê tông cốt thép sàn (Cast-in-Place Concrete)",
      spec: "Bê tông cấp độ bền B22.5 (M300), độ sụt 12±2cm, đá 1x2, đổ bằng bơm tĩnh tại chỗ.",
      unit: "m³",
      rule: "Tính theo thể tích hình học thực tế thiết kế của cấu kiện sàn. Không khấu trừ thể tích cốt thép, cáp dự ứng lực, hoặc các lỗ mở nhỏ hơn 0.1 m³.",
      price: 1450000 // VND per m3
    },
    "03 40 00": {
      code: "03 40 00",
      name: "Tấm tường bê tông nhẹ (Precast Concrete Panel)",
      spec: "Tấm bê tông nhẹ EPS kích thước 2440x610x100mm, liên kết khóa âm dương, chịu lực chịu ẩm tốt.",
      unit: "m²",
      rule: "Diện tích mặt đứng cấu kiện vách ngăn. Khấu trừ diện tích cửa đi, cửa sổ và các lỗ mở lớn hơn 0.5 m².",
      price: 480000 // VND per m2 (tấm tường nhẹ, không cần trát)
    },
    "04 20 00": {
      code: "04 20 00",
      name: "Tường xây gạch không nung (Unit Masonry)",
      spec: "Xây tường dày 110mm bằng gạch bê tông cốt liệu mác 75, vữa xi măng mác 75.",
      unit: "m³",
      rule: "Tính theo thể tích khối xây hình học thực tế. Khấu trừ thể tích các cấu kiện bê tông cốt thép chèn sẵn (lội, lanh tô) và lỗ mở lớn hơn 0.25 m².",
      price: 1850000 // VND per m3
    },
    "08 50 00": {
      code: "08 50 00",
      name: "Cửa sổ nhôm kính (Aluminum Windows)",
      spec: "Hệ khung nhôm Xingfa sơn tĩnh điện, kính hộp Low-E 2 lớp cản nhiệt 5-9-5mm, phụ kiện Kinlong đồng bộ.",
      unit: "m²",
      rule: "Tính theo diện tích khung ngoài của cửa lắp đặt hoàn thiện. Đã bao gồm phụ kiện, khóa, gioăng và keo silicone.",
      price: 2500000 // VND per m2
    },
    "08 50 01": {
      code: "08 50 01",
      name: "Cửa sổ nhôm kính thường (Common Windows)",
      spec: "Khung nhôm tiêu chuẩn, kính dán an toàn 2 lớp thường 6.38mm, phụ kiện tiêu chuẩn nội địa.",
      unit: "m²",
      rule: "Tính theo diện tích khung ngoài cửa lắp đặt hoàn thiện. Đã bao gồm phụ kiện tiêu chuẩn.",
      price: 1500000 // VND per m2
    },
    "09 20 00": {
      code: "09 20 00",
      name: "Trát tường trong nhà (Plastering)",
      spec: "Trát tường dày 15mm bằng vữa xi măng mác 75, tạo phẳng hoàn thiện chờ bả.",
      unit: "m²",
      rule: "Diện tích bề mặt trát thực tế. Khấu trừ các lỗ mở cửa đi, cửa sổ lớn hơn 0.25 m². Đã bao gồm trát cạnh má cửa.",
      price: 115000 // Đơn giá 115.000 đ/m2
    },
    "09 30 00": {
      code: "09 30 00",
      name: "Lát gạch ceramic sàn (Ceramic Floor Tiling)",
      spec: "Gạch ceramic ceramic mài cạnh kích thước 600x600mm, màu xám nhạt, keo dán gạch chuyên dụng.",
      unit: "m²",
      rule: "Diện tích lát gạch thực tế theo kích thước thông thủy của phòng. Không tính diện tích bị chiếm bởi tường xây.",
      price: 320000 // VND per m2
    },
    "09 30 10": {
      code: "09 30 10",
      name: "Ốp gạch Granite WC (Granite Wall Tiling)",
      spec: "Gạch Granite nhân tạo vân đá kích thước 300x600mm cao cấp, chống trượt chống thấm.",
      unit: "m²",
      rule: "Diện tích ốp thực tế trên bề mặt tường WC. Khấu trừ diện tích cửa đi, ô thoáng lớn hơn 0.1 m².",
      price: 380000 // VND per m2
    },
    "09 30 11": {
      code: "09 30 11",
      name: "Ốp gạch Ceramic WC thường (Ceramic Wall Tiling)",
      spec: "Gạch ceramic men bóng kích thước 300x450mm kinh tế, chống thấm bề mặt.",
      unit: "m²",
      rule: "Diện tích ốp thực tế trên bề mặt tường WC. Khấu trừ ô cửa.",
      price: 220000 // VND per m2
    },
    "09 90 00": {
      code: "09 90 00",
      name: "Bả và sơn tường trong (Painting and Coating)",
      spec: "Sơn tường 1 lớp lót kháng kiềm, 2 lớp phủ màu bằng sơn Dulux EasyClean hoặc tương đương, bột bả chuyên dụng.",
      unit: "m²",
      rule: "Diện tích sơn bả thực tế. Khấu trừ lỗ mở lớn hơn 0.25 m². Đã bao gồm các diện tích dầm, cột lồi ra ngoài diện tích tường xây.",
      price: 65000 // VND per m2
    }
  },

  // Infrastructure / Highway (Cao tốc Sài Gòn - Mộc Bài)
  INFRA: {
    "31 23 00": {
      code: "31 23 00",
      name: "Đào đất nền đường (Excavation)",
      spec: "Đào đất nền đường cấp III bằng máy đào dung tích gàu ≤ 1.25m³, vận chuyển đổ thải cự ly ≤ 1km bằng ô tô tự đổ.",
      unit: "m³",
      rule: "Thể tích đất đào nguyên thổ tính theo phương pháp mặt cắt ngang tích phân dọc tuyến giữa cao độ tự nhiên và đáy khuôn đường thiết kế.",
      price: 65000 // VND per m3
    },
    "31 23 23": {
      code: "31 23 23",
      name: "Đắp đất nền đường K95 (Embankment K95)",
      spec: "Đắp nền đường bằng đất cấp phối đồi hoặc cát chọn lọc, san ủi đầm nén đạt độ chặt K ≥ 0.95.",
      unit: "m³",
      rule: "Thể tích đất đắp sau khi đầm nén, xác định qua tích phân diện tích mặt cắt ngang đắp giữa cao độ thiết kế đáy khuôn đường và mặt đất tự nhiên (đã trừ hữu cơ).",
      price: 135000 // VND per m3
    },
    "31 23 24": {
      code: "31 23 24",
      name: "Đắp đất nền đường K98 (Embankment K98)",
      spec: "Đắp lớp đỉnh nền đường dày 30cm bằng đất chọn lọc có chỉ số CBR ≥ 8, san ủi đầm nén đạt độ chặt K ≥ 0.98.",
      unit: "m³",
      rule: "Thể tích đất đắp K98 thiết kế sau đầm nén (thường là diện tích mặt cắt nhân chiều dày 30cm dọc chiều dài tuyến).",
      price: 185000 // VND per m3
    },
    "31 32 00": {
      code: "31 32 00",
      name: "Xử lý nền đất yếu bằng bấc thấm (PVD Soil Stabilization)",
      spec: "Thi công cắm bấc thấm dọc dạng bản nhựa (PVD), sâu trung bình 15m, kết hợp đắp gia tải trước.",
      unit: "m",
      rule: "Tổng chiều dài bấc thấm thực tế cắm sâu vào lòng đất theo thiết kế lưới cắm định vị.",
      price: 18000 // VND per mét dài bấc thấm
    },
    "32 12 16": {
      code: "32 12 16",
      name: "Mặt đường bê tông nhựa chặt (Asphalt Paving)",
      spec: "Bê tông nhựa chặt nóng: lớp dưới C19 dày 7cm, lớp trên C12.5 dày 5cm, tưới nhựa dính bám nhũ tương polyme.",
      unit: "m²",
      rule: "Diện tích mặt đường rải bê tông nhựa hoàn thiện theo ranh giới làn xe chạy thiết kế. Không tính phần lề đất.",
      price: 420000 // VND per m2
    },
    "32 13 13": {
      code: "32 13 13",
      name: "Mặt đường bê tông xi măng (Concrete Paving)",
      spec: "Bê tông xi măng đá 2x4 mác 350 dày 25cm làm mặt đường chịu lực chính, cắt khe co giãn, chèn nhựa đường.",
      unit: "m²",
      rule: "Diện tích mặt đường bê tông xi măng đổ hoàn thiện theo bản vẽ thiết kế.",
      price: 680000 // VND per m2
    },
    "03 30 10": {
      code: "03 30 10",
      name: "Bê tông cốt thép dầm cầu thường (RC Girder)",
      spec: "Dầm BTCT thường dạng định hình chữ I hoặc bản rỗng, khẩu độ nhịp L=20m, đổ bê tông C30 (M400) đúc sẵn.",
      unit: "dầm",
      rule: "Đếm số lượng cấu kiện dầm đúc sẵn, vận chuyển cẩu lắp định vị vào gối cầu.",
      price: 110000000 // VND per dầm (110 triệu/dầm)
    },
    "03 41 00": {
      code: "03 41 00",
      name: "Dầm Super-T bê tông dự ứng lực (Prestressed Super-T)",
      spec: "Dầm Super-T BTCT dự ứng lực căng trước định hình L=33m, bê tông cường độ cao C50 (M600), cáp dự ứng lực chuyên dụng.",
      unit: "dầm",
      rule: "Tính theo số lượng cấu kiện dầm Super-T hoàn thiện đúc sẵn, cẩu lắp đặt trên mố trụ cầu.",
      price: 180000000 // VND per dầm (180 triệu/dầm)
    },
    "03 30 20": {
      code: "03 30 20",
      name: "Bê tông mố trụ cầu (Bridge Substructure)",
      spec: "Bê tông cốt thép mố trụ cầu C30 (M400), đá 1x2, đổ tại chỗ kết hợp cốt thép chịu lực nhóm CB400-V.",
      unit: "m³",
      rule: "Thể tích bê tông hình học của thân mố, thân trụ, xà mũ cầu. Chưa bao gồm cọc khoan nhồi móng.",
      price: 2200000 // VND per m3
    }
  }
};

// Initial Project Configurations and parameters for interactive recalculation
const PROJECT_CONFIGS = {
  CIVIL: {
    name: "NOXH Taseco - Căn hộ mẫu và block điển hình",
    apartmentsCount: 50, // Number of Type A apartments affected
    baseSqmRate: 8500000, // Base Cost / sqm for typical social housing
    floorHeight: 3.3, // meters
    apartmentA: {
      width: 6.0, // meters
      baseDepth: 10.0, // meters
      livingRoomWidth: 6.0,
      livingRoomBaseDepth: 4.0,
      toiletCount: 2,
      toiletWidth: 2.0,
      toiletDepth: 2.5,
      windowArea: 8.5, // m2 of windows
      interiorWallLength: 22.0, // meters of interior walls separating rooms
    }
  },
  INFRA: {
    name: "Cao tốc Sài Gòn - Mộc Bài (Phân đoạn Km15 - Km18)",
    sectionLength: 3000, // meters (3km)
    baseRatePerKm: 18000000000, // Base budget 18B VND/km
    baseWidth: 24.5, // 4 làn xe cao tốc + dải dừng khẩn cấp + dải phân cách
    bridgeSection: {
      baseLength: 120, // meters of bridge section (4 nhịp x 30m)
      girdersPerSpan: 6, // number of girders per span
      spansCount: 4,
      pierCount: 3,
      abutmentCount: 2
    }
  }
};
