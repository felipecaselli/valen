document.addEventListener('DOMContentLoaded', () => {
    const addImageButton = document.getElementById('addImageButton');
    const imageUploadInput = document.getElementById('imageUpload');
    const imageGrid = document.getElementById('imageGrid') || document.querySelector('.galeria');

    if (!addImageButton || !imageUploadInput || !imageGrid) {
        console.error('Elementos faltantes en el DOM:', { addImageButton, imageUploadInput, imageGrid });
        return;
    }

    addImageButton.addEventListener('click', () => imageUploadInput.click());

    imageUploadInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;

            const reader = new FileReader();
            reader.onload = (e) => {
                const newImageItem = document.createElement('div');
                // usar la misma clase que el HTML existente (.foto)
                newImageItem.classList.add('foto');

                const newImage = document.createElement('img');
                newImage.src = e.target.result;
                newImage.alt = file.name || 'Nueva imagen';

                newImageItem.appendChild(newImage);
                imageGrid.appendChild(newImageItem);
            };
            reader.readAsDataURL(file);
        }

        imageUploadInput.value = '';
    });
});
