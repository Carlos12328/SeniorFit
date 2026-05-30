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
    # Garante que a página carregou completamente esperando o campo ficar visível
    Wait Until Element Is Visible    xpath=//input[@type='password']    timeout=${TIMEOUT}

Preencher Campo Nome
    [Arguments]    ${nome}
    # Espera explícita para evitar o elemento obsoleto (Stale)
    Wait Until Element Is Visible    id=name    timeout=${TIMEOUT}
    # Limpa o campo caso haja resíduo do caso de teste anterior
    Clear Element Text               id=name
    Input Text                       id=name    ${nome}

Preencher Campo Senha
    [Arguments]    ${senha}
    Wait Until Element Is Visible    xpath=//input[@type='password']    timeout=${TIMEOUT}
    Clear Element Text               xpath=//input[@type='password']
    Input Text                       xpath=//input[@type='password']    ${senha}

Clicar Botao Login
    # Aguarda o botão estar pronto para clique e clica com a ação do Selenium nativa
    Wait Until Element Is Visible    xpath=//button[@type='submit' or contains(text(),'Entrar') or contains(text(),'Login')]    timeout=${TIMEOUT}
    Click Button                     xpath=//button[@type='submit' or contains(text(),'Entrar') or contains(text(),'Login')]

Realizar Login Com Sucesso
    [Arguments]    ${nome}=${ADMIN_NAME}    ${senha}=${ADMIN_PASS}
    Acessar Pagina de Login
    Preencher Campo Nome    ${nome}
    Preencher Campo Senha   ${senha}
    Clicar Botao Login