<template>
  <div>
    <UserNavbar />
    <AppToast />
    <div class="profile-page">
      <div class="profile-layout profile-layout-large">
        <!-- 侧边 -->
        <div>
          <div class="card card-p">
            <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding-bottom:1.1rem;border-bottom:1px solid var(--border);margin-bottom:1.1rem">
              <div class="nav-avatar" style="width:52px;height:52px;font-size:1.3rem;margin-bottom:.5rem">{{ avatarChar }}</div>
              <div style="font-size:.875rem;font-weight:700;color:var(--ink)">{{ profileForm.realName || '同学' }}</div>
            </div>
            <button v-for="item in navItems" :key="item.view"
              :class="['profile-nav-item', view===item.view && 'active']"
              @click="switchView(item.view)"
            ><i :class="['ti',item.icon]" />{{ item.label }}</button>
            <div class="divider" />
            <a href="#/login" class="profile-nav-item" @click.prevent="onLogoutClick"><i class="ti ti-logout" />退出登录</a>
          </div>
        </div>

        <!-- 右侧面板 -->
        <div>

          <!-- 我的资料 -->
          <template v-if="view==='info'">
            <div class="card card-p">
              <div class="panel-title"><i class="ti ti-user" />基本信息</div>
              <div v-if="pageLoading" style="text-align:center;padding:2rem;color:var(--ink-3)">加载中…</div>
              <template v-else>
              <div class="grid-2">
                <div class="form-group"><label class="form-label">姓名</label><input class="form-control" v-model="profileForm.realName" placeholder="真实姓名" /></div>
                <div class="form-group"><label class="form-label">用户 ID</label><input class="form-control" :value="profileForm.userId || '—'" readonly /></div>
                <div class="form-group"><label class="form-label">性别</label>
                  <select class="form-control" v-model="profileForm.gender">
                    <option value="">请选择</option>
                    <option v-for="o in genderOpts" :key="o.v" :value="o.v">{{ o.l }}</option>
                  </select>
                </div>
                <div class="form-group"><label class="form-label">出生日期</label><input class="form-control" type="date" v-model="profileForm.birthDate" /></div>
                <div class="form-group"><label class="form-label">政治面貌</label>
                  <select class="form-control" v-model="profileForm.politicalStatus">
                    <option value="">请选择</option>
                    <option v-for="o in politicalOpts" :key="o.v" :value="o.v">{{ o.l }}</option>
                  </select>
                </div>
                <div class="form-group"><label class="form-label">学历</label>
                  <select class="form-control" v-model="profileForm.eduLevel">
                    <option value="">请选择</option>
                    <option v-for="o in eduOpts" :key="o.v" :value="o.v">{{ o.l }}</option>
                  </select>
                </div>
                <div class="form-group"><label class="form-label">届次 / 年级</label><input class="form-control" v-model="profileForm.grade" placeholder="如 2025 届" /></div>
                <div class="form-group"><label class="form-label">专业</label><input class="form-control" v-model="profileForm.major" /></div>
                <div class="form-group"><label class="form-label">手机号</label><input class="form-control" v-model="profileForm.phone" /></div>
                <div class="form-group"><label class="form-label">邮箱</label><input class="form-control" v-model="profileForm.email" /></div>
                <div class="form-group"><label class="form-label">微信</label><input class="form-control" v-model="profileForm.wechat" /></div>
                <div class="form-group"><label class="form-label">籍贯</label><input class="form-control" v-model="profileForm.hometown" /></div>
                <div class="form-group"><label class="form-label">导师</label><input class="form-control" v-model="profileForm.supervisor" /></div>
                <div class="form-group span-2"><label class="form-label">就业意向排序</label><input class="form-control" v-model="profileForm.intentionOrder" placeholder="如：媒体 / 企业 / 体制内" /></div>
                <div class="form-group"><label class="form-label">意向城市</label><input class="form-control" v-model="profileForm.intentionCity" /></div>
                <div class="form-group"><label class="form-label">意向单位 / 梦想 offer</label><input class="form-control" v-model="profileForm.intentionDream" /></div>
                <div class="form-group span-2"><label class="form-label">当前心态</label>
                  <select class="form-control" v-model="profileForm.mindset">
                    <option value="">请选择</option>
                    <option v-for="o in mindsetOpts" :key="o.v" :value="o.v">{{ o.l }}</option>
                  </select>
                </div>
              </div>
              <div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:1rem">
                <button type="button" class="btn btn-secondary" @click="resetProfile">取消</button>
                <button type="button" class="btn btn-primary" @click="saveProfile"><i class="ti ti-check" />保存</button>
              </div>
              </template>
            </div>
          </template>

          <!-- 我的简历 -->
          <template v-if="view==='resume'">
            <div class="card card-p" style="margin-bottom:1rem">
              <div class="panel-title"><i class="ti ti-file-text" />简历附件</div>
              <div v-if="pageLoading" style="text-align:center;padding:2rem;color:var(--ink-3)">加载中…</div>
              <template v-else>
              <div v-for="(r, index) in resumeFiles" :key="r.id" class="resume-row">
                <div style="width:38px;height:38px;border-radius:var(--r-md);background:var(--red-light);border:1px solid var(--red-border);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--red);font-size:1rem">
                  <i :class="['ti', fileIcon(r)]" />
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font-size:.867rem;font-weight:500;color:var(--ink)">{{ r.originalName }}</div>
                  <div style="font-size:.733rem;color:var(--ink-2)">{{ fileMetaLine(r) }}</div>
                </div>
                <div style="display:flex;gap:.3rem">
                  <button type="button" class="btn-icon btn" title="下载" @click="downloadResumeFile(r)"><i class="ti ti-download" /></button>
                  <button type="button" class="btn-icon btn" title="删除" @click="deleteResume(index)"><i class="ti ti-trash" /></button>
                </div>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style="display:none"
                @change="handleUpload"
              />
              <div class="upload-zone" style="margin-top:1rem" @click="fileInput?.click()">
                <i class="ti ti-cloud-upload" />
                <div class="uz-title">上传新简历</div>
                <div class="uz-hint">支持 PDF、JPG、PNG，单文件不超过 20 MB；个人总配额 30 MB（已用 {{ quotaUsedMb }} / {{ quotaTotalMb }} MB）</div>
              </div>
              </template>
            </div>
            <div class="card card-p">
              <div class="panel-title"><i class="ti ti-notes" />简历正文</div>
              <p style="font-size:.78rem;color:var(--ink-3);margin-bottom:1rem">以下内容对应后台「个人简历」富文本字段，保存后写入 /user/resume/save。</p>
              <div class="form-group"><label class="form-label">个人简介</label><textarea class="form-control" style="min-height:72px" v-model="resumeForm.personalIntro" /></div>
              <div class="form-group"><label class="form-label">基本信息</label><textarea class="form-control" style="min-height:72px" v-model="resumeForm.basicInfo" /></div>
              <div class="form-group"><label class="form-label">教育经历</label><textarea class="form-control" style="min-height:72px" v-model="resumeForm.education" /></div>
              <div class="form-group"><label class="form-label">实习经历</label><textarea class="form-control" style="min-height:72px" v-model="resumeForm.internship" /></div>
              <div class="form-group"><label class="form-label">校园经历</label><textarea class="form-control" style="min-height:72px" v-model="resumeForm.campus" /></div>
              <div class="form-group"><label class="form-label">获奖情况</label><textarea class="form-control" style="min-height:72px" v-model="resumeForm.awards" /></div>
              <div class="form-group"><label class="form-label">技能特长</label><textarea class="form-control" style="min-height:72px" v-model="resumeForm.skills" /></div>
              <div class="form-group"><label class="form-label">作品集 / 链接</label><textarea class="form-control" style="min-height:56px" v-model="resumeForm.portfolio" /></div>
              <div class="form-group"><label class="form-label">备注</label><textarea class="form-control" style="min-height:56px" v-model="resumeForm.remark" /></div>
              <div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:1rem">
                <button type="button" class="btn btn-secondary" @click="resetResume">取消</button>
                <button type="button" class="btn btn-primary" @click="saveResume"><i class="ti ti-check" />保存简历正文</button>
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
              <div v-if="appsLoading" style="padding:1rem;color:var(--ink-3);font-size:.8rem">加载中…</div>
              <div v-else-if="!filteredApps.length" style="padding:1rem;color:var(--ink-3);font-size:.8rem">暂无投递记录</div>
              <div v-for="a in filteredApps" :key="a.id" class="app-row" @click="openJobDetail(a)">
                <div class="job-logo" style="width:36px;height:36px">{{ a.abbr }}</div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:.45rem;flex-wrap:wrap">
                    <span style="font-size:.867rem;font-weight:600;color:var(--ink)">{{ a.title }}</span>
                    <span v-if="a.sourceUrl" style="font-size:.67rem;font-weight:600;color:#1e6636;background:#e8f5ee;border-radius:999px;padding:.1rem .45rem;">官网投递</span>
                    <span v-if="appExpired(a)" style="font-size:.67rem;font-weight:600;color:#999;background:#f0f0f0;border-radius:999px;padding:.1rem .45rem;">已截止</span>
                  </div>
                  <div style="font-size:.773rem;color:var(--ink-2)">{{ a.company }}</div>
                  <div v-if="a.date" style="font-size:.7rem;color:var(--ink-3);margin-top:2px">更新于 {{ a.date }}</div>
                </div>
                <div v-if="!a.sourceUrl" class="edit-btn-wrap" :title="canEditApply(a) ? '修改投递' : '已截止，不可修改'">
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
            <button type="button" class="btn-icon btn" @click="showEditApply=false"><i class="ti ti-x" /></button>
          </div>
          <div class="apply-modal-body">
            <div v-if="editFormLoading" style="text-align:center;padding:2rem;color:var(--ink-3)">加载中…</div>
            <template v-else>
            <div v-for="(q, qi) in mockQuestions" :key="q.id" class="aq-item">
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
                  <button type="button" class="resume-picker-clear" @click="clearEditFile(q.id)" title="取消选择"><i class="ti ti-x" /></button>
                </div>
                <div class="resume-picker-opts">
                  <div class="resume-picker-section-label">从我的简历选择</div>
                  <div v-for="r in resumes" :key="r.name"
                    class="resume-picker-item"
                    :class="{ selected: editAnswers[q.id]===r.name }"
                    @click="pickEditResume(q.id, r)"
                  >
                    <i :class="['ti', r.icon]" />
                    <span>{{ r.name }}</span>
                    <i v-if="editAnswers[q.id]===r.name" class="ti ti-circle-check-filled" style="color:var(--red);margin-left:auto" />
                  </div>
                  <div class="resume-picker-section-label" style="margin-top:.6rem">或上传本地文件</div>
                  <div class="resume-picker-item resume-picker-upload" @click="triggerEditFile(q.id)">
                    <input type="file" style="display:none" :ref="el => { editFileRefs[q.id] = el }" accept=".pdf,.jpg,.jpeg,.png" @change="e => handleEditFile(q.id, e)" />
                    <i class="ti ti-cloud-upload" />
                    <span>点击上传新简历（PDF / 图片）</span>
                  </div>
                </div>
              </div>
            </div>
            </template>
          </div>
          <div class="apply-modal-foot">
            <button type="button" class="btn btn-secondary btn-sm" @click="showEditApply=false">取消</button>
            <button
              v-if="canSaveEditDraft"
              type="button"
              class="btn btn-secondary btn-sm"
              :disabled="editFormLoading"
              @click="saveEditDraft"
            >
              <i class="ti ti-device-floppy" />存草稿
            </button>
            <button type="button" class="btn btn-primary btn-sm" :disabled="editFormLoading" @click="submitEditApply"><i class="ti ti-check" />保存修改</button>
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
import { apiJson, apiForm, apiDownloadBlob, logoutSession } from '@/lib/api'
import {
  loadMyApplicationsPage,
  loadQuestionnaireBundle,
  loadMyAnswerRecord,
  loadResumeFileList,
  mapResumeFilesForPicker,
  applyParsedToProfileForm,
  validateRequiredAnswers,
  submitQuestionnaire,
  saveDraftQuestionnaire,
  uploadQuestionnaireFile,
  validateQuestionnaireUploadFile,
  canEditApplication,
  submissionStatusToTabKey,
} from '@/composables/useQuestionnaireForm'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const validViews = ['info', 'resume', 'applications']
const view = ref(validViews.includes(route.query.tab) ? route.query.tab : 'info')
watch(() => route.query.tab, (t) => {
  const next = validViews.includes(t) ? t : 'info'
  view.value = next
  if (next === 'applications') loadApplications()
})

