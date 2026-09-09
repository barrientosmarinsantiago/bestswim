import rawContent from "./imported-content.json";
import type { ContentBlock, ImportedChallenge, ImportedDocument, ImportedSection } from "./types";
import type { Locale } from "@/i18n/config";

type ImportedContent = {
  natacionSections: ImportedSection[];
  challenges: ImportedChallenge[];
  extraChallengeDocuments: ImportedDocument[];
  watermark: string;
};

export const importedContent = rawContent as ImportedContent;
export const natacionSections = importedContent.natacionSections;
export const importedChallenges = importedContent.challenges;
export const extraChallengeDocuments = importedContent.extraChallengeDocuments;

// Los desafíos por nivel viven todos en `challenges`; ya no hay páginas extra sueltas.
export const extraChallengePages: ImportedChallenge[] = [];
export const watermarkSrc = "/import-assets/watermark/Logov1-transparent.png";

const hrefAliases: Record<string, string> = {
  "/natacion/aguas-abiertas-triatlon": "/natacion/aguas-abiertas-y-triatlon"
};

type TranslationRule = [RegExp, string];

function rule(from: string, to: string): TranslationRule {
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const startsAsWord = /^[\p{L}]/u.test(from);
  const endsAsWord = /[\p{L}]$/u.test(from);
  const prefix = startsAsWord ? "(?<![\\p{L}])" : "";
  const suffix = endsAsWord ? "(?![\\p{L}])" : "";

  return [new RegExp(`${prefix}${escaped}${suffix}`, "gu"), to];
}

