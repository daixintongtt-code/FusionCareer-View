<template>
  <div>
    <UserNavbar />
    <AppToast />
    <div class="profile-page">
      <div class="profile-layout">
        <!-- 侧边 -->
        <div>
          <div class="card card-p">
            <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding-bottom:1.1rem;border-bottom:1px solid var(--border);margin-bottom:1.1rem">
              <div class="nav-avatar" style="width:52px;height:52px;font-size:1.3rem;margin-bottom:.5rem">{{ form.realName ? form.realName.charAt(0) : '我' }}</div>
              <div style="font-size:.875rem;font-weight:700;color:var(--ink)">{{ form.realName || '加载中…' }}</div>
            </div>
            <button v-for="item in navItems" :key="item.view"
              :class="['profile-nav-item', view===item.view && 'active']"
              @click="switchView(item.view)"
            ><i :class="['ti',item.icon]" />{{ item.label }}</button>
            <div class="divider" />
            <a class="profile-nav-item" href="#/login" @click.prevent="logoutUser"><i class="ti ti-logout" />退出登录</a>
          </div>
        </div>

        <!-- 右侧面板 -->
        <div>

          <!-- 我的资料 -->
          <template v-if="view==='info'">
            <div class="card card-p">
              <div class="panel-title"><i class="ti ti-user" />基本信息</div>
              <div class="grid-2">
                <div class="form-group"><label class="form-label">姓名</label><input class="form-control" v-model="form.realName" /></div>
                <div class="form-group"><label class="form-label">学号</label><input class="form-control" :value="form.sid" readonly /></div>
                <div class="form-group"><label class="form-label">性别</label>
                  <select class="form-control" v-model="form.gender"><option value="">未填写</option><option value="MALE">男</option><option value="FEMALE">女</option><option value="OTHER">其他</option></select>
                </div>
                <div class="form-group"><label class="form-label">出生日期</label><input class="form-control" type="date" v-model="form.birthDate" /></div>
                <div class="form-group"><label class="form-label">政治面貌</label>
                  <select class="form-control" v-model="form.politicalStatus"><option value="">未填写</option><option value="MASSES">群众</option><option value="LEAGUE_MEMBER">共青团员</option><option value="PARTY_MEMBER">中共党员</option><option value="OTHER">其他</option></select>
                </div>
                <div class="form-group"><label class="form-label">届次</label><input class="form-control" v-model="form.grade" /></div>
                <div class="form-group"><label class="form-label">专业</label><input class="form-control" v-model="form.major" /></div>
                <div class="form-group"><label class="form-label">学历</label>
                  <select class="form-control" v-model="form.eduLevel">
                    <option v-for="opt in EDU_LEVEL_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                </div>
                <div class="form-group"><label class="form-label">导师</label><input class="form-control" v-model="form.supervisor" /></div>
                <div class="form-group"><label class="form-label">联系邮箱</label><input class="form-control" v-model="form.email" /></div>
                <div class="form-group"><label class="form-label">手机号</label><input class="form-control" v-model="form.phone" placeholder="请填写手机号" /></div>
                <div class="form-group"><label class="form-label">微信号</label><input class="form-control" v-model="form.wechat" /></div>
                <div class="form-group"><label class="form-label">生源地</label><input class="form-control" v-model="form.hometown" /></div>
                <div class="form-group"><label class="form-label">就业意向排序</label><input class="form-control" v-model="form.intentionOrder" placeholder="如：新闻媒体,企业公司" /></div>
                <div class="form-group"><label class="form-label">意向城市</label><input class="form-control" v-model="form.intentionCityText" placeholder="如：上海,北京" /></div>
                <div class="form-group"><label class="form-label">当前心态</label>
                  <select class="form-control" v-model="form.mindset"><option value="">未填写</option><option value="CONFIDENT">比较有把握</option><option value="CAUTIOUSLY_OPTIMISTIC">谨慎乐观</option><option value="LACK_OF_CONFIDENCE">信心不足</option><option value="VERY_ANXIOUS">非常焦虑</option><option value="ZEN_WAITING">佛系等待</option></select>
                </div>
                <div class="form-group"><label class="form-label">理想方向</label><textarea class="form-control" v-model="form.intentionDream" /></div>
              </div>
              <div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:1rem">
                <button class="btn btn-secondary" @click="loadProfile">取消</button>
                <button class="btn btn-primary" @click="saveProfile"><i class="ti ti-check" />保存</button>
              </div>
            </div>
          </template>

          <!-- 我的简历 -->
          <template v-if="view==='resume'">
            <div class="card card-p">
              <div class="panel-title"><i class="ti ti-file-description" />简历正文</div>
              <div class="grid-2">
                <div v-for="item in resumeFields" :key="item.key" class="form-group">
                  <label class="form-label">{{ item.label }}</label>
                  <textarea class="form-control" style="min-height:110px" v-model="resumeForm[item.key]" />
                </div>
              </div>
              <div style="display:flex;justify-content:flex-end;margin:1rem 0 1.5rem">
                <button class="btn btn-primary" @click="saveResume"><i class="ti ti-check" />保存简历正文</button>
              </div>
              <div class="divider" />
              <div class="panel-title"><i class="ti ti-file-text" />简历文件</div>
              <div v-for="(r, index) in resumes" :key="r.name" class="resume-row">
                <div style="width:38px;height:38px;border-radius:var(--r-md);background:var(--red-light);border:1px solid var(--red-border);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--red);font-size:1rem">
                  <i :class="['ti', r.icon]" />
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font-size:.867rem;font-weight:500;color:var(--ink)">{{ r.name }}</div>
                  <div style="font-size:.733rem;color:var(--ink-2)">{{ r.size }}</div>
                </div>
                <div style="display:flex;gap:.3rem">
                  <button v-if="failedFileId===r.id" class="btn btn-secondary btn-sm" @click="retryFile(r)">
                    <i class="ti ti-refresh" />重试解析
                  </button>
                  <button class="btn-icon btn" title="下载" @click="downloadFile(r)"><i class="ti ti-download" /></button>
                  <button class="btn-icon btn" title="删除" @click="deleteFile(index)"><i class="ti ti-trash" /></button>
                </div>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept=".pdf,image/*"
                style="display:none"
                @change="uploadFile"
              />
              <label style="display:flex;align-items:center;gap:.5rem;margin-top:1rem;font-size:.82rem;color:var(--ink-2)">
                <input type="checkbox" v-model="updateProfile" />
                使用简历解析结果更新我的资料和在线简历
              </label>
              <div v-if="updateProfile" style="font-size:.73rem;color:var(--ink-3);margin-top:.4rem">
                简历内容将发送至配置的 AI 服务进行字段提取，仅覆盖识别到的非空字段。
              </div>
              <div class="upload-zone" style="margin-top:1rem"
                :style="uploadingFile ? 'opacity:.6;pointer-events:none' : ''"
                @click="fileInput?.click()">
                <i class="ti ti-cloud-upload" />
                <div class="uz-title">{{ uploadingFile ? '正在上传并处理…' : '上传新简历' }}</div>
                <div class="uz-hint">支持 PDF、JPG、PNG，单文件不超过 20 MB · {{ readQuota }}</div>
              </div>
            </div>
          </template>

          <!-- 我的投递 -->
          <template v-if="view==='applications'">
            <div class="card card-p">
              <div class="panel-title"><i class="ti ti-send" />我的投递记录</div>
              <div class="tab-nav">
                <button v-for="t in appTabs" :key="t.k"
                  :class="['tab-btn', activeTab===t.k&&'active']"
                  @click="activeTab=t.k"
                >{{ t.label }}<span v-if="t.n" class="tab-count">{{ t.n }}</span></button>
              </div>
              <div v-for="a in filteredApps" :key="a.id" class="app-row" @click="openJobDetail(a)">
                <div class="job-logo" style="width:36px;height:36px">{{ a.abbr }}</div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:.45rem">
                    <span style="font-size:.867rem;font-weight:600;color:var(--ink)">{{ a.title }}</span>
                    <span v-if="isExpired(a.deadline)" style="font-size:.67rem;font-weight:600;color:#999;background:#f0f0f0;border-radius:999px;padding:.1rem .45rem;">已截止</span>
                  </div>
                  <div style="font-size:.773rem;color:var(--ink-2)">{{ a.company }}</div>
                </div>
                <div :title="canEditApply(a) ? '修改投递' : '当前状态不可修改'">
                  <button class="btn-icon btn" :disabled="!canEditApply(a)"
                    :style="!canEditApply(a) ? 'opacity:.35;cursor:not-allowed' : ''"
                    @click.stop="canEditApply(a) && openEditApply(a)">
                    <i class="ti ti-edit" />
                  </button>
                </div>
              </div>
            </div>
          </template>

        </div>
      </div>
    </div>

    <!-- 修改投递弹窗 -->
    <Transition name="fade">
      <div v-if="showEditApply" class="modal-mask" @click.self="showEditApply=false">
        <div class="apply-modal">
          <div class="apply-modal-head">
            <div>
              <div style="font-weight:600;font-size:.95rem;color:var(--ink)">修改投递问卷</div>
              <div v-if="editingApp" style="font-size:.75rem;color:var(--ink-3);margin-top:2px">{{ editingApp.title }} · {{ editingApp.company }}</div>
            </div>
            <button class="btn-icon btn" @click="showEditApply=false"><i class="ti ti-x" /></button>
          </div>
          <div class="apply-modal-body">
            <div v-for="(q, qi) in editQuestions" :key="q.id" class="aq-item">
              <div class="aq-label">{{ qi+1 }}. {{ q.title }}<span v-if="q.required" style="color:var(--red)"> *</span></div>
              <input v-if="q.type==='TEXT'" class="form-control" v-model="editAnswers[q.id]" :placeholder="q.placeholder||'请填写'" />
              <textarea v-else-if="q.type==='TEXTAREA'" class="form-control" style="min-height:80px" v-model="editAnswers[q.id]" :placeholder="q.placeholder||'请填写'"></textarea>
              <div v-else-if="q.type==='RADIO'" style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.35rem">
                <label v-for="opt in q.options" :key="opt" class="aq-opt" :class="{selected: editAnswers[q.id]===opt}" @click="editAnswers[q.id]=opt">
                  <i :class="editAnswers[q.id]===opt ? 'ti ti-circle-filled' : 'ti ti-circle'"></i>{{ opt }}
                </label>
              </div>
              <div v-else-if="q.type==='CHECKBOX'" style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.35rem">
                <label v-for="opt in q.options" :key="opt" class="aq-opt" :class="{selected: (editAnswers[q.id]||[]).includes(opt)}" @click="toggleEditCheck(q.id, opt)">
                  <i :class="(editAnswers[q.id]||[]).includes(opt) ? 'ti ti-checkbox' : 'ti ti-square'"></i>{{ opt }}
                </label>
              </div>
              <div v-else-if="q.type==='FILE_UPLOAD'" class="resume-picker">
                <div v-if="editAnswers[q.id]" class="resume-picker-current">
                  <i class="ti ti-file-check" style="color:#1e6636"></i>
                  <span>{{ editAnswers[q.id] }}</span>
                  <button class="resume-picker-clear" @click="clearEditFile(q.id)" title="取消选择"><i class="ti ti-x" /></button>
                </div>
                <div class="resume-picker-opts">
                  <div class="resume-picker-section-label">从我的简历选择</div>
                  <div v-for="r in editFiles" :key="r.name"
                    class="resume-picker-item"
                    :class="{ selected: editFileIds[q.id]===r.id }"
                    @click="selectEditFile(q.id, r)"
                  >
                    <i :class="['ti', r.icon]" />
                    <span>{{ r.name }}</span>
                    <i v-if="editFileIds[q.id]===r.id" class="ti ti-circle-check-filled" style="color:var(--red);margin-left:auto" />
                  </div>
                  <div class="resume-picker-section-label" style="margin-top:.6rem">或上传本地文件</div>
                  <div class="resume-picker-item resume-picker-upload" @click="triggerEditFile(q.id)">
                    <input type="file" style="display:none" :ref="el => { editFileRefs[q.id] = el }" accept=".pdf,image/*" @change="e => handleEditFile(q.id, e)" />
                    <i class="ti ti-cloud-upload" />
                    <span>点击上传（PDF / 图片）</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="apply-modal-foot">
            <button class="btn btn-secondary btn-sm" @click="showEditApply=false">取消</button>
            <button class="btn btn-primary btn-sm" @click="submitEditApply"><i class="ti ti-check" />保存修改</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 删除简历确认弹窗 -->
    <Transition name="fade">
      <div v-if="showDeleteModal" class="modal-mask" @click.self="cancelDeleteResume">
        <div class="delete-modal">
          <div class="modal-icon"><i class="ti ti-alert-circle" /></div>
          <div class="modal-title">确认删除此简历？</div>
          <div class="modal-desc">删除后将无法在当前页面恢复，请确认是否继续。</div>
          <div class="modal-actions">
            <button class="btn cancel-btn" @click="cancelDeleteResume">取消</button>
            <button class="btn danger-btn" @click="confirmDeleteResume">确认删除</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserNavbar from '@/components/UserNavbar.vue'
