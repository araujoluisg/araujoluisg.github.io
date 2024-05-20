const notes = [100, 50, 20, 10, 5, 2];
let caixaStatus = {
    '100': 0,
    '50': 0,
    '20': 0,
    '10': 0,
    '5': 0,
    '2': 0
};

function reloadCaixa() {
    const password = document.getElementById('admin-password').value;

    if (password !== 'senhaAdmin123') {
        alert('Senha incorreta. Ação não autorizada.');
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'callback',
            'event_type': 'event_custom',
            'custom_section': 'administrador',
            'custom_type': 'recarga',
            'custom_type_error': 'erro:senha-invalida',
        });
        return;
    }

    let camposVazios = true;
    let notasRecarregadas = [];

    for (let note of notes) {
        const quantityField = document.getElementById(`note-${note}`);
        const quantity = parseInt(quantityField.value);

        if (isNaN(quantity) || quantity <= 0) {
            alert('Digite um valor válido em todos os campos.');
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'callback',
                'event_type': 'event_custom',
                'custom_section': 'administrador',
                'custom_type': 'recarga',
                'custom_type_error': 'erro:campos-invalidos',
            });
            return;
        }

        if (quantity > 0) {
            camposVazios = false;
            caixaStatus[note] += quantity;
            notasRecarregadas.push(`${quantity}x${note}`);
        }
    }

    if (camposVazios) {
        alert('Nenhuma nota foi adicionada. Por favor, insira a quantidade de notas desejada.');
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'callback',
            'event_type': 'event_custom',
            'custom_section': 'administrador',
            'custom_type': 'recarga',
            'custom_type_error': 'erro:campos-zerados',
        });
        return;
    }

    let notasRecarregadasStr = notasRecarregadas.join('-');
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'event': 'callback',
        'event_type': 'event_custom',
        'custom_section': 'administrador',
        'custom_type': 'recarga',
        'custom_type_error': `sucesso:notas:${notasRecarregadasStr}`,
    });

    alert('Caixa Eletrônico recarregado com sucesso!');
    clearAdminInputs();
    saveCaixaStatusToLocalStorage();
    displayCaixaStatus();
}

function clearAdminInputs() {
    document.getElementById('admin-password').value = '';
    for (let note of notes) {
        document.getElementById(`note-${note}`).value = '0';
    }
}

function saveCaixaStatusToLocalStorage() {
    localStorage.setItem('caixaStatus', JSON.stringify(caixaStatus));
}

function loadCaixaStatusFromLocalStorage() {
    const savedCaixaStatus = localStorage.getItem('caixaStatus');
    if (savedCaixaStatus) {
        caixaStatus = JSON.parse(savedCaixaStatus);
    }
}

// pegar o status do caixa eletrônico do local storage no carregamento da página
window.onload = function () {
    loadCaixaStatusFromLocalStorage();
    displayCaixaStatus();
};

function withdrawCash() {
    const password = document.getElementById('user-password').value;
    // validar a senha do usuario
    if (password !== 'qcarabom') {
        alert('Senha incorreta. Ação não autorizada.');
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          'event':'callback',
          'event_type':'event_custom',
          'custom_section': 'usuario',
          'custom_type': 'saque',
          'custom_type_error':'erro:senha-invalida',
        });
        return;
    }
    const amount = parseInt(document.getElementById('withdraw-amount').value);
    const withdrawResult = optimizeWithdraw(amount);
    if (withdrawResult) {
        displayCaixaStatus();
        clearUserInputs();
    }
    displayWithdrawResult(withdrawResult);
}

function clearUserInputs() {
    document.getElementById('withdraw-amount').value = '';
}

function optimizeWithdraw(amount) {
    if (amount <= 0) {
        alert('Por favor, digite um valor válido para saque.');
        throw new Error('Valor de saque inválido');
    }

    let quantiaRestante = amount;
    const withdrawResult = {};
    const notasSacadas = [];

    for (let note of notes) {
        const noteValue = note;
        const noteQuantity = Math.min(Math.floor(quantiaRestante / noteValue), caixaStatus[noteValue.toString()]);
        if (noteQuantity > 0) {
            withdrawResult[noteValue] = noteQuantity;
            quantiaRestante -= noteValue * noteQuantity;
            notasSacadas.push(`${noteQuantity}x${noteValue}`);
        }
    }

    if (quantiaRestante === 0) {
        for (let note in withdrawResult) {
            caixaStatus[note.toString()] -= withdrawResult[note];
        }
        saveCaixaStatusToLocalStorage();

        let notasSacadasStr = notasSacadas.join('-');
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'callback',
            'event_type': 'event_custom',
            'custom_section': 'usuario',
            'custom_type': 'saque',
            'custom_type_error': `sucesso:notas:${notasSacadasStr}`,
        });

        alert('Saque realizado com sucesso.');
        return withdrawResult;
    } else {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'callback',
            'event_type': 'event_custom',
            'custom_section': 'usuario',
            'custom_type': 'saque',
            'custom_type_error': 'erro:sem-notas-disponiveis',
        });

        alert('Não é possível realizar o saque. Caixa Eletrônico sem notas disponíveis.');
        return null;
    }
}

function displayWithdrawResult(withdrawResult) {
    const withdrawResultDiv = document.getElementById('withdraw-result');
    if (withdrawResult) {
        let resultHTML = '<p>Saque realizado com sucesso. Notas dispensadas:</p><ul>';
        for (let note in withdrawResult) {
            resultHTML += `<li>R$ ${note},00: ${withdrawResult[note]} notas</li>`;
        }
        resultHTML += '</ul>';
        withdrawResultDiv.innerHTML = resultHTML;
    } else {
        withdrawResultDiv.innerHTML = '<p>Não foi possível realizar o saque. Caixa Eletrônico sem notas disponíveis.</p>';
    }
}

function displayCaixaStatus() {
    const caixaNotesDiv = document.getElementById('caixa-notes');
    let notesHTML = '<ul>';
    for (let note in caixaStatus) {
        notesHTML += `<li>R$ ${note},00: ${caixaStatus[note]} notas</li>`;
    }
    notesHTML += '</ul>';
    caixaNotesDiv.innerHTML = notesHTML;
}