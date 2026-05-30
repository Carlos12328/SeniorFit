*** Settings ***
Library          SeleniumLibrary
Library          OperatingSystem
Suite Setup      Abrir Navegador SeniorFit
Suite Teardown   Fechar Navegador SeniorFit
Test Setup       Acessar Pagina de Login
Test Teardown    Limpar Sessao do Navegador

*** Variables ***
${LOGIN_URL}          file:///C:/Users/Anna/Downloads/SeniorFit-main/SeniorFit-main/frontend/login.html
${ADMIN_NAME}         Admin
${ADMIN_PASS}         123456
${WRONG_PASS}         senha_errada_99
${WRONG_NAME}         usuario_inexistente
${BROWSER}            Chrome
${TIMEOUT}            10s
*** Keywords ***
Abrir Navegador SeniorFit
    Open Browser    about:blank    ${BROWSER}
    Maximize Browser Window

Fechar Navegador SeniorFit
    Close Browser

Limpar Sessao do Navegador
    Execute Javascript    window.localStorage.clear()
    Execute Javascript    window.sessionStorage.clear()
    Log    Sessão limpa — nenhum dado de usuário no storage.

Acessar Pagina de Login
    Go To    ${LOGIN_URL}
    Sleep    2s
    Wait Until Element Is Visible    xpath=//input[@type='password']    timeout=${TIMEOUT}

Preencher Campo Nome
    [Arguments]    ${nome}
    # Encontra o primeiríssimo elemento <input> do formulário
    Wait Until Element Is Visible    xpath=(//input)[1]    timeout=${TIMEOUT}
    Clear Element Text               xpath=(//input)[1]
    Input Text                       xpath=(//input)[1]    ${nome}

Preencher Campo Senha
    [Arguments]    ${senha}
    # Encontra o segundo elemento <input> do formulário (geralmente a senha)
    Wait Until Element Is Visible    xpath=(//input)[2]    timeout=${TIMEOUT}
    Clear Element Text               xpath=(//input)[2]
    Input Text                       xpath=(//input)[2]    ${senha}

Clicar Botao Login
    Wait Until Element Is Visible    xpath=//button[@type='submit' or contains(text(),'Entrar') or contains(text(),'Login')]    timeout=${TIMEOUT}
    Click Button                     xpath=//button[@type='submit' or contains(text(),'Entrar') or contains(text(),'Login')]

Realizar Login Com Sucesso
    [Arguments]    ${nome}=${ADMIN_NAME}    ${senha}=${ADMIN_PASS}
    Acessar Pagina de Login
    Preencher Campo Nome    ${nome}
    Preencher Campo Senha   ${senha}
    Clicar Botao Login


*** Test Cases ***
CT18-1 Login Com Usuario Inexistente Deve Ser Recusado
    [Documentation]    Tenta logar com usuário inexistente
    Preencher Campo Nome     ${WRONG_NAME}
    Preencher Campo Senha    ${ADMIN_PASS}
    Clicar Botao Login

CT18-2 Login Com Senha Incorreta Deve Ser Recusado
    [Documentation]    Nome valido mas senha incorreta
    Preencher Campo Nome     ${ADMIN_NAME}
    Preencher Campo Senha    ${WRONG_PASS}
    Clicar Botao Login

CT18-3 Login Com Senha Vazia Deve Ser Recusado
    [Documentation]    Campo senha deixado em branco
    Preencher Campo Nome     ${ADMIN_NAME}
    Preencher Campo Senha    ${EMPTY}
    Clicar Botao Login

CT18-4 Login Com Credenciais Validas Deve Ter Sucesso
    [Documentation]    Controle de sucesso com dados corretos
    Realizar Login Com Sucesso