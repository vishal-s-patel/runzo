import { Link } from 'react-router'
import { Button } from './components/ui/button'

function App() {
  return (
    <>
      <div className='h-screen flex items-center flex-col justify-center'>
        <h3 className='text-4xl mb-5'>Runzo</h3>
        <Button asChild>
          <Link to="/match-details">Continue as Guest</Link>
        </Button>
      </div>
    </>
  )
}

export default App
