document.addEventListener('DOMContentLoaded', () => {
    const addImageButton = document.getElementById('addImageButton');
    const imageUploadInput = document.getElementById('imageUpload');
    const imageGrid = document.getElementById('imageGrid');

    // Cuando se hace clic en el botón, se "activa" el input de archivo oculto
    addImageButton.addEventListener('click', () => {
        imageUploadInput.click();
    });

    // Cuando se selecciona(n) un archivo(s) en el input
    imageUploadInput.addEventListener('change', (event) => {
        const files = event.target.files; // Obtiene los archivos seleccionados

        if (files) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.type.startsWith('image/')) { // Asegúrate de que es una imagen
                    const reader = new FileReader(); // Objeto para leer el contenido del archivo

                    reader.onload = (e) => {
                        // Crea un nuevo div para la imagen (como tus image-item existentes)
                        const newImageItem = document.createElement('div');
                        newImageItem.classList.add('image-item');

                        // Crea el elemento img
                        const newImage = document.createElement('img');
                        newImage.src = e.target.result; // Establece la fuente de la imagen como el archivo cargado
                        newImage.alt = 'Nueva imagen'; // Texto alternativo

                        // Agrega la imagen al div del item
                        newImageItem.appendChild(newImage);

                        // Agrega el nuevo item de imagen a la cuadrícula
                        imageGrid.appendChild(newImageItem);
                    };

                    reader.readAsDataURL(file); // Lee el archivo como una URL de datos (base64)
                }
            }
        }
    });
});
