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
              <div class="nav-avatar" style="width:52px;height:52px;font-size:1.3rem;margin-bottom:.5rem">李</div>
              <div style="font-size:.875rem;font-weight:700;color:var(--ink)">李同学</div>
            </div>
            <button v-for="item in navItems" :key="item.view"
              :class="['profile-nav-item', view===item.view && 'active']"
              @click="switchView(item.view)"
            ><i :class="['ti',item.icon]" />{{ item.label }}</button>
            <div class="divider" />
            <RouterLink class="profile-nav-item" to="/login"><i class="ti ti-logout" />退出登录</RouterLink>
          </div>
        </div>

        <!-- 右侧面板 -->
        <div>

          <!-- 我的资料 -->
          <template v-if="view==='info'">
            <div class="card card-p">
              <div class="panel-title"><i class="ti ti-user" />基本信息</div>
              <div class="grid-2">
                <div class="form-group"><label class="form-label">姓名</label><input class="form-control" v-model="form.name" /></div>
                <div class="form-group"><label class="form-label">学号</label><input class="form-control" :value="form.sid" readonly /></div>
                <div class="form-group"><label class="form-label">届次</label><input class="form-control" v-model="form.grade" /></div>
                <div class="form-group"><label class="form-label">学历</label>
                  <select class="form-control" v-model="form.degree">
                    <option>硕士研究生</option><option>本科</option><option>博士研究生</option>
                  </select>
                </div>
                <div class="form-group"><label class="form-label">联系邮箱</label><input class="form-control" v-model="form.email" /></div>
                <div class="form-group"><label class="form-label">手机号</label><input class="form-control" v-model="form.phone" placeholder="请填写手机号" /></div>
              </div>
              <div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:1rem">
                <button class="btn btn-secondary">取消</button>
                <button class="btn btn-primary" @click="toast.success('资料保存成功')"><i class="ti ti-check" />保存</button>
              </div>
            </div>
          </template>

          <!-- 我的简历 -->
          <template v-if="view==='resume'">
            <div class="card card-p">
              <div class="panel-title"><i class="ti ti-file-text" />我的简历</div>
              <div v-for="(r, index) in resumes" :key="r.name" class="resume-row">
                <div style="width:38px;height:38px;border-radius:var(--r-md);background:var(--red-light);border:1px solid var(--red-border);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--red);font-size:1rem">
                  <i :class="['ti', r.icon]" />
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font-size:.867rem;font-weight:500;color:var(--ink)">{{ r.name }}</div>
                  <div style="font-size:.733rem;color:var(--ink-2)">{{ r.size }}</div>
                </div>
                <div style="display:flex;gap:.3rem">
                  <button class="btn-icon btn" title="下载" @click="downloadResume(r)"><i class="ti ti-download" /></button>
                  <button class="btn-icon btn" title="删除" @click="deleteResume(index)"><i class="ti ti-trash" /></button>
                </div>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept=".pdf,image/*"
                style="display:none"
                @change="handleUpload"
              />
              <div class="upload-zone" style="margin-top:1rem" @click="fileInput?.click()">
                <i class="ti ti-cloud-upload" />
                <div class="uz-title">上传新简历</div>
                <div class="uz-hint">支持 PDF、图片格式，单文件不超过 5 MB</div>
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
              <div v-for="a in filteredApps" :key="a.title" class="app-row" @click="openJobDetail">
                <div class="job-logo" style="width:36px;height:36px">{{ a.abbr }}</div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:.45rem">
                    <span style="font-size:.867rem;font-weight:600;color:var(--ink)">{{ a.title }}</span>
                    <span v-if="isExpired(a.deadline)" style="font-size:.67rem;font-weight:600;color:#999;background:#f0f0f0;border-radius:999px;padding:.1rem .45rem;">已截止</span>
                  </div>
                  <div style="font-size:.773rem;color:var(--ink-2)">{{ a.company }}</div>
                </div>
                <div :title="isExpired(a.deadline) ? '已截止，不可修改' : '修改投递'">
                  <button class="btn-icon btn" :disabled="isExpired(a.deadline)"
                    :style="isExpired(a.deadline) ? 'opacity:.35;cursor:not-allowed' : ''"
                    @click.stop="!isExpired(a.deadline) && openEditApply(a)">
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
                  <button class="resume-picker-clear" @click="editAnswers[q.id]=null" title="取消选择"><i class="ti ti-x" /></button>
                </div>
                <div class="resume-picker-opts">
                  <div class="resume-picker-section-label">从我的简历选择</div>
                  <div v-for="r in resumes" :key="r.name"
                    class="resume-picker-item"
                    :class="{ selected: editAnswers[q.id]===r.name }"
                    @click="editAnswers[q.id]=r.name"
                  >
                    <i :class="['ti', r.icon]" />
                    <span>{{ r.name }}</span>
                    <i v-if="editAnswers[q.id]===r.name" class="ti ti-circle-check-filled" style="color:var(--red);margin-left:auto" />
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
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserNavbar from '@/components/UserNavbar.vue'
import AppToast from '@/components/AppToast.vue'
import { useToast } from '@/composables/useToast'

