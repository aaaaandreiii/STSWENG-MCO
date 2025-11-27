*** Settings ***
Resource    Common.resource
Resource    Auth.resource

*** Keywords ***
Open Register Employee Page
    Login As Admin
    New Page    /admin/register
    Wait For Elements State    xpath=//div[@id="form-title"]//h1[contains(., "REGISTER EMPLOYEE")]    state=visible

Fill Valid Employee Registration Form
    [Arguments]    ${username}    ${password}
    # employee details
    Fill Text    css=#employee-name                    Robot E2E
    Fill Text    css=#employee-mobile-number           +639171234567
    Fill Text    css=#emergency-contact-name           Juan John Dela of the Cruz
    Fill Text    css=#emergency-contact-mobile-number  +639189876543

    # account details
    Fill Text    css=#username                         ${username}
    Fill Text    css=#password                         ${password}
    Select Options By    css=#role                     value    frontdesk


Submit Employee Registration Form
    # click the first "Submit"
    Click    css=#submit
    Wait For Elements State    css=#confirm-submit-modal.show    state=visible
    # click green "Submit" in the confirm modal (type="submit")
    Click    css=#confirm-submit-modal button.btn-success[type="submit"]
    # NOTE: no Wait For Navigation here; callers decide what to expect
