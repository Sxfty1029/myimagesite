const functionSelect = document.getElementById('function-select');
const parametersBox = document.getElementById('parameters-box');
const plotButton = document.getElementById('plot-button');
const userInputField = document.getElementById('user-input');

function getDefaultParams(type) {
  switch (type) {
    case 'linear': return { a: 1, b: 0 };
    case 'quadratic': return { a: 1, b: 0, c: 0 };
    case 'cubic': return { a: 1, b: 0, c: 0, d: 0 };
    case 'sine':
    case 'cosine':
    case 'tangent': return { amplitude: 1, frequency: 1, phase: 0 };
    case 'exponential': return { a: 1 };
    case 'logarithmic': return { a: 1 };
    case 'absolute': return { a: 1 };
    case 'square-root': return { a: 1 };
    default: return {};
  }
}

function getEquationTemplate(type) {
  switch (type) {
    case 'linear': return 'y = a * x + b';
    case 'quadratic': return 'y = a * x² + b * x + c';
    case 'cubic': return 'y = a * x³ + b * x² + c * x + d';
    case 'sine': return 'y = amplitude * sin(frequency * x + phase)';
    case 'cosine': return 'y = amplitude * cos(frequency * x + phase)';
    case 'tangent': return 'y = amplitude * tan(frequency * x + phase)';
    case 'exponential': return 'y = a * eˣ';
    case 'logarithmic': return 'y = a * ln(|x|)';
    case 'absolute': return 'y = a * |x|';
    case 'square-root': return 'y = a * √|x|';
    default: return 'y = f(x)';
  }
}

function updateParameterInputs(type) {
  parametersBox.innerHTML = '';

  const params = getDefaultParams(type);
  const equationText = getEquationTemplate(type);

  const equationDiv = document.createElement('div');
  equationDiv.textContent = `Equation: ${equationText}`;
  equationDiv.style.marginBottom = '15px';
  equationDiv.style.fontWeight = 'bold';
  equationDiv.style.fontSize = '16px';
  parametersBox.appendChild(equationDiv);

  for (const key in params) {
    const label = document.createElement('label');
    label.textContent = key;
    const input = document.createElement('input');
    input.type = 'number';
    input.id = `param-${key}`;
    input.value = params[key];
    input.style.width = '100%';
    input.style.padding = '8px';
    input.style.marginBottom = '10px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '6px';
    parametersBox.appendChild(label);
    parametersBox.appendChild(input);
  }
}

function getParametersFromInputs() {
  const inputs = parametersBox.querySelectorAll('input');
  const params = {};
  inputs.forEach(input => {
    const key = input.id.replace('param-', '');
    params[key] = parseFloat(input.value);
  });
  return params;
}

function generateXYData(type, params) {
  const x = [];
  const y = [];
  const step = 0.1;
  const range = ['sine', 'cosine', 'tangent'].includes(type) ? 6 * Math.PI : 30; // Tripled range

  for (let i = -range; i <= range; i += step) {
    let xi = i;
    let yi = null;
    switch (type) {
      case 'linear': yi = params.a * xi + params.b; break;
      case 'quadratic': yi = params.a * xi ** 2 + params.b * xi + params.c; break;
      case 'cubic': yi = params.a * xi ** 3 + params.b * xi ** 2 + params.c * xi + params.d; break;
      case 'sine': yi = params.amplitude * Math.sin(params.frequency * xi + params.phase); break;
      case 'cosine': yi = params.amplitude * Math.cos(params.frequency * xi + params.phase); break;
      case 'tangent': yi = params.amplitude * Math.tan(params.frequency * xi + params.phase); break;
      case 'exponential': yi = params.a * Math.exp(xi); break;
      case 'logarithmic': yi = xi !== 0 ? params.a * Math.log(Math.abs(xi)) : null; break;
      case 'absolute': yi = params.a * Math.abs(xi); break;
      case 'square-root': yi = params.a * Math.sqrt(Math.abs(xi)); break;
    }
    if (yi !== null && isFinite(yi)) {
      x.push(xi);
      y.push(yi);
    }
  }
  return { x, y };
}

