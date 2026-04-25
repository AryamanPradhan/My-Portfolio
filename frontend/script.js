// Preloader Logic — click to enter (required for browser audio policy)
const preloader = document.getElementById('preloader');
let preloaderReady = false;

// Check if we just transitioned from another page
const shouldSkipPreloader = sessionStorage.getItem('skipPreloader') === 'true';

if (shouldSkipPreloader) {
    sessionStorage.removeItem('skipPreloader');
    if (preloader) {
        preloader.style.display = 'none';
        document.body.classList.remove('loading');
        
        // Ensure navbar logo is visible
        document.addEventListener('DOMContentLoaded', () => {
            const navbarLogo = document.querySelector('.navbar .logo');
            if (navbarLogo) navbarLogo.classList.add('visible');
            
            // Try auto-play media

            
            const bgMusic = document.getElementById('bg-music');
            if (bgMusic) bgMusic.play().catch(e => console.log('Audio auto-play blocked by browser policy without interaction.'));
        });
    }
} else {
    // Wait for the intro animations (logo water fill & bg reveal) to complete
    setTimeout(() => {
        preloaderReady = true;
        if (preloader) preloader.classList.add('ready');
    }, 2000);
}

const preloaderOptions = document.querySelectorAll('.glass-btn');

preloaderOptions.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!preloaderReady) return;

        const choice = btn.getAttribute('data-choice');
        
        // Determine routing FIRST — before any animation
        const currentPath = window.location.pathname;
        const isAutomationPage = currentPath.includes('automation.html');
        const isStaying = (choice === 'automation' && isAutomationPage) || (choice === 'web' && !isAutomationPage);

        // If navigating to a DIFFERENT page, redirect immediately — no animation needed
        if (!isStaying) {
            sessionStorage.setItem('skipPreloader', 'true');
            if (choice === 'automation') {
                window.location.href = 'automation.html';
            } else {
                window.location.href = 'index.html';
            }
            return; // Stop here — don't run animation on a page we're leaving
        }

        // --- From here on, we are STAYING on the current page ---

        // Start music and video — this works because it's inside a real user click event
        const bgMusic = document.getElementById('bg-music');

        if (bgMusic) {
            bgMusic.volume = document.getElementById('volume-slider').value;
            bgMusic.play().catch(e => console.log("Music play failed:", e));
        }

        // Update music widget state
        window.__musicPlaying = true;

        // --- Logo Fly-up Animation ---
        const preloaderLogo = document.querySelector('.preloader-logo');
        const navbarLogo = document.querySelector('.navbar .logo');
        
        if (!preloaderLogo || !navbarLogo) {
            document.body.classList.remove('loading');
            preloader.style.display = 'none';
            return;
        }

        // 1. Fade out preloader background and hint
        preloader.classList.add('fade-out-bg');
        
        // 2. IMPORTANT: Stop the CSS animation and reset transform
        preloaderLogo.style.animation = 'none';
        preloaderLogo.style.transformOrigin = 'center center';
        preloaderLogo.style.willChange = 'transform, opacity';
        preloaderLogo.style.zIndex = '10000';
        preloaderLogo.style.transform = 'none'; 
        preloaderLogo.style.opacity = '1';
        
        // Force a reflow
        void preloaderLogo.offsetWidth;
        
        // 3. Calculate exact transform to match navbar logo position
        const startRect = preloaderLogo.getBoundingClientRect();
        const endRect = navbarLogo.getBoundingClientRect();
        
        const dx = (endRect.left + endRect.width / 2) - (startRect.left + startRect.width / 2);
        const dy = (endRect.top + endRect.height / 2) - (startRect.top + startRect.height / 2);
        const scale = endRect.width / startRect.width;
        
        // 4. Execute the transition
        preloaderLogo.style.transition = 'transform 2.2s cubic-bezier(0.7, 0, 0.2, 1), opacity 1s ease 1.5s, color 1.5s ease';
        preloaderLogo.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
        
        // Smoothly transition visual styles
        preloaderLogo.style.webkitTextStroke = '0px';
        preloaderLogo.style.backgroundImage = 'none';
        preloaderLogo.style.color = 'var(--text-primary)';

        setTimeout(() => {
            // 5. Seamless Swap
            preloaderLogo.style.display = 'none';
            navbarLogo.style.transition = 'none';
            navbarLogo.classList.add('visible');

            // Final Page Reveal
            document.body.classList.remove('loading');
            
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 600);

            // Trigger on-scroll reveal animations
            if (typeof revealElements !== 'undefined') {
                revealElements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight - 100) {
                        el.classList.add('active');
                    }
                });
            }
        }, 2200);
    });
});


