<template>
  <div>
    <AppToast />
    <!-- 管理员导航 -->
    <nav class="navbar">
      <!-- sidebar 区域：宽度与 --sidebar-w 对齐，品牌居中 -->
      <div class="navbar-brand-col">
        <RouterLink class="brand" to="/admin">
          <div class="brand-dot">
            <i class="ti ti-map-pin-filled" />
          </div>
          <div>
            <div class="brand-zh">复新生涯</div>
            <div class="brand-en">ADMIN CONSOLE</div>
          </div>
        </RouterLink>
      </div>
      <!-- main 区域：撑满剩余，右侧 padding 与 admin-main 对齐 -->
      <div class="navbar-main-col">
        <div class="nav-right">
          <div class="nav-avatar">张</div>
          <span style="font-size:.8rem;color:var(--ink-2)">张老师</span>
          <a href="#/login" class="btn btn-ghost btn-sm" @click.prevent="logoutUser"><i class="ti ti-logout" /></a>
        </div>
      </div>
    </nav>

    <div class="admin-layout">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <div class="sidebar-label">岗位管理</div>
        <button :class="['sidebar-link', v==='list'&&'active']" @click="v='list'"><i class="ti ti-list" />岗位列表</button>
        <button :class="['sidebar-link', v==='create'&&'active']" @click="v='create'"><i class="ti ti-plus" />新建岗位</button>
        <button :class="['sidebar-link', v==='drafts'&&'active']" @click="v='drafts'"><i class="ti ti-inbox" />草稿箱<span v-if="draftCount>0" class="sidebar-badge">{{ draftCount }}</span></button>
        <button :class="['sidebar-link', v==='resumes'&&'active']" @click="v='resumes'"><i class="ti ti-file-text" />简历管理</button>
      </aside>

      <main class="admin-main">

        <!-- ───── 岗位列表 ───── -->
        <div v-if="v==='list'">
          <div class="page-hd">
            <div><h1><i class="ti ti-list" />岗位列表</h1></div>
            <div class="page-hd-actions">
              <input ref="jobFile" type="file" accept="application/json,.json" hidden @change="createJobs" />
              <button class="btn btn-secondary btn-sm" @click="jobFile?.click()">
                <i class="ti ti-file-import" />批量导入 JSON
              </button>
            </div>
          </div>

          <!-- 工具栏 -->
          <div style="display:flex;align-items:center;gap:.625rem;margin-bottom:1.1rem;flex-wrap:wrap">
            <input class="form-control" style="flex:1;min-width:180px;padding:.5rem .875rem" v-model="sk" placeholder="搜索岗位名称、公司..." />
            <select class="form-control" style="min-width:110px;padding:.5rem .875rem" v-model="sf">
              <option value="">全部状态</option><option value="PUBLISHED">发布中</option><option value="OFFLINE">未发布</option><option value="EXPIRED">已截止</option>
            </select>
          </div>

          <!-- 批量操作栏 -->
          <div v-if="selected.length" style="display:flex;align-items:center;gap:.5rem;padding:.55rem .875rem;background:var(--red-light);border:1px solid var(--red-border);border-radius:var(--r-md);margin-bottom:.875rem;font-size:.8rem;color:var(--red);flex-wrap:wrap">
            已选 {{ selected.length }} 条 &nbsp;·&nbsp;
            <button v-if="publishableCount>0" class="btn btn-secondary btn-sm" @click="bulkPublish"><i class="ti ti-send" />发布（{{ publishableCount }} 条）</button>
            <button v-if="offlinableCount>0" class="btn btn-secondary btn-sm" @click="bulkOffline"><i class="ti ti-send-off" />停止发布（{{ offlinableCount }} 条）</button>
            <button v-if="recableCount>0" class="btn btn-secondary btn-sm" @click="bulkRec(true)"><i class="ti ti-star" />批量设为推荐</button>
            <button v-if="recableCount>0" class="btn btn-secondary btn-sm" @click="bulkRec(false)"><i class="ti ti-star-off" />取消推荐</button>
            <button class="btn btn-red-soft btn-sm" @click="bulkDelete"><i class="ti ti-trash" />批量删除</button>
          </div>

          <!-- 表格 -->
          <div class="card" style="overflow:hidden">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="col-check"><input type="checkbox" :checked="filteredJobs.length>0 && filteredJobs.every(j=>selected.includes(j.id))" @change="e=>toggleAll(e.target.checked)" /></th>
                  <th>岗位名称</th><th>公司</th><th>城市</th><th>截止</th><th>状态</th><th>投递数</th><th>推荐</th><th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="j in filteredJobs" :key="j.id">
                  <td class="col-check"><input type="checkbox" :checked="selected.includes(j.id)" @change="toggleSel(j.id)" /></td>
                  <td><span style="font-weight:500;cursor:pointer;color:var(--ink)" @click="openEdit(j)">{{ j.positionName }}</span></td>
                  <td>{{ j.companyName }}</td>
                  <td>{{ j.workCity }}</td>
                  <td>{{ j.workEndDate }}</td>
                  <td><span :class="['badge', STATUS_CLASS[j.status]]">{{ STATUS_LABEL[j.status] }}</span></td>
                  <td>
                    <span v-if="j.sourceUrl" class="badge badge-gray" style="font-size:.72rem;gap:3px"><i class="ti ti-external-link" style="font-size:9px" />外部投递</span>
                    <span v-else>{{ j.apps ?? 0 }}</span>
                  </td>
                  <td><span v-if="j.status==='PUBLISHED'" :class="['rec-toggle', j.recommended&&'on']" @click="toggleRec(j)"><i :class="['ti', j.recommended?'ti-star-filled':'ti-star']" />{{ j.recommended?'推荐中':'设为推荐' }}</span><span v-else style="color:var(--ink-4);font-size:.78rem">—</span></td>
                  <td>
                    <div class="tbl-acts">
                      <div class="tbl-btn" @click="openEdit(j)"><span class="tbl-tip">编辑</span><i class="ti ti-edit" /></div>
                      <div v-if="j.status==='OFFLINE'" class="tbl-btn approve" @click="publish(j)"><span class="tbl-tip">发布上线</span><i class="ti ti-send" /></div>
                      <div v-else-if="j.status==='PUBLISHED'" class="tbl-btn" @click="unpublishJob(j)"><span class="tbl-tip">停止发布</span><i class="ti ti-send-off" /></div>
                      <div v-if="j.status!=='OFFLINE'" class="tbl-btn" @click="goJobResumes(j)"><span class="tbl-tip">查看简历</span><i class="ti ti-file-text" /></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination" style="margin-top:.875rem">
            <span style="font-size:.773rem;color:var(--ink-3);margin-right:auto">当前显示 {{ jobs.length }} 条</span>
          </div>
        </div>

        <!-- ───── 新建/编辑岗位 ───── -->
        <div v-if="v==='create'">
          <div class="page-hd">
            <div>
              <h1><i :class="editingId?'ti ti-edit':'ti ti-plus'" />{{ editingId ? '编辑岗位' : '新建岗位' }}</h1>
              
            </div>
          </div>

          <div class="card card-p" style="margin-bottom:1rem">
            <div class="form-section-title">智能识别岗位</div>
            <textarea
              class="form-control"
              style="min-height:150px"
              v-model="jobText"
              placeholder="粘贴完整岗位描述，系统会识别并填充下方标准字段…"
            />
            <div style="display:flex;align-items:center;gap:.5rem;margin-top:.75rem;flex-wrap:wrap">
              <button class="btn btn-secondary" :disabled="structuringJob" @click="structureJob">
                <i class="ti ti-wand" />{{ structuringJob ? '正在识别…' : '智能识别并填充' }}
              </button>
              <span v-if="structuredJobs.length" style="font-size:.78rem;color:var(--ink-2)">
                已识别 {{ structuredJobs.length }} 个岗位，结果不会自动保存或发布
              </span>
            </div>
            <div v-if="structuredJobs.length>1" style="display:flex;gap:.4rem;margin-top:.75rem;flex-wrap:wrap">
              <button v-for="(readJob,readIndex) in structuredJobs" :key="readIndex"
                :class="['btn','btn-sm',structuredIndex===readIndex?'btn-primary':'btn-secondary']"
                @click="selectJob(readIndex)">
                {{ readJob.positionName || `岗位 ${readIndex + 1}` }}
              </button>
            </div>
            <div v-if="structureWarnings.length" style="font-size:.75rem;color:var(--gold-dark);margin-top:.75rem">
              <div v-for="(readWarning,readIndex) in structureWarnings" :key="readIndex">
                <i class="ti ti-alert-triangle" /> {{ readWarning }}
              </div>
            </div>
          </div>

          <div class="card card-p" style="margin-bottom:1rem">
            <div class="form-section-title">基本信息</div>
            <div class="grid-2">
              <div class="form-group"><label class="form-label">岗位名称 <span class="req">*</span></label>
                <input class="form-control" v-model="nj.positionName" placeholder="如：新媒体编辑记者（2025校招）" />
              </div>
              <div class="form-group"><label class="form-label">所属公司 <span class="req">*</span></label>
                <input class="form-control" v-model="nj.companyName" placeholder="公司全称" />
              </div>
              <div class="form-group"><label class="form-label">所属部门</label>
                <input class="form-control" v-model="nj.department" placeholder="如：新媒体中心" />
              </div>
              <div class="form-group"><label class="form-label">招聘人数</label>
                <input class="form-control" type="number" min="1" v-model.number="nj.headcount" placeholder="若干" />
              </div>
              <div class="form-group"><label class="form-label">岗位大类 <span class="req">*</span></label>
                <select class="form-control" v-model="nj.jobCategory" @change="nj.jobSubCategory=''">
                  <option value="">请选择</option>
                  <option value="ACADEMIC">学术教职</option>
                  <option value="GOVERNMENT">党政机关</option>
                  <option value="MEDIA">新闻媒体</option>
                  <option value="ENTERPRISE">企业公司</option>
                  <option value="OTHER">其他</option>
                </select>
              </div>
              <div class="form-group"><label class="form-label">岗位小类</label>
                <select class="form-control" v-model="nj.jobSubCategory" :disabled="!nj.jobCategory">
                  <option value="">请选择</option>
                  <template v-if="nj.jobCategory==='ACADEMIC'">
                    <option value="FURTHER_STUDY">升学深造</option>
                    <option value="TEACHING_POSITION">考取教职</option>
                    <option value="MIDDLE_SCHOOL_TEACHER">中学教师</option>
                  </template>
                  <template v-else-if="nj.jobCategory==='GOVERNMENT'">
                    <option value="SELECTED_GRADUATE">选调生</option>
                    <option value="CIVIL_SERVANT">公务员</option>
                    <option value="UNIVERSITY_ADMIN">高校行政</option>
                    <option value="HOSPITAL">医院</option>
                    <option value="BANK">银行</option>
                    <option value="OTHER_PUBLIC_INSTITUTION">其他事业单位</option>
                  </template>
                  <template v-else-if="nj.jobCategory==='MEDIA'">
                    <option value="CENTRAL_MEDIA">党报央媒</option>
                    <option value="REGIONAL_MEDIA">地区主流媒体</option>
                    <option value="OTHER_MEDIA">其他媒体机构</option>
                    <option value="SELF_MEDIA">自媒体</option>
                  </template>
                  <template v-else-if="nj.jobCategory==='ENTERPRISE'">
                    <option value="STATE_OWNED">国央企</option>
                    <option value="PRIVATE_ENTERPRISE">民企</option>
                    <option value="FOREIGN_ENTERPRISE">外企</option>
                  </template>
                  <option v-else value="OTHER">其他</option>
                </select>
              </div>
              <div class="form-group"><label class="form-label">招聘类型</label>
                <select class="form-control" v-model="nj.recruitType">
                  <option value="">请选择</option>
                  <option value="BIG_INTERNSHIP">大实习</option>
                  <option value="SMALL_INTERNSHIP">小实习</option>
                  <option value="DAILY_INTERNSHIP">日常实习</option>
                  <option value="CAMPUS_RECRUITMENT">应届生招聘</option>
                  <option value="CAMPUS_SCREENING">应届生摸排</option>
                  <option value="OTHER">其他</option>
                </select>
              </div>
              <div class="form-group"><label class="form-label">学历要求</label>
                <select class="form-control" v-model="nj.reqEduLevel">
                  <option value="">不限</option>
                  <option value="BACHELOR">本科生</option>
                  <option value="ACADEMIC_MASTER">学术硕士研究生</option>
                  <option value="PROFESSIONAL_MASTER">专业硕士研究生</option>
                  <option value="DOCTORATE">博士研究生</option>
                </select>
              </div>
            </div>
          </div>

          <div class="card card-p" style="margin-bottom:1rem">
            <div class="form-section-title">工作安排</div>
            <div class="grid-2">
              <div class="form-group"><label class="form-label">开始日期</label>
                <input class="form-control" type="date" v-model="nj.workStartDate" />
              </div>
              <div class="form-group"><label class="form-label">截止日期</label>
                <input class="form-control" type="date" v-model="nj.workEndDate" />
              </div>
              <div class="form-group"><label class="form-label">工作省份</label>
                <input class="form-control" v-model="nj.workProvince" placeholder="如：上海市" />
              </div>
              <div class="form-group"><label class="form-label">工作城市</label>
                <input class="form-control" v-model="nj.workCity" placeholder="如：上海" />
              </div>
              <div class="form-group span-2"><label class="form-label">详细地点</label>
                <input class="form-control" v-model="nj.workLocation" placeholder="如：徐汇区某路某号" />
              </div>
              <div class="form-group"><label class="form-label">工作形式</label>
                <select class="form-control" v-model="nj.workMode">
                  <option value="">不限</option>
                  <option value="ONLINE">线上</option>
                  <option value="OFFLINE">线下</option>
                  <option value="HYBRID">线上线下均可</option>
                </select>
              </div>
              <div class="form-group"><label class="form-label">每周天数（区间）</label>
                <select class="form-control" v-model="nj.workDurationType">
                  <option value="">不限</option>
                  <option value="ONE_TO_TWO_DAYS">一周1-2天</option>
                  <option value="THREE_TO_FOUR_DAYS">一周3-4天</option>
                  <option value="FIVE_DAYS">一周5天</option>
                </select>
              </div>
              <div class="form-group"><label class="form-label">每周具体天数</label>
                <input class="form-control" type="number" min="1" max="7" v-model.number="nj.workDaysPerWeek" placeholder="如：3" />
              </div>
              <div class="form-group"><label class="form-label">实习时长</label>
                <select class="form-control" v-model="nj.workPeriodType">
                  <option value="">不限</option>
                  <option value="LESS_THAN_THREE_MONTHS">3个月以内</option>
                  <option value="THREE_TO_SIX_MONTHS">3-6个月</option>
                  <option value="MORE_THAN_SIX_MONTHS">6个月以上</option>
                </select>
              </div>
              <div class="form-group"><label class="form-label">薪资下限（元/天）</label>
                <input class="form-control" type="number" min="0" v-model.number="nj.salaryMin" placeholder="如：200" />
              </div>
              <div class="form-group"><label class="form-label">薪资上限（元/天）</label>
                <input class="form-control" type="number" min="0" v-model.number="nj.salaryMax" placeholder="如：400" />
              </div>
              <div class="form-group span-2"><label class="form-label">薪资展示文字</label>
                <input class="form-control" v-model="nj.salaryDisplay" placeholder="如：面议、200-400元/天，留空则自动生成" />
                <div style="font-size:.75rem;color:var(--ink-3);margin-top:.3rem"><i class="ti ti-info-circle" style="vertical-align:-1px" /> 填写后优先展示此文字，不填则由薪资上下限自动生成</div>
              </div>
            </div>
          </div>

          <div class="card card-p" style="margin-bottom:1rem">
            <div class="form-section-title">岗位详情</div>
            <div class="grid-2">
              <div class="form-group span-2"><label class="form-label">岗位描述 <span class="req">*</span></label>
                <textarea class="form-control" style="min-height:120px" v-model="nj.jobDesc" placeholder="描述岗位职责、日常工作内容等..." />
              </div>
              <div class="form-group"><label class="form-label">专业要求</label>
                <input class="form-control" v-model="nj.reqMajor" placeholder="如：新闻传播学、中文、汉语言文学" />
              </div>
              <div class="form-group"><label class="form-label">毕业年份要求</label>
                <input class="form-control" v-model="nj.reqGradYear" placeholder="如：2025、2025-2026" />
              </div>
              <div class="form-group span-2"><label class="form-label">技能要求</label>
                <input class="form-control" v-model="nj.reqSkills" placeholder="如：熟练使用 Premiere、有校媒经历优先" />
              </div>
              <div class="form-group span-2"><label class="form-label">其他要求</label>
                <textarea class="form-control" style="min-height:72px" v-model="nj.reqOther" placeholder="其他补充说明..." />
              </div>
            </div>
          </div>

          <!-- 投递设置 -->
          <div class="card card-p" style="margin-bottom:1rem">
            <div class="form-section-title">投递设置</div>

            <!-- 投递方式切换 -->
            <div style="display:flex;gap:.75rem;margin-bottom:1.25rem">
              <div class="mode-btn" :class="{active: deliveryMode==='internal'}" @click="deliveryMode='internal'; nj.sourceUrl=''">
                <i class="ti ti-inbox" />
                <div>
                  <div style="font-weight:600;font-size:.83rem">平台内投递</div>
                  <div style="font-size:.73rem;color:var(--ink-3);margin-top:2px">学生在平台填写问卷投递，可统计投递数</div>
                </div>
              </div>
              <div class="mode-btn" :class="{active: deliveryMode==='external'}" @click="deliveryMode='external'; nj.questions=[]">
                <i class="ti ti-external-link" />
                <div>
                  <div style="font-weight:600;font-size:.83rem">外部链接投递</div>
                  <div style="font-size:.73rem;color:var(--ink-3);margin-top:2px">学生点击跳转官网，无法统计投递数</div>
                </div>
              </div>
            </div>

            <!-- 外部链接模式 -->
            <div v-if="deliveryMode==='external'" class="form-group">
              <label class="form-label">官网投递链接 <span class="req">*</span></label>
              <input class="form-control" type="url" v-model="nj.sourceUrl" placeholder="https://..." />
              <div style="font-size:.75rem;color:var(--ink-3);margin-top:.3rem"><i class="ti ti-info-circle" style="vertical-align:-1px" /> 填写后「投递数」列将显示「外部投递」标签</div>
            </div>

            <!-- 平台内投递：问卷编辑器 -->
            <div v-else>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
                <div style="font-size:.8rem;font-weight:600;color:var(--ink-2)">投递问卷题目</div>
                <button class="btn btn-secondary btn-sm" @click="addQuestion"><i class="ti ti-plus" />添加题目</button>
              </div>

              <div v-if="nj.questions.length===0" style="text-align:center;padding:2rem;color:var(--ink-3);font-size:.8rem;border:1.5px dashed var(--border-mid);border-radius:var(--r-md)">
                <i class="ti ti-forms" style="font-size:1.5rem;display:block;margin-bottom:.4rem"></i>
                <span>暂无题目，点击「添加题目」开始设计投递问卷</span>
              </div>

              <div v-for="(q, qi) in nj.questions" :key="qi" class="q-card">
                <div class="q-card-head">
                  <span class="q-index">{{ qi + 1 }}</span>
                  <div style="flex:1;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
                    <input class="form-control" style="flex:1;min-width:160px" v-model="q.title" placeholder="题目标题" />
                    <select class="form-control" style="width:130px;flex-shrink:0" v-model="q.questionType" @change="q.options=q.questionType==='RADIO'||q.questionType==='CHECKBOX'?['']:[]">
                      <option value="TEXT">单行文本</option>
                      <option value="TEXTAREA">多行文本</option>
                      <option value="RADIO">单选</option>
                      <option value="CHECKBOX">多选</option>
                      <option value="FILE_UPLOAD">文件上传</option>
                    </select>
                    <label style="display:flex;align-items:center;gap:.3rem;font-size:.78rem;color:var(--ink-2);cursor:pointer;white-space:nowrap">
                      <input type="checkbox" v-model="q.required" style="accent-color:var(--red)" /> 必填
                    </label>
                  </div>
                  <div style="display:flex;gap:4px;flex-shrink:0">
                    <button class="icon-btn" :disabled="qi===0" @click="moveQ(qi,-1)"><i class="ti ti-chevron-up" /></button>
                    <button class="icon-btn" :disabled="qi===nj.questions.length-1" @click="moveQ(qi,1)"><i class="ti ti-chevron-down" /></button>
                    <button class="icon-btn danger" @click="nj.questions.splice(qi,1)"><i class="ti ti-trash" /></button>
                  </div>
                </div>

                <div v-if="q.questionType==='TEXT'||q.questionType==='TEXTAREA'" style="margin-top:.5rem">
                  <input class="form-control" v-model="q.placeholder" placeholder="输入提示文字（可选）" style="font-size:.8rem" />
                </div>

                <div v-if="q.questionType==='RADIO'||q.questionType==='CHECKBOX'" style="margin-top:.6rem">
                  <div v-for="(opt, oi) in q.options" :key="oi" style="display:flex;gap:.4rem;align-items:center;margin-bottom:.35rem">
                    <i :class="q.questionType==='RADIO'?'ti ti-circle':'ti ti-checkbox'" style="color:var(--ink-3);font-size:13px;flex-shrink:0" />
                    <input class="form-control" style="font-size:.8rem" v-model="q.options[oi]" :placeholder="`选项 ${oi+1}`" />
                    <button class="icon-btn danger" style="width:24px;height:24px;font-size:11px" @click="q.options.splice(oi,1)" :disabled="q.options.length<=1"><i class="ti ti-x" /></button>
                  </div>
                  <button class="btn btn-secondary btn-sm" style="font-size:.75rem;padding:.25rem .6rem;margin-top:.2rem" @click="q.options.push('')"><i class="ti ti-plus" />添加选项</button>
                </div>

                <div v-if="q.questionType==='FILE_UPLOAD'" style="margin-top:.5rem;font-size:.75rem;color:var(--ink-3)">
                  <i class="ti ti-info-circle" style="vertical-align:-1px" /> 学生将上传文件（如简历 PDF），后台可下载
                </div>
              </div>
            </div>
          </div>

          <div class="card card-p">
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:.5rem">
              <button class="btn btn-secondary btn-sm" @click="v='list'; resetForm()">取消</button>
              <button class="btn btn-secondary btn-sm" @click="saveDraft"><i class="ti ti-device-floppy" />保存草稿</button>
              <button class="btn btn-primary btn-sm" @click="publishJob"><i class="ti ti-send" />发布上线</button>
            </div>
          </div>
        </div>

        <!-- ───── 草稿箱 ───── -->
        <div v-if="v==='drafts'">
          <div class="page-hd">
            <div><h1><i class="ti ti-inbox" />草稿箱</h1></div>
          </div>
          <div v-if="draftJobs.length===0" style="text-align:center;padding:3rem;color:var(--ink-3);font-size:.86rem">
            <i class="ti ti-inbox" style="font-size:2rem;display:block;margin-bottom:.5rem" />暂无草稿
          </div>
          <template v-else>
            <!-- 批量操作栏 -->
            <div v-if="draftSelected.length" style="display:flex;align-items:center;gap:.5rem;padding:.55rem .875rem;background:var(--red-light);border:1px solid var(--red-border);border-radius:var(--r-md);margin-bottom:.875rem;font-size:.8rem;color:var(--red);flex-wrap:wrap">
              已选 {{ draftSelected.length }} 条 &nbsp;·&nbsp;
              <button class="btn btn-secondary btn-sm" @click="draftBulkPublish"><i class="ti ti-player-play" />批量发布上线</button>
              <button class="btn btn-red-soft btn-sm" @click="draftBulkDelete"><i class="ti ti-trash" />批量删除</button>
            </div>
            <div class="card" style="overflow:hidden">
              <table class="data-table">
                <thead>
                  <tr>
                    <th class="col-check"><input type="checkbox" :checked="draftJobs.length>0 && draftJobs.every(j=>draftSelected.includes(j.id))" @change="e=>draftToggleAll(e.target.checked)" /></th>
                    <th>岗位名称</th><th>公司</th><th>城市</th><th>截止</th><th>来源</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="j in draftJobs" :key="j.id">
                    <td class="col-check"><input type="checkbox" :checked="draftSelected.includes(j.id)" @change="draftToggleSel(j.id)" /></td>
                    <td><span style="font-weight:500;color:var(--ink)">{{ j.positionName }}</span></td>
                    <td>{{ j.companyName }}</td>
                    <td>{{ j.workCity }}</td>
                    <td>{{ j.workEndDate || '—' }}</td>
                    <td>
                      <span v-if="j.sourceType==='CRAWL'" class="badge" style="background:var(--blue-bg,#eaf0fb);color:var(--blue,#1b4f9c);gap:3px;font-size:.7rem"><i class="ti ti-robot" style="font-size:9px" />自动导入</span>
                      <span v-else class="badge badge-gray" style="font-size:.7rem">手动录入</span>
                    </td>
                    <td>
                      <div class="tbl-acts">
                        <div class="tbl-btn" @click="openEdit(j)"><span class="tbl-tip">继续编辑</span><i class="ti ti-edit" /></div>
                        <div class="tbl-btn approve" @click="publish(j)"><span class="tbl-tip">发布上线</span><i class="ti ti-send" /></div>
                        <div class="tbl-btn danger" @click="bulkDelete([j.id])"><span class="tbl-tip">删除草稿</span><i class="ti ti-trash" /></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>

        <!-- ───── 简历管理：岗位列表 ───── -->
        <div v-if="v==='resumes'">
          <div class="page-hd">
            <div><h1><i class="ti ti-file-text" />简历管理</h1></div>
          </div>

          <div class="card" style="overflow:hidden">
            <div
              v-for="jg in jobGroups" :key="jg.jobId"
              class="jrc-row"
              @click="openJobResumes(jg)"
            >
              <div class="jrc-row-icon"><i class="ti ti-building-skyscraper" /></div>
              <div class="jrc-row-main">
                <div class="jrc-row-title">{{ jg.title }}</div>
                <div class="jrc-row-sub">{{ jg.company }}</div>
              </div>
              <div class="jrc-row-meta">
                <span class="badge badge-green" style="font-size:.7rem">发布中</span>
                <span style="font-size:.75rem;color:var(--ink-3)">截止 {{ jg.dl }}</span>
              </div>
              <div class="jrc-row-count">
                <span class="jrc-count-num">{{ jg.applicationCount }}</span>
                <span class="jrc-count-label">份投递</span>
              </div>
              <i class="ti ti-chevron-right" style="color:var(--ink-4);font-size:1rem;flex-shrink:0" />
            </div>
          </div>
        </div>

        <!-- ───── 简历管理：某岗位问卷列表 ───── -->
        <div v-if="v==='resumeDetail'">
          <div class="page-hd">
            <div>
              <h1><i class="ti ti-clipboard-list" />{{ currentJobGroup?.title }}</h1>
            </div>
            <div class="page-hd-actions">
              <button class="btn btn-secondary btn-sm" @click="v='resumes'; resumeSel=[]"><i class="ti ti-arrow-left" />返回</button>
              <div class="export-dropdown" :class="{open: exportMenuOpen}">
                <button class="btn btn-primary btn-sm" @click.stop="exportMenuOpen=!exportMenuOpen">
                  <i class="ti ti-package-export" />导出
                  <i class="ti ti-chevron-down" style="font-size:11px;margin-left:2px" />
                </button>
                <div class="export-menu" @click.stop>
                  <div class="export-menu-item" @click="exportData('csv'); exportMenuOpen=false">
                    <i class="ti ti-table-export" />仅导出问卷数据
                    <span>CSV（Excel 可打开）</span>
                  </div>
                  <div class="export-menu-item" @click="exportData('zip'); exportMenuOpen=false">
                    <i class="ti ti-package-export" />导出问卷 + 简历
                    <span>ZIP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 批量操作条 -->
          <div v-if="resumeSel.length" style="display:flex;align-items:center;gap:.5rem;padding:.55rem .875rem;background:var(--red-light);border:1px solid var(--red-border);border-radius:var(--r-md);margin-bottom:.875rem;font-size:.8rem;color:var(--red);flex-wrap:wrap">
            已选 {{ resumeSel.length }} 份 &nbsp;·&nbsp;
            <div class="export-dropdown" :class="{open: exportMenuOpen2}">
              <button class="btn btn-secondary btn-sm" @click.stop="exportMenuOpen2=!exportMenuOpen2">
                <i class="ti ti-package-export" />导出所选
                <i class="ti ti-chevron-down" style="font-size:11px;margin-left:2px" />
              </button>
              <div class="export-menu" @click.stop>
                <div class="export-menu-item" @click="exportData('csv'); exportMenuOpen2=false">
                  <i class="ti ti-table-export" />仅导出问卷数据<span>CSV（Excel 可打开）</span>
                </div>
                <div class="export-menu-divider" />
                <div class="export-menu-item" @click="exportData('zip'); exportMenuOpen2=false">
                  <i class="ti ti-package-export" />导出问卷 + 简历<span>ZIP</span>
                </div>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" @click="reviewAnswers(true)">全部待审核通过</button>
            <button class="btn btn-secondary btn-sm" @click="reviewAnswers(false)">全部待审核不通过</button>
            <button class="btn btn-secondary btn-sm" @click="resumeSel=[]">取消选择</button>
          </div>

          <div class="card" style="overflow:hidden">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="col-check">
                    <input type="checkbox"
                      :checked="currentJobGroup?.resumes.length>0 && resumeSel.length===currentJobGroup.resumes.length"
                      @change="e=>resumeSel=e.target.checked?currentJobGroup.resumes.map(r=>r.id):[]" />
                  </th>
                  <th>学生姓名</th>
                  <th>学号</th>
                  <th>投递时间</th>
                  <th>问卷详情</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="r in currentJobGroup?.resumes" :key="r.id">
                  <tr :class="expandedRow===r.id?'row-expanded':''">
                    <td class="col-check">
                      <input type="checkbox"
                        :checked="resumeSel.includes(r.id)"
                        @change="toggleResumeSel(r.id)" />
                    </td>
                    <td style="font-weight:600">
                      <div style="display:flex;align-items:center;gap:.4rem">
                        {{ r.name }}

                      </div>
                    </td>
                    <td style="color:var(--ink-2);font-size:.773rem;font-family:monospace">{{ r.sid }}</td>
                    <td style="color:var(--ink-2);font-size:.8rem">
                      <div>{{ r.date }}</div>

                    </td>
                    <td>
                      <button class="btn btn-ghost btn-sm" style="font-size:.78rem" @click="expandedRow=expandedRow===r.id?null:r.id">
                        <i :class="['ti', expandedRow===r.id?'ti-chevron-up':'ti-chevron-down']" />
                        {{ expandedRow===r.id?'收起':'查看问卷' }}
                      </button>
                    </td>
                    <td>
                      <div class="tbl-acts">
                        <button v-if="r.submissionStatus==='SUBMITTED'" class="btn btn-ghost btn-sm" @click="reviewAnswer(r,true)">通过</button>
                        <button v-if="r.submissionStatus==='SUBMITTED'" class="btn btn-ghost btn-sm" @click="reviewAnswer(r,false)">不通过</button>
                        <span v-else class="badge badge-gray">{{ r.statusLabel }}</span>
                      </div>
                    </td>
                  </tr>
                  <!-- 展开问卷详情 -->
                  <tr v-if="expandedRow===r.id" class="detail-row">
                    <td colspan="6">
                      <div class="questionnaire-detail">
                        <div class="qd-title"><i class="ti ti-clipboard-list" />问卷填写内容</div>
                        <div style="font-size:.78rem;color:var(--ink-2);margin-bottom:.75rem">
                          状态：{{ r.statusLabel || r.submissionStatus }}
                          <template v-if="r.reviewedAt">
                            · 结果：{{ r.reviewPassed ? '通过' : '不通过' }}
                            · 时间：{{ r.reviewedAt.replace('T', ' ').slice(0, 16) }}
                            · 意见：{{ r.reviewComments || '无' }}
                          </template>
                        </div>
                        <div class="qd-grid">
                          <div
                            v-for="qa in parseAnswers(currentJobGroup.questions, r.answers)"
                            :key="qa.id"
                            :class="['qd-item', (qa.questionType==='TEXTAREA'||qa.questionType==='FILE_UPLOAD') ? 'qd-item-wide' : '']"
                          >
                            <div class="qd-q">
                              {{ qa.title }}
                              <span v-if="qa.required" style="color:var(--red);margin-left:2px">*</span>
                            </div>

                            <!-- TEXT：单行文本 -->
                            <div v-if="qa.questionType==='TEXT'" class="qd-a">
                              {{ qa.value ?? '（未作答）' }}
                            </div>

                            <!-- TEXTAREA：多行文本 -->
                            <div v-else-if="qa.questionType==='TEXTAREA'" class="qd-a" style="white-space:pre-wrap">
                              {{ qa.value ?? '（未作答）' }}
                            </div>

                            <!-- RADIO：单选，高亮选中项 -->
                            <div v-else-if="qa.questionType==='RADIO'" style="display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.4rem">
                              <span
                                v-for="opt in qa.options" :key="opt"
                                :class="['qd-option', qa.value===opt ? 'qd-option-selected' : '']"
                              >{{ opt }}</span>
                              <span v-if="!qa.value" style="font-size:.78rem;color:var(--ink-3)">（未作答）</span>
                            </div>

                            <!-- CHECKBOX：多选，高亮选中的 -->
                            <div v-else-if="qa.questionType==='CHECKBOX'" style="display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.4rem">
                              <span
                                v-for="opt in qa.options" :key="opt"
                                :class="['qd-option', qa.value&&qa.value.split(',').map(s=>s.trim()).includes(opt) ? 'qd-option-selected' : '']"
                              >{{ opt }}</span>
                              <span v-if="!qa.value" style="font-size:.78rem;color:var(--ink-3)">（未作答）</span>
                            </div>

                            <!-- FILE_UPLOAD：文件下载链接 -->
                            <div v-else-if="qa.questionType==='FILE_UPLOAD'" style="margin-top:.4rem">
                              <span v-if="qa.value" class="qd-file-link">
                                <i class="ti ti-file-type-pdf" />
                                文件 ID {{ qa.value }}（请通过 ZIP 导出）
                              </span>
                              <span v-else style="font-size:.78rem;color:var(--ink-3)">（未上传）</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>

    <!-- ── 确认弹窗 ── -->
    <div v-if="show_confirm" class="modal-mask" @click.self="cancelConfirm">
      <div class="modal-box">
        <div class="modal-icon"><i class="ti ti-alert-triangle" /></div>
        <div class="modal-msg">{{ confirm_msg }}</div>
        <div class="modal-actions">
          <button class="btn btn-secondary btn-sm" @click="cancelConfirm">取消</button>
          <button class="btn btn-primary btn-sm" @click="doConfirm">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppToast from '@/components/AppToast.vue'
