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

    // valida a senha do administrador
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

    let notasRecarregadas = [];
    let valid = true;

    // valida todos os campos
    for (let note of notes) {
        const quantityField = document.getElementById(`note-${note}`);
        const quantity = parseInt(quantityField.value);

        if (isNaN(quantity) || quantity < 0) {
            alert('Digite um valor válido em todos os campos.');
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'callback',
                'event_type': 'event_custom',
                'custom_section': 'administrador',
                'custom_type': 'recarga',
                'custom_type_error': 'erro:campos-invalidos',
            });
            valid = false;
            break;
        }

        if (quantity > 0) {
            notasRecarregadas.push({ note, quantity });
        }
    }

    // caso tenha um campo invalido, não segue com a recarga do caixa
    if (!valid) {
        return;
    }

    // atualiza o caixa somente se todos os campos forem válidos
    for (let recarga of notasRecarregadas) {
        caixaStatus[recarga.note] += recarga.quantity;
    }

    let notasRecarregadasStr = notasRecarregadas.map(recarga => `${recarga.quantity}x${recarga.note}`).join('-');
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
    // valor máximo de saque
    const valorMaximo = 50000;

    // verifica se o valor de saque é válido
    if (amount <= 0) {
        alert('Por favor, digite um valor válido para saque.');
        throw new Error('Valor de saque inválido');
    }

    // compara o valor com o valor máximo permitido
    if (amount > valorMaximo) {
        alert(`O valor máximo para saque é ${valorMaximo}.`);
        throw new Error('Valor de saque excede o limite permitido');
    }

    const withdrawResult = {};
    const notasSacadas = [];

    // função para encontrar uma combinação de notas
    function findCombination(amount, caixaStatus) {
        // verifica se o valor de saque é maior do que o valor total
        const totalCaixa = Object.keys(caixaStatus).reduce((total, nota) => total + (nota * caixaStatus[nota]), 0);
        if (amount > totalCaixa) {
            return null;
        }
        const notasDisponiveis = Object.keys(caixaStatus).map(Number).sort((a, b) => b - a);
        const notasSacadas = {};
    
        function backtrack(remainingAmount, index) {
            if (remainingAmount === 0) {
                return true;
            }
    
            if (index >= notasDisponiveis.length || remainingAmount < 0) {
                return false;
            }
    
            const nota = notasDisponiveis[index];
            const maxQuantidade = Math.min(Math.floor(remainingAmount / nota), caixaStatus[nota]);
    
            for (let quantidade = maxQuantidade; quantidade >= 0; quantidade--) {
                notasSacadas[nota] = quantidade;
                const restante = remainingAmount - quantidade * nota;
    
                if (backtrack(restante, index + 1)) {
                    return true;
                }
            }
    
            delete notasSacadas[nota];
            return false;
        }
    
        if (amount > 0 && backtrack(amount, 0)) {
            // Atualiza o caixaStatus com as notas retiradas
            for (let nota in notasSacadas) {
                caixaStatus[nota] -= notasSacadas[nota];
            }
            return notasSacadas;
        }
    
        return null;
    }

    const combination = findCombination(amount, caixaStatus);

    if (combination) {
        // conta as notas da combinação
        for (let note in combination) {
            withdrawResult[note] = combination[note];
        }

        // atualiza o status do caixa
        for (let note in withdrawResult) {
            notasSacadas.push(`${withdrawResult[note]}x${note}`);
        }
        saveCaixaStatusToLocalStorage(caixaStatus);

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
            if (withdrawResult[note] > 0) { // Verifica se a quantidade de notas é maior que zero
                resultHTML += `<li>R$ ${note},00: ${withdrawResult[note]} notas</li>`;
            }
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
    let totalCaixa = 0;
    
    for (let note in caixaStatus) {
        const noteValue = parseInt(note);
        const noteCount = caixaStatus[note];
        const noteTotal = noteValue * noteCount;
        totalCaixa += noteTotal;
        notesHTML += `<li>R$ ${note},00: ${noteCount} notas</li>`;
    }
    
    notesHTML += '</ul>';
    notesHTML += `<p><strong>Valor total do caixa: R$ ${totalCaixa.toFixed(2)}</strong></p>`;
    caixaNotesDiv.innerHTML = notesHTML;
}