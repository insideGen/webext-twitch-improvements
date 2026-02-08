declare const browser: typeof chrome;

interface ExtensionMessage
{
    context: 'window' | 'tabMuted' | 'popup';
    action: 'get' | 'toggle' | 'open';
}

const browserApi: typeof chrome = typeof browser !== 'undefined' ? browser : chrome;

browserApi.runtime.onInstalled.addListener(() =>
{
    browserApi.contextMenus.create({ id: 'openLinkAsPopup', title: browserApi.i18n.getMessage('openLinkAsPopup'), contexts: ['link'], targetUrlPatterns: ['*://*.twitch.tv/*'] });
    browserApi.contextMenus.create({ id: 'reopenAsPopup', title: browserApi.i18n.getMessage('reopenAsPopup'), contexts: ['page'], documentUrlPatterns: ['*://*.twitch.tv/*'] });
});

browserApi.contextMenus.onClicked.addListener((info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) =>
{
    try
    {
        if (info.menuItemId === 'reopenAsPopup')
        {
            browserApi.windows.create({ url: info.pageUrl, type: 'popup' });
        }
        else if (info.menuItemId === 'openLinkAsPopup')
        {
            browserApi.windows.create({ url: info.linkUrl, type: 'popup' });
        }
    }
    catch (exception)
    {
        console.error(exception);
    }
});

browserApi.runtime.onMessage.addListener((message: ExtensionMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: unknown) => void) =>
{
    try
    {
        if (message.context === 'window')
        {
            if (message.action === 'get')
            {
                browserApi.windows.get(sender.tab!.windowId, (win) =>
                {
                    sendResponse({ type: win.type });
                });
                return true;
            }
        }
        else if (message.context === 'tabMuted')
        {
            if (message.action === 'get')
            {
                sendResponse(sender.tab!.mutedInfo!.muted);
                return true;
            }
            else if (message.action === 'toggle')
            {
                const newMuted = !sender.tab!.mutedInfo!.muted;
                browserApi.tabs.update(sender.tab!.id!, { muted: newMuted }, () =>
                {
                    sendResponse(newMuted);
                });
                return true;
            }
        }
        else if (message.context === 'popup')
        {
            if (message.action === 'open')
            {
                browserApi.windows.create({ url: sender.url, type: 'popup' });
                return false;
            }
        }
    }
    catch (exception)
    {
        console.error(exception);
    }
});

console.log('Background script started');
