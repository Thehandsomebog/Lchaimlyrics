/**
 * L'Chaim Lyrics - Main JavaScript
 * Handles audio player functionality and UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initAudioPlayers();
    initSmoothScroll();
    initNavbarScroll();
    initHowItWorksMotion();
    initMobileNav();
    initLanguageSwitcher();
    initQuestionnairePage();
    initThankYouPage();
    initFunnelTracking();
});

/**
 * Audio Player Functionality
 * Audio is lazy-loaded on first interaction for better performance
 */
function initAudioPlayers() {
    const playButtons = document.querySelectorAll('.play-btn');
    let currentAudio = null;
    let playRequest = 0;
    const players = new Set(document.querySelectorAll('audio'));
    const activatePlayer = player => {
        players.forEach(other => {
            if (other !== player) other.pause();
        });
        currentAudio = player;
    };

    players.forEach(player => {
        let sampleTracked = false;
        player.addEventListener('play', () => {
            playRequest += 1;
            activatePlayer(player);
            if (!sampleTracked && player.dataset.sampleId && typeof gtag === 'function') {
                gtag('event', 'sample_play', { sample_id: player.dataset.sampleId });
                sampleTracked = true;
            }
        });
    });

    playButtons.forEach(button => {
        const audioSrc = button.dataset.audio;
        const songTitle = button.dataset.title || 'song preview';
        let audio = null; // Lazy-loaded on first click
        const card = button.closest('.song-card');
        const progressInput = card?.querySelector('.progress-input');
        const timeDisplay = card?.querySelector('.time-display');
        if (!audioSrc || !card || !progressInput || !timeDisplay) return;
        const playIcon = button.querySelector('.play-icon');
        const pauseIcon = button.querySelector('.pause-icon');
        const status = document.createElement('p');
        status.className = 'audio-status';
        status.setAttribute('role', 'status');
        card.append(status);
        let sampleTracked = false;
        const showError = () => {
            setButtonPlaying(button, false, songTitle);
            button.removeAttribute('aria-busy');
            status.textContent = 'This sample could not play. Please try again or choose another sample.';
        };
        setProgressVisual(progressInput, 0);
        updateProgressAccessibility(progressInput, 0, 0, songTitle);

        // Initialize audio on first interaction
        function getAudio() {
            if (!audio) {
                audio = new Audio(encodeURI(audioSrc));
                audio.preload = 'none';
                players.add(audio);
                audio.addEventListener('pause', () => setButtonPlaying(button, false, songTitle));
                audio.addEventListener('error', showError);

                audio.addEventListener('loadedmetadata', () => {
                    updateProgressAccessibility(progressInput, audio.currentTime, audio.duration, songTitle);
                });

                // Update progress bar as audio plays
                audio.addEventListener('timeupdate', () => {
                    const progress = (audio.currentTime / audio.duration) * 100;
                    progressInput.value = progress || 0;
                    setProgressVisual(progressInput, progress || 0);
                    updateProgressAccessibility(progressInput, audio.currentTime, audio.duration, songTitle);
                    timeDisplay.textContent = formatTime(audio.currentTime);
                });

                // Reset when audio ends
                audio.addEventListener('ended', () => {
                    resetButton(button, playIcon, pauseIcon, songTitle);
                    progressInput.value = 0;
                    setProgressVisual(progressInput, 0);
                    updateProgressAccessibility(progressInput, 0, audio.duration, songTitle);
                    timeDisplay.textContent = '0:00';
                    if (currentAudio === audio) currentAudio = null;
                });
            }
            return audio;
        }

        // Handle play/pause click
        button.addEventListener('click', async () => {
            const playerAudio = getAudio();
            const request = ++playRequest;
            status.textContent = '';
            if (!playerAudio.paused || button.hasAttribute('aria-busy')) {
                playerAudio.pause();
                button.removeAttribute('aria-busy');
                setButtonPlaying(button, false, songTitle);
                return;
            }

            activatePlayer(playerAudio);
            button.setAttribute('aria-busy', 'true');
            try {
                await playerAudio.play();
                if (request !== playRequest) {
                    playerAudio.pause();
                    return;
                }
                setButtonPlaying(button, true, songTitle);
                if (!sampleTracked && typeof gtag === 'function') {
                    gtag('event', 'sample_play', { sample_id: button.dataset.sampleId || 'preview' });
                    sampleTracked = true;
                }
            } catch (error) {
                if (request === playRequest) showError();
            } finally {
                button.removeAttribute('aria-busy');
            }
        });

        progressInput.addEventListener('input', () => {
            const playerAudio = getAudio();
            if (playerAudio.duration) {
                const percent = Number(progressInput.value) / 100;
                playerAudio.currentTime = percent * playerAudio.duration;
                setProgressVisual(progressInput, Number(progressInput.value));
                updateProgressAccessibility(progressInput, playerAudio.currentTime, playerAudio.duration, songTitle);
                timeDisplay.textContent = formatTime(playerAudio.currentTime);
            }
        });
    });
}

