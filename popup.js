document.addEventListener('DOMContentLoaded', function() {
    let trackedTabs = JSON.parse(localStorage.getItem("trackedTabs")) || [];
    let tabTimers = {};
    let activeTabId = null;
    let currentTab = {};

    const darkModeSwitch = document.getElementById("darkModeSwitch");
    const container = document.getElementsByClassName("container").item(0);
    const tabBtn = document.getElementById("tab-btn");
    let ulEL = document.getElementById("ul-el");
    const clearBtn = document.getElementById("clear-btn")
    let darkMode = false;

    for (const tab of trackedTabs) {
        if (!tabTimers[tab.tabId]) {
            tabTimers[tab.tabId] = {
                startTime: Date.now(),
                timeSpent: tab.timeSpent || 0
            };
        }
    }

    //DARK MODE BUTTON START
    function toggleDarkMode() {
        darkMode = !darkMode;
        container.classList.toggle('dark-mode', darkMode);
    }

    darkModeSwitch.addEventListener("change", toggleDarkMode);

    clearBtn.addEventListener("click", function(){
        localStorage.clear();
        console.log("clearing")
        render(trackedTabs);
    })
    //DARK MODE BUTTON END

    //Creates a new tab and adds it to the tracked tabs when clicked
    tabBtn.addEventListener("click", function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const tab = tabs[0];
            const tabDomain = new URL(tab.url).hostname;
            
            //supposed to check if tab already exists 
            const existingTab = trackedTabs.find(item => new URL(item.url).hostname === tabDomain);
    
           // if (!existingTab) {
                const tabId = tab.id;
    
                if (!tabTimers[tabId]) {
                    tabTimers[tabId] = {
                        startTime: Date.now(),
                        timeSpent: 0
                    };
                }
    
                trackedTabs.push({ tabId, url: tab.url });
                localStorage.setItem("trackedTabs", JSON.stringify(trackedTabs));
                render(trackedTabs);
           // }
        });
    });
    

    chrome.tabs.onActivated.addListener(function(activeInfo) {
        const prevTabId = activeTabId;
        activeTabId = activeInfo.tabId;
    
        if (prevTabId && tabTimers[prevTabId]) {
            const endTime = Date.now();
            tabTimers[prevTabId].timeSpent += endTime - tabTimers[prevTabId].startTime;
            tabTimers[prevTabId].startTime = endTime;
            updateRenderedTime(prevTabId, tabTimers[prevTabId].timeSpent);
            localStorage.setItem("trackedTabs", JSON.stringify(trackedTabs));
        }
    
        // Start the timer for the newly activated tab
        if (tabTimers[activeTabId]) {
            tabTimers[activeTabId].startTime = Date.now();
        }
    });
    

// chrome.tabs.onActivated.addListener(function(activeInfo) {
//     const prevTabId = activeTabId;
//     activeTabId = activeInfo.tabId;

//     if (prevTabId && tabTimers[prevTabId]) {
//         const endTime = Date.now();
//         tabTimers[prevTabId].timeSpent += endTime - tabTimers[prevTabId].startTime;
//         tabTimers[prevTabId].startTime = endTime;
//         updateRenderedTime(prevTabId, tabTimers[prevTabId].timeSpent);
//         localStorage.setItem("trackedTabs", JSON.stringify(trackedTabs));
//     }

//     // Start the timer for the newly activated tab
//     if (tabTimers[activeTabId]) {
//         tabTimers[activeTabId].startTime = Date.now();
//     }
// });


    // Periodically update the displayed time for tracked tabs
    setInterval(function() {
        //console.log(activeTabId)
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            currentTab = tabs[0];
            //console.log(currentTab.id)
        })
        for (const tabId in tabTimers) {
            console.log(`${tabId}  Current Tab: ${currentTab.id}`)      
            if (tabTimers.hasOwnProperty(tabId) && tabId === currentTab.id) {
                console.log(`${tabId}  Current Tab: ${currentTab.id}`)
                const elapsedTime = Date.now() - tabTimers[tabId].startTime;
                updateRenderedTime(tabId, tabTimers[tabId].timeSpent + elapsedTime);
            }
        }
    }, 1000); // Update every second

    
    

    function updateRenderedTime(tabId, timeSpent) {
        const tabElement = document.getElementById(`tab-${tabId}`);
        if (tabElement) {
            tabElement.querySelector(".time-spent").textContent = formatTime(timeSpent);
        }
    }

    function formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m ${seconds % 60}s`;
    }

    function render(tabs) {
        let listItems = "";
        for (let i = 0; i < tabs.length; i++) {
            const tabId = tabs[i].tabId;
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
        ulEL.innerHTML = listItems;
    }
});