import AppToast from '@/components/AppToast.vue'
import { useToast } from '@/composables/useToast'
import { logoutUser, readUser } from '@/lib/auth'
import { downloadFile as downloadBlob, readJson, readToken, uploadForm } from '@/lib/api'
import {
  applyParsedToProfileForm,
  canEditApplication,
  loadMyAnswerRecord,
  loadMyApplicationsPage,
  loadQuestionnaireBundle,
  loadResumeFileList,
  mapResumeFilesForPicker,
  submissionStatusToTabKey,
  submitQuestionnaire,
  uploadQuestionnaireFile,
  validateQuestionnaireUploadFile,
  validateRequiredAnswers,
} from '@/composables/useQuestionnaireForm'

const router  = useRouter()
const route   = useRoute()
const toast   = useToast()
const BASE    = '/api'
const AUTH    = () => ({ 'Fusion-Token': readToken() })

const EDU_LEVEL_OPTIONS = [
  { label: '本科生',       value: 'UNDERGRADUATE' },
  { label: '学术硕士研究生', value: 'ACADEMIC_MASTER' },
  { label: '专业硕士研究生', value: 'PROFESSIONAL_MASTER' },
  { label: '博士研究生',    value: 'DOCTORAL' },
]

const validViews = ['info', 'resume', 'applications']
const view = ref(validViews.includes(route.query.tab) ? route.query.tab : 'info')
watch(() => route.query.tab, (t) => {
  view.value = validViews.includes(t) ? t : 'info'
})

