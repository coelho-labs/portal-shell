import { useState } from 'react'
import reactLogo from '../../assets/react.svg'
import viteLogo from '../../assets/vite.svg'
import heroImg from '../../assets/hero.png'

function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex h-full flex-col">
      <section className="flex flex-1 flex-col items-center justify-center gap-[18px] px-5 pb-6 pt-8 lg:gap-[25px] lg:p-0">
        <div className="relative">
          <img
            src={heroImg}
            className="relative z-0 mx-auto w-[170px]"
            width="170"
            height="179"
            alt=""
          />
          <img
            src={reactLogo}
            className="absolute inset-x-0 top-[34px] z-10 mx-auto h-7 [transform:perspective(2000px)_rotateZ(300deg)_rotateX(44deg)_rotateY(39deg)_scale(1.4)]"
            alt="React logo"
          />
          <img
            src={viteLogo}
            className="absolute inset-x-0 top-[107px] z-0 mx-auto h-[26px] [transform:perspective(2000px)_rotateZ(300deg)_rotateX(40deg)_rotateY(39deg)_scale(0.8)]"
            alt="Vite logo"
          />
        </div>
        <div className="text-center">
          <h1 className="m-0 text-4xl font-semibold text-foreground">Host Page</h1>
          <p className="m-0 mt-2 text-base text-foreground/80">
            Edit{' '}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-primary">
              src/App.tsx
            </code>{' '}
            and save to test{' '}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-primary">
              HMR
            </code>
          </p>
        </div>
        <button
          type="button"
          className="mb-6 rounded-md border-2 border-transparent bg-accent px-2.5 py-1.5 text-primary transition-[border-color] duration-300 hover:border-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="relative w-full before:absolute before:-top-[4.5px] before:left-0 before:border-[5px] before:border-transparent before:border-l-border before:content-[''] after:absolute after:-top-[4.5px] after:right-0 after:border-[5px] after:border-transparent after:border-r-border after:content-['']"></div>

      <section className="flex flex-col border-t border-border text-center lg:flex-row lg:text-left">
        <div
          id="docs"
          className="flex-1 border-b border-border px-5 py-6 lg:border-b-0 lg:border-r lg:p-8"
        >
          <svg className="icon mb-4 h-[22px] w-[22px]" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2 className="m-0 text-xl font-semibold text-foreground">Documentation</h2>
          <p className="m-0 mt-2 text-sm text-muted-foreground">Your questions, answered</p>
          <ul className="m-0 mt-5 flex list-none flex-wrap justify-center gap-2 p-0 lg:mt-8">
            <li className="flex-1 basis-[calc(50%-8px)] lg:basis-auto">
              <a
                href="https://vite.dev/"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-muted px-3 py-1.5 text-foreground no-underline transition-shadow duration-300 hover:shadow-md lg:w-auto"
              >
                <img className="logo h-[18px]" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li className="flex-1 basis-[calc(50%-8px)] lg:basis-auto">
              <a
                href="https://react.dev/"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-muted px-3 py-1.5 text-foreground no-underline transition-shadow duration-300 hover:shadow-md lg:w-auto"
              >
                <img className="button-icon h-[18px] w-[18px]" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social" className="flex-1 px-5 py-6 lg:p-8">
          <svg className="icon mb-4 h-[22px] w-[22px]" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2 className="m-0 text-xl font-semibold text-foreground">Connect with us</h2>
          <p className="m-0 mt-2 text-sm text-muted-foreground">Join the Vite community</p>
          <ul className="m-0 mt-5 flex list-none flex-wrap justify-center gap-2 p-0 lg:mt-8">
            <li className="flex-1 basis-[calc(50%-8px)] lg:basis-auto">
              <a
                href="https://github.com/vitejs/vite"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-muted px-3 py-1.5 text-foreground no-underline transition-shadow duration-300 hover:shadow-md lg:w-auto"
              >
                <svg
                  className="button-icon h-[18px] w-[18px]"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li className="flex-1 basis-[calc(50%-8px)] lg:basis-auto">
              <a
                href="https://chat.vite.dev/"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-muted px-3 py-1.5 text-foreground no-underline transition-shadow duration-300 hover:shadow-md lg:w-auto"
              >
                <svg
                  className="button-icon h-[18px] w-[18px]"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li className="flex-1 basis-[calc(50%-8px)] lg:basis-auto">
              <a
                href="https://x.com/vite_js"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-muted px-3 py-1.5 text-foreground no-underline transition-shadow duration-300 hover:shadow-md lg:w-auto"
              >
                <svg
                  className="button-icon h-[18px] w-[18px]"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li className="flex-1 basis-[calc(50%-8px)] lg:basis-auto">
              <a
                href="https://bsky.app/profile/vite.dev"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-muted px-3 py-1.5 text-foreground no-underline transition-shadow duration-300 hover:shadow-md lg:w-auto"
              >
                <svg
                  className="button-icon h-[18px] w-[18px]"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="relative w-full before:absolute before:-top-[4.5px] before:left-0 before:border-[5px] before:border-transparent before:border-l-border before:content-[''] after:absolute after:-top-[4.5px] after:right-0 after:border-[5px] after:border-transparent after:border-r-border after:content-['']"></div>
      <section className="h-12 border-t border-border lg:h-[88px]"></section>
    </div>
  )
}

export default Home
