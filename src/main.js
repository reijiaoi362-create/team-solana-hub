import './style.css'
import './no-photo.css'

const data = {
  stats: [
    { value: '42', label: 'Team members', detail: 'Discord role synced', tone: 'gold' },
    { value: '18', label: 'Achievements', detail: '312 points earned', tone: 'lime' },
    { value: '12', label: 'Events joined', detail: '4 podium finishes', tone: 'blue' },
    { value: '08', label: 'Allies & partners', detail: 'Across 3 regions', tone: 'violet' },
  ],
  members: [
    { name: 'Axiom', username: 'Axiom', role: 'Team Lead', uuid: '853c80ef-3c37-49fd-aa49-938b674adae6', image: 'https://mc-heads.net/avatar/Axiom/100', initials: 'AX', className: 'avatar-1', joined: 'Jun 2026', achievements: 12 },
    { name: 'Mira', username: 'Mira', role: 'Creative Director', uuid: '', image: 'https://mc-heads.net/avatar/Mira/100', initials: 'MI', className: 'avatar-2', joined: 'Jul 2026', achievements: 8 },
    { name: 'Koda', username: 'Koda', role: 'PvP Specialist', uuid: '', image: 'https://mc-heads.net/avatar/Koda/100', initials: 'KO', className: 'avatar-3', joined: 'Aug 2026', achievements: 6 },
    { name: 'Nox', username: 'Nox', role: 'Builder', uuid: '', image: 'https://mc-heads.net/avatar/Nox/100', initials: 'NO', className: 'avatar-4', joined: 'Aug 2026', achievements: 4 },
  ],
  news: [
    { date: '02 SEP 2026', title: 'Solana takes 1st place in the Summer Build-Off', category: 'Achievement', color: 'orange' },
    { date: '28 AUG 2026', title: 'New community server is now live', category: 'Announcement', color: 'cyan' },
    { date: '17 AUG 2026', title: 'Welcome our six newest members', category: 'Team update', color: 'green' },
  ],
  achievements: [
    { icon: '✦', title: 'First Light', text: 'Founded the Solana community', date: '2026', className: 'achievement-gold' },
    { icon: '⚔', title: 'Unbroken', text: 'Won the first PvP invitational', date: '2026', className: 'achievement-red' },
    { icon: '◆', title: 'Build Together', text: 'Completed the Solana base', date: '2026', className: 'achievement-blue' },
  ],
  events: [
    { month: 'SEP', day: '14', title: 'Solana Open Scrim', meta: 'PvP · 8:00 PM UTC', action: 'Register' },
    { month: 'SEP', day: '21', title: 'Community Build Night', meta: 'Building · 6:30 PM UTC', action: 'Details' },
  ],
  basePosts: [],
}

try {
  const savedMembers = JSON.parse(localStorage.getItem('solana-members') || 'null')
  if (Array.isArray(savedMembers)) data.members = savedMembers
} catch {
  localStorage.removeItem('solana-members')
}

const persistMembers = () => localStorage.setItem('solana-members', JSON.stringify(data.members))
const rolePriority = { 'Team Lead': 0, Staff: 1 }
const sortMembersByRole = (members) => members.sort((left, right) => (rolePriority[left.role] ?? 2) - (rolePriority[right.role] ?? 2))
sortMembersByRole(data.members)

const icon = (name) => ({
  grid: '▦', users: '♧', trophy: '✦', chart: '⌁', news: '▤', calendar: '□', shield: '◇', settings: '⚙', arrow: '↗', discord: '◌', search: '⌕', menu: '☰', close: '×', plus: '+',
}[name] || '•')

const memberMarkup = (member) => `
  <article class="member-card" data-member="${member.username}">
    <div class="member-photo ${member.className}" style="background-image: url('${member.image}')"><span>${member.initials}</span></div>
    <div class="member-meta"><strong>${member.name}</strong><span>${member.role}</span></div>
    <div class="member-actions"><button class="icon-button" aria-label="Open ${member.name}'s profile">${icon('arrow')}</button><button class="remove-member" data-remove-member="${member.username}">Remove</button></div>
  </article>`