function switchView(nextView) {
  if (!validViews.includes(nextView)) return
  router.push({ path: '/profile', query: { tab: nextView } })
  if (nextView === 'applications') loadApplications()
}

async function onLogoutClick() {
  await logoutSession()
  window.location.hash = '#/login'
}

const activeTab = ref('all')
const navItems = [
  { view: 'info', label: '我的资料', icon: 'ti-user-circle' },
  { view: 'resume', label: '我的简历', icon: 'ti-file-text' },
  { view: 'applications', label: '我的投递', icon: 'ti-send' },
]

const tabCounts = ref({ all: 0, draft: 0, pending: 0, done: 0 })
const appTabs = computed(() => [
  { k: 'all', label: '全部', n: tabCounts.value.all || 0 },
  { k: 'draft', label: '草稿', n: tabCounts.value.draft || 0 },
  { k: 'pending', label: '审核中', n: tabCounts.value.pending || 0 },
  { k: 'done', label: '已投递', n: tabCounts.value.done || 0 },
])
const apps = ref([])
const appsLoading = ref(false)

const filteredApps = computed(() =>
  activeTab.value === 'all' ? apps.value : apps.value.filter((a) => a.k === activeTab.value)
)

watch(activeTab, () => {
  if (view.value === 'applications') loadApplications()
})