import { useToast } from '@/composables/useToast'
import { logoutUser } from '@/lib/auth'
import { downloadFile as downloadBlob, readJson } from '@/lib/api'

const toast = useToast()
const v     = ref('list')
const sk    = ref('')
const sf    = ref('')
const selected     = ref([])
const draftSelected = ref([])
const jobFile = ref(null)

// 通用确认弹窗
const show_confirm = ref(false)
const confirm_msg  = ref('')
const confirm_cb   = ref(null)
function doConfirm() { confirm_cb.value?.(); show_confirm.value = false }
function cancelConfirm() { show_confirm.value = false }


const jobs = ref([])
const STATUS_LABEL = { PUBLISHED:'发布中', OFFLINE:'未发布', EXPIRED:'已截止' }
const STATUS_CLASS = { PUBLISHED:'badge-green', OFFLINE:'badge-gray', EXPIRED:'badge-amber' }
const STATUS_ORDER = { PUBLISHED:0, OFFLINE:1, EXPIRED:2 }

async function loadJobs() {
  try {
    const readPage = await readJson('/admin/job-post/list?page=1&size=100')
    jobs.value = (readPage?.list || []).map(readJob => ({
      ...readJob,
      apps: readJob.applicationCount ?? 0,
      publishedAt: (readJob.createdAt || '').slice(0, 10),
    }))
  } catch (readError) {
    jobs.value = []
    toast.error(readError?.message || '加载岗位失败')
  }
}

