/**
 * Active Estimating Demo - Application Controller
 * Handles interactive simulations, mathematical cost calculation engines,
 * dynamic SVG renderings, and tab views.
 */

// Global State
const STATE = {
  activeProject: 'CIVIL', // 'CIVIL' | 'INFRA'
  activeTab: 'theory', // 'theory' | 'demo' | 'policy'
  viewMode: '2D', // '2D' | '3D' | 'HYBRID'
  
  civil: {
    livingDepthOffset: 0.0, // 0.0 to 1.5 meters
    apartmentsCount: 50,
    windowCode: '08 50 00', // Xingfa + Low-E
    wcTileCode: '09 30 10', // Granite
    partitionOption: 'BRICK', // 'BRICK' | 'PANEL'
    totalCost: 0,
    unitRate: 0,
    prevTotalCost: 0
  },
  
  infra: {
    profileHeight: 0.0, // -3.0 to 3.0 meters
    pavementCode: '32 12 16', // Asphalt
    girderCode: '03 41 00', // Super-T
    stabilizationOption: 'EMBANK', // 'EMBANK' | 'VIADUCT'
    totalCost: 0,
    unitRate: 0,
    prevTotalCost: 0
  }
};

// Initial document loading
window.addEventListener('DOMContentLoaded', () => {
  // Initialize navigation
  switchProject('CIVIL');
  switchTab('theory');
  
  // Set up pipeline click event documentation details
  showPipelineNode(0);
  
  // Initialize view mode
  switchViewMode('2D');
});

// Switch between Projects (Civil vs Infrastructure)
function switchProject(projectKey) {
  STATE.activeProject = projectKey;
  
  const body = document.body;
  const civilBtn = document.getElementById('btn-project-civil');
  const infraBtn = document.getElementById('btn-project-infra');
  const civilInputs = document.getElementById('inputs-civil');
  const infraInputs = document.getElementById('inputs-infra');
  
  if (projectKey === 'CIVIL') {
    body.classList.remove('infra-mode');
    body.classList.add('civil-mode');
    civilBtn.classList.add('active');
    infraBtn.classList.remove('active');
    civilInputs.style.display = 'block';
    infraInputs.style.display = 'none';
    
    document.getElementById('label-unit-rate').innerHTML = 'Suất đầu tư <span class="unit">đ/m² sàn</span>';
    
    // Trigger estimating
    updateCivilEstimating();
  } else {
    body.classList.remove('civil-mode');
    body.classList.add('infra-mode');
    civilBtn.classList.remove('active');
    infraBtn.classList.add('active');
    civilInputs.style.display = 'none';
    infraInputs.style.display = 'block';
    
    document.getElementById('label-unit-rate').innerHTML = 'Suất đầu tư <span class="unit">tỷ đ/km</span>';
    
    // Trigger estimating
    updateInfraEstimating();
  }
  
  // Refresh MasterFormat browser for the active project
  populateMasterFormatBrowser();
  
  // Update viewer images & hotspots if in 3D/Hybrid modes
  updateViewerImages();
  
  // Reset active tab class triggers
  const activeTabLink = document.querySelector(`.tab-link.active`);
  if (activeTabLink) {
    activeTabLink.classList.remove('active');
    const tabName = activeTabLink.id.replace('tab-btn-', '');
    document.getElementById(`tab-btn-${tabName}`).classList.add('active');
  }
}

// Switch between Tabs
function switchTab(tabId) {
  STATE.activeTab = tabId;
  
  // Update nav buttons
  const tabs = ['theory', 'demo', 'policy'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const panel = document.getElementById(`panel-${t}`);
    if (t === tabId) {
      btn.classList.add('active');
      panel.classList.add('active');
    } else {
      btn.classList.remove('active');
      panel.classList.remove('active');
    }
  });
  
  // Trigger specific tab loads
  if (tabId === 'demo') {
    if (STATE.activeProject === 'CIVIL') {
      updateCivilEstimating();
    } else {
      updateInfraEstimating();
    }
  }
}

// Populate MasterFormat Browser
function populateMasterFormatBrowser() {
  const container = document.getElementById('masterformat-browser-list');
  container.innerHTML = '';
  
  const currentDb = CLASSIFICATION_DB[STATE.activeProject];
  
  Object.keys(currentDb).forEach((code, index) => {
    const item = currentDb[code];
    const itemDiv = document.createElement('div');
    itemDiv.className = `class-item ${index === 0 ? 'active' : ''}`;
    itemDiv.onclick = () => {
      document.querySelectorAll('.class-item').forEach(el => el.classList.remove('active'));
      itemDiv.classList.add('active');
    };
    
    itemDiv.innerHTML = `
      <div class="class-item-header">
        <span class="class-item-code">${item.code}</span>
        <span>Đơn giá: ${formatNumber(item.price)} đ/${item.unit}</span>
      </div>
      <div class="class-item-name">${item.name}</div>
      <div class="class-item-details">
        <p><strong>Đặc tả kỹ thuật:</strong> ${item.spec}</p>
        <p style="margin-top: 4px;"><strong>Quy tắc đo bóc:</strong> ${item.rule}</p>
      </div>
    `;
    container.appendChild(itemDiv);
  });
}

// Interactive BIM 5D Pipeline
const pipelineDescriptions = [
  "<strong>Cấu kiện BIM (Đối tượng hình học):</strong> Mang các thuộc tính kích thước vật lý (dày, rộng, cao, thể tích, diện tích...) và được gắn mã phân loại IFC (IfcClassificationReference) trực tiếp trong mô hình.",
  "<strong>Mã phân loại (Join Key):</strong> Mã số duy nhất đóng vai trò kết nối giữa mô hình 3D, đặc tả kỹ thuật và cơ sở dữ liệu giá. Giúp liên kết cấu kiện thiết kế với định danh dự toán.",
  "<strong>Đặc tả kỹ thuật & Quy tắc đo:</strong> Mỗi mã phân loại mang kèm theo tiêu chuẩn chất lượng vật liệu, điều kiện thi công (Đặc tả) và phương pháp tính toán khối lượng đúng quy ước hợp đồng (Quy tắc đo).",
  "<strong>Khối lượng × Đơn giá:</strong> Khối lượng đo bóc tự động từ mô hình nhân với đơn giá thị trường được cập nhật trong cơ sở dữ liệu quốc gia theo từng mã phân loại tương ứng.",
  "<strong>Thành tiền & Suất đầu tư:</strong> Tổng hợp chi phí tức thời cho toàn bộ công trình, tự động tính toán suất đầu tư (VNĐ/m² sàn hoặc VNĐ/km) phục vụ trực tiếp cho các quyết định đầu tư nhanh chóng."
];

function showPipelineNode(index) {
  const nodes = document.querySelectorAll('.pipeline-node');
  nodes.forEach((n, idx) => {
    if (idx === index) {
      n.classList.add('active');
    } else {
      n.classList.remove('active');
    }
  });
  
  document.getElementById('pipeline-desc').innerHTML = pipelineDescriptions[index];
}

