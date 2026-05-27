*** Settings ***
Documentation     Testes UI de login do SeniorFit usando Robot Framework.
Library           SeleniumLibrary
Suite Setup       Open Browser    http://localhost:3000/login.html    chrome
Suite Teardown    Close Browser

*** Variables ***
${EMAIL_ADMIN}    admin@seniorfit.com
${SENHA}          123456

*** Test Cases ***
Login Admin Com Sucesso
    Input Text    id=email    ${EMAIL_ADMIN}
    Input Password    id=senha    ${SENHA}
    Click Button    id=btnLogin
    Wait Until Location Contains    dashboard.html    5s

Login Sem Senha Exibe Mensagem
    Go To    http://localhost:3000/login.html
    Input Text    id=email    ${EMAIL_ADMIN}
    Click Button    id=btnLogin
    Page Should Contain    Informe a senha
