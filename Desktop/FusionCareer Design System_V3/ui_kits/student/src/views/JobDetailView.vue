<template>
  <div>
    <UserNavbar />
    <AppToast />
    <div class="wrap" style="padding-top:1.25rem;padding-bottom:2.5rem">
      <nav style="display:flex;align-items:center;gap:.4rem;font-size:.8rem;color:var(--ink-2);margin-bottom:1.1rem">
        <RouterLink to="/home" style="color:var(--red);cursor:pointer">岗位列表</RouterLink>
        <i class="ti ti-chevron-right" style="font-size:.75rem"></i>
        <span v-if="job">{{ job.positionName }} · {{ job.companyName }}</span>
      </nav>
      <div v-if="loading" style="text-align:center;padding:4rem;color:var(--ink-3)">
        <i class="ti ti-loader-2" style="font-size:1.5rem"></i> 加载中…
      </div>
      <div v-else-if="job" class="detail-layout">
        <div>
          <!-- 公司头部 -->
          <div class="card card-p" style="margin-bottom:1rem">
            <div style="display:flex;align-items:center;gap:1rem">
              <div class="job-logo" style="width:52px;height:52px;font-size:1.3rem">{{ abbr }}</div>
              <div>
                <div style="font-size:1.15rem;font-weight:700;color:var(--ink);margin-bottom:.2rem">{{ job.positionName }}</div>
                <div style="font-size:.867rem;color:var(--ink-2)">{{ job.companyName }}</div>
              </div>
            </div>
          </div>
          <!-- 基本信息 -->
          <div class="card card-p">
            <div class="ds-title"><i class="ti ti-info-circle"></i>基本信息</div>
            <div class="info-grid">
              <div v-if="job.workCity" class="info-item"><i class="ti ti-map-pin"></i>{{ job.workCity }}</div>
              <div v-if="job.salaryDisplay" class="info-item"><i class="ti ti-coin"></i>{{ job.salaryDisplay }}</div>
              <div v-if="job.workMode" class="info-item"><i class="ti ti-building"></i>{{ workModeLabel }}</div>
              <div v-if="job.workEndDate" class="info-item"><i class="ti ti-calendar-due"></i>截止 {{ job.workEndDate.slice(0,10) }}</div>
              <div v-if="job.recruitType" class="info-item"><i class="ti ti-users"></i>{{ recruitLabel }}</div>
            </div>
            <div class="divider"></div>
            <div v-if="job.jobDesc">
              <div class="ds-title"><i class="ti ti-file-description"></i>岗位描述</div>
              <p style="font-size:.833rem;color:var(--ink-2);line-height:1.8;white-space:pre-wrap">{{ job.jobDesc }}</p>
              <div class="divider"></div>
            </div>
            <div v-if="job.reqEduLevel || job.reqMajor || job.reqSkills || job.reqOther">
              <div class="ds-title"><i class="ti ti-checklist"></i>岗位要求</div>
              <ul style="padding-left:1.25rem">
                <li v-if="job.reqEduLevel" style="font-size:.833rem;color:var(--ink-2);line-height:1.9;list-style:disc">学历要求：{{ eduLabel }}</li>
                <li v-if="job.reqMajor"    style="font-size:.833rem;color:var(--ink-2);line-height:1.9;list-style:disc">专业要求：{{ job.reqMajor }}</li>
                <li v-if="job.reqSkills"   style="font-size:.833rem;color:var(--ink-2);line-height:1.9;list-style:disc">技能要求：{{ job.reqSkills }}</li>
                <li v-if="job.reqOther"    style="font-size:.833rem;color:var(--ink-2);line-height:1.9;list-style:disc">其他要求：{{ job.reqOther }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 投递侧边栏 -->
        <div class="apply-sidebar">
          <div class="card card-p">
            <div style="font-size:.867rem;font-weight:600;color:var(--ink);margin-bottom:1rem;display:flex;align-items:center;gap:.4rem">
              <i class="ti ti-send" style="color:var(--red)"></i> 简历投递
            </div>
            <div style="font-size:.773rem;color:var(--ink-2);margin-bottom:1rem;display:flex;align-items:center;gap:.4rem">
              <i class="ti ti-calendar-due" style="color:var(--ink-3)"></i>
              截止日期：{{ job.workEndDate ? job.workEndDate.slice(0,10) : '未设置' }}
            </div>
            <!-- 外部投递 -->
            <template v-if="job.sourceUrl">
              <div style="font-size:.75rem;color:var(--ink-3);margin-bottom:.75rem;line-height:1.5">
                <i class="ti ti-info-circle" style="vertical-align:-1px"></i> 该岗位通过官网投递，点击后将跳转至招聘平台
              </div>
              <a :href="job.sourceUrl" target="_blank" rel="noopener" class="btn btn-primary" style="width:100%;display:flex;align-items:center;justify-content:center;gap:.4rem;text-decoration:none">
                <i class="ti ti-external-link"></i> 前往官网投递
              </a>
            </template>
            <!-- 平台内投递 -->
            <template v-else>
              <div v-if="submitted" style="text-align:center;padding:.75rem 0">
                <i class="ti ti-circle-check" style="font-size:2rem;color:#1e6636;display:block;margin-bottom:.4rem"></i>
                <div style="font-size:.83rem;font-weight:600;color:var(--ink)">投递成功！</div>
                <div style="font-size:.75rem;color:var(--ink-3);margin-top:.25rem">学院老师将在审核后联系你</div>
              </div>
              <button v-else class="btn btn-primary" style="width:100%" @click="showApply=true">
                <i class="ti ti-send"></i> 立即投递
              </button>
            </template>
          </div>
        </div>
      </div>

      <div v-else style="text-align:center;padding:4rem 0;color:var(--ink-3)">
        <i class="ti ti-mood-sad" style="font-size:2rem;display:block;margin-bottom:.5rem"></i>
        岗位不存在或已下线
      </div>
    </div>

    <!-- 投递问卷 Modal -->
    <div v-if="showApply" class="modal-mask" @click.self="showApply=false">
      <div class="apply-modal">
        <div class="apply-modal-head">
          <div>
            <div style="font-weight:600;font-size:.95rem;color:var(--ink)">投递问卷</div>
            <div v-if="job" style="font-size:.75rem;color:var(--ink-3);margin-top:2px">{{ job.positionName }} · {{ job.companyName }}</div>
          </div>
          <button class="icon-btn" @click="showApply=false"><i class="ti ti-x"></i></button>
        </div>
        <div class="apply-modal-body">
          <div v-for="(q, qi) in mockQuestions" :key="q.id" class="aq-item">
            <div class="aq-label">{{ qi+1 }}. {{ q.title }}<span v-if="q.required" style="color:var(--red)"> *</span></div>
            <input v-if="q.type==='TEXT'" class="form-control" v-model="answers[q.id]" :placeholder="q.placeholder || '请填写'" />
            <textarea v-else-if="q.type==='TEXTAREA'" class="form-control" style="min-height:80px" v-model="answers[q.id]" :placeholder="q.placeholder || '请填写'"></textarea>
            <div v-else-if="q.type==='RADIO'" style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.35rem">
              <label v-for="opt in q.options" :key="opt" class="aq-opt" :class="{selected: answers[q.id]===opt}" @click="answers[q.id]=opt">
                <i :class="answers[q.id]===opt ? 'ti ti-circle-filled' : 'ti ti-circle'"></i>{{ opt }}
              </label>
            </div>
            <div v-else-if="q.type==='CHECKBOX'" style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.35rem">
              <label v-for="opt in q.options" :key="opt" class="aq-opt" :class="{selected: (answers[q.id]||[]).includes(opt)}" @click="toggleCheck(q.id, opt)">
                <i :class="(answers[q.id]||[]).includes(opt) ? 'ti ti-checkbox' : 'ti ti-square'"></i>{{ opt }}
              </label>
            </div>
            <div v-else-if="q.type==='FILE_UPLOAD'" class="resume-picker">
              <!-- 当前已选 -->
              <div v-if="answers[q.id]" class="resume-picker-current">
                <i class="ti ti-file-check" style="color:#1e6636"></i>
                <span>{{ answers[q.id] }}</span>
                <button class="resume-picker-clear" @click="answers[q.id]=null" title="取消选择"><i class="ti ti-x" /></button>
              </div>
              <!-- 选项区 -->
              <div class="resume-picker-opts">
                <div class="resume-picker-section-label">从我的简历选择</div>
                <div v-for="r in myResumes" :key="r.name"
                  class="resume-picker-item"
                  :class="{ selected: answers[q.id]===r.name }"
                  @click="answers[q.id]=r.name"
                >
                  <i :class="['ti', r.icon]" />
                  <span>{{ r.name }}</span>
                  <i v-if="answers[q.id]===r.name" class="ti ti-circle-check-filled" style="color:var(--red);margin-left:auto" />
                </div>
                <div class="resume-picker-section-label" style="margin-top:.6rem">或上传本地文件</div>
                <div class="resume-picker-item resume-picker-upload" @click="triggerFile(q.id)">
                  <input type="file" style="display:none" :ref="el => { fileRefs[q.id] = el }" accept=".pdf,.doc,.docx" @change="e => handleFile(q.id, e)" />
                  <i class="ti ti-cloud-upload" />
                  <span>点击上传新简历（PDF / Word）</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="apply-modal-foot">
          <button class="btn btn-secondary btn-sm" @click="showApply=false">取消</button>
          <button class="btn btn-primary btn-sm" @click="submitApply"><i class="ti ti-send"></i>确认投递</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import UserNavbar from '@/components/UserNavbar.vue'
import AppToast from '@/components/AppToast.vue'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const toast = useToast()
const BASE = 'http://localhost:9100'
const job = ref(null)
const loading = ref(false)
const showApply = ref(false)
const submitted = ref(false)
const answers = ref({})
const fileRefs = {}

// 平台已上传的简历（与 ProfileView 保持同步，实际应从接口获取）
const myResumes = [
  { name: '李同学_简历_2025.pdf',  icon: 'ti-file-type-pdf' },
  { name: '李同学_简历_备份.docx', icon: 'ti-file-type-doc' },
]

const abbr = computed(function() {
  if (job.value && job.value.companyName) return job.value.companyName.charAt(0)
  return '职'
})

const WORK_MODE_MAP = { ONLINE: '线上', OFFLINE: '线下', HYBRID: '线上线下均可' }
const EDU_MAP = { UNDERGRADUATE: '本科生', ACADEMIC_MASTER: '学术硕士研究生', PROFESSIONAL_MASTER: '专业硕士研究生', DOCTORAL: '博士研究生' }
const RECRUIT_MAP = { BIG_INTERNSHIP: '大实习', SMALL_INTERNSHIP: '小实习', DAILY_INTERNSHIP: '日常实习', CAMPUS_RECRUITMENT: '应届生招聘', CAMPUS_SCREENING: '应届生摸排', OTHER: '其他' }

const workModeLabel = computed(function() { return job.value ? (WORK_MODE_MAP[job.value.workMode] || '') : '' })
const eduLabel = computed(function() { return job.value ? (EDU_MAP[job.value.reqEduLevel] || '') : '' })
const recruitLabel = computed(function() { return job.value ? (RECRUIT_MAP[job.value.recruitType] || '') : '' })

var MOCK = [
  { id: 1,  positionName: '新媒体编辑记者',      companyName: '新华社',     workCity: '上海', workEndDate: '2025-06-30', salaryDisplay: '面议',       workMode: 'OFFLINE', recruitType: 'CAMPUS_RECRUITMENT', sourceUrl: '',                           jobDesc: '负责新媒体平台日常内容编辑与发布，参与重大新闻报道策划，独立完成文字、图片、短视频等多形态内容生产。要求文字功底扎实，对新闻有热情，能适应快节奏工作环境。', reqEduLevel: 'ACADEMIC_MASTER',    reqMajor: '新闻传播学、中文',     reqSkills: '熟练使用各类新媒体工具，有校媒经历优先',       reqOther: '实习期不少于3个月，每周5天' },
  { id: 2,  positionName: '内容运营实习生',       companyName: '腾讯新闻',   workCity: '深圳', workEndDate: '2025-07-10', salaryDisplay: '200元/天',   workMode: 'OFFLINE', recruitType: 'BIG_INTERNSHIP',       sourceUrl: '',                           jobDesc: '协助内容团队进行选题策划、内容分发与用户运营，参与数据分析和竞品研究，支持日常运营工作。',                                                               reqEduLevel: 'UNDERGRADUATE',       reqMajor: '新闻、传播、中文、市场营销', reqSkills: '有一定数据分析能力，熟悉微信、微博等平台运营规则' },
  { id: 3,  positionName: '企业公关传播实习',     companyName: '字节跳动',   workCity: '上海', workEndDate: '2025-07-15', salaryDisplay: '250元/天',   workMode: 'HYBRID',  recruitType: 'DAILY_INTERNSHIP',     sourceUrl: 'https://job.bytedance.com/1', jobDesc: '协助企业公关团队处理媒体关系，参与品牌传播活动策划，撰写新闻稿和品牌故事，维护媒体资源库。',                                                               reqEduLevel: 'UNDERGRADUATE',       reqMajor: '新闻传播、公共关系、中文', reqSkills: '有媒体实习经历或校媒经验优先，英文读写能力良好' },
  { id: 4,  positionName: '数据新闻记者',         companyName: '澎湃新闻',   workCity: '上海', workEndDate: '2025-06-20', salaryDisplay: '面议',       workMode: 'OFFLINE', recruitType: 'CAMPUS_RECRUITMENT', sourceUrl: 'https://job.thepaper.cn/2',   jobDesc: '独立负责数据新闻选题挖掘与报道，熟练使用数据可视化工具，能将复杂数据转化为易读的新闻故事。',                                                               reqEduLevel: 'ACADEMIC_MASTER',    reqMajor: '新闻传播、统计学、计算机相关', reqSkills: 'Python/R数据分析，D3.js或Tableau等可视化工具' },
  { id: 5,  positionName: '新媒体编辑（人民网）', companyName: '人民日报社', workCity: '北京', workEndDate: '2025-07-01', salaryDisplay: '面议',       workMode: 'OFFLINE', recruitType: 'CAMPUS_RECRUITMENT', sourceUrl: '',                           jobDesc: '负责人民网新媒体平台内容编辑、策划与推送，参与重要议题报道，承担一定的采访任务。',                                                                         reqEduLevel: 'ACADEMIC_MASTER',    reqMajor: '新闻传播学',           reqSkills: '文字表达能力突出，政治敏锐度强',               reqOther: '党员优先' },
  { id: 7,  positionName: '融媒体内容策划',       companyName: '央视新闻',   workCity: '北京', workEndDate: '2025-07-15', salaryDisplay: '面议',       workMode: 'OFFLINE', recruitType: 'CAMPUS_RECRUITMENT', sourceUrl: '',                           jobDesc: '参与融媒体内容策划与制作，结合电视、网络、社交媒体等多平台特点，创作符合年轻受众口味的新闻产品。',                                                           reqEduLevel: 'ACADEMIC_MASTER',    reqMajor: '新闻传播、广播电视',   reqSkills: '有短视频制作或直播经验者优先' },
  { id: 8,  positionName: '财经记者（校招）',     companyName: '财新传媒',   workCity: '上海', workEndDate: '2025-08-01', salaryDisplay: '面议',       workMode: 'OFFLINE', recruitType: 'CAMPUS_RECRUITMENT', sourceUrl: '',                           jobDesc: '负责财经领域深度报道，包括宏观经济、资本市场、产业链等方向，具备较强的独立调查和分析能力。',                                                               reqEduLevel: 'ACADEMIC_MASTER',    reqMajor: '新闻传播、经济学、金融学', reqSkills: '英文能力强，有财经类实习经历优先' },
  { id: 9,  positionName: '深度报道记者',         companyName: '南方周末',   workCity: '广州', workEndDate: '2025-07-20', salaryDisplay: '面议',       workMode: 'OFFLINE', recruitType: 'CAMPUS_RECRUITMENT', sourceUrl: '',                           jobDesc: '聚焦社会议题的深度调查报道，具备强烈的新闻责任感和独立思考能力。',                                                                                         reqEduLevel: 'ACADEMIC_MASTER',    reqMajor: '新闻传播学、社会学',   reqSkills: '有调查报道经历者优先' },
  { id: 10, positionName: '科技线记者实习',       companyName: '界面新闻',   workCity: '上海', workEndDate: '2025-06-28', salaryDisplay: '180元/天',   workMode: 'HYBRID',  recruitType: 'DAILY_INTERNSHIP',     sourceUrl: '',                           jobDesc: '跟进科技行业动态，撰写科技公司报道和产品评测，维护科技领域信息源。',                                                                                       reqEduLevel: 'UNDERGRADUATE',       reqMajor: '新闻传播、计算机、理工科相关', reqSkills: '对科技行业有浓厚兴趣' },
  { id: 11, positionName: '视频新闻编辑',         companyName: '第一财经',   workCity: '上海', workEndDate: '2025-07-30', salaryDisplay: '面议',       workMode: 'OFFLINE', recruitType: 'CAMPUS_RECRUITMENT', sourceUrl: '',                           jobDesc: '负责财经视频内容的策划与制作，包括短视频脚本撰写、拍摄协调和后期剪辑。',                                                                                   reqEduLevel: 'UNDERGRADUATE',       reqMajor: '新闻传播、广播电视、数字媒体', reqSkills: 'Premiere/Final Cut等剪辑软件' },
  { id: 12, positionName: '政务新媒体运营实习',   companyName: '网易新闻',   workCity: '杭州', workEndDate: '2025-07-05', salaryDisplay: '200元/天',   workMode: 'OFFLINE', recruitType: 'SMALL_INTERNSHIP',     sourceUrl: '',                           jobDesc: '协助政务新媒体账号内容运营，包括选题策划、文案撰写和数据复盘。',                                                                                           reqEduLevel: 'UNDERGRADUATE',       reqMajor: '新闻传播、公共管理、中文', reqSkills: '文案能力强' },
  { id: 13, positionName: '国际传播编辑',         companyName: '光明日报',   workCity: '北京', workEndDate: '2025-08-10', salaryDisplay: '面议',       workMode: 'OFFLINE', recruitType: 'CAMPUS_RECRUITMENT', sourceUrl: '',                           jobDesc: '负责光明日报国际版及海外平台内容编辑，参与中国故事的对外传播。',                                                                                             reqEduLevel: 'ACADEMIC_MASTER',    reqMajor: '新闻传播、外语类',     reqSkills: '英文写作能力强，有海外学习/生活经历优先' },
]

var mockQuestions = [
  { id: 1001, title: '姓名',                     type: 'TEXT',        required: true,  placeholder: '请填写真实姓名' },
  { id: 1002, title: '年级',                     type: 'RADIO',       required: true,  options: ['2021级', '2022级', '2023级', '2024级'] },
  { id: 1003, title: '期望实习时长',             type: 'CHECKBOX',    required: true,  options: ['3个月以内', '3-6个月', '6个月以上'] },
  { id: 1004, title: '请简述您的相关经历',       type: 'TEXTAREA',    required: true,  placeholder: '如：曾在XX媒体实习，负责……' },
  { id: 1005, title: '您对该岗位最感兴趣的方向', type: 'TEXTAREA',    required: false, placeholder: '简要说明' },
  { id: 1006, title: '个人简历',                 type: 'FILE_UPLOAD', required: true },
]

function toggleCheck(qid, opt) {
  if (!answers.value[qid]) answers.value[qid] = []
  var idx = answers.value[qid].indexOf(opt)
  if (idx === -1) answers.value[qid].push(opt)
  else answers.value[qid].splice(idx, 1)
}

function triggerFile(qid) {
  if (fileRefs[qid]) fileRefs[qid].click()
}

function handleFile(qid, e) {
  var f = e.target.files[0]
  if (f) answers.value[qid] = f.name
}

function submitApply() {
  for (var i = 0; i < mockQuestions.length; i++) {
    var q = mockQuestions[i]
    if (!q.required) continue
    var v = answers.value[q.id]
    if (!v || (Array.isArray(v) && v.length === 0)) {
      toast.error('请填写「' + q.title + '」')
      return
    }
  }
  showApply.value = false
  submitted.value = true
  toast.success('投递成功！')
}

async function fetchJob() {
  loading.value = true
  try {
    var res = await fetch(BASE + '/job/' + route.params.id)
    var data = await res.json()
    if (data.code === 200 && data.data) {
      job.value = data.data
    } else {
      throw new Error('not found')
    }
  } catch (e) {
    var id = Number(route.params.id)
    job.value = null
    for (var i = 0; i < MOCK.length; i++) {
      if (MOCK[i].id === id) { job.value = MOCK[i]; break }
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchJob)
</script>

<style scoped>
.detail-layout { display:grid; grid-template-columns:1fr 295px; gap:1.5rem; align-items:start; }
.apply-sidebar { position:sticky; top:calc(var(--nav-h) + 1rem); }
.ds-title { font-size:.867rem; font-weight:600; color:var(--ink); margin-bottom:.65rem; display:flex; align-items:center; gap:.4rem; }
.ds-title i { color:var(--red); }
.info-grid { display:grid; grid-template-columns:1fr 1fr; gap:.4rem .75rem; margin-bottom:1rem; }
.info-item { display:flex; align-items:center; gap:.35rem; font-size:.8rem; color:var(--ink-2); }
.info-item i { color:var(--ink-3); font-size:13px; flex-shrink:0; }
.modal-mask { position:fixed; inset:0; background:rgba(28,26,24,.45); display:flex; align-items:center; justify-content:center; z-index:200; }
.apply-modal { background:var(--bg-card); border-radius:16px; width:min(560px,92vw); max-height:85vh; display:flex; flex-direction:column; box-shadow:0 16px 48px rgba(28,26,24,.18); }
.apply-modal-head { display:flex; align-items:center; justify-content:space-between; padding:.875rem 1.1rem; border-bottom:1px solid var(--border); flex-shrink:0; }
.apply-modal-body { flex:1; overflow-y:auto; padding:1rem 1.1rem; display:flex; flex-direction:column; gap:1rem; }
.apply-modal-foot { display:flex; justify-content:flex-end; gap:.5rem; padding:.75rem 1.1rem; border-top:1px solid var(--border); flex-shrink:0; }
.aq-item { display:flex; flex-direction:column; gap:.35rem; }
.aq-label { font-size:.8rem; font-weight:600; color:var(--ink-2); }
.aq-opt { display:inline-flex; align-items:center; gap:.3rem; padding:.25rem .65rem; border-radius:9999px; border:1px solid var(--border-mid); font-size:.78rem; color:var(--ink-2); cursor:pointer; transition:all .15s; }
.aq-opt.selected { background:var(--red-light); color:var(--red); border-color:var(--red-border); font-weight:500; }
.aq-opt i { font-size:12px; }
.aq-upload { display:flex; align-items:center; gap:.5rem; padding:.65rem .875rem; border:1.5px dashed var(--border-mid); border-radius:10px; cursor:pointer; }
.resume-picker { border:1px solid var(--border); border-radius:var(--r-lg); overflow:hidden; }
.resume-picker-current { display:flex; align-items:center; gap:.5rem; padding:.5rem .85rem; background:#f0faf3; border-bottom:1px solid var(--border); font-size:.8rem; color:var(--ink); }
.resume-picker-current span { flex:1; min-width:0; }
.resume-picker-clear { background:none; border:none; cursor:pointer; color:var(--ink-3); padding:2px 4px; border-radius:4px; line-height:1; }
.resume-picker-clear:hover { color:var(--red); }
.resume-picker-opts { padding:.6rem .75rem; display:flex; flex-direction:column; gap:.3rem; }
.resume-picker-section-label { font-size:.7rem; font-weight:600; color:var(--ink-3); letter-spacing:.04em; text-transform:uppercase; margin-bottom:.15rem; }
.resume-picker-item { display:flex; align-items:center; gap:.5rem; padding:.5rem .7rem; border:1px solid var(--border); border-radius:var(--r-md); font-size:.8rem; color:var(--ink-2); cursor:pointer; transition:all var(--t); }
.resume-picker-item:hover { border-color:var(--red-border); background:var(--red-light); color:var(--ink); }
.resume-picker-item.selected { border-color:var(--red-border); background:var(--red-light); color:var(--ink); }
.resume-picker-upload { border-style:dashed; color:var(--ink-3); }
.resume-picker-upload:hover { color:var(--red); }
.icon-btn { width:28px; height:28px; border-radius:6px; border:1px solid var(--border); background:var(--bg-card); color:var(--ink-3); display:inline-flex; align-items:center; justify-content:center; cursor:pointer; font-size:13px; }
</style>