function formatAppDate(str) {
  if (!str) return ''
  const s = String(str)
  return s.length >= 10 ? s.slice(0, 10) : s
}

function isExpired(deadline) {
  if (!deadline) return false
  return new Date(deadline) < new Date(new Date().toDateString())
}

function appExpired(a) {
  if (a.expired === true) return true
  return isExpired(a.deadline)
}

function canEditApply(a) {
  return canEditApplication(a)
}

function mapApplicationItem(item) {
  const title = item.positionName || '未知岗位'
  const company = item.companyName || ''
  return {
    id: item.id,
    jobPostId: item.jobPostId,
    title,
    company,
    abbr: company ? company.charAt(0) : '?',
    deadline: item.questionnaireDeadline,
    expired: !!item.expired,
    sourceUrl: item.sourceUrl,
    submissionStatus: item.submissionStatus,
    statusLabel: item.statusLabel,
    date: formatAppDate(item.updatedAt || item.createdAt),
    k: submissionStatusToTabKey(item.submissionStatus),
  }
}

async function loadApplications() {
  appsLoading.value = true
  try {
    const { list, tabCounts: counts } = await loadMyApplicationsPage(activeTab.value)
    tabCounts.value = {
      all: counts.all ?? 0,
      draft: counts.draft ?? 0,
      pending: counts.pending ?? 0,
      done: counts.done ?? 0,
    }
    apps.value = list.map(mapApplicationItem)
  } catch (e) {
    apps.value = []
    toast.error(e?.message || '加载投递记录失败')
  } finally {
    appsLoading.value = false
  }
}

