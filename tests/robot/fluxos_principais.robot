*** Settings ***
Documentation     Fluxos didáticos de UI para idosos, atividades, histórico e dashboard.
Library           SeleniumLibrary
Suite Setup       Open Browser    http://localhost:3000/login.html    chrome
Suite Teardown    Close Browser

*** Variables ***
${BASE}           http://localhost:3000
${EMAIL_PROF}     paula@seniorfit.com
${SENHA}          123456

*** Keywords ***
Login Profissional
    Go To    ${BASE}/login.html
    Input Text    id=email    ${EMAIL_PROF}
    Input Password    id=senha    ${SENHA}
    Click Button    id=btnLogin
    Wait Until Location Contains    dashboard.html    5s

*** Test Cases ***
Profissional Acessa Cadastro De Idosos
    Login Profissional
    Go To    ${BASE}/idosos.html
    Page Should Contain    Cadastro de Idosos

Profissional Acessa Registro De Atividades
    Login Profissional
    Go To    ${BASE}/atividades.html
    Page Should Contain    Registro de Atividades

Dashboard Exige Selecao De Idoso
    Login Profissional
    Go To    ${BASE}/dashboard.html
    Click Button    id=btnConsultar
    Page Should Contain    Selecione um idoso