const englishRules: TranslationRule[] = [
  rule("Aguas abiertas y triatlón", "Open water and triathlon"),
  rule("Bases del entrenamiento", "Training foundations"),
  rule("Entrenamiento", "Training"),
  rule("Oposiciones", "Public-service tests"),
  rule("Preparación Triatlón Olímpico", "Olympic triathlon preparation"),
  rule("Preparación Ironman 70.3", "Ironman 70.3 preparation"),
  rule("Preparación Ironman", "Ironman preparation"),
  rule("Preparación del", "Preparation for"),
  rule("ZONAS DE ENTRENAMIENTO", "TRAINING ZONES"),
  rule("GLOSARIO BÁSICO NATACIÓN", "BASIC SWIMMING GLOSSARY"),
  rule("GLOSARIO BASICO  PARA ENTRENAMIENTO", "BASIC TRAINING GLOSSARY"),
  rule("SESIONES ZONAS DE ENTRENAMIENTO NIVEL INTERMEDIO - AVANZADO", "INTERMEDIATE - ADVANCED TRAINING-ZONE SESSIONS"),
  rule("TEST DE REDIMIENTO EN PISCINA", "POOL PERFORMANCE TESTS"),
  rule("TEST DE RENDIMIENTO EN PISCINA", "POOL PERFORMANCE TEST"),
  rule("OPOSICIÓN BOMBEROS", "FIREFIGHTER PUBLIC-SERVICE TEST"),
  rule("PREPARACIÓN 100m CROL", "100 m FREESTYLE PREPARATION"),
  rule("VELOCIDAD DE REACCIÓN GENERAL", "GENERAL REACTION SPEED"),
  rule("TODAS LAS ZONA DE ENTRENAMIENTO", "ALL TRAINING ZONES"),
  rule("TODAS LAS ZONAS DE ENTRENAMIENTO", "ALL TRAINING ZONES"),
  rule("Zona de entrenamiento", "Training zone"),
  rule("Zonas de entrenamiento", "Training zones"),
  rule("zonas de entrenamiento", "training zones"),
  rule("zona de entrenamiento", "training zone"),
  rule("Volumen total sesión", "Total session volume"),
  rule("Total volumen sesión", "Total session volume"),
  rule("Total volumen", "Total volume"),
  rule("volumen total", "total volume"),
  rule("volumen", "volume"),
  rule("Descripción", "Description"),
  rule("Objetivo", "Objective"),
  rule("objetivo", "objective"),
  rule("Tienes que estar físicamente y mentalmente preparado para realizar las 8 sesiones de los que consta este entrenamiento.", "You need to be physically and mentally prepared to complete the 8 sessions in this plan."),
  rule("Tienes que estar físicamente y mentalmente preparado para realizar las 12 sesiones de los que consta este entrenamiento.", "You need to be physically and mentally prepared to complete the 12 sessions in this plan."),
  rule("Tienes que estar físicamente y mentalmente preparado para realizar 7km en sesiones de 1km cada una.", "You need to be physically and mentally prepared to complete 7 km in 1 km sessions."),
  rule("Tienes que estar físicamente y mentalmente preparado para realizar 14km en sesiones de 2km cada una.", "You need to be physically and mentally prepared to complete 14 km in 2 km sessions."),
  rule("Tienes que estar físicamente y mentalmente preparado para realizar 21km en sesiones de 3km cada una.", "You need to be physically and mentally prepared to complete 21 km in 3 km sessions."),
  rule("Las sesiones de entrenamiento en su parte principal de desarrollo son en zona de AEI (VO2max) y algunas en Zona 4 (anaeróbico láctico).", "The main sets are performed in the AEI zone (VO2max), with some work in Zone 4 (lactic anaerobic)."),
  rule("Las sesiones de entrenamiento en su parte principal de desarrollo son en Zona 3 AEI (VO2max) y algunas en Zona 4 (anaeróbico láctico).", "The main sets are performed in Zone 3 AEI (VO2max), with some work in Zone 4 (lactic anaerobic)."),
  rule("Es importante mantener la técnica correcta durante todo el entrenamiento, un patrón de respiración establecido y batido de 6 tiempos.", "It is important to maintain correct technique throughout the session, a consistent breathing pattern and a six-beat kick."),
  rule("Es importante mantener la técnica correcta durante todo el entrenamiento, un patrón de respiración establecido y batido de 6 tiempos en las series más exigentes.", "It is important to maintain correct technique throughout the session, a consistent breathing pattern and a six-beat kick in the most demanding sets."),
  rule("Es importante mantener la técnica correcta durante todo el entrenamiento, un patrón de respiración establecido y batido de 6 tiempos en las series de mayor exigencia simulando situación de competición.", "It is important to maintain correct technique throughout the session, a consistent breathing pattern and a six-beat kick in the most demanding race-simulation sets."),
  rule("Es importante mantener la técnica correcta durante todo el entrenamiento.", "It is important to maintain correct technique throughout the session."),
  rule("El objetivo final es acabar con repeticiones de 16x100m a ritmo de competición.", "The final objective is to finish with 16x100 m repetitions at race pace."),
  rule("El objetivo final es acabar con un 38x100m a ritmo de competición", "The final objective is to finish with a 38x100 m block at race pace"),
  rule("El objetivo final es acabar con repeticiones de 20x100m a ritmo de competición", "The final objective is to finish with 20x100 m repetitions at race pace"),
  rule("Puedes organizarte como quieras e introducir un día de descanso entre medias para recuperarte u otro tipo de sesiones de técnica y aprendizaje.", "You can organise it as you prefer and add a rest day between sessions to recover, or include technique and learning sessions."),
  rule("Puedes organizarte como quieras e introducir un día de descanso entre medias para recuperarte o incluir sesiones de técnica y recuperación.", "You can organise it as you prefer and add a rest day between sessions to recover, or include technique and recovery sessions."),
  rule("Puedes organizarte como quieras e introducir un día de descanso entre medias para recuperarte u otro tipo de sesiones de entrenamiento.", "You can organise it as you prefer and add a rest day between sessions to recover, or include other training sessions."),
  rule("Preparar al deportista para la actividad principal de la sesión", "Prepare the athlete for the main activity of the session"),
  rule("Recuperar al organismo entre estímulos", "Allow the body to recover between stimuli"),
  rule("Aumentar la eficiencia aeróbica", "Increase aerobic efficiency"),
  rule("Umbral aeróbico", "Aerobic threshold"),
  rule("Umbral anaeróbico", "Anaerobic threshold"),
  rule("Aumentar la capacidad de soportar esfuerzos aeróbicos prolongados", "Increase the ability to sustain prolonged aerobic efforts"),
  rule("Sistema Buffer", "Buffer system"),
  rule("Warm-Up (Calentamiento)", "Warm-up"),
  rule("Un período de natación en el que te aclimatas y calientas tus músculos para nadar más rápido, lo cual es importante para prevenir lesiones.", "A swimming period where you acclimatise and warm up your muscles so you can swim faster, which is important for injury prevention."),
  rule("Durante el calentamiento, generalmente deberías experimentar un aumento en la frecuencia cardíaca y la respiración.", "During the warm-up, you should generally experience an increase in heart rate and breathing."),
  rule("Es la parte de la sesión donde se realizan los ejercicios y actividades específicas diseñadas para cumplir con el objetivo fundamental", "This is the part of the session where the specific exercises and activities designed to meet the main objective are performed"),
  rule("En esta parte del entrenamiento es donde se trabaja la mayor carga de trabajo e intensidad de toda la sesión.", "This part of the training contains the highest workload and intensity of the entire session."),
  rule("¡¡Plan de entrenamiento para realizar 100m crol entre 1:00 y 1:15/100m!!", "Training plan to swim 100 m freestyle between 1:00 and 1:15 per 100 m."),
  rule("Protocolo examen", "Test protocol"),
  rule("Movilidad articular", "Joint mobility"),
  rule("Calentamiento gomas", "Resistance-band warm-up"),
  rule("Visualizar la prueba de 100m", "Visualise the 100 m test"),
  rule("Preparación mental", "Mental preparation"),
  rule("Comienza realizando la Opción A de menos volumen y ves progresando en diferentes semanas.", "Start with the lower-volume Option A and progress over several weeks."),
  rule("Comienza realizando la Opción A de menos volume y ves progresando en diferentes semanas.", "Start with the lower-volume Option A and progress over several weeks."),
  rule("La toma de tiempos junto con las pulsaciones es importante para conocer en la zona de entrenamiento donde se encuentra el nadador/a.", "Recording times together with heart rate is important to identify the swimmer's current training zone."),
  rule("Comprueba pulsaciones para ver la zona de entrenamiento", "Check your heart rate to confirm the training zone"),
  rule("Si estamos utilizando neopreno nuestro ritmo por cada 100m tiene que 5+6 segundos más rápido", "If you are using a wetsuit, your pace per 100 m should be 5-6 seconds faster"),
  rule("Repeticiones pares intentar nadar con avistamiento de aguas abiertas/triatlón simulando situación de carrera.", "On even repetitions, try to swim with open-water/triathlon sighting to simulate race conditions."),
  rule("La idea del realizar este test", "The purpose of this test"),
  rule("encontrar tu ritmo de braceo óptimo", "find your optimal stroke-rate rhythm"),
  rule("punto dulce", "sweet spot"),
  rule("cadencia de braceo", "stroke cadence"),
  rule("alta pero sostenible", "high but sustainable"),
  rule("escala de esfuerzo", "effort scale"),
  rule("Una vez realizado el test", "Once the test is completed"),
  rule("identificar mejor nuestra cadencia", "better identify our cadence"),
  rule("donde el nadador/a se encuentra cómodo", "where the swimmer feels comfortable"),
  rule("aplica la técnica correcta en su nado", "applies correct technique while swimming"),
  rule("trabajo en todas las zonas de entrenamiento", "work across all training zones"),
  rule("trabajo en todas las zones de entrenamiento", "work across all training zones"),
  rule("minutos antes de repetir el set", "minutes before repeating the set"),
  rule("SESIONES TRAINING ZONES NIVEL INTERMEDIO - AVANZADO", "INTERMEDIATE - ADVANCED TRAINING-ZONE SESSIONS"),
  rule("Comprueba pulsaciones para ver la training zone", "Check your heart rate to confirm the training zone"),
  rule("Comienza realizando la Option A de menos volume y ves progresando en diferentes semanas.", "Start with the lower-volume Option A and progress over several weeks."),
  rule("La toma de tiempos junto con las pulsaciones es importante para conocer en la training zone donde se encuentra el nadador/a.", "Recording times together with heart rate is important to identify the swimmer's current training zone."),
  rule("La toma de tiempos junto con las pulsaciones es importante para conocer en la training zone donde se encuentra", "Recording times together with heart rate is important to identify the current training zone"),
  rule("NADO FRACCIONADO", "BROKEN SWIM"),
  rule("Nado fraccionado", "Broken swim"),
  rule("nado fraccionado", "broken swim"),
  rule("Aletas", "Fins"),
  rule("RITMO", "PACE"),
  rule("Ritmo", "Pace"),
  rule("PACE MEDIO", "MODERATE PACE"),
  rule("PACE SUAVE", "EASY PACE"),
  rule("PACE INTENSO", "HIGH-INTENSITY PACE"),
  rule("Pace medio", "Moderate pace"),
  rule("Pace suave", "Easy pace"),
  rule("Pace intenso", "High-intensity pace"),
  rule("VELOCIDAD", "SPEED"),
  rule("Velocidad", "Speed"),
  rule("velocidad", "speed"),
  rule("otro día", "another day"),
  rule("parar el test", "stop the test"),
  rule("intentarlo", "try again"),
  rule("e try again", "and try again"),
  rule("a realizar", "to complete"),
  rule("en pared", "on the wall"),
  rule("en wall", "on the wall"),
  rule("cada", "every"),
  rule("veces", "times"),
  rule("doble del tiempo empleado en la serie", "double the time used in the set"),
  rule("igual que tiempo empleado en la serie", "same as the time used in the set"),
  rule("proporción", "ratio"),
  rule("recuperar", "recover"),
  rule("fácil", "easy"),
  rule("TOLERANCIA", "TOLERANCE"),
  rule("LACTICA", "LACTIC"),
  rule("FUERZA", "STRENGTH"),
  rule("RESISTENCIA", "ENDURANCE"),
  rule("ESCALERA", "LADDER"),
  rule("CAMBIOS DE RITMO", "PACE CHANGES"),
  rule("cambios de ritmo", "pace changes"),
  rule("VELOCIDA MÁXIMA", "MAXIMUM SPEED"),
  rule("TUBA", "SNORKEL"),
  rule("ritmo medio", "moderate pace"),
  rule("RITMO MEDIO", "MODERATE PACE"),
  rule("ritmo suave", "easy pace"),
  rule("RITMO SUAVE", "EASY PACE"),
  rule("ritmo intenso", "high-intensity pace"),
  rule("RITMO INTENSO", "HIGH-INTENSITY PACE"),
  rule("MUY SUAVE", "VERY EASY"),
  rule("Nado variado", "Mixed swim"),
  rule("nado variado", "mixed swim"),
  rule("Nado suave", "Easy swim"),
  rule("Nado", "Swim"),
  rule("RETO TRIPLE CORONA EXTREMADURA", "EXTREMADURA TRIPLE CROWN CHALLENGE"),
  rule("RETO ALCATRAZ", "ALCATRAZ CHALLENGE"),
  rule("RETO 7KM", "7K CHALLENGE"),
  rule("RETO 14KM", "14K CHALLENGE"),
  rule("RETO 21KM", "21K CHALLENGE"),
  rule("SESIÓN", "SESSION"),
  rule("SESION", "SESSION"),
  rule("sesión", "session"),
  rule("Serie", "Set"),
  rule("serie", "set"),
  rule("sesiones", "sessions"),
  rule("entrenamiento", "training"),
  rule("preparación", "preparation"),
  rule("natación", "swimming"),
  rule("descanso", "rest"),
  rule("Descanso", "Rest"),
  rule("Nivel avanzado", "Advanced level"),
  rule("Nivel intermedio", "Intermediate level"),
  rule("Nivel principiante", "Beginner level"),
  rule("Volumen total", "Total volume"),
  rule("TOTAL", "TOTAL"),
  rule("Total", "Total"),
  rule("Introducción", "Introduction"),
  rule("Calentamiento", "Warm-up"),
  rule("calentamiento", "warm-up"),
  rule("TÉCNICA", "TECHNIQUE"),
  rule("Técnica", "Technique"),
  rule("técnica", "technique"),
  rule("nado crol", "freestyle swim"),
  rule("nado", "swim"),
  rule("crol", "freestyle"),
  rule("espalda", "backstroke"),
  rule("braza", "breaststroke"),
  rule("mariposa", "butterfly"),
  rule("piernas", "kick"),
  rule("pierna", "kick"),
  rule("aletas", "fins"),
  rule("tabla", "kickboard"),
  rule("palas", "paddles"),
  rule("tuba", "snorkel"),
  rule("remadas", "sculling"),
  rule("remada", "scull"),
  rule("buceo", "underwater"),
  rule("avistamiento", "sighting"),
  rule("ojos de cocodrilo", "crocodile eyes"),
  rule("aguas abiertas", "open water"),
  rule("nado suave", "easy swim"),
  rule("suave", "easy"),
  rule("fuerte", "hard"),
  rule("rápido", "fast"),
  rule("lento", "slow"),
  rule("medio", "moderate"),
  rule("progresivo", "progressive"),
  rule("brazadas", "strokes"),
  rule("Brazada", "Stroke"),
  rule("brazada", "stroke"),
  rule("respirar", "breathe"),
  rule("respiración", "breathing"),
  rule("bilateral", "bilateral"),
  rule("batido", "kick"),
  rule("posición", "position"),
  rule("alineación", "alignment"),
  rule("rotación", "rotation"),
  rule("agarre", "catch"),
  rule("recobro", "recovery"),
  rule("codo", "elbow"),
  rule("pared", "wall"),
  rule("virajes", "turns"),
  rule("volteos", "flip turns"),
  rule("descanso", "rest"),
  rule("segundos", "seconds"),
  rule("minutos", "minutes"),
  rule("metros", "meters"),
  rule("mismo tiempo de trabajo", "same work time"),
  rule("mismo tiempo de descanso", "same rest time"),
  rule("ritmo de competición", "race pace"),
  rule("ritmo de nado", "swim pace"),
  rule("ritmo", "pace"),
  rule("condición física", "fitness"),
  rule("objetivo final", "final goal"),
  rule("zona", "zone"),
  rule("zonas", "zones"),
  rule("Zona", "Zone"),
  rule("Zonas", "Zones"),
  rule("anaeróbico láctico", "lactic anaerobic"),
  rule("aeróbico ligero", "light aerobic"),
  rule("aeróbico medio", "medium aerobic"),
  rule("aeróbico suave", "easy aerobic"),
  rule("Aeróbico", "Aerobic"),
  rule("AEROBICO", "AEROBIC"),
  rule("aeróbico", "aerobic"),
  rule("Aerobic Suave", "Easy aerobic"),
  rule("Aerobic Ligero", "Light aerobic"),
  rule("Aerobic Medio", "Medium aerobic"),
  rule("Aerobic Intenso", "Intense aerobic"),
  rule("AEROBIC SUAVE", "EASY AEROBIC"),
  rule("AEROBIC LIGERO", "LIGHT AEROBIC"),
  rule("AEROBIC MEDIO", "MEDIUM AEROBIC"),
  rule("AEROBIC INTENSO", "INTENSE AEROBIC"),
  rule("anaeróbico", "anaerobic"),
  rule("LÁCTICO", "LACTIC"),
  rule("láctico", "lactic"),
  rule("Pulsaciones", "Heart rate"),
  rule("pulsaciones", "heart rate"),
  rule("frecuencia cardíaca", "heart rate"),
  rule("Frecuencia cardiaca", "Heart rate"),
  rule("FC máxima", "max HR"),
  rule("máxima", "maximum"),
  rule("máximo", "maximum"),
  rule("Escala Borg", "Borg scale"),
  rule("condiciones de umbral anaerobic", "anaerobic-threshold conditions"),
  rule("Mejorar de la oxidación del glucógeno y sus depósitos", "Improve glycogen oxidation and its stores"),
  rule("mediante la mejora de oxidación de grasas y el aumento de sus depósitos", "by improving fat oxidation and increasing fat stores"),
  rule("Según método de training utilizado", "Depending on the training method used"),
  rule("descansar, y estar listo para comenzar la siguiente serie", "rest and be ready to start the next set"),
  rule("Significa que tienes", "It means you have"),
  rule("entre every serie", "between each set"),
  rule("Nadar a la máxima speed", "Swim at maximum speed"),
  rule("en cualquier estilo", "in any stroke"),
  rule("La distancia que cubres with every stroke.", "The distance you cover with each stroke."),
  rule("Cuanto mayor sea tu distancia por stroke, más eficiente es tu technique.", "The greater your distance per stroke, the more efficient your technique is."),
  rule("Puedes", "You can"),
  rule("realizada después de la salida o de un viraje", "performed after the start or after a turn"),
  rule("Exactamente la misma serie que se realiza típicamente varias times a lo largo del año para medir el progreso del nadador.", "Exactly the same set, typically repeated several times throughout the year to measure swimmer progress."),
  rule("Tomar heart rate después de every", "Take heart rate after each"),
  rule("Tomar pulsaciones después de every", "Take heart rate after each"),
  rule("para ver que estas en", "to confirm you are in"),
  rule("Controlar heart rate y pace de swim", "Track heart rate and swim pace"),
  rule("Si no se puede mantener los tiempos y las heart rate se disparan es momento de stop the test and try again another day.", "If you cannot hold the target times and heart rate spikes, stop the test and try again another day."),
  rule("de cara a un final de competición", "for a race-finish scenario"),
  rule("Método sets distancias cortas", "Short-distance set method"),
  rule("toma heart rate", "take heart rate"),
  rule("Toma pulsaciones", "Take heart rate"),
  rule("toma pulsaciones", "take heart rate"),
  rule("Generar niveles altos de lactato", "Generate high lactate levels"),
  rule("Podemos hacer este bloque with neopreno", "This block can be done with a wetsuit"),
  rule("a feet de un compañero with más nivel", "drafting behind a higher-level partner"),
  rule("OPCIONAL NEOPRENO", "OPTIONAL WETSUIT"),
  rule("Opcional NEOPRENO", "Optional wetsuit"),
  rule("Descanso de", "Rest of"),
  rule("entre repetitions", "between repetitions"),
  rule("Salidas with distintas señales acústicas", "Starts with different acoustic signals"),
  rule("Salidas with distintas posiciones de salida", "Starts from different starting positions"),
  rule("Salidas desde flotación", "Floating starts"),
  rule("SPEED DE REACCIÓN ESPECÍFICA", "SPECIFIC REACTION SPEED"),
  rule("Salidas y turns variando distancias de deslizamiento", "Starts and turns with varied glide distances"),
  rule("Salidas y turns with número variable de patadas", "Starts and turns with a variable number of kicks"),
  rule("Trabajo de", "Work from"),
  rule("Distancias de", "Distances from"),
  rule("Volumen de", "Volume from"),
  rule("Entre", "Between"),
  rule("preferentemente activo", "preferably active"),
  rule("Características", "Characteristics"),
  rule("Volumen/ Ejemplo", "Volume / Example"),
  rule("Volumen serie superior distancia de la event", "Set volume greater than event distance"),
  rule("Volumen serie igual a la distancia de la event", "Set volume equal to event distance"),
  rule("Volumen serie inferior, igual o superior a la distancia de la event", "Set volume lower than, equal to or greater than event distance"),
  rule("Volumen set superior distancia de la event", "Set volume greater than event distance"),
  rule("Volumen set igual a la distancia de la event", "Set volume equal to event distance"),
  rule("Volumen set inferior, igual or superior a la distancia de la event", "Set volume lower than, equal to or greater than event distance"),
  rule("Volumen set superior distancia de la prueba", "Set volume greater than event distance"),
  rule("Volumen set igual a la distancia de la prueba", "Set volume equal to event distance"),
  rule("Volumen set inferior, igual o superior a la distancia de la prueba", "Set volume lower than, equal to or greater than event distance"),
  rule("Volumen depende", "Volume depends"),
  rule("MÉTODO PACE DE ENDURANCE", "ENDURANCE PACE METHOD"),
  rule("METHOD PACE DE ENDURANCE", "ENDURANCE PACE METHOD"),
  rule("MÉTODO REPETICIONES", "REPETITION METHOD"),
  rule("METHOD REPETICIONES", "REPETITION METHOD"),
  rule("umbral aerobic", "aerobic threshold"),
  rule("Importante realizar un buen warm-up previo de gomas and movilidad articular", "It is important to complete a good pre-session warm-up with bands and joint mobility"),
  rule("En every session vas to complete un total volume de", "In each session you will complete a total volume of"),
  rule("en sets de", "in sets of"),
  rule("MÉTODO", "METHOD"),
  rule("METODO", "METHOD"),
  rule("Tienes que estar físicamente y mentalmente preparado", "You need to be physically and mentally prepared"),
  rule("Para poder realizar este tipo de entrenamiento es necesario", "To complete this type of training it is necessary"),
  rule("Como consecuencia de este tipo de entrenamiento", "As a result of this type of training"),
  rule("Es importante mantener", "It is important to maintain"),
  rule("Puedes organizarte como quieras", "You can organize it as you prefer"),
  rule("día de descanso", "rest day"),
  rule("recuperarte", "recover"),
  rule("prueba de aguas abiertas", "open-water event"),
  rule("Prueba", "Test"),
  rule("triatlón", "triathlon"),
  rule("nadador/a", "swimmer"),
  rule("deportista", "athlete"),
  rule("prueba", "event"),
  rule("series", "sets"),
  rule("repeticiones", "repetitions"),
  rule("rondas", "rounds"),
  rule("opción", "option"),
  rule("Opción", "Option"),
  rule("y", "and"),
  rule("o", "or"),
  rule("u", "or"),
  rule("con", "with"),
  rule("sin", "without"),
  rule("de rest", "rest"),
  rule("neopreno", "wetsuit"),
  rule("Neopreno", "Wetsuit"),
  rule("SUAVE", "EASY"),
  rule("FUERTE", "HARD"),
  rule("aproximadamente", "approximately"),
  rule("practica", "practice"),
  rule("Podemos hacer este bloque with wetsuit", "This block can be done with a wetsuit"),
  rule("con más nivel", "with a higher level"),
  rule("a feet de un compañero", "drafting behind a partner"),
  rule("Si te cuesta una set tan larga puedes hacer", "If such a long set is difficult, you can do"),
  rule("al finalizar esta set larga", "at the end of this long set"),
  rule("with la mejor technique posible", "with the best possible technique"),
  rule("buen patrón de breathing", "a good breathing pattern"),
  rule("Salidas con distintas señales acústicas", "Starts with different acoustic signals"),
  rule("Salidas con distintas posiciones de salida", "Starts from different starting positions"),
  rule("Salidas desde", "Starts from"),
  rule("salidas", "starts"),
  rule("Salidas", "Starts"),
  rule("distintas", "different"),
  rule("señales", "signals"),
  rule("acústicas", "acoustic"),
  rule("Virajes", "Turns"),
  rule("virajes", "turns"),
  rule("batidos", "kicks"),
  rule("Llegadas", "Finishes"),
  rule("desde", "from"),
  rule("fuera", "outside"),
  rule("por debajo de tu maximum", "below your maximum"),
  rule("Importante realizar un buen warm-up previo de gomas y movilidad articular", "It is important to complete a good pre-session warm-up with bands and joint mobility"),
  rule("máximo", "maximum"),
  rule("mínimas", "minimum"),
  rule("buena", "good"),
  rule("correcta", "correct"),
  rule("cuerpo", "body"),
  rule("cabeza", "head"),
  rule("brazos", "arms"),
  rule("pies", "feet"),
  rule("patada", "kick")
];