/**
 * Reset play button to initial state
 */
function setButtonPlaying(button, isPlaying, songTitle) {
    const card = button.closest('.song-card');

    button.classList.toggle('is-playing', isPlaying);
    card?.classList.toggle('is-playing', isPlaying);
    button.setAttribute('aria-pressed', String(isPlaying));
    button.setAttribute('aria-label', `${isPlaying ? 'Pause' : 'Play'} preview of ${songTitle}`);
}

function resetButton(button, playIcon, pauseIcon, songTitle) {
    setButtonPlaying(button, false, songTitle);
}

/**
 * Format time in M:SS format
 */
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function setProgressVisual(progressInput, percent) {
    const clampedPercent = Math.max(0, Math.min(100, percent));
    progressInput.style.background = `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${clampedPercent}%, rgba(10, 36, 99, 0.12) ${clampedPercent}%, rgba(10, 36, 99, 0.12) 100%)`;
}

function updateProgressAccessibility(progressInput, currentTime, duration, songTitle) {
    const currentLabel = formatAccessibleTime(currentTime);
    if (!duration || isNaN(duration)) {
        progressInput.setAttribute('aria-valuetext', `${songTitle} at ${currentLabel}`);
        return;
    }

    const durationLabel = formatAccessibleTime(duration);
    progressInput.setAttribute('aria-valuetext', `${songTitle} at ${currentLabel} of ${durationLabel}`);
}

function formatAccessibleTime(seconds) {
    if (isNaN(seconds) || seconds <= 0) return '0 seconds';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    if (mins === 0) {
        return `${secs} second${secs === 1 ? '' : 's'}`;
    }

    return `${mins} minute${mins === 1 ? '' : 's'} ${secs} second${secs === 1 ? '' : 's'}`;
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const hash = this.getAttribute('href');
            if (!hash || hash === '#') return;
            let target;
            try { target = document.getElementById(decodeURIComponent(hash.slice(1))); }
            catch { return; }
            if (target) {
                e.preventDefault();
                const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
                if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
                window.history.pushState(null, '', hash);

                window.scrollTo({
                    top: targetPosition,
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
                });
            }
        });
    });
}

/**
 * Add shadow to navbar on scroll
 */
function initNavbarScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.boxShadow = '0 2px 20px rgba(10, 36, 99, 0.1)';
        } else {
            nav.style.boxShadow = 'none';
        }
    });
}

function initHowItWorksMotion() {
    const sections = document.querySelectorAll('.how-it-works');
    if (!sections.length) return;

    if (!('IntersectionObserver' in window)) {
        sections.forEach(section => {
            section.classList.add('how-it-works-motion-ready', 'is-visible');
        });
        return;
    }

    const observer = new IntersectionObserver((entries, activeObserver) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('is-visible');
            activeObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px'
    });

    sections.forEach(section => {
        section.classList.add('how-it-works-motion-ready');
        observer.observe(section);
    });
}

/**
 * Mobile navigation toggle
 */
