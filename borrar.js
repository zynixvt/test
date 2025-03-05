document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.fade');
    const windowHeight = window.innerHeight;

    function checkVisibility() {
        elements.forEach(element => {
            const elementRect = element.getBoundingClientRect();

            if (elementRect.top < 0 || elementRect.bottom > windowHeight) {
                element.classList.add('fade-out');
            } else {
                element.classList.remove('fade-out');
            }
        });
    }

    document.addEventListener('scroll', checkVisibility);
    checkVisibility();
});