const memberProfileMarkup = (member) => `<div class="profile-modal-content"><button class="modal-close" data-close-modal>${icon('close')}</button><div class="skin-stage"><img src="https://crafatar.com/renders/body/${member.uuid || member.username}?overlay" alt="${member.username} Minecraft skin" /></div><span class="eyebrow small">Minecraft profile</span><h2>${member.username}</h2><p class="profile-role">${member.role}</p><div class="profile-facts"><div><span>UUID</span><strong>${member.uuid || 'Fetched from Mojang'}</strong></div><div><span>Team join date</span><strong>${member.joined || 'Sep 2026'}</strong></div><div><span>Achievements</span><strong>${member.achievements || 0} unlocked</strong></div></div></div>`

const passwordModal = () => `<div class="modal-backdrop" id="passwordModal"><div class="modal-card password-card"><button class="modal-close" data-close-modal>${icon('close')}</button><span class="eyebrow small">Restricted area</span><h2>Staff access</h2><p>Enter the Solana staff password to manage the team hub.</p><form id="passwordForm"><label for="staffPassword">Staff password</label><input id="staffPassword" type="password" autocomplete="current-password" placeholder="Enter password" autofocus /><button class="primary-button" type="submit">Unlock dashboard <span>${icon('arrow')}</span></button><small id="passwordError"></small></form></div></div>`

const announcementModal = () => `<div class="modal-backdrop" id="announcementModal"><div class="modal-card announcement-card"><button class="modal-close" data-close-modal>${icon('close')}</button><span class="eyebrow small">Staff console / publish</span><h2>What's new?</h2><p>Share an update with the Solana community.</p><form id="announcementForm"><label for="announcementTitle">Headline</label><input id="announcementTitle" required maxlength="90" placeholder="We just reached a new milestone" /><label for="announcementCategory">Update type</label><select id="announcementCategory"><option>Announcement</option><option>Achievement</option><option>Team update</option><option>Event</option></select><label for="announcementBody">Details</label><textarea id="announcementBody" required maxlength="280" rows="5" placeholder="Tell the community what happened..."></textarea><button class="primary-button" type="submit">Publish update <span>${icon('arrow')}</span></button></form></div></div>`

const profileModal = (member) => `<div class="modal-backdrop" id="profileModal"><div class="modal-card profile-card">${memberProfileMarkup(member)}</div></div>`

const membersManager = () => `<div class="member-manager"><div class="dashboard-heading"><div><span class="eyebrow small">Staff console / members</span><h1>Minecraft roster.</h1><p>Fetch a Minecraft account, preview its skin, and save it to the team directory.</p></div><button class="primary-button" id="newMemberButton">${icon('plus')} Add member</button></div><div class="manager-grid"><article class="dashboard-card fetch-card"><div class="card-top"><div><span class="eyebrow small">Add member</span><h2>Link a Minecraft profile</h2></div><span class="status-badge">Mojang lookup</span></div><form id="memberForm"><label for="minecraftUsername">Minecraft username</label><div class="input-row"><input id="minecraftUsername" required maxlength="16" placeholder="Steve123" /><button class="outline-button" type="submit">Fetch skin ${icon('arrow')}</button></div><div class="role-date-grid"><label>Team role<select id="memberRole"><option>Member</option><option>Team Lead</option><option>Staff</option><option>Content Creator</option><option>Builder</option></select></label><label>Team join date<input id="memberJoinDate" type="date" value="2026-09-03" /></label></div><div id="profilePreview" class="profile-preview empty"><span class="preview-placeholder">Your fetched skin preview will appear here.</span></div><button class="primary-button save-member" id="saveMemberButton" type="button" disabled>${icon('plus')} Add member to roster</button><small class="form-note">Profile data is fetched from Mojang and skin rendering is provided by Crafatar.</small></form></article><article class="dashboard-card roster-manager"><div class="card-top"><div><span class="eyebrow small">Saved profiles</span><h2>Current roster</h2></div><span class="card-count">${data.members.length.toString().padStart(2, '0')}</span></div><div class="manager-roster" id="managerRoster">${data.members.map(member => `<div class="manager-member"><img src="${member.image}" alt="" /><div><strong>${member.username}</strong><span>${member.role}</span></div><button class="icon-button" data-manager-profile="${member.username}">${icon('arrow')}</button></div>`).join('')}</div></article></div></div>`