function openJobDetail(a) {
  if (!a?.jobPostId) return
  router.push({ path: `/job/${a.jobPostId}`, query: { from: 'applications' } })
}

// ── 修改投递弹窗 ──
const showEditApply = ref(false)
const editingApp = ref(null)
const editAnswers = ref({})
const editFileIds = ref({})
const mockQuestions = ref([])
const resumes = ref([])
const editFormLoading = ref(false)
const editFileRefs = {}

/** 已正式提交（审核中）时后端 draft 接口会拒绝 */
const canSaveEditDraft = computed(() => {
  const s = editingApp.value?.submissionStatus
  return s !== 'SUBMITTED' && s !== 'REVIEWED'
})

async function openEditApply(app) {
  if (!canEditApply(app)) return
  editingApp.value = app
  editAnswers.value = {}
  editFileIds.value = {}
  mockQuestions.value = []
  showEditApply.value = true
  editFormLoading.value = true
  try {
    const [bundle, myAnswer, fileList] = await Promise.all([
      loadQuestionnaireBundle(app.jobPostId),
      loadMyAnswerRecord(app.jobPostId),
      loadResumeFileList(),
    ])
    if (bundle.expired) {
      toast.error('问卷已截止，无法修改')
      showEditApply.value = false
      return
    }
    mockQuestions.value = bundle.questions
    resumes.value = mapResumeFilesForPicker(fileList)
    if (myAnswer?.answers) {
      applyParsedToProfileForm(
        mockQuestions.value,
        myAnswer.answers,
        fileList,
        editAnswers.value,
        editFileIds.value
      )
    }
  } catch (e) {
    toast.error(e?.message || '加载问卷失败')
    showEditApply.value = false
  } finally {
    editFormLoading.value = false
  }
}

