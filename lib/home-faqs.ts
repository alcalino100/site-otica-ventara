// Perguntas frequentes da Home (usadas no acordeão e nos dados estruturados FAQPage).

export interface FAQItem {
  question: string;
  answer: string;
}

export const HOME_FAQS: FAQItem[] = [
  {
    question: "Como funciona a escolha de armações na Ótica Ventara?",
    answer:
      "Você pode explorar nosso catálogo online para salvar seus modelos favoritos e nos enviar via WhatsApp. Em nosso espaço físico em Araçatuba, realizamos uma consultoria de visagismo gratuita para testar o caimento, formato e medidas faciais.",
  },
  {
    question: "Posso fazer os exames de vista ou trazer minha receita?",
    answer:
      "Você pode trazer a receita do seu oftalmologista de confiança! Orientamos sobre os melhores tratamentos para o seu grau e realizamos a conferência e medição da distância nasopupilar (DNP) com equipamento digital.",
  },
  {
    question: "Quais são os prazos médios de confecção e montagem das lentes?",
    answer:
      "Lentes de visão simples em estoque contam com montagem expressa em até 1 hora em nosso laboratório próprio computadorizado na facetadora. Lentes multifocais personalizadas, dioptrias altas ou tratamentos especiais sob medida levam de 2 a 5 dias úteis com calibração minuciosa.",
  },
  {
    question: "Como funciona a garantia e os ajustes pós-venda?",
    answer:
      "Todas as nossas armações e tratamentos de lentes contam com garantia de fábrica contra defeitos. Além disso, você tem ajustes, alinhamentos e higienização ultrassônica gratuitos durante toda a vida útil dos seus óculos.",
  },
];
