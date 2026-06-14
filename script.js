const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const form = $('#cvForm');
const tabs = $$('.tab');
const tabPanels = $$('.tab-panel');

function setActiveTab(tabId){
  tabs.forEach(t=>{
    const active = t.dataset.tab === tabId;
    t.classList.toggle('is-active', active);
    t.setAttribute('aria-selected', active ? 'true':'false');
  });
  tabPanels.forEach(p=>{
    p.classList.toggle('is-active', p.id === tabId);
  });
}

tabs.forEach(t=>{
  t.addEventListener('click', ()=> setActiveTab(t.dataset.tab));
});

// Repeat sections
function bindRepeat({listId, templateId, addBtnId}){
  const list = $(listId);
  const template = $(templateId);
  const addBtn = $(addBtnId);

  function addItem(){
    const node = template.content.firstElementChild.cloneNode(true);
    list.appendChild(node);
    updatePreview();
  }

  addBtn.addEventListener('click', ()=> addItem());

  list.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-action="remove"]');
    if(!btn) return;
    const item = btn.closest('.repeat-item');
    if(item){
      item.remove();
      updatePreview();
    }
  });

  list.addEventListener('input', (e)=>{
    if(e.target && e.target.matches('input,textarea,select')) updatePreview();
  });
}

bindRepeat({listId:'#experienceList', templateId:'#experienceTemplate', addBtnId:'#btnAddExperience'});
bindRepeat({listId:'#educationList', templateId:'#educationTemplate', addBtnId:'#btnAddEducation'});
bindRepeat({listId:'#projectsList', templateId:'#projectTemplate', addBtnId:'#btnAddProject'});
bindRepeat({listId:'#languageList', templateId:'#languageTemplate', addBtnId:'#btnAddLanguage'});
bindRepeat({listId:'#referenceList', templateId:'#referenceTemplate', addBtnId:'#btnAddReference'});

// Photo preview
const photoInput = form.querySelector('input[name="photo"]');
const avatarImg = $('#avatarImg');
const avatarPlaceholder = $('#avatarPlaceholder');
const imgPreview = $('#photoPreviewImg');
const photoPlaceholder = $('#photoPlaceholder');
const btnRemovePhoto = $('#btnRemovePhoto');

function setPhoto(dataUrl){
  if(dataUrl){
    avatarImg.src = dataUrl;
    avatarImg.style.display='block';
    avatarPlaceholder.style.display='none';

    imgPreview.src = dataUrl;
    imgPreview.style.display='block';
    photoPlaceholder.style.display='none';
  }else{
    avatarImg.src = '';
    avatarPlaceholder.style.display='grid';

    imgPreview.src = '';
    imgPreview.style.display='none';
    photoPlaceholder.style.display='block';
  }
}

photoInput.addEventListener('change', ()=>{
  const file = photoInput.files && photoInput.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=> setPhoto(String(reader.result));
  reader.readAsDataURL(file);
});

btnRemovePhoto.addEventListener('click', ()=>{
  photoInput.value = '';
  setPhoto('');
});

// Design/theme
const themeSelect = $('#themeSelect');
const layoutSelect = $('#layoutSelect');
const scaleInput = form.querySelector('input[name="scale"]');
const showLinksSelect = form.querySelector('select[name="showLinks"]');
const paper = $('#cvPaper');

// Preview elements
const previewName = $('#previewName');
const previewJob = $('#previewJob');
const previewPhone = $('#previewPhone');
const previewEmail = $('#previewEmail');
const previewLocation = $('#previewLocation');
const previewLinkedIn = $('#previewLinkedIn');
const previewGitHub = $('#previewGitHub');
const previewSummary = $('#previewSummary');
const previewHighlights = $('#previewHighlights');
const previewExperience = $('#previewExperience');
const previewProjects = $('#previewProjects');
const previewAchievements = $('#previewAchievements');
const previewLanguages = $('#previewLanguages');
const previewReferences = $('#previewReferences');
const previewSkills = $('#previewSkills');
const previewEducation = $('#previewEducation');
const previewCertifications = $('#previewCertifications');
const previewExtras = $('#previewExtras');

