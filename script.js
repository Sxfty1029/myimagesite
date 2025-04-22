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
    case 'sine': return 'y = sin(x)';
    case 'cosine': return 'y = cos(x)';
    case 'tangent': return 'y = tan(x)';
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

  // Equation display
  const equationDiv = document.createElement('div');
  equationDiv.textContent = `Equation: ${equationText}`;
  equationDiv.style.marginBottom = '15px';
  equationDiv.style.fontWeight = 'bold';
  equationDiv.style.fontSize = '16px';
  parametersBox.appendChild(equationDiv);

  // Parameter inputs
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
  const range = ['sine', 'cosine', 'tangent'].includes(type) ? 2 * Math.PI : 10;

  for (let i = -range; i <= range; i += step) {
    let xi = i;
    let yi = null;
    switch (type) {
      case 'linear':
        yi = params.a * xi + params.b; break;
      case 'quadratic':
        yi = params.a * xi ** 2 + params.b * xi + params.c; break;
      case 'cubic':
        yi = params.a * xi ** 3 + params.b * xi ** 2 + params.c * xi + params.d; break;
      case 'sine':
        yi = params.amplitude * Math.sin(params.frequency * xi + params.phase); break;
      case 'cosine':
        yi = params.amplitude * Math.cos(params.frequency * xi + params.phase); break;
      case 'tangent':
        yi = params.amplitude * Math.tan(params.frequency * xi + params.phase); break;
      case 'exponential':
        yi = params.a * Math.exp(xi); break;
      case 'logarithmic':
        yi = xi !== 0 ? params.a * Math.log(Math.abs(xi)) : null; break;
      case 'absolute':
        yi = params.a * Math.abs(xi); break;
      case 'square-root':
        yi = params.a * Math.sqrt(Math.abs(xi)); break;
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

  const piTicks = [-2, -1.5, -1, -0.75, -5/6, -2/3, -0.5, -1/3, -0.25, -1/6, 0,
                    1/6, 0.25, 1/3, 0.5, 2/3, 5/6, 0.75, 1, 1.5, 2].map(x => x * Math.PI);

  const piLabels = ['-2π','-3π/2','-π','-3π/4','-5π/6','-2π/3','-π/2','-π/3','-π/4','-π/6',
                    '0','π/6','π/4','π/3','π/2','2π/3','5π/6','3π/4','π','3π/2','2π'];

  const layout = {
    title: `Plot of ${type}`,
    xaxis: {
      title: isTrig ? 'x (radians)' : 'x',
      tickvals: isTrig ? piTicks : undefined,
      ticktext: isTrig ? piLabels : undefined,
      tickangle: isTrig ? 60 : 0,
      range: isTrig ? [-2 * Math.PI, 2 * Math.PI] : [-10, 10],
      zeroline: true,
      zerolinewidth: 2,
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)'
    },
    yaxis: {
      title: 'y',
      range: isTrig ? [-3, 3] : [-10, 10],
      zeroline: true,
      zerolinewidth: 2,
      dtick: 1,
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)'
    },
    margin: { t: 50, l: 60, r: 20, b: 60 },
    legend: { x: 0, y: 1 },
    plot_bgcolor: '#fff'
  };

  Plotly.newPlot('image-box', [trace], layout, { responsive: true });
}

function parseUserInput(text) {
  const input = text.toLowerCase();
  let type = null;
  const params = {};

  if (input.match(/(parabola|quadratic|парабол|kvad)/)) type = 'quadratic';
  else if (input.match(/(linear|линейн|lineaar)/)) type = 'linear';
  else if (input.match(/(cubic|кубическ|kuup)/)) type = 'cubic';
  else if (input.match(/(sine|sinus|синус)/)) type = 'sine';
  else if (input.match(/(cosine|cosinus|косинус)/)) type = 'cosine';
  else if (input.match(/(tangent|tangen|тангенс)/)) type = 'tangent';
  else if (input.match(/(exponential|экспонент|eksponentsiaal)/)) type = 'exponential';
  else if (input.match(/(logarithmic|логарифм|logaritm)/)) type = 'logarithmic';
  else if (input.match(/(absolute|абсолют|absoluut)/)) type = 'absolute';
  else if (input.match(/(square-root|корень|ruutjuur)/)) type = 'square-root';

  const matches = [...input.matchAll(/(amplitude|frequency|phase|a|b|c|d)\s*=?\s*(-?\d+(\.\d+)?)/g)];
  matches.forEach(match => {
    const key = match[1];
    const value = parseFloat(match[2]);
    params[key] = value;
  });

  if (type === 'linear' && input.includes('negative slope')) params.a = -1;

  return { type, params };
}

// EVENT LISTENERS
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