onMounted(() => {
  loadProfile()
  loadResume()
  loadFiles()
  loadQuota()
  loadApplications()
})

function switchView(nextView) {
  if (!validViews.includes(nextView)) return
  router.push({ path: '/profile', query: { tab: nextView } })
}
function openJobDetail(readApplication) {
  router.push({ path: `/job/${readApplication.jobPostId}`, query: { from: 'applications' } })
}

const activeTab = ref('all')
const navItems = [
  { view:'info',         label:'我的资料', icon:'ti-user-circle' },
  { view:'resume',       label:'我的简历', icon:'ti-file-text' },
  { view:'applications', label:'我的投递', icon:'ti-send' },
]

// ── 个人资料（对齐后端字段名）──
const form = ref({ realName:'', sid:'', gender:'', birthDate:'', politicalStatus:'',
  phone:'', email:'', wechat:'', hometown:'', grade:'', major:'', eduLevel:'', supervisor:'',
  intentionOrder:'', intentionCityText:'', intentionDream:'', mindset:'' })

function parseCities(readValue) {
  try {
    const readCities = JSON.parse(readValue || '[]')
    return Array.isArray(readCities) ? readCities.join(',') : ''
  } catch {
    return ''
  }
}

async function loadProfile() {
  try {
    const [readProfile, readCurrentUser] = await Promise.all([
      readJson('/user/profile/get'), readUser(),
    ])
    const readValue = readProfile || {}
    form.value = {
      realName: readValue.realName || '', sid: readCurrentUser?.studentId || '',
      gender: readValue.gender || '', birthDate: readValue.birthDate || '',
      politicalStatus: readValue.politicalStatus || '', phone: readValue.phone || '',
      email: readValue.email || '', wechat: readValue.wechat || '',
      hometown: readValue.hometown || '', grade: readValue.grade || '',
      major: readValue.major || '', eduLevel: readValue.eduLevel || '',
      supervisor: readValue.supervisor || '', intentionOrder: readValue.intentionOrder || '',
      intentionCityText: parseCities(readValue.intentionCity),
      intentionDream: readValue.intentionDream || '', mindset: readValue.mindset || '',
    }
  } catch (readError) {
    toast.error(readError?.message || '加载资料失败')
  }
}
async function saveProfile() {
  try {
    const updateProfile = { ...form.value }
    delete updateProfile.sid
    updateProfile.intentionCity = JSON.stringify(updateProfile.intentionCityText
      .split(',').map(readCity => readCity.trim()).filter(Boolean))
    delete updateProfile.intentionCityText
    Object.keys(updateProfile).forEach(readKey => {
      if (updateProfile[readKey] === '') updateProfile[readKey] = null
    })
    await readJson('/user/profile/save', {
      method: 'PUT',
      body: JSON.stringify(updateProfile),
    })
    toast.success('资料保存成功')
  } catch (readError) { toast.error(readError?.message || '保存失败，请重试') }
}

