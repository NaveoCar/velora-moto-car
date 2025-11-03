import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "¿Es gratis publicar mi vehículo?",
      answer: "Sí, publicar tu vehículo en Naveo es completamente gratis. No cobramos comisiones ni tarifas ocultas. Puedes publicar tantos vehículos como desees sin ningún costo.",
    },
    {
      question: "¿Cómo puedo verificar la identidad de un vendedor?",
      answer: "Todos los vendedores en Naveo pasan por un proceso de verificación. Puedes ver su perfil verificado, calificaciones de otros usuarios y su historial de ventas. Además, te recomendamos siempre reunirte en persona y verificar la documentación del vehículo antes de realizar cualquier transacción.",
    },
    {
      question: "¿Cuánto tiempo tarda en publicarse mi anuncio?",
      answer: "Tu anuncio se publica inmediatamente después de completar el formulario. En menos de 5 minutos tu vehículo estará visible para miles de compradores potenciales en toda Colombia.",
    },
    {
      question: "¿Puedo editar mi anuncio después de publicarlo?",
      answer: "Sí, puedes editar tu anuncio en cualquier momento desde tu panel de usuario. Puedes actualizar el precio, agregar más fotos, modificar la descripción o cualquier otro detalle.",
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Naveo es una plataforma de conexión entre compradores y vendedores. El método de pago se acuerda directamente entre las partes. Recomendamos usar métodos seguros como transferencias bancarias o pagos en entidades financieras.",
    },
    {
      question: "¿Cómo me contactan los compradores interesados?",
      answer: "Los compradores pueden contactarte a través de WhatsApp, llamada telefónica o correo electrónico usando la información que proporcionaste en tu anuncio. Recibirás notificaciones cuando alguien muestre interés en tu vehículo.",
    },
    {
      question: "¿Puedo vender motos además de carros?",
      answer: "¡Por supuesto! En Naveo puedes publicar todo tipo de vehículos: carros, motos, camionetas, SUVs y más. Nuestra plataforma está diseñada para todo tipo de vehículos.",
    },
    {
      question: "¿Qué debo hacer si encuentro un anuncio sospechoso?",
      answer: "Si encuentras un anuncio que consideras fraudulento o sospechoso, puedes reportarlo directamente desde la página del vehículo. Nuestro equipo lo revisará inmediatamente y tomará las medidas necesarias.",
    },
    {
      question: "¿Ofrecen garantía en los vehículos?",
      answer: "Naveo es una plataforma de conexión. Las garantías son responsabilidad del vendedor. Te recomendamos siempre solicitar una inspección mecánica profesional antes de comprar y verificar si el vendedor ofrece algún tipo de garantía.",
    },
    {
      question: "¿Puedo publicar vehículos de otras ciudades?",
      answer: "Sí, puedes publicar vehículos ubicados en cualquier ciudad de Colombia. Solo asegúrate de especificar correctamente la ubicación en tu anuncio para que los compradores sepan dónde se encuentra el vehículo.",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Encuentra respuestas a las preguntas más comunes sobre Naveo
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-background border border-border rounded-lg px-6"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold text-foreground">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            ¿No encuentras la respuesta que buscas?
          </p>
          <a
            href="#naveo-care"
            className="text-primary hover:underline font-medium"
          >
            Contacta con nuestro equipo de soporte
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;