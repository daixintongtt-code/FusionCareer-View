async function fetchJobs() {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: page.value, size: pageSize })
    if (kw.value)        params.set('keyword',     kw.value)
    if (cityF.value)     params.set('workCity',    cityF.value)
    else if (provinceF.value) params.set('workCity', provinceF.value)
    if (jobtypeF.value)  params.set('jobType',     jobtypeF.value)
    if (recruitF.value)  params.set('recruitType', recruitF.value)
    if (durationF.value) params.set('duration',    durationF.value)
    if (daysF.value)     params.set('weekDays',    daysF.value)
    if (salaryF.value)   params.set('salary',      salaryF.value)
    if (modeF.value)     params.set('workMode',    modeF.value)
    const res  = await fetch(`${BASE}/job/list?${params}`)
    const data = await res.json()
    if (data.code === 200) {
      const recs = data.data?.records || data.data?.list || []
      total.value = data.data?.total || recs.length
      jobs.value  = recs.map(j => ({
        id: j.id, abbr: abbrOf(j.companyName), title: j.positionName,
        company: j.companyName, city: j.workCity || '',
        jobtype: j.jobType || '',
        recruit: recruitLabel(j.recruitType),
        recruitBadge: RECRUIT_BADGE[recruitLabel(j.recruitType)] || '',
        l2tags: [j.duration, j.weekDays, j.salary, j.workMode].filter(Boolean),
        dl: fmtDate(j.workEndDate),
      }))
      if (page.value === 1 && featured.value.length === 0)
        featured.value = jobs.value.slice(0,6).map(j => ({ id:j.id, company:j.company, title:j.title }))
    } else throw new Error()
  } catch {
    let f = [...MOCK]
    if (kw.value)          f = f.filter(j => j.title.includes(kw.value) || j.company.includes(kw.value))
    if (cityF.value)       f = f.filter(j => j.city === cityF.value)
    else if (provinceF.value) f = f.filter(j => j.province === provinceF.value)
    if (jobtypeF.value)    f = f.filter(j => j.jobtype  === jobtypeF.value)
    if (recruitF.value)    f = f.filter(j => j.recruit  === recruitF.value)
    if (durationF.value)   f = f.filter(j => j.duration === durationF.value)
    if (daysF.value)       f = f.filter(j => j.days     === daysF.value)
    if (salaryF.value)     f = f.filter(j => j.salary   === salaryF.value)
    if (modeF.value)       f = f.filter(j => j.mode     === modeF.value)
    if (sortBy.value === 'deadline') f.sort((a,b) => a.dl.localeCompare(b.dl))
    else                             f.sort((a,b) => b.pub.localeCompare(a.pub))
    total.value = f.length
    const s = (page.value-1) * pageSize
    jobs.value = f.slice(s, s+pageSize).map(j => ({
      ...j,
      recruitBadge: RECRUIT_BADGE[j.recruit] || '',
      l2tags: [j.duration, j.days, j.salary, j.mode].filter(Boolean),
    }))
    if (page.value === 1 && featured.value.length === 0)
      featured.value = MOCK.filter(j => j.rec).map(j => ({ id:j.id, company:j.company, title:j.title }))
  } finally { loading.value = false }
}