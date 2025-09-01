import { Result, Button } from 'antd'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Página não encontrada."
      extra={
        <Button type="primary">
          <Link to="/">Voltar para Home</Link>
        </Button>
      }
    />
  )
}
