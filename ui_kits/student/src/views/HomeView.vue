<template>
  <div>
    <UserNavbar />
    <AppToast />

    <main class="page">
      <div class="wrap">

        <!-- 推荐轮播 -->
        <div class="card card-p" style="margin-bottom:1rem">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
            <div class="section-label"><i class="ti ti-star-filled" /> 学院本周推荐岗位</div>
            <div style="display:flex;gap:.25rem">
              <button class="btn btn-secondary btn-sm btn-icon" @click="slide(-1)"><i class="ti ti-chevron-left" /></button>
              <button class="btn btn-secondary btn-sm btn-icon" @click="slide(1)"><i class="ti ti-chevron-right" /></button>
            </div>
          </div>
          <div class="carousel-wrap">
            <div class="carousel-track" :style="{transform:`translateX(${offset}px)`}">
              <div v-for="j in featured" :key="j.id" class="carousel-card" @click="router.push('/job/'+j.id)">
                <div style="font-size:.7rem;color:var(--ink-2);margin-bottom:.25rem">{{ j.company }}</div>
                <div style="font-size:.833rem;font-weight:600;color:var(--ink);line-height:1.3">{{ j.title }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 搜索栏 -->
        <div class="search-bar" style="margin-bottom:.875rem">
          <i class="ti ti-search" style="color:var(--ink-3)" />
          <input class="search-input" v-model="kw" placeholder="搜索岗位、公司、行业关键词…" @keyup.enter="loadJobs" />
          <div class="search-sep" />
          <button class="btn btn-primary btn-sm" @click="loadJobs">搜索</button>
        </div>

        <!-- ══ 筛选面板 ══ -->
        <div class="filter-panel">

          <!-- 行 1：地区 ＋ 岗位类型 -->
          <div class="frow">
            <div class="fcell fcell-loc">
              <span class="flabel">地区</span>
              <div class="location-pair">
                <!-- 自定义省份下拉（Teleport 到 body，解决父容器 overflow 裁剪） -->
                <div class="cselect-wrap" :class="{ open: provinceOpen }" @click.stop>
                  <button ref="provBtnRef" class="cselect-trigger filter-select" type="button" @click="toggleProvince" style="width:96px">
                    <span>{{ provinceF || '全部省份' }}</span>
                    <i class="ti ti-chevron-down cselect-arrow" />
                  </button>
                  <Teleport to="body">
                    <div v-if="provinceOpen" class="cselect-dropdown-teleport" :style="provDropStyle" @click.stop>
                      <div class="cselect-list">
                        <div class="cselect-item" :class="{ active: provinceF === '' }" @click="selectProvince('')">全部省份</div>
                        <div v-for="p in Object.keys(provinces)" :key="p"
                          class="cselect-item" :class="{ active: provinceF === p }"
                          @click="selectProvince(p)">{{ p }}</div>
                      </div>
                    </div>
                  </Teleport>
                </div>
                <div class="cselect-wrap" :class="{ open: cityOpen, disabled: !provinceF }" @click.stop>
                  <button ref="cityBtnRef" class="cselect-trigger filter-select" type="button"
                    :disabled="!provinceF" @click="toggleCity"
                    style="width:88px">
                    <span>{{ cityF || (provinceF ? '全部城市' : '请先选省份') }}</span>
                    <i class="ti ti-chevron-down cselect-arrow" />
                  </button>
                  <Teleport to="body">
                    <div v-if="cityOpen" class="cselect-dropdown-teleport" :style="cityDropStyle" @click.stop>
                      <div class="cselect-list">
                        <div class="cselect-item" :class="{ active: cityF === '' }" @click="selectCity('')">全部城市</div>
                        <div v-for="c in (provinces[provinceF] || [])" :key="c"
                          class="cselect-item" :class="{ active: cityF === c }"
                          @click="selectCity(c)">{{ c }}</div>
                      </div>
                    </div>
                  </Teleport>
                </div>
              </div>
            </div>

            <div class="fcell-div" />

            <div class="fcell fcell-grow">
              <span class="flabel">岗位类型</span>
              <div class="pill-group">
                <button v-for="t in jobTypes" :key="t"
                  :class="['pill', jobtypeF === t && 'active']"
                  @click="toggleJobType(t)">{{ t }}</button>
              </div>
            </div>
          </div>

          <!-- 行 2：招聘类型 -->
          <div class="frow frow-sep">
            <div class="fcell fcell-label-inline">
              <span class="flabel">招聘类型</span>
            </div>
            <div class="pill-group">
              <button v-for="t in recruitTypes" :key="t"
                :class="['pill', recruitF === t && 'active']"
                @click="toggleRecruitType(t)">{{ t }}</button>
            </div>
          </div>

          <!-- 行 3：二级（仅大实习 / 小实习） -->
          <Transition name="l2-fade">
            <div v-if="showL2" class="frow frow-l2">
              <div class="l2-block">
                <span class="flabel">时长</span>
                <select class="filter-select" v-model="durationF" @change="loadJobs">
                  <option value="">不限</option>
                  <option>1 个月以内</option>
                  <option>1–3 个月</option>
                  <option>3–6 个月</option>
                  <option>6 个月以上</option>
                </select>
              </div>

              <div class="l2-vdiv" />

              <div class="l2-block">
                <span class="flabel">每周天数</span>
                <div class="pill-group">
                  <button v-for="d in ['3天','4天','5天']" :key="d"
                    :class="['pill pill-sm', daysF === d && 'active']"
                    @click="toggleL2('daysF', d)">{{ d }}</button>
                </div>
              </div>

              <div class="l2-vdiv" />

              <div class="l2-block">
                <span class="flabel">薪资</span>
                <select class="filter-select" v-model="salaryF" @change="loadJobs">
                  <option value="">不限</option>
                  <option>100元/天以下</option>
                  <option>100–150元/天</option>
                  <option>150–200元/天</option>
                  <option>200元/天以上</option>
                </select>
              </div>

              <div class="l2-vdiv" />

              <div class="l2-block">
                <span class="flabel">实习形式</span>
                <div class="pill-group">
                  <button v-for="m in ['线上线下均可','线下','线上']" :key="m"
                    :class="['pill pill-sm', modeF === m && 'active']"
                    @click="toggleL2('modeF', m)">{{ m }}</button>
                </div>
              </div>
            </div>
          </Transition>

          <!-- 已选 chips -->
          <div v-if="activeChips.length" class="chips-row">
            <span v-for="chip in activeChips" :key="chip.key" class="chip">
              {{ chip.label }}<button class="chip-x" @click="clearFilter(chip.key)">×</button>
            </span>
            <button v-if="activeChips.length > 1" class="chips-clear" @click="clearAll">清除全部</button>
          </div>

        </div><!-- /filter-panel -->

        <!-- 数量 + 排序 -->
        <div class="list-bar">
          <span class="list-count">共 <strong>{{ total }}</strong> 个岗位</span>
          <div class="sort-toggle">
            <button :class="['sort-btn', sortBy==='newest' && 'active']" @click="setSort('newest')">
              最新发布
            </button>
            <button :class="['sort-btn', sortBy==='deadline' && 'active']" @click="setSort('deadline')">
              截止日期
            </button>
          </div>
        </div>

        <!-- 加载 -->
        <div v-if="loading" style="text-align:center;padding:2rem;color:var(--ink-3)">加载中…</div>

        <!-- 岗位列表 -->
        <div v-else style="display:flex;flex-direction:column;gap:.35rem">
          <RouterLink v-for="j in jobs" :key="j.id" class="job-card" :to="'/job/'+j.id">
            <div class="job-logo">{{ j.abbr }}</div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:.45rem;margin-bottom:.25rem;flex-wrap:wrap">
                <span class="job-title">{{ j.title }}</span>
                <span v-if="j.recruitBadge" :class="['badge', j.recruitBadge]">{{ j.recruit }}</span>
              </div>
              <div class="job-meta">
                <span>{{ j.company }}</span>
                <span>{{ j.city }}</span>
                <span>{{ j.jobtype }}</span>
              </div>
              <div v-if="j.l2tags.length" class="job-l2tags">
                <span v-for="tag in j.l2tags" :key="tag" class="badge badge-gray">{{ tag }}</span>
              </div>
            </div>
            <span class="job-dl">截止 {{ j.dl }}</span>
          </RouterLink>

          <div v-if="!jobs.length" style="text-align:center;padding:2.5rem;color:var(--ink-3);font-size:var(--fs-md)">
            暂无符合条件的岗位
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <button v-for="n in totalPages" :key="n" :class="['page-btn', n===page&&'active']" @click="goPage(n)">{{ n }}</button>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import UserNavbar from '@/components/UserNavbar.vue'
import AppToast from '@/components/AppToast.vue'
import { useToast } from '@/composables/useToast'
import { readJson } from '@/lib/api'

const router = useRouter()
const toast = useToast()
const offset = ref(0)
const CARD_W = 208
const featured = ref([])
function slide(dir) {
  const min = -(Math.max(featured.value.length - 3, 0)) * CARD_W
  offset.value = Math.max(Math.min(offset.value - dir * CARD_W, 0), min)
}

// ── 一级筛选 ──
const kw        = ref('')
const provinceF = ref('')
const cityF     = ref('')
const jobtypeF  = ref('')
const recruitF  = ref('')
const provinceOpen = ref(false)
const provBtnRef   = ref(null)
const provDropStyle = ref({})

function toggleProvince() {
  provinceOpen.value = !provinceOpen.value
  if (provinceOpen.value) {
    nextTick(() => {
      const r = provBtnRef.value?.getBoundingClientRect()
      if (r) {
        provDropStyle.value = {
          position: 'fixed',
          top:  r.bottom + 4 + 'px',
          left: r.left   + 'px',
          minWidth: '140px',
          zIndex: 9999,
        }
      }
    })
  }
}

function selectProvince(p) {
  provinceF.value = p
  cityF.value = ''
  provinceOpen.value = false
  loadJobs()
}

// 点击外部关闭省份下拉
if (typeof window !== 'undefined') {
  document.addEventListener('click', () => {
    provinceOpen.value = false
    cityOpen.value = false
  })
}

// ── 城市自定义下拉 ──
const cityOpen     = ref(false)
const cityBtnRef   = ref(null)
const cityDropStyle = ref({})

function toggleCity() {
  if (!provinceF.value) return
  cityOpen.value = !cityOpen.value
  if (cityOpen.value) {
    nextTick(() => {
      const r = cityBtnRef.value?.getBoundingClientRect()
      if (r) {
        cityDropStyle.value = {
          position: 'fixed',
          top:      r.bottom + 4 + 'px',
          left:     r.left   + 'px',
          minWidth: '140px',
          zIndex:   9999,
        }
      }
    })
  }
}

function selectCity(c) {
  cityF.value = c
  cityOpen.value = false
  loadJobs()
}

// ── 二级筛选（仅大实习/小实习） ──
const durationF = ref('')
const daysF     = ref('')
const salaryF   = ref('')
const modeF     = ref('')

// 仅大实习/小实习展示二级
const showL2 = computed(() => recruitF.value === '大实习' || recruitF.value === '小实习')

const provinces = {
  '北京':   ['北京'],
  '上海':   ['上海'],
  '天津':   ['天津'],
  '重庆':   ['重庆'],
  '广东':   ['广州','深圳','珠海','东莞','佛山','惠州','中山','汕头'],
  '浙江':   ['杭州','宁波','温州','绍兴','金华','嘉兴'],
  '江苏':   ['南京','苏州','无锡','常州','南通','扬州','徐州'],
  '山东':   ['济南','青岛','烟台','潍坊','临沂'],
  '四川':   ['成都','绵阳','德阳','宜宾'],
  '湖北':   ['武汉','宜昌','襄阳'],
  '湖南':   ['长沙','株洲','岳阳'],
  '河南':   ['郑州','洛阳','开封'],
  '河北':   ['石家庄','保定','唐山','廊坊'],
  '陕西':   ['西安','咸阳','宝鸡'],
  '辽宁':   ['沈阳','大连','鞍山'],
  '吉林':   ['长春','吉林市'],
  '黑龙江': ['哈尔滨','齐齐哈尔','大庆'],
  '安徽':   ['合肥','芜湖','马鞍山'],
  '福建':   ['福州','厦门','泉州','莆田'],
  '江西':   ['南昌','赣州','九江'],
  '山西':   ['太原','大同','运城'],
  '云南':   ['昆明','大理','丽江'],
  '贵州':   ['贵阳','遵义'],
  '广西':   ['南宁','桂林','柳州'],
  '海南':   ['海口','三亚'],
  '甘肃':   ['兰州','天水'],
  '内蒙古': ['呼和浩特','包头','鄂尔多斯'],
  '新疆':   ['乌鲁木齐','喀什'],
  '西藏':   ['拉萨'],
  '宁夏':   ['银川'],
  '青海':   ['西宁'],
  '香港':   ['香港'],
  '澳门':   ['澳门'],
  '台湾':   ['台北','高雄','台中','台南'],
  '海外':   ['东京','纽约','伦敦','新加坡','首尔','巴黎','悉尼'],
}
const jobTypes    = ['新闻媒体','企业公司','党政机关','学术教职','其他']
const recruitTypes = ['大实习','小实习','日常实习','应届招聘']

function toggleJobType(v) {
  jobtypeF.value = jobtypeF.value === v ? '' : v
  loadJobs()
}
function toggleRecruitType(v) {
  if (recruitF.value === v) {
    recruitF.value = ''
  } else {
    recruitF.value = v
  }
  // 切换类型时清空二级
  if (!showL2.value) {
    durationF.value = ''; daysF.value = ''; salaryF.value = ''; modeF.value = ''
  }
  loadJobs()
}
function toggleL2(field, val) {
  if (field === 'daysF') daysF.value = daysF.value === val ? '' : val
  if (field === 'modeF') modeF.value = modeF.value === val ? '' : val
  loadJobs()
}

// ── Chips ──
const chipDefs = [
  { key:'province', label: () => provinceF.value },
  { key:'city',     label: () => cityF.value },
  { key:'jobtype',  label: () => jobtypeF.value },
  { key:'recruit',  label: () => recruitF.value },
  { key:'duration', label: () => durationF.value ? `时长：${durationF.value}` : '' },
  { key:'days',     label: () => daysF.value ? `${daysF.value}/周` : '' },
  { key:'salary',   label: () => salaryF.value },
  { key:'mode',     label: () => modeF.value },
]
const activeChips = computed(() =>
  chipDefs.map(d => ({ key: d.key, label: d.label() })).filter(c => c.label)
)
function clearFilter(key) {
  if (key === 'province') { provinceF.value = ''; cityF.value = ''; provinceOpen.value = false; cityOpen.value = false }
  else if (key === 'city')     { cityF.value = ''; cityOpen.value = false }
  else if (key === 'jobtype')  jobtypeF.value = ''
  else if (key === 'recruit') {
    recruitF.value = ''
    durationF.value = ''; daysF.value = ''; salaryF.value = ''; modeF.value = ''
  }
  else if (key === 'duration') durationF.value = ''
  else if (key === 'days')     daysF.value = ''
  else if (key === 'salary')   salaryF.value = ''
  else if (key === 'mode')     modeF.value = ''
  loadJobs()
}
function clearAll() {
  provinceF.value = ''; cityF.value = ''; jobtypeF.value = ''; recruitF.value = ''
  durationF.value = ''; daysF.value = ''; salaryF.value = ''; modeF.value = ''
  loadJobs()
}

// ── List ──
const jobs       = ref([])
const total      = ref(0)
const page       = ref(1)
const pageSize   = 10
const sortBy     = ref('newest')
const loading    = ref(false)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

function setSort(s) { sortBy.value = s; page.value = 1; loadJobs() }
function goPage(n)  { page.value = n; loadJobs() }
function abbrOf(n)  { return n ? n.charAt(0) : '职' }
function fmtDate(s) { return s ? s.slice(5,10) : '' }

const RECRUIT_BADGE = {
  '大实习':'badge-blue', '小实习':'badge-green',
  '日常实习':'badge-amber', '应届招聘':'badge-red',
}
function recruitLabel(t) {
  const m = {
    BIG_INTERNSHIP:'大实习', SMALL_INTERNSHIP:'小实习',
    DAILY_INTERNSHIP:'日常实习', CAMPUS_RECRUITMENT:'应届招聘',
    CAMPUS_SCREENING:'应届招聘', OTHER:'',
  }
  return m[t] || ''
}
// 后端 WorkMode 枚举：HYBRID = 线上线下均可
function workModeLabel(t) {
  const m = { ONLINE:'线上', OFFLINE:'线下', BOTH:'线上线下均可', HYBRID:'线上线下均可' }
  return m[t] || t || ''
}

const MOCK = [
  { id:1,  abbr:'新', title:'新媒体编辑记者',        company:'新华社',         city:'上海', province:'上海', jobtype:'新闻媒体', recruit:'应届招聘', duration:'',         days:'',   salary:'',            mode:'',          dl:'07-01', pub:'05-20', rec:true  },
  { id:2,  abbr:'腾', title:'内容运营实习生',         company:'腾讯新闻',       city:'深圳', province:'广东', jobtype:'企业公司', recruit:'大实习',   duration:'3–6 个月', days:'5天', salary:'150–200元/天',  mode:'线下',       dl:'07-10', pub:'05-14', rec:false },
  { id:3,  abbr:'字', title:'企业公关传播实习',       company:'字节跳动',       city:'上海', province:'上海', jobtype:'企业公司', recruit:'大实习',   duration:'3–6 个月', days:'5天', salary:'200元/天以上',  mode:'线下',       dl:'07-15', pub:'05-13', rec:false },
  { id:4,  abbr:'澎', title:'数据新闻记者',           company:'澎湃新闻',       city:'上海', province:'上海', jobtype:'新闻媒体', recruit:'应届招聘', duration:'',         days:'',   salary:'',            mode:'',          dl:'06-20', pub:'05-12', rec:false },
  { id:5,  abbr:'人', title:'新媒体编辑（人民网）',   company:'人民日报社',     city:'北京', province:'北京', jobtype:'新闻媒体', recruit:'应届招聘', duration:'',         days:'',   salary:'',            mode:'',          dl:'07-01', pub:'05-18', rec:true  },
  { id:6,  abbr:'宣', title:'新闻宣传岗位',           company:'上海市委宣传部', city:'上海', province:'上海', jobtype:'党政机关', recruit:'应届招聘', duration:'',         days:'',   salary:'',            mode:'',          dl:'06-15', pub:'05-09', rec:false },
  { id:7,  abbr:'央', title:'融媒体内容策划',         company:'央视新闻',       city:'北京', province:'北京', jobtype:'新闻媒体', recruit:'应届招聘', duration:'',         days:'',   salary:'',            mode:'',          dl:'07-15', pub:'05-15', rec:true  },
  { id:8,  abbr:'财', title:'财经记者（校招）',       company:'财新传媒',       city:'上海', province:'上海', jobtype:'新闻媒体', recruit:'应届招聘', duration:'',         days:'',   salary:'',            mode:'',          dl:'08-01', pub:'05-10', rec:false },
  { id:9,  abbr:'复', title:'新闻传播学助理研究员',   company:'复旦大学',       city:'上海', province:'上海', jobtype:'学术教职', recruit:'应届招聘', duration:'',         days:'',   salary:'',            mode:'',          dl:'07-30', pub:'05-07', rec:false },
  { id:10, abbr:'界', title:'科技线记者实习',         company:'界面新闻',       city:'上海', province:'上海', jobtype:'新闻媒体', recruit:'日常实习', duration:'1–3 个月', days:'3天', salary:'100–150元/天',  mode:'线下',       dl:'06-28', pub:'05-06', rec:false },
  { id:11, abbr:'彭', title:'彭博驻华实习记者',       company:'Bloomberg',      city:'北京', province:'北京', jobtype:'新闻媒体', recruit:'小实习',   duration:'3–6 个月', days:'5天', salary:'200元/天以上',  mode:'线下',       dl:'07-20', pub:'05-04', rec:false },
  { id:12, abbr:'路', title:'路透社多媒体实习',       company:'Reuters',        city:'香港', province:'海外', jobtype:'新闻媒体', recruit:'小实习',   duration:'3–6 个月', days:'4天', salary:'200元/天以上',  mode:'线上线下均可', dl:'08-15', pub:'05-02', rec:false },
]

const DURATION_DISPLAY = {
  LESS_THAN_THREE_MONTHS: '3个月以内',
  THREE_TO_SIX_MONTHS:    '3–6个月',
  MORE_THAN_SIX_MONTHS:   '6个月以上',
}
const DAYS_DISPLAY = {
  ONE_TO_TWO_DAYS:    '1-2天/周',
  THREE_TO_FOUR_DAYS: '3-4天/周',
  FIVE_DAYS:          '5天/周',
}

// ── 枚举映射（模块级常量）──
const JOBTYPE_ENUM = {
  '新闻媒体': 'MEDIA', '企业公司': 'ENTERPRISE',
  '党政机关': 'GOVERNMENT', '学术教职': 'ACADEMIC', '其他': 'OTHER',
}
const JOBTYPE_LABEL = {
  MEDIA: '新闻媒体', ENTERPRISE: '企业公司', GOVERNMENT: '党政机关',
  ACADEMIC: '学术教职', OTHER: '其他',
}
const RECRUIT_ENUM = {
  '大实习': 'BIG_INTERNSHIP', '小实习': 'SMALL_INTERNSHIP',
  '日常实习': 'DAILY_INTERNSHIP', '应届招聘': 'CAMPUS_RECRUITMENT',
}
const DURATION_ENUM = {
  '1 个月以内': 'LESS_THAN_THREE_MONTHS',
  '1–3 个月':   'LESS_THAN_THREE_MONTHS',
  '3–6 个月':   'THREE_TO_SIX_MONTHS',
  '6 个月以上':  'MORE_THAN_SIX_MONTHS',
}
const DAYS_ENUM = {
  '3天': 'ONE_TO_TWO_DAYS',
  '4天': 'THREE_TO_FOUR_DAYS',
  '5天': 'FIVE_DAYS',
}
const MODE_ENUM = {
  '线上': 'ONLINE', '线下': 'OFFLINE', '线上线下均可': 'HYBRID',
}
const SALARY_RANGE = {
  '100元/天以下':  { salaryMax: 99 },
  '100–150元/天': { salaryMin: 100, salaryMax: 150 },
  '150–200元/天': { salaryMin: 151, salaryMax: 200 },
  '200元/天以上':  { salaryMin: 201 },
}

function mapJob(readJob) {
  const readRecruit = recruitLabel(readJob.recruitType)
  return {
    id: readJob.id,
    abbr: abbrOf(readJob.companyName),
    title: readJob.positionName,
    company: readJob.companyName,
    city: readJob.workCity || '',
    jobtype: JOBTYPE_LABEL[readJob.jobCategory] || '',
    recruit: readRecruit,
    recruitBadge: RECRUIT_BADGE[readRecruit] || '',
    l2tags: [
      readJob.workPeriodType ? DURATION_DISPLAY[readJob.workPeriodType] : null,
      readJob.workDurationType ? DAYS_DISPLAY[readJob.workDurationType] : null,
      readJob.salaryDisplay,
      workModeLabel(readJob.workMode),
    ].filter(Boolean),
    dl: fmtDate(readJob.workEndDate),
  }
}

async function loadJobs() {
  loading.value = true
  try {
    const readParams = new URLSearchParams({ page: page.value, size: pageSize })
    if (kw.value) readParams.set('keyword', kw.value)
    if (provinceF.value) readParams.set('workProvince', provinceF.value)
    if (cityF.value) readParams.set('workCity', cityF.value)
    if (jobtypeF.value) readParams.set('jobCategory', JOBTYPE_ENUM[jobtypeF.value] || jobtypeF.value)
    if (recruitF.value) readParams.set('recruitType', RECRUIT_ENUM[recruitF.value] || recruitF.value)
    if (durationF.value) {
      const readDuration = DURATION_ENUM[durationF.value]
      if (readDuration) readParams.set('workPeriodType', readDuration)
    }
    if (daysF.value) {
      const readDays = DAYS_ENUM[daysF.value]
      if (readDays) readParams.set('workDurationType', readDays)
    }
    if (salaryF.value) {
      const readSalary = SALARY_RANGE[salaryF.value]
      if (readSalary?.salaryMin != null) readParams.set('salaryMin', readSalary.salaryMin)
      if (readSalary?.salaryMax != null) readParams.set('salaryMax', readSalary.salaryMax)
    }
    if (modeF.value) readParams.set('workMode', MODE_ENUM[modeF.value] || modeF.value)
    readParams.set('sortBy', sortBy.value === 'deadline' ? 'DEADLINE' : 'NEWEST')
    const readPage = await readJson(`/job/list?${readParams}`)
    const readJobs = readPage?.list || []
    total.value = readPage?.total ?? readJobs.length
    jobs.value = readJobs.map(mapJob)
  } catch (readError) {
    jobs.value = []
    total.value = 0
    toast.error(readError?.message || '加载岗位失败')
  } finally { loading.value = false }
}

async function loadRecommendations() {
  try {
    const readPage = await readJson('/job/list?page=1&size=6&recommended=true&sortBy=NEWEST')
    featured.value = (readPage?.list || []).map(readJob => ({
      id: readJob.id,
      company: readJob.companyName,
      title: readJob.positionName,
    }))
  } catch {
    featured.value = []
  }
}

onMounted(() => Promise.all([loadJobs(), loadRecommendations()]))
</script>

<style scoped>
/* ── Section label ── */
.section-label { font-size:.773rem; font-weight:600; color:var(--ink-2); letter-spacing:.02em; }

/* ── Sort ── */
.list-bar { display:flex; align-items:center; justify-content:space-between; margin-bottom:.6rem; }
.list-count { font-size:var(--fs-sm); color:var(--ink-3); }
.sort-toggle { display:flex; background:var(--bg-soft); border:1px solid var(--border); border-radius:var(--r-full); padding:2px; gap:2px; }
.sort-btn { padding:.24rem .7rem; border-radius:var(--r-full); font-size:.75rem; font-weight:500; color:var(--ink-3); background:none; border:none; cursor:pointer; transition:all var(--t); white-space:nowrap; }
.sort-btn:hover { color:var(--ink); }
.sort-btn.active { background:var(--bg-card); color:var(--ink); box-shadow:0 1px 3px rgba(0,0,0,.1); font-weight:600; }

/* ══ Filter Panel ══ */
.filter-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: 1rem;
}

