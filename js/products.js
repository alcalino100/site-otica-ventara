const PRODUCTS = [
  { id:1, name:'Aurora Classic', cat:'grau', price:489.90, tag:'Novo', desc:'Armação em acetato premium, design atemporal para o dia a dia. Leve e confortável.' },
  { id:2, name:'Linhares', cat:'grau', price:359.90, desc:'Modelo retangular em metal, ideal para rostos quadrados e ovais.' },
  { id:3, name:'Vista Round', cat:'grau', price:429.90, tag:'Bestseller', desc:'Armação redonda em titânio, ultra leve, com lentes antirreflexo.' },
  { id:4, name:'Solar Breeze', cat:'solar', price:529.90, tag:'UV400', desc:'Óculos solar com lentes polarizadas e proteção total contra raios UV.' },
  { id:5, name:'Costa Wayfarer', cat:'solar', price:399.90, desc:'Clássico wayfarer em acetato, lentes degradê, estilo atemporal.' },
  { id:6, name:'Aviator Gold', cat:'solar', price:649.90, tag:'Premium', desc:'Aviador em metal dourado com lentes espelhadas.' },
  { id:7, name:'Lentes Mensais', cat:'lentes', price:129.90, desc:'Caixa com 6 unidades, alta oxigenação, conforto prolongado.' },
  { id:8, name:'Lentes Diárias', cat:'lentes', price:89.90, desc:'30 lentes descartáveis, praticidade e higiene para o dia a dia.' },
  { id:9, name:'Estojo Premium', cat:'acessorios', price:59.90, desc:'Estojo rígido com limpeza e microfibra inclusos.' },
  { id:10, name:'Kit Limpeza', cat:'acessorios', price:39.90, desc:'Spray + flanela microfibra + estojo compacto.' },
  { id:11, name:'Cordão Couro', cat:'acessorios', price:49.90, desc:'Cordão em couro sintético, ajustável, elegante.' },
  { id:12, name:'Solar Esportivo', cat:'solar', price:459.90, desc:'Armação emborrachada, lentes curvas, ideal para esportes.' },
];

const CAT_LABEL = { grau:'Óculos de Grau', solar:'Óculos Solar', lentes:'Lentes de Contato', acessorios:'Acessórios' };

function formatPrice(v){ return 'R$ ' + v.toFixed(2).replace('.',','); }

function glassesSVG(seed){
  const colors = ['#1f2a3a','#b8935a','#4a4a4a','#2d3e55','#9a7a46'];
  const c = colors[seed % colors.length];
  return `<svg class="g" viewBox="0 0 160 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 30 Q20 12 45 12 L55 12 Q68 12 72 30 Q68 48 55 48 L45 48 Q20 48 10 30 Z" fill="none" stroke="${c}" stroke-width="2.5"/>
    <path d="M88 30 Q92 12 105 12 L115 12 Q140 12 150 30 Q140 48 115 48 L105 48 Q92 48 88 30 Z" fill="none" stroke="${c}" stroke-width="2.5"/>
    <line x1="72" y1="26" x2="88" y2="26" stroke="${c}" stroke-width="2.5"/>
    <circle cx="45" cy="30" r="8" fill="${c}" opacity="0.12"/>
    <circle cx="115" cy="30" r="8" fill="${c}" opacity="0.12"/>
  </svg>`;
}