const router  = useRouter()
const route   = useRoute()
const toast   = useToast()

const validViews = ['info', 'resume', 'applications']
const view = ref(validViews.includes(route.query.tab) ? route.query.tab : 'info')
watch(() => route.query.tab, (t) => {
  view.value = validViews.includes(t) ? t : 'info'
})

function switchView(nextView) {
  if (!validViews.includes(nextView)) return
  router.push({ path: '/profile', query: { tab: nextView } })
}
function openJobDetail() {
  router.push({ path: '/job/1', query: { from: 'applications' } })
}

const activeTab = ref('all')
const navItems = [
  { view:'info',         label:'我的资料', icon:'ti-user-circle' },
  { view:'resume',       label:'我的简历', icon:'ti-file-text' },
  { view:'applications', label:'我的投递', icon:'ti-send' },
]
const form = ref({ name:'李同学', sid:'22110001', grade:'2025届', degree:'硕士研究生', email:'li2022@fudan.edu.cn', phone:'' })
const fileInput = ref(null)
const showDeleteModal = ref(false)
const deleteIndex = ref(null)

// 简历列表：只保留文件名、大小、图标，不显示更新时间
const resumes = ref([
  { name:'李同学_简历_2025.pdf',  size:'420 KB · PDF',  icon:'ti-file-type-pdf' },
  { name:'李同学_简历_封面.jpg',  size:'186 KB · 图片', icon:'ti-photo' },
])

const appTabs = [{ k:'all', label:'全部', n:3 }]
const apps = [
  { abbr:'新', title:'新媒体编辑记者（2025校招）', company:'新华社上海分社', status:'已投递', bc:'badge-green', date:'2025-05-20', k:'done',    deadline:'2026-12-31' },
  { abbr:'澎', title:'数据新闻记者', company:'澎湃新闻', status:'审核中', bc:'badge-amber', date:'2025-05-18', k:'pending', deadline:'2025-05-15' },
  { abbr:'腾', title:'内容运营实习生', company:'腾讯新闻', status:'草稿', bc:'badge-gray', date:'2025-05-16', k:'draft',   deadline:'2025-07-10' },
]

function isExpired(deadline) {
  if (!deadline) return false
  return new Date(deadline) < new Date(new Date().toDateString())
}
const filteredApps = computed(() => activeTab.value==='all' ? apps : apps.filter(a=>a.k===activeTab.value))

// ── 修改投递 ──
const showEditApply = ref(false)
const editingApp = ref(null)
const editAnswers = ref({})