async function createJobs(readEvent) {
  const readFile = readEvent.target.files?.[0]
  if (!readFile) return
  try {
    const createRequests = JSON.parse(await readFile.text())
    if (!Array.isArray(createRequests) || createRequests.length === 0) throw new Error('请提供非空 JSON 数组')
    await readJson('/admin/job-post/batch', {
      method:'POST', body:JSON.stringify(createRequests),
    })
    await loadJobs()
    toast.success(`已导入 ${createRequests.length} 条岗位`)
  } catch (readError) {
    toast.error(readError?.message || '批量导入失败')
  } finally {
    readEvent.target.value = ''
  }
}

function buildJobRequest(readJob, updateStatus = readJob.status) {
  const readKeys = [
    'sourceType', 'sourceUrl', 'companyName', 'department', 'positionName',
    'jobCategory', 'jobSubCategory', 'recruitType', 'headcount',
    'workStartDate', 'workEndDate', 'workDaysPerWeek', 'workDurationType',
    'workPeriodType', 'workMode', 'workCity', 'workProvince', 'workLocation',
    'salaryMin', 'salaryMax', 'salaryDisplay', 'jobDesc', 'reqEduLevel',
    'reqMajor', 'reqGradYear', 'reqSkills', 'reqOther', 'recommended',
  ]
  const createRequest = Object.fromEntries(readKeys.map(readKey => [
    readKey, readJob[readKey] === '' ? null : readJob[readKey],
  ]))
  createRequest.status = updateStatus
  return createRequest
}
const filteredJobs = computed(() =>
  jobs.value
    .filter(j =>
      (!sk.value || j.positionName.includes(sk.value) || j.companyName.includes(sk.value)) &&
      (!sf.value || j.status === sf.value)
    )
    .slice()
    .sort((a, b) => {
      const sd = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
      if (sd !== 0) return sd
      return (b.publishedAt || '').localeCompare(a.publishedAt || '')
    })
)
const draftJobs   = computed(() => jobs.value.filter(j => j.status === 'OFFLINE'))
const onlineCount = computed(() => jobs.value.filter(j => j.status === 'PUBLISHED').length)
const draftCount  = computed(() => draftJobs.value.length)

