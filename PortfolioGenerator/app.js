const form = document.getElementById('portfolio-form');
const fileInput = document.getElementById('resume-file');
const fileDropArea = document.getElementById('file-drop-area');
const fileNameDisplay = document.getElementById('file-name');
const generateBtn = document.getElementById('generate-btn');
const loader = document.querySelector('.loader');
const btnText = document.querySelector('.btn-text');
const statusContainer = document.getElementById('status-container');
const progressFill = document.getElementById('progress-fill');
const statusText = document.getElementById('status-text');
const errorBox = document.getElementById('error-box');

const builderView = document.getElementById('builder-view');
const portfolioView = document.getElementById('portfolio-view');

// Drag and Drop Handling
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, () => fileDropArea.classList.add('dragover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, () => fileDropArea.classList.remove('dragover'), false);
});

fileDropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if(files.length > 0) {
        fileInput.files = files;
        updateFileName();
    }
}

fileInput.addEventListener('change', updateFileName);

function updateFileName() {
    if(fileInput.files.length > 0) {
        let name = fileInput.files[0].name;
        fileNameDisplay.textContent = `Selected: ${name}`;
        errorBox.classList.add('hidden');
    }
}

// Form Submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const apiKey = document.getElementById('groq-key').value.trim();
    const file = fileInput.files[0];
    
    if(!file) {
        showError("Please upload a PDF resume.");
        return;
    }
    
    if(!apiKey.startsWith('gsk_')) {
        showError("Please provide a valid Groq API Key.");
        return;
    }

    try {
        setLoadingState(true);
        
        // Step 1: Read PDF Text
        updateStatus(10, 'Reading PDF document...');
        const pdfText = await extractTextFromPDF(file);
        
        if(!pdfText || pdfText.trim() === '') {
            throw new Error("Could not extract any text from the PDF.");
        }
        
        // Step 2: Ask Groq AI to parse and format
        updateStatus(50, 'Analyzing resume with Groq AI...');
        const portfolioData = await parseResumeWithGroq(pdfText, apiKey);
        
        // Step 3: Hydrate Portfolio UI
        updateStatus(90, 'Generating immersive portfolio...');
        hydratePortfolio(portfolioData);
        
        // Step 4: Show Final Result
        updateStatus(100, 'Complete!');
        setTimeout(() => {
            builderView.classList.remove('active');
            builderView.classList.add('hidden');
            portfolioView.classList.remove('hidden');
            portfolioView.classList.add('active');
        }, 500);
        
    } catch (err) {
        console.error(err);
        showError(err.message || 'An error occurred during generation.');
    } finally {
        setLoadingState(false);
    }
});

function setLoadingState(isLoading) {
    if(isLoading) {
        generateBtn.disabled = true;
        btnText.style.opacity = '0.5';
        loader.classList.remove('hidden');
        statusContainer.classList.remove('hidden');
        errorBox.classList.add('hidden');
        progressFill.style.width = '0%';
    } else {
        generateBtn.disabled = false;
        btnText.style.opacity = '1';
        loader.classList.add('hidden');
    }
}

function updateStatus(percent, text) {
    progressFill.style.width = `${percent}%`;
    statusText.textContent = text;
}

function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
}

async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    // Using pdf.js standard parsing
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    const pdf = await loadingTask.promise;
    
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        text += strings.join(' ') + '\n';
    }
    return text;
}

