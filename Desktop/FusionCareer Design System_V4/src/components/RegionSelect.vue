<template>
  <div class="region-select">
    <!-- 省份按钮 -->
    <div ref="provBtnRef" class="rs-btn" :class="{ active: provOpen || selectedProv }" @click="toggleProv">
      <span>{{ selectedProv || '全部省份' }}</span>
      <i class="ti ti-chevron-down chev" :class="{ rotated: provOpen }" aria-hidden="true" />
    </div>

    <div class="rs-divider" />

    <!-- 城市按钮 -->
    <div
      ref="cityBtnRef"
      class="rs-btn"
      :class="{ active: cityOpen || selectedCity, disabled: !selectedProv }"
      @click="toggleCity"
    >
      <span>{{ selectedCity || (selectedProv ? '请选择城市' : '请先选省份') }}</span>
      <i class="ti ti-chevron-down chev" :class="{ rotated: cityOpen }" aria-hidden="true" />
    </div>

    <!-- 省份面板 —— Teleport 到 body，脱离父容器裁剪 -->
    <Teleport to="body">
      <div
        v-if="provOpen"
        ref="provPanelRef"
        class="rs-panel"
        :style="provStyle"
        @mousedown.prevent
      >
        <div class="rs-scroll">
          <template v-for="group in provinceGroups" :key="group.label">
            <div class="rs-group-label">{{ group.label }}</div>
            <div
              v-for="p in group.items"
              :key="p"
              class="rs-item"
              :class="{ selected: selectedProv === p }"
              @click="selectProv(p)"
            >{{ p }}</div>
          </template>
        </div>
      </div>
    </Teleport>

    <!-- 城市面板 -->
    <Teleport to="body">
      <div
        v-if="cityOpen && selectedProv"
        ref="cityPanelRef"
        class="rs-panel"
        :style="cityStyle"
        @mousedown.prevent
      >
        <div class="rs-scroll">
          <div
            v-for="c in currentCities"
            :key="c"
            class="rs-item"
            :class="{ selected: selectedCity === c }"
            @click="selectCity(c)"
          >{{ c }}</div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

// ── 省市数据 ──────────────────────────────────────────────
const provinceGroups = [
  {
    label: '全国',
    items: ['全部省份'],
  },
  {
    label: '华东',
    items: ['上海', '江苏', '浙江', '安徽', '福建', '山东'],
  },
  {
    label: '华北',
    items: ['北京', '天津', '河北', '山西', '内蒙古'],
  },
  {
    label: '华南',
    items: ['广东', '广西', '海南'],
  },
  {
    label: '华中',
    items: ['湖北', '湖南', '河南', '江西'],
  },
  {
    label: '西南',
    items: ['四川', '重庆', '云南', '贵州', '西藏'],
  },
  {
    label: '西北',
    items: ['陕西', '甘肃', '新疆', '青海', '宁夏'],
  },
  {
    label: '东北',
    items: ['辽宁', '吉林', '黑龙江'],
  },
]

const cityMap = {
  上海: ['上海'],
  江苏: ['南京', '苏州', '无锡', '南通', '常州', '扬州', '徐州', '盐城', '泰州', '镇江', '宿迁', '淮安', '连云港'],
  浙江: ['杭州', '宁波', '温州', '绍兴', '嘉兴', '金华', '台州', '舟山', '湖州', '衢州', '丽水'],
  安徽: ['合肥', '芜湖', '蚌埠', '淮南', '马鞍山', '铜陵', '安庆', '黄山', '阜阳', '宿州'],
  福建: ['福州', '厦门', '泉州', '漳州', '莆田', '三明', '南平', '龙岩', '宁德'],
  山东: ['济南', '青岛', '烟台', '潍坊', '济宁', '临沂', '淄博', '菏泽', '威海', '东营', '滨州'],
  北京: ['北京'],
  天津: ['天津'],
  河北: ['石家庄', '唐山', '保定', '邯郸', '沧州', '廊坊', '张家口', '承德', '秦皇岛'],
  山西: ['太原', '大同', '运城', '临汾', '长治', '晋城'],
  内蒙古: ['呼和浩特', '包头', '鄂尔多斯', '赤峰'],
  广东: ['广州', '深圳', '东莞', '佛山', '珠海', '惠州', '中山', '汕头', '江门', '湛江', '茂名'],
  广西: ['南宁', '桂林', '柳州', '梧州', '北海'],
  海南: ['海口', '三亚', '儋州'],
  湖北: ['武汉', '宜昌', '襄阳', '黄石', '荆州', '十堰'],
  湖南: ['长沙', '株洲', '湘潭', '衡阳', '常德', '郴州', '岳阳'],
  河南: ['郑州', '洛阳', '开封', '南阳', '许昌', '新乡', '焦作', '安阳'],
  江西: ['南昌', '赣州', '九江', '上饶', '吉安', '宜春'],
  四川: ['成都', '绵阳', '德阳', '南充', '宜宾', '达州', '乐山', '泸州'],
  重庆: ['重庆'],
  云南: ['昆明', '大理', '丽江', '曲靖', '玉溪', '西双版纳'],
  贵州: ['贵阳', '遵义', '六盘水', '安顺'],
  西藏: ['拉萨', '日喀则', '昌都'],
  陕西: ['西安', '咸阳', '宝鸡', '渭南', '汉中', '延安'],
  甘肃: ['兰州', '天水', '白银', '酒泉', '张掖'],
  新疆: ['乌鲁木齐', '喀什', '伊宁', '库尔勒'],
  青海: ['西宁', '海东'],
  宁夏: ['银川', '石嘴山', '吴忠'],
  辽宁: ['沈阳', '大连', '鞍山', '抚顺', '锦州', '盘锦'],
  吉林: ['长春', '吉林市', '四平', '延吉'],
  黑龙江: ['哈尔滨', '齐齐哈尔', '牡丹江', '大庆', '佳木斯'],
}

