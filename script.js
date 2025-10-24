const CONFIG = {
    DISCORD_USER_ID: '345872800726384652',
    SPOTIFY_CLIENT_ID: 'd21a75fa1e0148f08ef11867bf485c3f',
    UPDATE_INTERVAL: 30000,
    SPOTIFY_UPDATE_INTERVAL: 5000
};

let currentDiscordHandle = '@skidqs';
let lastDiscordUpdate = 0;
let lastSpotifyUpdate = 0;
let spotifyProgress = 0;
let spotifyDuration = 0;
let spotifyCurrentTime = 0;
let progressInterval = null;
let hasEnteredSite = false;
let isPaused = false;
let currentSpotifyData = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeCursor();
    initializeEntryPage();
    initializeSocialLinks();
    initializeVolumeSlider();

});

function initializeCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function updateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;

        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    const interactiveElements = document.querySelectorAll('a, .avatar, .main-avatar-img, .album-art, .social-link, .entry-text');

    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });

        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
}

function initializeEntryPage() {
    const entryPage = document.getElementById('entry-page');
    const mainSite = document.getElementById('main-site');
    entryPage.addEventListener('click', function() {
        if (hasEnteredSite) return;
        hasEnteredSite = true;
        entryPage.classList.add('fade-out');

        document.body.style.cursor = 'none';

        const bgMusic = document.getElementById('bg-music');
        const slider = document.getElementById('volume-slider');
        const percent = document.getElementById('volume-percent');
        const volumeSliderContainer = document.getElementById('volume-slider-container');
        if (bgMusic) {
            bgMusic.volume = 0.5;
            if (slider) slider.value = 0.5;
            if (percent) percent.textContent = '50%';
            bgMusic.play();
        }
        if (volumeSliderContainer) {
            volumeSliderContainer.style.display = 'flex';
        }
        setTimeout(() => {
            entryPage.style.display = 'none';
            mainSite.style.display = 'block';
            document.body.style.cursor = 'none';
            initializeMainSite();
        }, 800);
    });
}

function initializeMainSite() {
    initializeTypingEffect();
    initializeLastSeen();
    updateDiscordStatus();
    updateSpotifyStatus();

    setInterval(updateDiscordStatus, CONFIG.UPDATE_INTERVAL);
    setInterval(updateSpotifyStatus, CONFIG.SPOTIFY_UPDATE_INTERVAL);
    setInterval(updateLastSeen, 60000);
    setInterval(updateSpotifyProgress, 1000);
}

function initializeTypingEffect() {
    const typingText = document.querySelector('.typing-text');
    if (!typingText) return;

    const texts = [
        'yo im skidqs',
        'feel free to dm me',
        'i use arch btw',
        'check out my github',
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeWriter() {
        const currentText = texts[textIndex];

        if (isDeleting) {
            typingText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 500;
        }

        setTimeout(typeWriter, typeSpeed);
    }

    typeWriter();
}

function initializeLastSeen() {
    updateLastSeen();
}

function updateLastSeen() {
    const lastSeenElement = document.getElementById('last-seen');
    if (!lastSeenElement) return;

    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    lastSeenElement.textContent = `Last seen ${timeString}`;
}

async function updateDiscordStatus() {
    try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${CONFIG.DISCORD_USER_ID}`);
        const data = await response.json();

        if (data.success && data.data) {
            const user = data.data;
            updateDiscordUI(user);
        }
    } catch (error) {
        console.log('error while fetching discord data', error);
    }
}

function updateDiscordUI(userData) {
    const avatar = document.getElementById('discord-avatar');
    const username = document.getElementById('discord-username');
    const activity = document.getElementById('discord-activity');
    const statusDot = document.getElementById('discord-status-dot');
    const statusBadge = document.getElementById('discord-status');
    const mainAvatar = document.getElementById('main-avatar');
    const mainStatusDot = document.getElementById('main-status-dot');
    const mainStatusText = document.getElementById('main-status-text');

    if (avatar && userData.discord_user) {
        const avatarUrl = userData.discord_user.avatar
            ? `https://cdn.discordapp.com/avatars/${userData.discord_user.id}/${userData.discord_user.avatar}.png?size=128`
            : `https://cdn.discordapp.com/embed/avatars/${userData.discord_user.discriminator % 5}.png`;

        avatar.src = avatarUrl;
        if (mainAvatar) mainAvatar.src = avatarUrl;
    }

    if (username && userData.discord_user) {
        username.textContent = userData.discord_user.global_name || userData.discord_user.username;
    }

    const status = userData.discord_status || 'offline';
    if (statusDot) {
        statusDot.className = `status-indicator ${status}`;
    }

    if (statusBadge) {
        statusBadge.className = `status-badge ${status}`;
    }

    if (mainStatusDot) {
        mainStatusDot.className = `status-dot ${status}`;
    }

    if (mainStatusText) {
        const statusTexts = {
            online: 'Online',
            idle: 'Away',
            dnd: 'Do Not Disturb',
            offline: 'Offline'
        };
        mainStatusText.textContent = statusTexts[status] || 'Statut inconnu';
    }

    if (activity) {
        const activityText = activity.querySelector('.activity-text');
        if (userData.activities && userData.activities.length > 0) {
            const customStatus = userData.activities.find(act => act.type === 4);
            if (customStatus) {
                const emoji = customStatus.emoji ? `${customStatus.emoji.name} ` : '';
                const state = customStatus.state || '';
                activityText.textContent = `${emoji}${state}`.trim() || 'Custom Status';
            } else {
                const currentActivity = userData.activities[0];
                if (currentActivity.type === 0) {
                    activityText.textContent = `Playing ${currentActivity.name}`;
                } else if (currentActivity.type === 2) {
                    activityText.textContent = `Listening to ${currentActivity.name}`;
                } else if (currentActivity.type === 3) {
                    activityText.textContent = `Watching ${currentActivity.name}`;
                } else {
                    activityText.textContent = currentActivity.name;
                }
            }
        } else {
            const activityStatusTexts = {
                online: 'Online',
                idle: 'Away',
                dnd: 'Do Not Disturb',
                offline: 'Offline'
            };
            activityText.textContent = activityStatusTexts[status] || 'Offline';
        }
    }
}