/* 通用行 */
.frow {
  display: flex;
  align-items: center;
  gap: 0;
  padding: .7rem 1.25rem;
}
.frow-sep {
  border-top: 1px solid var(--border);
}
.frow-l2 {
  border-top: 1px solid var(--border);
  background: var(--bg-soft);
  gap: 0;
  flex-wrap: wrap;
}

/* 地区列（固定宽度） */
.fcell-loc {
  display: flex;
  flex-direction: column;
  gap: .28rem;
  flex-shrink: 0;
}
/* 可伸展列 */
.fcell-grow {
  display: flex;
  flex-direction: column;
  gap: .28rem;
  flex: 1;
}
/* 行内标签（招聘类型行） */
.fcell-label-inline {
  flex-shrink: 0;
  margin-right: .75rem;
}

/* 竖分割线 */
.fcell-div {
  width: 1px; background: var(--border);
  align-self: stretch; margin: 0 1.1rem; flex-shrink: 0;
}

/* 标签 */
.flabel {
  font-size: .67rem; font-weight: 700; color: var(--ink-3);
  letter-spacing: .07em; text-transform: uppercase; white-space: nowrap;
  line-height: 1;
}

/* Pills */
.pill-group { display: flex; gap: .25rem; flex-wrap: wrap; align-items: center; }
.pill {
  padding: .25rem .75rem;
  border-radius: var(--r-full);
  font-size: .773rem; font-weight: 500;
  border: 1px solid var(--border-mid);
  background: transparent; color: var(--ink-2);
  transition: all var(--t); white-space: nowrap; cursor: pointer;
  line-height: 1.5;
}
.pill:hover { border-color: var(--red-border); background: var(--red-light); color: var(--red); }
.pill.active { background: var(--red); color: #fff; border-color: var(--red); box-shadow: 0 1px 4px rgba(155,35,53,.25); }
.pill-sm { padding: .2rem .65rem; font-size: .75rem; }

/* Province + City */
.location-pair { display: flex; }
.location-pair .filter-select:first-child { border-radius: var(--r-md) 0 0 var(--r-md); border-right: none; }
.location-pair .filter-select:last-child  { border-radius: 0 var(--r-md) var(--r-md) 0; }
.location-pair .filter-select:last-child:disabled { opacity: .38; cursor: not-allowed; }
.cselect-wrap.disabled .cselect-trigger { opacity: .38; cursor: not-allowed; }

/* 自定义省份下拉 */
.cselect-wrap { position: relative; display: inline-flex; }
.cselect-trigger {
  display: flex; align-items: center; justify-content: space-between; gap: .35rem;
  width: 100%; text-align: left; cursor: pointer;
  padding-right: .65rem;
  background-image: none !important;
}
/* 省份（左侧）：左圆角，右侧直角，去掉右边框 */

/* 城市（右侧）：右圆角，左侧直角，去掉左边框 */

.cselect-trigger span { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cselect-arrow {
  font-size: .7rem; color: var(--ink-3); flex-shrink: 0;
  transition: transform var(--t);
}
.cselect-wrap.open .cselect-arrow { transform: rotate(180deg); }
.cselect-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0;
  z-index: 200; width: 140px;
  background: var(--bg-card); border: 1px solid var(--border-mid);
  border-radius: var(--r-lg); box-shadow: var(--shadow-md);
}
.cselect-dropdown-teleport {
  width: 140px;
  background: var(--bg-card); border: 1px solid var(--border-mid);
  border-radius: var(--r-lg); box-shadow: var(--shadow-md);
}
.cselect-list {
  max-height: 280px; overflow-y: auto;
  padding: .3rem;
  border-radius: var(--r-lg);
}
.cselect-list::-webkit-scrollbar { width: 4px; }
.cselect-list::-webkit-scrollbar-thumb { background: var(--ink-4); border-radius: 2px; }
.cselect-item {
  padding: .38rem .75rem; border-radius: var(--r-sm);
  font-size: .773rem; color: var(--ink-2); cursor: pointer;
  transition: all var(--t); white-space: nowrap;
}
.cselect-item:hover { background: var(--bg-sunken); color: var(--ink); }
.cselect-item.active { background: var(--red-light); color: var(--red); font-weight: 600; }

.filter-select {
  height: 30px; padding: 0 1.6rem 0 .65rem;
  border: 1px solid var(--border-mid); border-radius: var(--r-md);
  background: var(--bg-soft); color: var(--ink-2); font-size: .773rem;
  outline: none; appearance: none; cursor: pointer; font-family: var(--font-sans);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C8880' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right .5rem center;
  transition: all var(--t);
}
.filter-select:hover { background-color: var(--bg-card); border-color: var(--border-mid); }
.filter-select:focus { border-color: var(--red-border); color: var(--ink); outline: none; }

/* 省份（左侧）/ 城市（右侧）接缝圆角 — 必须在 .filter-select 之后声明才能覆盖 */
.location-pair .cselect-wrap:first-child .cselect-trigger {
  border-radius: var(--r-md) 0 0 var(--r-md);
  border-right: none;
}
.location-pair .cselect-wrap:last-child .cselect-trigger {
  border-radius: 0 var(--r-md) var(--r-md) 0;
  border-left: none;
}

/* ── 二级 ── */
.l2-block {
  display: flex; flex-direction: column; gap: .28rem;
  padding: .65rem 1.25rem;
}
.l2-vdiv {
  width: 1px; background: var(--border);
  align-self: stretch; flex-shrink: 0;
}

/* L2 transition */
.l2-fade-enter-active { transition: opacity .22s ease, transform .22s ease; }
.l2-fade-leave-active { transition: opacity .15s ease; }
.l2-fade-enter-from   { opacity: 0; transform: translateY(-6px); }
.l2-fade-leave-to     { opacity: 0; }

/* ── Chips ── */
.chips-row {
  display: flex; align-items: center; gap: .3rem; flex-wrap: wrap;
  padding: .55rem 1.25rem;
  border-top: 1px solid var(--border);
  background: var(--bg-soft);
}
.chip {
  display: inline-flex; align-items: center; gap: .15rem;
  padding: .15rem .5rem .15rem .6rem;
  border-radius: var(--r-full); font-size: .7rem; font-weight: 500;
  background: var(--red-light); color: var(--red); border: 1px solid var(--red-border);
}
.chip-x {
  border: none; background: none; color: var(--red); opacity: .5;
  cursor: pointer; font-size: .9rem; padding: 0; line-height: 1;
  transition: opacity var(--t); margin-left: 1px;
}
.chip-x:hover { opacity: 1; }
.chips-clear {
  font-size: .7rem; color: var(--ink-3); border: none; background: none;
  cursor: pointer; text-decoration: underline; text-underline-offset: 2px;
  transition: color var(--t); padding: 0 .2rem; margin-left: .1rem;
}
.chips-clear:hover { color: var(--red); }

/* ── Job card ── */
.job-card {
  display:flex; align-items:center; gap:.875rem;
  background:var(--bg-card); border:1px solid var(--border);
  border-radius:var(--r-lg); padding:.75rem 1rem;
  text-decoration:none; color:inherit; transition:all var(--t);
}
.job-card:hover { box-shadow:var(--shadow-md); border-color:var(--border-mid); transform:translateY(-1px); }
.job-logo {
  width:36px; height:36px; border-radius:var(--r-md); flex-shrink:0;
  background:var(--red-light); color:var(--red);
  font-size:var(--fs-xl); font-weight:700; font-family:var(--font-serif);
  display:flex; align-items:center; justify-content:center;
}
.job-title { font-size:.867rem; font-weight:600; color:var(--ink); }
.job-meta { display:flex; gap:.75rem; flex-wrap:wrap; }
.job-meta span { font-size:.75rem; color:var(--ink-2); }
.job-l2tags { display:flex; gap:.25rem; flex-wrap:wrap; margin-top:.25rem; }
.job-dl { font-size:.7rem; color:var(--ink-3); white-space:nowrap; flex-shrink:0; }
</style>

<style>
/* Teleport 到 body 的省份面板，scoped 无法覆盖，单独全局声明 */
.cselect-dropdown-teleport .cselect-list {
  max-height: 185px; overflow-y: auto;
  padding: .3rem;
  border-radius: var(--r-lg);
}
.cselect-dropdown-teleport .cselect-list::-webkit-scrollbar { width: 4px; }
.cselect-dropdown-teleport .cselect-list::-webkit-scrollbar-thumb { background: var(--ink-4); border-radius: 2px; }
.cselect-dropdown-teleport .cselect-item {
  padding: .38rem .75rem; border-radius: var(--r-sm);
  font-size: .773rem; color: var(--ink-2); cursor: pointer;
  transition: all var(--t); white-space: nowrap;
}
.cselect-dropdown-teleport .cselect-item:hover { background: var(--bg-sunken); color: var(--ink); }
.cselect-dropdown-teleport .cselect-item.active { background: var(--red-light); color: var(--red); font-weight: 600; }
</style>