const dashboardSectionMarkup = (section) => {
  const pages = {
    achievements: ['Achievements', 'Create and manage the milestones your team earns.', 'New achievement', ['Achievement name', 'Description', 'Points', 'Category']],
    statistics: ['Statistics', 'Control the numbers shown across the public team hub.', 'Add statistic', ['Statistic name', 'Value', 'Description', 'Display color']],
    announcements: ['Announcements', 'Publish updates, notices, and team news.', 'New announcement', ['Headline', 'Update type', 'Details', 'Publish date']],
    events: ['Events', 'Plan upcoming events and record their results.', 'New event', ['Event name', 'Date and time', 'Category', 'Participants']],
    'allies & partners': ['Allies & Partners', 'Manage allied teams, communities, and relationships.', 'Add partner', ['Partner name', 'Community link', 'Relationship', 'Logo URL']],
    'team base': ['Team Base', 'Publish base updates, screenshots, and project progress for the community.', 'Add post', ['Post title', 'Current project', 'Base screenshot or file']],
    'team history': ['Team History', 'Build the official timeline of Team Solana.', 'Add milestone', ['Year', 'Milestone title', 'Description', 'Achievement']],
    'website settings': ['Website Settings', 'Control the public hub identity, links, and integrations.', 'Save settings', ['Team name', 'Discord invite', 'Accent color', 'Bot API URL']],
  }
  const page = pages[section]
  if (!page) return `<div class="dashboard-heading"><div><span class="eyebrow small">Staff console / overview</span><h1>Good morning, Axiom.</h1><p>Here is what is moving across the team this week.</p></div></div>`
  return `<div class="dashboard-heading"><div><span class="eyebrow small">Staff console / ${section}</span><h1>${page[0]}.</h1><p>${page[1]}</p></div><button class="primary-button section-create">${icon('plus')} ${page[2]}</button></div><div class="section-manager-grid"><article class="dashboard-card section-form-card"><div class="card-top"><div><span class="eyebrow small">Create record</span><h2>Add to ${page[0].toLowerCase()}</h2></div></div><form class="generic-manager-form" data-manager-section="${section}">${page[3].map((field, index) => `<label>${field}${section === 'team base' && index === page[3].length - 1 ? '<input class="file-input" type="file" accept="image/*,.pdf,.zip,.txt" />' : index === 2 && section === 'announcements' ? '<textarea rows="5" required placeholder="Write the update..."></textarea>' : `<input required placeholder="${field}" />`}</label>`).join('')}<button class="primary-button" type="submit">Save ${page[0].toLowerCase()} <span>${icon('arrow')}</span></button></form></article><article class="dashboard-card section-list-card"><div class="card-top"><div><span class="eyebrow small">Published data</span><h2>Recently updated</h2></div><span class="status-badge">Live</span></div><div class="manager-list">${section === 'team base' && data.basePosts.length ? data.basePosts.map(post => `<div><strong>${post.title}</strong><span>Published by ${post.author}</span></div>`).join('') : `<div><strong>${page[0]} workspace ready</strong><span>Start adding records from the form.</span></div><div><strong>Public hub connected</strong><span>Changes will be available to visitors.</span></div><div><strong>Last edited today</strong><span>By Axiom · Staff</span></div>`}</div></article></div>`
}

const teamBasePublicView = () => `<div class="shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">S</div><div><strong>SOLANA</strong><span>TEAM HUB</span></div></div><div class="side-label">Community</div><nav class="nav-list"><button class="nav-item" id="publicHome">${icon('grid')} Overview</button><button class="nav-item active"><span>${icon('shield')}</span>Team Base</button><button class="nav-item" data-section="team"><span>${icon('users')}</span>Team</button></nav><div class="sidebar-footer"><div class="status-dot"></div><div><strong>Discord bot online</strong><span>Team Base updates live</span></div></div></aside><main class="main-content"><header class="topbar"><div class="breadcrumb"><span>Public hub</span><b>/</b><strong>Team Base</strong></div><div class="top-actions"><button class="staff-button" id="staffMode">Staff dashboard <span>${icon('arrow')}</span></button></div></header><div class="content-wrap base-public"><div class="base-page-heading"><span class="eyebrow small">Solana base / live feed</span><h1>Built from the<br /><em>ground up.</em></h1><p>Explore the latest builds, screenshots, and progress from Team Solana's shared base.</p></div><div class="base-post-grid">${data.basePosts.length ? data.basePosts.map(post => `<article class="base-post"><img src="${post.image}" alt="${post.title}" /><div class="base-post-copy"><span class="eyebrow small">${post.date} · ${post.author}</span><h2>${post.title}</h2><p>${post.project}</p></div></article>`).join('') : '<div class="empty-base"><span class="eyebrow small">No posts yet</span><h2>The base feed is ready.</h2><p>Staff updates will appear here when they publish a new screenshot.</p></div>'}</div></div></main></div>`

