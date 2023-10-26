document.addEventListener('DOMContentLoaded', function() {
    let tabTimers = {};
    let darkMode = false;
    const darkModeSwitch = document.getElementById("darkModeSwitch");
    const container = document.getElementsByClassName("container").item(0);

    // document.getElementById('tab-btn').addEventListener('click', function () {
    //     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //         if (tabs.length === 0) return; // No active tab found
    
    //         const tab = tabs[0];
    //         const tabId = tab.id.toString();
            
    //         // Check if the tab is already being tracked
    //         if (!tabTimers[tabId]) {
    //             tabTimers[tabId] = { timeSpent: 0, url: tab.url };
                
    //             // Save the new tab to local storage and update the UI
    //             chrome.storage.local.set({ tabTimers: tabTimers }, function () {
    //                 loadTabTimers(); // Reload the rendered list with the new tab
    //             });
    //         }
    //     });
    // });

     //DARK MODE BUTTON START
     function toggleDarkMode() {
        darkMode = !darkMode;
        container.classList.toggle('dark-mode', darkMode);
    }

    darkModeSwitch.addEventListener("change", toggleDarkMode);
    // Format time from milliseconds to a readable "X min Y sec" format
    function formatTime(milliseconds) {
        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        return `${minutes} min ${seconds} sec`;
    }
    
    // Render the list of tabs and times in the popup
    function render(tabs) {
        let listItems = "";
        for (let i = 0; i < tabs.length; i++) {
            const tabId = tabs[i].id.toString();
            const url = tabs[i].url;
            const timeSpent = tabTimers[tabId] ? tabTimers[tabId].timeSpent : 0;
    
            listItems += `
                <li id="tab-${tabId}">
                    <a target='_blank' href='${url}'>
                        ${url}
                    </a>
                    <span class="time-spent">${formatTime(timeSpent)}</span>
                </li>
            `;
        }
        document.getElementById('ul-el').innerHTML = listItems;
    }
    
    // Load tab timers from local storage
    function loadTabTimers() {
        chrome.storage.local.get(['tabTimers'], function (result) {
            if (result.tabTimers) {
                tabTimers = result.tabTimers;
            }
            // Query all tabs to render them with the loaded time data
            chrome.tabs.query({}, function (tabs) {
                render(tabs);
            });
        });
    }
    
    // Update the time spent for the currently active tab
    function updateTime() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0]) {
                const tabId = tabs[0].id.toString();
                if (!tabTimers[tabId]) {
                    tabTimers[tabId] = { timeSpent: 0, url: tabs[0].url };
                }
                tabTimers[tabId].timeSpent += 1000; // Increment the timer by 1 second
    
                // Save the updated times to local storage
                chrome.storage.local.set({ tabTimers: tabTimers }, function () {
                    loadTabTimers(); // Reload the rendered list with updated times
                });
            }
        });
    }
    
    // Clear the time data and update the UI
    document.getElementById('clear-btn').addEventListener('click', function () {
        chrome.storage.local.remove(['tabTimers'], function () {
            tabTimers = {};
            loadTabTimers();
        });
    });
    
    // Initialize by loading any saved tab timer data
    loadTabTimers();
    // Update time every second
    setInterval(updateTime, 1000);
})
