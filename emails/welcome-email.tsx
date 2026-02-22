import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface WelcomeEmailProps {
  name: string
  plan: 'Monthly' | 'Annual'
  amount: number
  nextBillingDate: string
  transactionId: string
}

export default function WelcomeEmail({
  name = 'Utilizador',
  plan = 'Monthly',
  amount = 4.99,
  nextBillingDate = '16 de Março de 2026',
  transactionId = 'ch_xxxxxxxxxxxxx',
}: WelcomeEmailProps) {
  const features = [
    '✅ Ativos e Dividendos Ilimitados',
    '✅ Hábitos e Rotinas Ilimitados',
    '✅ Projeção Futura de Dividendos',
    '✅ Loop AI Coach (Dicas Personalizadas)',
    '✅ Suporte Prioritário 24/7',
  ]

  return (
    <Html>
      <Head />
      <Preview>Bem-vindo ao Loop Pro! 🎉 A tua jornada financeira começa agora.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Heading style={logo}>Loop</Heading>
            <Text style={tagline}>Finance Tracker</Text>
          </Section>

          {/* Welcome Message */}
          <Section style={content}>
            <Heading style={h1}>Bem-vindo ao Loop Pro! 🎉</Heading>
            <Text style={text}>
              Olá <strong>{name}</strong>,
            </Text>
            <Text style={text}>
              Obrigado por te juntares ao Loop Pro! Estamos muito felizes por teres decidido investir no teu futuro financeiro.
            </Text>
            <Text style={text}>
              A tua subscrição está agora ativa e tens acesso imediato a todas as funcionalidades premium.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Transaction Details */}
          <Section style={content}>
            <Heading style={h2}>📋 Detalhes da Transação</Heading>
            <table style={detailsTable}>
              <tr>
                <td style={detailLabel}>Plano:</td>
                <td style={detailValue}>Loop Pro {plan === 'Annual' ? '(Anual)' : '(Mensal)'}</td>
              </tr>
              <tr>
                <td style={detailLabel}>Valor Pago:</td>
                <td style={detailValue}>€{amount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style={detailLabel}>Próxima Cobrança:</td>
                <td style={detailValue}>{nextBillingDate}</td>
              </tr>
              <tr>
                <td style={detailLabel}>ID da Transação:</td>
                <td style={detailValue}>{transactionId}</td>
              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          {/* What's Included */}
          <Section style={content}>
            <Heading style={h2}>✨ O que está incluído</Heading>
            {features.map((feature, index) => (
              <Text key={index} style={featureStyle}>
                {feature}
              </Text>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Getting Started */}
          <Section style={content}>
            <Heading style={h2}>🚀 Primeiros Passos</Heading>
            <Text style={text}>
              1. <strong>Adiciona os teus ativos</strong> - Começa por adicionar as tuas ações, ETFs e outros investimentos.
            </Text>
            <Text style={text}>
              2. <strong>Configura os teus hábitos</strong> - Define rotinas financeiras para acompanhar o teu progresso.
            </Text>
            <Text style={text}>
              3. <strong>Explora o AI Coach</strong> - Recebe dicas personalizadas baseadas no teu perfil.
            </Text>
            
            <Button style={button} href="https://loop.com/dashboard">
              Ir para o Dashboard
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Support */}
          <Section style={content}>
            <Heading style={h2}>💬 Precisas de Ajuda?</Heading>
            <Text style={text}>
              A nossa equipa de suporte está disponível 24/7 para te ajudar.
            </Text>
            <Text style={text}>
              📧 Email: <Link href="mailto:support@loop.com" style={link}>support@loop.com</Link>
            </Text>
            <Text style={text}>
              💬 Suporte: <Link href="https://loop.com/dashboard/support" style={link}>Contactar Suporte</Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2026 Loop Finance Tracker. Todos os direitos reservados.
            </Text>
            <Text style={footerText}>
              <Link href="https://loop.com/settings" style={footerLink}>Gerir Subscrição</Link> |{' '}
              <Link href="https://loop.com/privacy" style={footerLink}>Privacidade</Link> |{' '}
              <Link href="https://loop.com/terms" style={footerLink}>Termos</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 40px',
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}

const logo = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
}

const tagline = {
  color: '#e0e7ff',
  fontSize: '14px',
  margin: '4px 0 0 0',
  padding: '0',
}

const content = {
  padding: '0 40px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '32px 0 16px',
}

const h2 = {
  color: '#374151',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
}

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '12px 0',
}

const featureStyle = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '8px 0',
}

const detailsTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  margin: '16px 0',
}

const detailLabel = {
  color: '#6b7280',
  fontSize: '14px',
  padding: '8px 0',
  fontWeight: '500',
}

const detailValue = {
  color: '#1f2937',
  fontSize: '14px',
  padding: '8px 0',
  fontWeight: '600',
  textAlign: 'right' as const,
}

const button = {
  backgroundColor: '#667eea',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '14px 20px',
  margin: '24px 0',
}

const link = {
  color: '#667eea',
  textDecoration: 'underline',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const footer = {
  padding: '0 40px',
  marginTop: '32px',
}

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '18px',
  textAlign: 'center' as const,
  margin: '8px 0',
}

const footerLink = {
  color: '#9ca3af',
  textDecoration: 'underline',
}
