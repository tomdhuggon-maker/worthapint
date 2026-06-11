export const metadata = {
  title: 'About — Worth a Pint',
}

export default function AboutPage() {
  return (
    <main className="page-wrap">
      <header className="pub-header">
        <p className="pub-area">About</p>
        <h1 className="pub-name">Why this exists</h1>
      </header>

      <hr className="divider" />

      <div className="prose">
        <p>London. Thousands of years of glorious pub history at our fingertips, and yet we tend to get forced by colleagues, friends and families to the nearest 2-bit Wetherspoons, Fullers or Brewdog.</p>
        <p>Independent pubs in particular are facing an existential crisis. Pubs are often "tied" to a specific large brewery, meaning that more interesting and independent brewers can't sell their drinks there. This puts more power into the hands of the corporates and starves independent brewers, meaning they need to sell at a higher price, which prices them out of independent pubs… you get the picture.</p>
        <p>The long and the short of it is that there are still so many wonderful pubs in London, but they need our help. This guide is dedicated to finding and promoting pubs that do good, either through community building or just doing what they do brilliantly.</p>
        <p>Join brothers Tom and Chris in scouring the city for a good brew.</p>
      </div>
    </main>
  )
}