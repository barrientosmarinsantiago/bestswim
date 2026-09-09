import type { Locale } from "@/i18n/config";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export type LegalPageContent = {
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
};

const legalPages: Record<Locale, Record<string, LegalPageContent>> = {
  es: {
    "politica-de-privacidad": {
      title: "Política de privacidad",
      description: "Cómo Best Swim recopila, utiliza y protege los datos personales de sus usuarios.",
      updatedAt: "Última actualización: 27 de mayo de 2026",
      sections: [
        {
          title: "Compromiso de privacidad",
          paragraphs: [
            "En Best Swim, respetamos tu privacidad y estamos comprometidos a proteger tus datos personales. Esta política de privacidad te informará sobre cómo cuidamos tus datos personales cuando visitas nuestro sitio web, independientemente de dónde lo visites, y te informará sobre tus derechos de privacidad y cómo la ley te protege."
          ]
        },
        {
          title: "1. Información importante y quiénes somos",
          paragraphs: [
            "Esta política de privacidad tiene como objetivo darte información sobre cómo Best Swim recopila y procesa tus datos personales a través del uso de este sitio web, incluidos los datos que puedas proporcionar a través de este sitio web cuando te registras en nuestro boletín, compras un producto o servicio o participas en una competición.",
            "Best Swim actúa como responsable del tratamiento de los datos personales recogidos a través del sitio web, formularios, registros de usuario, comunicaciones comerciales, servicios de entrenamiento, retos, eventos y operaciones de pago vinculadas a la plataforma."
          ]
        },
        {
          title: "2. Los datos que recopilamos sobre ti",
          paragraphs: [
            "Podemos recopilar, usar, almacenar y transferir diferentes tipos de datos personales sobre ti, que hemos agrupado de la siguiente manera:"
          ],
          items: [
            "Datos de Identidad: incluye nombre, apellido, nombre de usuario o identificador similar.",
            "Datos de Contacto: incluye dirección de facturación, dirección de entrega, dirección de correo electrónico y números de teléfono.",
            "Datos Técnicos: incluye la dirección del protocolo de Internet (IP), tus datos de inicio de sesión, el tipo y la versión del navegador, la configuración de la zona horaria y la ubicación, los tipos y versiones de los complementos del navegador, el sistema operativo y la plataforma, y otra tecnología en los dispositivos que utilizas para acceder a este sitio web.",
            "Datos de Cuenta y Suscripción: incluye estado de membresía, plan contratado, identificadores de cliente de proveedores de pago, historial de acceso al portal y preferencias de idioma.",
            "Datos de Entrenamiento y Participación: incluye objetivos deportivos, nivel, sesiones consultadas, retos seleccionados, interés en swim camps y comunicaciones relacionadas con la preparación."
          ]
        },
        {
          title: "3. Cómo se recopilan tus datos personales",
          paragraphs: ["Utilizamos diferentes métodos para recopilar datos de y sobre ti, que incluyen:"],
          items: [
            "Interacciones directas: puedes darnos tu Identidad y Datos de Contacto rellenando formularios o manteniendo correspondencia con nosotros por correo postal, teléfono, correo electrónico u otro medio.",
            "Tecnologías o interacciones automatizadas: a medida que interactúas con nuestro sitio web, podemos recopilar automáticamente Datos Técnicos sobre tu equipo, acciones de navegación y patrones. Recopilamos estos datos personales mediante el uso de cookies y otras tecnologías similares.",
            "Servicios de terceros: podemos recibir confirmaciones técnicas de proveedores necesarios para prestar el servicio, como autenticación, hosting, base de datos, pasarela de pago, mensajería transaccional o analítica si ha sido consentida."
          ]
        },
        {
          title: "4. Finalidades y bases legales",
          items: [
            "Gestionar tu cuenta, acceso al portal, sesiones y membresía: ejecución de contrato o medidas precontractuales.",
            "Procesar pagos, facturas, suscripciones y cancelaciones: ejecución de contrato y obligaciones legales aplicables.",
            "Responder solicitudes de contacto, interés en eventos o soporte: interés legítimo, consentimiento o medidas precontractuales según el caso.",
            "Enviar comunicaciones comerciales cuando proceda: consentimiento o interés legítimo conforme a la normativa aplicable.",
            "Mantener seguridad, prevención de fraude y trazabilidad técnica: interés legítimo y obligaciones legales.",
            "Usar cookies no esenciales de analítica, rendimiento, funcionalidad ampliada o marketing: consentimiento previo del usuario."
          ]
        },
        {
          title: "5. Conservación y destinatarios",
          paragraphs: [
            "Conservaremos tus datos durante el tiempo necesario para cumplir las finalidades descritas, mientras exista relación contractual o de usuario, durante los plazos exigidos por obligaciones legales y durante el tiempo necesario para atender posibles responsabilidades.",
            "Podemos compartir datos con proveedores que actúan como encargados del tratamiento o responsables independientes cuando sea necesario para prestar el servicio, por ejemplo hosting, base de datos, autenticación, pasarela de pagos, facturación, soporte técnico o herramientas de comunicación. Cuando corresponda, se aplicarán contratos, medidas de seguridad y garantías adecuadas."
          ]
        },
        {
          title: "6. Tus derechos legales",
          paragraphs: [
            "Bajo ciertas circunstancias, tienes derechos bajo las leyes de protección de datos en relación con tus datos personales. Estos incluyen el derecho a solicitar acceso, corrección, eliminación, restricción, transferencia, oponerse al procesamiento, a la portabilidad de los datos y, donde el fundamento legal del procesamiento es el consentimiento, a retirar el consentimiento.",
            "Si deseas ejercer alguno de los derechos establecidos anteriormente, por favor contáctanos a través de los canales publicados en el sitio web. También puedes presentar una reclamación ante la autoridad de control competente si consideras que el tratamiento no se ajusta a la normativa aplicable."
          ]
        },
        {
          title: "7. Seguridad",
          paragraphs: [
            "Best Swim aplica medidas técnicas y organizativas razonables para proteger los datos personales frente a pérdida, uso indebido, acceso no autorizado, divulgación, alteración o destrucción. El acceso a datos personales se limitará a quienes necesiten tratar esa información para prestar el servicio o cumplir obligaciones legales."
          ]
        }
      ]
    },
    "politica-de-cookies": {
      title: "Política de cookies",
      description: "Información sobre qué cookies utiliza Best Swim y cómo gestionar preferencias.",
      updatedAt: "Última actualización: 27 de mayo de 2026",
      sections: [
        {
          title: "¿Qué son las cookies?",
          paragraphs: [
            "Una cookie es un pequeño fichero de texto que un sitio web guarda en tu ordenador o dispositivo móvil cuando visitas el sitio. Permite que el sitio web recuerde tus acciones y preferencias, como inicio de sesión, idioma, tamaño de letra y otras preferencias de visualización, durante un período de tiempo, para que no tengas que volver a introducirlas cada vez que vuelvas al sitio o navegues de una página a otra."
          ]
        },
        {
          title: "¿Cómo utilizamos las cookies?",
          paragraphs: ["En Best Swim, utilizamos cookies para las siguientes finalidades:"],
          items: [
            "Cookies estrictamente necesarias: son esenciales para que puedas navegar por el sitio web y utilizar sus funciones. Sin estas cookies, los servicios que has solicitado no se pueden proporcionar.",
            "Cookies de rendimiento y analítica: recopilan información sobre cómo los visitantes usan un sitio web, por ejemplo, qué páginas visitan más a menudo. Estas cookies no recopilan información que identifique a un visitante. Toda la información que recopilan estas cookies es agregada y, por lo tanto, anónima. Solo se utiliza para mejorar el funcionamiento de un sitio web.",
            "Cookies de funcionalidad y marketing: permiten que el sitio web recuerde las elecciones que haces, como tu nombre de usuario, idioma o la región en la que te encuentras, y proporcionan características mejoradas y más personales. También se pueden utilizar para proporcionar servicios que has solicitado, como ver un video o comentar en un blog."
          ]
        },
        {
          title: "Base legal y consentimiento",
          paragraphs: [
            "Las cookies estrictamente necesarias se utilizan para prestar el servicio solicitado y mantener la seguridad de la web. Las cookies no esenciales, como analítica, rendimiento, funcionalidad ampliada o marketing, solo se activarán cuando hayas dado tu consentimiento.",
            "Puedes aceptar todas las cookies, rechazar las no esenciales o configurar tus preferencias por finalidad desde el centro de preferencias."
          ]
        },
        {
          title: "Gestión de tus preferencias de cookies",
          paragraphs: [
            "Puedes gestionar tus preferencias de cookies en cualquier momento. La mayoría de los navegadores web permiten cierto control de la mayoría de las cookies a través de la configuración del navegador.",
            "Para ofrecerte un control más granular, hemos implementado un centro de preferencias de cookies en nuestro sitio. Puedes acceder a él en cualquier momento para cambiar o retirar tu consentimiento.",
            "Ten en cuenta que si eliges bloquear las cookies, esto puede afectar o impedir el correcto funcionamiento del sitio web."
          ]
        },
        {
          title: "Conservación de la preferencia",
          paragraphs: [
            "Guardamos tu selección de preferencias para no solicitarte consentimiento en cada visita. Si cambia la política, se añaden nuevas finalidades o expira el periodo de validez configurado, podremos solicitar de nuevo tu elección."
          ]
        }
      ]
    }
  },
  en: {
    "politica-de-privacidad": {
      title: "Privacy policy",
      description: "How Best Swim collects, uses and protects personal data.",
      updatedAt: "Last updated: May 27, 2026",
      sections: [
        {
          title: "Privacy commitment",
          paragraphs: [
            "At Best Swim, we respect your privacy and are committed to protecting your personal data. This privacy policy explains how we look after your personal data when you visit our website and informs you about your privacy rights and how the law protects you."
          ]
        },
        {
          title: "1. Important information and who we are",
          paragraphs: [
            "This policy explains how Best Swim collects and processes personal data through this website, including data you may provide when registering, buying a product or service, subscribing to communications or taking part in a competition.",
            "Best Swim acts as controller for personal data collected through the website, user accounts, contact forms, training services, challenges, events and payment operations linked to the platform."
          ]
        },
        {
          title: "2. Data we collect about you",
          items: [
            "Identity data: name, surname, username or similar identifier.",
            "Contact data: billing address, delivery address, email address and phone numbers.",
            "Technical data: IP address, login data, browser type and version, time zone and location, plug-in types and versions, operating system, platform and device technology.",
            "Account and subscription data: membership status, selected plan, payment-provider customer identifiers, portal access history and language preferences.",
            "Training and participation data: sports goals, level, viewed sessions, selected challenges, swim camp interest and related preparation communications."
          ]
        },
        {
          title: "3. How your personal data is collected",
          items: [
            "Direct interactions: forms, correspondence, email, phone or other communications.",
            "Automated technologies: technical data collected through cookies and similar technologies as you interact with the site.",
            "Third-party services: authentication, hosting, database, payment, transactional email or analytics providers where needed and permitted."
          ]
        },
        {
          title: "4. Purposes and legal bases",
          items: [
            "Managing accounts, portal access, sessions and membership: contract or pre-contractual steps.",
            "Processing payments, invoices, subscriptions and cancellations: contract and legal obligations.",
            "Responding to contact, event interest or support requests: legitimate interest, consent or pre-contractual steps depending on the case.",
            "Sending commercial communications where applicable: consent or legitimate interest under applicable rules.",
            "Maintaining security, fraud prevention and technical traceability: legitimate interest and legal obligations.",
            "Using non-essential analytics, performance, enhanced functionality or marketing cookies: prior consent."
          ]
        },
        {
          title: "5. Retention and recipients",
          paragraphs: [
            "We retain personal data for as long as necessary for the purposes described, while a user or contractual relationship exists, for applicable legal periods and where needed to handle liabilities.",
            "We may share data with providers acting as processors or independent controllers where necessary to provide the service, such as hosting, database, authentication, payment, billing, technical support or communication tools."
          ]
        },
        {
          title: "6. Your legal rights",
          paragraphs: [
            "Under certain circumstances, you have rights under data protection laws in relation to your personal data, including access, rectification, erasure, restriction, portability, objection and withdrawal of consent where processing is based on consent.",
            "To exercise these rights, please contact us through the channels published on this website. You may also lodge a complaint with the competent supervisory authority."
          ]
        },
        {
          title: "7. Security",
          paragraphs: [
            "Best Swim applies reasonable technical and organisational measures to protect personal data against loss, misuse, unauthorised access, disclosure, alteration or destruction."
          ]
        }
      ]
    },
    "politica-de-cookies": {
      title: "Cookie policy",
      description: "Information about the cookies Best Swim uses and how to manage preferences.",
      updatedAt: "Last updated: May 27, 2026",
      sections: [
        {
          title: "What are cookies?",
          paragraphs: [
            "A cookie is a small text file that a website stores on your computer or mobile device when you visit it. It allows the site to remember your actions and preferences, such as login, language and display preferences, for a period of time."
          ]
        },
        {
          title: "How do we use cookies?",
          items: [
            "Strictly necessary cookies: essential to browse the website and use its features.",
            "Performance and analytics cookies: collect aggregated information about how visitors use the website to improve its operation.",
            "Functionality and marketing cookies: remember choices and may provide enhanced, more personal features or requested services."
          ]
        },
        {
          title: "Legal basis and consent",
          paragraphs: [
            "Strictly necessary cookies are used to provide requested services and keep the site secure. Non-essential cookies, including analytics, performance, enhanced functionality or marketing cookies, are activated only when you consent.",
            "You can accept all cookies, reject non-essential cookies or configure preferences by purpose from the preference center."
          ]
        },
        {
          title: "Managing your cookie preferences",
          paragraphs: [
            "You can manage your cookie preferences at any time. Most web browsers also allow some control of cookies through browser settings.",
            "For more granular control, we have implemented a cookie preference center on this site. You can access it at any time to change or withdraw consent.",
            "Please note that blocking cookies may affect or prevent the correct operation of the website."
          ]
        },
        {
          title: "Preference retention",
          paragraphs: [
            "We keep your preference so we do not ask for consent on every visit. If the policy changes, new purposes are added or the configured validity period expires, we may request your choice again."
          ]
        }
      ]
    }
  },
  pt: {
    "politica-de-privacidad": {
      title: "Política de privacidade",
      description: "Como a Best Swim recolhe, utiliza e protege dados pessoais.",
      updatedAt: "Última atualização: 27 de maio de 2026",
      sections: [
        {
          title: "Compromisso de privacidade",
          paragraphs: [
            "Na Best Swim, respeitamos a sua privacidade e estamos comprometidos em proteger os seus dados pessoais. Esta política de privacidade explica como cuidamos dos seus dados pessoais quando visita o nosso site e informa sobre os seus direitos de privacidade e como a lei o protege."
          ]
        },
        {
          title: "1. Informação importante e quem somos",
          paragraphs: [
            "Esta política tem como objetivo dar informação sobre como a Best Swim recolhe e trata os seus dados pessoais através deste site, incluindo os dados que possa fornecer ao registrar-se, comprar um produto ou serviço, subscrever comunicações ou participar numa competição.",
            "A Best Swim atua como responsável pelo tratamento dos dados pessoais recolhidos através do site, contas de usuário, formulários, serviços de treino, desafios, eventos e operações de pagamento ligadas à plataforma."
          ]
        },
        {
          title: "2. Dados que recolhemos sobre si",
          items: [
            "Dados de identidade: nome, apelido, nome de usuário ou identificador semelhante.",
            "Dados de contato: endereço de faturação, endereço de entrega, email e números de telefone.",
            "Dados técnicos: endereço IP, dados de início de sessão, tipo e versão do navegador, zona horária, localização, sistema operativo, plataforma e tecnologia do dispositivo.",
            "Dados de conta e assinatura: estado da assinatura, plano contratado, identificadores de cliente do provedor de pagamento, histórico de acesso ao portal e preferências de idioma.",
            "Dados de treino e participação: objetivos esportivos, nível, sessões consultadas, desafios selecionados, interesse em swim camps e comunicações relacionadas."
          ]
        },
        {
          title: "3. Como recolhemos os seus dados",
          items: [
            "Interações diretas: formulários, correspondência, email, telefone ou outros canais de comunicação.",
            "Tecnologias automatizadas: dados técnicos recolhidos por cookies e tecnologias semelhantes enquanto interage com o site.",
            "Serviços de terceiros: autenticação, alojamento, base de dados, pagamento, email transacional ou analítica quando necessário e permitido."
          ]
        },
        {
          title: "4. Finalidades e bases legais",
          items: [
            "Gerenciar contas, acesso ao portal, sessões e assinatura: contrato ou medidas pré-contratuais.",
            "Processar pagamentos, faturas, assinaturas e cancelamentos: contrato e obrigações legais.",
            "Responder a contatos, interesse em eventos ou suporte: interesse legítimo, consentimento ou medidas pré-contratuais conforme o caso.",
            "Enviar comunicações comerciais quando aplicável: consentimento ou interesse legítimo segundo a legislação aplicável.",
            "Manter segurança, prevenção de fraude e rastreabilidade técnica: interesse legítimo e obrigações legais.",
            "Usar cookies não essenciais de analítica, desempenho, funcionalidade ampliada ou marketing: consentimento prévio."
          ]
        },
        {
          title: "5. Conservação e destinatários",
          paragraphs: [
            "Conservamos os dados pessoais pelo tempo necessário para cumprir as finalidades descritas, enquanto existir relação de usuário ou contratual, durante os prazos legais aplicáveis e quando necessário para responder a responsabilidades.",
            "Podemos compartilhar dados com provedores que atuem como subcontratantes ou responsáveis independentes quando seja necessário para prestar o serviço, como alojamento, base de dados, autenticação, pagamentos, faturação, suporte técnico ou ferramentas de comunicação."
          ]
        },
        {
          title: "6. Os seus direitos legais",
          paragraphs: [
            "Em determinadas circunstâncias, tem direitos em matéria de proteção de dados, incluindo acesso, retificação, eliminação, limitação, portabilidade, oposição e retirada do consentimento quando o tratamento se baseia no consentimento.",
            "Para exercer estes direitos, contate-nos através dos canais publicados neste site. Também pode apresentar reclamação perante a autoridade de controlo competente."
          ]
        },
        {
          title: "7. Segurança",
          paragraphs: [
            "A Best Swim aplica medidas técnicas e organizativas razoáveis para proteger dados pessoais contra perda, uso indevido, acesso não autorizado, divulgação, alteração ou destruição."
          ]
        }
      ]
    },
    "politica-de-cookies": {
      title: "Política de cookies",
      description: "Informação sobre os cookies que a Best Swim utiliza e como gerir preferências.",
      updatedAt: "Última atualização: 27 de maio de 2026",
      sections: [
        {
          title: "O que são cookies?",
          paragraphs: [
            "Um cookie é um pequeno ficheiro de texto que um site guarda no seu computador ou dispositivo móvel quando o visita. Permite que o site recorde as suas ações e preferências, como início de sessão, idioma e preferências de visualização, durante um período de tempo."
          ]
        },
        {
          title: "Como utilizamos cookies?",
          items: [
            "Cookies estritamente necessários: essenciais para navegar no site e utilizar as suas funções.",
            "Cookies de desempenho e analítica: recolhem informação agregada sobre como os visitantes usam o site para melhorar o seu funcionamento.",
            "Cookies de funcionalidade e marketing: recordam escolhas e podem fornecer funcionalidades melhoradas, conteúdo personalizado ou medição de campanhas."
          ]
        },
        {
          title: "Base legal e consentimento",
          paragraphs: [
            "Os cookies estritamente necessários são utilizados para prestar os serviços solicitados e manter o site seguro. Cookies não essenciais, incluindo analítica, desempenho, funcionalidade ampliada ou marketing, só são ativados com o seu consentimento.",
            "Pode aceitar todos os cookies, rejeitar os não essenciais ou configurar preferências por finalidade no centro de preferências."
          ]
        },
        {
          title: "Gestão das preferências de cookies",
          paragraphs: [
            "Pode gerir as suas preferências de cookies a qualquer momento. A maioria dos navegadores também permite algum controlo de cookies através das configurações.",
            "Para oferecer controlo mais granular, implementámos um centro de preferências de cookies neste site. Pode acessá-lo a qualquer momento para alterar ou retirar o consentimento.",
            "Tenha em conta que bloquear cookies pode afetar ou impedir o correto funcionamento do site."
          ]
        },
        {
          title: "Conservação da preferência",
          paragraphs: [
            "Guardamos a sua preferência para não solicitar consentimento em cada visita. Se a política mudar, forem adicionadas novas finalidades ou expirar o período configurado, poderemos pedir novamente a sua escolha."
          ]
        }
      ]
    }
  }
};

export function getLegalPage(slug: string, locale: Locale) {
  return legalPages[locale][slug];
}