function initMobileNav() {
    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.nav-toggle');
    const panel = nav?.querySelector('.nav-mobile-panel');

    if (!nav || !toggle || !panel) return;
    panel.id ||= 'mobile-navigation';
    toggle.setAttribute('aria-controls', panel.id);

    const setNavState = (isOpen) => {
        nav.classList.toggle('nav-open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        panel.toggleAttribute('inert', !isOpen);
        panel.setAttribute('aria-hidden', String(!isOpen));
    };

    setNavState(false);

    const closeNav = () => setNavState(false);

    toggle.addEventListener('click', () => {
        setNavState(!nav.classList.contains('nav-open'));
    });

    nav.querySelectorAll('.nav-mobile-links a, .nav-mobile-cta').forEach(link => {
        link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && nav.classList.contains('nav-open')) {
            closeNav();
            toggle.focus();
        }
    });
    document.addEventListener('click', event => {
        if (!nav.contains(event.target)) closeNav();
    });
    nav.addEventListener('focusout', event => {
        if (event.relatedTarget && !nav.contains(event.relatedTarget)) closeNav();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeNav();
        }
    });
}

function initLanguageSwitcher() {
    if (typeof initHomepageLanguageSwitcher === 'function') {
        initHomepageLanguageSwitcher();
        return;
    }
    // Other pages remain English; the language menu explicitly links to translated homepages.
    document.querySelectorAll('[data-language-switcher]').forEach(switcher => {
        const toggle = switcher.querySelector('.language-toggle');
        const menu = switcher.querySelector('.language-menu');
        if (!toggle || !menu) return;
        toggle.setAttribute('aria-label', 'Choose homepage language');
        const close = () => {
            menu.hidden = true;
            switcher.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        };
        toggle.addEventListener('click', () => {
            const opening = menu.hidden;
            close();
            if (opening) {
                menu.hidden = false;
                switcher.classList.add('is-open');
                toggle.setAttribute('aria-expanded', 'true');
            }
        });
        switcher.querySelectorAll('[data-language-option]').forEach(option => {
            option.append(' — homepage');
            option.addEventListener('click', () => {
                const lang = option.dataset.languageOption;
                if (['en', 'fr', 'he', 'es'].includes(lang)) window.location.assign(`/?lang=${lang}`);
            });
        });
        document.addEventListener('click', event => {
            if (!switcher.contains(event.target)) close();
        });
        switcher.addEventListener('keydown', event => {
            if (event.key === 'Escape') { close(); toggle.focus(); }
        });
    });
}

function initThankYouPage() {
    const page = document.querySelector('[data-thank-you-page]');
    if (!page) return;
    // URL parameters are not proof of payment. Only a trusted payment integration may report revenue.
    revealThankYouConfirmation(page);
}

function revealThankYouConfirmation(thankYouPage) {
    window.requestAnimationFrame(() => {
        thankYouPage.classList.add('thank-you-motion-ready');
    });
}

function initQuestionnairePage() {
    const questionnairePage = document.querySelector('[data-questionnaire-page]');
    if (!questionnairePage) return;

    const params = new URLSearchParams(window.location.search);
    const plan = getSongPlan(params.get('plan'));
    const tallySection = document.querySelector('[data-tally-url]');
    const tallyLink = document.querySelector('[data-tally-link]');
    const tallyStatus = document.querySelector('[data-tally-status]');
    const rawTallyUrl = tallySection ? tallySection.dataset.tallyUrl : '';
    const tallyUrl = buildQuestionnaireUrl(rawTallyUrl, plan);

    setText('[data-selected-plan-name]', plan.known ? plan.name : 'Choose after the brief');
    setText('[data-selected-plan-delivery]', plan.known ? plan.delivery : 'Based on package');
    highlightSelectedPlan(plan.key);
    revealQuestionnairePackageSummary(questionnairePage, Boolean(plan.known));

    if (!tallyLink) return;

    if (!tallyUrl) {
        tallyLink.textContent = 'Email Us for the Questionnaire';
        tallyLink.setAttribute('href', 'mailto:hello@lchaimlyrics.com?subject=L%27Chaim%20Lyrics%20Questionnaire%20Link');
        tallyLink.removeAttribute('target');
        tallyLink.removeAttribute('rel');
        return;
    }

    tallyLink.textContent = 'Open Questionnaire';
    tallyLink.setAttribute('href', tallyUrl);
    tallyLink.setAttribute('target', '_self');
    tallyLink.removeAttribute('rel');

    if (tallyStatus) {
        tallyStatus.textContent = 'The questionnaire opens as a full page so Tally can redirect you cleanly to Stripe after you choose a package.';
    }
}

