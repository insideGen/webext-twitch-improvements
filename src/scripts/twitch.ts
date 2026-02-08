// Twitch Components

function getBroadcasterName(): HTMLAnchorElement | null
{
    return document.querySelector('a[data-test-selector="stream-info-card-component__title-link"]');
}

function getChatHeaderElement(): HTMLElement | null
{
    return document.querySelector('section.chat-room [class^="ScTransitionBase"]');
}

function getCommunityPointsButtonElement(): HTMLButtonElement | null
{
    return document.querySelector('div.community-points-summary button[aria-label="Récupérer un bonus"]');
}

function getDisableStudioModeButtonElement(): HTMLElement | null
{
    return document.querySelector('[aria-label="Quitter le mode Studio (alt+T)"]');
}

function getEnableStudioModeButtonElement(): HTMLElement | null
{
    return document.querySelector('[aria-label="Mode Studio (alt+T)"]');
}

function getGameNameElement(): HTMLAnchorElement | null
{
    return document.querySelector('a[data-a-target="player-info-game-name"]');
}

function getLiveTimeElement(): HTMLSpanElement | null
{
    return document.querySelector('span.live-time span');
}

function getMuteUnmuteButtonElement(): HTMLButtonElement | null
{
    return document.querySelector('button[data-a-target="player-mute-unmute-button"]');
}

function getStreamInfoElement(): HTMLParagraphElement | null
{
    return document.querySelector('p[data-test-selector="stream-info-card-component__description"]');
}

function getStreamTitleElement(): HTMLParagraphElement | null
{
    return document.querySelector('p[data-a-target="stream-title"]');
}

// Helpers

function getRandomIntInclusive(min: number, max: number): number
{
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

function getStudioModeButtonElement(): HTMLElement | null
{
    return getEnableStudioModeButtonElement() || getDisableStudioModeButtonElement();
}

function isStudioModeEnabled(): boolean
{
    return getEnableStudioModeButtonElement() == null;
}

// Extension Injection

let studioMode = true;

function collectCommunityPoints(): boolean
{
    const communityPointsButton = getCommunityPointsButtonElement();
    if (communityPointsButton == null) return false;

    const delay = getRandomIntInclusive(10, 40) * 100;
    setTimeout(() =>
    {
        communityPointsButton.click();
        console.log('Twitch Improvement: Community Points collected');
    }, delay);

    return true;
}

function dblClickMuteHandler(this: GlobalEventHandlers, event: MouseEvent): void
{
    const sender = this as HTMLElement;
    event.stopPropagation();
    chrome.runtime.sendMessage({ context: 'tabMuted', action: 'toggle' }, (tabMuted: boolean) =>
    {
        sender.style.color = tabMuted ? '#f00' : 'var(--color-fill-button-icon)';
    });
}

function enableStudioMode(): boolean
{
    const studioModeButton = getStudioModeButtonElement();
    if (studioModeButton == null) return false;

    studioModeButton.click();

    console.log('Twitch Improvement: Studio Mode enabled');

    return true;
}

function hideChatHeader(): boolean
{
    const chatHeader = getChatHeaderElement();
    if (chatHeader == null) return false;

    if (chatHeader.style.position === 'absolute' && chatHeader.style.zIndex === '-1') return false;

    chatHeader.style.position = 'absolute';
    chatHeader.style.zIndex = '-1';

    console.log('Twitch Improvement: Chat header hidden');

    return true;
}

function injectDblClickMuteButton(): boolean
{
    const muteUnmuteButton = getMuteUnmuteButtonElement();
    if (muteUnmuteButton == null) return false;

    chrome.runtime.sendMessage({ context: 'tabMuted', action: 'get' }, (tabMuted: boolean) =>
    {
        const newColor = tabMuted ? '#f00' : 'var(--color-fill-button-icon)';
        if (muteUnmuteButton.style.color !== newColor)
        {
            muteUnmuteButton.style.color = newColor;
        }
    });

    // Don't duplicate
    if (muteUnmuteButton.ondblclick === dblClickMuteHandler) return false;

    muteUnmuteButton.ondblclick = dblClickMuteHandler;

    console.log('Twitch Improvement: Tab mute on double click enabled');

    return true;
}

function injectStudioModeClickEvent(): void
{
    const studioModeButton = getStudioModeButtonElement();
    if (studioModeButton == null) return;

    if (studioModeButton.onclick !== studioModeClickHandler)
    {
        studioModeButton.onclick = studioModeClickHandler;
    }

    if (studioMode && !isStudioModeEnabled())
    {
        studioModeButton.click();
        console.log('Twitch Improvement: Studio Mode enabled');
    }
}

function studioModeClickHandler(_event: Event): void
{
    studioMode = !isStudioModeEnabled();
}

function updateLiveTime(): boolean
{
    const liveTimeElement = getLiveTimeElement();
    const streamInfoElement = getStreamInfoElement();
    if (liveTimeElement == null || streamInfoElement == null) return false;

    const liveTime = (liveTimeElement.textContent ?? '').trim();

    let streamTimeElement = streamInfoElement.parentElement!.querySelector('.stream-time') as HTMLElement | null;
    if (streamTimeElement != null)
    {
        const streamTime = (streamTimeElement.textContent ?? '').trim();
        if (liveTime === streamTime) return false;
    }
    else
    {
        streamTimeElement = streamInfoElement.cloneNode(true) as HTMLElement;
        streamTimeElement.classList.add('stream-time');
        streamTimeElement.style.display = 'flex';
        streamInfoElement.parentElement!.appendChild(streamTimeElement);
    }

    streamTimeElement.textContent = liveTime;

    console.log('Twitch Improvement: Live time updated');

    return true;
}

function updateTitle(): boolean
{
    const broadcasterNameElement = getBroadcasterName();
    const gameNameElement = getGameNameElement();
    const streamTitleElement = getStreamTitleElement();
    if (broadcasterNameElement == null || gameNameElement == null || streamTitleElement == null) return false;

    const broadcasterName = (broadcasterNameElement.textContent ?? '').trim();
    const gameName = (gameNameElement.textContent ?? '').trim();
    const streamTitle = (streamTitleElement.textContent ?? '').trim();

    const newTitle = `${broadcasterName} – ${gameName} – ${streamTitle}`;
    if (document.title === newTitle) return false;

    document.title = newTitle;

    console.log('Twitch Improvement: Title updated');

    return true;
}

// Main Observer

let winType: string | null = null;

function refresh(): void
{
    collectCommunityPoints();
    injectDblClickMuteButton();
    updateLiveTime();

    if (winType === 'popup')
    {
        updateTitle();
        hideChatHeader();
        injectStudioModeClickEvent();
    }
}

function mutationCallback(_records: MutationRecord[], _observer: MutationObserver): void
{
    // console.log('Twitch Improvement: DOM mutation detected');

    if (chrome.runtime?.id == null) return;

    if (winType == null)
    {
        chrome.runtime.sendMessage({ context: 'window', action: 'get' }, (win: { type: string }) =>
        {
            winType = win.type;
            refresh();
        });
    }
    else
    {
        refresh();
    }
}

const observer = new MutationObserver(mutationCallback)
    .observe(document.body, {
        subtree: true,
        childList: true,
        attributeFilter: ['aria-label', 'class', 'data-a-target', 'data-test-selector']
    });

console.log('Twitch Improvement: Script injected');
