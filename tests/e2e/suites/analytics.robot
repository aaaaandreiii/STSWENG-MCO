*** Settings ***
Resource        ../resources/Auth.resource
Resource        ../resources/Common.resource
Test Teardown   Close Browser Session

*** Keywords ***
Open Analytics Page As Admin
    Login As Admin
    Click    css=a.nav-link.dropdown-toggle.px-3
    Click    text=Analytics
    Wait For Elements State    xpath=//h1[contains(., "Analytics Dashboard")]    state=visible

*** Test Cases ***
Analytics Dashboard Renders Summary Sections
    [Tags]    analytics    smoke
    Open Analytics Page As Admin
    Wait For Elements State    xpath=//h4[contains(., "Upcoming Events (by month)")]         visible    5s
    Wait For Elements State    xpath=//h4[contains(., "Cancelled Events (by month)")]        visible    5s
    Wait For Elements State    xpath=//h4[contains(., "Revenue Summary")]                    visible    5s
    Wait For Elements State    xpath=//h4[contains(., "Events per Venue")]                   visible    5s
    Wait For Elements State    xpath=//h4[contains(., "Events per Time of Day")]             visible    5s

Analytics Sections Show Either Tables Or Empty States
    [Tags]    analytics    data
    Open Analytics Page As Admin

    # Upcoming Events
    ${upcoming_empty}=    Run Keyword And Return Status
    ...    Wait For Elements State    xpath=//p[contains(., "No upcoming events.")]    visible    2s
    ${upcoming_table}=    Run Keyword And Return Status
    ...    Wait For Elements State    xpath=//h4[contains(., "Upcoming Events")]/following::table[1]    visible    2s
    Should Be True    ${upcoming_empty} or ${upcoming_table}

    # Cancelled Events
    ${cancel_empty}=    Run Keyword And Return Status
    ...    Wait For Elements State    xpath=//p[contains(., "No cancelled events.")]    visible    2s
    ${cancel_table}=    Run Keyword And Return Status
    ...    Wait For Elements State    xpath=//h4[contains(., "Cancelled Events")]/following::table[1]    visible    2s
    Should Be True    ${cancel_empty} or ${cancel_table}

    # Events per Venue
    ${venue_empty}=    Run Keyword And Return Status
    ...    Wait For Elements State    xpath=//p[contains(., "No venue data.")]    visible    2s
    ${venue_table}=    Run Keyword And Return Status
    ...    Wait For Elements State    xpath=//h4[contains(., "Events per Venue")]/following::table[1]    visible    2s
    Should Be True    ${venue_empty} or ${venue_table}

    # Events per Time of Day
    ${time_empty}=    Run Keyword And Return Status
    ...    Wait For Elements State    xpath=//p[contains(., "No time-of-day data.")]    visible    2s
    ${time_table}=    Run Keyword And Return Status
    ...    Wait For Elements State    xpath=//h4[contains(., "Events per Time of Day")]/following::table[1]    visible    2s
    Should Be True    ${time_empty} or ${time_table}
