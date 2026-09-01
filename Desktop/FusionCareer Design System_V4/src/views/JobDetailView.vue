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
              <button v-else class="btn btn-primary" style="width:100%" @click="openApply">
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
          <div v-for="(q, qi) in questions" :key="q.id" class="aq-item">
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
              <!-- 当前已选：answers[q.id] 是 { name, file, fileId, url } 对象 -->
              <div v-if="fileAnswers[q.id]" class="resume-picker-current">
                <i class="ti ti-file-check" style="color:#1e6636"></i>
                <span>{{ fileAnswers[q.id].name }}</span>
                <button class="resume-picker-clear" @click="fileAnswers[q.id]=null" title="取消选择"><i class="ti ti-x" /></button>
              </div>
              <!-- 选项区 -->
              <div class="resume-picker-opts">
                <div class="resume-picker-section-label">从我的简历选择</div>
                <div v-for="r in myResumes" :key="r.name"
                  class="resume-picker-item"
                  :class="{ selected: fileAnswers[q.id]?.id===r.id }"
                  @click="fileAnswers[q.id]={ name: r.name, id: r.id }"
                >
                  <i :class="['ti', r.icon]" />
                  <span>{{ r.name }}</span>
                  <i v-if="fileAnswers[q.id]?.id===r.id" class="ti ti-circle-check-filled" style="color:var(--red);margin-left:auto" />
                </div>
                <div class="resume-picker-section-label" style="margin-top:.6rem">或上传本地文件</div>
                <div class="resume-picker-item resume-picker-upload" @click="triggerFile(q.id)">
                  <input type="file" style="display:none" :ref="el => { fileRefs[q.id] = el }" accept=".pdf,.jpg,.jpeg,.png" @change="e => handleFile(q.id, e)" />
                  <i class="ti ti-cloud-upload" />
                  <span>点击上传新简历（PDF / Word）</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="apply-modal-foot">
          <button class="btn btn-secondary btn-sm" @click="showApply=false">取消</button>
          <button class="btn btn-secondary btn-sm" @click="saveDraft"><i class="ti ti-device-floppy" />保存草稿</button>
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
import { readJson } from '@/lib/api'
import {
  applyParsedToDetailForm,
  loadMyAnswerRecord,
  loadQuestionnaireBundle,
  loadResumeFileList,
  resumeFileIconByName,
  saveDraftQuestionnaire,
  submitQuestionnaire,
  uploadQuestionnaireFile,
  validateQuestionnaireUploadFile,
  validateRequiredAnswers,
} from '@/composables/useQuestionnaireForm'

const route = useRoute()
const toast = useToast()
const BASE = '/api'
const job = ref(null)
const loading = ref(false)
const showApply = ref(false)
const submitted = ref(false)
const answers = ref({})
const fileAnswers = ref({})
const fileRefs = {}
const questionnaireExpired = ref(false)

// 从接口加载当前用户的简历文件列表
const myResumes = ref([])
async function loadMyResumes() {
  try {
    const readFiles = await loadResumeFileList()
    myResumes.value = readFiles.map(readFile => ({
      id: readFile.id,
      name: readFile.originalName,
      icon: resumeFileIconByName(readFile.originalName),
    }))
  } catch (readError) {
    myResumes.value = []
    toast.error(readError?.message || '加载简历失败')
  }
}

// 从接口加载该岗位的问卷题目
const questions = ref([])
async function loadQuestions(jobPostId) {
  try {
    const readBundle = await loadQuestionnaireBundle(jobPostId)
    questions.value = readBundle.questions
    questionnaireExpired.value = readBundle.expired
  } catch (readError) {
    questions.value = []
    toast.error(readError?.message || '加载问卷失败')
  }
}

const abbr = computed(function() {
  if (job.value && job.value.companyName) return job.value.companyName.charAt(0)
  return '职'
})