const allMembersPublicView = () => `<div class="shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">S</div><div><strong>SOLANA</strong><span>TEAM HUB</span></div></div><div class="side-label">Workspace</div><nav class="nav-list"><button class="nav-item" id="publicHome">${icon('grid')} Overview</button><button class="nav-item active"><span>${icon('users')}</span>Team</button><button class="nav-item" data-section="achievements"><span>${icon('trophy')}</span>Achievements</button><button class="nav-item" data-section="news"><span>${icon('news')}</span>News</button></nav><div class="sidebar-footer"><div class="status-dot"></div><div><strong>Discord bot online</strong><span id="memberPageSyncStatus">${data.members.length} members in roster</span></div></div></aside><main class="main-content"><header class="topbar"><div class="breadcrumb"><span>Public hub</span><b>/</b><strong>All members</strong></div><div class="top-actions"><button class="staff-button" id="staffMode">Staff dashboard <span>${icon('arrow')}</span></button></div></header><div class="content-wrap members-public"><div class="base-page-heading"><span class="eyebrow small">Roster / live directory</span><h1>Meet the <em>team.</em></h1><p>Every member of Team Solana, synced from Discord and represented by their Minecraft identity.</p></div><div class="member-count-banner"><strong id="memberPageCount">${data.members.length.toString().padStart(2, '0')}</strong><span>total members</span><small>Discord role roster</small></div><div class="all-member-grid">${data.members.map(memberMarkup).join('')}</div></div></main></div>`

