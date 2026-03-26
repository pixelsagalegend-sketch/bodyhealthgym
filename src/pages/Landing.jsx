import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import Servicios from '../components/landing/Servicios'
import Precios from '../components/landing/Precios'
import Promociones from '../components/landing/Promociones'
import Testimonios from '../components/landing/Testimonios'
import Contacto from '../components/landing/Contacto'
import Footer from '../components/landing/Footer'

export default function Landing() {
  return (
    <div className="bg-gym-black min-h-screen">
      <Navbar />
      <Hero />
      <Servicios />
      <Precios />
      <Promociones />
      <Testimonios />
      <Contacto />
      <Footer />
    </div>
  )
}