const resumeFields = [
  { key:'personalIntro', label:'个人简况' }, { key:'basicInfo', label:'基础信息' },
  { key:'education', label:'教育背景' }, { key:'internship', label:'实习经历' },
  { key:'campus', label:'在校经历' }, { key:'awards', label:'荣誉奖励' },
  { key:'skills', label:'掌握技能' }, { key:'portfolio', label:'作品集' },
  { key:'remark', label:'备注' },
]
const resumeForm = ref(Object.fromEntries(resumeFields.map(readField => [readField.key, ''])))

async function loadResume() {
  try {
    const readResume = await readJson('/user/resume/get')
    resumeFields.forEach(readField => {
      resumeForm.value[readField.key] = readResume?.[readField.key] || ''
    })
  } catch (readError) {
    toast.error(readError?.message || '加载简历失败')
  }
}

async function saveResume() {
  try {
    await readJson('/user/resume/save', { method:'PUT', body:JSON.stringify(resumeForm.value) })
    toast.success('简历正文已保存')
  } catch (readError) {
    toast.error(readError?.message || '保存简历失败')
  }
}

const fileInput = ref(null)
const showDeleteModal = ref(false)
const deleteIndex = ref(null)
const readQuota = ref('配额加载中')
const updateProfile = ref(false)
const uploadingFile = ref(false)
const failedFileId = ref(null)