async function parseResumeWithGroq(resumeText, apiKey) {
    const systemPrompt = `You are an expert resume parser and technical web copywriter. 
Extract the user's information from the raw PDF text provided.
Return ONLY pure JSON matching this exact structure, with no markdown codeblocks, no formatting, just raw JSON:
{
  "name": "Full Name",
  "role": "Current or desired role (e.g. Full Stack Developer)",
  "summary": "A punchy, modern 2-3 sentence professional summary",
  "social_links": [
    { "platform": "github | linkedin | codeforces | email | phone | website", "url": "MUST BE A VALID FULL URL. e.g. https://github.com/username. If only username is given, construct the full https URL!" }
  ],
  "about": "A detailed paragraph for the about me section.",
  "contact_intro": "I'm always open to new opportunities, collaborations, or just a friendly chat about competitive programming and tech.",
  "achievements": {
    "top_cards": [ { "title": "Rank/Award (e.g. Candidate Master)", "subtitle": "Platform (e.g. Codeforces)", "icon_type": "trophy | star | target | medal" } ],
    "highlights": [ "Additional achievement point 1", "Additional achievement point 2" ]
  },
  "skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"],
  "experience": [
    { 
      "title": "Job Title", 
      "company": "Company Name", 
      "date": "Date Range", 
      "description": ["Action-oriented point 1", "Action-oriented point 2"] 
    }
  ],
  "projects": [
    { 
      "title": "Project Name", 
      "technologies": ["Tech1", "Tech2"], 
      "description": "A compelling 1-2 sentence description of the project" 
    }
  ],
  "education": [
    { "degree": "Degree", "institution": "School", "date": "Date Range", "description": "GPA or honors (optional)" }
  ]
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: resumeText }
            ],
            temperature: 0.2,
        })
    });

    if (!response.ok) {
        const errData = await response.json().catch(()=>({}));
        throw new Error(errData.error?.message || `Groq API Error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Clean up potential markdown blocks if AI ignored instructions
    if(content.startsWith('```json')) {
        content = content.replace(/^```json/, '').replace(/```$/, '');
    } else if (content.startsWith('```')) {
        content = content.replace(/^```/, '').replace(/```$/, '');
    }

    try {
        return JSON.parse(content);
    } catch(e) {
        console.error("Failed to parse JSON", content);
        throw new Error("The AI returned invalid format. Please try again.");
    }
}

