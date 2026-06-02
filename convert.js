const fs = require('fs');
let h = fs.readFileSync('docs/nyamby-coming-soon.html', 'utf8');
h = h.replace(/class=/g, 'className=');
h = h.replace(/<!--.*?-->/g, '');
h = h.replace(/<style>([\s\S]*?)<\/style>/g, '<style dangerouslySetInnerHTML={{ __html: `$1` }} />');
h = h.replace(/<script>([\s\S]*?)<\/script>/g, '');
h = h.replace(/<input([^>]*?)>/g, '<input$1 />');
h = h.replace(/<hr([^>]*?)>/g, '<hr$1 />');
h = h.replace(/<br>/g, '<br />'); // Add br closing
h = h.replace(/onsubmit=\"[^\"]*\"/g, 'onSubmit={handleSubmit}');
h = h.replace(/for=/g, 'htmlFor=');
h = h.replace(/style=\"(.*?)\"/g, (m, p) => {
    let styles = p.split(';').filter(x => x.trim()).map(x => {
        let [k, v] = x.split(':');
        k = k.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        return `${k}: '${v.trim()}'`;
    }).join(', ');
    return `style={{ ${styles} }}`;
});

const headMatch = h.match(/<head>([\s\S]*?)<\/head>/);
const bodyMatch = h.match(/<body[^>]*>([\s\S]*?)<\/body>/);

let headInner = headMatch ? headMatch[1] : '';
headInner = headInner.replace(/<meta ([^>]+)>/g, '<meta $1 />')
                     .replace(/<link ([^>]+)>/g, '<link $1 />')
                     .replace(/charset=/g, 'charSet=')
                     .replace(/crossorigin/g, 'crossOrigin="anonymous"');

const reactCode = `"use client";
import { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

export default function PhysicalMode() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.animation = "fadeUp .5s ease both";
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".tl-phase, .cat-card, .safety-layer").forEach(el => {
      (el as HTMLElement).style.opacity = "0";
      observer.observe(el);
      el.addEventListener("animationstart", () => (el as HTMLElement).style.opacity = "1");
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const btn = document.getElementById("submit-btn") as HTMLButtonElement;
    if (btn) {
        btn.textContent = "✓ Berhasil didaftarkan!";
        btn.classList.add("sent");
        btn.disabled = true;
    }
    document.querySelectorAll(".notify-form input, .notify-form select").forEach(el => ((el as HTMLInputElement).disabled = true));
  };

  return (
    <>
      <Head>
        ${headInner}
      </Head>
      ${bodyMatch ? bodyMatch[1] : ''}
    </>
  );
}
`;

fs.writeFileSync('src/app/physical-mode/page.tsx', reactCode);
console.log("Done");