const publicView = () => `
  <div class="shell">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">S</div><div><strong>SOLANA</strong><span>TEAM HUB</span></div></div>
      <div class="side-label">Workspace</div>
      <nav class="nav-list" aria-label="Primary navigation">
        <button class="nav-item active" data-section="overview"><span>${icon('grid')}</span>Overview</button>
        <button class="nav-item" data-section="team"><span>${icon('users')}</span>Team</button>
        <button class="nav-item" data-section="achievements"><span>${icon('trophy')}</span>Achievements</button>
        <button class="nav-item" data-section="statistics"><span>${icon('chart')}</span>Statistics</button>
        <button class="nav-item" data-section="news"><span>${icon('news')}</span>News</button>
        <button class="nav-item" data-section="events"><span>${icon('calendar')}</span>Events</button>
      </nav>
      <div class="side-label side-label-bottom">Community</div>
      <nav class="nav-list">
        <button class="nav-item" data-section="base"><span>${icon('shield')}</span>Team Base</button>
        <button class="nav-item" data-section="allies"><span>${icon('users')}</span>Allies & Partners</button>
        <button class="nav-item" data-section="history"><span>${icon('news')}</span>Team History</button>
      </nav>
      <div class="sidebar-footer"><div class="status-dot"></div><div><strong>Discord bot online</strong><span>42 members synced · 18 online</span></div></div>
    </aside>
    <main class="main-content">
      <header class="topbar"><button class="mobile-menu icon-button">${icon('menu')}</button><div class="breadcrumb"><span>Public hub</span><b>/</b><strong>Overview</strong></div><div class="top-actions"><button class="search-button">${icon('search')}<span>Search hub</span><kbd>⌘ K</kbd></button><button class="staff-button" id="staffMode">Staff dashboard <span>${icon('arrow')}</span></button><div class="profile-orb">AS</div></div></header>
      <div class="content-wrap">
        <section class="hero-section reveal"><div class="hero-copy"><div class="eyebrow"><span class="pulse"></span> Official team hub <span class="eyebrow-line"></span> Since 2026</div><h1>Build different.<br /><em>Play together.</em></h1><p>Solana is a competitive Minecraft team built around creativity, healthy competition, and the people who make the server feel like home.</p><div class="hero-actions"><button class="primary-button" id="discordButton">${icon('discord')} Join our Discord <span>${icon('arrow')}</span></button><button class="text-button" data-section="team">Meet the team <span>${icon('arrow')}</span></button></div></div><div class="hero-art"><div class="art-grid"></div><div class="sun-disc"></div><div class="art-label">SOL / 01</div><div class="art-caption"><span>Active since</span><strong>24.06.26</strong></div></div></section>
        <section class="stats-grid reveal">${data.stats.map((stat, index) => `<article class="stat-card ${stat.tone}" data-stat-index="${index}"><span class="stat-value">${stat.value}</span><div><strong>${stat.label}</strong><span class="stat-detail">${stat.detail}</span></div><i>${icon('arrow')}</i></article>`).join('')}</section>
        <section class="section-block reveal" id="newsSection"><div class="section-heading"><div><span class="eyebrow small">Signal / 001</span><h2>Latest news</h2></div><button class="text-button" data-section="news">View all ${icon('arrow')}</button></div><div class="news-list">${data.news.map(item => `<article class="news-row"><div class="news-marker ${item.color}"></div><div class="news-date">${item.date}</div><div class="news-title"><strong>${item.title}</strong><span>${item.category}</span></div><button class="icon-button">${icon('arrow')}</button></article>`).join('')}</div></section>
        <section class="split-section reveal"><div class="section-block"><div class="section-heading"><div><span class="eyebrow small">Roster / 042</span><h2>Featured members</h2></div><button class="text-button" data-section="team">View All Members ${icon('arrow')}</button></div><div class="member-grid" id="publicMemberGrid">${data.members.map(memberMarkup).join('')}</div></div><div class="section-block achievements-block"><div class="section-heading"><div><span class="eyebrow small">Milestones / 018</span><h2>Recent achievements</h2></div><button class="text-button" data-section="achievements">All badges ${icon('arrow')}</button></div><div class="achievement-list">${data.achievements.map(item => `<article class="achievement-row"><div class="achievement-icon ${item.className}">${item.icon}</div><div><strong>${item.title}</strong><span>${item.text}</span></div><time>${item.date}</time></article>`).join('')}</div></div></section>
        <section class="event-section reveal"><div class="event-intro"><span class="eyebrow small">Next up</span><h2>Make some<br /><em>noise.</em></h2><p>Two events on the horizon. Bring your best build, your sharpest kit, and a little luck.</p><button class="text-button" data-section="events">Explore events ${icon('arrow')}</button></div><div class="event-list">${data.events.map(event => `<article class="event-row"><div class="date-tile"><span>${event.month}</span><strong>${event.day}</strong></div><div><strong>${event.title}</strong><span>${event.meta}</span></div><button class="outline-button">${event.action} ${icon('arrow')}</button></article>`).join('')}</div></section>
      </div><footer class="footer"><div><a class="brand mini brand-link" href="https://Teamsolanahub.com" target="_blank" rel="noreferrer"><div class="brand-mark">S</div><strong>SOLANA</strong></a><span>Competitive spirit. Community first.</span></div><span>© 2026 Team Solana</span><a class="hub-link" href="https://Teamsolanahub.com" target="_blank" rel="noreferrer">Teamsolanahub.com</a></footer>
    </main>
  </div>`