// Reset viewer graphics
function resetViewer() {
  if (STATE.activeProject === 'CIVIL') {
    STATE.civil.livingDepthOffset = 0.0;
    document.getElementById('slider-living-depth').value = 0;
    updateCivilEstimating();
  } else {
    STATE.infra.profileHeight = 0.0;
    document.getElementById('slider-profile-height').value = 0;
    updateInfraEstimating();
  }
}

// ----------------------------------------------------
// CIVIL CALCULATIONS (NOXH Taseco)
// ----------------------------------------------------

function selectCivilOption(option) {
  STATE.civil.partitionOption = option;
  
  const brickBtn = document.getElementById('opt-civil-brick');
  const panelBtn = document.getElementById('opt-civil-panel');
  
  if (option === 'BRICK') {
    brickBtn.classList.add('active');
    panelBtn.classList.remove('active');
  } else {
    brickBtn.classList.remove('active');
    panelBtn.classList.add('active');
  }
  
  updateCivilEstimating();
}

function updateCivilEstimating() {
  const depthSlider = document.getElementById('slider-living-depth');
  const countSlider = document.getElementById('input-apartments-count');
  const windowSelect = document.getElementById('select-window-spec');
  const wcSelect = document.getElementById('select-wc-tile-spec');
  
  STATE.civil.livingDepthOffset = parseFloat(depthSlider.value);
  STATE.civil.apartmentsCount = parseInt(countSlider.value);
  STATE.civil.windowCode = windowSelect.value;
  STATE.civil.wcTileCode = wcSelect.value;
  
  // Update labels
  document.getElementById('val-living-depth').innerText = `+${STATE.civil.livingDepthOffset.toFixed(1)} m`;
  document.getElementById('val-apartments-count').innerText = `${STATE.civil.apartmentsCount} căn`;
  
  // Run estimating math
  const config = PROJECT_CONFIGS.CIVIL.apartmentA;
  const aptCount = STATE.civil.apartmentsCount;
  
  const width = config.width;
  const baseDepth = config.baseDepth;
  const depthOffset = STATE.civil.livingDepthOffset;
  const newDepth = baseDepth + depthOffset;
  
  // Calculations per apartment
  const baseArea = width * baseDepth; // 60m2
  const newArea = width * newDepth; // 60 + 6 * offset
  const addArea = newArea - baseArea;
  
  const floorHeight = PROJECT_CONFIGS.CIVIL.floorHeight; // 3.3m
  
  // 1. Concrete (Slab + Beam approximation)
  // Slab thick 120mm = 0.12m
  const concretePrice = CLASSIFICATION_DB.CIVIL["03 30 00"].price;
  const slabVol = newArea * 0.12; 
  const concreteCost = slabVol * concretePrice;
  
  // 2. Window Spec & Cost
  const windowPrice = CLASSIFICATION_DB.CIVIL[STATE.civil.windowCode].price;
  const windowArea = config.windowArea; // 8.5 m2
  const windowCost = windowArea * windowPrice;
  
  // 3. WC Wall Tiles Spec & Cost
  // WC Size: 2.0 x 2.5, Height 3.3. Wall area (perimeter) = 2 * (2.0 + 2.5) * 3.3 = 29.7 m2. Deduct door/mirror = ~5.0m2. Net = 24.7 m2.
  const wcTileArea = 24.7 * config.toiletCount; 
  const wcTilePrice = CLASSIFICATION_DB.CIVIL[STATE.civil.wcTileCode].price;
  const wcTileCost = wcTileArea * wcTilePrice;
  
  // 4. Partition Walls: Brick vs Concrete Lightweight Panel
  // Exterior wall: (2 * newDepth + width) * floorHeight.
  // Exterior wall area increases with depthOffset: 2 * depthOffset * floorHeight
  const extWallArea = (2 * newDepth + width) * floorHeight - windowArea; 
  
  let partitionCost = 0;
  let plasteringCost = 0;
  let paintingCost = 0;
  
  // Plastering: unit price is per m2. Dulux Painting: unit price is per m2.
  const plasterPrice = CLASSIFICATION_DB.CIVIL["09 20 00"].price;
  const paintPrice = CLASSIFICATION_DB.CIVIL["09 90 00"].price;
  const brickPrice = CLASSIFICATION_DB.CIVIL["04 20 00"].price;
  const panelPrice = CLASSIFICATION_DB.CIVIL["03 40 00"].price;
  
  // External walls always masonry (0.11m thickness)
  const extWallVol = extWallArea * 0.11;
  const extWallCost = extWallVol * brickPrice;
  
  let intWallArea = config.interiorWallLength * floorHeight; // 22 * 3.3 = 72.6 m2
  let nsaGainedPerApt = 0; // Net Sellable Area gained from thinner partitions
  
  if (STATE.civil.partitionOption === 'BRICK') {
    // Brick partitions: 110mm thickness
    const intWallVol = intWallArea * 0.11;
    partitionCost = extWallCost + (intWallVol * brickPrice);
    
    // Plastering: both sides of partitions + inside of ext wall
    const plasterArea = (intWallArea * 2) + extWallArea;
    plasteringCost = plasterArea * plasterPrice;
    
    // Painting: same as plaster area + ceiling
    paintingCost = (plasterArea + newArea) * paintPrice;
  } else {
    // Panel partitions: 100mm thickness. No plastering required!
    // Ext walls masonry
    const extWallVol = extWallArea * 0.11;
    partitionCost = extWallCost + (intWallArea * panelPrice);
    
    // Plastering only for external walls (inside only)
    plasteringCost = extWallArea * plasterPrice;
    
    // Painting: drywall panel partitions (both sides) + plaster ext wall + ceiling
    paintingCost = ((intWallArea * 2) + extWallArea + newArea) * paintPrice;
    
    // Net Sellable Area gained. Brick + Plaster = 140mm thickness. Lightweight panel = 100mm.
    // Width reduction = 40mm = 0.04m. Length of walls = 22m.
    // Area gained = 22 * 0.04 = 0.88 m2 per apartment!
    nsaGainedPerApt = 0.88;
  }
  
  // Floor tiling
  const tilingPrice = CLASSIFICATION_DB.CIVIL["09 30 00"].price;
  // Floor area minus wall footprints (~10% footprint)
  const tilingArea = newArea * 0.9;
  const tilingCost = tilingArea * tilingPrice;
  
  // Summing single apartment structural cost
  const singleAptCost = concreteCost + partitionCost + plasteringCost + paintingCost + tilingCost + windowCost + wcTileCost;
  
  // Total Cost for the block (multiplied by aptCount)
  // Let's add structural overhead baseline of 1.2 Billion VND for shared core (stairs, elevator, lobby)
  const baseOverhead = 1200000000;
  const totalCost = baseOverhead + (singleAptCost * aptCount);
  
  // Unit rate (VND/m2 of total floor area including overhead)
  const totalFloorArea = newArea * aptCount;
  const unitRate = totalCost / totalFloorArea;
  
  // Update state
  STATE.civil.prevTotalCost = STATE.civil.totalCost || totalCost;
  STATE.civil.totalCost = totalCost;
  STATE.civil.unitRate = unitRate;
  
  // Update UI Elements
  renderCivilKPIs(totalCost, unitRate, newArea, nsaGainedPerApt);
  renderCivilCostTable(slabVol, extWallVol, intWallArea, windowArea, wcTileArea, tilingArea, newArea);
  renderCivilSvg(newDepth, width);
  renderCivilComparison(singleAptCost, nsaGainedPerApt);
}

