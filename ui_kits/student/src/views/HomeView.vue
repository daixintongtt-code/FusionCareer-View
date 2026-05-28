<template>
  <div>
    <UserNavbar />
    <AppToast />

    <main class="page">
      <div class="wrap">

        <!-- 推荐轮播 -->
        <div class="card card-p" style="margin-bottom:1.1rem">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.875rem">
            <div class="section-label"><i class="ti ti-star-filled" style="color:var(--red)" /> 学院本周推荐岗位</div>
            <div style="display:flex;gap:.3rem">
              <button class="btn btn-secondary btn-sm btn-icon" @click="slide(-1)"><i class="ti ti-chevron-left" /></button>
              <button class="btn btn-secondary btn-sm btn-icon" @click="slide(1)"><i class="ti ti-chevron-right" /></button>
            </div>
          </div>
          <div class="carousel-wrap">
            <div class="carousel-track" :style="{transform:`translateX(${offset}px)`}">
              <div v-for="j in featured" :key="j.id" class="carousel-card" @click="router.push('/job/'+j.id)">
                <div style="font-size:.7rem;color:var(--ink-2);margin-bottom:.3rem;display:flex;align-items:center;gap:.3rem"><i class="ti ti-building" />{{ j.company }}</div>
                <div style="font-size:.867rem;font-weight:600;color:var(--ink);line-height:1.3">{{ j.title }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 主区域 -->
        <div>
          <div>
            <!-- 搜索 -->
            <div class="search-bar" style="margin-bottom:.875rem">
              <i class="ti ti-search" style="color:var(--ink-3)" />
              <input class="search-input" v-model="kw" placeholder="搜索岗位、公司、行业关键词…" />
              <div class="search-sep" />
              <select class="search-sel" v-model="provinceF" @change="cityF=''">
                <option value="">全部省份</option>
                <option v-for="p in Object.keys(provinces)" :key="p">{{ p }}</option>
              </select>
              <div class="search-sep" />
              <select class="search-sel" v-model="cityF" :disabled="!provinceF">
                <option value="">{{ provinceF ? '全部城市' : '请先选省份' }}</option>
                <option v-for="c in (provinces[provinceF] || [])" :key="c">{{ c }}</option>
              </select>
              <div class="search-sep" />
              <select class="search-sel" v-model="targetF">
                <option value="">投递身份</option>
                <option value="应届生">应届生</option>
                <option value="实习生">实习生</option>
              </select>
              <button class="btn btn-primary" style="padding:.45rem 1rem;font-size:.833rem" @click="fetchJobs">
                <i class="ti ti-search" /> 搜索
              </button>
            </div>

            <!-- 岗位数量 + 排序 -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.7rem">
              <span style="font-size:.773rem;color:var(--ink-3)">共 <strong>{{ total }}</strong> 个岗位</span>
              <div class="sort-toggle">
                <button :class="['sort-btn', sortBy==='newest' && 'active']" @click="setSort('newest')">
                  <i class="ti ti-clock" /> 最新发布
                </button>
                <button :class="['sort-btn', sortBy==='deadline' && 'active']" @click="setSort('deadline')">
                  <i class="ti ti-calendar-due" /> 截止日期
                </button>
              </div>
            </div>

            <!-- 加载中 -->
            <div v-if="loading" style="text-align:center;padding:2rem;color:var(--ink-3)">
              <i class="ti ti-loader-2" style="font-size:1.5rem" /> 加载中…
            </div>

            <!-- 岗位列表 -->
            <div v-else style="display:flex;flex-direction:column;gap:.4rem">
              <RouterLink v-for="j in jobs" :key="j.id" class="job-card" :to="'/job/'+j.id">
                <div class="job-logo">{{ j.abbr }}</div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem;flex-wrap:wrap">
                    <span style="font-size:.933rem;font-weight:600;color:var(--ink)">{{ j.title }}</span>
                  </div>
                  <div style="display:flex;gap:.875rem;flex-wrap:wrap">
                    <span style="display:flex;align-items:center;gap:.25rem;font-size:.773rem;color:var(--ink-2)"><i class="ti ti-building" />{{ j.company }}</span>
                    <span style="display:flex;align-items:center;gap:.25rem;font-size:.773rem;color:var(--ink-2)"><i class="ti ti-map-pin" />{{ j.city }}</span>
                    <span style="display:flex;align-items:center;gap:.25rem;font-size:.773rem;color:var(--ink-2)"><i class="ti ti-users" />{{ j.target }}</span>
                  </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.4rem;flex-shrink:0">
                  <span style="font-size:.7rem;color:var(--ink-3)">截止 {{ j.dl }}</span>
                </div>
              </RouterLink>
            </div>

            <!-- 分页 -->
            <div class="pagination">
              <button v-for="n in totalPages" :key="n" :class="['page-btn', n===page&&'active']" @click="goPage(n)">{{ n }}</button>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UserNavbar from '@/components/UserNavbar.vue'
import AppToast from '@/components/AppToast.vue'
import { apiJson } from '@/lib/api'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast = useToast()
/** 仅开发环境在后端不可用时回退 mock，生产环境关闭 */
const allowMockFallback = import.meta.env.DEV && import.meta.env.VITE_DISABLE_JOB_MOCK !== '1'
const offset = ref(0)
const CARD_W = 208
const featured = ref([])

function slide(dir) {
  const min = -(Math.max(featured.value.length - 3, 0)) * CARD_W
  offset.value = Math.max(Math.min(offset.value - dir * CARD_W, 0), min)
}

const kw = ref('')
const provinceF = ref('')
const cityF = ref('')
const targetF = ref('')
const provinces = {
  '北京': ['北京'], '上海': ['上海'], '广东': ['广州','深圳','珠海','东莞','佛山'],
  '浙江': ['杭州','宁波','温州'], '江苏': ['南京','苏州','无锡','常州'],
  '四川': ['成都','绵阳'], '湖北': ['武汉','宜昌'], '陕西': ['西安','咸阳'],
  '重庆': ['重庆'], '天津': ['天津'],
}
const jobs = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const sortBy = ref('newest') // 'newest' | 'deadline'
const loading = ref(false)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

function setSort(s) {
  sortBy.value = s
  page.value = 1
  fetchJobs()
}

function abbrOf(name) { return name ? name.charAt(0) : '职' }
function formatDate(str) { return str ? str.slice(5, 10) : '' }
function recruitTypeLabel(t) {
  const map = { BIG_INTERNSHIP:'大实习', SMALL_INTERNSHIP:'小实习', DAILY_INTERNSHIP:'实习', CAMPUS_RECRUITMENT:'应届生', CAMPUS_SCREENING:'应届生', OTHER:'' }
  return map[t] || ''
}

const MOCK_JOBS = [
  { id:1,  abbr:'新', title:'新媒体编辑记者',        company:'新华社',       city:'上海', target:'应届生', dl:'06-30', rec:true,  pub:'05-20' },
  { id:5,  abbr:'人', title:'新媒体编辑（人民网）',   company:'人民日报社',   city:'北京', target:'应届生', dl:'07-01', rec:true,  pub:'05-18' },
  { id:7,  abbr:'央', title:'融媒体内容策划',         company:'央视新闻',     city:'北京', target:'应届生', dl:'07-15', rec:true,  pub:'05-15' },
  { id:2,  abbr:'腾', title:'内容运营实习生',         company:'腾讯新闻',     city:'深圳', target:'实习',   dl:'07-10', rec:false, pub:'05-14' },
  { id:3,  abbr:'字', title:'企业公关传播实习',       company:'字节跳动',     city:'上海', target:'实习',   dl:'07-15', rec:false, pub:'05-13' },
  { id:4,  abbr:'澎', title:'数据新闻记者',           company:'澎湃新闻',     city:'上海', target:'应届生', dl:'06-20', rec:false, pub:'05-12' },
  { id:8,  abbr:'财', title:'财经记者（校招）',       company:'财新传媒',     city:'上海', target:'应届生', dl:'08-01', rec:false, pub:'05-10' },
  { id:9,  abbr:'南', title:'深度报道记者',           company:'南方周末',     city:'广州', target:'应届生', dl:'07-20', rec:false, pub:'05-08' },
  { id:10, abbr:'界', title:'科技线记者实习',         company:'界面新闻',     city:'上海', target:'实习',   dl:'06-28', rec:false, pub:'05-06' },
  { id:11, abbr:'第', title:'视频新闻编辑',           company:'第一财经',     city:'上海', target:'应届生', dl:'07-30', rec:false, pub:'05-05' },
  { id:12, abbr:'网', title:'政务新媒体运营实习',     company:'网易新闻',     city:'杭州', target:'实习',   dl:'07-05', rec:false, pub:'05-03' },
  { id:13, abbr:'光', title:'国际传播编辑',           company:'光明日报',     city:'北京', target:'应届生', dl:'08-10', rec:false, pub:'05-01' },
]

async function fetchJobs() {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: String(page.value), size: String(pageSize) })
    if (kw.value) params.set('keyword', kw.value)
    if (cityF.value) params.set('workCity', cityF.value)
    else if (provinceF.value) params.set('workCity', provinceF.value)
    if (targetF.value === '应届生') params.set('recruitType', 'CAMPUS_RECRUITMENT')
    if (targetF.value === '实习生') params.set('recruitType', 'DAILY_INTERNSHIP')
    const pageResult = await apiJson(`/job/list?${params}`)
    const records = pageResult?.list || pageResult?.records || []
    total.value = pageResult?.total ?? records.length
    let mapped = records.map(j => ({
      id: j.id,
      abbr: abbrOf(j.companyName),
      title: j.positionName,
      company: j.companyName,
      city: j.workCity || '',
      target: recruitTypeLabel(j.recruitType),
      dl: formatDate(j.workEndDate),
      _end: j.workEndDate || '',
      _pub: (j.createdAt && String(j.createdAt).slice(0, 10)) || '',
    }))
    if (sortBy.value === 'deadline') {
      mapped = mapped.slice().sort((a, b) => (a._end || '').localeCompare(b._end || ''))
    }
    jobs.value = mapped.map(({ _end, _pub, ...rest }) => rest)
    if (page.value === 1 && featured.value.length === 0) {
      featured.value = jobs.value.slice(0, 6).map(j => ({ id: j.id, company: j.company, title: j.title }))
    }
  } catch (e) {
    if (!allowMockFallback) {
      console.error(e)
      toast.error(e?.message || '加载岗位失败')
      jobs.value = []
      total.value = 0
    } else {
    let filtered = [...MOCK_JOBS]
    if (kw.value) filtered = filtered.filter(j => j.title.includes(kw.value) || j.company.includes(kw.value))
    if (cityF.value) filtered = filtered.filter(j => j.city === cityF.value)
    else if (provinceF.value) {
      const cities = provinces[provinceF.value] || []
      filtered = filtered.filter(j => cities.includes(j.city) || j.city === provinceF.value)
    }
    if (targetF.value) filtered = filtered.filter(j => j.target === targetF.value)
    // 排序
    if (sortBy.value === 'deadline') {
      filtered.sort((a, b) => a.dl.localeCompare(b.dl))
    } else {
      filtered.sort((a, b) => b.pub.localeCompare(a.pub))
    }
    total.value = filtered.length
    // 前端分页切割
    const start = (page.value - 1) * pageSize
    jobs.value = filtered.slice(start, start + pageSize)
    if (page.value === 1 && featured.value.length === 0) {
      featured.value = MOCK_JOBS.filter(j => j.rec).map(j => ({ id: j.id, company: j.company, title: j.title }))
    }
    }
  }
  finally { loading.value = false }
}

function goPage(n) { page.value = n; fetchJobs() }
onMounted(fetchJobs)
</script>

<style scoped>
.section-label { display:flex; align-items:center; gap:.45rem; font-size:.78rem; font-weight:600; color:var(--ink-2); letter-spacing:.02em; }
.sort-toggle { display:flex; background:var(--bg-soft); border:1px solid var(--border); border-radius:999px; padding:2px; gap:2px; }
.sort-btn { display:flex; align-items:center; gap:.3rem; padding:.28rem .75rem; border-radius:999px; font-size:.75rem; font-weight:500; color:var(--ink-3); background:none; border:none; cursor:pointer; transition:all var(--t); white-space:nowrap; }
.sort-btn:hover { color:var(--ink); }
.sort-btn.active { background:var(--bg-card); color:var(--ink); box-shadow:0 1px 3px rgba(0,0,0,.1); font-weight:600; }
.sort-btn i { font-size:.78rem; }
</style>