// ── 简历文件（动态加载）──
const resumes = ref([])
async function loadFiles() {
  try {
    const readFiles = await readJson('/user/resume/file/list')
    resumes.value = (readFiles || []).map(readFile => ({
      id: readFile.id, name: readFile.originalName,
      size: `${Math.round(readFile.fileSize / 1024)} KB · ${readFile.mimeType === 'application/pdf' ? 'PDF' : '图片'}`,
      icon: readFile.mimeType === 'application/pdf' ? 'ti-file-type-pdf' : 'ti-photo',
    }))
  } catch (readError) {
    resumes.value = []
    toast.error(readError?.message || '加载简历文件失败')
  }
}

async function loadQuota() {
  try {
    const readValue = await readJson('/user/resume/file/quota')
    const readUsed = (Number(readValue?.usedBytes || 0) / 1024 / 1024).toFixed(1)
    const readTotal = (Number(readValue?.quotaBytes || 0) / 1024 / 1024).toFixed(0)
    readQuota.value = `已用 ${readUsed} / ${readTotal} MB`
  } catch {
    readQuota.value = '配额暂不可用'
  }
}

// ── 我的投递（动态加载）──
const apps = ref([])
const tabCounts = ref({ all:0, draft:0, pending:0, done:0 })
const RECRUIT_BADGE = {
  '大实习': 'badge-blue', '小实习': 'badge-green',
  '日常实习': 'badge-amber', '应届招聘': 'badge-red', '应届生招聘': 'badge-red',
}
const RECRUIT_LABEL = {
  BIG_INTERNSHIP: '大实习', SMALL_INTERNSHIP: '小实习',
  DAILY_INTERNSHIP: '日常实习', CAMPUS_RECRUITMENT: '应届生招聘',
  CAMPUS_SCREENING: '应届生摸排', OTHER: '',
}
async function loadApplications() {
  try {
    const readResult = await loadMyApplicationsPage(activeTab.value)
    tabCounts.value = { ...tabCounts.value, ...readResult.tabCounts }
    apps.value = readResult.list.map(readApplication => ({
      id: readApplication.id,
      jobPostId: readApplication.jobPostId,
      abbr: readApplication.companyName?.charAt(0) || '职',
      title: readApplication.positionName || '未知岗位',
      company: readApplication.companyName || '',
      deadline: readApplication.questionnaireDeadline || '',
      expired: !!readApplication.expired,
      sourceUrl: readApplication.sourceUrl || '',
      submissionStatus: readApplication.submissionStatus,
      statusLabel: readApplication.statusLabel || '',
      date: (readApplication.updatedAt || readApplication.createdAt || '').slice(0, 10),
      k: submissionStatusToTabKey(readApplication.submissionStatus),
    }))
  } catch (readError) {
    apps.value = []
    toast.error(readError?.message || '加载投递记录失败')
  }
}