const mockQuestions = [
  { id: 1001, title: '姓名',               type: 'TEXT',        required: true,  placeholder: '请填写真实姓名' },
  { id: 1002, title: '年级',               type: 'RADIO',       required: true,  options: ['2021级', '2022级', '2023级', '2024级'] },
  { id: 1003, title: '期望实习时长',       type: 'CHECKBOX',    required: true,  options: ['3个月以内', '3-6个月', '6个月以上'] },
  { id: 1004, title: '请简述您的相关经历', type: 'TEXTAREA',    required: true,  placeholder: '如：曾在XX媒体实习，负责……' },
  { id: 1005, title: '对该岗位最感兴趣的方向', type: 'TEXTAREA', required: false, placeholder: '简要说明' },
  { id: 1006, title: '个人简历',           type: 'FILE_UPLOAD', required: true },
]

const savedAnswers = {
  '新媒体编辑记者（2025校招）': { 1001: '李同学', 1002: '2023级', 1003: ['3-6个月'], 1004: '曾在复旦青年担任记者，负责深度报道。', 1005: '对融媒体内容策划最感兴趣。', 1006: '李同学_简历_2025.pdf' },
  '数据新闻记者':               { 1001: '李同学', 1002: '2023级', 1003: ['3个月以内'], 1004: '有数据新闻课程学习经历。', 1005: '数据可视化方向。', 1006: '李同学_简历_2025.pdf' },
  '内容运营实习生':             { 1001: '李同学', 1002: '2023级', 1003: ['3-6个月'], 1004: '参与过学院新媒体账号运营。', 1005: '用户增长运营。', 1006: '李同学_简历_封面.jpg' },
}

function openEditApply(app) {
  editingApp.value = app
  editAnswers.value = JSON.parse(JSON.stringify(savedAnswers[app.title] || {}))
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
function handleEditFile(qid, e) {
  const f = e.target.files?.[0]
  if (!f) return
  const ext = f.name.split('.').pop().toLowerCase()
  const imgExts = ['jpg','jpeg','png','gif','webp','heic']
  if (ext !== 'pdf' && !imgExts.includes(ext)) {
    toast.error('仅支持 PDF 或图片格式')
    return
  }
  if (f.size > 5 * 1024 * 1024) {
    toast.error('文件不能超过 5 MB')
    return
  }
  editAnswers.value[qid] = f.name
  toast.success('简历已更换：' + f.name)
}
function submitEditApply() {
  for (const q of mockQuestions) {
    if (!q.required) continue
    const v = editAnswers.value[q.id]
    if (!v || (Array.isArray(v) && v.length === 0)) {
      toast.error('请填写「' + q.title + '」')
      return
    }
  }
  if (editingApp.value) {
    savedAnswers[editingApp.value.title] = JSON.parse(JSON.stringify(editAnswers.value))
  }
  showEditApply.value = false
  toast.success('投递信息已更新')
}

function handleUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const ext = file.name.split('.').pop().toLowerCase()
  const imgExts = ['jpg','jpeg','png','gif','webp','heic']
  if (ext !== 'pdf' && !imgExts.includes(ext)) {
    toast.error('仅支持 PDF 或图片格式')
    e.target.value = ''
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.error('文件不能超过 5 MB')
    e.target.value = ''
    return
  }
  const isImg = imgExts.includes(ext)
  resumes.value.unshift({
    name: file.name,
    size: `${(file.size / 1024).toFixed(0)} KB · ${isImg ? '图片' : 'PDF'}`,
    icon: isImg ? 'ti-photo' : 'ti-file-type-pdf',
    file,
  })
  toast.success('简历上传成功')
  e.target.value = ''
}

function downloadResume(r) {
  if (!r.file) {
    toast.success('示例简历暂无可下载文件')
    return
  }
  const url = URL.createObjectURL(r.file)
  const a = document.createElement('a')
  a.href = url
  a.download = r.name
  a.click()
  URL.revokeObjectURL(url)
}

function deleteResume(index) {
  deleteIndex.value = index
  showDeleteModal.value = true
}
function confirmDeleteResume() {
  if (deleteIndex.value === null) return
  resumes.value.splice(deleteIndex.value, 1)
  toast.success('简历已删除')
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
