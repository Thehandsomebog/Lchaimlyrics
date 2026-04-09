/**
 * L'Chaim Lyrics - Main JavaScript
 * Handles audio player functionality and UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initAudioPlayers();
    initSmoothScroll();
    initNavbarScroll();
    initMobileNav();
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