const appTabs = computed(() => [
  { k:'all', label:'全部', n:tabCounts.value.all || 0 },
  { k:'draft', label:'草稿', n:tabCounts.value.draft || 0 },
  { k:'pending', label:'审核中', n:tabCounts.value.pending || 0 },
  { k:'done', label:'已投递', n:tabCounts.value.done || 0 },
])

function isExpired(deadline) {
  if (!deadline) return false
  return new Date(deadline) < new Date(new Date().toDateString())
}
const filteredApps = computed(() => activeTab.value === 'all' ? apps.value : apps.value.filter(a => a.k === activeTab.value))
watch(activeTab, loadApplications)

function canEditApply(readApplication) {
  return canEditApplication(readApplication)
}

// ── 修改投递 ──
const showEditApply = ref(false)
const editingApp = ref(null)
const editAnswers = ref({})
const editFileIds = ref({})
const editQuestions = ref([])
const editFiles = ref([])

async function openEditApply(readApplication) {
  editingApp.value = readApplication
  editAnswers.value = {}
  editFileIds.value = {}
  try {
    const [readBundle, readAnswer, readFiles] = await Promise.all([
      loadQuestionnaireBundle(readApplication.jobPostId),
      loadMyAnswerRecord(readApplication.jobPostId),
      loadResumeFileList(),
    ])
    editQuestions.value = readBundle.questions
    editFiles.value = mapResumeFilesForPicker(readFiles)
    if (readAnswer?.answers) {
      applyParsedToProfileForm(editQuestions.value, readAnswer.answers,
        readFiles, editAnswers.value, editFileIds.value)
    }
  } catch (readError) {
    toast.error(readError?.message || '加载投递失败')
    return
  }
  showEditApply.value = true
}
function toggleEditCheck(qid, opt) {
  if (!editAnswers.value[qid]) editAnswers.value[qid] = []
  const idx = editAnswers.value[qid].indexOf(opt)
  if (idx === -1) editAnswers.value[qid].push(opt)
  else editAnswers.value[qid].splice(idx, 1)
}

const editFileRefs = {}
function triggerEditFile(qid) {
  if (editFileRefs[qid]) editFileRefs[qid].click()
}
function selectEditFile(readQuestionId, readFile) {
  editAnswers.value[readQuestionId] = readFile.name
  editFileIds.value[readQuestionId] = readFile.id
}

function clearEditFile(readQuestionId) {
  delete editAnswers.value[readQuestionId]
  delete editFileIds.value[readQuestionId]
}

async function handleEditFile(readQuestionId, readEvent) {
  const readFile = readEvent.target.files?.[0]
  const readError = validateQuestionnaireUploadFile(readFile)
  if (readError) {
    toast.error(readError)
    return
  }
  try {
    const readResult = await uploadQuestionnaireFile(readFile)
    editAnswers.value[readQuestionId] = readResult.originalName
    editFileIds.value[readQuestionId] = readResult.id
    toast.success('附件上传成功')
  } catch (uploadError) {
    toast.error(uploadError?.message || '附件上传失败')
  } finally {
    readEvent.target.value = ''
  }
}
async function submitEditApply() {
  const readError = validateRequiredAnswers(editQuestions.value, editAnswers.value, editFileIds.value)
  if (readError) {
    toast.error(readError)
    return
  }
  try {
    await submitQuestionnaire(editingApp.value.jobPostId,
      editQuestions.value, editAnswers.value, editFileIds.value)
    showEditApply.value = false
    toast.success('投递信息已更新')
    await loadApplications()
  } catch (submitError) {
    toast.error(submitError?.message || '更新投递失败')
  }
}

async function uploadFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const ext = file.name.split('.').pop().toLowerCase()
  const readExtensions = ['pdf', 'jpg', 'jpeg', 'png']
  if (!readExtensions.includes(ext)) {
    toast.error('仅支持 PDF、JPG、PNG')
    e.target.value = ''
    return
  }
  if (file.size > 20 * 1024 * 1024) {
    toast.error('文件不能超过 20 MB')
    e.target.value = ''
    return
  }
  uploadingFile.value = true
  try {
    const uploadBody = new FormData()
    uploadBody.append('file', file)
    uploadBody.append('updateProfile', String(updateProfile.value))
    const readResult = await uploadForm('/user/resume/file/upload', uploadBody)
    if (readResult?.parseStatus === 'SUCCESS') {
      failedFileId.value = null
      const readCount = (readResult.updatedProfileFields?.length || 0)
        + (readResult.updatedResumeFields?.length || 0)
      toast.success(`简历上传成功，已更新 ${readCount} 个字段`)
      await Promise.all([loadProfile(), loadResume()])
    } else if (readResult?.parseStatus === 'FAILED') {
      failedFileId.value = readResult.file?.id || null
      toast.error(readResult.message || '文件已保存，资料更新失败')
    } else {
      toast.success('简历上传成功')
    }
    await Promise.all([loadFiles(), loadQuota()])
  } catch (readError) {
    toast.error(readError?.message || '上传失败，请检查网络')
  } finally {
    uploadingFile.value = false
    e.target.value = ''
  }
}

