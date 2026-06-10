/**
 * L'Chaim Lyrics - Main JavaScript
 * Handles audio player functionality and UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initAudioPlayers();
    initSmoothScroll();
    initNavbarScroll();
    initMobileNav();
    initQuestionnairePage();
    initThankYouPage();
});

/**
 * Audio Player Functionality
 * Audio is lazy-loaded on first interaction for better performance
 */
function initAudioPlayers() {
    const playButtons = document.querySelectorAll('.play-btn');
    let currentAudio = null;
    let currentButton = null;

    playButtons.forEach(button => {
        const audioSrc = button.dataset.audio;
        const songTitle = button.dataset.title || 'song preview';
        let audio = null; // Lazy-loaded on first click
        const card = button.closest('.song-card');
        const progressInput = card.querySelector('.progress-input');
        const timeDisplay = card.querySelector('.time-display');
        const playIcon = button.querySelector('.play-icon');
        const pauseIcon = button.querySelector('.pause-icon');
        setProgressVisual(progressInput, 0);
        updateProgressAccessibility(progressInput, 0, 0, songTitle);

        // Initialize audio on first interaction
        function getAudio() {
            if (!audio) {
                audio = new Audio(encodeURI(audioSrc));

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
                    currentAudio = null;
                    currentButton = null;
                });
            }
            return audio;
        }

        // Handle play/pause click
        button.addEventListener('click', () => {
            const playerAudio = getAudio();

            // If clicking on a different song, pause the current one
            if (currentAudio && currentAudio !== playerAudio) {
                currentAudio.pause();
                resetButton(currentButton,
                    currentButton.querySelector('.play-icon'),
                    currentButton.querySelector('.pause-icon'),
                    currentButton.dataset.title || 'song preview'
                );
            }

            if (playerAudio.paused) {
                playerAudio.play().catch(err => {
                    console.log('Audio playback failed:', err);
                });
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
                button.setAttribute('aria-pressed', 'true');
                button.setAttribute('aria-label', `Pause preview of ${songTitle}`);
                currentAudio = playerAudio;
                currentButton = button;
            } else {
                playerAudio.pause();
                resetButton(button, playIcon, pauseIcon, songTitle);
                currentAudio = null;
                currentButton = null;
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
function resetButton(button, playIcon, pauseIcon, songTitle) {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', `Play preview of ${songTitle}`);
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
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.nav-container').offsetHeight;
                const targetPosition = target.offsetTop - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
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

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.boxShadow = '0 2px 20px rgba(10, 36, 99, 0.1)';
        } else {
            nav.style.boxShadow = 'none';
        }
    });
}

/**
 * Mobile navigation toggle
 */
function initMobileNav() {
    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.nav-toggle');

    if (!nav || !toggle) return;

    const closeNav = () => {
        nav.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('.nav-mobile-links a, .nav-mobile-cta').forEach(link => {
        link.addEventListener('click', closeNav);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeNav();
        }
    });
}

function initThankYouPage() {
    const thankYouPage = document.querySelector('[data-thank-you-page]');
    if (!thankYouPage) return;

    const params = new URLSearchParams(window.location.search);
    const plan = getThankYouPlan(params.get('plan'));
    const value = getPurchaseValue(params.get('value'), plan.value);
    const transactionId = ensureThankYouTransactionId(params);
    const questionnaireUrl = sanitizeQuestionnaireUrl(params.get('form') || params.get('questionnaire'));
    const questionnaireLink = document.querySelector('[data-questionnaire-link]');
    const redirectNote = document.querySelector('[data-redirect-note]');
    const redirectCountdown = document.querySelector('[data-redirect-countdown]');
    const fallbackNote = document.querySelector('[data-questionnaire-fallback]');

    setText('[data-plan-name]', plan.name);
    setText('[data-plan-price]', value ? formatCurrency(value) : 'Custom pricing');
    setText('[data-plan-delivery]', plan.delivery);

    trackThankYouPurchase({
        currency: getPurchaseCurrency(params.get('currency')),
        itemName: plan.name,
        itemId: plan.key,
        transactionId,
        value
    });

    if (!questionnaireLink) return;

    questionnaireLink.addEventListener('click', () => {
        if (typeof gtag !== 'function') return;

        gtag('event', 'intake_form_started', {
            plan: plan.key,
            destination: questionnaireUrl ? 'questionnaire' : 'support'
        });
    });

    if (!questionnaireUrl) {
        questionnaireLink.textContent = 'Email Us For Your Questionnaire';
        questionnaireLink.setAttribute('href', 'mailto:hello@lchaimlyrics.com?subject=L%27Chaim%20Lyrics%20Questionnaire%20Help');
        questionnaireLink.removeAttribute('target');
        questionnaireLink.removeAttribute('rel');

        if (redirectNote) {
            redirectNote.hidden = true;
        }

        if (fallbackNote) {
            fallbackNote.hidden = false;
        }

        return;
    }

    questionnaireLink.setAttribute('href', questionnaireUrl);
    questionnaireLink.setAttribute('target', '_self');

    if (!redirectNote || !redirectCountdown) return;

    let secondsRemaining = Number(redirectCountdown.textContent) || 5;
    const redirectTimer = window.setInterval(() => {
        secondsRemaining -= 1;

        if (secondsRemaining <= 0) {
            window.clearInterval(redirectTimer);
            window.location.assign(questionnaireUrl);
            return;
        }

        redirectCountdown.textContent = String(secondsRemaining);
    }, 1000);

    questionnaireLink.addEventListener('click', () => {
        window.clearInterval(redirectTimer);
    }, { once: true });
}

function initQuestionnairePage() {
    const questionnairePage = document.querySelector('[data-questionnaire-page]');
    if (!questionnairePage) return;

    const params = new URLSearchParams(window.location.search);
    const plan = getThankYouPlan(params.get('plan'));
    const tallySection = document.querySelector('[data-tally-url]');
    const tallyLink = document.querySelector('[data-tally-link]');
    const tallyStatus = document.querySelector('[data-tally-status]');
    const rawTallyUrl = tallySection ? tallySection.dataset.tallyUrl : '';
    const tallyUrl = buildQuestionnaireUrl(rawTallyUrl, plan);

    setText('[data-selected-plan-name]', plan.value ? plan.name : 'Choose after the brief');
    setText('[data-selected-plan-delivery]', plan.value ? plan.delivery : 'Based on package');
    highlightSelectedPlan(plan.key);
    trackQuestionnaireStartClicks(plan.key);

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

function buildQuestionnaireUrl(rawUrl, plan) {
    const sanitizedUrl = sanitizeQuestionnaireUrl(rawUrl);
    if (!sanitizedUrl) return '';

    try {
        const parsedUrl = new URL(sanitizedUrl);
        if (plan && plan.value) {
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

function trackQuestionnaireStartClicks(planKey) {
    if (typeof gtag !== 'function') return;

    document.querySelectorAll('[data-tally-link], [data-payment-plan]').forEach(link => {
        link.addEventListener('click', () => {
            const eventName = link.matches('[data-payment-plan]')
                ? 'begin_checkout'
                : 'questionnaire_started';

            gtag('event', eventName, {
                plan: link.dataset.paymentPlan || planKey || 'undecided'
            });
        });
    });
}

function getThankYouPlan(rawPlan) {
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
            value: 199,
            delivery: '48 hours'
        },
        'simcha-special': {
            key: 'simcha-special',
            name: 'Simcha Special',
            value: 289,
            delivery: '48 hours'
        },
        'ldor-vdor': {
            key: 'ldor-vdor',
            name: "L'Dor V'Dor",
            value: 389,
            delivery: '24-hour priority delivery'
        }
    };

    return plans[planKey] || {
        key: 'custom-song',
        name: 'custom song',
        value: null,
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

function getPurchaseValue(rawValue, fallbackValue) {
    const parsedValue = Number.parseFloat(rawValue);
    if (Number.isFinite(parsedValue) && parsedValue > 0) {
        return parsedValue;
    }

    return fallbackValue;
}

function getPurchaseCurrency(rawCurrency) {
    if (!rawCurrency) return 'USD';
    return rawCurrency.toUpperCase();
}

function ensureThankYouTransactionId(params) {
    const existingId = params.get('transaction_id')
        || params.get('session_id')
        || params.get('checkout_session_id')
        || params.get('order_id')
        || params.get('order_ref');

    if (existingId) {
        return existingId;
    }

    const generatedId = `ty_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    params.set('order_ref', generatedId);

    const queryString = params.toString();
    const nextUrl = queryString
        ? `${window.location.pathname}?${queryString}${window.location.hash}`
        : `${window.location.pathname}${window.location.hash}`;

    window.history.replaceState({}, '', nextUrl);
    return generatedId;
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

function trackThankYouPurchase(purchase) {
    if (typeof gtag !== 'function' || !purchase.transactionId) return;

    const storageKey = `purchase_tracked_${purchase.transactionId}`;
    if (window.sessionStorage.getItem(storageKey) === '1') {
        return;
    }

    const eventPayload = {
        currency: purchase.currency,
        transaction_id: purchase.transactionId,
        items: [
            {
                item_id: purchase.itemId,
                item_name: purchase.itemName,
                item_category: 'custom song',
                quantity: 1
            }
        ]
    };

    if (purchase.value) {
        eventPayload.value = purchase.value;
        eventPayload.items[0].price = purchase.value;
    }

    gtag('event', 'purchase', eventPayload);
    window.sessionStorage.setItem(storageKey, '1');
}

function setText(selector, value) {
    document.querySelectorAll(selector).forEach(element => {
        element.textContent = value;
    });
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value);
}
