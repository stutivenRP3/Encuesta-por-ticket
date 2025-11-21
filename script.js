(function(){
  const form = document.getElementById('survey');
  const feedback = document.getElementById('feedback');
  const resetBtn = document.getElementById('resetBtn');

  // Envío de encuesta
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const data = new FormData(form);
    const rating = data.get('rating');

    if(!rating){
      feedback.textContent = 'Por favor selecciona una calificación.';
      feedback.style.color = '#d23';
      return;
    }

    // Aquí podrías enviar el dato al servidor
    // fetch('/api/survey', {
    //   method:'POST',
    //   headers:{'Content-Type':'application/json'},
    //   body:JSON.stringify({rating})
    // }).then(r => r.json()).then(resp => { ... });

    feedback.style.color = '';
    feedback.textContent = `¡Gracias! Has calificado la gestión del soporte con ${rating} estrella${rating === '1' ? '' : 's'}.`;

    // Opcional: deshabilitar el formulario tras enviar
    Array.from(form.elements).forEach(el => el.disabled = true);
  });

  // Botón Limpiar
  resetBtn.addEventListener('click', function(){
    Array.from(form.elements).forEach(el => el.disabled = false);
    form.reset();
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
})();