// ── state ────────────────────────────────────────────────
const selectedProv = ref('')
const selectedCity = ref('')
const provOpen = ref(false)
const cityOpen = ref(false)

const provBtnRef = ref(null)
const cityBtnRef = ref(null)
const provPanelRef = ref(null)
const cityPanelRef = ref(null)

const provStyle = ref({})
const cityStyle = ref({})

// ── emits ─────────────────────────────────────────────────
const emit = defineEmits(['change'])

// ── computed ──────────────────────────────────────────────
const currentCities = computed(() => cityMap[selectedProv.value] || [])

// ── panel positioning ─────────────────────────────────────
function calcStyle(btnRef) {
  const r = btnRef.value?.getBoundingClientRect()
  if (!r) return {}
  return {
    position: 'fixed',
    top: r.bottom + 5 + 'px',
    left: r.left + 'px',
    minWidth: Math.max(r.width, 140) + 'px',
    zIndex: 9999,
  }
}

// ── toggle ────────────────────────────────────────────────
async function toggleProv() {
  provOpen.value = !provOpen.value
  cityOpen.value = false
  if (provOpen.value) {
    await nextTick()
    provStyle.value = calcStyle(provBtnRef)
  }
}

async function toggleCity() {
  if (!selectedProv.value) return
  cityOpen.value = !cityOpen.value
  provOpen.value = false
  if (cityOpen.value) {
    await nextTick()
    cityStyle.value = calcStyle(cityBtnRef)
  }
}

// ── select ────────────────────────────────────────────────
function selectProv(prov) {
  if (prov === '全部省份') {
    selectedProv.value = ''
    selectedCity.value = ''
  } else {
    selectedProv.value = prov
    selectedCity.value = ''
  }
  provOpen.value = false
  emit('change', { province: selectedProv.value, city: selectedCity.value })
}

function selectCity(city) {
  selectedCity.value = city
  cityOpen.value = false
  emit('change', { province: selectedProv.value, city: selectedCity.value })
}

// ── click outside ─────────────────────────────────────────
function onClickOutside(e) {
  const els = [provBtnRef, cityBtnRef, provPanelRef, cityPanelRef]
  if (els.every(r => !r.value?.contains(e.target))) {
    provOpen.value = false
    cityOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css');

.region-select {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rs-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: 1px solid rgba(28, 26, 24, 0.18);
  border-radius: 9999px;
  background: #fff;
  font-size: 13px;
  color: #1c1a18;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  transition: border-color 160ms ease, color 160ms ease;
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.rs-btn:hover {
  border-color: rgba(155, 35, 53, 0.25);
}

.rs-btn.active {
  border-color: #9b2335;
  color: #9b2335;
}

.rs-btn.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.chev {
  font-size: 11px;
  color: #8c8880;
  transition: transform 160ms ease;
}

.rs-btn.active .chev {
  color: #9b2335;
}

.chev.rotated {
  transform: rotate(180deg);
}

.rs-divider {
  width: 1px;
  height: 26px;
  background: rgba(28, 26, 24, 0.1);
}

/* 面板 —— 全局样式（Teleport 到 body 后 scoped 不生效，需要 :global） */
:global(.rs-panel) {
  background: #fff;
  border: 1px solid rgba(28, 26, 24, 0.18);
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(28, 26, 24, 0.11);
  overflow: hidden;
  animation: rs-fade-in 140ms ease;
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

:global(.rs-scroll) {
  max-height: 220px; /* 约显示 5~6 条 */
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #e0ddd9 transparent;
}

:global(.rs-scroll::-webkit-scrollbar) {
  width: 3px;
}

:global(.rs-scroll::-webkit-scrollbar-thumb) {
  background: #e0ddd9;
  border-radius: 99px;
}

:global(.rs-group-label) {
  padding: 7px 13px 3px;
  font-size: 11px;
  color: #8c8880;
  font-weight: 600;
  letter-spacing: 0.06em;
  border-top: 1px solid rgba(28, 26, 24, 0.08);
}

:global(.rs-group-label:first-child) {
  border-top: none;
}

:global(.rs-item) {
  padding: 8px 13px;
  font-size: 13px;
  cursor: pointer;
  color: #504d48;
  transition: background 140ms ease;
  white-space: nowrap;
}

:global(.rs-item:hover) {
  background: #f9f8f6;
}

:global(.rs-item.selected) {
  color: #9b2335;
  font-weight: 500;
  background: #fdf2f3;
}

@keyframes rs-fade-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