const portugueseRules: TranslationRule[] = [
  rule("Aguas abiertas y triatlón", "Águas abertas e triatlo"),
  rule("Bases del entrenamiento", "Bases do treino"),
  rule("Entrenamiento", "Treino"),
  rule("Oposiciones", "Provas públicas"),
  rule("Preparación Triatlón Olímpico", "Preparação para triatlo olímpico"),
  rule("Preparación Ironman 70.3", "Preparação Ironman 70.3"),
  rule("Preparación Ironman", "Preparação Ironman"),
  rule("Preparación del", "Preparação de"),
  rule("ZONAS DE ENTRENAMIENTO", "ZONAS DE TREINO"),
  rule("GLOSARIO BÁSICO NATACIÓN", "GLOSSÁRIO BÁSICO DE NATAÇÃO"),
  rule("GLOSARIO BASICO  PARA ENTRENAMIENTO", "GLOSSÁRIO BÁSICO PARA TREINO"),
  rule("SESIONES ZONAS DE ENTRENAMIENTO NIVEL INTERMEDIO - AVANZADO", "SESSÕES DE ZONAS DE TREINO NÍVEL INTERMÉDIO - AVANÇADO"),
  rule("TEST DE REDIMIENTO EN PISCINA", "TESTES DE RENDIMENTO EM PISCINA"),
  rule("TEST DE RENDIMIENTO EN PISCINA", "TESTE DE RENDIMENTO EM PISCINA"),
  rule("OPOSICIÓN BOMBEROS", "PROVA PARA BOMBEIROS"),
  rule("PREPARACIÓN 100m CROL", "PREPARAÇÃO 100 m CRAWL"),
  rule("VELOCIDAD DE REACCIÓN GENERAL", "VELOCIDADE DE REAÇÃO GERAL"),
  rule("TODAS LAS ZONA DE ENTRENAMIENTO", "TODAS AS ZONAS DE TREINO"),
  rule("TODAS LAS ZONAS DE ENTRENAMIENTO", "TODAS AS ZONAS DE TREINO"),
  rule("Zona de entrenamiento", "Zona de treino"),
  rule("Zonas de entrenamiento", "Zonas de treino"),
  rule("zonas de entrenamiento", "zonas de treino"),
  rule("zona de entrenamiento", "zona de treino"),
  rule("Volumen total sesión", "Volume total da sessão"),
  rule("Total volumen sesión", "Volume total da sessão"),
  rule("Total volumen", "Volume total"),
  rule("volumen total", "volume total"),
  rule("volumen", "volume"),
  rule("Descripción", "Descrição"),
  rule("Objetivo", "Objetivo"),
  rule("objetivo", "objetivo"),
  rule("Tienes que estar físicamente y mentalmente preparado para realizar las 8 sesiones de los que consta este entrenamiento.", "É necessário estar física e mentalmente preparado para completar as 8 sessões deste plano."),
  rule("Tienes que estar físicamente y mentalmente preparado para realizar las 12 sesiones de los que consta este entrenamiento.", "É necessário estar física e mentalmente preparado para completar as 12 sessões deste plano."),
  rule("Tienes que estar físicamente y mentalmente preparado para realizar 7km en sesiones de 1km cada una.", "É necessário estar física e mentalmente preparado para completar 7 km em sessões de 1 km."),
  rule("Tienes que estar físicamente y mentalmente preparado para realizar 14km en sesiones de 2km cada una.", "É necessário estar física e mentalmente preparado para completar 14 km em sessões de 2 km."),
  rule("Tienes que estar físicamente y mentalmente preparado para realizar 21km en sesiones de 3km cada una.", "É necessário estar física e mentalmente preparado para completar 21 km em sessões de 3 km."),
  rule("Las sesiones de entrenamiento en su parte principal de desarrollo son en zona de AEI (VO2max) y algunas en Zona 4 (anaeróbico láctico).", "A parte principal destas sessões é realizada na zona AEI (VO2max), com algum trabalho na Zona 4 (anaeróbico lático)."),
  rule("Las sesiones de entrenamiento en su parte principal de desarrollo son en Zona 3 AEI (VO2max) y algunas en Zona 4 (anaeróbico láctico).", "A parte principal destas sessões é realizada na Zona 3 AEI (VO2max), com algum trabalho na Zona 4 (anaeróbico lático)."),
  rule("Es importante mantener la técnica correcta durante todo el entrenamiento, un patrón de respiración establecido y batido de 6 tiempos.", "É importante manter a técnica correta durante toda a sessão, um padrão de respiração consistente e pernada de seis tempos."),
  rule("Es importante mantener la técnica correcta durante todo el entrenamiento, un patrón de respiración establecido y batido de 6 tiempos en las series más exigentes.", "É importante manter a técnica correta durante toda a sessão, um padrão de respiração consistente e pernada de seis tempos nas séries mais exigentes."),
  rule("Es importante mantener la técnica correcta durante todo el entrenamiento, un patrón de respiración establecido y batido de 6 tiempos en las series de mayor exigencia simulando situación de competición.", "É importante manter a técnica correta durante toda a sessão, um padrão de respiração consistente e pernada de seis tempos nas séries mais exigentes que simulam competição."),
  rule("Es importante mantener la técnica correcta durante todo el entrenamiento.", "É importante manter a técnica correta durante toda a sessão."),
  rule("El objetivo final es acabar con repeticiones de 16x100m a ritmo de competición.", "O objetivo final é terminar com repetições de 16x100 m em ritmo de competição."),
  rule("El objetivo final es acabar con un 38x100m a ritmo de competición", "O objetivo final é terminar com um bloco de 38x100 m em ritmo de competição"),
  rule("El objetivo final es acabar con repeticiones de 20x100m a ritmo de competición", "O objetivo final é terminar com repetições de 20x100 m em ritmo de competição"),
  rule("Puedes organizarte como quieras e introducir un día de descanso entre medias para recuperarte u otro tipo de sesiones de técnica y aprendizaje.", "Pode organizar-se como preferir e incluir um dia de descanso entre sessões para recuperar, ou incluir sessões de técnica e aprendizagem."),
  rule("Puedes organizarte como quieras e introducir un día de descanso entre medias para recuperarte o incluir sesiones de técnica y recuperación.", "Pode organizar-se como preferir e incluir um dia de descanso entre sessões para recuperar, ou incluir sessões de técnica e recuperação."),
  rule("Puedes organizarte como quieras e introducir un día de descanso entre medias para recuperarte u otro tipo de sesiones de entrenamiento.", "Pode organizar-se como preferir e incluir um dia de descanso entre sessões para recuperar, ou incluir outras sessões de treino."),
  rule("Preparar al deportista para la actividad principal de la sesión", "Preparar o atleta para a atividade principal da sessão"),
  rule("Recuperar al organismo entre estímulos", "Permitir que o organismo recupere entre estímulos"),
  rule("Aumentar la eficiencia aeróbica", "Aumentar a eficiência aeróbica"),
  rule("Umbral aeróbico", "Limiar aeróbico"),
  rule("Umbral anaeróbico", "Limiar anaeróbico"),
  rule("Aumentar la capacidad de soportar esfuerzos aeróbicos prolongados", "Aumentar a capacidade de sustentar esforços aeróbicos prolongados"),
  rule("Sistema Buffer", "Sistema tampão"),
  rule("Warm-Up (Calentamiento)", "Aquecimento"),
  rule("Un período de natación en el que te aclimatas y calientas tus músculos para nadar más rápido, lo cual es importante para prevenir lesiones.", "Um período de natação em que se aclimata e aquece os músculos para nadar mais rápido, algo importante para prevenir lesões."),
  rule("Durante el calentamiento, generalmente deberías experimentar un aumento en la frecuencia cardíaca y la respiración.", "Durante o aquecimento, geralmente deve sentir um aumento da frequência cardíaca e da respiração."),
  rule("Es la parte de la sesión donde se realizan los ejercicios y actividades específicas diseñadas para cumplir con el objetivo fundamental", "É a parte da sessão em que se realizam os exercícios e atividades específicas pensadas para cumprir o objetivo principal"),
  rule("En esta parte del entrenamiento es donde se trabaja la mayor carga de trabajo e intensidad de toda la sesión.", "Esta parte do treino concentra a maior carga de trabalho e intensidade de toda a sessão."),
  rule("¡¡Plan de entrenamiento para realizar 100m crol entre 1:00 y 1:15/100m!!", "Plano de treino para nadar 100 m crawl entre 1:00 e 1:15 por 100 m."),
  rule("Protocolo examen", "Protocolo do teste"),
  rule("Movilidad articular", "Mobilidade articular"),
  rule("Calentamiento gomas", "Aquecimento com elásticos"),
  rule("Visualizar la prueba de 100m", "Visualizar o teste de 100 m"),
  rule("Preparación mental", "Preparação mental"),
  rule("Comienza realizando la Opción A de menos volumen y ves progresando en diferentes semanas.", "Comece pela Opção A, de menor volume, e progrida ao longo de várias semanas."),
  rule("Comienza realizando la Opción A de menos volume y ves progresando en diferentes semanas.", "Comece pela Opção A, de menor volume, e progrida ao longo de várias semanas."),
  rule("La toma de tiempos junto con las pulsaciones es importante para conocer en la zona de entrenamiento donde se encuentra el nadador/a.", "Registrar tempos juntamente com a frequência cardíaca é importante para identificar a zona de treino em que o nadador se encontra."),
  rule("Comprueba pulsaciones para ver la zona de entrenamiento", "Verifique a frequência cardíaca para confirmar a zona de treino"),
  rule("Si estamos utilizando neopreno nuestro ritmo por cada 100m tiene que 5+6 segundos más rápido", "Se estiver usando fato de neoprene, o ritmo por cada 100 m deve ser 5-6 segundos mais rápido"),
  rule("Repeticiones pares intentar nadar con avistamiento de aguas abiertas/triatlón simulando situación de carrera.", "Nas repetições pares, tente nadar com avistamento de águas abertas/triatlo para simular uma situação de prova."),
  rule("La idea del realizar este test", "O objetivo deste teste"),
  rule("encontrar tu ritmo de braceo óptimo", "encontrar o seu ritmo ótimo de braçada"),
  rule("punto dulce", "ponto ideal"),
  rule("cadencia de braceo", "cadência de braçada"),
  rule("alta pero sostenible", "alta mas sustentável"),
  rule("escala de esfuerzo", "escala de esforço"),
  rule("Una vez realizado el test", "Depois de realizar o teste"),
  rule("identificar mejor nuestra cadencia", "identificar melhor a nossa cadência"),
  rule("donde el nadador/a se encuentra cómodo", "onde o nadador se sente confortável"),
  rule("aplica la técnica correcta en su nado", "aplica a técnica correta no nado"),
  rule("trabajo en todas las zonas de entrenamiento", "trabalho em todas as zonas de treino"),
  rule("trabajo en todas las zones de entrenamiento", "trabalho em todas as zonas de treino"),
  rule("minutos antes de repetir el set", "minutos antes de repetir o set"),
  rule("SESIONES ZONAS DE TREINO NIVEL INTERMEDIO - AVANZADO", "SESSÕES DE ZONAS DE TREINO NÍVEL INTERMÉDIO - AVANÇADO"),
  rule("Verifique a frequência cardíaca para confirmar a zona de treino", "Verifique a frequência cardíaca para confirmar a zona de treino"),
  rule("Comienza realizando la Opção A de menos volume y ves progresando en diferentes semanas.", "Comece pela Opção A, de menor volume, e progrida ao longo de várias semanas."),
  rule("La toma de tiempos junto con las pulsaciones es importante para conocer en la zona de treino donde se encuentra el nadador/a.", "Registrar tempos juntamente com a frequência cardíaca é importante para identificar a zona de treino em que o nadador se encontra."),
  rule("La toma de tiempos junto con las pulsaciones es importante para conocer en la zona de treino donde se encuentra", "Registrar tempos juntamente com a frequência cardíaca é importante para identificar a zona de treino atual"),
  rule("NADO FRACCIONADO", "NADO FRACIONADO"),
  rule("Nado fraccionado", "Nado fracionado"),
  rule("nado fraccionado", "nado fracionado"),
  rule("Aletas", "Barbatanas"),
  rule("RITMO", "RITMO"),
  rule("Ritmo", "Ritmo"),
  rule("RITMO MEDIO", "RITMO MODERADO"),
  rule("RITMO SUAVE", "RITMO LEVE"),
  rule("RITMO INTENSO", "RITMO INTENSO"),
  rule("VELOCIDAD", "VELOCIDADE"),
  rule("Velocidad", "Velocidade"),
  rule("velocidad", "velocidade"),
  rule("otro día", "outro dia"),
  rule("parar el test", "parar o teste"),
  rule("intentarlo", "tentar novamente"),
  rule("e tentar novamente", "e tentar novamente"),
  rule("a realizar", "a realizar"),
  rule("en pared", "na parede"),
  rule("en wall", "na parede"),
  rule("cada", "cada"),
  rule("veces", "vezes"),
  rule("doble del tiempo empleado en la serie", "dobro do tempo usado na série"),
  rule("igual que tiempo empleado en la serie", "igual ao tempo usado na série"),
  rule("proporción", "proporção"),
  rule("recuperar", "recuperar"),
  rule("fácil", "leve"),
  rule("TOLERANCIA", "TOLERÂNCIA"),
  rule("LACTICA", "LÁCTICA"),
  rule("FUERZA", "FORÇA"),
  rule("RESISTENCIA", "RESISTÊNCIA"),
  rule("ESCALERA", "ESCADA"),
  rule("CAMBIOS DE RITMO", "MUDANÇAS DE RITMO"),
  rule("cambios de ritmo", "mudanças de ritmo"),
  rule("VELOCIDA MÁXIMA", "VELOCIDADE MÁXIMA"),
  rule("TUBA", "SNORKEL"),
  rule("ritmo medio", "ritmo moderado"),
  rule("RITMO MEDIO", "RITMO MODERADO"),
  rule("ritmo suave", "ritmo leve"),
  rule("RITMO SUAVE", "RITMO LEVE"),
  rule("ritmo intenso", "ritmo intenso"),
  rule("RITMO INTENSO", "RITMO INTENSO"),
  rule("MUY SUAVE", "MUITO LEVE"),
  rule("Nado variado", "Nado variado"),
  rule("nado variado", "nado variado"),
  rule("Nado suave", "Nado leve"),
  rule("Nado", "Nado"),
  rule("RETO TRIPLE CORONA EXTREMADURA", "DESAFIO TRÍPLICE COROA EXTREMADURA"),
  rule("RETO ALCATRAZ", "DESAFIO ALCATRAZ"),
  rule("RETO 7KM", "DESAFIO 7 KM"),
  rule("RETO 14KM", "DESAFIO 14 KM"),
  rule("RETO 21KM", "DESAFIO 21 KM"),
  rule("SESIÓN", "SESSÃO"),
  rule("SESION", "SESSÃO"),
  rule("sesión", "sessão"),
  rule("Serie", "Série"),
  rule("serie", "série"),
  rule("sesiones", "sessões"),
  rule("entrenamiento", "treino"),
  rule("preparación", "preparação"),
  rule("natación", "natação"),
  rule("descanso", "descanso"),
  rule("Nivel avanzado", "Nível avançado"),
  rule("Nivel intermedio", "Nível intermédio"),
  rule("Nivel principiante", "Nível principiante"),
  rule("Volumen total", "Volume total"),
  rule("Volumen", "Volume"),
  rule("Introducción", "Introdução"),
  rule("Calentamiento", "Aquecimento"),
  rule("calentamiento", "aquecimento"),
  rule("TÉCNICA", "TÉCNICA"),
  rule("Técnica", "Técnica"),
  rule("técnica", "técnica"),
  rule("nado crol", "nado crawl"),
  rule("nado", "nado"),
  rule("crol", "crawl"),
  rule("espalda", "costas"),
  rule("braza", "bruços"),
  rule("mariposa", "mariposa"),
  rule("piernas", "pernas"),
  rule("pierna", "perna"),
  rule("aletas", "barbatanas"),
  rule("tabla", "prancha"),
  rule("palas", "palmares"),
  rule("tuba", "snorkel"),
  rule("remadas", "remadas"),
  rule("remada", "remada"),
  rule("buceo", "submerso"),
  rule("avistamiento", "avistamento"),
  rule("ojos de cocodrilo", "olhos de crocodilo"),
  rule("aguas abiertas", "águas abertas"),
  rule("nado suave", "nado leve"),
  rule("suave", "leve"),
  rule("fuerte", "forte"),
  rule("rápido", "rápido"),
  rule("lento", "lento"),
  rule("medio", "moderado"),
  rule("progresivo", "progressivo"),
  rule("brazadas", "braçadas"),
  rule("brazada", "braçada"),
  rule("respirar", "respirar"),
  rule("respiración", "respiração"),
  rule("bilateral", "bilateral"),
  rule("batido", "batimento"),
  rule("posición", "posição"),
  rule("alineación", "alinhamento"),
  rule("rotación", "rotação"),
  rule("agarre", "agarre"),
  rule("recobro", "recuperação"),
  rule("codo", "cotovelo"),
  rule("pared", "parede"),
  rule("virajes", "viragens"),
  rule("volteos", "viragens"),
  rule("descanso", "descanso"),
  rule("segundos", "segundos"),
  rule("minutos", "minutos"),
  rule("metros", "metros"),
  rule("mismo tiempo de trabajo", "mesmo tempo de trabalho"),
  rule("mismo tiempo de descanso", "mesmo tempo de descanso"),
  rule("ritmo de competición", "ritmo de competição"),
  rule("ritmo de nado", "ritmo de nado"),
  rule("ritmo", "ritmo"),
  rule("condición física", "condição física"),
  rule("objetivo final", "objetivo final"),
  rule("zona", "zona"),
  rule("zonas", "zonas"),
  rule("Zona", "Zona"),
  rule("Zonas", "Zonas"),
  rule("anaeróbico láctico", "anaeróbico láctico"),
  rule("aeróbico ligero", "aeróbico leve"),
  rule("aeróbico medio", "aeróbico moderado"),
  rule("aeróbico suave", "aeróbico suave"),
  rule("Aeróbico", "Aeróbico"),
  rule("AEROBICO", "AERÓBICO"),
  rule("aeróbico", "aeróbico"),
  rule("Aeróbico Suave", "Aeróbico leve"),
  rule("Aeróbico Ligero", "Aeróbico leve"),
  rule("Aeróbico Medio", "Aeróbico moderado"),
  rule("Aeróbico Intenso", "Aeróbico intenso"),
  rule("AERÓBICO SUAVE", "AERÓBICO LEVE"),
  rule("AERÓBICO LIGERO", "AERÓBICO LEVE"),
  rule("AERÓBICO MEDIO", "AERÓBICO MODERADO"),
  rule("AERÓBICO INTENSO", "AERÓBICO INTENSO"),
  rule("anaeróbico", "anaeróbico"),
  rule("LÁCTICO", "LÁTICO"),
  rule("láctico", "lático"),
  rule("Pulsaciones", "Frequência cardíaca"),
  rule("pulsaciones", "frequência cardíaca"),
  rule("frecuencia cardíaca", "frequência cardíaca"),
  rule("Frecuencia cardiaca", "Frequência cardíaca"),
  rule("FC máxima", "FC máxima"),
  rule("máxima", "máxima"),
  rule("máximo", "máximo"),
  rule("Escala Borg", "Escala de Borg"),
  rule("condiciones de umbral anaeróbico", "condições de limiar anaeróbico"),
  rule("Mejorar de la oxidación del glucógeno y sus depósitos", "Melhorar a oxidação do glicogénio e os seus depósitos"),
  rule("mediante la mejora de oxidación de grasas y el aumento de sus depósitos", "através da melhoria da oxidação de gorduras e do aumento dos seus depósitos"),
  rule("Según método de treino utilizado", "Consoante o método de treino utilizado"),
  rule("descansar, y estar listo para comenzar la siguiente serie", "descansar e estar pronto para começar a série seguinte"),
  rule("Significa que tienes", "Significa que tem"),
  rule("entre cada serie", "entre cada série"),
  rule("Nadar a la máxima velocidade", "Nadar à velocidade máxima"),
  rule("en cualquier estilo", "em qualquer estilo"),
  rule("La distancia que cubres com cada braçada.", "A distância que cobre com cada braçada."),
  rule("Cuanto mayor sea tu distancia por braçada, más eficiente es tu técnica.", "Quanto maior for a distância por braçada, mais eficiente será a técnica."),
  rule("Puedes", "Pode"),
  rule("realizada después de la salida o de un viraje", "realizada depois da saída ou de uma viragem"),
  rule("Exactamente la misma serie que se realiza típicamente varias vezes a lo largo del año para medir el progreso del nadador.", "Exatamente a mesma série, normalmente repetida várias vezes ao longo do ano para medir a evolução do nadador."),
  rule("Tomar frequência cardíaca después de cada", "Medir a frequência cardíaca depois de cada"),
  rule("Tomar pulsaciones después de cada", "Medir a frequência cardíaca depois de cada"),
  rule("para ver que estas en", "para confirmar que está em"),
  rule("Controlar frequência cardíaca y ritmo de nado", "Controlar a frequência cardíaca e o ritmo de nado"),
  rule("Si no se puede mantener los tiempos y las frequência cardíaca se disparan es momento de parar o teste e tentar novamente outro dia.", "Se não conseguir manter os tempos e a frequência cardíaca disparar, pare o teste e tente novamente outro dia."),
  rule("de cara a un final de competición", "para simular um final de competição"),
  rule("Método séries distancias cortas", "Método de séries de distâncias curtas"),
  rule("toma frequência cardíaca", "meça a frequência cardíaca"),
  rule("Toma pulsaciones", "Meça a frequência cardíaca"),
  rule("toma pulsaciones", "meça a frequência cardíaca"),
  rule("Generar niveles altos de lactato", "Gerar níveis elevados de lactato"),
  rule("Podemos hacer este bloque com neopreno", "Este bloco pode ser feito com fato de neoprene"),
  rule("a pés de un compañero com más nível", "na esteira de um colega de nível superior"),
  rule("OPCIONAL NEOPRENO", "NEOPRENE OPCIONAL"),
  rule("Opcional NEOPRENO", "Neoprene opcional"),
  rule("Descanso de", "Descanso de"),
  rule("entre repetições", "entre repetições"),
  rule("Salidas com distintas señales acústicas", "Saídas com diferentes sinais acústicos"),
  rule("Salidas com distintas posiciones de salida", "Saídas a partir de diferentes posições"),
  rule("Salidas desde flotación", "Saídas em flutuação"),
  rule("VELOCIDADE DE REACCIÓN ESPECÍFICA", "VELOCIDADE DE REAÇÃO ESPECÍFICA"),
  rule("Salidas y viragens variando distancias de deslizamiento", "Saídas e viragens variando as distâncias de deslize"),
  rule("Salidas y viragens com número variable de patadas", "Saídas e viragens com número variável de pernadas"),
  rule("Trabajo de", "Trabalho de"),
  rule("Distancias de", "Distâncias de"),
  rule("Volume de", "Volume de"),
  rule("Entre", "Entre"),
  rule("preferentemente activo", "preferencialmente ativo"),
  rule("Características", "Características"),
  rule("Volumen/ Ejemplo", "Volume / Exemplo"),
  rule("Volume serie superior distancia de la prova", "Volume da série superior à distância da prova"),
  rule("Volume serie igual a la distancia de la prova", "Volume da série igual à distância da prova"),
  rule("Volume serie inferior, igual o superior a la distancia de la prova", "Volume da série inferior, igual ou superior à distância da prova"),
  rule("MÉTODO", "MÉTODO"),
  rule("METODO", "MÉTODO"),
  rule("Tienes que estar físicamente y mentalmente preparado", "Você precisa estar fisicamente e mentalmente preparado"),
  rule("Para poder realizar este tipo de entrenamiento es necesario", "Para realizar este tipo de treino é necessário"),
  rule("Como consecuencia de este tipo de entrenamiento", "Como consequência deste tipo de treino"),
  rule("Es importante mantener", "É importante manter"),
  rule("Puedes organizarte como quieras", "Você pode organizar-se como preferir"),
  rule("día de descanso", "dia de descanso"),
  rule("recuperarte", "recuperar"),
  rule("prueba de aguas abiertas", "prova de águas abertas"),
  rule("Prueba", "Prova"),
  rule("triatlón", "triatlo"),
  rule("nadador/a", "nadador/a"),
  rule("deportista", "atleta"),
  rule("prueba", "prova"),
  rule("series", "séries"),
  rule("repeticiones", "repetições"),
  rule("rondas", "rondas"),
  rule("opción", "opção"),
  rule("Opción", "Opção"),
  rule("y", "e"),
  rule("Puedes", "Pode"),
  rule("puedes", "pode"),
  rule("con", "com"),
  rule("sin", "sem"),
  rule("Comprueba frequência cardíaca para ver la zona de treino", "Verifique a frequência cardíaca para confirmar a zona de treino"),
  rule("Durante el aquecimento, geralmente deberías experimentar un aumento en la frecuencia cardíaca y la respiração.", "Durante o aquecimento, geralmente deve sentir um aumento da frequência cardíaca e da respiração."),
  rule("Cuando un entrenador te dice que nades una série", "Quando um treinador diz para nadar uma série"),
  rule("te está diciendo que tienes", "está dizendo que tem"),
  rule("para completar cada série", "para completar cada série"),
  rule("Una série", "Uma série"),
  rule("con cada repetición", "com cada repetição"),
  rule("podría tener", "poderia ter"),
  rule("podrían ser", "poderiam ser"),
  rule("La distancia que cubres", "A distância que cobre"),
  rule("Distancia por Brazada", "Distância por braçada"),
  rule("esto dividiendo", "isto dividindo"),
  rule("saliendo", "saindo"),
  rule("La primera vez que haces una série de prova", "A primeira vez que realiza uma série de prova"),
  rule("a lo largo del año", "ao longo do ano"),
  rule("PIERNAS RECUPERACIÓN", "PERNAS RECUPERAÇÃO"),
  rule("SIN NEOPRENO", "SEM NEOPRENE"),
  rule("fuertes", "fortes"),
  rule("Podemos hacer este bloque com neopreno", "Este bloco pode ser feito com fato de neoprene"),
  rule("a pés de un compañero com más nível", "na esteira de um colega de nível superior"),
  rule("Si te cuesta una série tan larga puedes hacer", "Se uma série tão longa for difícil, pode fazer"),
  rule("Toma frequência cardíaca al finalizar esta série larga", "Meça a frequência cardíaca ao finalizar esta série longa"),
  rule("Intenta en esta última sessão ir más rápido en", "Tente nesta última sessão ir mais rápido em"),
  rule("con la técnica correta", "com a técnica correta"),
  rule("buen patrón de respiração", "um bom padrão de respiração"),
  rule("umbral aeróbico", "limiar aeróbico"),
  rule("por debajo de tu máxima", "abaixo do seu máximo"),
  rule("Importante realizar un buen aquecimento previo de gomas y movilidad articular", "É importante realizar um bom aquecimento prévio com elásticos e mobilidade articular"),
  rule("Salidas com distintas señales acústicas", "Saídas com diferentes sinais acústicos"),
  rule("Salidas com distintas posiciones de salida", "Saídas a partir de diferentes posições"),
  rule("Salidas desde", "Saídas desde"),
  rule("Salidas", "Saídas"),
  rule("salidas", "saídas"),
  rule("distintas", "diferentes"),
  rule("señales", "sinais"),
  rule("acústicas", "acústicos"),
  rule("Volumen serie superior distancia de la prova", "Volume da série superior à distância da prova"),
  rule("Volumen serie igual a la distancia de la prova", "Volume da série igual à distância da prova"),
  rule("Volumen serie inferior, igual o superior a la distancia de la prova", "Volume da série inferior, igual ou superior à distância da prova"),
  rule("Volume série superior distancia de la prova", "Volume da série superior à distância da prova"),
  rule("Volume série igual a la distancia de la prova", "Volume da série igual à distância da prova"),
  rule("Volume série inferior, igual o superior a la distancia de la prova", "Volume da série inferior, igual ou superior à distância da prova"),
  rule("Volumen depende", "O volume depende"),
  rule("Volume depende", "O volume depende"),
  rule("máximo", "máximo"),
  rule("mínimas", "mínimas"),
  rule("buena", "boa"),
  rule("correcta", "correta"),
  rule("cuerpo", "corpo"),
  rule("cabeza", "cabeça"),
  rule("brazos", "braços"),
  rule("pies", "pés"),
  rule("patada", "pernada")
];