async function updateSpotifyStatus() {
    try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${CONFIG.DISCORD_USER_ID}`);
        const data = await response.json();

        if (data.success && data.data && data.data.spotify) {
            updateSpotifyUI(data.data.spotify);
        } else {
            updateSpotifyUI(null);
        }
    } catch (error) {
        console.log('error while fetching Spotify data', error);
        updateSpotifyUI(null);
    }
}

function updateSpotifyProgress() {
    if (!currentSpotifyData) return;

    const progressFill = document.getElementById('spotify-progress');
    const currentTimeElement = document.getElementById('current-time');
    const totalTimeElement = document.getElementById('total-time');

    const progress = ((Date.now() - currentSpotifyData.timestamps.start) / (currentSpotifyData.timestamps.end - currentSpotifyData.timestamps.start)) * 100;
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    if (progressFill) {
        progressFill.style.width = `${clampedProgress}%`;
    }

    const currentMs = Date.now() - currentSpotifyData.timestamps.start;
    const totalMs = currentSpotifyData.timestamps.end - currentSpotifyData.timestamps.start;

    if (currentTimeElement) {
        currentTimeElement.textContent = formatTime(Math.max(0, currentMs));
    }
    if (totalTimeElement) {
        totalTimeElement.textContent = formatTime(totalMs);
    }
}

function updateSpotifyUI(spotifyData) {
    const trackElement = document.getElementById('spotify-track');
    const artistElement = document.getElementById('spotify-artist');
    const albumElement = document.getElementById('spotify-album');
    const albumContainer = document.querySelector('.album-container');
    const playingIndicator = document.getElementById('spotify-playing');
    const progressContainer = document.getElementById('spotify-progress-container');

    currentSpotifyData = spotifyData;

    if (spotifyData) {
        if (trackElement) trackElement.textContent = spotifyData.song;
        if (artistElement) artistElement.textContent = spotifyData.artist;
        if (albumElement) {
            albumElement.src = spotifyData.album_art_url;
            albumElement.classList.add('visible');
        }
        if (albumContainer) {
            albumContainer.classList.remove('hidden');
        }

        if (playingIndicator) {
            playingIndicator.classList.add('playing');
        }

        if (progressContainer) {
            progressContainer.classList.add('visible');
        }

        updateSpotifyProgress();
    } else {
        if (trackElement) trackElement.textContent = 'currently not playing';
        if (artistElement) artistElement.textContent = '-';
        if (albumElement) {
            albumElement.src = '';
            albumElement.classList.remove('visible');
        }
        if (albumContainer) {
            albumContainer.classList.add('hidden');
        }
        if (playingIndicator) {
            playingIndicator.classList.remove('playing');
        }
        if (progressContainer) {
            progressContainer.classList.remove('visible');
        }
    }
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function showNotification(title, message, type = 'success', duration = 3000) {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icon = 'fas fa-check-circle';

    notification.innerHTML = `
        <div class="notification-icon">
            <i class="${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;

    const slider = document.getElementById('volume-slider-container');
    if (slider) {
        document.body.appendChild(notification);
        const rect = slider.getBoundingClientRect();
        notification.style.right = (window.innerWidth - rect.right + 0) + 'px';
        notification.style.top = (rect.top + rect.height + 8) + 'px';
    } else {
        document.body.appendChild(notification);
    }

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const result = document.execCommand('copy');
            textArea.remove();
            return result;
        }
    } catch (err) {
        console.error('error copying:', err);
        return false;
    }
}

function initializeSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-link');

    socialLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            const platform = link.getAttribute('data-platform');
            const linkUrl = link.getAttribute('data-link');
            if (platform === 'Email') {
                e.preventDefault();
                if (linkUrl) {
                    const copied = await copyToClipboard(linkUrl);
                    if (copied) {
                        showNotification('Contact copied to clipboard', '', 'success', 2500);
                    } else {
                        showNotification('Error', 'Failed to copy email address.', 'error', 2500);
                    }
                }
            } else {
                e.preventDefault();
                if (linkUrl) {
                    window.open(linkUrl, '_blank');
                }
            }
        });
    });
}

function initializeVolumeSlider() {
    const slider = document.getElementById('volume-slider');
    const bgMusic = document.getElementById('bg-music');
    const percent = document.getElementById('volume-percent');
    if (!slider || !bgMusic || !percent) return;

    slider.value = 0.5;
    bgMusic.volume = 0.5;
    percent.textContent = '50%';

    slider.addEventListener('input', function() {
        let value = Math.max(0, Math.min(1, parseFloat(slider.value)));
        bgMusic.volume = value;
        percent.textContent = Math.round(value * 100) + '%';
    });
}