async function retryFile(readFile) {
  try {
    const readResult = await readJson(`/user/resume/file/${readFile.id}/parse`, { method:'POST' })
    if (readResult?.parseStatus !== 'SUCCESS') throw new Error(readResult?.message || '解析失败')
    failedFileId.value = null
    await Promise.all([loadProfile(), loadResume()])
    toast.success('资料更新成功')
  } catch (readError) {
    toast.error(readError?.message || '解析失败，请稍后重试')
  }
}

async function downloadFile(readFile) {
  try {
    const readBlob = await downloadBlob(`/user/resume/file/${readFile.id}/download`)
    const readUrl = URL.createObjectURL(readBlob)
    const createLink = document.createElement('a')
    createLink.href = readUrl
    createLink.download = readFile.name
    createLink.click()
    URL.revokeObjectURL(readUrl)
  } catch (readError) {
    toast.error(readError?.message || '下载失败')
  }
}

function deleteFile(index) {
  deleteIndex.value = index
  showDeleteModal.value = true
}
async function confirmDeleteResume() {
  if (deleteIndex.value === null) return
  const deleteTarget = resumes.value[deleteIndex.value]
  try {
    await readJson(`/user/resume/file/${deleteTarget.id}`, { method:'DELETE' })
    resumes.value.splice(deleteIndex.value, 1)
    await loadQuota()
    toast.success('简历已删除')
  } catch (readError) {
    toast.error(readError?.message || '删除失败，请检查网络')
  }
  cancelDeleteResume()
}
function cancelDeleteResume() {
  showDeleteModal.value = false
  deleteIndex.value = null
}
</script>

<style scoped>
.profile-page {
  width: min(90vw, 1060px);
  margin: 0 auto;
  padding: 1.25rem 0 2.5rem;
}
.profile-layout {
  width: 100%;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}
.card-p { padding: 1.25rem; border-radius: 16px; }
.profile-layout > div:first-child .card-p { min-height: 400px; position: sticky; top: 80px; }
.profile-layout > div:last-child .card-p { min-height: 400px; }

.nav-avatar { width: 86px !important; height: 86px !important; font-size: 2.25rem !important; margin-bottom: .85rem !important; }
.profile-nav-item { min-height: 52px; padding: 0 1.05rem; border-radius: 16px; font-size: 1rem; gap: .68rem; }
.profile-nav-item i { font-size: .96rem; }
.divider { margin: 1.1rem 0; }

.panel-title { font-size: 1.18rem; font-weight: 800; color: var(--ink); margin-bottom: 1.55rem; display: flex; align-items: center; gap: .65rem; }
.panel-title i { color: var(--red); font-size: 1.28rem; }
.grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem 1.55rem; }
.form-label { display: block; font-size: .98rem; font-weight: 650; margin-bottom: .58rem; color: var(--ink); }
.form-control { width: 100%; min-height: 56px; border-radius: 16px; font-size: 1rem; padding: 0 1.1rem; }
.btn { min-height: 46px; padding: 0 1.3rem; border-radius: 14px; font-size: .98rem; }