const WORK_MODE_MAP = { ONLINE: '线上', OFFLINE: '线下', BOTH: '线上线下均可', HYBRID: '线上线下均可' }
const EDU_MAP = {
  UNDERGRADUATE:'本科生', ACADEMIC_MASTER:'学术硕士研究生',
  PROFESSIONAL_MASTER:'专业硕士研究生', DOCTORAL:'博士研究生',
  BACHELOR:'本科生', DOCTORATE:'博士研究生',
}
const RECRUIT_MAP = { BIG_INTERNSHIP: '大实习', SMALL_INTERNSHIP: '小实习', DAILY_INTERNSHIP: '日常实习', CAMPUS_RECRUITMENT: '应届生招聘', CAMPUS_SCREENING: '应届生摸排', OTHER: '其他' }

const workModeLabel = computed(function() { return job.value ? (WORK_MODE_MAP[job.value.workMode] || '') : '' })
const eduLabel = computed(function() { return job.value ? (EDU_MAP[job.value.reqEduLevel] || '') : '' })
const recruitLabel = computed(function() { return job.value ? (RECRUIT_MAP[job.value.recruitType] || '') : '' })

function toggleCheck(qid, opt) {
  if (!answers.value[qid]) answers.value[qid] = []
  var idx = answers.value[qid].indexOf(opt)
  if (idx === -1) answers.value[qid].push(opt)
  else answers.value[qid].splice(idx, 1)
}

function triggerFile(qid) {
  if (fileRefs[qid]) fileRefs[qid].click()
}

async function loadMyAnswer() {
  const readAnswer = await loadMyAnswerRecord(route.params.id)
  if (readAnswer?.answers) {
    applyParsedToDetailForm(questions.value, readAnswer.answers,
      myResumes.value.map(readFile => ({ id:readFile.id, originalName:readFile.name })),
      answers.value, fileAnswers.value)
  }
}

async function openApply() {
  if (questionnaireExpired.value) {
    toast.error('问卷已截止，无法投递或修改')
    return
  }
  answers.value = {}
  fileAnswers.value = {}
  await loadMyResumes()
  await loadMyAnswer()
  showApply.value = true
}

async function handleFile(readQuestionId, readEvent) {
  const readFile = readEvent.target.files?.[0]
  const readError = validateQuestionnaireUploadFile(readFile)
  if (readError) {
    toast.error(readError)
    return
  }
  try {
    const readResult = await uploadQuestionnaireFile(readFile)
    fileAnswers.value[readQuestionId] = { id:readResult.id, name:readResult.originalName }
    await loadMyResumes()
    toast.success('附件上传成功')
  } catch (uploadError) {
    toast.error(uploadError?.message || '附件上传失败')
  } finally {
    readEvent.target.value = ''
  }
}

async function saveDraft() {
  try {
    await saveDraftQuestionnaire(route.params.id, questions.value, answers.value, fileAnswers.value)
    showApply.value = false
    toast.success('草稿已保存')
  } catch (readError) {
    toast.error(readError?.message || '保存草稿失败')
  }
}

async function submitApply() {
  const readError = validateRequiredAnswers(questions.value, answers.value, fileAnswers.value)
  if (readError) {
    toast.error(readError)
    return
  }
  try {
    await submitQuestionnaire(route.params.id, questions.value, answers.value, fileAnswers.value)
    showApply.value = false
    submitted.value = true
    toast.success('投递成功')
  } catch (submitError) {
    toast.error(submitError?.message || '提交失败')
  }
}

onMounted(() => {
  loadJob()
  loadMyResumes()
})

// loadJob 内部加载完岗位后再加载题目
async function loadJob() {
  loading.value = true
  try {
    job.value = await readJson(`/job/${route.params.id}`)
  } catch (readError) {
    job.value = null
    toast.error(readError?.message || '加载岗位失败')
  } finally {
    loading.value = false
    // 加载完岗位后再拉问卷题目
    if (job.value) loadQuestions(route.params.id)
  }
}</script>

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
