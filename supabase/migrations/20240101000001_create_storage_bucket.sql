
-- Создаем bucket для изображений товаров
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Создаем политику для загрузки изображений (все пользователи могут загружать)
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Создаем политику для просмотра изображений (публичный доступ)
CREATE POLICY "Allow public access to view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Создаем политику для обновления изображений
CREATE POLICY "Allow authenticated users to update their images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Создаем политику для удаления изображений
CREATE POLICY "Allow authenticated users to delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
