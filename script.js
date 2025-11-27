(function(){
  const form = document.getElementById('survey');
  const feedback = document.getElementById('feedback');
  const resetBtn = document.getElementById('resetBtn');
  const API_URL = 'http://localhost:5000';

  let currentToken = null;
  let surveyData = null;

  // Obtener el token de la URL
  function getTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  }

  // Obtener parámetros de la URL
  function getURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      token: urlParams.get('token'),
      titulo: urlParams.get('Titulo'),
      codigo: urlParams.get('Codigo'),
      idEjecutor: urlParams.get('IdEjecutor'),
      idSolicitante: urlParams.get('IdSolicitante')
    };
  }

  // Mostrar mensaje de error y ocultar el formulario
  function showError(message) {
    const loading = document.getElementById('loading');
    const surveyContainer = document.getElementById('survey-container');

    loading.innerHTML = `
      <h1>Encuesta no disponible</h1>
      <p style="color: #d23; font-size: 16px; margin: 20px 0;">${message}</p>
      <p style="color: #666;">Si cree que esto es un error, por favor contacte al administrador.</p>
    `;
    surveyContainer.style.display = 'none';
  }

  // Mostrar el formulario de encuesta
  function showSurvey() {
    const loading = document.getElementById('loading');
    const surveyContainer = document.getElementById('survey-container');

    loading.style.display = 'none';
    surveyContainer.style.display = 'block';

    // Llenar los campos con los parámetros de la URL
    const params = getURLParams();

    if (params.titulo) {
      document.getElementById('titulo').value = params.titulo;
    }
    if (params.codigo) {
      document.getElementById('codigo').value = params.codigo;
    }
    if (params.idEjecutor) {
      document.getElementById('gestionadoPor').value = params.idEjecutor;
    }
    if (params.idSolicitante) {
      document.getElementById('solicitante').value = params.idSolicitante;
    }
  }

  // Validar el token al cargar la página
  async function validateToken() {
    const token = getTokenFromURL();

    if (!token) {
      showError('No se proporcionó un token de acceso válido. Por favor use el enlace enviado a su correo electrónico.');
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/api/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const result = await response.json();

      if (result.valid) {
        currentToken = token;
        surveyData = result.data;

        // Mostrar el formulario (que ya llena los campos desde la URL)
        showSurvey();

        return true;
      } else {
        showError(result.message);
        return false;
      }
    } catch (error) {
      showError('Error al conectar con el servidor. Por favor intente más tarde.');
      console.error('Error:', error);
      return false;
    }
  }

  // Envío de encuesta
  form.addEventListener('submit', async function(e){
    e.preventDefault();

    const data = new FormData(form);
    const rating = data.get('rating');
    const titulo = data.get('titulo');
    const codigo = data.get('codigo');
    const gestionadoPor = data.get('gestionadoPor');

    if(!rating){
      feedback.textContent = 'Por favor selecciona una calificación.';
      feedback.style.color = '#d23';
      return;
    }

    if(!currentToken){
      feedback.textContent = 'Token de sesión inválido.';
      feedback.style.color = '#d23';
      return;
    }

    try {
      // Enviar la encuesta al servidor
      const response = await fetch(`${API_URL}/api/submit-survey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: currentToken,
          rating: parseInt(rating),
          titulo,
          codigo,
          gestionadoPor
        })
      });

      const result = await response.json();

      if (result.success) {
        feedback.style.color = '#0b76ef';
        feedback.textContent = `¡Gracias! Has calificado la gestión del soporte con ${rating} estrella${rating === '1' ? '' : 's'}.`;

        // Deshabilitar el formulario tras enviar
        Array.from(form.elements).forEach(el => el.disabled = true);

        // Ocultar el botón de limpiar
        resetBtn.style.display = 'none';
      } else {
        feedback.style.color = '#d23';
        feedback.textContent = result.message || 'Error al enviar la encuesta.';
      }
    } catch (error) {
      feedback.style.color = '#d23';
      feedback.textContent = 'Error al conectar con el servidor. Por favor intente más tarde.';
      console.error('Error:', error);
    }
  });

  // Botón Limpiar
  resetBtn.addEventListener('click', function(){
    Array.from(form.elements).forEach(el => {
      if (el.id !== 'titulo' && el.id !== 'codigo' && el.id !== 'gestionadoPor') {
        el.disabled = false;
      }
    });

    // Solo resetear la calificación, no los campos pre-llenados
    const radios = document.querySelectorAll('input[name="rating"]');
    radios.forEach(radio => radio.checked = false);

    feedback.textContent = '';
    feedback.style.color = '';
  });

  // Accesibilidad: navegación por teclado entre radios
  const radios = Array.from(document.querySelectorAll('input[name="rating"]'));
  radios.forEach(radio => {
    radio.addEventListener('keydown', (e) => {
      const idx = radios.indexOf(radio);
      if(e.key === 'ArrowLeft' || e.key === 'ArrowDown'){
        e.preventDefault();
        const prev = radios[Math.max(0, idx-1)];
        prev.checked = true;
        prev.focus();
      } else if(e.key === 'ArrowRight' || e.key === 'ArrowUp'){
        e.preventDefault();
        const next = radios[Math.min(radios.length-1, idx+1)];
        next.checked = true;
        next.focus();
      }
    });
  });

  // Validar token al cargar la página
  validateToken();
})();
