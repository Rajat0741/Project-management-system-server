import { createFileRoute } from '@tanstack/react-router'
import ForgotPasswordForm from '@/components/Auth/ForgotPasswordForm'

export const Route = createFileRoute('/_notprotected/_auth/forgotPasswordRequest')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ForgotPasswordForm />
  )
}
