import { Resend } from 'resend'
import { render } from '@react-email/render'
import WelcomeEmail from '@/emails/welcome-email'

const resend = new Resend(process.env.RESEND_API_KEY)

interface WelcomeEmailData {
    email: string
    name: string
    plan: 'Monthly' | 'Annual'
    amount: number
    nextBillingDate: string
    transactionId: string
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
    try {
        const emailHtml = render(
            WelcomeEmail({
                name: data.name,
                plan: data.plan,
                amount: data.amount,
                nextBillingDate: data.nextBillingDate,
                transactionId: data.transactionId,
            })
        )

        const result = await resend.emails.send({
            from: 'Loop <noreply@loop.com>',
            to: data.email,
            subject: 'Bem-vindo ao Loop Pro! 🎉',
            html: emailHtml,
        })

        console.log('Welcome email sent:', result)
        return { success: true, data: result }
    } catch (error) {
        console.error('Error sending welcome email:', error)
        return { success: false, error }
    }
}

interface CancellationEmailData {
    email: string
    name: string
    accessUntil: string
}

export async function sendCancellationEmail(data: CancellationEmailData) {
    try {
        const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">Loop</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Finance Tracker</p>
          </div>
          <div class="content">
            <h2>Subscrição Cancelada</h2>
            <p>Olá <strong>${data.name}</strong>,</p>
            <p>Confirmamos o cancelamento da tua subscrição Loop Pro.</p>
            <p><strong>Continuas a ter acesso até:</strong> ${data.accessUntil}</p>
            <p>Após esta data, a tua conta voltará ao plano gratuito.</p>
            <h3>O que vais perder:</h3>
            <ul>
              <li>Ativos e Dividendos Ilimitados</li>
              <li>Hábitos e Rotinas Ilimitados</li>
              <li>Projeção Futura de Dividendos</li>
              <li>Loop AI Coach</li>
            </ul>
            <p>Mudaste de ideias? Podes reativar a qualquer momento:</p>
            <a href="https://loop.com/dashboard/plans" class="button">Reativar Subscrição</a>
            <p style="margin-top: 30px;">Gostaríamos de saber porque cancelaste. O teu feedback ajuda-nos a melhorar:</p>
            <a href="https://loop.com/dashboard/support">Deixar Feedback</a>
          </div>
          <div class="footer">
            <p>© 2026 Loop Finance Tracker</p>
            <p><a href="https://loop.com/privacy">Privacidade</a> | <a href="https://loop.com/terms">Termos</a></p>
          </div>
        </body>
      </html>
    `

        const result = await resend.emails.send({
            from: 'Loop <noreply@loop.com>',
            to: data.email,
            subject: 'Confirmação de Cancelamento - Loop Pro',
            html: emailHtml,
        })

        console.log('Cancellation email sent:', result)
        return { success: true, data: result }
    } catch (error) {
        console.error('Error sending cancellation email:', error)
        return { success: false, error }
    }
}