// Scroll Reveal Animation
const revealElements = document.querySelectorAll('.reveal');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Stop observing once revealed
        }
    });
};

const revealOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => {
    revealObserver.observe(el);
});

// Navbar background change on scroll
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(5, 5, 5, 0.9)';
        navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.08)';
    } else {
        navbar.style.background = 'rgba(5, 5, 5, 0.7)';
        navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.08)';
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Offset for navbar
                behavior: 'smooth'
            });
        }
    });
});

// Dynamic stat counter animation on scroll
const statNumbers = document.querySelectorAll('.stat-number');

const animateValue = (obj, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);

        // Easing function (easeOutQuart)
        const easeOut = 1 - Math.pow(1 - progress, 4);

        let current = Math.floor(easeOut * (end - start) + start);

        // Get the span (like + or %) and append it back
        const span = obj.querySelector('span');
        const spanHtml = span ? span.outerHTML : '';

        obj.innerHTML = current + spanHtml;

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

const statsCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Find just the numeric part
            const textContent = entry.target.textContent.replace(/[^0-9]/g, '');
            const targetNumber = parseInt(textContent);

            if (!isNaN(targetNumber)) {
                animateValue(entry.target, 0, targetNumber, 2000);
            }

            observer.unobserve(entry.target);
        }
    });
};

const statsObserver = new IntersectionObserver(statsCallback, { threshold: 0.5 });

statNumbers.forEach(stat => {
    statsObserver.observe(stat);
});

// Music Player Logic
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const volumeSlider = document.getElementById('volume-slider');
const iconPlay = document.querySelector('.icon-play');
const iconPause = document.querySelector('.icon-pause');

// Set initial volume
bgMusic.volume = volumeSlider.value;

// Music state is managed by preloader click — just wire up toggle & volume

const updateMusicUI = () => {
    if (bgMusic.paused) {
        iconPlay.style.display = 'block';
        iconPause.style.display = 'none';
    } else {
        iconPlay.style.display = 'none';
        iconPause.style.display = 'block';
    }
};

bgMusic.addEventListener('play', updateMusicUI);
bgMusic.addEventListener('pause', updateMusicUI);

// Initial check in case it's already playing (autoplay)
updateMusicUI();

const toggleMusic = () => {
    if (!bgMusic.paused) {
        bgMusic.pause();
    } else {
        bgMusic.play().catch(e => console.log('Audio play failed:', e));
    }
};

musicToggle.addEventListener('click', toggleMusic);

volumeSlider.addEventListener('input', (e) => {
    bgMusic.volume = e.target.value;
});

// ── Contact Form Submission ─────────────────────────────────────────────────

// When hosted on Vercel, we use relative paths so it works for both local and production.
const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000' 
    : ''; // Empty string means use the same domain (relative path)

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Determine which page the form was submitted from
        const section = window.location.pathname.includes('automation')
            ? 'Automation'
            : 'Web Dev';

        // Collect form data
        const formData = {
            name: document.getElementById('name')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            phone: document.getElementById('phone')?.value.trim() || '',
            business: document.getElementById('business')?.value.trim() || '',
            goal: document.getElementById('goal')?.value.trim() || '',
            budget: document.getElementById('budget')?.value.trim() || '',
            message: document.getElementById('message')?.value.trim() || '',
            section: section,
            honeypot: document.getElementById('honeypot')?.value || '',
        };

        // Client-side validation
        if (!formData.name || !formData.email || !formData.phone) {
            alert('Please fill in all required fields (Name, Email, Phone).');
            return;
        }

        // 1. Name restriction (max 50 characters)
        if (formData.name.length > 50) {
            alert('Name should not exceed 50 characters.');
            return;
        }

        // 2. Email validation (regex)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // 3. Phone number validation (exactly 10 digits)
        const phoneDigits = formData.phone.replace(/\D/g, ''); // Remove non-digits
        if (phoneDigits.length !== 10) {
            alert('Phone number must be exactly 10 digits.');
            return;
        }

        // Loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        submitBtn.style.opacity = '0.7';

        try {
            const response = await fetch(`${BACKEND_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                // Success state
                submitBtn.textContent = '✓ Message Sent!';
                submitBtn.style.background = '#22c55e';
                submitBtn.style.color = '#fff';
                contactForm.reset();

                // Reset button after 3 seconds
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.style.color = '';
                    submitBtn.style.opacity = '';
                    submitBtn.disabled = false;
                }, 3000);
            } else {
                throw new Error(result.error || 'Submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);

            // Error state
            submitBtn.textContent = '✗ Failed — Try Again';
            submitBtn.style.background = '#ef4444';
            submitBtn.style.color = '#fff';

            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.style.color = '';
                submitBtn.style.opacity = '';
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}



