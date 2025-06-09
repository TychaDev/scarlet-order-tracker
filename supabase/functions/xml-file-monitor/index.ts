
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

    console.log('FTP мониторинг вызван')

    // Поскольку Edge функция не может читать файловую систему напрямую,
    // мы возвращаем успешный ответ и инструкции для пользователя
    const message = `
    FTP мониторинг настроен, но требует дополнительной настройки сервера.
    
    Для автоматической синхронизации с 1С необходимо:
    1. Настроить cron job на сервере для мониторинга папки /home/ftpmanager/xml_upload
    2. Либо использовать webhook от 1С для уведомления о новых файлах
    3. Либо загружать XML файлы напрямую через веб-интерфейс
    
    В текущей конфигурации Edge функции Supabase не могут напрямую читать файловую систему сервера.
    `

    return new Response(JSON.stringify({ 
      success: true, 
      message: message.trim(),
      filesFound: 0,
      filesProcessed: 0,
      note: "Требуется дополнительная настройка сервера для автоматического мониторинга файлов"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Ошибка в FTP мониторинге:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
