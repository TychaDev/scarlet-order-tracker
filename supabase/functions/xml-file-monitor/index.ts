
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Путь к папке с XML файлами
    const xmlDirectory = '/home/ftpmanager/xml_upload'
    
    console.log('Начинаем мониторинг папки:', xmlDirectory)

    // Проверяем наличие новых XML файлов
    const files = []
    try {
      for await (const dirEntry of Deno.readDir(xmlDirectory)) {
        if (dirEntry.isFile && dirEntry.name.toLowerCase().endsWith('.xml')) {
          const filePath = `${xmlDirectory}/${dirEntry.name}`
          const fileInfo = await Deno.stat(filePath)
          files.push({
            name: dirEntry.name,
            path: filePath,
            modified: fileInfo.mtime
          })
        }
      }
    } catch (error) {
      console.error('Ошибка чтения директории:', error)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Не удалось прочитать директорию' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Найдено XML файлов:', files.length)

    let processedCount = 0

    for (const file of files) {
      try {
        console.log('Обрабатываем файл:', file.name)
        
        // Читаем содержимое файла
        const xmlContent = await Deno.readTextFile(file.path)
        
        // Парсим XML
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlContent, "text/xml")
        
        // Проверяем на ошибки парсинга
        const parserError = xmlDoc.querySelector("parsererror")
        if (parserError) {
          console.error('Ошибка парсинга XML:', parserError.textContent)
          continue
        }
        
        // Извлекаем предложения
        const offers = xmlDoc.getElementsByTagName('offer')
        console.log('Найдено предложений в XML:', offers.length)
        
        const newProducts = []
        
        for (let i = 0; i < offers.length; i++) {
          const offer = offers[i]
          
          const sku = offer.getAttribute('sku') || ''
          const group1 = offer.getAttribute('group1') || 'Без категории'
          const group2 = offer.getAttribute('group2') || ''
          
          const nameElement = offer.getElementsByTagName('name')[0]
          const ostatokElement = offer.getElementsByTagName('ostatok')[0]
          const priceElement = offer.getElementsByTagName('price')[0]
          
          const name = nameElement?.textContent || 'Неизвестный товар'
          const ostatokText = ostatokElement?.textContent || '0'
          const priceText = priceElement?.textContent || '0'
          
          // Обработка остатка
          let stockQuantity = 0
          if (ostatokText && ostatokText.trim()) {
            stockQuantity = Math.floor(parseFloat(ostatokText.replace(',', '.')) || 0)
          }
          
          // Обработка цены
          const price = parseFloat(priceText.replace(/\s/g, '').replace(',', '.')) || 0
          
          const productData = {
            name: name,
            category: group2 || group1,
            price: price,
            stock_quantity: stockQuantity,
            description: `SKU: ${sku}${group1 ? ` | Группа: ${group1}` : ''}${group2 ? ` | Подгруппа: ${group2}` : ''}`,
            xml_data: {
              sku: sku,
              group1: group1,
              group2: group2,
              original_ostatok: ostatokText,
              original_price: priceText,
              imported_from: file.name,
              imported_at: new Date().toISOString()
            }
          }
          
          newProducts.push(productData)
        }
        
        // Сохраняем товары в базу данных пачками
        if (newProducts.length > 0) {
          const batchSize = 100
          for (let i = 0; i < newProducts.length; i += batchSize) {
            const batch = newProducts.slice(i, i + batchSize)
            
            const { error } = await supabaseClient
              .from('products')
              .insert(batch)
            
            if (error) {
              console.error('Ошибка при сохранении пачки товаров:', error)
            } else {
              console.log(`Сохранена пачка товаров: ${batch.length}`)
            }
          }
        }
        
        console.log(`Успешно обработано товаров из ${file.name}: ${newProducts.length}`)
        
        // Архивируем обработанный файл
        const archiveDir = `${xmlDirectory}/processed`
        try {
          await Deno.mkdir(archiveDir, { recursive: true })
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
          const archivePath = `${archiveDir}/${timestamp}_${file.name}`
          await Deno.rename(file.path, archivePath)
          console.log(`Файл ${file.name} перемещен в архив`)
        } catch (error) {
          console.error('Ошибка архивирования файла:', error)
          // Если не удалось архивировать, просто удаляем
          try {
            await Deno.remove(file.path)
            console.log(`Файл ${file.name} удален`)
          } catch (deleteError) {
            console.error('Ошибка удаления файла:', deleteError)
          }
        }
        
        processedCount++
        
      } catch (error) {
        console.error(`Ошибка обработки файла ${file.name}:`, error)
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Обработано файлов: ${processedCount}`,
      filesFound: files.length,
      filesProcessed: processedCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Общая ошибка:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