function renderCivilKPIs(totalCost, unitRate, newArea, nsaGainedPerApt) {
  const totalCostDiv = document.getElementById('val-total-cost');
  const unitRateDiv = document.getElementById('val-sqm-rate');
  const diffTotalDiv = document.getElementById('diff-total-cost');
  const diffSqmDiv = document.getElementById('diff-sqm-rate');
  
  // Display total cost in Billion VND
  const totalCostBillions = totalCost / 1000000000;
  totalCostDiv.innerHTML = `${totalCostBillions.toFixed(2)} <span class="unit">tỷ đ</span>`;
  
  // Display unit rate
  unitRateDiv.innerHTML = `${formatNumber(Math.round(unitRate))} <span class="unit">đ/m²</span>`;
  
  // Highlight card changes
  const totalKpiCard = document.getElementById('kpi-total-cost');
  totalKpiCard.classList.remove('cost-highlight');
  void totalKpiCard.offsetWidth; // trigger reflow
  totalKpiCard.classList.add('cost-highlight');
  
  // Diff calculation relative to base configuration (0 depth offset, 50 apartments, brick wall)
  // Base cost is roughly 25.13 Billion
  const baseCompareCost = 25130000000;
  const baseCompareSqm = 8370000;
  
  const costDiff = totalCost - baseCompareCost;
  const sqmDiff = unitRate - baseCompareSqm;
  
  if (costDiff > 1000000) {
    diffTotalDiv.className = 'kpi-diff up';
    diffTotalDiv.innerHTML = `&uarr; +${(costDiff/1000000000).toFixed(2)} tỷ đ`;
  } else if (costDiff < -1000000) {
    diffTotalDiv.className = 'kpi-diff down';
    diffTotalDiv.innerHTML = `&darr; -${(Math.abs(costDiff)/1000000000).toFixed(2)} tỷ đ`;
  } else {
    diffTotalDiv.className = 'kpi-diff neutral';
    diffTotalDiv.innerHTML = `Thiết lập gốc`;
  }
  
  if (sqmDiff > 100) {
    diffSqmDiv.className = 'kpi-diff up';
    diffSqmDiv.innerHTML = `&uarr; +${formatNumber(Math.round(sqmDiff))} đ/m²`;
  } else if (sqmDiff < -100) {
    diffSqmDiv.className = 'kpi-diff down';
    diffSqmDiv.innerHTML = `&darr; -${formatNumber(Math.round(Math.abs(sqmDiff)))} đ/m²`;
  } else {
    diffSqmDiv.className = 'kpi-diff neutral';
    diffSqmDiv.innerHTML = `Thiết lập gốc`;
  }
}