function hydratePortfolio(data) {
    // Nav Brand Initials
    const initials = data.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    document.getElementById('nav-initials').textContent = initials;
    
    // Hero Section
    // About
    // Hero Section
    document.getElementById('port-name').textContent = data.name;
    document.getElementById('port-role').textContent = data.role;
    document.getElementById('port-summary').textContent = data.summary;
    
    // Social Links
    const socialContainer = document.getElementById('social-links-container');
    if (socialContainer) {
        socialContainer.innerHTML = '';
        if (data.social_links && data.social_links.length > 0) {
            const svgs = {
                'github': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
                'linkedin': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
                'codeforces': `<span style="font-weight: 800; font-family: var(--font-heading); font-size: 14px;">CF</span>`,
                'email': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
                'website': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
                'default': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`
            };
            
            data.social_links.forEach(link => {
                let p = link.platform.toLowerCase();
                let iconStr = svgs[p] || svgs['default'];
                let href = link.url;
                if(p === 'email' && !href.startsWith('mailto:') && !href.startsWith('http')) {
                    href = 'mailto:' + href;
                }
                socialContainer.innerHTML += `<a href="${href}" target="_blank" rel="noopener noreferrer" class="social-icon" title="${link.platform}">${iconStr}</a>`;
            });
        }
    }

    document.getElementById('port-about-content').innerHTML = `<p>${data.about}</p>`;
    
    // Skills
    const skillsContainer = document.getElementById('port-skills');
    skillsContainer.innerHTML = '';
    (data.skills || []).forEach(skill => {
        const span = document.createElement('span');
        span.className = 'skill-tag';
        span.textContent = skill;
        skillsContainer.appendChild(span);
    });
    
    // Achievements
    if (data.achievements) {
        const achSection = document.getElementById('achievements');
        const cardsContainer = document.getElementById('port-achievements-cards');
        const highlightsPanel = document.getElementById('port-highlights-panel');
        const highlightsList = document.getElementById('port-highlights-list');
        
        let hasAchievements = false;
        
        if (data.achievements.top_cards && data.achievements.top_cards.length > 0) {
            hasAchievements = true;
            cardsContainer.innerHTML = '';
            
            const getIcon = (type) => {
                if(type === 'star') return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
                if(type === 'target') return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`;
                if(type === 'medal') return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`;
                return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M8 21h8"></path><path d="M12 17v4"></path><path d="M7 4h10v6a5 5 0 0 1-10 0V4"></path><path d="M7 6H4a2 2 0 0 0-2 2v2a5 5 0 0 0 5 5h.5"></path><path d="M17 6h3a2 2 0 0 1 2 2v2a5 5 0 0 1-5 5h-.5"></path></svg>`; // trophy
            };
            
            data.achievements.top_cards.forEach(card => {
                let iconClass = 'ach-trophy';
                let lowerType = (card.icon_type || '').toLowerCase();
                if(lowerType.includes('star')) iconClass = 'ach-star';
                if(lowerType.includes('target')) iconClass = 'ach-target';
                if(lowerType.includes('medal')) iconClass = 'ach-medal';
                
                cardsContainer.innerHTML += `
                    <div class="achievement-card">
                        <div class="ach-icon-wrapper ${iconClass}">
                            ${getIcon(lowerType)}
                        </div>
                        <div class="ach-title">${card.title}</div>
                        <div class="ach-subtitle">${card.subtitle}</div>
                    </div>
                `;
            });
        }
        
        if (data.achievements.highlights && data.achievements.highlights.length > 0) {
            hasAchievements = true;
            highlightsPanel.style.display = 'block';
            highlightsList.innerHTML = data.achievements.highlights.map(h => `<li>${h}</li>`).join('');
        }
        
        if (hasAchievements) {
            achSection.style.display = 'block';
            achSection.classList.remove('hidden');
        }
    }
    
    // Contact Section
    const contactSection = document.getElementById('contact');
    if (contactSection && data.contact_intro) {
        document.getElementById('port-contact-message').textContent = data.contact_intro;
    }
    const contactLinksContainer = document.getElementById('port-contact-links');
    if (contactLinksContainer) {
        contactLinksContainer.innerHTML = '';
        
        let primaryEmail = 'hello@example.com';
        
        if(data.social_links && data.social_links.length > 0) {
            const contactIcons = {
                'email': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
                'phone': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
                'github': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
                'linkedin': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
                'codeforces': `<span style="font-weight: 800; font-family: var(--font-heading); font-size: 14px;">CF</span>`,
                'default': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`
            };
            
            data.social_links.forEach(link => {
                let p = link.platform.toLowerCase();
                let iconStr = contactIcons[p] || contactIcons['default'];
                let href = link.url;
                let displayValue = href;
                
                if(p === 'email') {
                    if(!href.startsWith('mailto:')) href = 'mailto:' + href;
                    displayValue = link.url.replace('mailto:', '');
                    primaryEmail = displayValue;
                } else if (p === 'phone') {
                    if(!href.startsWith('tel:')) href = 'tel:' + href;
                    displayValue = link.url;
                } else {
                    try {
                        let urlObj = new URL(href);
                        displayValue = urlObj.pathname.replace(/^[/]+|[/]+$/g, '');
                        if(!displayValue) displayValue = urlObj.hostname;
                    } catch(e) {
                        displayValue = p === 'codeforces' ? link.url : link.url;
                    }
                }
                
                contactLinksContainer.innerHTML += `
                    <a href="${href}" target="_blank" rel="noopener noreferrer" class="contact-item">
                        <div class="contact-item-icon">${iconStr}</div>
                        <span>${displayValue}</span>
                    </a>
                `;
            });
        }
        
        // Form handling
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.onsubmit = function(e) {
                e.preventDefault();
                const cName = document.getElementById('contact-name').value;
                const cEmail = document.getElementById('contact-email').value;
                const cMsg = document.getElementById('contact-message').value;
                
                const mailtoUrl = `mailto:${primaryEmail}?subject=Contact from ${encodeURIComponent(cName)}&body=${encodeURIComponent(cMsg + "\n\nFrom: " + cName + " (" + cEmail + ")")}`;
                window.location.href = mailtoUrl;
            };
        }
    }

    // Experience
    const expContainer = document.getElementById('port-experience');
    expContainer.innerHTML = '';
    (data.experience || []).forEach(exp => {
        const tDesc = exp.description.map(d => `<li>${d}</li>`).join('');
        expContainer.innerHTML += `
            <div class="timeline-item glass-panel">
                <div class="timeline-dot"></div>
                <div class="timeline-date">${exp.date}</div>
                <div class="timeline-title">${exp.title}</div>
                <div class="timeline-org">${exp.company}</div>
                <div class="timeline-desc"><ul>${tDesc}</ul></div>
            </div>
        `;
    });
    
    // Projects
    const projContainer = document.getElementById('port-projects');
    projContainer.innerHTML = '';
    (data.projects || []).forEach(proj => {
        const techs = proj.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('');
        projContainer.innerHTML += `
            <div class="glass-panel project-card">
                <div class="project-title">${proj.title}</div>
                <div class="project-desc">${proj.description}</div>
                <div class="project-tech">${techs}</div>
            </div>
        `;
    });
    
    // Education
    const eduContainer = document.getElementById('port-education');
    eduContainer.innerHTML = '';
    if(!data.education || data.education.length === 0) {
        document.getElementById('education').style.display = 'none';
    } else {
        data.education.forEach(edu => {
            eduContainer.innerHTML += `
                <div class="timeline-item glass-panel">
                    <div class="timeline-dot"></div>
                    <div class="timeline-date">${edu.date}</div>
                    <div class="timeline-title">${edu.degree}</div>
                    <div class="timeline-org">${edu.institution}</div>
                    ${edu.description ? `<div class="timeline-desc">${edu.description}</div>` : ''}
                </div>
            `;
        });
    }
}

// 3D Wave Effect Background
const waveCanvas = document.createElement('canvas');
waveCanvas.id = 'wave-canvas';
document.body.insertBefore(waveCanvas, document.body.firstChild);
const waveCtx = waveCanvas.getContext('2d');

let wWidth, wHeight;
let waveSquares = [];
const W_GAP = 40;
const W_SIZE = 4;
let wMouseX = window.innerWidth / 2;
let wMouseY = window.innerHeight / 2;

function initWaveCanvas() {
    wWidth = waveCanvas.width = window.innerWidth;
    wHeight = waveCanvas.height = window.innerHeight;
    waveSquares = [];
    for (let y = 0; y < wHeight + W_GAP; y += W_GAP) {
        for (let x = 0; x < wWidth + W_GAP; x += W_GAP) {
            waveSquares.push({ x, y, baseX: x, baseY: y });
        }
    }
}

window.addEventListener('resize', initWaveCanvas);
window.addEventListener('mousemove', (e) => {
    wMouseX = e.clientX;
    wMouseY = e.clientY;
});

function animateWave() {
    waveCtx.clearRect(0, 0, wWidth, wHeight);
    let time = Date.now() * 0.0008; // Slower wave motion
    
    for (let sq of waveSquares) {
        let dx = wMouseX - sq.baseX;
        let dy = wMouseY - sq.baseY;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        let wave = Math.sin(sq.baseX * 0.01 + time) * Math.cos(sq.baseY * 0.01 + time) * 15;
        let mouseInfluence = Math.max(0, 150 - dist) * 0.15;
        let z = wave + mouseInfluence;
        
        let scale = Math.max(0.5, 1 + z * 0.04); 
        
        let alpha = 0.1 + (scale * 0.15);
        if(alpha > 1) alpha = 1;
        if(alpha < 0) alpha = 0;
        
        let color = (z + mouseInfluence) > 5 ? `rgba(6, 182, 212, ${alpha})` : `rgba(168, 85, 247, ${alpha})`;
        
        waveCtx.fillStyle = color;
        let renderSize = W_SIZE * scale;
        
        let renderX = sq.baseX - renderSize / 2;
        let renderY = sq.baseY - z * 2 - renderSize / 2; 
        
        waveCtx.fillRect(renderX, renderY, renderSize, renderSize);
    }
    requestAnimationFrame(animateWave);
}

initWaveCanvas();
animateWave();