const dashboardView = () => `
  <div class="dashboard-shell"><header class="dashboard-top"><div class="brand"><div class="brand-mark">S</div><div><strong>SOLANA</strong><span>STAFF CONSOLE</span></div></div><div class="dashboard-top-right"><span class="secure-label">${icon('shield')} Secure workspace</span><button class="back-button" id="publicMode">${icon('arrow')} View public hub</button><div class="profile-orb">AS</div></div></header><div class="dashboard-body"><aside class="dashboard-nav"><div class="side-label">Manage</div>${['Overview','Members','Achievements','Statistics','Announcements','Events','Allies & Partners','Team Base','Team History'].map((item, i) => `<button class="nav-item ${i === 0 ? 'active' : ''}" data-dashboard="${item.toLowerCase()}"><span>${[icon('grid'),icon('users'),icon('trophy'),icon('chart'),icon('news'),icon('calendar'),icon('users'),icon('shield'),icon('news')][i]}</span>${item}</button>`).join('')}<div class="side-label side-label-bottom">System</div><button class="nav-item"><span>${icon('settings')}</span>Website settings</button></aside><main class="dashboard-main"><div class="dashboard-heading"><div><span class="eyebrow small">Staff console / overview</span><h1>Good morning, Axiom.</h1><p>Here is what is moving across the team this week.</p></div><button class="primary-button">${icon('plus')} New update</button></div><div class="dashboard-cards"><article class="dashboard-card feature-card"><div class="card-top"><div><span class="eyebrow small">Discord server</span><h2>Members joined.</h2><span class="server-total" id="discordServerCount">Run server scan to sync total</span></div><span class="trend">Live ↗</span></div><div class="chart"><div class="chart-line"></div><div class="chart-labels"><span>JUL</span><span>AUG</span><span>SEP</span></div></div></article><article class="dashboard-card"><div class="card-top"><span class="eyebrow small">Open actions</span><span class="card-count">04</span></div><div class="action-list"><div><span class="action-dot orange"></span><strong>Review 2 join requests</strong><span>Today</span></div><div><span class="action-dot blue"></span><strong>Publish event results</strong><span>Tomorrow</span></div><div><span class="action-dot green"></span><strong>Update base screenshots</strong><span>Sep 08</span></div></div></article></div><div class="dashboard-lower"><article class="dashboard-card table-card"><div class="card-top"><div><span class="eyebrow small">Recent activity</span><h2>Latest changes</h2></div><button class="text-button">View log ${icon('arrow')}</button></div><div class="activity-table"><div class="table-row table-head"><span>Activity</span><span>By</span><span>When</span></div>${[['New member joined','Mira','2 min ago'],['Achievement unlocked','Koda','48 min ago'],['News published','Axiom','3 hrs ago'],['Event created','Nox','Yesterday']].map(row => `<div class="table-row"><span><b class="mini-avatar">${row[1][0]}</b>${row[0]}</span><span>${row[1]}</span><span>${row[2]}</span></div>`).join('')}</div></article><article class="dashboard-card quick-card"><div class="card-top"><div><span class="eyebrow small">Quick create</span><h2>Add to hub</h2></div></div><button>${icon('plus')} New achievement <span>${icon('arrow')}</span></button><button>${icon('plus')} New announcement <span>${icon('arrow')}</span></button><button>${icon('plus')} New statistic <span>${icon('arrow')}</span></button></article></div></main></div></div>`

