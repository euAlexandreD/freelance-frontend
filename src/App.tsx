import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from './pages/Login'
import { Profile } from './pages/Profile'
import { Servicos } from './pages/Servicos'
import { MeusServicos } from './pages/MeusServicos'
import { MeusPedidos } from './pages/MeusPedidos'
import { PedidosRecebidos } from './pages/PedidosRecebidos'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/meus-servicos" element={<MeusServicos />} />
        <Route path="/meus-pedidos" element={<MeusPedidos />} />
        <Route path="/pedidos-recebidos" element={<PedidosRecebidos />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
