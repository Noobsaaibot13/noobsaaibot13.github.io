let currentSlide = 1;
const totalSlides = 3;

function nextSlide() {
    // Obtener la diapositiva actual
    const currentSlideElement = document.getElementById(`slide-${currentSlide}`);
    currentSlideElement.classList.remove('active');
    currentSlideElement.classList.add('previous');

    // Calcular la siguiente diapositiva
    if (currentSlide < totalSlides) {
        currentSlide++;
    } else {
        currentSlide = 1; // Volver al inicio si llegamos al final
    }

    // Mostrar la nueva diapositiva
    const nextSlideElement = document.getElementById(`slide-${currentSlide}`);
    nextSlideElement.classList.remove('previous');
    nextSlideElement.classList.add('active');
}

function resetPresentation() {
    // Obtener la diapositiva actual
    const currentSlideElement = document.getElementById(`slide-${currentSlide}`);
    currentSlideElement.classList.remove('active');
    currentSlideElement.classList.add('previous');

    // Volver a la primera diapositiva
    currentSlide = 1;
    const firstSlideElement = document.getElementById('slide-1');
    firstSlideElement.classList.remove('previous');
    firstSlideElement.classList.add('active');
}