function toggleAll(c) { selected.value = c ? filteredJobs.value.map(j=>j.id) : [] }
function toggleSel(id) { selected.value.includes(id) ? selected.value = selected.value.filter(i=>i!==id) : selected.value.push(id) }
async function toggleRec(updateJob) {
  const updateRecommended = !updateJob.recommended
  await updateJobPost(updateJob, { recommended:updateRecommended })
  toast.success(updateRecommended ? '已设为推荐' : '已取消推荐')
}
async function publish(updateJob) {
  await updateJobPost(updateJob, { status:'PUBLISHED' })
  toast.success('已发布上线')
}
async function unpublishJob(updateJob) {
  await updateJobPost(updateJob, { status:'OFFLINE' })
  toast.success('已停止发布')
}

async function updateJobPost(updateJob, updateFields) {
  const updateValue = { ...updateJob, ...updateFields }
  await readJson(`/admin/job-post/${updateJob.id}`, {
    method:'PUT', body:JSON.stringify(buildJobRequest(updateValue, updateValue.status)),
  })
  Object.assign(updateJob, updateFields)
}

// 批量操作
const publishableCount = computed(() => selected.value.filter(id => jobs.value.find(j=>j.id===id)?.status === 'OFFLINE').length)
const offlinableCount  = computed(() => selected.value.filter(id => jobs.value.find(j=>j.id===id)?.status === 'PUBLISHED').length)
const recableCount = computed(() => selected.value.filter(id => jobs.value.find(j=>j.id===id)?.status === 'PUBLISHED').length)

