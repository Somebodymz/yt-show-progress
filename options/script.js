/**
 * Load settings
 */
function loadSettings() {
    browser.storage.local.get(['settings']).then(result => {
        const settings = result.settings || {};
        console.log(`ytsp: loading settings:`, settings);

        for (let key in settings) {
            const element = document.getElementById(key);
            if (element) {
                switch (element.type) {
                    case 'checkbox':
                        element.checked = settings[key];
                        break;
                    default:
                        element.value = settings[key];
                        break;
                }
            }
        }
    }, error => {
        console.log(`ytsp: ERROR loading settings:`, error);
    });
}

/**
 * Save settings
 *
 * @param e Event object.
 */
function saveSetting(e) {
    const element = e.target;
    let elStatus = document.getElementById('status');
    let value;

    switch (element.type) {
        case 'checkbox':
            value = element.checked;
            break;
        default:
            value = element.value;
            break;
    }

    elStatus.textContent = 'Saving...';
    elStatus.classList.remove('hidden');

    browser.storage.local.get('settings').then((result) => {
        const settings = result.settings || {};
        settings[element.id] = value;

        return browser.storage.local.set({settings: settings});
    }).then(() => {
        elStatus.textContent = 'Settings saved.';
        setTimeout(() => {
            elStatus.classList.add('hidden');
        }, 750);
    }).catch(error => {
        console.log(`ytsp: ERROR saving settings:`, error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();

    document.querySelectorAll('.saveable').forEach(input => {
        input.addEventListener("change", saveSetting);
    });
});