function revealQuestionnairePackageSummary(questionnairePage, hasSelectedPlan) {
    questionnairePage.classList.toggle('has-selected-plan', hasSelectedPlan);

    window.requestAnimationFrame(() => {
        questionnairePage.classList.add('questionnaire-motion-ready');
    });
}

function buildQuestionnaireUrl(rawUrl, plan) {
    const sanitizedUrl = sanitizeQuestionnaireUrl(rawUrl);
    if (!sanitizedUrl) return '';

    try {
        const parsedUrl = new URL(sanitizedUrl);
        if (plan && plan.known) {
            parsedUrl.searchParams.set('plan', plan.key);
            parsedUrl.searchParams.set('package', plan.name);
        }
        parsedUrl.searchParams.set('source', 'lchaimlyrics');
        return parsedUrl.toString();
    } catch (error) {
        return '';
    }
}

function highlightSelectedPlan(planKey) {
    document.querySelectorAll('[data-plan-card]').forEach(card => {
        card.classList.toggle('plan-selected', card.dataset.planCard === planKey);
    });
}

function initFunnelTracking() {
    // Uses the existing GA4 tag; no personal details or complete query strings are sent.
    document.querySelectorAll('a[href]').forEach(link => {
        let destination;
        try { destination = new URL(link.href, window.location.origin); } catch { return; }
        const isBrief = destination.origin === 'https://tally.so' && destination.pathname === '/r/QK7l77';
        const isCheckout = destination.origin === 'https://buy.stripe.com' && link.hasAttribute('data-payment-plan');
        if (!isBrief && !isCheckout) return;
        link.addEventListener('click', () => {
            if (typeof gtag !== 'function') return;
            const plan = getSongPlan(link.dataset.paymentPlan || destination.searchParams.get('plan'));
            gtag('event', isCheckout ? 'begin_checkout' : 'questionnaire_started', {
                plan: plan.known ? plan.key : 'undecided'
            });
        });
    });
}

function getSongPlan(rawPlan) {
    const normalizedPlan = normalizePlanKey(rawPlan);
    const aliases = {
        essential: 'essential',
        simcha: 'simcha-special',
        'simcha-special': 'simcha-special',
        simchaspecial: 'simcha-special',
        ldor: 'ldor-vdor',
        'ldor-vdor': 'ldor-vdor',
        'ldor-v-dor': 'ldor-vdor',
        'l-dor-v-dor': 'ldor-vdor'
    };

    const planKey = aliases[normalizedPlan] || normalizedPlan;
    const plans = {
        essential: {
            key: 'essential',
            name: 'Essential',
            known: true,
            delivery: '48 hours'
        },
        'simcha-special': {
            key: 'simcha-special',
            name: 'Simcha Special',
            known: true,
            delivery: '48 hours'
        },
        'ldor-vdor': {
            key: 'ldor-vdor',
            name: "L'Dor V'Dor",
            known: true,
            delivery: '24-hour priority delivery'
        }
    };

    return plans[planKey] || {
        key: 'custom-song',
        name: 'custom song',
        known: false,
        delivery: '48 hours'
    };
}

function normalizePlanKey(value) {
    if (!value) return '';

    return value
        .toLowerCase()
        .replace(/['’]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function sanitizeQuestionnaireUrl(rawUrl) {
    if (!rawUrl) return '';

    try {
        const parsedUrl = new URL(rawUrl, window.location.origin);
        const isSameOrigin = parsedUrl.origin === window.location.origin;
        const isTallyUrl = parsedUrl.hostname === 'tally.so' || parsedUrl.hostname.endsWith('.tally.so');

        if (!isSameOrigin && parsedUrl.protocol !== 'https:') {
            return '';
        }

        if (isSameOrigin || isTallyUrl) {
            return parsedUrl.toString();
        }

        return '';
    } catch (error) {
        return '';
    }
}

function setText(selector, value) {
    document.querySelectorAll(selector).forEach(element => {
        element.textContent = value;
    });
}
