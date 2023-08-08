let tabStartTime = {}

function handleTabActivated(activeInfo){
    const tabID = activeInfo.tabID;
    tabStartTime[tabID] = Date.now;
}

function handleTabUpdated(tabID, changeInfo, tab){

}