function translateText(text: string, locale: Locale) {
  if (locale === "es" || !text) {
    return text;
  }

  const rules = locale === "pt" ? portugueseRules : englishRules;
  return rules.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text);
}

function localizeDocument(document: ImportedDocument, locale: Locale): ImportedDocument {
  if (locale === "es") {
    return document;
  }

  return {
    ...document,
    title: translateText(document.title, locale),
    summary: translateText(document.summary, locale),
    total: document.total ? translateText(document.total, locale) : document.total,
    categoryPath: document.categoryPath.map((part) => translateText(part, locale)),
    blocks: document.blocks.map((block) => {
      if (block.type === "table") {
        return {
          ...block,
          rows: block.rows.map((row) =>
            row.map((cell) => {
              const text = translateText(cell.text, locale);

              return {
                ...cell,
                text,
                runs: [{ text }]
              };
            })
          )
        };
      }

      const text = translateText(block.text, locale);

      return {
        ...block,
        text,
        runs: [{ text }]
      };
    })
  };
}

function localizeSection(section: ImportedSection, locale: Locale): ImportedSection {
  if (locale === "es") {
    return section;
  }

  return {
    ...section,
    title: translateText(section.title, locale),
    description:
      locale === "pt"
        ? "Sessões e recursos importados dos documentos de treino."
        : "Sessions and resources imported from the training documents.",
    documents: section.documents.map((document) => localizeDocument(document, locale)),
    groups: section.groups.map((group) => ({
      ...group,
      title: translateText(group.title, locale),
      documents: group.documents.map((document) => localizeDocument(document, locale))
    }))
  };
}

