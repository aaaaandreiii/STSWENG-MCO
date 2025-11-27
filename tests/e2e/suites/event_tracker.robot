*** Settings ***
Resource        ../resources/Auth.resource
Resource        ../resources/Common.resource
Test Teardown   Close Browser Session

*** Keywords ***
Open Event Tracker Home As Admin
    Login As Admin
    # After login we should land on /event-tracker/home
    ${url}=    Get Url
    Should Contain    ${url}    /event-tracker/home
    Wait For Elements State    css=#today-title h1    visible    10s

*** Test Cases ***
Event Tracker Home Shows Today Section
    [Tags]    event    smoke
    Open Event Tracker Home As Admin
    Wait For Elements State    css=#today-main    visible    10s
    ${title}=    Get Text    css=#today-main h4.fw-bolder >> nth=0
    Should Contain    ${title}    Events for Today

Event Lists Links Navigate To Correct Pages
    [Tags]    event    navigation
    Open Event Tracker Home As Admin

    # Pencil Bookings
    Click    text=Event Lists
    Click    role=link[name="Pencil Bookings"]
    Wait For Elements State    xpath=//h1[contains(., "PENCILBOOKINGS")]    state=visible

    # Reservations
    Click    text=Event Lists
    Click    role=link[name="Reservations"]
    Wait For Elements State    xpath=//h1[contains(., "RESERVATIONS")]    state=visible

    # Past Events
    Click    text=Event Lists
    Click    role=link[name="Past Events"]
    Wait For Elements State    xpath=//h1[contains(., "PAST EVENTS")]    state=visible

    # Cancelled Events
    Click    text=Event Lists
    Click    role=link[name="Cancelled Events"]
    Wait For Elements State    xpath=//h1[contains(., "CANCELLED EVENTS")]    state=visible

Calendar Page Opens From Navbar
    [Tags]    event    calendar
    Open Event Tracker Home As Admin
    Click    role=link[name="Calendar"]
    Wait For Elements State    css=h2.calendar-monthyear    state=visible
    Wait For Elements State    css=.calendar-dayofweek >> text=SUN    state=visible