function renderPlot(type, params) {
  const { x, y } = generateXYData(type, params);
  const isTrig = ['sine', 'cosine', 'tangent'].includes(type);

  const trace = {
    x, y,
    mode: 'lines',
    name: `y = ${type}(x)`,
    line: { color: 'blue' }
  };

  const piTicks = [
    -2 * Math.PI, -3 * Math.PI / 2, -Math.PI, -3 * Math.PI / 4, -5 * Math.PI / 6, 
    -2 * Math.PI / 3, -Math.PI / 2, -Math.PI / 3, -Math.PI / 4, -Math.PI / 6, 0,
    Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2, 2 * Math.PI / 3, 
    5 * Math.PI / 6, 3 * Math.PI / 4, Math.PI, 3 * Math.PI / 2, 2 * Math.PI
  ];

  const piLabels = [
    '-2π', '-3π/2', '-π', '-3π/4', '-5π/6', '-2π/3', '-π/2', '-π/3', '-π/4', '-π/6', 
    '0', 'π/6', 'π/4', 'π/3', 'π/2', '2π/3', '5π/6', '3π/4', 'π', '3π/2', '2π'
  ];

  const layout = {
    title: `Plot of ${type}`,
    dragmode: 'pan', // Set default interaction mode to pan
    xaxis: {
      title: isTrig ? 'x (radians)' : 'x',
      tickvals: isTrig ? piTicks : undefined,
      ticktext: isTrig ? piLabels : undefined,
      tickangle: isTrig ? 60 : 0,
      range: isTrig ? [-12 * Math.PI, 12 * Math.PI] : [-60, 60],
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)',
      showline: true,
      zeroline: false,
      ticks: 'outside',
      ticklabelposition: 'inside',
      tickpadding: 2,
      // For non-trigonometric functions, use automatic tick spacing
      tickmode: isTrig ? undefined : 'auto'
      // Remove dtick for non-trigonometric functions
    },
    yaxis: {
      title: 'y',
      range: isTrig ? [-18, 18] : [-60, 60],
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)',
      showline: true,
      zeroline: false,
      ticks: 'outside',
      ticklabelposition: 'inside',
      tickpadding: 2
    },
    margin: { t: 50, l: 70, r: 70, b: 70 },
    legend: { x: 0, y: 1 },
    plot_bgcolor: '#fff',
    shapes: [
      {
        type: 'line',
        x0: -1000,
        x1: 1000,
        y0: 0,
        y1: 0,
        line: { color: 'black', width: 4 }
      },
      {
        type: 'line',
        x0: 0,
        x1: 0,
        y0: -1000,
        y1: 1000,
        line: { color: 'black', width: 4 }
      }
    ]
  };

  Plotly.newPlot('image-box', [trace], layout, {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    scrollZoom: true
  });
}

function transliterateAndTranslate(text) {
  const map = {
    // Русские термины
    'парабола': 'quadratic',
    'линейная': 'linear',
    'линейный': 'linear',
    'линейное': 'linear',
    'синус': 'sine',
    'синусоида': 'sine',
    'косинус': 'cosine',
    'тангенс': 'tangent',
    'экспонента': 'exponential',
    'экспоненциальная': 'exponential',
    'логарифм': 'logarithmic',
    'абсолют': 'absolute',
    'модуль': 'absolute',
    'корень': 'square-root',
    'руутюур': 'square-root',

    // Эстонские термины
    'parabool': 'quadratic',
    'lineaarne': 'linear',
    'sinus': 'sine',
    'kosinus': 'cosine',
    'tangens': 'tangent',
    'eksponentsiaalne': 'exponential',
    'logaritmiline': 'logarithmic',
    'absoluutne': 'absolute',
    'ruutjuur': 'square-root',
    'sagedus': 'frequency',
    'faas': 'phase',
    'kvadraatne': 'quadratic',
    'kuup': 'cubic',

    // Английские для полноты, можно опустить при необходимости
    'quadratic': 'quadratic',
    'linear': 'linear',
    'sine': 'sine',
    'cosine': 'cosine',
    'tangent': 'tangent',
    'exponential': 'exponential',
    'logarithmic': 'logarithmic',
    'absolute': 'absolute',
    'square-root': 'square-root'
  };

  let result = text.toLowerCase();
  // Перебираем по ключу и заменяем каждое вхождение
  for (const [src, target] of Object.entries(map)) {
    result = result.replaceAll(src, target);
  }
  return result;
}

function parseUserInput(text) {
  // Convert Cyrillic to English keywords
  const input = transliterateAndTranslate(text).toLowerCase().trim();
  let type = null;
  const params = {};

  const patterns = {
    quadratic: /\bquadratic\b/,
    linear: /\blinear\b/,
    cubic: /\bcubic\b/,
    sine: /\bsine\b/,
    cosine: /\bcosine\b/,
    tangent: /\btangent\b/,
    exponential: /\bexponential\b/,
    logarithmic: /\blogarithmic\b/,
    absolute: /\babsolute\b/,
    "square-root": /\bsquare\-?root\b/
  };

  // Detect the function type using the transliterated input
  for (const key in patterns) {
    if (patterns[key].test(input)) {
      type = key;
      break;
    }
  }

  console.log("Detected type:", type);

  // Extract parameters (e.g., amplitude, frequency, phase, a, b, c, d) from the converted input
  const matches = [...input.matchAll(/(amplitude|frequency|phase|a|b|c|d)\s*[=:]?\s*(-?\d+(\.\d+)?)/g)];
  matches.forEach(match => {
    const key = match[1];
    const value = parseFloat(match[2]);
    params[key] = value;
  });

  if (type === 'linear' && input.includes('negative slope')) {
    params.a = -1;
  }

  return { type, params };
}


functionSelect.addEventListener('change', () => {
  const selected = functionSelect.value;
  if (selected) updateParameterInputs(selected);
});

plotButton.addEventListener('click', () => {
  const userInput = userInputField?.value?.trim();
  if (userInput) {
    const { type, params } = parseUserInput(userInput);
    if (!type) return alert('Could not detect function type.');
    functionSelect.value = type;
    updateParameterInputs(type);
    Object.keys(params).forEach(key => {
      const el = document.getElementById(`param-${key}`);
      if (el) el.value = params[key];
    });
    renderPlot(type, { ...getDefaultParams(type), ...params });
  } else {
    const type = functionSelect.value;
    if (!type) return;
    const params = getParametersFromInputs();
    renderPlot(type, params);
  }
});