function renderCivilCostTable(slabVol, extWallVol, intWallArea, windowArea, wcTileArea, tilingArea, newArea) {
  const tbody = document.getElementById('cost-table-body');
  tbody.innerHTML = '';
  
  const aptCount = STATE.civil.apartmentsCount;
  const currentDb = CLASSIFICATION_DB.CIVIL;
  
  // Items matching what we estimated
  const items = [
    { code: "03 30 00", qty: slabVol * aptCount },
    { code: "08 50 00", qty: STATE.civil.windowCode === '08 50 00' ? windowArea * aptCount : 0 },
    { code: "08 50 01", qty: STATE.civil.windowCode === '08 50 01' ? windowArea * aptCount : 0 },
    { code: "09 30 10", qty: STATE.civil.wcTileCode === '09 30 10' ? wcTileArea * aptCount : 0 },
    { code: "09 30 11", qty: STATE.civil.wcTileCode === '09 30 11' ? wcTileArea * aptCount : 0 },
    { code: "04 20 00", qty: extWallVol * aptCount + (STATE.civil.partitionOption === 'BRICK' ? intWallArea * 0.11 * aptCount : 0) },
    { code: "03 40 00", qty: STATE.civil.partitionOption === 'PANEL' ? intWallArea * aptCount : 0 },
    { code: "09 20 00", qty: ( (STATE.civil.partitionOption === 'BRICK' ? intWallArea * 2 : 0) + (extWallVol / 0.11) ) * aptCount },
    { code: "09 30 00", qty: tilingArea * aptCount },
    { code: "09 90 00", qty: ( ( (STATE.civil.partitionOption === 'BRICK' ? intWallArea * 2 : intWallArea * 2) + (extWallVol / 0.11) ) + newArea ) * aptCount }
  ];
  
  items.forEach(item => {
    if (item.qty <= 0) return; // skip unused materials
    
    const dbItem = currentDb[item.code];
    const total = item.qty * dbItem.price;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="code">${item.code}</td>
      <td>${dbItem.name.split(' (')[0]}</td>
      <td class="number">${item.qty.toFixed(1)}</td>
      <td>${dbItem.unit}</td>
      <td class="number">${formatNumber(dbItem.price)}</td>
      <td class="number total">${formatNumber(Math.round(total))}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCivilSvg(depth, width) {
  const g = document.getElementById('svg-interactive-group');
  g.innerHTML = '';
  
  // Viewbox is 400x300. Let's scale dimensions to fit beautifully.
  // We place a 6m x (10m + offset) apartment in the center.
  // Scale factor: 1 meter = 18 pixels
  // Center coordinates: X = 200, Y = 150
  const scale = 18;
  const aptW = width * scale; // 108px
  const aptH = depth * scale; // 180px - 207px
  
  const startX = 200 - aptW / 2;
  const startY = 150 - aptH / 2;
  
  // Calculate living room boundary (usually front part)
  const livingH = (4.0 + STATE.civil.livingDepthOffset) * scale;
  const livingY = startY + aptH - livingH;
  
  // SVG drawings
  // Floor Tile pattern representation
  let tilePattern = '';
  for (let x = startX + 4; x < startX + aptW; x += 12) {
    for (let y = startY + 4; y < startY + aptH; y += 12) {
      tilePattern += `<rect x="${x}" y="${y}" width="10" height="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.01)" stroke-width="0.5" />`;
    }
  }
  
  // Highlight of the nới rộng (expanded room depth area)
  const expandY = startY + (10.0 * scale);
  const expandH = STATE.civil.livingDepthOffset * scale;
  let expandBox = '';
  if (expandH > 0) {
    expandBox = `
      <rect x="${startX}" y="${startY + aptH - expandH}" width="${aptW}" height="${expandH}" fill="rgba(14, 165, 233, 0.08)" stroke="none" />
      <path d="M ${startX} ${startY + aptH - expandH} L ${startX + aptW} ${startY + aptH - expandH}" stroke="var(--accent-cyan)" stroke-width="1.5" stroke-dasharray="3 3" />
      <text x="200" y="${startY + aptH - expandH / 2 + 4}" fill="var(--accent-cyan)" font-size="9" text-anchor="middle" font-family="monospace">Vùng nới rộng +${STATE.civil.livingDepthOffset.toFixed(1)}m</text>
    `;
  }
  
  // Internal walls path
  // Brick wall has double lines, Panel has single thick cyan/purple line
  const isPanel = STATE.civil.partitionOption === 'PANEL';
  const wallStroke = isPanel ? 'var(--accent-cyan)' : '#475569';
  const wallStrokeWidth = isPanel ? 4 : 7;
  const wallDash = isPanel ? 'none' : 'none';
  
  const innerWalls = `
    <!-- Toilet 1 (left side) -->
    <path d="M ${startX} ${startY + 2.5*scale} L ${startX + 2.0*scale} ${startY + 2.5*scale} L ${startX + 2.0*scale} ${startY}" stroke="${wallStroke}" stroke-width="${wallStrokeWidth}" fill="none" />
    <!-- Toilet 2 (right side) -->
    <path d="M ${startX + aptW} ${startY + 2.5*scale} L ${startX + aptW - 2.0*scale} ${startY + 2.5*scale} L ${startX + aptW - 2.0*scale} ${startY}" stroke="${wallStroke}" stroke-width="${wallStrokeWidth}" fill="none" />
    <!-- Living room partition wall -->
    <path d="M ${startX} ${livingY} L ${startX + aptW - 1.5*scale} ${livingY}" stroke="${wallStroke}" stroke-width="${wallStrokeWidth}" fill="none" />
  `;
  
  g.innerHTML = `
    <!-- Floor Pattern -->
    ${tilePattern}
    
    <!-- Expanded Area -->
    ${expandBox}
    
    <!-- Apartment Outer Shell -->
    <rect x="${startX}" y="${startY}" width="${aptW}" height="${aptH}" fill="none" stroke="#64748b" stroke-width="8" />
    
    <!-- Outer highlight showing stretch -->
    <rect x="${startX - 4}" y="${startY - 4}" width="${aptW + 8}" height="${aptH + 8}" fill="none" class="svg-wall-highlight" />
    
    <!-- Internal partition walls -->
    ${innerWalls}
    
    <!-- Dynamic Labels -->
    <text x="200" y="${startY + 20}" class="svg-room-label">Phòng Ngủ 1</text>
    <text x="200" y="${livingY + livingH / 2 + 4}" class="svg-room-label" fill="#cbd5e1" font-weight="bold">Phòng Khách (${(width * (4.0 + STATE.civil.livingDepthOffset)).toFixed(1)} m²)</text>
    
    <!-- Dimension arrows -->
    <!-- Width Dimension -->
    <line x1="${startX}" y1="${startY - 15}" x2="${startX + aptW}" y2="${startY - 15}" class="svg-dim-line" />
    <text x="200" y="${startY - 20}" class="svg-dim-text">W = 6.0 m</text>
    
    <!-- Depth Dimension -->
    <line x1="${startX - 15}" y1="${startY}" x2="${startX - 15}" y2="${startY + aptH}" class="svg-dim-line" />
    <text x="${startX - 22}" y="150" class="svg-dim-text" transform="rotate(-90 ${startX - 22} 150)">L = ${depth.toFixed(1)} m</text>
  `;
}

function renderCivilComparison(singleAptCost, nsaGained) {
  const container = document.getElementById('optioneering-comparison-chart');
  container.innerHTML = '';
  
  // Calculate cost comparing Brick (base) vs Panel
  // Panel saves plastering, reduces thickness
  const isPanel = STATE.civil.partitionOption === 'PANEL';
  
  // Approximate values for chart representation
  const brickCost = 145000000; // 145 Million / apt structure & finish
  const panelCost = 152000000; // 152 Million / apt (higher material cost, but fast install)
  
  const activeCost = isPanel ? panelCost : brickCost;
  const compCost = isPanel ? brickCost : panelCost;
  
  const costPctA = (brickCost / Math.max(brickCost, panelCost)) * 100;
  const costPctB = (panelCost / Math.max(brickCost, panelCost)) * 100;
  
  // Commercial revenue potential
  // Social housing sales price: ~18,000,000 VND / m2
  const salesPricePerSqm = 18000000;
  const nsaRevenueGained = nsaGained * salesPricePerSqm * STATE.civil.apartmentsCount;
  
  container.innerHTML = `
    <!-- Cost Comparison -->
    <div class="comp-bar-group">
      <div class="comp-bar-header">
        <span>Chi phí XD thô + vách ngăn / căn</span>
        <span>${(activeCost/1000000).toFixed(0)} triệu đ</span>
      </div>
      <div class="comp-bar-outer">
        <div class="comp-bar-inner opt-a" style="width: ${costPctA}%"></div>
      </div>
      <div class="comp-bar-outer" style="margin-top:4px;">
        <div class="comp-bar-inner opt-b" style="width: ${costPctB}%"></div>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-muted); margin-top:2px;">
        <span>Xám: PA A (Tường gạch)</span>
        <span>Xanh: PA B (Tấm bê tông nhẹ)</span>
      </div>
    </div>
    
    <!-- Area / Value Gained -->
    <div class="comp-bar-group" style="margin-top:8px;">
      <div class="comp-bar-header">
        <span>Diện tích bán thêm được (NSA)</span>
        <span style="color:var(--accent-teal);">+${(nsaGained * STATE.civil.apartmentsCount).toFixed(1)} m²</span>
      </div>
      <div class="comp-bar-header" style="margin-top:2px;">
        <span>Doanh thu gia tăng (tính toàn block)</span>
        <span style="color:var(--accent-teal);">+${formatNumber(nsaRevenueGained)} đ</span>
      </div>
      <div style="font-size:10.5px; text-align:justify; color:var(--text-secondary); padding: 8px; background:rgba(16,185,129,0.06); border:1px dashed rgba(16,185,129,0.2); border-radius:4px; margin-top:4px;">
        <strong>Phân tích quyết định:</strong> PA B tăng khoảng ${( (panelCost - brickCost) / 1000000 ).toFixed(0)} triệu đ chi phí mỗi căn (tổng block tăng ${( ((panelCost-brickCost)*STATE.civil.apartmentsCount)/1000000000 ).toFixed(2)} tỷ). Tuy nhiên, tường mỏng giải phóng diện tích bán thêm trị giá <strong>${(nsaRevenueGained/1000000000).toFixed(2)} tỷ đ</strong>. Dòng tiền ròng thu được thặng dư giúp Lãnh đạo tự tin chọn PA B.
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// INFRASTRUCTURE CALCULATIONS (Cao tốc SG - Mộc Bài)
// ----------------------------------------------------

function selectInfraOption(option) {
  STATE.infra.stabilizationOption = option;
  
  const embankBtn = document.getElementById('opt-infra-embank');
  const viaductBtn = document.getElementById('opt-infra-viaduct');
  
  if (option === 'EMBANK') {
    embankBtn.classList.add('active');
    viaductBtn.classList.remove('active');
  } else {
    embankBtn.classList.remove('active');
    viaductBtn.classList.add('active');
  }
  
  updateInfraEstimating();
}

function updateInfraEstimating() {
  const heightSlider = document.getElementById('slider-profile-height');
  const pavementSelect = document.getElementById('select-pavement-spec');
  const girderSelect = document.getElementById('select-girder-spec');
  
  STATE.infra.profileHeight = parseFloat(heightSlider.value);
  STATE.infra.pavementCode = pavementSelect.value;
  STATE.infra.girderCode = girderSelect.value;
  
  // Update labels
  document.getElementById('val-profile-height').innerText = `${STATE.infra.profileHeight >= 0 ? '+' : ''}${STATE.infra.profileHeight.toFixed(1)} m`;
  
  // Earthwork Math
  const length = PROJECT_CONFIGS.INFRA.sectionLength; // 3000m
  const baseWidth = PROJECT_CONFIGS.INFRA.baseWidth; // 24.5m
  const h = STATE.infra.profileHeight;
  
  // Cut and Fill Volume Calculations (Non-linear functions)
  // At h = 0, base volumes exist due to rolling terrain
  let baseCutVol = 50000;
  let baseFillVol = 35000;
  
  // Non-linear adjustments:
  // If we raise profile (h > 0), fill volume increases quadratically, cut decreases
  // If we lower profile (h < 0), cut volume increases quadratically, fill decreases
  let cutVol = Math.max(5000, baseCutVol - 18000 * h + 3000 * h * h);
  let fillVol = Math.max(5000, baseFillVol + 25000 * h + 4500 * h * h);
  
  // 1. Earthwork costs
  const cutPrice = CLASSIFICATION_DB.INFRA["31 23 00"].price; // 65,000 VND
  const fillK95Price = CLASSIFICATION_DB.INFRA["31 23 23"].price; // 135,000 VND
  const fillK98Price = CLASSIFICATION_DB.INFRA["31 23 24"].price; // 185,000 VND
  
  // Top 30cm K98: Volume = Width * 0.3m * Length
  const fillK98Vol = baseWidth * 0.3 * length; // 22,050 m³
  const fillK95Vol = Math.max(0, fillVol - fillK98Vol);
  
  const earthworkCost = (cutVol * cutPrice) + (fillK95Vol * fillK95Price) + (fillK98Vol * fillK98Price);
  
  // 2. Pavement cost
  const pavementPrice = CLASSIFICATION_DB.INFRA[STATE.infra.pavementCode].price;
  const pavementArea = baseWidth * length; // 73,500 m2
  const pavementCost = pavementArea * pavementPrice;
  
  // 3. Bridge structural calculations
  let bridgeLength = PROJECT_CONFIGS.INFRA.bridgeSection.baseLength; // 120m base
  let PVDStabilizationLength = 1200; // meters of weak soil section to treat
  
  if (STATE.infra.stabilizationOption === 'VIADUCT') {
    // Viaduct option replaces weak soil embankment with bridge
    bridgeLength = 1200; // bridge increases to 1.2km
    PVDStabilizationLength = 0; // no soft soil PVD treatment needed
    
    // Reducing earthwork significantly on the bridge portion
    cutVol = cutVol * 0.6;
    fillVol = fillVol * 0.2;
  }
  
  // Calculate PVD treatment cost
  const pvdPrice = CLASSIFICATION_DB.INFRA["31 32 00"].price; // 18,000
  // PVD spacing 1.5m -> ~0.44 piles per sqm. Depth 15m
  const pvdQuantity = PVDStabilizationLength > 0 ? (PVDStabilizationLength * baseWidth * 0.44) * 15 : 0;
  const pvdCost = pvdQuantity * pvdPrice;
  
  // Calculate Bridge structure costs
  // Girder selected
  const girderPrice = CLASSIFICATION_DB.INFRA[STATE.infra.girderCode].price; // 180M vs 110M
  const isSuperT = STATE.infra.girderCode === '03 41 00';
  const spanLength = isSuperT ? 33 : 20; // 33m span vs 20m span
  
  const spansCount = Math.ceil(bridgeLength / spanLength);
  const girdersCount = spansCount * 6; // 6 girders per span
  const substructurePiers = spansCount - 1;
  const substructureAbutments = 2;
  
  const girderCost = girdersCount * girderPrice;
  
  // Bridge Pier Concrete: ~120m3 per pier, ~80m3 per abutment
  const substructurePrice = CLASSIFICATION_DB.INFRA["03 30 20"].price; // 2,200,000 VND
  const substructureConcreteVol = (substructurePiers * 120) + (substructureAbutments * 80);
  const substructureCost = substructureConcreteVol * substructurePrice;
  
  // Summing total project section costs (3km segment)
  // Base overhead for highway project of 12 Billion VND
  const baseOverhead = 12000000000;
  const totalCost = baseOverhead + earthworkCost + pavementCost + pvdCost + girderCost + substructureCost;
  
  // Unit rate: Billion VND / km
  const lengthInKm = length / 1000; // 3.0 km
  const unitRate = totalCost / lengthInKm;
  
  // Update state
  STATE.infra.prevTotalCost = STATE.infra.totalCost || totalCost;
  STATE.infra.totalCost = totalCost;
  STATE.infra.unitRate = unitRate;
  
  // Update UI Elements
  renderInfraKPIs(totalCost, unitRate, cutVol, fillVol);
  renderInfraCostTable(cutVol, fillK95Vol, fillK98Vol, pavementArea, pvdQuantity, girdersCount, substructureConcreteVol);
  renderInfraSvg(h);
  renderInfraComparison(totalCost, bridgeLength, PVDStabilizationLength);
}

function renderInfraKPIs(totalCost, unitRate, cutVol, fillVol) {
  const totalCostDiv = document.getElementById('val-total-cost');
  const unitRateDiv = document.getElementById('val-sqm-rate');
  const diffTotalDiv = document.getElementById('diff-total-cost');
  const diffSqmDiv = document.getElementById('diff-sqm-rate');
  
  // Display total cost in Billion VND
  const totalCostBillions = totalCost / 1000000000;
  totalCostDiv.innerHTML = `${totalCostBillions.toFixed(2)} <span class="unit">tỷ đ</span>`;
  
  // Display unit rate
  const unitRateBillions = unitRate / 1000000000;
  unitRateDiv.innerHTML = `${unitRateBillions.toFixed(1)} <span class="unit">tỷ/km</span>`;
  
  // Highlight card changes
  const totalKpiCard = document.getElementById('kpi-total-cost');
  totalKpiCard.classList.remove('cost-highlight');
  void totalKpiCard.offsetWidth; // trigger reflow
  totalKpiCard.classList.add('cost-highlight');
  
  // Diff calculation relative to base configuration (0 height, asphalt, Super-T, embankment)
  // Base cost is roughly 69.41 Billion
  const baseCompareCost = 69410000000;
  const baseCompareKmRate = 23136000000;
  
  const costDiff = totalCost - baseCompareCost;
  const kmDiff = unitRate - baseCompareKmRate;
  
  if (costDiff > 10000000) {
    diffTotalDiv.className = 'kpi-diff up';
    diffTotalDiv.innerHTML = `&uarr; +${(costDiff/1000000000).toFixed(2)} tỷ đ`;
  } else if (costDiff < -10000000) {
    diffTotalDiv.className = 'kpi-diff down';
    diffTotalDiv.innerHTML = `&darr; -${(Math.abs(costDiff)/1000000000).toFixed(2)} tỷ đ`;
  } else {
    diffTotalDiv.className = 'kpi-diff neutral';
    diffTotalDiv.innerHTML = `Thiết lập gốc`;
  }
  
  if (kmDiff > 10000000) {
    diffSqmDiv.className = 'kpi-diff up';
    diffSqmDiv.innerHTML = `&uarr; +${(kmDiff/1000000000).toFixed(1)} tỷ/km`;
  } else if (kmDiff < -10000000) {
    diffSqmDiv.className = 'kpi-diff down';
    diffSqmDiv.innerHTML = `&darr; -${(Math.abs(kmDiff)/1000000000).toFixed(1)} tỷ/km`;
  } else {
    diffSqmDiv.className = 'kpi-diff neutral';
    diffSqmDiv.innerHTML = `Thiết lập gốc`;
  }
}

function renderInfraCostTable(cutVol, fillK95Vol, fillK98Vol, pavementArea, pvdQuantity, girdersCount, substructureConcreteVol) {
  const tbody = document.getElementById('cost-table-body');
  tbody.innerHTML = '';
  
  const currentDb = CLASSIFICATION_DB.INFRA;
  
  // Items matching what we estimated
  const items = [
    { code: "31 23 00", qty: cutVol },
    { code: "31 23 23", qty: fillK95Vol },
    { code: "31 23 24", qty: fillK98Vol },
    { code: "31 32 00", qty: pvdQuantity },
    { code: "32 12 16", qty: STATE.infra.pavementCode === '32 12 16' ? pavementArea : 0 },
    { code: "32 13 13", qty: STATE.infra.pavementCode === '32 13 13' ? pavementArea : 0 },
    { code: "03 41 00", qty: STATE.infra.girderCode === '03 41 00' ? girdersCount : 0 },
    { code: "03 30 10", qty: STATE.infra.girderCode === '03 30 10' ? girdersCount : 0 },
    { code: "03 30 20", qty: substructureConcreteVol }
  ];
  
  items.forEach(item => {
    if (item.qty <= 0) return; // skip unused materials
    
    const dbItem = currentDb[item.code];
    const total = item.qty * dbItem.price;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="code">${item.code}</td>
      <td>${dbItem.name.split(' (')[0]}</td>
      <td class="number">${item.qty.toFixed(0)}</td>
      <td>${dbItem.unit}</td>
      <td class="number">${formatNumber(dbItem.price)}</td>
      <td class="number total">${formatNumber(Math.round(total))}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderInfraSvg(heightOffset) {
  const g = document.getElementById('svg-interactive-group');
  g.innerHTML = '';
  
  // Viewbox: 400x300
  // Let's draw road profile cross section
  // Natural Ground is represented by a curved wavy line going from left to right.
  // Center ground Y is ~180.
  // Roadbed top width is 120px (representing 24.5m width). Center X is 200.
  // Roadbed flat top level Y is determined by heightOffset: 150 - heightOffset * 15
  
  const roadY = 150 - heightOffset * 15;
  const roadWidth = 120;
  const leftRoadX = 200 - roadWidth / 2; // 140
  const rightRoadX = 200 + roadWidth / 2; // 260
  
  // Slopes (1:1.5)
  // Let's find slope extension to natural ground level (approx Y = 180)
  // Slope left point at ground: X = leftRoadX - (180 - roadY) * 1.5
  // Slope right point at ground: X = rightRoadX + (180 - roadY) * 1.5
  const groundY = 180;
  const slopeLeftX = leftRoadX - (groundY - roadY) * 1.5;
  const slopeRightX = rightRoadX + (groundY - roadY) * 1.5;
  
  // Terrain curve points
  const terrainPath = `M 0 170 Q 100 200 200 180 T 400 190`;
  
  // Build polygons for Cut / Fill coloring
  let cutFillPolygon = '';
  if (heightOffset > 0) {
    // Fill section (Embankment). Road Y is above ground Y.
    // Coordinates: left road, right road, right slope ground intersection, left slope ground intersection
    cutFillPolygon = `
      <polygon points="${leftRoadX},${roadY} ${rightRoadX},${roadY} ${slopeRightX},${groundY} ${slopeLeftX},${groundY}" fill="rgba(14, 165, 233, 0.2)" stroke="var(--accent-cyan)" stroke-width="1.5" />
      <text x="200" y="${roadY + (groundY - roadY)/2 + 4}" fill="var(--accent-cyan)" font-size="9" text-anchor="middle" font-family="monospace">Diện tích đắp (Fill)</text>
    `;
  } else if (heightOffset < 0) {
    // Cut section (Excavation). Road Y is below ground Y.
    // Coordinates: left slope intersection, left road, right road, right slope intersection
    cutFillPolygon = `
      <polygon points="${slopeLeftX},${groundY} ${leftRoadX},${roadY} ${rightRoadX},${roadY} ${slopeRightX},${groundY}" fill="rgba(245, 158, 11, 0.2)" stroke="var(--accent-amber)" stroke-width="1.5" />
      <text x="200" y="${roadY + (groundY - roadY)/2 + 4}" fill="var(--accent-amber)" font-size="9" text-anchor="middle" font-family="monospace">Diện tích đào (Cut)</text>
    `;
  }
  
  // Viaduct Bridge visualization if selected
  let bridgeVisual = '';
  if (STATE.infra.stabilizationOption === 'VIADUCT') {
    // Draw bridge piers under the roadbed
    bridgeVisual = `
      <!-- Left Pier -->
      <rect x="${leftRoadX + 25}" y="${roadY}" width="10" height="${240 - roadY}" fill="#94a3b8" stroke="#475569" stroke-width="1" />
      <!-- Center Pier -->
      <rect x="195" y="${roadY}" width="10" height="${240 - roadY}" fill="#94a3b8" stroke="#475569" stroke-width="1" />
      <!-- Right Pier -->
      <rect x="${rightRoadX - 35}" y="${roadY}" width="10" height="${240 - roadY}" fill="#94a3b8" stroke="#475569" stroke-width="1" />
      <!-- Bridge deck overlay -->
      <rect x="${leftRoadX - 10}" y="${roadY - 4}" width="${roadWidth + 20}" height="8" fill="var(--accent-purple)" opacity="0.8" />
      <text x="200" y="${roadY - 10}" fill="var(--accent-purple)" font-size="8" text-anchor="middle" font-weight="bold">Cầu Cạn (Viaduct Option)</text>
    `;
  }
  
  g.innerHTML = `
    <!-- Natural Ground -->
    <path d="${terrainPath}" fill="none" stroke="#22c55e" stroke-width="3" />
    <text x="50" y="220" fill="#22c55e" font-size="9" font-family="sans-serif">Mặt đất tự nhiên</text>
    
    <!-- Cut / Fill Area Layer -->
    ${cutFillPolygon}
    
    <!-- Roadbed Surface -->
    <line x1="${leftRoadX}" y1="${roadY}" x2="${rightRoadX}" y2="${roadY}" stroke="#e2e8f0" stroke-width="4" />
    
    <!-- Bridge Structural details -->
    ${bridgeVisual}
    
    <!-- Profile Height Guides & Dimensions -->
    <line x1="200" y1="180" x2="200" y2="${roadY}" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-dasharray="2 2" />
    <circle cx="200" cy="180" r="3" fill="#22c55e" />
    <circle cx="200" cy="${roadY}" r="3" fill="var(--accent-purple)" />
    
    <!-- Vertical Dimension Line -->
    <line x1="330" y1="180" x2="330" y2="${roadY}" class="svg-dim-line" />
    <text x="338" y="${(180 + roadY)/2 + 3}" class="svg-dim-text" text-anchor="start" font-size="9">dH = ${heightOffset >= 0 ? '+' : ''}${heightOffset.toFixed(1)}m</text>
  `;
}

function renderInfraComparison(totalCost, bridgeLength, pvdLength) {
  const container = document.getElementById('optioneering-comparison-chart');
  container.innerHTML = '';
  
  // Total cost comparison between Embankment vs Viaduct
  // Emb cost is lower initially but high treatment and huge GPMB area.
  // Viaduct is high initial cost, low GPMB.
  const isViaduct = STATE.infra.stabilizationOption === 'VIADUCT';
  
  // Embankment option cost (approx 69 Billion base)
  // Viaduct option cost (approx 105 Billion initial)
  const embInitialCost = 69.4; // Billion
  const viaductInitialCost = 105.8; // Billion
  
  // GPMB cost: Embankment requires 42.5m footprint * 1200m = 51000 m2. At 500k/m2 = 25.5B.
  // Viaduct: 24.5m footprint * 1200m = 29400 m2. At 500k/m2 = 14.7B.
  const embGpmbCost = 25.5; // Billion
  const viaductGpmbCost = 14.7; // Billion
  
  // Maintenance cost over 30 years: Embankment on soft soil settlement = 12 Billion. Viaduct = 3 Billion.
  const embMaintCost = 12.0; // Billion
  const viaductMaintCost = 3.0; // Billion
  
  const totalLifecycleEmb = embInitialCost + embGpmbCost + embMaintCost; // 106.9 Billion
  const totalLifecycleViaduct = viaductInitialCost + viaductGpmbCost + viaductMaintCost; // 123.5 Billion
  
  // If land acquisition prices are higher (e.g. urban expansion), viaduct becomes much cheaper!
  // Let's render a nice lifecycle cost bar breakdown
  
  const activeLifecycleTotal = isViaduct ? totalLifecycleViaduct : totalLifecycleEmb;
  
  container.innerHTML = `
    <!-- Lifecycle Cost Comparison -->
    <div class="comp-bar-group">
      <div class="comp-bar-header">
        <span>Tổng Chi Phí Vòng Đời 30 Năm (Ước Tính)</span>
        <span style="color:var(--accent-purple);">${activeLifecycleTotal.toFixed(1)} tỷ đ</span>
      </div>
      
      <div style="font-size:10.5px; margin-bottom:4px; display:flex; justify-content:space-between;">
        <span>PA A (Đắp đất nền yếu)</span>
        <span>${totalLifecycleEmb.toFixed(1)} tỷ đ</span>
      </div>
      <div class="comp-bar-outer">
        <!-- Initial + GPMB + Maintenance -->
        <div style="display:flex; width:100%; height:100%;">
          <div style="width:${(embInitialCost/totalLifecycleEmb)*100}%; background:#475569;" title="Chi phí xây dựng thô"></div>
          <div style="width:${(embGpmbCost/totalLifecycleEmb)*100}%; background:#b45309;" title="Chi phí giải phóng mặt bằng"></div>
          <div style="width:${(embMaintCost/totalLifecycleEmb)*100}%; background:#991b1b;" title="Chi phí bảo trì, xử lý lún"></div>
        </div>
      </div>
      
      <div style="font-size:10.5px; margin-bottom:4px; margin-top:6px; display:flex; justify-content:space-between;">
        <span>PA B (Cầu cạn Viaduct)</span>
        <span>${totalLifecycleViaduct.toFixed(1)} tỷ đ</span>
      </div>
      <div class="comp-bar-outer">
        <div style="display:flex; width:100%; height:100%;">
          <div style="width:${(viaductInitialCost/totalLifecycleViaduct)*100}%; background:var(--accent-purple);" title="Chi phí xây dựng thô"></div>
          <div style="width:${(viaductGpmbCost/totalLifecycleViaduct)*100}%; background:#b45309;" title="Chi phí giải phóng mặt bằng"></div>
          <div style="width:${(viaductMaintCost/totalLifecycleViaduct)*100}%; background:#991b1b;" title="Chi phí bảo trì"></div>
        </div>
      </div>
      
      <div style="display:flex; gap:8px; font-size:9.5px; color:var(--text-muted); margin-top:2px; flex-wrap:wrap;">
        <span style="display:inline-flex; align-items:center; gap:2px;"><span style="display:inline-block; width:6px; height:6px; background:#475569;"></span> Xây dựng thô</span>
        <span style="display:inline-flex; align-items:center; gap:2px;"><span style="display:inline-block; width:6px; height:6px; background:#b45309;"></span> GPMB</span>
        <span style="display:inline-flex; align-items:center; gap:2px;"><span style="display:inline-block; width:6px; height:6px; background:#991b1b;"></span> Bảo trì & xử lý lún</span>
      </div>
      
      <div style="font-size:10.5px; text-align:justify; color:var(--text-secondary); padding: 8px; background:rgba(139,92,246,0.06); border:1px dashed rgba(139,92,246,0.2); border-radius:4px; margin-top:4px;">
        <strong>Phân tích quyết định:</strong> PA A rẻ hơn ở chi phí xây dựng ban đầu nhưng diện tích chiếm dụng rộng, chi phí giải phóng mặt bằng cao và rủi ro sụt lún kéo dài phát sinh bảo trì. PA B (Cầu cạn) giảm GPMB, loại bỏ xử lý nền yếu. Nếu đơn giá đất GPMB tăng 1.5 lần, <strong>PA B (Cầu cạn) lập tức tối ưu hơn về tổng chi phí vòng đời</strong>.
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------

// Formats number to currency style (e.g. 1.450.000)
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ----------------------------------------------------
// BIM VIEW MODES & HOTSPOTS INTERACTION
// ----------------------------------------------------

const HOTSPOT_DB = {
  CIVIL: [
    {
      title: "Bê tông cốt thép sàn",
      code: "03 30 00",
      desc: "Bê tông cấp độ bền B22.5 (M300), tính tự động theo thể tích thực tế từ mô hình BIM.",
      x: "52%", y: "62%"
    },
    {
      title: "Tường xây / Vách ngăn",
      code: "04 20 00",
      desc: "Hệ tường gạch không nung dày 110mm hoặc tấm bê tông nhẹ nhẹ chịu lực.",
      x: "42%", y: "42%"
    },
    {
      title: "Cửa sổ nhôm kính Xingfa",
      code: "08 50 00",
      desc: "Đặc tả kính Low-E cản nhiệt kết hợp nhôm hệ Xingfa chính hãng nhập khẩu.",
      x: "72%", y: "30%"
    },
    {
      title: "Ốp gạch WC Granite",
      code: "09 30 10",
      desc: "Gạch Granite 300x600 cao cấp, chống trơn trượt cho bề mặt ẩm ướt.",
      x: "24%", y: "24%"
    }
  ],
  INFRA: [
    {
      title: "Dầm Super-T dự ứng lực",
      code: "03 41 00",
      desc: "Dầm Super-T BTCT dự ứng lực đúc sẵn L=33m cẩu lắp định vị trên mố.",
      x: "56%", y: "46%"
    },
    {
      title: "Bê tông cốt thép mố trụ cầu",
      code: "03 30 20",
      desc: "Thân mố trụ cầu bê tông mác cao đổ tại chỗ với cốt thép CB400-V.",
      x: "46%", y: "66%"
    },
    {
      title: "Xử lý nền đất yếu bằng bấc thấm PVD",
      code: "31 32 00",
      desc: "Cắm bấc thấm nhựa độ sâu 15m xử lý cố kết nền đắp cao trên đất yếu.",
      x: "22%", y: "80%"
    },
    {
      title: "Mặt đường bê tông nhựa",
      code: "32 12 16",
      desc: "Bê tông nhựa nóng 2 lớp chặt dày 12cm bảo đảm êm thuận tốc độ cao.",
      x: "68%", y: "32%"
    }
  ]
};

function switchViewMode(mode) {
  STATE.viewMode = mode;
  
  // Cập nhật trạng thái active cho các nút chế độ xem
  document.querySelectorAll('.view-mode-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtnId = mode === '2D' ? 'btn-view-2d' : (mode === '3D' ? 'btn-view-3d' : 'btn-view-hybrid');
  const activeBtn = document.getElementById(activeBtnId);
  if (activeBtn) activeBtn.classList.add('active');
  
  const svgCanvas = document.getElementById('interactive-svg');
  const wrap3d = document.getElementById('viewer-image-3d-wrap');
  const wrapHybrid = document.getElementById('viewer-image-hybrid-wrap');
  const scenarioDesc = document.getElementById('scenario-brief-desc');
  
  if (mode === '2D') {
    svgCanvas.style.display = 'block';
    wrap3d.style.display = 'none';
    wrapHybrid.style.display = 'none';
    
    document.getElementById('viewer-title-label').innerText = 'Mô hình hình học 2D - Cấu kiện BIM';
    scenarioDesc.innerHTML = 'Thay đổi các thanh trượt và đặc tính ở cột bên trái để quan sát cấu kiện hình học biến đổi trực tiếp trên bản vẽ thiết kế BIM.';
  } else if (mode === '3D') {
    svgCanvas.style.display = 'none';
    wrap3d.style.display = 'flex';
    wrapHybrid.style.display = 'none';
    
    document.getElementById('viewer-title-label').innerText = 'Mô hình phối cảnh 3D BIM';
    scenarioDesc.innerHTML = '<strong>Gợi ý:</strong> Di chuyển chuột lên các điểm nháy tròn (Hotspots) trên mô hình để xem mã đặc tả MasterFormat tương ứng. Nhấp vào điểm nháy để xem chi tiết quy tắc đo bóc. <em>(Lưu ý: Chuyển sang 2D CAD để thấy sự biến đổi hình học trực quan theo thanh trượt)</em>.';
    
    updateViewerImages();
  } else if (mode === 'HYBRID') {
    svgCanvas.style.display = 'none';
    wrap3d.style.display = 'none';
    wrapHybrid.style.display = 'flex';
    
    document.getElementById('viewer-title-label').innerText = 'Mô hình kết hợp 2D + 3D BIM';
    scenarioDesc.innerHTML = '<strong>Gợi ý:</strong> Di chuyển chuột lên các điểm nháy tròn (Hotspots) trên mô hình để xem mã đặc tả MasterFormat tương ứng. Nhấp vào điểm nháy để xem chi tiết quy tắc đo bóc. <em>(Lưu ý: Chuyển sang 2D CAD để thấy sự biến đổi hình học trực quan theo thanh trượt)</em>.';
    
    updateViewerImages();
  }
}

function updateViewerImages() {
  const img3d = document.getElementById('viewer-img-3d');
  const imgHybrid = document.getElementById('viewer-img-hybrid');
  
  if (!img3d || !imgHybrid) return;
  
  if (STATE.activeProject === 'CIVIL') {
    img3d.src = 'assets/civil_bim_3d.png';
    imgHybrid.src = 'assets/civil_bim_combo.png';
    renderHotspots('CIVIL');
  } else {
    img3d.src = 'assets/infra_bim_3d.png';
    imgHybrid.src = 'assets/infra_bim_combo.png';
    renderHotspots('INFRA');
  }
}

function renderHotspots(projectKey) {
  const container3d = document.getElementById('hotspots-3d');
  const containerHybrid = document.getElementById('hotspots-hybrid');
  
  if (!container3d || !containerHybrid) return;
  
  container3d.innerHTML = '';
  containerHybrid.innerHTML = '';
  
  const hotspotsData = HOTSPOT_DB[projectKey];
  if (!hotspotsData) return;
  
  hotspotsData.forEach(h => {
    // Cho chế độ 3D
    const el3d = createHotspotEl(h);
    container3d.appendChild(el3d);
    
    // Cho chế độ Hybrid
    const elHybrid = createHotspotEl(h);
    containerHybrid.appendChild(elHybrid);
  });
}

function createHotspotEl(h) {
  const div = document.createElement('div');
  div.className = 'hotspot';
  div.style.left = h.x;
  div.style.top = h.y;
  
  div.innerHTML = `
    <div class="hotspot-tooltip">
      <div class="hotspot-tooltip-title">${h.title}</div>
      <div class="hotspot-tooltip-code">Mã: ${h.code}</div>
      <div class="hotspot-tooltip-desc">${h.desc}</div>
    </div>
  `;
  
  // Nhấp vào điểm nháy sẽ tự nhảy sang tab lý thuyết và cuộn/click vào mã tương ứng
  div.onclick = (e) => {
    e.stopPropagation();
    highlightMasterFormatCode(h.code.split(' / ')[0]);
  };
  
  return div;
}

function highlightMasterFormatCode(code) {
  // Chuyển sang Tab 1: Khung lý luận
  switchTab('theory');
  
  // Tìm và nhấp vào mã phân loại tương ứng trong sidebar
  const items = document.querySelectorAll('.class-item');
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemCodeEl = item.querySelector('.class-item-code');
    if (itemCodeEl && itemCodeEl.innerText.trim() === code) {
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      item.click();
      break;
    }
  }
}
