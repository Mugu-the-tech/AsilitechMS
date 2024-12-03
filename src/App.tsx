import './App.css'
import { AuthProvider } from './routes/AuthContext'
import RouterPage from './routes/Router'

function App() {

  return (
 
  <AuthProvider>
  <div className=' dark:bg-[#081424]'>
    <RouterPage/> 
    </div>
    </AuthProvider>

    
  
  )
}

export default App