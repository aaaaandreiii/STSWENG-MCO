*** Settings ***
Resource    Common.resource

*** Variables ***
${ADMIN_USERNAME}    admin
${ADMIN_PASSWORD}    defaultPassword

*** Keywords ***
Open Login Page
    Open App On Path    /login
    Wait For Elements State    css=form[action="/authenticate"]    state=visible

Login With Credentials
    [Arguments]    ${username}    ${password}
    Open Login Page
    Fill Text    css=#username    ${username}
    Fill Text    css=#password    ${password}
    Click        text=Login
    # NOTE: intentionally no "Wait For Navigation" here

Login As Admin
    Login With Credentials    ${ADMIN_USERNAME}    ${ADMIN_PASSWORD}
    Wait For Elements State    css=#today-title h1    state=visible
    ${url}=    Get Url
    Should Contain    ${url}    /event-tracker/home

Should Be On Login Page
    ${url}=    Get Url
    Should Contain    ${url}    /login