async function bulkPublish() {
  const n = publishableCount.value
  if (!n) return
  const skipped = selected.value.length - n
  const updateJobs = jobs.value.filter(readJob => selected.value.includes(readJob.id)
    && readJob.status === 'OFFLINE')
  await Promise.all(updateJobs.map(updateJob => updateJobPost(updateJob, { status:'PUBLISHED' })))
  toast.success(skipped > 0 ? `已发布 ${n} 条，跳过 ${skipped} 条（已发布或已截止）` : `已发布 ${n} 条`)
  selected.value = []
}
async function bulkRec(updateRecommended) {
  const n = selected.value.length
  const updateJobs = jobs.value.filter(readJob => selected.value.includes(readJob.id))
  await Promise.all(updateJobs.map(updateJob => updateJobPost(updateJob, { recommended:updateRecommended })))
  toast.success(updateRecommended ? `已将 ${n} 条设为推荐` : `已取消 ${n} 条推荐`)
  selected.value = []
}
async function bulkOffline() {
  const n = offlinableCount.value
  if (!n) return
  const skipped = selected.value.length - n
  const updateJobs = jobs.value.filter(readJob => selected.value.includes(readJob.id)
    && readJob.status === 'PUBLISHED')
  await Promise.all(updateJobs.map(updateJob => updateJobPost(updateJob, { status:'OFFLINE' })))
  toast.success(skipped > 0 ? `已停止发布 ${n} 条，跳过 ${skipped} 条（未发布或已截止）` : `已停止发布 ${n} 条`)
  selected.value = []
}
function bulkDelete(ids) {
  const targets = ids ?? selected.value
  const n = targets.length
  confirm_msg.value = `确认删除选中的 ${n} 条岗位？删除后无法找回。`
  confirm_cb.value = async () => {
    try {
      await Promise.all(targets.map(deleteId => readJson(`/admin/job-post/${deleteId}`, { method:'DELETE' })))
      jobs.value = jobs.value.filter(readJob => !targets.includes(readJob.id))
      toast.success(`已删除 ${n} 条`)
      selected.value = selected.value.filter(readId => !targets.includes(readId))
      draftSelected.value = draftSelected.value.filter(readId => !targets.includes(readId))
    } catch (readError) {
      toast.error(readError?.message || '删除失败')
    }
  }
  show_confirm.value = true
}

