/**
 * L'Chaim Lyrics - Main JavaScript
 * Handles audio player functionality and UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initAudioPlayers();
    initSmoothScroll();
    initNavbarScroll();
    initMobileNav();
    initLanguageSwitcher();
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

function initLanguageSwitcher() {
    const switchers = document.querySelectorAll('[data-language-switcher]');
    if (!switchers.length) return;

    const storageKey = 'lchaimlyrics-language';
    const languageMeta = {
        en: { flag: '🇺🇸', code: 'EN', label: 'English' },
        fr: { flag: '🇫🇷', code: 'FR', label: 'Français' },
        he: { flag: '🇮🇱', code: 'HE', label: 'עברית' },
        es: { flag: '🇪🇸', code: 'ES', label: 'Español' }
    };
    const originalTextNodes = new WeakMap();
    const originalAttributes = new WeakMap();
    const originalTitle = document.title;
    const originalMetaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const pageMeta = {
        fr: {
            title: "L'Chaim Lyrics | Chansons personnalisées pour mariages juifs, Bar/Bat Mitzvahs et célébrations",
            description: "L'Chaim Lyrics crée des chansons personnalisées de qualité studio pour les célébrations juives, des mariages aux Bar/Bat Mitzvahs."
        },
        he: {
            title: "L'Chaim Lyrics | שירים אישיים לחתונות, בר/בת מצווה ושמחות יהודיות",
            description: "L'Chaim Lyrics יוצרת שירים אישיים באיכות אולפן לשמחות יהודיות, כולל חתונות, בר/בת מצווה ואירועים משפחתיים."
        },
        es: {
            title: "L'Chaim Lyrics | Canciones personalizadas para bodas judías, Bar/Bat Mitzvahs y celebraciones",
            description: "L'Chaim Lyrics crea canciones personalizadas con calidad de estudio para celebraciones judías, bodas, Bar/Bat Mitzvahs y eventos familiares."
        }
    };
    const translations = {
        fr: {
            'Listen': 'Écouter',
            'How It Works': 'Comment ça marche',
            'Pricing': 'Forfaits',
            'Blog': 'Blog',
            'Contact': 'Contact',
            'Start Your Song': 'Commencer ma chanson',
            'A Custom Song for the Simcha They\'ll Never Forget': 'Une chanson personnalisée pour une simcha inoubliable',
            'Share the names, memories, Hebrew details, and family moments that matter. We turn them into a private, studio-quality song for your wedding, Bar/Bat Mitzvah, henna, or milestone celebration.': 'Partagez les noms, souvenirs, détails en hébreu et moments familiaux qui comptent. Nous les transformons en une chanson privée de qualité studio pour votre mariage, Bar/Bat Mitzvah, henné ou grande célébration.',
            'Start My Simcha Song': 'Commencer ma chanson de simcha',
            'Studio-Quality': 'Qualité studio',
            'Professionally produced songs that feel celebration-ready.': 'Des chansons produites professionnellement, prêtes pour votre célébration.',
            '48-Hour Delivery': 'Livraison en 48 heures',
            'Fast turnaround, with a 24-hour priority option when timing is tight.': 'Un délai rapide, avec une option prioritaire de 24 heures quand le temps presse.',
            'Vocalist Choice': 'Choix du chanteur',
            'Choose a male or female vocalist to fit your family and observance.': 'Choisissez une voix masculine ou féminine selon votre famille et vos besoins religieux.',
            'Private by Default': 'Privé par défaut',
            'Your story and your song stay yours alone.': 'Votre histoire et votre chanson restent uniquement à vous.',
            'Listen by Celebration': 'Écouter par célébration',
            'Sample the range of moments we write for, from the chuppah to the party entrance. Each song is built around the family, the milestone, and the story behind it.': 'Écoutez les moments pour lesquels nous écrivons, de la houppa à l’entrée de fête. Chaque chanson est construite autour de la famille, de l’étape célébrée et de son histoire.',
            'The Cohen Wedding Henna': 'Le henné de mariage des Cohen',
            'Henna': 'Henné',
            '"A celebration of our Miami love story that had everyone at the henna dancing and singing along. It captured our spirits perfectly."': '« Une célébration de notre histoire d’amour à Miami qui a fait danser et chanter tout le monde au henné. La chanson a parfaitement capturé notre énergie. »',
            'Explore Henna Songs →': 'Explorer les chansons de henné →',
            'Ashkenazi Wedding': 'Mariage ashkénaze',
            'A lively Ashkenazi wedding track built for the hora, the dance floor, and the moment the whole room jumps in together.': 'Une chanson de mariage ashkénaze entraînante, pensée pour la hora, la piste de danse et le moment où toute la salle se lève ensemble.',
            'Explore Wedding Songs →': 'Explorer les chansons de mariage →',
            'Chuppah': 'Houppa',
            'A softer chuppah song shaped for the ceremony itself, with a romantic feel that lets the moment breathe.': 'Une chanson plus douce pour la houppa, conçue pour la cérémonie avec une émotion romantique qui laisse respirer le moment.',
            'Planning a Bat Mitzvah, engagement, anniversary, or birthday? We create songs for those simchas too. Browse the celebration pages below for examples and package details.': 'Vous préparez une Bat Mitzvah, des fiançailles, un anniversaire de mariage ou un anniversaire ? Nous créons aussi des chansons pour ces simchas. Consultez les pages ci-dessous pour voir des exemples et les détails des forfaits.',
            'Songs for Every Simcha': 'Des chansons pour chaque simcha',
            'No matter the occasion, we\'ll create a custom song that captures your story.': 'Quelle que soit l’occasion, nous créons une chanson personnalisée qui raconte votre histoire.',
            'Weddings': 'Mariages',
            'Bar/Bat Mitzvahs': 'Bar/Bat Mitzvahs',
            'Anniversaries': 'Anniversaires',
            'Birthdays': 'Anniversaires de naissance',
            'Engagements': 'Fiançailles',
            'Henna Parties': 'Soirées henné',
            '4 Easy Steps': '4 étapes simples',
            'From your story to a finished simcha song in four simple steps. The song brief takes 5 minutes max.': 'De votre histoire à une chanson de simcha terminée en quatre étapes simples. Le brief prend 5 minutes maximum.',
            'Share Your Story': 'Partagez votre histoire',
            '5 minutes max': '5 minutes maximum',
            'Answer a few simple questions about the simcha, the people, the memories, and the moment you want to create.': 'Répondez à quelques questions simples sur la simcha, les personnes, les souvenirs et le moment que vous voulez créer.',
            'Choose Your Package': 'Choisissez votre forfait',
            'After the brief': 'Après le brief',
            'Pick Essential, Simcha Special, or L\'Dor V\'Dor once your celebration details are already captured.': 'Choisissez Essential, Simcha Special ou L’Dor V’Dor une fois les détails de votre célébration enregistrés.',
            'We Create the Song': 'Nous créons la chanson',
            'Custom lyrics and vocals': 'Paroles et voix personnalisées',
            'We turn your notes into a private song in the style and vocalist preference you selected.': 'Nous transformons vos notes en une chanson privée, dans le style et avec la voix que vous avez choisis.',
            'Receive Your Song': 'Recevez votre chanson',
            '48 hours or faster': '48 heures ou moins',
            'Your finished song arrives privately by email, with revisions included based on the package you choose.': 'Votre chanson terminée arrive en privé par e-mail, avec les révisions incluses selon le forfait choisi.',
            'Start My Song': 'Commencer ma chanson',
            'Takes 5 minutes max to complete': 'Prend 5 minutes maximum à compléter',
            'Every simcha deserves its own song. Start with the short song brief first, then choose the package that fits your celebration and timeline.': 'Chaque simcha mérite sa propre chanson. Commencez par le court brief, puis choisissez le forfait adapté à votre célébration et à votre délai.',
            'Essential': 'Essential',
            'Simple keepsake song': 'Chanson souvenir simple',
            '1 Custom Song': '1 chanson personnalisée',
            'MP3 Format': 'Format MP3',
            '1 Revision': '1 révision',
            '48-Hour Delivery': 'Livraison en 48 heures',
            'Email Support': 'Support par e-mail',
            'Start Your Brief': 'Commencer le brief',
            'Most Popular': 'Le plus populaire',
            'Simcha Special': 'Simcha Special',
            'Most popular for simchas': 'Le plus choisi pour les simchas',
            'MP3 + WAV Formats': 'Formats MP3 + WAV',
            '3 Revisions': '3 révisions',
            'Priority Support': 'Support prioritaire',
            'L\'Dor V\'Dor': 'L’Dor V’Dor',
            'Priority turnaround package': 'Forfait avec délai prioritaire',
            '5 Revisions': '5 révisions',
            '24-Hour Priority Delivery': 'Livraison prioritaire en 24 heures',
            'Dedicated Support': 'Support dédié',
            'Clear Next Step': 'Prochaine étape claire',
            'Start with the questionnaire so your story is captured before you choose the package and pay.': 'Commencez par le questionnaire afin que votre histoire soit capturée avant de choisir le forfait et de payer.',
            'Revisions Included': 'Révisions incluses',
            'Each package includes revisions, so you are not locked into the first draft if something needs adjusting.': 'Chaque forfait inclut des révisions, donc vous n’êtes pas limité au premier brouillon si quelque chose doit être ajusté.',
            'Your song and your story stay private. We do not reuse, resell, or publish customer songs.': 'Votre chanson et votre histoire restent privées. Nous ne réutilisons, revendons ni publions les chansons des clients.',
            'Frequently Asked Questions': 'Questions fréquentes',
            'Everything you need to know about creating your custom song.': 'Tout ce qu’il faut savoir pour créer votre chanson personnalisée.',
            'How long does it take to receive my custom song?': 'Combien de temps faut-il pour recevoir ma chanson personnalisée ?',
            'Standard delivery is 48 hours for Essential and Simcha Special packages. Our L\'Dor V\'Dor package offers 24-hour priority delivery.': 'La livraison standard est de 48 heures pour les forfaits Essential et Simcha Special. Le forfait L’Dor V’Dor offre une livraison prioritaire en 24 heures.',
            'Can I choose the vocalist gender?': 'Puis-je choisir une voix masculine ou féminine ?',
            'Yes, you can select your preferred vocalist gender (male or female) to accommodate religious observances and personal preferences.': 'Oui, vous pouvez choisir une voix masculine ou féminine selon vos préférences et vos besoins religieux.',
            'Is my custom song private?': 'Ma chanson personnalisée est-elle privée ?',
            'Absolutely. Your song is created exclusively for you and is never shared, resold, or used anywhere else. Your privacy is always protected.': 'Absolument. Votre chanson est créée exclusivement pour vous et n’est jamais partagée, revendue ou utilisée ailleurs. Votre confidentialité est toujours protégée.',
            'What information do I need to provide?': 'Quelles informations dois-je fournir ?',
            'Share names, memories, inside jokes, and what makes your celebration special. The more details you provide, the more personalized your song will be.': 'Partagez les noms, souvenirs, anecdotes et ce qui rend votre célébration spéciale. Plus vous donnez de détails, plus la chanson sera personnelle.',
            'What music styles are available?': 'Quels styles de musique sont disponibles ?',
            'We create songs in many styles including pop, acoustic, oriental, folk, ballad, and more. Let us know your preference and we\'ll match your vision.': 'Nous créons des chansons dans de nombreux styles : pop, acoustique, oriental, folk, ballade et plus encore. Dites-nous votre préférence et nous suivrons votre vision.',
            'Can I request revisions?': 'Puis-je demander des révisions ?',
            'Yes! Essential includes 1 revision, Simcha Special includes 3 revisions, and L\'Dor V\'Dor includes 5 revisions to ensure your song is perfect.': 'Oui. Essential inclut 1 révision, Simcha Special en inclut 3, et L’Dor V’Dor en inclut 5 pour que votre chanson soit parfaite.',
            'Do I pay before or after the questionnaire?': 'Dois-je payer avant ou après le questionnaire ?',
            'You start with the questionnaire first so we can understand the simcha, timeline, style, names, and vocalist preference. After that, you choose your package and complete payment.': 'Vous commencez par le questionnaire afin que nous comprenions la simcha, le délai, le style, les noms et la voix souhaitée. Ensuite, vous choisissez votre forfait et finalisez le paiement.',
            'Will it sound cheesy or generic?': 'Est-ce que cela sonnera banal ou trop kitsch ?',
            'The best songs come from specific details, not generic lines. We use your real memories, family references, and celebration context so the song feels personal and polished.': 'Les meilleures chansons viennent de détails précis, pas de phrases génériques. Nous utilisons vos vrais souvenirs, références familiales et contexte de célébration pour créer une chanson personnelle et soignée.',
            'Can you handle Hebrew names and Jewish details?': 'Pouvez-vous gérer les noms hébreux et les détails juifs ?',
            'Yes. Share pronunciation notes, Hebrew names, family traditions, and any observance needs in the questionnaire so the song fits your celebration respectfully.': 'Oui. Ajoutez les notes de prononciation, noms hébreux, traditions familiales et besoins religieux dans le questionnaire afin que la chanson respecte votre célébration.',
            'Turning your stories into songs, one simcha at a time.': 'Nous transformons vos histoires en chansons, une simcha à la fois.',
            'Songs For': 'Chansons pour',
            'Your Privacy, Guaranteed': 'Votre confidentialité, garantie',
            'Your custom song is created exclusively for you. We never share, resell, or use your song or personal stories anywhere else. Your celebration, your music, your privacy—always protected.': 'Votre chanson personnalisée est créée exclusivement pour vous. Nous ne partageons, revendons ni utilisons votre chanson ou vos histoires personnelles ailleurs. Votre célébration, votre musique, votre confidentialité, toujours protégées.'
        },
        es: {
            'Listen': 'Escuchar',
            'How It Works': 'Cómo funciona',
            'Pricing': 'Paquetes',
            'Blog': 'Blog',
            'Contact': 'Contacto',
            'Start Your Song': 'Comenzar mi canción',
            'A Custom Song for the Simcha They\'ll Never Forget': 'Una canción personalizada para una simcha inolvidable',
            'Share the names, memories, Hebrew details, and family moments that matter. We turn them into a private, studio-quality song for your wedding, Bar/Bat Mitzvah, henna, or milestone celebration.': 'Comparte los nombres, recuerdos, detalles en hebreo y momentos familiares que importan. Los convertimos en una canción privada con calidad de estudio para tu boda, Bar/Bat Mitzvah, henna o celebración especial.',
            'Start My Simcha Song': 'Comenzar mi canción de simcha',
            'Studio-Quality': 'Calidad de estudio',
            'Professionally produced songs that feel celebration-ready.': 'Canciones producidas profesionalmente, listas para tu celebración.',
            '48-Hour Delivery': 'Entrega en 48 horas',
            'Fast turnaround, with a 24-hour priority option when timing is tight.': 'Entrega rápida, con opción prioritaria de 24 horas cuando el tiempo es limitado.',
            'Vocalist Choice': 'Elección de voz',
            'Choose a male or female vocalist to fit your family and observance.': 'Elige una voz masculina o femenina según tu familia y tus necesidades religiosas.',
            'Private by Default': 'Privado por defecto',
            'Your story and your song stay yours alone.': 'Tu historia y tu canción son solo tuyas.',
            'Listen by Celebration': 'Escucha por celebración',
            'Sample the range of moments we write for, from the chuppah to the party entrance. Each song is built around the family, the milestone, and the story behind it.': 'Escucha algunos de los momentos para los que escribimos, desde la jupá hasta la entrada a la fiesta. Cada canción se construye alrededor de la familia, el hito y la historia detrás.',
            'The Cohen Wedding Henna': 'La henna de boda de los Cohen',
            'Henna': 'Henna',
            '"A celebration of our Miami love story that had everyone at the henna dancing and singing along. It captured our spirits perfectly."': '“Una celebración de nuestra historia de amor en Miami que hizo que todos bailaran y cantaran en la henna. Capturó nuestra energía perfectamente.”',
            'Explore Henna Songs →': 'Explorar canciones de henna →',
            'Ashkenazi Wedding': 'Boda ashkenazí',
            'A lively Ashkenazi wedding track built for the hora, the dance floor, and the moment the whole room jumps in together.': 'Una canción alegre de boda ashkenazí creada para la hora, la pista de baile y ese momento en que todo el salón se une.',
            'Explore Wedding Songs →': 'Explorar canciones de boda →',
            'Chuppah': 'Jupá',
            'A softer chuppah song shaped for the ceremony itself, with a romantic feel that lets the moment breathe.': 'Una canción más suave para la jupá, creada para la ceremonia con un tono romántico que deja respirar el momento.',
            'Planning a Bat Mitzvah, engagement, anniversary, or birthday? We create songs for those simchas too. Browse the celebration pages below for examples and package details.': '¿Estás planeando una Bat Mitzvah, compromiso, aniversario o cumpleaños? También creamos canciones para esas simchas. Explora las páginas de celebración para ver ejemplos y detalles de los paquetes.',
            'Songs for Every Simcha': 'Canciones para cada simcha',
            'No matter the occasion, we\'ll create a custom song that captures your story.': 'Sea cual sea la ocasión, crearemos una canción personalizada que capture tu historia.',
            'Weddings': 'Bodas',
            'Bar/Bat Mitzvahs': 'Bar/Bat Mitzvahs',
            'Anniversaries': 'Aniversarios',
            'Birthdays': 'Cumpleaños',
            'Engagements': 'Compromisos',
            'Henna Parties': 'Fiestas de henna',
            '4 Easy Steps': '4 pasos sencillos',
            'From your story to a finished simcha song in four simple steps. The song brief takes 5 minutes max.': 'De tu historia a una canción terminada para tu simcha en cuatro pasos sencillos. El formulario toma 5 minutos como máximo.',
            'Share Your Story': 'Comparte tu historia',
            '5 minutes max': '5 minutos máximo',
            'Answer a few simple questions about the simcha, the people, the memories, and the moment you want to create.': 'Responde algunas preguntas sencillas sobre la simcha, las personas, los recuerdos y el momento que quieres crear.',
            'Choose Your Package': 'Elige tu paquete',
            'After the brief': 'Después del formulario',
            'Pick Essential, Simcha Special, or L\'Dor V\'Dor once your celebration details are already captured.': 'Elige Essential, Simcha Special o L’Dor V’Dor después de guardar los detalles de tu celebración.',
            'We Create the Song': 'Creamos la canción',
            'Custom lyrics and vocals': 'Letra y voces personalizadas',
            'We turn your notes into a private song in the style and vocalist preference you selected.': 'Convertimos tus notas en una canción privada con el estilo y la voz que elegiste.',
            'Receive Your Song': 'Recibe tu canción',
            '48 hours or faster': '48 horas o menos',
            'Your finished song arrives privately by email, with revisions included based on the package you choose.': 'Tu canción terminada llega de forma privada por email, con revisiones incluidas según el paquete que elijas.',
            'Start My Song': 'Comenzar mi canción',
            'Takes 5 minutes max to complete': 'Toma 5 minutos como máximo',
            'Every simcha deserves its own song. Start with the short song brief first, then choose the package that fits your celebration and timeline.': 'Cada simcha merece su propia canción. Empieza con el breve formulario y luego elige el paquete que mejor se ajuste a tu celebración y fecha.',
            'Essential': 'Essential',
            'Simple keepsake song': 'Canción recuerdo sencilla',
            '1 Custom Song': '1 canción personalizada',
            'MP3 Format': 'Formato MP3',
            '1 Revision': '1 revisión',
            '48-Hour Delivery': 'Entrega en 48 horas',
            'Email Support': 'Soporte por email',
            'Start Your Brief': 'Comenzar el formulario',
            'Most Popular': 'Más popular',
            'Simcha Special': 'Simcha Special',
            'Most popular for simchas': 'El más elegido para simchas',
            'MP3 + WAV Formats': 'Formatos MP3 + WAV',
            '3 Revisions': '3 revisiones',
            'Priority Support': 'Soporte prioritario',
            'L\'Dor V\'Dor': 'L’Dor V’Dor',
            'Priority turnaround package': 'Paquete con entrega prioritaria',
            '5 Revisions': '5 revisiones',
            '24-Hour Priority Delivery': 'Entrega prioritaria en 24 horas',
            'Dedicated Support': 'Soporte dedicado',
            'Clear Next Step': 'Siguiente paso claro',
            'Start with the questionnaire so your story is captured before you choose the package and pay.': 'Empieza con el cuestionario para que tu historia quede guardada antes de elegir el paquete y pagar.',
            'Revisions Included': 'Revisiones incluidas',
            'Each package includes revisions, so you are not locked into the first draft if something needs adjusting.': 'Cada paquete incluye revisiones, así que no quedas limitado al primer borrador si algo necesita ajustes.',
            'Your song and your story stay private. We do not reuse, resell, or publish customer songs.': 'Tu canción y tu historia se mantienen privadas. No reutilizamos, revendemos ni publicamos canciones de clientes.',
            'Frequently Asked Questions': 'Preguntas frecuentes',
            'Everything you need to know about creating your custom song.': 'Todo lo que necesitas saber para crear tu canción personalizada.',
            'How long does it take to receive my custom song?': '¿Cuánto tarda recibir mi canción personalizada?',
            'Standard delivery is 48 hours for Essential and Simcha Special packages. Our L\'Dor V\'Dor package offers 24-hour priority delivery.': 'La entrega estándar es de 48 horas para Essential y Simcha Special. El paquete L’Dor V’Dor ofrece entrega prioritaria en 24 horas.',
            'Can I choose the vocalist gender?': '¿Puedo elegir voz masculina o femenina?',
            'Yes, you can select your preferred vocalist gender (male or female) to accommodate religious observances and personal preferences.': 'Sí, puedes elegir una voz masculina o femenina según tus preferencias y necesidades religiosas.',
            'Is my custom song private?': '¿Mi canción personalizada es privada?',
            'Absolutely. Your song is created exclusively for you and is never shared, resold, or used anywhere else. Your privacy is always protected.': 'Sí. Tu canción se crea exclusivamente para ti y nunca se comparte, revende ni usa en otro lugar. Tu privacidad siempre está protegida.',
            'What information do I need to provide?': '¿Qué información debo dar?',
            'Share names, memories, inside jokes, and what makes your celebration special. The more details you provide, the more personalized your song will be.': 'Comparte nombres, recuerdos, bromas familiares y lo que hace especial tu celebración. Cuantos más detalles des, más personalizada será la canción.',
            'What music styles are available?': '¿Qué estilos musicales están disponibles?',
            'We create songs in many styles including pop, acoustic, oriental, folk, ballad, and more. Let us know your preference and we\'ll match your vision.': 'Creamos canciones en muchos estilos, incluyendo pop, acústico, oriental, folk, balada y más. Cuéntanos tu preferencia y seguiremos tu visión.',
            'Can I request revisions?': '¿Puedo pedir revisiones?',
            'Yes! Essential includes 1 revision, Simcha Special includes 3 revisions, and L\'Dor V\'Dor includes 5 revisions to ensure your song is perfect.': 'Sí. Essential incluye 1 revisión, Simcha Special incluye 3 y L’Dor V’Dor incluye 5 para que tu canción quede perfecta.',
            'Do I pay before or after the questionnaire?': '¿Pago antes o después del cuestionario?',
            'You start with the questionnaire first so we can understand the simcha, timeline, style, names, and vocalist preference. After that, you choose your package and complete payment.': 'Primero completas el cuestionario para que entendamos la simcha, la fecha, el estilo, los nombres y la voz preferida. Después eliges tu paquete y completas el pago.',
            'Will it sound cheesy or generic?': '¿Sonará cursi o genérica?',
            'The best songs come from specific details, not generic lines. We use your real memories, family references, and celebration context so the song feels personal and polished.': 'Las mejores canciones nacen de detalles específicos, no de frases genéricas. Usamos tus recuerdos reales, referencias familiares y el contexto de la celebración para que la canción se sienta personal y pulida.',
            'Can you handle Hebrew names and Jewish details?': '¿Pueden manejar nombres hebreos y detalles judíos?',
            'Yes. Share pronunciation notes, Hebrew names, family traditions, and any observance needs in the questionnaire so the song fits your celebration respectfully.': 'Sí. Comparte notas de pronunciación, nombres hebreos, tradiciones familiares y cualquier necesidad religiosa en el cuestionario para que la canción se adapte con respeto a tu celebración.',
            'Turning your stories into songs, one simcha at a time.': 'Convertimos tus historias en canciones, una simcha a la vez.',
            'Songs For': 'Canciones para',
            'Your Privacy, Guaranteed': 'Tu privacidad, garantizada',
            'Your custom song is created exclusively for you. We never share, resell, or use your song or personal stories anywhere else. Your celebration, your music, your privacy—always protected.': 'Tu canción personalizada se crea exclusivamente para ti. Nunca compartimos, revendemos ni usamos tu canción o tus historias personales en otro lugar. Tu celebración, tu música y tu privacidad siempre están protegidas.'
        },
        he: {
            'Listen': 'האזנה',
            'How It Works': 'איך זה עובד',
            'Pricing': 'חבילות',
            'Blog': 'בלוג',
            'Contact': 'יצירת קשר',
            'Start Your Song': 'התחילו את השיר',
            'A Custom Song for the Simcha They\'ll Never Forget': 'שיר אישי לשמחה שלא ישכחו',
            'Share the names, memories, Hebrew details, and family moments that matter. We turn them into a private, studio-quality song for your wedding, Bar/Bat Mitzvah, henna, or milestone celebration.': 'שתפו שמות, זיכרונות, פרטים בעברית ורגעים משפחתיים חשובים. אנחנו הופכים אותם לשיר פרטי באיכות אולפן לחתונה, בר/בת מצווה, חינה או כל שמחה משמעותית.',
            'Start My Simcha Song': 'התחילו את שיר השמחה שלי',
            'Studio-Quality': 'איכות אולפן',
            'Professionally produced songs that feel celebration-ready.': 'שירים בהפקה מקצועית שמוכנים לרגע החגיגה.',
            '48-Hour Delivery': 'משלוח תוך 48 שעות',
            'Fast turnaround, with a 24-hour priority option when timing is tight.': 'זמן הכנה מהיר, עם אפשרות עדיפות של 24 שעות כשיש לחץ זמן.',
            'Vocalist Choice': 'בחירת קול',
            'Choose a male or female vocalist to fit your family and observance.': 'בחרו קול גברי או נשי לפי המשפחה והצרכים ההלכתיים שלכם.',
            'Private by Default': 'פרטי כברירת מחדל',
            'Your story and your song stay yours alone.': 'הסיפור והשיר שלכם נשארים רק שלכם.',
            'Listen by Celebration': 'האזינו לפי סוג שמחה',
            'Sample the range of moments we write for, from the chuppah to the party entrance. Each song is built around the family, the milestone, and the story behind it.': 'האזינו למגוון הרגעים שאנחנו כותבים עבורם, מהחופה ועד כניסה לאולם. כל שיר נבנה סביב המשפחה, אבן הדרך והסיפור שמאחוריה.',
            'The Cohen Wedding Henna': 'חינת החתונה של משפחת כהן',
            'Henna': 'חינה',
            '"A celebration of our Miami love story that had everyone at the henna dancing and singing along. It captured our spirits perfectly."': '"חגיגה של סיפור האהבה שלנו במיאמי שגרמה לכולם בחינה לרקוד ולשיר יחד. זה תפס את האופי שלנו בצורה מושלמת."',
            'Explore Henna Songs →': 'לשירי חינה →',
            'Ashkenazi Wedding': 'חתונה אשכנזית',
            'A lively Ashkenazi wedding track built for the hora, the dance floor, and the moment the whole room jumps in together.': 'שיר חתונה אשכנזי קצבי שנבנה להורה, לרחבה ולרגע שבו כל האולם מצטרף יחד.',
            'Explore Wedding Songs →': 'לשירי חתונה →',
            'Chuppah': 'חופה',
            'A softer chuppah song shaped for the ceremony itself, with a romantic feel that lets the moment breathe.': 'שיר חופה עדין יותר, מותאם לטקס עצמו עם תחושה רומנטית שנותנת לרגע לנשום.',
            'Planning a Bat Mitzvah, engagement, anniversary, or birthday? We create songs for those simchas too. Browse the celebration pages below for examples and package details.': 'מתכננים בת מצווה, אירוסין, יום נישואין או יום הולדת? אנחנו יוצרים שירים גם לשמחות האלה. עברו לעמודי החגיגות למטה לדוגמאות ופרטי חבילות.',
            'Songs for Every Simcha': 'שירים לכל שמחה',
            'No matter the occasion, we\'ll create a custom song that captures your story.': 'לא משנה מה האירוע, ניצור שיר אישי שתופס את הסיפור שלכם.',
            'Weddings': 'חתונות',
            'Bar/Bat Mitzvahs': 'בר/בת מצווה',
            'Anniversaries': 'ימי נישואין',
            'Birthdays': 'ימי הולדת',
            'Engagements': 'אירוסין',
            'Henna Parties': 'חינות',
            '4 Easy Steps': '4 שלבים פשוטים',
            'From your story to a finished simcha song in four simple steps. The song brief takes 5 minutes max.': 'מהסיפור שלכם לשיר שמחה מוכן בארבעה שלבים פשוטים. מילוי הבריף לוקח עד 5 דקות.',
            'Share Your Story': 'שתפו את הסיפור',
            '5 minutes max': 'עד 5 דקות',
            'Answer a few simple questions about the simcha, the people, the memories, and the moment you want to create.': 'ענו על כמה שאלות פשוטות על השמחה, האנשים, הזיכרונות והרגע שתרצו ליצור.',
            'Choose Your Package': 'בחרו חבילה',
            'After the brief': 'אחרי הבריף',
            'Pick Essential, Simcha Special, or L\'Dor V\'Dor once your celebration details are already captured.': 'בחרו Essential, Simcha Special או L’Dor V’Dor אחרי שפרטי השמחה כבר נשמרו.',
            'We Create the Song': 'אנחנו יוצרים את השיר',
            'Custom lyrics and vocals': 'מילים וקול בהתאמה אישית',
            'We turn your notes into a private song in the style and vocalist preference you selected.': 'אנחנו הופכים את ההערות שלכם לשיר פרטי בסגנון ובקול שבחרתם.',
            'Receive Your Song': 'קבלו את השיר',
            '48 hours or faster': '48 שעות או פחות',
            'Your finished song arrives privately by email, with revisions included based on the package you choose.': 'השיר המוכן נשלח אליכם בפרטיות במייל, עם תיקונים כלולים לפי החבילה שתבחרו.',
            'Start My Song': 'התחילו את השיר שלי',
            'Takes 5 minutes max to complete': 'לוקח עד 5 דקות להשלים',
            'Every simcha deserves its own song. Start with the short song brief first, then choose the package that fits your celebration and timeline.': 'לכל שמחה מגיע שיר משלה. התחילו בבריף קצר, ואז בחרו את החבילה שמתאימה לחגיגה וללוח הזמנים שלכם.',
            'Essential': 'Essential',
            'Simple keepsake song': 'שיר מזכרת פשוט',
            '1 Custom Song': 'שיר אישי אחד',
            'MP3 Format': 'פורמט MP3',
            '1 Revision': 'תיקון אחד',
            '48-Hour Delivery': 'משלוח תוך 48 שעות',
            'Email Support': 'תמיכה במייל',
            'Start Your Brief': 'התחילו את הבריף',
            'Most Popular': 'הכי פופולרי',
            'Simcha Special': 'Simcha Special',
            'Most popular for simchas': 'הבחירה הפופולרית לשמחות',
            'MP3 + WAV Formats': 'פורמטים MP3 + WAV',
            '3 Revisions': '3 תיקונים',
            'Priority Support': 'תמיכה בעדיפות',
            'L\'Dor V\'Dor': 'L’Dor V’Dor',
            'Priority turnaround package': 'חבילת עדיפות מהירה',
            '5 Revisions': '5 תיקונים',
            '24-Hour Priority Delivery': 'משלוח עדיפות תוך 24 שעות',
            'Dedicated Support': 'תמיכה ייעודית',
            'Clear Next Step': 'השלב הבא ברור',
            'Start with the questionnaire so your story is captured before you choose the package and pay.': 'מתחילים בשאלון כדי שהסיפור שלכם יישמר לפני בחירת החבילה והתשלום.',
            'Revisions Included': 'תיקונים כלולים',
            'Each package includes revisions, so you are not locked into the first draft if something needs adjusting.': 'כל חבילה כוללת תיקונים, כך שאתם לא נשארים עם הטיוטה הראשונה אם צריך לשנות משהו.',
            'Your song and your story stay private. We do not reuse, resell, or publish customer songs.': 'השיר והסיפור שלכם נשארים פרטיים. אנחנו לא עושים שימוש חוזר, מוכרים או מפרסמים שירי לקוחות.',
            'Frequently Asked Questions': 'שאלות נפוצות',
            'Everything you need to know about creating your custom song.': 'כל מה שצריך לדעת על יצירת השיר האישי שלכם.',
            'How long does it take to receive my custom song?': 'כמה זמן לוקח לקבל את השיר האישי?',
            'Standard delivery is 48 hours for Essential and Simcha Special packages. Our L\'Dor V\'Dor package offers 24-hour priority delivery.': 'המשלוח הסטנדרטי הוא 48 שעות לחבילות Essential ו-Simcha Special. חבילת L’Dor V’Dor כוללת משלוח עדיפות תוך 24 שעות.',
            'Can I choose the vocalist gender?': 'אפשר לבחור קול גברי או נשי?',
            'Yes, you can select your preferred vocalist gender (male or female) to accommodate religious observances and personal preferences.': 'כן, אפשר לבחור קול גברי או נשי לפי העדפה אישית וצרכים דתיים.',
            'Is my custom song private?': 'האם השיר האישי שלי פרטי?',
            'Absolutely. Your song is created exclusively for you and is never shared, resold, or used anywhere else. Your privacy is always protected.': 'בהחלט. השיר נוצר במיוחד עבורכם בלבד ולא משותף, נמכר או משמש במקום אחר. הפרטיות שלכם תמיד מוגנת.',
            'What information do I need to provide?': 'איזה מידע צריך לספק?',
            'Share names, memories, inside jokes, and what makes your celebration special. The more details you provide, the more personalized your song will be.': 'שתפו שמות, זיכרונות, בדיחות משפחתיות ומה שהופך את השמחה למיוחדת. ככל שתתנו יותר פרטים, השיר יהיה אישי יותר.',
            'What music styles are available?': 'אילו סגנונות מוזיקה זמינים?',
            'We create songs in many styles including pop, acoustic, oriental, folk, ballad, and more. Let us know your preference and we\'ll match your vision.': 'אנחנו יוצרים שירים בסגנונות רבים, כולל פופ, אקוסטי, מזרחי, פולק, בלדה ועוד. ספרו לנו מה אתם מעדיפים ונתאים את השיר לחזון שלכם.',
            'Can I request revisions?': 'אפשר לבקש תיקונים?',
            'Yes! Essential includes 1 revision, Simcha Special includes 3 revisions, and L\'Dor V\'Dor includes 5 revisions to ensure your song is perfect.': 'כן. Essential כוללת תיקון אחד, Simcha Special כוללת 3 תיקונים, ו-L’Dor V’Dor כוללת 5 תיקונים כדי שהשיר יהיה מדויק.',
            'Do I pay before or after the questionnaire?': 'משלמים לפני או אחרי השאלון?',
            'You start with the questionnaire first so we can understand the simcha, timeline, style, names, and vocalist preference. After that, you choose your package and complete payment.': 'מתחילים קודם בשאלון כדי שנבין את השמחה, הדדליין, הסגנון, השמות והעדפת הקול. לאחר מכן בוחרים חבילה ומשלימים תשלום.',
            'Will it sound cheesy or generic?': 'זה יישמע קיטשי או גנרי?',
            'The best songs come from specific details, not generic lines. We use your real memories, family references, and celebration context so the song feels personal and polished.': 'השירים הטובים ביותר מגיעים מפרטים אמיתיים, לא ממשפטים גנריים. אנחנו משתמשים בזיכרונות, רמזים משפחתיים והקשר של השמחה כדי ליצור שיר אישי ומלוטש.',
            'Can you handle Hebrew names and Jewish details?': 'אפשר לשלב שמות עבריים ופרטים יהודיים?',
            'Yes. Share pronunciation notes, Hebrew names, family traditions, and any observance needs in the questionnaire so the song fits your celebration respectfully.': 'כן. שתפו הערות הגייה, שמות עבריים, מסורות משפחתיות וכל צורך דתי בשאלון כדי שהשיר יתאים לשמחה בכבוד.',
            'Turning your stories into songs, one simcha at a time.': 'הופכים סיפורים לשירים, שמחה אחת בכל פעם.',
            'Songs For': 'שירים עבור',
            'Your Privacy, Guaranteed': 'הפרטיות שלכם מובטחת',
            'Your custom song is created exclusively for you. We never share, resell, or use your song or personal stories anywhere else. Your celebration, your music, your privacy—always protected.': 'השיר האישי שלכם נוצר עבורכם בלבד. אנחנו לא משתפים, מוכרים או משתמשים בשיר או בסיפורים האישיים שלכם בשום מקום אחר. השמחה שלכם, המוזיקה שלכם והפרטיות שלכם תמיד מוגנות.'
        }
    };

    const normalizeLanguage = lang => {
        if (!lang) return 'en';
        const normalized = lang.toLowerCase();
        if (normalized === 'iw') return 'he';
        return languageMeta[normalized] ? normalized : 'en';
    };

    const getActiveLanguage = () => {
        const currentUrl = new URL(window.location.href);
        const urlLanguage = currentUrl.searchParams.get('lang')
            || currentUrl.searchParams.get('tl')
            || currentUrl.searchParams.get('_x_tr_tl');

        if (urlLanguage) {
            return normalizeLanguage(urlLanguage);
        }

        const translateCookie = document.cookie
            .split('; ')
            .find(cookie => cookie.startsWith('googtrans='));

        if (translateCookie) {
            const cookieLanguage = decodeURIComponent(translateCookie.split('=').pop()).split('/').pop();
            return normalizeLanguage(cookieLanguage);
        }

        try {
            return normalizeLanguage(window.localStorage.getItem(storageKey));
        } catch (error) {
            return 'en';
        }
    };

    const setSwitcherLanguage = (switcher, lang) => {
        const meta = languageMeta[normalizeLanguage(lang)];
        const currentFlag = switcher.querySelector('.language-current');
        const currentCode = switcher.querySelector('.language-code');
        const options = switcher.querySelectorAll('[data-language-option]');

        if (currentFlag) currentFlag.textContent = meta.flag;
        if (currentCode) currentCode.textContent = meta.code;

        options.forEach(option => {
            const isCurrent = normalizeLanguage(option.dataset.languageOption) === normalizeLanguage(lang);
            option.toggleAttribute('aria-current', isCurrent);
        });
    };

    const closeAll = () => {
        switchers.forEach(switcher => {
            const toggle = switcher.querySelector('.language-toggle');
            const menu = switcher.querySelector('.language-menu');
            switcher.classList.remove('is-open');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
            if (menu) menu.hidden = true;
        });
    };

    const getCleanSiteUrl = lang => {
        const currentUrl = new URL(window.location.href);
        const translatedUrl = currentUrl.searchParams.get('u');
        const cleanUrl = translatedUrl ? new URL(translatedUrl) : new URL(currentUrl.href);

        if (currentUrl.hostname.endsWith('.translate.goog')) {
            const originalHost = currentUrl.hostname
                .replace(/\.translate\.goog$/, '')
                .replace(/-/g, '.');
            cleanUrl.protocol = 'https:';
            cleanUrl.hostname = originalHost;
            cleanUrl.pathname = currentUrl.pathname;
            cleanUrl.search = '';

            currentUrl.searchParams.forEach((value, key) => {
                if (!key.startsWith('_x_tr_')) {
                    cleanUrl.searchParams.set(key, value);
                }
            });
        }

        cleanUrl.searchParams.delete('tl');
        cleanUrl.searchParams.delete('sl');
        cleanUrl.searchParams.delete('u');
        cleanUrl.searchParams.delete('_x_tr_sl');
        cleanUrl.searchParams.delete('_x_tr_tl');
        cleanUrl.searchParams.delete('_x_tr_hl');
        cleanUrl.searchParams.delete('_x_tr_pto');

        if (normalizeLanguage(lang) === 'en') {
            cleanUrl.searchParams.delete('lang');
        } else {
            cleanUrl.searchParams.set('lang', normalizeLanguage(lang));
        }

        return cleanUrl.toString();
    };

    const rememberLanguage = lang => {
        try {
            if (lang === 'en') {
                window.localStorage.removeItem(storageKey);
            } else {
                window.localStorage.setItem(storageKey, lang);
            }
        } catch (error) {
            // localStorage can be unavailable in private or locked-down browsers.
        }
    };

    const translateTextNodes = (lang, dictionary) => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const parent = node.parentElement;
                if (!parent || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                if (parent.closest('script, style, noscript, [translate="no"]')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        const nodes = [];

        while (walker.nextNode()) {
            nodes.push(walker.currentNode);
        }

        nodes.forEach(node => {
            const original = originalTextNodes.get(node) || node.nodeValue;
            originalTextNodes.set(node, original);

            if (lang === 'en') {
                node.nodeValue = original;
                return;
            }

            const trimmedOriginal = original.trim();
            const translated = dictionary[trimmedOriginal];
            if (!translated) {
                node.nodeValue = original;
                return;
            }

            node.nodeValue = original.replace(trimmedOriginal, translated);
        });
    };

    const translateAttributes = (lang, dictionary) => {
        const attributes = ['alt', 'aria-label', 'title'];
        document.querySelectorAll(attributes.map(attribute => `[${attribute}]`).join(',')).forEach(element => {
            if (element.closest('[translate="no"]')) return;

            attributes.forEach(attribute => {
                if (!element.hasAttribute(attribute)) return;

                const storedAttributes = originalAttributes.get(element) || {};
                if (!storedAttributes[attribute]) {
                    storedAttributes[attribute] = element.getAttribute(attribute);
                    originalAttributes.set(element, storedAttributes);
                }

                const original = storedAttributes[attribute];
                element.setAttribute(attribute, lang === 'en' ? original : dictionary[original] || original);
            });
        });
    };

    const updateUrlLanguage = lang => {
        if (!window.history || !window.history.replaceState) return;

        const nextUrl = new URL(window.location.href);
        if (lang === 'en') {
            nextUrl.searchParams.delete('lang');
        } else {
            nextUrl.searchParams.set('lang', lang);
        }
        window.history.replaceState({}, '', nextUrl.toString());
    };

    const applyLanguage = lang => {
        const normalizedLang = normalizeLanguage(lang);
        const dictionary = translations[normalizedLang] || {};
        const descriptionMeta = document.querySelector('meta[name="description"]');

        document.documentElement.lang = normalizedLang;
        document.documentElement.dir = normalizedLang === 'he' ? 'rtl' : 'ltr';
        document.body.classList.toggle('is-rtl', normalizedLang === 'he');
        document.title = normalizedLang === 'en' ? originalTitle : pageMeta[normalizedLang]?.title || originalTitle;

        if (descriptionMeta) {
            descriptionMeta.setAttribute(
                'content',
                normalizedLang === 'en' ? originalMetaDescription : pageMeta[normalizedLang]?.description || originalMetaDescription
            );
        }

        translateTextNodes(normalizedLang, dictionary);
        translateAttributes(normalizedLang, dictionary);
        switchers.forEach(switcher => setSwitcherLanguage(switcher, normalizedLang));
    };

    const activeLanguage = getActiveLanguage();

    if (window.location.hostname.endsWith('.translate.goog')) {
        window.location.replace(getCleanSiteUrl(activeLanguage));
        return;
    }

    switchers.forEach(switcher => {
        const toggle = switcher.querySelector('.language-toggle');
        const menu = switcher.querySelector('.language-menu');
        const options = switcher.querySelectorAll('[data-language-option]');

        if (!toggle) return;

        if (menu) menu.hidden = true;
        setSwitcherLanguage(switcher, activeLanguage);

        toggle.addEventListener('click', event => {
            event.stopPropagation();
            const willOpen = !switcher.classList.contains('is-open');
            closeAll();
            if (menu) menu.hidden = !willOpen;
            switcher.classList.toggle('is-open', willOpen);
            toggle.setAttribute('aria-expanded', String(willOpen));
        });

        options.forEach(option => {
            option.addEventListener('click', () => {
                const lang = normalizeLanguage(option.dataset.languageOption);
                closeAll();
                rememberLanguage(lang);
                applyLanguage(lang);
                updateUrlLanguage(lang);
            });
        });
    });

    applyLanguage(activeLanguage);

    document.addEventListener('click', closeAll);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeAll();
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