function toggleEditCheck(qid, opt) {
  if (!editAnswers.value[qid]) editAnswers.value[qid] = []
  const idx = editAnswers.value[qid].indexOf(opt)
  if (idx === -1) editAnswers.value[qid].push(opt)
  else editAnswers.value[qid].splice(idx, 1)
}

function triggerEditFile(qid) {
  editFileRefs[qid]?.click?.()
}

function pickEditResume(qid, r) {
  editAnswers.value = { ...editAnswers.value, [qid]: r.name }
  editFileIds.value = { ...editFileIds.value, [qid]: r.id }
}

function clearEditFile(qid) {
  const nextA = { ...editAnswers.value }
  const nextF = { ...editFileIds.value }
  delete nextA[qid]
  delete nextF[qid]
  editAnswers.value = nextA
  editFileIds.value = nextF
}

async function handleEditFile(qid, e) {
  const f = e.target.files?.[0]
  if (e.target) e.target.value = ''
  if (!f) return
  const err = validateQuestionnaireUploadFile(f)
  if (err) {
    toast.error(err)
    return
  }
  try {
    const rf = await uploadQuestionnaireFile(f)
    editAnswers.value = { ...editAnswers.value, [qid]: rf.originalName }
    editFileIds.value = { ...editFileIds.value, [qid]: rf.id }
    toast.success('简历已更换：' + rf.originalName)
  } catch (err) {
    toast.error(err?.message || '上传失败')
  }
}

async function saveEditDraft() {
  if (!editingApp.value?.jobPostId || !mockQuestions.value.length) return
  try {
    await saveDraftQuestionnaire(
      editingApp.value.jobPostId,
      mockQuestions.value,
      editAnswers.value,
      editFileIds.value
    )
    showEditApply.value = false
    toast.success('草稿已保存')
    await loadApplications()
  } catch (e) {
    toast.error(e?.message || '保存草稿失败')
  }
}

async function submitEditApply() {
  const errMsg = validateRequiredAnswers(mockQuestions.value, editAnswers.value, editFileIds.value)
  if (errMsg) {
    toast.error(errMsg)
    return
  }
  try {
    await submitQuestionnaire(
      editingApp.value.jobPostId,
      mockQuestions.value,
      editAnswers.value,
      editFileIds.value
    )
    showEditApply.value = false
    toast.success('投递信息已更新')
    await loadApplications()
  } catch (e) {
    toast.error(e?.message || '保存失败')
  }
}

const genderOpts = [
  { v: 'MALE', l: '男' },
  { v: 'FEMALE', l: '女' },
  { v: 'OTHER', l: '其他' },
]
const politicalOpts = [
  { v: 'MASSES', l: '群众' },
  { v: 'LEAGUE_MEMBER', l: '共青团员' },
  { v: 'PARTY_MEMBER', l: '中共党员' },
  { v: 'OTHER', l: '其他' },
]
const eduOpts = [
  { v: 'UNDERGRADUATE', l: '本科生' },
  { v: 'ACADEMIC_MASTER', l: '学术硕士研究生' },
  { v: 'PROFESSIONAL_MASTER', l: '专业硕士研究生' },
  { v: 'DOCTORAL', l: '博士研究生' },
]
const mindsetOpts = [
  { v: 'CONFIDENT', l: '比较有把握' },
  { v: 'CAUTIOUSLY_OPTIMISTIC', l: '谨慎乐观' },
  { v: 'LACK_OF_CONFIDENCE', l: '信心不足' },
  { v: 'VERY_ANXIOUS', l: '非常焦虑' },
  { v: 'ZEN_WAITING', l: '佛系等待' },
]

function emptyProfile() {
  return {
    userId: null,
    realName: '',
    gender: '',
    birthDate: '',
    politicalStatus: '',
    phone: '',
    email: '',
    wechat: '',
    hometown: '',
    grade: '',
    major: '',
    eduLevel: '',
    supervisor: '',
    intentionOrder: '',
    intentionCity: '',
    intentionDream: '',
    mindset: '',
  }
}

function emptyResumeForm() {
  return {
    personalIntro: '',
    basicInfo: '',
    education: '',
    internship: '',
    campus: '',
    awards: '',
    skills: '',
    portfolio: '',
    remark: '',
  }
}