const render = (view = 'public', page = 'overview') => { document.querySelector('#app').innerHTML = view === 'dashboard' ? dashboardView() : page === 'base' ? teamBasePublicView() : page === 'members' ? allMembersPublicView() : publicView(); bindEvents(view, page) }
const bindEvents = (view, page) => {
  document.querySelectorAll('[data-section]').forEach(button => button.addEventListener('click', () => {
    const target = button.dataset.section
    if (target === 'base') { render('public', 'base'); return }
    if (target === 'team') { render('public', 'members'); return }
    document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.section === target))
    const targetMap = { news: 'newsSection', overview: 'newsSection', team: 'newsSection', achievements: 'newsSection', events: 'newsSection' }
    document.getElementById(targetMap[target] || 'newsSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }))
  document.querySelector('#staffMode')?.addEventListener('click', () => { document.body.insertAdjacentHTML('beforeend', passwordModal()); bindEvents('password') })
  document.querySelector('#publicMode')?.addEventListener('click', () => render('public'))
  document.querySelector('#publicHome')?.addEventListener('click', () => render('public'))
  document.querySelector('#discordButton')?.addEventListener('click', () => window.open('https://discord.gg/DXNjGA3W4E', '_blank', 'noopener,noreferrer'))
  document.querySelector('.mobile-menu')?.addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'))
  document.querySelectorAll('.member-card').forEach(card => card.addEventListener('click', () => { const member = data.members.find(item => item.username === card.dataset.member); document.body.insertAdjacentHTML('beforeend', profileModal(member)); bindEvents('modal') }))
  document.querySelectorAll('.manager-member').forEach(row => {
    if (row.querySelector('[data-remove-member]')) return
    const username = row.querySelector('strong')?.textContent
    const remove = document.createElement('button')
    remove.className = 'remove-member'
    remove.dataset.removeMember = username
    remove.textContent = 'Remove'
    row.appendChild(remove)
  })
  document.querySelectorAll('[data-remove-member]').forEach(button => button.addEventListener('click', event => {
    event.stopPropagation()
    const username = button.dataset.removeMember
    const index = data.members.findIndex(member => member.username === username)
    if (index >= 0) data.members.splice(index, 1)
    persistMembers()
    button.closest('.member-card, .manager-member')?.remove()
    showToast(`${username} removed from roster`)
  }))
  document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', () => button.closest('.modal-backdrop').remove()))
  document.querySelector('#passwordForm')?.addEventListener('submit', (event) => { event.preventDefault(); if (document.querySelector('#staffPassword').value === 'SOLANA') { document.querySelector('#passwordModal').remove(); render('dashboard') } else document.querySelector('#passwordError').textContent = 'Incorrect password. Try again.' })
  document.querySelector('#announcementForm')?.addEventListener('submit', (event) => {
    event.preventDefault()
    data.news.unshift({ date: '03 SEP 2026', title: document.querySelector('#announcementTitle').value.trim(), category: document.querySelector('#announcementCategory').value, color: 'green' })
    document.querySelector('#announcementModal').remove()
    showToast('Update published to the hub')
  })
  document.querySelectorAll('.generic-manager-form').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault()
    if (form.dataset.managerSection === 'team base') {
      const file = form.querySelector('input[type="file"]').files[0]
      const inputs = form.querySelectorAll('input')
      if (!file) { showToast('Choose a base picture or file first'); return }
      data.basePosts.unshift({ title: inputs[0].value.trim(), project: inputs[1].value.trim(), image: file.type.startsWith('image/') ? URL.createObjectURL(file) : 'https://dummyimage.com/900x560/182117/c4f36a&text=Team+Base+File', author: 'Axiom', date: '03 SEP 2026' })
      showToast('Team Base post published')
      document.querySelector('.dashboard-main').innerHTML = dashboardSectionMarkup('team base')
      bindEvents('dashboard-page')
      return
    }
    form.reset()
    showToast('Changes saved to the team hub')
  }))
  document.querySelectorAll('[data-dashboard="members"]').forEach(button => button.addEventListener('click', () => { document.querySelector('.dashboard-main').innerHTML = membersManager(); bindEvents('member-manager') }))
  document.querySelectorAll('.dashboard-nav [data-dashboard]:not([data-dashboard="members"])').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.dashboard-nav .nav-item').forEach(item => item.classList.remove('active'))
    button.classList.add('active')
    document.querySelector('.dashboard-main').innerHTML = dashboardSectionMarkup(button.dataset.dashboard)
    bindEvents('dashboard-page')
  }))
  document.querySelector('.dashboard-nav .nav-item:last-child')?.addEventListener('click', () => {
    document.querySelectorAll('.dashboard-nav .nav-item').forEach(item => item.classList.remove('active'))
    document.querySelector('.dashboard-nav .nav-item:last-child').classList.add('active')
    document.querySelector('.dashboard-main').innerHTML = dashboardSectionMarkup('website settings')
    bindEvents('dashboard-page')
  })
  document.querySelectorAll('.dashboard-main button').forEach(button => {
    if (button.dataset.bound) return
    button.dataset.bound = 'true'
    button.addEventListener('click', () => {
      if (button.id === 'newMemberButton' || button.id === 'saveMemberButton' || button.closest('#memberForm')) return
      if (button.classList.contains('back-button')) return
      const label = button.textContent.replace(/[↗+]/g, '').trim()
      if (label.includes('announcement') || label.includes('New update')) {
        document.body.insertAdjacentHTML('beforeend', announcementModal())
        bindEvents('announcement-modal')
        return
      }
      showToast(label ? `${label} selected` : 'Action completed')
    })
  })
  document.querySelectorAll('[data-manager-profile]').forEach(button => button.addEventListener('click', () => { const member = data.members.find(item => item.username === button.dataset.managerProfile); document.body.insertAdjacentHTML('beforeend', profileModal(member)); bindEvents('modal') }))
  document.querySelector('#memberForm')?.addEventListener('submit', fetchMinecraftProfile)
  document.querySelector('#saveMemberButton')?.addEventListener('click', saveFetchedMember)
  if (view === 'public' || view === 'dashboard') {
    syncDiscordStats()
    setInterval(() => {
      if (document.querySelector('.shell, .dashboard-shell')) syncDiscordStats()
    }, 5000)
  }
}

