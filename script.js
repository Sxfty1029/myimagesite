document.addEventListener('DOMContentLoaded', () => {
  // Элементы формы авторизации
  const authContainer = document.getElementById('auth-container');
  const mainContainer = document.getElementById('main-container');
  const authButton = document.getElementById('auth-button');
  const passwordInput = document.getElementById('password-input');
  const authError = document.getElementById('auth-error');

  // Установите ваш пароль
  const correctPassword = 'mathbot1';

  // При клике на кнопку отправки
  authButton.addEventListener('click', () => {
    const enteredPassword = passwordInput.value;

    if (enteredPassword === correctPassword) {
      // Если пароль верный, показываем основной контент
      authContainer.style.display = 'none';
      mainContainer.style.display = 'block';
    } else {
      // Если пароль неверный, показываем сообщение об ошибке
      authError.style.display = 'block';
    }
  });

  const userInputField = document.getElementById('user-input');
  const functionSelect = document.getElementById('function-select');
  const sendButton = document.getElementById('send-button');
  const imageBox = document.getElementById('image-box');
  const parametersBox = document.getElementById('parameters-box');
  const updatePlotButton = document.getElementById('update-plot');

  async function sendToFlaskServer(plotCode) {
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'block';
    imageBox.innerHTML = ''; // Clear previous image

    try {
      const response = await fetch('http://127.0.0.1:5000/generate_plot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: plotCode })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.image_url;

      const img = document.createElement('img');
      img.src = imageUrl;
      imageBox.appendChild(img);

    } catch (error) {
      console.error('Error generating plot:', error);
      imageBox.textContent = 'Plot generation failed: ' + error.message;
    } finally {
      loadingIndicator.style.display = 'none';
    }
  }

  function generateBasePlotCode(isTrigonometric, functionDefinition) {
    return `
import numpy as np
import matplotlib.pyplot as plt

plt.figure(figsize=(12, 6))

# Create data points
${isTrigonometric ? 'x = np.linspace(-2*np.pi, 2*np.pi, 1000)' : 'x = np.linspace(-10, 10, 1000)'}

# Define function
y = ${functionDef}

# Create plot
plt.plot(x, y, 'b-', label='y')

plt.grid(True, which='both', alpha=0.3)

# Add vertical grid lines every pi/6
pi_over_6 = np.pi / 6
for i in range(-60, 61):
  x_val = i * pi_over_6
  plt.axvline(x=x_val, color='gray', linestyle='--', alpha=0.3)

${isTrigonometric ? `
plt.xticks(
  [-2*np.pi, -3*np.pi/2, -np.pi, -3*np.pi/4, -5*np.pi/6, -2*np.pi/3, -np.pi/2, -np.pi/3, -np.pi/4, -np.pi/6, 0, np.pi/6, np.pi/4, np.pi/3, np.pi/2, 2*np.pi/3, 5*np.pi/6, 3*np.pi/4, np.pi, 3*np.pi/2, 2*np.pi],
  ['-2π', '-3π/2', '-π', '-3π/4', '-5π/6', '-2π/3', '-π/2', '-π/3', '-π/4', '-π/6', '0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '5π/6', '3π/4', 'π', '3π/2', '2π'],
  fontsize=8, ha='right'
)
plt.tick_params(axis='x', labelrotation=60, labelsize=8)
plt.yticks(np.arange(-3, 4, 1))
plt.xlim(-2*np.pi, 2*np.pi)
plt.ylim(-3, 3)
plt.gca().xaxis.set_minor_locator(plt.MultipleLocator(np.pi/6))
plt.gca().yaxis.set_minor_locator(plt.MultipleLocator(1))
` : 'plt.xticks(np.arange(-10, 11, 1))'}
plt.yticks(np.arange(-3, 4, 1))

plt.axhline(y=0, color='k', linestyle='-', alpha=0.3)
plt.axvline(x=0, color='k', linestyle='-', alpha=0.3)

${isTrigonometric ? 'plt.xlim(-2*np.pi, 2*np.pi)' : 'plt.xlim(-10, 10)'}
plt.ylim(-3, 3)
plt.xlabel('${isTrigonometric ? "x (radians)" : "x"}')
plt.ylabel('y')
plt.legend()`;
  }

  function generatePlotCodeWithParameters(functionType, parameters) {
    const isTrigonometric = ['sine', 'cosine', 'tangent'].includes(functionType);
    let functionDefinition = '';
    let legendFormula = 'y';

    switch (functionType) {
      case 'linear':
        functionDefinition = `${parameters.a} * x + ${parameters.b}`;
        break;
      case 'quadratic':
        functionDefinition = `${parameters.a} * x**2 + ${parameters.b} * x + ${parameters.c}`;
        break;
      case 'cubic':
        functionDefinition = `${parameters.a} * x**3 + ${parameters.b} * x**2 + ${parameters.c} * x + ${parameters.d}`;
        break;
      case 'sine':
        functionDefinition = `${parameters.amplitude} * np.sin(${parameters.frequency} * x + ${parameters.phase})`;
        legendFormula = 'y = sin(x)';
        break;
      case 'cosine':
        functionDefinition = `${parameters.amplitude} * np.cos(${parameters.frequency} * x + ${parameters.phase})`;
        legendFormula = 'y = cos(x)';
        break;
      case 'tangent':
        functionDefinition = `${parameters.amplitude} * np.tan(${parameters.frequency} * x + ${parameters.phase})`;
        legendFormula = 'y = tan(x)';
        break;
      case 'exponential':
        functionDefinition = `${parameters.a} * np.exp(x)`;
        break;
      case 'logarithmic':
        functionDefinition = `${parameters.a} * np.log(np.abs(x))`;
        break;
      case 'absolute':
        functionDefinition = `${parameters.a} * np.abs(x)`;
        break;
      case 'square-root':
        functionDefinition = `${parameters.a} * np.sqrt(np.abs(x))`;
        break;
    }

    // Генерируем код Python для построения графика с размером 14 на 8
    return `
import numpy as np
import matplotlib.pyplot as plt

plt.figure(figsize=(16, 8))

# Создаем точки данных
x = ${isTrigonometric ? 'np.linspace(-2*np.pi, 2*np.pi, 1000)' : 'np.linspace(-10, 10, 1000)'}

# Определяем функцию
y = ${functionDefinition}

# Создаем график
plt.plot(x, y, 'b-', label='${legendFormula}')

plt.grid(True, which='both', alpha=0.3)

${isTrigonometric ? `
plt.xticks(
  [-2*np.pi, -3*np.pi/2, -np.pi, -3*np.pi/4, -5*np.pi/6, -2*np.pi/3, -np.pi/2, -np.pi/3, -np.pi/4, -np.pi/6, 0, np.pi/6, np.pi/4, np.pi/3, np.pi/2, 2*np.pi/3, 5*np.pi/6, 3*np.pi/4, np.pi, 3*np.pi/2, 2*np.pi],
  ['-2π', '-3π/2', '-π', '-3π/4', '-5π/6', '-2π/3', '-π/2', '-π/3', '-π/4', '-π/6', '0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '5π/6', '3π/4', 'π', '3π/2', '2π'],
  rotation=60, ha='right', fontsize=8
)
plt.tick_params(axis='x', labelrotation=60, labelsize=8)
plt.yticks(np.arange(-3, 4, 1))
plt.xlim(-2*np.pi, 2*np.pi)
plt.ylim(-3, 3)
plt.gca().xaxis.set_minor_locator(plt.MultipleLocator(np.pi/6))
plt.gca().yaxis.set_minor_locator(plt.MultipleLocator(1))
` : `
plt.xticks(np.arange(-10, 11, 1))
plt.yticks(np.arange(-10, 11, 1))
plt.minorticks_on()
plt.xlim(-10, 10)
plt.ylim(-10, 10)
`}

# Настраиваем оси (перемещаем их в центр и делаем жирными)
ax = plt.gca()
ax.spines['bottom'].set_position('zero')
ax.spines['left'].set_position('zero')
ax.spines['bottom'].set_linewidth(2)
ax.spines['left'].set_linewidth(2)
ax.spines['top'].set_color('none')
ax.spines['right'].set_color('none')

plt.xlabel('${isTrigonometric ? "x (radians)" : "x"}', fontsize=14, fontweight='bold', loc='right', labelpad=10)
plt.ylabel('y', fontsize=14, fontweight='bold', loc='top', labelpad=10)

plt.legend()
plt.show()
`;
  }

  async function handlePredefinedFunction(functionType) {
    const parametersBox = document.getElementById('parameters-box');
    const updatePlotButton = document.getElementById('update-plot');
    let parameters = {};
    let equation = '';

    // Устанавливаем начальные параметры для каждой функции
    switch (functionType) {
      case 'linear':
        parameters = { a: 1, b: 0 };
        equation = 'y = (a) * x + (b)';
        break;
      case 'quadratic':
        parameters = { a: 1, b: 0, c: 0 };
        equation = 'y = (a) * x² + (b) * x + (c)';
        break;
      case 'cubic':
        parameters = { a: 1, b: 0, c: 0, d: 0 };
        equation = 'y = (a) * x³ + (b) * x² + (c) * x + (d)';
        break;
      case 'sine':
        parameters = { amplitude: 1, frequency: 1, phase: 0 };
        equation = 'y = sin(x)';
        break;
      case 'cosine':
        parameters = { amplitude: 1, frequency: 1, phase: 0 };
        equation = 'y = cos(x)';
        break;
      case 'tangent':
        parameters = { amplitude: 1, frequency: 1, phase: 0 };
        equation = 'y = tan(x)';
        break;
      case 'exponential':
        parameters = { a: 1 };
        equation = 'y = (a) * eˣ';
        break;
      case 'logarithmic':
        parameters = { a: 1 };
        equation = 'y = (a) * ln|x|';
        break;
      case 'absolute':
        parameters = { a: 1 };
        equation = 'y = (a) * |x|';
        break;
      case 'square-root':
        parameters = { a: 1 };
        equation = 'y = (a) * √|x|';
        break;
    }

    // Показываем блок параметров
    parametersBox.style.display = 'block';
    parametersBox.innerHTML = ''; // Очистка предыдущих значений

    // Выводим уравнение
    const equationDisplay = document.createElement('div');
    equationDisplay.textContent = `Equation: ${equation}`;
    equationDisplay.style.marginBottom = '15px';
    equationDisplay.style.fontWeight = 'bold';
    parametersBox.appendChild(equationDisplay);

    // Создаём элементы для ввода параметров
    for (const key in parameters) {
      const parameterInput = document.createElement('div');
      parameterInput.classList.add('parameter-input');

      const label = document.createElement('label');
      label.textContent = `${key}:`;
      parameterInput.appendChild(label);

      const input = document.createElement('input');
      input.type = 'number';
      input.value = parameters[key];
      input.id = `parameter-${key}`;
      parameterInput.appendChild(input);

      parametersBox.appendChild(parameterInput);
    }

    // Добавляем кнопку Update Plot
    parametersBox.appendChild(updatePlotButton);

    // Генерируем код для построения графика с начальными параметрами
    const plotCode = generatePlotCodeWithParameters(functionType, parameters);

    // Отправляем код на сервер для генерации графика
    await sendToFlaskServer(plotCode);
  }

  async function handleUserInput(userInput) {
    let functionType = '';

    userInput = userInput.toLowerCase();

    if (
      userInput.includes('парабол') ||
      userInput.includes('parabola') ||
      userInput.includes('quadratic') ||
      userInput.includes('kvadraat')
    ) {
      functionType = 'quadratic';
    } else if (
      userInput.includes('линейн') ||
      userInput.includes('linear') ||
      userInput.includes('lineaar')
    ) {
      functionType = 'linear';
    } else if (
      userInput.includes('кубическ') ||
      userInput.includes('cubic') ||
      userInput.includes('kuup')
    ) {
      functionType = 'cubic';
    } else if (
      userInput.includes('косинус') ||
      userInput.includes('cosine') ||
      userInput.includes('kosinus')
    ) {
      functionType = 'cosine';
    } else if (
      userInput.includes('синус') ||
      userInput.includes('sine') ||
      userInput.includes('sinus')
    ) {
      functionType = 'sine';
    } else if (
      userInput.includes('тангенс') ||
      userInput.includes('tangen')
    ) {
      functionType = 'tangent';
    } else if (
      userInput.includes('экспонент') ||
      userInput.includes('exponential') ||
      userInput.includes('eksponentsiaal')
    ) {
      functionType = 'exponential';
    } else if (
      userInput.includes('логарифм') ||
      userInput.includes('logarithmic') ||
      userInput.includes('logaritm')
    ) {
      functionType = 'logarithmic';
    } else if (
      userInput.includes('абсолют') ||
      userInput.includes('absolute') ||
      userInput.includes('absoluut')
    ) {
      functionType = 'absolute';
    } else if (
      userInput.includes('корень') ||
      userInput.includes('square-root') ||
      userInput.includes('ruutjuur')
    ) {
      functionType = 'square-root';
    } else {
      // Если функция не распознана
      console.error('Unknown function type');
      alert('Unknown function type. Please try again.');
      return; // Прерываем выполнение
    }

    console.log(`Detected function type: ${functionType}`);
    await handlePredefinedFunction(functionType);
  }

  sendButton.addEventListener('click', async () => {
    const userInput = userInputField.value;
    const selectedFunction = functionSelect.value;

    if (selectedFunction) {
      await handlePredefinedFunction(selectedFunction);
    } else if (userInput) {
      await handleUserInput(userInput);
    }
  });

  functionSelect.addEventListener('change', async () => {
    const selectedFunction = functionSelect.value;
    if (selectedFunction && !userInputField.value) {
      await handlePredefinedFunction(selectedFunction);
    }
  });

  userInputField.addEventListener('input', () => {
    // Если пользователь ввёл слово, определяем тип функции по ключевым словам
    const inputVal = userInputField.value.trim().toLowerCase();
    let functionType = '';

    if (inputVal.includes('linear')) {
      functionType = 'linear';
    } else if (inputVal.includes('quadratic') || inputVal.includes('parabola')) {
      functionType = 'quadratic';
    } else if (inputVal.includes('cubic')) {
      functionType = 'cubic';
    } else if (inputVal.includes('sine')) {
      functionType = 'sine';
    } else if (inputVal.includes('cosine')) {
      functionType = 'cosine';
    } else if (inputVal.includes('tangent')) {
      functionType = 'tangent';
    } else if (inputVal.includes('exponential')) {
      functionType = 'exponential';
    } else if (inputVal.includes('logarithmic')) {
      functionType = 'logarithmic';
    } else if (inputVal.includes('absolute')) {
      functionType = 'absolute';
    } else if (inputVal.includes('square-root')) {
      functionType = 'square-root';
    }

    // Если распознали тип, обновляем параметры и выставляем значение селекта
    if (functionType) {
      functionSelect.value = functionType;
      handlePredefinedFunction(functionType);
    }
  });

  updatePlotButton.addEventListener('click', async () => {
    const functionType = document.getElementById('function-select').value;
    const parameters = {};

    // Собираем параметры из input в #parameters-box
    parametersBox.querySelectorAll('.parameter-input input').forEach(input => {
      const key = input.id.replace('parameter-', '');
      parameters[key] = parseFloat(input.value);
    });

    // Генерируем код для обновления графика
    const plotCode = generatePlotCodeWithParameters(functionType, parameters);

    // Отправляем код на сервер для обновления графика
    await sendToFlaskServer(plotCode);
  });
});