const pageLoading = ref(true)
const profileForm = ref(emptyProfile())
const profileSnapshot = ref('')
const resumeForm = ref(emptyResumeForm())
const resumeSnapshot = ref('')
const resumeFiles = ref([])
const quotaUsedMb = ref('0')
const quotaTotalMb = ref('30')
const fileInput = ref(null)
const showDeleteModal = ref(false)
const deleteIndex = ref(null)

const avatarChar = computed(() => {
  const n = profileForm.value.realName?.trim()
  return n ? n.charAt(0) : '同'
})

function pickProfile(p) {
  if (!p) return emptyProfile()
  return {
    userId: p.userId ?? null,
    realName: p.realName ?? '',
    gender: p.gender ?? '',
    birthDate: p.birthDate ?? '',
    politicalStatus: p.politicalStatus ?? '',
    phone: p.phone ?? '',
    email: p.email ?? '',
    wechat: p.wechat ?? '',
    hometown: p.hometown ?? '',
    grade: p.grade ?? '',
    major: p.major ?? '',
    eduLevel: p.eduLevel ?? '',
    supervisor: p.supervisor ?? '',
    intentionOrder: p.intentionOrder ?? '',
    intentionCity: p.intentionCity ?? '',
    intentionDream: p.intentionDream ?? '',
    mindset: p.mindset ?? '',
  }
}

function pickResume(r) {
  if (!r) return emptyResumeForm()
  return {
    personalIntro: r.personalIntro ?? '',
    basicInfo: r.basicInfo ?? '',
    education: r.education ?? '',
    internship: r.internship ?? '',
    campus: r.campus ?? '',
    awards: r.awards ?? '',
    skills: r.skills ?? '',
    portfolio: r.portfolio ?? '',
    remark: r.remark ?? '',
  }
}

function snapshotProfiles() {
  profileSnapshot.value = JSON.stringify(profileForm.value)
  resumeSnapshot.value = JSON.stringify(resumeForm.value)
}

function resetProfile() {
  try {
    profileForm.value = JSON.parse(profileSnapshot.value || '{}')
    if (!profileForm.value || typeof profileForm.value !== 'object') profileForm.value = emptyProfile()
  } catch {
    profileForm.value = emptyProfile()
  }
}

function resetResume() {
  try {
    resumeForm.value = JSON.parse(resumeSnapshot.value || '{}')
    if (!resumeForm.value || typeof resumeForm.value !== 'object') resumeForm.value = emptyResumeForm()
  } catch {
    resumeForm.value = emptyResumeForm()
  }
}

async function loadQuota() {
  try {
    const q = await apiJson('/user/resume/file/quota')
    const used = Number(q?.usedBytes || 0)
    const total = Number(q?.quotaBytes || 30 * 1024 * 1024)
    quotaUsedMb.value = (used / (1024 * 1024)).toFixed(1)
    quotaTotalMb.value = (total / (1024 * 1024)).toFixed(0)
  } catch {
    quotaUsedMb.value = '0'
    quotaTotalMb.value = '30'
  }
}

async function loadAll() {
  pageLoading.value = true
  try {
    const [prof, res, files] = await Promise.all([
      apiJson('/user/profile/get'),
      apiJson('/user/resume/get'),
      apiJson('/user/resume/file/list'),
    ])
    profileForm.value = pickProfile(prof)
    resumeForm.value = pickResume(res)
    resumeFiles.value = Array.isArray(files) ? files : []
    snapshotProfiles()
    await loadQuota()
  } catch (e) {
    toast.error(e?.message || '加载失败')
  } finally {
    pageLoading.value = false
  }
}

async function saveProfile() {
  const body = { ...profileForm.value }
  delete body.userId
  Object.keys(body).forEach((k) => {
    if (body[k] === '') body[k] = null
  })
  try {
    await apiJson('/user/profile/save', { method: 'PUT', body: JSON.stringify(body) })
    toast.success('资料已保存')
    await loadAll()
  } catch (e) {
    toast.error(e?.message || '保存失败')
  }
}

async function saveResume() {
  const body = { ...resumeForm.value }
  try {
    await apiJson('/user/resume/save', { method: 'PUT', body: JSON.stringify(body) })
    toast.success('简历正文已保存')
    await loadAll()
  } catch (e) {
    toast.error(e?.message || '保存失败')
  }
}

