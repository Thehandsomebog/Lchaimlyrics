/**
 * L'Chaim Lyrics - Main JavaScript
 * Handles audio player functionality and UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initAudioPlayers();
    initSmoothScroll();
    initNavbarScroll();
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
        let audio = null; // Lazy-loaded on first click
        const card = button.closest('.song-card');
        const progressBar = card.querySelector('.progress-bar');
        const progressFill = card.querySelector('.progress-fill');
        const timeDisplay = card.querySelector('.time-display');
        const playIcon = button.querySelector('.play-icon');
        const pauseIcon = button.querySelector('.pause-icon');

        // Initialize audio on first interaction
        function getAudio() {
            if (!audio) {
                audio = new Audio(audioSrc);

                // Update progress bar as audio plays
                audio.addEventListener('timeupdate', () => {
                    const progress = (audio.currentTime / audio.duration) * 100;
                    progressFill.style.width = `${progress}%`;
                    timeDisplay.textContent = formatTime(audio.currentTime);
                });

                // Reset when audio ends
                audio.addEventListener('ended', () => {
                    resetButton(button, playIcon, pauseIcon);
                    progressFill.style.width = '0%';
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
                    currentButton.querySelector('.pause-icon')
                );
            }

            if (playerAudio.paused) {
                playerAudio.play().catch(err => {
                    console.log('Audio playback failed:', err);
                });
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
                currentAudio = playerAudio;
                currentButton = button;
            } else {
                playerAudio.pause();
                resetButton(button, playIcon, pauseIcon);
                currentAudio = null;
                currentButton = null;
            }
        });

        // Click on progress bar to seek
        progressBar.addEventListener('click', (e) => {
            const playerAudio = getAudio();
            if (playerAudio.duration) {
                const rect = progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                playerAudio.currentTime = percent * playerAudio.duration;
            }
        });
    });
}

/**
 * Reset play button to initial state
 */
function resetButton(button, playIcon, pauseIcon) {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
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

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.nav').offsetHeight;
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