function multilineToBullets(text){
  const items = (text||'')
    .split(/\r?\n/)
    .map(s=>s.trim())
    .filter(Boolean);
  if(!items.length) return '';
  return '<ul>' + items.map(i=>`<li>${escapeHtml(i.replace(/^•\s?/,''))}</li>`).join('') + '</ul>';
}

function escapeHtml(str){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','<')
    .replaceAll('>','>')
    .replaceAll('"','"')
    .replaceAll("'",'&#039;');
}

function cleanMultiline(text){
  // handle cases where user types literal "\\n" in textarea
  // and collapse accidental blank lines.
  return (text||'')
    .replace(/\\n/g,'\n')
    .replace(/\n{2,}/g,'\n')
    .trim();
}

function updatePreview(){
  const get = (name)=> (form.elements[name] ? form.elements[name].value : '');

  const name = get('fullName').trim() || 'Your Name';
  const jobTitle = get('jobTitle').trim() || 'Job Title';

  previewName.textContent = name;
  previewJob.textContent = jobTitle;

  previewPhone.textContent = get('phone').trim();
  previewEmail.textContent = get('email').trim();
  previewLocation.textContent = get('location').trim();

  const linkedin = get('linkedin').trim();
  const github = get('github').trim();
  const showLinks = showLinksSelect.value === 'yes';

  previewLinkedIn.innerHTML = (showLinks && linkedin)
    ? `<a href="${escapeHtml(linkedin)}" target="_blank" rel="noreferrer">LinkedIn</a>`
    : '';

  previewGitHub.innerHTML = (showLinks && github)
    ? `<a href="${escapeHtml(github)}" target="_blank" rel="noreferrer">GitHub</a>`
    : '';

  // Summary
  const summary = get('summary').trim();
  previewSummary.innerHTML = summary
    ? escapeHtml(summary)
    : '<span style="color:#64748b">Write a professional summary...</span>';

  // Highlights
  const highlightsClean = cleanMultiline(get('highlights'));
  previewHighlights.innerHTML = highlightsClean
    ? multilineToBullets(highlightsClean)
    : '<span style="color:#64748b">Add key highlights...</span>';

  // Experience
  const expItems = $$('#experienceList .repeat-item');
  previewExperience.innerHTML = expItems.length
    ? expItems.map(item=>{
      const role = item.querySelector('input[name="role"]').value.trim();
      const company = item.querySelector('input[name="company"]').value.trim();
      const start = item.querySelector('input[name="start"]').value.trim();
      const end = item.querySelector('input[name="end"]').value.trim();
      const loc = item.querySelector('input[name="expLocation"]').value.trim();
      const desc = item.querySelector('textarea[name="description"]').value.trim();

      const header = `<div style="font-weight:900">${escapeHtml(role || 'Role')}${company ? `<span style="font-weight:800;color:#475569"> — ${escapeHtml(company)}</span>`:''}</div>`;
      const metaParts = [start, end].filter(Boolean).join(' - ');
      const meta = `<div style="color:#475569;margin-top:4px;font-size:12px">${escapeHtml(metaParts || '')}${loc ? ` • ${escapeHtml(loc)}`:''}</div>`;
      const body = desc
        ? (desc.includes('\n') ? multilineToBullets(desc) : `<div style="margin-top:8px">${escapeHtml(desc)}</div>`)
        : '';

      return `<div class="repeat-item-view">${header}${meta}${body}</div>`;
    }).join('')
    : '<span style="color:#64748b">Add experience roles...</span>';

  // Projects
  const projItems = $$('#projectsList .repeat-item');
  previewProjects.innerHTML = projItems.length
    ? projItems.map(item=>{
      const pname = item.querySelector('input[name="pname"]').value.trim();
      const tech = item.querySelector('input[name="tech"]').value.trim();
      const desc = item.querySelector('textarea[name="pdesc"]').value.trim();
      const live = item.querySelector('input[name="live"]').value.trim();
      const repo = item.querySelector('input[name="repo"]').value.trim();

      const top = `<div style="font-weight:900">${escapeHtml(pname || 'Project')}</div>`;
      const techLine = tech ? `<div style="color:#475569;margin-top:4px;font-size:12px">${escapeHtml(tech)}</div>` : '';
      const links = [];
      if(showLinks && live) links.push(`<a href="${escapeHtml(live)}" target="_blank" rel="noreferrer">Live</a>`);
      if(showLinks && repo) links.push(`<a href="${escapeHtml(repo)}" target="_blank" rel="noreferrer">Repo</a>`);
      const linkHtml = links.length ? `<div style="margin-top:8px;font-size:12px">${links.join(' • ')}</div>` : '';
      const descHtml = desc ? `<div style="margin-top:8px">${escapeHtml(desc)}</div>` : '';

      return `<div class="repeat-item-view">${top}${techLine}${descHtml}${linkHtml}</div>`;
    }).join('')
    : '<span style="color:#64748b">Add projects...</span>';

  // Achievements
  const ach = get('achievements').trim();
  const extras = get('extras').trim();
  previewAchievements.innerHTML = ach
    ? escapeHtml(ach).replaceAll(/\r?\n/g,'<br/>')
    : '<span style="color:#64748b">Achievements (optional)</span>';

  // Languages
  const langItems = $$('#languageList .repeat-item');
  previewLanguages.innerHTML = langItems.length
    ? langItems.map(item=>{
      const lname = item.querySelector('input[name="lname"]').value.trim();
      const llevel = item.querySelector('input[name="llevel"]').value.trim();
      const left = lname || 'Language';
      return `<div class="repeat-item-view">${escapeHtml(left)}${llevel ? `<span style="font-weight:800;color:#475569"> — ${escapeHtml(llevel)}</span>`:''}</div>`;
    }).join('')
    : '<span style="color:#64748b">Add languages...</span>';

  // References
  const refItems = $$('#referenceList .repeat-item');
  previewReferences.innerHTML = refItems.length
    ? refItems.map(item=>{
      const rname = item.querySelector('input[name="rname"]').value.trim();
      const rtitle = item.querySelector('input[name="rtitle"]').value.trim();
      const rphone = item.querySelector('input[name="rphone"]').value.trim();
      const remail = item.querySelector('input[name="remail"]').value.trim();
      const rcontext = item.querySelector('input[name="rcontext"]').value.trim();

      const header = `<div style="font-weight:900">${escapeHtml(rname || 'Reference')}</div>`;
      const titleLine = rtitle ? `<div style="color:#475569;margin-top:4px;font-size:12px">${escapeHtml(rtitle)}</div>` : '';
      const contactParts = [rphone && `Phone: ${rphone}`, remail && `Email: ${remail}`].filter(Boolean);
      const contactLine = contactParts.length
        ? `<div style="color:#475569;margin-top:4px;font-size:12px">${escapeHtml(contactParts.join(' • '))}</div>`
        : '';
      const ctx = rcontext ? `<div style="margin-top:8px">${escapeHtml(rcontext)}</div>` : '';

      return `<div class="repeat-item-view">${header}${titleLine}${contactLine}${ctx}</div>`;
    }).join('')
    : '<span style="color:#64748b">References (optional)</span>';

  // Skills (fix: remove literal "react\n Javascript" issues)
  const skillsClean = cleanMultiline(get('skills'));
  previewSkills.innerHTML = skillsClean
    ? multilineToBullets(skillsClean)
    : '<span style="color:#64748b">Add skills...</span>';

  // Education
  const eduItems = $$('#educationList .repeat-item');
  previewEducation.innerHTML = eduItems.length
    ? eduItems.map(item=>{
      const degree = item.querySelector('input[name="degree"]').value.trim();
      const inst = item.querySelector('input[name="institute"]').value.trim();
      const start = item.querySelector('input[name="eduStart"]').value.trim();
      const end = item.querySelector('input[name="eduEnd"]').value.trim();
      const grade = item.querySelector('input[name="grade"]').value.trim();
      const notes = item.querySelector('textarea[name="eduNotes"]').value.trim();

      const title = `<div style="font-weight:900">${escapeHtml(degree || 'Degree')}<span style="font-weight:800;color:#475569">${inst ? ` — ${escapeHtml(inst)}`:''}</span></div>`;
      const meta = [start && end ? `${start} - ${end}` : start || end].filter(Boolean).join('');
      const metaLine = `<div style="color:#475569;margin-top:4px;font-size:12px">${escapeHtml(meta)}${grade ? ` • ${escapeHtml(grade)}`:''}</div>`;
      const notesHtml = notes ? `<div style="margin-top:8px">${escapeHtml(notes).replaceAll(/\r?\n/g,'<br/>')}</div>` : '';

      return `<div class="repeat-item-view">${title}${metaLine}${notesHtml}</div>`;
    }).join('')
    : '<span style="color:#64748b">Add education...</span>';

  // Certifications
  const cert = get('certifications').trim();
  previewCertifications.innerHTML = cert
    ? multilineToBullets(cert)
    : '<span style="color:#64748b">Certifications (optional)</span>';

  // Extra
  previewExtras.innerHTML = extras
    ? escapeHtml(extras).replaceAll(/\r?\n/g,'<br/>')
    : '';

  // Design transform
  const theme = themeSelect.value;
  document.documentElement.style.setProperty('--theme', theme);

  const layout = layoutSelect.value;
  paper.classList.toggle('sidebar', layout === 'sidebar');
  paper.classList.toggle('classic', layout !== 'sidebar');

  const scale = Number(scaleInput.value || 1);
  paper.style.transform = `scale(${scale})`;
  paper.style.transformOrigin = 'top center';
}