// 草稿箱批量操作
function draftToggleAll(c) { draftSelected.value = c ? draftJobs.value.map(j=>j.id) : [] }
function draftToggleSel(id) { draftSelected.value.includes(id) ? draftSelected.value = draftSelected.value.filter(i=>i!==id) : draftSelected.value.push(id) }
async function draftBulkPublish() {
  const n = draftSelected.value.length
  const updateJobs = jobs.value.filter(readJob => draftSelected.value.includes(readJob.id))
  await Promise.all(updateJobs.map(updateJob => updateJobPost(updateJob, { status:'PUBLISHED' })))
  toast.success(`已发布 ${n} 条`)
  draftSelected.value = []
}
function draftBulkDelete() { bulkDelete([...draftSelected.value]) }

const NJ_INIT = () => ({
  sourceType: 'PLATFORM',
  sourceUrl: '',
  positionName: '', companyName: '', department: '', headcount: null,
  jobCategory: '', jobSubCategory: '',
  recruitType: '', reqEduLevel: '',
  workStartDate: '', workEndDate: '',
  workProvince: '', workCity: '', workLocation: '',
  workMode: '', workDurationType: '', workDaysPerWeek: null, workPeriodType: '',
  salaryMin: null, salaryMax: null, salaryDisplay: '',
  jobDesc: '', reqMajor: '', reqGradYear: '', reqSkills: '', reqOther: '',
  recommended: false,
  questions: [],
})
const deliveryMode = ref('internal')  // 'internal' | 'external'

function addQuestion() {
  nj.value.questions.push({
    sortOrder: nj.value.questions.length + 1,
    title: '',
    questionType: 'TEXT',
    options: [],
    required: false,
    placeholder: '',
  })
}
function moveQ(idx, dir) {
  const qs = nj.value.questions
  const target = idx + dir
  if (target < 0 || target >= qs.length) return
  ;[qs[idx], qs[target]] = [qs[target], qs[idx]]
  qs.forEach((q, i) => { q.sortOrder = i + 1 })
}
const nj = ref(NJ_INIT())
const editingId = ref(null)
const jobText = ref('')
const structuringJob = ref(false)
const structuredJobs = ref([])
const structuredIndex = ref(-1)
const structureWarnings = ref([])

async function structureJob() {
  if (!jobText.value.trim()) {
    toast.error('请先粘贴岗位描述')
    return
  }
  structuringJob.value = true
  try {
    const readResult = await readJson('/admin/job-post/structure', {
      method:'POST', body:JSON.stringify({ text:jobText.value }),
    })
    structuredJobs.value = (readResult?.jobs || []).map(readJob => ({
      ...NJ_INIT(), ...readJob, questions:[],
    }))
    structureWarnings.value = readResult?.warnings || []
    if (!structuredJobs.value.length) {
      toast.error('未识别到有效岗位，请修改原文或手动填写')
      return
    }
    structuredIndex.value = -1
    selectJob(0)
    toast.success(`已识别 ${structuredJobs.value.length} 个岗位，请检查后再保存`)
  } catch (readError) {
    toast.error(readError?.message || '岗位识别失败')
  } finally {
    structuringJob.value = false
  }
}

