*** Settings ***
Resource        ../resources/Auth.resource
Resource        ../resources/Common.resource
Test Teardown   Browser.Close Browser

*** Test Cases ***
Login Succeeds With Valid Admin Credentials
    [Tags]    smoke    auth
    Login As Admin

Login Fails With Wrong Password
    [Tags]    regression    auth
    Login With Credentials    ${ADMIN_USERNAME}    wrong-password-123
    # should still be on login page with an error message rendered by auth-controller
    Should Be On Login Page
    # optional stricter check (login.hbs shows .alert-danger when {{error}} exists)
    ${error}=    Get Text    css=.alert-danger
    Should Not Be Empty    ${error}

Unauthenticated User Is Redirected To Login When Accessing Admin
    [Tags]    auth    security
    Open App On Path    /admin
    Should Be On Login Page
