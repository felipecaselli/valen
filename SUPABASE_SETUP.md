# Configuracion Supabase (guardar fotos/videos compartidos)

## 1) Crear proyecto en Supabase
- Entra a [https://supabase.com](https://supabase.com) y crea un proyecto.

## 2) Crear bucket publico
1. Ve a **Storage**.
2. Crea bucket llamado `media`.
3. Marca el bucket como **Public**.

## 3) Crear tabla para metadata
En **SQL Editor**, ejecuta:

```sql
create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  public_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  original_name text,
  created_at timestamptz not null default now()
);
```

## 4) Politicas (RLS) para prueba rapida
Para que funcione rapido en una web simple, ejecuta tambien:

```sql
alter table public.media_items enable row level security;

create policy "allow read media_items"
on public.media_items
for select
to anon
using (true);

create policy "allow insert media_items"
on public.media_items
for insert
to anon
with check (true);
```

En Storage > Policies del bucket `media`, crea:
- policy de **SELECT** para `anon` (permitir leer)
- policy de **INSERT** para `anon` (permitir subir)

## 5) Pegar claves en el frontend
En `script.js` reemplaza:
- `PEGA_AQUI_TU_SUPABASE_URL`
- `PEGA_AQUI_TU_SUPABASE_ANON_KEY`

Estas claves estan en:
- **Project Settings** > **API** > `Project URL`
- **Project Settings** > **API** > `anon public`

## 6) Probar
1. Abre tu pagina.
2. Click en `Agregar Imagen o Video`.
3. Sube archivo.
4. Refresca pagina: debe seguir apareciendo.
5. Abre desde otro dispositivo/navegador: tambien debe verse.

---

Nota: asi queda funcional para compartir. Si queres, despues te ayudo a agregar autenticacion para que solo ustedes puedan subir.