function selectJob(readIndex) {
  if (structuredIndex.value >= 0) {
    structuredJobs.value[structuredIndex.value] = { ...nj.value }
  }
  structuredIndex.value = readIndex
  const readJob = structuredJobs.value[readIndex]
  nj.value = { ...NJ_INIT(), ...readJob, questions:readJob.questions || [] }
}

async function openEdit(readJob) {
  try {
    resetForm()
    const readQuestions = readJob.sourceUrl
      ? []
      : await readJson(`/admin/questionnaire/questions/${readJob.id}`)
    editingId.value = readJob.id
    nj.value = { ...NJ_INIT(), ...readJob, questions:readQuestions || [] }
    deliveryMode.value = readJob.sourceUrl ? 'external' : 'internal'
    v.value = 'create'
  } catch (readError) {
    toast.error(readError?.message || '加载岗位失败')
  }
}
function validateJob() {
  if (!nj.value.positionName || !nj.value.companyName) { toast.error('请填写岗位名称和公司'); return false }
  if (!nj.value.jobCategory) { toast.error('请选择岗位大类'); return false }
  return true
}
function resetForm() {
  nj.value = NJ_INIT()
  editingId.value = null
  deliveryMode.value = 'internal'
  jobText.value = ''
  structuredJobs.value = []
  structuredIndex.value = -1
  structureWarnings.value = []
}

async function saveDraft() {
  if (!validateJob()) return
  const readEditing = !!editingId.value
  if (await saveJob('OFFLINE')) toast.success(readEditing ? '已保存修改' : '已保存为草稿')
}

async function publishJob() {
  if (!validateJob()) return
  if (await saveJob('PUBLISHED')) toast.success('已发布，学生可见')
}

async function saveJob(updateStatus) {
  try {
    let readJobId = editingId.value
    if (readJobId) {
      await readJson(`/admin/job-post/${readJobId}`, {
        method:'PUT', body:JSON.stringify(buildJobRequest(nj.value, updateStatus)),
      })
    } else {
      const createJob = await readJson('/admin/job-post', {
        method:'POST', body:JSON.stringify(buildJobRequest(nj.value, updateStatus)),
      })
      readJobId = createJob.id
    }
    if (deliveryMode.value === 'internal') {
      const updateQuestions = nj.value.questions.map((readQuestion, readIndex) => ({
        sortOrder:readIndex + 1,
        title:readQuestion.title,
        questionType:readQuestion.questionType,
        options:readQuestion.options || [],
        required:!!readQuestion.required,
        placeholder:readQuestion.placeholder || null,
      }))
      await readJson(`/admin/questionnaire/questions/batch/${readJobId}`, {
        method:'POST', body:JSON.stringify(updateQuestions),
      })
    }
    await loadJobs()
    v.value = 'list'
    resetForm()
    return true
  } catch (readError) {
    toast.error(readError?.message || '保存岗位失败')
    return false
  }
}

// ── 简历管理 ──
const resumeSel     = ref([])
const expandedRow   = ref(null)
const currentJobGroup = ref(null)
const answerGroups = ref({})
const jobGroups = computed(() => jobs.value
  .filter(readJob => readJob.status === 'PUBLISHED')
  .map(readJob => ({
    jobId:readJob.id,
    title:readJob.positionName,
    company:readJob.companyName,
    dl:(readJob.workEndDate || '').slice(5, 10),
    applicationCount:readJob.applicationCount ?? readJob.apps ?? 0,
    questions:answerGroups.value[readJob.id]?.questions || [],
    resumes:answerGroups.value[readJob.id]?.resumes || [],
  })))

// 解析 QuestionnaireAnswerResponse.answers JSON → [{...题目字段, value}]
// CHECKBOX value 为逗号分隔字符串，FILE_UPLOAD value 为文件 ID
function parseAnswers(questions, answersJson) {
  try {
    const arr = JSON.parse(answersJson)
    return questions
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(q => ({
        ...q,
        value: arr.find(a => a.questionId === q.id)?.value ?? null
      }))
  } catch { return [] }
}

async function openJobResumes(readGroup) {
  try {
    const [readQuestions, readPage] = await Promise.all([
      readJson(`/admin/questionnaire/questions/${readGroup.jobId}`),
      readJson(`/admin/questionnaire/answers/job/${readGroup.jobId}?page=1&size=100`),
    ])
    const readResumes = (readPage?.list || []).map(readAnswer => ({
      id:readAnswer.id,
      name:readAnswer.username || '未知学生',
      sid:readAnswer.studentId || '',
      date:(readAnswer.updatedAt || readAnswer.createdAt || '').slice(0, 10),
      answers:readAnswer.answers || '[]',
      submissionStatus:readAnswer.submissionStatus,
      statusLabel:readAnswer.statusLabel || '',
      reviewPassed:readAnswer.reviewPassed,
      reviewComments:readAnswer.reviewComments || '',
      reviewedAt:readAnswer.reviewedAt || '',
    }))
    answerGroups.value[readGroup.jobId] = { questions:readQuestions || [], resumes:readResumes }
    currentJobGroup.value = { ...readGroup, questions:readQuestions || [], resumes:readResumes }
    resumeSel.value = []
    expandedRow.value = null
    v.value = 'resumeDetail'
  } catch (readError) {
    toast.error(readError?.message || '加载投递失败')
  }
}
function goJobResumes(readJob) {
  const readGroup = jobGroups.value.find(readItem => readItem.jobId === readJob.id)
  if (readGroup) openJobResumes(readGroup)
}

function toggleResumeSel(readId) {
  resumeSel.value.includes(readId)
    ? resumeSel.value = resumeSel.value.filter(readValue => readValue !== readId)
    : resumeSel.value.push(readId)
}

const exportMenuOpen  = ref(false)
const exportMenuOpen2 = ref(false)

async function reviewAnswer(updateAnswer, updatePassed) {
  const updateComments = window.prompt('请输入审核意见', updatePassed ? '审核通过' : '审核未通过')
  if (!updateComments) return
  try {
    const readAnswer = await readJson(`/admin/questionnaire/answers/${updateAnswer.id}/review`, {
      method:'PUT', body:JSON.stringify({ passed:updatePassed, comments:updateComments }),
    })
    Object.assign(updateAnswer, readAnswer)
    toast.success('审核完成')
  } catch (readError) {
    toast.error(readError?.message || '审核失败')
  }
}

async function reviewAnswers(updatePassed) {
  const updateComments = window.prompt('请输入批量审核意见', updatePassed ? '批量审核通过' : '批量审核未通过')
  if (!updateComments || !currentJobGroup.value) return
  try {
    await readJson(`/admin/questionnaire/answers/job/${currentJobGroup.value.jobId}/review-batch`, {
      method:'PUT', body:JSON.stringify({ passed:updatePassed, comments:updateComments }),
    })
    await openJobResumes(currentJobGroup.value)
    toast.success('批量审核完成')
  } catch (readError) {
    toast.error(readError?.message || '批量审核失败')
  }
}

onMounted(() => {
  loadJobs()
  window.addEventListener('click', () => {
    exportMenuOpen.value = false
    exportMenuOpen2.value = false
  })
})

async function exportData(readFormat) {
  if (!currentJobGroup.value) return
  const readParams = new URLSearchParams({ format:readFormat })
  resumeSel.value.forEach(readId => readParams.append('answerIds', readId))
  try {
    const readBlob = await downloadBlob(
      `/admin/questionnaire/answers/job/${currentJobGroup.value.jobId}/export?${readParams}`)
    const readUrl = URL.createObjectURL(readBlob)
    const createLink = document.createElement('a')
    createLink.href = readUrl
    createLink.download = `applications-${currentJobGroup.value.jobId}.${readFormat}`
    createLink.click()
    URL.revokeObjectURL(readUrl)
    resumeSel.value = []
  } catch (readError) {
    toast.error(readError?.message || '导出失败')
  }
}
</script>

