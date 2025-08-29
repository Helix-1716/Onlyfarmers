import 'boxicons/css/boxicons.min.css';

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-green-700 via-green-900 to-yellow-900 text-white py-8 mt-16 footer-news-aware">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center md:justify-between gap-6">
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          <i className='bx bx-leaf text-3xl text-green-300'></i>
          <span className="font-extrabold text-xl tracking-wide">ONLY <span className="text-yellow-300">FARMERS</span><span className="text-green-200">.in</span></span>
        </div>
        <div className="text-center md:text-left text-sm font-medium opacity-90">
          Rooted in Nature. Driven by Tech.<br/>
          &copy; {new Date().getFullYear()} OnlyFarmers.in. All rights reserved.
        </div>
        <div className="flex gap-4 text-2xl">
          <a href="#" className="hover:text-yellow-300 transition-colors" title="Instagram"><i className='bx bxl-instagram'></i></a>
          <a href="#" className="hover:text-yellow-300 transition-colors" title="Facebook"><i className='bx bxl-facebook'></i></a>
          <a href="#" className="hover:text-yellow-300 transition-colors" title="Twitter"><i className='bx bxl-twitter'></i></a>
          <a href="#" className="hover:text-yellow-300 transition-colors" title="LinkedIn"><i className='bx bxl-linkedin'></i></a>
        </div>
      </div>
    </footer>
  );
}