// Imports logoImg from assets
import logoImg from "@/assets/logo.jpeg";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <a href="/" className="flex items-center">
              <img
                src={logoImg}
                alt="FindMyPoint Logo"
                className="h-8 w-auto object-contain"
                style={{ mixBlendMode: "multiply" }}
              />
            </a>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              A premium local discovery platform connecting millions of buyers with verified businesses across the country.
            </p>
            <div className="mt-6 flex gap-2.5">
              {[
                {
                  color: "bg-[#1877f2] text-white hover:scale-110",
                  url: "#",
                  svg: (
                    <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                    </svg>
                  )
                },
                {
                  color: "bg-[#ff0000] text-white hover:scale-110",
                  url: "#",
                  svg: (
                    <svg className="h-4.5 w-4.5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.513 3.545 12 3.545 12 3.545s-7.513 0-9.388.51C1.238 4.397.518 5.12.51 6.163.008 8.054.008 12 .008 12s0 3.945.502 5.837c.078 1.043.798 1.766 1.702 1.97 1.875.502 9.388.502 9.388.502s7.513 0 9.388-.502a2.997 2.997 0 0 0 2.11-2.108c.502-1.892.502-5.837.502-5.837s0-3.946-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  )
                },
                {
                  color: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white hover:scale-110",
                  url: "#",
                  svg: (
                    <svg className="h-4 w-4 stroke-white fill-none stroke-[2.2]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  )
                },
                {
                  color: "bg-[#0a66c2] text-white hover:scale-110",
                  url: "#",
                  svg: (
                    <svg className="h-4.5 w-4.5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  )
                },
                {
                  color: "bg-[#000000] text-white hover:scale-110",
                  url: "#",
                  svg: (
                    <svg className="h-3.5 w-3.5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  )
                }
              ].map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 shadow-sm ${item.color}`}
                >
                  {item.svg}
                </a>
              ))}
            </div>

            {/* App Download Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {/* Google Play Button */}
              <a
                href="#"
                className="flex items-center gap-2.5 rounded-xl bg-[#111111] hover:bg-black text-white px-3 py-1.5 transition-all duration-300 shadow-sm border border-white/10 cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  {/* Left Part (Blue) */}
                  <path d="M1.9 22.1l13.56-10.1L1.9 1.9c-.06.22-.09.46-.09.7v18.8c0 .24.03.48.09.7" fill="#3bccff" />
                  {/* Top Part (Green) */}
                  <path d="M16.14 11.3l-3.26-3.26L2.3 1.22c.3-.18.66-.22 1.02-.02l12.82 7.32" fill="#00e676" />
                  {/* Right Part (Yellow) */}
                  <path d="M21.97 12.74a1.66 1.66 0 0 0-.03-1.48l-3.37-1.92-3.15 3.16 3.15 3.16 3.37-1.92" fill="#ffe000" />
                  {/* Bottom Part (Red) */}
                  <path d="M16.14 12.7l-3.26 3.26L2.3 22.78c.3.18.66.22 1.02.02l12.82-7.32" fill="#ff3a44" />
                </svg>
                <div className="flex flex-col text-left">
                  <span className="text-[8px] font-semibold text-white/70 uppercase tracking-widest leading-none">GET IT ON</span>
                  <span className="text-[11px] font-bold leading-tight mt-0.5">Google Play</span>
                </div>
              </a>

              {/* App Store Button */}
              <a
                href="#"
                className="flex items-center gap-2.5 rounded-xl bg-[#111111] hover:bg-black text-white px-3 py-1.5 transition-all duration-300 shadow-sm border border-white/10 cursor-pointer"
              >
                <svg className="h-4.5 w-4.5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.502 12.06 1.002 1.45 2.19 3.078 3.76 3.02 1.514-.06 2.09-.98 3.916-.98 1.81 0 2.333.98 3.917.948 1.606-.027 2.648-1.48 3.627-2.9 1.13-1.656 1.597-3.26 1.623-3.342-.03-.015-3.107-1.192-3.137-4.747-.025-2.978 2.443-4.41 2.56-4.484-1.393-2.04-3.548-2.27-4.316-2.32-2-.162-3.9 1.231-4.918 1.231zm2.33-4.57c.896-1.082 1.5-2.585 1.332-4.086-1.286.05-2.85.856-3.774 1.938-.796.918-1.492 2.455-1.304 3.925 1.438.113 2.875-.722 3.746-1.777z" />
                </svg>
                <div className="flex flex-col text-left">
                  <span className="text-[8px] font-semibold text-white/70 leading-none">Download on the</span>
                  <span className="text-[11px] font-bold leading-tight mt-0.5">App Store</span>
                </div>
              </a>
            </div>
          </div>
          {[
            ["Company", ["About", "Careers", "Press"]],
            ["Business", ["Free Listing", "Advertise", "Lead Generator", "API"]],
            ["Support", ["Help Centre", "Contact", "Privacy", "Terms"]],
          ].map(([h, items]) => (
            <div key={h as string}>
              <h5 className="text-sm font-semibold">{h as string}</h5>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {(items as string[]).map((i) => (
                  <li key={i}>
                    {i === "Advertise" ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.dispatchEvent(new CustomEvent("fmp-open-advertise"));
                        }}
                        className="transition hover:text-foreground text-left cursor-pointer bg-transparent border-none p-0 text-sm text-muted-foreground font-normal"
                      >
                        {i}
                      </button>
                    ) : (
                      <a href="#" className="transition hover:text-foreground">
                        {i}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© 2026 FindmyPoint Directory Services. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition hover:text-foreground">
              Terms
            </a>
            <a href="#" className="transition hover:text-foreground">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