<style scoped>
/* ── 导出下拉菜单 ── */
.export-dropdown { position: relative; }
.export-menu {
  position: absolute; top: calc(100% + 6px); right: 0;
  background: var(--bg-card); border: 1px solid var(--border-mid);
  border-radius: var(--r-md); box-shadow: 0 8px 24px rgba(28,26,24,.12);
  min-width: 180px; z-index: 50; overflow: hidden;
  opacity: 0; transform: translateY(-6px); pointer-events: none;
  transition: opacity .15s, transform .15s;
}
.export-dropdown.open .export-menu { opacity: 1; transform: none; pointer-events: auto; }
.export-menu-item {
  display: flex; align-items: center; gap: .5rem;
  padding: .6rem .9rem; font-size: .8rem; color: var(--ink-2);
  cursor: pointer; transition: background var(--t);
}
.export-menu-item:hover { background: var(--bg-soft); color: var(--ink); }
.export-menu-item i { font-size: 14px; color: var(--ink-3); flex-shrink: 0; }
.export-menu-item span {
  margin-left: auto; font-size: .7rem; color: var(--ink-3);
  background: var(--bg-sunken); padding: 1px 5px; border-radius: var(--r-sm);
}
.export-menu-divider { height: 1px; background: var(--border); margin: 3px 0; }

/* ── 投递模式切换 ── */
.mode-btn {
  flex: 1; display: flex; align-items: center; gap: .75rem;
  padding: .875rem 1rem; border-radius: var(--r-md);
  border: 1.5px solid var(--border-mid); cursor: pointer;
  transition: all var(--t); background: var(--bg-card);
}
.mode-btn:hover { border-color: var(--red-border); background: var(--red-light); }
.mode-btn.active { border-color: var(--red); background: var(--red-light); }
.mode-btn i { font-size: 1.3rem; color: var(--ink-3); flex-shrink: 0; }
.mode-btn.active i { color: var(--red); }

/* ── 问卷题目卡片 ── */
.q-card {
  border: 1px solid var(--border); border-radius: var(--r-md);
  padding: .875rem 1rem; margin-bottom: .6rem;
  background: var(--bg-soft);
}
.q-card-head { display: flex; align-items: center; gap: .6rem; }
.q-index {
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--red-light); color: var(--red);
  font-size: .72rem; font-weight: 700; display: flex;
  align-items: center; justify-content: center; flex-shrink: 0;
}
.icon-btn.danger:hover { border-color: #e53e3e; color: #e53e3e; background: #fff5f5; }

/* ── 表单分节标题 ── */
.form-section-title {
  font-size: .8rem;
  font-weight: 600;
  color: var(--ink-3);
  letter-spacing: .06em;
  text-transform: uppercase;
  margin-bottom: .875rem;
  padding-bottom: .6rem;
  border-bottom: 1px solid var(--border);
}

/* ── 操作按钮 tooltip ── */
.tbl-btn { position: relative; }
.tbl-tip {
  position: absolute;
  bottom: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(28,26,24,.78);
  color: #fff;
  font-size: 11px;
  white-space: nowrap;
  padding: 3px 7px;
  border-radius: var(--r-sm);
  pointer-events: none;
  opacity: 0;
  transition: opacity .15s;
}
.tbl-btn:hover .tbl-tip { opacity: 1; }

/* ── Navbar 分栏对齐 ── */
/* brand 列宽度 = sidebar 宽度，让品牌 logo 和下方 sidebar 左对齐 */
.navbar-brand-col {
  width: var(--sidebar-w);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 18px;
  border-right: 1px solid var(--border);
}
/* main 列撑满剩余宽度，右侧 padding 与 admin-main 一致 */
.navbar-main-col {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 2rem;
}

/* ── 简历管理：岗位列表行 ── */
.jrc-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: .9rem 1.25rem;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background var(--t);
}
.jrc-row:last-child { border-bottom: none; }
.jrc-row:hover { background: var(--bg-soft); }

.jrc-row-icon {
  width: 2rem; height: 2rem; border-radius: var(--r-sm);
  background: var(--red-light); color: var(--red);
  display: flex; align-items: center; justify-content: center;
  font-size: .95rem; flex-shrink: 0;
}
.jrc-row-main { flex: 1; min-width: 0; }
.jrc-row-title { font-weight: 600; font-size: .86rem; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.jrc-row-sub { font-size: .75rem; color: var(--ink-3); margin-top: .1rem; }
.jrc-row-meta { display: flex; align-items: center; gap: .5rem; flex-shrink: 0; }
.jrc-row-count { display: flex; flex-direction: column; align-items: center; min-width: 3rem; flex-shrink: 0; }
.jrc-count-num { font-family: 'Noto Serif SC', serif; font-weight: 700; font-size: 1.3rem; color: var(--ink); line-height: 1; }
.jrc-count-label { font-size: .68rem; color: var(--ink-3); margin-top: .15rem; }

/* ── 确认弹窗 ── */
.modal-mask {
  position: fixed; inset: 0;
  background: rgba(28,26,24,.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 999;
}
.modal-box {
  background: var(--bg-card);
  border-radius: var(--r-xl);
  padding: 2rem 2rem 1.5rem;
  width: 360px;
  box-shadow: 0 8px 32px rgba(28,26,24,.18);
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
  animation: slideUp .2s ease;
}
@keyframes slideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }
.modal-icon { font-size: 2rem; color: var(--amber); line-height: 1 }
.modal-msg { font-size: .86rem; color: var(--ink-2); text-align: center; line-height: 1.6 }
.modal-actions { display:flex; gap:.5rem; justify-content:center; width:100% }

/* ── 问卷详情展开行 ── */
.row-expanded > td { background: var(--red-light) !important; }

.detail-row > td {
  padding: 0 !important;
  border-bottom: 2px solid var(--red-border) !important;
}

.revised-badge {
  font-size: .67rem;
  font-weight: 700;
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 999px;
  padding: .1rem .45rem;
  white-space: nowrap;
}
.questionnaire-detail {
  padding: 1.1rem 1.4rem;
  background: var(--surface);
  border-top: 1px dashed var(--border-mid);
}
.qd-title {
  display: flex;
  align-items: center;
  gap: .4rem;
  font-size: .83rem;
  font-weight: 600;
  color: var(--red);
  margin-bottom: .85rem;
}
.qd-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: .75rem;
}
.qd-item {
  background: var(--bg);
  border: 1px solid var(--border-mid);
  border-radius: var(--r-md);
  padding: .7rem .875rem;
}
.qd-item-wide { grid-column: 1 / -1; }
.qd-option {
  display: inline-flex; align-items: center;
  padding: .2rem .6rem; border-radius: var(--r-full);
  font-size: .75rem; border: 1px solid var(--border-mid);
  color: var(--ink-3); background: var(--bg-card);
}
.qd-option-selected {
  background: var(--red-light); color: var(--red);
  border-color: var(--red-border); font-weight: 600;
}
.qd-file-link {
  display: inline-flex; align-items: center; gap: .35rem;
  font-size: .8rem; color: var(--red); text-decoration: none;
  padding: .3rem .7rem; border-radius: var(--r-sm);
  border: 1px solid var(--red-border); background: var(--red-light);
  transition: background var(--t);
}
.qd-file-link:hover { background: var(--red); color: #fff; }

.qd-q {
  font-size: .75rem;
  font-weight: 600;
  color: var(--ink-2);
  margin-bottom: .35rem;
}
.qd-a {
  font-size: .82rem;
  color: var(--ink);
  line-height: 1.55;
}
</style>
