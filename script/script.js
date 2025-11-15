// Obtén la sección de la portada
const portada = document.querySelector('.portada');

// Tiempo de espera en milisegundos antes de que comience la animación
const tiempoEspera = 3000; // 3 segundos

// Función para iniciar la animación
function iniciarAnimacion() {
  portada.classList.add('animar');
}

// Escucha el final de la animación
portada.addEventListener('animationend', () => {
  // Cuando la animación termine, añade la clase para colapsar la altura
  portada.classList.add('ocultar');
});

// Inicia la cuenta regresiva para la animación
setTimeout(iniciarAnimacion, tiempoEspera);