import { SkipLink } from './components/layout/SkipLink'
import { SiteHeader } from './components/layout/SiteHeader'
import { SiteFooter } from './components/layout/SiteFooter'
import { Hero } from './components/sections/Hero'
import { About } from './components/sections/About'
import { Bath } from './components/sections/Bath'
import { Rooms } from './components/sections/Rooms'
import { Cuisine } from './components/sections/Cuisine'
import { Access } from './components/sections/Access'
import { Reserve } from './components/sections/Reserve'

function App() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main">
        <Hero />
        <About />
        <Bath />
        <Rooms />
        <Cuisine />
        <Access />
        <Reserve />
      </main>
      <SiteFooter />
    </>
  )
}

export default App