form.addEventListener('input', (e)=>{
  if(e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) updatePreview();
});

$('#btnReset').addEventListener('click', ()=>{
  form.reset();
  setPhoto('');
  ['#experienceList','#educationList','#projectsList','#languageList','#referenceList'].forEach(id=>{
    const el = $(id);
    if(el) el.innerHTML='';
  });
  updatePreview();
});

$('#btnPrint').addEventListener('click', ()=> window.print());

$('#btnDownloadPdf').addEventListener('click', ()=> window.print());

$('#btnDownloadDoc').addEventListener('click', ()=>{
  const html = buildWordHtml();
  const blob = new Blob([html], {type: 'application/msword;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const baseName = (form.elements['fullName']?.value || 'cv').trim().replace(/\s+/g,'_');
  a.download = `${baseName}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

function buildWordHtml(){
  const theme = themeSelect.value;
  const showLinks = showLinksSelect.value === 'yes';

  const name = form.elements['fullName'].value.trim() || 'Your Name';
  const job = form.elements['jobTitle'].value.trim() || 'Job Title';
  const phone = form.elements['phone'].value.trim();
  const email = form.elements['email'].value.trim();
  const location = form.elements['location'].value.trim();
  const linkedin = form.elements['linkedin'].value.trim();
  const github = form.elements['github'].value.trim();

  const summary = form.elements['summary'].value.trim();
  const highlights = cleanMultiline(form.elements['highlights'].value);

  const exp = $$('#experienceList .repeat-item').map(item=>{
    const role = item.querySelector('input[name="role"]').value.trim();
    const company = item.querySelector('input[name="company"]').value.trim();
    const start = item.querySelector('input[name="start"]').value.trim();
    const end = item.querySelector('input[name="end"]').value.trim();
    const loc = item.querySelector('input[name="expLocation"]').value.trim();
    const desc = item.querySelector('textarea[name="description"]').value.trim();

    return `<h3 style="margin:10px 0 4px">${escapeHtml(role || 'Role')} ${company?`— ${escapeHtml(company)}`:''}</h3>
            <p style="margin:0 0 6px;color:#444;font-size:12px">${escapeHtml([start&&end?`${start} - ${end}`:start||end, loc].filter(Boolean).join(' • '))}</p>
            <p style="margin:0 0 14px">${escapeHtml(desc).replaceAll(/\r?\n/g,'<br/>')}</p>`;
  }).join('');

  const projs = $$('#projectsList .repeat-item').map(item=>{
    const pname = item.querySelector('input[name="pname"]').value.trim();
    const tech = item.querySelector('input[name="tech"]').value.trim();
    const desc = item.querySelector('textarea[name="pdesc"]').value.trim();
    const live = item.querySelector('input[name="live"]').value.trim();
    const repo = item.querySelector('input[name="repo"]').value.trim();

    const links = [];
    if(showLinks && live) links.push(`Live: ${escapeHtml(live)}`);
    if(showLinks && repo) links.push(`Repo: ${escapeHtml(repo)}`);

    return `<h3 style="margin:10px 0 4px">${escapeHtml(pname || 'Project')}</h3>
            ${tech?`<p style="margin:0 0 6px;color:#444;font-size:12px">${escapeHtml(tech)}</p>`:''}
            <p style="margin:0 0 6px">${escapeHtml(desc).replaceAll(/\r?\n/g,'<br/>')}</p>
            ${links.length?`<p style="margin:0 0 14px;color:#444;font-size:12px">${links.join('<br/>')}</p>`:''}`;
  }).join('');

  const ach = form.elements['achievements'].value.trim();
  const cert = form.elements['certifications'].value.trim();

  const skills = cleanMultiline(form.elements['skills'].value);

  const edu = $$('#educationList .repeat-item').map(item=>{
    const degree = item.querySelector('input[name="degree"]').value.trim();
    const inst = item.querySelector('input[name="institute"]').value.trim();
    const start = item.querySelector('input[name="eduStart"]').value.trim();
    const end = item.querySelector('input[name="eduEnd"]').value.trim();
    const grade = item.querySelector('input[name="grade"]').value.trim();
    const notes = item.querySelector('textarea[name="eduNotes"]').value.trim();

    return `<p style="margin:0 0 6px"><strong>${escapeHtml(degree||'Degree')}</strong>${inst?` — ${escapeHtml(inst)}`:''}</p>
            <p style="margin:0 0 6px;color:#444;font-size:12px">${escapeHtml([start&&end?`${start} - ${end}`:start||end, grade].filter(Boolean).join(' • '))}</p>
            ${notes?`<p style="margin:0 0 14px">${escapeHtml(notes).replaceAll(/\r?\n/g,'<br/>')}</p>`:''}`;
  }).join('');

  const extras = form.elements['extras'].value.trim();

  const languages = $$('#languageList .repeat-item').map(item=>{
    const lname = item.querySelector('input[name="lname"]').value.trim();
    const llevel = item.querySelector('input[name="llevel"]').value.trim();
    const left = lname || 'Language';
    return `<p style="margin:0 0 6px">${escapeHtml(left)}${llevel ? ` — ${escapeHtml(llevel)}`:''}</p>`;
  }).join('');

  const references = $$('#referenceList .repeat-item').map(item=>{
    const rname = item.querySelector('input[name="rname"]').value.trim();
    const rtitle = item.querySelector('input[name="rtitle"]').value.trim();
    const rphone = item.querySelector('input[name="rphone"]').value.trim();
    const remail = item.querySelector('input[name="remail"]').value.trim();
    const rcontext = item.querySelector('input[name="rcontext"]').value.trim();

    const header = `<p style="margin:0 0 6px"><strong>${escapeHtml(rname || 'Reference')}</strong></p>`;
    const title = rtitle ? `<p style="margin:0 0 6px;color:#444;font-size:12px">${escapeHtml(rtitle)}</p>` : '';
    const contacts = [rphone && `Phone: ${escapeHtml(rphone)}`, remail && `Email: ${escapeHtml(remail)}`].filter(Boolean).join('<br/>');
    const contactBlock = contacts ? `<p style="margin:0 0 6px;color:#444;font-size:12px">${contacts}</p>` : '';
    const ctx = rcontext ? `<p style="margin:0 0 14px">${escapeHtml(rcontext).replaceAll(/\r?\n/g,'<br/>')}</p>` : '';

    return header + title + contactBlock + ctx;
  }).join('');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>CV</title>
  </head>
  <body style="font-family: Calibri, Arial, sans-serif; color:#0f172a;">
    <div style="border-left:8px solid ${theme}; padding-left:14px;">
      <h1 style="margin:0;font-size:28px">${escapeHtml(name)}</h1>
      <p style="margin:4px 0 10px;font-size:14px;color:#475569;font-weight:bold">${escapeHtml(job)}</p>
      <p style="margin:0 0 14px;font-size:12px;color:#334155">
        ${[phone && `Phone: ${escapeHtml(phone)}`,
          email && `Email: ${escapeHtml(email)}`,
          location && `Location: ${escapeHtml(location)}`].filter(Boolean).join('<br/>')}
        ${showLinks ? `<br/>${[linkedin && `LinkedIn: ${escapeHtml(linkedin)}`, github && `GitHub: ${escapeHtml(github)}`].filter(Boolean).join('<br/>')}`:''}
      </p>

      <h2 style="color:${theme};font-size:14px;margin:16px 0 6px;letter-spacing:.08em">SUMMARY</h2>
      <p style="margin:0 0 14px;white-space:pre-wrap">${escapeHtml(summary || ' ').replaceAll(/\r?\n/g,'<br/>')}</p>

      <h2 style="color:${theme};font-size:14px;margin:16px 0 6px;letter-spacing:.08em">HIGHLIGHTS</h2>
      <p style="margin:0 0 14px;white-space:pre-wrap">${escapeHtml(highlights || ' ').replaceAll(/\r?\n/g,'<br/>')}</p>

      <h2 style="color:${theme};font-size:14px;margin:16px 0 6px;letter-spacing:.08em">EXPERIENCE</h2>
      ${exp || '<p> </p>'}

      <h2 style="color:${theme};font-size:14px;margin:16px 0 6px;letter-spacing:.08em">PROJECTS</h2>
      ${projs || '<p> </p>'}

      ${ach?`<h2 style="color:${theme};font-size:14px;margin:16px 0 6px;letter-spacing:.08em">ACHIEVEMENTS</h2><p style="white-space:pre-wrap">${escapeHtml(ach).replaceAll(/\r?\n/g,'<br/>')}</p>`:''}

      <h2 style="color:${theme};font-size:14px;margin:16px 0 6px;letter-spacing:.08em">LANGUAGES</h2>
      ${languages?`<div>${languages}</div>`:'<p> </p>'}

      <h2 style="color:${theme};font-size:14px;margin:16px 0 6px;letter-spacing:.08em">REFERENCES</h2>
      ${references?`<div>${references}</div>`:'<p> </p>'}

      <h2 style="color:${theme};font-size:14px;margin:16px 0 6px;letter-spacing:.08em">SKILLS</h2>
      <p style="white-space:pre-wrap">${escapeHtml(skills || ' ').replaceAll(/\r?\n/g,'<br/>')}</p>

      <h2 style="color:${theme};font-size:14px;margin:16px 0 6px;letter-spacing:.08em">EDUCATION</h2>
      ${edu || '<p> </p>'}

      ${cert?`<h2 style="color:${theme};font-size:14px;margin:16px 0 6px;letter-spacing:.08em">CERTIFICATIONS</h2><p style="white-space:pre-wrap">${escapeHtml(cert).replaceAll(/\r?\n/g,'<br/>')}</p>`:''}

      ${extras?`<h2 style="color:${theme};font-size:14px;margin:16px 0 6px;letter-spacing:.08em">EXTRA</h2><p style="white-space:pre-wrap">${escapeHtml(extras).replaceAll(/\r?\n/g,'<br/>')}</p>`:''}
    </div>
  </body>
</html>`;
}

// Initial render
updatePreview();

