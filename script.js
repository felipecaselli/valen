const SUPABASE_URL = 'https://pcbbhsmffprbvycjcanm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjYmJoc21mZnByYnZ5Y2pjYW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MTM5MjQsImV4cCI6MjA5MTE4OTkyNH0.b6lz7whrUfLnqOv00lUip7nv3lRKMG0p4lMVluiRzZE';
const SUPABASE_BUCKET = 'media';
const SUPABASE_TABLE = 'media_items';

document.addEventListener('DOMContentLoaded', async () => {
    const addImageButton = document.getElementById('addImageButton');
    const imageUploadInput = document.getElementById('imageUpload');
    const imageGrid = document.getElementById('imageGrid') || document.querySelector('.galeria');
    const mainVideo = document.getElementById('val-video');

    if (!addImageButton || !imageUploadInput || !imageGrid) {
        console.error('Elementos faltantes en el DOM:', { addImageButton, imageUploadInput, imageGrid });
        return;
    }

    const hasSupabaseConfig =
        SUPABASE_URL &&
        SUPABASE_ANON_KEY &&
        SUPABASE_URL !== 'PEGA_AQUI_TU_SUPABASE_URL' &&
        SUPABASE_ANON_KEY !== 'PEGA_AQUI_TU_SUPABASE_ANON_KEY';

    const supabaseClient = hasSupabaseConfig
        ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        : null;

    const toggleVideoMute = (video) => {
        video.muted = !video.muted;
        if (!video.muted) video.volume = 1;
    };

    const reverseExistingMediaOrder = () => {
        const existingItems = Array.from(imageGrid.children);
        existingItems.reverse().forEach((item) => imageGrid.appendChild(item));
    };

    const renderMedia = (url, mediaType, altText = 'recuerdo subido', newestFirst = false) => {
        const newMediaItem = document.createElement('div');
        newMediaItem.classList.add('foto');

        if (mediaType === 'video') {
            const newVideo = document.createElement('video');
            newVideo.src = url;
            newVideo.autoplay = true;
            newVideo.loop = true;
            newVideo.muted = true;
            newVideo.playsInline = true;
            newVideo.controls = true;
            newVideo.addEventListener('click', () => toggleVideoMute(newVideo));
            newMediaItem.appendChild(newVideo);
        } else {
            const newImage = document.createElement('img');
            newImage.src = url;
            newImage.alt = altText;
            newMediaItem.appendChild(newImage);
        }

        if (newestFirst) {
            imageGrid.prepend(newMediaItem);
        } else {
            imageGrid.appendChild(newMediaItem);
        }
    };

    const loadSavedMedia = async () => {
        if (!supabaseClient) return;

        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLE)
            .select('public_url, media_type, original_name')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error cargando multimedia desde Supabase:', error.message);
            return;
        }

        data.forEach((item) => {
            renderMedia(item.public_url, item.media_type, item.original_name || 'recuerdo subido', true);
        });
    };

    if (mainVideo) {
        mainVideo.addEventListener('click', () => toggleVideoMute(mainVideo));
    }

    reverseExistingMediaOrder();
    await loadSavedMedia();

    addImageButton.addEventListener('click', () => imageUploadInput.click());

    imageUploadInput.addEventListener('change', async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        if (!supabaseClient) {
            alert('Falta configurar Supabase en script.js para guardar y compartir archivos.');
            imageUploadInput.value = '';
            return;
        }

        const previousButtonText = addImageButton.textContent;
        addImageButton.disabled = true;
        addImageButton.textContent = 'Subiendo...';

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const isImage = file.type.startsWith('image/');
                const isVideo = file.type.startsWith('video/');
                if (!isImage && !isVideo) continue;

                const mediaType = isVideo ? 'video' : 'image';
                const extension = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
                const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

                const { error: uploadError } = await supabaseClient.storage
                    .from(SUPABASE_BUCKET)
                    .upload(filePath, file, { upsert: false });

                if (uploadError) {
                    console.error('Error subiendo archivo:', uploadError.message);
                    continue;
                }

                const { data: publicUrlData } = supabaseClient.storage
                    .from(SUPABASE_BUCKET)
                    .getPublicUrl(filePath);

                const publicUrl = publicUrlData.publicUrl;

                const { error: insertError } = await supabaseClient
                    .from(SUPABASE_TABLE)
                    .insert({
                        file_path: filePath,
                        public_url: publicUrl,
                        media_type: mediaType,
                        original_name: file.name
                    });

                if (insertError) {
                    console.error('Error guardando metadata del archivo:', insertError.message);
                    continue;
                }

                renderMedia(publicUrl, mediaType, file.name, true);
            }
        } finally {
            addImageButton.disabled = false;
            addImageButton.textContent = previousButtonText;
            imageUploadInput.value = '';
        }
    });
});