function localizeChallenge(challenge: ImportedChallenge, locale: Locale): ImportedChallenge {
  if (locale === "es") {
    return challenge;
  }

  return {
    ...challenge,
    title: translateText(challenge.title, locale),
    level: challenge.level ? translateText(challenge.level, locale) : challenge.level,
    intro: challenge.intro ? localizeDocument(challenge.intro, locale) : challenge.intro,
    sessions: challenge.sessions.map((document) => localizeDocument(document, locale))
  };
}

function normalizeImportedText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isImportedSessionHeading(block: ContentBlock): block is Extract<ContentBlock, { type: "paragraph" }> {
  return block.type === "paragraph" && /^sesion\s+\d+/.test(normalizeImportedText(block.text));
}

function summarizeImportedBlocks(blocks: ContentBlock[]) {
  const paragraph = blocks.find((block) => block.type === "paragraph" && block.text.trim());
  const text = paragraph?.type === "paragraph" ? paragraph.text.trim() : "";
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function splitImportedDocumentSessions(document: ImportedDocument) {
  const sessions: ImportedDocument[] = [];
  let currentTitle = "";
  let currentBlocks: ContentBlock[] = [];

  function pushCurrentSession() {
    if (!currentTitle) {
      return;
    }

    const totalBlock = currentBlocks.find(
      (block) => block.type === "paragraph" && normalizeImportedText(block.text).startsWith("volumen total")
    );

    sessions.push({
      ...document,
      id: `${document.id}-portal-session-${sessions.length + 1}`,
      title: currentTitle,
      summary: summarizeImportedBlocks(currentBlocks),
      total: totalBlock?.type === "paragraph" ? totalBlock.text : document.total,
      blocks: currentBlocks
    });
  }

  document.blocks.forEach((block) => {
    if (isImportedSessionHeading(block)) {
      pushCurrentSession();
      currentTitle = block.text.trim();
      currentBlocks = [];
      return;
    }

    if (currentTitle) {
      currentBlocks.push(block);
    }
  });

  pushCurrentSession();

  return sessions;
}

export function getNatacionSectionByHref(href: string, locale: Locale = "es") {
  const normalizedHref = hrefAliases[href] || href;
  const section = natacionSections.find((item) => item.href === normalizedHref);
  return section ? localizeSection(section, locale) : undefined;
}

export function getPortalTrainingDocumentBySourceKey(sourceKey: string | null | undefined, locale: Locale = "es") {
  const triathlonMatch = sourceKey?.match(/^preparacion-triatlon-olimpico.*session-(\d+)$/);

  if (triathlonMatch) {
    const section = natacionSections.find((item) => item.href === "/natacion/aguas-abiertas-y-triatlon");
    const document = section?.groups
      .find((group) => group.id === "preparacion-triatlon-olimpico")
      ?.documents[0];

    if (!document) {
      return undefined;
    }

    const session = splitImportedDocumentSessions(document)[Number(triathlonMatch[1]) - 1];
    return session ? localizeDocument(session, locale) : undefined;
  }

  // El source_key de la fila en Supabase es el id del documento importado.
  // Se resuelve por id en las secciones de Natación (Entrenamiento AEL/AEM, etc.)
  // y en los desafíos (intro + sesiones de cada reto).
  if (sourceKey) {
    const fromSections = natacionSections
      .flatMap((section) => [...section.documents, ...section.groups.flatMap((group) => group.documents)])
      .find((document) => document.id === sourceKey);

    if (fromSections) {
      return localizeDocument(fromSections, locale);
    }

    for (const challenge of importedChallenges) {
      if (challenge.intro?.id === sourceKey) {
        return localizeDocument(challenge.intro, locale);
      }

      const session = challenge.sessions.find((item) => item.id === sourceKey);
      if (session) {
        return localizeDocument(session, locale);
      }
    }
  }

  return undefined;
}

export function getChallengeByHref(href: string, locale: Locale = "es") {
  const challenge = [...importedChallenges, ...extraChallengePages].find((item) => item.href === href);
  return challenge ? localizeChallenge(challenge, locale) : undefined;
}
