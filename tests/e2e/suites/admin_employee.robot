*** Settings ***
Resource        ../resources/Admin.resource
Resource        ../resources/Common.resource
Test Teardown   Browser.Close Browser

*** Test Cases ***
Admin Can Register New Employee (Happy Path)
    [Tags]    admin    smoke
    ${username}=    Set Variable    robot-e2e-${TEST NAME}
    ${password}=    Set Variable    Passw0rd!23
    Open Register Employee Page
    Fill Valid Employee Registration Form    ${username}    ${password}
    Submit Employee Registration Form

    # wait explicitly for the redirect that only happens on success
    Wait For Navigation    **/admin
    ${url}=    Get Url
    Should Contain    ${url}    /admin

Admin Registration Shows Validation Errors When Required Fields Missing
    [Tags]    admin    validation
    Open Register Employee Page
    # leave employee-name blank on purpose
    Fill Text    css=#employee-mobile-number          +639171234567
    Fill Text    css=#username                         someuser
    Fill Text    css=#password                         Passw0rd!23
    Submit Employee Registration Form

    # JS populates error divs like #employee-name-error when fields are invalid
    ${error}=    Get Text    css=#employee-name-error
    Should Not Be Empty    ${error}