const showToast = (message) => {
  document.querySelector('.app-toast')?.remove()
  const toast = document.createElement('div')
  toast.className = 'app-toast'
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 2600)
}

const syncDiscordStats = async () => {
  try {
    const response = await fetch('/api/discord/stats')
    if (!response.ok) return
    const stats = await response.json()
    const serverTotal = document.querySelector('#discordServerCount')
    if (serverTotal && stats.serverMembers) serverTotal.textContent = `${stats.serverMembers} total Discord members`
    if (!stats.lastScan) return
    const memberCard = document.querySelector('[data-stat-index="0"]')
    if (memberCard) {
      memberCard.querySelector('.stat-value').textContent = String(stats.teamMembers).padStart(2, '0')
      memberCard.querySelector('.stat-detail').textContent = `${stats.teamMembers} members · ${stats.roleName} role synced`
    }
    const memberPageCount = document.querySelector('#memberPageCount')
    if (memberPageCount) memberPageCount.textContent = String(stats.teamMembers).padStart(2, '0')
    const status = document.querySelector('.sidebar-footer')
    if (status) status.querySelector('span').textContent = `${stats.teamMembers} members in ${stats.roleName}`
    if (stats.members?.length) {
      const publicMembers = sortMembersByRole(stats.members.map(member => ({ name: member.displayName, username: member.username, role: member.role || (member.online ? 'Discord member · online' : 'Discord member'), image: `https://mc-heads.net/avatar/${member.username}/100`, initials: member.username.slice(0, 2).toUpperCase(), className: 'avatar-1' })))
      const memberGrid = document.querySelector('#publicMemberGrid')
      if (memberGrid) memberGrid.innerHTML = publicMembers.slice(0, 8).map(memberMarkup).join('')
    }
  } catch {
    // Keep the cached display while the bot is offline.
  }
}

let fetchedMember
const fetchMinecraftProfile = async (event) => {
  event.preventDefault()
  const username = document.querySelector('#minecraftUsername').value.trim()
  const preview = document.querySelector('#profilePreview')
  preview.className = 'profile-preview loading'
  preview.innerHTML = '<span class="preview-placeholder">Looking up Mojang profile...</span>'
  try {
    const response = await fetch(`/api/mojang/${encodeURIComponent(username)}`)
    if (!response.ok) throw new Error('Minecraft account not found')
    const profile = await response.json()
    fetchedMember = { name: profile.name, username: profile.name, uuid: profile.id, role: document.querySelector('#memberRole').value, joined: document.querySelector('#memberJoinDate').value, image: `https://mc-heads.net/avatar/${profile.name}/100`, initials: profile.name.slice(0, 2).toUpperCase(), achievements: 0 }
    preview.className = 'profile-preview ready'
    preview.innerHTML = `<img src="https://crafatar.com/renders/body/${profile.id}?overlay" alt="${profile.name} Minecraft skin" /><div><strong>${profile.name}</strong><span>${fetchedMember.role}</span><small>UUID ${profile.id}</small></div>`
    document.querySelector('#saveMemberButton').disabled = false
  } catch (error) {
    fetchedMember = { name: username, username, uuid: '', role: document.querySelector('#memberRole').value, joined: document.querySelector('#memberJoinDate').value, image: '', initials: username.slice(0, 2).toUpperCase(), achievements: 0 }
    preview.className = 'profile-preview error'
    preview.innerHTML = `<div class="missing-skin"><strong>${username}</strong><span>Skin unavailable</span><small>${error.message}. You can still add this member.</small></div>`
    document.querySelector('#saveMemberButton').disabled = false
  }
}

const saveFetchedMember = () => { if (!fetchedMember) return; data.members.unshift(fetchedMember); sortMembersByRole(data.members); persistMembers(); document.querySelector('.dashboard-main').innerHTML = membersManager(); bindEvents('member-manager'); showToast(`${fetchedMember.username} added to the roster`); fetchedMember = null }
render()