function fileIcon(r) {
  const n = (r.originalName || '').toLowerCase()
  if (n.endsWith('.pdf')) return 'ti-file-type-pdf'
  if (n.endsWith('.png') || n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'ti-photo'
  return 'ti-file-type-doc'
}

function fileMetaLine(r) {
  const kb = r.fileSize != null ? `${(Number(r.fileSize) / 1024).toFixed(0)} KB` : ''
  const t = r.createdAt ? String(r.createdAt).replace('T', ' ').slice(0, 16) : ''
  return [t && `上传于 ${t}`, kb].filter(Boolean).join(' · ')
}

async function handleUpload(e) {
  const file = e.target.files?.[0]
  if (e.target) e.target.value = ''
  if (!file) return
  const err = validateQuestionnaireUploadFile(file)
  if (err) {
    toast.error(err)
    return
  }
  const fd = new FormData()
  fd.append('file', file)
  try {
    await apiForm('/user/resume/file/upload', fd)
    toast.success('上传成功')
    await loadAll()
  } catch (err) {
    toast.error(err?.message || '上传失败')
  }
}

async function downloadResumeFile(r) {
  try {
    const blob = await apiDownloadBlob(`/user/resume/file/${r.id}/download`)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = r.originalName || 'resume'
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    toast.error(e?.message || '下载失败')
  }
}

function deleteResume(index) {
  deleteIndex.value = index
  showDeleteModal.value = true
}

async function confirmDeleteResume() {
  if (deleteIndex.value === null) return
  const r = resumeFiles.value[deleteIndex.value]
  if (!r?.id) return
  try {
    await apiJson(`/user/resume/file/${r.id}`, { method: 'DELETE' })
    toast.success('已删除')
    cancelDeleteResume()
    await loadAll()
  } catch (e) {
    toast.error(e?.message || '删除失败')
  }
}

function cancelDeleteResume() {
  showDeleteModal.value = false
  deleteIndex.value = null
}

onMounted(() => {
  loadAll()
  if (view.value === 'applications') loadApplications()
})
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
.card-p {
  padding: 1.25rem;
  border-radius: 16px;
}
.profile-layout > div:first-child .card-p {
  min-height: 400px;
  position: sticky;
  top: 80px;
}
.profile-layout > div:last-child .card-p {
  min-height: 400px;
}

/* 左侧个人卡片 */
.nav-avatar {
  width: 86px !important;
  height: 86px !important;
  font-size: 2.25rem !important;
  margin-bottom: .85rem !important;
}
.profile-nav-item {
  min-height: 52px;
  padding: 0 1.05rem;
  border-radius: 16px;
  font-size: 1rem;
  gap: .68rem;
}
.profile-nav-item i { font-size: .96rem; }
.divider { margin: 1.1rem 0; }

/* 右侧表单面板 */
.panel-title {
  font-size: 1.18rem;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 1.55rem;
  display: flex;
  align-items: center;
  gap: .65rem;
}
.panel-title i { color: var(--red); font-size: 1.28rem; }
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem 1.55rem;
}
.grid-2 .span-2 {
  grid-column: 1 / -1;
}
.form-label {
  display: block;
  font-size: .98rem;
  font-weight: 650;
  margin-bottom: .58rem;
  color: var(--ink);
}
.form-control {
  width: 100%;
  min-height: 56px;
  border-radius: 16px;
  font-size: 1rem;
  padding: 0 1.1rem;
}
.btn {
  min-height: 46px;
  padding: 0 1.3rem;
  border-radius: 14px;
  font-size: .98rem;
}

/* 简历页 */
.resume-row {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.35rem;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 20px;
  margin-bottom: .95rem;
}
.upload-zone {
  min-height: 165px;
  border-radius: 24px;
  cursor: pointer;
  transition: all .2s ease;
}
.upload-zone:hover {
  background: #fff6f7;
  border-color: var(--red);
  transform: translateY(-1px);
}
.upload-zone i {
  font-size: 2.15rem;
  margin-bottom: .72rem;
}
.uz-title {
  font-size: 1.12rem;
  font-weight: 800;
}
.uz-hint {
  font-size: .96rem;
}
.btn-icon {
  width: 44px;
  height: 44px;
  border-radius: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-icon i { font-size: 1.12rem; }

/* 投递页 */
.tab-nav { margin-bottom: 1.45rem; }
.tab-btn {
  font-size: .96rem;
  padding: .65rem .85rem;
}
.tab-count {
  min-width: 26px;
  height: 26px;
  line-height: 26px;
  font-size: .86rem;
}
.app-row {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.22rem 1.35rem;
  border: 1px solid var(--border);
  border-radius: 20px;
  margin-bottom: .95rem;
  cursor: pointer;
  transition: all var(--t);
}
.app-row:hover {
  border-color: var(--border-mid);
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0,0,0,.045);
}
.job-logo {
  width: 44px !important;
  height: 44px !important;
  border-radius: 16px;
  font-size: 1.12rem;
  font-weight: 800;
}