.resume-row { display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem 1.35rem; background: var(--bg-soft); border: 1px solid var(--border); border-radius: 20px; margin-bottom: .95rem; }
.upload-zone { min-height: 165px; border-radius: 24px; cursor: pointer; transition: all .2s ease; }
.upload-zone:hover { background: #fff6f7; border-color: var(--red); transform: translateY(-1px); }
.upload-zone i { font-size: 2.15rem; margin-bottom: .72rem; }
.uz-title { font-size: 1.12rem; font-weight: 800; }
.uz-hint { font-size: .96rem; }
.btn-icon { width: 44px; height: 44px; border-radius: 15px; display: inline-flex; align-items: center; justify-content: center; }
.btn-icon i { font-size: 1.12rem; }

.tab-nav { margin-bottom: 1.45rem; }
.tab-btn { font-size: .96rem; padding: .65rem .85rem; }
.tab-count { min-width: 26px; height: 26px; line-height: 26px; font-size: .86rem; }
.app-row { display: flex; align-items: center; gap: 1.2rem; padding: 1.22rem 1.35rem; border: 1px solid var(--border); border-radius: 20px; margin-bottom: .95rem; cursor: pointer; transition: all var(--t); }
.app-row:hover { border-color: var(--border-mid); transform: translateY(-1px); box-shadow: 0 10px 24px rgba(0,0,0,.045); }
.job-logo { width: 44px !important; height: 44px !important; border-radius: 16px; font-size: 1.12rem; font-weight: 800; }

.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.delete-modal { width: 420px; background: #fff; border-radius: 26px; padding: 34px 38px; box-shadow: 0 20px 50px rgba(0,0,0,.18); text-align: center; }
.modal-icon { width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 17px; background: #fff1f3; color: var(--red); display: flex; align-items: center; justify-content: center; font-size: 1.9rem; }
.modal-title { font-size: 1.35rem; font-weight: 800; color: #222; margin-bottom: 8px; }
.modal-desc { font-size: 1.02rem; color: #777; line-height: 1.6; margin-bottom: 26px; }
.modal-actions { display: flex; justify-content: center; gap: 14px; }
.cancel-btn { padding: 0 26px; border-radius: 999px; background: #f5f5f5; color: #555; }
.danger-btn { padding: 0 30px; border-radius: 999px; background: var(--red); color: #fff; }

.apply-modal { background: var(--bg-card); border-radius: 16px; width: min(560px, 92vw); max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 16px 48px rgba(28,26,24,.18); }
.apply-modal-head { display: flex; align-items: center; justify-content: space-between; padding: .875rem 1.1rem; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.apply-modal-body { flex: 1; overflow-y: auto; padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 1rem; }
.apply-modal-foot { display: flex; justify-content: flex-end; gap: .5rem; padding: .75rem 1.1rem; border-top: 1px solid var(--border); flex-shrink: 0; }
.aq-item { display: flex; flex-direction: column; gap: .35rem; }
.aq-label { font-size: .833rem; font-weight: 600; color: var(--ink); }
.aq-opt { display: inline-flex; align-items: center; gap: .3rem; padding: .35rem .7rem; border: 1px solid var(--border); border-radius: 999px; font-size: .8rem; color: var(--ink-2); cursor: pointer; transition: all var(--t); user-select: none; }
.aq-opt.selected { border-color: var(--red); color: var(--red); background: var(--red-light); }

.resume-picker { border: 1px solid var(--border); border-radius: var(--r-lg); overflow: hidden; }
.resume-picker-current { display: flex; align-items: center; gap: .5rem; padding: .55rem .85rem; background: #f0faf3; border-bottom: 1px solid var(--border); font-size: .8rem; color: var(--ink); }
.resume-picker-current span { flex: 1; min-width: 0; }
.resume-picker-clear { background: none; border: none; cursor: pointer; color: var(--ink-3); padding: 2px 4px; border-radius: 4px; line-height: 1; }
.resume-picker-clear:hover { color: var(--red); }
.resume-picker-opts { padding: .6rem .75rem; display: flex; flex-direction: column; gap: .3rem; }
.resume-picker-section-label { font-size: .7rem; font-weight: 600; color: var(--ink-3); letter-spacing: .04em; text-transform: uppercase; margin-bottom: .15rem; }
.resume-picker-item { display: flex; align-items: center; gap: .5rem; padding: .5rem .7rem; border: 1px solid var(--border); border-radius: var(--r-md); font-size: .8rem; color: var(--ink-2); cursor: pointer; transition: all var(--t); }
.resume-picker-item:hover { border-color: var(--red-border); background: var(--red-light); color: var(--ink); }
.resume-picker-item.selected { border-color: var(--red-border); background: var(--red-light); color: var(--ink); }
.resume-picker-upload { border-style: dashed; color: var(--ink-3); }
.resume-picker-upload:hover { color: var(--red); }

@media (max-width: 1100px) {
  .profile-page { width: min(92vw, 920px); padding-top: 1.3rem; }
  .profile-layout { grid-template-columns: 1fr; }
  .profile-layout > div:first-child .card-p { min-height: auto; position: static; }
  .grid-2 { grid-template-columns: 1fr; }
}
</style>
