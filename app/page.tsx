'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode'

export default function Home() {
  const [phone, setPhone] = useState('')
  const [reviewUrl, setReviewUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    // Validación básica
    if (!phone.trim()) {
      setError('Por favor ingresa tu número de WhatsApp')
      setLoading(false)
      return
    }

    if (!reviewUrl.trim()) {
      setError('Por favor ingresa el enlace de reseñas')
      setLoading(false)
      return
    }

    try {
      // Generar mensaje de WhatsApp
      const message = encodeURIComponent(
        `Hola, gracias por visitarnos, espero que tu experiencia haya sido de lo mejor. En el siguiente link puedes dejarnos una reseña. De antemano quedamos agradecidos contigo y esperamos que vuelvas pronto: ${reviewUrl}`,
      )
      const whatsappUrl = `https://wa.me/${phone}?text=${message}`

      // Generar QR
      const dataUrl = await QRCode.toDataURL(whatsappUrl, { width: 300 })
      setQrDataUrl(dataUrl)

      // Guardar lead en Supabase
      const { error: supabaseError } = await supabase
        .from('qr_leads')
        .insert({ phone, review_url: reviewUrl })

      if (supabaseError) throw supabaseError

      setSuccess(true)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Hubo un error al guardar tu información')
      }
    } finally {
      setLoading(false)
    }
  }

  const downloadQR = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = 'qr-tecnomata.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-4 py-12 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0px_#000000] p-6 md:p-8">
        {/* Encabezado con estrellas (Estilo "Tag") */}
        <div className="text-center mb-6">
          <div className="bg-red-600 text-white font-bold px-4 py-1 rounded-full inline-block mb-4 text-lg tracking-widest">
            ★★★★★
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-black mb-2">
            Generador de QR para Reseñas
          </h1>
          <p className="text-neutral-700 text-lg">
            ¡Haz que tus clientes te dejen reseñas fácilmente!
          </p>
        </div>

        {/* Nota informativa (Estilo "Caja Roja") */}
        <div className="bg-red-600 text-white p-5 rounded-xl mb-6 border-2 border-black">
          <p className="text-base font-bold text-white mb-1">
            ¿Cómo funciona?
          </p>
          <p className="text-sl text-white/90">
            Ingresa tu WhatsApp y tu enlace de reseñas. Al escanear el QR, se
            abrirá un chat con un link para dejar una reseña.
          </p>
        </div>

        {/* Mensajes de error/éxito (Estilo Audaz) */}
        {error && (
          <div className="bg-red-600 border-2 border-black text-white p-4 rounded-lg mb-4 flex items-start space-x-2">
            {/* Icono de error simple */}
            <span className="font-black text-xl mt-[-2px]">!</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-600 border-2 border-black text-white p-4 rounded-lg mb-4 flex items-start space-x-2">
            {/* Icono de éxito simple */}
            <span className="font-black text-xl mt-[-2px]">✓</span>
            <span>¡Guardado exitosamente!</span>
          </div>
        )}

        {/* Formulario o Vista de QR */}
        {!qrDataUrl ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Número de WhatsApp (con código de país)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 521234567890"
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Enlace de reseñas (Google, Yelp, etc.)
              </label>
              <input
                type="url"
                value={reviewUrl}
                onChange={(e) => setReviewUrl(e.target.value)}
                placeholder="Ej: https://g.page/tu-negocio"
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-bold transition-all border-2 border-black
                ${
                  loading
                    ? 'bg-neutral-400 cursor-not-allowed'
                    : 'bg-red-600 shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] active:shadow-[2px_2px_0px_#000000] active:translate-y-0.5 active:translate-x-0.5'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generando...
                </span>
              ) : (
                'Generar mi QR'
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-black text-black mb-4">
              ¡Tu QR está listo!
            </h2>
            <div className="bg-white p-4 border-4 border-black rounded-lg mb-6 inline-block">
              <img src={qrDataUrl} alt="QR para WhatsApp" className="mx-auto" />
            </div>
            <button
              onClick={downloadQR}
              className="w-full bg-black text-white font-bold py-3 px-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_#dc2626] hover:shadow-[6px_6px_0px_#dc2626] active:shadow-[2px_2px_0px_#dc2626] active:translate-y-0.5 active:translate-x-0.5 transition-all mb-4"
            >
              📥 Descargar QR
            </button>
            <button
              type="button"
              onClick={() => {
                setQrDataUrl(null)
                setPhone('')
                setReviewUrl('')
                setSuccess(false)
              }}
              className="text-black font-bold underline hover:text-red-600"
            >
              Generar otro QR
            </button>
          </div>
        )}
      </div>

      {/* Pie de página (Estilo limpio) */}
      <footer className="mt-8 text-center text-neutral-600 text-sm fixed bottom-4 left-0 right-0">
        Hecho con ❤️ por{' '}
        <a
          href="https://tecnomata.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black font-bold hover:text-red-600 underline"
        >
          Tecnómata
        </a>
      </footer>
    </div>
  )
}