/* 自定义删除弹窗 */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.delete-modal {
  width: 420px;
  background: #fff;
  border-radius: 26px;
  padding: 34px 38px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, .18);
  text-align: center;
}
.modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin: 0 auto 17px;
  background: #fff1f3;
  color: var(--red);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.9rem;
}
.modal-title { font-size: 1.35rem; font-weight: 800; color: #222; margin-bottom: 8px; }
.modal-desc { font-size: 1.02rem; color: #777; line-height: 1.6; margin-bottom: 26px; }
.modal-actions { display: flex; justify-content: center; gap: 14px; }
.cancel-btn { padding: 0 26px; border-radius: 999px; background: #f5f5f5; color: #555; }
.danger-btn { padding: 0 30px; border-radius: 999px; background: var(--red); color: #fff; }

/* 修改投递弹窗 */
.apply-modal {
  background: var(--bg-card);
  border-radius: 16px;
  width: min(560px, 92vw);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 48px rgba(28,26,24,.18);
}
.apply-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .875rem 1.1rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.apply-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.apply-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: .5rem;
  padding: .75rem 1.1rem;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
.aq-item { display: flex; flex-direction: column; gap: .35rem; }
.aq-label { font-size: .833rem; font-weight: 600; color: var(--ink); }
.aq-opt {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  padding: .35rem .7rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: .8rem;
  color: var(--ink-2);
  cursor: pointer;
  transition: all var(--t);
  user-select: none;
}
.aq-opt.selected {
  border-color: var(--red);
  color: var(--red);
  background: var(--red-light);
}
.aq-upload {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .6rem .9rem;
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  background: var(--bg-soft);
  font-size: .8rem;
  color: var(--ink-2);
}
.aq-upload-clickable {
  cursor: pointer;
  transition: all var(--t);
}
.aq-upload-clickable:hover {
  border-color: var(--red-border);
  background: var(--red-light);
  color: var(--red);
}
/* 简历选择器 */
.resume-picker {
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
}
.resume-picker-current {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .55rem .85rem;
  background: #f0faf3;
  border-bottom: 1px solid var(--border);
  font-size: .8rem;
  color: var(--ink);
}
.resume-picker-current span { flex: 1; min-width: 0; }
.resume-picker-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--ink-3);
  padding: 2px 4px;
  border-radius: 4px;
  line-height: 1;
}
.resume-picker-clear:hover { color: var(--red); }
.resume-picker-opts { padding: .6rem .75rem; display: flex; flex-direction: column; gap: .3rem; }
.resume-picker-section-label {
  font-size: .7rem;
  font-weight: 600;
  color: var(--ink-3);
  letter-spacing: .04em;
  text-transform: uppercase;
  margin-bottom: .15rem;
}
.resume-picker-item {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .5rem .7rem;
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  font-size: .8rem;
  color: var(--ink-2);
  cursor: pointer;
  transition: all var(--t);
}
.resume-picker-item:hover {
  border-color: var(--red-border);
  background: var(--red-light);
  color: var(--ink);
}
.resume-picker-item.selected {
  border-color: var(--red-border);
  background: var(--red-light);
  color: var(--ink);
}
.resume-picker-upload {
  border-style: dashed;
  color: var(--ink-3);
}
.resume-picker-upload:hover { color: var(--red); }

@media (max-width: 1100px) {
  .profile-page { width: min(92vw, 920px); padding-top: 1.3rem; }
  .profile-layout { grid-template-columns: 1fr; }
  .profile-layout > div:first-child .card-p {
    min-height: auto;
    position: static;
  }
  .grid-2 { grid-template-columns: 1fr; }
}
</style>
