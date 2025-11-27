*** Settings ***
Resource        ../resources/Auth.resource
Resource        ../resources/Common.resource
Test Teardown   Close Browser Session

*** Keywords ***
Open Profile Page As Admin
    Login As Admin
    Click    css=a.nav-link.dropdown-toggle.px-3
    Click    css=a.dropdown-item[href="/profile"]
    Wait For Elements State    xpath=//h2[contains(., "My Profile")]    state=visible

*** Test Cases ***
Profile Page Shows Current Employee Data
    [Tags]    profile    smoke
    Open Profile Page As Admin
    Wait For Elements State    xpath=//h2[contains(., "My Profile")]    visible    5s
    # Static account info
    Wait For Elements State    xpath=//p[strong[text()="Username:"]]    visible    5s
    Wait For Elements State    xpath=//p[strong[text()="Role:"]]        visible    5s
    # Editable fields
    Wait For Elements State    id=name                   visible    5s
    Wait For Elements State    id=contactNum             visible    5s
    Wait For Elements State    id=emergencyContactName   visible    5s
    Wait For Elements State    id=emergencyContactNum    visible    5s
    Wait For Elements State    id=oldPassword            visible    5s
    Wait For Elements State    id=newPassword            visible    5s
    Wait For Elements State    id=confirmPassword        visible    5s

Profile Update Fails When Passwords Do Not Match
    [Tags]    profile    validation
    Open Profile Page As Admin
    # Ensure non-password fields are valid so we hit the mismatch branch
    Fill Text    id=name                  Automation Test
    Fill Text    id=contactNum            09123456789
    Fill Text    id=emergencyContactName  EC Name
    Fill Text    id=emergencyContactNum   09987654321

    Fill Text    id=oldPassword       someOldPassword123
    Fill Text    id=newPassword       NewPass123
    Fill Text    id=confirmPassword   DifferentPass

    Click        css=form[action="/profile"] button[type="submit"]
    Wait For Elements State    css=.alert.alert-danger    visible    5s
    ${msg}=    Get Text    css=.alert.alert-danger
    Should Contain    ${msg}    Could not update profile
