/**
 * Daily Stories — an editorial blog of educational stories inspired by everyday
 * situations. These are NOT documented patient cases: no real names, results,
 * testimonials, guarantees or fear-based framing. Each story opens on an
 * everyday human moment, turns on a calm realization, and closes on a gentle,
 * relevant takeaway. Imagery references the centralized clinic media.
 */
import type { ClinicPhotoId, LocalizedText } from "@/data/clinicMedia";

export type StoryBlock = { kind: "p" | "sub" | "takeaway"; text: string };

export interface DailyStory {
  slug: string;
  category: LocalizedText;
  title: LocalizedText;
  excerpt: LocalizedText;
  readingTime: LocalizedText;
  imageId: ClinicPhotoId;
  featured?: boolean;
  body: { ar: StoryBlock[]; en: StoryBlock[] };
}

const READ_2: LocalizedText = { ar: "٢ دقيقة قراءة", en: "2 min read" };
const READ_3: LocalizedText = { ar: "٣ دقائق قراءة", en: "3 min read" };

export const DAILY_STORIES: DailyStory[] = [
  {
    slug: "mother-child-fever",
    featured: true,
    category: { ar: "رعاية الأطفال", en: "Children's care" },
    title: { ar: "الأم والطفل المحموم", en: "A Mother and a Feverish Child" },
    excerpt: {
      ar: "في منتصف الليل ارتفعت حرارته فجأة، وكل ما أرادته الأم صوتٌ يطمئنها.",
      en: "His fever spiked at midnight, and all his mother wanted was a voice to reassure her.",
    },
    readingTime: READ_2,
    imageId: "photo_02",
    body: {
      ar: [
        { kind: "p", text: "جلست تراقب صدره الصغير يعلو ويهبط، تضع يدها على جبينه الساخن وتتمنى لو يهدأ. لم تكن تبحث عن معجزة، بل عن خطوة واضحة تفعلها الآن." },
        { kind: "sub", text: "لحظة الهدوء" },
        { kind: "p", text: "بدل أن تستسلم للقلق، تذكّرت أن الحمّى وحدها ليست العدو؛ المهم كيف يبدو الطفل بين ارتفاعٍ وآخر: هل يشرب؟ هل يتبوّل؟ هل ينشط قليلاً حين تهبط الحرارة؟ هذه الملاحظات الصغيرة هي التي توجّه الخطوة التالية." },
        { kind: "takeaway", text: "راقبي النشاط والترطيب أكثر من الرقم على الميزان الحراري. قدّمي السوائل بانتظام، واطلبي التقييم الطبي إذا استمرت الحرارة، أو ظهر خمولٌ شديد أو صعوبة في التنفّس." },
        { kind: "p", text: "الاطمئنان لا يعني تجاهل الأعراض، بل معرفة متى تنتظرين بهدوء ومتى تطلبين المساعدة. وهذه المعرفة وحدها تحوّل ليلة القلق إلى ليلة رعاية." },
      ],
      en: [
        { kind: "p", text: "She watched his little chest rise and fall, her hand on his warm forehead, wishing for calm. She was not looking for a miracle, only a clear step she could take right now." },
        { kind: "sub", text: "The calm moment" },
        { kind: "p", text: "Instead of surrendering to worry, she remembered that a fever alone is not the enemy; what matters is how the child looks between the peaks — is he drinking, passing urine, becoming a little more active when the temperature drops? These small observations guide the next step." },
        { kind: "takeaway", text: "Watch activity and hydration more than the number on the thermometer. Offer fluids regularly, and seek a medical review if the fever persists or if severe lethargy or breathing difficulty appears." },
        { kind: "p", text: "Reassurance does not mean ignoring symptoms; it means knowing when to wait calmly and when to ask for help. That knowledge alone turns a night of worry into a night of care." },
      ],
    },
  },
  {
    slug: "employee-blood-pressure",
    category: { ar: "الأمراض المزمنة", en: "Chronic care" },
    title: { ar: "موظف يؤجل قياس ضغطه", en: "An Employee Postponing His Blood Pressure" },
    excerpt: {
      ar: "صداعٌ خفيف هنا، تعبٌ هناك، و«سأتابع لاحقاً». حتى جاء يومٌ طلب فيه جسده أن يتوقف قليلاً.",
      en: "A mild headache here, fatigue there, and “I'll follow up later.” Until his body asked him to pause.",
    },
    readingTime: READ_2,
    imageId: "photo_01",
    body: {
      ar: [
        { kind: "p", text: "كان يمرّ بجانب جهاز القياس في الصيدلية كل يوم تقريباً، ويقول لنفسه: «الأسبوع القادم». الانشغال حجّةٌ مريحة، لكنها لا تلغي ما يحدث بهدوء داخل الجسم." },
        { kind: "sub", text: "نقطة التحوّل" },
        { kind: "p", text: "في يومٍ عاديّ، شعر أن التعب أثقل من المعتاد، فقرّر أخيراً أن يقيس. لم تكن الأرقام نهاية العالم، لكنها كانت بداية محادثة مؤجّلة مع صحته. المتابعة المبكرة كانت أبسط بكثير مما تخيّل." },
        { kind: "takeaway", text: "قياس الضغط بانتظام في وقتٍ هادئ بعد الراحة يساعد على اكتشاف التغيّرات مبكراً. المتابعة المنتظمة مع الطبيب تجعل الخطة أوضح والقرارات أسهل." },
        { kind: "p", text: "لم يتغيّر كل شيء بين يومٍ وليلة، لكن تغيّرت علاقته بالرقم: صار أداةً تطمئنه بدل أن يكون تهديداً يتجنّبه." },
      ],
      en: [
        { kind: "p", text: "He passed the pharmacy's blood-pressure machine almost every day, telling himself, “Next week.” Being busy is a comfortable excuse, but it does not cancel what happens quietly inside the body." },
        { kind: "sub", text: "The turning point" },
        { kind: "p", text: "On an ordinary day the tiredness felt heavier than usual, so he finally decided to measure. The numbers were not the end of the world, but they were the start of a postponed conversation with his health. Early follow-up was far simpler than he had imagined." },
        { kind: "takeaway", text: "Measuring blood pressure regularly, while calm and rested, helps catch changes early. Regular follow-up with a doctor makes the plan clearer and the decisions easier." },
        { kind: "p", text: "Not everything changed overnight, but his relationship with the number did: it became a tool that reassured him rather than a threat he avoided." },
      ],
    },
  },
  {
    slug: "diabetes-followup",
    category: { ar: "الأمراض المزمنة", en: "Chronic care" },
    title: { ar: "أرقام السكري الحائرة", en: "The Puzzling Sugar Numbers" },
    excerpt: {
      ar: "أرقامٌ متفاوتة كل أسبوع وحيرةٌ كبيرة. أرادت أن تفهم جسدها لا أن تخاف منه.",
      en: "Different numbers every week and a lot of confusion. She wanted to understand her body, not fear it.",
    },
    readingTime: READ_3,
    imageId: "photo_05",
    body: {
      ar: [
        { kind: "p", text: "كانت تسجّل قراءاتها على ورقة صغيرة، لكن الأرقام بدت وكأنها تتحدّث بلغة لا تفهمها: مرتفعة صباحاً، منخفضة مساءً، بلا نمطٍ واضح." },
        { kind: "sub", text: "من الخوف إلى الفهم" },
        { kind: "p", text: "حين ربطت كل قراءة بوقتها وبما تناولته قبلها، بدأت الصورة تتضح. لم تكن الأرقام عشوائية؛ كانت تحكي قصة يومها. ومع خطة متابعة منتظمة، تحوّلت من مصدر قلق إلى بوصلة تهديها." },
        { kind: "takeaway", text: "تسجيل القراءة مع وقتها وعلاقتها بالطعام والنشاط يساعد الطبيب على قراءة النمط ووضع خطة أوضح. المتابعة المنتظمة أهم من أي قراءة منفردة." },
        { kind: "p", text: "لم تعد تنتظر رقماً «مثالياً»، بل صارت تنتظر أن تفهم اتجاه الأرقام. وهذا الفهم أعطاها راحةً كانت تبحث عنها منذ زمن." },
      ],
      en: [
        { kind: "p", text: "She logged her readings on a small sheet of paper, but the numbers seemed to speak a language she could not read: high in the morning, low in the evening, with no clear pattern." },
        { kind: "sub", text: "From fear to understanding" },
        { kind: "p", text: "When she tied each reading to its time and to what she had eaten before it, the picture began to clear. The numbers were not random; they told the story of her day. With a regular follow-up plan, they turned from a source of worry into a compass." },
        { kind: "takeaway", text: "Logging a reading with its time and its link to food and activity helps the doctor read the pattern and set a clearer plan. Regular follow-up matters more than any single reading." },
        { kind: "p", text: "She stopped waiting for a “perfect” number and started watching the direction of the numbers instead. That understanding gave her a calm she had been seeking for a long time." },
      ],
    },
  },
  {
    slug: "senior-home-care",
    category: { ar: "الرعاية المنزلية", en: "Home care" },
    title: { ar: "والدٌ يفضّل كرسيه قرب النافذة", en: "A Father Who Prefers His Chair by the Window" },
    excerpt: {
      ar: "صار الخروج للمركز رحلةً متعبة عليه، والعائلة أرادت أن يبقى قريباً في مكانه المألوف.",
      en: "Going to the center became an exhausting trip, and his family wanted him to stay close, in his familiar place.",
    },
    readingTime: READ_2,
    imageId: "photo_06",
    body: {
      ar: [
        { kind: "p", text: "لكل بيتٍ زاوية يحبّها أهله. بالنسبة له كانت زاويته كرسيّاً قرب النافذة، يرى منه الشارع ويتابع تفاصيل النهار. لكن رحلة الخروج للمتابعة صارت تُنهكه قبل أن تبدأ." },
        { kind: "sub", text: "الرعاية تأتي إليه" },
        { kind: "p", text: "حين أصبحت الرعاية تصل إلى بيته، تغيّر شيءٌ لطيف: لم يعد يشعر أنه «حالة تُنقل»، بل إنساناً يُعتنى به في مكانه. وهذا الإحساس البسيط أراح قلوب من حوله بقدر ما أراحه." },
        { kind: "takeaway", text: "الزيارة المنزلية مناسبة لكبار السن والحالات التي يصعب فيها الحضور للمركز. تجهيز قائمة الأدوية الحالية ومكانٍ مضيءٍ ومريح يجعل الزيارة أكثر فائدة." },
        { kind: "p", text: "أحياناً لا تكون الرعاية الأفضل هي الأبعد، بل الأقرب إلى حيث يشعر الإنسان بالأمان." },
      ],
      en: [
        { kind: "p", text: "Every home has a corner its people love. His was a chair by the window, where he watched the street and followed the details of the day. But the trip out for follow-up began to exhaust him before it even started." },
        { kind: "sub", text: "Care that comes to him" },
        { kind: "p", text: "When care reached his home, something gentle changed: he no longer felt like “a case being moved,” but a person being cared for in his own place. That simple feeling eased the hearts around him as much as it eased his own." },
        { kind: "takeaway", text: "A home visit suits seniors and cases where coming to the center is difficult. Preparing a list of current medicines and a bright, comfortable spot makes the visit more useful." },
        { kind: "p", text: "Sometimes the best care is not the farthest away, but the closest to where a person feels safe." },
      ],
    },
  },
  {
    slug: "fatigue-vitamins",
    category: { ar: "التغذية والفحوصات", en: "Nutrition & tests" },
    title: { ar: "تعبٌ لا يفسّره النوم", en: "A Tiredness Sleep Doesn't Explain" },
    excerpt: {
      ar: "تستيقظ متعبة كأنها لم تنم، وظنّت أنه ضغط الحياة فقط.",
      en: "She woke up tired as if she hadn't slept, and thought it was just life's pressure.",
    },
    readingTime: READ_2,
    imageId: "photo_07",
    body: {
      ar: [
        { kind: "p", text: "التعب المزمن يتنكّر أحياناً في ثوب الروتين: «الجميع متعبون»، «هكذا الحياة». فنتعوّد عليه بدل أن نسأل عنه." },
        { kind: "sub", text: "سؤالٌ بسيط" },
        { kind: "p", text: "حين قرّرت أن تسأل بدل أن تفترض، كشف فحصٌ بسيط جزءاً من القصة. لم يكن الحل معقّداً، لكنه بدأ بخطوةٍ واحدة: أن تأخذ تعبها على محمل الجدّ." },
        { kind: "takeaway", text: "التعب المستمر قد تكون خلفه أسباب يمكن فحصها، مثل نقص الحديد أو بعض الفيتامينات. الفحص أولاً يوجّه الخطة المناسبة بدل التخمين." },
        { kind: "p", text: "عادت طاقتها خطوةً بخطوة، لا لأن شيئاً سحرياً حدث، بل لأنها أصغت أخيراً لما كان جسدها يهمس به منذ مدة." },
      ],
      en: [
        { kind: "p", text: "Chronic tiredness sometimes disguises itself as routine: “everyone is tired,” “that's life.” So we get used to it instead of asking about it." },
        { kind: "sub", text: "A simple question" },
        { kind: "p", text: "When she decided to ask rather than assume, a simple test revealed part of the story. The answer was not complicated, but it began with one step: taking her tiredness seriously." },
        { kind: "takeaway", text: "Persistent tiredness may have causes that can be checked, such as iron or certain vitamin deficiencies. Testing first guides the right plan instead of guessing." },
        { kind: "p", text: "Her energy returned step by step — not because something magical happened, but because she finally listened to what her body had been quietly saying." },
      ],
    },
  },
  {
    slug: "lab-anxiety",
    category: { ar: "الفحوصات المخبرية", en: "Lab tests" },
    title: { ar: "الخوف من المجهول لا من النتيجة", en: "Fearing the Unknown, Not the Result" },
    excerpt: {
      ar: "تأجّل الفحص شهوراً، لا خوفاً من النتيجة بقدر الخوف من المجهول.",
      en: "The test was delayed for months — not out of fear of the result, but of the unknown.",
    },
    readingTime: READ_2,
    imageId: "photo_04",
    body: {
      ar: [
        { kind: "p", text: "أحياناً يكون أصعب جزءٍ في الفحص هو قرار الذهاب إليه. تتراكم الأسئلة في الرأس: ماذا لو؟ وكيف؟ ومتى؟ حتى يصبح التأجيل أسهل من المواجهة." },
        { kind: "sub", text: "خطوةٌ تصبح بسيطة" },
        { kind: "p", text: "كلمةٌ طيبة وشرحٌ هادئ لما سيحدث خطوةً بخطوة جعلا الأمر أقل غموضاً. حين يعرف الإنسان ما ينتظره، يتقلّص الخوف إلى حجمه الحقيقي." },
        { kind: "takeaway", text: "معرفة تفاصيل الفحص مسبقاً وطرح الأسئلة على الفريق يقلّل القلق. الفحص خطوة معلومات تساعدك أنت وطبيبك على اتخاذ قرار أوضح." },
        { kind: "p", text: "لم تكن الراحة في النتيجة وحدها، بل في أنها أخيراً لم تعد تحمل المجهول معها أينما ذهبت." },
      ],
      en: [
        { kind: "p", text: "Sometimes the hardest part of a test is the decision to go for it. Questions pile up in the mind: what if? and how? and when? until postponing feels easier than facing it." },
        { kind: "sub", text: "A step that becomes simple" },
        { kind: "p", text: "A kind word and a calm explanation of what would happen, step by step, made it less mysterious. When a person knows what to expect, fear shrinks back to its real size." },
        { kind: "takeaway", text: "Knowing the details of a test in advance and asking the team questions reduces anxiety. A test is a step of information that helps you and your doctor make a clearer decision." },
        { kind: "p", text: "The relief was not only in the result, but in no longer carrying the unknown with her wherever she went." },
      ],
    },
  },
  {
    slug: "sudden-night-illness",
    category: { ar: "رعاية عاجلة", en: "Urgent care" },
    title: { ar: "حين تكبر الأسئلة ليلاً", en: "When Questions Grow at Night" },
    excerpt: {
      ar: "في الليل تكبر الأسئلة ويقلّ من تسأله؛ أن تجد من يردّ ويوجّه يصنع الفرق.",
      en: "At night the questions grow and the people to ask shrink; finding someone to answer and guide makes the difference.",
    },
    readingTime: READ_2,
    imageId: "photo_03",
    body: {
      ar: [
        { kind: "p", text: "الأعراض التي تبدو محتمَلة نهاراً تبدو أثقل حين يهدأ البيت وتغيب المشورة. ليس لأن الحالة تغيّرت، بل لأن القلق يتضخّم في الصمت." },
        { kind: "sub", text: "صوتٌ يوجّه الخطوة" },
        { kind: "p", text: "أن تجد جهةً تستقبل حالتك وتوجّهك إلى الخطوة الصحيحة — انتظارٌ هادئ، أو حضورٌ للتقييم — هو الفرق بين ليلة قلقٍ وليلة أمان." },
        { kind: "takeaway", text: "توفّر رعاية داخل العيادة على مدار الساعة يعني وجود من يستمع ويقيّم ويوجّه عند الحاجة. عند الأعراض الشديدة أو المقلقة، لا تنتظر واطلب التقييم مباشرة." },
        { kind: "p", text: "لم يكن المطلوب معجزة، بل حضوراً يطمئن ويقول: أنت لست وحدك في هذه الساعة." },
      ],
      en: [
        { kind: "p", text: "Symptoms that seem bearable by day feel heavier when the house is quiet and advice is out of reach — not because the situation changed, but because worry grows in silence." },
        { kind: "sub", text: "A voice that guides the step" },
        { kind: "p", text: "Finding somewhere that receives your case and points you to the right step — a calm wait, or coming in for assessment — is the difference between a night of worry and a night of safety." },
        { kind: "takeaway", text: "Round-the-clock in-clinic care means there is someone to listen, assess and guide when needed. With severe or worrying symptoms, don't wait — ask for assessment right away." },
        { kind: "p", text: "What was needed was not a miracle, but a reassuring presence that says: you are not alone at this hour." },
      ],
    },
  },
  {
    slug: "family-consultation",
    category: { ar: "الاستشارات", en: "Consultations" },
    title: { ar: "سؤالٌ صغير يفتح باب الطمأنينة", en: "A Small Question Opens a Door of Reassurance" },
    excerpt: {
      ar: "ليست كل حالة تحتاج موعداً؛ أحياناً تكفي استشارةٌ تهدّئ وتوضّح.",
      en: "Not every case needs an appointment; sometimes a consult that calms and clarifies is enough.",
    },
    readingTime: READ_2,
    imageId: "photo_02",
    body: {
      ar: [
        { kind: "p", text: "سؤالٌ بسيط عن دواءٍ أو عَرَضٍ عابر ظلّ معلّقاً في البيت بلا إجابة، يكبر مع كل «يا ترى؟» تتردد بين أفراد العائلة." },
        { kind: "sub", text: "توضيحٌ في الوقت المناسب" },
        { kind: "p", text: "استشارة قصيرة توضّح متى يكفي الانتظار والملاحظة، ومتى يستحسن الحضور للتقييم. المعلومة الصحيحة في وقتها تريح العائلة كلها." },
        { kind: "takeaway", text: "الاستشارة الطبية العامة عبر الهاتف أو واتساب تساعد على توجيهك للخطوة المناسبة، لكنها لا تُغني عن الفحص السريري حين تستدعي الحالة ذلك." },
        { kind: "p", text: "أحياناً يكون الفرق بين قلقٍ طويل وراحةٍ سريعة مجرّد سؤالٍ طُرح في مكانه الصحيح." },
      ],
      en: [
        { kind: "p", text: "A simple question about a medicine or a passing symptom stayed unanswered at home, growing with every “I wonder?” passed between family members." },
        { kind: "sub", text: "Clarity at the right time" },
        { kind: "p", text: "A short consultation clarifies when watchful waiting is enough and when it's better to come in for assessment. The right information at the right time eases the whole family." },
        { kind: "takeaway", text: "A general medical consultation by phone or WhatsApp helps point you to the right step, but it does not replace a clinical examination when the situation calls for one." },
        { kind: "p", text: "Sometimes the difference between long worry and quick relief is simply a question asked in the right place." },
      ],
    },
  },
];

export function getStory(slug: string | null | undefined): DailyStory | undefined {
  if (!slug) return undefined;
  return DAILY_STORIES.find((s) => s.slug === slug);
}
