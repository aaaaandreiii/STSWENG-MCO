*** Settings ***
Library    Browser

*** Variables ***
${BASE_URL}    http://localhost:3000
${BROWSER}     chromium
# true - runs in background wo pop up window
${HEADLESS}    ${TRUE} 

*** Keywords ***
Open Browser And Context
    New Browser    ${BROWSER}    headless=${HEADLESS}
    New Context    baseURL=${BASE_URL}    viewport=${NONE}

Close Browser Session
    Close Browser

Open App On Path
    [Arguments]    ${path}
    Open Browser And Context
    New Page    ${BASE_URL}${path}
    
Go To Admin Home
    New Page    /admin
    Wait For Elements State    css=#admin-title    state=visible

Go To Settings
    New Page    /settings/event
    Wait For Elements State    css=#admin-title    state=visible

Should Be On Event Tracker Home
    Wait For Elements State    css=#today-title    state=visible
    # Optionally also:
    Wait For Elements State    css=#today-main    state=visible
