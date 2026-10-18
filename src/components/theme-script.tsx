export function ThemeScript() {
  const script = `
    (function () {
      try {
        var forced = new URLSearchParams(location.search).get('theme');
        var stored = localStorage.getItem('theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var dark = forced ? forced === 'dark' : (stored ? stored === 'dark' : prefersDark);
        if (forced === 'light' || forced === 'dark') {
          try { localStorage.setItem('theme', forced); } catch (e) {}
        }
        document.documentElement.classList.toggle('dark', dark);
        document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
      } catch (e) {}
    })();
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
